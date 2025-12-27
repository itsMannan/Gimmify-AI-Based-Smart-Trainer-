// Simple auth utilities using localStorage
// In production, this should be replaced with proper authentication

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  contactInfo?: string;
  address?: string;
  provider?: 'email' | 'facebook' | 'gmail' | 'apple';
  onboardingCompleted: boolean;
  gender?: 'Male' | 'Female' | 'Other';
  age?: number;
  height?: number; // in cm
  weight?: number; // in kg
  workoutFrequency?: number; // times per week
  weeklyWorkoutFrequency?: number;
  experienceLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  injury?: 'None' | 'Knee' | 'Back' | 'Shoulder' | 'Other' | string;
  feedbackPreference?: 'Real-time voice' | 'On-screen text' | 'After set summary';

  // Profile & Settings
  profilePhoto?: string;
  settings?: {
    theme: 'dark' | 'light';
    cameraPreference: 'always' | 'once' | 'while-using' | 'never';
  };
  performanceData?: Array<{
    month: string;
    weight: number;
    height: number;
    workoutCount: number;
  }>;
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('gimmify_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('gimmify_user', JSON.stringify(user));
  // Dispatch custom event for cross-component sync
  window.dispatchEvent(new CustomEvent('gimmify-user-updated', { detail: user }));
}

export function clearUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('gimmify_user');
  window.dispatchEvent(new CustomEvent('gimmify-user-updated', { detail: null }));
}

export function isAuthenticated(): boolean {
  return getUser() !== null;
}

export function hasCompletedOnboarding(): boolean {
  const user = getUser();
  return user?.onboardingCompleted ?? false;
}

export function createUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  contactInfo?: string;
  address?: string;
  provider?: 'email' | 'facebook' | 'gmail' | 'apple';
}): User {
  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    onboardingCompleted: false,
    settings: {
      theme: 'dark',
      cameraPreference: 'while-using'
    }
  };
  setUser(user);
  return user;
}

export function updateUser(data: Partial<User>): User | null {
  const user = getUser();
  if (!user) return null;

  const updatedUser: User = {
    ...user,
    ...data,
  };

  // Merge settings if provided partially
  if (data.settings && user.settings) {
    updatedUser.settings = { ...user.settings, ...data.settings };
  }

  setUser(updatedUser);
  return updatedUser;
}

export function updateUserOnboarding(data: Partial<User>): User | null {
  const user = getUser();
  if (!user) return null;

  const updatedUser: User = {
    ...user,
    ...data,
    // Only mark as completed if we have all necessary fields (checking a key field from step 2)
    onboardingCompleted: data.feedbackPreference ? true : user.onboardingCompleted,
  };
  setUser(updatedUser);
  return updatedUser;
}

