import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import Auth from "./Auth"
import MCQ from "./MCQ"
import CurrentAffairs from "./CurrentAffairs"
import Dashboard from "./Dashboard"
import Flashcards from "./Flashcards"
import DailyTrivia from "./DailyTrivia"
import DocChat from "./DocChat"

export default function App() {
  const [user, setUser] = useState(null)
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [selected, setSelected] = useState(null)
  const [mode, setMode] = useState("chat")

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
  }, [])

  useEffect(() => {
    if (user) loadHistory()
  }, [user])

  async function loadHistory() {
    const { data } = await supabase
      .from("chats")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30)
    if (data) setHistory(data)
  }

  async function askQuestion() {
    if (!question.trim()) return
    setLoading(true)
    setAnswer("")
    setSelected(null)

    const res = await fetch(`${import.meta.env.VITE_API_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    })

    const data = await res.json()
    setAnswer(data.answer)

    await supabase.from("chats").insert({
      user_id: user.id,
      question,
      answer: data.answer,
    })

    await loadHistory()
    setLoading(false)
    setQuestion("")
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (!user) return <Auth onLogin={setUser} />

  const displayed = selected || (answer ? { question: question || "New question", answer } : null)

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">

      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-blue-600">TPSC AI Tutor</h1>
          <p className="text-xs text-gray-400 mt-1 truncate">{user.email}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">

          <button
            onClick={() => setMode("chat")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition mb-1
              ${mode === "chat"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"}`}
          >
            💬 AI Tutor Chat
          </button>

          <button
            onClick={() => setMode("mcq")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition mb-1
              ${mode === "mcq"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"}`}
          >
            📝 MCQ Practice
          </button>

          <button
            onClick={() => setMode("current-affairs")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition mb-1
              ${mode === "current-affairs"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"}`}
          >
            📰 Current Affairs
          </button>

          <button
            onClick={() => setMode("trivia")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition mb-1
              ${mode === "trivia"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"}`}
          >
            ⚡ Daily Trivia
          </button>

          <button
            onClick={() => setMode("flashcards")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition mb-1
              ${mode === "flashcards"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"}`}
          >
            🃏 Flashcards
          </button>

          <button
            onClick={() => setMode("docchat")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition mb-1
              ${mode === "docchat"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"}`}
          >
            📄 Chat with Doc
          </button>

          <button
            onClick={() => setMode("dashboard")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition mb-3
              ${mode === "dashboard"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"}`}
          >
            📊 My Progress
          </button>

          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 mb-2 mt-2">
            Recent chats
          </p>
          {history.length === 0 && (
            <p className="text-sm text-gray-400 px-2">No chats yet</p>
          )}
          {history.map(chat => (
            <button
              key={chat.id}
              onClick={() => { setSelected(chat); setAnswer(""); setMode("chat") }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition
                ${selected?.id === chat.id
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"}`}
            >
              {chat.question}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={signOut}
            className="w-full text-sm text-gray-500 hover:text-red-500 transition text-left"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {mode === "mcq" ? (
          <MCQ user={user} onBack={() => setMode("chat")} />
        ) : mode === "current-affairs" ? (
          <CurrentAffairs user={user} onBack={() => setMode("chat")} />
        ) : mode === "dashboard" ? (
          <Dashboard user={user} onBack={() => setMode("chat")} />
        ) : mode === "flashcards" ? (
          <Flashcards user={user} onBack={() => setMode("chat")} />
        ) : mode === "trivia" ? (
          <DailyTrivia user={user} onBack={() => setMode("chat")} />
        ) : mode === "docchat" ? (
          <DocChat user={user} onBack={() => setMode("chat")} />
        ) : (
          <>
            {/* Answer area */}
            <div className="flex-1 overflow-y-auto p-8">
              {!displayed && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="text-4xl mb-4">📚</div>
                  <h2 className="text-xl font-semibold text-gray-700">Ask the TPSC syllabus</h2>
                  <p className="text-gray-400 mt-2 text-sm">
                    Type a question below to get started
                  </p>
                </div>
              )}

              {loading && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400 text-sm">Thinking...</p>
                  </div>
                </div>
              )}

              {displayed && !loading && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="bg-blue-50 rounded-2xl px-6 py-4">
                    <p className="text-sm text-blue-400 font-medium mb-1">Your question</p>
                    <p className="text-gray-800 font-medium">{displayed.question}</p>
                  </div>
                  <div className="bg-white rounded-2xl px-6 py-4 border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-400 font-medium mb-2">Answer</p>
                    <p className="text-gray-700 leading-relaxed">{displayed.answer}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="border-t border-gray-200 bg-white p-4">
              <div className="max-w-2xl mx-auto flex gap-3">
                <textarea
                  rows={2}
                  className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3
                    text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ask anything from the TPSC syllabus..."
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      askQuestion()
                    }
                  }}
                />
                <button
                  onClick={askQuestion}
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium
                    hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Ask
                </button>
              </div>
              <p className="text-center text-xs text-gray-300 mt-2">Press Enter to send</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}