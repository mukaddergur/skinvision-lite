const HERO_SRC = '/hero/hero-alt.jpg';
const HERO_WIDTH = 682;
const HERO_HEIGHT = 1024;

export default function HeroVisual() {
  return (
    <div className="flex justify-start w-fit max-w-full">
      <img
        src={HERO_SRC}
        alt="Yapay zeka destekli cilt tarama"
        width={HERO_WIDTH}
        height={HERO_HEIGHT}
        loading="eager"
        decoding="async"
        className="block w-auto h-auto max-w-full max-h-[260px] sm:max-h-[300px] md:max-h-[340px]
          rounded-2xl shadow-[0_10px_36px_rgba(244,114,182,0.14)] ring-1 ring-rose-100/90"
      />
    </div>
  );
}
