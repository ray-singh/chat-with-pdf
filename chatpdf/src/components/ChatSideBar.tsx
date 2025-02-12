"use client"; 
import { DrizzleChat } from "@/lib/db/schema"; 
import Link from "next/link"; 
import React from "react";
import { Button } from "./ui/button"; 
import { MessageCircle, PlusCircle } from "lucide-react"; 
import { cn } from "@/lib/utils"; 
import axios from "axios"; 

// Props type definition for the ChatSideBar component
type Props = {
  chats: DrizzleChat[]; // Array of chat objects
  chatId: number;       // ID of the currently active chat
};

/**
 * ChatSideBar Component
 * 
 * Renders a sidebar containing:
 * - A button to start a new chat
 * - A list of existing chats with visual distinction for the active chat
 * 
 * @param {Props} props - Contains chats array, current chatId, and user subscription status
 * @returns {JSX.Element} - The rendered sidebar component
 */
const ChatSideBar = ({ chats, chatId }: Props) => {
  const [loading, setLoading] = React.useState(false); // State to manage loading status (currently unused)

  return (
    <div className="w-full h-screen max-h-screen overflow-scroll p-4 text-gray-200 bg-gray-900">
      {/* Button to start a new chat */}
      <Link href="/">
        <Button className="w-full border-dashed border-white border">
          <PlusCircle className="mr-2 w-4 h-4" /> {/* Icon for new chat */}
          New Chat
        </Button>
      </Link>

      {/* List of existing chats */}
      <div className="flex h-screen max-h-screen overflow-scroll pb-20 flex-col gap-2 mt-4">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}> {/* Navigates to the selected chat */}
            <div
              className={cn("rounded-lg p-3 text-slate-300 flex items-center", {
                "bg-blue-600 text-white": chat.id === chatId, // Highlight if the chat is active
                "hover:text-white": chat.id !== chatId,       // Hover effect for inactive chats
              })}
            >
              <MessageCircle className="mr-2" /> {/* Icon representing a chat message */}
              <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis">
                {chat.pdfName} {/* Displays the name of the chat (likely related to a PDF file) */}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChatSideBar;
