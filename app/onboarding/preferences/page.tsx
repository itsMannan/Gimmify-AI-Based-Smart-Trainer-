'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, hasCompletedOnboarding, updateUserOnboarding } from '../../lib/auth'

export default function OnboardingPreferencesPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        experienceLevel: '' as 'Beginner' | 'Intermediate' | 'Advanced' | '',
        injury: '' as 'None' | 'Knee' | 'Back' | 'Shoulder' | 'Other' | '',
        feedbackPreference: '' as 'Real-time voice' | 'On-screen text' | 'After set summary' | '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        // Redirect if not authenticated
        const user = getUser()
        if (!user) {
            router.push('/auth')
            return
        }

        // Check if onboarding is already completed (though we might allow editing)
        if (hasCompletedOnboarding()) {
            router.push('/')
        }
    }, [router])

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.experienceLevel) {
            newErrors.experienceLevel = 'Please select your experience level'
        }

        if (!formData.injury) {
            newErrors.injury = 'Please select if you have any injuries'
        }

        if (!formData.feedbackPreference) {
            newErrors.feedbackPreference = 'Please select a feedback preference'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        const updated = updateUserOnboarding({
            experienceLevel: formData.experienceLevel as 'Beginner' | 'Intermediate' | 'Advanced',
            injury: formData.injury as 'None' | 'Knee' | 'Back' | 'Shoulder' | 'Other',
            feedbackPreference: formData.feedbackPreference as 'Real-time voice' | 'On-screen text' | 'After set summary',
        })

        if (updated) {
            router.push('/')
        }
    }

    return (
        <div className="min-h-screen gradient-red-black flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Almost There!</h1>
                    <p className="text-red-200">Just a few more details to customize your experience</p>
                </div>

                {/* Preferences Card */}
                <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 md:p-12 border border-red-900/50 relative">
                    <button
                        onClick={() => router.push('/onboarding')}
                        className="absolute top-8 left-8 text-gray-400 hover:text-white transition-colors"
                        title="Go Back"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>

                    <form onSubmit={handleSubmit} className="space-y-8 mt-8">

                        {/* Experience Level */}
                        <div>
                            <label className="block text-lg font-semibold text-white mb-4">
                                1. What is your experience level? *
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, experienceLevel: level as any })}
                                        className={`py-4 px-4 rounded-lg font-semibold transition-all border-2 ${formData.experienceLevel === level
                                            ? 'bg-red-600 border-red-500 text-white'
                                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-red-600'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                            {errors.experienceLevel && (
                                <p className="text-red-400 text-sm mt-2">{errors.experienceLevel}</p>
                            )}
                        </div>

                        {/* Injury */}
                        <div>
                            <label className="block text-lg font-semibold text-white mb-4">
                                2. Any Injury or pain? *
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {['None', 'Knee', 'Back', 'Shoulder', 'Other'].map((inj) => (
                                    <button
                                        key={inj}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, injury: inj as any })}
                                        className={`py-4 px-4 rounded-lg font-semibold transition-all border-2 ${formData.injury === inj
                                            ? 'bg-red-600 border-red-500 text-white'
                                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-red-600'
                                            }`}
                                    >
                                        {inj}
                                    </button>
                                ))}
                            </div>
                            {errors.injury && (
                                <p className="text-red-400 text-sm mt-2">{errors.injury}</p>
                            )}
                        </div>

                        {/* Feedback Preference */}
                        <div>
                            <label className="block text-lg font-semibold text-white mb-4">
                                3. How do you want feedback? *
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {['Real-time voice', 'On-screen text', 'After set summary'].map((pref) => (
                                    <button
                                        key={pref}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, feedbackPreference: pref as any })}
                                        className={`py-4 px-4 rounded-lg font-semibold transition-all border-2 text-sm md:text-base ${formData.feedbackPreference === pref
                                            ? 'bg-red-600 border-red-500 text-white'
                                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-red-600'
                                            }`}
                                    >
                                        {pref}
                                    </button>
                                ))}
                            </div>
                            {errors.feedbackPreference && (
                                <p className="text-red-400 text-sm mt-2">{errors.feedbackPreference}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg mt-8"
                        >
                            Complete Setup
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
