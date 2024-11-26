import { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Quick suggestions for common queries
  const suggestions = [
    { text: "What's popular now?", type: 'search' },
    { text: "Upcoming releases", type: 'upcoming' },
    { text: "Find action movies", type: 'search' },
    { text: "Help with playback", type: 'technical' },
  ];

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          type: 'bot',
          content: "👋 Welcome to Hulu! I can help you:\n\n" +
                  "🔍 Find movies and shows\n" +
                  "ℹ️ Get detailed information\n" +
                  "🆕 Check upcoming releases\n" +
                  "🛠️ Solve technical issues\n\n" +
                  "What would you like to know?"
        }
      ]);
    }
  }, [isOpen]);

  const handleSuggestionClick = async (suggestion) => {
    setMessages(prev => [...prev, { type: 'user', content: suggestion.text }]);
    await handleSubmit(suggestion.text);
  };

  const handleSubmit = async (text = inputValue) => {
    if (!text.trim()) return;

    setIsLoading(true);
    setInputValue('');
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: text,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Format the response for better display
      const formattedResponse = data.reply.split('\n').map((line, index) => {
        if (line.startsWith('🎬') || line.startsWith('📺')) return `<strong>${line}</strong>`;
        if (line.startsWith('⭐')) return `<em>${line}</em>`;
        if (line.startsWith('📝')) return `<p class="overview">${line}</p>`;
        return line;
      }).join('\n');

      setMessages(prev => [
        ...prev,
        { type: 'bot', content: formattedResponse }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { type: 'error', content: "Sorry, I'm having trouble right now. Please try again later." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-600 hover:bg-green-700 text-white rounded-full p-3 shadow-lg transition-all duration-200"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <ChatBubbleLeftIcon className="h-6 w-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 h-[600px] bg-gray-900 rounded-lg shadow-xl flex flex-col border border-gray-700">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700 bg-gray-800 rounded-t-lg">
            <h3 className="text-lg font-semibold text-white">Movie Assistant</h3>
            <p className="text-sm text-gray-400">Ask me anything about movies!</p>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-green-600 text-white'
                      : message.type === 'error'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  <div 
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ 
                      __html: message.content.replace(/\n/g, '<br>') 
                    }}
                  />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-white rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="p-2 border-t border-gray-700 bg-gray-800">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-full px-3 py-1 transition-colors"
                >
                  {suggestion.text}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-700">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="flex space-x-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about movies or shows..."
                className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg px-4 py-2 transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
