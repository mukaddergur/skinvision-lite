import { scrollToSection } from '../utils/scroll';
import HeroVisual from './HeroVisual';

const QUICK_LINKS = [
  { id: 'bolgesel-analiz', label: 'Bölgesel analiz' },
  { id: 'kisisel-rutin', label: 'Kişisel rutin' },
  { id: 'icerik-rehberi', label: 'Etken maddeler' },
];

export default function HeroSection() {
  const handleScan = () => scrollToSection('analiz-baslat');

  return (
    <section className="w-full border-b border-rose-100/80 bg-gradient-to-br from-rose-50/50 via-[#faf9f6] to-amber-50/40">
      <div className="max-w-5xl mx-auto px-4 py-7 md:py-8">
        <div className="grid md:grid-cols-[auto_1fr] gap-6 md:gap-8 items-center">
          <HeroVisual />

          <div className="flex flex-col justify-center">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-rose-500">
              Yapay zeka destekli cilt analizi
            </p>
            <h2 className="text-xl md:text-[1.65rem] font-medium text-stone-800 tracking-tight leading-snug mt-2">
              Cildinizi analiz edin,
              <br />
              <span className="text-rose-600/90">rutininizi keşfedin</span>
            </h2>
            <p className="text-stone-600 text-sm mt-3 leading-relaxed">
              Fotoğraf yükleyin; kızarıklık, leke ve akne benzeri bölgeleri bölge bölge
              değerlendirelim.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={handleScan} className="btn-pill btn-pill--lg">
                Cildinizi tarayın
              </button>
              {QUICK_LINKS.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className="btn-pill btn-pill--lg"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
