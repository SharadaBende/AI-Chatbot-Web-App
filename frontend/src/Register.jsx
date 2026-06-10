import { useState } from "react";
import axios from "axios";

function Register({ onRegister, goToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/register", {
        username,
        email,
        password,
      });
      onRegister();
    } catch (err) {
      setError("Registration failed. Username may already exist.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-purple-600 text-center mb-6">Create Account 🚀</h2>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm mb-3 outline-none focus:border-purple-500"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm mb-3 outline-none focus:border-purple-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm mb-4 outline-none focus:border-purple-500"
        />
        <button
          onClick={handleRegister}
          className="w-full bg-purple-600 text-white py-2 rounded-full font-medium hover:bg-purple-700"
        >
          Register
        </button>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <span onClick={goToLogin} className="text-purple-600 cursor-pointer font-medium">
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;