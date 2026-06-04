"""
PDF report generation using ReportLab.
Produces branded SecurePay Vision reports for individual scans and full exports.
"""
import io
import os
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

# ReportLab imports
try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm, mm
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        HRFlowable, KeepTogether,
    )
    from reportlab.graphics.shapes import Drawing, Rect, String, Circle
    from reportlab.graphics.charts.piecharts import Pie
    from reportlab.graphics import renderPDF
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    logger.warning("ReportLab not available – PDF export will be plain text")

# Branding colors
PRIMARY_COLOR = colors.HexColor("#1a237e")
ACCENT_COLOR = colors.HexColor("#0d47a1")
DANGER_COLOR = colors.HexColor("#c62828")
WARNING_COLOR = colors.HexColor("#f57f17")
SUCCESS_COLOR = colors.HexColor("#2e7d32")
LIGHT_GRAY = colors.HexColor("#f5f5f5")
MEDIUM_GRAY = colors.HexColor("#9e9e9e")

RISK_COLORS = {
    "HIGH": DANGER_COLOR,
    "MEDIUM": WARNING_COLOR,
    "LOW": colors.HexColor("#1565c0"),
    "NORMAL": SUCCESS_COLOR,
}


class ReportService:
    """Generate PDF reports for fraud analysis results."""

    # ------------------------------------------------------------------
    # Single scan report
    # ------------------------------------------------------------------

    def generate_scan_report(self, scan_data: dict, user_data: dict) -> bytes:
        """Generate a PDF report for a single invoice scan."""
        if not REPORTLAB_AVAILABLE:
            return self._plain_text_report(scan_data, user_data)

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2 * cm,
            leftMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2 * cm,
        )

        styles = self._get_styles()
        story = []

        self._add_header(story, styles)
        self._add_scan_summary(story, styles, scan_data, user_data)
        self._add_risk_gauge(story, scan_data.get("fraud_probability", 0))
        self._add_transaction_details(story, styles, scan_data)
        self._add_fraud_indicators(story, styles, scan_data)
        self._add_forensics_section(story, styles, scan_data)
        self._add_recommendations(story, styles, scan_data)
        self._add_footer(story, styles)

        doc.build(story)
        return buffer.getvalue()

    # ------------------------------------------------------------------
    # Full report
    # ------------------------------------------------------------------

    def generate_full_report(self, report_data: dict, user_data: dict) -> bytes:
        """Generate a comprehensive fraud report with statistics."""
        if not REPORTLAB_AVAILABLE:
            return self._plain_text_report(report_data, user_data)

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2 * cm,
            leftMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2 * cm,
        )

        styles = self._get_styles()
        story = []

        self._add_header(story, styles)
        self._add_report_title(story, styles, "Laporan Deteksi Fraud – Komprehensif")
        self._add_stats_table(story, styles, report_data)
        self._add_risk_distribution(story, report_data)
        self._add_recent_transactions_table(story, styles, report_data)
        self._add_footer(story, styles)

        doc.build(story)
        return buffer.getvalue()

    # ------------------------------------------------------------------
    # Report building blocks
    # ------------------------------------------------------------------

    def _get_styles(self):
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(
            name="Title2",
            fontSize=20,
            leading=24,
            textColor=PRIMARY_COLOR,
            spaceAfter=6,
        ))
        styles.add(ParagraphStyle(
            name="SectionHeader",
            fontSize=13,
            leading=16,
            textColor=ACCENT_COLOR,
            spaceBefore=12,
            spaceAfter=6,
            borderPad=4,
        ))
        styles.add(ParagraphStyle(
            name="Body2",
            fontSize=9,
            leading=13,
            textColor=colors.black,
        ))
        styles.add(ParagraphStyle(
            name="SmallGray",
            fontSize=8,
            leading=11,
            textColor=MEDIUM_GRAY,
        ))
        return styles

    def _add_header(self, story: list, styles):
        header_data = [[
            Paragraph("<b>SecurePay Vision</b>", styles["Title2"]),
            Paragraph(
                f"<font color='gray' size='8'>AI-Powered Fraud Detection for UMKM<br/>"
                f"Generated: {datetime.now().strftime('%d %B %Y %H:%M')}</font>",
                styles["SmallGray"],
            ),
        ]]
        header_table = Table(header_data, colWidths=[10 * cm, 7 * cm])
        header_table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (1, 0), (1, 0), "RIGHT"),
            ("LINEBELOW", (0, 0), (-1, 0), 1.5, PRIMARY_COLOR),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 0.4 * cm))

    def _add_report_title(self, story: list, styles, title: str):
        story.append(Paragraph(title, styles["SectionHeader"]))
        story.append(Spacer(1, 0.3 * cm))

    def _add_scan_summary(self, story: list, styles, scan: dict, user: dict):
        story.append(Paragraph("Ringkasan Pemindaian Invoice", styles["SectionHeader"]))

        risk = scan.get("risk_level", "NORMAL")
        risk_color = RISK_COLORS.get(risk, SUCCESS_COLOR)
        risk_hex = risk_color.hexval() if hasattr(risk_color, "hexval") else "#2e7d32"

        prob = scan.get("fraud_probability", 0.0)
        data = [
            ["Scan ID", scan.get("id", "-")],
            ["Nama File", scan.get("filename", "-")],
            ["Pengguna", user.get("full_name", "-")],
            ["Merchant", scan.get("extracted_merchant", "Tidak terdeteksi")],
            ["Jumlah", f"Rp {scan.get('extracted_amount', 0):,.0f}" if scan.get("extracted_amount") else "-"],
            ["Tanggal Transaksi", scan.get("extracted_date", "-")],
            ["Metode Pembayaran", scan.get("extracted_payment_method", "-")],
            ["Probabilitas Fraud", f"{prob * 100:.1f}%"],
            ["Tingkat Risiko", risk],
            ["Waktu Analisis", f"{scan.get('processing_time_ms', 0):.0f} ms"],
        ]

        table = Table(data, colWidths=[5 * cm, 11.5 * cm])
        style = TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), LIGHT_GRAY),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, MEDIUM_GRAY),
            ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, LIGHT_GRAY]),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("PADDING", (0, 0), (-1, -1), 5),
        ])
        # Highlight risk row
        risk_row = 8
        style.add("BACKGROUND", (1, risk_row), (1, risk_row), risk_color)
        style.add("TEXTCOLOR", (1, risk_row), (1, risk_row), colors.white)
        style.add("FONTNAME", (1, risk_row), (1, risk_row), "Helvetica-Bold")
        table.setStyle(style)

        story.append(table)
        story.append(Spacer(1, 0.4 * cm))

    def _add_risk_gauge(self, story: list, probability: float):
        """Draw a simple risk gauge bar."""
        story.append(Spacer(1, 0.2 * cm))
        pct = min(max(probability, 0.0), 1.0)
        bar_width = 450
        filled = int(bar_width * pct)
        color = (
            DANGER_COLOR if pct > 0.7 else
            WARNING_COLOR if pct > 0.4 else
            colors.HexColor("#1565c0") if pct > 0.2 else
            SUCCESS_COLOR
        )
        d = Drawing(bar_width, 28)
        d.add(Rect(0, 8, bar_width, 12, fillColor=LIGHT_GRAY, strokeColor=MEDIUM_GRAY, strokeWidth=0.5))
        if filled > 0:
            d.add(Rect(0, 8, filled, 12, fillColor=color, strokeColor=None, strokeWidth=0))
        d.add(String(0, 0, f"Fraud Score: {pct * 100:.1f}%", fontSize=8, fillColor=colors.black))
        story.append(d)
        story.append(Spacer(1, 0.4 * cm))

    def _add_transaction_details(self, story: list, styles, scan: dict):
        story.append(Paragraph("Detail Data Transaksi (dari OCR)", styles["SectionHeader"]))
        raw = scan.get("ocr_raw_text", "")
        if raw:
            story.append(Paragraph(raw[:800].replace("\n", "<br/>"), styles["Body2"]))
        else:
            story.append(Paragraph("Tidak ada teks OCR tersedia.", styles["SmallGray"]))
        story.append(Spacer(1, 0.3 * cm))

    def _add_fraud_indicators(self, story: list, styles, scan: dict):
        indicators = scan.get("fraud_indicators", [])
        story.append(Paragraph("Indikator Fraud yang Terdeteksi", styles["SectionHeader"]))
        if not indicators:
            story.append(Paragraph("Tidak ada indikator fraud yang ditemukan.", styles["Body2"]))
        else:
            for ind in indicators:
                story.append(Paragraph(f"• {ind}", styles["Body2"]))
        story.append(Spacer(1, 0.3 * cm))

    def _add_forensics_section(self, story: list, styles, scan: dict):
        story.append(Paragraph("Hasil Forensik Gambar", styles["SectionHeader"]))
        details = scan.get("forensics_details", {})
        ms = scan.get("manipulation_score", 0)
        detected = scan.get("manipulation_detected", False)

        data = [
            ["Parameter", "Nilai"],
            ["Manipulation Score", f"{ms:.4f}"],
            ["Manipulasi Terdeteksi", "YA" if detected else "TIDAK"],
        ]
        for key, val in details.items():
            data.append([key.replace("_", " ").title(), f"{val:.4f}"])

        table = Table(data, colWidths=[8 * cm, 8.5 * cm])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, MEDIUM_GRAY),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
            ("PADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(table)
        story.append(Spacer(1, 0.3 * cm))

    def _add_recommendations(self, story: list, styles, scan: dict):
        recs = scan.get("recommendations", [])
        if not recs:
            return
        story.append(Paragraph("Rekomendasi Tindakan", styles["SectionHeader"]))
        for i, rec in enumerate(recs, 1):
            story.append(Paragraph(f"{i}. {rec}", styles["Body2"]))
        story.append(Spacer(1, 0.3 * cm))

    def _add_stats_table(self, story: list, styles, data: dict):
        story.append(Paragraph("Statistik Ringkasan", styles["SectionHeader"]))
        stats = data.get("stats", {})
        rows = [
            ["Total Transaksi", str(stats.get("total_transactions", 0))],
            ["Terdeteksi Fraud", str(stats.get("fraud_count", 0))],
            ["Tingkat Fraud (%)", f"{stats.get('fraud_rate', 0):.1f}%"],
            ["Total Dipindai", str(stats.get("total_scans", 0))],
        ]
        table = Table(rows, colWidths=[8 * cm, 8.5 * cm])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), LIGHT_GRAY),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, MEDIUM_GRAY),
            ("PADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(table)
        story.append(Spacer(1, 0.4 * cm))

    def _add_risk_distribution(self, story: list, data: dict):
        """Draw a simple pie-like distribution using a horizontal bar."""
        dist = data.get("risk_distribution", {})
        if not dist:
            return
        total = sum(dist.values()) or 1
        bar_width = 450
        d = Drawing(bar_width, 40)
        x = 0
        color_map = {
            "HIGH": DANGER_COLOR,
            "MEDIUM": WARNING_COLOR,
            "LOW": colors.HexColor("#1565c0"),
            "NORMAL": SUCCESS_COLOR,
        }
        for level, count in dist.items():
            w = int(bar_width * count / total)
            d.add(Rect(x, 20, w, 16, fillColor=color_map.get(level, MEDIUM_GRAY), strokeColor=None))
            if w > 20:
                d.add(String(x + 4, 24, f"{level}: {count}", fontSize=7, fillColor=colors.white))
            x += w
        story.append(d)
        story.append(Spacer(1, 0.4 * cm))

    def _add_recent_transactions_table(self, story: list, styles, data: dict):
        transactions = data.get("recent_transactions", [])
        if not transactions:
            return
        story.append(Paragraph("Transaksi Terbaru", styles["SectionHeader"]))
        headers = ["Merchant", "Jumlah (Rp)", "Metode", "Risk", "Prob Fraud"]
        rows = [headers]
        for t in transactions[:20]:
            rows.append([
                str(t.get("merchant_name", ""))[:30],
                f"{t.get('amount', 0):,.0f}",
                str(t.get("payment_method", "")),
                str(t.get("risk_level", "NORMAL")),
                f"{(t.get('fraud_probability') or 0) * 100:.1f}%",
            ])
        col_widths = [5.5 * cm, 3.5 * cm, 2.5 * cm, 2 * cm, 3 * cm]
        table = Table(rows, colWidths=col_widths)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.4, MEDIUM_GRAY),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
            ("PADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(table)

    def _add_footer(self, story: list, styles):
        story.append(Spacer(1, 0.5 * cm))
        story.append(HRFlowable(width="100%", thickness=0.5, color=MEDIUM_GRAY))
        story.append(Spacer(1, 0.2 * cm))
        story.append(Paragraph(
            "SecurePay Vision – AI-Powered Digital Transaction Fraud Detection System for UMKM | "
            "Dokumen ini dibuat secara otomatis dan bersifat rahasia.",
            styles["SmallGray"],
        ))

    # ------------------------------------------------------------------
    # Plain text fallback
    # ------------------------------------------------------------------

    def _plain_text_report(self, data: dict, user: dict) -> bytes:
        lines = [
            "SecurePay Vision – Fraud Analysis Report",
            "=" * 50,
            f"Generated: {datetime.now().isoformat()}",
            f"User: {user.get('full_name', 'Unknown')}",
            "",
            "SCAN DETAILS",
            "-" * 30,
        ]
        for key, val in data.items():
            if not isinstance(val, (dict, list)):
                lines.append(f"{key}: {val}")
        return "\n".join(lines).encode("utf-8")
