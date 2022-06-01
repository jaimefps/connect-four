import { rerender, VanillaState } from "use-vanilla-state"
import "./App.css"

export const initBoard = [
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null]
] as (Mark | null)[][]

type Mark = "RED" | "BLACK"
type Board = typeof initBoard
type WinState =
  | {
      mark: Mark
      line: number[][]
    }
  | {
      mark: "DRAW"
      line: null
    }
  | null

export class GameState extends VanillaState {
  private started = false
  private board: Board = this.cloneBoard(initBoard)

  @rerender
  play(col: number, row: number) {
    this.started = true
    const nextBoard = this.cloneBoard(this.board)
    nextBoard[row][col] = this.currTurn
    this.board = nextBoard
    return this
  }

  @rerender
  restart() {
    this.started = false
    this.board = this.cloneBoard(initBoard)
    return this
  }

  private cloneBoard(b: Board) {
    return b.map((r) => [...r])
  }
  private hasMarkedAll() {
    return (
      this.board.filter((r) => {
        return r.every(Boolean)
      }).length === 6
    )
  }
  private winner(): Mark {
    return this.currTurn === "RED" ? "BLACK" : "RED"
  }
  private checkRows() {
    const rows = this.board
    for (let i = 0; i < rows.length; i++) {
      const thisRow = rows[i]
      let marks = [thisRow[0]]
      for (let j = 1; j < thisRow.length; j++) {
        const prevMark = marks[marks.length - 1]
        const currMark = thisRow[j]
        if (prevMark && prevMark === currMark) {
          marks.push(currMark)
          if (marks.length === 4) {
            return {
              mark: this.winner(),
              line: [
                [i, j - 3],
                [i, j - 2],
                [i, j - 1],
                [i, j]
              ]
            }
          }
        } else {
          marks = [currMark]
        }
      }
    }
    return null
  }
  private checkColumns() {
    const columns = this.columns
    for (let i = 0; i < columns.length; i++) {
      const thisColumn = columns[i]
      let marks = [thisColumn[0]]
      for (let j = 1; j < thisColumn.length; j++) {
        const prevMark = marks[marks.length - 1]
        const currMark = thisColumn[j]
        if (prevMark && prevMark === currMark) {
          marks.push(currMark)
          if (marks.length === 4) {
            return {
              mark: this.winner(),
              line: [
                [j - 3, i],
                [j - 2, i],
                [j - 1, i],
                [j, i]
              ]
            }
          }
        } else {
          marks = [currMark]
        }
      }
    }
    return null
  }
  private checkBackSlashes() {
    const b = this.board
    const starts = [
      [2, 0],
      [1, 0],
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3]
    ]
    for (const st of starts) {
      let y = st[0]
      let x = st[1]
      let currMark = b[y][x]
      let marks: (Mark | null)[] = []
      while (true) {
        const prevMark = marks[marks.length - 1]
        if (currMark && currMark === prevMark) {
          marks.push(currMark)
          if (marks.length === 4) {
            return {
              mark: this.winner(),
              line: [
                [y - 3, x - 3],
                [y - 2, x - 2],
                [y - 1, x - 1],
                [y, x]
              ]
            }
          }
        } else {
          marks = [currMark]
        }
        x += 1
        y += 1
        if (x <= 6 && y <= 5) {
          currMark = b[y][x]
        } else {
          break
        }
      }
    }
    return null
  }
  private checkForwardSlashes() {
    const b = this.board
    const starts = [
      [0, 3],
      [0, 4],
      [0, 5],
      [0, 6],
      [1, 6],
      [2, 6]
    ]
    for (const st of starts) {
      let y = st[0]
      let x = st[1]
      let currMark = b[y][x]
      let marks: (Mark | null)[] = []
      while (true) {
        const prevMark = marks[marks.length - 1]
        if (currMark && currMark === prevMark) {
          marks.push(currMark)
          if (marks.length === 4) {
            return {
              mark: this.winner(),
              line: [
                [y - 3, x + 3],
                [y - 2, x + 2],
                [y - 1, x + 1],
                [y, x]
              ]
            }
          }
        } else {
          marks = [currMark]
        }
        x -= 1
        y += 1
        if (x >= 0 && y <= 5) {
          currMark = b[y][x]
        } else {
          break
        }
      }
    }
    return null
  }
  get columns() {
    const width = 7
    const height = 6
    const columns = []
    const b = this.board
    for (let i = 0; i < width; i++) {
      const thisCol = []
      for (let j = 0; j < height; j++) {
        thisCol.push(b[j][i])
      }
      columns.push(thisCol)
    }
    return columns
  }
  get currTurn(): Mark {
    let bCount = 0
    let rCount = 0
    this.board.forEach((r) => {
      r.forEach((el) => {
        if (el === "RED") rCount++
        if (el === "BLACK") bCount++
      })
    })
    return bCount > rCount ? "RED" : "BLACK"
  }
  get boardState() {
    return this.board
  }
  get hasStarted() {
    return this.started
  }
  get winState(): WinState {
    const rowWin = this.checkRows()
    if (rowWin) return rowWin
    const columnWin = this.checkColumns()
    if (columnWin) return columnWin
    const bSlashWin = this.checkBackSlashes()
    if (bSlashWin) return bSlashWin
    const fSlashWin = this.checkForwardSlashes()
    if (fSlashWin) return fSlashWin
    if (this.hasMarkedAll()) return { mark: "DRAW", line: null }
    return null
  }
}
