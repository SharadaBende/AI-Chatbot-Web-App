import { useState } from "react";
import axios from "axios";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/chat", {
        message: input,
      });

      const botMessage = {
        role: "bot",
        text: response.data.bot_response,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg flex flex-col h-[90vh]">
        
        {/* Header */}
        <div className="bg-purple-600 text-white text-center py-4 rounded-t-2xl">
          <h1 className="text-2xl font-bold">AI Chatbot</h1>
          <p className="text-sm opacity-75">Powered by Claude AI</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 mt-10">
              Start a conversation!
            </p>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-500 px-4 py-2 rounded-2xl text-sm">
                Typing...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none focus:border-purple-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-purple-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;