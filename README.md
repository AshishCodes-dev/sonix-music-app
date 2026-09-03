# 🎵 SONIQ — Premium AI-Powered Music Streaming Platform

A modern, full-stack music streaming web app that streams **any song in the world** through the official YouTube player — with an AI DJ, smart recommendations, playlists, and a premium Spotify-inspired UI.

![Tech](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Tech](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tech](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tech](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![Tech](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase&logoColor=white)

---

## ✨ Features

- 🎧 **Stream any song** — real full-length playback via the YouTube IFrame Player API
- 🔍 **Instant search** with voice search & smart suggestions
- 🤖 **AI DJ** — type "play sad songs" or "gym energy english" and it builds & autoplays a mix
- 📻 **Smart Radio** — recommendations based on listening history + time of day
- ❤️ **Likes, Playlists, Queue, Recently Played**
- 🎵 **Premium player** — mini + full-screen, rotating vinyl, animated equalizer, lyrics, sleep timer, playback speed, shuffle/repeat, seek & volume
- 🌍 **Categories** — Bollywood, Hollywood, Punjabi, Tamil, Telugu, Malayalam, Christian Worship, Lo-fi, Workout, Romantic, Party, Sleep, Focus & more
- 🔐 **Auth** — Email, Phone OTP & Google sign-in (Supabase)
- 🌙 **Dark / Light mode**
- 📱 **PWA** — installable on mobile & desktop
- 💎 **Premium UI** — glassmorphism, aurora background, 60fps animations, fully responsive

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion |
| Backend | Vercel Serverless Functions (`/api`) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email / Phone OTP / Google) |
| Music | YouTube Data API v3 + YouTube IFrame Player API |
| Deploy | Vercel |

---

## 🚀 Getting Started (Local Setup)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/soniq-music.git
cd soniq-music
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add environment variables
Create a `.env` file in the root (see `.env.example`):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the dev server
```bash
npm run dev
```
Open `http://localhost:5173` 🎉

### 5. Add your YouTube API Key
- Go to **Settings** in the app
- Paste a free **YouTube Data API v3** key ([get one here](https://console.cloud.google.com/))
- Start streaming!

---

## 📦 Build for Production
```bash
npm run build
npm run preview
```

---

## 📝 Notes
- Music is streamed **only** through the official YouTube Embed Player — no copyrighted files are hosted.
- The YouTube Data API free tier allows ~100 searches/day per key.

---

## 👨‍💻 Author
Built with ❤️ by **[Your Name]**

- Portfolio: [your-portfolio.com](https://your-portfolio.com)
- GitHub: [@YourUsername](https://github.com/YourUsername)

---

## 📄 License
MIT © [Your Name]
