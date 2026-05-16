import { useState, useEffect, useRef } from "react";
import { User, Mail, GraduationCap, Save, Lock, Eye, EyeOff, Plus, X, Camera, Trash2 } from "lucide-react";
import API from "../../api/api.js";

const Profile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState("");
  const [customBranch, setCustomBranch] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [memberSince, setMemberSince] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const avatarInputRef = useRef();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  const predefinedBranches = [
    "Computer Science",
    "Information Technology",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Electronics & Communication",
    "Civil Engineering",
    "Artificial Intelligence",
    "Data Science",
    "Cyber Security",
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        setName(data.name || "");
        setEmail(data.email || "");

        if (data.branch && !predefinedBranches.includes(data.branch)) {
          setBranch("Other");
          setCustomBranch(data.branch);
        } else {
          setBranch(data.branch || "");
        }

        setSkills(data.skills || []);
        setAvatar(data.avatar || "");
        setMemberSince(
          new Date(data.createdAt).toLocaleDateString("en-IN", {
            year: "numeric", month: "long", day: "numeric",
          })
        );
        setLastUpdated(
          new Date(data.updatedAt).toLocaleDateString("en-IN", {
            year: "numeric", month: "long", day: "numeric",
          })
        );
      } catch (err) {
        console.log("Profile load error:", err);
        setError("Profile not loading, please refresh the page");
      }
    };
    if (token) fetchProfile();
  }, []);

  const handleAvatarClick = () => {
    avatarInputRef.current.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be smaller than 2mb");
      return;
    }

    setAvatarLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await API.put("/auth/profile/avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setAvatar(res.data.avatar);

      const updatedUser = { ...user, avatar: res.data.avatar };
      localStorage.setItem("user", JSON.stringify(updatedUser));


      window.dispatchEvent(new Event("profileUpdated"));

      setSuccess("Avatar updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.log("Avatar upload error:", err);
      setError("Avatar not uploaded, try again");
    }
    setAvatarLoading(false);
    e.target.value = "";
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm("Want to remove your avatar?")) return;
    setAvatarLoading(true);
    setError("");
    try {
      const res = await API.put(
        "/auth/profile",
        { name, branch, skills, avatar: "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAvatar("");

      const updatedUser = { ...user, avatar: "" };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      window.dispatchEvent(new Event("profileUpdated"));

      setSuccess("Avatar removed!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.log("Avatar remove error:", err);
      setError("Avatar not removed, try again");
    }
    setAvatarLoading(false);
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      setError("This skill is already there");
      return;
    }
    if (skills.length >= 20) {
      setError("Maximum 20 skills allowed");
      return;
    }
    setSkills([...skills, trimmed]);
    setSkillInput("");
    setError("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (password && password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const finalBranch = branch === "Other" ? customBranch.trim() : branch;

    if (branch === "Other" && !customBranch.trim()) {
      setError("Please enter your branch/field of study");
      return;
    }

    setLoading(true);
    try {
      const updateData = { name, branch: finalBranch, skills };
      if (password) updateData.password = password;

      const res = await API.put("/auth/profile", updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedUser = { ...user, name: res.data.name, token: res.data.token };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      localStorage.setItem("userProfile", JSON.stringify({
        name: res.data.name,
        email,
        branch: finalBranch,
        skills,
        avatar,
      }));

      window.dispatchEvent(new Event("profileUpdated"));

      setPassword("");
      setConfirmPassword("");
      setLastUpdated(
        new Date().toLocaleDateString("en-IN", {
          year: "numeric", month: "long", day: "numeric",
        })
      );
      setSuccess("Profile successfully updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.log("Profile update error:", err);
      setError("Profile not updated, please try again");
    }
    setLoading(false);
  };

  const firstLetter = name ? name.charAt(0).toUpperCase() : "";

  return (

    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen mt-12 lg:mt-0 space-y-6 max-w-4xl m-auto">
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen w-full overflow-x-hidden space-y-6">

        <div className="flex flex-col items-center pt-4">
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-[#243A6F] flex items-center justify-center shadow-xl border-4 border-white">
              {avatarLoading ? (
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : avatar ? (
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-white">{firstLetter}</span>
              )}
            </div>

            {/* Camera Button */}
            <button
              onClick={handleAvatarClick}
              className="absolute bottom-1 right-1 bg-[#1EB79C] text-white p-2 rounded-full shadow-lg hover:bg-[#159a82] transition border-2 border-white"
            >
              <Camera size={14} />
            </button>

            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarChange}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
            />
          </div>

          {/* Name + Remove Avatar */}
          <h1 className="text-2xl font-bold mt-3">{name || "Your Name"}</h1>
          <p className="text-gray-500 text-sm">Manage your account settings and preferences</p>

          {avatar && (
            <button
              onClick={handleRemoveAvatar}
              className="mt-2 flex items-center gap-1 text-red-500 text-sm hover:text-red-600 transition"
            >
              <Trash2 size={14} />
              Remove
            </button>
          )}
        </div>

        {/* Success / Error */}
        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg text-center font-medium">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {/* Personal Info */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-1">Personal Information</h2>
          <p className="text-gray-500 text-sm mb-5">Update your personal details</p>

          {/* Name */}
          <div className="mb-4">
            <label className="flex items-center gap-2 mb-2 font-medium text-sm">
              <User size={15} /> Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#243A6F]"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="flex items-center gap-2 mb-2 font-medium text-sm">
              <Mail size={15} /> Email Address
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full border rounded-xl p-3 bg-gray-100 cursor-not-allowed text-gray-500"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          {/* Branch */}
          <div className="mb-2">
            <label className="flex items-center gap-2 mb-2 font-medium text-sm">
              <GraduationCap size={15} /> Branch / Field of Study
            </label>
            <select
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value);
                if (e.target.value !== "Other") setCustomBranch("");
              }}
              className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#243A6F]"
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

            {branch === "Other" && (
              <input
                type="text"
                value={customBranch}
                onChange={(e) => setCustomBranch(e.target.value)}
                placeholder="Enter your branch / field of study"
                className="w-full border rounded-xl p-3 mt-3 outline-none focus:ring-2 focus:ring-[#243A6F]"
              />
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-1">Skills</h2>
          <p className="text-gray-500 text-sm mb-5">Add your technical skills (max 20)</p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              placeholder="e.g. React, Python, MongoDB..."
              className="flex-1 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#243A6F]"
            />
            <button
              onClick={handleAddSkill}
              className="bg-[#243A6F] text-white px-4 py-2 rounded-xl flex items-center gap-1 hover:bg-[#1f3158] transition"
            >
              <Plus size={18} /> Add
            </button>
          </div>

          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span key={index} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full text-sm font-medium">
                  {skill}
                  <button onClick={() => handleRemoveSkill(skill)} className="text-blue-400 hover:text-red-500 transition">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-4 border-2 border-dashed rounded-xl">
              No skills – add them on top
            </p>
          )}
        </div>

        {/* Password */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-1">Change Password</h2>
          <p className="text-gray-500 text-sm mb-5">
            Leave blank if you don't want to change your password.
          </p>

          <div className="mb-4">
            <label className="flex items-center gap-2 mb-2 font-medium text-sm">
              <Lock size={15} /> New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-xl p-3 pr-12 outline-none focus:ring-2 focus:ring-[#243A6F]"
                placeholder="Min 6 characters"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="mb-2">
            <label className="flex items-center gap-2 mb-2 font-medium text-sm">
              <Lock size={15} /> Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full border rounded-xl p-3 pr-12 outline-none focus:ring-2 focus:ring-[#243A6F] ${confirmPassword && password !== confirmPassword ? "border-red-400 bg-red-50" :
                  confirmPassword && password === confirmPassword ? "border-green-400 bg-green-50" : ""
                  }`}
                placeholder="Confirm new password"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-xs mt-1">Passwords don't match</p>
            )}
            {confirmPassword && password === confirmPassword && (
              <p className="text-green-500 text-xs mt-1">Passwords are matching</p>
            )}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-[#243A6F] text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-lg hover:bg-[#1f3158] disabled:opacity-50 transition shadow-lg"
        >
          <Save size={20} />
          {loading ? "Saving..." : "Save All Changes"}
        </button>

        {/* Account Info */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold mb-4">Account Information</h3>
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Member since</span>
            <span className="font-medium">{memberSince || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Last updated</span>
            <span className="font-medium">{lastUpdated || "—"}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;