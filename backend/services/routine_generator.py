from schemas import AnalysisScores, PersonalizedRoutine, RoutineStep, SeverityLevels, ZoneResult

SKIN_TYPE_TIPS = {
    "dry": "Kuru cilt: Yağlı içeriklerden kaçının, hyaluronik asit ve ceramide tercih edin.",
    "oily": "Yağlı cilt: Yağsız, hafif dokulu ürünler ve düzenli temizlik önemlidir.",
    "combination": "Karma cilt: T bölgesine yağ kontrolü, yanaklara nem odaklı bakım uygulayın.",
    "normal": "Normal cilt: Dengeli temizlik ve koruyucu SPF yeterli olabilir.",
    "sensitive": "Hassas cilt: Parfümsüz, alkol içermeyen ve yatıştırıcı formüller tercih edin.",
}


def generate_personalized_routine(
    scores: AnalysisScores,
    severity: SeverityLevels,
    zones: list[ZoneResult],
    skin_type: str = "normal",
) -> PersonalizedRoutine:
    morning: list[RoutineStep] = [
        RoutineStep(order=1, step="Temizlik", product="Nazik jel temizleyici", note="Ilık su ile 30 saniye masaj yapın."),
    ]
    evening: list[RoutineStep] = [
        RoutineStep(order=1, step="Makyaj / kir temizliği", product="Çift aşamalı temizleyici", note="Önce yağ bazlı, sonra jel temizleyici."),
    ]

    if severity.redness in ("medium", "high"):
        morning.append(RoutineStep(order=2, step="Serum", product="Niacinamide %5 serum", note="Kızarıklık ve bariyer desteği için."))
        evening.append(RoutineStep(order=2, step="Yatıştırıcı bakım", product="Centella veya aloe nemlendirici", note="Ovma yapmadan uygulayın."))
    elif severity.spots in ("medium", "high"):
        morning.append(RoutineStep(order=2, step="Aydınlatıcı serum", product="C vitamini serumu", note="SPF öncesi uygulayın."))
    else:
        morning.append(RoutineStep(order=2, step="Nem", product="Hafif nemlendirici", note="Cildiniz nemli iken uygulayın."))

    morning.append(
        RoutineStep(
            order=len(morning) + 1,
            step="Koruma",
            product="SPF 50+ geniş spektrumlu güneş koruyucu",
            note="Her gün, bulutlu havalarda bile.",
        )
    )

    if severity.acne in ("medium", "high"):
        evening.append(
            RoutineStep(order=len(evening) + 1, step="Hedefli bakım", product="Salisilik asit %2 temizleyici", note="Çene ve burun bölgesine odaklanın.")
        )
    if severity.spots in ("medium", "high"):
        evening.append(
            RoutineStep(order=len(evening) + 1, step="Onarım", product="Retinol veya bakuchiol (haftada 2–3 gece)", note="Başlangıçta düşük doz kullanın.")
        )

    evening.append(
        RoutineStep(
            order=len(evening) + 1,
            step="Gece nemlendirme",
            product="Gece kremi veya sleeping mask",
            note="Cildi onarım moduna alır.",
        )
    )

    focus_zones = [z.label for z in zones if z.severity in ("medium", "high")][:3]
    skin_tip = SKIN_TYPE_TIPS.get(skin_type, SKIN_TYPE_TIPS["normal"])

    summary = (
        f"Cilt tipiniz ({skin_type}) ve analiz skorlarınıza göre kişiselleştirilmiş rutin. "
        f"Odak bölgeler: {', '.join(focus_zones) if focus_zones else 'genel denge'}."
    )

    return PersonalizedRoutine(
        skin_type=skin_type,
        summary=summary,
        skin_type_tip=skin_tip,
        morning_routine=morning,
        evening_routine=evening,
        focus_areas=focus_zones or ["Tüm yüz — dengeli bakım"],
    )
