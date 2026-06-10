import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Login from "./Login";
import Register from "./Register";

const api = axios.create({ baseURL: "http://127.0.0.1:8000" });

const Logo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <rect x="5" y="5" width="90" height="70" rx="18" fill="#7c3aed"/>
    <path d="M20 73 L10 90 L30 73 Z" fill="#7c3aed"/>
    <path d="M68 18 L52 48 L62 48 L50 75 L74 38 L63 38 Z" fill="white"/>
  </svg>
);

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [page, setPage] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [hoveredId, setHoveredId] = useState(null);
  const messagesEndRef = useRef(null);
  const editInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");
    if (token) {
      setIsLoggedIn(true);
      setUsername(savedUsername || "User");
      fetchConversations();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  const fetchConversations = async () => {
    try {
      const res = await api.get("/conversations", authHeaders());
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadConversation = async (convId) => {
    try {
      const res = await api.get(`/conversations/${convId}`, authHeaders());
      setCurrentConvId(convId);
      setMessages(res.data.messages.map(m => ({
        role: m.role === "assistant" ? "bot" : "user",
        text: m.content,
        time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      })));
    } catch (err) {
      console.error(err);
    }
  };

  const startNewChat = () => {
    setCurrentConvId(null);
    setMessages([]);
  };

  const deleteConversation = async (e, convId) => {
    e.stopPropagation();
    try {
      await api.delete(`/conversations/${convId}`, authHeaders());
      if (currentConvId === convId) {
        setCurrentConvId(null);
        setMessages([]);
      }
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const startRename = (e, conv) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const saveRename = async (convId) => {
    if (!editingTitle.trim()) return;
    try {
      await api.patch(`/conversations/${convId}`, { title: editingTitle }, authHeaders());
      setEditingId(null);
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const togglePin = async (e, conv) => {
    e.stopPropagation();
    try {
      await api.patch(`/conversations/${conv.id}`, { pinned: !conv.pinned }, authHeaders());
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = {
      role: "user",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chat", {
        message: input,
        conversation_id: currentConvId
      }, authHeaders());

      if (!currentConvId) setCurrentConvId(res.data.conversation_id);

      setMessages((prev) => [...prev, {
        role: "bot",
        text: res.data.bot_response,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);

      fetchConversations();
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: "bot",
        text: "Something went wrong. Please try again.",
        time: "",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setMessages([]);
    setConversations([]);
    setPage("login");
  };

  const getInitials = (name) => name?.charAt(0).toUpperCase() || "U";

  const pinnedConvs = conversations.filter(c => c.pinned);
  const unpinnedConvs = conversations.filter(c => !c.pinned);

  if (!isLoggedIn) {
    if (page === "register") {
      return <Register onRegister={() => setPage("login")} goToLogin={() => setPage("login")} />;
    }
    return (
      <Login
        onLogin={() => {
          setIsLoggedIn(true);
          setUsername(localStorage.getItem("username") || "User");
          fetchConversations();
        }}
        goToRegister={() => setPage("register")}
      />
    );
  }

 const ConvItem = ({ conv }) => (
  <div
    key={conv.id}
    onMouseEnter={() => setHoveredId(conv.id)}
    onMouseLeave={() => setHoveredId(null)}
    className={`group relative flex items-center rounded-xl transition ${
      currentConvId === conv.id ? "bg-gray-800" : "hover:bg-gray-800"
    }`}
  >
    {editingId === conv.id ? (
      <input
        ref={editInputRef}
        value={editingTitle}
        onChange={(e) => setEditingTitle(e.target.value)}
        onBlur={() => saveRename(conv.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter") saveRename(conv.id);
          if (e.key === "Escape") setEditingId(null);
        }}
        className="flex-1 bg-gray-700 text-white text-sm px-3 py-2 rounded-xl outline-none border border-purple-500 mx-1 my-1"
        onClick={(e) => e.stopPropagation()}
      />
    ) : (
      <>
        <span
          className={`flex-1 px-3 py-2.5 text-sm truncate cursor-pointer ${
            currentConvId === conv.id ? "text-white" : "text-gray-400 group-hover:text-white"
          }`}
          onClick={() => loadConversation(conv.id)}
          onDoubleClick={(e) => startRename(e, conv)}
          title="Click to open · Double-click to rename"
        >
          {conv.pinned && <span className="text-yellow-500 mr-1">📌</span>}
          {conv.title}
        </span>

        {hoveredId === conv.id && (
          <div className="flex items-center gap-0.5 pr-2 flex-shrink-0">

            <button
              onClick={(e) => togglePin(e, conv)}
              title={conv.pinned ? "Unpin" : "Pin"}
              className={`p-1.5 rounded-lg transition ${
                conv.pinned ? "text-yellow-400 hover:text-yellow-300" : "text-gray-500 hover:text-yellow-400"
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill={conv.pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </button>

            <button
              onClick={(e) => startRename(e, conv)}
              title="Rename"
              className="p-1.5 rounded-lg text-gray-500 hover:text-white transition"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>

            <button
              onClick={(e) => deleteConversation(e, conv.id)}
              title="Delete"
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 transition"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>

          </div>
        )}
      </>
    )}
  </div>
);

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">

      {/* Sidebar */}
      <div className={`${showSidebar ? "w-64" : "w-0"} transition-all duration-300 overflow-hidden bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0`}>

        <div className="p-4 flex items-center gap-2 border-b border-gray-800">
          <Logo size={28} />
          <span className="font-semibold text-sm">AI Chatbot</span>
        </div>

        <div className="p-3">
          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-gray-800 transition text-sm text-gray-300 hover:text-white border border-gray-700"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">

          {/* Pinned */}
          {pinnedConvs.length > 0 && (
            <>
              <p className="text-gray-500 text-xs font-medium px-2 mb-1 mt-1">📌 Pinned</p>
              {pinnedConvs.map(conv => (
  <div
    key={conv.id}
    onMouseEnter={() => setHoveredId(conv.id)}
    onMouseLeave={() => setHoveredId(null)}
    className={`group relative flex items-center rounded-xl transition ${
      currentConvId === conv.id ? "bg-gray-800" : "hover:bg-gray-800"
    }`}
  >
    {editingId === conv.id ? (
      <input
        ref={editInputRef}
        value={editingTitle}
        onChange={(e) => setEditingTitle(e.target.value)}
        onBlur={() => saveRename(conv.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter") saveRename(conv.id);
          if (e.key === "Escape") setEditingId(null);
        }}
        className="flex-1 bg-gray-700 text-white text-sm px-3 py-2 rounded-xl outline-none border border-purple-500 mx-1 my-1"
        onClick={(e) => e.stopPropagation()}
      />
    ) : (
      <>
        <span
          className={`flex-1 px-3 py-2.5 text-sm truncate cursor-pointer ${
            currentConvId === conv.id ? "text-white" : "text-gray-400 group-hover:text-white"
          }`}
          onClick={() => loadConversation(conv.id)}
          onDoubleClick={(e) => startRename(e, conv)}
          title="Click to open · Double-click to rename"
        >
          <span className="text-yellow-500 mr-1">📌</span>
          {conv.title}
        </span>
        {hoveredId === conv.id && (
          <div className="flex items-center gap-0.5 pr-2 flex-shrink-0">
            <button onClick={(e) => togglePin(e, conv)} title="Unpin"
              className="p-1.5 rounded-lg text-yellow-400 hover:text-yellow-300 transition">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </button>
            <button onClick={(e) => startRename(e, conv)} title="Rename"
              className="p-1.5 rounded-lg text-gray-500 hover:text-white transition">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button onClick={(e) => deleteConversation(e, conv.id)} title="Delete"
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 transition">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>
        )}
      </>
    )}
  </div>
))}
              <div className="border-t border-gray-800 my-2"/>
            </>
          )}

          {/* Recent */}
          {unpinnedConvs.length > 0 && (
            <p className="text-gray-500 text-xs font-medium px-2 mb-1">Recent</p>
          )}
          {unpinnedConvs.map(conv => (
  <div
    key={conv.id}
    onMouseEnter={() => setHoveredId(conv.id)}
    onMouseLeave={() => setHoveredId(null)}
    className={`group relative flex items-center rounded-xl transition ${
      currentConvId === conv.id ? "bg-gray-800" : "hover:bg-gray-800"
    }`}
  >
    {editingId === conv.id ? (
      <input
        ref={editInputRef}
        value={editingTitle}
        onChange={(e) => setEditingTitle(e.target.value)}
        onBlur={() => saveRename(conv.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter") saveRename(conv.id);
          if (e.key === "Escape") setEditingId(null);
        }}
        className="flex-1 bg-gray-700 text-white text-sm px-3 py-2 rounded-xl outline-none border border-purple-500 mx-1 my-1"
        onClick={(e) => e.stopPropagation()}
      />
    ) : (
      <>
        <span
          className={`flex-1 px-3 py-2.5 text-sm truncate cursor-pointer ${
            currentConvId === conv.id ? "text-white" : "text-gray-400 group-hover:text-white"
          }`}
          onClick={() => loadConversation(conv.id)}
          onDoubleClick={(e) => startRename(e, conv)}
          title="Click to open · Double-click to rename"
        >
          {conv.title}
        </span>
        {hoveredId === conv.id && (
          <div className="flex items-center gap-0.5 pr-2 flex-shrink-0">
            <button onClick={(e) => togglePin(e, conv)} title="Pin"
              className="p-1.5 rounded-lg text-gray-500 hover:text-yellow-400 transition">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </button>
            <button onClick={(e) => startRename(e, conv)} title="Rename"
              className="p-1.5 rounded-lg text-gray-500 hover:text-white transition">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button onClick={(e) => deleteConversation(e, conv.id)} title="Delete"
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 transition">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>
        )}
      </>
    )}
  </div>
))}

        </div>

        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-semibold">
                {getInitials(username)}
              </div>
              <span className="text-sm text-gray-300">{username}</span>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition" title="Logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-gray-400 hover:text-white transition p-1.5 rounded-lg hover:bg-gray-800"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-400">
            {currentConvId ? conversations.find(c => c.id === currentConvId)?.title : "New chat"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="mb-6"><Logo size={56} /></div>
              <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
              <p className="text-gray-500 text-sm">Ask me anything — I'm here to help!</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map((msg, index) => (
                <div key={index} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "bot" && (
                    <div className="w-8 h-8 rounded-full flex-shrink-0 mt-1 overflow-hidden">
                      <Logo size={32} />
                    </div>
                  )}
                  <div className={`max-w-[75%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user" ? "bg-gray-700 text-white rounded-tr-sm" : "bg-gray-800 text-gray-100 rounded-tl-sm"
                    }`}>
                      {msg.text}
                    </div>
                    {msg.time && <span className="text-xs text-gray-600 mt-1 px-1">{msg.time}</span>}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-1 text-sm font-semibold">
                      {getInitials(username)}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 mt-1 overflow-hidden">
                    <Logo size={32} />
                  </div>
                  <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="px-4 py-4 border-t border-gray-800">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 focus-within:border-gray-600 transition">
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder="Message AI Chatbot..."
                rows={1}
                className="flex-1 bg-transparent text-white text-sm outline-none resize-none placeholder-gray-500 leading-relaxed max-h-32"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-200 transition disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"/>
                  <polyline points="5 12 12 5 19 12"/>
                </svg>
              </button>
            </div>
            <p className="text-center text-gray-600 text-xs mt-2">Press Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;