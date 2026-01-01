'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, hasCompletedOnboarding, fetchUserProfile, getUser } from '../lib/auth'
import { supabase } from '../lib/supabase'

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. Fast check: Local Storage
        if (isAuthenticated() && hasCompletedOnboarding()) {
          setLoading(false)
          return
        }

        // 2. Authoritative check: Supabase Session
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push('/auth')
          return
        }

        // 3. Sync Profile
        const profile = await fetchUserProfile(session.user.id)

        if (!profile || !profile.onboardingCompleted) {
          router.push('/onboarding')
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth')
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen gradient-red-black flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading Gimmify...</div>
      </div>
    )
  }

  return <>{children}</>
}

