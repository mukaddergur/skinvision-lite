from __future__ import annotations

from datetime import datetime
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Image as RLImage
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from schemas import AnalysisResponse

FONT_NAME = "Helvetica"
_FONT_REGISTERED = False


def _register_font():
    global FONT_NAME, _FONT_REGISTERED
    if _FONT_REGISTERED:
        return
    candidates = [
        Path(r"C:\Windows\Fonts\arial.ttf"),
        Path(r"C:\Windows\Fonts\segoeui.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
        Path("/System/Library/Fonts/Supplemental/Arial.ttf"),
    ]
    for path in candidates:
        if path.exists():
            try:
                from reportlab.pdfbase import pdfmetrics
                from reportlab.pdfbase.ttfonts import TTFont

                pdfmetrics.registerFont(TTFont("SkinFont", str(path)))
                FONT_NAME = "SkinFont"
                break
            except Exception:
                continue
    _FONT_REGISTERED = True


def _styles():
    _register_font()
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "Title",
            parent=base["Title"],
            fontName=FONT_NAME,
            fontSize=22,
            textColor=colors.HexColor("#1e293b"),
            spaceAfter=12,
            alignment=TA_CENTER,
        ),
        "heading": ParagraphStyle(
            "Heading",
            parent=base["Heading2"],
            fontName=FONT_NAME,
            fontSize=14,
            textColor=colors.HexColor("#be123c"),
            spaceBefore=16,
            spaceAfter=8,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["Normal"],
            fontName=FONT_NAME,
            fontSize=10,
            leading=14,
            alignment=TA_JUSTIFY,
        ),
        "small": ParagraphStyle(
            "Small",
            parent=base["Normal"],
            fontName=FONT_NAME,
            fontSize=8,
            textColor=colors.grey,
            alignment=TA_JUSTIFY,
        ),
        "center": ParagraphStyle(
            "Center",
            parent=base["Normal"],
            fontName=FONT_NAME,
            fontSize=10,
            alignment=TA_CENTER,
        ),
    }


def _img(path: Path, width: float) -> RLImage | None:
    if not path.exists():
        return None
    try:
        return RLImage(str(path), width=width, height=width * 0.75)
    except Exception:
        return None


def generate_report(
    analysis: AnalysisResponse,
    output_path: Path,
    uploads_dir: Path,
    outputs_dir: Path,
) -> Path:
    styles = _styles()
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )
    story: list = []

    story.append(Paragraph("SkinVision Lite", styles["title"]))
    story.append(Paragraph("Cilt Görüntü Analiz Raporu", styles["center"]))
    story.append(Spacer(1, 0.3 * cm))
    story.append(
        Paragraph(
            f"Tarih: {datetime.now().strftime('%d.%m.%Y %H:%M')} | Cilt tipi: {analysis.personalized_routine.skin_type}",
            styles["center"],
        )
    )
    story.append(Spacer(1, 0.5 * cm))

    orig_name = analysis.original_image_url.split("/")[-1] if analysis.original_image_url else ""
    result_name = analysis.output_image_url.split("/")[-1]
    zone_name = analysis.zone_image_url.split("/")[-1] if analysis.zone_image_url else ""

    orig_img = _img(uploads_dir / orig_name, 7 * cm)
    result_img = _img(outputs_dir / result_name, 7 * cm)
    zone_img = _img(outputs_dir / zone_name, 7 * cm) if zone_name else None

    img_row = []
    if orig_img:
        img_row.append(orig_img)
    if result_img:
        img_row.append(result_img)
    if img_row:
        t = Table([img_row], colWidths=[7.5 * cm] * len(img_row))
        t.setStyle(TableStyle([("ALIGN", (0, 0), (-1, -1), "CENTER")]))
        story.append(t)
        story.append(Paragraph("Sol: Orijinal | Sağ: İşlenmiş analiz görseli", styles["small"]))
        story.append(Spacer(1, 0.3 * cm))

    if zone_img:
        story.append(Paragraph("Bölgesel Analiz Haritası", styles["heading"]))
        story.append(zone_img)
        story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("Görüntü Yoğunluğu Skorları (0–100)", styles["heading"]))
    score_data = [
        ["Metrik", "Skor", "Seviye"],
        ["Kızarıklık", str(analysis.scores.redness_score), analysis.severity.redness],
        ["Leke", str(analysis.scores.spot_score), analysis.severity.spots],
        ["Akne benzeri", str(analysis.scores.acne_score), analysis.severity.acne],
        ["Genel", str(analysis.scores.overall_score), "—"],
    ]
    score_table = Table(score_data, colWidths=[6 * cm, 3 * cm, 4 * cm])
    score_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("FONTNAME", (0, 0), (-1, -1), FONT_NAME),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                ("ALIGN", (1, 0), (-1, -1), "CENTER"),
            ]
        )
    )
    story.append(score_table)
    story.append(Spacer(1, 0.3 * cm))

    if analysis.ml_insights:
        story.append(Paragraph("ML Analiz Özeti", styles["heading"]))
        story.append(Paragraph(analysis.ml_insights.summary, styles["body"]))
        story.append(
            Paragraph(
                f"Model güveni: %{analysis.ml_insights.confidence_percent} | "
                f"Yöntem: {analysis.ml_insights.method}",
                styles["small"],
            )
        )
        story.append(Spacer(1, 0.2 * cm))

    story.append(Paragraph("Bölgesel Değerlendirme", styles["heading"]))
    for zone in analysis.zone_analysis.zones:
        story.append(
            Paragraph(
                f"<b>{zone.label}</b> — Odak: {zone.primary_concern} | Seviye: {zone.severity}",
                styles["body"],
            )
        )
        story.append(Paragraph(zone.explanation, styles["small"]))
        story.append(Spacer(1, 0.15 * cm))

    story.append(Paragraph("Kişiselleştirilmiş Bakım Rutini", styles["heading"]))
    story.append(Paragraph(analysis.personalized_routine.summary, styles["body"]))
    story.append(Paragraph(analysis.personalized_routine.skin_type_tip, styles["small"]))
    story.append(Spacer(1, 0.2 * cm))

    story.append(Paragraph("<b>Sabah Rutini</b>", styles["body"]))
    for step in analysis.personalized_routine.morning_routine:
        story.append(
            Paragraph(
                f"{step.order}. {step.step} — {step.product}<br/>{step.note}",
                styles["small"],
            )
        )

    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph("<b>Akşam Rutini</b>", styles["body"]))
    for step in analysis.personalized_routine.evening_routine:
        story.append(
            Paragraph(
                f"{step.order}. {step.step} — {step.product}<br/>{step.note}",
                styles["small"],
            )
        )

    story.append(Paragraph("Önerilen Ürünler", styles["heading"]))
    for card in analysis.recommendations.product_cards:
        story.append(
            Paragraph(
                f"<b>{card.name}</b> ({card.category})<br/>"
                f"İçerik: {card.ingredient} | {card.benefit}",
                styles["body"],
            )
        )
        story.append(Spacer(1, 0.1 * cm))

    if analysis.recommendations.see_doctor:
        story.append(
            Paragraph(
                f"<b>⚕ Uzman önerisi:</b> {analysis.recommendations.doctor_reason}",
                styles["body"],
            )
        )

    story.append(Spacer(1, 0.5 * cm))
    story.append(Paragraph("Yasal Uyarı", styles["heading"]))
    story.append(Paragraph(analysis.disclaimer, styles["small"]))
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph(analysis.confidence.message, styles["small"]))

    doc.build(story)
    return output_path
