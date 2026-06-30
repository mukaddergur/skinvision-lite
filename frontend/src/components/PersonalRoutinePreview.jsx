const ROUTINES = [
  {
    id: 'morning',
    time: 'Sabah Rutini',
    subtitle: 'Güneş koruması & nem',
    bg: '/backgrounds/routine-morning-skin.jpg',
    objectPosition: 'object-[center_35%]',
    scrim: 'from-amber-900/70 via-amber-800/30 to-transparent',
    tint: 'from-amber-200/25 via-transparent to-transparent',
    accent: 'bg-amber-400',
    accentRing: 'ring-amber-300/50',
    textLight: 'text-amber-50',
    textMuted: 'text-amber-100/80',
    badge: 'Gündüz',
    icon: 'sun',
    items: ['Nazik temizlik', 'Serum / nem', 'SPF 50+'],
  },
  {
    id: 'evening',
    time: 'Akşam Rutini',
    subtitle: 'Onarım & yenilenme',
    bg: '/backgrounds/routine-evening-skin.jpg',
    objectPosition: 'object-[center_40%]',
    scrim: 'from-indigo-950/75 via-indigo-900/35 to-transparent',
    tint: 'from-indigo-400/20 via-violet-500/10 to-transparent',
    accent: 'bg-violet-400',
    accentRing: 'ring-violet-300/50',
    textLight: 'text-indigo-50',
    textMuted: 'text-indigo-100/80',
    badge: 'Gece',
    icon: 'moon',
    items: ['Çift temizlik', 'Hedefli bakım', 'Gece kremi'],
  },
];

function SunIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-14 h-14 drop-shadow-lg" aria-hidden>
      <circle cx="32" cy="32" r="14" fill="#fbbf24" opacity="0.95" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="32" y1="32"
          x2={32 + 22 * Math.cos((deg * Math.PI) / 180)}
          y2={32 + 22 * Math.sin((deg * Math.PI) / 180)}
          stroke="#fde68a" strokeWidth="3" strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

function MoonStarsIcon() {
  return (
    <svg viewBox="0 0 80 64" className="w-20 h-14 drop-shadow-lg" aria-hidden>
      <circle cx="28" cy="32" r="16" fill="#e0e7ff" />
      <circle cx="36" cy="26" r="14" fill="#312e81" opacity="0.6" />
      {[[58, 12], [68, 28], [52, 40], [72, 48]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={1.5} fill="white" opacity="0.9" />
      ))}
    </svg>
  );
}

export default function PersonalRoutinePreview() {
  return (
    <section id="kisisel-rutin" className="scroll-mt-24 rounded-3xl overflow-hidden shadow-xl border border-rose-100">
      <div className="relative px-6 md:px-8 py-6 bg-gradient-to-r from-amber-50 via-white to-indigo-50 border-b border-rose-100">
        <p className="text-xs font-bold tracking-widest uppercase text-rose-500">Kişisel Rutin</p>
        <h3 className="text-xl md:text-2xl font-bold text-slate-800 mt-1">Size özel sabah & akşam rehberi</h3>
        <p className="text-sm text-slate-600 mt-2 max-w-2xl">
          Cilt bakımı gündüz ve gece farklı ihtiyaçlar gerektirir — analiz sonucunuza göre kişiselleştirilir.
        </p>
      </div>

      <div className="grid md:grid-cols-2 min-h-[420px]">
        {ROUTINES.map((step, idx) => (
          <div
            key={step.id}
            className={`relative overflow-hidden group min-h-[320px] md:min-h-[420px] ${
              idx === 0 ? 'md:border-r border-white/20' : ''
            }`}
          >
            <img
              src={step.bg}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover ${step.objectPosition} transition-transform duration-700 group-hover:scale-[1.03]`}
              aria-hidden
            />

            <div className={`absolute inset-0 bg-gradient-to-b ${step.tint}`} />

            <div className={`absolute inset-0 bg-gradient-to-t ${step.scrim}`} />

            {step.icon === 'moon' && (
              <div className="absolute inset-0 pointer-events-none" aria-hidden>
                {Array.from({ length: 20 }).map((_, i) => (
                  <span
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full opacity-70"
                    style={{
                      top: `${10 + (i * 17) % 55}%`,
                      left: `${8 + (i * 23) % 85}%`,
                    }}
                  />
                ))}
              </div>
            )}

            <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-8">
              <div className="flex items-start justify-between">
                <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-md bg-white/20 ${step.textLight} border border-white/30`}>
                  {step.badge}
                </span>
                {step.icon === 'sun' ? <SunIcon /> : <MoonStarsIcon />}
              </div>

              <div>
                <h4 className={`font-bold text-2xl ${step.textLight} drop-shadow-md`}>{step.time}</h4>
                <p className={`text-sm mt-1 mb-5 ${step.textMuted}`}>{step.subtitle}</p>
                <ul className="space-y-3">
                  {step.items.map((item, i) => (
                    <li key={item} className={`flex items-center gap-3 text-sm font-medium ${step.textLight}`}>
                      <span className={`w-8 h-8 rounded-full ${step.accent} ring-4 ${step.accentRing} text-white text-xs flex items-center justify-center font-bold shadow-lg`}>
                        {i + 1}
                      </span>
                      <span className="drop-shadow-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-1 bg-gradient-to-r from-amber-400 via-rose-300 to-indigo-500" />
    </section>
  );
}
