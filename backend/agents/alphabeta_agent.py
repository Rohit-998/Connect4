
import numpy as np
import random
ROWS = 6
COLS = 7
EMPTY = 0


def get_valid_moves(board):
    return [c for c in range(COLS) if board[0][c]==EMPTY]


def drop_disc(board,col,player):
    new_board = board.copy()
    for row in range(ROWS-1,-1,-1):
        if new_board[row][col]==EMPTY :
            new_board[row][col]= player
            return new_board ,row
    return None , None

def check_winner(board):
    directions =  [(0,1),(1,0),(1,1),(1,-1)]
    for row in range(ROWS):
        for col in range(COLS):
            player = board[row][col]

            if player == EMPTY:
                continue
            for dr , dc in directions:
                if all(0<=row+dr*i<ROWS and 0<=col+dc*i<COLS and board[row+dr*i][col+dc*i]==player for i in range(4)):
                    return player
    return None


def is_terminal(board):
    return check_winner(board) is not None or len(get_valid_moves(board))==0





def evaluate_window(window , player):
    opp=3-player

    player_count = np.count_nonzero(window==player)
    opp_count = np.count_nonzero(window==opp)
    empty_count = np.count_nonzero(window==EMPTY)

    score = 0

    if player_count==4:
        score+=100
    elif player_count==3 and empty_count==1:
        score+=5
    elif player_count  ==2 and empty_count==2:
        score+=2

    if opp_count==3 and empty_count==1:
        score -=4

    return score


def score_position(board,player):
    score  = 0

    center_col = board[:,COLS//2]
    center_count = np.count_nonzero(center_col==player)
    score+=center_count*3

    for row in range(ROWS):
        for col in range (COLS-3):
            window = board[row,col:col+4]
            score += evaluate_window(window,player)

    for col in range(COLS):
        for row in range(ROWS-3):
            window = board[row:row+4,col]
            score += evaluate_window(window,player)

    for row in range(ROWS-3):
        for col in range(COLS-3):
            window = np.array([board[row+i][col+i] for i in range(4)])
            score += evaluate_window(window,player)

    for row in range(3,ROWS):
        for col in range(COLS-3):
             window = np.array([board[row - i][col + i] for i in range(4)])
             score+=evaluate_window(window,player)

    return score


def minimax(board , depth , alpha , beta ,maximizing , ai_player):

    valid_moves = get_valid_moves(board)
    winner = check_winner(board)
    human_player  = 3-ai_player

    if winner == ai_player:
        return (None,100000+depth)
    elif winner == human_player:
        return (None , -100000-depth)
    elif len(valid_moves)==0:
        return (None, 0)
    elif depth ==0:
        return (None, score_position(board, ai_player))

    if maximizing:
        value = -float('inf')
        best_col = random.choice(valid_moves)
        valid_moves.sort(key=lambda c: abs(c - COLS // 2))

        for col in valid_moves:
            new_board,_ = drop_disc(board,col,ai_player)
            _,score = minimax(new_board,depth-1,alpha,beta,False,ai_player)
            if score>value:
                value = score
                best_col = col
            alpha = max(alpha,value)
            if alpha>=beta:
                break
        return (best_col,value)

    else :
        value = float('inf')
        best_col = random.choice(valid_moves)
        valid_moves.sort(key=lambda c: abs(c - COLS // 2))

        for col in valid_moves:
            new_board,_=drop_disc(board,col,human_player)
            _,score=minimax(new_board,depth-1,alpha,beta,True,ai_player)

            if score < value :
                value = score
                best_col = col
            beta = min(beta,value)
            if alpha>=beta:
                break

        return(best_col,value)

class AlphaBetaAgent:
    DEPTH_MAP={
        'easy':2,
        'medium':4,
        'hard':6

    }

    def __init__(self,difficulty='medium'):
        self.difficulty  = difficulty
        self.depth = self.DEPTH_MAP.get(difficulty,4)
    
    def select_action(self,board_state,valid_moves):
        board = np.array(board_state,dtype=int)
        ai_player = 2
        col,score=minimax(board , self.depth , -float('inf'),float('inf') , True ,ai_player)

        if col is None or col not in valid_moves:
            col=random.choice(valid_moves)
        return col

