import { useState, useEffect, useRef } from "react"
import { supabase } from "./supabase"

const TIME_PER_QUESTION = 30

export default function DailyTrivia({ user, onBack }) {
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [alreadyPlayed, setAlreadyPlayed] = useState(null)
  const [date, setDate] = useState("")
  const timerRef = useRef(null)

  useEffect(() => {
    checkAndLoad()
    return () => clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    if (questions.length > 0 && !submitted) {
      startTimer()
    }
    return () => clearInterval(timerRef.current)
  }, [current, questions])

  async function checkAndLoad() {
    const today = new Date().toISOString().split("T")[0]

    // Check if already played today
    const { data: attempt } = await supabase
      .from("trivia_attempts")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .single()

    if (attempt) {
      setAlreadyPlayed(attempt)
      setLoading(false)
      return
    }

    // Fetch questions
    const res = await fetch("http://127.0.0.1:8000/daily-trivia")
    const data = await res.json()
    setQuestions(data.questions)
    setDate(data.date)
    setLoading(false)
  }

  function startTimer() {
    clearInterval(timerRef.current)
    setTimeLeft(TIME_PER_QUESTION)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleNext()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function selectAnswer(option) {
    if (answers[current] !== undefined) return
    setAnswers(prev => ({ ...prev, [current]: option }))
    clearInterval(timerRef.current)
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      finishQuiz()
    } else {
      setCurrent(c => c + 1)
    }
  }

  async function finishQuiz() {
    clearInterval(timerRef.current)
    let correct = 0
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++
    })
    setScore(correct)
    setSubmitted(true)

    const today = new Date().toISOString().split("T")[0]
    await supabase.from("trivia_attempts").insert({
      user_id: user.id,
      date: today,
      score: correct,
      total: questions.length,
    })
  }

  const timerPercent = (timeLeft / TIME_PER_QUESTION) * 100
  const timerColor = timeLeft > 15 ? "bg-green-500" : timeLeft > 8 ? "bg-yellow-500" : "bg-red-500"

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-400 text-sm">Loading today's trivia...</p>
    </div>
  )

  if (alreadyPlayed) return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="text-5xl mb-4">✅</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Already played today!</h3>
      <p className="text-gray-400 mb-4">You scored {alreadyPlayed.score}/{alreadyPlayed.total} today</p>
      <p className="text-gray-300 text-sm mb-8">Come back tomorrow for new questions</p>
      <button onClick={onBack} className="px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition">
        Back to chat
      </button>
    </div>
  )

  if (submitted) return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="text-5xl mb-4">
        {score === questions.length ? "🏆" : score >= 3 ? "🎯" : "📚"}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {score === questions.length ? "Perfect!" : score >= 3 ? "Well done!" : "Keep practising!"}
      </h3>
      <p className="text-4xl font-bold text-blue-600 mb-2">{score}/{questions.length}</p>
      <p className="text-gray-400 text-sm mb-8">Come back tomorrow for new questions</p>

      {/* Review answers */}
      <div className="w-full max-w-lg text-left space-y-3 mb-8">
        {questions.map((q, i) => (
          <div key={i} className={`p-4 rounded-xl border ${
            answers[i] === q.answer ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
          }`}>
            <p className="text-sm font-medium text-gray-800 mb-1">{i+1}. {q.question}</p>
            <p className="text-xs text-green-700">✓ {q.answer}</p>
            {answers[i] && answers[i] !== q.answer && (
              <p className="text-xs text-red-600">✗ Your answer: {answers[i]}</p>
            )}
            {!answers[i] && <p className="text-xs text-gray-400">⏱ Time ran out</p>}
            <p className="text-xs text-gray-500 mt-1">{q.explanation}</p>
          </div>
        ))}
      </div>

      <button onClick={onBack} className="px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition">
        Back to chat
      </button>
    </div>
  )

  if (questions.length === 0) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-gray-400">No questions available today</p>
    </div>
  )

  const q = questions[current]

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">Daily Trivia</p>
            <p className="text-xs text-gray-400">{date}</p>
          </div>
          <p className="text-sm text-gray-400">{current + 1} / {questions.length}</p>
        </div>

        {/* Timer */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Time remaining</span>
            <span className={`font-bold ${timeLeft <= 8 ? "text-red-500" : ""}`}>{timeLeft}s</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${timerColor}`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <p className="font-semibold text-gray-800 text-lg mb-6">{q.question}</p>
          <div className="space-y-3">
            {q.options.map(option => {
              const isSelected = answers[current] === option
              const isCorrect = option === q.answer
              let style = "border border-gray-200 text-gray-700 hover:bg-gray-50"

              if (answers[current] !== undefined) {
                if (isCorrect) style = "border-2 border-green-500 bg-green-50 text-green-700"
                else if (isSelected) style = "border-2 border-red-400 bg-red-50 text-red-700"
              } else if (isSelected) {
                style = "border-2 border-blue-500 bg-blue-50 text-blue-700"
              }

              return (
                <button
                  key={option}
                  onClick={() => selectAnswer(option)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition ${style}`}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {answers[current] !== undefined && (
            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 font-medium mb-1">Explanation</p>
              <p className="text-sm text-gray-600">{q.explanation}</p>
            </div>
          )}
        </div>

        {answers[current] !== undefined && (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
          >
            {current + 1 === questions.length ? "See results" : "Next question →"}
          </button>
        )}
      </div>
    </div>
  )
}