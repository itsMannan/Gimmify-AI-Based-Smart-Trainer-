# Gimmify - AI-Based Smart Trainer Documentation

## Project Overview
**Gimmify** is a premium, AI-powered personal fitness coaching platform. It leverages computer vision and artificial intelligence to provide real-time posture feedback, rep counting, and motivational coaching via voice and visual overlays. 

The application is built using a modern tech stack centered on **Next.js**, **Supabase**, and **MediaPipe**.

---

## Technical Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (with a custom dark/red/gray premium aesthetic)
- **Database & Auth**: Supabase
- **AI/ML**: MediaPipe (Pose Detection), OpenAI (ChatBot logic)
- **Visualizations**: Recharts

---

## Project Structure & File Guide

### 1. Core & Configuration
- `package.json`: Defines project dependencies and scripts (`dev`, `build`, `start`, `lint`).
- `next.config.js`: Next.js specific configuration.
- `tailwind.config.js`: Custom theme configurations, including color palettes (red-600, gray-950, etc.) and animations.
- `.env.local`: (Not in repo) Stores sensitive keys like `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `OPENAI_API_KEY`.
- `.env.local.example`: A template for environment variables with placeholders.

### 2. Application Logic & Pages (`app/`)
The `app` directory uses the Next.js App Router structure.

- `layout.tsx`: The root layout that persists across all pages. It sets up the HTML structure and global CSS.
- `page.tsx` (Dashboard): The central hub. It integrates the AI Camera and the Voice ChatBot. It is protected by a login requirement.
- `globals.css`: Contains global styles and custom utility classes like `gradient-red-black`.

#### Auth & Onboarding
- `auth/page.tsx`: Handles user authentication. Supports Email/Password, Google, Facebook, and Apple logins. It automatically creates a profile in Supabase upon the first login.
- `onboarding/page.tsx`: The first step for new users to enter physical metrics (Age, Height, Weight, Gender).
- `onboarding/preferences/page.tsx`: The second step for fitness goals, injury status, and feedback preferences.

#### User Management
- `profile/page.tsx`: Allows users to update personal details and upload a profile photo. Includes validation to ensure names only contain alphabetic characters.
- `performance/page.tsx`: Visualizes fitness progress using `Recharts`. Displays metrics like weight trends and workout frequency.
- `settings/page.tsx`: Manages application-wide preferences including:
    - **Theme**: Toggle between "Dark Mode" and "Light Mode".
    - **Camera Permissions**: granular control over when the AI camera activates.
    - **Account Security**: Interface for updating email and password.
    - **Subscription**: Information about the user's current plan and "Upgrade to Pro" options.

### 3. Shared Components (`app/components/`)
- `Header.tsx`: A responsive navigation bar. Features a dynamic profile dropdown, theme switcher, and user branding.
- `ProtectedPage.tsx`: A higher-order component that wraps secure pages. It ensures the user is authenticated and has a valid profile before rendering content.
- `BodyDetectionCamera.tsx`: The AI core. It uses **MediaPipe Pose** to:
    - Access the webcam.
    - Track 33 body keypoints in real-time.
    - Draw a skeleton overlay on the user's video feed.
    - (Extendable) Provide feedback on form based on joint angles.
- `VoiceChatBot.tsx`: A voice-interactive assistant that provides motivation and answers fitness questions.

### 4. Logic & Utilities (`app/lib/`)
- `supabase.ts`: Configures and exports the Supabase client for database and auth interactions.
- `auth.ts`: A comprehensive library of authentication and profile functions:
    - `getUser()` / `setUser()`: Manages local user state.
    - `fetchUserProfile()`: Retrieves data from the Supabase `profiles` table.
    - `updateUser()`: Updates profile data in the cloud.
    - `updateEmail()` / `updatePassword()`: Handles sensitive account updates.

### 5. Backend APIs (`app/api/`)
- `api/chat/route.ts`: An edge functions/serverless route that communicates with AI models (e.g., OpenAI) to power the ChatBot's intelligence.

### 6. Public Assets (`public/`)
- `mediapipe/pose/`: Stores the mandatory WASM files and pre-trained TFLite models required for the AI Pose detection to work offline/locally in the browser.

---

## Operational Flow
1. **Authentication**: User signs in via `auth/page.tsx`.
2. **Profile Check**: `ProtectedPage.tsx` checks if the user has completed onboarding.
3. **Dashboard**: User lands on `page.tsx` where they can chat with the AI or start a workout with the camera.
4. **AI Processing**: `BodyDetectionCamera.tsx` loads MediaPipe models from `public/` and starts analyzing movements.
5. **Data Persistence**: Updates to settings or profile are synced to Supabase via `app/lib/auth.ts`.
