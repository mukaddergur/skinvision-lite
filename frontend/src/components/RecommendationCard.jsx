export default function RecommendationCard({ recommendations }) {
  if (!recommendations) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold text-slate-800">Öneriler</h3>

      {recommendations.see_doctor && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-start gap-2">
            <span className="text-xl">⚕️</span>
            <div>
              <p className="font-medium text-amber-800">Dermatolog kontrolü önerilir</p>
              <p className="text-sm text-amber-700 mt-1">{recommendations.doctor_reason}</p>
            </div>
          </div>
        </div>
      )}

      {recommendations.products?.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-600 mb-2">Ürün Önerileri</h4>
          <ul className="space-y-1.5">
            {recommendations.products.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-rose-400 mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.actions?.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-600 mb-2">Yapılabilecekler</h4>
          <ul className="space-y-1.5">
            {recommendations.actions.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-emerald-500 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
