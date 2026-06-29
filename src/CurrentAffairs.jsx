import { useState } from "react"

export default function CurrentAffairs({ user, onBack }) {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState(0)

  async function fetchCurrentAffairs() {
    setLoading(true)
    setQuestions([])
    setAnswers({})
    setSubmitted(false)

    const res = await fetch(`${import.meta.env.VITE_API_URL}/current-affairs`)
    const data = await res.json()
    setQuestions(data.questions)
    setLoading(false)
  }

  function selectAnswer(index, option) {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [index]: option }))
  }

  function submitAnswers() {
    let correct = 0
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++
    })
    setScore(correct)
    setSubmitted(true)
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

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Current Affairs</h2>
            <p className="text-sm text-gray-400 mt-1">
              Today's news turned into TPSC exam questions
            </p>
          </div>
          <button
            onClick={fetchCurrentAffairs}
            disabled={loading}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium
              hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Fetching news..." : questions.length > 0 ? "Refresh" : "Load today's questions"}
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm">Fetching today's news and generating questions...</p>
            <p className="text-gray-300 text-xs mt-1">This takes about 20-30 seconds</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && questions.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📰</div>
            <p className="text-gray-500">Click "Load today's questions" to get started</p>
          </div>
        )}

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
            {q.source && (
              <p className="text-xs text-blue-400 font-medium mb-2">📰 {q.source}</p>
            )}
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

        {/* Submit */}
        {questions.length > 0 && !submitted && (
          <button
            onClick={submitAnswers}
            disabled={Object.keys(answers).length < questions.length}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium
              hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Submit ({Object.keys(answers).length}/{questions.length} answered)
          </button>
        )}

        {submitted && (
          <button
            onClick={fetchCurrentAffairs}
            className="w-full py-3 bg-gray-800 text-white rounded-xl font-medium
              hover:bg-gray-900 transition"
          >
            Load fresh questions
          </button>
        )}
      </div>
    </div>
  )
}   