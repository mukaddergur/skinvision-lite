import { resolveAssetUrl } from '../api/skinApi';

export default function ResultImage({ originalUrl, outputUrl, localPreview }) {
  const original = localPreview || resolveAssetUrl(originalUrl);
  const processed = resolveAssetUrl(outputUrl);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 border-b">
          Orijinal Fotoğraf
        </div>
        {original ? (
          <img src={original} alt="Orijinal" className="w-full max-h-72 object-contain" />
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-400">Görsel yok</div>
        )}
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 border-b">
          İşlenmiş Sonuç
        </div>
        {processed ? (
          <img src={processed} alt="Analiz sonucu" className="w-full max-h-72 object-contain" />
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-400">Sonuç bekleniyor</div>
        )}
      </div>
    </div>
  );
}
