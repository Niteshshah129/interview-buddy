import { Link, NavLink } from "react-router-dom";

const HomeFooter = () => {
  return (
    <div className="bg-[#113155] text-white mt-auto w-full">

      <div className="py-10 sm:py-16 px-4 sm:px-8 lg:px-32">
        <div className="flex flex-col sm:flex-row gap-10 sm:gap-6 justify-between items-start">

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-[#1EB79C] p-2 rounded-full shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold">
              Interview <span className="text-[#1EB79C]">Buddy</span>
            </h1>

          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10 w-full sm:w-auto">

            {/* Top Jobs */}
            <div>
              <h2 className="text-base sm:text-xl font-semibold mb-3">Top Jobs</h2>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                {["AI & Data Science", "Cyber Security", "Cloud Computing", "Software Engineering", "Electrical Engineering"].map((job, i) => (
                  <li key={i} className="hover:text-[#1EB79C] cursor-pointer">{job}</li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h2 className="text-base sm:text-xl font-semibold mb-3">Quick Links</h2>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><NavLink to="/dashboard" className="hover:text-[#1EB79C]">Dashboard</NavLink></li>
                <li><NavLink to="/roadmap" className="hover:text-[#1EB79C]">Roadmap</NavLink></li>
                <li><NavLink to="/mock-interview" className="hover:text-[#1EB79C]">Mock Interview</NavLink></li>
                <li><NavLink to="/resume" className="hover:text-[#1EB79C]">Resume Builder</NavLink></li>

              </ul>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-base sm:text-xl font-semibold mb-3">Contact</h2>
              <div className="space-y-2 text-gray-400 text-sm sm:text-base">
                <p className="hover:text-[#1EB79C] cursor-pointer">FAQ's</p>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011-.24c1.12.37 2.33.57 3.59.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.26.2 2.47.57 3.59a1 1 0 01-.25 1l-2.2 2.2z" />
                  </svg>
                  <p className="hover:text-[#1EB79C] cursor-pointer">+91 XXXXX XXXXX</p>
                </div>
                <p className="hover:text-[#1EB79C] cursor-pointer break-all">support@interviewbuddy.com</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-white/20 px-4 sm:px-8 lg:px-32 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
          {["About Us", "Contact", "Privacy Policy", "Terms"].map((link, i) => (
            <Link key={i} to={`/${link.toLowerCase().replace(" ", "-")}`} className="text-xs sm:text-sm hover:text-[#1EB79C]">
              {link}
            </Link>
          ))}
        </div>
        <p className="text-xs sm:text-sm text-white/60 text-center">
          &copy; {new Date().getFullYear()} Interview Buddy. All Rights Reserved.
        </p>
      </div>

    </div>
  );
};

export default HomeFooter;