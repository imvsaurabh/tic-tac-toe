const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export class GameState {
  constructor({ startingPlayer = 'X' } = {}) {
    this.startingPlayer = startingPlayer;
    this.board = Array(9).fill(null);
    this.currentPlayer = startingPlayer;
    this.winner = null;
    this.isDraw = false;
    this.winningScore = { X: 0, O: 0 };
  }

  resetBoard() {
    this.board = Array(9).fill(null);
    this.currentPlayer = this.startingPlayer;
    this.winner = null;
    this.isDraw = false;
  }

  resetMatch() {
    this.resetBoard();
    this.winningScore = { X: 0, O: 0 };
  }

  makeMove(index) {
    if (this.winner || this.isDraw) {
      return false;
    }

    if (this.board[index]) {
      return false;
    }

    this.board[index] = this.currentPlayer;

    if (this.checkWinner(this.currentPlayer)) {
      this.winner = this.currentPlayer;
      this.winningScore[this.currentPlayer] += 1;
      return true;
    }

    if (this.board.every((cell) => cell)) {
      this.isDraw = true;
      return true;
    }

    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    return true;
  }

  checkWinner(player) {
    return WINNING_LINES.some((line) =>
      line.every((index) => this.board[index] === player),
    );
  }

  get availableMoves() {
    return this.board
      .map((cell, index) => (cell ? null : index))
      .filter((index) => index !== null);
  }
}

export { WINNING_LINES };
