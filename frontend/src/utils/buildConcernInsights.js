const CONCERN_META = {
  redness: {
    title: 'Kızarıklık',
    color: '#ef4444',
    ring: 'border-red-400',
    description:
      'Kızarıklık; stres, güneş, kirlilik veya hassasiyet kaynaklı olabilir. Cilt bariyerini güçlendiren ve yatıştırıcı içerikler destekleyici olur.',
    ingredient: 'Niacinamide %5',
    timing: 'Sabah ve akşam — nemlendirici öncesi',
  },
  spots: {
    title: 'Kahverengi lekeler',
    color: '#a16207',
    ring: 'border-amber-500',
    description:
      'Güneş, hormonal değişimler veya akne sonrası izler leke görünümünü artırabilir. Düzenli SPF ve aydınlatıcı aktifler koruyucu ve düzeltici rol oynar.',
    ingredient: 'C Vitamini serumu',
    timing: 'Sabah — SPF uygulamasından önce',
  },
  acne: {
    title: 'Sivilce & gözenek',
    color: '#8b5cf6',
    ring: 'border-violet-400',
    description:
      'Gözenek tıkanıklığı ve sebum birikimi sivilce görünümünü artırır. Nazik temizlik ve hedefli aktifler T bölgesi ve çene hattında faydalı olabilir.',
    ingredient: 'Salisilik asit %2',
    timing: 'Akşam — temiz cilde, haftada 3–4 gece',
  },
  pores: {
    title: 'Gözenekler & parlama',
    color: '#14b8a6',
    ring: 'border-teal-400',
    description:
      'T bölgesinde gözenek görünümü ve parlama sık görülür. Yağ dengeleyici ve hafif dokulu ürünler mat ve dengeli bir görünüm sağlayabilir.',
    ingredient: 'Niacinamide + hafif jel nemlendirici',
    timing: 'Sabah ve akşam',
  },
  firmness: {
    title: 'Sıkılık',
    color: '#6366f1',
    ring: 'border-indigo-400',
    description:
      'Zamanla elastikiyet azalabilir; cilt daha az sıkı hissedilir. Retinol ve peptit içerikli gece bakımı hücre yenilenmesini destekleyebilir.',
    ingredient: 'Retinol veya bakuchiol',
    timing: 'Akşam — haftada 2–3 gece, düşük dozla başlayın',
  },
  dryness: {
    title: 'Kuruluk',
    color: '#0ea5e9',
    ring: 'border-sky-400',
    description:
      'Nem kaybı cildi mat ve gergin gösterebilir. Hyaluronik asit ve ceramide içeren katmanlı nemlendirme bariyeri güçlendirir.',
    ingredient: 'Hyaluronik asit + ceramide',
    timing: 'Sabah ve akşam — nemli cilde',
  },
};

function toHealthScore(intensityScore) {
  return Math.max(0, Math.min(100, 100 - intensityScore));
}

function scoreLabel(score) {
  if (score >= 70) return 'İyi';
  if (score >= 45) return 'Ortalama';
  return 'Orta';
}

export function buildConcernInsights(result, questionnaireAnswers = {}) {
  const { scores, zone_analysis: zoneAnalysis, personalized_routine: routine } = result;

  const health = {
    redness: toHealthScore(scores.redness_score),
    spots: toHealthScore(scores.spot_score),
    acne: toHealthScore(scores.acne_score),
    overall: toHealthScore(scores.overall_score),
  };

  const primaryNeed = questionnaireAnswers.primary_need;
  const skinType = questionnaireAnswers.skin_feel || routine?.skin_type || 'normal';

  const concerns = [
    {
      id: 'redness',
      ...CONCERN_META.redness,
      score: health.redness,
      label: scoreLabel(health.redness),
      priority: primaryNeed === 'soothe' ? 1 : 3,
    },
    {
      id: 'spots',
      ...CONCERN_META.spots,
      score: health.spots,
      label: scoreLabel(health.spots),
      priority: primaryNeed === 'spots' || primaryNeed === 'antiaging' ? 1 : 3,
    },
    {
      id: 'acne',
      ...CONCERN_META.acne,
      score: health.acne,
      label: scoreLabel(health.acne),
      priority: primaryNeed === 'matte' ? 1 : 3,
    },
    {
      id: 'pores',
      ...CONCERN_META.pores,
      score: Math.round((health.acne + health.redness) / 2),
      label: scoreLabel(Math.round((health.acne + health.redness) / 2)),
      priority: questionnaireAnswers.problem_area === 'nose' ? 1 : 4,
    },
    {
      id: 'firmness',
      ...CONCERN_META.firmness,
      score: Math.round((health.overall + health.spots) / 2),
      label: scoreLabel(Math.round((health.overall + health.spots) / 2)),
      priority: primaryNeed === 'wrinkles' || primaryNeed === 'antiaging' ? 1 : 4,
    },
  ];

  if (skinType === 'dry' || skinType === 'sensitive') {
    concerns.push({
      id: 'dryness',
      ...CONCERN_META.dryness,
      score: Math.round((health.overall + 15) / 1.15),
      label: scoreLabel(Math.round((health.overall + 15) / 1.15)),
      priority: skinType === 'dry' ? 2 : 3,
    });
  }

  concerns.sort((a, b) => a.priority - b.priority || a.score - b.score);

  const zoneSummaries = (zoneAnalysis?.zones || [])
    .filter((z) => z.severity !== 'low')
    .slice(0, 3)
    .map((z) => ({
      zone: z.label,
      concern: z.primary_concern,
      explanation: z.explanation,
      severity: z.severity,
    }));

  const navItems = [
    { id: 'overall', label: 'Genel skor', score: health.overall, color: '#78716c', ring: 'border-stone-400' },
    ...concerns.slice(0, 4).map((c) => ({
      id: c.id,
      label: c.title.split(' ')[0],
      score: c.score,
      color: c.color,
      ring: c.ring,
    })),
  ];

  return {
    health,
    concerns,
    navItems,
    zoneSummaries,
    overallExplanation:
      'Yapay zeka destekli analizimiz cildinizi değerlendirdi ve genel bir skor oluşturdu. Her konu 1–100 arasında puanlandı; skor ne kadar yüksekse cilt o alanda o kadar sağlıklı görünür.',
  };
}
