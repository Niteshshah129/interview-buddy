import { useState, useEffect, useRef } from "react";

export const useInterviewTimer = () => {
    const [totalTime, setTotalTime] = useState(0)
    const [currentQuestionTime, setCurrentQuestionTime] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const intervalRef = useRef(null)

    const start = () => {
        setIsRunning(true)
    }

    const pause = () => {
        setIsRunning(false)
    }

    const resume = () => {
        setIsRunning(true)
    }

    const reset = () => {
        setTotalTime(0)
        setCurrentQuestionTime(0)
        setIsRunning(false)
    }

    const switchQuestion = () => {
        setCurrentQuestionTime(0)
    }

    useEffect(() => {

        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTotalTime(prev => prev + 1)
                setCurrentQuestionTime(prev => prev + 1)
            }, 1000)
        }

        return () => clearInterval(intervalRef.current)

    }, [isRunning])

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`
    }

    return {
        totalTime,
        currentQuestionTime,
        isRunning,
        start,
        pause,
        resume,
        reset,
        switchQuestion,
        formatTime
    }
}