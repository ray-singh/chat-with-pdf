import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";


/**
 * POST endpoint handler for retrieving chat messages
 * Fetches messages from the database based on the provided chatId
 * @param req Incoming HTTP request containing chatId
 * @returns JSON response containing the chat messages
 */
export const POST = async (req: Request) => {
  // Parse the request body to get the chatId
  const { chatId } = await req.json();

  // Fetch messages from the database for the given chatId
  const _messages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId));

  // Return the fetched messages as a JSON response
  return NextResponse.json(_messages);
};