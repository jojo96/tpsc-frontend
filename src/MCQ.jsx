import { useState } from "react"
import { supabase } from "./supabase"

export default function MCQ({ user, onBack }) {
  const [topic, setTopic] = useState("")
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState(0)

  async function generateQuestions() {
    if (!topic.trim()) return
    setLoading(true)
    setQuestions([])
    setAnswers({})
    setSubmitted(false)

    const res = await fetch(`${import.meta.env.VITE_API_URL}/generate-mcq`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, num_questions: 5 }),
    })

    const data = await res.json()
    setQuestions(data.questions)
    setLoading(false)
  }

  function selectAnswer(index, option) {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [index]: option }))
  }

  async function submitAnswers() {
    let correct = 0
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++
    })
    setScore(correct)
    setSubmitted(true)

    await supabase.from("mcq_results").insert({
      user_id: user.id,
      topic,
      score: correct,
      total: questions.length,
    })
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto">

        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1"
        >
          ← Back to chat
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">MCQ Practice</h2>

        {/* Topic input */}
        <div className="flex gap-3 mb-8">
          <input
            type="text"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter a topic e.g. Tripura History, Indian Polity..."
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generateQuestions()}
          />
          <button
            onClick={generateQuestions}
            disabled={loading}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium
              hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        {/* Score banner */}
        {submitted && (
          <div className={`rounded-2xl p-4 mb-6 text-center ${
            score === questions.length ? "bg-green-50 text-green-700" :
            score >= questions.length / 2 ? "bg-yellow-50 text-yellow-700" :
            "bg-red-50 text-red-700"
          }`}>
            <p className="text-2xl font-bold">{score} / {questions.length}</p>
            <p className="text-sm mt-1">
              {score === questions.length ? "Perfect score!" :
               score >= questions.length / 2 ? "Good effort, keep going!" :
               "Keep practising!"}
            </p>
          </div>
        )}

        {/* Questions */}
        {questions.map((q, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
            <p className="font-medium text-gray-800 mb-4">
              {i + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map(option => {
                const isSelected = answers[i] === option
                const isCorrect = option === q.answer
                let style = "border border-gray-200 text-gray-700 hover:bg-gray-50"

                if (submitted) {
                  if (isCorrect) style = "border-2 border-green-500 bg-green-50 text-green-700"
                  else if (isSelected) style = "border-2 border-red-400 bg-red-50 text-red-700"
                } else if (isSelected) {
                  style = "border-2 border-blue-500 bg-blue-50 text-blue-700"
                }

                return (
                  <button
                    key={option}
                    onClick={() => selectAnswer(i, option)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition ${style}`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>

            {submitted && (
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 font-medium mb-1">Explanation</p>
                <p className="text-sm text-gray-600">{q.explanation}</p>
              </div>
            )}
          </div>
        ))}

        {/* Submit button */}
        {questions.length > 0 && !submitted && (
          <button
            onClick={submitAnswers}
            disabled={Object.keys(answers).length < questions.length}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium
              hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Submit answers ({Object.keys(answers).length}/{questions.length} answered)
          </button>
        )}

        {submitted && (
          <button
            onClick={() => {
              setQuestions([])
              setAnswers({})
              setSubmitted(false)
              setTopic("")
            }}
            className="w-full py-3 bg-gray-800 text-white rounded-xl font-medium
              hover:bg-gray-900 transition"
          >
            Try another topic
          </button>
        )}
      </div>
    </div>
  )
}