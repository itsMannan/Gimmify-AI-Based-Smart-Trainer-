'use client'

import Image from 'next/image'
import BodyDetectionCamera from './components/BodyDetectionCamera'
import VoiceChatBot from './components/VoiceChatBot'
import ProtectedPage from './components/ProtectedPage'
import { getUser, clearUser } from './lib/auth'
import { useRouter } from 'next/navigation'

function LearningPageContent() {
    const router = useRouter()
    const user = getUser()

    const handleLogout = () => {
        clearUser()
        router.push('/auth')
    }

    return (
        <div className="min-h-screen gradient-black-red bg-gray-950">
            {/* Header with User Info */}
            <div className="bg-gray-900 border-b border-red-900/50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white">Gimmify</h1>
                    <div className="flex items-center gap-4">
                        {user && (
                            <span className="text-gray-300">
                                Welcome, {user.firstName} {user.lastName}
                            </span>
                        )}
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                        Gimmify
                    </h1>
                    <p className="text-xl md:text-2xl text-red-200 max-w-3xl mx-auto">
                        Your 24/7 personal fitness coach with real-time posture feedback and AI-powered motivation
                    </p>
                </div>

                {/* Hero Image - Exercise with Pose Detection */}
                <section className="mb-16">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                        <div className="relative h-96 md:h-[500px] w-full">
                            <Image
                                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop"
                                alt="Person doing exercise with AI pose detection"
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end">
                                <div className="p-8 md:p-12 text-white w-full">
                                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                        Real-Time Pose Detection
                                    </h2>
                                    <p className="text-lg md:text-xl max-w-2xl opacity-90">
                                        Watch as our AI analyzes your form in real-time, providing instant feedback on your posture and technique
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Top Features: Chat Bot & Body Detection */}
                <section className="mb-16">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                            {/* Left Column: Voice Chat Bot */}
                            <div className="w-full">
                                <VoiceChatBot />
                            </div>

                            {/* Right Column: Body Detection */}
                            <div className="w-full bg-gray-900 border border-red-900/50 rounded-2xl shadow-xl p-6 md:p-8">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                        Try Body Detection
                                    </h2>
                                    <p className="text-gray-300 max-w-lg mx-auto">
                                        Experience real-time AI pose analysis. Click "Start" to activate the camera.
                                    </p>
                                </div>
                                <div className="flex justify-center">
                                    <BodyDetectionCamera
                                        width={500}
                                        height={380}
                                        enableDetection={true}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Exercise Gallery - Pose Detection in Action */}
                <section className="mb-16">
                    <div className="bg-gray-900 border border-red-900/50 rounded-2xl shadow-xl p-8 md:p-12">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">
                            Pose Detection in Action
                        </h2>
                        <p className="text-center text-gray-300 mb-10 text-lg max-w-3xl mx-auto">
                            Our AI technology tracks your movements and provides real-time feedback on your exercise form
                        </p>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Push-ups */}
                            <div className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                                <div className="relative h-64 w-full">
                                    <Image
                                        src="https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=600&h=600&fit=crop"
                                        alt="Person doing push-ups with pose detection"
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                            <h3 className="font-bold text-lg mb-1">Push-Ups</h3>
                                            <p className="text-sm opacity-90">Real-time form correction</p>
                                        </div>
                                    </div>
                                    <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                        Pose Detection
                                    </div>
                                </div>
                            </div>

                            {/* Squats */}
                            <div className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                                <div className="relative h-64 w-full">
                                    <Image
                                        src="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=600&h=600&fit=crop"
                                        alt="Person doing squats with pose detection"
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                            <h3 className="font-bold text-lg mb-1">Squats</h3>
                                            <p className="text-sm opacity-90">Knee alignment tracking</p>
                                        </div>
                                    </div>
                                    <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                        Pose Detection
                                    </div>
                                </div>
                            </div>

                            {/* Yoga */}
                            <div className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                                <div className="relative h-64 w-full">
                                    <Image
                                        src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop"
                                        alt="Person doing yoga pose with pose detection"
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                            <h3 className="font-bold text-lg mb-1">Yoga Poses</h3>
                                            <p className="text-sm opacity-90">Posture precision</p>
                                        </div>
                                    </div>
                                    <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                        Pose Detection
                                    </div>
                                </div>
                            </div>

                            {/* Planks */}
                            <div className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                                <div className="relative h-64 w-full">
                                    <Image
                                        src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop"
                                        alt="Person doing planks with pose detection"
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                            <h3 className="font-bold text-lg mb-1">Planks</h3>
                                            <p className="text-sm opacity-90">Core alignment check</p>
                                        </div>
                                    </div>
                                    <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                        Pose Detection
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Goal Section */}
                <section className="mb-16">
                    <div className="bg-gray-900 border border-red-900/50 rounded-2xl shadow-xl p-8 md:p-12">
                        <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                            <span className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4 text-xl">
                                1
                            </span>
                            Goal
                        </h2>
                        <p className="text-lg text-gray-300 leading-relaxed">
                            An AI-based trainer that gives <strong className="text-red-400">real-time feedback</strong> on exercise posture,
                            counts reps, and motivates users using <strong className="text-red-500">voice + video feedback</strong>.
                            Transform your home workouts with intelligent coaching that adapts to your needs.
                        </p>
                    </div>
                </section>

                {/* Key AI Platforms */}
                <section className="mb-16">
                    <div className="bg-gray-900 border border-red-900/50 rounded-2xl shadow-xl p-8 md:p-12">
                        <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                            <span className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4 text-xl">
                                2
                            </span>
                            Key AI Platforms
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            {['OpenAI', 'Claude', 'MediaPipe', 'HuggingFace', 'ElevenLabs', 'Groq', 'Reka.AI'].map((platform) => (
                                <div
                                    key={platform}
                                    className="bg-gradient-to-br from-red-900/50 to-gray-800 border border-red-900/50 rounded-lg p-4 text-center hover:shadow-md hover:border-red-600 transition-all"
                                >
                                    <p className="font-semibold text-white">{platform}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Technical & Non-Technical Terms */}
                <section className="mb-16">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Technical Terms */}
                        <div className="bg-gray-900 border border-red-900/50 rounded-2xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <span className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                                    ⚙️
                                </span>
                                Technical Terms
                            </h2>
                            <div className="space-y-3">
                                {['Pose Estimation', 'Computer Vision', 'Deep Learning', 'Real-Time Feedback', 'Speech Synthesis'].map((term) => (
                                    <div
                                        key={term}
                                        className="bg-gradient-to-r from-red-900/30 to-gray-800 border-l-4 border-red-600 p-3 rounded"
                                    >
                                        <p className="font-medium text-white">{term}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Non-Technical Terms */}
                        <div className="bg-gray-900 border border-red-900/50 rounded-2xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <span className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                                    💪
                                </span>
                                Non-Technical Terms
                            </h2>
                            <div className="space-y-3">
                                {['Fitness Coaching', 'Motivation', 'Posture Correction', 'Health Tracking'].map((term) => (
                                    <div
                                        key={term}
                                        className="bg-gradient-to-r from-red-900/30 to-gray-800 border-l-4 border-red-600 p-3 rounded"
                                    >
                                        <p className="font-medium text-white">{term}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Selling & Buying Points */}
                <section className="mb-16">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl shadow-xl p-8 text-white border border-red-900/50">
                            <h2 className="text-2xl font-bold mb-4">Selling Point</h2>
                            <p className="text-lg leading-relaxed">
                                Provides <strong>24/7 personal training</strong> at home with instant feedback and motivation.
                                No scheduling, no waiting—just pure, intelligent coaching whenever you need it.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-8 text-white border border-red-900/50">
                            <h2 className="text-2xl font-bold mb-4">Buying Point</h2>
                            <p className="text-lg leading-relaxed">
                                <strong>Affordable and private</strong> alternative to gym trainers. Get professional-quality
                                coaching without the premium price tag or the need to leave your home.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Competitors */}
                <section className="mb-16">
                    <div className="bg-gray-900 border border-red-900/50 rounded-2xl shadow-xl p-8 md:p-12">
                        <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                            <span className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4 text-xl">
                                3
                            </span>
                            Competitors
                        </h2>
                        <div className="flex flex-wrap gap-4 mt-6">
                            {['Freeletics', 'Fitbod', 'Kaia Health'].map((competitor) => (
                                <div
                                    key={competitor}
                                    className="bg-gradient-to-br from-red-900/50 to-gray-800 border-2 border-red-900/50 rounded-lg px-6 py-3 hover:border-red-600 transition-colors"
                                >
                                    <p className="font-semibold text-white">{competitor}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Unique Edge */}
                <section className="mb-16">
                    <div className="bg-gradient-to-r from-red-600 via-red-700 to-gray-900 rounded-2xl shadow-xl p-8 md:p-12 text-white border border-red-900/50">
                        <h2 className="text-3xl font-bold mb-6">Unique Edge</h2>
                        <p className="text-xl leading-relaxed mb-8">
                            Combines <strong>real-time form correction + AI voice motivation</strong> in one comprehensive system.
                            While competitors focus on one aspect, we deliver the complete training experience.
                        </p>

                        {/* Feature Image */}
                        <div className="relative rounded-xl overflow-hidden mt-8 h-80 md:h-96">
                            <Image
                                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=600&fit=crop"
                                alt="Gimmify real-time feedback system"
                                fill
                                className="object-cover opacity-90"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600/80 to-gray-900/80 flex items-center justify-center">
                                <div className="text-center p-8">
                                    <h3 className="text-2xl md:text-3xl font-bold mb-4">Real-Time Feedback System</h3>
                                    <p className="text-lg opacity-90 max-w-2xl">
                                        Experience instant posture analysis and personalized coaching recommendations
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works - Exercise Demo */}
                <section className="mb-16">
                    <div className="bg-gray-900 border border-red-900/50 rounded-2xl shadow-xl p-8 md:p-12">
                        <h2 className="text-3xl font-bold text-white mb-4 text-center">
                            How It Works
                        </h2>
                        <p className="text-center text-gray-300 mb-10 text-lg max-w-2xl mx-auto">
                            See how our AI analyzes your movements and provides instant feedback
                        </p>

                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div className="relative h-96 rounded-xl overflow-hidden shadow-lg">
                                <Image
                                    src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop"
                                    alt="Exercise demonstration with pose detection overlay"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <div className="bg-red-600/90 backdrop-blur-sm rounded-lg p-4">
                                            <p className="font-semibold">✓ Posture Detected</p>
                                            <p className="text-sm opacity-90">Real-time analysis active</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-red-600/20 rounded-full p-3 border border-red-600/50">
                                        <span className="text-2xl">📸</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg mb-2">1. Camera Detection</h3>
                                        <p className="text-gray-300">
                                            Your camera captures your movements in real-time using advanced computer vision
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-red-600/20 rounded-full p-3 border border-red-600/50">
                                        <span className="text-2xl">🤖</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg mb-2">2. AI Analysis</h3>
                                        <p className="text-gray-300">
                                            Our AI analyzes 33 body keypoints to track your posture and form accurately
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-red-600/20 rounded-full p-3 border border-red-600/50">
                                        <span className="text-2xl">💬</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg mb-2">3. Instant Feedback</h3>
                                        <p className="text-gray-300">
                                            Receive voice and visual feedback to correct your form and improve technique
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-red-600/20 rounded-full p-3 border border-red-600/50">
                                        <span className="text-2xl">📊</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg mb-2">4. Track Progress</h3>
                                        <p className="text-gray-300">
                                            Monitor your improvements with detailed analytics and rep counting
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>



                {/* Impact on Customers */}
                <section className="mb-16">
                    <div className="bg-gray-900 border border-red-900/50 rounded-2xl shadow-xl p-8 md:p-12">
                        <h2 className="text-3xl font-bold text-white mb-6">Impact on Customers</h2>
                        <div className="grid md:grid-cols-3 gap-6 mt-6">
                            {[
                                { icon: '❤️', title: 'Promotes Health', desc: 'Better fitness outcomes' },
                                { icon: '⏰', title: 'Saves Time', desc: 'No travel needed' },
                                { icon: '💰', title: 'Saves Cost', desc: 'Affordable alternative' },
                                { icon: '📈', title: 'Encourages Consistency', desc: 'Regular workout habits' },
                            ].map((impact) => (
                                <div
                                    key={impact.title}
                                    className="bg-gradient-to-br from-red-900/30 to-gray-800 border border-red-900/50 rounded-lg p-6 text-center hover:shadow-lg hover:border-red-600 transition-all"
                                >
                                    <div className="text-4xl mb-3">{impact.icon}</div>
                                    <h3 className="font-bold text-white mb-2">{impact.title}</h3>
                                    <p className="text-gray-300 text-sm">{impact.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Customer Attraction, Satisfaction, Range */}
                <section className="mb-16">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-gray-900 border border-red-900/50 rounded-2xl shadow-xl p-8">
                            <h3 className="text-xl font-bold text-white mb-4">Customer Attraction</h3>
                            <p className="text-gray-300">
                                <strong className="text-red-400">Free demo interaction</strong> with AI trainer.
                                Try before you buy and experience the power of AI coaching.
                            </p>
                        </div>
                        <div className="bg-gray-900 border border-red-900/50 rounded-2xl shadow-xl p-8">
                            <h3 className="text-xl font-bold text-white mb-4">Customer Satisfaction</h3>
                            <p className="text-gray-300">
                                <strong className="text-red-400">High</strong> due to personalization and motivation features.
                                Users love the tailored experience.
                            </p>
                        </div>
                        <div className="bg-gray-900 border border-red-900/50 rounded-2xl shadow-xl p-8">
                            <h3 className="text-xl font-bold text-white mb-4">Customer Range</h3>
                            <p className="text-gray-300">
                                <strong className="text-red-400">Fitness enthusiasts</strong>, home users, and beginners.
                                Suitable for all fitness levels.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="text-center mb-16">
                    <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl shadow-xl p-12 text-white border border-red-900/50">
                        <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Workouts?</h2>
                        <p className="text-xl mb-8 opacity-90">
                            Experience the future of fitness training with Gimmify
                        </p>
                        <button className="bg-white text-red-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg shadow-lg">
                            Try Free Demo
                        </button>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 border-t border-red-900/50 text-white py-8">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-400">© 2024 Gimmify. All rights reserved.</p>
                </div>
            </footer>
        </div >
    )
}

export default function LearningPage() {
    return (
        <ProtectedPage>
            <LearningPageContent />
        </ProtectedPage>
    )
}
