const GUIDELINES = [
  {
    icon: '✨',
    title: 'Temiz yüz',
    text: 'Yüzünüzde makyaj, fondöten veya bakım ürünü olmamalıdır.',
  },
  {
    icon: '💡',
    title: 'Net ve aydınlık',
    text: 'Fotoğraf net, iyi aydınlatılmış ve bulanık olmamalıdır.',
  },
  {
    icon: '🙂',
    title: 'Tam kadraj',
    text: 'Yüzünüzün tamamı kadrajda görünmeli; saç veya aksesuar yüzü kapatmamalıdır.',
  },
];

export default function PhotoGuidelinesModal({ open, onAccept, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Kapat"
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-guidelines-title"
        className="relative w-full max-w-md rounded-2xl bg-white border border-stone-200 shadow-xl p-6 md:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="btn-pill btn-pill--sm absolute top-4 right-4"
          aria-label="Kapat"
        >
          ×
        </button>

        <p className="text-[11px] font-semibold tracking-widest uppercase text-rose-500">
          Fotoğraf öncesi
        </p>
        <h2 id="photo-guidelines-title" className="text-lg font-medium text-stone-800 mt-1 pr-6">
          En doğru analiz için lütfen kontrol edin
        </h2>
        <p className="text-sm text-stone-500 mt-2 leading-relaxed">
          Aşağıdaki koşullara uygun bir fotoğraf, bölgesel analiz sonuçlarının daha güvenilir
          olmasına yardımcı olur.
        </p>

        <ul className="mt-6 space-y-4">
          {GUIDELINES.map((item) => (
            <li key={item.title} className="flex gap-3">
              <span className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-lg">
                {item.icon}
              </span>
              <div>
                <p className="text-sm font-medium text-stone-800">{item.title}</p>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <button type="button" onClick={onAccept} className="btn-pill btn-pill--block btn-pill--lg mt-8">
          Anladım, fotoğrafı yükleyebilirim
        </button>
      </div>
    </div>
  );
}
