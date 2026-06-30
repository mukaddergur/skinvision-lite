import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { resolveAssetUrl } from '../api/skinApi';
import AppHeader from '../components/AppHeader';
import AccuracyBanner from '../components/AccuracyBanner';
import ConcernAnalysisCard from '../components/results/ConcernAnalysisCard';
import ScoreCircleNav from '../components/results/ScoreCircleNav';
import PersonalizedRoutineModal from '../components/PersonalizedRoutineModal';
import ReportDownload from '../components/ReportDownload';
import { buildConcernInsights } from '../utils/buildConcernInsights';

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { result, localPreview, questionnaireAnswers } = location.state || {};
  const [activeNav, setActiveNav] = useState('overall');
  const [routineOpen, setRoutineOpen] = useState(false);

  if (!result) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center px-4">
        <p className="text-stone-600 mb-4">Analiz sonucu bulunamadı.</p>
        <button type="button" onClick={() => navigate('/analiz')} className="btn-pill btn-pill--lg">
          Analize başla
        </button>
      </div>
    );
  }

  const insights = buildConcernInsights(result, questionnaireAnswers);
  const faceImage =
    localPreview ||
    resolveAssetUrl(result.original_image_url) ||
    resolveAssetUrl(result.output_image_url);

  const handleNavSelect = (id) => {
    setActiveNav(id);
    const target = id === 'overall' ? 'genel-skor' : `concern-${id}`;
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleReset = () => navigate('/analiz', { replace: true });

  return (
    <div className="min-h-screen bg-[#faf9f6] pb-24">
      <AppHeader variant="solid" showReset onReset={handleReset} showHome />

      <section className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        <p className="text-xs text-stone-500 mb-4 md:mb-5">
          İdeal rutininizi görmek için skorlara tıklayın
        </p>
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
          {faceImage && (
            <div className="flex justify-center md:justify-start w-full md:w-auto shrink-0">
              <img
                src={faceImage}
                alt="Analiz fotoğrafınız"
                className="block w-auto h-auto max-w-full max-h-[260px] sm:max-h-[300px] md:max-h-[340px]
                  rounded-2xl shadow-[0_10px_36px_rgba(244,114,182,0.14)] ring-1 ring-rose-100/90"
              />
            </div>
          )}
          <ScoreCircleNav
            layout="vertical"
            items={insights.navItems}
            activeId={activeNav}
            onSelect={handleNavSelect}
          />
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 space-y-6">
        {result.saved_analysis_id && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Bu analiz hesabınıza kaydedildi.{' '}
            <Link to="/panel" className="btn-pill btn-pill--sm ml-1">
              Panelimde geçmişi görüntüle
            </Link>
          </div>
        )}
        <section
          id="genel-skor"
          className="scroll-mt-20 rounded-2xl bg-gradient-to-br from-stone-800 to-stone-900 text-white p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="shrink-0 w-32 h-32 rounded-full border-2 border-dashed border-white/40 flex flex-col items-center justify-center">
              <span className="text-3xl font-light">{insights.health.overall}</span>
              <span className="text-xs text-white/60">/ 100</span>
            </div>
            <div>
              <h2 className="text-lg font-medium">Genel cilt skorunuz</h2>
              <p className="text-sm text-white/75 mt-2 leading-relaxed">
                {insights.overallExplanation}
              </p>
            </div>
          </div>
        </section>

        {insights.zoneSummaries.length > 0 && (
          <section className="rounded-2xl border border-stone-200 bg-white p-5 md:p-6">
            <h3 className="text-base font-medium text-stone-800">Bölgesel tespitler</h3>
            <p className="text-xs text-stone-500 mt-1 mb-4">
              Analizde dikkat çeken bölgeler ve öncelikli ihtiyaçlar
            </p>
            <ul className="space-y-3">
              {insights.zoneSummaries.map((z) => (
                <li
                  key={z.zone}
                  className="text-sm border-l-2 border-rose-300 pl-3 py-1"
                >
                  <span className="font-medium text-stone-800">{z.zone}</span>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{z.explanation}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="space-y-4">
          <div>
            <p className="text-[11px] font-medium tracking-wide uppercase text-rose-400">
              Detaylı analiz
            </p>
            <h3 className="text-lg font-medium text-stone-800 mt-1">
              Her konu için skor ve etken madde önerisi
            </h3>
          </div>

          {insights.concerns.map((concern) => (
            <ConcernAnalysisCard
              key={concern.id}
              id={`concern-${concern.id}`}
              concern={concern}
              imageUrl={faceImage}
            />
          ))}
        </section>

        <div className="text-center space-y-3">
          <ReportDownload reportUrl={result.report_url} />
        </div>

        <div className="rounded-xl bg-stone-100 border border-stone-200 p-4 text-xs text-stone-600 leading-relaxed">
          {result.disclaimer}
        </div>

        <AccuracyBanner confidence={result.confidence} />
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-[#faf9f6] via-[#faf9f6] to-transparent">
        <div className="max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() => setRoutineOpen(true)}
            className="btn-pill btn-pill--block btn-pill--lg"
          >
            Size özel rutini keşfedin
          </button>
        </div>
      </div>

      <PersonalizedRoutineModal
        routine={result.personalized_routine}
        open={routineOpen}
        onClose={() => setRoutineOpen(false)}
      />
    </div>
  );
}
