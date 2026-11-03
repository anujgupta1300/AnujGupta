# Anuj Gupta — Portfolio

A modern, animated personal portfolio showcasing my projects, research, experience, certificates, and photography. Built with React, TypeScript, and Tailwind CSS, with a working contact form backed by Supabase.

**Live site:** <!-- add your Vercel URL here, e.g. https://your-site.vercel.app -->

---

## Features

- **Single-page layout** with smooth section navigation: Hero, About, Tech Stack, Projects, Work, Experience, Research, Achievements, Certificates, Photography, and Contact
- **Polished animations** powered by Motion, including scroll reveals, tilt cards, and an image wheel
- **Contact form** that stores messages in Supabase and sends an email notification to the owner
- **Spam protection** through a hidden honeypot field and row-level security (public visitors can only submit, never read)
- **Responsive design** that works across mobile, tablet, and desktop
- **Fast builds and deploys** with Vite, ready for Vercel

## Tech Stack

| Area | Tools |
| --- | --- |
| Framework | React 18, TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS, shadcn/ui (Radix UI) |
| Animation | Motion |
| Routing and data | React Router, TanStack Query |
| Backend | Supabase (Postgres + Edge Functions) |
| Email | Resend |
| Hosting | Vercel |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/anujgupta1300/Anuj-Gupta-2026.git

# 2. Go into the project folder
cd Anuj-Gupta-2026

# 3. Install dependencies
npm install

# 4. Set up environment variables
cp .env.example .env.local
# then open .env.local and fill in your Supabase values

# 5. Start the dev server
npm run dev
```

The app runs at `http://localhost:8080`.

### Environment Variables

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase publishable key (`sb_publishable_...`) |

Both values are safe to expose in the browser. Never put a secret key or an email-provider key in these variables. Server-side secrets belong in the Supabase Edge Function environment only.

## Available Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the development server |
| `npm run build` | Creates a production build in `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs ESLint |

## Project Structure

```
.
├── public/               # Static assets (images, resume, favicon)
├── src/
│   ├── components/       # Page sections and UI components
│   │   └── ui/           # shadcn/ui primitives
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Supabase client, motion presets, utilities
│   ├── pages/            # Route pages
│   ├── App.tsx           # Routes and providers
│   └── main.tsx          # App entry point
├── supabase/
│   ├── migrations/       # Database schema (contact_messages table + RLS)
│   └── functions/        # Edge Function that emails new messages
├── vercel.json           # Vercel build and routing config
└── SUPABASE_SETUP.md     # Full contact form setup guide
```

## Contact Form Setup

The contact form saves each message to Supabase and emails it to the site owner:

```
Contact form → Supabase table → Edge Function → Resend → Inbox
```

Follow the step-by-step guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to create the table, deploy the Edge Function, and connect the database webhook.

## Deployment

The site is deployed on [Vercel](https://vercel.com).

1. Push this repository to GitHub.
2. Import the repository in Vercel. It detects Vite automatically (build command `npm run build`, output directory `dist`).
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` under **Settings → Environment Variables**.
4. Deploy. Every push to the main branch redeploys automatically.

> Environment variables are applied at build time. If you add or change them, trigger a redeploy.

## Contact

**Anuj Gupta**
Email: [anujgupta3600@gmail.com](mailto:anujgupta3600@gmail.com)
GitHub: [@anujgupta1300](https://github.com/anujgupta1300)

---

© 2026 Anuj Gupta. All rights reserved.
