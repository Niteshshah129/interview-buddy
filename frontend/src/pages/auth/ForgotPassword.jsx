import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import API from "../../api/api.js";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChanged, setPasswordChanged] = useState(false);

  // OTP input handle
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  // Step 1 - Send OTP
  const handleSendOTP = async () => {
    if (!email) {
      setError("enter email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/forgot-password/send-otp", { email });
      setSuccess(res.data.message);
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "There was an error sending the OTP.");
    }
    setLoading(false);
  };

  // Step 2 - OTP verify 
  const handleVerifyOTP = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Enter the full 6 digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/forgot-password/verify-otp", {
        email,
        otp: otpString,
      });
      setSuccess(res.data.message);
      setOtpVerified(true);
    } catch (err) {
      setError(err.response?.data?.message || "There was an error verifying the OTP.");
    }
    setLoading(false);
  };

  // Step 3 - Password reset
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/forgot-password/reset-password", {
        email,
        newPassword,
      });
      setSuccess(res.data.message);
      setPasswordChanged(true);
    } catch (err) {
      setError(err.response?.data?.message || "There was an error resetting the password.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#162447] via-[#2d5878] to-[#2fa6a2] flex flex-col items-center justify-center p-4">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#1EB79C] p-2 rounded-full shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Interview <span className="text-[#1EB79C]">Buddy</span>
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        {/* Password Changed Success */}
        {passwordChanged ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            </div>
            <h2 className="text-2xl font-bold mb-2">Password reset!</h2>
            <p className="text-gray-500 mb-6">
              Your password has been successfully changed. Please login.
            </p>
            <Link
              to="/login"
              className="w-full bg-[#243b6b] text-white py-3 rounded-lg font-semibold hover:bg-[#1f3158] transition block text-center"
            >
              Login
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6">
              <Link to="/login" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 text-sm">
                <ArrowLeft size={16} /> Back to Login
              </Link>
              <h2 className="text-2xl font-bold">Forgot Password?</h2>
              <p className="text-gray-500 text-sm mt-1">
                {!otpSent
                  ? "Enter your email — we'll send you an OTP"
                  : !otpVerified
                    ? `OTP sent to: ${email}`
                    : "Set your new password"}
              </p>
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center mb-6">
              {["Email", "OTP", "Password"].map((step, i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 && !otpSent ? "bg-[#243b6b] text-white" :
                      i === 0 && otpSent ? "bg-green-500 text-white" :
                        i === 1 && otpSent && !otpVerified ? "bg-[#243b6b] text-white" :
                          i === 1 && otpVerified ? "bg-green-500 text-white" :
                            i === 2 && otpVerified ? "bg-[#243b6b] text-white" :
                              "bg-gray-200 text-gray-500"
                    }`}>
                    {(i === 0 && otpSent) || (i === 1 && otpVerified) ? "✓" : i + 1}
                  </div>
                  <span className="text-xs text-gray-500 ml-1 mr-2">{step}</span>
                  {i < 2 && <div className={`flex-1 h-0.5 mr-2 ${(i === 0 && otpSent) || (i === 1 && otpVerified) ? "bg-green-500" : "bg-gray-200"
                    }`} style={{ width: "30px" }} />}
                </div>
              ))}
            </div>

            {/* Error / Success */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}
            {success && !error && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">
                {success}
              </div>
            )}

            {/* Step 1 - Email */}
            {!otpSent && (
              <div>
                <label className="flex items-center gap-2 mb-2 font-medium text-sm">
                  <Mail size={15} /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                  className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#243b6b] mb-4"
                  placeholder="you@email.com"
                />
                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full bg-[#243b6b] text-white py-3 rounded-xl font-semibold hover:bg-[#1f3158] disabled:opacity-50 transition"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>
            )}

            {/* Step 2 - OTP */}
            {otpSent && !otpVerified && (
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  Enter the 6-digit OTP sent to your email
                </p>
                <div className="flex gap-2 justify-center mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-bold border-2 rounded-xl outline-none focus:ring-2 focus:ring-[#243b6b] focus:border-[#243b6b]"
                    />
                  ))}
                </div>
                <button
                  onClick={handleVerifyOTP}
                  disabled={loading}
                  className="w-full bg-[#243b6b] text-white py-3 rounded-xl font-semibold hover:bg-[#1f3158] disabled:opacity-50 transition mb-3"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
                <button
                  onClick={() => { setOtpSent(false); setOtp(["", "", "", "", "", ""]); setError(""); setSuccess(""); }}
                  className="w-full text-gray-500 text-sm hover:text-gray-700 transition"
                >
                  Wrong email? Go back
                </button>
              </div>
            )}

            {otpVerified && (
              <div>
                <div className="mb-4">
                  <label className="font-medium text-sm mb-2 block">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#243b6b]"
                    placeholder="Min 6 characters"
                  />
                </div>
                <div className="mb-6">
                  <label className="font-medium text-sm mb-2 block">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#243b6b] ${confirmPassword && newPassword !== confirmPassword ? "border-red-400 bg-red-50" :
                        confirmPassword && newPassword === confirmPassword ? "border-green-400 bg-green-50" : ""
                      }`}
                    placeholder="Confirm your password"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                  )}
                  {confirmPassword && newPassword === confirmPassword && (
                    <p className="text-green-500 text-xs mt-1">Passwords match</p>
                  )}
                </div>
                <button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="w-full bg-[#243b6b] text-white py-3 rounded-xl font-semibold hover:bg-[#1f3158] disabled:opacity-50 transition"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;