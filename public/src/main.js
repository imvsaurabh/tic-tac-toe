import { GameState, WINNING_LINES } from './game/state.js';

const boardElement = document.querySelector('[data-board]');
const currentTurnElement = document.querySelector('[data-current-turn]');
const roundWinnerElement = document.querySelector('[data-round-winner]');
const scoreXElement = document.querySelector('[data-score-x]');
const scoreOElement = document.querySelector('[data-score-o]');
const matchTargetElement = document.querySelector('[data-match-target]');
const matchLeaderElement = document.querySelector('[data-match-leader]');
const modeSelect = document.querySelector('[data-mode-select]');
const difficultySelect = document.querySelector('[data-difficulty-select]');
const startingPlayerSelect = document.querySelector('[data-starting-player]');
const matchTypeSelect = document.querySelector('[data-match-type]');
const matchLengthInput = document.querySelector('[data-match-length]');
const newRoundButton = document.querySelector('[data-new-round]');
const resetMatchButton = document.querySelector('[data-reset-match]');

const STORAGE_KEY = 'tic-tac-toe-settings';
const state = new GameState();
let mode = 'human';
let difficulty = 'minimax';
const COMPUTER_PLAYER = 'O';
const HUMAN_PLAYER = 'X';

const hasWinner = (board, player) =>
  WINNING_LINES.some((line) => line.every((index) => board[index] === player));

const getAvailableMoves = (board) =>
  board.map((cell, index) => (cell ? null : index)).filter((index) => index !== null);

const getRandomMove = (board) => {
  const moves = getAvailableMoves(board);
  if (moves.length === 0) {
    return null;
  }
  const choice = Math.floor(Math.random() * moves.length);
  return moves[choice];
};

const getHeuristicMove = (board) => {
  const moves = getAvailableMoves(board);
  if (moves.length === 0) {
    return null;
  }

  const findWinningMove = (player) =>
    moves.find((move) => {
      const nextBoard = [...board];
      nextBoard[move] = player;
      return hasWinner(nextBoard, player);
    });

  const winningMove = findWinningMove(COMPUTER_PLAYER);
  if (winningMove !== undefined) {
    return winningMove;
  }

  const blockingMove = findWinningMove(HUMAN_PLAYER);
  if (blockingMove !== undefined) {
    return blockingMove;
  }

  if (board[4] === null) {
    return 4;
  }

  const corners = [0, 2, 6, 8].filter((index) => board[index] === null);
  if (corners.length) {
    return corners[0];
  }

  const edges = [1, 3, 5, 7].filter((index) => board[index] === null);
  return edges[0] ?? moves[0] ?? null;
};

const minimax = (board, currentPlayer, depth = 0) => {
  if (hasWinner(board, COMPUTER_PLAYER)) {
    return 10 - depth;
  }
  if (hasWinner(board, HUMAN_PLAYER)) {
    return depth - 10;
  }

  const moves = getAvailableMoves(board);
  if (moves.length === 0) {
    return 0;
  }

  if (currentPlayer === COMPUTER_PLAYER) {
    let bestScore = -Infinity;
    moves.forEach((move) => {
      const nextBoard = [...board];
      nextBoard[move] = COMPUTER_PLAYER;
      const score = minimax(nextBoard, HUMAN_PLAYER, depth + 1);
      bestScore = Math.max(bestScore, score);
    });
    return bestScore;
  }

  let bestScore = Infinity;
  moves.forEach((move) => {
    const nextBoard = [...board];
    nextBoard[move] = HUMAN_PLAYER;
    const score = minimax(nextBoard, COMPUTER_PLAYER, depth + 1);
    bestScore = Math.min(bestScore, score);
  });
  return bestScore;
};

const getBestMove = (board) => {
  const moves = getAvailableMoves(board);
  let bestScore = -Infinity;
  let bestMove = moves[0] ?? null;

  moves.forEach((move) => {
    const nextBoard = [...board];
    nextBoard[move] = COMPUTER_PLAYER;
    const score = minimax(nextBoard, HUMAN_PLAYER, 1);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  });

  return bestMove;
};

const getComputerMove = (board) => {
  if (difficulty === 'random') {
    return getRandomMove(board);
  }
  if (difficulty === 'heuristic') {
    return getHeuristicMove(board);
  }
  return getBestMove(board);
};

const renderBoard = () => {
  boardElement.innerHTML = '';
  if (state.winningLine) {
    const winIndex = WINNING_LINES.findIndex((line) =>
      line.every((value, idx) => value === state.winningLine[idx]),
    );
    if (winIndex >= 0) {
      boardElement.dataset.winLine = String(winIndex);
      boardElement.classList.add('board--win');
    } else {
      delete boardElement.dataset.winLine;
      boardElement.classList.remove('board--win');
    }
  } else {
    delete boardElement.dataset.winLine;
    boardElement.classList.remove('board--win');
  }

  state.board.forEach((cell, index) => {
    const button = document.createElement('button');
    button.className = 'cell';
    button.type = 'button';
    if (cell === 'X') {
      button.classList.add('cell--x');
    } else if (cell === 'O') {
      button.classList.add('cell--o');
    }
    if (state.winningLine?.includes(index)) {
      button.classList.add('cell--win');
    }
    if (state.lastMove === index) {
      button.classList.add('cell--placed');
    }
    button.textContent = cell ?? '';
    button.disabled = Boolean(cell) || state.winner || state.isDraw || state.matchWinner;
    button.addEventListener('click', () => handleMove(index));
    boardElement.appendChild(button);
  });
};

const renderStatus = () => {
  if (state.matchWinner) {
    roundWinnerElement.textContent = `Match winner: ${state.matchWinner}`;
  } else if (state.winner) {
    roundWinnerElement.textContent = `Winner: ${state.winner}`;
  } else if (state.isDraw) {
    roundWinnerElement.textContent = 'Draw game';
  } else {
    roundWinnerElement.textContent = 'Round in progress';
  }

  currentTurnElement.textContent = state.winner || state.isDraw
    ? '-'
    : state.currentPlayer;
  if (state.matchWinner) {
    currentTurnElement.textContent = '-';
  }

  scoreXElement.textContent = state.winningScore.X;
  scoreOElement.textContent = state.winningScore.O;

  const matchLabel = state.matchType === 'bestOf'
    ? `Best of ${state.matchLength} (first to ${state.matchTarget})`
    : `First to ${state.matchTarget} wins`;
  matchTargetElement.textContent = matchLabel;

  if (state.matchWinner) {
    matchLeaderElement.textContent = `${state.matchWinner} clinched the match`;
  } else if (state.winningScore.X === state.winningScore.O) {
    matchLeaderElement.textContent = 'Match tied';
  } else if (state.winningScore.X > state.winningScore.O) {
    matchLeaderElement.textContent = 'X leads';
  } else {
    matchLeaderElement.textContent = 'O leads';
  }
};

const render = () => {
  renderBoard();
  renderStatus();
  difficultySelect.disabled = mode !== 'computer';
};

const clampMatchLength = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return state.matchLength;
  }
  return Math.min(Math.max(parsed, 1), 15);
};

const saveState = () => {
  const payload = {
    mode,
    difficulty,
    startingPlayer: state.startingPlayer,
    matchType: state.matchType,
    matchLength: state.matchLength,
    winningScore: state.winningScore,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

const loadState = () => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.mode) {
      mode = parsed.mode;
    }
    if (parsed?.difficulty) {
      difficulty = parsed.difficulty;
    }
    const storedMatchLength = clampMatchLength(parsed?.matchLength ?? state.matchLength);
    state.updateSettings({
      startingPlayer: parsed?.startingPlayer ?? state.startingPlayer,
      matchType: parsed?.matchType ?? state.matchType,
      matchLength: storedMatchLength,
    });
    if (parsed?.winningScore) {
      state.winningScore = {
        X: parsed.winningScore.X ?? 0,
        O: parsed.winningScore.O ?? 0,
      };
    }
    if (state.winningScore.X >= state.matchTarget) {
      state.matchWinner = 'X';
    } else if (state.winningScore.O >= state.matchTarget) {
      state.matchWinner = 'O';
    }
  } catch (error) {
    console.warn('Unable to restore saved settings.', error);
  }
};

const maybeHandleComputerTurn = () => {
  if (mode !== 'computer') {
    return;
  }
  if (state.currentPlayer !== COMPUTER_PLAYER) {
    return;
  }
  if (state.winner || state.isDraw || state.matchWinner) {
    return;
  }

  window.setTimeout(() => {
    const bestMove = getComputerMove(state.board);
    if (bestMove !== null) {
      state.makeMove(bestMove);
      saveState();
    }
    render();
  }, 250);
};

const handleMove = (index) => {
  if (!state.makeMove(index)) {
    return;
  }

  saveState();
  render();

  maybeHandleComputerTurn();
};

const handleNewRound = () => {
  if (state.matchWinner) {
    return;
  }
  state.resetBoard();
  saveState();
  render();
  maybeHandleComputerTurn();
};

const handleResetMatch = () => {
  state.resetMatch();
  saveState();
  render();
  maybeHandleComputerTurn();
};

modeSelect.addEventListener('change', (event) => {
  mode = event.target.value;
  handleResetMatch();
});

difficultySelect.addEventListener('change', (event) => {
  difficulty = event.target.value;
  saveState();
});

startingPlayerSelect.addEventListener('change', (event) => {
  state.updateSettings({ startingPlayer: event.target.value });
  handleResetMatch();
});

matchTypeSelect.addEventListener('change', (event) => {
  state.updateSettings({ matchType: event.target.value });
  handleResetMatch();
});

matchLengthInput.addEventListener('change', (event) => {
  const nextValue = clampMatchLength(event.target.value);
  matchLengthInput.value = String(nextValue);
  state.updateSettings({ matchLength: nextValue });
  handleResetMatch();
});

newRoundButton.addEventListener('click', handleNewRound);
resetMatchButton.addEventListener('click', handleResetMatch);

loadState();
modeSelect.value = mode;
difficultySelect.value = difficulty;
startingPlayerSelect.value = state.startingPlayer;
matchTypeSelect.value = state.matchType;
matchLengthInput.value = String(state.matchLength);

render();
maybeHandleComputerTurn();
