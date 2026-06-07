# Connect 4 AI

A full-stack Connect 4 game featuring two AI engines — a Deep Q-Network trained through reinforcement learning and an Alpha-Beta pruning agent using minimax search. Play against either, or watch them battle each other.

---

## Overview

The project implements two fundamentally different approaches to game AI:

**DQN (Deep Q-Network)** — A convolutional neural network trained via 10,000 episodes of self-play. It approximates the Q-value function to evaluate board positions. Achieves 89% win rate against random opponents at its best checkpoint.

**Alpha-Beta Pruning** — A classical minimax algorithm with alpha-beta pruning and a hand-tuned heuristic evaluation function. Searches up to 6 moves ahead. Deterministic, no training required.

Both agents support three difficulty levels. The DQN uses different training checkpoints; Alpha-Beta uses different search depths (2, 4, 6).

---

## Features

- **Dual AI opponents** — Choose between DQN (reinforcement learning) or Alpha-Beta (game tree search)
- **AI vs AI mode** — Watch DQN battle Alpha-Beta with animated replay
- **Live Q-value panel** — Real-time visualization of the neural network's column evaluations
- **Game replays** — Every game saved with move-by-move playback
- **OAuth login** — GitHub and Google sign-in via Supabase
- **Three difficulty levels** — Easy, medium, hard for both agents

---

## Architecture

```
Connect-4/
  backend/
    app.py                     FastAPI server (game sessions, AI endpoints, auth)
    agents/
      dqn_agent.py             CNN architecture, replay buffer, DQN logic
      alphabeta_agent.py       Minimax, alpha-beta pruning, heuristic scoring
    game/
      connect4_logic.py        Board logic, win detection, valid moves
    training/
      checkpoints/             Saved model weights (.h5)

  frontend/                    Next.js 15 (App Router)
    app/
      page.js                  Landing page
      play/page.js             Game page (human vs AI)
      ai-battle/page.js        AI vs AI spectator mode
      replays/page.js          Replay history
      replay/[id]/page.js      Replay viewer with playback controls
    components/ui/
      game-board.jsx           6x7 board with drop animations
      q-value-panel.jsx        Live Q-value bar chart
      auth-modal.jsx           Login, signup, OAuth, guest mode
    lib/
      api.js                   Backend API client
      supabase.js              Supabase client
```

---

## DQN Training Results

Trained on Google Colab (T4 GPU) across 10,000 episodes against a random opponent.

| Checkpoint | Win Rate | Role |
|------------|----------|------|
| Episode 2000 | 89.0% | Hard difficulty |
| Episode 6000 | 73.6% | Medium difficulty |
| Episode 8000 | 57.6% | Easy difficulty |

The best model emerged at episode 2000 — only 20% through training. After episode 5000, the replay buffer became saturated with low-diversity experiences, causing catastrophic forgetting. Win rate declined from 76% to 57% before partially recovering.

More training does not always produce a better agent.

---

## Alpha-Beta Heuristic

The evaluation function scores board positions using:

- **Center column control** — 3 points per piece in the center column
- **Window evaluation** — Scans every possible 4-cell window (horizontal, vertical, both diagonals):
  - 4 in a row: +100
  - 3 + 1 empty: +5
  - 2 + 2 empty: +2
  - Opponent 3 + 1 empty: -4
- **Move ordering** — Center columns searched first for faster pruning

At depth 6, the agent is functionally unbeatable by casual players.

---

## Safety Layer

The DQN was trained against a random opponent, which means it learned offense but not defense. A rule-based safety layer patches this:

1. Can the AI win this turn? Take it.
2. Can the opponent win next turn? Block it.
3. No immediate threats? Let the DQN decide.

This only applies to DQN in human games. Alpha-Beta handles blocking through its search. In AI vs AI mode, both agents play raw — no safety net.

---

## Head-to-Head: DQN vs Alpha-Beta

Alpha-Beta wins consistently on hard mode. The DQN approximates strategy through pattern matching but cannot look ahead. Alpha-Beta calculates every possibility to depth 6.

To prevent deterministic repetition in AI vs AI mode, the first move for each agent is randomized.

---

## Setup

**Backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app:app --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

**Environment variables**

Backend (`backend/.env`):
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
```

Frontend (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI (RL) | TensorFlow, Keras, NumPy |
| AI (Search) | Pure Python |
| Backend | FastAPI, Supabase |
| Frontend | Next.js, Tailwind CSS, Framer Motion |
| Auth | Supabase (GitHub OAuth, Google OAuth, email) |
| Database | Supabase PostgreSQL |
| Training | Google Colab (T4 GPU) |
