import numpy as np 


class Connect4Game:
    ROWS = 6
    COLS =7
    EMPTY = 0
    PLAYER_1= 1
    PLAYER_2= 2


    def __init__(self):
        self.board = np.zeros((self.ROWS , self.COLS) , dtype=int)
        self.current_player = self.PLAYER_1


    def reset(self):
        self.board = np.zeros((self.ROWS , self.COLS) , dtype=int)
        self.current_player = self.PLAYER_1
        return self.get_state()

    def get_state(self):
        return self.board.copy()

    def clone(self):
        new_game = Connect4Game()
        new_game.board = self.board.copy()
        new_game.current_player = self.current_player
        return new_game

    def is_valid_move(self,col):
        return 0<=col < self.COLS and self.board[0][col]  == self.EMPTY

    def get_valid_moves(self):
        return [col for col in range(self.COLS) if self.is_valid_move(col)]


    def drop_disc(self,col):
        if not self.is_valid_move(col):
            return None
        for row in range(self.ROWS-1,-1,-1):
            if self.board[row][col] == self.EMPTY:
                self.board[row][col] = self.current_player
                return(row,col)

    def play_move(self, col):
        result = self.drop_disc(col)
        if result is not None:
            self.switch_player()
        return result

    def switch_player(self):
        self.current_player = 3 - self.current_player

    def check_winner(self):
        directions = [
            (0, 1),
            (1, 0),
            (1, 1),
            (1, -1)
        ]

        for row in range(self.ROWS):
            for col in range(self.COLS):
                player = self.board[row][col]
                if player == self.EMPTY:
                    continue

                for dr, dc in directions:
                    if self._check_directions(row, col, dr, dc, player):
                        return player

        return None

    def _check_directions(self, row, col, dr, dc, player):
        for i in range(4):
            r = row + dr * i
            c = col + dc * i

            if r < 0 or r >= self.ROWS or c < 0 or c >= self.COLS:
                return False
            if self.board[r][c] != player:
                return False

        return True

    def is_draw(self):
        return len(self.get_valid_moves()) == 0 and self.check_winner() is None

    def is_game_over(self):
        """Returns True if the game has ended (either a win or a draw)."""
        return self.check_winner() is not None or len(self.get_valid_moves()) == 0

    def render(self):
        symbols = {
            self.EMPTY:'.' , self.PLAYER_1:'X' , self.PLAYER_2:'O'
        }
        print()

        for row in range (self.ROWS):
            print(' '.join(symbols[cell] for cell in self.board[row] ))
        print(' '.join(str(i) for i in range(self.COLS)))
        print()

    