import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import './login-form.css';

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setToken } = useAuth()
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
    <div className="login-form-container">
      <h2 className="login-form-title">Sign in</h2>
      <div className="login-form-subtitle">Enter your email and password to access your account</div>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <div className="input-container">
            <span className="input-icon" role="img" aria-label="Mail">📧</span>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <div className="input-container">
            <span className="input-icon" role="img" aria-label="Lock">🔒</span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle-btn"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <span role="img" aria-label="Hide">🙈</span> : <span role="img" aria-label="Show">👁️</span>}
            </button>
          </div>
        </div>

        <div className="form-options">
          <div className="remember-me">
            <input
              id="remember"
              type="checkbox"
            />
            <label htmlFor="remember">Remember me</label>
          </div>
          <Link to="/forgot-password" className="forgot-password-link">Forgot password?</Link>
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>

        <div className="signup-link-container">
          Don't have an account?{' '}
          <Link to="/signup" className="signup-link">Sign up</Link>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;