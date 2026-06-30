import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const SCORE_CONFIG = [
  { key: 'redness_score', label: 'Kızarıklık', color: '#ef4444' },
  { key: 'spot_score', label: 'Leke', color: '#6b7280' },
  { key: 'acne_score', label: 'Akne Benzeri', color: '#f97316' },
  { key: 'overall_score', label: 'Genel Skor', color: '#8b5cf6' },
];

const SEVERITY_LABELS = { low: 'Düşük', medium: 'Orta', high: 'Yüksek' };
const SEVERITY_COLORS = {
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

export default function ScorePanel({ scores, severity, detectedRegions }) {
  const chartData = SCORE_CONFIG.map(({ key, label, color }) => ({
    name: label,
    score: scores[key],
    color,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Görüntü Yoğunluğu Skorları</h3>
        <p className="text-sm text-slate-500">0–100 arası — tıbbi teşhis değildir</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SCORE_CONFIG.map(({ key, label, color }) => {
          const sevKey = key === 'redness_score' ? 'redness' : key === 'spot_score' ? 'spots' : key === 'acne_score' ? 'acne' : null;

          return (
            <div key={key} className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
              <div className="text-xs text-slate-500 mb-1">{label}</div>
              <div className="text-2xl font-bold" style={{ color }}>
                {scores[key]}
                <span className="text-sm font-normal text-slate-400">/100</span>
              </div>
              {sevKey && severity[sevKey] && (
                <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${SEVERITY_COLORS[severity[sevKey]]}`}>
                  {SEVERITY_LABELS[severity[sevKey]]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-red-50 p-3">
          <div className="text-2xl font-bold text-red-600">{detectedRegions.redness_count}</div>
          <div className="text-xs text-red-700">Kızarıklık bölgesi</div>
        </div>
        <div className="rounded-lg bg-slate-100 p-3">
          <div className="text-2xl font-bold text-slate-600">{detectedRegions.spot_count}</div>
          <div className="text-xs text-slate-700">Leke bölgesi</div>
        </div>
        <div className="rounded-lg bg-orange-50 p-3">
          <div className="text-2xl font-bold text-orange-600">{detectedRegions.acne_count}</div>
          <div className="text-xs text-orange-700">Akne benzeri bölge</div>
        </div>
      </div>

      <div className="h-56 rounded-xl bg-white border border-slate-200 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`${v}/100`, 'Skor']} />
            <Bar dataKey="score" radius={[6, 6, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border-2 border-red-500" /> Kızarıklık</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border-2 border-gray-500" /> Leke</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border-2 border-orange-500" /> Akne benzeri</span>
      </div>
    </div>
  );
}
