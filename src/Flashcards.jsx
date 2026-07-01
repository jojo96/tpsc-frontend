import { useState, useEffect } from "react"
import { supabase } from "./supabase"

const PRESET_TOPICS = [
  { label: "Indian Polity", icon: "⚖️" },
  { label: "Indian History", icon: "🏛️" },
  { label: "Indian Economy", icon: "📈" },
  { label: "Indian Geography", icon: "🗺️" },
  { label: "Science & Technology", icon: "🔬" },
  { label: "Tripura History", icon: "📜" },
  { label: "Tripura Geography", icon: "🌿" },
  { label: "Environment & Ecology", icon: "🌱" },
]

export default function Flashcards({ user, onBack }) {
  const [topic, setTopic] = useState("")
  const [customTopic, setCustomTopic] = useState("")
  const [cards, setCards] = useState([])
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function loadPreset(selectedTopic) {
    setTopic(selectedTopic)
    setLoading(true)
    setCards([])
    setCurrent(0)
    setFlipped(false)
    setDone(false)

    const { data } = await supabase
      .from("flashcards")
      .select("*")
      .eq("topic", selectedTopic)

    setCards(data || [])
    setLoading(false)
  }

  async function generateCustom() {
    if (!customTopic.trim()) return
    setTopic(customTopic)
    setLoading(true)
    setCards([])
    setCurrent(0)
    setFlipped(false)
    setDone(false)

    const res = await fetch("http://127.0.0.1:8000/generate-flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: customTopic, num_cards: 10 }),
    })

    const data = await res.json()
    setCards(data.cards.map(c => ({ front: c.front, back: c.back })))
    setLoading(false)
  }

  function next() {
    if (current + 1 >= cards.length) setDone(true)
    else { setCurrent(current + 1); setFlipped(false) }
  }

  function prev() {
    if (current > 0) { setCurrent(current - 1); setFlipped(false) }
  }

  function reset() {
    setCards([])
    setTopic("")
    setCustomTopic("")
    setDone(false)
    setCurrent(0)
    setFlipped(false)
  }

  // Topic selection screen
  if (!loading && cards.length === 0 && !done) {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto">
          <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1">
            ← Back to chat
          </button>

          <h2 className="text-2xl font-semibold text-gray-800 mb-1">Flashcards</h2>
          <p className="text-sm text-gray-400 mb-8">Generated from your study material</p>

          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Quick start</p>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {PRESET_TOPICS.map(t => (
              <button
                key={t.label}
                onClick={() => loadPreset(t.label)}
                className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border
                  border-gray-200 text-sm font-medium text-gray-700 hover:bg-blue-50
                  hover:border-blue-200 hover:text-blue-700 transition text-left"
              >
                <span className="text-xl">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Custom topic</p>
          <div className="flex gap-3">
            <input
              type="text"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Fundamental Rights, Tripura Tribes..."
              value={customTopic}
              onChange={e => setCustomTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && generateCustom()}
            />
            <button
              onClick={generateCustom}
              disabled={!customTopic.trim()}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium
                hover:bg-blue-700 disabled:opacity-40 transition"
            >
              Generate
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 text-sm">Loading flashcards on {topic}...</p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">All done!</h3>
        <p className="text-gray-400 mb-8">You reviewed all {cards.length} cards on {topic}</p>
        <div className="flex gap-3">
          <button
            onClick={() => { setCurrent(0); setFlipped(false); setDone(false) }}
            className="px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            Review again
          </button>
          <button
            onClick={reset}
            className="px-5 py-3 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-900 transition"
          >
            New topic
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
            ← All topics
          </button>
          <p className="text-sm font-medium text-gray-600">{topic}</p>
          <p className="text-sm text-gray-400">{current + 1} / {cards.length}</p>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-8">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all"
            style={{ width: `${((current + 1) / cards.length) * 100}%` }}
          />
        </div>

        <div
          onClick={() => setFlipped(!flipped)}
          className="cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm
            p-10 text-center min-h-64 flex flex-col items-center justify-center
            hover:shadow-md transition mb-6 select-none"
        >
          {!flipped ? (
            <>
              <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-6">Tap to reveal answer</p>
              <p className="text-xl font-semibold text-gray-800 leading-relaxed">{cards[current].front}</p>
            </>
          ) : (
            <>
              <p className="text-xs text-green-500 font-medium uppercase tracking-wider mb-6">Answer</p>
              <p className="text-lg text-gray-700 leading-relaxed">{cards[current].back}</p>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={prev}
            disabled={current === 0}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium
              text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition"
          >
            ← Previous
          </button>
          <button
            onClick={next}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            {current + 1 === cards.length ? "Finish 🎉" : "Next →"}
          </button>
        </div>
        <p className="text-center text-xs text-gray-300 mt-4">Click the card to flip it</p>
      </div>
    </div>
  )
}