import { Play, Pause } from "lucide-react";

const InterviewTimer = ({
    totalTime,
    currentQuestionTime,
    isRunning,
    onPause,
    onResume,
    formatTime
}) => {

    return (

        <div className="bg-white p-4 rounded-xl shadow flex items-center gap-6">
            <div>
                <span className="text-gray-500 text-sm">
                    Total:
                </span>
                <span className="ml-2 font-semibold">
                    {formatTime(totalTime)}
                </span>
            </div>

            <div>
                <span className="text-gray-500 text-sm">
                    This Q:
                </span>
                <span className="ml-2 text-green-600 font-semibold">
                    {formatTime(currentQuestionTime)}
                </span>
            </div>

            <button
                onClick={isRunning ? onPause : onResume}
                className="flex items-center gap-2 text-gray-600"
            >
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
                {isRunning ? "Pause" : "Resume"}
            </button>
        </div>
    )
}

export default InterviewTimer;