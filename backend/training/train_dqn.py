import sys
sys.path.append('../env')
sys.path.append('../agents')
sys.path.append('../game')

from connect4_env import Connect4Env

from dqn_agent import DQNAgent

import numpy as np 
import os

def train(episodes=10000 , target_update=500 , save_every=2000):

    env = Connect4Env()
    agent = DQNAgent()

    os.makedirs('checkpoints', exist_ok=True)

    wins=0
    losses=0
    draws=0

    for episode in range(1,episodes+1):
        state,_=env.reset()
        done=False
        total_reward = 0

        while not done:
            valid_moves = env.game.get_valid_moves()
            action = agent.select_action(state,valid_moves)
            next_state, reward, terminated, truncated, info = env.step(action)
            done = terminated

            agent.memory.push(state, action, reward, next_state, done)
            agent.train_step()
            state=next_state
            total_reward+=reward

        if reward==1.0:
            wins+=1
        elif reward == -1.0:
            losses+=1
        else:
            draws+=1

        if episode % target_update == 0:
            agent.update_target_network()

        if episode % 100 ==0:
            win_rate=wins/episode * 100
            print(f"Episode {episode}/{episodes} | "
                  f"Win: {win_rate:.1f}% | "
                  f"Epsilon: {agent.epsilon:.3f} | "
                  f"Memory: {len(agent.memory)}")


        if episode % save_every == 0:
            agent.save(f"checkpoints/model_ep{episode}.weights.h5")
            print(f"  → Saved checkpoint at episode {episode}")
        
    agent.save("checkpoints/model_final.weights.h5")
    print("Training complete!")
if __name__ == "__main__":
    train()