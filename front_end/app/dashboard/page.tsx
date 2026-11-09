'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BodyDetectionCamera from '../components/BodyDetectionCamera'
import VoiceChatBot from '../components/VoiceChatBot'
import ProtectedPage from '../components/ProtectedPage'
import Header from '../components/Header'
import { getUser, User } from '../lib/auth'

function DashboardContent() {
    const router = useRouter()
    const [theme, setTheme] = useState<'dark' | 'light'>('dark')
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const userData = getUser()
        setUser(userData)
        if (userData?.settings?.theme) {
            setTheme(userData.settings.theme)
        }

        const handleUpdate = (event: Event) => {
            const newUser = (event as CustomEvent<User | null>).detail
            setUser(newUser)
            if (newUser?.settings?.theme) {
                setTheme(newUser.settings.theme)
            }
        }
        window.addEventListener('gimmify-user-updated', handleUpdate)
        return () => window.removeEventListener('gimmify-user-updated', handleUpdate)
    }, [])

    const cameraEnabled = user?.settings?.cameraPreference !== 'never'

    return (
        <div className={`min-h-screen transition-colors duration-500 ${theme === 'light' ? 'bg-gray-50 text-gray-900' : 'gradient-black-red bg-gray-950 text-white'}`}>
            <Header />

            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-10">
                    <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                        Your workout
                    </h1>
                    {user && (
                        <p className={`text-lg mb-4 font-mono ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`}>
                            {user.email}
                        </p>
                    )}
                    <p className={`text-lg md:text-xl max-w-3xl mx-auto ${theme === 'light' ? 'text-gray-600' : 'text-red-200'}`}>
                        Real-time pose tracking and your AI coach, in one place.
                    </p>
                </div>

                <section>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div className="bg-transparent">
                            <VoiceChatBot theme={theme} />
                        </div>

                        <div className={`w-full border rounded-2xl shadow-xl p-6 md:p-8 transition-colors ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-red-900/50'}`}>
                            <div className="text-center mb-8">
                                <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                                    Try Body Detection
                                </h2>
                                <p className={`max-w-lg mx-auto ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                                    Experience real-time AI pose analysis. Click &quot;Start&quot; to activate the camera.
                                </p>
                            </div>
                            <div className="flex justify-center">
                                {cameraEnabled ? (
                                    <BodyDetectionCamera
                                        width={500}
                                        height={380}
                                        enableDetection={true}
                                        theme={theme}
                                    />
                                ) : (
                                    <div className={`w-full max-w-[500px] h-[380px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-8 text-center ${theme === 'light' ? 'bg-gray-50 border-gray-300' : 'bg-gray-800/50 border-gray-700'}`}>
                                        <h3 className="text-xl font-bold mb-2">Camera disabled</h3>
                                        <p className="text-gray-500 text-sm">You have disabled the camera in settings. Enable it to use body detection.</p>
                                        <button
                                            onClick={() => router.push('/settings')}
                                            className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-bold text-sm"
                                        >
                                            Go to Settings
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default function DashboardPage() {
    return (
        <ProtectedPage>
            <DashboardContent />
        </ProtectedPage>
    )
}
