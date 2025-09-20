import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Account created successfully! Please log in.');
        navigate('/login');
      } else {
        setError(result.error || 'Failed to create account');
        toast.error(result.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        .container {
          min-height: 100vh;
          background: #ffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .inner-container {
          width: 100%;
          max-width: 28rem;
        }

        .card {
          width: 100%;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
          background: white;
          border-radius: 1rem;
          animation: fadeIn 0.5s ease-out;
        }

        .card-header {
          padding: 1.5rem 1.25rem 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e40af;
        }

        .card-description {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .card-content {
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .alert {
          background: #fee2e2;
          border: 1px solid #ef4444;
          border-radius: 0.375rem;
          padding: 0.75rem 1rem;
        }

        .alert-description {
          color: #b91c1c;
          font-size: 0.875rem;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .input-container {
          position: relative;
        }

        .icon {
          position: absolute;
          left: 0.75rem;
          top: 0.75rem;
          height: 1rem;
          width: 1rem;
          color: #3b82f6;
        }

        .input {
          width: 87%;
          padding: 0.625rem 0.75rem 0.625rem 2.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: #f9fafb;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 0.2rem rgba(59,130,246,0.25);
        }

        .input::placeholder {
          color: #9ca3af;
        }

        .password-input {
          padding-left: 0.75rem;
          padding-right: 2.5rem;
          background: #f9fafb;
        }

        .password-input-container .icon {
          display: none;
        }

        .show-password {
          position: absolute;
          right: 0;
          top: 0;
          height: 100%;
          padding: 0 0.75rem;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .show-password:hover .show-icon {
          color: #4b5563;
        }

        .show-icon {
          height: 1rem;
          width: 1rem;
          color: #6b7280;
          transition: color 0.2s;
        }

        .terms {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .checkbox {
          height: 1rem;
          width: 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          accent-color: #2563eb;
        }

        .terms-label {
          font-size: 0.875rem;
          color: #374151;
        }

        .link {
          color: #2563eb;
          text-decoration: none;
        }

        .link:hover {
          text-decoration: underline;
        }

        .card-footer {
          padding: 0 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .submit-button {
          width: 100%;
          padding: 0.75rem 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }

        .submit-button:hover {
          background: #2563eb;
          animation: pulse 0.5s;
        }

        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .signin {
          text-align: center;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .signin-link {
          color: #3b82f6;
          text-decoration: none;
        }

        .signin-link:hover {
          text-decoration: underline;
        }
      `}</style>
      <div className="container">
        <div className="inner-container">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Create account</h2>
              <p className="card-description">Enter your information to create a new account</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="card-content">
                {error && (
                  <div className="alert">
                    <div className="alert-description">{error}</div>
                  </div>
                )}

                <div className="field">
                  <label htmlFor="name" className="label">Full Name</label>
                  <div className="input-container">
                    <User className="icon" />
                    <input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="email" className="label">Email</label>
                  <div className="input-container">
                    <Mail className="icon" />
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="password" className="label">Password</label>
                  <div className="input-container password-input-container">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input password-input"
                      required
                    />
                    <button
                      type="button"
                      className="show-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="show-icon" />
                      ) : (
                        <Eye className="show-icon" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="confirmPassword" className="label">Confirm Password</label>
                  <div className="input-container password-input-container">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input password-input"
                      required
                    />
                    <button
                      type="button"
                      className="show-password"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="show-icon" />
                      ) : (
                        <Eye className="show-icon" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="terms">
                  <input
                    id="terms"
                    type="checkbox"
                    className="checkbox"
                    required
                  />
                  <label htmlFor="terms" className="terms-label">
                    I agree to the{" "}
                    <a href="#" className="link">Terms of Service</a>{" "}
                    and{" "}
                    <a href="#" className="link">Privacy Policy</a>
                  </label>
                </div>
              </div>

              <div className="card-footer">
                <button type="submit" className="submit-button" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </button>

                <div className="signin">
                  Already have an account?{" "}
                  <Link to="/login" className="signin-link">Sign in</Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}