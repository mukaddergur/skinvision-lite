export default function ScoreCircleNav({ items, activeId, onSelect, layout = 'horizontal' }) {
  const vertical = layout === 'vertical';

  return (
    <div
      className={
        vertical
          ? 'flex flex-col gap-2 w-full md:flex-1 md:max-w-xs'
          : 'flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin'
      }
    >
      {items.map((item) => {
        const active = activeId === item.id;
        const circle = (
          <div
            className={`shrink-0 w-14 h-14 rounded-full border-[3px] bg-white flex flex-col items-center justify-center shadow-sm ${
              item.ring || 'border-stone-300'
            } ${active ? 'ring-2 ring-rose-300 ring-offset-2 ring-offset-[#faf9f6]' : ''}`}
          >
            <span className="text-sm font-bold text-stone-800 leading-none">{item.score}</span>
            <span className="text-[8px] text-stone-400">/100</span>
          </div>
        );

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={
              vertical
                ? `flex items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors ${
                    active ? 'bg-rose-50/80' : 'hover:bg-stone-100/60'
                  }`
                : `snap-start shrink-0 flex flex-col items-center gap-2 min-w-[72px] transition-opacity ${
                    active ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                  }`
            }
          >
            {circle}
            <span
              className={
                vertical
                  ? 'text-sm font-medium text-stone-700'
                  : 'text-[10px] text-stone-600 text-center leading-tight max-w-[72px]'
              }
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
