import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeImage } from '../api/skinApi';
import CameraCapture from './CameraCapture';
import ImageUploader from './ImageUploader';
import ModeSelector from './ModeSelector';
import PhotoGuidelinesModal from './PhotoGuidelinesModal';
import SkinQuestionnaire from './SkinQuestionnaire';
import SkinTypeSelector from './SkinTypeSelector';
import { deriveSkinType } from '../data/skinQuestions';

export default function AnalysisFlowSection({ id = 'analiz-baslat', autoStart = false }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(autoStart ? 'questions' : 'intro');
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false);
  const [answers, setAnswers] = useState(null);
  const [skinType, setSkinType] = useState('normal');
  const [mode, setMode] = useState('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (answers?.skin_feel) {
      setSkinType(deriveSkinType(answers));
    }
  }, [answers]);

  const handleQuestionnaireComplete = (questionnaireAnswers) => {
    setAnswers(questionnaireAnswers);
    setSkinType(deriveSkinType(questionnaireAnswers));
    setPhase('photo');
    setShowGuidelines(true);
  };

  const handleGuidelinesAccept = () => {
    setShowGuidelines(false);
    setGuidelinesAccepted(true);
  };

  const handleAnalyze = useCallback(async (file) => {
    if (!guidelinesAccepted) {
      setShowGuidelines(true);
      return;
    }

    setLoading(true);
    setError(null);
    const localPreview = URL.createObjectURL(file);

    try {
      const data = await analyzeImage(file, skinType);
      navigate('/sonuclar', {
        state: {
          result: data,
          localPreview,
          questionnaireAnswers: answers,
          skinType,
        },
      });
    } catch (err) {
      setError(err.message || 'Beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [answers, guidelinesAccepted, navigate, skinType]);

  const startQuestionnaire = () => {
    setPhase('questions');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (phase === 'questions') {
    return (
      <div id={id} className="scroll-mt-24">
        <SkinQuestionnaire onComplete={handleQuestionnaireComplete} />
        <PhotoGuidelinesModal
          open={showGuidelines}
          onAccept={handleGuidelinesAccept}
          onClose={() => setShowGuidelines(false)}
        />
      </div>
    );
  }

  return (
    <section id={id} className="scroll-mt-24 space-y-5">
      {phase === 'intro' && (
        <>
          <div className="text-center">
            <p className="text-xs font-bold tracking-widest uppercase text-violet-600">
              Analize Başla
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mt-1">
              Cilt tipinizi seçin ve analize başlayın
            </h2>
            <p className="text-sm text-stone-500 mt-2 max-w-lg mx-auto">
              Önce birkaç kısa soru yanıtlayın, ardından fotoğrafınızı yükleyerek kişiselleştirilmiş
              analiz alın.
            </p>
          </div>

          <div className="text-center">
            <button type="button" onClick={startQuestionnaire} className="btn-pill btn-pill--lg">
              Sorularla analize başla
            </button>
          </div>

          <SkinTypeSelector value={skinType} onChange={setSkinType} />
        </>
      )}

      {phase === 'photo' && (
        <>
          <SkinTypeSelector value={skinType} onChange={setSkinType} />

          <div className="text-center pt-2">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-rose-500">
              Son adım
            </p>
            <h2 className="text-xl md:text-2xl font-medium text-stone-800 mt-2">
              Fotoğrafınızı yükleyin veya kamerayı kullanın
            </h2>
            <p className="text-sm text-stone-500 mt-2">
              Yanıtlarınıza göre kişiselleştirilmiş analiz hazırlanıyor
            </p>
          </div>

          {!guidelinesAccepted && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Fotoğraf yüklemeden önce hazırlık kurallarını onaylamanız gerekir.
              <button
                type="button"
                onClick={() => setShowGuidelines(true)}
                className="btn-pill btn-pill--sm mt-2"
              >
                Kuralları göster
              </button>
            </div>
          )}

          <ModeSelector mode={mode} onModeChange={setMode} />

          {guidelinesAccepted && (
            mode === 'upload' ? (
              <ImageUploader onAnalyze={handleAnalyze} loading={loading} />
            ) : (
              <CameraCapture onAnalyze={handleAnalyze} loading={loading} />
            )
          )}

          {loading && (
            <div className="flex flex-col items-center py-12 gap-3">
              <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
              <p className="text-sm text-stone-600">Cilt analizi yapılıyor...</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
              <p className="font-medium">Hata</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setPhase('questions');
              setGuidelinesAccepted(false);
            }}
            className="btn-pill"
          >
            Sorulara geri dön
          </button>
        </>
      )}

      <PhotoGuidelinesModal
        open={showGuidelines}
        onAccept={handleGuidelinesAccept}
        onClose={() => setShowGuidelines(false)}
      />
    </section>
  );
}
