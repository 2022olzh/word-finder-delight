// Directions: [rowDelta, colDelta]
const DIRECTIONS: [number, number][] = [
  [0, 1],   // right
  [1, 0],   // down
  [1, 1],   // diagonal down-right
  [-1, 1],  // diagonal up-right
  [0, -1],  // left
  [-1, 0],  // up
  [-1, -1], // diagonal up-left
  [1, -1],  // diagonal down-left
];

const KOREAN_CHARS = "가나다라마바사아자차카타파하거너더러머버서어저처커터퍼허고노도로모보소오조초코토포호구누두루무부수우주추쿠투푸후";

export interface PlacedWord {
  word: string;
  startRow: number;
  startCol: number;
  direction: [number, number];
  cells: [number, number][];
}

export interface GameBoard {
  grid: string[][];
  size: number;
  placedWords: PlacedWord[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function canPlace(grid: string[][], word: string, row: number, col: number, dir: [number, number], size: number): boolean {
  const chars = [...word];
  for (let i = 0; i < chars.length; i++) {
    const r = row + dir[0] * i;
    const c = col + dir[1] * i;
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    if (grid[r][c] !== "" && grid[r][c] !== chars[i]) return false;
  }
  return true;
}

function placeWord(grid: string[][], word: string, row: number, col: number, dir: [number, number]): [number, number][] {
  const chars = [...word];
  const cells: [number, number][] = [];
  for (let i = 0; i < chars.length; i++) {
    const r = row + dir[0] * i;
    const c = col + dir[1] * i;
    grid[r][c] = chars[i];
    cells.push([r, c]);
  }
  return cells;
}

export function generateBoard(words: string[]): GameBoard {
  // Determine grid size based on longest word and word count
  const maxLen = Math.max(...words.map(w => [...w].length));
  const size = Math.max(Math.min(Math.max(maxLen + 2, Math.ceil(Math.sqrt(words.length * maxLen * 2))), 10), 5);

  let grid: string[][] = [];
  let placedWords: PlacedWord[] = [];
  let success = false;

  // Try multiple times to place all words
  for (let attempt = 0; attempt < 50 && !success; attempt++) {
    grid = Array.from({ length: size }, () => Array(size).fill(""));
    placedWords = [];
    const sortedWords = shuffle(words).sort((a, b) => [...b].length - [...a].length);
    
    let allPlaced = true;
    for (const word of sortedWords) {
      const dirs = shuffle([...DIRECTIONS]);
      let placed = false;
      for (const dir of dirs) {
        const positions = shuffle(
          Array.from({ length: size * size }, (_, i) => [Math.floor(i / size), i % size] as [number, number])
        );
        for (const [row, col] of positions) {
          if (canPlace(grid, word, row, col, dir, size)) {
            const cells = placeWord(grid, word, row, col, dir);
            placedWords.push({ word, startRow: row, startCol: col, direction: dir, cells });
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
      if (!placed) {
        allPlaced = false;
        break;
      }
    }
    if (allPlaced) success = true;
  }

  // Fill empty cells with random Korean characters
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = KOREAN_CHARS[Math.floor(Math.random() * KOREAN_CHARS.length)];
      }
    }
  }

  return { grid, size, placedWords };
}

export function getCellsBetween(r1: number, c1: number, r2: number, c2: number): [number, number][] | null {
  const dr = r2 - r1;
  const dc = c2 - c1;

  // Must be horizontal, vertical, or diagonal
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;

  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  if (steps === 0) return [[r1, c1]];

  const stepR = dr / steps;
  const stepC = dc / steps;

  const cells: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    cells.push([r1 + stepR * i, c1 + stepC * i]);
  }
  return cells;
}

export function checkWord(grid: string[][], cells: [number, number][]): string {
  return cells.map(([r, c]) => grid[r][c]).join("");
}
