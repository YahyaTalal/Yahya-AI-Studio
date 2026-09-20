import os
from PIL import Image, ImageDraw, ImageFont

def get_system_font(size=32, bold=False):
    """
    Returns a modern TrueType font from Windows system folder.
    Falls back to default if not found.
    """
    font_name = "segoeuib.ttf" if bold else "segoeui.ttf"
    fallback_name = "arialbd.ttf" if bold else "arial.ttf"
    
    paths = [
        f"C:\\Windows\\Fonts\\{font_name}",
        f"C:\\Windows\\Fonts\\{fallback_name}",
        f"C:\\Windows\\Fonts\\tahoma.ttf",
        "arial.ttf"
    ]
    
    for path in paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()

def create_transparent_canvas(width=1920, height=1080):
    """
    Creates an empty transparent image canvas.
    """
    return Image.new("RGBA", (width, height), (0, 0, 0, 0))

def draw_breaking_news(headline_text, category_text="BREAKING NEWS", width=1920, height=1080):
    """
    Generates a full 1080p overlay image containing a breaking news banner at the bottom.
    """
    img = create_transparent_canvas(width, height)
    draw = ImageDraw.Draw(img)
    
    # Coordinates for news ticker bar
    # Ticker lies near the bottom: y from 820 to 970
    banner_y1 = 820
    banner_y2 = 960
    
    # 1. Draw glowing accent line at the top of the banner
    # Yellow accent line (#FFD21F)
    draw.rectangle([0, banner_y1 - 6, width, banner_y1], fill=(255, 210, 31, 255))
    
    # 2. Draw main ticker background (Deep dark semi-transparent blue/black #090B12)
    draw.rectangle([0, banner_y1, width, banner_y2], fill=(9, 11, 18, 230))
    
    # 3. Draw Category Badge ("BREAKING NEWS" or similar) on the left
    # Red accent fill (#FF2458)
    badge_x1 = 50
    badge_x2 = 420
    badge_y1 = banner_y1 + 20
    badge_y2 = banner_y2 - 20
    
    # Rounded badge background
    draw.rounded_rectangle([badge_x1, badge_y1, badge_x2, badge_y2], radius=8, fill=(255, 36, 88, 255))
    
    # Draw Category text inside the badge
    font_badge = get_system_font(size=36, bold=True)
    badge_text = category_text.upper()
    
    # Center text in badge
    try:
        text_w = draw.textlength(badge_text, font=font_badge)
        text_h = 36 # approx height
        bx = badge_x1 + (badge_x2 - badge_x1 - text_w) // 2
        by = badge_y1 + (badge_y2 - badge_y1 - text_h) // 2 - 2
    except Exception:
        bx = badge_x1 + 20
        by = badge_y1 + 15
        
    draw.text((bx, by), badge_text, fill=(245, 245, 245, 255), font=font_badge)
    
    # 4. Draw Headline text
    font_headline = get_system_font(size=44, bold=True)
    headline_x = badge_x2 + 40
    headline_y = banner_y1 + 32
    
    # Draw main headline text
    draw.text((headline_x, headline_y), headline_text, fill=(245, 245, 245, 255), font=font_headline)
    
    # Add a gold highlights shadow/offset to the headline text
    draw.text((headline_x + 1, headline_y + 1), headline_text, fill=(255, 210, 31, 100), font=font_headline)
    
    return img

def draw_lower_third(name_text, title_text=None, width=1920, height=1080):
    """
    Generates a full 1080p lower-third overlay in the bottom left.
    """
    img = create_transparent_canvas(width, height)
    draw = ImageDraw.Draw(img)
    
    # Coordinates in bottom left: x from 80 to 600, y from 850 to 970
    x1, y1 = 80, 840
    x2, y2 = 680, 960
    
    # Glassmorphism container
    draw.rounded_rectangle([x1, y1, x2, y2], radius=15, fill=(16, 16, 24, 210))
    # Border in gold accent (#FFD21F)
    draw.rounded_rectangle([x1, y1, x2, y2], radius=15, outline=(255, 210, 31, 180), width=3)
    
    # Accent color block on left border
    draw.rounded_rectangle([x1 + 3, y1 + 3, x1 + 15, y2 - 3], radius=6, fill=(255, 210, 31, 255))
    
    # Font settings
    font_name = get_system_font(size=36, bold=True)
    font_title = get_system_font(size=26, bold=False)
    
    draw.text((x1 + 35, y1 + 18), name_text, fill=(245, 245, 245, 255), font=font_name)
    
    if title_text:
        draw.text((x1 + 35, y1 + 64), title_text, fill=(138, 143, 152, 255), font=font_title)
        
    return img

def draw_health_tip_card(title, points, width=1920, height=1080):
    """
    Generates a card overlay in the right-center of the screen.
    Points is a list of strings representing bullet points.
    """
    img = create_transparent_canvas(width, height)
    draw = ImageDraw.Draw(img)
    
    # Card location on the right side: x from 1200 to 1820, y from 180 to 780
    x1, y1 = 1200, 180
    x2, y2 = 1820, 780
    
    # Glassmorphism backing
    draw.rounded_rectangle([x1, y1, x2, y2], radius=24, fill=(9, 11, 18, 220))
    
    # Pinkish-Red Glow Border (#FF2458)
    draw.rounded_rectangle([x1, y1, x2, y2], radius=24, outline=(255, 36, 88, 160), width=4)
    
    # Draw header bar in card
    header_h = 80
    # Header background block
    draw.rounded_rectangle([x1 + 4, y1 + 4, x2 - 4, y1 + header_h], radius=20, fill=(255, 36, 88, 40))
    
    # Card Title
    font_title = get_system_font(size=38, bold=True)
    title_text = title.upper()
    try:
        title_w = draw.textlength(title_text, font=font_title)
        tx = x1 + (x2 - x1 - title_w) // 2
        ty = y1 + (header_h - 38) // 2 - 2
    except Exception:
        tx = x1 + 30
        ty = y1 + 20
        
    draw.text((tx, ty), title_text, fill=(255, 210, 31, 255), font=font_title) # Yellow title text
    
    # Draw Bullet Points
    font_point = get_system_font(size=28, bold=False)
    font_bullet = get_system_font(size=32, bold=True)
    
    start_y = y1 + header_h + 40
    line_spacing = 55
    
    for i, pt in enumerate(points):
        py = start_y + i * (line_spacing * 2.2) # space between paragraphs
        if py > y2 - 40:
            break
            
        # Draw bullet symbol (Yellow circle or dot)
        bullet_symbol = "•"
        draw.text((x1 + 40, py), bullet_symbol, fill=(255, 210, 31, 255), font=font_bullet)
        
        # Word wrapping for point text
        words = pt.split(' ')
        lines = []
        current_line = []
        for word in words:
            current_line.append(word)
            test_line = ' '.join(current_line)
            try:
                line_w = draw.textlength(test_line, font=font_point)
            except Exception:
                line_w = len(test_line) * 15 # estimate
            if line_w > (x2 - x1 - 120): # padding
                current_line.pop()
                lines.append(' '.join(current_line))
                current_line = [word]
        if current_line:
            lines.append(' '.join(current_line))
            
        # Draw each line of the wrapped point
        for j, line in enumerate(lines):
            draw.text((x1 + 75, py + j * 36), line, fill=(245, 245, 245, 255), font=font_point)
            
    return img

def draw_fact_label(fact_text, label_title="HEALTH FACT", width=1920, height=1080):
    """
    Generates a fact checking badge in the top right corner.
    """
    img = create_transparent_canvas(width, height)
    draw = ImageDraw.Draw(img)
    
    # Coordinates in top right: x from 1350 to 1840, y from 60 to 160
    x1, y1 = 1350, 60
    x2, y2 = 1840, 160
    
    draw.rounded_rectangle([x1, y1, x2, y2], radius=12, fill=(16, 16, 24, 220))
    # Pink outline
    draw.rounded_rectangle([x1, y1, x2, y2], radius=12, outline=(255, 36, 88, 200), width=2)
    
    # Draw "HEALTH FACT" tag
    font_tag = get_system_font(size=20, bold=True)
    draw.text((x1 + 25, y1 + 12), label_title.upper(), fill=(255, 210, 31, 255), font=font_tag)
    
    # Draw fact text
    font_text = get_system_font(size=24, bold=False)
    draw.text((x1 + 25, y1 + 45), fact_text, fill=(245, 245, 245, 255), font=font_text)
    
    return img

def save_overlay(image, output_path):
    """
    Saves an overlay image. Creates directories if necessary.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    image.save(output_path, "PNG")
    print(f"Overlay image saved to {output_path}")

def hex_to_rgba(hex_str, default_alpha=255):
    if not hex_str or hex_str == 'transparent':
        return (0, 0, 0, 0)
    hex_str = hex_str.lstrip('#')
    if len(hex_str) == 3:
        hex_str = ''.join([c*2 for c in hex_str])
    if len(hex_str) == 6:
        r, g, b = tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))
        return (r, g, b, default_alpha)
    if len(hex_str) == 8:
        r, g, b, a = tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4, 6))
        return (r, g, b, a)
    return (255, 255, 255, default_alpha)

def draw_sticker_to_image(c_data):
    """
    Renders sticker clip to a transparent PNG PIL Image.
    Supports text, badge, colors, padding, and border radius.
    """
    text_str = c_data.get("text") or c_data.get("filename") or "Sticker"
    color_hex = c_data.get("color", "#ffffff")
    bg_hex = c_data.get("textBgColor")
    bg_enabled = c_data.get("bgEnabled", True) if bg_hex else False
    border_radius = int(c_data.get("textBorderRadius") or c_data.get("borderRadius") or 8)
    padding = int(c_data.get("padding") or 10)
    font_size = int(c_data.get("fontSize") or 36)

    font = get_system_font(size=font_size, bold=True)

    dummy_img = Image.new("RGBA", (1, 1), (0, 0, 0, 0))
    draw_dummy = ImageDraw.Draw(dummy_img)
    try:
        bbox = draw_dummy.textbbox((0, 0), text_str, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
    except Exception:
        text_w = font_size * len(text_str) * 0.6
        text_h = font_size * 1.2

    pad_x = max(8, padding * 2)
    pad_y = max(6, padding)
    img_w = int(text_w + pad_x * 2)
    img_h = int(text_h + pad_y * 2)

    img = Image.new("RGBA", (img_w, img_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    if bg_enabled and bg_hex and bg_hex != 'transparent':
        bg_rgba = hex_to_rgba(bg_hex)
        draw.rounded_rectangle([0, 0, img_w - 1, img_h - 1], radius=border_radius, fill=bg_rgba)

    text_rgba = hex_to_rgba(color_hex)
    text_x = (img_w - text_w) // 2
    text_y = (img_h - text_h) // 2 - 2
    draw.text((text_x, text_y), text_str, fill=text_rgba, font=font)

    if c_data.get("flipH"):
        img = img.transpose(Image.FLIP_LEFT_RIGHT)
    if c_data.get("flipV"):
        img = img.transpose(Image.FLIP_TOP_BOTTOM)

    rotation = c_data.get("rotation", 0)
    if rotation:
        img = img.rotate(-rotation, expand=True)

    return img

def draw_text_to_image(text_str, font_family="Inter", font_size=36, text_color_hex="#ffffff", highlight_color_hex="#ffd21f", style_preset="default"):
    """
    Renders text to a transparent PNG PIL Image with style presets.
    """
    return draw_sticker_to_image({
        "text": text_str,
        "color": text_color_hex,
        "textBgColor": highlight_color_hex if style_preset == "highlight_box" else None,
        "fontSize": font_size
    })

