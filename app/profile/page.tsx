'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, updateUser, User } from '../lib/auth'
import Header from '../components/Header'

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Form states
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [age, setAge] = useState('')
    const [height, setHeight] = useState('')
    const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male')
    const [theme, setTheme] = useState<'dark' | 'light'>('dark')

    useEffect(() => {
        const userData = getUser()
        if (!userData) {
            router.push('/auth')
            return
        }
        setUser(userData)
        setFirstName(userData.firstName || '')
        setLastName(userData.lastName || '')
        setUsername(userData.username || '')
        setEmail(userData.email || '')
        setAge(userData.age?.toString() || '')
        setHeight(userData.height?.toString() || '')
        setGender(userData.gender || 'Male')
        if (userData?.settings?.theme) {
            setTheme(userData.settings.theme)
        }
        setLoading(false)

        // Listen for user/theme updates
        const handleUpdate = (event: any) => {
            const newUser = event.detail
            if (newUser) {
                setUser(newUser)
                setAge(newUser.age?.toString() || '')
                setHeight(newUser.height?.toString() || '')
                // Also update other local states if needed
                setFirstName(newUser.firstName || '')
                setLastName(newUser.lastName || '')
                setUsername(newUser.username || '')
                setEmail(newUser.email || '')
                setGender(newUser.gender || 'Male')
                if (newUser?.settings?.theme) {
                    setTheme(newUser.settings.theme)
                }
            }
        }
        window.addEventListener('gimmify-user-updated', handleUpdate)
        return () => window.removeEventListener('gimmify-user-updated', handleUpdate)
    }, [router])

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result as string
                if (updateUser({ profilePhoto: base64String })) {
                    setUser(prev => prev ? { ...prev, profilePhoto: base64String } : null)
                }
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const updated = updateUser({
            firstName,
            lastName,
            username,
            email,
            age: parseInt(age),
            height: parseFloat(height),
            gender
        })

        if (updated) {
            setUser(updated)
            setMessage('Profile updated successfully!')
            setTimeout(() => setMessage(''), 3000)
        }
    }

    if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>

    return (
        <main className={`min-h-screen transition-colors duration-500 ${theme === 'light' ? 'bg-gray-50' : 'bg-[#0a0a0c]'}`}>
            <Header />

            <div className="container mx-auto px-4 py-12">
                <div className={`max-w-4xl mx-auto rounded-[32px] overflow-hidden shadow-2xl transition-colors duration-500 ${theme === 'light' ? 'bg-white' : 'bg-[#0d0d12] border border-red-900/20'}`}>
                    {/* Hero Header */}
                    <div className="relative h-48 bg-gradient-to-r from-red-600 to-red-800 p-8 md:p-12 flex items-end">
                        <div className="flex items-center gap-6 z-10">
                            <div className="relative group">
                                {user?.profilePhoto ? (
                                    <img
                                        src={user.profilePhoto}
                                        alt="Profile"
                                        className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white object-cover shadow-xl"
                                    />
                                ) : (
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white flex items-center justify-center text-red-600 text-4xl font-black shadow-xl">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </div>
                                )}
                                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="text-white text-sm font-bold">Change</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                </label>
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                                    {user?.username || `${user?.firstName} ${user?.lastName}`}
                                </h1>
                                <p className="text-red-100 opacity-90 font-medium">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className={`text-2xl font-black mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Personal Information</h2>
                                <p className="text-gray-500 font-medium">Update your profile details and preferences</p>
                            </div>
                            <button
                                onClick={() => router.push('/')}
                                className={`px-6 py-2 rounded-xl transition-colors font-bold ${theme === 'light' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                            >
                                Back to Dashboard
                            </button>
                        </div>

                        {message && (
                            <div className="bg-green-600/10 text-green-400 p-4 rounded-xl border border-green-600/20 text-center animate-in fade-in zoom-in duration-300 mb-8">
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className={`text-xs font-black uppercase tracking-widest ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Username</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className={`w-full px-5 py-4 rounded-2xl border transition-all font-medium ${theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-900 focus:border-red-500' : 'bg-[#15151a] border-gray-800 text-white focus:border-red-600 focus:bg-[#1a1a24]'}`}
                                        placeholder="Enter username"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className={`text-xs font-black uppercase tracking-widest ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`w-full px-5 py-4 rounded-2xl border transition-all font-medium ${theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-900 focus:border-red-500' : 'bg-[#15151a] border-gray-800 text-white focus:border-red-600 focus:bg-[#1a1a24]'}`}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className={`text-xs font-black uppercase tracking-widest ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>First Name</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className={`w-full px-5 py-4 rounded-2xl border transition-all font-medium ${theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-900 focus:border-red-500' : 'bg-[#15151a] border-gray-800 text-white focus:border-red-600 focus:bg-[#1a1a24]'}`}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className={`text-xs font-black uppercase tracking-widest ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Last Name</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className={`w-full px-5 py-4 rounded-2xl border transition-all font-medium ${theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-900 focus:border-red-500' : 'bg-[#15151a] border-gray-800 text-white focus:border-red-600 focus:bg-[#1a1a24]'}`}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className={`text-xs font-black uppercase tracking-widest ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Gender</label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value as any)}
                                        className={`w-full px-5 py-4 rounded-2xl border transition-all font-medium appearance-none ${theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-900 focus:border-red-500' : 'bg-[#15151a] border-gray-800 text-white focus:border-red-600 focus:bg-[#1a1a24]'}`}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className={`text-xs font-black uppercase tracking-widest ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Age</label>
                                    <input
                                        type="number"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        className={`w-full px-5 py-4 rounded-2xl border transition-all font-medium ${theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-900 focus:border-red-500' : 'bg-[#15151a] border-gray-800 text-white focus:border-red-600 focus:bg-[#1a1a24]'}`}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className={`text-xs font-black uppercase tracking-widest ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Height (cm)</label>
                                    <input
                                        type="number"
                                        value={height}
                                        onChange={(e) => setHeight(e.target.value)}
                                        className={`w-full px-5 py-4 rounded-2xl border transition-all font-medium ${theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-900 focus:border-red-500' : 'bg-[#15151a] border-gray-800 text-white focus:border-red-600 focus:bg-[#1a1a24]'}`}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-6 pt-4">
                                <button
                                    type="button"
                                    onClick={() => router.push('/')}
                                    className="text-gray-400 hover:text-white font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#cc2d2d] hover:bg-[#b02424] text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-[#cc2d2d]/20 active:scale-95"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    )
}
