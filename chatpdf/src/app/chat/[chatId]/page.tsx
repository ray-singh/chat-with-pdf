import { db } from "@/lib/db/index";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import ChatSideBar from "@/components/ChatSideBar";
import ChatComponent from "@/components/ChatComponent";
import PDFViewer from "@/components/PDFViewer";
import { NextPage } from "next";

type Props = {
  params: {
    chatId: string;
  };
};

const ChatPage: NextPage<Props> = async ({ params }: Props) => {
  const { chatId } = params;
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats) {
    return redirect("/");
  }
  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/");
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));

  return (
    <div className="flex h-screen max-h-screen overflow-hidden">
      <div className="flex w-full h-screen max-h-screen overflow-hidden">
        {/* chat sidebar */}
        <div className="flex-[1] max-w-xs h-screen max-h-screen">
          <ChatSideBar chats={_chats} chatId={parseInt(chatId)} />
        </div>
        {/* pdf viewer */}
        <div className="h-screen max-h-screen p-4 overflow-auto flex-[5]">
          <PDFViewer pdf_url={currentChat?.pdfUrl || ""} />
        </div>
        {/* chat component */}
        <div className="flex-[3] border-l-4 border-l-slate-200 w-full h-screen max-h-screen overflow-auto">
          <ChatComponent chatId={parseInt(chatId)} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
