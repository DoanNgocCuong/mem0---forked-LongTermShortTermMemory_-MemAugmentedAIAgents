import React, { useState, useEffect } from 'react';
import ConversationHistory from '../components/ConversationHistory';

export default function ConversationsPage() {
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Get user ID from local storage or generate a new one
    const storedUserId = localStorage.getItem('chatUserId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = 'user-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('chatUserId', newUserId);
      setUserId(newUserId);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Conversation History</h1>
          <p className="text-gray-600">View and manage your past conversations</p>
        </header>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          {userId ? (
            <ConversationHistory userId={userId} />
          ) : (
            <div className="text-center p-4">Loading...</div>
          )}
        </div>
      </div>
    </div>
  );
} 