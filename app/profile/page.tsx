'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, updateUser, User } from '../lib/auth'
import Header from '../components/Header'
import ProtectedPage from '../components/ProtectedPage'

function ProfileContent() {
    const router = useRouter()
    const [user, setUserData] = useState<User | null>(null)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        age: '',
        height: '',
    })
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        const userData = getUser()
        if (userData) {
            setUserData(userData)
            setFormData({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                age: userData.age?.toString() || '',
                height: userData.height?.toString() || '',
            })
            if (userData.profilePhoto) {
                setProfilePhoto(userData.profilePhoto)
            }
        }
    }, [])

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result as string
                setProfilePhoto(base64String)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Update user in local storage
        const updated = updateUser({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            age: parseInt(formData.age),
            height: parseFloat(formData.height),
            profilePhoto: profilePhoto || undefined
        })

        if (updated) {
            setUserData(updated)
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
            // Auto-hide success message
            setTimeout(() => setMessage(null), 3000)
        } else {
            setMessage({ type: 'error', text: 'Failed to update profile.' })
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-gray-950">
            <Header />

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
                        <button
                            onClick={() => router.push('/')}
                            className="text-gray-400 hover:text-white flex items-center gap-2"
                        >
                            <span>←</span> Back to Dashboard
                        </button>
                    </div>

                    <div className="bg-gray-900 border border-red-900/50 rounded-2xl shadow-xl overflow-hidden">
                        {/* User Info Header */}
                        <div className="bg-gradient-to-r from-red-900/20 to-gray-900 p-8 flex flex-col items-center border-b border-red-900/30">
                            <div className="relative group cursor-pointer mb-4" onClick={() => fileInputRef.current?.click()}>
                                {profilePhoto ? (
                                    <img
                                        src={profilePhoto}
                                        alt="Profile"
                                        className="w-32 h-32 rounded-full border-4 border-red-600 object-cover shadow-lg group-hover:opacity-75 transition-opacity"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-5xl font-bold text-white border-4 border-red-500 shadow-lg group-hover:opacity-75 transition-opacity">
                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                    </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">Change Photo</span>
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePhotoChange}
                                className="hidden"
                                accept="image/*"
                            />

                            <h2 className="text-2xl font-bold text-white">{user.firstName} {user.lastName}</h2>
                            <p className="text-gray-400">{user.email}</p>

                            <div className="flex gap-4 mt-6 text-sm text-gray-300 bg-gray-950/50 px-6 py-2 rounded-full border border-gray-800">
                                <span className="flex items-center gap-1">
                                    <span className="text-red-500">Gender:</span>
                                    {user.gender} (Read Only)
                                </span>
                                <span className="w-px bg-gray-700 h-4 self-center"></span>
                                <span className="flex items-center gap-1">
                                    <span className="text-red-500">Joined:</span>
                                    {new Date().toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {/* Edit Form */}
                        <div className="p-8">
                            {message && (
                                <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-900/30 border border-green-800 text-green-400' : 'bg-red-900/30 border border-red-800 text-red-400'
                                    }`}>
                                    <span>{message.type === 'success' ? '✓' : '⚠'}</span>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Age</label>
                                        <input
                                            type="number"
                                            value={formData.age}
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Height (cm)</label>
                                        <input
                                            type="number"
                                            value={formData.height}
                                            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => router.push('/')}
                                        className="px-6 py-3 rounded-lg font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-red-900/20"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ProfilePage() {
    return (
        <ProtectedPage>
            <ProfileContent />
        </ProtectedPage>
    )
}
