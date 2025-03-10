import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const ConversationHistory = ({ userId }) => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/memory/user/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch memories');
        }
        
        const data = await response.json();
        
        // Filter for chat history type memories and sort by date
        const chatMemories = data
          .filter(memory => memory.metadata && memory.metadata.type === 'chat_history')
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        setMemories(chatMemories);
      } catch (error) {
        console.error('Error fetching memories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchMemories();
    }
  }, [userId]);

  const getConversationPreview = (memory) => {
    if (!memory.data || !Array.isArray(memory.data) || memory.data.length === 0) {
      return 'Empty conversation';
    }

    // Get the first few messages as preview
    return memory.data
      .slice(0, 2)
      .map(msg => `${msg.role}: ${msg.content.substring(0, 40)}${msg.content.length > 40 ? '...' : ''}`)
      .join(' | ');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const deleteMemory = async (id) => {
    try {
      const response = await fetch(`/api/memory/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete memory');
      }
      
      // Update the list
      setMemories(memories.filter(memory => memory.id !== id));
    } catch (error) {
      console.error('Error deleting memory:', error);
    }
  };

  const viewMemory = (memory) => {
    // Store the memory in session storage and navigate to viewer
    sessionStorage.setItem('viewMemory', JSON.stringify(memory));
    router.push('/conversation-viewer');
  };

  if (loading) {
    return <div className="p-4 text-center">Loading conversation history...</div>;
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Your Conversation History</h2>
      
      {memories.length === 0 ? (
        <div className="text-gray-500 p-4 border rounded-lg text-center">
          No conversations found. Start chatting to create history.
        </div>
      ) : (
        <div className="space-y-4">
          {memories.map(memory => (
            <div key={memory.id} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">
                    {formatDate(memory.created_at)}
                  </p>
                  <p className="mt-2 text-gray-800">
                    {getConversationPreview(memory)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {memory.data.length} messages
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => viewMemory(memory)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => deleteMemory(memory.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationHistory; 