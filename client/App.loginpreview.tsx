import React, { useState } from 'react';

// --- Embedded CSS Styles ---
// I've moved the styles directly into the component to resolve the import error.
const LoginStyles = () => (
  <style>{`
    /* --- General Styles & Container --- */
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f9fafb; /* Light Gray Background */
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
      border-top: 4px solid #2563eb; /* Blue top border */
    }

    /* --- Header --- */
    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-title {
      font-size: 1.875rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .login-subtitle {
      color: #4b5563;
    }

    /* --- Form Elements --- */
    .login-form .form-group {
      margin-bottom: 1rem;
    }

    .login-form .form-label {
      display: block;
      color: #374151;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .input-wrapper {
      position: relative;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem 2.75rem; /* Padding for icon on the left */
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      color: #374151;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-control:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
    }

    /* --- Icons inside Inputs --- */
    .input-icon {
      position: absolute;
      top: 50%;
      left: 0.75rem;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      pointer-events: none;
    }

    .input-icon svg {
      height: 1.25rem;
      width: 1.25rem;
      color: #9ca3af;
    }

    .toggle-password {
      position: absolute;
      top: 50%;
      right: 0.75rem;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
    }

    .toggle-password svg {
      height: 1.25rem;
      width: 1.25rem;
      color: #9ca3af;
      transition: color 0.2s;
    }

    .toggle-password:hover svg {
      color: #4b5563;
    }

    /* --- Form Options (Remember Me / Forgot Password) --- */
    .form-options {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
    }

    .remember-me {
      display: flex;
      align-items: center;
    }

    .remember-me input {
      height: 1rem;
      width: 1rem;
      margin-right: 0.5rem;
      accent-color: #2563eb;
    }

    .remember-me label, .forgot-password a {
      color: #111827;
      text-decoration: none;
    }

    .forgot-password a {
      color: #2563eb;
      font-weight: 500;
    }

    .forgot-password a:hover, .signup-link a:hover {
      text-decoration: underline;
    }

    /* --- Buttons & Links --- */
    .btn-submit {
      width: 100%;
      display: flex;
      justify-content: center;
      padding: 0.75rem 1rem;
      border: 1px solid transparent;
      border-radius: 0.5rem;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      font-size: 0.875rem;
      font-weight: 500;
      color: #ffffff;
      background-color: #2563eb;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-submit:hover {
      background-color: #1d4ed8;
    }

    .signup-link {
      margin-top: 2rem;
      text-align: center;
      font-size: 0.875rem;
      color: #4b5563;
    }

    .signup-link a {
      font-weight: 500;
      color: #2563eb;
      text-decoration: none;
    }
  `}</style>
);


// --- SVG Icon Components ---
const MailIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
);

// --- Main Login Component ---

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Form submitted");
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
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <MailIcon />
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                 <span className="input-icon">
                  <LockIcon />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="form-control"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            
            <div className="form-options">
              <div className="remember-me">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                />
                <label htmlFor="remember-me">Remember me</label>
              </div>
              <div className="forgot-password">
                <a href="#">Forgot your password?</a>
              </div>
            </div>

            <div className="form-group">
              <button type="submit" className="btn btn-submit">
                Sign in
              </button>
            </div>
          </form>

          <p className="signup-link">
            Don't have an account?{' '}
            <a href="/signup">Sign up</a>
          </p>
        </div>
      </div>
    </>
  );
}

