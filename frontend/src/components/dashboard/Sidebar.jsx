import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { LayoutDashboard, PlayCircle, FileText, BarChart, User, LogOut, X, Map, BookOpen, Brain } from "lucide-react";
import API from "../../api/api.js";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(() => {
    const cached = localStorage.getItem("userProfile");
    if (cached) return JSON.parse(cached);
    return JSON.parse(localStorage.getItem("user")) || null;
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.token) return;
        const res = await API.get("/auth/profile", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setUserData(res.data);
        localStorage.setItem("userProfile", JSON.stringify(res.data));
      } catch (err) {
        console.log("Sidebar profile error:", err);
      }
    };

    fetchProfile();

    const handleProfileUpdate = () => {
      const cached = localStorage.getItem("userProfile");
      if (cached) setUserData(JSON.parse(cached));
      fetchProfile();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userProfile");
    navigate("/");
    window.location.reload();
  };

  const firstLetter = userData?.name?.charAt(0).toUpperCase() || "U";

  const navLinks = [
    { to: "/dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { to: "/mock-interview", icon: <PlayCircle size={18} />, label: "Mock Interview" },
    { to: "/roadmap", icon: <Map size={18} />, label: "Roadmap" },
    { to: "/roadmap/history", icon: <BookOpen size={18} />, label: "My Roadmaps" },
    { to: "/quiz-history", icon: <Brain size={18} />, label: "Quiz History" },
    { to: "/resume", icon: <FileText size={18} />, label: "Resume" },
    { to: "/progress", icon: <BarChart size={18} />, label: "Progress" },
    { to: "/profile", icon: <User size={18} />, label: "Profile" },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-screen w-64 bg-[#1f2a44] text-white flex flex-col justify-between z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>
        <div>
          {/* Logo + Close Button */}
          <div className="flex items-center justify-between px-5 pt-5 mb-6">
            <Link to="/" className="flex items-center gap-3" onClick={onClose}>
              <div className="bg-[#1EB79C] p-2 rounded-full shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h1 className="text-xl font-extrabold">
                Interview <span className="text-[#1EB79C]">Buddy</span>
              </h1>
            </Link>

            {/* Close - Mobile only */}
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#2e3b5e] transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Info */}
          <Link to="/profile" onClick={onClose}>
            <div className="px-4 mb-4">
              <div className="bg-[#2e3b5e] p-3 rounded-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  {userData?.avatar ? (
                    <img src={userData.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#2fb79c] flex items-center justify-center font-bold text-white">
                      {firstLetter}
                    </div>
                  )}
                </div>
                <div className="overflow-hidden">
                  <h2 className="font-bold truncate text-sm">{userData?.name || "User"}</h2>
                  <p className="text-xs text-gray-400 truncate">
                    {userData?.branch || "No branch set"}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Menu */}
          <div className="px-4 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg transition-colors font-semibold text-sm
                  ${isActive ? "bg-[#2fb79c]" : "hover:bg-[#2e3b5e]"}`
                }
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 p-4 border-t border-gray-700 font-semibold hover:text-red-400 transition w-full text-left text-sm"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;