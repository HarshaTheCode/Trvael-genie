import { Link } from 'react-router-dom'
import LoginForm from '../components/login-form'

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-800 mb-2">Welcome back</h1>
          <p className="text-teal-600">Sign in to your account to continue</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}