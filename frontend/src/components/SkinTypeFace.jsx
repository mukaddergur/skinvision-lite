export default function SkinTypeFace({ type = 'normal', highlightZone = null, className = '' }) {
  const skinZones = {
    normal: null,
    dry: { cheeks: true },
    oily: { tzone: true },
    combination: { tzone: true },
    sensitive: { full: true },
  };

  const hairColors = {
    normal: { fill: '#fcd9bd', stroke: '#e8a87c' },
    dry: { fill: '#fde68a', stroke: '#f59e0b' },
    oily: { fill: '#fcd9bd', stroke: '#e8a87c' },
    combination: { fill: '#fca5a5', stroke: '#e11d48' },
    sensitive: { fill: '#fbcfe8', stroke: '#f472b6' },
  };

  const hair = hairColors[type] || hairColors.normal;
  const z = skinZones[type] || null;

  const zoneHighlight = {
    forehead: (
      <ellipse cx="60" cy="48" rx="28" ry="14" fill="#fb7185" opacity="0.65" />
    ),
    cheeks: (
      <>
        <ellipse cx="34" cy="82" rx="14" ry="12" fill="#38bdf8" opacity="0.6" />
        <ellipse cx="86" cy="82" rx="14" ry="12" fill="#38bdf8" opacity="0.6" />
      </>
    ),
    nose: (
      <path d="M44 52 Q60 46 76 52 L72 100 Q60 106 48 100 Z" fill="#a78bfa" opacity="0.55" />
    ),
    chin: (
      <ellipse cx="60" cy="108" rx="22" ry="14" fill="#4ade80" opacity="0.6" />
    ),
  };

  return (
    <svg viewBox="0 0 120 140" className={className} aria-hidden="true">
      <circle cx="60" cy="70" r="50" fill="#fff0f5" opacity="0.8" />

      <ellipse cx="60" cy="74" rx="40" ry="48" fill="#ffe4d6" stroke="#fda4af" strokeWidth="1.5" />

      <path
        d="M20 62 Q60 2 100 62 Q96 38 60 22 Q24 38 20 62"
        fill={hair.fill}
        stroke={hair.stroke}
        strokeWidth="1.5"
      />

      <ellipse cx="36" cy="80" rx="10" ry="7" fill="#fda4af" opacity="0.45" />
      <ellipse cx="84" cy="80" rx="10" ry="7" fill="#fda4af" opacity="0.45" />

      <ellipse cx="44" cy="68" rx="6" ry="4" fill="#fff" stroke="#475569" strokeWidth="1" />
      <ellipse cx="76" cy="68" rx="6" ry="4" fill="#fff" stroke="#475569" strokeWidth="1" />
      <circle cx="45" cy="68" r="2" fill="#334155" />
      <circle cx="77" cy="68" r="2" fill="#334155" />

      <path d="M60 74 L57 84 L63 84 Z" fill="none" stroke="#e879a9" strokeWidth="1" />

      <path d="M50 96 Q60 104 70 96" fill="#fb7185" opacity="0.7" stroke="#f43f5e" strokeWidth="0.8" />

      {highlightZone && zoneHighlight[highlightZone]}

      {!highlightZone && z?.cheeks && (
        <>
          <ellipse cx="34" cy="82" rx="13" ry="11" fill="#f472b6" opacity="0.5" />
          <ellipse cx="86" cy="82" rx="13" ry="11" fill="#f472b6" opacity="0.5" />
        </>
      )}
      {!highlightZone && z?.tzone && (
        <path d="M38 52 Q60 46 82 52 L78 100 Q60 110 42 100 Z" fill="#fb923c" opacity="0.45" />
      )}
      {!highlightZone && z?.full && (
        <ellipse cx="60" cy="78" rx="34" ry="40" fill="#f472b6" opacity="0.35" />
      )}

      <circle cx="90" cy="40" r="3" fill="#fff" opacity="0.8" />
      <circle cx="28" cy="50" r="2" fill="#fff" opacity="0.6" />
    </svg>
  );
}
