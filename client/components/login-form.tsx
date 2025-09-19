import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

// --- Embedded CSS Styles ---
const LoginStyles = () => (
  <style>{`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f9fafb;
      padding: 1rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
    }

    .login-container {
      width: 100%;
      max-width: 448px;
      background-color: #ffffff;
      border-radius: 0.75rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      padding: 2rem;
      border-top: 4px solid #ea580c;
    }

    .login-header { text-align: center; margin-bottom: 2rem; }
    .login-title { font-size: 1.875rem; font-weight: 700; color: #1f2937; margin-bottom: 0.5rem; }
    .login-subtitle { color: #4b5563; }
    
    .error-message {
      background-color: #fee2e2;
      color: #b91c1c;
      border: 1px solid #fecaca;
      border-radius: 0.5rem;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      text-align: center;
    }

    .login-form .form-group { margin-bottom: 1rem; }
    .login-form .form-label { display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; }
    .input-wrapper { position: relative; }

    .form-control {
      width: 100%;
      padding: 0.75rem 2.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      color: #374151;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-control:focus { border-color: #ea580c; box-shadow: 0 0 0 2px rgba(234, 88, 12, 0.2); }

    .input-icon { position: absolute; top: 50%; left: 0.75rem; transform: translateY(-50%); display: flex; align-items: center; pointer-events: none; }
    .input-icon svg { height: 1.25rem; width: 1.25rem; color: #9ca3af; }

    .toggle-password { position: absolute; top: 50%; right: 0.75rem; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 0.25rem; }
    .toggle-password svg { height: 1.25rem; width: 1.25rem; color: #9ca3af; transition: color 0.2s; }
    .toggle-password:hover svg { color: #4b5563; }

    .form-options { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; font-size: 0.875rem; }
    .remember-me { display: flex; align-items: center; }
    .remember-me input { height: 1rem; width: 1rem; margin-right: 0.5rem; accent-color: #ea580c; }
    .remember-me label { color: #111827; }
    .forgot-password-link { color: #ea580c; font-weight: 500; text-decoration: none; }
    .forgot-password-link:hover, .signup-link a:hover { text-decoration: underline; }

    .btn-submit {
      width: 100%;
      display: flex;
      justify-content: center;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #ffffff;
      background-color: #ea580c;
      cursor: pointer;
      transition: background-color 0.3s;
      border: none;
    }
    .btn-submit:hover { background-color: #c2410c; }
    .btn-submit:disabled { background-color: #f97316; cursor: not-allowed; }

    .signup-link-container { margin-top: 2rem; text-align: center; font-size: 0.875rem; color: #4b5563; }
    .signup-link-container a { font-weight: 500; color: #ea580c; text-decoration: none; }
  `}</style>
);

// --- SVG Icon Components ---
const MailIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg> );
const LockIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> );
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg> );
const EyeOffIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg> );

// --- Main Login Component ---
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const redirectTo = (searchParams.get("redirectTo") as string) || "/index";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        setToken?.(result.token);
        toast.success("Logged in successfully!");
        navigate(redirectTo);
      } else {
        setError(result.error || "Invalid email or password. Please try again.");
        toast.error(result.error || "Failed to log in");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LoginStyles />
      <div className="login-page">
        <div className="login-container">
          <div className="login-header">
            <h1 className="login-title">Welcome Back!</h1>
            <p className="login-subtitle">Please sign in to continue.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <div className="input-wrapper">
                <span className="input-icon"><MailIcon /></span>
                <input type="email" id="email" name="email" className="form-control" placeholder="Enter your email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon"><LockIcon /></span>
                <input type={showPassword ? 'text' : 'password'} id="password" name="password" className="form-control" placeholder="Enter your password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="toggle-password" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            
            <div className="form-options">
              <div className="remember-me">
                <input id="remember-me" name="remember-me" type="checkbox" />
                <label htmlFor="remember-me">Remember me</label>
              </div>
              <div>
                <Link to="/forgot-password" className='forgot-password-link'>Forgot password?</Link>
              </div>
            </div>

            <div className="form-group">
              <button type="submit" className="btn-submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <p className="signup-link-container">
            Don't have an account?{' '}
            <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </>
  );
}

