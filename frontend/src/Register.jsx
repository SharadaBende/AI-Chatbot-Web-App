import { useState } from "react";
import axios from "axios";

function Register({ onRegister, goToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post("http://127.0.0.1:8000/register", {
        username,
        email,
        password,
      });
      onRegister();
    } catch (err) {
      setError("Username already exists. Try another one.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <h1 className="text-white text-3xl font-semibold text-center mb-2">Create an account</h1>
        <p className="text-gray-400 text-center mb-8 text-sm">Start chatting with AI today</p>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-2 block">Username</label>
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder-gray-500"
            />
          </div>

          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-2 block">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder-gray-500"
            />
          </div>

          <div className="mb-6">
            <label className="text-gray-400 text-sm mb-2 block">Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder-gray-500"
            />
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-white text-gray-900 py-3 rounded-xl font-semibold text-sm hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{" "}
          <span onClick={goToLogin} className="text-white cursor-pointer hover:underline font-medium">
            Sign in
          </span>
        </p>

      </div>
    </div>
  );
}

export default Register;