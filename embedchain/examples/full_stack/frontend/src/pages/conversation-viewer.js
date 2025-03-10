import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ConversationViewer() {
  const [memory, setMemory] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Get conversation from session storage
    const storedMemory = sessionStorage.getItem('viewMemory');
    if (storedMemory) {
      setMemory(JSON.parse(storedMemory));
    } else {
      router.push('/conversations');
    }
  }, [router]);

  if (!memory) {
    return <div className="p-4 text-center">Loading conversation...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-4">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Conversation</h1>
            <p className="text-gray-600">
              {new Date(memory.created_at).toLocaleString()}
            </p>
          </div>
          <Link href="/conversations">
            <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg">
              Back to Conversations
            </button>
          </Link>
        </header>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            {memory.data && Array.isArray(memory.data) ? (
              memory.data.map((message, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg max-w-3xl ${
                    message.role === 'user' 
                      ? 'bg-blue-100 ml-auto' 
                      : 'bg-gray-100'
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-700">
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </p>
                  <p className="mt-1 text-gray-800 whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">
                No messages found in this conversation.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 