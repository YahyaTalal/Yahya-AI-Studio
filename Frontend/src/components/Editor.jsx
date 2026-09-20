import React, { useState, useEffect, useRef } from 'react';
import PropertiesPanel from './PropertiesPanel';
import { STICKER_CATEGORIES, STICKERS_DATA } from './stickersData';
import {
  APIKeysPanel,
  ScriptPanel,
  VoiceOverPanel,
  TranscribePanel,
  AIChatPanel,
  ArrangerPanel,
  AssetsPanel,
  SFXPanel,
  VideoPanel,
  ImagesPanel,
  AudioPanel,
} from './SidePanels';

const YOUTUBE_SVG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#FF0000"/>
    <path d="M10 8.5L15.5 12L10 15.5V8.5Z" fill="white"/>
  </svg>
);

const YOUTUBE_SHORTS_SVG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#FF0000"/>
    <path d="M13.5 3.5L6.5 13.5H12.5L11.5 20.5L18.5 10.5H12.5L13.5 3.5Z" fill="white"/>
  </svg>
);

const TIKTOK_SVG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#000000"/>
    <path d="M15 6C15.6 7.2 16.7 8.1 18 8.3V10.8C16.8 10.7 15.7 10.2 14.8 9.4V14.5C14.8 17.5 12.3 20 9.3 20C6.3 20 3.8 17.5 3.8 14.5C3.8 11.5 6.3 9 9.3 9C9.8 9 10.3 9.1 10.8 9.2V11.8C10.3 11.6 9.8 11.5 9.3 11.5C7.6 11.5 6.3 12.8 6.3 14.5C6.3 16.2 7.6 17.5 9.3 17.5C11 17.5 12.3 16.2 12.3 14.5V4H15V6Z" fill="#25F4EE"/>
  </svg>
);

const INSTAGRAM_SVG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="igGrad" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f09433"/>
        <stop offset="25%" stopColor="#e6683c"/>
        <stop offset="50%" stopColor="#dc2743"/>
        <stop offset="75%" stopColor="#cc2366"/>
        <stop offset="100%" stopColor="#bc1888"/>
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#igGrad)"/>
    <path d="M12 7.5A4.5 4.5 0 1 0 12 16.5A4.5 4.5 0 1 0 12 7.5Z" stroke="white" strokeWidth="1.8" fill="none"/>
    <circle cx="17" cy="7" r="1.1" fill="white"/>
  </svg>
);

const LINKEDIN_SVG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#0A66C2"/>
    <path d="M6.5 9.5H9V18H6.5V9.5ZM7.75 6C6.9 6 6.2 6.7 6.2 7.55C6.2 8.4 6.9 9.1 7.75 9.1C8.6 9.1 9.3 8.4 9.3 7.55C9.3 6.7 8.6 6 7.75 6ZM10.5 9.5H13V10.7H13.05C13.4 10 14.3 9.3 15.6 9.3C18.3 9.3 18.8 11.1 18.8 13.4V18H16.3V14.1C16.3 13.2 16.3 11.9 15.1 11.9C13.8 11.9 13.6 12.9 13.6 14V18H11.1V9.5H10.5Z" fill="white"/>
  </svg>
);

const X_TWITTER_SVG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#000000"/>
    <path d="M17.2 4H19.5L14.5 9.7L20.4 17.5H15.7L12 12.7L7.8 17.5H5.5L10.9 11.3L5.2 4H10.1L13.4 8.4L17.2 4ZM16.4 16.1H17.7L9.3 5.3H7.9L16.4 16.1Z" fill="white"/>
  </svg>
);

const FACEBOOK_SVG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#1877F2"/>
    <path d="M15 8.5H13.2C12.5 8.5 12.2 8.8 12.2 9.5V11.2H15L14.6 14H12.2V21H9.2V14H7V11.2H9.2V9.1C9.2 6.9 10.5 5.7 12.5 5.7C13.4 5.7 14.3 5.8 15 5.9V8.5Z" fill="white"/>
  </svg>
);

const SNAPCHAT_SVG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#FFFC00"/>
    <path d="M12 5C9.8 5 8 6.8 8 9C8 9.3 8 9.7 8.1 10C7.6 10.1 6.8 10.5 6.8 11.2C6.8 11.7 7.2 12.1 7.7 12.2C7.6 12.5 7.4 13.1 7.2 13.4C6.6 13.4 6 13.7 6 14.2C6 14.7 6.8 15 7.8 15C8.8 15 9.5 14.7 10 14.3C10.6 14.7 11.3 14.9 12 14.9C12.7 14.9 13.4 14.7 14 14.3C14.5 14.7 15.2 15 16.2 15C17.2 15 18 14.7 18 14.2C18 13.7 17.4 13.4 16.8 13.4C16.6 13.1 16.4 12.5 16.3 12.2C16.8 12.1 17.2 11.7 17.2 11.2C17.2 10.5 16.4 10.1 15.9 10C16 9.7 16 9.3 16 9C16 6.8 14.2 5 12 5Z" fill="#111111"/>
  </svg>
);

const PORTRAIT_SVG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="6" y="3" width="12" height="18" rx="3" />
    <line x1="10" y1="18" x2="14" y2="18" />
  </svg>
);

const LANDSCAPE_SVG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="6" width="18" height="12" rx="3" />
    <line x1="10" y1="21" x2="14" y2="21" />
  </svg>
);

const SQUARE_SVG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="4" width="16" height="16" rx="3" />
  </svg>
);

const ASPECT_PRESETS = [
  // Social Presets
  { id: 'youtube', name: 'YouTube', ratio: '16:9', val: 16/9, icon: YOUTUBE_SVG, category: 'Social' },
  { id: 'shorts', name: 'YouTube Short', ratio: '9:16', val: 9/16, icon: YOUTUBE_SHORTS_SVG, category: 'Social' },
  { id: 'tiktok', name: 'TikTok', ratio: '9:16', val: 9/16, icon: TIKTOK_SVG, category: 'Social' },
  { id: 'insta_reel', name: 'Instagram Reel', ratio: '9:16', val: 9/16, icon: INSTAGRAM_SVG, category: 'Social' },
  { id: 'insta_wide', name: 'Instagram Ultra Wide', ratio: '32:9', val: 32/9, icon: INSTAGRAM_SVG, category: 'Social' },
  { id: 'insta_story', name: 'Instagram Story', ratio: '9:16', val: 9/16, icon: INSTAGRAM_SVG, category: 'Social' },
  { id: 'insta_post', name: 'Instagram Post', ratio: '1:1', val: 1, icon: INSTAGRAM_SVG, category: 'Social' },
  { id: 'linkedin', name: 'LinkedIn', ratio: '1:1', val: 1, icon: LINKEDIN_SVG, category: 'Social' },
  { id: 'x_post', name: 'X (Twitter)', ratio: '1:1', val: 1, icon: X_TWITTER_SVG, category: 'Social' },
  { id: 'x_port', name: 'X (Twitter)', ratio: '3:4', val: 3/4, icon: X_TWITTER_SVG, category: 'Social' },
  { id: 'fb_vid', name: 'Facebook Video', ratio: '9:16', val: 9/16, icon: FACEBOOK_SVG, category: 'Social' },
  { id: 'fb_story', name: 'Facebook Story', ratio: '9:16', val: 9/16, icon: FACEBOOK_SVG, category: 'Social' },
  { id: 'fb_post', name: 'Facebook Post', ratio: '1:1', val: 1, icon: FACEBOOK_SVG, category: 'Social' },
  { id: 'snapchat', name: 'Snapchat', ratio: '9:16', val: 9/16, icon: SNAPCHAT_SVG, category: 'Social' },
  // Custom Presets
  { id: 'tall_portrait', name: 'Tall Portrait', ratio: '9:16', val: 9/16, icon: PORTRAIT_SVG, category: 'Custom' },
  { id: 'portrait', name: 'Portrait', ratio: '4:5', val: 4/5, icon: PORTRAIT_SVG, category: 'Custom' },
  { id: 'square', name: 'Square', ratio: '1:1', val: 1, icon: SQUARE_SVG, category: 'Custom' },
  { id: 'boxy_landscape', name: 'Boxy Landscape', ratio: '4:3', val: 4/3, icon: LANDSCAPE_SVG, category: 'Custom' },
  { id: 'landscape', name: 'Landscape', ratio: '5:4', val: 5/4, icon: LANDSCAPE_SVG, category: 'Custom' },
  { id: 'wide_landscape', name: 'Wide Landscape', ratio: '16:9', val: 16/9, icon: LANDSCAPE_SVG, category: 'Custom' },
];
const TRACK_LABEL_WIDTH = 60;

const formatRulerTime = (sec) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const formatRulerLabel = (sec) => {
  if (sec < 60) return `${Math.round(sec)}`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  if (s === 0) return `${m}m`;
  const sStr = s < 10 ? `0${s}` : `${s}`;
  return `${m}:${sStr}`;
};

const getPreviewTextColor = (style) => {
  const colorHex = (style.color || '#ffffff').toLowerCase();
  const isLightColor = colorHex === '#ffffff' || colorHex === '#cccccc' || colorHex === '#e2e8f0' || colorHex === '#f1f5f9';
  
  const hasDarkOutline = style.outlineEnabled && style.outlineColor && 
                         !['#ffffff', '#fff', '#cccccc', '#e2e8f0'].includes(style.outlineColor.toLowerCase());
                         
  const hasDarkBackground = style.bgEnabled && style.textBgColor && 
                            !style.textBgColor.includes('255,255,255') && 
                            style.textBgColor !== '#ffffff' && 
                            style.textBgColor !== 'rgba(255,255,255,0.08)' &&
                            style.textBgColor !== 'rgba(255,255,255,0.06)';
                            
  if (isLightColor && !hasDarkOutline && !hasDarkBackground) {
    return '#111111';
  }
  return style.color || '#ffffff';
};

const getPreviewOutlineColor = (style) => {
  if (style.outlineEnabled && style.outlineColor) {
    const oHex = style.outlineColor.toLowerCase();
    if (oHex === '#ffffff' || oHex === '#fff' || oHex === '#cccccc' || oHex === '#e2e8f0') {
      return '#111111';
    }
    return style.outlineColor;
  }
  return 'none';
};

const getPreviewBgColor = (style) => {
  if (style.bgEnabled) {
    const bgColor = style.textBgColor || style.highlightColor || 'rgba(0,0,0,0.08)';
    if (bgColor.includes('255,255,255') || bgColor === '#ffffff' || bgColor === '#e2e8f0') {
      return 'rgba(0,0,0,0.06)';
    }
    return bgColor;
  }
  return 'transparent';
};

const TEXT_PRESETS_LIBRARY = [
  // === Original 28 Presets ===
  { 
    title: 'Modern Title', 
    preset: 'o_modern_title', 
    sub: 'Sleek Sans-Serif Header', 
    color: '#ffffff', 
    previewText: 'Modern',
    fontFamily: 'Inter',
    fontWeight: 'Black',
    fontSize: 36,
    customClass: 'preset-modern_title'
  },
  { 
    title: 'Impact Statement', 
    preset: 'o_impact_statement', 
    sub: 'Commanding slanted headline', 
    color: '#ffffff', 
    previewText: 'IMPACT',
    fontFamily: 'Anton',
    fontWeight: 'Bold',
    fontSize: 38,
    italic: true,
    outlineEnabled: true,
    outlineColor: '#000000',
    outlineWidth: 3,
    shadowEnabled: true,
    shadowColor: '#000000',
    shadowX: 3,
    shadowY: 3,
    shadowBlur: 0,
    customClass: 'preset-make_an_impact'
  },
  { 
    title: 'Highlighted Text', 
    preset: 'o_highlighted_text', 
    sub: 'Poppins Highlight Box', 
    color: '#ffffff', 
    previewText: 'Highlight',
    fontFamily: 'Poppins',
    fontWeight: 'ExtraBold',
    fontSize: 28,
    bgEnabled: true,
    textBgColor: '#0084ff',
    padding: 10,
    textBorderRadius: 8,
    customClass: 'preset-highlighted_text'
  },
  { 
    title: 'Ultra Minimal', 
    preset: 'o_ultra_minimal', 
    sub: 'Clean spacing design', 
    color: '#cccccc', 
    previewText: 'MINIMAL',
    fontFamily: 'Inter',
    fontWeight: 'Medium',
    fontSize: 24,
    letterSpacing: 6,
    customClass: 'preset-ultra_minimal'
  },
  { 
    title: 'Minimal Box', 
    preset: 'o_minimal_box', 
    sub: 'Inter clean outline box', 
    color: '#ffffff', 
    previewText: 'Simple Box',
    fontFamily: 'Inter',
    fontWeight: 'SemiBold',
    fontSize: 24,
    bgEnabled: true,
    textBgColor: 'rgba(255,255,255,0.06)',
    outlineEnabled: true,
    outlineColor: '#ffffff',
    outlineWidth: 1.5,
    padding: 8,
    textBorderRadius: 4,
    customClass: 'preset-minimal_box'
  },
  { 
    title: 'Clean Subtitle', 
    preset: 'o_clean_subtitle', 
    sub: 'Professional subtitle bar', 
    color: '#ffffff', 
    previewText: 'Clean Sub',
    fontFamily: 'DM Sans',
    fontWeight: 'Bold',
    fontSize: 24,
    bgEnabled: true,
    textBgColor: 'rgba(0,0,0,0.65)',
    padding: 8,
    textBorderRadius: 6,
    customClass: 'preset-clean_subtitle'
  },
  { 
    title: 'Dynamic Subtitle', 
    preset: 'o_dynamic_subtitle', 
    sub: 'Vibrant pop captions', 
    color: '#facc15',
    previewText: 'DYNAMIC',
    fontFamily: 'Manrope',
    fontWeight: 'Bold',
    fontSize: 26,
    outlineEnabled: true,
    outlineColor: '#000000',
    outlineWidth: 2,
    shadowEnabled: true,
    shadowColor: '#000000',
    shadowX: 2,
    shadowY: 2,
    shadowBlur: 0,
    customClass: 'preset-dynamic_subtitle'
  },
  { 
    title: 'Documentary Title', 
    preset: 'o_documentary_title', 
    sub: 'Tall cinematic bold', 
    color: '#ffffff', 
    previewText: 'DOCUMENTARY',
    fontFamily: 'Bebas Neue',
    fontWeight: 'Regular',
    fontSize: 40,
    letterSpacing: 2,
    shadowEnabled: true,
    shadowColor: 'rgba(0,0,0,0.8)',
    shadowX: 3,
    shadowY: 3,
    shadowBlur: 4,
    customClass: 'preset-documentary_title'
  },
  { 
    title: 'Cinematic Title', 
    preset: 'o_cinematic_title', 
    sub: 'Wide modern block style', 
    color: '#ffffff', 
    previewText: 'CINEMATIC',
    fontFamily: 'League Spartan',
    fontWeight: 'Bold',
    fontSize: 34,
    letterSpacing: 4,
    customClass: 'preset-cinematic_title'
  },
  { 
    title: 'Movie Trailer', 
    preset: 'o_movie_trailer', 
    sub: 'Solid bold condensed', 
    color: '#ffffff', 
    previewText: 'TRAILER',
    fontFamily: 'Archivo Black',
    fontWeight: 'Bold',
    fontSize: 36,
    shadowEnabled: true,
    shadowColor: '#1e293b',
    shadowX: 4,
    shadowY: 4,
    shadowBlur: 0,
    customClass: 'preset-movie_trailer'
  },
  { 
    title: 'Breaking News', 
    preset: 'o_breaking_news', 
    sub: 'Red alert bulletin style', 
    color: '#ffffff', 
    previewText: 'BREAKING',
    fontFamily: 'Oswald',
    fontWeight: 'Bold',
    fontSize: 26,
    bgEnabled: true,
    textBgColor: '#ef4444',
    padding: 10,
    textBorderRadius: 0,
    customClass: 'preset-breaking_news'
  },
  { 
    title: 'Lower Third', 
    preset: 'o_lower_third', 
    sub: 'Clean descriptor tag', 
    color: '#ffffff', 
    previewText: 'John Doe',
    fontFamily: 'Inter',
    fontWeight: 'SemiBold',
    fontSize: 22,
    bgEnabled: true,
    textBgColor: 'rgba(255,255,255,0.08)',
    padding: 6,
    textBorderRadius: 4,
    customClass: 'preset-lower_third'
  },
  { 
    title: 'Podcast Title', 
    preset: 'o_podcast_title', 
    sub: 'Creative interview label', 
    color: '#ff2458', 
    previewText: 'PODCAST',
    fontFamily: 'Poppins',
    fontWeight: 'Bold',
    fontSize: 28,
    shadowEnabled: true,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowX: 2,
    shadowY: 2,
    shadowBlur: 4,
    customClass: 'preset-podcast_title'
  },
  { 
    title: 'Speaker Name', 
    preset: 'o_speaker_name', 
    sub: 'Geometric name tag', 
    color: '#ffffff', 
    previewText: 'SPEAKER',
    fontFamily: 'Montserrat',
    fontWeight: 'SemiBold',
    fontSize: 24,
    bgEnabled: true,
    textBgColor: '#0084ff',
    padding: 8,
    textBorderRadius: 30,
    customClass: 'preset-speaker_name'
  },
  { 
    title: 'Quote Highlight', 
    preset: 'o_quote_highlight', 
    sub: 'Elegant serif citation', 
    color: '#f59e0b', 
    previewText: '"Classic"',
    fontFamily: 'Playfair Display',
    fontWeight: 'Bold',
    fontSize: 32,
    italic: true,
    customClass: 'preset-quote_highlight'
  },
  { 
    title: 'MrBeast Style', 
    preset: 'o_mrbeast_style', 
    sub: 'Viral beast subtitles', 
    color: '#facc15',
    previewText: 'BEAST',
    fontFamily: 'Anton',
    fontWeight: 'Bold',
    fontSize: 36,
    outlineEnabled: true,
    outlineColor: '#000000',
    outlineWidth: 4,
    shadowEnabled: true,
    shadowColor: '#000000',
    shadowX: 4,
    shadowY: 4,
    shadowBlur: 0,
    customClass: 'preset-mrbeast_style'
  },
  { 
    title: 'Instagram Reel', 
    preset: 'o_instagram_reel', 
    sub: 'Pop style subtitle', 
    color: '#ffffff', 
    previewText: 'Insta',
    fontFamily: 'Montserrat',
    fontWeight: 'Bold',
    fontSize: 28,
    outlineEnabled: true,
    outlineColor: '#000000',
    outlineWidth: 2,
    customClass: 'preset-instagram_reel'
  },
  { 
    title: 'YouTube Thumbnail', 
    preset: 'o_youtube_thumbnail', 
    sub: 'Huge visual text hook', 
    color: '#ffffff', 
    previewText: 'HOOK',
    fontFamily: 'Anton',
    fontWeight: 'Bold',
    fontSize: 42,
    outlineEnabled: true,
    outlineColor: '#000000',
    outlineWidth: 4,
    shadowEnabled: true,
    shadowColor: '#ff0000',
    shadowX: 4,
    shadowY: 4,
    shadowBlur: 0,
    customClass: 'preset-youtube_thumbnail'
  },
  { 
    title: 'Viral Hook', 
    preset: 'o_viral_hook', 
    sub: 'Bebas condensed impact', 
    color: '#ffd21f', 
    previewText: 'VIRAL',
    fontFamily: 'Bebas Neue',
    fontWeight: 'Regular',
    fontSize: 38,
    outlineEnabled: true,
    outlineColor: '#000000',
    outlineWidth: 3,
    customClass: 'preset-viral_hook'
  },
  { 
    title: 'Bold & Commanding', 
    preset: 'o_bold_commanding', 
    sub: 'Blocky solid label', 
    color: '#ffffff', 
    previewText: 'COMMAND',
    fontFamily: 'Archivo Black',
    fontWeight: 'Bold',
    fontSize: 32,
    outlineEnabled: true,
    outlineColor: '#000000',
    outlineWidth: 3,
    customClass: 'preset-bold_commanding'
  },
  { 
    title: 'Luxury Gold', 
    preset: 'o_luxury_gold', 
    sub: 'Luxury editorial serif', 
    color: '#f59e0b',
    previewText: 'Gold',
    fontFamily: 'Cormorant Garamond',
    fontWeight: 'Bold',
    fontSize: 32,
    italic: true,
    customClass: 'preset-luxury_gold'
  },
  { 
    title: 'Elegant Serif', 
    preset: 'o_elegant_serif', 
    sub: 'Classic Playfair header', 
    color: '#ffffff', 
    previewText: 'Elegant',
    fontFamily: 'Playfair Display',
    fontWeight: 'Regular',
    fontSize: 32,
    customClass: 'preset-elegant_serif'
  },
  { 
    title: 'Corporate Title', 
    preset: 'o_corporate_title', 
    sub: 'Professional corporate branding', 
    color: '#1e293b', 
    previewText: 'Business',
    fontFamily: 'Manrope',
    fontWeight: 'SemiBold',
    fontSize: 26,
    bgEnabled: true,
    textBgColor: '#e2e8f0',
    padding: 8,
    textBorderRadius: 6,
    customClass: 'preset-corporate_title'
  },
  { 
    title: 'Gaming Title', 
    preset: 'o_gaming_title', 
    sub: 'Esports Teko header', 
    color: '#ff2458', 
    previewText: 'GAMING',
    fontFamily: 'Teko',
    fontWeight: 'Bold',
    fontSize: 42,
    outlineEnabled: true,
    outlineColor: '#000000',
    outlineWidth: 2,
    customClass: 'preset-gaming_title'
  },
  { 
    title: 'Neon Glow', 
    preset: 'o_neon_glow', 
    sub: 'Cyberpunk neon vibe', 
    color: '#00f0ff', 
    previewText: 'NEON',
    fontFamily: 'League Spartan',
    fontWeight: 'Bold',
    fontSize: 30,
    shadowEnabled: true,
    shadowColor: '#00f0ff',
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 10,
    customClass: 'preset-neon_glow'
  },
  { 
    title: 'Editorial Classic', 
    preset: 'o_editorial_classic', 
    sub: 'Classic serif newspaper', 
    color: '#ffffff', 
    previewText: 'Editorial',
    fontFamily: 'Merriweather',
    fontWeight: 'Regular',
    fontSize: 26,
    customClass: 'preset-editorial_classic'
  },
  { 
    title: 'Signature', 
    preset: 'o_signature', 
    sub: 'Great vibes elegant script', 
    color: '#f59e0b', 
    previewText: 'Signature',
    fontFamily: 'Great Vibes',
    fontWeight: 'Regular',
    fontSize: 38,
    customClass: 'preset-signature'
  },
  { 
    title: 'Custom Blank', 
    preset: 'o_custom_blank', 
    sub: 'Standard layout styling', 
    color: '#ffffff', 
    previewText: 'Simple Title',
    fontFamily: 'Inter',
    fontWeight: 'Regular',
    fontSize: 28,
    customClass: 'preset-default'
  },

  // === New 40 Presets ===
  {
    title: 'Alpha Focus',
    preset: 'alpha_focus',
    sub: 'Slanted sport headline',
    color: '#ff9f1c',
    previewText: 'ALPHA',
    fontFamily: 'Anton',
    fontWeight: 'Bold',
    fontSize: 38,
    italic: true,
    outlineEnabled: true,
    outlineColor: '#000000',
    outlineWidth: 3,
    shadowEnabled: true,
    shadowColor: '#000000',
    shadowX: 3,
    shadowY: 3,
    shadowBlur: 0,
    customClass: 'preset-alpha_focus'
  },
  {
    title: 'Power Frame',
    preset: 'power_frame',
    sub: 'Bold boxed statement',
    color: '#ffffff',
    previewText: 'POWER',
    fontFamily: 'Archivo Black',
    fontWeight: 'Bold',
    fontSize: 32,
    bgEnabled: true,
    textBgColor: '#000000',
    padding: 10,
    textBorderRadius: 6,
    outlineEnabled: true,
    outlineColor: '#ffffff',
    outlineWidth: 1.5,
    customClass: 'preset-power_frame'
  },
  {
    title: 'Vision Title',
    preset: 'vision_title',
    sub: 'Modern bold header',
    color: '#ffffff',
    previewText: 'VISION',
    fontFamily: 'Inter',
    fontWeight: 'Black',
    fontSize: 36,
    letterSpacing: 4,
    customClass: 'preset-vision_title'
  },
  {
    title: 'Elite Caption',
    preset: 'elite_caption',
    sub: 'Vlog subtitle block',
    color: '#ffffff',
    previewText: 'Elite Caption',
    fontFamily: 'Poppins',
    fontWeight: 'ExtraBold',
    fontSize: 28,
    bgEnabled: true,
    textBgColor: '#0084ff',
    padding: 10,
    textBorderRadius: 8,
    customClass: 'preset-elite_caption'
  },
  {
    title: 'Sharp Focus',
    preset: 'sharp_focus',
    sub: 'Sleek geometric headline',
    color: '#ffffff',
    previewText: 'SHARP',
    fontFamily: 'League Spartan',
    fontWeight: 'Bold',
    fontSize: 34,
    shadowEnabled: true,
    shadowColor: 'rgba(0,0,0,0.65)',
    shadowX: 0,
    shadowY: 3,
    shadowBlur: 5,
    customClass: 'preset-sharp_focus'
  },
  {
    title: 'Prime Header',
    preset: 'prime_header',
    sub: 'Beast-style viral subtitle',
    color: '#facc15',
    previewText: 'PRIME',
    fontFamily: 'Bebas Neue',
    fontWeight: 'Regular',
    fontSize: 40,
    outlineEnabled: true,
    outlineColor: '#000000',
    outlineWidth: 4,
    shadowEnabled: true,
    shadowColor: '#000000',
    shadowX: 3,
    shadowY: 3,
    shadowBlur: 0,
    customClass: 'preset-prime_header'
  },
  {
    title: 'Clean Focus',
    preset: 'clean_focus',
    sub: 'Clean spacing descriptor',
    color: '#cccccc',
    previewText: 'FOCUS',
    fontFamily: 'Inter',
    fontWeight: 'Medium',
    fontSize: 24,
    letterSpacing: 6,
    customClass: 'preset-clean_focus'
  },
  {
    title: 'Horizon',
    preset: 'horizon',
    sub: 'Futuristic glowing title',
    color: '#00f0ff',
    previewText: 'HORIZON',
    fontFamily: 'Space Grotesk',
    fontWeight: 'Bold',
    fontSize: 32,
    shadowEnabled: true,
    shadowColor: '#00f0ff',
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 8,
    customClass: 'preset-horizon'
  },
  {
    title: 'Blueprint',
    preset: 'blueprint',
    sub: 'Sleek tech sub-banner',
    color: '#ffffff',
    previewText: 'Blueprint',
    fontFamily: 'Manrope',
    fontWeight: 'Bold',
    fontSize: 26,
    bgEnabled: true,
    textBgColor: 'rgba(255,255,255,0.08)',
    outlineEnabled: true,
    outlineColor: '#ffffff',
    outlineWidth: 1.5,
    padding: 8,
    textBorderRadius: 4,
    customClass: 'preset-blueprint'
  },
  {
    title: 'Spotlight',
    preset: 'spotlight',
    sub: 'Creative purple label',
    color: '#ffffff',
    previewText: 'Spotlight',
    fontFamily: 'Montserrat',
    fontWeight: 'ExtraBold',
    fontSize: 28,
    bgEnabled: true,
    textBgColor: '#8b5cf6',
    padding: 10,
    textBorderRadius: 8,
    customClass: 'preset-spotlight'
  },
  {
    title: 'Pulse',
    preset: 'pulse',
    sub: 'Hot pink glowing text',
    color: '#ec4899',
    previewText: 'PULSE',
    fontFamily: 'Outfit',
    fontWeight: 'Bold',
    fontSize: 30,
    shadowEnabled: true,
    shadowColor: '#ffffff',
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 8,
    customClass: 'preset-pulse'
  },
  {
    title: 'Next Chapter',
    preset: 'next_chapter',
    sub: 'Red alert billboard',
    color: '#ffffff',
    previewText: 'NEXT',
    fontFamily: 'Oswald',
    fontWeight: 'Bold',
    fontSize: 26,
    bgEnabled: true,
    textBgColor: '#ef4444',
    padding: 10,
    textBorderRadius: 0,
    customClass: 'preset-next_chapter'
  },
  {
    title: 'Focus Line',
    preset: 'focus_line',
    sub: 'Translucent clean subtitle',
    color: '#ffffff',
    previewText: 'Focus Line',
    fontFamily: 'DM Sans',
    fontWeight: 'Bold',
    fontSize: 24,
    bgEnabled: true,
    textBgColor: 'rgba(0,0,0,0.65)',
    padding: 8,
    textBorderRadius: 6,
    customClass: 'preset-focus_line'
  },
  {
    title: 'Core Message',
    preset: 'core_message',
    sub: 'Outlined hollow sans',
    color: '#ffffff',
    previewText: 'MESSAGE',
    fontFamily: 'Rubik',
    fontWeight: 'Bold',
    fontSize: 32,
    outlineEnabled: true,
    outlineColor: '#000000',
    outlineWidth: 3,
    letterSpacing: 2,
    customClass: 'preset-core_message'
  },
  {
    title: 'Prestige',
    preset: 'prestige',
    sub: 'Elegant luxury serif',
    color: '#d97706',
    previewText: 'Prestige',
    fontFamily: 'Playfair Display',
    fontWeight: 'Bold',
    fontSize: 32,
    italic: true,
    customClass: 'preset-prestige'
  },
  {
    title: 'Legacy',
    preset: 'legacy',
    sub: 'Classic paper block style',
    color: '#1e293b',
    previewText: 'LEGACY',
    fontFamily: 'Merriweather',
    fontWeight: 'Bold',
    fontSize: 26,
    bgEnabled: true,
    textBgColor: '#e2e8f0',
    padding: 8,
    textBorderRadius: 4,
    customClass: 'preset-legacy'
  },
  {
    title: 'Signature Pro',
    preset: 'signature_pro',
    sub: 'Elegant handwriting script',
    color: '#ec4899',
    previewText: 'Signature',
    fontFamily: 'Great Vibes',
    fontWeight: 'Regular',
    fontSize: 38,
    customClass: 'preset-signature_pro'
  },
  {
    title: 'Elevate',
    preset: 'elevate',
    sub: 'Futuristic purple neon',
    color: '#ffffff',
    previewText: 'ELEVATE',
    fontFamily: 'Urbanist',
    fontWeight: 'Bold',
    fontSize: 32,
    shadowEnabled: true,
    shadowColor: '#a855f7',
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 10,
    customClass: 'preset-elevate'
  },
  {
    title: 'Fusion',
    preset: 'fusion',
    sub: 'Warm orange badge style',
    color: '#ffffff',
    previewText: 'Fusion',
    fontFamily: 'Lexend',
    fontWeight: 'Bold',
    fontSize: 26,
    bgEnabled: true,
    textBgColor: '#f97316',
    padding: 8,
    textBorderRadius: 8,
    customClass: 'preset-fusion'
  },
  {
    title: 'Ignite',
    preset: 'ignite',
    sub: 'Bold shadow title',
    color: '#ffd21f',
    previewText: 'IGNITE',
    fontFamily: 'Archivo Black',
    fontWeight: 'Bold',
    fontSize: 36,
    shadowEnabled: true,
    shadowColor: '#b91c1c',
    shadowX: 4,
    shadowY: 4,
    shadowBlur: 0,
    customClass: 'preset-ignite'
  },
  {
    title: 'Momentum',
    preset: 'momentum',
    sub: 'Commanding slanted hook',
    color: '#ffffff',
    previewText: 'MOMENTUM',
    fontFamily: 'Anton',
    fontWeight: 'Bold',
    fontSize: 38,
    italic: true,
    outlineEnabled: true,
    outlineColor: '#000000',
    outlineWidth: 3,
    shadowEnabled: true,
    shadowColor: '#000000',
    shadowX: 3,
    shadowY: 3,
    shadowBlur: 0,
    customClass: 'preset-momentum'
  },
  {
    title: 'Vision Box',
    preset: 'vision_box',
    sub: 'White text in dark pill',
    color: '#ffffff',
    previewText: 'Vision Box',
    fontFamily: 'Poppins',
    fontWeight: 'Bold',
    fontSize: 26,
    bgEnabled: true,
    textBgColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    textBorderRadius: 30,
    customClass: 'preset-vision_box'
  },
  {
    title: 'Platinum',
    preset: 'platinum',
    sub: 'Elegant cormorant serif',
    color: '#94a3b8',
    previewText: 'Platinum',
    fontFamily: 'Cormorant Garamond',
    fontWeight: 'Bold',
    fontSize: 32,
    italic: true,
    customClass: 'preset-platinum'
  },
  {
    title: 'Catalyst',
    preset: 'catalyst',
    sub: 'Dark text on neon badge',
    color: '#0f172a',
    previewText: 'CATALYST',
    fontFamily: 'League Spartan',
    fontWeight: 'Bold',
    fontSize: 30,
    bgEnabled: true,
    textBgColor: '#22c55e',
    padding: 8,
    textBorderRadius: 6,
    customClass: 'preset-catalyst'
  },
  {
    title: 'Storyline',
    preset: 'storyline',
    sub: 'Vlog subtitle font',
    color: '#ffffff',
    previewText: 'Storyline Caption',
    fontFamily: 'Inter',
    fontWeight: 'SemiBold',
    fontSize: 24,
    shadowEnabled: true,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowX: 0,
    shadowY: 2,
    shadowBlur: 4,
    customClass: 'preset-storyline'
  },
  {
    title: 'Insight',
    preset: 'insight',
    sub: 'Jakarta neon glow outline',
    color: '#22c55e',
    previewText: 'INSIGHT',
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: 'Bold',
    fontSize: 30,
    shadowEnabled: true,
    shadowColor: '#22c55e',
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 8,
    customClass: 'preset-insight'
  },
  {
    title: 'Broadcast Pro',
    preset: 'broadcast_pro',
    sub: 'Heavy broadcast banner',
    color: '#ffffff',
    previewText: 'BROADCAST',
    fontFamily: 'Oswald',
    fontWeight: 'Bold',
    fontSize: 28,
    bgEnabled: true,
    textBgColor: '#1e293b',
    padding: 10,
    textBorderRadius: 4,
    customClass: 'preset-broadcast_pro'
  },
  {
    title: 'Deep Focus',
    preset: 'deep_focus',
    sub: 'Bebas heavy drop shadow',
    color: '#ffffff',
    previewText: 'DEEP FOCUS',
    fontFamily: 'Bebas Neue',
    fontWeight: 'Regular',
    fontSize: 38,
    shadowEnabled: true,
    shadowColor: 'rgba(0,0,0,0.85)',
    shadowX: 4,
    shadowY: 4,
    shadowBlur: 3,
    customClass: 'preset-deep_focus'
  },
  {
    title: 'Creator Plus',
    preset: 'creator_plus',
    sub: 'Montserrat bold pink subtitle',
    color: '#f43f5e',
    previewText: 'CREATOR',
    fontFamily: 'Montserrat',
    fontWeight: 'Bold',
    fontSize: 28,
    outlineEnabled: true,
    outlineColor: '#ffffff',
    outlineWidth: 2,
    customClass: 'preset-creator_plus'
  },
  {
    title: 'Echo',
    preset: 'echo',
    sub: 'Hollow space outline',
    color: '#ffffff',
    previewText: 'ECHO',
    fontFamily: 'Space Grotesk',
    fontWeight: 'Bold',
    fontSize: 32,
    outlineEnabled: true,
    outlineColor: '#000000',
    outlineWidth: 3,
    customClass: 'preset-echo'
  },
  {
    title: 'Blueprint Box',
    preset: 'blueprint_box',
    sub: 'Clean blueprint border box',
    color: '#ffffff',
    previewText: 'Blueprint Box',
    fontFamily: 'Inter',
    fontWeight: 'Bold',
    fontSize: 24,
    bgEnabled: true,
    textBgColor: 'rgba(255,255,255,0.06)',
    outlineEnabled: true,
    outlineColor: '#0084ff',
    outlineWidth: 2,
    padding: 8,
    textBorderRadius: 4,
    customClass: 'preset-blueprint_box'
  },
  {
    title: 'Prestige Serif',
    preset: 'prestige_serif',
    sub: 'High contrast baskerville style',
    color: '#ffffff',
    previewText: 'Prestige Serif',
    fontFamily: 'Libre Baskerville',
    fontWeight: 'Bold',
    fontSize: 28,
    shadowEnabled: true,
    shadowColor: 'rgba(0,0,0,0.45)',
    shadowX: 0,
    shadowY: 2,
    shadowBlur: 6,
    customClass: 'preset-prestige_serif'
  },
  {
    title: 'Motion Caption',
    preset: 'motion_caption',
    sub: 'Vibrant pop captions',
    color: '#facc15',
    previewText: 'MOTION',
    fontFamily: 'Outfit',
    fontWeight: 'ExtraBold',
    fontSize: 30,
    outlineEnabled: true,
    outlineColor: '#000000',
    outlineWidth: 3,
    shadowEnabled: true,
    shadowColor: '#000000',
    shadowX: 2,
    shadowY: 2,
    shadowBlur: 0,
    customClass: 'preset-motion_caption'
  },
  {
    title: 'Vision Glow',
    preset: 'vision_glow',
    sub: 'League neon green glow',
    color: '#22c55e',
    previewText: 'GLOW',
    fontFamily: 'League Spartan',
    fontWeight: 'Bold',
    fontSize: 30,
    shadowEnabled: true,
    shadowColor: '#22c55e',
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 10,
    customClass: 'preset-vision_glow'
  },
  {
    title: 'Quantum',
    preset: 'quantum',
    sub: 'Commanding Archivo outline',
    color: '#ffffff',
    previewText: 'QUANTUM',
    fontFamily: 'Archivo Black',
    fontWeight: 'Bold',
    fontSize: 34,
    outlineEnabled: true,
    outlineColor: '#000000',
    outlineWidth: 3.5,
    shadowEnabled: true,
    shadowColor: '#0084ff',
    shadowX: 3,
    shadowY: 3,
    shadowBlur: 0,
    customClass: 'preset-quantum'
  },
  {
    title: 'Vector',
    preset: 'vector',
    sub: 'Sleek Manrope geometry',
    color: '#ffffff',
    previewText: 'VECTOR',
    fontFamily: 'Manrope',
    fontWeight: 'Bold',
    fontSize: 28,
    letterSpacing: 2,
    customClass: 'preset-vector'
  },
  {
    title: 'Origin',
    preset: 'origin',
    sub: 'Minimal black block',
    color: '#ffffff',
    previewText: 'ORIGIN',
    fontFamily: 'Inter',
    fontWeight: 'Black',
    fontSize: 36,
    customClass: 'preset-origin'
  },
  {
    title: 'Horizon Plus',
    preset: 'horizon_plus',
    sub: 'Poppins wide header',
    color: '#ffffff',
    previewText: 'Horizon Plus',
    fontFamily: 'Poppins',
    fontWeight: 'SemiBold',
    fontSize: 30,
    letterSpacing: 1.5,
    customClass: 'preset-horizon_plus'
  },
  {
    title: 'Apex',
    preset: 'apex',
    sub: 'Commanding Anton sport header',
    color: '#ef4444',
    previewText: 'APEX',
    fontFamily: 'Anton',
    fontWeight: 'Bold',
    fontSize: 40,
    italic: true,
    outlineEnabled: true,
    outlineColor: '#000000',
    outlineWidth: 3,
    customClass: 'preset-apex'
  },
  {
    title: 'Bold Horizon',
    preset: 'bold_horizon',
    sub: 'League Spartan ExtraBold header',
    color: '#ffffff',
    previewText: 'HORIZON',
    fontFamily: 'League Spartan',
    fontWeight: 'ExtraBold',
    fontSize: 32,
    shadowEnabled: true,
    shadowColor: 'rgba(0,0,0,0.6)',
    shadowX: 3,
    shadowY: 3,
    shadowBlur: 2,
    customClass: 'preset-bold_horizon'
  },
  {
    title: 'Crystal Caption',
    preset: 'crystal_caption',
    sub: 'Inter SemiBold clean subtitle',
    color: '#f1f5f9',
    previewText: 'Crystal',
    fontFamily: 'Inter',
    fontWeight: 'SemiBold',
    fontSize: 24,
    shadowEnabled: true,
    shadowColor: 'rgba(0,0,0,0.4)',
    shadowX: 0,
    shadowY: 2,
    shadowBlur: 4,
    customClass: 'preset-crystal_caption'
  },
  {
    title: 'Iron Impact',
    preset: 'iron_impact',
    sub: 'Archivo Black header',
    color: '#e2e8f0',
    previewText: 'IRON',
    fontFamily: 'Archivo Black',
    fontWeight: 'Bold',
    fontSize: 34,
    outlineEnabled: true,
    outlineColor: '#1e293b',
    outlineWidth: 3,
    customClass: 'preset-iron_impact'
  },
  {
    title: 'Dynamic Pulse',
    preset: 'dynamic_pulse',
    sub: 'Poppins ExtraBold highlight',
    color: '#f8fafc',
    previewText: 'PULSE',
    fontFamily: 'Poppins',
    fontWeight: 'ExtraBold',
    fontSize: 28,
    bgEnabled: true,
    textBgColor: '#ec4899',
    padding: 8,
    textBorderRadius: 6,
    customClass: 'preset-dynamic_pulse'
  },
  {
    title: 'Clean Vision',
    preset: 'clean_vision',
    sub: 'Manrope SemiBold clean sub',
    color: '#f1f5f9',
    previewText: 'VISION',
    fontFamily: 'Manrope',
    fontWeight: 'SemiBold',
    fontSize: 26,
    customClass: 'preset-clean_vision'
  },
  {
    title: 'Modern Edge',
    preset: 'modern_edge',
    sub: 'Outfit Bold sharp header',
    color: '#ffffff',
    previewText: 'EDGE',
    fontFamily: 'Outfit',
    fontWeight: 'Bold',
    fontSize: 30,
    outlineEnabled: true,
    outlineColor: '#0f172a',
    outlineWidth: 2.5,
    customClass: 'preset-modern_edge'
  },
  {
    title: 'Silent Power',
    preset: 'silent_power',
    sub: 'Anton heavy block',
    color: '#ffffff',
    previewText: 'SILENT',
    fontFamily: 'Anton',
    fontWeight: 'Bold',
    fontSize: 36,
    bgEnabled: true,
    textBgColor: '#0f172a',
    padding: 10,
    textBorderRadius: 4,
    customClass: 'preset-silent_power'
  },
  {
    title: 'Hyper Focus',
    preset: 'hyper_focus',
    sub: 'Space Grotesk Bold neon',
    color: '#38bdf8',
    previewText: 'FOCUS',
    fontFamily: 'Space Grotesk',
    fontWeight: 'Bold',
    fontSize: 32,
    shadowEnabled: true,
    shadowColor: '#0284c7',
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 8,
    customClass: 'preset-hyper_focus'
  },
  {
    title: 'Titan Header',
    preset: 'titan_header',
    sub: 'Bebas Neue high impact',
    color: '#f43f5e',
    previewText: 'TITAN',
    fontFamily: 'Bebas Neue',
    fontWeight: 'Regular',
    fontSize: 42,
    outlineEnabled: true,
    outlineColor: '#ffffff',
    outlineWidth: 1.5,
    customClass: 'preset-titan_header'
  },
  {
    title: 'Pixel Prime',
    preset: 'pixel_prime',
    sub: 'IBM Plex Sans Bold terminal',
    color: '#22c55e',
    previewText: 'PRIME',
    fontFamily: 'IBM Plex Sans',
    fontWeight: 'Bold',
    fontSize: 28,
    bgEnabled: true,
    textBgColor: '#171717',
    padding: 8,
    textBorderRadius: 4,
    customClass: 'preset-pixel_prime'
  },
  {
    title: 'Velocity',
    preset: 'velocity',
    sub: 'Oswald Bold slanted header',
    color: '#e2e8f0',
    previewText: 'VELOCITY',
    fontFamily: 'Oswald',
    fontWeight: 'Bold',
    fontSize: 34,
    italic: true,
    shadowEnabled: true,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowX: 3,
    shadowY: 3,
    shadowBlur: 0,
    customClass: 'preset-velocity'
  },
  {
    title: 'Nova Caption',
    preset: 'nova_caption',
    sub: 'Urbanist Bold neon border',
    color: '#ffffff',
    previewText: 'Nova',
    fontFamily: 'Urbanist',
    fontWeight: 'Bold',
    fontSize: 26,
    bgEnabled: true,
    textBgColor: 'rgba(255,255,255,0.06)',
    outlineEnabled: true,
    outlineColor: '#ec4899',
    outlineWidth: 2,
    padding: 8,
    textBorderRadius: 8,
    customClass: 'preset-nova_caption'
  },
  {
    title: 'Infinity Title',
    preset: 'infinity_title',
    sub: 'Montserrat ExtraBold header',
    color: '#ffffff',
    previewText: 'INFINITY',
    fontFamily: 'Montserrat',
    fontWeight: 'ExtraBold',
    fontSize: 32,
    shadowEnabled: true,
    shadowColor: 'rgba(0,0,0,0.6)',
    shadowX: 2,
    shadowY: 2,
    shadowBlur: 4,
    customClass: 'preset-infinity_title'
  },
  {
    title: 'Neon Frame',
    preset: 'neon_frame',
    sub: 'Teko Bold glowing border',
    color: '#a855f7',
    previewText: 'NEON',
    fontFamily: 'Teko',
    fontWeight: 'Bold',
    fontSize: 38,
    bgEnabled: true,
    textBgColor: '#000000',
    outlineEnabled: true,
    outlineColor: '#a855f7',
    outlineWidth: 2,
    padding: 6,
    textBorderRadius: 6,
    customClass: 'preset-neon_frame'
  },
  {
    title: 'Skyline',
    preset: 'skyline',
    sub: 'Plus Jakarta Sans Bold header',
    color: '#ffffff',
    previewText: 'SKYLINE',
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: 'Bold',
    fontSize: 30,
    shadowEnabled: true,
    shadowColor: 'rgba(0,0,0,0.4)',
    shadowX: 0,
    shadowY: 4,
    shadowBlur: 8,
    customClass: 'preset-skyline'
  },
  {
    title: 'Epic Statement',
    preset: 'epic_statement',
    sub: 'Archivo Black epic block',
    color: '#000000',
    previewText: 'STATEMENT',
    fontFamily: 'Archivo Black',
    fontWeight: 'Bold',
    fontSize: 32,
    bgEnabled: true,
    textBgColor: '#ffd21f',
    padding: 10,
    textBorderRadius: 4,
    customClass: 'preset-epic_statement'
  },
  {
    title: 'Bright Focus',
    preset: 'bright_focus',
    sub: 'Lexend Bold clean header',
    color: '#ffffff',
    previewText: 'BRIGHT',
    fontFamily: 'Lexend',
    fontWeight: 'Bold',
    fontSize: 30,
    shadowEnabled: true,
    shadowColor: 'rgba(0,132,255,0.4)',
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 10,
    customClass: 'preset-bright_focus'
  },
  {
    title: 'Royal Display',
    preset: 'royal_display',
    sub: 'Playfair Display Black serif',
    color: '#f59e0b',
    previewText: 'Royal',
    fontFamily: 'Playfair Display',
    fontWeight: 'Black',
    fontSize: 34,
    italic: true,
    customClass: 'preset-royal_display'
  },
  {
    title: 'Zenith',
    preset: 'zenith',
    sub: 'League Spartan Bold sub',
    color: '#e2e8f0',
    previewText: 'ZENITH',
    fontFamily: 'League Spartan',
    fontWeight: 'Bold',
    fontSize: 28,
    customClass: 'preset-zenith'
  },
  {
    title: 'Premium Box',
    preset: 'premium_box',
    sub: 'Inter Bold premium box',
    color: '#ffffff',
    previewText: 'Premium',
    fontFamily: 'Inter',
    fontWeight: 'Bold',
    fontSize: 26,
    bgEnabled: true,
    textBgColor: '#1e293b',
    outlineEnabled: true,
    outlineColor: '#0084ff',
    outlineWidth: 2,
    padding: 8,
    textBorderRadius: 6,
    customClass: 'preset-premium_box'
  },
  {
    title: 'Gravity',
    preset: 'gravity',
    sub: 'Anton heavy drop hook',
    color: '#ffffff',
    previewText: 'GRAVITY',
    fontFamily: 'Anton',
    fontWeight: 'Bold',
    fontSize: 38,
    outlineEnabled: true,
    outlineColor: '#e11d48',
    outlineWidth: 3,
    customClass: 'preset-gravity'
  },
  {
    title: 'Bold Motion',
    preset: 'bold_motion',
    sub: 'Bebas Neue slanted banner',
    color: '#ffffff',
    previewText: 'MOTION',
    fontFamily: 'Bebas Neue',
    fontWeight: 'Regular',
    fontSize: 40,
    italic: true,
    bgEnabled: true,
    textBgColor: '#000000',
    padding: 8,
    textBorderRadius: 4,
    customClass: 'preset-bold_motion'
  },
  {
    title: 'Urban Pulse',
    preset: 'urban_pulse',
    sub: 'Rubik Bold modern sub',
    color: '#3b82f6',
    previewText: 'URBAN',
    fontFamily: 'Rubik',
    fontWeight: 'Bold',
    fontSize: 28,
    outlineEnabled: true,
    outlineColor: '#ffffff',
    outlineWidth: 2,
    customClass: 'preset-urban_pulse'
  },
  {
    title: 'Phoenix',
    preset: 'phoenix',
    sub: 'Archivo Black orange outline',
    color: '#ffffff',
    previewText: 'PHOENIX',
    fontFamily: 'Archivo Black',
    fontWeight: 'Bold',
    fontSize: 32,
    outlineEnabled: true,
    outlineColor: '#ea580c',
    outlineWidth: 3,
    customClass: 'preset-phoenix'
  },
  {
    title: 'Infinite Flow',
    preset: 'infinite_flow',
    sub: 'DM Sans Bold clean subtitle',
    color: '#cbd5e1',
    previewText: 'FLOW',
    fontFamily: 'DM Sans',
    fontWeight: 'Bold',
    fontSize: 26,
    customClass: 'preset-infinite_flow'
  },
  {
    title: 'Digital Edge',
    preset: 'digital_edge',
    sub: 'Space Grotesk Bold border box',
    color: '#e2e8f0',
    previewText: 'DIGITAL',
    fontFamily: 'Space Grotesk',
    fontWeight: 'Bold',
    fontSize: 26,
    bgEnabled: true,
    textBgColor: '#090a0f',
    outlineEnabled: true,
    outlineColor: '#38bdf8',
    outlineWidth: 2,
    padding: 8,
    textBorderRadius: 6,
    customClass: 'preset-digital_edge'
  },
  {
    title: 'Smart Highlight',
    preset: 'smart_highlight',
    sub: 'Poppins Bold green tag',
    color: '#ffffff',
    previewText: 'Highlight',
    fontFamily: 'Poppins',
    fontWeight: 'Bold',
    fontSize: 28,
    bgEnabled: true,
    textBgColor: '#16a34a',
    padding: 8,
    textBorderRadius: 6,
    customClass: 'preset-smart_highlight'
  },
  {
    title: 'Minimal Elite',
    preset: 'minimal_elite',
    sub: 'Inter Medium subtle spacer',
    color: '#94a3b8',
    previewText: 'ELITE',
    fontFamily: 'Inter',
    fontWeight: 'Medium',
    fontSize: 24,
    letterSpacing: 5,
    customClass: 'preset-minimal_elite'
  },
  {
    title: 'Vision Block',
    preset: 'vision_block',
    sub: 'Montserrat Bold block text',
    color: '#ffffff',
    previewText: 'BLOCK',
    fontFamily: 'Montserrat',
    fontWeight: 'Bold',
    fontSize: 28,
    bgEnabled: true,
    textBgColor: '#e11d48',
    padding: 8,
    textBorderRadius: 4,
    customClass: 'preset-vision_block'
  },
  {
    title: 'Platinum Focus',
    preset: 'platinum_focus',
    sub: 'Manrope Bold dark banner',
    color: '#ffffff',
    previewText: 'FOCUS',
    fontFamily: 'Manrope',
    fontWeight: 'Bold',
    fontSize: 28,
    bgEnabled: true,
    textBgColor: '#1e293b',
    padding: 8,
    textBorderRadius: 6,
    customClass: 'preset-platinum_focus'
  },
  {
    title: 'Nova Display',
    preset: 'nova_display',
    sub: 'League Spartan ExtraBold glow',
    color: '#f43f5e',
    previewText: 'NOVA',
    fontFamily: 'League Spartan',
    fontWeight: 'ExtraBold',
    fontSize: 32,
    shadowEnabled: true,
    shadowColor: '#f43f5e',
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 10,
    customClass: 'preset-nova_display'
  },
  {
    title: 'Future Line',
    preset: 'future_line',
    sub: 'Outfit ExtraBold outline',
    color: '#ffffff',
    previewText: 'FUTURE',
    fontFamily: 'Outfit',
    fontWeight: 'ExtraBold',
    fontSize: 34,
    outlineEnabled: true,
    outlineColor: '#3b82f6',
    outlineWidth: 3,
    customClass: 'preset-future_line'
  },
  {
    title: 'Blank Canvas',
    preset: 'default',
    sub: 'Standard layout styling',
    color: '#ffffff',
    previewText: 'Simple Title',
    fontFamily: 'Inter',
    fontWeight: 'Regular',
    fontSize: 28,
    customClass: 'preset-default'
  }
];

export default function Editor({ projectId, setActiveProjectId }) {
  // ─── Helpers ──────────────────────────────────────────────────────────────
  const toUrlPath = (filePath) => {
    if (!filePath) return '';
    if (typeof filePath === 'string' && (filePath.startsWith('blob:') || filePath.startsWith('data:') || filePath.startsWith('http://') || filePath.startsWith('https://'))) {
      return filePath;
    }
    const cleanPath = filePath.replace(/\\/g, '/');
    const isStandardMounted = cleanPath.toLowerCase().startsWith('media library/') || 
                              cleanPath.toLowerCase().startsWith('/media library/') ||
                              cleanPath.toLowerCase().startsWith('exports/') ||
                              cleanPath.toLowerCase().startsWith('/exports/');
                              
    const backendOrigin = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : 'http://localhost:8000';
    
    if (isStandardMounted) {
      const path = cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath;
      return backendOrigin + encodeURI(path);
    } else {
      return `${backendOrigin}/api/serve-media?path=${encodeURIComponent(cleanPath)}`;
    }
  };

  const getFontWeightCSS = (weight) => {
    switch (weight?.toLowerCase()) {
      case 'regular': return '400';
      case 'medium': return '500';
      case 'bold': return '700';
      case 'black': return '900';
      default: return '700';
    }
  };

  const getResolvedOpacity = (opacity) => {
    if (opacity === undefined || opacity === null) return 1.0;
    if (opacity > 1.0) return opacity / 100;
    return opacity;
  };

  const getFilterCSS = (filterName, brightnessVal, clip) => {
    let clipObj = null;
    let fName = filterName;

    if (filterName && typeof filterName === 'object') {
      clipObj = filterName;
      fName = clipObj.filter;
    } else if (clip !== undefined) {
      clipObj = clip;
    } else {
      // Check if it is a string representing a filter name
      fName = filterName;
    }

    let filterStr = '';
    switch (fName) {
      case 'vintage': filterStr = 'sepia(0.6) contrast(0.9) saturate(0.9)'; break;
      case 'dramatic': filterStr = 'contrast(1.3) saturate(0.8) brightness(0.9)'; break;
      case 'film_noir': filterStr = 'grayscale(1) contrast(1.25)'; break;
      case 'retro': filterStr = 'sepia(0.3) saturate(1.2) hue-rotate(-10deg)'; break;
      case 'cool': filterStr = 'hue-rotate(15deg) saturate(1.1) brightness(0.95)'; break;
      case 'warm': filterStr = 'sepia(0.25) saturate(1.2) hue-rotate(5deg)'; break;
      case 'soft': filterStr = 'blur(1px) contrast(0.9) saturate(0.9)'; break;
      case 'vibrant': filterStr = 'saturate(1.6) contrast(1.05)'; break;
      default: filterStr = ''; break;
    }

    if (clipObj) {
      const bVal = Number(clipObj.brightness ?? 0);
      const resolvedBrightness = bVal === 100 ? 0 : bVal;
      const contrastVal = Number(clipObj.contrast ?? 0);
      const exposureVal = Number(clipObj.exposure ?? 0);
      const hueVal = Number(clipObj.hue ?? 0);
      const saturateVal = Number(clipObj.saturation ?? 0);
      const blurVal = Number(clipObj.blur ?? 0);

      const finalBrightness = (100 + resolvedBrightness + exposureVal) / 100;
      const finalContrast = 1 + contrastVal / 100;
      const finalSaturate = 1 + saturateVal / 100;

      let manualAdjustments = `brightness(${finalBrightness}) contrast(${finalContrast}) saturate(${finalSaturate})`;
      if (hueVal !== 0) {
        manualAdjustments += ` hue-rotate(${hueVal}deg)`;
      }
      if (blurVal > 0) {
        manualAdjustments += ` blur(${blurVal / 5}px)`;
      }
      const sharpenVal = Number(clipObj.sharpen ?? 0);
      if (sharpenVal > 50) {
        manualAdjustments += ` url(#sharpen-filter-heavy)`;
      } else if (sharpenVal > 0) {
        manualAdjustments += ` url(#sharpen-filter-medium)`;
      }
      return `${filterStr} ${manualAdjustments}`.trim() || 'none';
    } else {
      // Fallback for simple calls e.g. text filtering
      const bNumber = Number(brightnessVal ?? 0);
      const resolvedB = bNumber === 100 ? 0 : bNumber;
      const finalBrightness = (100 + resolvedB) / 100;
      return `${filterStr} brightness(${finalBrightness})`.trim() || 'none';
    }
  };

  // Refs
  const timelineScrollRef = useRef(null);
  const playheadLineRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimestampRef = useRef(0);
  const projectRef = useRef(null);
  const isPlayingRef = useRef(false);
  const canvasContainerRef = useRef(null);
  const previewAreaRef = useRef(null);
  const previewAudioRef = useRef(null);
  const [previewAudioId, setPreviewAudioId] = useState(null);

  // ─── Theme ────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // ─── App States ───────────────────────────────────────────────────────────
  const [activeSidebar, setActiveSidebar] = useState('Video');

  // Premium Sidebar Tooltips
  const [hoveredSec, setHoveredSec] = useState(null);
  const [hoveredRect, setHoveredRect] = useState(null);

  const getTooltipText = (key) => {
    switch (key) {
      case 'VoiceOver': return 'Voice Over';
      case 'AIChat': return 'AI Chat';
      case 'API': return 'API Keys';
      default: return key;
    }
  };

  const handleItemMouseEnter = (name, e) => {
    setHoveredSec(name);
    setHoveredRect(e.currentTarget.getBoundingClientRect());
  };

  const handleItemMouseLeave = () => {
    setHoveredSec(null);
    setHoveredRect(null);
  };

  const [library, setLibrary] = useState({ files: [], folders: [] });
  const [uploadsFilter, setUploadsFilter] = useState('All');
  const [isUploading, setIsUploading] = useState(false);
  const [srtFile, setSrtFile] = useState(null);
  const [scriptText, setScriptText] = useState('');
  const [captionStyle, setCaptionStyle] = useState('default');
  const [captionDropdownOpen, setCaptionDropdownOpen] = useState(false);

  // Text Panel Redesign States
  const [textSearchQuery, setTextSearchQuery] = useState('');
  const [selectedTextCategory, setSelectedTextCategory] = useState('All');
  const [favoriteTextStyles, setFavoriteTextStyles] = useState(() => {
    try {
      const val = JSON.parse(localStorage.getItem('fav_text_styles') || '[]');
      return Array.isArray(val) ? val : [];
    } catch {
      return [];
    }
  });
  const [recentTextStyles, setRecentTextStyles] = useState(() => {
    try {
      const val = JSON.parse(localStorage.getItem('recent_text_styles') || '[]');
      return Array.isArray(val) ? val : [];
    } catch {
      return [];
    }
  });
  const [myStyles, setMyStyles] = useState(() => {
    try {
      const val = JSON.parse(localStorage.getItem('my_text_styles') || '[]');
      return Array.isArray(val) ? val : [];
    } catch {
      return [];
    }
  });
  const [selectedPresetTitle, setSelectedPresetTitle] = useState(null);

  // New AI feature states
  const [scriptData, setScriptData] = useState(null);
  const [chatPrefill, setChatPrefill] = useState('');

  // Stickers Filters & Custom Storage
  const [activeStickersCategory, setActiveStickersCategory] = useState('All');
  const [stickersSearchQuery, setStickersSearchQuery] = useState('');
  const [stickersColorFilter, setStickersColorFilter] = useState('All');
  const [stickersStyleFilter, setStickersStyleFilter] = useState('All');
  const [alignmentGuides, setAlignmentGuides] = useState({ v: false, h: false });
  const [contextMenu, setContextMenu] = useState(null);
  const [copiedClip, setCopiedClip] = useState(null);

  const [customStickers, setCustomStickers] = useState(() => {
    try {
      const saved = localStorage.getItem('custom_stickers');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (e) {
      return [];
    }
  });

  const [favoriteStickers, setFavoriteStickers] = useState(() => {
    try {
      const saved = localStorage.getItem('fav_stickers');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (e) {
      return [];
    }
  });

  const [recentStickers, setRecentStickers] = useState(() => {
    try {
      const saved = localStorage.getItem('recent_stickers');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (e) {
      return [];
    }
  });

  const toggleFavoriteSticker = (stickerId, e) => {
    if (e) e.stopPropagation();
    setFavoriteStickers(prev => {
      const next = prev.includes(stickerId) ? prev.filter(id => id !== stickerId) : [...prev, stickerId];
      localStorage.setItem('fav_stickers', JSON.stringify(next));
      return next;
    });
  };

  const trackRecentSticker = (sticker) => {
    if (!sticker || !sticker.id) return;
    setRecentStickers(prev => {
      const validPrev = Array.isArray(prev) ? prev.filter(Boolean) : [];
      const filtered = validPrev.filter(s => s && s.id && s.id !== sticker.id);
      const next = [sticker, ...filtered].slice(0, 24);
      localStorage.setItem('recent_stickers', JSON.stringify(next));
      return next;
    });
  };

  // Player & Timeline states
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [zoom, setZoom] = useState(65);
  const [maxDuration, setMaxDuration] = useState(60);
  
  const getZoomScale = (z) => {
    const visibleW = timelineScrollRef.current ? (timelineScrollRef.current.clientWidth - TRACK_LABEL_WIDTH) : 1000;
    const scaleMin = visibleW / 60; // Fits exactly 1 minute (60 seconds) at slider min (0%)
    const scaleMax = visibleW / 5;  // Fits exactly 5 seconds at slider max (100%)
    
    if (z >= 1) {
      return scaleMin * Math.pow(scaleMax / scaleMin, (z - 1) / 99);
    } else {
      const scaleAbsMin = visibleW / 14400; // Fits exactly 4 hours at maximum zoom out button click
      return scaleMin * Math.pow(scaleMin / scaleAbsMin, (z - 1) / 45);
    }
  };

  const pxPerSec = getZoomScale(zoom);
  const visibleW = timelineScrollRef.current ? (timelineScrollRef.current.clientWidth - TRACK_LABEL_WIDTH) : 1000;
  const viewDuration = pxPerSec > 0 ? (visibleW / pxPerSec) : maxDuration;
  const timelineLengthSec = Math.max(maxDuration, viewDuration);
  const [playheadX, setPlayheadX] = useState(0);

  // Undo/Redo
  const [historyPast, setHistoryPast] = useState([]);
  const [historyFuture, setHistoryFuture] = useState([]);

  // Clipboard
  const [clipboard, setClipboard] = useState(null);

  const [customActiveTracks, setCustomActiveTracks] = useState({
    track1: true
  });

  const addEmptyTrack = () => {
    const trackKeys = ['track1', 'track2', 'track3', 'track4', 'track5', 'track6', 'track7', 'track8'];
    const nextInactive = trackKeys.find(k => !customActiveTracks[k]);
    if (nextInactive) {
      setCustomActiveTracks(prev => ({ ...prev, [nextInactive]: true }));
    } else {
      alert("Maximum of 8 tracks reached.");
    }
  };

  const deleteEmptyTrack = (trackKey) => {
    if (!project) return;
    const allVisible = ['track1', 'track2', 'track3', 'track4', 'track5', 'track6', 'track7', 'track8']
      .filter(k => (project.tracks[k] || []).length > 0 || customActiveTracks[k]);
    if (allVisible.length <= 1) {
      alert("At least one track must remain on the timeline.");
      return;
    }
    setCustomActiveTracks(prev => {
      const copy = { ...prev };
      delete copy[trackKey];
      return copy;
    });
  };

  const shiftClipTrack = (clip, targetTrack) => {
    if (!project) return;
    pushHistory(project.tracks);
    setCustomActiveTracks(prev => ({ ...prev, [targetTrack]: true }));

    const updatedTracks = {};
    Object.entries(project.tracks).forEach(([tk, clips]) => {
      const filtered = (clips || []).filter(c => c.id !== clip.id);
      if (tk === targetTrack) {
        const updatedClip = { ...clip, track: targetTrack };
        updatedTracks[tk] = [...filtered, updatedClip];
        setSelectedClip(updatedClip);
      } else {
        updatedTracks[tk] = filtered;
      }
    });

    if (!updatedTracks[targetTrack]) {
      const updatedClip = { ...clip, track: targetTrack };
      updatedTracks[targetTrack] = [updatedClip];
      setSelectedClip(updatedClip);
    }

    updateTracksAndSyncDuration(updatedTracks);
  };

  // Canvas drag
  const [canvasDragging, setCanvasDragging] = useState(false);
  const [canvasResizing, setCanvasResizing] = useState(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragStartClipPos, setDragStartClipPos] = useState({ x: 50, y: 50 });

  // Export
  const [exportModal, setExportModal] = useState(false);
  const [exportRes, setExportRes] = useState('1080p');
  const [exportFps, setExportFps] = useState(24);
  const [exportQuality, setExportQuality] = useState('medium');
  const [renderingTaskId, setRenderingTaskId] = useState('');
  const [renderStatus, setRenderStatus] = useState(null);

  // Track settings / sidebar
  const [mutedTracks, setMutedTracks] = useState({});
  const [hiddenTracks, setHiddenTracks] = useState({});
  const [lockedTracks, setLockedTracks] = useState({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(() => {
    return ASPECT_PRESETS.find(p => p.ratio === '16:9' && p.category === 'Custom') || ASPECT_PRESETS[0];
  });
  const [aspectRatioOpen, setAspectRatioOpen] = useState(false);
  const [arSearchQuery, setArSearchQuery] = useState('');
  const [speedOpen, setSpeedOpen] = useState(false);

  const speedRef = useRef(null);
  const aspectRatioRef = useRef(null);

  // Click outside to auto-close Speed and Aspect Ratio dropdown menus
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (speedRef.current && !speedRef.current.contains(e.target)) {
        setSpeedOpen(false);
      }
      if (aspectRatioRef.current && !aspectRatioRef.current.contains(e.target)) {
        setAspectRatioOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [draggedTrackKey, setDraggedTrackKey] = useState(null);

  const handleTrackReorderDrop = (e, targetTrack) => {
    e.preventDefault();
    const sourceTrack = e.dataTransfer.getData('text/plain') || draggedTrackKey;
    if (!sourceTrack || sourceTrack === targetTrack || !project || !project.tracks) return;

    pushHistory(project.tracks);

    // Swap clips between sourceTrack and targetTrack, updating their clip.track property
    const sourceClips = (project.tracks[sourceTrack] || []).map(c => ({ ...c, track: targetTrack }));
    const targetClips = (project.tracks[targetTrack] || []).map(c => ({ ...c, track: sourceTrack }));

    const updatedTracks = {
      ...project.tracks,
      [sourceTrack]: targetClips,
      [targetTrack]: sourceClips,
    };

    // Swap mute & hide status for both tracks
    setMutedTracks(m => ({
      ...m,
      [sourceTrack]: m[targetTrack],
      [targetTrack]: m[sourceTrack],
    }));

    setHiddenTracks(h => ({
      ...h,
      [sourceTrack]: h[targetTrack],
      [targetTrack]: h[sourceTrack],
    }));

    updateTracksAndSyncDuration(updatedTracks);
    setDraggedTrackKey(null);
  };

  const [featurePanelWidth, setFeaturePanelWidth] = useState(380);
  const [propertiesPanelWidth, setPropertiesPanelWidth] = useState(320);
  const [timelineHeight, setTimelineHeight] = useState(300);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingProperties, setIsResizingProperties] = useState(false);
  const [isResizingTimeline, setIsResizingTimeline] = useState(false);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const [focusSection, setFocusSection] = useState(null);

  // Project / modal
  const [project, setProject] = useState(null);
  useEffect(() => {
    projectRef.current = project;
  }, [project]);
  const [selectedClip, setSelectedClip] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Captions search / audio/image queries
  const [audioQuery, setAudioQuery] = useState('');
  const [imageQuery, setImageQuery] = useState('');

  // Dynamic preview area size (updated by ResizeObserver)
  // Start with sensible defaults so the canvas isn't tiny on first paint
  const [previewAreaSize, setPreviewAreaSize] = useState({ w: 900, h: 400 });

  // ─── Load project & library ───────────────────────────────────────────────
  // ─── Load project & library ───────────────────────────────────────────────
  const createProject = async (name = newProjectName) => {
    const n = (typeof name === 'string' && name.trim()) ? name.trim() : 'My First Video Project';
    const id = `proj_${Math.random().toString(36).substring(2, 10)}`;
    const proj = {
      id, name: n, duration: 30,
      resolution: { width: 1920, height: 1080 },
      fps: 24,
      tracks: { track1:[], track2:[], track3:[], track4:[], track5:[], track6:[], track7:[], track8:[] },
    };
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proj),
      });
      if (res.ok && (await res.json()).status === 'success') {
        setProject(proj);
        setActiveProjectId(id);
        setNewProjectName('');
        setShowProjectsModal(false);
        return proj;
      }
    } catch (e) { console.error(e); }
    return null;
  };

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const list = await res.json();
        setProjects(list);
        if (!projectId) {
          if (list.length > 0) {
            setActiveProjectId(list[0].id);
          } else {
            createProject('My First Video Project');
          }
        }
      }
    } catch (e) { console.error(e); }
  };

  const loadProject = async () => {
    if (!projectId) {
      loadProjects();
      return;
    }
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.tracks) {
          const t = data.tracks;
          const normalised = {
            track1: t.track1 || t.video1 || t.video || [],
            track2: t.track2 || t.video2 || t.avatar || [],
            track3: t.track3 || t.video3 || t.image || [],
            track4: t.track4 || t.audio1 || t.voiceover || [],
            track5: t.track5 || t.audio2 || t.music || [],
            track6: t.track6 || t.audio3 || [],
            track7: t.track7 || t.text1 || t.text || [],
            track8: t.track8 || t.text2 || t.caption || t.text3 || t.sticker || [],
          };
          Object.keys(normalised).forEach(k => {
            normalised[k] = normalised[k].map(c => ({ ...c, track: k }));
          });
          data.tracks = normalised;

          // Initialize customActiveTracks with all tracks that have clips, plus track1
          const active = { track1: true };
          Object.keys(normalised).forEach(k => {
            if (normalised[k].length > 0) {
              active[k] = true;
            }
          });
          setCustomActiveTracks(active);
        }
        setProject(data);
        if (data.duration) setMaxDuration(Math.max(60, data.duration + 10));
      } else {
        setActiveProjectId(null);
        setProject(null);
        loadProjects();
      }
    } catch (e) {
      console.error(e);
      setActiveProjectId(null);
      setProject(null);
    }
  };

  const loadLibrary = async () => {
    try {
      const res = await fetch('/api/library');
      if (res.ok) setLibrary(await res.json());
    } catch (e) { console.error(e); }
  };

  const deleteProject = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadProjects();
        if (projectId === id) { setActiveProjectId(null); setProject(null); }
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadProject(); loadLibrary(); }, [projectId]);
  useEffect(() => { loadProjects(); }, []);
  useEffect(() => { if (showProjectsModal || !projectId) loadProjects(); }, [showProjectsModal, projectId]);
  useEffect(() => { if (selectedClip) setAspectRatioOpen(false); }, [selectedClip]);
  useEffect(() => () => { if (previewAudioRef.current) previewAudioRef.current.pause(); }, []);

  // Auto-save
  const saveProject = async (p = project) => {
    if (!p) return;
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (project) {
      const t = setTimeout(() => saveProject(project), 1000);
      return () => clearTimeout(t);
    }
  }, [project]);

  const emptyTimelineFileInputRef = useRef(null);

  // Auto-expand maxDuration to fit all clips
  useEffect(() => {
    if (!project) return;
    let longest = 60; // baseline minimum
    Object.values(project.tracks).forEach(clips => {
      (clips || []).forEach(clip => {
        const end = clip.start + clip.duration;
        if (end > longest) longest = end;
      });
    });
    if (project.duration > longest) longest = project.duration;
    // Set max duration with 10s of buffer, rounded up
    setMaxDuration(Math.ceil(longest + 10));
  }, [project]);

  const fitTimelineZoom = () => {
    setZoom(1);
  };

  const formatRulerTime = (seconds) => {
    if (seconds === 0) return '0s';
    if (seconds % 1 !== 0) {
      return `${seconds.toFixed(2)}s`;
    }
    if (seconds < 60) return `${seconds}s`;
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      if (mins === 0 && secs === 0) return `${hrs}h`;
      if (secs === 0) return `${hrs}h ${mins}m`;
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return secs === 0 ? `${mins}m` : `${mins}m ${secs}s`;
  };

  const handleSmartUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setIsUploading(true);
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const response = await fetch('/api/upload/smart', {
          method: 'POST',
          body: fd
        });
        if (response.ok) {
          const data = await response.json();
          const trackType = data.type || (file.type.startsWith('video') ? 'video' : file.type.startsWith('image') ? 'image' : 'audio');
          addAssetToTimeline({
            path: data.saved_path || data.file_path || file.name,
            filename: data.filename || file.name,
          }, trackType);
        } else {
          const objectUrl = URL.createObjectURL(file);
          const trackType = file.type.startsWith('video') ? 'video' : file.type.startsWith('image') ? 'image' : 'audio';
          addAssetToTimeline({
            path: objectUrl,
            filename: file.name,
          }, trackType);
        }
      } catch (err) {
        console.error('File upload error, using local URL:', err);
        const objectUrl = URL.createObjectURL(file);
        const trackType = file.type.startsWith('video') ? 'video' : file.type.startsWith('image') ? 'image' : 'audio';
        addAssetToTimeline({
          path: objectUrl,
          filename: file.name,
        }, trackType);
      }
    }
    setIsUploading(false);
    loadLibrary();
  };

  const handleEmptyTimelineUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !project) return;
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const response = await fetch('/api/upload/smart', {
          method: 'POST',
          body: fd
        });
        if (response.ok) {
          const data = await response.json();
          const trackType = data.type; // 'video', 'image', 'audio'
          addAssetToTimeline({
            path: data.saved_path || data.file_path,
            filename: data.filename || file.name,
          }, trackType);
        } else {
          const objectUrl = URL.createObjectURL(file);
          const trackType = file.type.startsWith('video') ? 'video' : file.type.startsWith('image') ? 'image' : 'audio';
          addAssetToTimeline({
            path: objectUrl,
            filename: file.name,
          }, trackType);
        }
      } catch (err) {
        console.error('File upload failed:', err);
        const objectUrl = URL.createObjectURL(file);
        const trackType = file.type.startsWith('video') ? 'video' : file.type.startsWith('image') ? 'image' : 'audio';
        addAssetToTimeline({
          path: objectUrl,
          filename: file.name,
        }, trackType);
      }
    }
    loadLibrary();
  };

  // ─── Playback ─────────────────────────────────────────────────────────────
  const togglePlay = () => {
    setIsPlaying(prev => {
      if (!prev) {
        let maxClipEnd = 0;
        let hasClips = false;
        const currentProject = projectRef.current;
        if (currentProject && currentProject.tracks) {
          Object.values(currentProject.tracks).forEach(clips => {
            (clips || []).forEach(clip => {
              hasClips = true;
              const clipEnd = clip.start + clip.duration;
              if (clipEnd > maxClipEnd) maxClipEnd = clipEnd;
            });
          });
        }
        const endThreshold = hasClips ? maxClipEnd : (currentProject?.duration || 30.0);
        if (currentTime >= endThreshold - 0.05) {
          setCurrentTime(0);
        }
      }
      return !prev;
    });
  };

  const animLoop = (ts) => {
    lastTimestampRef.current ||= ts;
    const dt = (ts - lastTimestampRef.current) / 1000;
    lastTimestampRef.current = ts;

    let maxClipEnd = 0;
    let hasClips = false;
    const currentProject = projectRef.current;
    if (currentProject && currentProject.tracks) {
      Object.values(currentProject.tracks).forEach(clips => {
        (clips || []).forEach(clip => {
          hasClips = true;
          const clipEnd = clip.start + clip.duration;
          if (clipEnd > maxClipEnd) maxClipEnd = clipEnd;
        });
      });
    }
    const endThreshold = hasClips ? maxClipEnd : (currentProject?.duration || 30.0);

    let nextIsPlaying = true;
    setCurrentTime(prev => {
      const next = prev + dt;
      if (next >= endThreshold) {
        setIsPlaying(false);
        nextIsPlaying = false;
        // Pause all media elements immediately
        document.querySelectorAll('.canvas-video, .canvas-audio').forEach(el => {
          try { el.pause(); } catch {}
        });
        return endThreshold;
      }
      return next;
    });

    if (isPlayingRef.current && nextIsPlaying) {
      animFrameRef.current = requestAnimationFrame(animLoop);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      lastTimestampRef.current = 0;
      animFrameRef.current = requestAnimationFrame(animLoop);
    } else {
      cancelAnimationFrame(animFrameRef.current);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying]);

  // ─── Observe preview area size (responds to browser zoom + window resize) ──
  useEffect(() => {
    const el = previewAreaRef.current;
    if (!el) return;

    const update = () => {
      const r = el.getBoundingClientRect();
      setPreviewAreaSize({ w: r.width, h: r.height });
    };
    update(); // initial measurement

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => { ro.disconnect(); window.removeEventListener('resize', update); };
  }, []);

  // Sync canvas videos/audios
  useEffect(() => {
    const activeTime = currentTime;
    document.querySelectorAll('.canvas-video, .canvas-audio').forEach(el => {
      const start       = parseFloat(el.getAttribute('data-start'));
      const dur         = parseFloat(el.getAttribute('data-duration'));
      const sourceStart = parseFloat(el.getAttribute('data-source-start') || '0');
      const speed       = parseFloat(el.getAttribute('data-speed') || '1.0');
      const vol         = parseFloat(el.getAttribute('data-volume') || '100');
      const muted       = el.getAttribute('data-muted') === 'true';

      const targetVol = muted ? 0 : vol / 100;
      if (el.volume !== targetVol) {
        el.volume = targetVol;
      }
      
      const targetSpeed = speed * playbackSpeed;
      if (el.playbackRate !== targetSpeed) {
        try { el.playbackRate = targetSpeed; } catch {}
      }

      const isWithinRange = activeTime >= start && activeTime <= start + dur;
      if (isWithinRange) {
        const ct = sourceStart + (activeTime - start) * speed;
        // Avoid constant seeking (flushing buffer) during active play
        const threshold = isPlaying ? 0.8 : 0.05;
        if (Math.abs(el.currentTime - ct) > threshold) {
          el.currentTime = ct;
        }

        if (isPlaying) {
          if (el.paused) {
            el.play().catch(() => {});
          }
        } else {
          if (!el.paused) {
            el.pause();
          }
        }
      } else {
        if (!el.paused) {
          el.pause();
        }
      }
    });
  }, [currentTime, isPlaying, playbackSpeed]);


  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault(); togglePlay();
      }
      if (e.code === 'Delete' && selectedClip) deleteClip(selectedClip);
      if (e.ctrlKey && e.code === 'KeyZ') { e.preventDefault(); undo(); }
      if (e.ctrlKey && e.code === 'KeyY') { e.preventDefault(); redo(); }
      if (e.ctrlKey && e.code === 'KeyC' && selectedClip) { e.preventDefault(); setClipboard({ ...selectedClip }); }
      if (e.ctrlKey && e.code === 'KeyV' && clipboard)    { e.preventDefault(); pasteClip(); }
      if (e.ctrlKey && e.code === 'KeyS') { e.preventDefault(); saveProject(); alert('Project Saved!'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedClip, clipboard, isPlaying, project, currentTime]);

  // Window resize drag handlers
  useEffect(() => {
    const onMove = (e) => {
      if (isDraggingPlayhead) {
        if (timelineScrollRef.current) {
          const rect = timelineScrollRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left + timelineScrollRef.current.scrollLeft - TRACK_LABEL_WIDTH;
          const limit = getContentEndTime();
          const t = Math.max(0, Math.min(limit, x / pxPerSec));
          setCurrentTime(t);
        }
      } else if (isResizingTimeline) {
        const maxH = Math.floor(window.innerHeight / 2);
        const minH = 142; // Exactly 2 timeline track lines (toolbar 38 + ruler 32 + 2 tracks 72)
        const h = Math.max(minH, Math.min(maxH, window.innerHeight - e.clientY));
        setTimelineHeight(h);
      }
    };
    const onUp = () => {
      setIsDraggingPlayhead(false);
      setIsResizingTimeline(false);
    };
    if (isDraggingPlayhead || isResizingTimeline) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isDraggingPlayhead, isResizingTimeline, project, zoom, pxPerSec]);

  // ─── Audio preview ────────────────────────────────────────────────────────
  const togglePreviewAudio = (e, file) => {
    e.stopPropagation();
    if (previewAudioId === file.path) {
      previewAudioRef.current?.pause();
      setPreviewAudioId(null);
    } else {
      previewAudioRef.current?.pause();
      const a = new Audio(toUrlPath(file.path));
      a.play().catch(err => console.log('Audio preview failed:', err));
      previewAudioRef.current = a;
      setPreviewAudioId(file.path);
      a.onended = () => setPreviewAudioId(null);
    }
  };

  // ─── History ──────────────────────────────────────────────────────────────
  const pushHistory = (tracks) => {
    setHistoryPast(p => [...p, JSON.stringify(tracks)]);
    setHistoryFuture([]);
  };

  const updateTracksAndSyncDuration = (updatedTracks) => {
    let maxEnd = 30.0;
    Object.values(updatedTracks).forEach(clips => {
      (clips || []).forEach(clip => {
        const end = clip.start + clip.duration;
        if (end > maxEnd) maxEnd = end;
      });
    });
    setProject(p => ({ ...p, duration: maxEnd, tracks: updatedTracks }));
    setMaxDuration(Math.ceil(maxEnd + 10));
  };

  const updateClipProperties = (updatedClip) => {
    if (!updatedClip || !project || !project.tracks) return;
    const trackName = updatedClip.track;
    if (!trackName) return;

    const currentTrackClips = project.tracks[trackName] || [];
    const updatedTrackClips = currentTrackClips.map(clip =>
      clip.id === updatedClip.id ? updatedClip : clip
    );

    const updatedTracks = {
      ...project.tracks,
      [trackName]: updatedTrackClips
    };

    updateTracksAndSyncDuration(updatedTracks);
    setSelectedClip(updatedClip);
  };

  const undo = () => {
    if (!historyPast.length) return;
    const prev = historyPast[historyPast.length - 1];
    setHistoryPast(p => p.slice(0, p.length - 1));
    setHistoryFuture(f => [...f, JSON.stringify(project.tracks)]);
    setProject(p => ({ ...p, tracks: JSON.parse(prev) }));
    setSelectedClip(null);
  };

  const redo = () => {
    if (!historyFuture.length) return;
    const next = historyFuture[historyFuture.length - 1];
    setHistoryFuture(f => f.slice(0, f.length - 1));
    setHistoryPast(p => [...p, JSON.stringify(project.tracks)]);
    setProject(p => ({ ...p, tracks: JSON.parse(next) }));
    setSelectedClip(null);
  };

  // ─── UUID helper ──────────────────────────────────────────────────────────
  const uuidv4 = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const getContentEndTime = () => {
    if (!project || !project.tracks) return 0;
    let maxClipEnd = 0;
    let hasClips = false;
    Object.values(project.tracks).forEach(clips => {
      (clips || []).forEach(clip => {
        hasClips = true;
        const clipEnd = clip.start + clip.duration;
        if (clipEnd > maxClipEnd) maxClipEnd = clipEnd;
      });
    });
    return hasClips ? maxClipEnd : (project.duration || 30.0);
  };

  const toggleClipMute = (clip) => {
    pushHistory(project.tracks);
    const updatedClip = { ...clip, mute: !clip.mute };
    updateClipProperties(updatedClip);
  };

  // ─── Layer ordering & Context Menu ─────────────────────────────────────────
  const changeClipLayer = (clip, action) => {
    if (!clip || !project || !project.tracks) return;
    pushHistory(project.tracks);
    const trackClips = project.tracks[clip.track] || [];
    const idx = trackClips.findIndex(c => c.id === clip.id);
    if (idx === -1) return;

    let updated = [...trackClips];
    if (action === 'bringForward' && idx < updated.length - 1) {
      const temp = updated[idx];
      updated[idx] = updated[idx + 1];
      updated[idx + 1] = temp;
    } else if (action === 'sendBackward' && idx > 0) {
      const temp = updated[idx];
      updated[idx] = updated[idx - 1];
      updated[idx - 1] = temp;
    } else if (action === 'bringToFront') {
      updated = updated.filter(c => c.id !== clip.id);
      updated.push(clip);
    } else if (action === 'sendToBack') {
      updated = updated.filter(c => c.id !== clip.id);
      updated.unshift(clip);
    }

    const updatedTracks = {
      ...project.tracks,
      [clip.track]: updated
    };
    updateTracksAndSyncDuration(updatedTracks);
  };

  const copyClip = (clip) => {
    if (!clip) return;
    setCopiedClip({ ...clip });
  };

  const pasteClip = () => {
    if (!copiedClip || !project) return;
    pushHistory(project.tracks);
    const newClip = {
      ...copiedClip,
      id: `clip_${uuidv4()}`,
      start: currentTime,
      x: Math.min(90, (copiedClip.x ?? 50) + 3),
      y: Math.min(90, (copiedClip.y ?? 50) + 3),
    };
    const targetTrack = copiedClip.track || 'track8';
    const updated = {
      ...project.tracks,
      [targetTrack]: [...(project.tracks[targetTrack] || []), newClip]
    };
    updateTracksAndSyncDuration(updated);
    setSelectedClip(newClip);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);
      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (selectedClip) {
          e.preventDefault();
          copyClip(selectedClip);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        pasteClip();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        if (selectedClip) {
          e.preventDefault();
          duplicateClip(selectedClip);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedClip && !selectedClip.locked) {
          e.preventDefault();
          deleteClip(selectedClip);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redoHistory();
        } else {
          e.preventDefault();
          undoHistory();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redoHistory();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClip, copiedClip, project]);

  // ─── Add asset to timeline ────────────────────────────────────────────────
  const addAssetToTimeline = async (asset, trackType) => {
    if (!project || !asset) return;

    // Dynamically assign target track based on matching clip categories or empty tracks
    const incomingCategory = (() => {
      if (['sticker'].includes(trackType) || (asset && (asset.isSticker || asset.category))) {
        return 'sticker';
      }
      if (['text', 'caption'].includes(trackType) || (asset && asset.text !== undefined && !asset.isSticker && !asset.category)) {
        return 'text';
      }
      if (['audio', 'music', 'voiceover'].includes(trackType)) {
        return 'audio';
      }
      if (asset && asset.path) {
        const ext = asset.path.split('.').pop().toLowerCase();
        if (['mp3','wav','m4a','ogg','aac'].includes(ext)) {
          return 'audio';
        }
      }
      return 'video';
    })();

    const getClipCategory = (clip) => {
      if (!clip) return 'video';
      if (clip.isSticker || clip.category) return 'sticker';
      if (clip.text !== undefined) return 'text';
      if (clip.path) {
        const ext = clip.path.split('.').pop().toLowerCase();
        if (['mp3','wav','m4a','ogg','aac'].includes(ext)) return 'audio';
      }
      return 'video';
    };

    const allTracks = ['track1', 'track2', 'track3', 'track4', 'track5', 'track6', 'track7', 'track8'];
    let targetTrack = null;
    if (trackType === 'sticker' || (asset && (asset.isSticker || asset.category))) {
      targetTrack = 'track8';
    } else {
      // First look for a track that already contains clips of this category
      for (const trackKey of allTracks) {
        const clips = project.tracks[trackKey] || [];
        if (clips.length > 0 && clips[0]) {
          if (getClipCategory(clips[0]) === incomingCategory) {
            targetTrack = trackKey;
            break;
          }
        }
      }

      // If no matching category track is found, look for a completely empty track
      if (!targetTrack) {
        for (const trackKey of allTracks) {
          const clips = project.tracks[trackKey] || [];
          if (clips.length === 0) {
            targetTrack = trackKey;
            break;
          }
        }
      }

      // Fallback to the first active track or track1 if none are found
      if (!targetTrack) {
        const activeKeys = Object.keys(customActiveTracks).filter(k => customActiveTracks[k]).sort();
        targetTrack = activeKeys[0] || 'track1';
      }
    }

    // Activate the track if it is not already active
    if (!customActiveTracks[targetTrack]) {
      setCustomActiveTracks(prev => ({
        ...prev,
        [targetTrack]: true
      }));
    }

    let defaultDuration = 5.0;
    if (['audio','video','voiceover','music'].includes(trackType)) {
      defaultDuration = 10.0;
      if (asset.path) {
        try {
          defaultDuration = await new Promise((resolve) => {
            if (trackType === 'video') {
              const video = document.createElement('video');
              video.preload = 'metadata';
              video.muted = true;
              video.playsInline = true;
              video.src = toUrlPath(asset.path);
              video.onloadedmetadata = () => resolve(video.duration || 10.0);
              video.onerror = () => resolve(10.0);
              setTimeout(() => resolve(10.0), 1200);
            } else {
              const audio = new Audio(toUrlPath(asset.path));
              audio.preload = 'metadata';
              audio.src = toUrlPath(asset.path);
              audio.onloadedmetadata = () => resolve(audio.duration || 10.0);
              audio.onerror = () => resolve(10.0);
              setTimeout(() => resolve(10.0), 1200);
            }
          });
        } catch (e) {
          console.error('Error fetching media duration:', e);
        }
      }
    }

    pushHistory(project.tracks);

    // Sequentially or playhead placement
    const existingClips = project.tracks[targetTrack] || [];
    let startTime;
    if (['text', 'caption'].includes(trackType) && !asset.isSticker && !asset.category) {
      startTime = currentTime;
    } else if (existingClips.length > 0) {
      const lastEnd = Math.max(...existingClips.map(c => (c.start || 0) + (c.duration || 5)));
      startTime = lastEnd;
    } else {
      startTime = 0;
    }

    const newClip = {
      id: `clip_${uuidv4()}`,
      track: targetTrack,
      path: asset.path,
      filename: asset.filename,
      start: startTime,
      duration: defaultDuration,
      originalDuration: defaultDuration,
      sourceStart: 0.0,
      speed: 1.0,
      volume: 100,
      mute: false,
      x: 50, y: 50,
      scale: 1.0,
      opacity: 100,
      rotation: 0,
      fitMode: 'contain',
      filter: 'none',
      borderRadius: 0,
      brightness: 0,
      contrast: 0,
      exposure: 0,
      hue: 0,
      saturation: 0,
      sharpen: 0,
      noise: 0,
      blur: 0,
      vignette: 0,
      paddingSpace: 0,
      paddingBackground: 'transparent',
      enterAnimation: 'none',
      exitAnimation: 'none',
    };

    if (trackType === 'text' || trackType === 'sticker' || asset.text !== undefined || asset.isSticker || asset.category !== undefined) {
      newClip.isSticker = trackType === 'sticker' || !!asset.isSticker || asset.category !== undefined;
      newClip.category = asset.category || (asset.id?.startsWith('shp_') ? 'Shapes' : asset.id?.startsWith('bdg_') ? 'Badges' : asset.id?.startsWith('vis_') ? 'Visualizers' : 'Icons');
      newClip.text = asset.text || asset.filename || 'Element Clip';
      newClip.minDb = asset.minDb ?? -80;
      newClip.maxDb = asset.maxDb ?? 40;
      newClip.fontFamily = asset.fontFamily || 'Inter';
      newClip.fontWeight = asset.fontWeight || 'Bold';
      newClip.fontSize = asset.fontSize || 36;
      newClip.color = asset.color || '#ffffff';
      newClip.highlightColor = asset.highlightColor || (asset.stylePreset === 'highlight_box' ? '#4b4ded' : '#ffd21f');
      newClip.stylePreset = asset.stylePreset || 'default';
      newClip.y = asset.y ?? (newClip.isSticker ? 50 : 80);
      newClip.x = asset.x ?? 50;
      newClip.svgContent = asset.svgContent || null;
      newClip.svgColor = asset.color || asset.svgColor || '#ffffff';
      newClip.flipH = asset.isFlipH || asset.flipH || false;
      newClip.flipV = asset.isFlipV || asset.flipV || false;
      newClip.opacity = asset.opacity ?? 100;
      newClip.rotation = asset.rotation ?? 0;
      newClip.scale = asset.scale ?? 1.0;
      newClip.shadowEnabled = asset.shadowEnabled || false;
      newClip.shadowColor = asset.shadowColor || 'rgba(0,0,0,0.6)';
      newClip.shadowX = asset.shadowX ?? 2;
      newClip.shadowY = asset.shadowY ?? 2;
      newClip.shadowBlur = asset.shadowBlur ?? 4;
      newClip.glowEnabled = asset.glowEnabled || false;
      newClip.glowColor = asset.glowColor || '#00a8ff';
      newClip.glowBlur = asset.glowBlur ?? 12;
      newClip.borderWidth = asset.borderWidth ?? 0;
      newClip.borderColor = asset.borderColor || '#ffffff';
      newClip.borderStyle = asset.borderStyle || 'solid';
      newClip.locked = false;
      newClip.hidden = false;
      newClip.zIndex = Date.now();
      if (asset.italic !== undefined) newClip.italic = asset.italic;
      if (asset.bold !== undefined) newClip.bold = asset.bold;
      if (asset.underline !== undefined) newClip.underline = asset.underline;
      if (asset.bgEnabled !== undefined) newClip.bgEnabled = asset.bgEnabled;
      if (asset.textBgColor !== undefined) newClip.textBgColor = asset.textBgColor;
      if (asset.padding !== undefined) newClip.padding = asset.padding;
      if (asset.textBorderRadius !== undefined) newClip.textBorderRadius = asset.textBorderRadius;
      if (asset.borderRadius !== undefined) newClip.textBorderRadius = asset.borderRadius;
      if (asset.outlineEnabled !== undefined) newClip.outlineEnabled = asset.outlineEnabled;
      if (asset.outlineColor !== undefined) newClip.outlineColor = asset.outlineColor;
      if (asset.outlineWidth !== undefined) newClip.outlineWidth = asset.outlineWidth;
      if (asset.letterSpacing !== undefined) newClip.letterSpacing = asset.letterSpacing;
      if (asset.align !== undefined) newClip.align = asset.align;
    }

    const updatedTracks = {
      ...project.tracks,
      [targetTrack]: [...(project.tracks[targetTrack] || []), newClip],
    };

    updateTracksAndSyncDuration(updatedTracks);
    setSelectedClip(newClip);
    setCurrentTime(startTime);
  };



  // ─── Clip operations ──────────────────────────────────────────────────────
  const duplicateClip = (clip) => {
    pushHistory(project.tracks);
    const newClip = { ...clip, id: `clip_${uuidv4()}`, start: clip.start + clip.duration };
    const updated = { ...project.tracks, [clip.track]: [...(project.tracks[clip.track] || []), newClip] };
    updateTracksAndSyncDuration(updated);
    setSelectedClip(newClip);
  };

  const deleteClip = (clip) => {
    pushHistory(project.tracks);
    const updated = { ...project.tracks, [clip.track]: (project.tracks[clip.track] || []).filter(c => c.id !== clip.id) };
    updateTracksAndSyncDuration(updated);
    setSelectedClip(null);
  };

  const detachAudio = (clip) => {
    if (!clip || !clip.path) return;
    pushHistory(project.tracks);
    const audioClip = {
      id: `clip_${uuidv4()}`,
      path: clip.path,
      filename: `Audio - ${clip.filename || 'Clip'}`,
      start: clip.start,
      duration: clip.duration,
      originalDuration: clip.originalDuration || clip.duration,
      sourceStart: clip.sourceStart || 0,
      speed: clip.speed || 1.0,
      volume: 100,
      mute: false,
      x: 50, y: 50,
      scale: 1.0,
      opacity: 100,
      rotation: 0,
      fitMode: 'contain',
      filter: 'none',
      borderRadius: 0,
      brightness: 0,
      contrast: 0,
      exposure: 0,
      hue: 0,
      saturation: 0,
      sharpen: 0,
      noise: 0,
      blur: 0,
      vignette: 0,
      paddingSpace: 0,
      paddingBackground: 'transparent',
      enterAnimation: 'none',
      exitAnimation: 'none',
      track: 'track3'
    };
    const updatedVideoClip = { ...clip, volume: 0, mute: true };
    const updatedTracks = { ...project.tracks };
    if (updatedTracks[clip.track]) {
      updatedTracks[clip.track] = updatedTracks[clip.track].map(c => c.id === clip.id ? updatedVideoClip : c);
    }
    
    // Find generic track target (generic tracks are track1 to track8)
    const allTracks = ['track1', 'track2', 'track3', 'track4', 'track5', 'track6', 'track7', 'track8'];
    let targetTrack = null;

    // Helper to detect audio clip
    const isAudioClip = (c) => {
      if (c.text !== undefined) return false;
      if (c.path) {
        const ext = c.path.split('.').pop().toLowerCase();
        if (['mp3','wav','m4a','ogg','aac'].includes(ext)) return true;
      }
      return false;
    };

    // 1. Look for an active track that already contains audio clips
    for (const trackKey of allTracks) {
      if (trackKey === clip.track) continue; // don't put it on the same track as the video
      const clips = updatedTracks[trackKey] || [];
      if (clips.length > 0) {
        if (isAudioClip(clips[0])) {
          targetTrack = trackKey;
          break;
        }
      }
    }

    // 2. Look for a completely empty track
    if (!targetTrack) {
      for (const trackKey of allTracks) {
        const clips = updatedTracks[trackKey] || [];
        if (clips.length === 0) {
          targetTrack = trackKey;
          break;
        }
      }
    }

    // 3. Fallback to track3
    if (!targetTrack) {
      targetTrack = 'track3';
    }

    // Activate the track if it is not already active
    if (!customActiveTracks[targetTrack]) {
      setCustomActiveTracks(prev => ({
        ...prev,
        [targetTrack]: true
      }));
    }

    audioClip.track = targetTrack;
    updatedTracks[targetTrack] = [...(updatedTracks[targetTrack] || []), audioClip];
    updateTracksAndSyncDuration(updatedTracks);
    setSelectedClip(updatedVideoClip);
  };

  const splitClipAtPlayhead = (clip) => {
    if (currentTime <= clip.start || currentTime >= clip.start + clip.duration) {
      alert('Move playhead over the clip to split.'); return;
    }
    pushHistory(project.tracks);
    const leftDur = currentTime - clip.start;
    const rightDur = clip.start + clip.duration - currentTime;
    const left  = { ...clip, duration: leftDur };
    const right = { ...clip, id: `clip_${uuidv4()}`, start: currentTime, duration: rightDur, sourceStart: clip.sourceStart + leftDur * clip.speed };
    const updated = {
      ...project.tracks,
      [clip.track]: [...(project.tracks[clip.track] || []).filter(c => c.id !== clip.id), left, right],
    };
    updateTracksAndSyncDuration(updated);
    setSelectedClip(right);
  };

  // ─── Upload handlers ──────────────────────────────────────────────────────
  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', type);
    try {
      const res = await (await fetch('/api/upload', { method: 'POST', body: fd })).json();
      if (res.status === 'success') { loadLibrary(); alert('Uploaded successfully!'); }
    } catch (e) { console.error(e); }
    finally { setIsUploading(false); }
  };

  // ─── Text Panel Redesign Handlers ──────────────────────────────────────────
  const toggleFavoriteText = (title) => {
    let nextFavs;
    if (favoriteTextStyles.includes(title)) {
      nextFavs = favoriteTextStyles.filter(t => t !== title);
    } else {
      nextFavs = [...favoriteTextStyles, title];
    }
    setFavoriteTextStyles(nextFavs);
    localStorage.setItem('fav_text_styles', JSON.stringify(nextFavs));
  };

  const trackRecentStyle = (presetItem) => {
    let nextRecents = recentTextStyles.filter(item => item.title !== presetItem.title);
    nextRecents = [presetItem, ...nextRecents];
    if (nextRecents.length > 20) {
      nextRecents = nextRecents.slice(0, 20);
    }
    setRecentTextStyles(nextRecents);
    localStorage.setItem('recent_text_styles', JSON.stringify(nextRecents));
  };

  const saveCurrentTextStyle = () => {
    if (!selectedClip || selectedClip.text === undefined) {
      alert('Please select a text clip on the timeline first to save its style!');
      return;
    }
    const styleName = prompt('Enter a name for your custom text style:', `Custom ${selectedClip.text.slice(0, 10)}`);
    if (!styleName) return;

    const newStyle = {
      title: styleName,
      preset: selectedClip.stylePreset || 'default',
      sub: 'Custom Saved Style',
      color: selectedClip.color || '#ffffff',
      customClass: `preset-${selectedClip.stylePreset || 'default'}`,
      category: 'My Styles',
      isCustom: true,
      fontFamily: selectedClip.fontFamily,
      fontWeight: selectedClip.fontWeight,
    };

    const nextStyles = [newStyle, ...myStyles];
    setMyStyles(nextStyles);
    localStorage.setItem('my_text_styles', JSON.stringify(nextStyles));
    alert(`Style "${styleName}" saved to "My Styles" category!`);
  };

  const importStylePack = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const imported = Array.isArray(data) ? data : [data];
        const validated = imported.filter(item => item && item.title && item.preset);
        if (validated.length === 0) {
          alert('Invalid style pack file structure. Presets require at least "title" and "preset" keys.');
          return;
        }
        const normalized = validated.map(item => ({
          ...item,
          category: 'My Styles',
          isCustom: true,
          customClass: item.customClass || `preset-${item.preset || 'default'}`
        }));
        const nextStyles = [...normalized, ...myStyles];
        setMyStyles(nextStyles);
        localStorage.setItem('my_text_styles', JSON.stringify(nextStyles));
        alert(`Successfully imported ${normalized.length} style(s) into "My Styles"!`);
      } catch (err) {
         alert('Failed to parse style pack JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    // Clear value to allow re-uploading same file name
    event.target.value = '';
  };

  // ─── SRT / Caption handlers ───────────────────────────────────────────────
  const generateCaptionsFromSRT = async () => {
    if (!srtFile) return;
    const fd = new FormData();
    fd.append('file', srtFile);
    try {
      const data = await (await fetch('/api/captions/srt', { method: 'POST', body: fd })).json();
      if (data.status === 'success') {
        pushHistory(project.tracks);
        const clips = data.segments.map((s, i) => ({
          id: `caption_${i}_${uuidv4()}`,
          track: 'text2', text: s.text,
          start: s.start, duration: Math.max(0.5, s.end - s.start),
          x: 50, y: 80, fontSize: 28, fontFamily: 'Inter', fontWeight: 'Bold',
          color: '#ffffff', highlightColor: '#ffd21f', stylePreset: captionStyle,
          scale: 1, opacity: 1,
        }));
        setProject(p => ({ ...p, tracks: { ...p.tracks, text2: clips } }));
        alert('Captions generated from SRT!');
      }
    } catch (e) { console.error(e); }
  };

  const generateCaptionsFromScript = async () => {
    if (!scriptText.trim()) return;
    try {
      const data = await (await fetch('/api/captions/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script_text: scriptText, duration: project.duration }),
      })).json();
      if (data.status === 'success') {
        pushHistory(project.tracks);
        const clips = data.segments.map((s, i) => ({
          id: `caption_${i}_${uuidv4()}`,
          track: 'track8', text: s.text,
          start: s.start, duration: Math.max(0.5, s.end - s.start),
          x: 50, y: 80, fontSize: 28, fontFamily: 'Inter', fontWeight: 'Bold',
          color: '#ffffff', highlightColor: '#ffd21f', stylePreset: captionStyle,
          scale: 1, opacity: 1,
        }));
        setProject(p => ({ ...p, tracks: { ...p.tracks, track8: clips } }));
        setCustomActiveTracks(prev => ({ ...prev, track8: true }));
        alert('Captions generated from Script!');
      }
    } catch (e) { console.error(e); }
  };

  const generateAutoCaptions = async () => {
    let voiceClips = [];
    Object.values(project.tracks).forEach(clips => {
      (clips || []).forEach(clip => {
        if (clip.path) {
          const ext = clip.path.split('.').pop().toLowerCase();
          if (['mp3','wav','m4a','ogg','aac'].includes(ext)) {
            voiceClips.push(clip);
          }
        }
      });
    });
    if (voiceClips.length === 0) { alert('Please add a Voice Over track to generate auto captions.'); return; }
    const audioPath = voiceClips[0].path;
    try {
      const fd = new FormData();
      fd.append('audio_path', audioPath);
      const data = await (await fetch('/api/captions/auto', { method: 'POST', body: fd })).json();
      if (data.status === 'success') {
        pushHistory(project.tracks);
        const clips = data.segments.map((s, i) => ({
          id: `caption_${i}_${uuidv4()}`,
          track: 'track8', text: s.text,
          start: s.start, duration: Math.max(0.5, s.end - s.start),
          x: 50, y: 80, fontSize: 28, fontFamily: 'Inter', fontWeight: 'Bold',
          color: '#ffffff', highlightColor: '#ffd21f', stylePreset: captionStyle,
          scale: 1, opacity: 1,
        }));
        setProject(p => ({ ...p, tracks: { ...p.tracks, track8: clips } }));
        setCustomActiveTracks(prev => ({ ...prev, track8: true }));
        alert('Auto Captions generated with local Whisper model!');
      }
    } catch (e) { console.error(e); }
  };

  const matchAvatarToVoice = () => {
    let avatarClips = [];
    let voiceClips = [];
    Object.entries(project.tracks).forEach(([trackName, clips]) => {
      (clips || []).forEach(clip => {
        if (clip.filename?.includes('Avatar') || clip.id?.startsWith('av_')) {
          avatarClips.push({ ...clip, track: trackName });
        } else if (clip.path) {
          const ext = clip.path.split('.').pop().toLowerCase();
          if (['mp3','wav','m4a','ogg','aac'].includes(ext)) {
            voiceClips.push({ ...clip, track: trackName });
          }
        }
      });
    });
    if (!avatarClips.length || !voiceClips.length) {
      alert('Need both an Avatar video clip and Voice Over audio clip on timeline.'); return;
    }
    pushHistory(project.tracks);
    const dur = voiceClips[0].duration;
    const targetTrack = avatarClips[0].track;
    const updatedTrackClips = project.tracks[targetTrack].map(c => c.id === avatarClips[0].id ? { ...c, duration: dur } : c);
    setProject(p => ({ ...p, tracks: { ...p.tracks, [targetTrack]: updatedTrackClips } }));
    alert(`Avatar video matched voice duration: ${dur.toFixed(2)} seconds.`);
  };

  // ─── Canvas dragging ──────────────────────────────────────────────────────
  const handleCanvasMouseDown = (e, clip) => {
    e.stopPropagation();
    setSelectedClip(clip);
    setCanvasDragging(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setDragStartClipPos({ x: clip.x ?? 50, y: clip.y ?? 50 });
  };

  const handleCanvasResizeStart = (e, clip, handle) => {
    e.stopPropagation();
    if (handle === 'rotate') {
      const wrapper = e.target.closest('.canvas-media-wrapper') || e.target.closest('.canvas-text-clip') || e.target.closest('.canvas-sticker-clip') || e.target.closest('.canvas-badge-sticker');
      const rect = wrapper ? wrapper.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      setCanvasResizing({
        clip,
        handle,
        centerX,
        centerY,
        startX: e.clientX,
        startY: e.clientY,
      });
      return;
    }
    const isStickerOrText = clip.isSticker || clip.text !== undefined || clip.svgContent;
    const startVal = isStickerOrText ? (clip.fontSize || 36) : (clip.scale || 1.0);
    setCanvasResizing({
      clip,
      handle,
      startVal,
      startScale: clip.scale || 1.0,
      startX: e.clientX,
      startY: e.clientY,
      startCropTop: clip.cropTop ?? 0,
      startCropBottom: clip.cropBottom ?? 0,
      startCropLeft: clip.cropLeft ?? 0,
      startCropRight: clip.cropRight ?? 0,
    });
  };

  const handleCanvasMouseMove = (e) => {
    if (canvasResizing) {
      const { clip, handle, startVal, startScale, startX, startY, startCropTop, startCropBottom, startCropLeft, startCropRight, centerX, centerY } = canvasResizing;

      if (handle === 'rotate') {
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        let rotation = Math.round(currentAngle + 90);
        if (rotation < 0) rotation += 360;
        if (rotation >= 360) rotation -= 360;

        // Magnetic snapping within 4 degrees of cardinal angles (0, 45, 90, 180, 270)
        if (rotation < 4 || rotation > 356) rotation = 0;
        else if (Math.abs(rotation - 45) < 4) rotation = 45;
        else if (Math.abs(rotation - 90) < 4) rotation = 90;
        else if (Math.abs(rotation - 180) < 4) rotation = 180;
        else if (Math.abs(rotation - 270) < 4) rotation = 270;

        updateClipProperties({ ...clip, rotation });
        return;
      }

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const isStickerOrText = clip.isSticker || clip.text !== undefined || clip.svgContent;

      if (['tl', 'tr', 'bl', 'br'].includes(handle)) {
        let delta = 0;
        if (handle === 'br') delta = (dx + dy) / 2;
        else if (handle === 'tr') delta = (dx - dy) / 2;
        else if (handle === 'bl') delta = (-dx + dy) / 2;
        else if (handle === 'tl') delta = (-dx - dy) / 2;

        if (isStickerOrText) {
          const nextFontSize = Math.max(12, Math.min(200, Math.round(startVal + delta * 0.5)));
          const nextScale = Math.max(0.2, Math.min(5.0, parseFloat((startScale + delta * 0.005).toFixed(2))));
          updateClipProperties({ ...clip, fontSize: nextFontSize, scale: nextScale });
        } else {
          const nextScale = Math.max(0.1, Math.min(5.0, parseFloat((startScale + delta * 0.005).toFixed(2))));
          updateClipProperties({ ...clip, scale: nextScale });
        }
        return;
      }
    }

    if (canvasDragging && selectedClip && canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      const dx = e.clientX - dragStartPos.x;
      const dy = e.clientY - dragStartPos.y;
      const dxPct = Math.round((dx / (rect.width || 640)) * 100);
      const dyPct = Math.round((dy / (rect.height || 360)) * 100);
      let nextX = Math.max(0, Math.min(100, dragStartClipPos.x + dxPct));
      let nextY = Math.max(0, Math.min(100, dragStartClipPos.y + dyPct));

      let vGuide = false;
      let hGuide = false;

      // Snapping to horizontal and vertical center guides (50%)
      if (Math.abs(nextX - 50) <= 2) {
        nextX = 50;
        vGuide = true;
      }
      if (Math.abs(nextY - 50) <= 2) {
        nextY = 50;
        hGuide = true;
      }

      setAlignmentGuides({ v: vGuide, h: hGuide });

      if (selectedClip.snapToGrid) {
        nextX = Math.round(nextX / 5) * 5;
        nextY = Math.round(nextY / 5) * 5;
      }
      updateClipProperties({ ...selectedClip, x: nextX, y: nextY });
    }
  };

  const handleCanvasMouseUp = () => {
    setCanvasDragging(false);
    setCanvasResizing(null);
    setAlignmentGuides({ v: false, h: false });
  };

  // ─── Timeline drag ────────────────────────────────────────────────────────
  const handleBlockDragStart = (e, clip, action = 'move') => {
    if (lockedTracks[clip.track]) { e.preventDefault(); return; }
    e.stopPropagation();
    // Store scroll offset at drag start so we can compensate on drop
    const scrollLeft = timelineScrollRef.current ? timelineScrollRef.current.scrollLeft : 0;
    e.dataTransfer.setData('text/plain', JSON.stringify({
      clipId: clip.id, track: clip.track, action,
      startVal: clip.start, durationVal: clip.duration, screenX: e.clientX,
      scrollLeft,
    }));
  };

  const handleTimelineDragOver = (e) => e.preventDefault();

  const handleTrackDrop = (e, targetTrack) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const dragData = JSON.parse(dataStr);

      const videoTracks  = ['video1','video2','video3','video','avatar','image'];
      if (lockedTracks[targetTrack] || lockedTracks[dragData.track]) return;

      pushHistory(project.tracks);

      // Find clip across ALL tracks
      let clip = null;
      let realSourceTrack = dragData.track;
      for (const [tk, clips] of Object.entries(project.tracks)) {
        const found = (clips || []).find(c => c.id === dragData.clipId);
        if (found) { clip = found; realSourceTrack = tk; break; }
      }
      if (!clip) return;

      // Compensate for scroll offset change between drag-start and drop
      const currentScrollLeft = timelineScrollRef.current ? timelineScrollRef.current.scrollLeft : 0;
      const scrollDelta = currentScrollLeft - (dragData.scrollLeft || 0);
      const dx = (e.clientX - dragData.screenX + scrollDelta) / pxPerSec;
      let newStart = clip.start;
      let newDuration = clip.duration;

      if (dragData.action === 'move') {
        newStart = dragData.startVal + dx;
        if (newStart < 0 || newStart * pxPerSec < 12) {
          newStart = 0;
        }
      } else if (dragData.action === 'resize-right') {
        newDuration = Math.max(0.2, dragData.durationVal + dx);
        if (clip.originalDuration && (clip.text === undefined)) {
          newDuration = Math.min(newDuration, clip.originalDuration);
        }
      } else if (dragData.action === 'resize-left') {
        newStart = dragData.startVal + dx;
        newDuration = dragData.durationVal - dx;
        let deltaStart = newStart - dragData.startVal;
        let newSourceStart = (clip.sourceStart || 0) + deltaStart;

        if (clip.originalDuration && (clip.text === undefined)) {
          if (newSourceStart < 0) {
            newStart = dragData.startVal - (clip.sourceStart || 0);
            newDuration = dragData.durationVal + dragData.startVal - newStart;
            newSourceStart = 0;
          } else if (newDuration > clip.originalDuration) {
            const diff = newDuration - clip.originalDuration;
            newStart += diff;
            newDuration = clip.originalDuration;
            newSourceStart = (clip.sourceStart || 0) + (newStart - dragData.startVal);
          }
        } else {
          if (newStart < 0) {
            newDuration = Math.max(0.2, dragData.durationVal + dragData.startVal);
            newStart = 0;
            newSourceStart = (clip.sourceStart || 0) + (newStart - dragData.startVal);
          }
        }

        if (newStart < 0 || newStart * pxPerSec < 12) {
          newDuration = Math.max(0.2, dragData.durationVal + dragData.startVal);
          if (clip.originalDuration && (clip.text === undefined)) {
            newDuration = Math.min(newDuration, clip.originalDuration);
          }
          newStart = 0;
          newSourceStart = (clip.sourceStart || 0) + (newStart - dragData.startVal);
        } else {
          newDuration = Math.max(0.2, newDuration);
        }
        
        clip.sourceStart = Math.max(0, newSourceStart);
      }

      const updatedClip = { ...clip, start: newStart, duration: newDuration, track: targetTrack };
      const updatedTracks = { ...project.tracks };

      // Remove from source track
      updatedTracks[realSourceTrack] = (project.tracks[realSourceTrack] || []).filter(c => c.id !== dragData.clipId);
      // Add to target track
      updatedTracks[targetTrack] = [...(updatedTracks[targetTrack] || []), updatedClip];

      setCustomActiveTracks(prev => ({ ...prev, [targetTrack]: true }));
      updateTracksAndSyncDuration(updatedTracks);
      if (selectedClip && selectedClip.id === dragData.clipId) setSelectedClip(updatedClip);
    } catch (e) { console.error(e); }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  const startRender = async () => {
    setExportModal(true);
    setRenderingTaskId('');
    setRenderStatus(null);
    const baseDim = exportRes === '4K' ? 2160 : exportRes === '1080p' ? 1080 : 720;
    let w, h;
    if (selectedPreset.val >= 1) {
      h = baseDim;
      w = Math.round(baseDim * selectedPreset.val);
    } else {
      w = baseDim;
      h = Math.round(baseDim / selectedPreset.val);
    }
    w = w % 2 === 0 ? w : w - 1;
    h = h % 2 === 0 ? h : h - 1;
    const res = { width: w, height: h };
    
    // Mute clips on tracks that are muted on export
    const processedTracks = {};
    Object.entries(project.tracks).forEach(([trackKey, clips]) => {
      if (mutedTracks[trackKey]) {
        processedTracks[trackKey] = (clips || []).map(c => ({ ...c, mute: true, volume: 0 }));
      } else {
        processedTracks[trackKey] = clips;
      }
    });

    const payload = { project_id: project.id, timeline: processedTracks, resolution: res, fps: parseInt(exportFps), quality: exportQuality, format: 'mp4' };
    try {
      const data = await (await fetch('/api/render', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json();
      if (data.status === 'queued') setRenderingTaskId(data.task_id);
    } catch (e) { console.error(e); alert('Rendering failed to start.'); }
  };

  useEffect(() => {
    if (!renderingTaskId) return;
    let timer;
    const poll = async () => {
      try {
        const res = await fetch(`/api/status/${renderingTaskId}`);
        if (res.ok) {
          const st = await res.json();
          setRenderStatus(st);
          if (st.completed) { setRenderingTaskId(''); alert('Video rendered successfully! Check the Exports directory.'); }
          else if (st.failed) setRenderingTaskId('');
          else timer = setTimeout(poll, 1500);
        }
      } catch { timer = setTimeout(poll, 3000); }
    };
    poll();
    return () => clearTimeout(timer);
  }, [renderingTaskId]);

  // ─── Library filter ───────────────────────────────────────────────────────
  const getLibraryFilesFiltered = () => {
    if (!library.files) return [];
    let filtered = library.files;
    if (activeSidebar === 'Video')   filtered = library.files.filter(f => f.type === 'video');
    else if (activeSidebar === 'Audio')   filtered = library.files.filter(f => f.type === 'audio');
    else if (activeSidebar === 'Images')  filtered = library.files.filter(f => f.type === 'image');
    else if (activeSidebar === 'Uploads') {
      if (uploadsFilter === 'Videos') filtered = library.files.filter(f => f.type === 'video');
      else if (uploadsFilter === 'Images') filtered = library.files.filter(f => f.type === 'image');
      else if (uploadsFilter === 'Audio') filtered = library.files.filter(f => f.type === 'audio');
      else filtered = library.files;
    }
    return filtered;
  };

  // ─── Sidebar icons ────────────────────────────────────────────────────────
  const getSidebarIcon = (name) => {
    switch (name) {
      case 'Video': return (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
          <line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line>
          <line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line>
          <line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line>
          <line x1="17" y1="7" x2="22" y2="7"></line>
        </svg>
      );
      case 'Script': return (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      );
      case 'VoiceOver': return (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      );
      case 'Transcribe': return (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="6" height="10" rx="3" />
          <path d="M1 9a8 8 0 0 0 10 0" />
          <line x1="6" y1="16" x2="6" y2="20" />
          <line x1="15" y1="6" x2="22" y2="6" />
          <line x1="15" y1="11" x2="20" y2="11" />
          <line x1="15" y1="16" x2="22" y2="16" />
        </svg>
      );
      case 'AIChat': return (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      );
      case 'Arranger': return (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      );
      case 'Assets': return (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      );
      case 'Text': return (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line>
          <line x1="12" y1="4" x2="12" y2="20"></line>
        </svg>
      );
      case 'Captions': return (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <path d="M7 10h2v2H7zM15 10h2v2h-2zM7 14h10v2H7z"></path>
        </svg>
      );
      case 'SFX': return (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      );
      case 'Audio': return (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>
        </svg>
      );
      case 'Images': return (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      );
      case 'Stickers':
      case 'Elements': return (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
          <circle cx="17.5" cy="6.5" r="3.5"></circle>
          <polygon points="12 14 6 21 18 21"></polygon>
        </svg>
      );
      case 'Uploads': return (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <polyline points="16 16 12 12 8 16"></polyline><line x1="12" y1="12" x2="12" y2="21"></line>
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
        </svg>
      );
      case 'Templates': return (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      );
      case 'API': return (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <circle cx="7.5" cy="12" r="4" />
          <circle cx="7.5" cy="12" r="1.5" fill="currentColor" />
          <line x1="11.5" y1="12" x2="22" y2="12" />
          <line x1="16" y1="12" x2="16" y2="15" />
          <line x1="19.5" y1="12" x2="19.5" y2="15" />
        </svg>
      );
      default: return null;
    }
  };

  // Sidebar items list
  const SIDEBAR_MAIN = ['Video', 'Script', 'VoiceOver', 'Transcribe', 'AIChat', 'Arranger', 'Assets', 'Text', 'Captions', 'SFX', 'Audio', 'Images', 'Elements', 'Uploads', 'Templates'];

  // ─── handleSendToAI for Transcribe panel ─────────────────────────────────
  const handleSendToAI = (action, text) => {
    setChatPrefill(`${action}:\n${text}`);
    setActiveSidebar('AIChat');
  };

  // ─── Canvas rendering helpers ─────────────────────────────────────────────
  const getAllClipsAtTime = (t) => {
    if (!project) return [];
    const all = [];
    Object.entries(project.tracks).forEach(([trackName, clips]) => {
      (clips || []).forEach(clip => {
        if (t >= clip.start && t <= clip.start + clip.duration) {
          all.push({ ...clip, track: trackName });
        }
      });
    });
    return all;
  };

  const isTimelineEmpty = !project || !project.tracks || Object.values(project.tracks).every(clips => !clips || clips.length === 0);

  const canvasAspect = selectedPreset.val;
  // Dynamically fit canvas inside the measured preview area (minus padding)
  const pad = 24; // px of breathing room on each side
  const availW = Math.max(100, previewAreaSize.w - pad * 2);
  const availH = Math.max(60,  previewAreaSize.h - pad * 2);
  let canvasW, canvasH;
  if (availW / availH > canvasAspect) {
    // Height-constrained (wide preset inside short space)
    canvasH = availH;
    canvasW = Math.round(availH * canvasAspect);
  } else {
    // Width-constrained (tall preset inside wide space)
    canvasW = availW;
    canvasH = Math.round(availW / canvasAspect);
  }

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="editor-layout" onMouseMove={handleCanvasMouseMove} onMouseUp={handleCanvasMouseUp}>

      {/* ══ 1. LEFT SIDEBAR MENU ══ */}
      <nav className="sidebar-menu">
        <img
          src="/logo.jpg"
          alt="Branding"
          className="sidebar-logo"
          onClick={() => setShowProjectsModal(true)}
          onMouseEnter={(e) => handleItemMouseEnter('Projects', e)}
          onMouseLeave={handleItemMouseLeave}
        />

        {/* Scrollable list for standard options */}
        <div className="sidebar-menu-scroll">
          {SIDEBAR_MAIN.map(sec => (
            <div
              key={sec}
              className={`sidebar-item ${activeSidebar === sec && !selectedClip ? 'active' : ''}`}
              onClick={() => {
                if (activeSidebar === sec && !selectedClip) {
                  setIsSidebarCollapsed(!isSidebarCollapsed);
                } else {
                  setActiveSidebar(sec);
                  setIsSidebarCollapsed(false);
                  setSelectedClip(null);
                }
              }}
              onMouseEnter={(e) => handleItemMouseEnter(getTooltipText(sec), e)}
              onMouseLeave={handleItemMouseLeave}
            >
              {getSidebarIcon(sec)}
            </div>
          ))}
        </div>

        {/* Bottom buttons */}
        <div className="sidebar-bottom">
          {/* Theme toggle */}
          <div
            className="sidebar-item"
            onClick={toggleTheme}
            onMouseEnter={(e) => handleItemMouseEnter(theme === 'dark' ? 'Light Mode' : 'Dark Mode', e)}
            onMouseLeave={handleItemMouseLeave}
          >
            {theme === 'dark' ? (
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </div>
          {/* API Keys icon at bottom */}
          <div
            className={`sidebar-item ${activeSidebar === 'API' && !selectedClip ? 'active' : ''}`}
            onClick={() => { setActiveSidebar('API'); setIsSidebarCollapsed(false); setSelectedClip(null); }}
            onMouseEnter={(e) => handleItemMouseEnter('API Keys', e)}
            onMouseLeave={handleItemMouseLeave}
          >
            {getSidebarIcon('API')}
          </div>
        </div>
      </nav>

      {/* ══ 2. FEATURE PANEL ══ */}
      {!isSidebarCollapsed && !selectedClip && (
        <div className="feature-panel" style={{ width: featurePanelWidth }}>
          <div className="panel-header">
            <span className="panel-title">{(activeSidebar === 'Stickers' || activeSidebar === 'Elements') ? 'ELEMENTS' : activeSidebar.toUpperCase()}</span>
            <button className="panel-close-btn" onClick={() => setIsSidebarCollapsed(true)} title="Close Sidebar">
              <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="14" width="14" xmlns="http://www.w3.org/2000/svg">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div 
            className="panel-content" 
            style={activeSidebar === 'Text' ? { overflowY: 'hidden', display: 'flex', flexDirection: 'column', height: 'calc(100% - 48px)', padding: '12px 12px 0 12px' } : {}}
          >
            {/* ── NEW AI/FEATURE PANELS ── */}
            {activeSidebar === 'API' && <APIKeysPanel />}

            {activeSidebar === 'Script' && (
              <ScriptPanel onScriptGenerated={(s) => setScriptData(s)} />
            )}

            {activeSidebar === 'VoiceOver' && (
              <VoiceOverPanel onFileUploaded={() => loadLibrary()} />
            )}

            {activeSidebar === 'Transcribe' && (
              <TranscribePanel
                addAssetToTimeline={(clip) => addAssetToTimeline(clip, 'caption')}
                onSendToAI={handleSendToAI}
              />
            )}

            {activeSidebar === 'AIChat' && (
              <AIChatPanel
                scriptData={scriptData}
                project={project}
                addAssetToTimeline={addAssetToTimeline}
                pushHistory={pushHistory}
                prefillMsg={chatPrefill}
                onPrefillConsumed={() => setChatPrefill('')}
              />
            )}

            {activeSidebar === 'Arranger' && (
              <ArrangerPanel
                scriptData={scriptData}
                project={project}
                setProject={setProject}
                pushHistory={pushHistory}
                uuidv4={uuidv4}
                addAssetToTimeline={addAssetToTimeline}
              />
            )}

            {activeSidebar === 'Assets' && (
              <AssetsPanel addAssetToTimeline={addAssetToTimeline} library={library} />
            )}

            {activeSidebar === 'SFX' && (
              <SFXPanel addAssetToTimeline={addAssetToTimeline} />
            )}

            {/* ── VIDEO PANEL ── */}
            {activeSidebar === 'Video' && (
              <VideoPanel
                addAssetToTimeline={addAssetToTimeline}
                toUrlPath={toUrlPath}
                refreshKey={projectId}
              />
            )}

            {/* ── AUDIO PANEL ── */}
            {activeSidebar === 'Audio' && (
              <AudioPanel
                addAssetToTimeline={addAssetToTimeline}
                refreshKey={projectId}
              />
            )}

            {/* ── IMAGES PANEL ── */}
            {activeSidebar === 'Images' && (
              <ImagesPanel
                addAssetToTimeline={addAssetToTimeline}
                refreshKey={projectId}
              />
            )}

            {/* ── TEXT PANEL ── */}
            {activeSidebar === 'Text' && (
              <div className="text-panel-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 0 }}>
                <div 
                  className="text-panel-scroll"
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '8px 2px 24px 2px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '10px',
                    scrollbarWidth: 'thin'
                  }}
                >
                  {TEXT_PRESETS_LIBRARY.map((style, i) => {
                    const isSelected = selectedPresetTitle === style.title;
                    return (
                      <div
                        key={`${style.title}_${i}`}
                        className={`panel-text-card ${isSelected ? 'selected-preset' : ''}`}
                        onClick={() => {
                          setSelectedPresetTitle(style.title);
                          addAssetToTimeline({ 
                            filename: style.title, 
                            text: style.previewText || style.title, 
                            stylePreset: style.preset, 
                            color: style.color,
                            fontFamily: style.fontFamily,
                            fontWeight: style.fontWeight,
                            fontSize: style.fontSize,
                            italic: style.italic,
                            bold: style.bold,
                            underline: style.underline,
                            shadowEnabled: style.shadowEnabled,
                            shadowColor: style.shadowColor,
                            shadowX: style.shadowX,
                            shadowY: style.shadowY,
                            shadowBlur: style.shadowBlur,
                            bgEnabled: style.bgEnabled,
                            textBgColor: style.textBgColor,
                            highlightColor: style.highlightColor,
                            padding: style.padding,
                            textBorderRadius: style.textBorderRadius,
                            outlineEnabled: style.outlineEnabled,
                            outlineColor: style.outlineColor,
                            outlineWidth: style.outlineWidth,
                            letterSpacing: style.letterSpacing
                          }, 'text');
                          trackRecentStyle(style);
                        }}
                      >
                        <span style={{
                          fontFamily: style.fontFamily || 'Inter',
                          fontWeight: style.bold ? 'bold' : (style.fontWeight === 'Bold' || style.fontWeight === 'Black' || style.fontWeight === 'ExtraBold' ? '900' : style.fontWeight === 'SemiBold' ? '600' : style.fontWeight === 'Medium' ? '500' : 'normal'),
                          fontStyle: style.italic ? 'italic' : 'normal',
                          textDecoration: style.underline ? 'underline' : 'none',
                          color: getPreviewTextColor(style),
                          fontSize: style.fontSize ? `${Math.min(18, style.fontSize * 0.45)}px` : '14px',
                          whiteSpace: 'nowrap',
                          textAlign: 'center',
                          padding: style.bgEnabled !== false && style.padding ? `${Math.min(6, style.padding * 0.4)}px ${Math.min(12, style.padding * 0.6)}px` : '0',
                          backgroundColor: getPreviewBgColor(style),
                          borderRadius: style.textBorderRadius !== undefined 
                            ? `${Math.min(4, style.textBorderRadius * 0.4)}px` 
                            : '0px',
                          textShadow: style.shadowEnabled && style.shadowColor
                            ? `${(style.shadowX ?? 2) * 0.4}px ${(style.shadowY ?? 2) * 0.4}px ${(style.shadowBlur ?? 4) * 0.4}px ${style.shadowColor}`
                            : 'none',
                          WebkitTextStroke: style.outlineEnabled && style.outlineWidth 
                            ? `${Math.max(0.5, style.outlineWidth * 0.3)}px ${getPreviewOutlineColor(style)}` 
                            : 'none',
                          letterSpacing: style.letterSpacing ? `${style.letterSpacing * 0.3}px` : 'normal',
                          lineHeight: 1,
                          margin: 0,
                        }}>
                          {style.previewText || style.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── CAPTIONS PANEL ── */}
            {activeSidebar === 'Captions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* SRT Upload */}
                <div>
                  <div className="panel-section-label">📄 From SRT File</div>
                  {!srtFile ? (
                    <label className="upload-btn srt-upload-card" style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '24px 16px',
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1.5px dashed rgba(99, 102, 241, 0.3)',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      gap: '10px'
                    }}>
                      <div className="upload-icon-container" style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(99, 102, 241, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        transition: 'all 0.3s'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#ffffff' }}>Upload SRT File</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Click to browse computer</span>
                      </div>
                      <input type="file" accept=".srt" onChange={e => setSrtFile(e.target.files[0])} style={{ display: 'none' }} />
                    </label>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="srt-file-selected-card" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        background: 'rgba(34, 197, 94, 0.05)',
                        border: '1.5px solid rgba(34, 197, 94, 0.2)',
                        borderRadius: '14px',
                        gap: '12px',
                        transition: 'all 0.3s'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'rgba(34, 197, 94, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#22c55e',
                            flexShrink: 0
                          }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} title={srtFile.name}>
                              {srtFile.name}
                            </span>
                            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
                              {(srtFile.size / 1024).toFixed(1)} KB · SRT Caption
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSrtFile(null)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.color = '#ef4444';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                          title="Remove File"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                      <button className="action-btn" onClick={generateCaptionsFromSRT}>
                        Generate Captions from SRT
                      </button>
                    </div>
                  )}
                </div>

                {/* Script text */}
                <div>
                  <div className="panel-section-label">📝 From Script Text</div>
                  <textarea
                    className="captions-textarea"
                    rows={4}
                    placeholder="Paste your script text here..."
                    value={scriptText}
                    onChange={e => setScriptText(e.target.value)}
                    style={{ resize: 'vertical', width: '100%', minHeight: '80px' }}
                  />
                  <button className="action-btn" onClick={generateCaptionsFromScript} style={{ marginTop: '8px' }}>
                    Generate Captions from Script
                  </button>
                </div>

                {/* Auto whisper */}
                <div>
                  <div className="panel-section-label">🤖 Auto (Whisper AI)</div>
                  <button className="action-btn" onClick={generateAutoCaptions}>
                    Generate Auto Captions
                  </button>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Uses local Whisper model to transcribe Voice Over track.
                  </p>
                </div>

                {/* Caption Style */}
                <div>
                  <div className="panel-section-label">🎨 Caption Style</div>
                  <div className="custom-dropdown-container" style={{ position: 'relative', width: '100%' }}>
                    <button
                      className="prop-select"
                      onClick={() => setCaptionDropdownOpen(!captionDropdownOpen)}
                      style={{
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingRight: '12px',
                        backgroundPosition: 'none',
                        backgroundImage: 'none'
                      }}
                    >
                      <span style={{ textTransform: 'capitalize' }}>
                        {captionStyle.replace(/_/g, ' ')}
                      </span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        style={{
                          transition: 'transform 0.2s',
                          transform: captionDropdownOpen ? 'rotate(180deg)' : 'none'
                        }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {captionDropdownOpen && (
                      <div
                        className="custom-dropdown-menu"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          marginTop: '6px',
                          backgroundColor: '#0c0e17',
                          border: '1.5px solid rgba(255,255,255,0.08)',
                          borderRadius: '10px',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                          zIndex: 1000,
                          padding: '4px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          maxHeight: '200px',
                          overflowY: 'auto'
                        }}
                      >
                        {[
                          { id: 'default', label: 'Default Style' },
                          { id: 'highlight_box', label: 'Highlight Box' },
                          { id: 'make_an_impact', label: 'Make An Impact' },
                          { id: 'sliced_text', label: 'Sliced Text' },
                          { id: 'less_is_more', label: 'Less Is More' },
                          { id: 'ultra_minimal', label: 'Ultra Minimal' },
                          { id: 'clean_subtitle', label: 'Clean Subtitle' },
                          { id: 'neon_glow', label: 'Cyberpunk Glow' },
                          { id: 'vlog_script', label: 'Vlog Script' },
                          { id: 'vintage_retro', label: 'Vintage Retro' },
                          { id: 'dynamic_sub', label: 'Dynamic Subtitle' }
                        ].map(item => (
                          <button
                            key={item.id}
                            className={`custom-dropdown-item ${captionStyle === item.id ? 'active' : ''}`}
                            onClick={() => {
                              setCaptionStyle(item.id);
                              setCaptionDropdownOpen(false);
                            }}
                            style={{
                              padding: '10px 12px',
                              textAlign: 'left',
                              border: 'none',
                              borderRadius: '6px',
                              background: captionStyle === item.id ? 'rgba(0, 132, 255, 0.12)' : 'transparent',
                              color: captionStyle === item.id ? '#3b82f6' : '#f3f4f6',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              if (captionStyle !== item.id) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                e.currentTarget.style.color = '#ffffff';
                              }
                            }}
                            onMouseLeave={e => {
                              if (captionStyle !== item.id) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#f3f4f6';
                              }
                            }}
                          >
                            <span>{item.label}</span>
                            {captionStyle === item.id && (
                              <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Avatar match */}
                <div>
                  <div className="panel-section-label">🎭 Avatar Sync</div>
                  <button className="action-btn" onClick={matchAvatarToVoice}>
                    Match Avatar to Voice Duration
                  </button>
                </div>
              </div>
            )}

            {/* ── ELEMENTS PANEL ── */}
            {(activeSidebar === 'Elements' || activeSidebar === 'Stickers') && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowX: 'hidden', width: '100%', boxSizing: 'border-box' }}>
                {/* 1. Search Input Container */}
                <div style={{ padding: '0 0 12px 0' }}>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type="text"
                      className="stickers-panel-search"
                      placeholder="🔍 Search elements by keyword, tag, or name..."
                      value={stickersSearchQuery}
                      onChange={(e) => setStickersSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 14px',
                        fontSize: '12px',
                        borderRadius: '24px',
                        backgroundColor: '#121620',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#ffffff',
                        outline: 'none',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)'
                      }}
                    />
                  </div>
                </div>

                {/* 2. Category Navigation Pills (All 5 Categories Visible, Zero Scrolling) */}
                <div className="sticker-category-pills" style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap', width: '100%', boxSizing: 'border-box', overflow: 'visible', maxHeight: 'none' }}>
                  {STICKER_CATEGORIES.map(cat => {
                    const allPool = STICKERS_DATA;
                    let count = 0;
                    if (cat === 'All') count = allPool.length;
                    else count = allPool.filter(s => s.category === cat).length;
                    const isActive = activeStickersCategory === cat;

                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveStickersCategory(cat)}
                        style={{
                          fontSize: '11px',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          whiteSpace: 'nowrap',
                          fontWeight: isActive ? '700' : '600',
                          backgroundColor: isActive ? '#0084ff' : 'rgba(255,255,255,0.06)',
                          color: '#ffffff',
                          border: isActive ? '1px solid #0084ff' : '1px solid rgba(255,255,255,0.08)',
                          cursor: 'pointer',
                          boxShadow: isActive ? '0 2px 10px rgba(0,132,255,0.4)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* 3. Elements Grid */}
                <div className="stickers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px', overflowY: 'auto', overflowX: 'hidden', width: '100%', boxSizing: 'border-box', paddingRight: '2px', maxHeight: 'calc(100vh - 210px)' }}>
                  {(() => {
                    let listToRender = STICKERS_DATA;
                    if (activeStickersCategory !== 'All') {
                      listToRender = STICKERS_DATA.filter(st => st && st.category === activeStickersCategory);
                    }

                    const filtered = listToRender.filter(st => {
                      if (!st) return false;
                      if (!stickersSearchQuery) return true;
                      const q = stickersSearchQuery.toLowerCase();
                      const nameStr = (st.name || '').toLowerCase();
                      const textStr = (st.text || '').toLowerCase();
                      const catStr = (st.category || '').toLowerCase();
                      const tags = (st.tags || []).join(' ').toLowerCase();
                      return (
                        nameStr.includes(q) ||
                        textStr.includes(q) ||
                        catStr.includes(q) ||
                        tags.includes(q)
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px 10px', color: '#94a3b8', fontSize: '12px' }}>
                          No matching elements found. Try searching another keyword!
                        </div>
                      );
                    }

                    return filtered.map((sticker) => {
                      return (
                        <div
                          key={sticker.id}
                          className="sticker-card"
                          draggable={true}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('application/json', JSON.stringify({ type: 'sticker', sticker }));
                          }}
                          onClick={() => {
                            trackRecentSticker(sticker);
                            addAssetToTimeline({
                              id: sticker.id,
                              filename: sticker.name,
                              text: sticker.text,
                              isSticker: true,
                              category: sticker.category,
                              svgContent: sticker.svgContent,
                              color: sticker.color || '#ffffff',
                              textBgColor: sticker.textBgColor || undefined,
                              bgEnabled: sticker.textBgColor ? true : false,
                              borderRadius: sticker.borderRadius || 0,
                              padding: sticker.padding || 0,
                              fontSize: sticker.isBadge ? 28 : 42,
                              flipH: false,
                              flipV: false,
                              minDb: -80,
                              maxDb: 40
                            }, 'sticker');
                          }}
                          title={`Click to add ${sticker.name} to timeline.`}
                          style={{
                            position: 'relative',
                            cursor: 'pointer',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.06)',
                            padding: sticker.category === 'Shapes' ? '14px 6px' : '10px 6px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'transform 0.15s ease, border-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                        >
                          <div className="sticker-card-preview" style={{ width: '100%', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {sticker.svgContent ? (
                              <div
                                style={{ width: sticker.category === 'Visualizers' ? '70px' : '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                dangerouslySetInnerHTML={{ __html: sticker.svgContent.replace(/var\(--sticker-color,\s*[^)]+\)/g, sticker.color || '#ffffff') }}
                              />
                            ) : sticker.isBadge ? (
                              <div
                                className="sticker-badge-pill"
                                style={{
                                  backgroundColor: sticker.textBgColor,
                                  color: sticker.color,
                                  borderRadius: `${sticker.borderRadius || 16}px`,
                                  fontSize: '9.5px',
                                  fontWeight: '800',
                                  padding: '5px 8px',
                                  textAlign: 'center',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {sticker.text}
                              </div>
                            ) : (
                              <span style={{ fontSize: '24px', color: sticker.color || 'inherit' }}>{sticker.text}</span>
                            )}
                          </div>
                          {sticker.category !== 'Shapes' && (
                            <div className="sticker-card-label" style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                              {sticker.name}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* ── UPLOADS PANEL ── */}
            {activeSidebar === 'Uploads' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label className="upload-btn" style={{ width: '100%', justifyContent: 'center' }}>
                  {isUploading ? '⏳ Uploading...' : (
                    <>
                      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="14" width="14" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      Upload Media
                    </>
                  )}
                  <input type="file" accept="video/*,image/*,audio/*" onChange={handleSmartUpload} style={{ display: 'none' }} />
                </label>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['All', 'Videos', 'Images', 'Audio'].map(f => (
                    <button key={f} className={`timeline-btn ${uploadsFilter === f ? 'active-pill' : ''}`} onClick={() => setUploadsFilter(f)} style={{ fontSize: '11px' }}>
                      {f}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {getLibraryFilesFiltered().map((f, i) => (
                    <div key={i} className="audio-card-item" onClick={() => addAssetToTimeline(f, f.type === 'video' ? 'video' : f.type === 'image' ? 'image' : 'music')}>
                      <div className="audio-info">
                        <div className="audio-title">{f.filename}</div>
                        <div className="audio-meta">{f.type} · {(f.size / 1024 / 1024).toFixed(1)} MB</div>
                      </div>
                    </div>
                  ))}
                  {getLibraryFilesFiltered().length === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '20px', textAlign: 'center' }}>No files uploaded yet.</div>
                  )}
                </div>
              </div>
            )}

            {/* ── TEMPLATES PANEL ── */}
            {activeSidebar === 'Templates' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', padding: '30px 0' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📐</div>
                  <div>Templates coming soon!</div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ══ 3. PROPERTIES PANEL ══ */}
      {selectedClip && (
        <div className="properties-panel" style={{ width: propertiesPanelWidth, position: 'relative' }}>
          <PropertiesPanel
            selectedClip={selectedClip}
            onChange={updateClipProperties}
            onClose={() => setSelectedClip(null)}
            onDelete={deleteClip}
            onDetachAudio={detachAudio}
            focusSection={focusSection}
          />
        </div>
      )}

      {/* ══ 4. MAIN EDITOR AREA ══ */}
      <div className="center-workspace">

        {/* ─ Top Header ─ */}
        <div className="editor-header">
          <div className="project-title" style={{ cursor: 'pointer' }} onClick={() => setShowProjectsModal(true)}>
            📁 {project ? project.name : 'No Project'}
          </div>

          <div className="header-actions">
            {project && (
              <button className="header-action-btn export-btn btn-gold" onClick={() => setExportModal(true)} title="Export Video">
                🎬 Export
              </button>
            )}
          </div>
        </div>

        {/* ─ Canvas area ─ */}
        <div className="preview-area" ref={previewAreaRef}>
          {project ? (
            <>
              <div
              className="canvas-container"
              ref={canvasContainerRef}
              style={{ width: canvasW, height: canvasH, position: 'relative', background: '#000', overflow: 'hidden', flexShrink: 0 }}
              onClick={() => setContextMenu(null)}
            >
              {selectedClip?.snapToGrid && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 2,
                  backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} />
              )}

              {/* Vertical & Horizontal Center Alignment Guides */}
              {alignmentGuides.v && (
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '1px', backgroundColor: '#00f0ff', zIndex: 99, boxShadow: '0 0 8px #00f0ff', pointerEvents: 'none' }} />
              )}
              {alignmentGuides.h && (
                <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', backgroundColor: '#00f0ff', zIndex: 99, boxShadow: '0 0 8px #00f0ff', pointerEvents: 'none' }} />
              )}

              {/* Render all clips at current time */}
              {Object.entries(project.tracks).map(([trackName, clips]) => {
                if (hiddenTracks[trackName]) return null;
                return (clips || []).map(clip => {
                  if (!clip) return null;
                  const isVisible = currentTime >= (clip.start || 0) && currentTime <= (clip.start || 0) + (clip.duration || 5);
                  if (!isVisible || clip.hidden) return null;

                  const isText  = clip.text !== undefined || clip.isSticker || clip.svgContent;
                  let isAudio = false;
                  if (clip.path) {
                    const ext = clip.path.split('.').pop().toLowerCase();
                    isAudio = ['mp3','wav','m4a','ogg','aac'].includes(ext);
                  }

                  if (isAudio) {
                    return (
                      <audio
                        key={clip.id}
                        className="canvas-audio"
                        src={toUrlPath(clip.path)}
                        data-start={clip.start} data-duration={clip.duration}
                        data-source-start={clip.sourceStart || 0}
                        data-speed={clip.speed !== undefined ? clip.speed : 1} data-volume={clip.volume !== undefined ? clip.volume : 100}
                        data-muted={clip.mute || mutedTracks[trackName] || false}
                        preload="auto"
                      />
                    );
                  }

                  if (isText) {
                    const translateX = clip.align === 'left' ? '0%' : clip.align === 'right' ? '-100%' : '-50%';
                    const rawOpacity = clip.opacity ?? 100;
                    const opacityVal = (rawOpacity > 1.0 ? rawOpacity / 100 : rawOpacity);
                    const scaleVal = clip.scaleHidden ? 1 : (clip.scale || 1);
                    const flipHScale = clip.flipH ? -1 : 1;
                    const flipVScale = clip.flipV ? -1 : 1;

                    const textStyle = {
                      position: 'absolute',
                      left: clip.xHidden ? '50%' : `${clip.x ?? 50}%`,
                      top: clip.yHidden ? '80%' : `${clip.y ?? 50}%`,
                      transform: `translate(${translateX}, -50%) scale(${scaleVal * flipHScale}, ${scaleVal * flipVScale}) rotate(${clip.rotationHidden ? 0 : (clip.rotation || 0)}deg)`,
                      fontSize: `${clip.fontSizeHidden ? 28 : (clip.fontSize || 28)}px`,
                      fontFamily: clip.fontFamily || 'Inter',
                      fontWeight: clip.bold ? 'bold' : getFontWeightCSS(clip.fontWeight),
                      fontStyle: clip.italic ? 'italic' : 'normal',
                      textDecoration: clip.underline ? 'underline' : 'none',
                      color: clip.color || '#ffffff',
                      opacity: opacityVal,
                      whiteSpace: 'nowrap',
                      cursor: clip.locked ? 'default' : 'move',
                      userSelect: 'none',
                      zIndex: clip.zIndex || 10,
                      textShadow: clip.shadowEnabled && clip.shadowColor
                        ? `${clip.shadowX ?? 2}px ${clip.shadowY ?? 2}px ${clip.shadowBlur ?? 4}px ${clip.shadowColor}`
                        : (clip.shadowEnabled ? '0 2px 8px rgba(0,0,0,0.8)' : 'none'),
                      boxShadow: clip.glowEnabled ? `0 0 ${clip.glowBlur || 12}px ${clip.glowColor || '#00a8ff'}` : 'none',
                      border: clip.borderWidth ? `${clip.borderWidth}px ${clip.borderStyle || 'solid'} ${clip.borderColor || '#ffffff'}` : 'none',
                      filter: getFilterCSS(clip.filter, clip.brightness),
                      letterSpacing: clip.letterSpacingHidden ? 'normal' : (clip.letterSpacing !== undefined ? `${clip.letterSpacing}px` : 'normal'),
                      wordSpacing: clip.wordSpacingHidden ? 'normal' : (clip.wordSpacing !== undefined ? `${clip.wordSpacing}px` : 'normal'),
                      padding: clip.paddingHidden ? 'normal' : (clip.padding !== undefined ? `${clip.padding}px` : 'normal'),
                      backgroundColor: clip.bgEnabled !== false && clip.textBgColor ? clip.textBgColor : 'transparent',
                      borderRadius: clip.textBorderRadiusHidden ? '0px' : (clip.textBorderRadius !== undefined ? `${clip.textBorderRadius}px` : '0px'),
                      WebkitTextStroke: clip.outlineEnabled && clip.outlineWidth ? `${clip.outlineWidth}px ${clip.outlineColor || '#000000'}` : 'none',
                      textAlign: clip.align || 'center',
                    };

                    return (
                      <div
                        key={clip.id}
                        style={textStyle}
                        className={`canvas-text-clip preset-${clip.stylePreset || 'default'} ${selectedClip?.id === clip.id ? 'selected-clip' : ''}`}
                        onClick={() => setSelectedClip(clip)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedClip(clip);
                          setContextMenu({ visible: true, x: e.clientX, y: e.clientY, clip });
                        }}
                        onMouseDown={(e) => !clip.locked && handleCanvasMouseDown(e, clip)}
                      >
                        {clip.svgContent ? (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              filter: clip.outlineColor && clip.outlineWidth ? `drop-shadow(0 0 ${clip.outlineWidth}px ${clip.outlineColor})` : 'none'
                            }}
                            dangerouslySetInnerHTML={{ __html: clip.svgContent.replace(/var\(--sticker-color,\s*[^)]+\)/g, clip.color || '#ffffff') }}
                          />
                        ) : clip.isBadge ? (
                          <div
                            style={{
                              backgroundColor: clip.textBgColor || '#ef4444',
                              color: clip.color || '#ffffff',
                              borderRadius: `${clip.borderRadius || 20}px`,
                              padding: '8px 16px',
                              fontSize: `${clip.fontSize || 24}px`,
                              fontWeight: '800',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {clip.text}
                          </div>
                        ) : (
                          clip.text || 'Element Clip'
                        )}

                        {selectedClip?.id === clip.id && !clip.locked && (
                          <>
                            {/* Corner Handles */}
                            <div className="clip-resize-handle tl" style={{ top: '-8px', left: '-8px', pointerEvents: 'auto' }} onMouseDown={(e) => handleCanvasResizeStart(e, clip, 'tl')} />
                            <div className="clip-resize-handle tr" style={{ top: '-8px', right: '-8px', pointerEvents: 'auto' }} onMouseDown={(e) => handleCanvasResizeStart(e, clip, 'tr')} />
                            <div className="clip-resize-handle bl" style={{ bottom: '-8px', left: '-8px', pointerEvents: 'auto' }} onMouseDown={(e) => handleCanvasResizeStart(e, clip, 'bl')} />
                            <div className="clip-resize-handle br" style={{ bottom: '-8px', right: '-8px', pointerEvents: 'auto' }} onMouseDown={(e) => handleCanvasResizeStart(e, clip, 'br')} />

                            {/* Top line to rotation handle */}
                            <div 
                              style={{
                                position: 'absolute',
                                top: '-24px',
                                left: '50%',
                                width: '1.5px',
                                height: '20px',
                                backgroundColor: '#00a8ff',
                                pointerEvents: 'none',
                                zIndex: 101,
                              }}
                            />
                            {/* 360 rotation handle button */}
                            <div 
                              className="clip-rotate-handle"
                              style={{
                                position: 'absolute',
                                top: '-44px',
                                left: '50%',
                                transform: 'translateX(-50%) scale(1.0)',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: '#ffffff',
                                border: '1.5px solid #00a8ff',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.25)',
                                cursor: 'grab',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'auto',
                                zIndex: 102,
                              }}
                              onMouseDown={(e) => handleCanvasResizeStart(e, clip, 'rotate')}
                            >
                              <svg stroke="#00a8ff" fill="none" strokeWidth="3" viewBox="0 0 24 24" height="11" width="11" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                              </svg>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  }

                  if (isVideo) {
                    const ext = (clip.path || '').split('.').pop().toLowerCase();
                    const isImg = ['jpg','jpeg','png','gif','webp','bmp','svg'].includes(ext);
                    const isSelected = selectedClip?.id === clip.id;

                    const wrapperStyle = {
                      position: 'absolute',
                      left: `${clip.x ?? 50}%`,
                      top: `${clip.y ?? 50}%`,
                      transform: `translate(-50%, -50%) scale(${clip.scale || 1}) rotate(${clip.rotation || 0}deg)`,
                      width: '100%',
                      height: '100%',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'move',
                      zIndex: isSelected ? 12 : 5,
                      boxSizing: 'border-box',
                    };

                    const flipTransform = `${clip.flipH ? 'scaleX(-1)' : ''} ${clip.flipV ? 'scaleY(-1)' : ''}`.trim();
                    const mediaStyle = {
                      display: 'block',
                      width: '100%',
                      height: '100%',
                      maxWidth: 'none',
                      maxHeight: 'none',
                      objectFit: clip.fitMode || 'contain',
                      borderRadius: `${clip.borderRadius || 0}px`,
                      filter: getFilterCSS(clip),
                      opacity: getResolvedOpacity(clip.opacity),
                      padding: `${clip.paddingSpace ?? 0}px`,
                      backgroundColor: clip.paddingBackground || 'transparent',
                      transform: flipTransform || undefined,
                      pointerEvents: 'none',
                      boxSizing: 'border-box',
                      clipPath: clip.cropEnabled
                        ? `inset(${clip.cropTop ?? 0}% ${clip.cropRight ?? 0}% ${clip.cropBottom ?? 0}% ${clip.cropLeft ?? 0}%)`
                        : 'none',
                    };

                    return (
                      <div
                        key={clip.id}
                        style={wrapperStyle}
                        className="canvas-media-wrapper"
                        onClick={() => setSelectedClip(clip)}
                        onMouseDown={(e) => handleCanvasMouseDown(e, clip)}
                      >
                        {isImg ? (
                          <img
                            src={toUrlPath(clip.path)}
                            alt=""
                            style={mediaStyle}
                            draggable={false}
                          />
                        ) : (
                          <video
                            className="canvas-video"
                            src={toUrlPath(clip.path)}
                            style={mediaStyle}
                            data-start={clip.start} data-duration={clip.duration}
                            data-source-start={clip.sourceStart || 0}
                            data-speed={clip.speed !== undefined ? clip.speed : 1} data-volume={clip.volume !== undefined ? clip.volume : 100}
                            data-muted={clip.mute || mutedTracks[trackName] || false}
                            muted={clip.mute || mutedTracks[trackName] || false}
                            playsInline preload="auto"
                          />
                        )}

                        {/* Noise Overlay */}
                        {(clip.noise ?? 0) > 0 && (
                          <div 
                            style={{
                              position: 'absolute',
                              left: `${clip.cropLeft ?? 0}%`,
                              right: `${clip.cropRight ?? 0}%`,
                              top: `${clip.cropTop ?? 0}%`,
                              bottom: `${clip.cropBottom ?? 0}%`,
                              pointerEvents: 'none',
                              zIndex: 8,
                              borderRadius: clip.borderRadius ? `${clip.borderRadius}px` : '0',
                              opacity: (clip.noise ?? 0) / 100 * 0.18,
                              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                            }}
                          />
                        )}

                        {/* Vignette Overlay */}
                        {(clip.vignette ?? 0) > 0 && (
                          <div 
                            style={{
                              position: 'absolute',
                              left: `${clip.cropLeft ?? 0}%`,
                              right: `${clip.cropRight ?? 0}%`,
                              top: `${clip.cropTop ?? 0}%`,
                              bottom: `${clip.cropBottom ?? 0}%`,
                              pointerEvents: 'none',
                              zIndex: 9,
                              borderRadius: clip.borderRadius ? `${clip.borderRadius}px` : '0',
                              background: `radial-gradient(circle, transparent ${100 - (clip.vignette ?? 0)}%, rgba(0,0,0,${(clip.vignette ?? 0) / 100}) 150%)`
                            }}
                          />
                        )}

                        {isSelected && (
                          <div 
                            style={{
                              position: 'absolute',
                              left: `${clip.cropLeft ?? 0}%`,
                              right: `${clip.cropRight ?? 0}%`,
                              top: `${clip.cropTop ?? 0}%`,
                              bottom: `${clip.cropBottom ?? 0}%`,
                              outline: '1.5px solid #00a8ff',
                              outlineOffset: '-1.5px',
                              borderRadius: clip.borderRadius ? `${clip.borderRadius}px` : '0',
                              pointerEvents: 'none',
                              zIndex: 100
                            }}
                          >
                            <div className="clip-resize-handle tl" style={{ pointerEvents: 'auto' }} onMouseDown={(e) => { e.stopPropagation(); handleCanvasResizeStart(e, clip, 'tl'); }} />
                            <div className="clip-resize-handle tr" style={{ pointerEvents: 'auto' }} onMouseDown={(e) => { e.stopPropagation(); handleCanvasResizeStart(e, clip, 'tr'); }} />
                            <div className="clip-resize-handle bl" style={{ pointerEvents: 'auto' }} onMouseDown={(e) => { e.stopPropagation(); handleCanvasResizeStart(e, clip, 'bl'); }} />
                            <div className="clip-resize-handle br" style={{ pointerEvents: 'auto' }} onMouseDown={(e) => { e.stopPropagation(); handleCanvasResizeStart(e, clip, 'br'); }} />
                            <div className="clip-resize-handle tc" style={{ pointerEvents: 'auto' }} onMouseDown={(e) => { e.stopPropagation(); handleCanvasResizeStart(e, clip, 'tc'); }} />
                            <div className="clip-resize-handle bc" style={{ pointerEvents: 'auto' }} onMouseDown={(e) => { e.stopPropagation(); handleCanvasResizeStart(e, clip, 'bc'); }} />
                            <div className="clip-resize-handle lc" style={{ pointerEvents: 'auto' }} onMouseDown={(e) => { e.stopPropagation(); handleCanvasResizeStart(e, clip, 'lc'); }} />
                            <div className="clip-resize-handle rc" style={{ pointerEvents: 'auto' }} onMouseDown={(e) => { e.stopPropagation(); handleCanvasResizeStart(e, clip, 'rc'); }} />

                            {/* Premium Rotation Handle */}
                            <div 
                              style={{
                                position: 'absolute',
                                top: '-20px',
                                left: '50%',
                                width: '1.5px',
                                height: '20px',
                                backgroundColor: '#00a8ff',
                                pointerEvents: 'none',
                                zIndex: 101,
                              }}
                            />
                            <div 
                              className="clip-rotate-handle"
                              style={{
                                position: 'absolute',
                                top: '-40px',
                                left: '50%',
                                transform: 'translateX(-50%) scale(1.0)',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: '#ffffff',
                                border: '1.5px solid #00a8ff',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.25)',
                                cursor: 'grab',
                                display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  pointerEvents: 'auto',
                                  zIndex: 102,
                                  transition: 'transform 0.15s, background-color 0.15s'
                               }}
                               onMouseDown={(e) => {
                                 e.stopPropagation();
                                 handleCanvasResizeStart(e, clip, 'rotate');
                               }}
                               onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(-50%) scale(1.15)'; e.currentTarget.style.backgroundColor = '#f0f8ff'; }}
                               onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(-50%) scale(1.0)'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
                             >
                               <svg stroke="#00a8ff" fill="none" strokeWidth="3" viewBox="0 0 24 24" height="11" width="11" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                               </svg>
                             </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                });
              })}
            </div>

            {/* Canvas Right-Click Context Menu */}
            {contextMenu?.visible && contextMenu?.clip && (
              <div
                style={{
                  position: 'fixed',
                  left: `${contextMenu?.x || 0}px`,
                  top: `${contextMenu?.y || 0}px`,
                  backgroundColor: '#18181b',
                  border: '1px solid #3f3f46',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  padding: '4px 0',
                  zIndex: 9999,
                  minWidth: '160px',
                  fontSize: '12px'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="timeline-btn"
                  style={{ width: '100%', textAlign: 'left', borderRadius: 0, padding: '6px 12px' }}
                  onClick={() => { if (contextMenu?.clip) duplicateClip(contextMenu.clip); setContextMenu(null); }}
                >
                  📋 Duplicate (Ctrl+D)
                </button>
                <button
                  className="timeline-btn"
                  style={{ width: '100%', textAlign: 'left', borderRadius: 0, padding: '6px 12px' }}
                  onClick={() => { if (contextMenu?.clip) copyClip(contextMenu.clip); setContextMenu(null); }}
                >
                  ✂️ Copy (Ctrl+C)
                </button>
                <button
                  className="timeline-btn"
                  style={{ width: '100%', textAlign: 'left', borderRadius: 0, padding: '6px 12px' }}
                  onClick={() => { if (contextMenu?.clip) changeClipLayer(contextMenu.clip, 'bringToFront'); setContextMenu(null); }}
                >
                  ⬆️ Bring to Front
                </button>
                <button
                  className="timeline-btn"
                  style={{ width: '100%', textAlign: 'left', borderRadius: 0, padding: '6px 12px' }}
                  onClick={() => { if (contextMenu?.clip) changeClipLayer(contextMenu.clip, 'bringForward'); setContextMenu(null); }}
                >
                  🔼 Bring Forward
                </button>
                <button
                  className="timeline-btn"
                  style={{ width: '100%', textAlign: 'left', borderRadius: 0, padding: '6px 12px' }}
                  onClick={() => { if (contextMenu?.clip) changeClipLayer(contextMenu.clip, 'sendBackward'); setContextMenu(null); }}
                >
                  🔽 Send Backward
                </button>
                <button
                  className="timeline-btn"
                  style={{ width: '100%', textAlign: 'left', borderRadius: 0, padding: '6px 12px' }}
                  onClick={() => { if (contextMenu?.clip) changeClipLayer(contextMenu.clip, 'sendToBack'); setContextMenu(null); }}
                >
                  ⬇️ Send to Back
                </button>
                <button
                  className="timeline-btn"
                  style={{ width: '100%', textAlign: 'left', borderRadius: 0, padding: '6px 12px' }}
                  onClick={() => { if (contextMenu?.clip) updateClipProperties({ ...contextMenu.clip, locked: !contextMenu.clip.locked }); setContextMenu(null); }}
                >
                  {contextMenu?.clip?.locked ? '🔓 Unlock' : '🔒 Lock'}
                </button>
                <button
                  className="timeline-btn"
                  style={{ width: '100%', textAlign: 'left', borderRadius: 0, padding: '6px 12px' }}
                  onClick={() => { if (contextMenu?.clip) updateClipProperties({ ...contextMenu.clip, hidden: !contextMenu.clip.hidden }); setContextMenu(null); }}
                >
                  {contextMenu?.clip?.hidden ? '👁️ Show' : '🙈 Hide'}
                </button>
                <div style={{ borderTop: '1px solid #27272a', margin: '4px 0' }} />
                <button
                  className="timeline-btn"
                  style={{ width: '100%', textAlign: 'left', borderRadius: 0, padding: '6px 12px', color: '#ef4444' }}
                  onClick={() => { if (contextMenu?.clip) deleteClip(contextMenu.clip); setContextMenu(null); }}
                >
                  🗑️ Delete (Del)
                </button>
              </div>
            )}
            {/* SVG filters for image/video sharpening effects */}
            <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
              <defs>
                <filter id="sharpen-filter-heavy">
                  <feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="0 -1 0 -1 5 -1 0 -1 0"/>
                </filter>
                <filter id="sharpen-filter-medium">
                  <feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="0 -0.5 0 -0.5 3 -0.5 0 -0.5 0"/>
                </filter>
              </defs>
            </svg>
          </>
          ) : (
            <div className="canvas-empty">
              <div className="canvas-empty-icon">🎬</div>
              <div className="canvas-empty-text">Open or Create a Project</div>
              <button className="dashboard-btn primary-action" onClick={() => setShowProjectsModal(true)}>Open Projects</button>
            </div>
          )}
        </div>

        {/* ─ Timeline resize handle ─ */}
        {project && (
          <div className="timeline-resize-handle" onMouseDown={() => setIsResizingTimeline(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6V2M9 5l3-3 3 3" />
              <path d="M12 18v4M9 19l3 3 3-3" />
              <line x1="5" y1="10" x2="19" y2="10" />
              <line x1="5" y1="14" x2="19" y2="14" />
            </svg>
          </div>
        )}

        {/* ─ Timeline ─ */}
        {project && (
          <div className="timeline-panel" style={{ height: timelineHeight }}>
            {/* Timeline Toolbar */}
            <div className="timeline-toolbar">
              {/* LEFT: Undo/Redo + Split/Delete */}
              <div className="timeline-left-tools">
                {/* Undo */}
                <button
                  className="timeline-btn frameless-btn"
                  style={{ padding: '0', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '7px' }}
                  onClick={undo}
                  title="Undo (Ctrl+Z)"
                  disabled={!historyPast.length}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 7v6h6" />
                    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
                  </svg>
                </button>

                {/* Redo */}
                <button
                  className="timeline-btn frameless-btn"
                  style={{ padding: '0', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '7px' }}
                  onClick={redo}
                  title="Redo (Ctrl+Y)"
                  disabled={!historyFuture.length}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 7v6h-6" />
                    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
                  </svg>
                </button>

                <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)', margin: '0 3px' }} />

                {/* Split */}
                <span title="Split" style={{ display: 'inline-flex' }}>
                  <button
                    className={`timeline-btn frameless-btn premium-split-btn ${selectedClip ? 'active' : ''}`}
                    style={{
                      padding: '0', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '7px',
                      color: selectedClip ? '#f87171' : undefined,
                    }}
                    onClick={() => selectedClip && splitClipAtPlayhead(selectedClip)}
                    disabled={!selectedClip}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="6" cy="6" r="3" />
                      <circle cx="6" cy="18" r="3" />
                      <line x1="9.8" y1="8.2" x2="20" y2="17" />
                      <line x1="9.8" y1="15.8" x2="20" y2="7" />
                    </svg>
                  </button>
                </span>

                {/* Delete */}
                <span title="Delete" style={{ display: 'inline-flex' }}>
                  <button
                    className="timeline-btn frameless-btn"
                    style={{
                      padding: '0', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '7px',
                      color: selectedClip ? '#f87171' : undefined,
                    }}
                    onClick={() => selectedClip && deleteClip(selectedClip)}
                    disabled={!selectedClip}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </span>

                {/* Transition Option */}
                {selectedClip && (() => {
                  const isText = selectedClip.text !== undefined;
                  let isAudio = false;
                  if (selectedClip.path) {
                    const ext = selectedClip.path.split('.').pop().toLowerCase();
                    isAudio = ['mp3','wav','m4a','ogg','aac'].includes(ext);
                  }
                  return !isText && !isAudio;
                })() && (
                  <button
                    className="timeline-btn frameless-btn"
                    style={{ padding: '0', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '7px' }}
                    onClick={() => setFocusSection('animations')}
                    title="Transition"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 17 22 12" />
                    </svg>
                  </button>
                )}

                <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)', margin: '0 3px' }} />
                
                {/* Add Line */}
                <button
                  className="timeline-btn frameless-btn"
                  style={{ padding: '0', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '7px' }}
                  onClick={addEmptyTrack}
                  title="Add Timeline Line"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>

              {/* CENTER: Playback Controls */}
              <div className="timeline-center-tools">
                {/* Skip to Start */}
                <button
                  className="timeline-btn frameless-btn"
                  style={{ padding: '0', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '7px' }}
                  onClick={() => setCurrentTime(0)}
                  title="Skip to Start"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="19 20 9 12 19 4 19 20" />
                    <line x1="5" y1="19" x2="5" y2="5" />
                  </svg>
                </button>

                {/* Simple Premium Play/Pause button */}
                <button
                  onClick={togglePlay}
                  title={isPlaying ? 'Pause' : 'Play'}
                  className="premium-play-btn"
                >
                  {isPlaying ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="5" y="4" width="4.5" height="16" rx="1.5" />
                      <rect x="14.5" y="4" width="4.5" height="16" rx="1.5" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </button>

                {/* Skip to End */}
                <button
                  className="timeline-btn frameless-btn"
                  style={{ padding: '0', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '7px' }}
                  onClick={() => setCurrentTime(getContentEndTime())}
                  title="Skip to End"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 4 15 12 5 20 5 4" />
                    <line x1="19" y1="5" x2="19" y2="19" />
                  </svg>
                </button>

                <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)', margin: '0 3px' }} />

                {/* Speed – custom cycling picker (Keeps Background Pill) */}
                <div style={{ position: 'relative' }} ref={speedRef}>
                  <button
                    className="timeline-btn speed-badge-btn"
                    onClick={() => setSpeedOpen(o => !o)}
                    title="Playback Speed"
                    style={{
                      height: '28px', minWidth: '44px', padding: '0 8px',
                      borderRadius: '7px', fontSize: '11px', fontWeight: '700',
                      display: 'flex', alignItems: 'center', gap: '3px',
                      color: playbackSpeed !== 1.0 ? '#38bdf8' : undefined,
                      borderColor: playbackSpeed !== 1.0 ? 'rgba(56, 189, 248, 0.4)' : undefined,
                    }}
                  >
                    {playbackSpeed}x
                    <svg width="8" height="8" viewBox="0 0 10 6" fill="currentColor" style={{ opacity: 0.6 }}>
                      <path d="M0 0l5 6 5-6z" />
                    </svg>
                  </button>
                  {speedOpen && (
                    <div className="speed-dropdown-menu">
                      {[
                        { speed: 0.25, label: '0.25x', sub: 'Slow' },
                        { speed: 0.5,  label: '0.5x',  sub: 'Slow' },
                        { speed: 0.75, label: '0.75x', sub: '' },
                        { speed: 1.0,  label: '1x',    sub: 'Normal' },
                        { speed: 1.25, label: '1.25x', sub: '' },
                        { speed: 1.5,  label: '1.5x',  sub: 'Fast' },
                        { speed: 2.0,  label: '2x',    sub: 'Ultra' },
                      ].map(item => (
                        <button
                          key={item.speed}
                          onClick={() => { setPlaybackSpeed(item.speed); setSpeedOpen(false); }}
                          className={`speed-dropdown-item ${playbackSpeed === item.speed ? 'active' : ''}`}
                        >
                          <span className="speed-item-val">{item.label}</span>
                          {item.sub && <span className="speed-item-sub">{item.sub}</span>}
                          {playbackSpeed === item.speed && <span className="speed-item-check">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Time Display */}
                <div className="timeline-time-display" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}>
                  {formatRulerTime(Math.floor(currentTime))} / {formatRulerTime(Math.floor(project.duration))}
                </div>
              </div>

              <div className="timeline-right-tools">
                {/* Aspect ratio (Keeps Background Pill) */}
                <div className="aspect-ratio-selector" style={{ position: 'relative', marginRight: '6px', padding: '2px 8px', height: '28px' }} ref={aspectRatioRef}>
                  <div className="aspect-ratio-select-trigger" onClick={() => setAspectRatioOpen(o => !o)}>
                    <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {selectedPreset.icon} {selectedPreset.ratio} ▾
                    </span>
                  </div>
                  {aspectRatioOpen && (
                    <div className="aspect-ratio-dropdown-menu">
                      {/* Search Bar */}
                      <div className="aspect-ratio-search-wrap">
                        <input
                          type="text"
                          placeholder="Search ratio..."
                          value={arSearchQuery}
                          onChange={e => setArSearchQuery(e.target.value)}
                          onClick={e => e.stopPropagation()}
                          className="aspect-ratio-search-input"
                        />
                      </div>

                      <div className="aspect-ratio-menu-list">
                        {(() => {
                          const filtered = ASPECT_PRESETS.filter(p =>
                            p.name.toLowerCase().includes(arSearchQuery.toLowerCase()) ||
                            p.ratio.includes(arSearchQuery)
                          );
                          const social = filtered.filter(p => p.category === 'Social');
                          const custom = filtered.filter(p => p.category === 'Custom');
                          
                          const renderItem = (item) => (
                            <div
                              key={item.id}
                              className={`aspect-ratio-menu-item ${selectedPreset.id === item.id ? 'active' : ''}`}
                              onClick={() => { setSelectedPreset(item); setAspectRatioOpen(false); setArSearchQuery(''); }}
                            >
                              <span className="aspect-ratio-item-icon">{item.icon}</span>
                              <div className="aspect-ratio-item-text">
                                <span className="aspect-ratio-item-label">{item.name}</span>
                                <span className="aspect-ratio-item-sub">{item.ratio}</span>
                              </div>
                              {selectedPreset.id === item.id && (
                                <span className="aspect-ratio-item-checkmark">✓</span>
                              )}
                            </div>
                          );

                          return (
                            <>
                              {social.length > 0 && (
                                <>
                                  <div className="aspect-ratio-menu-header">Social Presets</div>
                                  {social.map(renderItem)}
                                </>
                              )}
                              {custom.length > 0 && (
                                <>
                                  <div className="aspect-ratio-menu-header">Custom Presets</div>
                                  {custom.map(renderItem)}
                                </>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                <div className="zoom-slider-wrap frameless-zoom-wrap" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    className="timeline-btn frameless-btn"
                    style={{ padding: '0', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '7px' }}
                    onClick={() => setZoom(z => Math.max(-44, z - 3))}
                    title="Zoom Out"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={Math.max(1, Math.min(100, zoom))}
                    onChange={e => setZoom(parseInt(e.target.value))}
                    className="zoom-slider-input"
                    title="Zoom Slider"
                    style={{ width: '70px' }}
                  />
                  <button
                    className="timeline-btn frameless-btn"
                    style={{ padding: '0', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '7px' }}
                    onClick={() => setZoom(z => Math.min(110, z + 3))}
                    title="Zoom In"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="11" y1="8" x2="11" y2="14" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </button>
                  <button
                    className="timeline-btn frameless-btn"
                    onClick={fitTimelineZoom}
                    title="Fit Timeline to Window"
                    style={{ padding: '0', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '7px' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable timeline tracks and blocks container */}
            <div className="timeline-scroll-container" ref={timelineScrollRef}
              style={isTimelineEmpty ? { overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}}
              onMouseDown={(e) => {
                if (isTimelineEmpty) return;
                const isOnRulerArea =
                  e.target === timelineScrollRef.current ||
                  e.target.classList.contains('timeline-ruler') ||
                  e.target.classList.contains('ruler-spacer') ||
                  e.target.classList.contains('ruler-tick') ||
                  e.target.classList.contains('label-tick') ||
                  e.target.classList.contains('ruler-label');
                if (isOnRulerArea) {
                  setIsDraggingPlayhead(true);
                  // Immediate seek on click
                  const scrollEl = timelineScrollRef.current;
                  const scrollLeft = scrollEl ? scrollEl.scrollLeft : 0;
                  const rect = scrollEl ? scrollEl.getBoundingClientRect() : { left: 0 };
                  const clickX = e.clientX - rect.left + scrollLeft - TRACK_LABEL_WIDTH;
                  const newTime = Math.max(0, Math.min(getContentEndTime(), clickX / pxPerSec));
                  setCurrentTime(newTime);
                }
              }}
              onMouseMove={(e) => {
                if (isTimelineEmpty) return;
                const scrollEl = timelineScrollRef.current;
                const scrollLeft = scrollEl ? scrollEl.scrollLeft : 0;
                const rect = scrollEl ? scrollEl.getBoundingClientRect() : { left: 0 };
                const clickX = e.clientX - rect.left + scrollLeft - TRACK_LABEL_WIDTH;
                const hoverT = clickX / pxPerSec;
                const maxT = getContentEndTime();
                if (hoverT >= 0 && hoverT <= maxT) {
                  setHoverTime(hoverT);
                } else {
                  setHoverTime(null);
                }
              }}
              onMouseLeave={() => {
                setHoverTime(null);
              }}
            >

              {isTimelineEmpty ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', padding: '24px', boxSizing: 'border-box' }}>
                  <div
                    onClick={() => emptyTimelineFileInputRef.current?.click()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1.5px solid rgba(255, 255, 255, 0.08)',
                      color: 'rgba(255, 255, 255, 0.55)',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      userSelect: 'none'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.borderColor = '#0084ff';
                      e.currentTarget.style.background = 'rgba(0, 132, 255, 0.08)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.55)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Add media to this project</span>
                  </div>
                  <input
                    type="file"
                    ref={emptyTimelineFileInputRef}
                    onChange={handleEmptyTimelineUpload}
                    multiple
                    style={{ display: 'none' }}
                    accept="video/*,audio/*,image/*"
                  />
                </div>
              ) : (
                <>
                  {/* Ruler */}
                  <div className="timeline-ruler" style={{ width: timelineLengthSec * pxPerSec + TRACK_LABEL_WIDTH }}>
                    <div className="ruler-spacer" />
                    {(() => {
                      const steps = [
                        1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 1200, 1800, 3600, 7200
                      ];
                      let tickStep = steps.find(s => s * pxPerSec >= 60) || 5;

                      const elements = [];
                      const totalTicks = Math.ceil(timelineLengthSec / tickStep) + 1;

                      for (let i = 0; i < totalTicks; i++) {
                        const mainSec = i * tickStep;
                        if (mainSec > timelineLengthSec) break;

                        // Multiples of 5 or 0 are major ticks with text numbers
                        const isMajor = (mainSec === 0 || mainSec % 5 === 0);

                        elements.push(
                          <div
                            key={`main-${mainSec}`}
                            className={`ruler-tick ${isMajor ? 'label-tick major-tick' : 'sub-tick minor-tick'}`}
                            style={{ left: mainSec * pxPerSec + TRACK_LABEL_WIDTH }}
                          >
                            {isMajor && (
                              <span
                                className="ruler-label"
                                style={mainSec === 0 ? { left: '4px', textAlign: 'left', width: 'auto' } : {}}
                              >
                                {formatRulerLabel(mainSec)}
                              </span>
                            )}
                          </div>
                        );

                        // Sub Ticks between main ticks when tickStep >= 5
                        if (i < totalTicks - 1 && tickStep >= 5) {
                          const subInterval = tickStep / 5;
                          for (let sub = 1; sub < 5; sub++) {
                            const subSec = mainSec + sub * subInterval;
                            if (subSec > timelineLengthSec) break;
                            elements.push(
                              <div
                                key={`sub-${mainSec}-${sub}`}
                                className="ruler-tick sub-tick minor-tick"
                                style={{ left: subSec * pxPerSec + TRACK_LABEL_WIDTH }}
                              />
                            );
                          }
                        }
                      }

                      return elements;
                    })()}
                  </div>

                   {/* Playhead */}
                  <div
                    className="playhead-line"
                    ref={playheadLineRef}
                    style={{ left: currentTime * pxPerSec + TRACK_LABEL_WIDTH, height: '100%' }}
                  >
                    <div className="playhead-cap-container">
                      <svg width="14" height="20" viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 2C0 0.895431 0.89543 0 2 0H12C13.1046 0 14 0.895431 14 2V12.4358C14 13.0644 13.7042 13.6552 13.2008 14.0327L7.80077 18.0827C7.32757 18.4376 6.67243 18.4376 6.19923 18.0827L0.799229 14.0327C0.295831 13.6552 0 13.0644 0 12.4358V2Z" fill="#ff3b30" />
                        <line x1="7" y1="3" x2="7" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                      </svg>
                    </div>
                  </div>

                  {/* Blue Hover Playhead */}
                  {hoverTime !== null && (
                    <div
                      className="hover-playhead-line"
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        width: '1px',
                        backgroundColor: '#0084ff',
                        pointerEvents: 'none',
                        zIndex: 499,
                        boxShadow: '0 0 4px rgba(0, 132, 255, 0.4)',
                        left: hoverTime * pxPerSec + TRACK_LABEL_WIDTH,
                        height: '100%'
                      }}
                    />
                  )}

                  {/* Tracks Area */}
                  <div className="timeline-tracks-area">
                    {['track1', 'track2', 'track3', 'track4', 'track5', 'track6', 'track7', 'track8']
                      .filter(key => (project.tracks[key] || []).length > 0 || customActiveTracks[key])
                      .map((key) => (
                      <div
                        key={key}
                        className={`timeline-track ${hiddenTracks[key] ? 'hidden-track' : ''}`}
                        style={{ width: timelineLengthSec * pxPerSec + TRACK_LABEL_WIDTH }}
                        onDragOver={handleTimelineDragOver}
                        onDrop={(e) => handleTrackDrop(e, key)}
                        onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}
                      >
                        {/* Sticky track label on the left */}
                        <div
                          className="timeline-track-label"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleTrackReorderDrop(e, key)}
                        >
                          <div className="track-label-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', height: '100%' }}>
                            {/* Track Drag Handle for reordering (only shown on non-empty lines) */}
                            {(project.tracks[key] || []).length > 0 && (
                              <div
                                className="track-drag-handle"
                                draggable
                                onDragStart={(e) => {
                                  e.stopPropagation();
                                  e.dataTransfer.setData('text/plain', key);
                                  setDraggedTrackKey(key);
                                }}
                                title="Drag line up/down"
                                style={{ cursor: 'grab', display: 'flex', alignItems: 'center', padding: '2px', color: '#94a3b8', opacity: 0.6 }}
                              >
                                <svg width="10" height="12" viewBox="0 0 24 24" fill="currentColor">
                                  <circle cx="8" cy="5" r="2.5" />
                                  <circle cx="16" cy="5" r="2.5" />
                                  <circle cx="8" cy="12" r="2.5" />
                                  <circle cx="16" cy="12" r="2.5" />
                                  <circle cx="8" cy="19" r="2.5" />
                                  <circle cx="16" cy="19" r="2.5" />
                                </svg>
                              </div>
                            )}

                            <button
                              className={`track-ctrl-btn ${mutedTracks[key] ? 'active' : ''}`}
                              onClick={() => setMutedTracks(m => ({ ...m, [key]: !m[key] }))}
                              title={mutedTracks[key] ? 'Unmute Track' : 'Mute Track'}
                              style={{ border: 'none', background: 'transparent', color: mutedTracks[key] ? '#ff9f43' : '#888', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              {mutedTracks[key] ? (
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
                                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                  <line x1="23" y1="9" x2="17" y2="15" />
                                  <line x1="17" y1="9" x2="23" y2="15" />
                                </svg>
                              ) : (
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                </svg>
                              )}
                            </button>
                            <button
                              className={`track-ctrl-btn ${hiddenTracks[key] ? 'active' : ''}`}
                              onClick={() => setHiddenTracks(h => ({ ...h, [key]: !h[key] }))}
                              title={hiddenTracks[key] ? 'Show Track' : 'Hide Track'}
                              style={{ border: 'none', background: 'transparent', color: hiddenTracks[key] ? '#888' : '#0084ff', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              {hiddenTracks[key] ? (
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
                                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                  <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                              ) : (
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              )}
                            </button>
                            
                            {((project.tracks[key] || []).length === 0) && (
                              <button
                                className="track-ctrl-btn danger"
                                onClick={() => deleteEmptyTrack(key)}
                                title="Delete Empty Line"
                                style={{ border: 'none', background: 'transparent', color: '#ff4d4d', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                  <path d="M10 11v6M14 11v6" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Scrollable blocks container on the right */}
                        <div className="timeline-track-blocks">
                          {(() => {
                            let clips = project.tracks[key] || [];
                            
                            // Deduplicate by ID
                            const seen = new Set();
                            clips = clips.filter(c => {
                              if (seen.has(c.id)) return false;
                              seen.add(c.id);
                              return true;
                            });

                            return clips.map(clip => {
                              const isText = clip.text !== undefined;
                              let isAudio = false;
                              if (clip.path) {
                                const ext = clip.path.split('.').pop().toLowerCase();
                                isAudio = ['mp3','wav','m4a','ogg','aac'].includes(ext);
                              }
                              
                              let mediaClass = 'video-block';
                              if (isText) {
                                mediaClass = 'caption-block';
                              } else if (isAudio) {
                                mediaClass = 'music-block';
                              }
                              
                              const isImg = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(clip.path || clip.filename);
                              
                              return (
                                <div
                                  key={clip.id}
                                  className={`timeline-block ${mediaClass} ${selectedClip?.id === clip.id ? 'selected' : ''}`}
                                  style={{
                                    left: clip.start * pxPerSec,
                                    width: Math.max(4, clip.duration * pxPerSec),
                                  }}
                                  draggable
                                  onDragStart={(e) => handleBlockDragStart(e, clip, 'move')}
                                  onClick={() => setSelectedClip(clip)}
                                  onContextMenu={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const menuWidth = 175;
                                    const menuHeight = 240;
                                    let x = e.clientX;
                                    let y = e.clientY;
                                    if (x + menuWidth > window.innerWidth) {
                                      x = Math.max(10, window.innerWidth - menuWidth - 12);
                                    }
                                    if (y + menuHeight > window.innerHeight) {
                                      y = Math.max(10, window.innerHeight - menuHeight - 12);
                                    }
                                    setContextMenu({ x, y, clip });
                                  }}
                                >
                                  <div className="block-resize-handle handle-left" draggable onDragStart={(e) => handleBlockDragStart(e, clip, 'resize-left')} />
                                  
                                  {/* Video Filmstrip Preview */}
                                  {!isText && !isAudio && clip.path && (
                                    <div className="block-preview-filmstrip" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', overflow: 'hidden', pointerEvents: 'none', zIndex: 1, opacity: 0.38 }}>
                                      {isImg ? (
                                        <img
                                          src={toUrlPath(clip.path)}
                                          alt="thumb"
                                          className="timeline-block-image-thumb"
                                          style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                                        />
                                      ) : (
                                        Array.from({ length: Math.max(1, Math.ceil(clip.duration / 3)) }).map((_, idx) => (
                                          <video
                                            key={idx}
                                            src={toUrlPath(clip.path) + `#t=${idx * 3}`}
                                            muted
                                            preload="metadata"
                                            playsInline
                                            className="timeline-block-video-thumb"
                                            style={{ height: '100%', width: '40px', objectFit: 'cover', flexShrink: 0, borderRight: '1.5px solid rgba(0,0,0,0.25)' }}
                                          />
                                        ))
                                      )}
                                    </div>
                                  )}

                                  {/* Audio Waveform Preview */}
                                  {isAudio && (
                                    <div className="audio-waveform-decor" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.15, overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '2px', padding: '0 4px', pointerEvents: 'none', zIndex: 1 }}>
                                      {Array.from({ length: 40 }).map((_, idx) => (
                                        <div
                                          key={idx}
                                          style={{
                                            width: '2px',
                                            height: `${Math.max(10, Math.sin(idx * 0.5) * 80 + 20)}%`,
                                            backgroundColor: '#fff',
                                            borderRadius: '1px'
                                          }}
                                        />
                                      ))}
                                    </div>
                                  )}

                                  <span style={{ zIndex: 2, position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    {isText && <span style={{ marginRight: '6px', fontSize: '11px', opacity: 0.8 }}>💬</span>}
                                    {clip.filename || clip.text || ''}
                                  </span>
                                  
                                  <div className="block-resize-handle handle-right" draggable onDragStart={(e) => handleBlockDragStart(e, clip, 'resize-right')} />
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    ))
                  }
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ══ CONTEXT MENU ══ */}
      {contextMenu && (() => {
        const clip = contextMenu.clip;
        const isText = clip.text !== undefined;
        let isAudio = false;
        let isImage = false;
        if (clip.path) {
          const ext = clip.path.split('.').pop().toLowerCase();
          isAudio = ['mp3','wav','m4a','ogg','aac'].includes(ext);
          isImage = ['jpg','jpeg','png','gif','webp','bmp','svg'].includes(ext);
        }
        const _cat = clip.category || '';
        const _id = clip.id || '';
        const isShape = _cat === 'Shapes' || _id.startsWith('shp_');
        const isBadge = _cat === 'Badges' || !!clip.isBadge || _id.startsWith('bdg_');
        const isIcon = _cat === 'Social Icons' || _id.startsWith('ico_');
        const isVisualizer = _cat === 'Visualizers' || _id.startsWith('vis_');
        const isElement = isShape || isBadge || isIcon || isVisualizer;

        // Custom style for context items
        const itemStyle = {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          color: '#ffffff',
          fontSize: '12px',
          cursor: 'pointer',
          borderRadius: '4px',
          transition: 'background 0.15s'
        };

        const hoverBg = (e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; };
        const unhoverBg = (e) => { e.currentTarget.style.backgroundColor = 'transparent'; };

        return (
          <div
            className="context-menu"
            style={{
              position: 'fixed',
              left: contextMenu.x,
              top: contextMenu.y,
              backgroundColor: '#0c0d14',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              padding: '4px',
              zIndex: 999999,
              minWidth: '180px'
            }}
          >
            {/* 1. Split */}
            <div
              style={itemStyle}
              onMouseEnter={hoverBg}
              onMouseLeave={unhoverBg}
              onClick={() => { splitClipAtPlayhead(clip); setContextMenu(null); }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                <circle cx="6" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <line x1="9.8" y1="8.2" x2="20" y2="17" />
                <line x1="9.8" y1="15.8" x2="20" y2="7" />
              </svg>
              split
            </div>

            {/* 2. Duplicate */}
            <div
              style={itemStyle}
              onMouseEnter={hoverBg}
              onMouseLeave={unhoverBg}
              onClick={() => { duplicateClip(clip); setContextMenu(null); }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              duplicate
            </div>

            {/* 3. Specialized Element Properties */}
            {isShape && (
              <div
                style={itemStyle}
                onMouseEnter={hoverBg}
                onMouseLeave={unhoverBg}
                onClick={() => { setSelectedClip(clip); setContextMenu(null); }}
              >
                <span style={{ fontSize: '13px' }}>📐</span> shape element properties
              </div>
            )}
            {isBadge && (
              <div
                style={itemStyle}
                onMouseEnter={hoverBg}
                onMouseLeave={unhoverBg}
                onClick={() => { setSelectedClip(clip); setContextMenu(null); }}
              >
                <span style={{ fontSize: '13px' }}>🏷️</span> Badge element properties
              </div>
            )}
            {isIcon && (
              <div
                style={itemStyle}
                onMouseEnter={hoverBg}
                onMouseLeave={unhoverBg}
                onClick={() => { setSelectedClip(clip); setContextMenu(null); }}
              >
                <span style={{ fontSize: '13px' }}>🎨</span> Icons element properties
              </div>
            )}
            {isVisualizer && (
              <div
                style={itemStyle}
                onMouseEnter={hoverBg}
                onMouseLeave={unhoverBg}
                onClick={() => { setSelectedClip(clip); setContextMenu(null); }}
              >
                <span style={{ fontSize: '13px' }}>🔊</span> Visualizers element properties
              </div>
            )}
            {!isElement && (
              <div
                style={itemStyle}
                onMouseEnter={hoverBg}
                onMouseLeave={unhoverBg}
                onClick={() => { setSelectedClip(clip); setContextMenu(null); }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                {isVideo ? 'Video Setting' : isImage ? 'Image Setting' : isAudio ? 'Audio Setting' : 'Text Setting'}
              </div>
            )}

            {/* 4. Delete */}
            <div
              style={{ ...itemStyle, color: '#ff453a' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 69, 58, 0.12)'; }}
              onMouseLeave={unhoverBg}
              onClick={() => { deleteClip(clip); setContextMenu(null); }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}>
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              delete
            </div>

            {/* 4. Audio Submenu (Video only) */}
            {isVideo && (
              <div
                className="context-item-with-submenu"
                style={{
                  ...itemStyle,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={hoverBg}
                onMouseLeave={unhoverBg}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                  <span>Audio</span>
                </div>
                <span style={{ fontSize: '10px', opacity: 0.6 }}>▸</span>
                
                {/* Nested Submenu */}
                <div
                  className="context-submenu"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={itemStyle}
                    onMouseEnter={hoverBg}
                    onMouseLeave={unhoverBg}
                    onClick={() => { toggleClipMute(clip); setContextMenu(null); }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.8 }}>
                      {clip.mute ? (
                        <>
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <line x1="23" y1="9" x2="17" y2="15" />
                          <line x1="17" y1="9" x2="23" y2="15" />
                        </>
                      ) : (
                        <>
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
                        </>
                      )}
                    </svg>
                    <span>{clip.mute ? 'Unmute Audio' : 'Mute Audio'}</span>
                  </div>
                  <div
                    style={itemStyle}
                    onMouseEnter={hoverBg}
                    onMouseLeave={unhoverBg}
                    onClick={() => { detachAudio(clip); setContextMenu(null); }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.8 }}>
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                    <span>Detach</span>
                  </div>
                </div>
              </div>
            )}

            {/* Mute Audio Option for Audio clip */}
            {isAudio && (
              <div
                style={itemStyle}
                onMouseEnter={hoverBg}
                onMouseLeave={unhoverBg}
                onClick={() => { toggleClipMute(clip); setContextMenu(null); }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                  {!clip.mute ? (
                    <>
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </>
                  ) : (
                    <>
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </>
                  )}
                </svg>
                {clip.mute ? 'Unmute Audio (100%)' : 'Mute Audio (100%)'}
              </div>
            )}

            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />

            {/* 5. Delete */}
            <div
              className="danger"
              style={{
                ...itemStyle,
                color: '#ff4d4d'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,77,77,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              onClick={() => { deleteClip(clip); setContextMenu(null); }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
              Delete
            </div>
          </div>
        );
      })()}
      {contextMenu && <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99999 }} onClick={() => setContextMenu(null)} />}

      {/* ══ EXPORT MODAL ══ */}
      {exportModal && (
        <div className="export-overlay">
          <div className="export-card">
            {!renderingTaskId && !renderStatus ? (
              <>
                <h3 className="dashboard-title" style={{ fontSize: '24px', marginBottom: '16px' }}>Render Settings</h3>
                <div className="prop-group" style={{ textAlign: 'left' }}>
                  <label className="prop-label">Resolution</label>
                  <select className="prop-select" value={exportRes} onChange={e => setExportRes(e.target.value)}>
                    <option value="720p">720p HD</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="4K">4K Ultra HD</option>
                  </select>
                </div>
                <div className="prop-group" style={{ textAlign: 'left' }}>
                  <label className="prop-label">FPS</label>
                  <select className="prop-select" value={exportFps} onChange={e => setExportFps(e.target.value)}>
                    <option value="24">24 Cinema</option>
                    <option value="30">30 Standard</option>
                    <option value="60">60 YouTube</option>
                  </select>
                </div>
                <div className="prop-group" style={{ textAlign: 'left', marginBottom: '32px' }}>
                  <label className="prop-label">Quality</label>
                  <select className="prop-select" value={exportQuality} onChange={e => setExportQuality(e.target.value)}>
                    <option value="low">Low (Fastest)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (Lossless)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="dashboard-btn" style={{ flex: 1 }} onClick={() => setExportModal(false)}>Cancel</button>
                  <button className="dashboard-btn primary-action" style={{ flex: 1 }} onClick={startRender}>Start Render</button>
                </div>
              </>
            ) : (
              <>
                <div className="export-progress-circle" />
                <div className="export-stage">{renderStatus ? renderStatus.stage : 'Queueing Render...'}</div>
                <div className="progress-pct">{renderStatus ? renderStatus.progress : 0}%</div>
                <div className="export-log">{renderStatus?.logs ? renderStatus.logs.join('\n') : 'Running local FFmpeg subprocess...'}</div>
                {renderStatus && (renderStatus.completed || renderStatus.failed) && (
                  <button className="dashboard-btn primary-action" style={{ width: '100%' }} onClick={() => setExportModal(false)}>Close</button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ══ PROJECTS MODAL ══ */}
      {(showProjectsModal || !projectId) && (
        <div className="projects-modal-backdrop">
          <div className="projects-modal-content">
            <div className="projects-modal-header">
              <img src="/logo.jpg" alt="Logo" className="projects-modal-logo" />
              <h2 className="projects-modal-title">YAHYA AI STUDIO</h2>
              <p className="projects-modal-subtitle">Choose an existing project or create a new one</p>
            </div>

            <div className="projects-creation-box">
              <input
                type="text"
                className="projects-input-field"
                placeholder="Enter Project Name..."
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') createProject(); }}
              />
              <button className="dashboard-btn primary-action" style={{ padding: '8px 20px', borderRadius: '8px' }} onClick={() => createProject()}>Create</button>
            </div>

            <div className="projects-modal-body">
              <h3 className="projects-modal-list-title">Saved Projects</h3>
              <div className="projects-list-scroll">
                {projects.map(p => (
                  <div
                    key={p.id}
                    className={`project-list-row ${projectId === p.id ? 'active-row' : ''}`}
                    onClick={() => { setActiveProjectId(p.id); setShowProjectsModal(false); }}
                    style={{ borderLeft: projectId === p.id ? '4px solid var(--primary)' : '1px solid var(--bg-border)' }}
                  >
                    <div className="project-row-info">
                      <span className="project-row-name">{p.name}</span>
                      <span className="project-row-date">Duration: {p.duration ? `${p.duration.toFixed(0)}s` : '30s'}</span>
                    </div>
                    <div className="project-row-actions">
                      <button className="project-delete-btn" onClick={(e) => deleteProject(e, p.id)}>Delete</button>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>No saved projects found.</div>
                )}
              </div>
            </div>

            {projectId && (
              <div className="projects-modal-footer">
                <button className="dashboard-btn" style={{ padding: '8px 16px', borderRadius: '8px' }} onClick={() => setShowProjectsModal(false)}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ SIDEBAR PREMIUM FLOATING TOOLTIP ══ */}
      {hoveredSec && hoveredRect && (
        <div
          className="sidebar-floating-tooltip"
          style={{
            position: 'fixed',
            top: hoveredRect.top + hoveredRect.height / 2,
            left: hoveredRect.right + 12,
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            zIndex: 99999,
          }}
        >
          <div className="sidebar-tooltip-content">
            {hoveredSec}
          </div>
        </div>
      )}

    </div>
  );
}