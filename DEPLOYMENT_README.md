# OrbChase Deployment Guide (External Steps)

This guide covers all work **outside this code repository** required to deploy OrbChase live, test end-to-end, and complete the project deliverables. All code changes (Socket.io rooms, game logic, etc.) are already complete inside the repo.

## Prerequisites (Accounts & Setup)
- GitHub account (free)
- Vercel account (free tier, sign in with GitHub)
- Render account (free tier, sign in with GitHub)
- Modern browser (Chrome/Edge/Firefox) for testing
- Git installed locally (for push)
- Your local repo is already initialized and has all files from this project

## Step 1: Push Code to GitHub (Required for Deploy)
- Open terminal in `d:\GFA_Cohort_5\Week_Seven\Game_Backup`
- Run these commands:
  - `git init` (if not already a repo)
  - `git add .`
  - `git commit -m "OrbChase MVP - Phaser 3 + Socket.io multiplayer ready for deploy"`
  - Create a new repo on GitHub.com named `orbchase` (or your choice)
  - `git remote add origin https://github.com/YOUR_USERNAME/orbchase.git`
  - `git branch -M main`
  - `git push -u origin main`
- Verify all files (including `render.yaml`, `server/index.js`, `src/game/SocketManager.js`) are in the repo

## Step 2: Deploy Frontend to Vercel (Client)
- Go to https://vercel.com and log in
- Click "Add New Project" → Import Git Repository → select your `orbchase` repo
- Vercel auto-detects Vite: 
  - Build Command: `npm run build`
  - Output Directory: `dist`
- Click Deploy
- Once live, copy the production URL (e.g. `https://orbchase-xxx.vercel.app`)
- Test locally first if desired: `npm run build` then `npm run preview`

## Step 3: Deploy Backend to Render (Server)
- Go to https://render.com and log in
- Click "New +" → "Web Service"
- Connect your GitHub repo `orbchase`
- Render settings (or use the included `render.yaml`):
  - Name: `orbchase-server`
  - Environment: Node
  - Build Command: `npm install`
  - Start Command: `npm run server`
  - Plan: Free
- Click Create Web Service
- Wait for first deploy to finish (green status)
- Copy the production URL (e.g. `https://orbchase-server.onrender.com`)

## Step 4: Update Socket.io Production URL (Critical)
- Open `src/game/SocketManager.js` in your local editor
- Find the line:
  ```js
  this.socket = io(window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://orbchase-server.onrender.com');
  ```
- Replace `'https://orbchase-server.onrender.com'` with your actual Render URL from Step 3
- Save the file
- Commit and push the change:
  - `git add src/game/SocketManager.js`
  - `git commit -m "Update production Socket.io URL for Render"`
  - `git push`
- Vercel will auto-redeploy the frontend with the new URL

## Step 5: End-to-End Testing (Multi-Device / Multi-Browser)
- Open the Vercel production URL in **at least 2 different browsers or devices** (e.g. Chrome on laptop + Edge on same machine, or phone browser)
- In first tab: Click "QUICK MATCH (Arena 1)" or enter a room code and CREATE ROOM
- Copy the room code shown in the game title bar
- In second tab/device: Enter the same room code and JOIN ROOM (or use Quick Match if same code pattern)
- Verify:
  - Both players appear as different colored orbs
  - Moving one player updates position live on the other screen (real-time sync)
  - Collecting an orb increases score and removes it for both
  - Dash (SPACE) shows trail locally and triggers visual on other client
  - Hazard rotation and damage flash works
  - Timer counts down and ends match with Results screen showing XP/level progress
- Test with 3-4 tabs if possible to confirm room capacity
- Check browser console for any Socket errors (should be none)
- Test on mobile browser (touch may need keyboard, but visuals work)
- Confirm no lag on free tiers (Render free has ~30s cold start on first load)

## Step 6: Additional External Tasks & Polish
- Update README.md with your live Vercel URL once deployed
- Record the 5-minute demo video using the script in `DEMO_VIDEO_SCRIPT.md` (use OBS/Loom, capture live deployed game + code snippets)
- Create GitHub repo description: "OrbChase - Real-time 2D Phaser 3 + Socket.io multiplayer arena game. Path 2 submission for Game Week."
- (Optional but recommended) Add a `LICENSE` file if sharing publicly
- Verify Windows Update / storage is clear per your baseline rules before long deploy sessions (not code-related)
- Prepare Brainlift and PRD for submission alongside the deployed game link

## Troubleshooting External Issues
- Render deploy fails on start: Check logs for missing `npm run server` script (already in package.json)
- Socket connection error in console: Wrong production URL in SocketManager.js or Render service not awake (visit the Render URL once in browser to wake it)
- Vercel build fails: Ensure `vite.config.js` and `index.html` are present
- Players not seeing each other: Confirm both tabs joined the exact same roomCode string
- After URL change: Always push the commit so Vercel picks up the new SocketManager.js

## Success Checklist (Outside Repo Work)
- [ ] GitHub repo created and code pushed
- [ ] Vercel frontend live with custom URL
- [ ] Render backend live with custom URL
- [ ] SocketManager.js updated + pushed
- [ ] End-to-end test passed on 2+ devices/browsers with live sync
- [ ] Demo video recorded from deployed version
- [ ] All docs (README, BRAINLIFT, DEPLOYMENT_README) up to date

Once these external steps are done, your OrbChase game is fully deployed, tested, and meets every ClientRequirements.pdf deliverable for Path 2.

**You are ready to submit!**
