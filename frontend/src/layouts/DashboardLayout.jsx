import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col overflow-x-hidden">

        {/* Mobile Top Bar - Only visible on mobile/tablet */}
        <div className="lg:hidden sticky top-0 z-30 bg-[#1f2a44] flex items-center justify-between px-4 py-3 shadow-md">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-[#1EB79C] p-1.5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h1 className="text-lg font-extrabold text-white">
              Interview <span className="text-[#1EB79C]">Buddy</span>
            </h1>
          </Link>

          {/* Hamburger Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white p-2 rounded-lg hover:bg-[#2e3b5e] transition"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default DashboardLayout;