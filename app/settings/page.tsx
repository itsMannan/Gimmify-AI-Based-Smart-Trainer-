'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, updateUser, User } from '../lib/auth'
import Header from '../components/Header'
import ProtectedPage from '../components/ProtectedPage'

function SettingsContent() {
    const router = useRouter()
    const [user, setUserData] = useState<User | null>(null)
    const [theme, setTheme] = useState<'dark' | 'light'>('dark')
    const [cameraPref, setCameraPref] = useState<'always' | 'once' | 'while-using'>('while-using')
    const [message, setMessage] = useState<string | null>(null)

    useEffect(() => {
        const userData = getUser()
        if (userData) {
            setUserData(userData)
            if (userData.settings) {
                setTheme(userData.settings.theme)
                setCameraPref(userData.settings.cameraPreference)
            }
        }
    }, [])

    const handleSave = () => {
        // Determine if we need to actually "do" something with the theme immediately (like toggling a class)
        // For now, we just save the preference.

        const updated = updateUser({
            settings: {
                theme: theme,
                cameraPreference: cameraPref
            }
        })

        if (updated) {
            setUserData(updated)
            setMessage('Settings saved successfully!')
            setTimeout(() => setMessage(null), 3000)
        }
    }

    if (!user) return null

    return (
        <div className={`min-h-screen ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-950'} transition-colors duration-300`}>
            <Header />

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className={`text-3xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>App Settings</h1>
                        <button
                            onClick={() => router.push('/')}
                            className={`${theme === 'light' ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'} flex items-center gap-2`}
                        >
                            <span>←</span> Back to Dashboard
                        </button>
                    </div>

                    <div className={`${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-red-900/50'} border rounded-2xl shadow-xl overflow-hidden`}>

                        <div className="p-8">
                            {message && (
                                <div className="mb-6 p-4 bg-green-900/30 border border-green-800 text-green-400 rounded-lg flex items-center gap-2">
                                    <span>✓</span> {message}
                                </div>
                            )}

                            <div className="space-y-10">
                                {/* Theme Section */}
                                <div>
                                    <h2 className={`text-xl font-bold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Appearance</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setTheme('dark')}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'dark'
                                                ? 'border-red-600 bg-red-900/10'
                                                : `${theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-gray-800 bg-gray-950'}`
                                                }`}
                                        >
                                            <div className="w-full h-24 bg-gray-900 rounded-lg border border-gray-800 flex items-center justify-center">
                                                <span className="text-2xl">🌙</span>
                                            </div>
                                            <span className={`font-semibold ${theme === 'light' ? 'text-gray-600' : 'text-white'}`}>Dark Mode</span>
                                        </button>

                                        <button
                                            onClick={() => setTheme('light')}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'light'
                                                ? 'border-red-600 bg-red-50'
                                                : 'border-gray-800 bg-gray-950 opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <div className="w-full h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                                <span className="text-2xl">☀️</span>
                                            </div>
                                            <span className={`font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-gray-400'}`}>Light Mode</span>
                                        </button>
                                    </div>
                                </div>

                                <div className={`h-px ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'}`}></div>

                                {/* Camera Section */}
                                <div>
                                    <h2 className={`text-xl font-bold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Camera Permissions</h2>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'always', label: 'Always Allow', desc: 'Camera starts automatically without prompt' },
                                            { id: 'while-using', label: 'While Using App', desc: 'Camera only active when features are used' },
                                            { id: 'once', label: 'Ask Every Time', desc: 'Require permission for every session' }
                                        ].map((option) => (
                                            <label
                                                key={option.id}
                                                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${cameraPref === option.id
                                                    ? 'border-red-600 bg-red-900/10'
                                                    : `${theme === 'light' ? 'border-gray-200 hover:border-red-300' : 'border-gray-800 hover:border-red-900/50'}`
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="camera"
                                                    value={option.id}
                                                    checked={cameraPref === option.id}
                                                    onChange={() => setCameraPref(option.id as any)}
                                                    className="mt-1 w-4 h-4 text-red-600 focus:ring-red-500 bg-gray-900 border-gray-700"
                                                />
                                                <div>
                                                    <div className={`font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{option.label}</div>
                                                    <div className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>{option.desc}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        onClick={handleSave}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-colors shadow-lg"
                                    >
                                        Save Preferences
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SettingsPage() {
    return (
        <ProtectedPage>
            <SettingsContent />
        </ProtectedPage>
    )
}
