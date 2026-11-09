'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Header from './components/Header'
import { getUser, User } from './lib/auth'
import { supabase } from './lib/supabase'

export default function LandingPage() {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark')
    const [user, setUser] = useState<User | null>(null)
    const [hasSession, setHasSession] = useState(false)

    useEffect(() => {
        const userData = getUser()
        setUser(userData)
        setHasSession(Boolean(userData))
        if (userData?.settings?.theme) {
            setTheme(userData.settings.theme)
        }
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) setHasSession(true)
        })

        const handleUpdate = (event: Event) => {
            const newUser = (event as CustomEvent<User | null>).detail
            setUser(newUser)
            if (!newUser) setHasSession(false)
            if (newUser?.settings?.theme) {
                setTheme(newUser.settings.theme)
            }
        }
        window.addEventListener('gimmify-user-updated', handleUpdate)
        return () => window.removeEventListener('gimmify-user-updated', handleUpdate)
    }, [])

    const signedIn = hasSession || Boolean(user)

    return (
        <div className={`min-h-screen transition-colors duration-500 ${theme === 'light' ? 'bg-gray-50 text-gray-900' : 'gradient-black-red bg-gray-950 text-white'}`}>
            <Header />

            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <p className={`text-sm font-semibold tracking-[0.2em] uppercase mb-4 ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`}>
                        AI fitness coach
                    </p>
                    <h1 className={`text-5xl md:text-6xl font-bold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                        Gimmify
                    </h1>
                    <p className={`text-xl md:text-2xl max-w-3xl mx-auto ${theme === 'light' ? 'text-gray-600' : 'text-red-200'}`}>
                        Your 24/7 personal fitness coach with real-time posture feedback and AI-powered motivation
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        {signedIn ? (
                            <Link href="/dashboard" className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-lg transition-colors text-lg shadow-lg">
                                Go to dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/auth?mode=signup" className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-lg transition-colors text-lg shadow-lg">
                                    Create account
                                </Link>
                                <Link href="/auth" className={`font-bold px-8 py-4 rounded-lg transition-colors text-lg border ${theme === 'light' ? 'border-gray-300 text-gray-900 hover:bg-gray-100' : 'border-red-900/50 text-white hover:bg-white/10'}`}>
                                    Log in
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <section className="mb-16">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                        <div className="relative h-96 md:h-[500px] w-full">
                            <Image
                                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop"
                                alt="Person training with real-time pose feedback"
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end">
                                <div className="p-8 md:p-12 text-white w-full">
                                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                        Real-time pose detection
                                    </h2>
                                    <p className="text-lg md:text-xl max-w-2xl opacity-90">
                                        The camera stays in your browser. Gimmify watches your form and coaches you while you train.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-16 grid md:grid-cols-3 gap-6">
                    {[
                        { title: 'See your form', body: 'Pose tracking follows your body and highlights the joints that matter for the movement.' },
                        { title: 'Hear your coach', body: 'Ask the AI coach about training, nutrition, and recovery by voice or text.' },
                        { title: 'Train from the dashboard', body: 'Sign in to open the camera and the coach. The public pages stay available when you are already logged in.' },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className={`border rounded-2xl shadow-xl p-8 transition-colors ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-red-900/50'}`}
                        >
                            <h2 className={`text-xl font-bold mb-3 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{item.title}</h2>
                            <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-300'}>{item.body}</p>
                        </div>
                    ))}
                </section>

                <section className="text-center mb-16">
                    <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl shadow-xl p-12 text-white border border-red-900/50">
                        <h2 className="text-4xl font-bold mb-4">Ready to train?</h2>
                        <p className="text-xl mb-8 opacity-90">
                            Start with a free account, or read how the coach works.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {signedIn ? (
                                <Link href="/dashboard" className="bg-white text-red-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg shadow-lg">
                                    Go to dashboard
                                </Link>
                            ) : (
                                <Link href="/auth?mode=signup" className="bg-white text-red-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg shadow-lg">
                                    Create account
                                </Link>
                            )}
                            <Link href="/learn" className="bg-transparent border border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white/10 transition-colors text-lg">
                                Learn how it works
                            </Link>
                        </div>
                    </div>
                </section>
            </div>

            <footer className={`border-t py-8 transition-colors ${theme === 'light' ? 'bg-white border-gray-200 text-gray-700' : 'bg-gray-900 border-red-900/50 text-white'}`}>
                <div className="container mx-auto px-4 text-center">
                    <p className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'}>© 2024 Gimmify. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
