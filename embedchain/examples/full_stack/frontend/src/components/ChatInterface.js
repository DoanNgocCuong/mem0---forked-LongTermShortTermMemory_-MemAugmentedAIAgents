import React, { useState, useEffect, useRef } from 'react';
import BotIcon from '../../public/icons/bot.svg';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('user-' + Math.random().toString(36).substr(2, 9));
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load previous messages from memory
    const loadMemory = async () => {
      try {
        const response = await fetch(`/api/memory/user/${userId}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          // Sort by created_at timestamp
          const sortedData = data.sort((a, b) => 
            new Date(a.created_at) - new Date(b.created_at)
          );
          
          // Assume the most recent memory contains the chat history
          const chatMemory = sortedData[sortedData.length - 1];
          if (chatMemory && chatMemory.data && Array.isArray(chatMemory.data)) {
            setMessages(chatMemory.data);
          }
        }
      } catch (error) {
        console.error('Error loading memory:', error);
      }
    };
    
    loadMemory();
  }, [userId]);

  const saveToMemory = async (messageList) => {
    try {
      await fetch('/api/memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: messageList,
          user_id: userId,
          metadata: { type: 'chat_history' }
        }),
      });
    } catch (error) {
      console.error('Error saving to memory:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Send to backend for processing
      const response = await fetch('/api/get_answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          embedding_model: 'open_ai',
          app_type: 'app'
        }),
      });

      const data = await response.json();
      
      // Add bot response to chat
      const botMessage = { role: 'assistant', content: data.response || "Sorry, I couldn't process that request." };
      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      
      // Save the complete conversation to memory
      saveToMemory(finalMessages);
    } catch (error) {
      console.error('Error:', error);
      // Add error message
      const errorMessage = { role: 'assistant', content: "Sorry, an error occurred. Please try again." };
      setMessages([...updatedMessages, errorMessage]);
      
      // Save even with the error
      saveToMemory([...updatedMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <BotIcon className="w-16 h-16 mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-600">Start a new conversation</h3>
            <p className="text-gray-500 mt-2">Ask any question to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg max-w-3xl ${
                  message.role === 'user' 
                    ? 'bg-blue-100 ml-auto' 
                    : 'bg-white border border-gray-200'
                }`}
              >
                <p className="text-sm font-semibold text-gray-700">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </p>
                <p className="mt-1 text-gray-800 whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="border-t p-4 bg-white">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message here..."
            className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 