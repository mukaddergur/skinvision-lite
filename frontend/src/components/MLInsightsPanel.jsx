export default function MLInsightsPanel({ mlInsights }) {
  if (!mlInsights) return null;

  return (
    <section className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">🧠</span>
        <h3 className="font-semibold text-slate-800">ML Analiz Özeti</h3>
        <span className="ml-auto text-xs font-medium px-2 py-1 rounded-full bg-violet-100 text-violet-700">
          Güven: %{mlInsights.confidence_percent}
        </span>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{mlInsights.summary}</p>
      <p className="text-xs text-slate-400">{mlInsights.method}</p>

      {mlInsights.opencv_scores && mlInsights.ml_scores && (
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-violet-100">
          <div>
            <p className="text-[10px] font-medium text-slate-500 mb-1">OpenCV Skorları</p>
            <p className="text-xs text-slate-600">
              K: {mlInsights.opencv_scores.redness_score} | L: {mlInsights.opencv_scores.spot_score} | A: {mlInsights.opencv_scores.acne_score}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium text-slate-500 mb-1">ML Skorları</p>
            <p className="text-xs text-slate-600">
              K: {mlInsights.ml_scores.redness_score} | L: {mlInsights.ml_scores.spot_score} | A: {mlInsights.ml_scores.acne_score}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
