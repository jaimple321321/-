from __future__ import annotations

import html
import math
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont
 

ROOT = Path(__file__).resolve().parent
SOURCE_HTML = Path(r"C:\Users\1115\Downloads\Kassa's ALGS Statistics _ VK GAMING.html")
ASSET_DIR = Path(r"C:\Users\1115\Downloads\Kassa's ALGS Statistics _ VK GAMING_files")
OUTPUT = ROOT / "Kassa_ALGS_radar.png"


def clean_text(value: str) -> str:
    value = html.unescape(value)
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def stat_values(source: str, label: str) -> list[str]:
    values: list[str] = []
    label_markup = f'<div class="playersstats-group-stat-label">{label}</div>'
    start = 0
    while True:
        label_at = source.find(label_markup, start)
        if label_at < 0:
            break
        prefix = source[:label_at]
        value_start = prefix.rfind('<div class="playersstats-group-stat-value">')
        if value_start >= 0:
            value_start += len('<div class="playersstats-group-stat-value">')
            value_html = source[value_start:label_at]
            values.append(clean_text(value_html))
        start = label_at + len(label_markup)
    if not values:
        raise ValueError(f"Could not find stat label: {label}")
    return values


def stat_value(source: str, label: str, prefer_percent: bool = False) -> str:
    values = stat_values(source, label)
    if prefer_percent:
        for value in values:
            if "%" in value:
                return value
    return values[0]


def first_number(value: str) -> float:
    match = re.search(r"[-+]?\d[\d,]*(?:\.\d+)?", value)
    if not match:
        raise ValueError(f"No number found in: {value}")
    return float(match.group(0).replace(",", ""))


def first_percent(value: str) -> float:
    match = re.search(r"[-+]?\d[\d,]*(?:\.\d+)?\s*%", value)
    if not match:
        raise ValueError(f"No percent found in: {value}")
    return float(match.group(0).replace("%", "").replace(",", "").strip())


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        r"C:\Windows\Fonts\msyhbd.ttc" if bold else r"C:\Windows\Fonts\msyh.ttc",
        r"C:\Windows\Fonts\simhei.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
    ]
    for candidate in candidates:
        path = Path(candidate)
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def rounded_rect(draw: ImageDraw.ImageDraw, xy, radius: int, fill, outline=None, width: int = 1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def main() -> None:
    source = SOURCE_HTML.read_text(encoding="utf-8", errors="ignore")

    games = first_number(stat_value(source, "Games played"))
    kills = first_number(stat_value(source, "Kills"))
    assists = first_number(stat_value(source, "Assists"))
    damage = first_number(stat_value(source, "Damage dealt"))

    top5_rate = first_percent(stat_value(source, "Top 5 rate", prefer_percent=True))
    top1_rate = first_percent(stat_value(source, "Win rate", prefer_percent=True))
    fight_win_rate = first_percent(stat_value(source, "Fight win rate", prefer_percent=True))

    avg_damage = damage / games if games else 0
    avg_kills = kills / games if games else 0

    # The downloaded overview page does not expose team total kills / KP.
    # Use a visible-data proxy: direct kill+assist contribution per 3-player squad slot.
    contribution_proxy = min(100.0, ((kills + assists) / games) / 3 * 100) if games else 0

    metrics = [
        {
            "label": "前5率",
            "raw": f"{top5_rate:.1f}%",
            "score": top5_rate,
        },
        {
            "label": "前1率",
            "raw": f"{top1_rate:.1f}%",
            "score": top1_rate,
        },
        {
            "label": "3v3胜率",
            "raw": f"{fight_win_rate:.2f}%",
            "score": fight_win_rate,
        },
        {
            "label": "团队贡献率",
            "raw": f"{contribution_proxy:.1f}%*",
            "score": contribution_proxy,
        },
        {
            "label": "单场平均伤害",
            "raw": f"{avg_damage:.1f}",
            "score": min(100.0, avg_damage / 1000 * 100),
        },
        {
            "label": "单场平均击杀",
            "raw": f"{avg_kills:.2f}",
            "score": min(100.0, avg_kills / 3 * 100),
        },
    ]

    width, height = 1500, 1100
    image = Image.new("RGB", (width, height), "#090a0f")
    draw = ImageDraw.Draw(image)

    # Background glow.
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for cx, cy, color in [
        (250, 180, (239, 68, 68, 72)),
        (1240, 250, (99, 102, 241, 70)),
        (1030, 900, (20, 184, 166, 58)),
    ]:
        gd.ellipse((cx - 380, cy - 380, cx + 380, cy + 380), fill=color)
    glow = glow.filter(ImageFilter.GaussianBlur(92))
    image = Image.alpha_composite(image.convert("RGBA"), glow)
    draw = ImageDraw.Draw(image)

    title_font = load_font(56, True)
    subtitle_font = load_font(25)
    label_font = load_font(25, True)
    small_font = load_font(22)
    tiny_font = load_font(18)
    value_font = load_font(24, True)

    draw.text((90, 70), "Kassa ALGS 六维雷达图", font=title_font, fill="#f8fafc")
    draw.text(
        (92, 142),
        "VK GAMING | 数据源：下载的 Apex Legends Status 详情页 | 44 games",
        font=subtitle_font,
        fill="#aeb7c7",
    )

    logo_path = ASSET_DIR / "vkgaming.png"
    if logo_path.exists():
        logo = Image.open(logo_path).convert("RGBA")
        logo.thumbnail((116, 116))
        image.alpha_composite(logo, (width - 190, 72))

    cx, cy = 540, 560
    radius = 295
    n = len(metrics)
    start_angle = -math.pi / 2

    def point(score: float, i: int, base_radius: float = radius):
        angle = start_angle + i * 2 * math.pi / n
        r = base_radius * score / 100
        return (cx + math.cos(angle) * r, cy + math.sin(angle) * r)

    grid_color = "#263142"
    axis_color = "#3b4558"
    for level in range(1, 6):
        level_score = level * 20
        pts = [point(level_score, i) for i in range(n)]
        draw.line(pts + [pts[0]], fill=grid_color, width=2)
        draw.text((cx + 8, cy - radius * level / 5 - 12), f"{level_score}", font=tiny_font, fill="#657084")

    for i, metric in enumerate(metrics):
        end = point(100, i)
        draw.line((cx, cy, *end), fill=axis_color, width=2)

        label_pt = point(116, i)
        lx, ly = label_pt
        label = metric["label"]
        raw = metric["raw"]
        bbox = draw.textbbox((0, 0), label, font=label_font)
        raw_bbox = draw.textbbox((0, 0), raw, font=small_font)
        text_w = max(bbox[2] - bbox[0], raw_bbox[2] - raw_bbox[0])
        if lx < cx - 20:
            tx = lx - text_w
        elif lx > cx + 20:
            tx = lx
        else:
            tx = lx - text_w / 2
        draw.text((tx, ly - 23), label, font=label_font, fill="#f8fafc")
        draw.text((tx, ly + 8), raw, font=small_font, fill="#95f2d9")

    data_pts = [point(metric["score"], i) for i, metric in enumerate(metrics)]
    shadow_pts = [(x + 5, y + 10) for x, y in data_pts]
    draw.polygon(shadow_pts, fill=(0, 0, 0, 90))
    draw.polygon(data_pts, fill=(239, 68, 68, 92), outline="#f43f5e")
    draw.line(data_pts + [data_pts[0]], fill="#f43f5e", width=5, joint="curve")

    for x, y in data_pts:
        draw.ellipse((x - 8, y - 8, x + 8, y + 8), fill="#f8fafc", outline="#f43f5e", width=4)

    # Right-side compact source/value panel.
    panel_x, panel_y, panel_w, panel_h = 1030, 300, 390, 590
    rounded_rect(draw, (panel_x, panel_y, panel_x + panel_w, panel_y + panel_h), 18, (14, 18, 28, 214), "#273142", 2)
    draw.text((panel_x + 28, panel_y + 26), "原始数值", font=label_font, fill="#f8fafc")

    rows = [
        ("Games", f"{games:.0f}"),
        ("Kills / Assists", f"{kills:.0f} / {assists:.0f}"),
        ("Damage dealt", f"{damage:,.0f}"),
        ("Avg damage", f"{avg_damage:.1f}"),
        ("Avg kills", f"{avg_kills:.2f}"),
        ("Fight win rate", f"{fight_win_rate:.2f}%"),
    ]
    y = panel_y + 86
    for name, value in rows:
        draw.text((panel_x + 28, y), name, font=small_font, fill="#9aa8bd")
        value_bbox = draw.textbbox((0, 0), value, font=value_font)
        draw.text((panel_x + panel_w - 28 - (value_bbox[2] - value_bbox[0]), y - 2), value, font=value_font, fill="#ffffff")
        y += 58

    draw.line((panel_x + 28, y + 8, panel_x + panel_w - 28, y + 8), fill="#273142", width=2)
    note = "*团队贡献率为代理值：(击杀+助攻)/场次/3，因下载页未暴露团队总击杀/KP。"
    wrapped = ["*团队贡献率为代理值：", "(击杀+助攻)/场次/3；", "下载页未暴露团队总击杀/KP。"]
    y += 35
    for line in wrapped:
        draw.text((panel_x + 28, y), line, font=tiny_font, fill="#768397")
        y += 28

    footer = "归一化：百分比直接按 0-100；平均伤害以 1000/场为满格；平均击杀以 3/场为满格。"
    draw.text((90, height - 75), footer, font=tiny_font, fill="#7d8799")

    image.convert("RGB").save(OUTPUT, "PNG", optimize=True)
    print(OUTPUT)


if __name__ == "__main__":
    main()
