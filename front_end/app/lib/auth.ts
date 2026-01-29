import { supabase } from './supabase';

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

/**
 * Re-syncs the local user state with the Supabase session and backend.
 * Crucial for cross-port transitions or hard refreshes.
 */
export async function syncUserSession(): Promise<User | null> {
  if (typeof window === 'undefined') return null;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    localStorage.removeItem('gimmify_user');
    return null;
  }

  const profile = await fetchUserProfile(session.user.id);
  if (profile) {
    setUser(profile);
    return profile;
  }

  // Fallback to basic info from session if profile doesn't exist yet
  const user: User = {
    id: session.user.id,
    email: session.user.email || '',
    firstName: session.user.user_metadata?.first_name || 'User',
    lastName: session.user.user_metadata?.last_name || '',
    onboardingCompleted: false,
    settings: {
      theme: 'dark',
      cameraPreference: 'while-using'
    }
  };
  setUser(user);
  return user;
}

export function cleanName(name: string): string {
  // Removes all characters except alphabets
  return name.replace(/[^a-zA-Z]/g, '');
}

/**
 * Extracts first and last name from an email address prefix.
 * e.g. "abdul.mannan231@yahoo.com" -> { firstName: "abdul", lastName: "mannan" }
 */
export function extractNameFromEmail(email: string): { firstName: string, lastName: string } {
  if (!email) return { firstName: 'User', lastName: '' };

  const prefix = email.split('@')[0];
  // Split by common separators: dot, underscore, dash
  const parts = prefix.split(/[._-]/);

  const firstName = cleanName(parts[0]) || 'User';
  const lastName = parts.slice(1).map(part => cleanName(part)).filter(p => p).join(' ');

  return { firstName, lastName };
}

export function setUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('gimmify_user', JSON.stringify(user));
  // Dispatch custom event for cross-component sync
  window.dispatchEvent(new CustomEvent('gimmify-user-updated', { detail: user }));
}

const BACKEND_URL = 'http://localhost:8000/api';

export async function fetchUserProfile(userId: string): Promise<User | null> {
  try {
    console.log(`Fetching profile from: ${BACKEND_URL}/profile/${userId}`);
    const response = await fetch(`${BACKEND_URL}/profile/${userId}`);
    if (!response.ok) {
      console.error(`Fetch profile failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log('Profile data received:', data);
    if (!data) return null;

    const user: User = {
      ...data,
      settings: {
        theme: 'dark',
        cameraPreference: 'while-using'
      }
    };

    setUser(user);
    return user;
  } catch (error) {
    console.error('Error fetching profile from FastAPI:', error);
    return null;
  }
}

export async function clearUser(): Promise<void> {
  if (typeof window === 'undefined') return;

  // Clear local storage
  localStorage.removeItem('gimmify_user');
  window.dispatchEvent(new CustomEvent('gimmify-user-updated', { detail: null }));

  // Sign out from Supabase
  await supabase.auth.signOut();
}

export function isAuthenticated(): boolean {
  return getUser() !== null;
}

export function hasCompletedOnboarding(): boolean {
  const user = getUser();
  return user?.onboardingCompleted ?? false;
}

export async function createUserProfile(user: User): Promise<User | null> {
  try {
    console.log('Creating profile:', user);
    const response = await fetch(`${BACKEND_URL}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error creating profile via FastAPI:', response.status, errorText);
      return null;
    }

    setUser(user);
    return user;
  } catch (error) {
    console.error('Error creating profile via FastAPI:', error);
    return null;
  }
}

export async function updateUser(data: Partial<User>): Promise<User | null> {
  const user = getUser();
  if (!user) return null;

  try {
    const response = await fetch(`${BACKEND_URL}/profile/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      console.error('Error updating profile via FastAPI');
      return null;
    }

    const updatedUser: User = {
      ...user,
      ...data,
    };

    setUser(updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('Error updating profile via FastAPI:', error);
    return null;
  }
}

export async function updateUserOnboarding(data: Partial<User>): Promise<User | null> {
  const user = getUser();
  const userId = user?.id;

  if (!userId) return null;

  const onboardingCompleted = data.feedbackPreference ? true : (user?.onboardingCompleted ?? false);

  try {
    console.log('Updating onboarding:', data);
    const response = await fetch(`${BACKEND_URL}/profile/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        onboardingCompleted
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error updating onboarding via FastAPI:', response.status, errorText);
      return null;
    }

    return await fetchUserProfile(userId);
  } catch (error) {
    console.error('Error updating onboarding via FastAPI:', error);
    return null;
  }
}

export async function updateEmail(email: string) {
  const { data, error } = await supabase.auth.updateUser({ email });
  if (error) {
    console.error('Error updating email:', error);
    return { error };
  }
  return { data };
}

export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error('Error updating password:', error);
    return { error };
  }
  return { data };
}

