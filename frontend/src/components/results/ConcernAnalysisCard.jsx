import { useEffect, useRef } from 'react';
import ScoreSlider from './ScoreSlider';

export default function ConcernAnalysisCard({ concern, imageUrl, id }) {
  const ref = useRef(null);

  useEffect(() => {
    if (window.location.hash === `#${id}` && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [id]);

  return (
    <article
      id={id}
      ref={ref}
      className="scroll-mt-24 rounded-xl border border-stone-200 bg-white p-4 md:p-5 shadow-sm"
    >
      <div className="flex gap-4">
        {imageUrl && (
          <div className="shrink-0 w-[72px] h-[72px] md:w-20 md:h-20 rounded-lg overflow-hidden border border-stone-100 bg-stone-200">
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover object-center"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-stone-800 text-sm md:text-base">{concern.title}</h3>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">{concern.description}</p>
        </div>
      </div>

      <ScoreSlider score={concern.score} color={concern.color} />

      <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <p className="text-stone-600">
          <span className="font-medium text-rose-600">Önerilen etken:</span>{' '}
          {concern.ingredient}
        </p>
        <p className="text-stone-500">
          <span className="font-medium text-stone-600">Ne zaman:</span> {concern.timing}
        </p>
      </div>
    </article>
  );
}
