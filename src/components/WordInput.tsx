import { useState } from "react";
import { X, Plus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WordInputProps {
  onStart: (words: string[]) => void;
}

const SAMPLE_WORDS = ["가정", "가족", "대인관계", "의사소통", "식사계획", "조리", "의복관리", "주거문화", "전환기", "진로탐색"];

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
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <h1 className="font-display text-5xl text-center mb-2 text-foreground tracking-tight">
          낱말찾기
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          낱말을 입력하고 퍼즐을 풀어보세요!
        </p>

        <div className="bg-card rounded-2xl shadow-lg p-6 border border-border">
          <div className="flex gap-2 mb-4">
            <Input
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="낱말 입력 (2글자 이상)"
              className="text-lg"
              maxLength={10}
            />
            <Button onClick={addWord} disabled={!current.trim() || words.length >= 20} size="icon" className="shrink-0">
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[48px] mb-4">
            {words.map((w, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
              >
                {w}
                <button onClick={() => removeWord(i)} className="hover:text-accent transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            {words.length === 0 && (
              <p className="text-muted-foreground text-sm py-1.5">
                아직 낱말이 없어요. 입력하거나{" "}
                <button onClick={loadSample} className="text-primary underline underline-offset-2 hover:text-primary/80">
                  예시 불러오기
                </button>
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{words.length}/20 낱말</span>
            <Button
              onClick={() => onStart(words)}
              disabled={words.length < 3}
              className="gap-2 text-base px-6"
              size="lg"
            >
              <Play className="h-5 w-5" />
              시작하기
            </Button>
          </div>
          {words.length > 0 && words.length < 3 && (
            <p className="text-xs text-accent mt-2 text-right">최소 3개 이상 입력해주세요</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordInput;
