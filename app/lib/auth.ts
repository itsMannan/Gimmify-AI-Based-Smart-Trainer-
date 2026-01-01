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

export function setUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('gimmify_user', JSON.stringify(user));
  // Dispatch custom event for cross-component sync
  window.dispatchEvent(new CustomEvent('gimmify-user-updated', { detail: user }));
}

export async function fetchUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  const user: User = {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    gender: data.gender,
    age: data.age,
    height: data.height,
    weight: data.weight,
    workoutFrequency: data.workout_frequency,
    weeklyWorkoutFrequency: data.workout_frequency,
    experienceLevel: data.experience_level,
    injury: data.injury,
    feedbackPreference: data.feedback_preference,
    onboardingCompleted: data.onboarding_completed,
    settings: {
      theme: 'dark',
      cameraPreference: 'while-using'
    }
  };

  setUser(user);
  return user;
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
  const { error } = await supabase
    .from('profiles')
    .upsert([{
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      onboarding_completed: false
    }], { onConflict: 'id' });

  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }

  setUser(user);
  return user;
}

export async function updateUser(data: Partial<User>): Promise<User | null> {
  const user = getUser();
  if (!user) return null;

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: data.firstName,
      last_name: data.lastName,
      gender: data.gender,
      age: data.age,
      height: data.height,
      weight: data.weight,
      workout_frequency: data.workoutFrequency || data.weeklyWorkoutFrequency,
      experience_level: data.experienceLevel,
      injury: data.injury,
      feedback_preference: data.feedbackPreference,
      onboarding_completed: data.onboardingCompleted
    })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  const updatedUser: User = {
    ...user,
    ...data,
  };

  setUser(updatedUser);
  return updatedUser;
}

export async function updateUserOnboarding(data: Partial<User>): Promise<User | null> {
  let user = getUser();
  let userId = user?.id;

  if (!userId) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      userId = session.user.id;
    }
  }

  if (!userId) return null;

  const onboardingCompleted = data.feedbackPreference ? true : (user?.onboardingCompleted ?? false);

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      gender: data.gender,
      age: data.age,
      height: data.height,
      weight: data.weight,
      workout_frequency: data.workoutFrequency,
      experience_level: data.experienceLevel,
      injury: data.injury,
      feedback_preference: data.feedbackPreference,
      onboarding_completed: onboardingCompleted,
      email: user?.email
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error updating onboarding:', error);
    return null;
  }

  // Re-fetch full profile to ensure we have everything and update local state
  return await fetchUserProfile(userId);
}

