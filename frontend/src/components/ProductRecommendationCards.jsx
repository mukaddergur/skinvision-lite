const ICONS = {
  cleanser: '🧴',
  moisturizer: '💧',
  serum: '✨',
  spf: '🛡️',
};

export default function ProductRecommendationCards({ recommendations }) {
  const cards = recommendations?.product_cards?.length
    ? recommendations.product_cards
    : (recommendations?.products || []).map((name) => ({
        name,
        category: 'Öneri',
        benefit: 'Analiz sonucuna göre önerildi',
        for_concern: 'Cilt bakımı',
        ingredient: '—',
        icon: 'serum',
        color: '#f43f5e',
        image_url: '',
      }));

  if (!cards.length) return null;

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-800">Size Uygun Ürün Önerileri</h3>
        <p className="text-sm text-slate-500 mt-1">
          Analiz sonucunuza göre önerilen ürünler
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <article
            key={card.name}
            className="group rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all"
          >
            <div className="h-36 relative overflow-hidden bg-slate-100">
              {card.image_url ? (
                <img
                  src={card.image_url}
                  alt={card.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="absolute inset-0 items-center justify-center text-5xl"
                style={{
                  display: card.image_url ? 'none' : 'flex',
                  background: `linear-gradient(135deg, ${card.color}22, ${card.color}44)`,
                }}
              >
                {ICONS[card.icon] || '✨'}
              </div>
              <span
                className="absolute top-3 right-3 text-[10px] font-medium px-2 py-0.5 rounded-full text-white shadow"
                style={{ backgroundColor: card.color }}
              >
                {card.category}
              </span>
            </div>
            <div className="p-4 space-y-2">
              <h4 className="font-semibold text-slate-800 group-hover:text-rose-600 transition-colors">
                {card.name}
              </h4>
              <p className="text-xs text-slate-500">{card.benefit}</p>
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <p className="text-[10px] text-slate-400">
                  <span className="font-medium text-slate-500">İçerik:</span> {card.ingredient}
                </p>
                <p className="text-[10px] text-rose-500 font-medium">{card.for_concern}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {recommendations?.actions?.length > 0 && (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
          <h4 className="text-sm font-medium text-slate-700 mb-2">Uygulama ipuçları</h4>
          <ul className="space-y-1">
            {recommendations.actions.map((action) => (
              <li key={action} className="text-xs text-slate-600 flex gap-2">
                <span className="text-emerald-500">✓</span> {action}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendations?.see_doctor && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
          <span className="text-xl">⚕️</span>
          <div>
            <p className="font-medium text-amber-800 text-sm">Dermatolog kontrolü önerilir</p>
            <p className="text-xs text-amber-700 mt-1">{recommendations.doctor_reason}</p>
          </div>
        </div>
      )}
    </section>
  );
}
