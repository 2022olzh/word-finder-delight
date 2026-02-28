import { useState, useCallback, useMemo, useEffect } from "react";
import { GameBoard as GameBoardType, getCellsBetween, checkWord } from "@/lib/wordSearch";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowLeft, Trophy } from "lucide-react";
import confetti from "canvas-confetti";

interface GameBoardProps {
  board: GameBoardType;
  words: string[];
  onBack: () => void;
}

const FOUND_COLORS = [
  "bg-game-green/25 text-foreground",
  "bg-game-orange/25 text-foreground",
  "bg-game-pink/25 text-foreground",
  "bg-game-teal/25 text-foreground",
  "bg-game-violet/25 text-foreground",
];

const GameBoardComponent = ({ board, words, onBack }: GameBoardProps) => {
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [foundCells, setFoundCells] = useState<Map<string, number>>(new Map());
  const [selecting, setSelecting] = useState(false);
  const [startCell, setStartCell] = useState<[number, number] | null>(null);
  const [currentCell, setCurrentCell] = useState<[number, number] | null>(null);
  const [colorIndex, setColorIndex] = useState(0);

  const highlightedCells = useMemo(() => {
    if (!startCell || !currentCell) return new Set<string>();
    const cells = getCellsBetween(startCell[0], startCell[1], currentCell[0], currentCell[1]);
    if (!cells) return new Set<string>();
    return new Set(cells.map(([r, c]) => `${r},${c}`));
  }, [startCell, currentCell]);

  const allFound = foundWords.size === words.length;

  useEffect(() => {
    if (allFound && foundWords.size > 0) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    }
  }, [allFound, foundWords.size]);

  const handlePointerDown = useCallback((r: number, c: number) => {
    setSelecting(true);
    setStartCell([r, c]);
    setCurrentCell([r, c]);
  }, []);

  const handlePointerEnter = useCallback((r: number, c: number) => {
    if (!selecting) return;
    setCurrentCell([r, c]);
  }, [selecting]);

  const handlePointerUp = useCallback(() => {
    if (!startCell || !currentCell) {
      setSelecting(false);
      return;
    }

    const cells = getCellsBetween(startCell[0], startCell[1], currentCell[0], currentCell[1]);
    if (cells && cells.length >= 2) {
      const selectedWord = checkWord(board.grid, cells);
      const reversedWord = checkWord(board.grid, [...cells].reverse());

      const matchedWord = words.find(w => w === selectedWord || w === reversedWord);
      if (matchedWord && !foundWords.has(matchedWord)) {
        const newFound = new Set(foundWords);
        newFound.add(matchedWord);
        setFoundWords(newFound);

        const newCells = new Map(foundCells);
        cells.forEach(([r, c]) => newCells.set(`${r},${c}`, colorIndex));
        setFoundCells(newCells);
        setColorIndex((colorIndex + 1) % FOUND_COLORS.length);
      }
    }

    setSelecting(false);
    setStartCell(null);
    setCurrentCell(null);
  }, [startCell, currentCell, board.grid, words, foundWords, foundCells, colorIndex]);

  const cellSize = board.size <= 6 ? "w-12 h-12 text-xl" : board.size <= 8 ? "w-10 h-10 text-lg" : "w-8 h-8 text-base";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 gap-6">
      {allFound && (
        <div className="flex items-center gap-2 bg-secondary/50 rounded-full px-6 py-3 font-display text-2xl text-secondary-foreground animate-bounce">
          <Trophy className="h-6 w-6" />
          축하합니다! 모두 찾았어요!
        </div>
      )}

      <div
        className="bg-card rounded-2xl shadow-lg p-4 border border-border select-none touch-none"
        onPointerUp={handlePointerUp}
        onPointerLeave={() => { if (selecting) handlePointerUp(); }}
      >
        <div
          className="grid gap-0.5"
          style={{ gridTemplateColumns: `repeat(${board.size}, 1fr)` }}
        >
          {board.grid.map((row, r) =>
            row.map((char, c) => {
              const key = `${r},${c}`;
              const isHighlighted = highlightedCells.has(key);
              const foundColor = foundCells.has(key) ? FOUND_COLORS[foundCells.get(key)!] : "";

              return (
                <div
                  key={key}
                  className={`${cellSize} flex items-center justify-center rounded-lg font-bold cursor-pointer transition-all duration-100
                    ${isHighlighted ? "bg-primary text-primary-foreground scale-110 z-10" : ""}
                    ${!isHighlighted && foundColor ? foundColor : ""}
                    ${!isHighlighted && !foundColor ? "hover:bg-muted" : ""}
                  `}
                  onPointerDown={() => handlePointerDown(r, c)}
                  onPointerEnter={() => handlePointerEnter(r, c)}
                >
                  {char}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-lg p-5 border border-border w-full max-w-md">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          찾은 낱말 {foundWords.size}/{words.length}
        </h3>
        <div className="flex flex-wrap gap-2">
          {words.map((w) => (
            <span
              key={w}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                foundWords.has(w)
                  ? "bg-primary text-primary-foreground line-through opacity-70"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {w}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          처음으로
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          새 게임
        </Button>
      </div>
    </div>
  );
};

export default GameBoardComponent;
