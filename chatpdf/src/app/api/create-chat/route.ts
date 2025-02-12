import { db } from "@/lib/db/index";
import { chats } from "@/lib/db/schema";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { getS3Url } from "@/lib/s3";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * POST endpoint handler for creating a new chat
 * Loads a file from S3 into Pinecone, stores chat metadata in the database, and returns the chat ID
 * @param req Incoming HTTP request containing file_key and file_name
 * @returns JSON response containing the new chat ID
 */
export async function POST(req: Request) {
  console.log("hello!")
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  
  try {
    // Parse the request body to get file_key and file_name
    const body = await req.json();
    const { file_key, file_name } = body;
    console.log(file_key, file_name);

    // Load the file from S3 into Pinecone
    await loadS3IntoPinecone(file_key);

    // Insert chat metadata into the database and get the inserted chat ID
    const chat_id = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: getS3Url(file_key),
        userId,
      })
      .returning({
        insertedId: chats.id,
      });

    // Return the new chat ID as a JSON response
    return NextResponse.json(
      {
        chat_id: chat_id[0].insertedId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}