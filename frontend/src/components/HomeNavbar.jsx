import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { LayoutDashboard } from "lucide-react";

const HomeNavbar = () => {
  const navigate = useNavigate();
  const [navUser, setNavUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isLoggedIn = navUser && navUser.token;
  const firstLetter = navUser?.name ? navUser.name.charAt(0).toUpperCase() : "U";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    const handleProfileUpdate = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user"));
      if (updatedUser) setNavUser(updatedUser);
    };
    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userProfile");
    setDropdownOpen(false);
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="sticky top-0 z-50 bg-[#113155] flex justify-between items-center py-3 sm:py-4 px-4 sm:px-8 lg:px-16 shadow-md">

      {/* Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="bg-[#1EB79C] p-2 rounded-full shadow-lg cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <Link to="/">
          <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight cursor-pointer">
            Interview <span className="text-[#1EB79C]">Buddy</span>
          </h1>
        </Link>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3 sm:gap-5 lg:gap-10">
        {isLoggedIn ? (
          <div className="flex items-center gap-3 sm:gap-5 lg:gap-10">

            <Link
              to="/dashboard"
              className="hidden lg:block text-base font-bold text-white hover:text-[#1EB79C] transition duration-200"
            >
              Dashboard
            </Link>

            <Link
              to="/dashboard"
              className="lg:hidden text-white hover:text-[#1EB79C] transition duration-200"
            >
              <LayoutDashboard size={22} />
            </Link>

            {/* Avatar Circle + Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-[#1EB79C] text-white font-bold text-base sm:text-lg flex items-center justify-center shadow-lg hover:ring-2 hover:ring-white transition duration-200 border-2 border-white"
              >
                {navUser?.avatar ? (
                  <img src={navUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{firstLetter}</span>
                )}
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 sm:w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">

                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#113155] to-[#1a4a7a] p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-[#1EB79C] flex items-center justify-center shadow flex-shrink-0">
                        {navUser?.avatar ? (
                          <img src={navUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-lg sm:text-xl">{firstLetter}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm truncate max-w-[120px] sm:max-w-[140px]">
                          {navUser?.name}
                        </p>
                        <p className="text-gray-300 text-xs truncate max-w-[120px] sm:max-w-[140px] mt-0.5">
                          {navUser?.branch || "No branch set"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    {[
                      { to: "/dashboard", label: "Dashboard", color: "blue", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
                      { to: "/profile", label: "My Profile", color: "purple", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
                      { to: "/progress", label: "My Progress", color: "green", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 sm:py-2.5 rounded-xl hover:bg-gray-50 transition group`}
                      >
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 bg-${item.color}-100 rounded-lg flex items-center justify-center`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-${item.color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {item.icon}
                          </svg>
                        </div>
                        <span className={`text-xs sm:text-sm font-medium text-gray-700 group-hover:text-${item.color}-600`}>
                          {item.label}
                        </span>
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 mx-2" />

                  {/* Sign Out */}
                  <div className="p-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2 sm:py-2.5 rounded-xl hover:bg-red-50 transition group"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-red-500 group-hover:text-red-600">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <Link to="/login" className="text-sm sm:text-base font-semibold text-white hover:text-[#1EB79C] transition duration-200">
              Log in
            </Link>
            <Link to="/signup" className="text-xs sm:text-base font-bold text-white bg-[#1EB79C] hover:bg-[#159a82] px-4 sm:px-7 py-2 sm:py-3 rounded-full shadow-lg transition duration-200">
              Get Started
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default HomeNavbar;