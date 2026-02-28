import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { GameBoard as GameBoardType, getCellsBetween, checkWord } from "@/lib/wordSearch";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowLeft, Trophy, Download, Timer } from "lucide-react";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";

interface GameBoardProps {
  board: GameBoardType;
  words: string[];
  onBack: () => void;
  onNext?: () => void;
  isBonus?: boolean;
}

const FOUND_COLORS = [
  "bg-game-green/25 text-foreground",
  "bg-game-orange/25 text-foreground",
  "bg-game-pink/25 text-foreground",
  "bg-game-teal/25 text-foreground",
  "bg-game-violet/25 text-foreground",
];

const GameBoardComponent = ({ board, words, onBack, onNext, isBonus }: GameBoardProps) => {
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [foundCells, setFoundCells] = useState<Map<string, number>>(new Map());
  const [selecting, setSelecting] = useState(false);
  const [startCell, setStartCell] = useState<[number, number] | null>(null);
  const [currentCell, setCurrentCell] = useState<[number, number] | null>(null);
  const [colorIndex, setColorIndex] = useState(0);
  const [timePassed, setTimePassed] = useState(0);

  const highlightedCells = useMemo(() => {
    if (!startCell || !currentCell) return new Set<string>();
    const cells = getCellsBetween(startCell[0], startCell[1], currentCell[0], currentCell[1]);
    if (!cells) return new Set<string>();
    return new Set(cells.map(([r, c]) => `${r},${c}`));
  }, [startCell, currentCell]);

  const allFound = foundWords.size === words.length;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!allFound) {
      interval = setInterval(() => {
        setTimePassed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [allFound]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

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

      const matchedWord = words.find(w => w === selectedWord);
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

  const printRef = useRef<HTMLDivElement>(null);

  const handleSaveImage = useCallback(async () => {
    if (!printRef.current) return;
    try {
      const canvas = await html2canvas(printRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = isBonus ? "이번학기_운세.png" : "낱말찾기.png";
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 모바일 환경 폴백 (새 탭으로 열기)
      if (/iPad|iPhone|iPod|Android/i.test(navigator.userAgent)) {
        setTimeout(() => {
          window.open(dataUrl, '_blank');
        }, 100);
      }
    } catch (e) {
      console.error("Failed to save image:", e);
      alert("이미지 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  }, [isBonus]);

  const cellSize = board.size <= 6
    ? "text-3xl sm:text-4xl"
    : board.size <= 8
      ? "text-2xl sm:text-3xl"
      : "text-xl sm:text-2xl";

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6 w-full max-w-4xl mx-auto">
      {allFound && !isBonus && (
        <div className="flex flex-col items-center justify-center gap-4 bg-secondary/80 backdrop-blur-sm rounded-2xl px-8 py-5 font-display text-secondary-foreground animate-bounce-short border border-border shadow-xl">
          <div className="flex items-center gap-2 text-2xl">
            <Trophy className="h-7 w-7 text-yellow-500" />
            <span>축하합니다! 모두 찾았어요!</span>
          </div>
          <div className="text-xl opacity-90 font-medium">
            기록: {formatTime(timePassed)}
          </div>
          {onNext && (
            <Button size="lg" onClick={onNext} className="mt-2 text-lg shadow-md animate-pulse">
              다음 스테이지로!
            </Button>
          )}
        </div>
      )}

      <div ref={printRef} className="flex flex-col items-center gap-6 bg-card p-6 sm:p-10 rounded-2xl shadow-lg border border-border w-full">
        <div className="flex flex-col items-center gap-2 mb-2 text-center">
          {isBonus ? (
            <h2 className="font-display text-2xl sm:text-3xl text-foreground !leading-tight px-4 text-balance break-keep">
              가장 처음 보이는 세 단어가 이번 학기에 얻을 수 있는 것!
            </h2>
          ) : (
            <h2 className="font-display text-3xl sm:text-4xl text-foreground">낱말찾기</h2>
          )}
          {!isBonus && (
            <div className="flex items-center gap-1.5 text-sm sm:text-base font-medium text-muted-foreground bg-muted/60 px-4 py-1.5 rounded-full shadow-inner">
              <Timer className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-mono">{formatTime(timePassed)}</span>
            </div>
          )}
        </div>
        <div
          className="select-none touch-none w-full mx-auto"
          style={{ maxWidth: "min(100%, 50vh)" }}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => { if (selecting) handlePointerUp(); }}
        >
          <div
            className="grid gap-1 w-full aspect-square"
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
                    className={`${cellSize} aspect-square w-full h-full flex items-center justify-center rounded-lg font-bold cursor-pointer transition-all duration-100
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

        {!isBonus && (
          <div className="w-full pt-6 mt-4 border-t border-border">
            <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-4 text-center sm:text-left">
              찾아야 할 낱말
            </h3>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
              {words.map((w) => (
                <span
                  key={w}
                  className={`px-4 py-2 rounded-full text-base sm:text-lg font-medium transition-all shadow-sm ${foundWords.has(w)
                    ? "bg-primary text-primary-foreground line-through opacity-70"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}
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
        <Button variant="outline" onClick={handleSaveImage} className="gap-2">
          <Download className="h-4 w-4" />
          이미지 저장
        </Button>
      </div>
    </div>
  );
};

export default GameBoardComponent;
