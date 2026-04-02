import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // sign up or sign in depending on which tab theyre on
    let result
    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password })
    } else {
      result = await supabase.auth.signInWithPassword({ email, password })
    }

    if (result.error) {
      setError(result.error.message)
    } else {
      // if they just signed up send them to fill out their profile
      if (isSignUp) {
        navigate('/setup')
      } else {
        navigate('/')
      }
    }
    setLoading(false)
  }

return (
  <div className="min-h-screen flex items-center justify-center 
                bg-gray-50 dark:bg-gray-950">
    <div className="w-full max-w-md 
                  bg-white dark:bg-gray-900 rounded-lg shadow p-8">
      <h1 className="text-2xl font-bold text-center mb-6 
                    text-black dark:text-white">CoHabit</h1>

      {/* tabs for switching between sign in and sign up */}
      <div className="flex mb-6 border-b dark:border-gray-700">
        <button
          className={`flex-1 pb-2 text-center font-medium ${!isSignUp 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : 'text-gray-500 dark:text-gray-400'}`}
          onClick={() => { setIsSignUp(false); setError(null) }}
        >
          Sign In
        </button>
        <button
          className={`flex-1 pb-2 text-center font-medium ${isSignUp 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : 'text-gray-500 dark:text-gray-400'}`}
          onClick={() => { setIsSignUp(true); setError(null) }}
        >
          Sign Up
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 
                      text-red-700 dark:text-red-300 
                      rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium 
                          text-gray-700 dark:text-gray-300 
                          mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-800 text-black dark:text-white
                       placeholder-gray-400 dark:placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium 
                            text-gray-700 dark:text-gray-300 
                            mb-1">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-800 text-black dark:text-white
                       placeholder-gray-400 dark:placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
        >
          {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>
      </form>
    </div>
  </div>
)
}

export default Login
