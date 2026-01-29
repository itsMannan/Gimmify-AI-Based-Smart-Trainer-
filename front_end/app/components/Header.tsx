'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getUser, clearUser, syncUserSession, User } from '../lib/auth'

export default function Header() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [theme, setTheme] = useState<'dark' | 'light'>('dark')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const initUser = async () => {
            let userData = getUser()
            if (!userData) {
                // Try to sync from Supabase if localStorage is empty (e.g. new port)
                userData = await syncUserSession()
            }
            setUser(userData)
            if (userData?.settings?.theme) {
                setTheme(userData.settings.theme)
            }
        }

        initUser()

        // Listen for user updates
        const handleUserUpdate = (event: any) => {
            const newUser = event.detail
            setUser(newUser)
            if (newUser?.settings?.theme) {
                setTheme(newUser.settings.theme)
            }
        }

        window.addEventListener('gimmify-user-updated', handleUserUpdate)

        // Close dropdown when clicking outside
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            window.removeEventListener('gimmify-user-updated', handleUserUpdate)
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleLogout = async () => {
        await clearUser()
        router.push('/auth')
    }

    return (
        <header className={`${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#0a0a0c] border-[#1a1a1e]'} border-b sticky top-0 z-50 transition-colors duration-300`}>
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/" className={`text-2xl font-bold tracking-tight ${theme === 'light' ? 'text-gray-900 hover:text-red-600' : 'text-white hover:text-red-500'} transition-colors`}>
                    Gimmify
                </Link>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 focus:outline-none"
                            >
                                <div className="text-right mr-3">
                                    <p className={`text-sm font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{user.firstName} {user.lastName}</p>
                                    <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>{user.email}</p>
                                </div>
                                {user.profilePhoto ? (
                                    <img
                                        src={user.profilePhoto}
                                        alt="Profile"
                                        className="w-10 h-10 rounded-full border-2 border-red-600 object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-center text-white font-bold border-2 border-red-500">
                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                    </div>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className={`absolute right-0 mt-3 w-48 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-red-900/50'} border rounded-xl shadow-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2`}>
                                    <Link
                                        href="/profile"
                                        className={`flex items-center gap-3 px-4 py-3 ${theme === 'light' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-800 hover:text-white'} transition-colors`}
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        href="/performance"
                                        className={`flex items-center gap-3 px-4 py-3 ${theme === 'light' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-800 hover:text-white'} transition-colors`}
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        Performance
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className={`flex items-center gap-3 px-4 py-3 ${theme === 'light' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-800 hover:text-white'} transition-colors`}
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        Settings
                                    </Link>
                                    <div className={`h-px ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'} my-1`}></div>
                                    <button
                                        onClick={handleLogout}
                                        className={`w-full text-left flex items-center gap-3 px-4 py-3 text-red-400 ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800 hover:text-red-300'} transition-colors`}
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/auth"
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}
