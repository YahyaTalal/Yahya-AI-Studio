// Clean & Premium Elements Data Collection for Video Editor

export const STICKER_CATEGORIES = [
  'All',
  'Shapes',
  'Badges',
  'Icons',
  'Visualizers'
];

export const STICKERS_DATA = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. SHAPES (Clean Shapes without color names in title)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'shp_square_red',
    name: 'Square',
    category: 'Shapes',
    tags: ['shape', 'square', 'red', 'rectangle', 'box'],
    color: '#ef4444',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80" rx="8" fill="var(--sticker-color, #ef4444)"/></svg>`
  },
  {
    id: 'shp_square_blue',
    name: 'Square',
    category: 'Shapes',
    tags: ['shape', 'square', 'blue', 'rectangle', 'box'],
    color: '#3b82f6',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80" rx="8" fill="var(--sticker-color, #3b82f6)"/></svg>`
  },
  {
    id: 'shp_circle_yellow',
    name: 'Circle',
    category: 'Shapes',
    tags: ['shape', 'circle', 'yellow', 'dot', 'round'],
    color: '#f59e0b',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="var(--sticker-color, #f59e0b)"/></svg>`
  },
  {
    id: 'shp_triangle_purple',
    name: 'Triangle',
    category: 'Shapes',
    tags: ['shape', 'triangle', 'purple', 'pointer'],
    color: '#a855f7',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="50,10 90,85 10,85" fill="var(--sticker-color, #a855f7)"/></svg>`
  },
  {
    id: 'shp_diamond_blue',
    name: 'Diamond',
    category: 'Shapes',
    tags: ['shape', 'diamond', 'blue', 'rhombus'],
    color: '#38bdf8',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="50,10 90,50 50,90 10,50" fill="var(--sticker-color, #38bdf8)"/></svg>`
  },
  {
    id: 'shp_pentagon_red',
    name: 'Pentagon',
    category: 'Shapes',
    tags: ['shape', 'pentagon', 'red', 'polygon'],
    color: '#ef4444',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="50,10 90,40 75,88 25,88 10,40" fill="var(--sticker-color, #ef4444)"/></svg>`
  },
  {
    id: 'shp_hexagon_blue',
    name: 'Hexagon',
    category: 'Shapes',
    tags: ['shape', 'hexagon', 'blue', 'polygon'],
    color: '#3b82f6',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="var(--sticker-color, #3b82f6)"/></svg>`
  },
  {
    id: 'shp_octagon_yellow',
    name: 'Octagon',
    category: 'Shapes',
    tags: ['shape', 'octagon', 'yellow', 'stop'],
    color: '#eab308',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="30,10 70,10 90,30 90,70 70,90 30,90 10,70 10,30" fill="var(--sticker-color, #eab308)"/></svg>`
  },
  {
    id: 'shp_starburst_purple',
    name: 'Starburst',
    category: 'Shapes',
    tags: ['shape', 'starburst', 'purple', 'sunburst', 'badge'],
    color: '#a855f7',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M50 5L58 18L73 10L75 26L91 25L86 40L100 48L89 59L98 72L83 77L86 93L70 91L65 105L50 95L35 105L30 91L14 93L17 77L2 72L11 59L0 48L14 40L9 25L25 26L27 10L42 18Z" fill="var(--sticker-color, #a855f7)"/></svg>`
  },
  {
    id: 'shp_arrow_right',
    name: 'Right Arrow',
    category: 'Shapes',
    tags: ['shape', 'arrow', 'right', 'blue', 'pointer'],
    color: '#3b82f6',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 35 H55 V18 L90 50 L55 82 V65 H10 Z" fill="var(--sticker-color, #3b82f6)"/></svg>`
  },
  {
    id: 'shp_arrow_up',
    name: 'Up Arrow',
    category: 'Shapes',
    tags: ['shape', 'arrow', 'up', 'red', 'pointer'],
    color: '#ef4444',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M35 90 V45 H18 L50 10 L82 45 H65 V90 Z" fill="var(--sticker-color, #ef4444)"/></svg>`
  },
  {
    id: 'shp_checkmark',
    name: 'Checkmark',
    category: 'Shapes',
    tags: ['shape', 'check', 'checkmark', 'blue', 'tick', 'yes'],
    color: '#3b82f6',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 50 L40 75 L85 20" stroke="var(--sticker-color, #3b82f6)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`
  },
  {
    id: 'shp_cross_x',
    name: 'Cross X',
    category: 'Shapes',
    tags: ['shape', 'cross', 'x', 'yellow', 'cancel', 'multiply'],
    color: '#eab308',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 22 L78 78 M78 22 L22 78" stroke="var(--sticker-color, #eab308)" stroke-width="16" stroke-linecap="round" fill="none"/></svg>`
  },
  {
    id: 'shp_chevron_down',
    name: 'Chevron Down',
    category: 'Shapes',
    tags: ['shape', 'chevron', 'down', 'purple', 'arrow'],
    color: '#a855f7',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 35 L50 68 L82 35" stroke="var(--sticker-color, #a855f7)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`
  },
  {
    id: 'shp_zigzag',
    name: 'Sawtooth Zigzag',
    category: 'Shapes',
    tags: ['shape', 'zigzag', 'sawtooth', 'blue', 'wave', 'line'],
    color: '#38bdf8',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 50 L26 30 L42 70 L58 30 L74 70 L90 50" stroke="var(--sticker-color, #38bdf8)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`
  },
  {
    id: 'shp_plus_red',
    name: 'Plus',
    category: 'Shapes',
    tags: ['shape', 'plus', 'add', 'red', 'cross'],
    color: '#ef4444',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M50 15 V85 M15 50 H85" stroke="var(--sticker-color, #ef4444)" stroke-width="16" stroke-linecap="round" fill="none"/></svg>`
  },
  {
    id: 'shp_plus_blue',
    name: 'Plus',
    category: 'Shapes',
    tags: ['shape', 'plus', 'add', 'blue', 'cross'],
    color: '#3b82f6',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M50 15 V85 M15 50 H85" stroke="var(--sticker-color, #3b82f6)" stroke-width="16" stroke-linecap="round" fill="none"/></svg>`
  },
  {
    id: 'shp_heart_yellow',
    name: 'Heart',
    category: 'Shapes',
    tags: ['shape', 'heart', 'yellow', 'love', 'like'],
    color: '#eab308',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M50 85 C20 60 5 40 5 25 C5 12 15 5 27 5 C36 5 44 10 50 18 C56 10 64 5 73 5 C85 5 95 12 95 25 C95 40 80 60 50 85 Z" fill="var(--sticker-color, #eab308)"/></svg>`
  },
  {
    id: 'shp_heart_purple',
    name: 'Heart',
    category: 'Shapes',
    tags: ['shape', 'heart', 'purple', 'love', 'like'],
    color: '#a855f7',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M50 85 C20 60 5 40 5 25 C5 12 15 5 27 5 C36 5 44 10 50 18 C56 10 64 5 73 5 C85 5 95 12 95 25 C95 40 80 60 50 85 Z" fill="var(--sticker-color, #a855f7)"/></svg>`
  },
  {
    id: 'shp_sparkle_star',
    name: 'Sparkle Star',
    category: 'Shapes',
    tags: ['shape', 'sparkle', 'star', 'blue', 'diamond', 'shine'],
    color: '#38bdf8',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M50 5 C50 30 70 50 95 50 C70 50 50 70 50 95 C50 70 30 50 5 50 C30 50 50 30 50 5 Z" fill="var(--sticker-color, #38bdf8)"/></svg>`
  },
  {
    id: 'shp_star_red',
    name: 'Star',
    category: 'Shapes',
    tags: ['shape', 'star', 'red', 'rating', 'favorite'],
    color: '#ef4444',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 63,35 95,38 71,60 78,92 50,75 22,92 29,60 5,38 37,35" fill="var(--sticker-color, #ef4444)"/></svg>`
  },
  {
    id: 'shp_burst_star',
    name: 'Burst Star',
    category: 'Shapes',
    tags: ['shape', 'burst', 'explosion', 'blue', 'star'],
    color: '#38bdf8',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 57,25 76,12 70,32 92,31 78,48 97,58 78,66 90,83 71,78 72,99 56,84 46,99 41,82 24,93 30,75 10,77 22,61 4,50 21,41 7,26 27,30 25,10 42,23" fill="var(--sticker-color, #38bdf8)"/></svg>`
  },
  {
    id: 'shp_sunburst_yellow',
    name: 'Sunburst',
    category: 'Shapes',
    tags: ['shape', 'sun', 'yellow', 'burst', 'shine'],
    color: '#eab308',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="22" fill="var(--sticker-color, #eab308)"/><path d="M50 5 V20 M50 80 V95 M5 50 H20 M80 50 H95 M18 18 L29 29 M71 71 L82 82 M18 82 L29 71 M71 29 L82 18" stroke="var(--sticker-color, #eab308)" stroke-width="8" stroke-linecap="round"/></svg>`
  },
  {
    id: 'shp_speech_bubble',
    name: 'Callout Bubble',
    category: 'Shapes',
    tags: ['shape', 'speech', 'bubble', 'callout', 'purple', 'chat', 'comment'],
    color: '#a855f7',
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 20 H85 C90 20 95 25 95 30 V60 C95 65 90 70 85 70 H40 L25 85 V70 H15 C10 70 5 65 5 60 V30 C5 25 10 20 15 20 Z" fill="var(--sticker-color, #a855f7)"/></svg>`
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. BADGES
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'bdg_subscribe_red',
    name: 'Subscribe Red',
    category: 'Badges',
    tags: ['badge', 'subscribe', 'red', 'youtube', 'button', 'bell'],
    text: '🔔 SUBSCRIBE',
    color: '#ffffff',
    textBgColor: '#ef4444',
    borderRadius: 20,
    padding: 10,
    isBadge: true
  },
  {
    id: 'bdg_subscribe_white',
    name: 'Subscribe White',
    category: 'Badges',
    tags: ['badge', 'subscribe', 'white', 'button'],
    text: 'SUBSCRIBE',
    color: '#ef4444',
    textBgColor: '#ffffff',
    borderRadius: 20,
    padding: 10,
    isBadge: true
  },
  {
    id: 'bdg_subscribe_dark',
    name: 'Subscribe Dark',
    category: 'Badges',
    tags: ['badge', 'subscribe', 'dark', 'black', 'button'],
    text: 'SUBSCRIBE',
    color: '#ffffff',
    textBgColor: '#18181b',
    borderRadius: 20,
    padding: 10,
    isBadge: true
  },
  {
    id: 'bdg_subscribe_neon',
    name: 'Subscribe Neon',
    category: 'Badges',
    tags: ['badge', 'subscribe', 'neon', 'pink', 'lightning', 'button'],
    text: '⚡ SUBSCRIBE',
    color: '#ffffff',
    textBgColor: '#ec4899',
    borderRadius: 20,
    padding: 10,
    isBadge: true
  },
  {
    id: 'bdg_like_button',
    name: 'Like Button',
    category: 'Badges',
    tags: ['badge', 'like', 'thumbsup', 'blue', 'button'],
    text: '👍 LIKE',
    color: '#ffffff',
    textBgColor: '#2563eb',
    borderRadius: 20,
    padding: 10,
    isBadge: true
  },
  {
    id: 'bdg_bell_notify',
    name: 'Bell Notification',
    category: 'Badges',
    tags: ['badge', 'bell', 'notify', 'notification', 'yellow', 'button'],
    text: '🔔 NOTIFY',
    color: '#000000',
    textBgColor: '#eab308',
    borderRadius: 20,
    padding: 10,
    isBadge: true
  },
  {
    id: 'bdg_comment_badge',
    name: 'Comment Badge',
    category: 'Badges',
    tags: ['badge', 'comment', 'chat', 'purple', 'button'],
    text: '💬 COMMENT',
    color: '#ffffff',
    textBgColor: '#6366f1',
    borderRadius: 20,
    padding: 10,
    isBadge: true
  },
  {
    id: 'bdg_keep_watching',
    name: 'Keep Watching',
    category: 'Badges',
    tags: ['badge', 'keep', 'watching', 'eyes', 'orange', 'video'],
    text: '👀 KEEP WATCHING',
    color: '#ffffff',
    textBgColor: '#ea580c',
    borderRadius: 20,
    padding: 10,
    isBadge: true
  },
  {
    id: 'bdg_wait_for_it',
    name: 'Wait For It',
    category: 'Badges',
    tags: ['badge', 'wait', 'for', 'it', 'hourglass', 'red', 'suspense'],
    text: '⏳ WAIT FOR IT...',
    color: '#ffffff',
    textBgColor: '#dc2626',
    borderRadius: 20,
    padding: 10,
    isBadge: true
  },
  {
    id: 'bdg_watch_until_end',
    name: 'Watch Until End',
    category: 'Badges',
    tags: ['badge', 'watch', 'until', 'end', 'clapper', 'purple', 'viral'],
    text: '🎬 WATCH UNTIL END',
    color: '#ffffff',
    textBgColor: '#9333ea',
    borderRadius: 20,
    padding: 10,
    isBadge: true
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. ICONS / LOGOS (Including Authentic 4-Color Google Logo)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'ico_google',
    name: 'Google',
    category: 'Icons',
    tags: ['social', 'google', 'search', 'g', 'logo', 'icon'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M90 51 C90 47 89.6 43.6 88.9 40.5 H50 V58.5 H72.5 C71.5 63.8 68.4 68.3 63.7 71.4 V82 H77.9 C86.2 74.4 90 63 90 51 Z" fill="#4285F4"/><path d="M50 91.5 C63.8 91.5 75.4 86.9 83.9 79.1 L69.7 68.5 C65.8 71.1 60.7 72.8 50 72.8 C36.6 72.8 25.2 63.8 21.1 51.6 H6.4 V63 C14.9 79.9 31.4 91.5 50 91.5 Z" fill="#34A853"/><path d="M21.1 51.6 C20.1 48.5 19.5 45.1 19.5 41.5 C19.5 37.9 20.1 34.5 21.1 31.4 V20 H6.4 C2.9 27 1 34.9 1 41.5 C1 48.1 2.9 56 6.4 63 L21.1 51.6 Z" fill="#FBBC05"/><path d="M50 10.2 C61.3 10.2 71.4 14.1 79.4 21.7 L90.4 10.7 C83.7 4.5 75 0.7 50 0.7 C31.4 0.7 14.9 12.3 6.4 29.2 L21.1 40.6 C25.2 28.4 36.6 19.4 50 19.4 V10.2 Z" fill="#EA4335"/></svg>`
  },
  {
    id: 'ico_youtube',
    name: 'YouTube',
    category: 'Icons',
    tags: ['social', 'youtube', 'video', 'play', 'red', 'logo', 'icon'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="80" height="60" rx="16" fill="#ff0000"/><polygon points="42,35 68,50 42,65" fill="#ffffff"/></svg>`
  },
  {
    id: 'ico_tiktok',
    name: 'TikTok',
    category: 'Icons',
    tags: ['social', 'tiktok', 'music', 'note', 'black', 'logo', 'icon'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80" rx="20" fill="#010101"/><path d="M50 25 V62 C50 70 43 76 35 76 C27 76 20 70 20 62 C20 54 27 48 35 48 V58 C32 58 29 60 29 63 C29 66 32 68 35 68 C39 68 41 65 41 61 V25 H50 C50 32 56 38 63 38 V47 C57 47 51 43 50 38 V25 Z" fill="#25f4ee"/><path d="M53 25 V59 C53 67 46 73 38 73 C30 73 23 67 23 59 V57 C25 61 29 64 35 64 C43 64 50 58 50 50 V25 H53 Z" fill="#fe2c55"/></svg>`
  },
  {
    id: 'ico_instagram',
    name: 'Instagram',
    category: 'Icons',
    tags: ['social', 'instagram', 'photo', 'camera', 'gradient', 'logo', 'icon'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="ig_grad" cx="30%" cy="100%" r="120%"><stop offset="0%" stop-color="#fdf497"/><stop offset="15%" stop-color="#fdf497"/><stop offset="45%" stop-color="#fd5949"/><stop offset="60%" stop-color="#d6249f"/><stop offset="90%" stop-color="#285aeb"/></radialGradient></defs><rect x="10" y="10" width="80" height="80" rx="22" fill="url(#ig_grad)"/><rect x="25" y="25" width="50" height="50" rx="14" stroke="#ffffff" stroke-width="6" fill="none"/><circle cx="50" cy="50" r="13" stroke="#ffffff" stroke-width="6" fill="none"/><circle cx="63" cy="37" r="4" fill="#ffffff"/></svg>`
  },
  {
    id: 'ico_facebook',
    name: 'Facebook',
    category: 'Icons',
    tags: ['social', 'facebook', 'fb', 'blue', 'logo', 'icon'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80" rx="20" fill="#1877f2"/><path d="M62 52 L64 39 H51 V31 C51 27 53 24 59 24 H65 V13 C65 13 60 12 55 12 C43 12 36 19 36 30 V39 H25 V52 H36 V88 H51 V52 H62 Z" fill="#ffffff"/></svg>`
  },
  {
    id: 'ico_x_twitter',
    name: 'X (Twitter)',
    category: 'Icons',
    tags: ['social', 'x', 'twitter', 'tweet', 'black', 'logo', 'icon'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80" rx="20" fill="#000000"/><path d="M28 25 L45 49 L27 75 H32 L47 52 L59 75 H73 L54 48 L71 25 H66 L52 45 L41 25 H28 Z M34 29 H40 L66 71 H60 L34 29 Z" fill="#ffffff"/></svg>`
  },
  {
    id: 'ico_linkedin',
    name: 'LinkedIn',
    category: 'Icons',
    tags: ['social', 'linkedin', 'work', 'job', 'blue', 'logo', 'icon'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80" rx="20" fill="#0a66c2"/><rect x="25" y="40" width="12" height="35" fill="#ffffff"/><circle cx="31" cy="28" r="7" fill="#ffffff"/><path d="M48 40 H59 V45 C61 41 67 39 72 39 C83 39 86 46 86 57 V75 H74 V59 C74 53 72 49 67 49 C62 49 60 53 60 58 V75 H48 V40 Z" fill="#ffffff"/></svg>`
  },
  {
    id: 'ico_snapchat',
    name: 'Snapchat',
    category: 'Icons',
    tags: ['social', 'snapchat', 'ghost', 'yellow', 'logo', 'icon'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80" rx="20" fill="#fffc00"/><path d="M50 22 C37 22 28 30 28 43 C28 46 29 50 27 52 C24 53 20 53 19 55 C18 57 21 59 25 60 C26 63 24 67 20 69 C18 70 19 72 23 72 C30 72 33 68 37 68 C41 68 43 70 50 70 C57 70 59 68 63 68 C67 68 70 72 77 72 C81 72 82 70 80 69 C76 67 74 63 75 60 C79 59 82 57 81 55 C80 53 76 53 73 52 C71 50 72 46 72 43 C72 30 63 22 50 22 Z" stroke="#000000" stroke-width="4" fill="#ffffff"/></svg>`
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. VISUALIZERS ANIMATION
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'vis_purple_wave',
    name: 'Purple Wave Visualizer',
    category: 'Visualizers',
    tags: ['visualizer', 'audio', 'wave', 'purple', 'spectrum', 'music', 'sound', 'animation'],
    svgContent: `<svg viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg"><style>@keyframes wave_pulse { 0%,100% { transform: scaleY(0.3); } 50% { transform: scaleY(1.0); } } .w-bar { transform-origin: 50% 50%; animation: wave_pulse 1.2s ease-in-out infinite; }</style><rect class="w-bar" style="animation-delay: 0.1s" x="15" y="25" width="6" height="50" rx="3" fill="var(--sticker-color, #c084fc)"/><rect class="w-bar" style="animation-delay: 0.3s" x="30" y="15" width="6" height="70" rx="3" fill="var(--sticker-color, #a855f7)"/><rect class="w-bar" style="animation-delay: 0.5s" x="45" y="30" width="6" height="40" rx="3" fill="var(--sticker-color, #c084fc)"/><rect class="w-bar" style="animation-delay: 0.2s" x="60" y="10" width="6" height="80" rx="3" fill="var(--sticker-color, #9333ea)"/><rect class="w-bar" style="animation-delay: 0.6s" x="75" y="20" width="6" height="60" rx="3" fill="var(--sticker-color, #a855f7)"/><rect class="w-bar" style="animation-delay: 0.4s" x="90" y="35" width="6" height="30" rx="3" fill="var(--sticker-color, #c084fc)"/><rect class="w-bar" style="animation-delay: 0.7s" x="105" y="15" width="6" height="70" rx="3" fill="var(--sticker-color, #9333ea)"/><rect class="w-bar" style="animation-delay: 0.1s" x="120" y="25" width="6" height="50" rx="3" fill="var(--sticker-color, #a855f7)"/><rect class="w-bar" style="animation-delay: 0.5s" x="135" y="10" width="6" height="80" rx="3" fill="var(--sticker-color, #c084fc)"/><rect class="w-bar" style="animation-delay: 0.3s" x="150" y="20" width="6" height="60" rx="3" fill="var(--sticker-color, #9333ea)"/><rect class="w-bar" style="animation-delay: 0.8s" x="165" y="30" width="6" height="40" rx="3" fill="var(--sticker-color, #a855f7)"/><rect class="w-bar" style="animation-delay: 0.2s" x="180" y="25" width="6" height="50" rx="3" fill="var(--sticker-color, #c084fc)"/></svg>`
  },
  {
    id: 'vis_red_equalizer',
    name: 'Red Equalizer Visualizer',
    category: 'Visualizers',
    tags: ['visualizer', 'audio', 'equalizer', 'red', 'bars', 'music', 'sound', 'animation'],
    svgContent: `<svg viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg"><style>@keyframes eq_bounce { 0%,100% { height: 15px; y: 75px; } 50% { height: 75px; y: 15px; } } .eq-bar { animation: eq_bounce 1.0s ease-in-out infinite; }</style><rect class="eq-bar" style="animation-delay: 0.0s" x="12" y="30" width="8" height="60" rx="2" fill="var(--sticker-color, #ef4444)"/><rect class="eq-bar" style="animation-delay: 0.3s" x="30" y="20" width="8" height="70" rx="2" fill="var(--sticker-color, #ef4444)"/><rect class="eq-bar" style="animation-delay: 0.1s" x="48" y="45" width="8" height="45" rx="2" fill="var(--sticker-color, #ef4444)"/><rect class="eq-bar" style="animation-delay: 0.5s" x="66" y="15" width="8" height="75" rx="2" fill="var(--sticker-color, #ef4444)"/><rect class="eq-bar" style="animation-delay: 0.2s" x="84" y="35" width="8" height="55" rx="2" fill="var(--sticker-color, #ef4444)"/><rect class="eq-bar" style="animation-delay: 0.6s" x="102" y="25" width="8" height="65" rx="2" fill="var(--sticker-color, #ef4444)"/><rect class="eq-bar" style="animation-delay: 0.4s" x="120" y="50" width="8" height="40" rx="2" fill="var(--sticker-color, #ef4444)"/><rect class="eq-bar" style="animation-delay: 0.7s" x="138" y="15" width="8" height="75" rx="2" fill="var(--sticker-color, #ef4444)"/><rect class="eq-bar" style="animation-delay: 0.2s" x="156" y="35" width="8" height="55" rx="2" fill="var(--sticker-color, #ef4444)"/><rect class="eq-bar" style="animation-delay: 0.5s" x="174" y="25" width="8" height="65" rx="2" fill="var(--sticker-color, #ef4444)"/></svg>`
  },
  {
    id: 'vis_neon_spectrum',
    name: 'Neon Spectrum Visualizer',
    category: 'Visualizers',
    tags: ['visualizer', 'audio', 'spectrum', 'cyan', 'blue', 'neon', 'bars', 'animation'],
    svgContent: `<svg viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg"><style>@keyframes spec_pulse { 0%,100% { transform: scaleY(0.2); } 50% { transform: scaleY(1.0); } } .spec-bar { transform-origin: 50% 100%; animation: spec_pulse 0.9s cubic-bezier(0.4,0,0.2,1) infinite; }</style><rect class="spec-bar" style="animation-delay: 0.1s" x="10" y="10" width="7" height="80" rx="3.5" fill="var(--sticker-color, #38bdf8)"/><rect class="spec-bar" style="animation-delay: 0.4s" x="26" y="10" width="7" height="80" rx="3.5" fill="var(--sticker-color, #38bdf8)"/><rect class="spec-bar" style="animation-delay: 0.2s" x="42" y="10" width="7" height="80" rx="3.5" fill="var(--sticker-color, #38bdf8)"/><rect class="spec-bar" style="animation-delay: 0.6s" x="58" y="10" width="7" height="80" rx="3.5" fill="var(--sticker-color, #38bdf8)"/><rect class="spec-bar" style="animation-delay: 0.3s" x="74" y="10" width="7" height="80" rx="3.5" fill="var(--sticker-color, #38bdf8)"/><rect class="spec-bar" style="animation-delay: 0.7s" x="90" y="10" width="7" height="80" rx="3.5" fill="var(--sticker-color, #38bdf8)"/><rect class="spec-bar" style="animation-delay: 0.5s" x="106" y="10" width="7" height="80" rx="3.5" fill="var(--sticker-color, #38bdf8)"/><rect class="spec-bar" style="animation-delay: 0.2s" x="122" y="10" width="7" height="80" rx="3.5" fill="var(--sticker-color, #38bdf8)"/><rect class="spec-bar" style="animation-delay: 0.8s" x="138" y="10" width="7" height="80" rx="3.5" fill="var(--sticker-color, #38bdf8)"/><rect class="spec-bar" style="animation-delay: 0.4s" x="154" y="10" width="7" height="80" rx="3.5" fill="var(--sticker-color, #38bdf8)"/><rect class="spec-bar" style="animation-delay: 0.1s" x="170" y="10" width="7" height="80" rx="3.5" fill="var(--sticker-color, #38bdf8)"/><rect class="spec-bar" style="animation-delay: 0.6s" x="186" y="10" width="7" height="80" rx="3.5" fill="var(--sticker-color, #38bdf8)"/></svg>`
  },
  {
    id: 'vis_circular_pulse',
    name: 'Circular Pulse Visualizer',
    category: 'Visualizers',
    tags: ['visualizer', 'audio', 'circular', 'pulse', 'ring', 'cyan', 'animation'],
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><style>@keyframes circle_pulse { 0% { r: 10px; opacity: 0.9; } 100% { r: 44px; opacity: 0.0; } } .c-pulse { animation: circle_pulse 1.8s ease-out infinite; transform-origin: 50px 50px; }</style><circle cx="50" cy="50" r="12" fill="var(--sticker-color, #38bdf8)"/><circle class="c-pulse" style="animation-delay: 0.0s" cx="50" cy="50" r="20" stroke="var(--sticker-color, #38bdf8)" stroke-width="3"/><circle class="c-pulse" style="animation-delay: 0.6s" cx="50" cy="50" r="20" stroke="var(--sticker-color, #38bdf8)" stroke-width="3"/><circle class="c-pulse" style="animation-delay: 1.2s" cx="50" cy="50" r="20" stroke="var(--sticker-color, #38bdf8)" stroke-width="3"/></svg>`
  }
];

