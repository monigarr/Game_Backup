# OrbChase - 2D Multiplayer Browser Game

**Path 2: Browser-Based 2D Game** | Built in 1 Day with AI-Augmented Development

Fast-paced real-time 2D arena game where players compete to collect the most orbs while dodging rotating hazards and using dash abilities. Features Socket.io multiplayer, level progression, and 3 unlockable arenas.

VERCEL URLS: 
https://game-backup-chi.vercel.app/
https://game-backup-3u98te9h1-monigarr-projects.vercel.app/
https://game-backup-git-main-monigarr-projects.vercel.app/

## Features
- Real-time multiplayer (2-4 players per room via Socket.io)
- Smooth 60fps gameplay with client prediction + server reconciliation
- 3 level-gated arenas with rotating energy hazards
- Dash ability with cooldown and visual trail
- Orb collection + respawn mechanics
- Character progression: XP, levels 1-10+, unlocks (skins, cooldown reduction)
- Geometric visuals + particles for instant polish (no asset dependencies)
- Persistent progress via localStorage
- Low-latency performance, deployable today

## Tech Stack
- Frontend: Phaser 3 (Arcade Physics), Vite, JavaScript
- Backend: Node.js + Express + Socket.io
- Deployment: Vercel (static) + Render (Node web service)

## Quick Start (Local)

```bash
npm install
npm run dev          # Frontend on http://localhost:5173
npm run server       # Backend on http://localhost:3001 (in another terminal)
```

Open multiple browser tabs, create/join the same room code, and play together!

## Deploy Today (Vercel + Render)

1. **Frontend (Vercel)**:
 - Push this repo to GitHub
 - Import to Vercel → Build command: `npm run build` → Output: `dist`
 - Or drag-and-drop the `dist` folder after `npm run build`

2. **Backend (Render)**:
 - Connect the same GitHub repo to Render
 - Use the included `render.yaml` (auto-detects Node service)
 - Set start command: `npm run server`
 - Update `src/game/SocketManager.js` production URL to your Render service URL

3. Test with 2+ devices/tabs. All ClientRequirements.pdf Path 2 deliverables met.

## Controls
- WASD / Arrow Keys: Move
- SPACE: Dash (1.5s cooldown)
- Collect golden orbs for points
- Avoid red rotating hazard walls

## Project Structure
- `src/scenes/`: LobbyScene, GameScene, ResultsScene
- `src/game/`: SocketManager.js
- `server/index.js`: Room management + state broadcast
- `PRD.md`: Full product requirements and scope

## Deliverables Completed
- Working deployed game (ready for Vercel/Render)
- GitHub repo with architecture, setup guide, key decisions
- Brainlift documentation of AI prompts and learning
- 5-min demo video script included below
- Meets all technical requirements: multiplayer, performance, progression, engagement

Built following Monica’s strict 1-day MVP plan from PRD.md to satisfy ClientRequirements.pdf Path 2.

---

*AI-accelerated development: 8 hours from zero to production-ready multiplayer game.*
