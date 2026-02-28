import { useState, useCallback } from "react";
import WordInput from "@/components/WordInput";
import GameBoardComponent from "@/components/GameBoard";
import Footer from "@/components/Footer";
import { Glow } from "@/components/ui/glow";
import { cn } from "@/lib/utils";
import { generateBoard, GameBoard } from "@/lib/wordSearch";

const BONUS_WORDS = ["연애", "행운", "대박", "힐링", "성적", "인기", "베프", "만점", "두쫀쿠", "절친", "집중력"];

const Index = () => {
  const [gameState, setGameState] = useState<"input" | "playing" | "bonus">("input");
  const [board, setBoard] = useState<GameBoard | null>(null);
  const [words, setWords] = useState<string[]>([]);

  const handleStart = useCallback((inputWords: string[]) => {
    const generated = generateBoard(inputWords);
    setBoard(generated);
    setWords(inputWords);
    setGameState("playing");
  }, []);

  const handleBack = useCallback(() => {
    setGameState("input");
    setBoard(null);
  }, []);

  const handleNext = useCallback(() => {
    const generated = generateBoard(BONUS_WORDS);
    setBoard(generated);
    setWords(BONUS_WORDS);
    setGameState("bonus");
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none z-0">
        <Glow
          variant="center"
          className={cn(
            "opacity-40",
            "scale-125",
            "blur-3xl animate-appear-zoom"
          )}
        />
      </div>

      <main className="flex-1 flex flex-col relative z-10 w-full">
        {gameState === "playing" && board ? (
          <GameBoardComponent key={gameState} board={board} words={words} onBack={handleBack} onNext={handleNext} />
        ) : gameState === "bonus" && board ? (
          <GameBoardComponent key={gameState} board={board} words={words} onBack={handleBack} isBonus={true} />
        ) : (
          <WordInput onStart={handleStart} />
        )}
      </main>
      <div className="relative z-10 w-full">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
