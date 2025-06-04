"use client";

import React, { useState } from "react";
import { Word } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface WordCardProps {
  word: Word;
  showAnswer: boolean;
  onKnow: () => void;
  onDontKnow: () => void;
  onToggleAnswer: () => void;
}

export function WordCard({
  word,
  showAnswer,
  onKnow,
  onDontKnow,
  onToggleAnswer,
}: WordCardProps) {
  const [showExamples, setShowExamples] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card variant="word" className="text-center">
        {/* 单词 */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">{word.word}</h1>
          <p className="text-sky-300 text-lg">{word.pronunciation}</p>
        </div>

        {/* 答案区域 */}
        {showAnswer ? (
          <div className="space-y-6">
            {/* 释义 */}
            <div className="space-y-3">
              {word.definitions.map((def, index) => (
                <div key={index} className="text-left">
                  <span className="text-sky-400 font-medium">
                    {def.partOfSpeech}
                  </span>
                  <p className="text-white text-lg mt-1">{def.meaning}</p>
                  {def.englishMeaning && (
                    <p className="text-white/70 text-sm mt-1">
                      {def.englishMeaning}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* 例句 */}
            {word.examples.length > 0 && (
              <div className="border-t border-white/20 pt-4">
                <button
                  onClick={() => setShowExamples(!showExamples)}
                  className="text-sky-400 hover:text-sky-300 text-sm font-medium mb-3"
                >
                  {showExamples ? "隐藏例句" : "显示例句"}
                </button>
                {showExamples && (
                  <div className="space-y-3">
                    {word.examples.map((example, index) => (
                      <div
                        key={index}
                        className="text-left bg-white/5 rounded-lg p-3"
                      >
                        <p className="text-white/90 italic">
                          {example.sentence}
                        </p>
                        <p className="text-white/70 text-sm mt-1">
                          {example.translation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-4 pt-4">
              <Button
                variant="default"
                onClick={onDontKnow}
                className="flex-1 bg-red-600/70 hover:bg-red-500/70 border-red-500/50"
              >
                不认识
              </Button>
              <Button
                variant="primary"
                onClick={onKnow}
                className="flex-1 bg-green-600/70 hover:bg-green-500/70 border-green-500/50"
              >
                认识
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-white/70 text-lg">你认识这个单词吗？</p>
            <div className="flex gap-4">
              <Button
                variant="default"
                onClick={onToggleAnswer}
                className="flex-1"
              >
                显示答案
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 单词标签 */}
      <div className="flex justify-center gap-2 mt-4">
        {word.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-white/10 text-white/80 text-sm rounded-full border border-white/20"
          >
            {tag}
          </span>
        ))}
        <span
          className={`px-3 py-1 text-sm rounded-full border ${
            word.difficulty === "easy"
              ? "bg-green-600/20 text-green-300 border-green-500/30"
              : word.difficulty === "medium"
              ? "bg-yellow-600/20 text-yellow-300 border-yellow-500/30"
              : "bg-red-600/20 text-red-300 border-red-500/30"
          }`}
        >
          {word.difficulty === "easy"
            ? "简单"
            : word.difficulty === "medium"
            ? "中等"
            : "困难"}
        </span>
      </div>
    </div>
  );
}
