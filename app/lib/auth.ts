// Simple auth utilities using localStorage
// In production, this should be replaced with proper authentication

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactInfo?: string;
  address?: string;
  provider?: 'email' | 'facebook' | 'gmail' | 'icloud';
  onboardingCompleted: boolean;
  gender?: 'Male' | 'Female';
  height?: number; // in cm
  weight?: number; // in kg
  workoutFrequency?: number; // times per week
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
}

export function clearUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('gimmify_user');
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
  provider?: 'email' | 'facebook' | 'gmail' | 'icloud';
}): User {
  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    onboardingCompleted: false,
  };
  setUser(user);
  return user;
}

export function updateUserOnboarding(data: {
  gender: 'Male' | 'Female';
  height: number;
  weight: number;
  workoutFrequency: number;
}): User | null {
  const user = getUser();
  if (!user) return null;
  
  const updatedUser: User = {
    ...user,
    ...data,
    onboardingCompleted: true,
  };
  setUser(updatedUser);
  return updatedUser;
}

