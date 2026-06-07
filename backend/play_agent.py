import os
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(current_dir, 'game'))
sys.path.append(os.path.join(current_dir, 'agents'))
sys.path.append(os.path.join(current_dir, 'env'))

from connect4_env import Connect4Env
from dqn_agent import DQNAgent

def test_checkpoint(weights_path, num_games=500):
    env = Connect4Env()
    agent = DQNAgent()
    agent.load(weights_path)
    agent.epsilon = 0

    wins = 0
    losses = 0
    draws = 0

    for game in range(1, num_games + 1):
        state, _ = env.reset()
        done = False

        while not done:
            valid_moves = env.game.get_valid_moves()
            action = agent.select_action(state, valid_moves)
            state, reward, done, _, _ = env.step(action)

        if reward == 1.0:
            wins += 1
        elif reward == -1.0:
            losses += 1
        else:
            draws += 1

    win_rate = wins / num_games * 100
    return wins, losses, draws, win_rate

def test_all():
    checkpoints_dir = os.path.join(current_dir, 'training', 'checkpoints')
    models = [
        ('Episode 2000',  'model_ep2000.weights.h5'),
        ('Episode 4000',  'model_ep4000.weights.h5'),
        ('Episode 6000',  'model_ep6000.weights.h5'),
        ('Episode 8000',  'model_ep8000.weights.h5'),
        ('Episode 10000', 'model_ep10000.weights.h5'),
    ]

    print("=" * 60)
    print("  CONNECT 4 DQN — CHECKPOINT COMPARISON (500 games each)")
    print("=" * 60)

    best_rate = 0
    best_name = ""

    for name, filename in models:
        path = os.path.join(checkpoints_dir, filename)
        print(f"\nTesting {name}...", end=" ", flush=True)
        wins, losses, draws, win_rate = test_checkpoint(path)
        print(f"Done!")
        print(f"  W: {wins} | L: {losses} | D: {draws} | Win Rate: {win_rate:.1f}%")

        if win_rate > best_rate:
            best_rate = win_rate
            best_name = name

    print(f"\n{'=' * 60}")
    print(f"  CHAMPION: {best_name} with {best_rate:.1f}% win rate!")
    print(f"{'=' * 60}")

if __name__ == "__main__":
    test_all()
