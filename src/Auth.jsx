import { useState } from "react"
import { supabase } from "./supabase"

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setError("")

    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setError("Check your email to confirm your account!")
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else onLogin(data.user)
    }

    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <h1>TPSC AI Tutor</h1>
      <h2 style={{ fontWeight: 400, color: "#666" }}>{isRegister ? "Create account" : "Sign in"}</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: "100%", padding: 12, marginBottom: 12, fontSize: 16,
          borderRadius: 8, border: "1px solid #ddd", boxSizing: "border-box" }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: "100%", padding: 12, marginBottom: 12, fontSize: 16,
          borderRadius: 8, border: "1px solid #ddd", boxSizing: "border-box" }}
      />

      {error && <p style={{ color: error.includes("Check") ? "green" : "red", fontSize: 14 }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ width: "100%", padding: 12, fontSize: 16, borderRadius: 8,
          background: "#2563eb", color: "white", border: "none", cursor: "pointer" }}
      >
        {loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
      </button>

      <p style={{ textAlign: "center", marginTop: 16, color: "#666", fontSize: 14 }}>
        {isRegister ? "Already have an account?" : "Don't have an account?"}
        {" "}
        <span
          onClick={() => setIsRegister(!isRegister)}
          style={{ color: "#2563eb", cursor: "pointer" }}
        >
          {isRegister ? "Sign in" : "Register"}
        </span>
      </p>
    </div>
  )
}