import AppHeader from '../components/AppHeader';
import AnalysisFlowSection from '../components/AnalysisFlowSection';

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <AnalysisFlowSection autoStart />
      </main>
    </div>
  );
}
