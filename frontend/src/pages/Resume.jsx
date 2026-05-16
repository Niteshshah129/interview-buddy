import React, { useRef, useState, useEffect } from "react";
import {
  Upload, FileText, Trash2, Eye, Sparkles, X,
  CheckCircle, AlertCircle, Lightbulb, Star,
  Target, TrendingUp, Award,
} from "lucide-react";
import API from "../api/api.js";

const Resume = () => {
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analyzingFileName, setAnalyzingFileName] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  const loadResumes = async () => {
    try {
      const res = await API.get("/resume/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResumes(res.data);
    } catch (error) {
      console.log("Load error:", error);
    }
  };

  useEffect(() => {
    if (token) loadResumes();
  }, []);

  const handleClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    uploadResume(file);
    e.target.value = "";
  };

  const uploadResume = async (file) => {
    const formData = new FormData();
    formData.append("resume", file);
    setLoading(true);
    try {
      await API.post("/resume/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Resume Uploaded Successfully");
      loadResumes();
      setSelectedFile(null);
    } catch (error) {
      console.log("Upload error:", error);
      alert("Upload failed");
    }
    setLoading(false);
  };

  const viewResume = (fileUrl, fileName) => {
    const isPdf = fileName.toLowerCase().endsWith(".pdf");
    if (isPdf) {
      const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=false`;
      window.open(googleViewerUrl, "_blank");
    } else {
      window.open(fileUrl, "_blank");
    }
  };

  const deleteResume = async (id) => {
    if (!window.confirm("Want to delete your resume? This will be permanent!")) return;
    setDeleteLoading(id);
    try {
      await API.delete(`/resume/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResumes(resumes.filter((r) => r._id !== id));
      if (analysisResult) setAnalysisResult(null);
    } catch (error) {
      console.log("Delete error:", error);
      alert("Delete failed");
    }
    setDeleteLoading(null);
  };


  const analyzeResume = async (resume) => {
    setAnalyzeLoading(resume._id);
    setAnalyzingFileName(resume.fileName);
    setAnalysisResult(null);
    setShowAnalysis(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY_4;

      const fileResponse = await fetch(resume.fileUrl);
      const blob = await fileResponse.blob();
      const base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.readAsDataURL(blob);
      });

      const prompt = `Analyze this resume and return ONLY valid JSON, no markdown, no extra text:
{"atsScore":75,"overallRating":"Good","summary":"summary here","strongPoints":["p1","p2"],"weakPoints":["p1","p2"],"improvementTips":["t1","t2","t3"],"missingSkills":["s1","s2"],"keywordsFound":["k1","k2","k3"],"experienceLevel":"Junior","topSkills":["s1","s2","s3"]}`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inline_data: {
                      mime_type: "application/pdf",
                      data: base64Data,
                    },
                  },
                  { text: prompt },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 8192,
            },
          }),
        }
      );

      const geminiData = await geminiRes.json();

      if (geminiData.error) {
        throw new Error(geminiData.error.message);
      }

      const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

      let analysis = {};
      try {
        analysis = JSON.parse(rawText);
      } catch {
        try {
          const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
          analysis = JSON.parse(cleaned);
        } catch {
          const match = rawText.match(/\{[\s\S]*\}/);
          if (match) analysis = JSON.parse(match[0]);
        }
      }

      if (!analysis.atsScore) {
        throw new Error("Analysis not parsed correctly");
      }

      setAnalysisResult(analysis);
    } catch (error) {
      console.log("Analyze error:", error);
      alert(`Analysis failed\n${error.message}`);
      setShowAnalysis(false);
    }
    setAnalyzeLoading(null);
  };

  const getAtsColor = (score) => {
    if (score >= 80) return { bg: "bg-green-500" };
    if (score >= 60) return { bg: "bg-blue-500" };
    if (score >= 40) return { bg: "bg-yellow-500" };
    return { bg: "bg-red-500" };
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen w-full overflow-x-hidden">

      {/* Title */}
      <div className="text-center mb-10">
        <div className="bg-[#d1f0ea] inline-flex p-4 rounded-xl mb-4">
          <FileText className="text-[#2fb79c]" size={28} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Resume Upload</h1>
        <p className="text-gray-500 mt-2">
          Upload your resume to get personalized interview preparation
        </p>
      </div>

      {/* Upload Box */}
      <div className="bg-white rounded-xl shadow p-8 max-w-3xl mx-auto">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center">
          <Upload className="mx-auto text-gray-400 mb-4" size={40} />
          <h2 className="text-lg font-semibold">Drop your resume here</h2>
          <p className="text-gray-500 mb-5">or click to browse your files</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx"
          />
          <button
            onClick={handleClick}
            disabled={loading || !token}
            className="bg-[#2fb79c] text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            <Upload size={18} />
            {loading ? "Uploading..." : "Choose File"}
          </button>
          {selectedFile && (
            <p className="mt-4 text-sm text-green-600">Selected: {selectedFile.name}</p>
          )}
          <p className="text-sm text-gray-400 mt-4">Supported formats: PDF DOC DOCX</p>
        </div>
      </div>

      {/* Resume List */}
      <div className="bg-white rounded-xl shadow p-8 max-w-3xl mx-auto mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">Your Resumes</h2>
        <p className="text-gray-500 mb-6 text-center">Manage and analyze your uploaded resume files</p>

        {resumes.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-400">No resumes uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume) => (
              <div key={resume._id} className="border rounded-xl p-4 hover:border-gray-300 hover:bg-gray-50 transition">

                {/* Top - File info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100 p-2.5 rounded-xl shrink-0">
                    <FileText className="text-red-500" size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                      {resume.fileName}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Uploaded: {new Date(resume.uploadedAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Bottom - Buttons */}
                <div className="grid grid-cols-3 gap-2 sm:gap-10">
                  <button
                    onClick={() => viewResume(resume.fileUrl, resume.fileName)}
                    className="text-blue-500 py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-blue-200 transition text-xs sm:text-sm font-medium border border-blue-300"
                  >
                    <Eye size={14} />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => analyzeResume(resume)}
                    disabled={analyzeLoading === resume._id}
                    className=" text-purple-500 py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-purple-300 transition text-xs sm:text-sm font-medium disabled:opacity-50 border border-purple-300"
                  >
                    <Sparkles size={14} />
                    <span>{analyzeLoading === resume._id ? "..." : "AI Analyze"}</span>
                  </button>
                  <button
                    onClick={() => deleteResume(resume._id)}
                    disabled={deleteLoading === resume._id}
                    className="text-red-500 py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-red-100 transition text-xs sm:text-sm font-medium disabled:opacity-50 border border-red-300"
                  >
                    <Trash2 size={14} />
                    <span>{deleteLoading === resume._id ? "..." : "Delete"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Analysis Modal */}
      {showAnalysis && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="flex items-center gap-2">
                <Sparkles className="text-purple-600" size={22} />
                <div>
                  <h2 className="text-xl font-bold">AI Resume Analysis</h2>
                  <p className="text-gray-500 text-sm truncate max-w-xs">{analyzingFileName}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowAnalysis(false); setAnalysisResult(null); }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* Loading */}
              {analyzeLoading && !analysisResult && (
                <div className="flex flex-col items-center py-12 gap-4">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-600 font-medium">Gemini AI analyzing your resume...</p>
                  <p className="text-gray-400 text-sm">This may take 10-15 seconds</p>
                </div>
              )}

              {/* Result */}
              {analysisResult && (
                <>
                  {/* ATS Score */}
                  <div className="flex items-center gap-8 bg-gray-50 rounded-2xl p-6">
                    <div className="flex flex-col items-center">
                      <div className={`w-24 h-24 ${getAtsColor(analysisResult.atsScore).bg} rounded-full flex items-center justify-center shadow-lg`}>
                        <span className="text-3xl font-bold text-white">{analysisResult.atsScore}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-600 mt-2">ATS Score</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Award size={18} className="text-yellow-500" />
                        <span className="font-semibold">{analysisResult.overallRating}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target size={18} className="text-blue-500" />
                        <span>{analysisResult.experienceLevel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp size={18} className="text-green-500" />
                        <span>Detailed Analysis Below</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-xl p-4 border">
                    <p className="text-gray-700 leading-relaxed">{analysisResult.summary}</p>
                  </div>

                  {/* Top Skills */}
                  {analysisResult.topSkills?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Star size={18} className="text-yellow-500" /> Top Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.topSkills.map((skill, i) => (
                          <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Keywords Found */}
                  {analysisResult.keywordsFound?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Target size={18} className="text-green-500" /> Keywords Found
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.keywordsFound.map((kw, i) => (
                          <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strong Points */}
                  {analysisResult.strongPoints?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <CheckCircle size={18} className="text-green-500" /> Strong Points
                      </h3>
                      <div className="space-y-2">
                        {analysisResult.strongPoints.map((point, i) => (
                          <div key={i} className="flex items-start gap-2 bg-green-50 rounded-lg p-3">
                            <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-green-800">{point}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weak Points */}
                  {analysisResult.weakPoints?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <AlertCircle size={18} className="text-red-500" /> Weak Points
                      </h3>
                      <div className="space-y-2">
                        {analysisResult.weakPoints.map((point, i) => (
                          <div key={i} className="flex items-start gap-2 bg-red-50 rounded-lg p-3">
                            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-red-800">{point}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Improvement Tips */}
                  {analysisResult.improvementTips?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Lightbulb size={18} className="text-yellow-500" /> Improvement Tips
                      </h3>
                      <div className="space-y-2">
                        {analysisResult.improvementTips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 bg-yellow-50 rounded-lg p-3">
                            <span className="text-yellow-600 font-bold text-sm shrink-0">{i + 1}.</span>
                            <p className="text-sm text-yellow-800">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills */}
                  {analysisResult.missingSkills?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <AlertCircle size={18} className="text-orange-500" /> Missing Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.missingSkills.map((skill, i) => (
                          <span key={i} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium border border-orange-200">
                            + {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {analysisResult && (
              <div className="sticky bottom-0 bg-white border-t p-4 rounded-b-2xl">
                <button
                  onClick={() => { setShowAnalysis(false); setAnalysisResult(null); }}
                  className="w-full bg-[#243A6F] text-white py-3 rounded-xl font-semibold hover:bg-[#1f3158] transition"
                >
                  Close Analysis
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Resume;