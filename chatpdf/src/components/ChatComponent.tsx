"use client"; 
import React from "react";
import { Input } from "./ui/input"; 
import { useChat } from "ai/react";
import { Button } from "./ui/button"; 
import { Send } from "lucide-react"; 
import MessageList from "./MessageList"; 
import { useQuery } from "@tanstack/react-query"; 
import axios from "axios"; 
import { Message } from "ai"; 

type Props = { chatId: number };

const ChatComponent = ({ chatId }: Props) => {
  // Fetch chat messages using React Query
  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId], // Unique key for caching based on chatId
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId, // Send chatId to the API to fetch messages related to this specific chat
      });
      return response.data; // Return the fetched messages
    },
  });

  // Chat functionality using the useChat hook
  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat", // API endpoint for sending chat messages
    body: {
      chatId, // Include chatId in the request body
    },
    initialMessages: data || [], // Initialize chat with previously fetched messages
  });

  // Auto-scroll to the bottom of the message container when new messages arrive
  React.useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight, // Scroll to the latest message
        behavior: "smooth", // Smooth scrolling effect
      });
    }
  }, [messages]); // Runs whenever new messages are added

  return (
    <div
      className="relative max-h-screen overflow-scroll"
      id="message-container"
    >
      {/* Header section */}
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
        <h3 className="text-xl font-bold">Chat</h3>
      </div>

      {/* Message list section */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* Input form for sending new messages */}
      <form
        onSubmit={handleSubmit} // Trigger handleSubmit on form submission
        className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white"
      >
        <div className="flex">
          <Input
            value={input} // Controlled input value
            onChange={handleInputChange} // Handle input changes
            placeholder="Ask any question..." // Placeholder text
            className="w-full" // Make the input take full width
          />
          <Button  type="submit" className="bg-blue-600 ml-2"> {/* Send button */}
            <Send className="h-4 w-4" /> {/* Send icon inside the button */}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent; 
