import { useState } from "react";
import HomeNavbar from "../components/HomeNavbar";
import HomeFooter from "../components/HomeFooter";
import { Mail, Phone, MessageSquare, Send, CheckCircle } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submit
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HomeNavbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#162447] via-[#2d5878] to-[#2fa6a2] text-white py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4">Contact Us</h1>
          <p className="text-white/80 text-sm sm:text-lg">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {[
            { icon: <Mail size={24} className="text-[#2fb79c]" />, title: "Email", value: "support@interviewbuddy.com", bg: "bg-green-50" },
            { icon: <Phone size={24} className="text-blue-500" />, title: "Phone", value: "+91 XXXXX XXXXX", bg: "bg-blue-50" },
            { icon: <MessageSquare size={24} className="text-purple-500" />, title: "Live Chat", value: "Available 9am - 6pm IST", bg: "bg-purple-50" },
          ].map((item, i) => (
            <div key={i} className={`${item.bg} rounded-2xl p-5 text-center`}>
              <div className="flex justify-center mb-3">{item.icon}</div>
              <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow p-6 sm:p-8 max-w-2xl mx-auto">
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
              <p className="text-gray-500 text-sm">
                Thank you for reaching out. We'll get back to you within 24 hours.
              </p>
              <button
                onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", subject: "", message: "" }); }}
                className="mt-6 bg-[#243A6F] text-white px-6 py-2 rounded-xl text-sm font-semibold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                    <input
                      type="text" name="name" value={formData.name} onChange={handleChange}
                      placeholder="John Doe" required
                      className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#243A6F]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                    <input
                      type="email" name="email" value={formData.email} onChange={handleChange}
                      placeholder="you@example.com" required
                      className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#243A6F]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Subject</label>
                  <input
                    type="text" name="subject" value={formData.subject} onChange={handleChange}
                    placeholder="How can we help?" required
                    className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#243A6F]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Message</label>
                  <textarea
                    name="message" value={formData.message} onChange={handleChange}
                    placeholder="Write your message here..." required rows={5}
                    className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#243A6F] resize-none"
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className="w-full bg-[#243A6F] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#1f3158] disabled:opacity-50 transition"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                  ) : (
                    <><Send size={16} /> Send Message</>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <HomeFooter />
    </div>
  );
};

export default Contact;