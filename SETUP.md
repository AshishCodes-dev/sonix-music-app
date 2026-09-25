# 🎵 SONIQ Music App — Setup & Developer Guide

Yeh ek full-stack music streaming platform hai:
**Vite + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion**, backend me **Vercel Serverless Functions + Supabase (Postgres)** aur authentication ke liye **Firebase Auth (Google Sign-In + Email/Password + Instant Demo Access)**.

---

## 🚀 Quick Setup

### 1. Dependencies Install karein
```bash
npm install
```

### 2. Environment Variables (.env)
Project root me `.env` file banaayein:
```env
# YouTube Data API
YOUTUBE_API_KEY=your_youtube_api_key

# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Firebase Authentication (Google Sign-In + Email)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Local Development Chalayein
```bash
npm run dev
```
Ya backend serverless functions ke saath:
```bash
vercel dev
```

### 4. Production Build Test karein
```bash
npm run build
npm run preview
```

---

## 🔐 Authentication System

- **Google Sign-In**: Firebase `signInWithPopup` ke zariye instant login.
- **Email/Password**: Firebase Auth se safe signup aur login.
- **1-Click Demo Login**: Recruiter ya client ke quick testing ke liye instant 1-click login bina registration ke.
