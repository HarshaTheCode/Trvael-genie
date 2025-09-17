import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setToken, isAuthenticated } = useAuth()
  const redirectTo = (searchParams.get("redirectTo") as string) || "/index"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (response.ok) {
        setToken?.(result.token)
        toast.success("Logged in successfully!")
        navigate(redirectTo)
      } else {
        setError(result.error || "Invalid email or password. Please try again.")
        toast.error(result.error || "Failed to log in")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred. Please try again.")
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", border: "1px solid #b2f5ea", borderRadius: 8, boxShadow: "0 2px 8px #0001", padding: 24, background: "#fff" }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#134e4a", marginBottom: 4 }}>Sign in</h2>
      <div style={{ color: "#555", marginBottom: 16 }}>Enter your email and password to access your account</div>
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ background: "#fee2e2", color: "#b91c1c", padding: 8, borderRadius: 4, marginBottom: 12, fontSize: 14 }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Email</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: 10, fontSize: 16, color: "#14b8a6" }} role="img" aria-label="Mail">📧</span>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ paddingLeft: 32, border: "1px solid #d1d5db", borderRadius: 4, height: 36, width: "100%" }}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Password</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: 10, fontSize: 16, color: "#14b8a6" }} role="img" aria-label="Lock">🔒</span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: 32, paddingRight: 32, border: "1px solid #d1d5db", borderRadius: 4, height: 36, width: "100%" }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: 0, top: 0, height: 36, width: 36, background: "none", border: "none", cursor: "pointer" }}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <span role="img" aria-label="Hide">🙈</span> : <span role="img" aria-label="Show">👁️</span>}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              id="remember"
              type="checkbox"
              style={{ marginRight: 6 }}
            />
            <label htmlFor="remember" style={{ fontSize: 14, fontWeight: 400 }}>Remember me</label>
          </div>
          <Link to="/forgot-password" style={{ fontSize: 14, color: "#14b8a6", textDecoration: "none" }}>Forgot password?</Link>
        </div>

        <button
          type="submit"
          style={{ width: "100%", background: "#14b8a6", color: "#fff", border: "none", borderRadius: 4, padding: "10px 0", fontWeight: 600, fontSize: 16, cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1 }}
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>

        <div style={{ textAlign: "center", fontSize: 14, color: "#64748b", marginTop: 16 }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: "#14b8a6", textDecoration: "none" }}>Sign up</Link>
        </div>
      </form>
    </div>
  );
}

export default LoginForm
