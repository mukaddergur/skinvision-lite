from schemas import AnalysisScores, ProductCard, Recommendations, SeverityLevels

DISCLAIMER = (
    "Bu analiz yalnızca eğitim ve görüntü işleme amaçlıdır. "
    "Tıbbi teşhis veya tedavi önerisi sunmaz. "
    "Cilt sağlığınız için bir dermatoloğa danışın."
)

IMG = "/products"

PRODUCT_CATALOG = {
    "cleanser_salicylic": ProductCard(
        name="Salisilik Asit Temizleyici",
        category="Temizleyici",
        benefit="Gözenekleri arındırır, akne benzeri bölgeleri hedefler",
        for_concern="Akne benzeri yoğunluk",
        ingredient="Salisilik Asit %2",
        icon="cleanser",
        color="#f97316",
        image_url=f"{IMG}/cleanser_salicylic.jpg",
    ),
    "moisturizer_oil_free": ProductCard(
        name="Yağsız Nemlendirici",
        category="Nemlendirici",
        benefit="Komodojenik olmayan formül, hafif doku",
        for_concern="Akne eğilimli cilt",
        ingredient="Hyaluronik Asit",
        icon="moisturizer",
        color="#38bdf8",
        image_url=f"{IMG}/moisturizer_oil_free.jpg",
    ),
    "serum_niacinamide": ProductCard(
        name="Niacinamide Serum",
        category="Serum",
        benefit="Kızarıklığı azaltır, cilt bariyerini destekler",
        for_concern="Kızarıklık",
        ingredient="Niacinamide %5",
        icon="serum",
        color="#f43f5e",
        image_url=f"{IMG}/serum_niacinamide.jpg",
    ),
    "serum_vitamin_c": ProductCard(
        name="C Vitamini Serum",
        category="Serum",
        benefit="Leke görünümünü azaltmaya yardımcı olur",
        for_concern="Leke / ton eşitsizliği",
        ingredient="L-Ascorbic Acid %10",
        icon="serum",
        color="#fbbf24",
        image_url=f"{IMG}/serum_vitamin_c.jpg",
    ),
    "spf50": ProductCard(
        name="SPF 50+ Güneş Koruyucu",
        category="Koruma",
        benefit="UV hasarına karşı günlük koruma",
        for_concern="Tüm cilt tipleri",
        ingredient="Geniş spektrum SPF",
        icon="spf",
        color="#a78bfa",
        image_url=f"{IMG}/spf50.jpg",
    ),
    "soothing": ProductCard(
        name="Yatıştırıcı Nemlendirici",
        category="Nemlendirici",
        benefit="Hassas ve kızarık ciltler için yatıştırıcı bakım",
        for_concern="Kızarıklık / hassasiyet",
        ingredient="Centella Asiatica",
        icon="moisturizer",
        color="#34d399",
        image_url=f"{IMG}/soothing.jpg",
    ),
    "basic_cleanser": ProductCard(
        name="Nazik Jel Temizleyici",
        category="Temizleyici",
        benefit="Günlük temizlik için pH dengeli formül",
        for_concern="Temel bakım",
        ingredient="Amino asit bazlı",
        icon="cleanser",
        color="#94a3b8",
        image_url=f"{IMG}/basic_cleanser.jpg",
    ),
    "basic_moisturizer": ProductCard(
        name="Hafif Nemlendirici",
        category="Nemlendirici",
        benefit="Günlük nem ihtiyacını karşılar",
        for_concern="Temel bakım",
        ingredient="Glycerin + Ceramide",
        icon="moisturizer",
        color="#60a5fa",
        image_url=f"{IMG}/basic_moisturizer.jpg",
    ),
}


def generate_recommendations(
    scores: AnalysisScores,
    severity: SeverityLevels,
) -> Recommendations:
    products: list[str] = []
    actions: list[str] = []
    product_cards: list[ProductCard] = []
    see_doctor = False
    doctor_reason: str | None = None

    def add_card(key: str, action: str | None = None):
        card = PRODUCT_CATALOG[key]
        if card.name not in products:
            products.append(card.name)
            product_cards.append(card)
        if action and action not in actions:
            actions.append(action)

    if severity.acne in ("medium", "high"):
        add_card("cleanser_salicylic", "Günde 2 kez nazik cilt temizliği yapın")
        add_card("moisturizer_oil_free", "Sıkma veya ovmaktan kaçının")
        if severity.acne == "high":
            see_doctor = True
            doctor_reason = "Akne benzeri bölge yoğunluğu yüksek — dermatolog kontrolü önerilir."

    if severity.redness in ("medium", "high"):
        add_card("serum_niacinamide", "Sıcak su yerine ılık su kullanın")
        add_card("soothing", "Güneşe maruziyeti azaltın ve SPF kullanın")
        if severity.redness == "high":
            see_doctor = True
            doctor_reason = doctor_reason or "Belirgin kızarıklık tespit edildi — uzman değerlendirmesi önerilir."

    if severity.spots in ("medium", "high"):
        add_card("serum_vitamin_c", "Güneş koruyucuyu her gün yenileyin")
        add_card("spf50", "Leke bölgesini ovmaktan kaçının")

    if severity.spots in ("medium", "high") or severity.redness in ("medium", "high"):
        if not any(c.name == PRODUCT_CATALOG["spf50"].name for c in product_cards):
            add_card("spf50")

    if scores.overall_score <= 40 and not product_cards:
        add_card("basic_cleanser", "Düzenli temel cilt bakım rutini oluşturun")
        add_card("basic_moisturizer")

    if scores.overall_score >= 67 and not see_doctor:
        actions.append("Mevcut rutininizi sürdürün ve cildinizi düzenli gözlemleyin")

    if not product_cards:
        add_card("basic_cleanser")
        add_card("basic_moisturizer")
    if not actions:
        actions.append("Cildinizi nemli tutun ve düzenli temizleyin")

    products = list(dict.fromkeys(products))
    actions = list(dict.fromkeys(actions))

    return Recommendations(
        products=products,
        actions=actions,
        product_cards=product_cards,
        see_doctor=see_doctor,
        doctor_reason=doctor_reason,
    )
