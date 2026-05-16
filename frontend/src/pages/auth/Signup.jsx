import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowLeft } from "lucide-react";
import API from "../../api/api.js";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", branch: "" });
  const [customBranch, setCustomBranch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "branch" && e.target.value !== "Other") {
      setCustomBranch("");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const finalBranch =
      formData.branch === "Other"
        ? customBranch.trim() || "Not Set"
        : formData.branch || "Not Set";

    try {
      const res = await API.post("/auth/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        branch: finalBranch,
      });
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.response?.data?.message || "Signup failed. Please try again.");
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl text-white font-extrabold">
            Interview <span className="text-[#1EB79C]">Buddy</span>
          </h1>
        </Link>
      </div>

      {/* Signup Box */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-center mb-2">Create an account</h2>
        <p className="text-center text-gray-500 mb-5 text-sm sm:text-base">
          Start your interview preparation journey today
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form className="space-y-4" onSubmit={handleSignup}>
          <div>
            <label className="font-medium text-sm sm:text-base">Full Name</label>
            <div className="flex items-center border rounded-lg px-3 py-2 mt-2">
              <User className="text-gray-400 shrink-0" size={18} />
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full outline-none ml-2 text-sm sm:text-base"
              />
            </div>
          </div>

          <div>
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

          <div>
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

          <div>
            <label className="font-medium text-sm sm:text-base">Branch (Optional)</label>
            <div className="border rounded-lg px-3 py-2 mt-2">
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full outline-none bg-transparent text-sm sm:text-base"
              >
                <option value="">Select your branch</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Data Science">Data Science</option>
                <option value="Cyber Security">Cyber Security</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {formData.branch === "Other" && (
              <div className="border rounded-lg px-3 py-2 mt-2">
                <input
                  type="text"
                  value={customBranch}
                  onChange={(e) => setCustomBranch(e.target.value)}
                  placeholder="Enter your branch / field of study"
                  className="w-full outline-none bg-transparent text-sm sm:text-base"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#243b6b] text-white py-3 rounded-lg font-semibold hover:bg-[#1f3158] disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-5 text-gray-500 text-sm sm:text-base">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;