import React from 'react';
import ChatInterface from '../components/ChatInterface';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Memory-Powered Chat</h1>
          <p className="text-gray-600">Conversations are stored and can be retrieved later</p>
        </header>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[calc(100vh-160px)]">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
} 