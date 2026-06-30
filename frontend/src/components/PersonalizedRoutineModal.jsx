export default function PersonalizedRoutineModal({ routine, open, onClose }) {
  if (!open || !routine) return null;

  const renderSteps = (steps, title, emoji) => (
    <div>
      <h4 className="flex items-center gap-2 font-semibold text-slate-800 mb-3">
        <span>{emoji}</span> {title}
      </h4>
      <ol className="space-y-3">
        {steps.map((step) => (
          <li key={`${title}-${step.order}`} className="flex gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold">
              {step.order}
            </span>
            <div>
              <p className="text-sm font-medium text-slate-800">{step.step}</p>
              <p className="text-xs text-rose-600">{step.product}</p>
              <p className="text-xs text-slate-500 mt-0.5">{step.note}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Kapat"
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-rose-900 text-white p-6 rounded-t-3xl">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-sm"
          >
            ✕
          </button>
          <p className="text-rose-300 text-xs uppercase tracking-widest">Kişiselleştirilmiş Rutin</p>
          <h3 className="text-2xl font-bold mt-1">Size Özel Cilt Bakım Rehberi</h3>
          <p className="text-sm text-slate-300 mt-2">{routine.summary}</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-800">
            {routine.skin_type_tip}
          </div>

          {routine.focus_areas?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Odak bölgeler</p>
              <div className="flex flex-wrap gap-2">
                {routine.focus_areas.map((area) => (
                  <span key={area} className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {renderSteps(routine.morning_routine, 'Sabah Rutini', '🌅')}
            {renderSteps(routine.evening_routine, 'Akşam Rutini', '🌙')}
          </div>

          <p className="text-[10px] text-slate-400 border-t pt-4">
            Bu rutin eğitim amaçlıdır ve tıbbi reçete yerine geçmez. Yeni ürünleri patch test ile deneyin.
          </p>
        </div>
      </div>
    </div>
  );
}
