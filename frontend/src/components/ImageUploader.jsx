import { useCallback, useRef, useState } from 'react';

export default function ImageUploader({ onAnalyze, loading }) {
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setPreview(URL.createObjectURL(file));
    onAnalyze(file);
  }, [onAnalyze]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          dragOver
            ? 'border-rose-400 bg-rose-50'
            : 'border-slate-300 bg-white hover:border-rose-300 hover:bg-rose-50/50'
        }`}
      >
        <div className="text-4xl mb-3">📁</div>
        <p className="text-slate-700 font-medium">Fotoğrafı sürükleyip bırakın veya tıklayın</p>
        <p className="text-sm text-slate-500 mt-1">JPG, PNG — yüzünüz net görünmeli</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
          disabled={loading}
        />
      </div>

      {preview && (
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
          <img src={preview} alt="Yüklenen önizleme" className="w-full max-h-80 object-contain" />
        </div>
      )}
    </div>
  );
}
