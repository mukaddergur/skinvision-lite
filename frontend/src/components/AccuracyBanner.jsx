export default function AccuracyBanner({ confidence }) {
  if (!confidence) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 space-y-2">
      <div className="flex items-start gap-3">
        <span className="text-2xl">ℹ️</span>
        <div>
          <h3 className="font-semibold text-amber-900">Analiz doğruluğu hakkında</h3>
          <p className="text-sm text-amber-800 mt-1 leading-relaxed">{confidence.message}</p>
          <p className="text-xs text-amber-700/80 mt-2 leading-relaxed">{confidence.comparison_note}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-200/60">
        <div className="text-center">
          <div className="text-lg font-bold text-amber-900">Hibrit</div>
          <div className="text-[10px] text-amber-700">OpenCV + ML</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-amber-900">~%60-70</div>
          <div className="text-[10px] text-amber-700">Tahmini görsel uyum*</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-amber-900">%95+</div>
          <div className="text-[10px] text-amber-700">Profesyonel AI sistemler</div>
        </div>
      </div>
      <p className="text-[10px] text-amber-600">
        *Işık, kamera kalitesi ve makyaj sonuçları etkiler. Tıbbi teşhis yerine geçmez.
      </p>
    </div>
  );
}
