const SCAN_POINTS = [
  { cx: 40, cy: 36, delay: '0s' },
  { cx: 55, cy: 40, delay: '0.4s' },
  { cx: 48, cy: 54, delay: '0.8s' },
  { cx: 34, cy: 50, delay: '1.2s' },
];

const SIZES = {
  compact: 'relative w-[120px] h-[220px] md:w-[140px] md:h-[260px]',
  hero: 'relative w-[130px] h-[240px] sm:w-[150px] sm:h-[280px] md:w-[175px] md:h-[320px]',
  default: 'relative w-[200px] h-[380px] md:w-[240px] md:h-[460px]',
};

export default function SkinScanOverlay({ compact = false, hero = false }) {
  const sizeKey = hero ? 'hero' : compact ? 'compact' : 'default';
  const gridSize = hero ? '22px' : compact ? '20px' : '28px';
  const isHero = hero || compact;

  return (
    <div className={SIZES[sizeKey]}>
      <div
        className={`absolute inset-0 rounded-[1.6rem] border-[2.5px] shadow-lg bg-white/5 ${
          hero ? 'border-stone-800/90' : 'border-white/85 shadow-[0_0_40px_rgba(255,255,255,0.2)]'
        }`}
      />

      <div className="absolute inset-[7px] rounded-[1.25rem] overflow-hidden bg-white/10">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.85) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.85) 1px, transparent 1px)
            `,
            backgroundSize: `${gridSize} ${gridSize}`,
          }}
        />
        <div className="absolute inset-x-0 h-14 bg-gradient-to-b from-white/40 to-transparent animate-scan-line pointer-events-none" />

        {SCAN_POINTS.map((pt) => (
          <span
            key={`${pt.cx}-${pt.cy}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pt.cx}%`, top: `${pt.cy}%` }}
          >
            <span
              className={`block rounded-full bg-white border border-white/80 shadow-md animate-pulse-scan ${
                isHero ? 'w-2.5 h-2.5' : 'w-3 h-3'
              }`}
              style={{ animationDelay: pt.delay }}
            />
          </span>
        ))}
      </div>

      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-3.5 rounded-full bg-stone-900/80 border border-stone-700/50" />
    </div>
  );
}
