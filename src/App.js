import React, { useState } from "react";
import "./App.css";

const initialGameState = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"],
];

const pieceImages = {
  r: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg",
  n: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg",
  b: "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg",
  q: "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg",
  k: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg",
  p: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg",
  R: "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg",
  N: "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg",
  B: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg",
  Q: "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg",
  K: "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg",
  P: "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg",
};

// Mapping of piece identifiers to their full names
const pieceNames = {
  p: "pawn",
  r: "rook",
  n: "knight",
  b: "bishop",
  q: "queen",
  k: "king",
  P: "pawn",
  R: "rook",
  N: "knight",
  B: "bishop",
  Q: "queen",
  K: "king",
};

function App() {
  const [game, setGame] = useState(initialGameState);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [turn, setTurn] = useState("white");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [gameStarted, setGameStarted] = useState(false); // Track if the game has started

  // Speech synthesis function
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const isWhitePiece = (piece) => piece && piece === piece.toUpperCase();
  const isBlackPiece = (piece) => piece && piece === piece.toLowerCase();

  const isCorrectTurn = (piece) => {
    if (turn === "white" && isWhitePiece(piece)) return true;
    if (turn === "black" && isBlackPiece(piece)) return true;
    return false;
  };

  const isWithinBounds = (row, col) =>
    row >= 0 && row < 8 && col >= 0 && col < 8;

  const checkForKing = (gameBoard) => {
    let whiteKing = false;
    let blackKing = false;
    for (let row of gameBoard) {
      for (let piece of row) {
        if (piece === "K") whiteKing = true;
        if (piece === "k") blackKing = true;
      }
    }
    if (!whiteKing) {
      setGameOver(true);
      setWinner("Black");
      speak("Game Over. Black wins!"); // Announce winner
    } else if (!blackKing) {
      setGameOver(true);
      setWinner("White");
      speak("Game Over. White wins!"); // Announce winner
    }
  };

  const resetGame = () => {
    setGame(initialGameState);
    setTurn("white");
    setSelectedSquare(null);
    setGameOver(false);
    setWinner(null);
    setGameStarted(false); // Return to start screen
  };

  const isValidRookMove = (selectedRow, selectedCol, row, col) => {
    if (selectedRow !== row && selectedCol !== col) return false;
    const directionRow = row > selectedRow ? 1 : row < selectedRow ? -1 : 0;
    const directionCol = col > selectedCol ? 1 : col < selectedCol ? -1 : 0;
    let currentRow = selectedRow + directionRow;
    let currentCol = selectedCol + directionCol;

    while (currentRow !== row || currentCol !== col) {
      if (game[currentRow][currentCol] !== "") return false;
      currentRow += directionRow;
      currentCol += directionCol;
    }
    return true;
  };

  const isValidBishopMove = (selectedRow, selectedCol, row, col) => {
    if (Math.abs(row - selectedRow) !== Math.abs(col - selectedCol))
      return false;
    const directionRow = row > selectedRow ? 1 : -1;
    const directionCol = col > selectedCol ? 1 : -1;
    let currentRow = selectedRow + directionRow;
    let currentCol = selectedCol + directionCol;

    while (currentRow !== row || currentCol !== col) {
      if (game[currentRow][currentCol] !== "") return false;
      currentRow += directionRow;
      currentCol += directionCol;
    }
    return true;
  };

  const isValidQueenMove = (selectedRow, selectedCol, row, col) =>
    isValidRookMove(selectedRow, selectedCol, row, col) ||
    isValidBishopMove(selectedRow, selectedCol, row, col);

  const isValidKnightMove = (selectedRow, selectedCol, row, col) => {
    const rowDiff = Math.abs(selectedRow - row);
    const colDiff = Math.abs(selectedCol - col);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  };

  const isValidKingMove = (selectedRow, selectedCol, row, col) =>
    Math.abs(selectedRow - row) <= 1 && Math.abs(selectedCol - col) <= 1;

  const isValidPawnMove = (
    selectedPiece,
    selectedRow,
    selectedCol,
    row,
    col
  ) => {
    const direction = selectedPiece === "P" ? -1 : 1;
    const startRow = selectedPiece === "P" ? 6 : 1;

    const targetPiece = game[row][col];

    if (
      col === selectedCol &&
      game[row][col] === "" &&
      row === selectedRow + direction
    ) {
      return true;
    }

    if (
      col === selectedCol &&
      selectedRow === startRow &&
      game[row][col] === "" &&
      game[selectedRow + direction][col] === "" &&
      row === selectedRow + 2 * direction
    ) {
      return true;
    }

    if (
      Math.abs(col - selectedCol) === 1 &&
      row === selectedRow + direction &&
      targetPiece !== "" &&
      isWhitePiece(selectedPiece) !== isWhitePiece(targetPiece)
    ) {
      return true;
    }

    return false;
  };

  const handleClick = (row, col) => {
    if (gameOver || !gameStarted) return; // Stop game if it's over or hasn't started yet

    if (selectedSquare) {
      const [selectedRow, selectedCol] = selectedSquare;
      const selectedPiece = game[selectedRow][selectedCol];
      const targetPiece = game[row][col];

      if (!isCorrectTurn(selectedPiece)) {
        setSelectedSquare(null);
        return;
      }

      if (
        (isWhitePiece(selectedPiece) && isWhitePiece(targetPiece)) ||
        (isBlackPiece(selectedPiece) && isBlackPiece(targetPiece))
      ) {
        setSelectedSquare(null);
        return;
      }

      let isValidMove = false;

      if (selectedPiece === "P" || selectedPiece === "p") {
        isValidMove = isValidPawnMove(
          selectedPiece,
          selectedRow,
          selectedCol,
          row,
          col
        );
      } else if (selectedPiece.toLowerCase() === "r") {
        isValidMove = isValidRookMove(selectedRow, selectedCol, row, col);
      } else if (selectedPiece.toLowerCase() === "n") {
        isValidMove = isValidKnightMove(selectedRow, selectedCol, row, col);
      } else if (selectedPiece.toLowerCase() === "b") {
        isValidMove = isValidBishopMove(selectedRow, selectedCol, row, col);
      } else if (selectedPiece.toLowerCase() === "q") {
        isValidMove = isValidQueenMove(selectedRow, selectedCol, row, col);
      } else if (selectedPiece.toLowerCase() === "k") {
        isValidMove = isValidKingMove(selectedRow, selectedCol, row, col);
      }

      if (isValidMove) {
        const newGame = game.map((r) => r.slice());
        newGame[row][col] = selectedPiece;
        newGame[selectedRow][selectedCol] = "";
        setGame(newGame);
        setTurn(turn === "white" ? "black" : "white");

        // Announce the move with the full piece name
        const pieceName = pieceNames[selectedPiece.toLowerCase()];
        speak(
          `${
            pieceName.charAt(0).toUpperCase() + pieceName.slice(1)
          } moved to ${String.fromCharCode(97 + col)}${8 - row}`
        );

        setSelectedSquare(null);
        speak(`It's ${turn === "white" ? "black" : "white"}'s turn`); // Announce turn change
        checkForKing(newGame); // Check if a king was captured
      } else {
        setSelectedSquare(null);
      }
    } else {
      if (game[row][col] && isCorrectTurn(game[row][col])) {
        setSelectedSquare([row, col]);
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {!gameStarted ? (
          <div>
            <h1>Chess Canvas Project</h1>
            <button
              onClick={() => {
                setGameStarted(true);
                speak("Game started!"); // Announce game start
              }}
            >
              Start Game
            </button>
          </div>
        ) : (
          <>
            <h1>Chess</h1>
            <div>Turn: {turn.charAt(0).toUpperCase() + turn.slice(1)}</div>
            <div className="Board">
              {game.map((row, rowIndex) => (
                <div key={rowIndex} className="Row">
                  {row.map((value, colIndex) => (
                    <Square
                      key={colIndex}
                      value={value}
                      onClick={() => handleClick(rowIndex, colIndex)}
                      isLight={(rowIndex + colIndex) % 2 === 0}
                      isSelected={
                        selectedSquare &&
                        selectedSquare[0] === rowIndex &&
                        selectedSquare[1] === colIndex
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
            {gameOver && (
              <div>
                <h2>Game Over - {winner} Wins!</h2>
                <button onClick={resetGame}>Restart Game</button>
              </div>
            )}
          </>
        )}
      </header>
    </div>
  );
}

function Square({ value, onClick, isLight, isSelected }) {
  const squareStyle = {
    width: "80px",
    height: "80px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    backgroundColor: isSelected ? "#ffeb3b" : isLight ? "#f0d9b5" : "#b58863",
    border: "1px solid #999",
  };

  const pieceDisplay = value ? (
    <img
      src={pieceImages[value]}
      alt={value}
      style={{ width: "70px", height: "70px" }}
    />
  ) : null;

  return (
    <button style={squareStyle} onClick={onClick}>
      {pieceDisplay}
    </button>
  );
}

export default App;
