import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight, Sparkles, ArrowLeft } from "lucide-react"
import InterviewTimer from "../../components/interview/InterviewTimer"
import AIFeedbackModal from "../../components/interview/AIFeedbackModal"
import { useInterviewTimer } from "../../hooks/useInterviewTimer"
import API from "../../api/api.js"

const InterviewSession = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [company, setCompany] = useState("")
  const [branch, setBranch] = useState("")
  const [score, setScore] = useState(0)
  const [saving, setSaving] = useState(false)

  const timer = useInterviewTimer()
  const user = JSON.parse(localStorage.getItem("user"))
  const token = user?.token

  useEffect(() => {
    if (location.state?.questions) {
      setQuestions(location.state.questions)
      setCompany(location.state.company || "")
      setBranch(location.state.branch || "")
      timer.start()
    } else {
      navigate("/mock-interview")
    }
  }, [])

  const currentQuestion = questions[currentIndex]

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion._id]: value })
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((prev) => prev + 1)
  }

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1)
  }

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0

  const calculateScore = () => {
    const answeredCount = Object.keys(answers).length
    const avgLength =
      Object.values(answers).reduce((acc, val) => acc + (val?.length || 0), 0) /
      (answeredCount || 1)
    if (avgLength > 200) return 85
    if (avgLength > 100) return 70
    if (avgLength > 50) return 55
    return 34
  }

  const handleGetFeedback = async () => {
    const finalScore = calculateScore()
    setScore(finalScore)

    const answersArray = questions.map((q) => ({
      questionId: q._id,
      questionText: q.question,
      answerText: answers[q._id] || "",
      difficulty: q.difficulty,
    }))

    setSaving(true)
    try {
      await API.post(
        "/interview/save",
        {
          company,
          branch,
          answers: answersArray,
          score: finalScore,
          totalQuestions: questions.length,
          answeredQuestions: Object.keys(answers).length,
          feedback: "",
          duration: timer.totalTime,
          interviewType: "text",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    } catch (err) {
      console.log("Save error:", err)
    }
    setSaving(false)
    setShowModal(true)
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={() => navigate("/mock-interview")}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-gray-800">{company}</p>
          <p className="text-xs text-gray-500">{branch}</p>
        </div>
        <div className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
          {currentIndex + 1}/{questions.length}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* Header - Desktop only */}
        <div className="hidden lg:flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate("/mock-interview")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 text-sm"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <h1 className="text-xl sm:text-2xl font-bold">{company} Interview</h1>
            <p className="text-gray-500 text-sm sm:text-base">{branch}</p>
          </div>
          <div className="text-base sm:text-lg font-semibold bg-white px-4 py-2 rounded-xl shadow">
            Question {currentIndex + 1} of {questions.length}
          </div>
        </div>

        {/* Timer */}
        <InterviewTimer
          totalTime={timer.totalTime}
          currentQuestionTime={timer.currentQuestionTime}
          isRunning={timer.isRunning}
          onPause={timer.pause}
          onResume={timer.resume}
          formatTime={timer.formatTime}
        />

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
          <div className="mb-3 sm:mb-4">
            <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${currentQuestion.difficulty === "Easy" ? "bg-green-100 text-green-600" :
                currentQuestion.difficulty === "Medium" ? "bg-yellow-100 text-yellow-600" :
                  "bg-red-100 text-red-600"
              }`}>
              {currentQuestion.difficulty}
            </span>
          </div>

          <h2 className="text-base sm:text-xl font-semibold mb-4 leading-relaxed">
            {currentQuestion.question}
          </h2>

          <textarea
            value={answers[currentQuestion._id] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Write your answer here..."
            className="w-full h-32 sm:h-40 border rounded-lg p-3 sm:p-4 outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm sm:text-base"
          />

          <p className="text-xs sm:text-sm text-gray-400 mt-2">
            {(answers[currentQuestion._id] || "").length} characters
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pb-6">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="border px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 disabled:opacity-50 hover:bg-gray-50 text-sm sm:text-base"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleGetFeedback}
              disabled={saving}
              className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center gap-1 sm:gap-2 hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
            >
              <Sparkles size={16} />
              {saving ? "Saving..." : (
                <>
                  <span className="hidden sm:inline">Get AI Feedback</span>
                  <span className="sm:hidden">AI Feedback</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 hover:bg-blue-700 text-sm sm:text-base"
            >
              Next
              <ChevronRight size={16} />
            </button>
          )}
        </div>

      </div>

      {/* AI Feedback Modal */}
      <AIFeedbackModal
        open={showModal}
        onClose={() => setShowModal(false)}
        questions={questions}
        answers={answers}
        score={score}
        company={company}
        branch={branch}
      />

    </div>
  )
}

export default InterviewSession