import HomeNavbar from "../components/HomeNavbar";
import HomeFooter from "../components/HomeFooter";
import { Users, Target, Award, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HomeNavbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#162447] via-[#2d5878] to-[#2fa6a2] text-white py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4">About Interview Buddy</h1>
          <p className="text-white/80 text-sm sm:text-lg max-w-2xl mx-auto">
            We are on a mission to help every student and professional land their dream job
            through AI-powered interview preparation.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {[
            { icon: <Target size={28} className="text-[#2fb79c]" />, title: "Our Mission", desc: "To democratize interview preparation by making AI-powered coaching accessible to everyone, regardless of their background or resources." },
            { icon: <Heart size={28} className="text-red-400" />, title: "Our Vision", desc: "A world where every candidate walks into their interview fully prepared, confident, and ready to showcase their true potential." },
            { icon: <Users size={28} className="text-blue-500" />, title: "Who We Serve", desc: "From fresh graduates to experienced professionals, we help anyone preparing for technical and behavioral interviews at top companies." },
            { icon: <Award size={28} className="text-yellow-500" />, title: "What We Offer", desc: "AI mock interviews, personalized roadmaps, resume analysis, progress tracking, and real-time feedback powered by Google Gemini AI." },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl shadow p-6">
              <div className="mb-3">{item.icon}</div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-[#113155] rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold text-center mb-8">Our Impact</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: "10K+", label: "Mock Interviews" },
              { value: "500+", label: "Questions" },
              { value: "50+", label: "Companies" },
              { value: "95%", label: "Success Rate" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-3xl font-extrabold text-[#2fb79c]">{stat.value}</p>
                <p className="text-white/70 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <HomeFooter />
    </div>
  );
};

export default About;