import { useState } from "react";
import axios from "axios";

function Login({ onLogin, goToRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
       const response = await axios.post("https://ai-chatbot-web-app-kyg2.onrender.com/login", {
  username,
  password,
});
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("username", username);
      onLogin();
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  const bg = darkMode ? "bg-gray-950" : "bg-gray-50";
  const card = darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const text = darkMode ? "text-white" : "text-gray-900";
  const subtext = darkMode ? "text-gray-400" : "text-gray-500";
  const input = darkMode
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500"
    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500";
  const label = darkMode ? "text-gray-400" : "text-gray-600";
  const btn = darkMode
    ? "bg-white text-gray-900 hover:bg-gray-100"
    : "bg-gray-900 text-white hover:bg-gray-800";
  const divider = darkMode ? "border-gray-700" : "border-gray-200";
  const toggleBg = darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200";
  const toggleText = darkMode ? "text-gray-300" : "text-gray-600";

  return (
    <div className={`min-h-screen ${bg} flex items-center justify-center px-4 transition-colors duration-300`}>

      {/* Dark mode toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-4 right-4 p-2.5 rounded-xl ${toggleBg} ${toggleText} transition`}
      >
        {darkMode ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </button>

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <svg width="52" height="52" viewBox="0 0 120 120" fill="none">
            <rect x="5" y="5" width="90" height="70" rx="18" fill="#7c3aed"/>
            <path d="M20 73 L10 90 L30 73 Z" fill="#7c3aed"/>
            <path d="M68 18 L52 48 L62 48 L50 75 L74 38 L63 38 Z" fill="white"/>
          </svg>
        </div>

        <h1 className={`${text} text-3xl font-semibold text-center mb-2`}>Welcome back</h1>
        <p className={`${subtext} text-center mb-8 text-sm`}>Sign in to continue to AI Chatbot</p>

        <div className={`${card} rounded-2xl p-8 border shadow-2xl`}>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className={`${label} text-sm mb-2 block font-medium`}>Username</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`w-full ${input} border rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition`}
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className={`${label} text-sm font-medium`}>Password</label>
              <span className="text-purple-500 text-xs cursor-pointer hover:underline">Forgot password?</span>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`w-full ${input} border rounded-xl pl-10 pr-10 py-3 text-sm outline-none transition`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full ${btn} py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Signing in...
              </>
            ) : "Continue"}
          </button>


        </div>

        <p className={`text-center ${subtext} text-sm mt-6`}>
          Don't have an account?{" "}
          <span onClick={goToRegister} className="text-purple-500 cursor-pointer hover:underline font-medium">
            Sign up
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;