import { SKIN_TYPES } from '../data/ingredients';
import FaceRegionPhoto from './FaceRegionPhoto';

const CARD_THEMES = {
  normal: { border: 'border-emerald-300', bg: 'from-emerald-50 to-teal-50', ring: 'ring-emerald-300', tag: 'text-emerald-500' },
  dry: { border: 'border-amber-300', bg: 'from-amber-50 to-orange-50', ring: 'ring-amber-300', tag: 'text-amber-500' },
  oily: { border: 'border-sky-300', bg: 'from-sky-50 to-blue-50', ring: 'ring-sky-300', tag: 'text-sky-500' },
  combination: { border: 'border-violet-300', bg: 'from-violet-50 to-purple-50', ring: 'ring-violet-300', tag: 'text-violet-500' },
  sensitive: { border: 'border-rose-300', bg: 'from-rose-50 to-pink-50', ring: 'ring-rose-300', tag: 'text-rose-500' },
};

export default function SkinTypeSelector({ value, onChange }) {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-6 md:p-8">
      <h3 className="text-lg md:text-xl font-medium text-stone-800">Cilt tipiniz</h3>
      <p className="text-sm text-stone-500 mt-1 mb-6">
        Kişiselleştirilmiş rutin için cilt tipinizi seçin
      </p>
      <div className="pt-2 pb-1">
        <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory [overflow-y:visible]">
          {SKIN_TYPES.map((type) => {
            const selected = value === type.id;
            const theme = CARD_THEMES[type.id];
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => onChange(type.id)}
                className={`snap-start shrink-0 flex flex-col w-[calc(50%-0.5rem)] md:w-[calc((100%-3*1rem)/4)] rounded-xl text-left transition-all duration-200 border-2 bg-white ${
                  selected
                    ? `${theme.border} shadow-md`
                    : 'border-stone-200/80 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-100/50'
                }`}
              >
                <div
                  className={`relative w-full aspect-[639/1024] rounded-t-[10px] overflow-hidden bg-gradient-to-br ${theme.bg}`}
                >
                  <FaceRegionPhoto skinType={type.id} className="absolute inset-0" />
                </div>
                <div className="p-3 md:p-4 bg-white flex-1 rounded-b-[10px]">
                <p className={`text-[9px] font-semibold uppercase tracking-wider mb-1 ${theme.tag}`}>
                  {type.tag}
                </p>
                <h4 className="font-medium text-sm text-stone-800">{type.label}</h4>
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                  {type.description}
                </p>
              </div>
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}
