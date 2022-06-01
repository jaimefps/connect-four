import { GameState, initBoard } from "./GameState"
import { useVanillaState } from "use-vanilla-state"
import "./App.css"

type HelperData = {
  col: number
  row: number
  game: GameState
  gameOver: boolean
  draw?: boolean
}

function isActive({ col, row, game, gameOver }: HelperData) {
  if (gameOver) return false
  return game.columns[col].lastIndexOf(null) === row
}

function isHighlighted({ col, row, game }: HelperData) {
  return (
    game.winState?.line?.some(
      ([thisRow, thisCol]) => thisRow === row && thisCol === col
    ) ?? false
  )
}

function getClassNames({ col, row, game, gameOver, draw }: HelperData) {
  const active =
    !gameOver &&
    isActive({
      col,
      row,
      game,
      gameOver
    })
      ? "enabled"
      : "disabled"
  const highlight = isHighlighted({
    col,
    row,
    game,
    gameOver
  })
    ? "highlight"
    : ""
  return `box ${active} ${highlight} ${draw ? "draw" : ""}`
}

function makeBoxProps({ row, col, game, gameOver, draw }: HelperData) {
  const type = (game.boardState[row][col] ?? "empty") + "_slot"
  return {
    className: getClassNames({
      col,
      row,
      game,
      gameOver,
      draw
    }),
    children: (
      <button
        className={`circle ${type.toLowerCase()}`}
        onClick={() => game.play(col, row)}
        disabled={
          gameOver ||
          !isActive({
            col,
            row,
            game,
            gameOver
          })
        }
      />
    )
  }
}

const BoardRow: React.FC<{
  row: any[]
  rIdx: number
  game: GameState
  gameOver: boolean
  draw: boolean
}> = ({ rIdx, row, game, gameOver, draw }) => (
  <div className="row">
    {row.map((_, cIdx) => (
      <div
        key={`${rIdx}_${cIdx}`}
        {...makeBoxProps({
          row: rIdx,
          col: cIdx,
          game,
          gameOver,
          draw
        })}
      />
    ))}
  </div>
)

function App() {
  const game = useVanillaState(GameState)
  const winDetails = game.winState

  return (
    <div className="App">
      {winDetails?.mark === "DRAW" ? (
        <h1>DRAW</h1>
      ) : winDetails ? (
        <h1>WINNER: {winDetails.mark}</h1>
      ) : (
        <h1>TURN: {game.currTurn}</h1>
      )}

      <div className="board">
        {initBoard.map((row, rIdx) => (
          <BoardRow
            key={rIdx}
            rIdx={rIdx}
            row={row}
            game={game}
            gameOver={!!winDetails}
            draw={winDetails?.mark === "DRAW"}
          />
        ))}
      </div>

      <button
        disabled={!game.hasStarted}
        onClick={() => game.restart()}
        className={game.hasStarted ? "show" : "hide"}
      >
        RESTART
      </button>
    </div>
  )
}

export default App
