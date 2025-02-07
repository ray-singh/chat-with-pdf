import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import { downloadFromS3 } from './s3-server';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document, RecursiveCharacterTextSplitter } from "@pinecone-database/doc-splitter";
import { getEmbeddings } from './embeddings';
import md5 from "md5";
import { convertToAscii } from "./utils";

// Initializes and returns a Pinecone client
// This client is used to interact with the Pinecone vector database (e.g., creating indexes, inserting vectors).
export const getPineconeClient = () => {
  if (!process.env.PINECONE_API_KEY) {
    throw new Error("Pinecone API key is missing. Please check your environment variables.");
  }
  return new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, "");

  // Split the document into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000, // Adjust as needed
    chunkOverlap: 200, // Adjust as needed
  });
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}


// Converts a document chunk into a vector embedding and prepares it for upload to Pinecone.
async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: { text: doc.metadata.text, pageNumber: doc.metadata.pageNumber,},
    } as PineconeRecord;
  } catch (error) {
    console.log("Error embedding document:", error);
    throw new Error("Failed to generate embeddings for the document.");
  }
}


// Downloads a PDF from S3, processes it, and uploads its embeddings to Pinecone.
// Uses PDFLoader to load the PDF into memory and extract its pages.
// Uploads the vectors to a Pinecone index under a namespace derived from the file key.
export async function loadS3IntoPinecone(file_key: string) {
  try {
    console.log("Downloading S3 file...");
    const file_name = await downloadFromS3(file_key);
    if (!file_name) {
      throw new Error("Unable to download PDF from S3.");
    }

    console.log("Loading PDF into memory:", file_name);
    const loader = new PDFLoader(file_name);
    const pages = (await loader.load()) as PDFPage[];

    if (!pages.length) {
      throw new Error("No pages found in the PDF.");
    }

    // Prepare and embed documents
    console.log("Preparing and embedding documents...");
    const documents = await Promise.all(pages.map(prepareDocument));
    const vectors = await Promise.all(documents.flat().map(embedDocument));

    // Connect to Pinecone and upload vectors
    console.log("Connecting to Pinecone...");
    const client = getPineconeClient();
    const pineconeIndex = client.index("doxly-db");
    const namespace = pineconeIndex.namespace(convertToAscii(file_key));

    console.log("Uploading vectors to Pinecone...");
    await namespace.upsert(vectors);

    console.log("PDF successfully processed and uploaded to Pinecone.");
    return documents[0];
  } catch (error) {
    console.error("Error loading S3 into Pinecone:", error);
    throw new Error("Failed to process PDF and upload to Pinecone.");
  }
}