import { streamText, Message } from "ai";
import { openai } from '@ai-sdk/openai';
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Specify that this route should run on the Edge runtime for better performance
export const runtime = "edge";

/**
 * POST endpoint handler for chat functionality
 * Processes incoming chat messages, retrieves relevant context, and streams AI responses
 * @param req Incoming HTTP request containing messages array and chatId
 * @returns Streaming response containing AI-generated text
 */
export async function POST(req: Request) {
  try {
    // Extract messages and chatId from request body
    const { messages, chatId } = await req.json();

    // Verify chat exists in database
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length !== 1) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }
    const fileKey = _chats[0].fileKey;

    // Get the most recent message from the user
    const lastMessage = messages[messages.length - 1];

    // Store the user's message in the database
    await db.insert(_messages).values({
      chatId,
      content: lastMessage.content,
      role: "user"
    });

    // Get relevant context based on the user's message and associated file
    const context = await getContext(lastMessage.content, fileKey);

    // Configure system prompt with retrieved context
    const systemPrompt = {
      role: "system",
      content: `AI assistant is a powerful, human-like artificial intelligence with traits including expert knowledge, helpfulness, cleverness, and articulateness.
 AI is well-mannered, friendly, kind, and inspiring, eager to provide vivid and thoughtful responses.
 START CONTEXT BLOCK
${context}
 END OF CONTEXT BLOCK
 AI considers the CONTEXT BLOCK for answers. If not found, AI responds: "I'm sorry, but I don't know the answer to that question."
 AI does not invent information outside the provided context.`
    };

    // Initialize streaming response from OpenAI
    const { textStream } = await streamText({
      model: openai("gpt-3.5-turbo"),
      // Include system prompt and only user messages in the conversation
      messages: [systemPrompt, ...messages.filter((msg: Message) => msg.role === "user")]
    });

    // Set up text decoder for processing binary chunks
    const decoder = new TextDecoder();
    let result = ""; // Accumulate complete response

    // Create readable stream to handle AI response
    const stream = new ReadableStream({
      start(controller) {
        const reader = textStream.getReader();
        
        async function pump() {
          while (true) {
            const { value, done } = await reader.read();
            
            if (done) {
              // Store complete AI response in database once stream ends
              await db.insert(_messages).values({
                chatId,
                content: result,
                role: "system"
              });
              controller.close();
              break;
            }

            if (value) {
              // Handle both string and binary chunk formats
              if (typeof value === "string") {
                const chunk = new TextEncoder().encode(value);
                controller.enqueue(chunk);
                result += value;
              } else {
                controller.enqueue(value);
                result += decoder.decode(value);
              }
            }
          }
        }
        pump();
      }
    });

    // Return streaming response
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    // Handle any errors that occur during processing
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}