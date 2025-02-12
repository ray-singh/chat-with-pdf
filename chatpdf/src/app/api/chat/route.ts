import OpenAI from 'openai';
import { Message } from 'ai';
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST endpoint handler for chat functionality
 * Processes incoming chat messages, retrieves relevant context, and generates AI responses
 * @param req Incoming HTTP request containing messages array and chatId
 * @returns JSON response containing AI-generated text
 */
export async function POST(req: Request) {
  try {
    // Extract messages and chatId from request body
    const { messages, chatId } = await req.json();

    // Verify chat exists in database
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length != 1) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }
    const fileKey = _chats[0].fileKey;

    // Get the most recent message from the user
    const lastMessage = messages[messages.length - 1];

    // Get relevant context based on the user's message and associated file
    const context = await getContext(lastMessage.content, fileKey);

    // Configure system prompt with retrieved context
    const prompt = {
      role: "system",
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Vercel.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      `,
    };

    // Save user message to db
    await db.insert(_messages).values({
      chatId,
      content: lastMessage.content,
      role: "user",
    });

    // Get completion from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        prompt as OpenAI.Chat.ChatCompletionMessage,
        ...messages.filter((message: Message) => message.role === "user"),
      ],
    });

    const aiResponse = response.choices[0].message.content;

    // Add null check before database insertion
    if (aiResponse && chatId) {
      // Save AI response to db
      await db.insert(_messages).values({
        chatId: chatId, // Ensure chatId is a number
        content: aiResponse,
        role: "system" as const, // Use const assertion for role
      });
    }

    // Trigger page reload after response is inserted into the database
    return NextResponse.json({ response: aiResponse, reload: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}