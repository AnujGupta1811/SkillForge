# SkillForge

> Turn downtime into visibility.

SkillForge is a platform built for engineers between projects. Instead of sitting on the bench, engineers use SkillForge to find real problems to solve, generate full project specs with AI, collaborate with teammates, and build a portfolio that managers can actually see.

---

## The Problem

When engineers are between client projects, their work becomes invisible. They're learning, prototyping, and staying sharp — but there's no record of it, no structure, and no way for managers to see who's doing what.

SkillForge fixes that.

---

## Features

### AI Problem Curator
Tell SkillForge your skills and preferred difficulty. The AI scans GitHub issues, Hacker News, and Stack Overflow to surface real, unsolved problems that match your exact level — so you always have something meaningful to work on.

### Collaborative Workspace
Once a problem is picked, Claude (or Gemini) generates a full project spec — name, pitch, feature list, and tech stack. Publish it to the team board. Teammates can join, claim individual features, submit work for peer review, and earn points — just like a real sprint.

### Visibility Dashboard
Every contribution is tracked. Engineers get a points history, an activity heatmap, and skill tags on their profile. Managers get a live team dashboard showing who's active, what they're building, and how contributions are trending — turning bench time into visible career momentum.

---

## How It Works

```
1. Find a Problem   →   AI curates real problems matched to your skill level
2. Generate a Spec  →   Claude/Gemini turns it into a full project with features
3. Build Together   →   Teammates join, claim features, submit for review
4. Get Recognized   →   Earn points, grow your profile, managers see it all
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui |
| Database & Auth | Supabase |
| AI | Anthropic Claude / Google Gemini |
| UI Primitives | Radix UI, Lucide React |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) or [Google AI](https://aistudio.google.com) API key

### Setup

```bash
# Clone the repo
git clone https://github.com/your-username/skillforge.git
cd skillforge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Users bring their own AI API key (Anthropic or Gemini) via the in-app settings. No server-side key required.

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
skillforge/
├── app/                  # Next.js App Router pages & API routes
├── components/           # UI components (kanban, dashboard, modals, etc.)
├── lib/
│   ├── ai-call.ts        # Unified Claude / Gemini AI wrapper
│   ├── types.ts          # Shared TypeScript interfaces
│   └── utils.ts          # Helpers
└── public/               # Static assets
```

---

## Contributing

1. Fork the repo and create a branch
2. Make your changes
3. Open a pull request with a clear description

---

## License

MIT
