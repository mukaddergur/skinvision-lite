import AppHeader from '../components/AppHeader';
import AnalysisFlowSection from '../components/AnalysisFlowSection';
import HeroSection from '../components/HeroSection';
import IngredientCarousel from '../components/IngredientCarousel';
import PersonalRoutinePreview from '../components/PersonalRoutinePreview';
import RegionalAnalysisPreview from '../components/RegionalAnalysisPreview';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <AppHeader />
      <HeroSection />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        <AnalysisFlowSection />

        <RegionalAnalysisPreview />

        <PersonalRoutinePreview />
        <IngredientCarousel />
      </main>
    </div>
  );
}
