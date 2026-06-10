import { useState, useEffect } from "react";
import axios from "axios";
import Login from "./Login";
import Register from "./Register";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [page, setPage] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchHistory(token);
    }
  }, []);

  const fetchHistory = async (token) => {
    try {
      const t = token || localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:8000/history", {
        headers: { Authorization: `Bearer ${t}` },
      });
      setHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const token = localStorage.getItem("token");
    const userMessage = {
      role: "user",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/chat",
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const botMessage = {
        role: "bot",
        text: response.data.bot_response,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMessage]);
      fetchHistory();
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Something went wrong. Please try again.", time: "" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const loadConversation = (item) => {
    setMessages([
      { role: "user", text: item.user_message, time: "" },
      { role: "bot", text: item.bot_response, time: "" },
    ]);
    setShowHistory(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setMessages([]);
    setHistory([]);
    setPage("login");
  };

  if (!isLoggedIn) {
    if (page === "register") {
      return <Register onRegister={() => setPage("login")} goToLogin={() => setPage("login")} />;
    }
    return <Login onLogin={() => { setIsLoggedIn(true); fetchHistory(); }} goToRegister={() => setPage("register")} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg flex h-[90vh]">

        {/* Sidebar */}
        <div className={`${showHistory ? "w-72" : "w-0"} transition-all duration-300 overflow-hidden bg-gray-50 border-r rounded-l-2xl flex flex-col`}>
          <div className="p-4 bg-purple-600 text-white font-bold text-lg rounded-tl-2xl">
            Chat History
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {history.length === 0 && (
              <p className="text-gray-400 text-sm text-center mt-4">No history yet</p>
            )}
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => loadConversation(item)}
                className="p-3 bg-white rounded-xl shadow-sm cursor-pointer hover:bg-purple-50 border border-gray-200"
              >
                <p className="text-sm text-gray-700 font-medium truncate">{item.user_message}</p>
                <p className="text-xs text-gray-400 truncate">{item.bot_response}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat */}
        <div className="flex-1 flex flex-col">

          {/* Header */}
          <div className="bg-purple-600 text-white text-center py-4 rounded-tr-2xl flex items-center justify-between px-4">
            <button onClick={() => setShowHistory(!showHistory)} className="text-white text-xl font-bold hover:opacity-75">
              ☰
            </button>
            <div>
              <h1 className="text-2xl font-bold">AI Chatbot</h1>
              <p className="text-sm opacity-75">Powered by LLaMA 3.3</p>
            </div>
            <button onClick={handleLogout} className="text-white text-sm hover:opacity-75 font-medium">
              Logout
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-center text-gray-400 mt-10">Start a conversation!</p>
            )}
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}>
                  {msg.text}
                  <div className={`text-xs mt-1 ${msg.role === "user" ? "text-purple-200" : "text-gray-400"}`}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-500 px-4 py-2 rounded-2xl text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]"></span>
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
    </div>
  );
}

export default App;