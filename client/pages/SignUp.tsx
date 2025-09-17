import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { toast } from 'sonner';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Account created successfully! Please log in.');
        navigate('/login');
      } else {
        toast.error(result.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <Link
        to="/"
        style={{ position: 'absolute', left: 24, top: 24, display: 'inline-flex', alignItems: 'center', borderRadius: 6, fontSize: 14, fontWeight: 500, color: '#334155', textDecoration: 'none', padding: '4px 8px', background: '#f1f5f9' }}
      >
        <span role="img" aria-label="Back" style={{ marginRight: 6 }}>⬅️</span>
        Back to home
      </Link>
      <div style={{ width: '100%', maxWidth: 400, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px #0001', borderRadius: 12, background: 'white', padding: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Create an account</div>
          <div style={{ color: '#64748b', fontSize: 15 }}>Enter your details to get started</div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="email" style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>Email</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 12px', fontSize: 15 }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="password" style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 12px', fontSize: 15 }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="confirm-password" style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 12px', fontSize: 15 }}
            />
          </div>
          <button type="submit" style={{ width: '100%', background: '#0d9488', color: 'white', border: 'none', borderRadius: 6, padding: '10px 0', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }} disabled={isLoading}>
            {isLoading && <span role="img" aria-label="Loading" style={{ marginRight: 6 }}>⏳</span>}
            Sign Up
          </button>
        </form>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18, fontSize: 14, color: '#64748b' }}>
          <span style={{ marginRight: 4 }}>Already have an account?</span>
          <Link to="/login" style={{ color: '#0d9488', textDecoration: 'underline', fontWeight: 500 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
