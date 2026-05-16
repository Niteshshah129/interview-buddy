import HomeNavbar from "../components/HomeNavbar";
import HomeFooter from "../components/HomeFooter";
import { Shield } from "lucide-react";

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, including your name, email address, and password. We also collect information about your usage of our platform, including interview sessions, scores, and progress data."
    },
    {
      title: "How We Use Your Information",
      content: "We use the information we collect to provide, maintain, and improve our services, personalize your experience, generate AI-powered feedback, track your progress, and communicate with you about updates and features."
    },
    {
      title: "AI & Data Processing",
      content: "Interview Buddy uses Google Gemini AI to generate questions and feedback. Your interview responses are sent to Google's AI services for processing. We do not store your raw responses permanently. Please review Google's privacy policy for information about how they handle data."
    },
    {
      title: "Data Storage & Security",
      content: "Your data is stored securely on MongoDB Atlas servers. We use industry-standard encryption and security measures to protect your personal information. Uploaded files (resumes, avatars) are stored on Cloudinary's secure cloud storage."
    },
    {
      title: "Cookies",
      content: "We use localStorage to maintain your session and store preferences locally on your device. We do not use third-party tracking cookies for advertising purposes."
    },
    {
      title: "Third-Party Services",
      content: "We use the following third-party services: Google Gemini AI (question generation and feedback), Cloudinary (file storage), and MongoDB Atlas (database). Each service has its own privacy policy."
    },
    {
      title: "Your Rights",
      content: "You have the right to access, update, or delete your personal information at any time through your profile settings. You may also request account deletion by contacting us at support@interviewbuddy.com."
    },
    {
      title: "Contact Us",
      content: "If you have any questions about this Privacy Policy, please contact us at support@interviewbuddy.com or through our Contact page."
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HomeNavbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#162447] via-[#2d5878] to-[#2fa6a2] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4">Privacy Policy</h1>
          <p className="text-white/80 text-sm">Last updated: May 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 w-full">
        <div className="bg-white rounded-2xl shadow p-6 sm:p-8 space-y-6">
          <p className="text-gray-600 text-sm leading-relaxed border-l-4 border-[#2fb79c] pl-4">
            At Interview Buddy, we take your privacy seriously. This policy explains how we collect,
            use, and protect your personal information when you use our platform.
          </p>

          {sections.map((section, i) => (
            <div key={i}>
              <h2 className="font-bold text-lg text-[#243A6F] mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#d1f0ea] text-[#2fb79c] rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                {section.title}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed pl-8">{section.content}</p>
              {i < sections.length - 1 && <hr className="mt-6 border-gray-100" />}
            </div>
          ))}
        </div>
      </div>

      <HomeFooter />
    </div>
  );
};

export default PrivacyPolicy;