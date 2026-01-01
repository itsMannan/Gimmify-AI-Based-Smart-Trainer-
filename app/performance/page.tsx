'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, updateUser, User } from '../lib/auth'
import dynamic from 'next/dynamic'
import Header from '../components/Header'

// Dynamically import Recharts to avoid SSR issues
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false })

// Placeholder data generator if none exists
const generateMockData = () => [
    { month: 'Jan', weight: 80, height: 175, workoutCount: 12 },
    { month: 'Feb', weight: 79, height: 175, workoutCount: 15 },
    { month: 'Mar', weight: 78, height: 175, workoutCount: 18 },
    { month: 'Apr', weight: 77.5, height: 175, workoutCount: 20 },
    { month: 'May', weight: 76, height: 175, workoutCount: 22 },
    { month: 'Jun', weight: 75, height: 175, workoutCount: 25 },
]

export default function PerformancePage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [theme, setTheme] = useState<'dark' | 'light'>('dark')
    const [message, setMessage] = useState('')

    // Form Local States
    const [weight, setWeight] = useState<string>('')
    const [height, setHeight] = useState<string>('')
    const [age, setAge] = useState<string>('')
    const [injury, setInjury] = useState<string>('None')
    const [frequency, setFrequency] = useState<string>('')

    useEffect(() => {
        const userData = getUser()
        if (!userData) {
            router.push('/auth')
            return
        }
        setUser(userData)
        setWeight(userData.weight?.toString() || '70')
        setHeight(userData.height?.toString() || '170')
        setAge(userData.age?.toString() || '25')
        setInjury(userData.injury || 'None')
        setFrequency(userData.weeklyWorkoutFrequency?.toString() || '3')

        if (userData?.settings?.theme) {
            setTheme(userData.settings.theme)
        }
        setLoading(false)

        const handleUpdate = (event: CustomEvent) => {
            const newUser = event.detail
            if (newUser) {
                setUser(newUser)
                if (newUser?.settings?.theme) {
                    setTheme(newUser.settings.theme)
                }
            }
        }
        window.addEventListener('gimmify-user-updated', handleUpdate as EventListener)
        return () => window.removeEventListener('gimmify-user-updated', handleUpdate as EventListener)
    }, [router])

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setLoading(true)
        const updated = await updateUser({
            weight: parseFloat(weight),
            height: parseFloat(height),
            age: parseInt(age),
            injury,
            weeklyWorkoutFrequency: parseInt(frequency)
        })

        if (updated) {
            setUser(updated)
            setMessage('Performance stats saved successfully!')
            setTimeout(() => setMessage(''), 3000)
        }
        setLoading(false)
    }

    if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>

    return (
        <main className={`min-h-screen transition-colors duration-500 ${theme === 'light' ? 'bg-gray-50' : 'bg-[#0a0a0c]'}`}>
            <Header />

            <div className="container mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className={`text-4xl font-black tracking-tight mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Performance Metrics</h1>
                        <p className="text-gray-500 font-medium">Track your fitness journey and body stats</p>
                    </div>
                </div>

                {message && (
                    <div className="bg-green-600/10 text-green-400 p-4 rounded-xl border border-green-600/20 text-center animate-in fade-in zoom-in duration-300 mb-8">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {/* Metric Cards - Now Input Fields */}
                        <div className={`${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#0d0d12] border-red-900/20'} border p-8 rounded-[32px] shadow-xl transition-all`}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 text-xl font-bold">W</div>
                                <div>
                                    <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Weight (kg)</p>
                                    <input
                                        type="number"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        className={`text-2xl font-black w-full bg-transparent border-none focus:ring-0 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}
                                        placeholder="70"
                                    />
                                </div>
                            </div>
                            <div className={`h-1 w-full rounded-full ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
                                <div className="h-full bg-red-600 rounded-full" style={{ width: `${Math.min((parseFloat(weight) || 0) / 1.5, 100)}%` }}></div>
                            </div>
                        </div>

                        <div className={`${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#0d0d12] border-red-900/20'} border p-8 rounded-[32px] shadow-xl transition-all`}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">H</div>
                                <div>
                                    <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Height (cm)</p>
                                    <input
                                        type="number"
                                        value={height}
                                        onChange={(e) => setHeight(e.target.value)}
                                        className={`text-2xl font-black w-full bg-transparent border-none focus:ring-0 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}
                                        placeholder="170"
                                    />
                                </div>
                            </div>
                            <div className={`h-1 w-full rounded-full ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
                                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min((parseFloat(height) || 0) / 2.2, 100)}%` }}></div>
                            </div>
                        </div>

                        <div className={`${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#0d0d12] border-red-900/20'} border p-8 rounded-[32px] shadow-xl transition-all`}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 text-xl font-bold">A</div>
                                <div>
                                    <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Age</p>
                                    <input
                                        type="number"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        className={`text-2xl font-black w-full bg-transparent border-none focus:ring-0 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}
                                        placeholder="25"
                                    />
                                </div>
                            </div>
                            <div className={`h-1 w-full rounded-full ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
                                <div className="h-full bg-orange-600 rounded-full" style={{ width: `${Math.min((parseInt(age) || 0) * 1.5, 100)}%` }}></div>
                            </div>
                        </div>

                        <div className={`${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#0d0d12] border-red-900/20'} border p-8 rounded-[32px] shadow-xl transition-all`}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 text-xl font-bold">I</div>
                                <div>
                                    <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Injury Status</p>
                                    <select
                                        value={injury}
                                        onChange={(e) => setInjury(e.target.value)}
                                        className={`text-lg font-black w-full bg-transparent border-none focus:ring-0 ${theme === 'light' ? 'text-gray-900' : 'text-white'} appearance-none cursor-pointer`}
                                    >
                                        <option value="None">None</option>
                                        <option value="Knee">Knee</option>
                                        <option value="Back">Back</option>
                                        <option value="Shoulder">Shoulder</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={`${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#0d0d12] border-red-900/20'} border p-8 rounded-[32px] shadow-xl transition-all`}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 text-xl font-bold">F</div>
                                <div>
                                    <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Workouts/Week</p>
                                    <input
                                        type="number"
                                        value={frequency}
                                        onChange={(e) => setFrequency(e.target.value)}
                                        className={`text-2xl font-black w-full bg-transparent border-none focus:ring-0 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}
                                        placeholder="3"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center p-8">
                            <button
                                type="submit"
                                className="w-full bg-[#cc2d2d] hover:bg-[#b02424] text-white font-black py-6 rounded-[24px] transition-all shadow-xl hover:shadow-[#cc2d2d]/20 active:scale-95 text-xl"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Performance Chart */}
                    <div className={`${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#0d0d12] border-red-900/20'} border p-8 rounded-[32px] shadow-xl`}>
                        <h3 className={`text-xl font-black mb-8 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Monthly Progress</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={user?.performanceData || generateMockData()}>
                                    <XAxis
                                        dataKey="month"
                                        stroke={theme === 'light' ? '#6b7280' : '#4b5563'}
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: theme === 'light' ? '#f3f4f6' : '#1f2937' }}
                                        contentStyle={{
                                            backgroundColor: theme === 'light' ? '#fff' : '#111827',
                                            border: 'none',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Bar
                                        dataKey="workoutCount"
                                        fill="#cc2d2d"
                                        radius={[6, 6, 0, 0]}
                                        barSize={30}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Performance Record Table */}
                    <div className={`${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#0d0d12] border-red-900/20'} border p-8 rounded-[32px] shadow-xl`}>
                        <h3 className={`text-xl font-black mb-8 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Performance Record</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className={`border-b ${theme === 'light' ? 'border-gray-100' : 'border-gray-800'}`}>
                                        <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-widest">Month</th>
                                        <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-widest">Weight</th>
                                        <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-widest">Workouts</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-transparent">
                                    {(user?.performanceData || generateMockData()).map((row, i) => (
                                        <tr key={i} className="group">
                                            <td className={`py-4 font-bold ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>{row.month}</td>
                                            <td className={`py-4 font-black ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{row.weight} kg</td>
                                            <td className="py-4">
                                                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-black">
                                                    {row.workoutCount}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
