import { cn } from "@/lib/utils";
import { Message } from "ai/react"; 
import { Loader2 } from "lucide-react"; 
import React from "react"; 

type Props = {
  isLoading: boolean; 
  messages: Message[]; 
};

// Functional component to render the message list
const MessageList = ({ messages, isLoading }: Props) => {
  // Display a loading spinner when data is being fetched
  if (isLoading) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Centered loader animation */}
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  // If there are no messages, render an empty fragment
  if (!messages) return <></>;

  return (
    <div className="flex flex-col gap-2 px-4">
      {/* Map through the messages array to display each message */}
      {messages.map((message) => {
        return (
          <div
            key={message.id} // Unique key for each message to optimize React rendering
            className={cn("flex", {
              "justify-end pl-10": message.role === "user", // Align user's messages to the right
              "justify-start pr-10": message.role === "assistant", // Align assistant's messages to the left
            })}
          >
            <div
              className={cn(
                "rounded-lg px-3 text-sm py-1 shadow-md ring-1 ring-gray-900/10", // Base styling for message bubbles
                {
                  "bg-blue-600 text-white": message.role === "user", // User messages have a blue background with white text
                }
              )}
            >
              <p>{message.content}</p> {/* Display the message content */}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList; // Exporting the component for use in other parts of the app
