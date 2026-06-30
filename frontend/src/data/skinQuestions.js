export const SKIN_QUESTIONS = [
  {
    id: 'primary_need',
    question: 'Cildinizin en öncelikli ihtiyacı nedir?',
    options: [
      { id: 'spots', label: 'Cilt lekelerimin görünümünü düzeltmek ve azaltmak' },
      { id: 'wrinkles', label: 'Cildimi sıkılaştırıp kırışıklıklarımı gidermek' },
      { id: 'matte', label: 'Cilt kusurlarımın görünümünü azaltarak daha mat bir görünüm elde etmek' },
      { id: 'soothe', label: 'Hassas cildimi nemlendirip besleyerek yatıştırmak' },
      { id: 'antiaging', label: 'Tüm yaşlanma belirtilerini düzeltmeye yardımcı olmak: kırışıklıklar, leke, hacim kaybı' },
    ],
  },
  {
    id: 'skin_feel',
    question: 'Cildiniz gün içinde nasıl hissediliyor?',
    options: [
      { id: 'dry', label: 'Sıkı ve gergin; pul pul dökülme oluyor' },
      { id: 'oily', label: 'Parlak ve yağlı; özellikle T bölgesinde' },
      { id: 'combination', label: 'T bölgesi yağlı, yanaklar normal veya kuru' },
      { id: 'normal', label: 'Dengeli; ne çok kuru ne çok yağlı' },
      { id: 'sensitive', label: 'Kolay kızaran, reaktif ve hassas' },
    ],
  },
  {
    id: 'routine',
    question: 'Günlük cilt bakım rutininiz nasıl?',
    options: [
      { id: 'none', label: 'Düzenli bir rutinim yok' },
      { id: 'basic', label: 'Temizleyici ve nemlendirici kullanıyorum' },
      { id: 'spf', label: 'Temizleyici, nemlendirici ve SPF kullanıyorum' },
      { id: 'advanced', label: 'Serum, aktif içerikler ve SPF içeren gelişmiş rutin' },
    ],
  },
  {
    id: 'problem_area',
    question: 'En çok hangi bölgede sorun yaşıyorsunuz?',
    options: [
      { id: 'forehead', label: 'Alın — ince çizgiler veya kızarıklık' },
      { id: 'cheeks', label: 'Yanaklar — leke veya ton eşitsizliği' },
      { id: 'nose', label: 'Burun / T bölgesi — gözenek ve yağlanma' },
      { id: 'chin', label: 'Çene — sivilce veya iltihap' },
      { id: 'whole', label: 'Tüm yüz — genel denge ve parlaklık' },
    ],
  },
  {
    id: 'age_range',
    question: 'Yaş aralığınız nedir?',
    options: [
      { id: '18-25', label: '18 – 25' },
      { id: '26-35', label: '26 – 35' },
      { id: '36-45', label: '36 – 45' },
      { id: '46-55', label: '46 – 55' },
      { id: '55+', label: '55 ve üzeri' },
    ],
  },
];

export function deriveSkinType(answers) {
  return answers.skin_feel || 'normal';
}
