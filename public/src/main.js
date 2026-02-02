import { GameState } from './game/state.js';

const boardElement = document.querySelector('[data-board]');
const currentTurnElement = document.querySelector('[data-current-turn]');
const roundWinnerElement = document.querySelector('[data-round-winner]');
const scoreXElement = document.querySelector('[data-score-x]');
const scoreOElement = document.querySelector('[data-score-o]');
const modeSelect = document.querySelector('[data-mode-select]');
const newRoundButton = document.querySelector('[data-new-round]');
const resetMatchButton = document.querySelector('[data-reset-match]');

const state = new GameState();
let mode = 'human';

const renderBoard = () => {
  boardElement.innerHTML = '';

  state.board.forEach((cell, index) => {
    const button = document.createElement('button');
    button.className = 'cell';
    button.type = 'button';
    button.textContent = cell ?? '';
    button.disabled = Boolean(cell) || state.winner || state.isDraw;
    button.addEventListener('click', () => handleMove(index));
    boardElement.appendChild(button);
  });
};

const renderStatus = () => {
  if (state.winner) {
    roundWinnerElement.textContent = `Winner: ${state.winner}`;
  } else if (state.isDraw) {
    roundWinnerElement.textContent = 'Draw game';
  } else {
    roundWinnerElement.textContent = 'Round in progress';
  }

  currentTurnElement.textContent = state.winner || state.isDraw
    ? '-'
    : state.currentPlayer;

  scoreXElement.textContent = state.winningScore.X;
  scoreOElement.textContent = state.winningScore.O;
};

const render = () => {
  renderBoard();
  renderStatus();
};

const handleMove = (index) => {
  if (!state.makeMove(index)) {
    return;
  }

  render();

  if (!state.winner && !state.isDraw && mode === 'computer' && state.currentPlayer === 'O') {
    window.setTimeout(() => {
      const moves = state.availableMoves;
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      state.makeMove(randomMove);
      render();
    }, 250);
  }
};

const handleNewRound = () => {
  state.resetBoard();
  render();
};

const handleResetMatch = () => {
  state.resetMatch();
  render();
};

modeSelect.addEventListener('change', (event) => {
  mode = event.target.value;
  handleResetMatch();
});

newRoundButton.addEventListener('click', handleNewRound);
resetMatchButton.addEventListener('click', handleResetMatch);

render();
