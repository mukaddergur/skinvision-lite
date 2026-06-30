import { INGREDIENTS } from '../data/ingredients';

export default function IngredientCarousel() {
  return (
    <section id="icerik-rehberi" className="scroll-mt-24">
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 md:p-8">
        <div className="mb-6">
          <p className="text-[11px] font-medium tracking-wide uppercase text-stone-400">
            Trend ve İpuçları
          </p>
          <h3 className="text-lg md:text-xl font-medium text-stone-800 mt-1">
            Hangi madde ne için kullanılır?
          </h3>
          <p className="text-sm text-stone-500 mt-1">
            Gerçek etken maddelerin cildinizdeki rolü
          </p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
          {INGREDIENTS.map((item) => (
            <article
              key={item.id}
              className="snap-start shrink-0 w-56 md:w-64 rounded-xl overflow-hidden bg-stone-50
                border border-stone-200/80 hover:border-stone-300 transition-colors group"
            >
              <div className="h-40 relative overflow-hidden bg-stone-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
                <span className="absolute bottom-2 left-2 text-[9px] font-semibold uppercase tracking-wider text-stone-600 bg-white/90 px-2 py-0.5 rounded">
                  Etken madde
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-medium text-sm leading-snug text-stone-800">
                  {item.title}
                </h4>
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
