import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Map, Trash2, Clock, TrendingUp, ChevronRight, Search } from "lucide-react";
import API from "../../api/api.js";

const RoadmapHistory = () => {
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("All");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const res = await API.get("/roadmap/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoadmaps(res.data);
    } catch (err) {
      console.log("Fetch roadmaps error:", err);
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
      setRoadmaps(roadmaps.filter((r) => r._id !== id));
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 70) return { bar: "bg-green-500", badge: "bg-green-100 text-green-600" };
    if (progress >= 40) return { bar: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-600" };
    return { bar: "bg-blue-500", badge: "bg-blue-100 text-blue-600" };
  };

  const filteredRoadmaps = roadmaps.filter((r) => {
    const matchSearch =
      r.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.jobRole.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLevel = filterLevel === "All" || r.experienceLevel === filterLevel;
    return matchSearch && matchLevel;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 mt-12 lg:mt-0">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Roadmap History</h1>
          <p className="text-gray-500 text-sm">All your generated interview roadmaps</p>
        </div>
        <button
          onClick={() => navigate("/roadmap")}
          className="bg-[#243A6F] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#1f3158] transition flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Map size={16} /> Generate New Roadmap
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#243A6F] text-sm"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Fresher", "Experienced"].map((level) => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition ${filterLevel === level
                  ? "bg-[#243A6F] text-white"
                  : "bg-white border text-gray-600 hover:bg-gray-50"
                }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Total Roadmaps", value: roadmaps.length, color: "bg-blue-50 text-blue-600" },
          { label: "Fresher", value: roadmaps.filter(r => r.experienceLevel === "Fresher").length, color: "bg-green-50 text-green-600" },
          { label: "Experienced", value: roadmaps.filter(r => r.experienceLevel === "Experienced").length, color: "bg-purple-50 text-purple-600" },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} rounded-xl p-3 sm:p-4 text-center`}>
            <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
            <p className="text-xs sm:text-sm font-medium mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Roadmaps List */}
      <div className="bg-white rounded-2xl shadow p-5 sm:p-6">

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredRoadmaps.length === 0 ? (
          <div className="text-center py-12">
            <Map className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 font-medium">
              {searchTerm || filterLevel !== "All" ? "No roadmaps found" : "No roadmaps yet"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm || filterLevel !== "All"
                ? "Try different search or filter"
                : "Generate your first roadmap to get started"}
            </p>
            {!searchTerm && filterLevel === "All" && (
              <button
                onClick={() => navigate("/roadmap")}
                className="mt-4 bg-[#243A6F] text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-[#1f3158] transition"
              >
                Generate Roadmap
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRoadmaps.map((roadmap) => {
              const colors = getProgressColor(roadmap.overallProgress);
              return (
                <div
                  key={roadmap._id}
                  onClick={() => navigate(`/roadmap/${roadmap._id}`)}
                  className="border rounded-xl p-4 hover:border-[#2fb79c] hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">

                      {/* Title + Badge */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-bold text-gray-800 text-sm sm:text-base">
                          {roadmap.company}
                        </h3>
                        <span className="text-gray-400 text-sm">•</span>
                        <span className="text-gray-600 text-sm">{roadmap.jobRole}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roadmap.experienceLevel === "Fresher"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-purple-100 text-purple-600"
                          }`}>
                          {roadmap.experienceLevel}
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-2 ${colors.bar} rounded-full transition-all`}
                            style={{ width: `${roadmap.overallProgress}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                          {roadmap.overallProgress}%
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(roadmap.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <TrendingUp size={11} />
                          {roadmap.totalWeeks} weeks
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleDelete(roadmap._id, e)}
                        className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapHistory;