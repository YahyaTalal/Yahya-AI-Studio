import os
import sys
import json
import math
import subprocess
import random
import time
from moviepy import VideoFileClip, AudioFileClip, ImageClip, concatenate_videoclips, CompositeVideoClip, CompositeAudioClip
import moviepy.video.fx as fx
from PIL import Image, ImageDraw, ImageFont
import overlay_service

# Progress updater helper
def update_status(task_id, stage, progress=0, log_message=None):
    """
    Writes the task's current status and logs to a JSON file in the Projects folder.
    """
    status_path = f"Projects/status_{task_id}.json"
    os.makedirs("Projects", exist_ok=True)
    
    status = {
        "task_id": task_id,
        "stage": stage,
        "progress": progress,
        "logs": [],
        "completed": False,
        "failed": False,
        "output_video": None
    }
    
    if os.path.exists(status_path):
        try:
            with open(status_path, 'r', encoding='utf-8') as f:
                status = json.load(f)
        except Exception:
            pass
            
    status["stage"] = stage
    status["progress"] = progress
    if log_message:
        status["logs"].append(f"[{time.strftime('%H:%M:%S')}] {log_message}")
        print(f"[{task_id}][{stage}] {log_message}")
        
    with open(status_path, 'w', encoding='utf-8') as f:
        json.dump(status, f, indent=2, ensure_ascii=False)

def loop_clip_safely(clip, target_duration):
    """
    Loops a video clip safely by duplicating and concatenating to fit target_duration.
    """
    if clip.duration >= target_duration:
        return clip.subclipped(0, target_duration)
        
    repeats = int(math.ceil(target_duration / clip.duration))
    clips = [clip] * repeats
    concated = concatenate_videoclips(clips)
    return concated.subclipped(0, target_duration)

def apply_speed(clip, speed):
    """
    Safely applies speed changes using MoviePy v2 or v1 fallbacks.
    """
    if speed == 1.0 or not speed:
        return clip
    try:
        return clip.multiply_speed(speed)
    except Exception:
        try:
            return clip.fx(fx.Speedx, speed)
        except Exception:
            try:
                from moviepy.video.fx.speedx import speedx
                return clip.fx(speedx, speed)
            except Exception:
                return clip

def draw_text_to_image(text_str, font_family, font_size, text_color_hex, highlight_color_hex, align="center", style_preset="default"):
    """
    Renders text to a transparent 1920x1080 canvas using Pillow.
    No ImageMagick dependency.
    """
    canvas = Image.new("RGBA", (1920, 1080), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    
    # Map font family
    bold = style_preset in ["impact", "sliced", "highlight_box"]
    font = overlay_service.get_system_font(size=font_size or 36, bold=bold)
    
    def hex_to_rgba(hex_str, alpha=255):
        if not hex_str:
            return (255, 255, 255, alpha)
        hex_str = hex_str.lstrip('#')
        if len(hex_str) == 6:
            r, g, b = int(hex_str[0:2], 16), int(hex_str[2:4], 16), int(hex_str[4:6], 16)
            return (r, g, b, alpha)
        elif len(hex_str) == 8:
            r, g, b, a = int(hex_str[0:2], 16), int(hex_str[2:4], 16), int(hex_str[4:6], 16), int(hex_str[6:8], 16)
            return (r, g, b, a)
        return (255, 255, 255, alpha)
        
    text_color = hex_to_rgba(text_color_hex or "#ffffff")
    highlight_color = hex_to_rgba(highlight_color_hex or "#ffd21f", alpha=200)
    
    # Split text into lines wrapping at 1600px width
    words = text_str.split(' ')
    lines = []
    current_line = []
    for word in words:
        current_line.append(word)
        test_line = ' '.join(current_line)
        try:
            line_w = draw.textlength(test_line, font=font)
        except Exception:
            line_w = len(test_line) * (font_size * 0.6)
            
        if line_w > 1600:
            current_line.pop()
            lines.append(' '.join(current_line))
            current_line = [word]
    if current_line:
        lines.append(' '.join(current_line))
        
    # Vertical drawing
    y_offset = (1080 - (len(lines) * (font_size + 20))) // 2
    line_height = font_size + 20
    
    for i, line in enumerate(lines):
        try:
            w = draw.textlength(line, font=font)
        except Exception:
            w = len(line) * (font_size * 0.6)
            
        x = (1920 - w) // 2
        
        if style_preset == "highlight_box":
            draw.rectangle([x - 15, y_offset + i*line_height - 5, x + w + 15, y_offset + i*line_height + font_size + 5], fill=highlight_color)
            draw.text((x, y_offset + i*line_height), line, fill=text_color, font=font)
        elif style_preset == "impact":
            shadow_offset = 4
            draw.text((x + shadow_offset, y_offset + i*line_height + shadow_offset), line, fill=(0, 0, 0, 255), font=font)
            draw.text((x, y_offset + i*line_height), line, fill=text_color, font=font)
        elif style_preset == "sliced":
            # Stylized look: draw black outline
            for dx, dy in [(-2,-2), (-2,2), (2,-2), (2,2), (-2,0), (2,0), (0,-2), (0,2)]:
                draw.text((x + dx, y_offset + i*line_height + dy), line, fill=(0,0,0,255), font=font)
            draw.text((x, y_offset + i*line_height), line, fill=text_color, font=font)
        else:
            # Subtle drop shadow
            draw.text((x + 2, y_offset + i*line_height + 2), line, fill=(0, 0, 0, 180), font=font)
            draw.text((x, y_offset + i*line_height), line, fill=text_color, font=font)
            
    return canvas

def download_url_asset_if_needed(url, track_name):
    if not (url.startswith("http://") or url.startswith("https://")):
        return url
        
    import shutil
    import urllib.parse as up
    import urllib.request as ur
    import uuid
    
    # Map tracks/types to target folders
    video_tracks  = ["video1", "video2", "video3", "video", "avatar", "image"]
    audio_tracks  = ["audio1", "audio2", "audio3", "voiceover", "music"]
    
    parsed_url = up.urlparse(url)
    filename = os.path.basename(parsed_url.path)
    if not filename:
        filename = f"asset_{uuid.uuid4().hex[:6]}.mp4"
        
    ext = os.path.splitext(filename)[1].lower()
    filename = filename.replace(" ", "_")
    
    video_exts = {".mp4", ".mov", ".avi", ".webm", ".mkv"}
    image_exts = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}
    audio_exts = {".mp3", ".wav", ".ogg", ".aac", ".flac", ".m4a"}
    
    if track_name in video_tracks:
        if ext in image_exts:
            target_dir = "Media Library/Downloaded Images"
        else:
            target_dir = "Media Library/Downloaded Clips"
    elif track_name in audio_tracks:
        target_dir = "Media Library/Downloaded Audios"
    else:
        # Fallback by extension
        if ext in video_exts:
            target_dir = "Media Library/Downloaded Clips"
        elif ext in image_exts:
            target_dir = "Media Library/Downloaded Images"
        elif ext in audio_exts:
            target_dir = "Media Library/Downloaded Audios"
        else:
            target_dir = "Media Library/Downloaded Clips"
            
    os.makedirs(target_dir, exist_ok=True)
    local_path = os.path.join(target_dir, filename)
    
    if os.path.exists(local_path):
        return local_path
        
    # Download
    try:
        # Set a user-agent to prevent HTTP 403 Forbidden from some CDNs
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        req = ur.Request(url, headers=headers)
        with ur.urlopen(req) as response, open(local_path, 'wb') as out_file:
            shutil.copyfileobj(response, out_file)
        return local_path
    except Exception as e:
        print(f"Error downloading asset {url}: {e}")
        return url

def create_timeline_video(task_id, timeline, resolution, fps, quality):
    """
    Renders a multi-track editor timeline into a single MP4 video.
    """
    final_output = f"Exports/{task_id}.mp4"
    os.makedirs("Exports", exist_ok=True)
    os.makedirs("Projects", exist_ok=True)
    
    comp_width = resolution.get("width", 1920)
    comp_height = resolution.get("height", 1080)
    comp_fps = fps or 24
    
    video_clips = []
    audio_clips = []
    temp_files = []
    
    try:
        # Preprocess timeline to download any remote URLs
        update_status(task_id, "Downloading media", 5, "Downloading external assets to local storage...")
        for track_name, clips_list in timeline.items():
            for clip in (clips_list or []):
                path = clip.get("path")
                if path and (path.startswith("http://") or path.startswith("https://")):
                    local_path = download_url_asset_if_needed(path, track_name)
                    clip["path"] = local_path

        # Convert generic track keys into lists of clips categorized by type for MoviePy layers
        processed_timeline = {
            "audio1": [], "audio2": [], "audio3": [], "voiceover": [], "music": [],
            "video1": [], "video2": [], "video3": [], "video": [], "avatar": [], "image": [],
            "sticker": [],
            "text1": [], "text2": [], "text3": [], "text": [], "caption": []
        }
        
        video_idx = 1
        audio_idx = 1
        text_idx = 1
        
        for track_key, clips in timeline.items():
            if not clips:
                continue
            for c_data in clips:
                text_str = c_data.get("text", "")
                path = c_data.get("path")
                
                is_text = False
                is_audio = False
                is_video = False
                
                if text_str and text_str.strip():
                    is_text = True
                elif path:
                    ext = os.path.splitext(path)[1].lower()
                    if ext in ['.mp3', '.wav', '.m4a', '.ogg', '.aac']:
                        is_audio = True
                    else:
                        is_video = True
                
                if is_text:
                    target_key = f"text{min(3, text_idx)}"
                    processed_timeline[target_key].append(c_data)
                elif is_audio:
                    target_key = f"audio{min(3, audio_idx)}"
                    processed_timeline[target_key].append(c_data)
                else:
                    target_key = f"video{min(3, video_idx)}"
                    processed_timeline[target_key].append(c_data)
            
            video_idx += 1
            audio_idx += 1
            text_idx += 1
            
        timeline = processed_timeline

        update_status(task_id, "Loading assets", 10, "Processing timeline layers...")
        
        # 1. AUDIO TRACKS (voiceover, music)
        audio_tracks = ["audio1", "audio2", "audio3", "voiceover", "music"]
        for track in audio_tracks:
            clips_list = timeline.get(track, [])
            for c_data in clips_list:
                path = c_data.get("path")
                if not path or not os.path.exists(path):
                    continue
                
                start = c_data.get("start", 0.0)
                duration = c_data.get("duration", 1.0)
                source_start = c_data.get("sourceStart", 0.0)
                speed = c_data.get("speed", 1.0)
                volume = c_data.get("volume", 100)
                mute = c_data.get("mute", False)
                
                audio = AudioFileClip(path)
                
                # Slice by speed calculation
                src_duration = duration * speed
                audio = audio.subclipped(source_start, min(audio.duration, source_start + src_duration))
                audio = apply_speed(audio, speed)
                
                # Volume scaling
                vol_factor = 0.0 if mute else (volume / 100.0)
                audio = audio.with_volume_scaled(vol_factor)
                
                # Audio fade in/out
                fade_in = c_data.get("fadeIn", 0.0)
                fade_out = c_data.get("fadeOut", 0.0)
                if fade_in > 0:
                    try:
                        audio = audio.fx(fx.AudioFadein, fade_in)
                    except Exception:
                        pass
                if fade_out > 0:
                    try:
                        audio = audio.fx(fx.AudioFadeout, fade_out)
                    except Exception:
                        pass
                        
                audio = audio.with_start(start).with_duration(duration)
                audio_clips.append(audio)
                
        # 2. VIDEO TRACKS (video, avatar)
        video_tracks = ["video1", "video2", "video3", "video", "avatar", "image"]
        for track in video_tracks:
            clips_list = timeline.get(track, [])
            for c_data in clips_list:
                path = c_data.get("path")
                if not path or not os.path.exists(path):
                    continue
                
                start = c_data.get("start", 0.0)
                duration = c_data.get("duration", 1.0)
                source_start = c_data.get("sourceStart", 0.0)
                speed = c_data.get("speed", 1.0)
                volume = c_data.get("volume", 100)
                mute = c_data.get("mute", False)
                fit_mode = c_data.get("fitMode", "fill")
                x_pct = c_data.get("x", 50)
                y_pct = c_data.get("y", 50)
                scale = c_data.get("scale", 1.0)
                opacity = c_data.get("opacity", 1.0)
                filter_preset = c_data.get("filter", "none")
                border_radius = c_data.get("borderRadius", 0)
                enter_anim = c_data.get("enterAnimation")
                exit_anim = c_data.get("exitAnimation")
                
                # Check if it is actually an image dropped on this video track
                ext = os.path.splitext(path)[1].lower()
                is_image = ext in ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp']
                
                if is_image:
                    img = ImageClip(path).with_duration(duration)
                    img_w, img_h = img.size
                    if scale != 1.0:
                        img = img.resized(scale)
                        img_w, img_h = img.size
                        
                    px = (comp_width * x_pct / 100) - (img_w / 2)
                    py = (comp_height * y_pct / 100) - (img_h / 2)
                    img = img.with_position((px, py))
                    
                    if opacity != 1.0:
                        try:
                            img = img.with_opacity(opacity)
                        except Exception:
                            pass
                            
                    effects = []
                    if enter_anim == "fade":
                        effects.append(fx.FadeIn(0.4))
                    if exit_anim == "fade":
                        effects.append(fx.FadeOut(0.4))
                    if effects:
                        img = img.with_effects(effects)
                        
                    img = img.with_start(start)
                    video_clips.append(img)
                    continue

                vid = VideoFileClip(path)
                
                # Check for loop / duration match
                if duration > (vid.duration / speed):
                    vid = loop_clip_safely(vid, duration * speed)
                    
                # Subclip & Speed
                src_duration = duration * speed
                vid = vid.subclipped(source_start, min(vid.duration, source_start + src_duration))
                vid = apply_speed(vid, speed)
                
                # Mute/Volume on Video audio
                if mute:
                    vid = vid.without_audio()
                else:
                    vol_factor = volume / 100.0
                    if vol_factor != 1.0:
                        vid = vid.with_volume_scaled(vol_factor)
                        
                # 1. Apply Crop
                if c_data.get("cropEnabled", False):
                    cw, ch = vid.size
                    crop_left = c_data.get("cropLeft", 0)
                    crop_right = c_data.get("cropRight", 0)
                    crop_top = c_data.get("cropTop", 0)
                    crop_bottom = c_data.get("cropBottom", 0)
                    
                    x1 = int(cw * crop_left / 100.0)
                    y1 = int(ch * crop_top / 100.0)
                    x2 = int(cw * (100 - crop_right) / 100.0)
                    y2 = int(ch * (100 - crop_bottom) / 100.0)
                    try:
                        vid = vid.cropped(x1=x1, y1=y1, x2=x2, y2=y2)
                    except Exception:
                        try:
                            from moviepy.video.fx.crop import crop
                            vid = crop(vid, x1=x1, y1=y1, x2=x2, y2=y2)
                        except Exception as ce:
                            print(f"Failed to apply crop: {ce}")

                # 2. Apply Brightness
                brightness_val = c_data.get("brightness", 0)
                if brightness_val == 100:
                    brightness_val = 0
                brightness = max(0, brightness_val + 100)
                
                if brightness != 100:
                    factor = brightness / 100.0
                    try:
                        vid = vid.colorx(factor)
                    except Exception:
                        try:
                            from moviepy.video.fx.colorx import colorx
                            vid = colorx(vid, factor)
                        except Exception as be:
                            print(f"Failed to apply brightness colorx: {be}")

                # Sizing & Fit Mode
                w, h = vid.size
                scale_w = comp_width / w
                scale_h = comp_height / h
                
                if fit_mode == "contain":
                    fit_scale = min(scale_w, scale_h)
                    vid = vid.resized(fit_scale)
                elif fit_mode == "cover":
                    fit_scale = max(scale_w, scale_h)
                    vid = vid.resized(fit_scale)
                else:
                    vid = vid.resized((comp_width, comp_height))
                    
                # 3. Apply Padding
                padding = c_data.get("padding", 0)
                padding_color_hex = c_data.get("paddingColor", "transparent")
                if padding > 0:
                    def hex_to_rgb(hex_str):
                        if not hex_str or hex_str == 'transparent':
                            return (0, 0, 0)
                        hex_str = hex_str.lstrip('#')
                        if len(hex_str) == 6:
                            return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))
                        return (0, 0, 0)
                    rgb = hex_to_rgb(padding_color_hex)
                    try:
                        vid = vid.margin(mar=padding, color=rgb)
                    except Exception:
                        try:
                            from moviepy.video.fx.margin import margin
                            vid = margin(vid, mar=padding, color=rgb)
                        except Exception as me:
                            print(f"Failed to apply margin padding: {me}")
                    
                # Secondary scaling
                if scale != 1.0:
                    vid = vid.resized(scale)
                    
                # Positioning
                vid_w, vid_h = vid.size
                px = (comp_width * x_pct / 100) - (vid_w / 2)
                py = (comp_height * y_pct / 100) - (vid_h / 2)
                vid = vid.with_position((px, py))
                
                # Filters
                if filter_preset == "film_noir":
                    try:
                        vid = vid.with_effects([fx.BlackAndWhite()])
                    except Exception:
                        pass
                        
                # Opacity
                if opacity != 1.0:
                    try:
                        vid = vid.with_opacity(opacity)
                    except Exception:
                        pass
                        
                # Animations / Transitions
                effects = []
                if enter_anim == "fade":
                    effects.append(fx.FadeIn(0.4))
                if exit_anim == "fade":
                    effects.append(fx.FadeOut(0.4))
                    
                if effects:
                    vid = vid.with_effects(effects)
                    
                vid = vid.with_start(start).with_duration(duration)
                video_clips.append(vid)
                
        # 3. IMAGES & STICKERS TRACKS
        overlay_tracks = ["sticker"]
        for track in overlay_tracks:
            clips_list = timeline.get(track, [])
            for c_data in clips_list:
                path = c_data.get("path")
                if not path or not os.path.exists(path):
                    continue
                
                start = c_data.get("start", 0.0)
                duration = c_data.get("duration", 1.0)
                x_pct = c_data.get("x", 50)
                y_pct = c_data.get("y", 50)
                scale = c_data.get("scale", 1.0)
                opacity = c_data.get("opacity", 1.0)
                
                # Check if it is actually a video dropped on this image track
                ext = os.path.splitext(path)[1].lower()
                is_video = ext in ['.mp4', '.mov', '.avi', '.mkv', '.webm']
                
                if is_video:
                    source_start = c_data.get("sourceStart", 0.0)
                    speed = c_data.get("speed", 1.0)
                    volume = c_data.get("volume", 100)
                    mute = c_data.get("mute", False)
                    fit_mode = c_data.get("fitMode", "fill")
                    filter_preset = c_data.get("filter", "none")
                    enter_anim = c_data.get("enterAnimation")
                    exit_anim = c_data.get("exitAnimation")
                    
                    vid = VideoFileClip(path)
                    if duration > (vid.duration / speed):
                        vid = loop_clip_safely(vid, duration * speed)
                        
                    src_duration = duration * speed
                    vid = vid.subclipped(source_start, min(vid.duration, source_start + src_duration))
                    vid = apply_speed(vid, speed)
                    
                    if mute:
                        vid = vid.without_audio()
                    else:
                        vol_factor = volume / 100.0
                        if vol_factor != 1.0:
                            vid = vid.with_volume_scaled(vol_factor)
                            
                    w, h = vid.size
                    scale_w = comp_width / w
                    scale_h = comp_height / h
                    
                    if fit_mode == "contain":
                        fit_scale = min(scale_w, scale_h)
                        vid = vid.resized(fit_scale)
                    elif fit_mode == "cover":
                        fit_scale = max(scale_w, scale_h)
                        vid = vid.resized(fit_scale)
                    else:
                        vid = vid.resized((comp_width, comp_height))
                        
                    if scale != 1.0:
                        vid = vid.resized(scale)
                        
                    vid_w, vid_h = vid.size
                    px = (comp_width * x_pct / 100) - (vid_w / 2)
                    py = (comp_height * y_pct / 100) - (vid_h / 2)
                    vid = vid.with_position((px, py))
                    
                    if filter_preset == "film_noir":
                        try:
                            vid = vid.with_effects([fx.BlackAndWhite()])
                        except Exception:
                            pass
                            
                    if opacity != 1.0:
                        try:
                            vid = vid.with_opacity(opacity)
                        except Exception:
                            pass
                            
                    effects = []
                    if enter_anim == "fade":
                        effects.append(fx.FadeIn(0.4))
                    if exit_anim == "fade":
                        effects.append(fx.FadeOut(0.4))
                    if effects:
                        vid = vid.with_effects(effects)
                        
                    vid = vid.with_start(start).with_duration(duration)
                    video_clips.append(vid)
                    continue

                img = ImageClip(path).with_duration(duration)
                
                # Sizing & Scaling
                img_w, img_h = img.size
                if scale != 1.0:
                    img = img.resized(scale)
                    img_w, img_h = img.size
                    
                px = (comp_width * x_pct / 100) - (img_w / 2)
                py = (comp_height * y_pct / 100) - (img_h / 2)
                img = img.with_position((px, py))
                
                if opacity != 1.0:
                    try:
                        img = img.with_opacity(opacity)
                    except Exception:
                        pass
                        
                effects = []
                if c_data.get("enterAnimation") == "fade":
                    effects.append(fx.FadeIn(0.4))
                if c_data.get("exitAnimation") == "fade":
                    effects.append(fx.FadeOut(0.4))
                if effects:
                    img = img.with_effects(effects)
                    
                img = img.with_start(start)
                video_clips.append(img)
                
        # 4. TEXT, STICKERS & CAPTION TRACKS (rendered as transparent Pillow PNGs)
        text_tracks = ["track7", "track8", "text1", "text2", "text3", "text", "caption", "sticker"]
        for track in text_tracks:
            clips_list = timeline.get(track, [])
            for idx, c_data in enumerate(clips_list):
                text_str = c_data.get("text") or c_data.get("filename") or ""
                if not text_str.strip() and not c_data.get("svgContent"):
                    continue
                
                start = c_data.get("start", 0.0)
                duration = c_data.get("duration", 1.0)
                x_pct = c_data.get("x", 50)
                y_pct = c_data.get("y", 50)
                scale = c_data.get("scale", 1.0)
                raw_opacity = c_data.get("opacity", 100)
                opacity = (raw_opacity / 100.0) if raw_opacity > 1.0 else raw_opacity
                
                # Render sticker or text canvas
                pil_canvas = overlay_service.draw_sticker_to_image(c_data)
                
                # Save temp PNG
                temp_filename = f"Projects/temp_{task_id}_{track}_{idx}.png"
                pil_canvas.save(temp_filename, "PNG")
                temp_files.append(temp_filename)
                
                # Create ImageClip
                txt_clip = ImageClip(temp_filename).with_duration(duration)
                if scale != 1.0:
                    try:
                        txt_clip = txt_clip.resized(scale)
                    except Exception:
                        pass

                # Fit & position
                txt_w, txt_h = txt_clip.size
                px = (comp_width * x_pct / 100) - (txt_w / 2)
                py = (comp_height * y_pct / 100) - (txt_h / 2)
                txt_clip = txt_clip.with_position((px, py))
                
                if opacity != 1.0:
                    try:
                        txt_clip = txt_clip.with_opacity(opacity)
                    except Exception:
                        pass
                        
                effects = []
                if c_data.get("enterAnimation") in ["fade", "pop", "zoom"]:
                    effects.append(fx.FadeIn(0.3))
                if c_data.get("exitAnimation") in ["fade", "pop", "zoom"]:
                    effects.append(fx.FadeOut(0.3))
                if effects:
                    txt_clip = txt_clip.with_effects(effects)
                    
                txt_clip = txt_clip.with_start(start)
                video_clips.append(txt_clip)

        update_status(task_id, "Compositing tracks", 50, f"Assembled {len(video_clips)} visual clips and {len(audio_clips)} audio clips.")
        
        # 5. Composite Assembly
        if not video_clips:
            # Fallback black canvas if no video
            fallback = ImageClip(Image.new("RGBA", (comp_width, comp_height), (5, 6, 10, 255))).with_duration(1.0)
            video_clips.append(fallback)
            
        final_composition = CompositeVideoClip(video_clips, size=(comp_width, comp_height))
        
        if audio_clips:
            mixed_audio = CompositeAudioClip(audio_clips)
            final_composition = final_composition.with_audio(mixed_audio)
            
        # Determine total render duration based on timeline elements
        timeline_duration = max([c.start + c.duration for c in video_clips] + [0])
        final_composition = final_composition.with_duration(timeline_duration)
        
        # 6. Render final composite video
        update_status(task_id, "Rendering video", 70, f"Compiling timeline ({comp_width}x{comp_height}, {comp_fps}fps) to Exports...")
        
        # Optimized render options (CPU-safe, superfast preset to prevent memory leaks)
        final_composition.write_videofile(
            final_output,
            fps=comp_fps,
            codec="libx264",
            audio_codec="aac",
            preset="ultrafast",
            threads=2,
            logger=None
        )
        
        # Release memory
        try:
            final_composition.close()
            for c in video_clips:
                c.close()
            for a in audio_clips:
                a.close()
        except Exception:
            pass
            
        # Clean temp PNG files
        for temp_f in temp_files:
            if os.path.exists(temp_f):
                try:
                    os.remove(temp_f)
                except Exception:
                    pass
                    
        update_status(task_id, "Completed", 100, "Render completed successfully!")
        
        # Write completion status
        status_path = f"Projects/status_{task_id}.json"
        with open(status_path, 'r', encoding='utf-8') as f:
            status = json.load(f)
        status["completed"] = True
        status["output_video"] = f"Exports/{task_id}.mp4"
        with open(status_path, 'w', encoding='utf-8') as f:
            json.dump(status, f, indent=2, ensure_ascii=False)
            
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print(f"Error in timeline rendering: {str(e)}\n{tb}")
        update_status(task_id, "Failed", 0, f"Error: {str(e)}")
        
        # Mark as failed
        status_path = f"Projects/status_{task_id}.json"
        if os.path.exists(status_path):
            try:
                with open(status_path, 'r', encoding='utf-8') as f:
                    status = json.load(f)
                status["failed"] = True
                status["logs"].append(f"CRITICAL ERROR: {str(e)}\n{tb}")
                with open(status_path, 'w', encoding='utf-8') as f:
                    json.dump(status, f, indent=2, ensure_ascii=False)
            except Exception:
                pass
        raise e
