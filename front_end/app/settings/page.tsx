'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, updateUser, User, updateEmail, updatePassword } from '../lib/auth'

export default function SettingsPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    // Account Form States
    const [showEmailForm, setShowEmailForm] = useState(false)
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [newEmail, setNewEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    useEffect(() => {
        const userData = getUser()
        if (!userData) {
            router.push('/auth')
            return
        }
        setUser(userData)
        setLoading(false)

        const handleUpdate = (event: any) => {
            const newUser = event.detail
            if (newUser) setUser(newUser)
        }
        window.addEventListener('gimmify-user-updated', handleUpdate)
        return () => window.removeEventListener('gimmify-user-updated', handleUpdate)
    }, [router])

    const handleThemeChange = async (theme: 'dark' | 'light') => {
        if (!user) return
        if (user.settings?.theme === theme) return
        setLoading(true)
        const updated = await updateUser({
            settings: { ...user.settings!, theme }
        })
        if (updated) setUser(updated)
        setLoading(false)
    }

    const handleCameraChange = async (pref: 'always' | 'once' | 'while-using' | 'never') => {
        if (!user) return
        setLoading(true)
        const updated = await updateUser({
            settings: { ...user.settings!, cameraPreference: pref }
        })
        if (updated) setUser(updated)
        setLoading(false)
    }

    const onUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        const result = await updateEmail(newEmail)
        if (result.error) {
            setError(result.error.message)
        } else {
            setMessage('Confirmation email sent to both old and new addresses. Please check your inbox.')
            setShowEmailForm(false)
            setNewEmail('')
        }
        setLoading(false)
    }

    const onUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        const result = await updatePassword(newPassword)
        if (result.error) {
            setError(result.error.message)
        } else {
            setMessage('Password updated successfully!')
            setShowPasswordForm(false)
            setNewPassword('')
            setConfirmPassword('')
        }
        setLoading(false)
    }

    if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>

    const currentTheme = user?.settings?.theme || 'dark'
    const currentCamera = user?.settings?.cameraPreference || 'while-using'

    return (
        <div className={`min-h-screen p-6 md:p-12 transition-colors duration-500 ${currentTheme === 'light' ? 'bg-gray-50' : 'bg-[#060608]'}`}>
            <div className={`max-w-4xl mx-auto border rounded-[40px] overflow-hidden shadow-2xl transition-colors duration-500 ${currentTheme === 'light' ? 'bg-white border-gray-200' : 'bg-[#0d0d12] border-[#1a1a1e]'}`}>
                <div className="p-8 md:p-14">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h1 className={`text-4xl font-black tracking-tight mb-2 ${currentTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>Settings</h1>
                            <p className="text-gray-500 font-medium">Manage your app preferences and permissions</p>
                        </div>
                        <button
                            onClick={() => router.push('/')}
                            className={`${currentTheme === 'light' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-[#1a1a1e] text-white hover:bg-[#25252b]'} px-6 py-3 rounded-2xl transition-all font-bold flex items-center gap-2 shadow-lg`}
                        >
                            <span>←</span> Dashboard
                        </button>
                    </div>

                    {message && (
                        <div className="bg-green-600/10 text-green-400 p-4 rounded-xl border border-green-600/20 text-center mb-8 animate-in fade-in zoom-in">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-600/10 text-red-500 p-4 rounded-xl border border-red-600/20 text-center mb-8 animate-in fade-in zoom-in">
                            {error}
                        </div>
                    )}

                    <div className="space-y-14">
                        {/* Appearance Section */}
                        <section>
                            <h2 className={`text-xl font-bold mb-8 uppercase tracking-[0.2em] ${currentTheme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>Appearance</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <button
                                    onClick={() => handleThemeChange('dark')}
                                    className={`relative group p-8 rounded-[32px] border-4 transition-all duration-300 ${currentTheme === 'dark'
                                        ? 'border-[#cc2d2d] bg-[#cc2d2d]/5'
                                        : 'border-transparent bg-gray-100/50 hover:bg-gray-200/50'
                                        }`}
                                >
                                    <div className="aspect-video bg-[#060608] rounded-2xl mb-6 flex items-center justify-center border border-[#1a1a1e] shadow-inner">
                                        <span className="text-xl font-bold text-gray-400">DARK</span>
                                    </div>
                                    <span className={`text-lg font-black ${currentTheme === 'dark' ? 'text-white' : 'text-gray-400'}`}>Dark Mode</span>
                                    {currentTheme === 'dark' && <div className="absolute top-4 right-4 text-[#cc2d2d] font-bold">ACTIVE</div>}
                                </button>

                                <button
                                    onClick={() => handleThemeChange('light')}
                                    className={`relative group p-8 rounded-[32px] border-4 transition-all duration-300 ${currentTheme === 'light'
                                        ? 'border-[#cc2d2d] bg-[#cc2d2d]/5'
                                        : 'border-transparent bg-gray-100/50 hover:bg-gray-200/50'
                                        }`}
                                >
                                    <div className="aspect-video bg-white rounded-2xl mb-6 flex items-center justify-center border border-gray-100 shadow-inner">
                                        <span className="text-xl font-bold text-gray-600">LIGHT</span>
                                    </div>
                                    <span className={`text-lg font-black ${currentTheme === 'light' ? 'text-gray-900' : 'text-gray-400'}`}>Light Mode</span>
                                    {currentTheme === 'light' && <div className="absolute top-4 right-4 text-[#cc2d2d] font-bold">ACTIVE</div>}
                                </button>
                            </div>
                        </section>

                        {/* Camera Permissions Section */}
                        <section>
                            <h2 className={`text-xl font-bold mb-8 uppercase tracking-[0.2em] ${currentTheme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>Camera Permissions</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { id: 'always', label: 'Always Allow', sub: 'Camera starts automatically without prompt', icon: 'A' },
                                    { id: 'while-using', label: 'While Using App', sub: 'Camera active only for relevant features', icon: 'W' },
                                    { id: 'once', label: 'Ask Every Time', sub: 'Require permission for every session', icon: 'O' },
                                    { id: 'never', label: 'Never', sub: 'Disable camera features entirely', icon: 'N' }
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleCameraChange(opt.id as any)}
                                        className={`w-full text-left p-6 rounded-[24px] border-2 transition-all duration-300 flex items-center gap-6 ${currentCamera === opt.id
                                            ? 'border-[#cc2d2d] bg-[#cc2d2d]/5'
                                            : currentTheme === 'light' ? 'border-gray-100 bg-gray-50 hover:bg-gray-100' : 'border-[#1a1a1e] bg-[#14141a] hover:bg-[#1a1a24]'
                                            }`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-all ${currentCamera === opt.id ? 'bg-[#cc2d2d] text-white' : (currentTheme === 'light' ? 'bg-gray-100 text-gray-400' : 'bg-[#1a1a1e] text-gray-400')}`}>
                                            {opt.icon}
                                        </div>
                                        <div className="flex-grow">
                                            <p className={`text-lg font-black ${currentTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>{opt.label}</p>
                                            <p className="text-sm text-gray-500 font-medium">{opt.sub}</p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${currentCamera === opt.id ? 'border-[#cc2d2d] bg-[#cc2d2d]' : 'border-gray-600'}`}>
                                            {currentCamera === opt.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Account & Security Section */}
                        <section>
                            <h2 className={`text-xl font-bold mb-8 uppercase tracking-[0.2em] ${currentTheme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>Account & Security</h2>
                            <div className="space-y-6">
                                {/* Email Update */}
                                <div className={`p-8 rounded-[32px] border-2 transition-all duration-300 ${currentTheme === 'light' ? 'border-gray-100 bg-gray-50' : 'border-[#1a1a1e] bg-[#14141a]'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className={`text-lg font-black ${currentTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>Email Address</p>
                                            <p className="text-sm text-gray-500 font-medium">Your current email is {user?.email}</p>
                                        </div>
                                        <button
                                            onClick={() => setShowEmailForm(!showEmailForm)}
                                            className="bg-[#cc2d2d] hover:bg-[#b02424] text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg text-sm"
                                        >
                                            {showEmailForm ? 'Cancel' : 'Update Email'}
                                        </button>
                                    </div>
                                    {showEmailForm && (
                                        <form onSubmit={onUpdateEmail} className="mt-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                                            <input
                                                type="email"
                                                required
                                                placeholder="New Email Address"
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                className={`w-full px-5 py-3 rounded-xl border font-medium ${currentTheme === 'light' ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#0a0a0c] border-gray-800 text-white'}`}
                                            />
                                            <button
                                                type="submit"
                                                className="w-full bg-white text-black hover:bg-gray-200 py-3 rounded-xl font-bold transition-all"
                                            >
                                                Save New Email
                                            </button>
                                        </form>
                                    )}
                                </div>

                                {/* Password Update */}
                                <div className={`p-8 rounded-[32px] border-2 transition-all duration-300 ${currentTheme === 'light' ? 'border-gray-100 bg-gray-50' : 'border-[#1a1a1e] bg-[#14141a]'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className={`text-lg font-black ${currentTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>Password</p>
                                            <p className="text-sm text-gray-500 font-medium">Update your account security</p>
                                        </div>
                                        <button
                                            onClick={() => setShowPasswordForm(!showPasswordForm)}
                                            className="bg-[#cc2d2d] hover:bg-[#b02424] text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg text-sm"
                                        >
                                            {showPasswordForm ? 'Cancel' : 'Update Password'}
                                        </button>
                                    </div>
                                    {showPasswordForm && (
                                        <form onSubmit={onUpdatePassword} className="mt-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                                            <input
                                                type="password"
                                                required
                                                placeholder="New Password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className={`w-full px-5 py-3 rounded-xl border font-medium ${currentTheme === 'light' ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#0a0a0c] border-gray-800 text-white'}`}
                                            />
                                            <input
                                                type="password"
                                                required
                                                placeholder="Confirm New Password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={`w-full px-5 py-3 rounded-xl border font-medium ${currentTheme === 'light' ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#0a0a0c] border-gray-800 text-white'}`}
                                            />
                                            <button
                                                type="submit"
                                                className="w-full bg-white text-black hover:bg-gray-200 py-3 rounded-xl font-bold transition-all"
                                            >
                                                Save New Password
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Subscription Section */}
                        <section>
                            <h2 className={`text-xl font-bold mb-8 uppercase tracking-[0.2em] ${currentTheme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>Billing & Subscription</h2>
                            <div className={`p-8 rounded-[32px] border-4 border-[#cc2d2d] bg-gradient-to-br from-[#cc2d2d]/10 to-transparent transition-all duration-300`}>
                                <div className="flex items-center justify-between gap-6 flex-wrap md:flex-nowrap">
                                    <div>
                                        <div className="bg-[#cc2d2d] text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full w-fit mb-3">CURRENT PLAN</div>
                                        <h3 className={`text-2xl font-black mb-2 ${currentTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>Gimmify Free</h3>
                                        <p className="text-gray-500 font-medium">Get 24/7 AI coaching with basic motion analysis.</p>
                                    </div>
                                    <button
                                        onClick={() => setMessage('Subscription Management Coming Soon!')}
                                        className="bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-2xl font-black transition-all shadow-xl whitespace-nowrap"
                                    >
                                        Upgrade to Pro
                                    </button>
                                </div>
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-red-900/20 pt-8">
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-400">
                                        <span className="text-red-500 text-lg">✓</span> AI Pose Feedback
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-400">
                                        <span className="text-red-500 text-lg">✓</span> 3 Workouts/Week
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-400 opacity-50">
                                        <span className="text-gray-600 text-lg">×</span> Personalized AI Plans
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Save Button */}
                        <div className="pt-6">
                            <button
                                onClick={() => {
                                    setMessage('Preferences Saved Successfully!')
                                    setTimeout(() => {
                                        setMessage('')
                                        router.push('/')
                                    }, 1500)
                                }}
                                className="w-full bg-[#cc2d2d] hover:bg-[#b02424] text-white font-black py-6 rounded-3xl transition-all shadow-xl hover:shadow-[#cc2d2d]/30 active:scale-[0.98] text-xl"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
