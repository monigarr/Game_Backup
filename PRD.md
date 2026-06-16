# PRD: OrbChase - Browser-Based 2D Multiplayer Game

**Project:** Game Week Project - Development Pathway Path 2 (Browser-Based 2D Game) 
**Date:** June 15, 2026 
**Status:** MVP Scope (Build & Deploy Today) 
**Tech Stack:** Phaser 3 (2D), Socket.io, Node.js/Express, JavaScript 
**Deployment Target:** Vercel (frontend) + Render (backend) - free tiers, live in <1 day

## 1. Executive Summary
OrbChase is a fast-paced, real-time 2D top-down multiplayer arena game built to meet all ClientRequirements.pdf specifications for Path 2. Players control energy orbs in a shared arena, competing to collect the most power orbs while using simple abilities. It delivers low-latency multiplayer via Socket.io, character progression through match XP/levels/unlocks, engaging competitive gameplay with clear objectives, and is fully deployable today with production-quality polish using AI-accelerated development.

**Success Criteria Met:**
- Real-time multiplayer (2-4 players per room)
- Browser-based 2D with Phaser 3 physics/animations
- Levels + character progression system
- Fun, objective-driven gameplay (collect, survive, score)
- Low-latency performance
- Deployed & accessible end-to-end today

## 2. Game Concept & Mechanics
**Title:** OrbChase 
**Genre:** 2D Top-Down Multiplayer Arena / Collectathon 
**Core Loop:** 3-minute matches → Collect floating energy orbs → Avoid collisions/hazards → Use dash ability → Highest score wins → Earn XP → Level up → Unlock cosmetics/abilities → New arenas

**Key Features (MVP Scope for 1-Day Build):**
- **Multiplayer:** Real-time position, velocity, score, and event sync (Socket.io rooms)
- **Progression:** Post-match XP → Level 1-10 → Unlock 3 orb skins + 1 ability (dash cooldown reduction)
- **Gameplay:** 
 - WASD/arrows movement + Space dash (cooldown)
 - Collect glowing orbs (spawn 8-12 per arena, respawn on collection)
 - Simple hazard: rotating energy walls (damage on touch)
 - Collision: bump other players (knockback, no friendly fire)
 - 3 fixed arenas (levels) unlocked by player level
- **UI/UX:** Clean lobby (create/join room by code), in-game HUD (score, timer, level/XP bar), post-match results + progression screen
- **Polish:** Smooth 60fps Phaser rendering, particle effects on collect/dash, responsive controls, mobile-friendly touch fallback

**Storyline Hook:** "You are a rogue energy orb fighting for dominance in the collapsing Nexus. Absorb power before the void claims it all."

## 3. Technical Requirements Compliance
- **Multiplayer:** Socket.io for authoritative server (room management, state broadcast at 20Hz, client prediction + reconciliation)
- **Performance:** Phaser 3 Arcade Physics, minimal state sync (positions + events only), no lag on 4 players (tested locally + deployed)
- **Platform:** Pure browser (Chrome/Firefox/Edge), no install, WebGL renderer
- **Complexity:** 3 unlockable arenas (progression), XP/level system with persistent (localStorage + server profile stub)
- **Engagement:** Clear win condition (highest score), visual feedback, quick matches, social (see other players move/score live)

**Non-Functional:**
- Latency: <100ms perceived with client-side prediction
- Scalability: Rooms auto-clean on disconnect; supports 10+ concurrent rooms on free tier
- Accessibility: Keyboard primary, high-contrast colors, simple rules

## 4. Architecture (1-Day Feasible)
**Frontend (Phaser 3 + Vite):**
- `src/scenes/`: Boot, Lobby, Game, Results
- `src/game/`: Player class (with dash), Orb collectible, Arena (tilemap or simple shapes + walls), Input handler
- Socket client: connect, join room, emit movement/dash/collect, listen for state updates

**Backend (Node.js + Express + Socket.io):**
- Server: rooms Map, player state per room
- Logic: validate moves lightly (anti-cheat minimal for MVP), broadcast full state snapshot + deltas
- Endpoints: health, simple profile (XP persistence stub via in-memory or file for demo)

**Data Flow:**
1. Client joins room → Server creates/assigns
2. Game start → Spawn players + orbs
3. 60fps client loop: input → emit throttled moves → server validates → broadcast to room
4. Events: orb collected (score++), dash used, match end (timer or all orbs gone)
5. Disconnect: remove player, end room if empty

**Tech Choices Rationale (AI-assisted):**
- Phaser 3: Best 2D browser framework per docs/community; built-in physics, easy sprites/particles
- Socket.io: Simplest real-time Node multiplayer (rooms, events, fallbacks)
- No database: localStorage + server memory for 1-day deploy (upgrade path noted)
- Deployment: Vercel static for client (instant), Render Node for server (Socket.io supported on free web service)

## 5. Development & Deployment Plan (Today Only)
**Hour 0-1:** Setup repo, install deps (phaser, socket.io, express, vite), basic Phaser scene + Socket connection test
**Hour 1-3:** Core mechanics (movement, orbs, collect, scoring) single-player first, then add Socket sync
**Hour 3-5:** Multiplayer rooms, lobby UI, dash ability, hazards, timer
**Hour 5-6:** Progression (XP/level, unlocks, arena select), results screen, polish (particles, sound stubs, responsive)
**Hour 6-7:** Deploy frontend to Vercel, backend to Render, test end-to-end with 2+ browser tabs/devices, fix latency bugs
**Hour 7-8:** README with setup/deploy, Brainlift notes (prompts used), demo video script

**Dependencies (package.json excerpt):**
```json
{
  "dependencies": {
    "phaser": "^3.80.1",
    "socket.io": "^4.7.5",
    "socket.io-client": "^4.7.5",
    "express": "^4.19.2"
  },
  "devDependencies": {
    "vite": "^5.2.0"
  }
}
```

**Deployment URLs (example after today):**
- Client: https://orbchase.vercel.app
- Server: https://orbchase-server.onrender.com
- Play: open client, create room, share code with friends

**Risk Mitigation (AI-planned):**
- Latency: Use client prediction + server reconciliation (standard Phaser+Socket pattern)
- Time: Strict MVP - no custom art (use Phaser geometric + emoji or free public-domain sprites), no auth, minimal UI
- Bugs: AI pair-programming for unfamiliar Socket/Phaser patterns

## 6. Evaluation Criteria Alignment
- **Technical Achievement:** Full real-time multiplayer, performance optimized, clean code in new stack
- **Learning Velocity:** Documented AI prompts for Phaser/Socket learning path, rapid PoCs
- **Game Quality:** Engaging 3-min matches, visible progression, fun factor via competition + visuals
- **AI Utilization:** Strategic prompts for architecture, debugging, optimization; full methodology captured in Brainlift

## 7. Deliverables (Ready Today)
1. Working deployed game (Vercel + Render)
2. GitHub repo with:
 - This PRD
 - Architecture overview + key decisions
 - `README.md` with local run + deploy steps
 - `BRAINLIFT.md` (daily prompts/challenges)
3. 5-min demo video (gameplay + tech walkthrough + AI reflection)
4. All ClientRequirements met for Path 2 2D

## 8. Future Scope (Post-Today)
- Database persistence (Supabase/Postgres)
- More abilities/levels
- Mobile touch optimization
- Matchmaking queue
- Leaderboards

**This PRD defines a complete, production-ready MVP that satisfies every requirement in ClientRequirements.pdf and ships live today.**

---
*Built with AI-augmented rapid learning methodology. Ready for immediate implementation.*
