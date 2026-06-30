import { resolveAssetUrl } from '../api/skinApi';

const CONCERN_LABELS = { redness: 'Kızarıklık', spots: 'Leke', acne: 'Akne benzeri' };
const SEVERITY_COLORS = {
  low: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  medium: 'text-amber-700 bg-amber-50 border-amber-200',
  high: 'text-red-700 bg-red-50 border-red-200',
};
const SEVERITY_LABELS = { low: 'Düşük', medium: 'Orta', high: 'Yüksek' };

export default function ZoneAnalysisPanel({ zoneAnalysis, zoneImageUrl }) {
  if (!zoneAnalysis?.zones?.length) return null;

  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-800">Bölgesel Cilt Analizi</h3>
        <p className="text-sm text-slate-500 mt-1">
          Yüzünüz 5 bölgeye ayrılarak değerlendirildi — L&apos;Oréal Skin Genius benzeri yaklaşım
        </p>
      </div>

      {zoneImageUrl && (
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 border-b">
            Bölge Haritası
          </div>
          <img
            src={resolveAssetUrl(zoneImageUrl)}
            alt="Bölgesel analiz haritası"
            className="w-full max-h-80 object-contain"
          />
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zoneAnalysis.zones.map((zone) => (
          <article
            key={zone.zone_id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-slate-800">{zone.label}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[zone.severity]}`}>
                {SEVERITY_LABELS[zone.severity]}
              </span>
            </div>

            <div className="flex gap-2 mb-3 text-[10px]">
              <span className="px-2 py-1 rounded bg-red-50 text-red-600">K: {zone.redness_score}</span>
              <span className="px-2 py-1 rounded bg-slate-100 text-slate-600">L: {zone.spot_score}</span>
              <span className="px-2 py-1 rounded bg-orange-50 text-orange-600">A: {zone.acne_score}</span>
            </div>

            <p className="text-xs text-rose-600 font-medium mb-2">
              Odak: {CONCERN_LABELS[zone.primary_concern]}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">{zone.explanation}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
