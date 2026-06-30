export default function ScoreSlider({ score, color = '#e11d48' }) {
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div className="mt-4 pt-2">
      <div className="relative h-2 rounded-full bg-stone-200">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
        <div
          className="absolute -top-2 w-9 h-9 -translate-x-1/2 flex items-center justify-center"
          style={{ left: `${clamped}%` }}
        >
          <div
            className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-md border-2 border-white"
            style={{ backgroundColor: color }}
          >
            {clamped}
          </div>
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-stone-400 mt-3 px-0.5">
        <span>0</span>
        <span>Orta</span>
        <span>Ortalama</span>
        <span>İyi</span>
        <span>100</span>
      </div>
    </div>
  );
}
