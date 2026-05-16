import { useEffect, useState } from "react"
import { X, Trophy, Target, TrendingUp, Sparkles, CheckCircle, AlertCircle, Loader } from "lucide-react"

const AIFeedbackModal = ({ open, onClose, questions, answers, score, company, branch }) => {
    const [feedback, setFeedback] = useState("")
    const [loading, setLoading] = useState(false)
    const [questionFeedbacks, setQuestionFeedbacks] = useState([])
    const [currentStep, setCurrentStep] = useState("")

    useEffect(() => {
        if (open) {
            generateFeedback()
        }
    }, [open])

    const getScoreLabel = (score) => {
        if (score >= 80) return { label: "Excellent!", color: "text-green-600", bg: "bg-green-500" }
        if (score >= 60) return { label: "Good Job!", color: "text-blue-600", bg: "bg-blue-500" }
        if (score >= 40) return { label: "Keep Practicing", color: "text-yellow-600", bg: "bg-yellow-500" }
        return { label: "Needs Improvement", color: "text-red-600", bg: "bg-red-500" }
    }

    const extractJSON = (text) => {
        try {
            return JSON.parse(text)
        } catch {
            try {
                const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim()
                return JSON.parse(cleaned)
            } catch {
                try {
                    const match = text.match(/\{[\s\S]*\}/)
                    if (match) return JSON.parse(match[0])
                } catch {
                    return null
                }
            }
        }
        return null
    }

    const callGemini = async (prompt) => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.5,
                        maxOutputTokens: 400,
                    },
                }),
            }
        )
        const data = await res.json()
        return data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    }

    const generateFeedback = async () => {
        setLoading(true)
        setFeedback("")
        setQuestionFeedbacks([])

        try {
            const qFeedbacks = []

            for (let i = 0; i < questions.length; i++) {
                const q = questions[i]
                const ans = answers[q._id] || ""
                const hasAnswer = ans.trim().length > 5

                setCurrentStep(`Analyzing question ${i + 1} of ${questions.length}...`)

                if (!hasAnswer) {
                    qFeedbacks.push({
                        score: 0,
                        strength: "You attempted to participate in the interview.",
                        improvement: "Please provide a detailed answer for this question.",
                        idealAnswer: `This question about "${q.question}" requires a structured technical response.`,
                        question: q.question,
                        difficulty: q.difficulty,
                    })
                    continue
                }

                const qPrompt = `You are a senior technical interviewer at ${company} for ${branch} role.

Evaluate this interview response and return ONLY a JSON object. No explanation, no markdown, just raw JSON.

Question: ${q.question}
Difficulty: ${q.difficulty}
Candidate Answer: ${ans}

Return exactly this JSON structure:
{"score":7,"strength":"Candidate demonstrated clear understanding","improvement":"Could add more specific examples","idealAnswer":"The ideal answer should cover the main concept with examples"}`

                try {
                    const rawText = await callGemini(qPrompt)
                    const parsed = extractJSON(rawText)

                    if (parsed && parsed.score !== undefined) {
                        qFeedbacks.push({
                            score: Math.min(10, Math.max(0, Number(parsed.score))),
                            strength: parsed.strength || "Good attempt",
                            improvement: parsed.improvement || "Keep practicing",
                            idealAnswer: parsed.idealAnswer || "Review the topic thoroughly",
                            question: q.question,
                            difficulty: q.difficulty,
                        })
                    } else {
                        const len = ans.trim().length
                        qFeedbacks.push({
                            score: len > 600 ? 10 : len > 500 ? 9 : len > 400 ? 8 : len > 200 ? 7 : len > 150 ? 6 : len > 100 ? 5 : len > 60 ? 4 : len > 30 ? 3 : 1,
                            strength: "You provided an answer for this question.",
                            improvement: "Structure your answer better with examples.",
                            idealAnswer: `For "${q.question}", provide a clear definition with real-world examples.`,
                            question: q.question,
                            difficulty: q.difficulty,
                        })
                    }
                } catch (err) {
                    console.log("Question feedback error:", err)
                    qFeedbacks.push({
                        score: 5,
                        strength: "Answer was provided.",
                        improvement: "Add more technical depth to your answer.",
                        idealAnswer: "Review this topic and practice with more examples.",
                        question: q.question,
                        difficulty: q.difficulty,
                    })
                }
            }

            setQuestionFeedbacks(qFeedbacks)

            setCurrentStep("Generating overall summary...")

            const answeredCount = Object.values(answers).filter(
                (a) => a && a.trim().length > 5
            ).length

            const overallPrompt = `You are an expert technical interviewer at ${company} for ${branch} role.

The candidate scored ${score}% in a mock interview.
They properly answered ${answeredCount} out of ${questions.length} questions.

Write a 3-4 sentence personalized performance summary. Be honest and encouraging.
Mention ${company} and ${branch} role specifically.
Do not use any markdown formatting like asterisks or hashtags.
Just plain text paragraph.`

            const overallText = await callGemini(overallPrompt)
            setFeedback(
                overallText.trim() ||
                `You completed the ${company} ${branch} mock interview with a score of ${score}%. Keep practicing to improve your performance!`
            )

        } catch (error) {
            console.error("Gemini error:", error)
            setFeedback("Could not generate feedback. Check your internet connection and try again.")
        }

        setCurrentStep("")
        setLoading(false)
    }

    if (!open) return null

    const scoreInfo = getScoreLabel(score)




    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white rounded-t-2xl z-10">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-blue-600" size={22} />
                        <div>
                            <h2 className="text-xl font-bold">AI Interview Feedback</h2>
                            <p className="text-gray-500 text-sm">
                                Personalized analysis of your interview performance
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-thin" style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}>

                    {/* Score Section */}
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col items-center">
                            <div className={`w-24 h-24 ${scoreInfo.bg} rounded-full flex items-center justify-center shadow-lg`}>
                                <span className="text-3xl font-bold text-white">{score}</span>
                            </div>
                            <span className={`mt-2 font-semibold ${scoreInfo.color}`}>
                                {scoreInfo.label}
                            </span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-700">
                                <Trophy size={18} className="text-yellow-500" />
                                <span>Overall Performance</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                                <Target size={18} className="text-blue-500" />
                                <span>Detailed Analysis Below</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                                <TrendingUp size={18} className="text-green-500" />
                                <span>Actionable Improvements</span>
                            </div>
                        </div>
                    </div>

                    {/* Overall Feedback Box */}
                    <div className="bg-gray-50 rounded-xl p-4 border">
                        {loading ? (
                            <div className="flex flex-col items-center py-6 gap-3">
                                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-gray-600 font-medium">
                                    Gemini AI analyzing your responses...
                                </p>
                                {currentStep && (
                                    <p className="text-gray-400 text-sm">{currentStep}</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-700 leading-relaxed">{feedback}</p>
                        )}
                    </div>

                    {/* Per Question Feedback */}
                    {!loading && questionFeedbacks.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg border-b pb-2">
                                Question-wise Feedback
                            </h3>

                            {questionFeedbacks.map((qf, index) => (
                                <div key={index} className="border rounded-xl p-4 space-y-3">

                                    {/* Question Header */}
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                                            <span className="text-gray-400 mr-1">Q{index + 1}.</span>
                                            {qf.question}
                                        </p>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <span className={`px-2 py-1 rounded-full text-sm font-bold ${qf.score >= 8 ? "bg-green-100 text-green-700" :
                                                qf.score >= 5 ? "bg-yellow-100 text-yellow-700" :
                                                    "bg-red-100 text-red-700"
                                                }`}>
                                                {qf.score}/10
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${qf.difficulty === "Easy" ? "bg-green-50 text-green-600" :
                                                qf.difficulty === "Medium" ? "bg-yellow-50 text-yellow-600" :
                                                    "bg-red-50 text-red-600"
                                                }`}>
                                                {qf.difficulty}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Strength */}
                                    <div className="flex items-start gap-2 bg-green-50 rounded-lg p-3">
                                        <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs font-semibold text-green-700 mb-0.5">
                                                ✔️Strength
                                            </p>
                                            <p className="text-sm text-green-800">{qf.strength}</p>
                                        </div>
                                    </div>

                                    {/* Improvement */}
                                    <div className="flex items-start gap-2 bg-red-50 rounded-lg p-3">
                                        <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs font-semibold text-red-700 mb-0.5">
                                                ⚠️ Improvement
                                            </p>
                                            <p className="text-sm text-red-800">{qf.improvement}</p>
                                        </div>
                                    </div>

                                    {/* Ideal Answer */}
                                    <div className="bg-blue-50 rounded-lg p-3">
                                        <p className="text-xs font-semibold text-blue-700 mb-0.5">
                                            💡 Ideal Answer
                                        </p>
                                        <p className="text-sm text-blue-800 leading-relaxed">
                                            {qf.idealAnswer}
                                        </p>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3 rounded-b-2xl">
                    <button
                        onClick={() => { onClose(); window.location.href = "/mock-interview" }}
                        className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
                    >
                        Try Another Interview
                    </button>
                    <button
                        onClick={() => { onClose(); window.location.href = "/progress" }}
                        className="flex-1 bg-[#243A6F] text-white py-3 rounded-xl font-semibold hover:bg-[#1f3158] transition"
                    >
                        View Progress
                    </button>
                </div>

            </div>
        </div>
    )
}

export default AIFeedbackModal