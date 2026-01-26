'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, hasCompletedOnboarding, createUserProfile, fetchUserProfile, setUser } from '../lib/auth'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    contactInfo: '',
    address: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id)

      if (session?.user) {
        setLoading(true)
        try {
          const profile = await fetchUserProfile(session.user.id)

          if (!profile || !profile.firstName || profile.firstName === 'User') {
            // New user, missing profile, or placeholder name - try to sync from metadata
            const { user } = session
            const metadata = user.user_metadata || {}

            // Extract name (fallback to 'User' if missing)
            let firstName = profile?.firstName && profile.firstName !== 'User' ? profile.firstName : 'User'
            let lastName = profile?.lastName || ''

            if (metadata.full_name) {
              const parts = metadata.full_name.split(' ')
              firstName = parts[0]
              lastName = parts.slice(1).join(' ')
            } else if (metadata.name) {
              const parts = metadata.name.split(' ')
              firstName = parts[0]
              lastName = parts.slice(1).join(' ')
            } else if (firstName === 'User' && user.email) {
              // Fallback: Extract from email if no name found
              firstName = user.email.split('@')[0]
            }

            // Upsert profile
            await createUserProfile({
              id: user.id,
              firstName: firstName,
              lastName: lastName,
              email: user.email || '',
              onboardingCompleted: profile?.onboardingCompleted || false
            })

            if (profile?.onboardingCompleted) {
              router.push('/')
            } else {
              router.push('/onboarding')
            }
            return
          }

          if (profile.onboardingCompleted) {
            router.push('/')
          } else {
            router.push('/onboarding')
          }
        } catch (err) {
          console.error('Error fetching/syncing profile:', err)
        } finally {
          setLoading(false)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (isSignUp) {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required'
      } else if (!/^[a-zA-Z]+$/.test(formData.firstName)) {
        newErrors.firstName = 'sorry only alphabets no number(1-9) or speacial charater in first or last name'
      }

      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required'
      } else if (!/^[a-zA-Z]+$/.test(formData.lastName)) {
        newErrors.lastName = 'sorry only alphabets no number(1-9) or speacial charater in first or last name'
      }

      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      }
    } else {
      if (!formData.password) newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
            }
          }
        })

        if (error) {
          setErrors({ email: error.message })
          setLoading(false)
        } else if (data.user) {
          // Create profile in our database
          await createUserProfile({
            id: data.user.id,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            onboardingCompleted: false
          })

          if (data.session) {
            console.log('Signup successful, session exists, redirecting...')
            router.push('/onboarding')
          } else {
            console.log('Signup successful, email confirmation required')
            setMessage('Please check your email to confirm your account before signing in.')
            setLoading(false)
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) {
          setErrors({ email: error.message })
          setLoading(false)
        }
        // Redirection handled by onAuthStateChange
      }
    } catch (err) {
      console.error('Auth error:', err)
      setErrors({ email: 'An unexpected error occurred. Please try again.' })
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'facebook' | 'google' | 'apple') => {
    const options: { redirectTo: string; queryParams?: any } = {
      redirectTo: `${window.location.origin}/onboarding`
    }

    if (provider === 'google') {
      options.queryParams = {
        access_type: 'offline',
        prompt: 'consent select_account',
      }
    }

    if (provider === 'facebook') {
      options.queryParams = {
        auth_type: 'reauthenticate',
      }
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider === 'google' ? 'google' : provider as any,
      options
    })
    if (error) console.error('Social login error:', error)
  }

  return (
    <div className="min-h-screen gradient-red-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">Gimmify</h1>
          <p className="text-red-200">Your AI Fitness Coach</p>
        </div>

        {/* Auth Card */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 border border-red-900/50">
          {message && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-lg text-green-400 text-center animate-in fade-in zoom-in duration-300">
              {message}
            </div>
          )}
          {/* Toggle Sign Up / Sign In */}
          <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${!isSignUp
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${isSignUp
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              Sign Up
            </button>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleSocialLogin('facebook')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continue with Facebook
            </button>
            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
            <button
              onClick={() => handleSocialLogin('apple')}
              className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 384 512">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 43.7-27.8 71.9 26.8 2 54.9-16.2 71.7-34.3z" />
              </svg>
              Continue with Apple
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">Or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Info
                  </label>
                  <input
                    type="tel"
                    value={formData.contactInfo}
                    onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="123 Main St, City, State"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-6 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

