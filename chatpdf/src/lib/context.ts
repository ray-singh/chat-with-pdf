import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

/**
 * Retrieves matching embeddings from Pinecone database
 * @param embeddings - Array of embedding numbers to match against
 * @param fileKey - Unique identifier for the file
 * @returns Array of matching vectors with their metadata
 */
export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  try {
    // Initialize Pinecone client
    const client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    // Get index and create namespace from fileKey
    const pineconeIndex = await client.index("doxly-db");
    const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

    // Query the namespace for similar vectors
    const queryResult = await namespace.query({
      topK: 5, // Get top 5 matches
      vector: embeddings,
      includeMetadata: true,
    });

    return queryResult.matches || [];
  } catch (error) {
    console.log("error querying embeddings", error);
    throw error;
  }
}

/**
 * Gets relevant context from the document based on the query
 * @param query - User's question or input
 * @param fileKey - Unique identifier for the file
 * @returns Concatenated text from relevant document sections
 */
export async function getContext(query: string, fileKey: string) {
  // Generate embeddings for the query
  const queryEmbeddings = await getEmbeddings(query);
  
  // Get matching vectors from database
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

  // Filter matches with score higher than 0.7
  const qualifyingDocs = matches.filter(
    (match) => match.score && match.score > 0.7
  );

  // Define metadata type for type safety
  type Metadata = {
    text: string;
    pageNumber: number;
  };

  // Extract and join text from matching documents
  let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);
  // Limit context to 3000 characters
  return docs.join("\n").substring(0, 3000);
}