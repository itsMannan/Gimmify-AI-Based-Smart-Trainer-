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
      console.log('ProtectedPage: Starting auth check...')

      // Safety timeout
      const timeoutId = setTimeout(() => {
        console.warn('ProtectedPage: Auth check timed out')
        setLoading(false) // Allow render or redirect even if stuck?
      }, 5000)

      try {
        // 1. Fast check: Local Storage
        const localAuth = isAuthenticated()
        const localOnboarding = hasCompletedOnboarding()
        console.log('ProtectedPage: Local storage check', { localAuth, localOnboarding })

        if (localAuth && localOnboarding) {
          console.log('ProtectedPage: fast check passed')
          clearTimeout(timeoutId)
          setLoading(false)
          return
        }

        // 2. Authoritative check: Supabase Session
        console.log('ProtectedPage: Checking Supabase session...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('ProtectedPage: Session error', sessionError)
          throw sessionError
        }

        if (!session) {
          console.log('ProtectedPage: No session found, redirecting to /auth')
          clearTimeout(timeoutId)
          router.push('/auth')
          return
        }

        // 3. Sync Profile
        console.log('ProtectedPage: Fetching profile for', session.user.id)
        const profile = await fetchUserProfile(session.user.id)
        console.log('ProtectedPage: Profile fetched', profile)

        if (!profile || !profile.onboardingCompleted) {
          console.log('ProtectedPage: Incomplete profile, redirecting to /onboarding')
          clearTimeout(timeoutId)
          router.push('/onboarding')
        } else {
          console.log('ProtectedPage: Auth complete, loading content')
          clearTimeout(timeoutId)
          setLoading(false)
        }
      } catch (error) {
        console.error('ProtectedPage: Auth check failed:', error)
        clearTimeout(timeoutId)
        router.push('/auth')
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl animate-pulse font-bold">Loading Gimmify...</div>
      </div>
    )
  }

  return <>{children}</>
}

