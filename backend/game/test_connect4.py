import numpy as np
import pytest
from connect4_logic import Connect4Game


def test_new_game():
    game = Connect4Game()

    assert game.board.shape==(6,7)
    assert np.all(game.board==0)
    assert game.current_player==1


def test_drop_disc():
    game=Connect4Game()

    row , col = game.drop_disc(3)
    assert row == 5
    assert col == 3
    assert game.board[5][3] == 1

    game.switch_player()
    row , col = game.drop_disc(3)
    assert row == 4
    assert col == 3
    assert game.board[4][3] == 2


def test_invalid_moves():
    game = Connect4Game()

    for i in range(6):
        game.drop_disc(0)
        game.switch_player()


    result = game.drop_disc(0)
    assert result is None

    assert game.drop_disc(-1) is None
    assert game.drop_disc(7) is None


def test_horizontal_win():
    game  = Connect4Game()


    for col in range(3):
        game.drop_disc(col)
        game.switch_player()
        game.drop_disc(col)
        game.switch_player()
           
        
    game.drop_disc(3)

    assert game.check_winner() == 1

def test_vertical_win():

    game = Connect4Game()

    for i in range(3):
        game.drop_disc(0)
        game.switch_player()
        game.drop_disc(1)
        game.switch_player()
    
    game.drop_disc(0)
    
    assert game.check_winner() == 1

def test_diagonal_win():
    game = Connect4Game()
    game.board[5][0] = 1
    game.board[5][1] = 1
    game.board[4][1] = 1
    game.board[5][2] = 1
    game.board[4][2] = 1
    game.board[3][2] = 1
    game.board[5][3] = 2
    game.board[4][3] = 2
    game.board[3][3] = 2
    game.board[2][3] = 1

    assert game.check_winner() == 1

def test_draw():
    game = Connect4Game()

    game.board = np.array([
        [1, 2, 1, 2, 1, 2, 1],
        [1, 2, 1, 2, 1, 2, 1],
        [2, 1, 2, 1, 2, 1, 2],
        [1, 2, 1, 2, 1, 2, 1],
        [1, 2, 1, 2, 1, 2, 1],
        [2, 1, 2, 1, 2, 1, 2],
    ])

    assert game.check_winner() is None   # no winner
    assert game.is_draw() == True         # board full + no winner = draw
    assert game.is_game_over() == True    # game is done


def test_game_not_over():
    game=Connect4Game()
    game.drop_disc(3)

    assert game.check_winner() is None
    assert game.is_draw() == False
    assert game.is_game_over() == False

def test_clone():
    game =Connect4Game()

    game.drop_disc(3)
    clone = game.clone()

    assert np.array_equal(game.board,clone.board)
    assert game.current_player == clone.current_player

    clone.drop_disc(0)

    assert clone.board[5][0] ==1

def test_play_move():
    game=Connect4Game()

    result = game.play_move(3)
    assert result == (5,3)
    assert game.current_player == 2

    result=game.play_move(3)
    assert result ==(4,3)
    assert game.current_player ==1 

    game2 = Connect4Game()
    for i in range(6):
        game2.play_move(0)

    current = game2.current_player
    result = game2.play_move(0)
    assert result is None

    assert game2.current_player == current