"use client";
import { uploadToS3 } from "@/lib/s3"; // Function to upload files to S3
import { useMutation } from "@tanstack/react-query"; // React Query's hook for mutation (for async operations like POST requests)
import { Inbox, Loader2 } from "lucide-react"; // Icon components for UI
import React from "react";
import { useDropzone } from "react-dropzone"; // Hook for managing file drop behavior
import axios from "axios"; // Axios for making HTTP requests
import { toast } from "react-hot-toast"; // Toast notifications
import { useRouter } from "next/navigation"; // Next.js router to navigate between pages

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: async ({ file_key, file_name }: { file_key: string; file_name: string }) => {
      const response = await axios.post("/api/create-chat", { file_key, file_name });
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Mutation successful:', data);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        // bigger than 10mb!
        toast.error("File too large");
        return;
      }

      try {
        setUploading(true);
        const data = await uploadToS3(file);
        
        // Log file_name and file_key
        console.log("File key: ", data.file_key);
        console.log("File name: ", data.file_name);
        
        if (!data?.file_key || !data?.file_name) {
          toast.error("Something went wrong");
          return;
        }
      
        mutate({ file_key: data.file_key, file_name: data.file_name}, 
          {
            onSuccess: ({ chat_id }) => {
            toast.success("Chat created!");
            router.push(`/chat/${chat_id}`);
          },
          onError: (err) => {
            toast.error("lol axios doesn't work");
            console.error(err);
          },
        });
      
      } catch (error) {
        console.log("Error during upload or mutation:", error);
      } finally {
        setUploading(false);
      }      
    },
  });

  return (
    <div className="p-2 bg-white rounded-xl">
      {/* Dropzone UI element */}
      <div
        {...getRootProps({
          className: 'border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col',
        })}
      >
        <input {...getInputProps()} /> {/* Input element for dropzone */}
        {uploading ? (
          <>
            {/* Loading state UI */}
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">Spilling Tea to GPT...</p>
          </>
        ) : (
          <>
            {/* Idle state UI */}
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
