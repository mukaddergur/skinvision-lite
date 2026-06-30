import { useState } from 'react';
import { SKIN_QUESTIONS } from '../data/skinQuestions';

export default function SkinQuestionnaire({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const question = SKIN_QUESTIONS[step];
  const total = SKIN_QUESTIONS.length;
  const progress = ((step + 1) / total) * 100;
  const selected = answers[question.id];

  const handleSelect = (optionId) => {
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
  };

  const handleNext = () => {
    if (!selected) return;
    if (step < total - 1) {
      setStep((s) => s + 1);
      return;
    }
    onComplete(answers);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 md:py-10">
        <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
          <span>Soru {step + 1}</span>
          <span>{step + 1}/{total}</span>
        </div>
        <div className="h-1 rounded-full bg-stone-200 overflow-hidden mb-8">
          <div
            className="h-full bg-rose-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <h2 className="text-lg md:text-xl font-medium text-stone-800 leading-snug mb-6">
          {question.question}
        </h2>

        <div className="space-y-3">
          {question.options.map((option) => {
            const isSelected = selected === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                className={`btn-pill w-full justify-start text-left px-4 py-3.5 ${
                  isSelected ? 'btn-pill--active' : ''
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-stone-200 bg-white/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0}
            className="btn-pill flex-1 btn-pill--lg"
          >
            Geri
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!selected}
            className="btn-pill flex-1 btn-pill--lg"
          >
            {step === total - 1 ? 'Tamamla' : 'Devam'}
          </button>
        </div>
      </div>
    </div>
  );
}
