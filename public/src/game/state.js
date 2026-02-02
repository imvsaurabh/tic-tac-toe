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
  constructor({ startingPlayer = 'X', matchType = 'firstTo', matchLength = 3 } = {}) {
    this.startingPlayer = startingPlayer;
    this.matchType = matchType;
    this.matchLength = matchLength;
    this.board = Array(9).fill(null);
    this.currentPlayer = startingPlayer;
    this.winner = null;
    this.isDraw = false;
    this.winningScore = { X: 0, O: 0 };
    this.matchWinner = null;
    this.winningLine = null;
    this.lastMove = null;
  }

  resetBoard() {
    this.board = Array(9).fill(null);
    this.currentPlayer = this.startingPlayer;
    this.winner = null;
    this.isDraw = false;
    this.winningLine = null;
    this.lastMove = null;
  }

  resetMatch() {
    this.resetBoard();
    this.winningScore = { X: 0, O: 0 };
    this.matchWinner = null;
  }

  updateSettings({ startingPlayer, matchType, matchLength } = {}) {
    if (startingPlayer) {
      this.startingPlayer = startingPlayer;
    }
    if (matchType) {
      this.matchType = matchType;
    }
    if (matchLength) {
      this.matchLength = matchLength;
    }
  }

  makeMove(index) {
    if (this.winner || this.isDraw || this.matchWinner) {
      return false;
    }

    if (this.board[index]) {
      return false;
    }

    this.board[index] = this.currentPlayer;
    this.lastMove = index;

    const winningLine = this.getWinningLine(this.currentPlayer);
    if (winningLine) {
      this.winner = this.currentPlayer;
      this.winningLine = winningLine;
      this.winningScore[this.currentPlayer] += 1;
      if (this.winningScore[this.currentPlayer] >= this.matchTarget) {
        this.matchWinner = this.currentPlayer;
      }
      return true;
    }

    if (this.board.every((cell) => cell)) {
      this.isDraw = true;
      this.winner = null;
      return true;
    }

    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    return true;
  }

  get matchTarget() {
    const safeLength = Number.isFinite(this.matchLength) && this.matchLength > 0
      ? this.matchLength
      : 1;
    if (this.matchType === 'bestOf') {
      return Math.ceil(safeLength / 2);
    }
    return safeLength;
  }

  getWinningLine(player) {
    return (
      WINNING_LINES.find((line) =>
        line.every((index) => this.board[index] === player),
      ) ?? null
    );
  }

  get availableMoves() {
    return this.board
      .map((cell, index) => (cell ? null : index))
      .filter((index) => index !== null);
  }
}

export { WINNING_LINES };
