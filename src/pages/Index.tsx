import { useState, useCallback } from "react";
import WordInput from "@/components/WordInput";
import GameBoardComponent from "@/components/GameBoard";
import { generateBoard, GameBoard } from "@/lib/wordSearch";

const Index = () => {
  const [gameState, setGameState] = useState<"input" | "playing">("input");
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

  if (gameState === "playing" && board) {
    return <GameBoardComponent board={board} words={words} onBack={handleBack} />;
  }

  return <WordInput onStart={handleStart} />;
};

export default Index;
