import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { GameBoard as GameBoardType, getCellsBetween, checkWord } from "@/lib/wordSearch";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowLeft, Trophy, Download, Sparkles, Star, Check } from "lucide-react";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";

interface GameBoardProps {
  board: GameBoardType;
  words: string[];
  onBack: () => void;
}

const FOUND_COLORS = [
  "found-green",
  "found-orange",
  "found-pink",
  "found-teal",
  "found-violet",
  "found-yellow",
  "found-sky",
];

const FOUND_BG: Record<string, string> = {
  "found-green": "bg-game-green/20 ring-2 ring-game-green/40",
  "found-orange": "bg-game-orange/20 ring-2 ring-game-orange/40",
  "found-pink": "bg-game-pink/20 ring-2 ring-game-pink/40",
  "found-teal": "bg-game-teal/20 ring-2 ring-game-teal/40",
  "found-violet": "bg-game-violet/20 ring-2 ring-game-violet/40",
  "found-yellow": "bg-[hsl(45,95%,65%)]/20 ring-2 ring-[hsl(45,95%,65%)]/40",
  "found-sky": "bg-[hsl(200,80%,62%)]/20 ring-2 ring-[hsl(200,80%,62%)]/40",
};

const WORD_COLORS: Record<string, string> = {
  "found-green": "bg-game-green text-accent-foreground",
  "found-orange": "bg-game-orange text-accent-foreground",
  "found-pink": "bg-game-pink text-accent-foreground",
  "found-teal": "bg-game-teal text-accent-foreground",
  "found-violet": "bg-game-violet text-accent-foreground",
  "found-yellow": "bg-[hsl(45,95%,65%)] text-secondary-foreground",
  "found-sky": "bg-[hsl(200,80%,62%)] text-accent-foreground",
};

const EMOJIS = ["🌟", "🎉", "💖", "✨", "🎀", "🌈", "⭐", "🧸", "🎨", "🍀"];

const GameBoardComponent = ({ board, words, onBack }: GameBoardProps) => {
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [foundWordColors, setFoundWordColors] = useState<Map<string, string>>(new Map());
  const [foundCells, setFoundCells] = useState<Map<string, string>>(new Map());
  const [selecting, setSelecting] = useState(false);
  const [startCell, setStartCell] = useState<[number, number] | null>(null);
  const [currentCell, setCurrentCell] = useState<[number, number] | null>(null);
  const [colorIndex, setColorIndex] = useState(0);
  const [lastFoundEmoji, setLastFoundEmoji] = useState("");

  const highlightedCells = useMemo(() => {
    if (!startCell || !currentCell) return new Set<string>();
    const cells = getCellsBetween(startCell[0], startCell[1], currentCell[0], currentCell[1]);
    if (!cells) return new Set<string>();
    return new Set(cells.map(([r, c]) => `${r},${c}`));
  }, [startCell, currentCell]);

  const allFound = foundWords.size === words.length;

  useEffect(() => {
    if (allFound && foundWords.size > 0) {
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ["#c084fc", "#f472b6", "#fbbf24", "#34d399", "#60a5fa"] });
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
      const matchedWord = words.find(w => w === selectedWord);
      if (matchedWord && !foundWords.has(matchedWord)) {
        const newFound = new Set(foundWords);
        newFound.add(matchedWord);
        setFoundWords(newFound);

        const color = FOUND_COLORS[colorIndex % FOUND_COLORS.length];
        const newCells = new Map(foundCells);
        cells.forEach(([r, c]) => newCells.set(`${r},${c}`, color));
        setFoundCells(newCells);

        const newWordColors = new Map(foundWordColors);
        newWordColors.set(matchedWord, color);
        setFoundWordColors(newWordColors);

        setColorIndex((colorIndex + 1) % FOUND_COLORS.length);
        setLastFoundEmoji(EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);

        // Mini celebration
        confetti({ particleCount: 30, spread: 40, origin: { y: 0.5 }, colors: ["#c084fc", "#f472b6", "#fbbf24"] });
      }
    }

    setSelecting(false);
    setStartCell(null);
    setCurrentCell(null);
  }, [startCell, currentCell, board.grid, words, foundWords, foundCells, foundWordColors, colorIndex]);

  const printRef = useRef<HTMLDivElement>(null);

  const handleSaveImage = useCallback(async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, { backgroundColor: "#fffbf5", scale: 2 });
    const link = document.createElement("a");
    link.download = "낱말찾기.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  const cellSize = board.size <= 6 ? "w-12 h-12 text-xl" : board.size <= 8 ? "w-10 h-10 text-lg" : "w-9 h-9 text-base";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 gap-5 relative overflow-hidden">
      {/* Floating decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {["✨", "🌸", "💜", "⭐", "🎀", "🌙", "💫", "🌟"].map((emoji, i) => (
          <span
            key={i}
            className="absolute text-xl opacity-20 animate-float"
            style={{
              left: `${5 + i * 12}%`,
              top: `${8 + (i % 4) * 22}%`,
              animationDelay: `${i * 0.7}s`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      {/* Score bar */}
      <div className="relative z-10 flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-full px-5 py-2.5 border-2 border-primary/20 shadow-lg">
        <Sparkles className="h-5 w-5 text-primary animate-sparkle" />
        <span className="font-display text-lg text-foreground">
          {foundWords.size} / {words.length} 찾았어요!
        </span>
        {lastFoundEmoji && <span className="text-xl animate-pop-in">{lastFoundEmoji}</span>}
      </div>

      {allFound && (
        <div className="relative z-10 flex items-center gap-3 bg-primary/10 rounded-full px-6 py-3 font-display text-2xl text-primary animate-bounce border-2 border-primary/30">
          <Trophy className="h-7 w-7 text-secondary" />
          축하해요! 모두 찾았어요! 🎉
        </div>
      )}

      <div ref={printRef} className="relative z-10 flex flex-col items-center gap-4 bg-card p-5 rounded-3xl shadow-xl border-2 border-primary/15">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-secondary" />
          <h2 className="font-display text-xl text-foreground">낱말찾기 퍼즐</h2>
          <Star className="h-5 w-5 text-secondary" />
        </div>

        <div
          className="select-none touch-none p-2 rounded-2xl bg-muted/30"
          onPointerUp={handlePointerUp}
          onPointerLeave={() => { if (selecting) handlePointerUp(); }}
        >
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${board.size}, 1fr)` }}
          >
            {board.grid.map((row, r) =>
              row.map((char, c) => {
                const key = `${r},${c}`;
                const isHighlighted = highlightedCells.has(key);
                const foundColor = foundCells.get(key);
                const foundBg = foundColor ? FOUND_BG[foundColor] : "";

                return (
                  <div
                    key={key}
                    className={`${cellSize} flex items-center justify-center rounded-xl font-bold cursor-pointer transition-all duration-150
                      ${isHighlighted ? "bg-primary text-primary-foreground scale-110 z-10 shadow-md ring-2 ring-primary/50" : ""}
                      ${!isHighlighted && foundBg ? foundBg : ""}
                      ${!isHighlighted && !foundBg ? "hover:bg-primary/10 hover:scale-105" : ""}
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

        <div className="w-full pt-3 border-t-2 border-dashed border-primary/15">
          <h3 className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1">
            🔍 찾아야 할 낱말
          </h3>
          <div className="flex flex-wrap gap-2">
            {words.map((w) => {
              const isFound = foundWords.has(w);
              const wordColor = foundWordColors.get(w);
              return (
                <span
                  key={w}
                  className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all inline-flex items-center gap-1 ${
                    isFound && wordColor
                      ? `${WORD_COLORS[wordColor]} line-through shadow-sm`
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {isFound && <Check className="h-3.5 w-3.5" />}
                  {w}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex gap-3 flex-wrap justify-center">
        <Button variant="outline" onClick={onBack} className="gap-2 rounded-full border-2 font-display hover:scale-105 transition-transform">
          <ArrowLeft className="h-4 w-4" />
          처음으로
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()} className="gap-2 rounded-full border-2 font-display hover:scale-105 transition-transform">
          <RotateCcw className="h-4 w-4" />
          새 게임
        </Button>
        <Button variant="outline" onClick={handleSaveImage} className="gap-2 rounded-full border-2 font-display hover:scale-105 transition-transform">
          <Download className="h-4 w-4" />
          이미지 저장
        </Button>
      </div>
    </div>
  );
};

export default GameBoardComponent;
