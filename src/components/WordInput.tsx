import { useState } from "react";
import { X, Plus, Play, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WordInputProps {
  onStart: (words: string[]) => void;
}

const SAMPLE_WORDS = ["사과", "바나나", "포도", "수박", "딸기", "키위", "망고", "레몬", "체리", "복숭아"];

const EMOJIS = ["🍎", "🍊", "🍋", "🍇", "🍓", "🍉", "🥝", "🍑", "🌸", "⭐", "🌈", "💫", "🎀", "🧸", "🎨"];

const WordInput = ({ onStart }: WordInputProps) => {
  const [words, setWords] = useState<string[]>([]);
  const [current, setCurrent] = useState("");

  const addWord = () => {
    const trimmed = current.trim();
    if (!trimmed || words.includes(trimmed) || words.length >= 20) return;
    if ([...trimmed].length < 2) return;
    setWords([...words, trimmed]);
    setCurrent("");
  };

  const removeWord = (i: number) => {
    setWords(words.filter((_, idx) => idx !== i));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addWord();
    }
  };

  const loadSample = () => {
    setWords(SAMPLE_WORDS);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
      {/* Floating decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {["🌸", "⭐", "🎀", "💜", "✨", "🌙"].map((emoji, i) => (
          <span
            key={i}
            className="absolute text-2xl opacity-30 animate-float"
            style={{
              left: `${10 + i * 15}%`,
              top: `${5 + (i % 3) * 30}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="h-8 w-8 text-secondary animate-wiggle" />
            <h1 className="font-display text-5xl text-foreground tracking-tight">
              낱말찾기
            </h1>
            <Sparkles className="h-8 w-8 text-accent animate-wiggle" style={{ animationDelay: "0.5s" }} />
          </div>
          <p className="text-muted-foreground font-medium">
            ✨ 낱말을 입력하고 퍼즐을 풀어보세요! ✨
          </p>
        </div>

        <div className="bg-card rounded-3xl shadow-xl p-6 border-2 border-primary/20 relative">
          {/* Corner decorations */}
          <span className="absolute -top-3 -right-3 text-2xl animate-float">🎀</span>
          <span className="absolute -bottom-3 -left-3 text-2xl animate-float" style={{ animationDelay: "1s" }}>⭐</span>

          <div className="flex gap-2 mb-5">
            <Input
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="🔤 낱말 입력 (2글자 이상)"
              className="text-lg rounded-xl border-2 border-primary/20 focus-visible:ring-primary/30 bg-muted/30"
              maxLength={10}
            />
            <Button
              onClick={addWord}
              disabled={!current.trim() || words.length >= 20}
              size="icon"
              className="shrink-0 rounded-xl h-10 w-10 bg-primary hover:bg-primary/90"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[52px] mb-5 p-3 rounded-2xl bg-muted/30 border border-border/50">
            {words.map((w, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-sm font-bold animate-pop-in border border-primary/20"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <span className="text-xs">{EMOJIS[i % EMOJIS.length]}</span>
                {w}
                <button onClick={() => removeWord(i)} className="hover:text-accent transition-colors ml-0.5">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            {words.length === 0 && (
              <p className="text-muted-foreground text-sm py-1.5 w-full text-center">
                아직 낱말이 없어요!{" "}
                <button onClick={loadSample} className="text-primary font-bold underline underline-offset-2 hover:text-primary/80">
                  🎲 예시 불러오기
                </button>
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-secondary" />
              <span className="text-sm font-bold text-muted-foreground">{words.length}/20</span>
            </div>
            <Button
              onClick={() => onStart(words)}
              disabled={words.length < 3}
              className="gap-2 text-base px-8 rounded-full font-display bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              size="lg"
            >
              <Play className="h-5 w-5" />
              시작하기!
            </Button>
          </div>
          {words.length > 0 && words.length < 3 && (
            <p className="text-xs text-accent font-bold mt-3 text-right">💡 최소 3개 이상 입력해주세요</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordInput;
