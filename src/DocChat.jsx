import { useState, useRef } from "react"

export default function DocChat({ user, onBack }) {
  const [file, setFile] = useState(null)
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  function handleFile(e) {
    const f = e.target.files[0]
    if (f && f.type === "application/pdf") {
      setFile(f)
      setMessages([])
    }
  }

  async function askQuestion() {
    if (!file || !question.trim()) return
    setLoading(true)

    const userMsg = question
    setMessages(prev => [...prev, { role: "user", text: userMsg }])
    setQuestion("")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("question", userMsg)

    try {
      const res = await fetch("http://127.0.0.1:8000/chat-with-doc", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: "assistant", text: data.answer }])
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", text: "Something went wrong. Try again." }])
    }

    setLoading(false)
  }

  return (
    <div className="flex-1 flex flex-col">

      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600">←</button>
        <div>
          <h2 className="text-base font-semibold text-gray-800">Chat with Document</h2>
          <p className="text-xs text-gray-400">Upload a PDF and ask questions about it</p>
        </div>
      </div>

      {/* Upload area */}
      {!file ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div
            onClick={() => fileRef.current.click()}
            className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center
              cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition max-w-md w-full"
          >
            <div className="text-4xl mb-4">📄</div>
            <p className="font-medium text-gray-700 mb-1">Upload a PDF</p>
            <p className="text-sm text-gray-400">Click to browse or drag and drop</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      ) : (
        <>
          {/* File info bar */}
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-500">📄</span>
              <span className="text-sm font-medium text-blue-700 truncate max-w-xs">{file.name}</span>
            </div>
            <button
              onClick={() => { setFile(null); setMessages([]) }}
              className="text-xs text-blue-400 hover:text-blue-600"
            >
              Change file
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="text-3xl mb-3">💬</div>
                <p className="text-gray-500 font-medium">Ask anything about your document</p>
                <p className="text-gray-300 text-sm mt-1">e.g. "Summarize this document" or "What are the key points?"</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white border border-gray-100 shadow-sm text-gray-700 rounded-bl-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="max-w-2xl mx-auto flex gap-3">
              <textarea
                rows={2}
                className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3
                  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ask anything about your document..."
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
                disabled={loading || !question.trim()}
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
  )
}