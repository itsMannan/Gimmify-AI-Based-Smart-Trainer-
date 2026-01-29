'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, hasCompletedOnboarding, updateUserOnboarding } from '../lib/auth'
import { supabase } from '../lib/supabase'

export default function OnboardingPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    gender: '' as 'Male' | 'Female' | '',
    age: '',
    height: '',
    weight: '',
    workoutFrequency: '' as '3' | '4' | '6' | '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      // Direct session check to prevent redirect loops for new social users
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }

      // Sync user to localStorage (handles port changes)
      const syncedUser = await import('../lib/auth').then(mod => mod.syncUserSession())

      // if (syncedUser?.onboardingCompleted) {
      //   router.push('/')
      // }
    }
    checkSession()
  }, [router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.gender) {
      newErrors.gender = 'Please select your gender'
    }

    if (!formData.height) {
      newErrors.height = 'Height is required'
    } else {
      const heightNum = parseFloat(formData.height)
      if (isNaN(heightNum) || heightNum < 50 || heightNum > 250) {
        newErrors.height = 'Please enter a valid height (50-250 cm)'
      }
    }

    if (!formData.age) {
      newErrors.age = 'Age is required'
    } else {
      const ageNum = parseInt(formData.age)
      if (isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
        newErrors.age = 'Please enter a valid age (10-100)'
      }
    }

    if (!formData.weight) {
      newErrors.weight = 'Weight is required'
    } else {
      const weightNum = parseFloat(formData.weight)
      if (isNaN(weightNum) || weightNum < 20 || weightNum > 300) {
        newErrors.weight = 'Please enter a valid weight (20-300 kg)'
      }
    }

    if (!formData.workoutFrequency) {
      newErrors.workoutFrequency = 'Please select workout frequency'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)

    try {
      const updated = await updateUserOnboarding({
        gender: formData.gender as 'Male' | 'Female',
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        workoutFrequency: parseInt(formData.workoutFrequency),
      })

      if (updated) {
        router.push('/onboarding/preferences')
      } else {
        setErrors(prev => ({ ...prev, submit: 'Failed to save data. Please try again.' }))
      }
    } catch (err) {
      console.error('Submission error:', err)
      setErrors(prev => ({ ...prev, submit: 'An unexpected error occurred.' }))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen gradient-red-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to Gimmify!</h1>
          <p className="text-red-200">Let's personalize your fitness journey</p>
        </div>

        {/* Onboarding Card */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 md:p-12 border border-red-900/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Gender */}
            <div>
              <label className="block text-lg font-semibold text-white mb-4">
                Gender *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'Male' })}
                  className={`py-4 px-6 rounded-lg font-semibold transition-all border-2 ${formData.gender === 'Male'
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-red-600'
                    }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'Female' })}
                  className={`py-4 px-6 rounded-lg font-semibold transition-all border-2 ${formData.gender === 'Female'
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-red-600'
                    }`}
                >
                  Female
                </button>
              </div>
              {errors.gender && (
                <p className="text-red-400 text-sm mt-2">{errors.gender}</p>
              )}
              {errors.gender && (
                <p className="text-red-400 text-sm mt-2">{errors.gender}</p>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="block text-lg font-semibold text-white mb-2">
                Age *
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 text-lg"
                placeholder="25"
                min="10"
                max="100"
              />
              {errors.age && (
                <p className="text-red-400 text-sm mt-2">{errors.age}</p>
              )}
            </div>

            {/* Height */}
            <div>
              <label className="block text-lg font-semibold text-white mb-2">
                Height (in Centimeters) *
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 text-lg"
                placeholder="175"
                min="50"
                max="250"
              />
              {errors.height && (
                <p className="text-red-400 text-sm mt-2">{errors.height}</p>
              )}
              <p className="text-gray-400 text-sm mt-1">Enter your height in centimeters (e.g., 175 cm)</p>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-lg font-semibold text-white mb-2">
                Body Weight (in kg) *
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 text-lg"
                placeholder="70"
                min="20"
                max="300"
                step="0.1"
              />
              {errors.weight && (
                <p className="text-red-400 text-sm mt-2">{errors.weight}</p>
              )}
              <p className="text-gray-400 text-sm mt-1">Enter your weight in kilograms (e.g., 70 kg)</p>
            </div>

            {/* Workout Frequency */}
            <div>
              <label className="block text-lg font-semibold text-white mb-4">
                How often do you workout during a week? *
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, workoutFrequency: '3' })}
                  className={`py-4 px-6 rounded-lg font-semibold transition-all border-2 ${formData.workoutFrequency === '3'
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-red-600'
                    }`}
                >
                  3 times/week
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, workoutFrequency: '4' })}
                  className={`py-4 px-6 rounded-lg font-semibold transition-all border-2 ${formData.workoutFrequency === '4'
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-red-600'
                    }`}
                >
                  4 times/week
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, workoutFrequency: '6' })}
                  className={`py-4 px-6 rounded-lg font-semibold transition-all border-2 ${formData.workoutFrequency === '6'
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-red-600'
                    }`}
                >
                  6 times/week
                </button>
              </div>
              {errors.workoutFrequency && (
                <p className="text-red-400 text-sm mt-2">{errors.workoutFrequency}</p>
              )}
            </div>

            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg mb-4 text-center">
                {errors.submit}
              </div>
            )}
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg mt-8 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {loading ? 'Processing...' : 'Next Step'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

