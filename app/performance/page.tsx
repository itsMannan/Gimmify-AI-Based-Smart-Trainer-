'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getUser, updateUser, User } from '../lib/auth'
import Header from '../components/Header'
import ProtectedPage from '../components/ProtectedPage'

// Dynamically import Recharts components to avoid SSR issues
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false })
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false })

// Simulated initial performance data if none exists

// Simulated initial performance data if none exists
const DEFAULT_PERFORMANCE_DATA = [
    { month: 'Jan', weight: 75, workoutCount: 12 },
    { month: 'Feb', weight: 74.5, workoutCount: 15 },
    { month: 'Mar', weight: 73.8, workoutCount: 18 },
    { month: 'Apr', weight: 73.2, workoutCount: 16 },
    { month: 'May', weight: 72.5, workoutCount: 20 },
    { month: 'Jun', weight: 72.0, workoutCount: 22 },
]

function PerformanceContent() {
    const router = useRouter()
    const [user, setUserData] = useState<User | null>(null)
    const [formData, setFormData] = useState({
        weight: '',
        height: '',
        age: '',
    })
    const [performanceData, setPerformanceData] = useState<any[]>(DEFAULT_PERFORMANCE_DATA)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        const userData = getUser()
        if (userData) {
            setUserData(userData)
            setFormData({
                weight: userData.weight?.toString() || '',
                height: userData.height?.toString() || '',
                age: userData.age?.toString() || '',
            })
            if (userData.performanceData && userData.performanceData.length > 0) {
                setPerformanceData(userData.performanceData)
            }
        }
    }, [])

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault()

        // Update user stats
        const updated = updateUser({
            weight: parseFloat(formData.weight),
            height: parseFloat(formData.height),
            age: parseInt(formData.age),
        })

        if (updated) {
            setUserData(updated)
            setMessage({ type: 'success', text: 'Stats updated successfully!' })
            setTimeout(() => setMessage(null), 3000)
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-gray-950">
            <Header />

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-white">Performance Analytics</h1>
                        <button
                            onClick={() => router.push('/')}
                            className="text-gray-400 hover:text-white flex items-center gap-2"
                        >
                            <span>←</span> Back to Dashboard
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {/* Quick Stats Cards */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-red-900/30 shadow-lg">
                            <h3 className="text-gray-400 text-sm font-semibold mb-2">Current Weight</h3>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-bold text-white">{formData.weight}</span>
                                <span className="text-red-500 font-medium mb-1">kg</span>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-red-900/30 shadow-lg">
                            <h3 className="text-gray-400 text-sm font-semibold mb-2">Height</h3>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-bold text-white">{formData.height}</span>
                                <span className="text-red-500 font-medium mb-1">cm</span>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-red-900/30 shadow-lg">
                            <h3 className="text-gray-400 text-sm font-semibold mb-2">Age</h3>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-bold text-white">{formData.age}</span>
                                <span className="text-red-500 font-medium mb-1">yrs</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Chart Section */}
                        <div className="lg:col-span-2 bg-gray-900 border border-red-900/30 rounded-2xl shadow-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6">Progress Overview</h2>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={performanceData}>
                                        <defs>
                                            <linearGradient id="colorWorkout" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                        <XAxis dataKey="month" stroke="#9CA3AF" />
                                        <YAxis stroke="#9CA3AF" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="workoutCount"
                                            stroke="#DC2626"
                                            fillOpacity={1}
                                            fill="url(#colorWorkout)"
                                            name="Workouts"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-center text-gray-500 text-sm mt-4">Monthly Workout Frequency</p>
                        </div>

                        {/* Update Form */}
                        <div className="bg-gray-900 border border-red-900/30 rounded-2xl shadow-xl p-6 h-fit">
                            <h2 className="text-xl font-bold text-white mb-6">Update Metrics</h2>

                            {message && (
                                <div className="mb-4 p-3 bg-green-900/30 border border-green-800 text-green-400 rounded-lg text-sm">
                                    ✓ {message.text}
                                </div>
                            )}

                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Weight (kg)</label>
                                    <input
                                        type="number"
                                        value={formData.weight}
                                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-600 outline-none"
                                        step="0.1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Height (cm)</label>
                                    <input
                                        type="number"
                                        value={formData.height}
                                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-600 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Age</label>
                                    <input
                                        type="number"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-600 outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-2"
                                >
                                    Update Stats
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function PerformancePage() {
    return (
        <ProtectedPage>
            <PerformanceContent />
        </ProtectedPage>
    )
}
