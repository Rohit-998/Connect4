import gymnasium as gym
from gymnasium import spaces
import numpy as np 

import sys
sys.path.append('../game')
from connect4_logic import Connect4Game


class Connect4Env(gym.Env):
    metadata = {
        'render_modes':['human']
    }

    def __init__(self,render_mode =None):
        super().__init__()
        self.game = Connect4Game()
        self.render_mode = render_mode


        self.action_space = spaces.Discrete(7)

        self.observation_space = spaces.Box(
            low=0 , high = 2,
            shape=(6,7),
            dtype=np.int32

        )

    def reset(self ,seed=None , options=None):
        super().reset(seed=seed)
        self.game.reset()
        return self.game.get_state() , {}

    def step (self ,action):
        if not self.game.is_valid_move(action):
            return self.game.get_state() , -10 , True , False ,{}
        
        self.game.drop_disc(action)

        if self.game.check_winner()==1:
            return self.game.get_state() , 1.0 , True , False ,{}

        if self.game.is_draw():
            return self.game.get_state() , 0.5 , True , False ,{}

        self.game.switch_player()

        opponent_action = np.random.choice(self.game.get_valid_moves())
        self.game.drop_disc(opponent_action)

        if self.game.check_winner() == 2:
            return self.game.get_state() , -1.0 , True , False , {}

        if self.game.is_draw():
            return self.game.get_state() , 0.5 , True , False ,{}

        self.game.switch_player()

        return self.game.get_state() , 0 , False , False,{}

    
    def render(self):
        if self.render_mode == 'human':
            self.game.render()




