"""UPSale progress + 2-day schedule PDF (simple wording, exact %)."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)
from datetime import date
import os

out_path = os.path.join(
    os.path.dirname(__file__), "UPSale_Project_Progress_and_2Day_Schedule.pdf"
)

# Colors
brand = HexColor("#7C3AED")
brand_dark = HexColor("#5B21B6")
ink = HexColor("#1A1228")
muted = HexColor("#5B5270")
soft = HexColor("#F5F3FF")
line = HexColor("#E9E5F5")
card_bg = HexColor("#FAFAFC")
green_bg = HexColor("#ECFDF5")
amber_bg = HexColor("#FFFBEB")
red_bg = HexColor("#FEF2F2")

# Progress (exact, no ~) — equal average of phases = 50%
PHASE_PCT = {"1": 98, "2": 55, "3": 2, "4": 45}
OVERALL_PCT = round(sum(PHASE_PCT.values()) / 4)  # 50

doc = SimpleDocTemplate(
    out_path,
    pagesize=A4,
    leftMargin=14 * mm,
    rightMargin=14 * mm,
    topMargin=11 * mm,
    bottomMargin=12 * mm,
    title="UPSale Project Progress & 2-Day Schedule",
    author="Muhammad Haris & Savaiz Said Gill",
)

styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="H1",
        fontName="Helvetica-Bold",
        fontSize=12,
        textColor=brand_dark,
        leading=15,
        spaceBefore=9,
        spaceAfter=5,
    )
)
styles.add(
    ParagraphStyle(
        name="H2",
        fontName="Helvetica-Bold",
        fontSize=10,
        textColor=ink,
        leading=13,
        spaceBefore=6,
        spaceAfter=3,
    )
)
styles.add(
    ParagraphStyle(
        name="Body", fontName="Helvetica", fontSize=9, textColor=ink, leading=12, spaceAfter=3
    )
)
styles.add(
    ParagraphStyle(
        name="Small", fontName="Helvetica", fontSize=8, textColor=muted, leading=10.5, spaceAfter=2
    )
)
styles.add(
    ParagraphStyle(name="Cell", fontName="Helvetica", fontSize=8, textColor=ink, leading=10.5)
)
styles.add(
    ParagraphStyle(
        name="CellBold", fontName="Helvetica-Bold", fontSize=8, textColor=ink, leading=10.5
    )
)
styles.add(
    ParagraphStyle(
        name="Done", fontName="Helvetica", fontSize=8, textColor=HexColor("#166534"), leading=10.5
    )
)
styles.add(
    ParagraphStyle(
        name="Pend", fontName="Helvetica", fontSize=8, textColor=HexColor("#9A3412"), leading=10.5
    )
)
styles.add(
    ParagraphStyle(
        name="Foot", fontName="Helvetica", fontSize=7.5, textColor=muted, alignment=1
    )
)

story = []

# ---- Header ----
header = Table(
    [
        [
            Paragraph(
                "<b>UPSALE</b> — Project Progress &amp; Next 2-Day Schedule",
                ParagraphStyle(
                    "hdr",
                    fontName="Helvetica-Bold",
                    fontSize=11,
                    textColor=white,
                    leading=14,
                ),
            )
        ]
    ],
    colWidths=[182 * mm],
)
header.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, -1), brand),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 9),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ]
    )
)
story.append(header)
story.append(Spacer(1, 7))

story.append(
    Paragraph(
        "Simple report based on BRD Phases 1–4 and the current codebase. "
        "Easy list of what is working and what is still left.",
        styles["Small"],
    )
)
story.append(
    Paragraph(
        f"<b>Date:</b> {date.today().strftime('%d %B %Y')} &nbsp;|&nbsp; "
        "<b>Team:</b> Muhammad Haris · Savaiz Said Gill &nbsp;|&nbsp; "
        "<b>Window:</b> next 2 days",
        styles["Body"],
    )
)
story.append(HRFlowable(width="100%", thickness=1, color=line, spaceAfter=6))

# ---- Overall ----
story.append(Paragraph("1. Overall Progress", styles["H1"]))

overall = Table(
    [
        [
            Paragraph("<b>Phase</b>", styles["CellBold"]),
            Paragraph("<b>Simple name</b>", styles["CellBold"]),
            Paragraph("<b>Progress</b>", styles["CellBold"]),
            Paragraph("<b>In one line</b>", styles["CellBold"]),
        ],
        [
            Paragraph("Phase 1", styles["CellBold"]),
            Paragraph("QR + customer capture", styles["Cell"]),
            Paragraph(f"<b>{PHASE_PCT['1']}%</b>", styles["CellBold"]),
            Paragraph("Almost finished — ready for demo", styles["Done"]),
        ],
        [
            Paragraph("Phase 2", styles["CellBold"]),
            Paragraph("History, segments, deals", styles["Cell"]),
            Paragraph(f"<b>{PHASE_PCT['2']}%</b>", styles["CellBold"]),
            Paragraph("Half done — WhatsApp send still missing", styles["Pend"]),
        ],
        [
            Paragraph("Phase 3", styles["CellBold"]),
            Paragraph("AI Deal Maker", styles["Cell"]),
            Paragraph(f"<b>{PHASE_PCT['3']}%</b>", styles["CellBold"]),
            Paragraph("Not built yet (landing text only)", styles["Pend"]),
        ],
        [
            Paragraph("Phase 4", styles["CellBold"]),
            Paragraph("Landing + subscriptions", styles["Cell"]),
            Paragraph(f"<b>{PHASE_PCT['4']}%</b>", styles["CellBold"]),
            Paragraph("Landing done — paid plans not live", styles["Pend"]),
        ],
        [
            Paragraph("<b>Overall</b>", styles["CellBold"]),
            Paragraph("All BRD phases (equal average)", styles["Cell"]),
            Paragraph(f"<b>{OVERALL_PCT}%</b>", styles["CellBold"]),
            Paragraph(
                f"({PHASE_PCT['1']} + {PHASE_PCT['2']} + {PHASE_PCT['3']} + {PHASE_PCT['4']}) ÷ 4",
                styles["Small"],
            ),
        ],
    ],
    colWidths=[24 * mm, 48 * mm, 22 * mm, 88 * mm],
)
overall.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), soft),
            ("BACKGROUND", (0, 1), (-1, 1), green_bg),
            ("BACKGROUND", (0, 2), (-1, 2), amber_bg),
            ("BACKGROUND", (0, 3), (-1, 3), red_bg),
            ("BACKGROUND", (0, 4), (-1, 4), amber_bg),
            ("BACKGROUND", (0, 5), (-1, 5), soft),
            ("GRID", (0, 0), (-1, -1), 0.5, line),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]
    )
)
story.append(overall)
story.append(Spacer(1, 3))
story.append(
    Paragraph(
        f"<b>Project is {OVERALL_PCT}% complete.</b> "
        "Phase 1 works end-to-end. Next big gaps: real WhatsApp messages, AI Deal Maker, "
        "and real subscription plans.",
        styles["Body"],
    )
)

# ---- Phase feature lists ----
story.append(Paragraph("2. Features Done vs Pending (by Phase)", styles["H1"]))
story.append(
    Paragraph(
        "Green = working in the app. Orange = still to build. "
        "Percentages come from how much of each BRD phase is covered.",
        styles["Small"],
    )
)


def feature_block(title, pct, done_items, pending_items, bg_header):
    """One phase block: done list + pending list."""
    done_txt = "<br/>".join([f"✓ {x}" for x in done_items]) or "—"
    pend_txt = "<br/>".join([f"○ {x}" for x in pending_items]) or "✓ Nothing major left"
    t = Table(
        [
            [
                Paragraph(
                    f"<font color='white'><b>{title} — {pct}%</b></font>",
                    styles["Cell"],
                )
            ],
            [
                Paragraph(
                    f"<b>DONE</b><br/>{done_txt}",
                    styles["Done"],
                )
            ],
            [
                Paragraph(
                    f"<b>PENDING</b><br/>{pend_txt}",
                    styles["Pend"] if pending_items else styles["Done"],
                )
            ],
        ],
        colWidths=[182 * mm],
    )
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), bg_header),
                ("BACKGROUND", (0, 1), (-1, 1), green_bg),
                ("BACKGROUND", (0, 2), (-1, 2), amber_bg if pending_items else green_bg),
                ("BOX", (0, 0), (-1, -1), 0.5, line),
                ("LINEBELOW", (0, 0), (-1, 1), 0.4, line),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return KeepTogether([t, Spacer(1, 6)])


story.append(
    feature_block(
        "Phase 1 — QR Discount &amp; Capture",
        PHASE_PCT["1"],
        [
            "Business signup / login / OTP / profile",
            "Create offer + QR code + public link (/o/slug)",
            "Customer claim form (name, WhatsApp, optional email + consent)",
            "Unique coupon saved; customers &amp; coupons in dashboard",
            "Mark coupon redeemed (one-use); customer CSV download",
            "Overview dashboard stats",
        ],
        [
            "Small polish only (edge cases / copy) — not blocking demo",
        ],
        brand,
    )
)

story.append(
    feature_block(
        "Phase 2 — History, Segments &amp; WhatsApp Deals",
        PHASE_PCT["2"],
        [
            "Record visit / purchase on customer detail",
            "Visit history list (amount + note)",
            "Segments: New / Repeat / VIP / At Risk (filters + deal audience)",
            "Deals page: create message, pick audience, send now or schedule",
            "Deal status list (scheduled / sent) + skip opted-out customers in audience",
            "optedOut field on customer model",
        ],
        [
            "Real WhatsApp API send (today only marks “sent” in database)",
            "Owner / customer opt-out toggle + STOP handling UI",
            "Campaign delivery log (per message sent / failed)",
            "Spam / frequency limits for same customer",
        ],
        brand_dark,
    )
)

story.append(
    feature_block(
        "Phase 3 — AI Deal Maker",
        PHASE_PCT["3"],
        [
            "Mentioned on landing page only",
        ],
        [
            "AI suggests deal + WhatsApp text from visit / spend history",
            "Owner actions: Approve / Edit / Regenerate / Schedule",
            "Never auto-send without owner approval",
            "Respect max discount / min spend rules",
        ],
        HexColor("#6D28D9"),
    )
)

story.append(
    feature_block(
        "Phase 4 — Landing &amp; Subscriptions",
        PHASE_PCT["4"],
        [
            "Public landing page (journey, guide, demo, pricing UI)",
            "Starter / Growth / Pro shown; Growth marked popular",
            "Profile shows trial / plan badge text",
        ],
        [
            "Real plan selection + country-based pricing in account",
            "Checkout / billing (Starter, Growth, Pro limits)",
            "Usage limits enforced by plan",
        ],
        HexColor("#5B21B6"),
    )
)

# ---- Pending with Roman Urdu ----
story.append(Paragraph("3. Pending Tasks (simple + Roman Urdu)", styles["H1"]))
story.append(
    Paragraph(
        "Har pending task ke neeche 2–3 lines Roman Urdu mein short explanation hai "
        "taake team easily samajh sake.",
        styles["Small"],
    )
)

pending_rows = [
    [
        Paragraph("<b>#</b>", styles["CellBold"]),
        Paragraph("<b>Task</b>", styles["CellBold"]),
        Paragraph("<b>Phase</b>", styles["CellBold"]),
        Paragraph("<b>Pri</b>", styles["CellBold"]),
        Paragraph("<b>Explanation (Roman Urdu)</b>", styles["CellBold"]),
    ],
    [
        Paragraph("1", styles["Cell"]),
        Paragraph("<b>WhatsApp real send</b>", styles["Cell"]),
        Paragraph("2", styles["Cell"]),
        Paragraph("P0", styles["CellBold"]),
        Paragraph(
            "Abhi deal create hone par system sirf database mein “sent” likh deta hai. "
            "Asal WhatsApp message customer tak nahi jata. "
            "WhatsApp Cloud API ya n8n connect karke Send now / test message chalana hai.",
            styles["Cell"],
        ),
    ],
    [
        Paragraph("2", styles["Cell"]),
        Paragraph("<b>Opt-out / STOP control</b>", styles["Cell"]),
        Paragraph("2", styles["Cell"]),
        Paragraph("P1", styles["CellBold"]),
        Paragraph(
            "Customer pe optedOut field hai, lekin owner ke paas clear on/off button nahi. "
            "STOP ya unsubscribe flow bhi incomplete hai. "
            "Iske baghair marketing block poori tarah safe nahi.",
            styles["Cell"],
        ),
    ],
    [
        Paragraph("3", styles["Cell"]),
        Paragraph("<b>Campaign send log</b>", styles["Cell"]),
        Paragraph("2", styles["Cell"]),
        Paragraph("P1", styles["CellBold"]),
        Paragraph(
            "Deal list mein status hai, lekin har customer ko message gaya ya fail hua — "
            "yeh detail nahi dikhti. "
            "Simple log se demo aur debugging dono asaan ho jayenge.",
            styles["Cell"],
        ),
    ],
    [
        Paragraph("4", styles["Cell"]),
        Paragraph("<b>AI Deal Maker</b>", styles["Cell"]),
        Paragraph("3", styles["Cell"]),
        Paragraph("P0", styles["CellBold"]),
        Paragraph(
            "AI abhi deal suggest nahi karti. History se title + WhatsApp text banani hai. "
            "Owner Approve / Edit / Regenerate kare — auto-send bilkul nahi. "
            "Phir deal Deals page par schedule ho sakti hai.",
            styles["Cell"],
        ),
    ],
    [
        Paragraph("5", styles["Cell"]),
        Paragraph("<b>Super Admin panel</b>", styles["Cell"]),
        Paragraph("Admin", styles["Cell"]),
        Paragraph("P0", styles["CellBold"]),
        Paragraph(
            "Platform admin login + businesses list chahiye. "
            "Admin kisi business ko activate ya suspend kar sake. "
            "BRD phase number nahi, lekin demo / ops ke liye zaroori hai.",
            styles["Cell"],
        ),
    ],
    [
        Paragraph("6", styles["Cell"]),
        Paragraph("<b>Subscription plans live</b>", styles["Cell"]),
        Paragraph("4", styles["Cell"]),
        Paragraph("P1", styles["CellBold"]),
        Paragraph(
            "Landing par plans dikhte hain, lekin account mein real choose / pay nahi. "
            "Country pricing + Starter/Growth/Pro limits lagani hain. "
            "Poora payment gateway time short ho to badge + limits pehle theek hain.",
            styles["Cell"],
        ),
    ],
    [
        Paragraph("7", styles["Cell"]),
        Paragraph("<b>Demo harden + README</b>", styles["Cell"]),
        Paragraph("All", styles["Cell"]),
        Paragraph("P0", styles["CellBold"]),
        Paragraph(
            "Poora flow ek dafa test: signup → QR → claim → redeem → visit → deal. "
            "Bugs fix karke README mein env / Atlas / demo steps likh do. "
            "Is se presentation smooth aur repeatable ho jati hai.",
            styles["Cell"],
        ),
    ],
]

pending = Table(pending_rows, colWidths=[8 * mm, 38 * mm, 14 * mm, 12 * mm, 110 * mm])
pending.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), soft),
            ("GRID", (0, 0), (-1, -1), 0.5, line),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("BACKGROUND", (0, 1), (-1, 1), card_bg),
            ("BACKGROUND", (0, 3), (-1, 3), card_bg),
            ("BACKGROUND", (0, 5), (-1, 5), card_bg),
            ("BACKGROUND", (0, 7), (-1, 7), card_bg),
        ]
    )
)
story.append(pending)

# ---- 2-day schedule ----
story.append(Paragraph("4. Schedule for Next 2 Days (equal tasks)", styles["H1"]))
story.append(
    Paragraph(
        "Har person ko har din <b>3 tasks</b> milte hain (total 6 + 6). "
        "Subah / shaam split nahi — din ka list ek block mein complete karna hai.",
        styles["Body"],
    )
)

story.append(Paragraph("Day 1", styles["H2"]))
day1 = Table(
    [
        [
            Paragraph("<font color='white'><b>Muhammad Haris (3)</b></font>", styles["Cell"]),
            Paragraph("<font color='white'><b>Savaiz Said Gill (3)</b></font>", styles["Cell"]),
        ],
        [
            Paragraph(
                "1. <b>WhatsApp send path</b> — Cloud API ya clear stub + “Send test” from Deals<br/><br/>"
                "2. <b>Opt-out toggle</b> — owner customer detail se opted-out on/off; deals exclude check<br/><br/>"
                "3. <b>Campaign log</b> — simple sent / failed count or notes on a deal",
                styles["Cell"],
            ),
            Paragraph(
                "1. <b>AI Deal Maker v1</b> — suggest title + WhatsApp copy from segment stats<br/><br/>"
                "2. <b>Approve / Edit / Regenerate</b> — no auto-send; push into Deals form<br/><br/>"
                "3. <b>Super Admin scaffold</b> — admin login + list all businesses",
                styles["Cell"],
            ),
        ],
    ],
    colWidths=[91 * mm, 91 * mm],
)
day1.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), brand),
            ("BACKGROUND", (0, 1), (-1, 1), card_bg),
            ("GRID", (0, 0), (-1, -1), 0.5, line),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]
    )
)
story.append(day1)

story.append(Spacer(1, 7))
story.append(Paragraph("Day 2", styles["H2"]))
day2 = Table(
    [
        [
            Paragraph("<font color='white'><b>Muhammad Haris (3)</b></font>", styles["Cell"]),
            Paragraph("<font color='white'><b>Savaiz Said Gill (3)</b></font>", styles["Cell"]),
        ],
        [
            Paragraph(
                "1. <b>Schedule runner stub</b> — due scheduled deals mark as sent at run time<br/><br/>"
                "2. <b>E2E demo pass</b> — signup → QR → claim → redeem → visit → deal<br/><br/>"
                "3. <b>README checklist</b> — Atlas, env, claim URL, redeem, Deals steps",
                styles["Cell"],
            ),
            Paragraph(
                "1. <b>Super Admin actions</b> — activate / suspend business + status badge<br/><br/>"
                "2. <b>Plans on Profile</b> — show Starter / Growth / Pro + trial badge<br/><br/>"
                "3. <b>AI polish</b> — empty states + wire suggestion into create-deal form",
                styles["Cell"],
            ),
        ],
    ],
    colWidths=[91 * mm, 91 * mm],
)
day2.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), brand_dark),
            ("BACKGROUND", (0, 1), (-1, 1), card_bg),
            ("GRID", (0, 0), (-1, -1), 0.5, line),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]
    )
)
story.append(day2)

story.append(Paragraph("5. Fair Split", styles["H1"]))
fair = Table(
    [
        [
            Paragraph("<b>Member</b>", styles["CellBold"]),
            Paragraph("<b>Day 1</b>", styles["CellBold"]),
            Paragraph("<b>Day 2</b>", styles["CellBold"]),
            Paragraph("<b>Total</b>", styles["CellBold"]),
            Paragraph("<b>Focus</b>", styles["CellBold"]),
        ],
        [
            Paragraph("Muhammad Haris", styles["Cell"]),
            Paragraph("3", styles["Cell"]),
            Paragraph("3", styles["Cell"]),
            Paragraph("<b>6</b>", styles["CellBold"]),
            Paragraph("WhatsApp, opt-out, logs, demo quality", styles["Cell"]),
        ],
        [
            Paragraph("Savaiz Said Gill", styles["Cell"]),
            Paragraph("3", styles["Cell"]),
            Paragraph("3", styles["Cell"]),
            Paragraph("<b>6</b>", styles["CellBold"]),
            Paragraph("AI Deal Maker, Super Admin, plans UI", styles["Cell"]),
        ],
    ],
    colWidths=[40 * mm, 20 * mm, 20 * mm, 18 * mm, 84 * mm],
)
fair.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), soft),
            ("GRID", (0, 0), (-1, -1), 0.5, line),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]
    )
)
story.append(fair)

story.append(Paragraph("6. Done When (end of Day 2)", styles["H1"]))
for t in [
    "Phase 1: scan → consent → coupon → redeem once; CSV works",
    "Phase 2: visit logged, segment used, deal can send/test to consented customers only",
    "Phase 3: AI suggestion shown; owner must approve before send",
    "Admin can list/suspend a business; Profile shows plan names",
]:
    story.append(Paragraph(f"☑ {t}", styles["Body"]))

story.append(Spacer(1, 8))
story.append(HRFlowable(width="100%", thickness=1, color=line, spaceAfter=4))
story.append(
    Paragraph(
        f"UPSale · Overall {OVERALL_PCT}% · Equal 2-day schedule · Muhammad Haris &amp; Savaiz Said Gill",
        styles["Foot"],
    )
)


def page_num(canvas, doc_):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(muted)
    canvas.drawCentredString(A4[0] / 2, 8 * mm, f"Page {doc_.page}")
    canvas.restoreState()


doc.build(story, onFirstPage=page_num, onLaterPages=page_num)
print(out_path)
