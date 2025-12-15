'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, hasCompletedOnboarding } from '../lib/auth'

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth')
      return
    }

    if (!hasCompletedOnboarding()) {
      router.push('/onboarding')
      return
    }
  }, [router])

  // Show nothing while checking/auth redirecting
  if (!isAuthenticated() || !hasCompletedOnboarding()) {
    return (
      <div className="min-h-screen gradient-red-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return <>{children}</>
}

