import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { resolveAssetUrl } from '../api/skinApi';
import {
  addProduct,
  deleteProduct,
  fetchAnalyses,
  fetchProducts,
  fetchRoutineLogs,
  saveRoutineLog,
} from '../api/panelApi';
import { useAuth } from '../context/AuthContext';

function healthFromIntensity(score) {
  return Math.max(0, Math.min(100, 100 - score));
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

const ROUTINE_ITEMS = [
  { key: 'morning_done', label: 'Sabah', fill: 'bg-amber-400', ring: 'border-amber-400' },
  { key: 'evening_done', label: 'Akşam', fill: 'bg-violet-500', ring: 'border-violet-500' },
  { key: 'face_wash_done', label: 'Yıkama', fill: 'bg-sky-500', ring: 'border-sky-500' },
];

function RoutineToggle({ label, done, fill, ring, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-1.5 w-full py-0.5 text-left group"
      title={label}
    >
      <span
        className={`shrink-0 w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${
          done ? `${fill} ${ring}` : 'border-stone-300 bg-white group-hover:border-stone-400'
        }`}
      />
      <span className={`text-[9px] leading-none ${done ? 'text-stone-700 font-medium' : 'text-stone-400'}`}>
        {label}
      </span>
    </button>
  );
}

export default function PanelPage() {
  const { user, loading: authLoading } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    ingredient: '',
    started_at: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const [a, p, r] = await Promise.all([
        fetchAnalyses(),
        fetchProducts(),
        fetchRoutineLogs(month),
      ]);
      setAnalyses(a.analyses || []);
      setProducts(p.products || []);
      setLogs(r.logs || []);
    } catch (err) {
      setError(err.message);
    }
  }, [month]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const calendarDays = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${month}-${String(day).padStart(2, '0')}`;
      const log = logs.find((l) => l.log_date === dateStr);
      return { day, dateStr, log };
    });
  }, [month, logs]);

  const compared = analyses.filter((a) => compareIds.includes(a.id));

  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    await addProduct(productForm);
    setProductForm({
      name: '',
      category: '',
      ingredient: '',
      started_at: new Date().toISOString().slice(0, 10),
      notes: '',
    });
    load();
  };

  const handleRoutineToggle = async (dateStr, field) => {
    const existing = logs.find((l) => l.log_date === dateStr) || {
      morning_done: false,
      evening_done: false,
      face_wash_done: false,
      notes: '',
    };
    await saveRoutineLog({
      log_date: dateStr,
      morning_done: field === 'morning_done' ? !existing.morning_done : existing.morning_done,
      evening_done: field === 'evening_done' ? !existing.evening_done : existing.evening_done,
      face_wash_done: field === 'face_wash_done' ? !existing.face_wash_done : existing.face_wash_done,
      notes: existing.notes || '',
    });
    load();
  };

  if (authLoading) {
    return <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center text-stone-500">Yükleniyor...</div>;
  }

  if (!user) return <Navigate to="/giris" replace />;

  return (
    <div className="min-h-screen bg-[#faf9f6] pb-12">
      <AppHeader showHome />
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        <div>
          <p className="text-[11px] font-medium tracking-wide uppercase text-rose-400">Kişisel panel</p>
          <h1 className="text-xl md:text-2xl font-medium text-stone-800 mt-1">
            Merhaba, {user.username}
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Aylık analiz karşılaştırması, kullandığınız ürünler ve rutin takviminiz.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm p-4">{error}</div>
        )}

        <section className="rounded-2xl border border-stone-200 bg-white p-5 md:p-6 space-y-4">
          <h2 className="font-medium text-stone-800">Analiz geçmişi</h2>
          <p className="text-xs text-stone-500">İki analiz seçerek skorları karşılaştırın.</p>
          {analyses.length === 0 ? (
            <p className="text-sm text-stone-500">Henüz kayıtlı analiz yok. Giriş yaptıktan sonra analiz yaptığınızda burada görünür.</p>
          ) : (
            <ul className="space-y-2">
              {analyses.map((a) => (
                <li
                  key={a.id}
                  className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 text-sm ${
                    compareIds.includes(a.id) ? 'border-rose-300 bg-rose-50/50' : 'border-stone-200'
                  }`}
                >
                  {a.image_url && (
                    <img
                      src={resolveAssetUrl(a.image_url)}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-[140px]">
                    <p className="font-medium text-stone-800">{formatDate(a.created_at)}</p>
                    <p className="text-xs text-stone-500">
                      Genel sağlık: {healthFromIntensity(a.overall_score)}/100
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCompare(a.id)}
                    className={`btn-pill btn-pill--sm ${compareIds.includes(a.id) ? 'btn-pill--active' : ''}`}
                  >
                    {compareIds.includes(a.id) ? 'Seçili' : 'Karşılaştır'}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {compared.length === 2 && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-stone-100">
              {compared.map((a) => (
                <div key={a.id} className="rounded-xl bg-stone-50 p-4 text-sm">
                  <p className="font-medium text-stone-800 mb-2">{formatDate(a.created_at)}</p>
                  <ul className="space-y-1 text-xs text-stone-600">
                    <li>Genel: {healthFromIntensity(a.overall_score)}</li>
                    <li>Kızarıklık: {healthFromIntensity(a.redness_score)}</li>
                    <li>Leke: {healthFromIntensity(a.spot_score)}</li>
                    <li>Akne: {healthFromIntensity(a.acne_score)}</li>
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 md:p-6 space-y-4">
          <h2 className="font-medium text-stone-800">Kullandığım ürünler</h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              placeholder="Ürün adı"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              required
              className="rounded-lg border border-stone-200 px-3 py-2 text-sm"
            />
            <input
              placeholder="Kategori (serum, temizleyici...)"
              value={productForm.category}
              onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
              className="rounded-lg border border-stone-200 px-3 py-2 text-sm"
            />
            <input
              placeholder="Etken madde"
              value={productForm.ingredient}
              onChange={(e) => setProductForm({ ...productForm, ingredient: e.target.value })}
              className="rounded-lg border border-stone-200 px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={productForm.started_at}
              onChange={(e) => setProductForm({ ...productForm, started_at: e.target.value })}
              className="rounded-lg border border-stone-200 px-3 py-2 text-sm"
            />
            <button type="submit" className="btn-pill btn-pill--block md:col-span-2">
              Ürün ekle
            </button>
          </form>
          <ul className="space-y-2">
            {products.map((p) => (
              <li key={p.id} className="flex justify-between items-start gap-2 rounded-xl border border-stone-200 p-3 text-sm">
                <div>
                  <p className="font-medium text-stone-800">{p.name}</p>
                  <p className="text-xs text-stone-500">
                    {p.ingredient && `${p.ingredient} · `}
                    Başlangıç: {p.started_at}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteProduct(p.id).then(load)}
                  className="btn-pill btn-pill--sm shrink-0"
                >
                  Sil
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 md:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-medium text-stone-800">Rutin takvimi</h2>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm"
            />
          </div>
          <p className="text-xs text-stone-500">
            Yuvarlaklara tıklayarak sabah rutini, akşam rutini ve yüz temizliğini işaretleyin.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-stone-600">
            {ROUTINE_ITEMS.map((item) => (
              <span key={item.key} className="inline-flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-full border-2 ${item.fill} ${item.ring}`} />
                {item.label}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-stone-400 font-medium">
            {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {(() => {
              const [y, m] = month.split('-').map(Number);
              const firstDow = (new Date(y, m - 1, 1).getDay() + 6) % 7;
              const blanks = Array.from({ length: firstDow });
              return (
                <>
                  {blanks.map((_, i) => (
                    <div key={`b-${i}`} />
                  ))}
                  {calendarDays.map(({ day, dateStr, log }) => (
                    <div
                      key={dateStr}
                      className="rounded-lg border border-stone-100 p-1.5 min-h-[80px] bg-stone-50/50"
                    >
                      <p className="text-[10px] font-medium text-stone-600 mb-1.5">{day}</p>
                      <div className="space-y-1">
                        {ROUTINE_ITEMS.map((item) => (
                          <RoutineToggle
                            key={item.key}
                            label={item.label}
                            done={!!log?.[item.key]}
                            fill={item.fill}
                            ring={item.ring}
                            onToggle={() => handleRoutineToggle(dateStr, item.key)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        </section>

        <p className="text-center text-sm">
          <Link to="/analiz" className="btn-pill">Yeni analiz yap</Link>
        </p>
      </main>
    </div>
  );
}
