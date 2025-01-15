'use client'; // Ensure the component is client-side only

import { Button } from "@/components/ui/button";
import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {LogIn} from 'lucide-react'

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth(); // Get auth state

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-indigo-200 via-red-200 to-yellow-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex-col items-center text-center">
          <div className="flex items-center justify-center">
            <h1 className="mr-3 text-5xl font-semibold">Chat with any PDF!</h1>
            <UserButton afterSignOutUrl="/" />
          </div>

          <div className="flex mt-2 justify-center">
            {isSignedIn && <Button>Go to Chats</Button>}
          </div>

          <p className="max-w-xl mt-2 text-lg text-slate-600 text-center">
            Join a community of students, researchers, and professionals to instantly understand research and answer questions with AI
          </p>
          <div className="w-full mt-4">
            {isSignedIn ? (
              <h1>fileupload</h1>
            ) : (
              <Link href="/sign-in">
                <Button>Login to get started!
                <LogIn className="w-4 h-4 ml-2"/>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
