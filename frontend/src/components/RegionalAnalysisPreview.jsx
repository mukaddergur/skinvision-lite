import FaceRegionPhoto from './FaceRegionPhoto';

const ZONES = [
  {
    id: 'forehead',
    label: 'Alın',
    concern: 'İnce çizgiler',
    description: 'Alın bölgesindeki kırışıklık yoğunluğu ayrı skorlanır; günlük stres ve güneş etkisi burada belirginleşir.',
    gradient: 'from-amber-50 to-orange-50',
    zone: 'forehead',
  },
  {
    id: 'cheeks',
    label: 'Yanaklar',
    concern: 'Leke, akne benzeri bölgeler',
    description: 'Yanaklardaki pigmentasyon ve akne benzeri lezyonlar haritalanır; ton eşitsizliği bu bölgede sık görülür.',
    gradient: 'from-sky-50 to-cyan-50',
    zone: 'cheeks',
  },
  {
    id: 'nose',
    label: 'Burun / T Bölgesi',
    concern: 'Gözenek, yağlanma',
    description: 'T bölgesinde gözenek görünümü ve yağlanma düzeyi ölçülür; karma ve yağlı ciltlerde kritik bölgedir.',
    gradient: 'from-violet-50 to-fuchsia-50',
    zone: 'nose',
  },
  {
    id: 'chin',
    label: 'Çene',
    concern: 'Akne yoğunluğu',
    description: 'Çene hattındaki sivilce ve iltihaplı bölge yoğunluğu değerlendirilir; hormonal akne burada sık görülür.',
    gradient: 'from-emerald-50 to-teal-50',
    zone: 'chin',
  },
  {
    id: 'under-eye',
    label: 'Göz Altı',
    concern: 'Morluk, şişlik, ince çizgi',
    description: 'Göz altı bölgesindeki koyu halka, ödem ve ince çizgi belirtileri ayrı değerlendirilir; yorgunluk ve yaşlanma burada görünür.',
    gradient: 'from-indigo-50 to-violet-50',
    zone: 'underEye',
  },
  {
    id: 'redness',
    label: 'Kızarıklık',
    concern: 'Hassasiyet, kızarıklık',
    description: 'Yanak ve alın bölgesindeki kızarıklık yoğunluğu ölçülür; stres, güneş veya hassasiyet kaynaklı olabilir.',
    gradient: 'from-rose-50 to-red-50',
    zone: 'redness',
  },
];

export default function RegionalAnalysisPreview() {
  return (
    <section id="bolgesel-analiz" className="scroll-mt-24">
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 md:p-8">
        <div className="mb-6">
          <p className="text-[11px] font-medium tracking-wide uppercase text-rose-400">
            Bölgesel Analiz
          </p>
          <h3 className="text-lg md:text-xl font-medium text-stone-800 mt-1">
            Yüzünüz bölge bölge değerlendirilir
          </h3>
          <p className="text-sm text-stone-500 mt-1">
            Analiz sonrası her bölge için ayrı skor ve açıklama sunulur.
          </p>
        </div>

        <div className="pt-2 pb-1">
          <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory [overflow-y:visible]">
            {ZONES.map((zone) => (
              <article
                key={zone.id}
                className="group snap-start shrink-0 flex flex-col w-[calc(50%-0.5rem)] md:w-[calc((100%-3*1rem)/4)] rounded-xl bg-white border-2 border-stone-200/80
                  transition-all duration-200 cursor-default
                  hover:border-rose-300 hover:shadow-lg hover:shadow-rose-100/50"
              >
                <div
                  className={`relative w-full aspect-[639/1024] rounded-t-[10px] overflow-hidden bg-gradient-to-br ${zone.gradient}`}
                >
                  <FaceRegionPhoto zone={zone.zone} className="absolute inset-0" />
                </div>
                <div className="p-3 md:p-4 bg-white flex-1 rounded-b-[10px]">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-rose-400 mb-1">
                    {zone.concern}
                  </p>
                  <h4 className="font-medium text-sm text-stone-800">{zone.label}</h4>
                  <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                    {zone.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
