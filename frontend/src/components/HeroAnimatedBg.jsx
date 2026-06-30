export default function HeroAnimatedBg() {
  const bubbles = [
    { left: '12%', top: '18%', size: 80, delay: '0s', duration: '14s' },
    { left: '72%', top: '12%', size: 120, delay: '2s', duration: '18s' },
    { left: '55%', top: '65%', size: 95, delay: '4s', duration: '16s' },
    { left: '25%', top: '72%', size: 60, delay: '1s', duration: '12s' },
    { left: '85%', top: '55%', size: 70, delay: '3s', duration: '15s' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 hero-mesh-bg" />
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="absolute rounded-full hero-float-bubble"
          style={{
            left: b.left,
            top: b.top,
            width: b.size,
            height: b.size,
            animationDelay: b.delay,
            animationDuration: b.duration,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-rose-50/30" />
    </div>
  );
}
