import { useCallback, useEffect, useRef, useState } from 'react';

export default function CameraCapture({ onAnalyze, loading }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setReady(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
          setError(null);
        }
      } catch {
        setError('Kamera erişimi reddedildi veya kullanılamıyor. Tarayıcı izinlerini kontrol edin.');
      }
    }

    startCamera();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [stopCamera]);

  const captureAndAnalyze = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !ready) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      onAnalyze(file);
    }, 'image/jpeg', 0.92);
  };

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {error}
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] max-h-[420px]">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover mirror"
            style={{ transform: 'scaleX(-1)' }}
          />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="border-2 border-white/80 rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"
              style={{ width: '55%', height: '70%' }}
            />
          </div>

          <div className="absolute bottom-3 left-0 right-0 text-center text-white/90 text-sm drop-shadow">
            Yüzünüzü oval çerçevenin içine hizalayın
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      <button
        type="button"
        onClick={captureAndAnalyze}
        disabled={!ready || loading}
        className="btn-pill btn-pill--block btn-pill--lg"
      >
        {loading ? 'Analiz ediliyor...' : 'Çek ve Analiz Et'}
      </button>
    </div>
  );
}
