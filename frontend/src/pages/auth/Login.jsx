import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { useState } from "react";
import API from "../../api/api.js";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/login", formData);
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#162447] via-[#2d5878] to-[#2fa6a2] flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Link to="/" className="flex items-center gap-2 text-gray-300 hover:text-white text-sm">
          <ArrowLeft size={16} /> Home
        </Link>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="flex items-center gap-3 cursor-pointer">
          <div className="bg-[#1EB79C] p-2 rounded-full shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl text-white font-extrabold">
            Interview <span className="text-[#1EB79C]">Buddy</span>
          </h1>
        </Link>
      </div>

      {/* Login Box */}
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 text-center">Welcome back</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-5 text-center">
          Sign in to continue your interview prep journey
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="font-medium text-sm sm:text-base">Email</label>
            <div className="flex items-center border rounded-lg px-3 py-2 mt-2">
              <Mail className="text-gray-400 shrink-0" size={18} />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full outline-none ml-2 text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="font-medium text-sm sm:text-base">Password</label>
            <div className="flex items-center border rounded-lg px-3 py-2 mt-2">
              <Lock className="text-gray-400 shrink-0" size={18} />
              <input
                type="password"
                name="password"
                placeholder="********"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full outline-none ml-2 text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="flex justify-end mb-4 mt-2">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#193366] text-white w-full p-3 rounded-xl hover:bg-[#12264d] disabled:opacity-50 text-sm sm:text-base font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm sm:text-base text-gray-600 mt-5 text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;