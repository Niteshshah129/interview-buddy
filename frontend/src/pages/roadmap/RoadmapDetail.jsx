import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopicResource from "./TopicResource";
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Calendar,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Target,
  Lightbulb,
  ExternalLink,
  Trophy,
  Clock,
} from "lucide-react";
import API from "../../api/api.js";

const RoadmapDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRound, setExpandedRound] = useState(null);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [activeTab, setActiveTab] = useState("rounds");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [updatingIndex, setUpdatingIndex] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  useEffect(() => {
    fetchRoadmap();
  }, [id, refreshKey]);

  const fetchRoadmap = async () => {
    try {
      const res = await API.get(`/roadmap/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRoadmap(res.data);
    } catch (err) {
      console.log("Fetch roadmap error:", err);
      navigate("/roadmap");
    }

    setLoading(false);
  };

  const toggleProgress = async (type, index, currentStatus) => {
    setUpdatingIndex(`${type}_${index}`);

    try {
      const res = await API.put(
        `/roadmap/${id}/progress`,
        {
          type, index, completed: !currentStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRoadmap(res.data);
    } catch (err) {
      console.log("Update progress error:", err);
    }
    setUpdatingIndex(null);
  };

  const getProgressColor = (progress) => {
    if (progress >= 70) {
      return {
        text: "text-green-600",
        bg: "bg-green-500",
        light: "bg-green-100",
      };
    }

    if (progress >= 40) {
      return {
        text: "text-yellow-600",
        bg: "bg-yellow-500",
        light: "bg-yellow-100",
      };
    }

    return {
      text: "text-blue-600",
      bg: "bg-blue-500",
      light: "bg-blue-100",
    };
  };

  // Topic Progress
  const getTopicProgress = (topicName) => {
    const key =
      `topic_progress_${topicName}_${roadmap?.company}_${roadmap?.jobRole}`.replace(
        /\s+/g,
        "_"
      );

    const saved = localStorage.getItem(key);

    if (!saved) {
      return {
        theoryDone: false,
        practiceDone: false,
      };
    }

    return JSON.parse(saved);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#2fb79c] border-t-transparent rounded-full animate-spin" />

          <p className="text-gray-500">
            Loading your roadmap...
          </p>
        </div>
      </div>
    );
  }

  if (!roadmap) return null;

  const progressColors = getProgressColor(
    roadmap.overallProgress
  );

  const completedRounds = roadmap.rounds.filter(
    (r) => r.completed
  ).length;

  const completedWeeks = roadmap.weeklyPlan.filter(
    (w) => w.completed
  ).length;

  const totalRounds = roadmap.rounds.length;
  const totalWeeks = roadmap.weeklyPlan.length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 mt-12 lg:mt-0">

      {/* Back Button */}
      <button
        onClick={() => navigate("/roadmap")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm"
      >
        <ArrowLeft size={16} />
        Back to Roadmaps
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow p-5 sm:p-6 mb-6">

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

          <div className="flex-1">

            <div className="flex items-center gap-2 mb-2 flex-wrap">

              <h1 className="text-xl sm:text-2xl font-bold">
                {roadmap.company} - {roadmap.jobRole}
              </h1>

              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${roadmap.experienceLevel === "Fresher"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-purple-100 text-purple-600"
                  }`}
              >
                {roadmap.experienceLevel}
              </span>
            </div>

            <p className="text-gray-500 text-sm leading-relaxed">
              {roadmap.overview}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-3 mt-3">

              <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5">
                <Target
                  size={13}
                  className="text-[#2fb79c]"
                />

                <span className="text-xs font-medium text-gray-600">
                  {completedRounds}/{totalRounds} Rounds
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5">
                <Calendar size={13} className="text-purple-500" />

                <span className="text-xs font-medium text-gray-600">
                  {completedWeeks}/{totalWeeks} Weeks
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5">
                <Clock size={13} className="text-blue-500" />

                <span className="text-xs font-medium text-gray-600">
                  {totalWeeks - completedWeeks} weeks remaining
                </span>
              </div>
            </div>
          </div>

          {/* Progress Circle */}
          <div className="flex flex-col items-center shrink-0">

            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl ${progressColors.light} ${progressColors.text} shadow-inner`}
            >
              {roadmap.overallProgress}%
            </div>

            <p className="text-xs text-gray-500 mt-1 font-medium">
              Overall
            </p>

            {roadmap.overallProgress === 100 && (
              <div className="flex items-center gap-1 mt-1">
                <Trophy size={12} className="text-yellow-500" />

                <span className="text-xs text-yellow-600 font-semibold">
                  Complete!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">

          <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-medium">

            <span>Overall Progress</span>

            <span>
              {roadmap.overallProgress}%
            </span>
          </div>

          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">

            <div
              className={`h-3 ${progressColors.bg} rounded-full transition-all duration-700`}
              style={{
                width: `${roadmap.overallProgress}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">

        <button
          onClick={() => setActiveTab("rounds")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition flex-1 justify-center sm:flex-none sm:justify-start ${activeTab === "rounds"
            ? "bg-[#243A6F] text-white"
            : "bg-white text-gray-600 hover:bg-gray-50 shadow"
            }`}
        >
          <Target size={16} />
          Interview Rounds
        </button>

        <button
          onClick={() => setActiveTab("weekly")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition flex-1 justify-center sm:flex-none sm:justify-start ${activeTab === "weekly"
            ? "bg-[#243A6F] text-white"
            : "bg-white text-gray-600 hover:bg-gray-50 shadow"
            }`}
        >
          <Calendar size={16} />
          Weekly Plan
        </button>
      </div>

      {/* INTERVIEW ROUNDS */}
      {activeTab === "rounds" && (
        <div className="space-y-3">

          {roadmap.rounds.map((round, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow overflow-hidden border-2 transition-all ${round.completed
                ? "border-green-400"
                : "border-transparent"
                }`}
            >

              {/* Header */}
              <div className="p-4 sm:p-5">

                <div className="flex items-center gap-3">

                  {/* Checkbox */}
                  <button
                    onClick={() =>
                      toggleProgress("round", index, round.completed)
                    }
                    disabled={
                      updatingIndex === `round_${index}`
                    }
                    className="shrink-0 transition hover:scale-110"
                  >
                    {updatingIndex === `round_${index}` ? (
                      <div className="w-6 h-6 border-2 border-[#2fb79c] border-t-transparent rounded-full animate-spin" />
                    ) : round.completed ? (
                      <CheckCircle size={24} className="text-green-500" />
                    ) : (
                      <Circle size={24} className="text-gray-300 hover:text-gray-400" />
                    )}
                  </button>

                  {/* Info */}
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setExpandedRound(expandedRound === index ? null : index)
                    }
                  >

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#2fb79c] bg-[#d1f0ea] px-2 py-0.5 rounded-full">
                        Round {round.roundNumber}
                      </span>

                      {round.completed && (
                        <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                          ✓ Prepared
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-800 text-sm sm:text-base mt-1">
                      {round.roundName}
                    </h3>

                    {!expandedRound &&
                      round.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {round.description}
                        </p>
                      )}
                  </div>

                  {/* Arrow */}
                  <button
                    onClick={() =>
                      setExpandedRound(expandedRound === index ? null : index)
                    }
                    className="text-gray-400 hover:text-gray-600 shrink-0"
                  >
                    {expandedRound === index ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Details */}
              {expandedRound === index && (
                <div className="border-t border-gray-100 px-4 sm:px-5 pb-5 space-y-4">

                  {/* Description */}
                  {round.description && (
                    <p className="text-sm text-gray-600 pt-4 leading-relaxed">
                      {round.description}
                    </p>
                  )}

                  {/* Topics */}
                  {round.topics?.length > 0 && (
                    <div>

                      <h4 className="font-semibold text-xs uppercase tracking-wide text-gray-500 flex items-center gap-1.5 mb-2">
                        <BookOpen size={13} className="text-blue-500" />
                        Topics to Cover
                      </h4>

                      <div className="flex flex-wrap gap-2">

                        {round.topics.map(
                          (topic, i) => {
                            const tp = getTopicProgress(topic);
                            const isDone = tp.theoryDone && tp.practiceDone;
                            const isPartial = tp.theoryDone || tp.practiceDone;

                            return (
                              <button key={i} onClick={() => setSelectedTopic(topic)
                              }
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition border flex items-center gap-1.5 ${isDone
                                  ? "bg-green-100 text-green-700 border-green-300"
                                  : isPartial
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-300"
                                    : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                  }`}
                              >
                                {isDone ? (
                                  <CheckCircle size={11} className="text-green-600" />
                                ) : isPartial ? (
                                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                ) : null}

                                {topic}

                                {!isDone && (
                                  <span className="text-blue-400">
                                    →
                                  </span>
                                )}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pro Tips */}
                  {round.tips?.length > 0 && (
                    <div>

                      <h4 className="font-semibold text-xs uppercase tracking-wide text-gray-500 flex items-center gap-1.5 mb-2">

                        <Lightbulb size={13} className="text-yellow-500" />
                        Pro Tips
                      </h4>

                      <div className="space-y-2">

                        {round.tips.map(
                          (tip, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 bg-yellow-50 border border-yellow-100 rounded-xl p-3"
                            >
                              <span className="text-yellow-500 shrink-0 text-sm">
                                💡
                              </span>

                              <p className="text-xs text-yellow-800">
                                {tip}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Resources */}
                  {round.resources?.length > 0 && (
                    <div>

                      <h4 className="font-semibold text-xs uppercase tracking-wide text-gray-500 flex items-center gap-1.5 mb-2">
                        <ExternalLink size={13} className="text-green-500" />
                        Resources
                      </h4>

                      <div className="space-y-1.5">
                        {round.resources.map(
                          (resource, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 bg-green-50 rounded-lg px-3 py-2"
                            >
                              <span className="text-green-500 shrink-0 text-xs mt-0.5">
                                •
                              </span>

                              <p className="text-xs text-gray-600">
                                {resource}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Button */}
                  <button
                    onClick={() => toggleProgress("round", index, round.completed)
                    }
                    disabled={updatingIndex === `round_${index}`
                    }
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm transition ${round.completed
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-[#243A6F] text-white hover:bg-[#1f3158]"
                      }`}
                  >
                    {updatingIndex === `round_${index}` ? "Updating..." : round.completed ? "✓ Marked as Prepared — Click to Undo" : "Mark as Prepared"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* WEEKLY PLAN */}
      {activeTab === "weekly" && (
        <div className="space-y-3">

          {roadmap.weeklyPlan.map(
            (week, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow overflow-hidden border-2 transition-all ${week.completed
                  ? "border-green-400"
                  : "border-transparent"
                  }`}
              >

                {/* Header */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-3">

                    {/* Checkbox */}
                    <button
                      onClick={() => toggleProgress("week", index, week.completed)
                      }
                      disabled={
                        updatingIndex ===
                        `week_${index}`
                      }
                      className="shrink-0 transition hover:scale-110"
                    >
                      {updatingIndex === `week_${index}` ? (
                        <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      ) : week.completed ? (
                        <CheckCircle size={24} className="text-green-500" />
                      ) : (
                        <Circle size={24} className="text-gray-300 hover:text-gray-400" />
                      )}
                    </button>

                    {/* Info */}
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => setExpandedWeek(expandedWeek === index ? null : index)
                      }
                    >

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                          Week {week.week}
                        </span>

                        {week.completed && (
                          <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                            ✓ Done
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-gray-800 text-sm sm:text-base mt-1">
                        {week.title}
                      </h3>
                    </div>

                    {/* Arrow */}
                    <button onClick={() => setExpandedWeek(expandedWeek === index ? null : index)
                    }
                      className="text-gray-400 hover:text-gray-600 shrink-0"
                    >
                      {expandedWeek === index ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Details */}
                {expandedWeek === index && (
                  <div className="border-t border-gray-100 px-4 sm:px-5 pb-5 space-y-4">

                    {/* Topics */}
                    {week.topics?.length > 0 && (
                      <div className="pt-4">
                        <h4 className="font-semibold text-xs uppercase tracking-wide text-gray-500 flex items-center gap-1.5 mb-2">
                          <BookOpen size={13} className="text-blue-500" />
                          Topics This Week
                        </h4>

                        <div className="flex flex-wrap gap-2">
                          {week.topics.map(
                            (
                              topic,
                              i
                            ) => {
                              const tp = getTopicProgress(topic);
                              const isDone = tp.theoryDone && tp.practiceDone;
                              const isPartial = tp.theoryDone || tp.practiceDone;

                              return (
                                <button key={i} onClick={() => setSelectedTopic(topic)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition border flex items-center gap-1.5 ${isDone
                                    ? "bg-green-100 text-green-700 border-green-300"
                                    : isPartial
                                      ? "bg-yellow-50 text-yellow-700 border-yellow-300"
                                      : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                    }`}
                                >
                                  {isDone ? (
                                    <CheckCircle size={11} className="text-green-600" />
                                  ) : isPartial ? (
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                  ) : null}

                                  {topic}

                                  {!isDone && (
                                    <span className="text-blue-400">
                                      →
                                    </span>
                                  )}
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tasks */}
                    {week.tasks?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-xs uppercase tracking-wide text-gray-500 flex items-center gap-1.5 mb-2">
                          <Target size={13} className="text-green-500" />
                          Tasks
                        </h4>

                        <div className="space-y-2">
                          {week.tasks.map(
                            (task, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-xl p-3"
                              >
                                <CheckCircle size={14} className="text-green-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-green-800">
                                  {task}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Resources */}
                    {week.resources?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-xs uppercase tracking-wide text-gray-500 flex items-center gap-1.5 mb-2">
                          <ExternalLink size={13} className="text-purple-500" />
                          Resources
                        </h4>

                        <div className="space-y-1.5">
                          {week.resources.map(
                            (resource, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-2 bg-purple-50 rounded-lg px-3 py-2"
                              >
                                <span className="text-purple-400 shrink-0 text-xs mt-0.5">
                                  •
                                </span>
                                <p className="text-xs text-gray-600"> {resource}</p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Button */}
                    <button
                      onClick={() => toggleProgress("week", index, week.completed)
                      }
                      disabled={
                        updatingIndex === `week_${index}`
                      }
                      className={`w-full py-2.5 rounded-xl font-semibold text-sm transition ${week.completed
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-[#243A6F] text-white hover:bg-[#1f3158]"
                        }`}
                    >
                      {updatingIndex === `week_${index}` ? "Updating..." : week.completed ? "✓ Week Completed — Click to Undo" : "Mark Week as Complete"}
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* Topic Modal */}
      {selectedTopic && (
        <TopicResource
          topic={selectedTopic}
          company={roadmap.company}
          jobRole={roadmap.jobRole}
          onClose={() => {
            setSelectedTopic(null);
            setRefreshKey(
              (prev) => prev + 1
            );
          }}
        />
      )}
    </div>
  );
};

export default RoadmapDetail;