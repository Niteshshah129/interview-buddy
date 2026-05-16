import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Map,
  Building2,
  Briefcase,
  User,
  ChevronRight,
  Trash2,
  Clock,
  TrendingUp
} from "lucide-react";
import API from "../../api/api.js";

const Roadmap = () => {
  const navigate = useNavigate();

  const [experienceLevel, setExperienceLevel] = useState("");
  const [company, setCompany] = useState("");
  const [customCompany, setCustomCompany] = useState("");

  const [jobRole, setJobRole] = useState("");
  const [customJobRole, setCustomJobRole] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [myRoadmaps, setMyRoadmaps] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  const companies = [
    "Google",
    "Amazon",
    "Microsoft",
    "TCS",
    "Infosys",
    "Flipkart",
    "Wipro",
    "HCL",
    "Other"
  ];

  const jobRoles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Java Developer",
    "Python Developer",
    "Data Scientist",
    "DevOps Engineer",
    "Android Developer",
    "iOS Developer",
    "Other"
  ];

  useEffect(() => {
    fetchMyRoadmaps();
  }, []);

  const fetchMyRoadmaps = async () => {
    try {
      const res = await API.get("/roadmap/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMyRoadmaps(res.data);
    } catch (err) {
      console.log("Fetch roadmaps error:", err);
    }

    setLoadingHistory(false);
  };

  const handleGenerate = async () => {
    const finalCompany =
      company === "Other" ? customCompany.trim() : company;

    const finalJobRole =
      jobRole === "Other" ? customJobRole.trim() : jobRole;

    if (!experienceLevel || !finalCompany || !finalJobRole) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.post(
        "/roadmap/generate",
        {
          experienceLevel,
          company: finalCompany,
          jobRole: finalJobRole,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate(`/roadmap/${res.data._id}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to generate roadmap. Please try again."
      );
    }

    setLoading(false);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();

    if (!window.confirm("Delete this roadmap?")) return;

    try {
      await API.delete(`/roadmap/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMyRoadmaps(myRoadmaps.filter((r) => r._id !== id));
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 70) return "bg-green-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 mt-12 lg:mt-0">

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#d1f0ea] p-3 rounded-xl">
            <Map className="text-[#2fb79c]" size={24} />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              Interview Roadmap
            </h1>

            <p className="text-gray-500 text-sm">
              Get a personalized preparation roadmap powered by AI
            </p>
          </div>
        </div>
      </div>

      {/* Generate Form */}
      <div className="bg-white rounded-2xl shadow p-5 sm:p-8 mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-1">
          Generate Your Roadmap
        </h2>

        <p className="text-gray-500 text-sm mb-6">
          AI will create a personalized preparation plan with interview rounds and weekly schedule
        </p>

        {/* Experience Level */}
        <div className="mb-5">
          <label className="flex items-center gap-2 font-medium text-sm sm:text-base mb-3">
            <User size={16} />
            Experience Level
          </label>

          <div className="grid grid-cols-2 gap-3">
            {["Fresher", "Experienced"].map((level) => (
              <button
                key={level}
                onClick={() => setExperienceLevel(level)}
                className={`p-4 rounded-xl border-2 text-left transition ${experienceLevel === level
                  ? "border-[#2fb79c] bg-[#d1f0ea]"
                  : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <p className="font-semibold text-sm sm:text-base">
                  {level}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {level === "Fresher"
                    ? "0-1 years • 12 week plan"
                    : "1+ years • 8 week plan"}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Company */}
        <div className="mb-5">
          <label className="flex items-center gap-2 font-medium text-sm sm:text-base mb-2">
            <Building2 size={16} />
            Target Company
          </label>

          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#2fb79c] text-sm sm:text-base"
          >
            <option value="">Select company...</option>

            {companies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Custom Company Input */}
          {company === "Other" && (
            <input
              type="text"
              placeholder="Enter company name"
              value={customCompany}
              onChange={(e) => setCustomCompany(e.target.value)}
              className="w-full border rounded-xl p-3 mt-3 outline-none focus:ring-2 focus:ring-[#2fb79c] text-sm sm:text-base"
            />
          )}
        </div>

        {/* Job Role */}
        <div className="mb-6">
          <label className="flex items-center gap-2 font-medium text-sm sm:text-base mb-2">
            <Briefcase size={16} />
            Job Role
          </label>

          <select
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#2fb79c] text-sm sm:text-base"
          >
            <option value="">Select job role...</option>

            {jobRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* Custom Job Role Input */}
          {jobRole === "Other" && (
            <input
              type="text"
              placeholder="Enter job role"
              value={customJobRole}
              onChange={(e) => setCustomJobRole(e.target.value)}
              className="w-full border rounded-xl p-3 mt-3 outline-none focus:ring-2 focus:ring-[#2fb79c] text-sm sm:text-base"
            />
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-[#243A6F] text-white py-3 sm:py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#1f3158] disabled:opacity-50 transition text-sm sm:text-base"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              AI is generating your roadmap...
            </>
          ) : (
            <>
              Generate My Roadmap
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>

      {/* My Roadmaps History */}
      <div className="bg-white rounded-2xl shadow p-5 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-1">
          My Roadmaps
        </h2>

        <p className="text-gray-500 text-sm mb-6">
          Your previously generated roadmaps
        </p>

        {loadingHistory ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : myRoadmaps.length === 0 ? (
          <div className="text-center py-8">
            <Map className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-400 text-sm">
              No roadmaps generated yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myRoadmaps.map((roadmap) => (
              <div
                key={roadmap._id}
                onClick={() => navigate(`/roadmap/${roadmap._id}`)}
                className="border rounded-xl p-4 hover:border-[#2fb79c] hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex justify-between items-start">

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                        {roadmap.company} - {roadmap.jobRole}
                      </h3>

                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${roadmap.experienceLevel === "Fresher"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-purple-100 text-purple-600"
                          }`}
                      >
                        {roadmap.experienceLevel}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-2 ${getProgressColor(
                            roadmap.overallProgress
                          )} rounded-full transition-all`}
                          style={{
                            width: `${roadmap.overallProgress}%`,
                          }}
                        />
                      </div>

                      <span className="text-xs font-semibold text-gray-600 shrink-0">
                        {roadmap.overallProgress}%
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(roadmap.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>

                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <TrendingUp size={12} />
                        {roadmap.totalWeeks} weeks
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(roadmap._id, e)}
                    className="ml-3 text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Roadmap;