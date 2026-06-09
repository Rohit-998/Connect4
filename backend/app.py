import sys
import os
import uuid
import random
import numpy as np

from dotenv import load_dotenv
from supabase import create_client
from fastapi import FastAPI, Header
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(current_dir, 'game'))
sys.path.append(os.path.join(current_dir, 'agents'))

from connect4_logic import Connect4Game
from alphabeta_agent import AlphaBetaAgent
from dqn_agent import DQNAgent

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

checkpoints_dir = os.path.join(current_dir, 'training', 'checkpoints')

# Alpha-Beta agents (game tree search)
ab_agents = {
    "easy": AlphaBetaAgent(difficulty="easy"),
    "medium": AlphaBetaAgent(difficulty="medium"),
    "hard": AlphaBetaAgent(difficulty="hard"),
}

# DQN agents (reinforcement learning)
dqn_agents = {
    "easy": DQNAgent(),
    "medium": DQNAgent(),
    "hard": DQNAgent(),
}
dqn_agents["easy"].load(os.path.join(checkpoints_dir, 'model_ep8000.weights.h5'))
dqn_agents["medium"].load(os.path.join(checkpoints_dir, 'model_ep6000.weights.h5'))
dqn_agents["hard"].load(os.path.join(checkpoints_dir, 'model_ep2000.weights.h5'))
for a in dqn_agents.values():
    a.epsilon = 0

def get_agent(opponent, difficulty):
    if opponent == "dqn":
        return dqn_agents[difficulty]
    return ab_agents[difficulty]

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app = FastAPI(title="Connect 4 AI API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

games = {}

class NewGameRequest(BaseModel):
    difficulty: str = "medium"
    opponent: str = "alphabeta"   # "alphabeta" or "dqn"
class MoveRequest(BaseModel):
    game_id: str
    column: int


# ============================================================
# SAFETY LAYER — always on, all difficulties
# ============================================================
def find_winning_move(game, player, valid_moves):
    """Check if 'player' can win by dropping in any column."""
    for col in valid_moves:
        clone = game.clone()
        clone.current_player = player
        clone.drop_disc(col)
        if clone.check_winner() == player:
            return col
    return None


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/new-game")
def new_game(request: NewGameRequest):
    game_id = str(uuid.uuid4())
    games[game_id] = {
        "game": Connect4Game(),
        "difficulty": request.difficulty,
        "opponent": request.opponent,
        "moves": []
    }
    return {
        'game_id': game_id,
        'board': games[game_id]["game"].get_state().tolist(),
        'message': f"Game started on {request.difficulty} difficulty vs {request.opponent}!"
    }


@app.post("/api/make-move")
def make_move(move: MoveRequest):
    session = games.get(move.game_id)
    if not session:
        return {"error": "Game not found"}
    game = session['game']
    agent = get_agent(session['opponent'], session['difficulty'])

    if not game.is_valid_move(move.column):
        return {"error": "Invalid move"}

    # HUMAN plays
    row = game.drop_disc(move.column)
    session['moves'].append({
        'turn': len(session['moves']) + 1,
        'player': 'human',
        'col': move.column,
        'row': row[0]
    })

    winner = game.check_winner()
    if winner:
        return {'board': game.get_state().tolist(), 'winner': 1, 'ai_move': None, 'game_over': True}
    if game.is_draw():
        return {"board": game.get_state().tolist(), "winner": None, "ai_move": None, "game_over": True}

    game.switch_player()

    # ============================================================
    # AI plays
    # ============================================================
    state = game.get_state()
    valid_moves = game.get_valid_moves()

    if session['opponent'] == 'dqn':
        # DQN needs safety layer — it misses obvious blocks
        # Step 1: Can AI win right now? Take it.
        ai_col = find_winning_move(game, game.current_player, valid_moves)
        # Step 2: Can human win next turn? Block it.
        if ai_col is None:
            human_player = 3 - game.current_player
            ai_col = find_winning_move(game, human_player, valid_moves)
        # Step 3: No threats — let DQN decide
        if ai_col is None:
            ai_col = agent.select_action(state, valid_moves)
    else:
        # Alpha-Beta handles blocking through its search — no safety net needed
        ai_col = agent.select_action(state, valid_moves)

    print(f"[AI] difficulty={session['difficulty']} | chose col={ai_col} | valid={valid_moves}")

    ai_row = game.drop_disc(ai_col)
    session["moves"].append({
        "turn": len(session["moves"]) + 1,
        "player": "ai",
        "col": ai_col,
        "row": ai_row[0]
    })

    winner = game.check_winner()
    if winner:
        game.switch_player()
        return {"board": game.get_state().tolist(), "winner": 2, "ai_move": ai_col, "game_over": True}
    if game.is_draw():
        game.switch_player()
        return {"board": game.get_state().tolist(), "winner": None, "ai_move": ai_col, "game_over": True}
    game.switch_player()
    return {"board": game.get_state().tolist(), "winner": None, "ai_move": ai_col, "game_over": False}


def get_q_values(game, difficulty):
    """Return per-column scores using alpha-beta evaluation."""
    from alphabeta_agent import score_position, drop_disc as ab_drop
    board = np.array(game.get_state(), dtype=int)
    scores = []
    for col in range(7):
        if board[0][col] == 0:  # valid move
            new_board, _ = ab_drop(board, col, 2)
            scores.append(float(score_position(new_board, 2)))
        else:
            scores.append(0)
    return scores


@app.get("/api/game/{game_id}")
def get_game(game_id: str):
    session = games.get(game_id)
    if not session:
        return {"error": "Game not found"}
    game = session['game']
    return {
        'board': game.get_state().tolist(),
        'game_over': game.is_game_over(),
        'q_values': get_q_values(game, session['difficulty']),
        'moves': session['moves']
    }


# Auth Helper
def get_current_user(authorization: str = None):
    if not authorization:
        return None
    try:
        token = authorization.replace("Bearer ", "")
        user = supabase.auth.get_user(token)
        return str(user.user.id)
    except Exception:
        return None


class SaveReplayRequest(BaseModel):
    game_id: str
    result: str


@app.post('/api/save-replay')
def save_replay(request: SaveReplayRequest, authorization: str = Header(default=None)):
    user_id = get_current_user(authorization)
    if not user_id:
        return {'error': 'Login required to save replays'}

    session = games.get(request.game_id)
    if not session:
        return {"error": "Game not found"}

    replay_data = {
        "user_id": user_id,
        "difficulty": session["difficulty"],
        "opponent": session.get("opponent", "alphabeta"),
        "result": request.result,
        "moves": session["moves"],
        "total_turns": len(session["moves"])
    }
    try:
        supabase.table('replays').insert(replay_data).execute()
        print(f"[SAVE] Saved replay for user_id={user_id}")
    except Exception as e:
        print(f"[SAVE ERROR] {e}")
        return {"error": f"Failed to save replay: {str(e)}"}

    del games[request.game_id]
    return {"message": "Replay Saved!"}


@app.get('/api/replays')
def get_replays(authorization: str = Header(default=None)):
    user_id = get_current_user(authorization)
    if not user_id:
        return {"error": "Login required to view replays"}

    response = supabase.table('replays').select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    print(f"[REPLAYS] user_id={user_id} | found={len(response.data)} replays")
    return {'replays': response.data}


@app.get("/api/replay/{replay_id}")
def get_replay(replay_id: str, authorization: str = Header(default=None)):
    user_id = get_current_user(authorization)
    if not user_id:
        return {"error": "Login required"}
    response = supabase.table("replays").select("*").eq("id", replay_id).eq("user_id", user_id).single().execute()
    return {"replay": response.data}


# ============================================================
# AI vs AI — DQN vs Alpha-Beta
# ============================================================
class AIvsAIRequest(BaseModel):
    difficulty: str = "hard"


@app.post("/api/ai-vs-ai")
def ai_vs_ai(request: AIvsAIRequest):
    difficulty = request.difficulty

    def generate_moves():
        game = Connect4Game()
        dqn = dqn_agents[difficulty]
        ab = ab_agents[difficulty]

        turn = 0
        moves = []

        while not game.is_game_over():
            state = game.get_state()
            valid_moves = game.get_valid_moves()

            if game.current_player == 1:
                # DQN's turn — random opening for first move
                if turn < 2:
                    col = random.choice(valid_moves)
                else:
                    col = dqn.select_action(state, valid_moves)
                agent_name = "dqn"
            else:
                # Alpha-Beta's turn — random opening for first move
                if turn < 2:
                    col = random.choice(valid_moves)
                else:
                    col = ab.select_action(state, valid_moves)
                agent_name = "alphabeta"

            row_result = game.drop_disc(col)
            turn += 1
            move_data = {
                "turn": turn,
                "player": agent_name,
                "col": col,
                "row": row_result[0]
            }
            moves.append(move_data)

            # Yield the move instantly to the frontend
            import json
            yield f"data: {json.dumps({'type': 'move', 'data': move_data})}\n\n"

            if not game.is_game_over():
                game.switch_player()

        winner = game.check_winner()
        if winner == 1:
            result = "dqn"
        elif winner == 2:
            result = "alphabeta"
        else:
            result = "draw"

        final_data = {
            "type": "game_over",
            "board": game.get_state().tolist(),
            "winner": result,
            "moves": moves,
            "total_turns": turn,
            "difficulty": difficulty
        }
        yield f"data: {json.dumps(final_data)}\n\n"

    return StreamingResponse(generate_moves(), media_type="text/event-stream")
