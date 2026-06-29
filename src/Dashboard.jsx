import { useState, useEffect } from "react"
import { supabase } from "./supabase"

export default function Dashboard({ user, onBack }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadResults()
  }, [])

  async function loadResults() {
    const { data } = await supabase
      .from("mcq_results")
      .select("*")
      .order("created_at", { ascending: false })
    if (data) setResults(data)
    setLoading(false)
  }

  // Stats
  const totalAttempts = results.length
  const totalCorrect = results.reduce((sum, r) => sum + r.score, 0)
  const totalQuestions = results.reduce((sum, r) => sum + r.total, 0)
  const overallPercent = totalQuestions > 0
    ? Math.round((totalCorrect / totalQuestions) * 100)
    : 0

  // Topic breakdown
  const topicMap = {}
  results.forEach(r => {
    if (!topicMap[r.topic]) topicMap[r.topic] = { correct: 0, total: 0, attempts: 0 }
    topicMap[r.topic].correct += r.score
    topicMap[r.topic].total += r.total
    topicMap[r.topic].attempts += 1
  })

  const topics = Object.entries(topicMap).map(([topic, data]) => ({
    topic,
    percent: Math.round((data.correct / data.total) * 100),
    attempts: data.attempts,
    correct: data.correct,
    total: data.total,
  })).sort((a, b) => a.percent - b.percent)

  const weakTopics = topics.filter(t => t.percent < 60)
  const strongTopics = topics.filter(t => t.percent >= 60)

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto">

        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1"
        >
          ← Back to chat
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Progress</h2>

        {totalAttempts === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-500">No results yet — complete some MCQs first</p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <p className="text-3xl font-bold text-blue-600">{overallPercent}%</p>
                <p className="text-xs text-gray-400 mt-1">Overall score</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <p className="text-3xl font-bold text-gray-800">{totalAttempts}</p>
                <p className="text-xs text-gray-400 mt-1">Quizzes taken</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <p className="text-3xl font-bold text-gray-800">{totalQuestions}</p>
                <p className="text-xs text-gray-400 mt-1">Questions answered</p>
              </div>
            </div>

            {/* Weak topics */}
            {weakTopics.length > 0 && (
              <div className="mb-8">
                <h3 className="text-base font-semibold text-red-500 mb-3">
                  ⚠️ Needs improvement
                </h3>
                <div className="space-y-3">
                  {weakTopics.map(t => (
                    <div key={t.topic} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-700 capitalize">{t.topic}</p>
                        <span className="text-sm font-bold text-red-500">{t.percent}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-red-400 h-2 rounded-full transition-all"
                          style={{ width: `${t.percent}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {t.correct}/{t.total} correct across {t.attempts} attempt{t.attempts > 1 ? "s" : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strong topics */}
            {strongTopics.length > 0 && (
              <div className="mb-8">
                <h3 className="text-base font-semibold text-green-600 mb-3">
                  ✅ Strong topics
                </h3>
                <div className="space-y-3">
                  {strongTopics.map(t => (
                    <div key={t.topic} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-700 capitalize">{t.topic}</p>
                        <span className="text-sm font-bold text-green-600">{t.percent}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-green-400 h-2 rounded-full transition-all"
                          style={{ width: `${t.percent}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {t.correct}/{t.total} correct across {t.attempts} attempt{t.attempts > 1 ? "s" : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent activity */}
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-3">Recent activity</h3>
              <div className="space-y-2">
                {results.slice(0, 10).map(r => (
                  <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4
                    flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-700 capitalize">{r.topic}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-sm font-bold ${
                      r.score / r.total >= 0.6 ? "text-green-600" : "text-red-500"
                    }`}>
                      {r.score}/{r.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}