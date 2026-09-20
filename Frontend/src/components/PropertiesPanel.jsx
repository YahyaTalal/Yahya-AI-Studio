import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';

// Color conversions between HEX and HSV
const hexToHsv = (hex) => {
  if (!hex || !hex.startsWith('#') || hex.length < 7) {
    return { h: 0, s: 0, v: 100 };
  }
  let r = parseInt(hex.substring(1, 3), 16) / 255;
  let g = parseInt(hex.substring(3, 5), 16) / 255;
  let b = parseInt(hex.substring(5, 7), 16) / 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;

  let d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
};

const hsvToHex = (h, s, v) => {
  s /= 100;
  v /= 100;
  let h_norm = h / 360;
  let i = Math.floor((h / 60) % 6);
  let f = (h / 60) - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);

  let r = 0, g = 0, b = 0;
  switch (i) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
    default: break;
  }

  const toHex = (x) => {
    let hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const SaturationValuePicker = ({ hue, sat, val, onChange }) => {
  const containerRef = React.useRef(null);

  const handleMouseDown = (e) => {
    const handleMouseMove = (moveEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let x = (moveEvent.clientX - rect.left) / rect.width;
      let y = (moveEvent.clientY - rect.top) / rect.height;

      x = Math.max(0, Math.min(1, x));
      y = Math.max(0, Math.min(1, y));

      const newSat = Math.round(x * 100);
      const newVal = Math.round((1 - y) * 100);
      onChange(newSat, newVal);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    handleMouseMove(e);
  };

  const cursorX = sat;
  const cursorY = 100 - val;

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'relative',
        width: '100%',
        height: '110px',
        borderRadius: '6px',
        backgroundColor: `hsl(${hue}, 100%, 50%)`,
        cursor: 'crosshair',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '8px'
      }}
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to right, #fff, transparent)'
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, #000, transparent)'
      }} />
      <div style={{
        position: 'absolute',
        left: `${cursorX}%`,
        top: `${cursorY}%`,
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        border: '2px solid #ffffff',
        backgroundColor: 'transparent',
        boxShadow: '0 0 3px rgba(0,0,0,0.5)',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none'
      }} />
    </div>
  );
};

// Custom Color Picker popover component
const ColorPicker = ({ label, value, onChange }) => {
  const [show, setShow] = useState(false);
  const swatches = [
    '#ffffff', '#000000', '#888888', '#ff3b30', '#ff9500', '#ffcc00', 
    '#4cd964', '#5ac8fa', '#007aff', '#5856d6', '#ffd21f', '#d946ef', '#ec4899', '#10b981'
  ];

  const hex = value && value.startsWith('#') && value.length === 7 ? value : '#ffffff';
  const { h, s, v } = hexToHsv(hex);
  const [localHue, setLocalHue] = useState(h);

  useEffect(() => {
    setLocalHue(h);
  }, [h]);

  const handleSVPickerChange = (newSat, newVal) => {
    const newHex = hsvToHex(localHue, newSat, newVal);
    onChange(newHex);
  };

  const handleHueChange = (newHue) => {
    setLocalHue(newHue);
    const newHex = hsvToHex(newHue, s, v);
    onChange(newHex);
  };

  const isTransparent = value === 'transparent';

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <label className="prop-label" style={{ fontSize: '11px' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-deep)', border: '1px solid var(--bg-border)', borderRadius: '6px', padding: '6px 8px' }}>
        <div 
          onClick={() => setShow(!show)}
          style={{ 
            width: '18px', 
            height: '18px', 
            borderRadius: '4px', 
            background: isTransparent ? '#1f2233' : hex, 
            border: '1px solid rgba(255,255,255,0.1)', 
            cursor: 'pointer',
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden'
          }} 
        >
          {isTransparent && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '0',
              width: '100%',
              height: '1.5px',
              backgroundColor: '#ff3b30',
              transform: 'rotate(45deg) translateY(-50%)',
              transformOrigin: 'center'
            }} />
          )}
        </div>
        <input 
          type="text" 
          value={value || '#ffffff'} 
          onChange={(e) => onChange(e.target.value)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#fff', 
            fontSize: '11.5px', 
            width: '100%', 
            outline: 'none',
            fontFamily: 'monospace'
          }} 
        />
      </div>

      {show && (
        <>
          <div 
            onClick={() => setShow(false)} 
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999 }} 
          />
          <div style={{ 
            position: 'absolute', 
            bottom: '105%', 
            left: 0, 
            backgroundColor: '#161925', 
            border: '1px solid var(--bg-border)', 
            borderRadius: '8px', 
            padding: '12px', 
            zIndex: 1000, 
            width: '210px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
          }}>
            <button 
              onClick={() => { onChange('transparent'); setShow(false); }}
              style={{
                width: '100%',
                padding: '6px 10px',
                marginBottom: '10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--text-main)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 59, 48, 0.15)'; e.currentTarget.style.borderColor = 'rgba(255, 59, 48, 0.4)'; e.currentTarget.style.color = '#ff453a'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'var(--text-main)'; }}
            >
              <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="12" width="12">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
              </svg>
              None / Transparent
            </button>

            <SaturationValuePicker 
              hue={localHue} 
              sat={s} 
              val={v} 
              onChange={handleSVPickerChange} 
            />

            <div style={{ marginBottom: '10px' }}>
              <input 
                type="range" 
                min="0" 
                max="360" 
                value={localHue} 
                onChange={(e) => handleHueChange(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '10px',
                  borderRadius: '5px',
                  outline: 'none',
                  cursor: 'pointer',
                  WebkitAppearance: 'none',
                  background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
              {swatches.map(color => (
                <button 
                  key={color} 
                  onClick={() => { onChange(color); setShow(false); }}
                  style={{ 
                    width: '22px', 
                    height: '22px', 
                    borderRadius: '4px', 
                    backgroundColor: color, 
                    border: hex === color ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)', 
                    cursor: 'pointer',
                    padding: 0
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: '4px', fontSize: '10px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '8px', textTransform: 'uppercase' }}>HEX</span>
                <input 
                  type="text" 
                  value={value || '#ffffff'} 
                  onChange={(e) => onChange(e.target.value)} 
                  style={{ width: '100%', backgroundColor: 'var(--bg-deep)', border: '1px solid var(--bg-border)', color: '#fff', padding: '4px', borderRadius: '4px', fontSize: '10px', textAlign: 'center', boxSizing: 'border-box' }} 
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
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

const CustomSelect = ({ label, value, options, onChange, renderOption }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);

  const openMenu = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
    setIsOpen(true);
  };

  // Re-position if window resizes while open
  useLayoutEffect(() => {
    if (!isOpen) return;
    const rePosition = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setMenuPos({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width
        });
      }
    };
    window.addEventListener('resize', rePosition);
    return () => window.removeEventListener('resize', rePosition);
  }, [isOpen]);

  return (
    <div className="custom-select-container" style={{ position: 'relative', width: '100%', marginBottom: '10px' }}>
      {label && <label className="prop-label" style={{ fontSize: '10px', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.45)' }}>{label}</label>}
      <div 
        ref={triggerRef}
        className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={openMenu}
        style={{
          width: '100%',
          padding: '8px 10px',
          backgroundColor: 'var(--bg-deep)',
          border: '1px solid var(--bg-border)',
          borderRadius: '6px',
          color: 'var(--text-main)',
          fontSize: '12px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}
      >
        <span>
          {renderOption ? renderOption(value) : (options.find(o => o.value === value)?.label || value)}
        </span>
        <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="11" width="11" className="custom-select-chevron" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-secondary)' }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {isOpen && ReactDOM.createPortal(
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setIsOpen(false)} 
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9998 }} 
          />
          {/* Dropdown — rendered in body via portal, position:fixed = immune to overflow:hidden ancestors */}
          <div className="custom-select-options" style={{ 
            position: 'fixed',
            top: `${menuPos.top}px`,
            left: `${menuPos.left}px`,
            width: `${menuPos.width}px`,
            zIndex: 9999,
            maxHeight: '220px',
            overflowY: 'auto',
          }}>
            {options.map(opt => {
              const isActive = opt.value === value;
              return (
                <div 
                  key={opt.value}
                  className={`custom-select-option ${isActive ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: isActive ? 'var(--primary)' : 'var(--text-main)',
                    backgroundColor: isActive ? 'rgba(255, 210, 31, 0.08)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {opt.labelNode ? opt.labelNode : opt.label}
                  {isActive && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="custom-select-checkmark" style={{ width: '10px', height: '10px' }}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </>,
        document.body
      )}
    </div>
  );
};


const SliderWithInput = ({ label, min, max, step = 1, value, onChange, suffix = '', hasToggle = false, toggleValue = true, onToggle }) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setInputValue(val);
    onChange(val);
  };

  const handleInputChange = (e) => {
    const rawVal = e.target.value;
    setInputValue(rawVal);
    const parsed = parseFloat(rawVal);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
  };

  const handleInputBlur = () => {
    const parsed = parseFloat(inputValue);
    if (isNaN(parsed)) {
      setInputValue(value);
    } else {
      const clamped = Math.max(min, Math.min(max, parsed));
      setInputValue(clamped);
      onChange(clamped);
    }
  };

  const progress = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '8px', opacity: toggleValue ? 1 : 0.5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        {hasToggle && (
          <button
            onClick={() => onToggle(!toggleValue)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              color: toggleValue ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            title={toggleValue ? "Hide / Disable style parameter" : "Show / Enable style parameter"}
          >
            {toggleValue ? (
              <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="12" width="12">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            ) : (
              <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="12" width="12">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            )}
          </button>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="range"
          className="prop-slider"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={!toggleValue}
          onChange={handleSliderChange}
          style={{
            flex: 1,
            background: toggleValue 
              ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, rgba(255, 255, 255, 0.08) ${progress}%, rgba(255, 255, 255, 0.08) 100%)`
              : 'rgba(255,255,255,0.04)',
            cursor: toggleValue ? 'pointer' : 'not-allowed'
          }}
        />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            value={inputValue}
            disabled={!toggleValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            style={{
              width: '42px',
              padding: '3px 4px',
              fontSize: '11px',
              fontFamily: 'monospace',
              fontWeight: 600,
              color: toggleValue ? '#00a8ff' : 'rgba(255,255,255,0.25)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '5px',
              textAlign: 'center',
              outline: 'none',
              transition: 'all 0.15s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#00a8ff';
              e.target.style.backgroundColor = 'rgba(0, 168, 255, 0.05)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              handleInputBlur();
            }}
          />
          {suffix && (
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginLeft: '2px', fontFamily: 'monospace' }}>
              {suffix}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};


export default function PropertiesPanel({ selectedClip, onChange, onClose, onDelete, onDetachAudio, focusSection }) {
  const [activeTab, setActiveTab] = useState('Settings');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    position: true,
    animations: false,
    crop: false,
    adjust: false,
    transformText: true,
    layoutText: true,
  });

  // Handle focusSection changes (e.g. from toolbar Transition button)
  useEffect(() => {
    if (focusSection) {
      setActiveTab('Settings');
      setOpenSections(prev => ({ ...prev, [focusSection]: true }));
    }
  }, [focusSection]);

  // Reset tab to Settings when selection changes
  useEffect(() => {
    setActiveTab('Settings');
  }, [selectedClip?.id]);

  if (!selectedClip) return null;

  const { track } = selectedClip;

  // Content-based type detection (matches canvas renderer logic)
  const _ext = (selectedClip.path || '').split('.').pop().toLowerCase();
  const _isTextContent  = selectedClip.text !== undefined;
  const _isAudioContent = !_isTextContent && ['mp3', 'wav', 'm4a', 'ogg', 'aac'].includes(_ext);
  const _isImageContent = !_isTextContent && !_isAudioContent && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(_ext);
  const _isVideoContent = !_isTextContent && !_isAudioContent && !_isImageContent && !!selectedClip.path;
  
  // Track-name-based fallback for legacy clips (old track names like 'video1', 'audio1', 'text1')
  const _isVideoByTrack = track?.startsWith('video') || track === 'avatar';
  const _isAudioByTrack = track?.startsWith('audio') || track === 'voiceover' || track === 'music';
  const _isTextByTrack  = track?.startsWith('text')  || track === 'caption';
  const _isImageByTrack = track?.startsWith('image')  || track === 'sticker';
  
  // Final resolved types (content-based wins, track-name is fallback)
  const isText  = _isTextContent  || (_isTextByTrack  && !_isAudioContent && !_isVideoContent && !_isImageContent);
  const isAudio = _isAudioContent || (_isAudioByTrack && !_isTextContent);
  const isImage = _isImageContent || (_isImageByTrack && !_isTextContent && !_isAudioContent);
  const isVideo = _isVideoContent || (_isVideoByTrack && !_isTextContent && !_isAudioContent && !_isImageContent);

  // Element Type Detection
  const _cat = selectedClip.category || '';
  const _id = selectedClip.id || '';
  const isShape = _cat === 'Shapes' || _id.startsWith('shp_');
  const isBadge = _cat === 'Badges' || !!selectedClip.isBadge || _id.startsWith('bdg_');
  const isIcon = _cat === 'Social Icons' || _id.startsWith('ico_');
  const isVisualizer = _cat === 'Visualizers' || _id.startsWith('vis_');

  const updateField = (field, val) => {
    onChange({ ...selectedClip, [field]: val });
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCropRatioChange = (ratio) => {
    if (ratio === '16:9') {
      onChange({
        ...selectedClip,
        cropAspectRatio: ratio,
        cropEnabled: true,
        cropTop: 10, cropBottom: 10, cropLeft: 0, cropRight: 0
      });
    } else if (ratio === '9:16') {
      onChange({
        ...selectedClip,
        cropAspectRatio: ratio,
        cropEnabled: true,
        cropTop: 0, cropBottom: 0, cropLeft: 25, cropRight: 25
      });
    } else if (ratio === '1:1') {
      onChange({
        ...selectedClip,
        cropAspectRatio: ratio,
        cropEnabled: true,
        cropTop: 0, cropBottom: 0, cropLeft: 22, cropRight: 22
      });
    } else {
      updateField('cropAspectRatio', ratio);
    }
  };

  // Helper to convert internal path for preview display
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

  return (
    <div className="properties-panel-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* Properties Header */}
      <div className="panel-header" style={{ padding: '14px 20px', borderBottom: '1px solid var(--bg-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', padding: '3px 6px', backgroundColor: 'var(--primary)', color: '#000', borderRadius: '4px', fontWeight: 800 }}>
            {isShape ? 'Shape' : isBadge ? 'Sticker' : isIcon ? 'Icon' : isVisualizer ? 'Sound Wave' : (isVideo ? 'Video' : isAudio ? 'Audio' : isText ? 'Text' : isImage ? 'Image' : (track?.toUpperCase() || 'CLIP'))}
          </span>
          <h3 className="panel-title" style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
            {isShape ? 'Edit Shape' : isBadge ? 'Edit Sticker' : isIcon ? 'Edit Icon' : isVisualizer ? 'Edit Sound Wave' : 'Properties'}
          </h3>
        </div>
        <button 
          onClick={onClose} 
          title="Close Settings"
          className="panel-close-btn"
        >
          <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="14" width="14" xmlns="http://www.w3.org/2000/svg">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Clip Thumbnail Preview Box */}
      <div className="properties-clip-preview" style={{ padding: '8px 16px', borderBottom: '1px solid var(--bg-border)', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', height: '55px', backgroundColor: '#000', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--bg-border)', position: 'relative' }}>
          {isVideo ? (
            <video src={toUrlPath(selectedClip.path)} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : isImage ? (
            <img src={toUrlPath(selectedClip.path)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : isAudio ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="20" width="20"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedClip.filename || 'Audio Clip'}</span>
            </div>
          ) : (
            <div className="properties-text-preview" style={{ color: selectedClip.color || '#fff', fontSize: '11px', fontWeight: getFontWeightCSS(selectedClip.fontWeight), fontFamily: selectedClip.fontFamily || 'Inter', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '90%', padding: '4px', textAlign: 'center' }}>
              {selectedClip.text || selectedClip.filename || 'Text Clip'}
            </div>
          )}
          <div style={{ position: 'absolute', bottom: '4px', right: '6px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '1px 4px', borderRadius: '3px', fontSize: '9px', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
            {(selectedClip.duration ?? 0).toFixed(1)}s
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      {!isAudio && (
        <div className="properties-tabs" style={{ display: 'flex', gap: '4px', padding: '6px 12px', borderBottom: '1px solid var(--bg-border)', backgroundColor: 'rgba(9, 11, 18, 0.2)' }}>
          <button 
            className={`prop-tab-btn ${activeTab === 'Settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('Settings')}
            style={{
              flex: 1,
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid ' + (activeTab === 'Settings' ? 'rgba(0, 132, 255, 0.4)' : 'rgba(255,255,255,0.05)'),
              backgroundColor: activeTab === 'Settings' ? 'rgba(0, 132, 255, 0.15)' : 'rgba(15, 17, 30, 0.4)',
              color: activeTab === 'Settings' ? '#fff' : 'var(--text-secondary)',
              fontSize: '10px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="11" width="11">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Settings
          </button>
          {(isVideo || isText || isImage) && (
            <button 
              className={`prop-tab-btn ${activeTab === 'Style' ? 'active' : ''}`}
              onClick={() => setActiveTab('Style')}
              style={{
                flex: 1,
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid ' + (activeTab === 'Style' ? 'rgba(0, 132, 255, 0.4)' : 'rgba(255,255,255,0.05)'),
                backgroundColor: activeTab === 'Style' ? 'rgba(0, 132, 255, 0.15)' : 'rgba(15, 17, 30, 0.4)',
                color: activeTab === 'Style' ? '#fff' : 'var(--text-secondary)',
                fontSize: '10px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="11" width="11">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.03462 19.176 5.1325 19.418 5.1325 19.67V20C5.1325 21.1046 6.02792 22 7.1325 22H12Z"></path>
                <circle cx="7.5" cy="10.5" r="1" fill="currentColor"></circle>
                <circle cx="11.5" cy="7.5" r="1" fill="currentColor"></circle>
                <circle cx="16.5" cy="9.5" r="1" fill="currentColor"></circle>
                <circle cx="15.5" cy="14.5" r="1" fill="currentColor"></circle>
              </svg>
              Style
            </button>
          )}
          {isVideo && (
            <button 
              className={`prop-tab-btn ${activeTab === 'AI' ? 'active' : ''}`}
              onClick={() => setActiveTab('AI')}
              style={{
                flex: 1,
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid ' + (activeTab === 'AI' ? 'rgba(0, 132, 255, 0.4)' : 'rgba(255,255,255,0.05)'),
                backgroundColor: activeTab === 'AI' ? 'rgba(0, 132, 255, 0.15)' : 'rgba(15, 17, 30, 0.4)',
                color: activeTab === 'AI' ? '#fff' : 'var(--text-secondary)',
                fontSize: '10px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="11" width="11">
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
              </svg>
              AI
            </button>
          )}
        </div>
      )}

      {/* Content Area */}
      <div className="properties-content" style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
        
        {/* ===================== TAB 1: SETTINGS ===================== */}
        {activeTab === 'Settings' && (
          <div>
            {isVideo && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* 1. Animations Section */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div 
                    onClick={() => toggleSection('animations')}
                    style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.01)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="13" width="13" style={{ color: 'var(--text-secondary)' }}>
                        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                        <polyline points="2 17 12 22 22 17"></polyline>
                        <polyline points="2 12 12 17 22 12"></polyline>
                      </svg>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>Animations</span>
                    </div>
                    <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="11" width="11" style={{ transform: openSections.animations ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-secondary)' }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>

                  {openSections.animations && (
                    <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="prop-group" style={{ marginBottom: 0 }}>
                        <CustomSelect 
                          label="Enter Animation"
                          value={selectedClip.enterAnimation ?? 'none'}
                          onChange={(val) => updateField('enterAnimation', val)}
                          options={[
                            { value: 'none', label: 'None (Instant Cut)' },
                            { value: 'fade', label: 'Fade In' },
                            { value: 'slide', label: 'Slide In' },
                            { value: 'zoom', label: 'Zoom In' }
                          ]}
                        />
                      </div>

                      {selectedClip.enterAnimation && selectedClip.enterAnimation !== 'none' && (() => {
                        const maxVal = Math.min(selectedClip.duration ?? 5, 3.0);
                        const currVal = selectedClip.enterDuration ?? 0.8;
                        return (
                          <SliderWithInput 
                            label="Duration" min={0.1} max={maxVal} step={0.1}
                            value={currVal}
                            onChange={(val) => updateField('enterDuration', val)}
                          />
                        );
                      })()}

                      <div className="prop-group" style={{ marginBottom: 0 }}>
                        <CustomSelect 
                          label="Exit Animation"
                          value={selectedClip.exitAnimation ?? 'none'}
                          onChange={(val) => updateField('exitAnimation', val)}
                          options={[
                            { value: 'none', label: 'None (Instant Cut)' },
                            { value: 'fade', label: 'Fade Out' },
                            { value: 'slide', label: 'Slide Out' },
                            { value: 'zoom', label: 'Zoom Out' }
                          ]}
                        />
                      </div>

                      {selectedClip.exitAnimation && selectedClip.exitAnimation !== 'none' && (() => {
                        const maxVal = Math.min(selectedClip.duration ?? 5, 3.0);
                        const currVal = selectedClip.exitDuration ?? 0.8;
                        return (
                          <SliderWithInput 
                            label="Duration" min={0.1} max={maxVal} step={0.1}
                            value={currVal}
                            onChange={(val) => updateField('exitDuration', val)}
                          />
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* 2. Speed Option */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Speed</div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {[0.5, 1.0, 1.5, 2.0].map(sVal => {
                      const isCurrentSpeed = selectedClip.speed === sVal && !selectedClip.customSpeedActive;
                      return (
                        <button
                          key={sVal}
                          onClick={() => {
                            onChange({ ...selectedClip, speed: sVal, customSpeedActive: false });
                          }}
                          style={{
                            flex: 1,
                            padding: '6px 0',
                            fontSize: '11px',
                            fontWeight: 600,
                            borderRadius: '4px',
                            border: '1px solid ' + (isCurrentSpeed ? '#00a8ff' : 'rgba(255,255,255,0.08)'),
                            backgroundColor: isCurrentSpeed ? 'rgba(0, 168, 255, 0.12)' : 'rgba(255,255,255,0.02)',
                            color: isCurrentSpeed ? '#00a8ff' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          {sVal}x
                        </button>
                      );
                    })}
                    <button
                      onClick={() => {
                        onChange({ ...selectedClip, customSpeedActive: true });
                      }}
                      style={{
                        flex: 1.2,
                        padding: '6px 0',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid ' + (selectedClip.customSpeedActive ? '#00a8ff' : 'rgba(255,255,255,0.08)'),
                        backgroundColor: selectedClip.customSpeedActive ? 'rgba(0, 168, 255, 0.12)' : 'rgba(255,255,255,0.02)',
                        color: selectedClip.customSpeedActive ? '#00a8ff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      Custom
                    </button>
                  </div>
                  {selectedClip.customSpeedActive && (
                    <div style={{ marginTop: '10px' }}>
                      <SliderWithInput 
                        label="Speed Factor" min={0.1} max={5.0} step={0.05}
                        value={selectedClip.speed ?? 1.0}
                        onChange={(val) => updateField('speed', val)}
                      />
                    </div>
                  )}
                </div>

                {/* 3. Volume Option */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Volume</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => updateField('mute', !selectedClip.mute)}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '4px',
                        width: '26px',
                        height: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: selectedClip.mute ? '#ff3b30' : 'var(--text-secondary)'
                      }}
                    >
                      {selectedClip.mute || selectedClip.volume === 0 ? (
                        <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="13" width="13">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <line x1="23" y1="9" x2="17" y2="15"></line>
                          <line x1="17" y1="9" x2="23" y2="15"></line>
                        </svg>
                      ) : (
                        <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="13" width="13">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                      )}
                    </button>
                    <div style={{ flex: 1 }}>
                      <SliderWithInput 
                        label="" min={0} max={100} 
                        value={selectedClip.mute ? 0 : (selectedClip.volume ?? 100)}
                        onChange={(val) => {
                          if (selectedClip.mute) {
                            onChange({ ...selectedClip, volume: val, mute: false });
                          } else {
                            updateField('volume', val);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Fade Audio In/Out Option */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="13" width="13" style={{ color: 'var(--text-secondary)' }}>
                        <path d="M12 20v-8M17 20V4M7 20v-4M2 20v-2"></path>
                      </svg>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>Fade Audio In/Out</span>
                    </div>
                    <div 
                      className={`premium-switch ${selectedClip.fadeAudioEnabled ? 'active' : ''}`}
                      onClick={() => updateField('fadeAudioEnabled', !selectedClip.fadeAudioEnabled)}
                    >
                      <div className="premium-switch-thumb" />
                    </div>
                  </div>
                  {selectedClip.fadeAudioEnabled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                      <SliderWithInput 
                        label="Fade In" min={0} max={5.0} step={0.1}
                        value={selectedClip.fadeIn ?? 0}
                        onChange={(val) => updateField('fadeIn', val)}
                      />
                      <SliderWithInput 
                        label="Fade Out" min={0} max={5.0} step={0.1}
                        value={selectedClip.fadeOut ?? 0}
                        onChange={(val) => updateField('fadeOut', val)}
                      />
                    </div>
                  )}
                </div>

                {/* 6. Detach Audio Button */}
                <button
                  onClick={() => onDetachAudio && onDetachAudio(selectedClip)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--text-main)',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginTop: '8px',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="13" width="13">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  Detach Audio
                </button>

                {/* 7. Delete Video Button */}
                <button
                  onClick={() => onDelete && onDelete(selectedClip)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 59, 48, 0.08)',
                    border: '1px solid rgba(255, 59, 48, 0.15)',
                    color: '#ff453a',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginTop: '2px',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255, 59, 48, 0.15)'; e.currentTarget.style.borderColor = 'rgba(255, 59, 48, 0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255, 59, 48, 0.08)'; e.currentTarget.style.borderColor = 'rgba(255, 59, 48, 0.15)'; }}
                >
                  <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="13" width="13">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Delete Video
                </button>
              </div>
            )}

            {/* ── Audio Clip Settings ── */}
            {isAudio && (() => {
              const vol = selectedClip.mute ? 0 : (selectedClip.volume ?? 100);
              const volProgress = vol;
              const fiMax = Math.min(selectedClip.duration ?? 10, 10);
              const fiVal = selectedClip.fadeIn ?? 0;
              const fiProgress = fiMax > 0 ? (fiVal / fiMax) * 100 : 0;
              const foMax = fiMax;
              const foVal = selectedClip.fadeOut ?? 0;
              const foProgress = foMax > 0 ? (foVal / foMax) * 100 : 0;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                  {/* Volume Card */}
                  <div style={{ backgroundColor: '#0f1117', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Volume</span>
                      <button
                        onClick={() => updateField('mute', !selectedClip.mute)}
                        style={{
                          padding: '3px 10px',
                          fontSize: '10px',
                          fontWeight: 700,
                          borderRadius: '20px',
                          border: '1px solid ' + (selectedClip.mute ? 'rgba(255,59,48,0.5)' : 'rgba(255,255,255,0.12)'),
                          backgroundColor: selectedClip.mute ? 'rgba(255,59,48,0.15)' : 'rgba(255,255,255,0.04)',
                          color: selectedClip.mute ? '#ff5f55' : 'rgba(255,255,255,0.55)',
                          cursor: 'pointer',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          transition: 'all 0.2s'
                        }}
                      >
                        {selectedClip.mute ? '🔇 Muted' : 'Mute'}
                      </button>
                    </div>
                    <input
                      type="range" className="prop-slider" min="0" max="100"
                      value={vol}
                      disabled={selectedClip.mute}
                      onChange={(e) => updateField('volume', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        opacity: selectedClip.mute ? 0.35 : 1,
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volProgress}%, rgba(255,255,255,0.08) ${volProgress}%, rgba(255,255,255,0.08) 100%)`
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                      <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.45)' }}>{vol}%</span>
                    </div>
                  </div>

                  {/* Fade In Card */}
                  <div style={{ backgroundColor: '#0f1117', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Fade In</span>
                      <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>{fiVal.toFixed(1)}s / {fiMax.toFixed(1)}s</span>
                    </div>
                    <input
                      type="range" className="prop-slider" min="0" max={fiMax} step="0.1"
                      value={fiVal}
                      onChange={(e) => updateField('fadeIn', parseFloat(e.target.value))}
                      style={{
                        width: '100%',
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${fiProgress}%, rgba(255,255,255,0.08) ${fiProgress}%, rgba(255,255,255,0.08) 100%)`
                      }}
                    />
                  </div>

                  {/* Fade Out Card */}
                  <div style={{ backgroundColor: '#0f1117', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Fade Out</span>
                      <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>{foVal.toFixed(1)}s / {foMax.toFixed(1)}s</span>
                    </div>
                    <input
                      type="range" className="prop-slider" min="0" max={foMax} step="0.1"
                      value={foVal}
                      onChange={(e) => updateField('fadeOut', parseFloat(e.target.value))}
                      style={{
                        width: '100%',
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${foProgress}%, rgba(255,255,255,0.08) ${foProgress}%, rgba(255,255,255,0.08) 100%)`
                      }}
                    />
                  </div>

                </div>
              );
            })()}

            {/* Image settings in Tab 1 */}
            {isImage && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 1. Animations Section */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div 
                    onClick={() => toggleSection('animations')}
                    style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.01)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="13" width="13" style={{ color: 'var(--text-secondary)' }}>
                        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                        <polyline points="2 17 12 22 22 17"></polyline>
                        <polyline points="2 12 12 17 22 12"></polyline>
                      </svg>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>Animations</span>
                    </div>
                    <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="11" width="11" style={{ transform: openSections.animations ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-secondary)' }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>

                  {openSections.animations && (
                    <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="prop-group" style={{ marginBottom: 0 }}>
                        <CustomSelect 
                          label="Enter Animation"
                          value={selectedClip.enterAnimation ?? 'none'}
                          onChange={(val) => updateField('enterAnimation', val)}
                          options={[
                            { value: 'none', label: 'None (Instant Cut)' },
                            { value: 'fade', label: 'Fade In' },
                            { value: 'slide', label: 'Slide In' },
                            { value: 'zoom', label: 'Zoom In' }
                          ]}
                        />
                      </div>

                      {selectedClip.enterAnimation && selectedClip.enterAnimation !== 'none' && (() => {
                        const maxVal = Math.min(selectedClip.duration ?? 5, 3.0);
                        const currVal = selectedClip.enterDuration ?? 0.8;
                        const progress = maxVal > 0.1 ? ((currVal - 0.1) / (maxVal - 0.1)) * 100 : 0;
                        const labelName = selectedClip.enterAnimation === 'fade' ? 'Fade In' : (selectedClip.enterAnimation === 'slide' ? 'Slide In' : 'Zoom In');
                        return (
                          <div style={{ padding: '0 4px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                              <span>{labelName} Duration</span>
                              <span style={{ fontFamily: 'monospace' }}>{currVal.toFixed(1)}s / {maxVal.toFixed(1)}s</span>
                            </div>
                            <input 
                              type="range" className="prop-slider" min="0.1" max={maxVal} step="0.1"
                              value={currVal}
                              onChange={(e) => updateField('enterDuration', parseFloat(e.target.value))}
                              style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, rgba(255, 255, 255, 0.08) ${progress}%, rgba(255, 255, 255, 0.08) 100%)`
                              }}
                            />
                          </div>
                        );
                      })()}

                      <div className="prop-group" style={{ marginBottom: 0 }}>
                        <CustomSelect 
                          label="Exit Animation"
                          value={selectedClip.exitAnimation ?? 'none'}
                          onChange={(val) => updateField('exitAnimation', val)}
                          options={[
                            { value: 'none', label: 'None (Instant Cut)' },
                            { value: 'fade', label: 'Fade Out' },
                            { value: 'slide', label: 'Slide Out' },
                            { value: 'zoom', label: 'Zoom Out' }
                          ]}
                        />
                      </div>

                      {selectedClip.exitAnimation && selectedClip.exitAnimation !== 'none' && (() => {
                        const maxVal = Math.min(selectedClip.duration ?? 5, 3.0);
                        const currVal = selectedClip.exitDuration ?? 0.8;
                        const progress = maxVal > 0.1 ? ((currVal - 0.1) / (maxVal - 0.1)) * 100 : 0;
                        const labelName = selectedClip.exitAnimation === 'fade' ? 'Fade Out' : (selectedClip.exitAnimation === 'slide' ? 'Slide Out' : 'Zoom Out');
                        return (
                          <div style={{ padding: '0 4px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                              <span>{labelName} Duration</span>
                              <span style={{ fontFamily: 'monospace' }}>{currVal.toFixed(1)}s / {maxVal.toFixed(1)}s</span>
                            </div>
                            <input 
                              type="range" className="prop-slider" min="0.1" max={maxVal} step="0.1"
                              value={currVal}
                              onChange={(e) => updateField('exitDuration', parseFloat(e.target.value))}
                              style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, rgba(255, 255, 255, 0.08) ${progress}%, rgba(255, 255, 255, 0.08) 100%)`
                              }}
                            />
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* 2. Delete Image Button */}
                <button
                  onClick={() => onDelete && onDelete(selectedClip)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 59, 48, 0.04)',
                    border: '1px solid rgba(255, 59, 48, 0.1)',
                    color: '#ff3b30',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginTop: '8px',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255, 59, 48, 0.08)'; e.currentTarget.style.borderColor = 'rgba(255, 59, 48, 0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255, 59, 48, 0.04)'; e.currentTarget.style.borderColor = 'rgba(255, 59, 48, 0.1)'; }}
                >
                  <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="13" width="13">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Delete Image
                </button>
              </div>
            )}

            {/* ── 1. SHAPE ELEMENT PROPERTIES (Shapes - Setting & Style) ── */}
            {isShape && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff' }}>Shapes</div>
                  <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontWeight: 600 }}>Setting & Style</span>
                </div>

                {/* Animation Button */}
                <button
                  className="action-btn"
                  onClick={() => toggleSection('animations')}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '12px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  <span style={{ fontSize: '14px' }}>💫</span> Animation
                </button>

                {/* Rotation & Flip Controls */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f4f4f5', borderRadius: '6px', padding: '6px 10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#3f3f46' }}>📐 Rotation</span>
                    <input
                      type="number"
                      value={selectedClip.rotation || 0}
                      onChange={(e) => updateField('rotation', parseInt(e.target.value, 10) || 0)}
                      style={{ width: '42px', padding: '2px 4px', border: 'none', background: 'transparent', textAlign: 'right', fontSize: '11px', fontWeight: '700', fontFamily: 'monospace' }}
                    />
                    <span style={{ fontSize: '11px', fontWeight: '700' }}>°</span>
                  </div>
                  <button
                    onClick={() => updateField('flipH', !selectedClip.flipH)}
                    style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #e4e4e7', backgroundColor: selectedClip.flipH ? '#e0f2fe' : '#ffffff', cursor: 'pointer', fontSize: '12px' }}
                    title="Flip Horizontally"
                  >
                    ↔️
                  </button>
                  <button
                    onClick={() => updateField('flipV', !selectedClip.flipV)}
                    style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #e4e4e7', backgroundColor: selectedClip.flipV ? '#e0f2fe' : '#ffffff', cursor: 'pointer', fontSize: '12px' }}
                    title="Flip Vertically"
                  >
                    ↕️
                  </button>
                </div>

                {/* Color Section (Fill & Outline) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Colors</div>
                  
                  {/* Fill Color Wheel & Opacity Slider */}
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#000' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600' }}>Fill Color Wheel</span>
                      <input
                        type="color"
                        value={selectedClip.color || '#ef4444'}
                        onChange={(e) => updateField('color', e.target.value)}
                        style={{ border: 'none', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', background: 'transparent' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#71717a', width: '70px' }}>Opacity Slider</span>
                      <input
                        type="range" min="0" max="100"
                        value={Math.round((selectedClip.opacity ?? 100) > 1 ? selectedClip.opacity : (selectedClip.opacity ?? 1) * 100)}
                        onChange={(e) => updateField('opacity', parseFloat(e.target.value))}
                        style={{ flex: 1 }}
                      />
                      <span style={{ fontSize: '10px', fontWeight: '700', width: '30px', textAlign: 'right' }}>
                        {Math.round((selectedClip.opacity ?? 100) > 1 ? selectedClip.opacity : (selectedClip.opacity ?? 1) * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Outline Color Wheel & Opacity Slider */}
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#000' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600' }}>Outline Color Wheel</span>
                      <input
                        type="color"
                        value={selectedClip.outlineColor || '#F90000'}
                        onChange={(e) => updateField('outlineColor', e.target.value)}
                        style={{ border: 'none', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', background: 'transparent' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#71717a', width: '70px' }}>Opacity Slider</span>
                      <input
                        type="range" min="0" max="100"
                        value={selectedClip.outlineOpacity ?? 100}
                        onChange={(e) => updateField('outlineOpacity', parseFloat(e.target.value))}
                        style={{ flex: 1 }}
                      />
                      <span style={{ fontSize: '10px', fontWeight: '700', width: '30px', textAlign: 'right' }}>{selectedClip.outlineOpacity ?? 100}%</span>
                    </div>
                  </div>
                </div>

                {/* Size Slider */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#000' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600' }}>Size Slider</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', fontFamily: 'monospace' }}>{selectedClip.fontSize || 36}px</span>
                  </div>
                  <input
                    type="range" min="12" max="160"
                    value={selectedClip.fontSize || 36}
                    onChange={(e) => updateField('fontSize', parseInt(e.target.value, 10))}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Delete Element Option */}
                <button
                  onClick={() => onDelete && onDelete(selectedClip)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e4e4e7', color: '#dc2626', fontSize: '12px', fontWeight: 700, cursor: 'pointer', marginTop: '6px' }}
                >
                  Delete Element
                </button>
              </div>
            )}

            {/* ── 2. BADGE ELEMENT PROPERTIES (Badges - Setting & Style) ── */}
            {isBadge && !isShape && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff' }}>Badges</div>
                  <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontWeight: 600 }}>Setting & Style</span>
                </div>

                {/* Animation Button */}
                <button
                  className="action-btn"
                  onClick={() => toggleSection('animations')}
                  style={{ width: '100%', padding: '10px', fontSize: '12px', fontWeight: '600', borderRadius: '8px', backgroundColor: '#ffffff', color: '#000000', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                >
                  💫 Animation
                </button>

                {/* Color Wheels for Text & Background */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#a1a1aa' }}>Color</div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#000', fontWeight: '600' }}>Text Color</span>
                      <input
                        type="color"
                        value={selectedClip.color || '#ffffff'}
                        onChange={(e) => updateField('color', e.target.value)}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'transparent' }}
                        title="Text Color Wheel"
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#000', fontWeight: '600' }}>Background Color</span>
                      <input
                        type="color"
                        value={selectedClip.textBgColor || '#ef4444'}
                        onChange={(e) => updateField('textBgColor', e.target.value)}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'transparent' }}
                        title="Background Color Wheel"
                      />
                    </div>
                  </div>
                </div>

                {/* Rotation & Flip Controls */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f4f4f5', borderRadius: '6px', padding: '6px 10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#3f3f46' }}>📐 Rotation</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#000000', fontFamily: 'monospace' }}>{selectedClip.rotation || 0}°</span>
                  </div>
                  <button onClick={() => updateField('flipH', !selectedClip.flipH)} style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #e4e4e7', cursor: 'pointer' }} title="Flip Horizontally">↔️</button>
                  <button onClick={() => updateField('flipV', !selectedClip.flipV)} style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #e4e4e7', cursor: 'pointer' }} title="Flip Vertically">↕️</button>
                </div>

                {/* Delete Element Option */}
                <button onClick={() => onDelete && onDelete(selectedClip)} style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e4e4e7', color: '#dc2626', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                  Delete Element
                </button>
              </div>
            )}

            {/* ── 3. ICON ELEMENT PROPERTIES (Icons - Setting & Style) ── */}
            {isIcon && !isShape && !isBadge && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff' }}>Icons</div>
                  <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontWeight: 600 }}>Setting & Style</span>
                </div>

                {/* Animation Button */}
                <button className="action-btn" onClick={() => toggleSection('animations')} style={{ width: '100%', padding: '10px', fontSize: '12px', fontWeight: '600', borderRadius: '8px', backgroundColor: '#ffffff', color: '#000000', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                  💫 Animation
                </button>

                {/* Color Wheels for Text, Background, and Outline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#a1a1aa' }}>Colors</div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: '10px', justifyContent: 'space-around' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: '#000', fontWeight: '600' }}>Text</span>
                      <input type="color" value={selectedClip.color || '#ffffff'} onChange={(e) => updateField('color', e.target.value)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'transparent' }} title="Text Color Wheel" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: '#000', fontWeight: '600' }}>Background</span>
                      <input type="color" value={selectedClip.textBgColor || '#000000'} onChange={(e) => updateField('textBgColor', e.target.value)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'transparent' }} title="Background Color Wheel" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: '#000', fontWeight: '600' }}>Outline</span>
                      <input type="color" value={selectedClip.outlineColor || '#38bdf8'} onChange={(e) => updateField('outlineColor', e.target.value)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'transparent' }} title="Outline Color Wheel" />
                    </div>
                  </div>
                </div>

                {/* Rotation & Flip Controls */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f4f4f5', borderRadius: '6px', padding: '6px 10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#3f3f46' }}>📐 Rotation</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#000000', fontFamily: 'monospace' }}>{selectedClip.rotation || 0}°</span>
                  </div>
                  <button onClick={() => updateField('flipH', !selectedClip.flipH)} style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #e4e4e7', cursor: 'pointer' }} title="Flip Horizontally">↔️</button>
                  <button onClick={() => updateField('flipV', !selectedClip.flipV)} style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #e4e4e7', cursor: 'pointer' }} title="Flip Vertically">↕️</button>
                </div>

                {/* Delete Element Option */}
                <button onClick={() => onDelete && onDelete(selectedClip)} style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e4e4e7', color: '#dc2626', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                  Delete Element
                </button>
              </div>
            )}

            {/* ── 4. VISUALIZERS PROPERTIES (Visualizers - Setting & Style) ── */}
            {isVisualizer && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff' }}>Visualizers</div>
                  <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontWeight: 600 }}>Setting & Style</span>
                </div>

                {/* Animation Button */}
                <button className="action-btn" onClick={() => toggleSection('animations')} style={{ width: '100%', padding: '10px', fontSize: '12px', fontWeight: '600', borderRadius: '8px', backgroundColor: '#ffffff', color: '#000000', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                  💫 Animation
                </button>

                {/* Choose Visualizers Style */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#a1a1aa' }}>Choose Visualizers style</div>
                  <select
                    value={selectedClip.id || 'vis_purple_wave'}
                    onChange={(e) => {
                      const found = STICKERS_DATA.find(s => s.id === e.target.value);
                      if (found) {
                        onChange({ ...selectedClip, id: found.id, filename: found.name, svgContent: found.svgContent });
                      }
                    }}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid #e4e4e7', color: '#000000', fontSize: '12px', fontWeight: 600 }}
                  >
                    <option value="vis_purple_wave">Purple Wave</option>
                    <option value="vis_red_equalizer">Red Equalizer</option>
                    <option value="vis_neon_spectrum">Neon Spectrum</option>
                    <option value="vis_circular_pulse">Circular Pulse</option>
                  </select>
                </div>

                {/* Color Wheel for Color */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#a1a1aa' }}>Color Wheel</div>
                  <div style={{ backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#3f3f46' }}>Visualizer Color</span>
                    <input type="color" value={selectedClip.color || '#ef4444'} onChange={(e) => updateField('color', e.target.value)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'transparent' }} title="Color Wheel" />
                  </div>
                </div>

                {/* Control Section (Min dB & Max dB with manual input boxes + Default option) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#a1a1aa' }}>Control</span>
                    <button
                      onClick={() => onChange({ ...selectedClip, minDb: -80, maxDb: 40 })}
                      style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', backgroundColor: '#2563eb', color: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Default
                    </button>
                  </div>
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: '#3f3f46', fontWeight: 600 }}>Minimum dB</span>
                      <input
                        type="number"
                        value={selectedClip.minDb ?? -80}
                        onChange={(e) => updateField('minDb', parseInt(e.target.value, 10))}
                        style={{ width: '52px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #3b82f6', backgroundColor: '#2563eb', color: '#ffffff', textAlign: 'center', fontSize: '11px', fontWeight: 700 }}
                      />
                    </div>
                    <div style={{ width: '1px', height: '24px', backgroundColor: '#e4e4e7' }} />
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: '#3f3f46', fontWeight: 600 }}>Maximum dB</span>
                      <input
                        type="number"
                        value={selectedClip.maxDb ?? 40}
                        onChange={(e) => updateField('maxDb', parseInt(e.target.value, 10))}
                        style={{ width: '52px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #e4e4e7', backgroundColor: '#f4f4f5', color: '#000000', textAlign: 'center', fontSize: '11px', fontWeight: 700 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Delete Element Option */}
                <button onClick={() => onDelete && onDelete(selectedClip)} style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e4e4e7', color: '#dc2626', fontSize: '12px', fontWeight: 700, cursor: 'pointer', marginTop: '6px' }}>
                  Delete Element
                </button>
              </div>
            )}

            {/* Default Text settings (when standard text clip is selected) */}
            {isText && !isShape && !isBadge && !isIcon && !isVisualizer && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Text Content Area */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <label className="prop-label" style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>Text / Label Content</label>
                  <textarea 
                    className="prop-input" rows="3" 
                    value={selectedClip.text ?? ''} 
                    onChange={(e) => updateField('text', e.target.value)}
                    style={{ resize: 'none', fontSize: '12px', width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Opacity Slider */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Opacity</span>
                    {(() => {
                      const displayOpacity = (selectedClip.opacity === undefined || selectedClip.opacity === null)
                        ? 100
                        : (selectedClip.opacity <= 1.0 ? Math.round(selectedClip.opacity * 100) : Math.round(selectedClip.opacity));
                      return (
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#00a8ff', fontFamily: 'monospace' }}>{displayOpacity}%</span>
                      );
                    })()}
                  </div>
                  {(() => {
                    const sliderVal = (selectedClip.opacity === undefined || selectedClip.opacity === null)
                      ? 100
                      : (selectedClip.opacity <= 1.0 ? Math.round(selectedClip.opacity * 100) : Math.round(selectedClip.opacity));
                    return (
                      <input
                        type="range" className="prop-slider" min="0" max="100"
                        value={sliderVal}
                        onChange={(e) => updateField('opacity', parseFloat(e.target.value))}
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${sliderVal}%, rgba(255, 255, 255, 0.08) ${sliderVal}%, rgba(255, 255, 255, 0.08) 100%)`
                        }}
                      />
                    );
                  })()}
                </div>

                {/* Animation Option (Fade, Slide, Zoom) */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div 
                    onClick={() => toggleSection('animations')}
                    style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.01)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="13" width="13" style={{ color: 'var(--text-secondary)' }}>
                        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                        <polyline points="2 17 12 22 22 17"></polyline>
                        <polyline points="2 12 12 17 22 12"></polyline>
                      </svg>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Animations</span>
                    </div>
                    <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="11" width="11" style={{ transform: openSections.animations ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-secondary)' }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>

                  {openSections.animations && (
                    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <CustomSelect 
                        label="Enter Animation"
                        value={selectedClip.enterAnimation ?? 'none'}
                        onChange={(val) => updateField('enterAnimation', val)}
                        options={[
                          { value: 'none', label: 'None (Instant Cut)' },
                          { value: 'fade', label: 'Fade In' },
                          { value: 'slide', label: 'Slide In' },
                          { value: 'zoom', label: 'Zoom In' }
                        ]}
                      />

                      {selectedClip.enterAnimation && selectedClip.enterAnimation !== 'none' && (() => {
                        const maxVal = Math.min(selectedClip.duration ?? 5, 3.0);
                        const currVal = selectedClip.enterDuration ?? 0.8;
                        const progress = maxVal > 0.1 ? ((currVal - 0.1) / (maxVal - 0.1)) * 100 : 0;
                        return (
                          <div style={{ padding: '0 4px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                              <span>Duration</span>
                              <span style={{ fontFamily: 'monospace' }}>{currVal.toFixed(1)}s</span>
                            </div>
                            <input 
                              type="range" className="prop-slider" min="0.1" max={maxVal} step="0.1"
                              value={currVal}
                              onChange={(e) => updateField('enterDuration', parseFloat(e.target.value))}
                              style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, rgba(255, 255, 255, 0.08) ${progress}%, rgba(255, 255, 255, 0.08) 100%)`
                              }}
                            />
                          </div>
                        );
                      })()}

                      <CustomSelect 
                        label="Exit Animation"
                        value={selectedClip.exitAnimation ?? 'none'}
                        onChange={(val) => updateField('exitAnimation', val)}
                        options={[
                          { value: 'none', label: 'None (Instant Cut)' },
                          { value: 'fade', label: 'Fade Out' },
                          { value: 'slide', label: 'Slide Out' },
                          { value: 'zoom', label: 'Zoom Out' }
                        ]}
                      />

                      {selectedClip.exitAnimation && selectedClip.exitAnimation !== 'none' && (() => {
                        const maxVal = Math.min(selectedClip.duration ?? 5, 3.0);
                        const currVal = selectedClip.exitDuration ?? 0.8;
                        const progress = maxVal > 0.1 ? ((currVal - 0.1) / (maxVal - 0.1)) * 100 : 0;
                        return (
                          <div style={{ padding: '0 4px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                              <span>Duration</span>
                              <span style={{ fontFamily: 'monospace' }}>{currVal.toFixed(1)}s</span>
                            </div>
                            <input 
                              type="range" className="prop-slider" min="0.1" max={maxVal} step="0.1"
                              value={currVal}
                              onChange={(e) => updateField('exitDuration', parseFloat(e.target.value))}
                              style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, rgba(255, 255, 255, 0.08) ${progress}%, rgba(255, 255, 255, 0.08) 100%)`
                              }}
                            />
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Delete Text Button */}
                <button
                  onClick={() => onDelete && onDelete(selectedClip)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 59, 48, 0.08)',
                    border: '1px solid rgba(255, 59, 48, 0.18)',
                    color: '#ff453a',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginTop: '8px',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255, 59, 48, 0.16)'; e.currentTarget.style.borderColor = 'rgba(255, 59, 48, 0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255, 59, 48, 0.08)'; e.currentTarget.style.borderColor = 'rgba(255, 59, 48, 0.18)'; }}
                >
                  <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="13" width="13">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Delete Text
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 2: STYLE ===================== */}
        {activeTab === 'Style' && (
          <div>
            {isVideo && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Snap to Grid Option */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg stroke="#00a8ff" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="14" width="14">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="3" x2="9" y2="21"></line>
                      <line x1="15" y1="3" x2="15" y2="21"></line>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="3" y1="15" x2="21" y2="15"></line>
                    </svg>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Snap to Grid</span>
                  </div>
                  <div 
                    className={`premium-switch ${selectedClip.snapToGrid ? 'active' : ''}`}
                    onClick={() => updateField('snapToGrid', !selectedClip.snapToGrid)}
                  >
                    <div className="premium-switch-thumb" />
                  </div>
                </div>
                
                {/* 1. Adjust Video (Color Correction & Effects) */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div 
                    onClick={() => toggleSection('adjust')}
                    style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.01)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="13" width="13" style={{ color: 'var(--text-secondary)' }}>
                        <path d="M12 20v-6M6 20V10M18 20V4M12 10V4M6 6V4"></path>
                      </svg>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>Adjust Video</span>
                    </div>
                    <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="11" width="11" style={{ transform: openSections.adjust ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-secondary)' }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>

                  {openSections.adjust && (
                    <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#ffd21f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Color Correction</div>
                      
                      <SliderWithInput 
                        label="Brightness" min={-100} max={100} 
                        value={selectedClip.brightness ?? 0}
                        onChange={(val) => updateField('brightness', val)}
                      />

                      <SliderWithInput 
                        label="Contrast" min={-100} max={100} 
                        value={selectedClip.contrast ?? 0}
                        onChange={(val) => updateField('contrast', val)}
                      />

                      <SliderWithInput 
                        label="Exposure" min={-100} max={100} 
                        value={selectedClip.exposure ?? 0}
                        onChange={(val) => updateField('exposure', val)}
                      />

                      <SliderWithInput 
                        label="Hue" min={-180} max={180} 
                        value={selectedClip.hue ?? 0}
                        onChange={(val) => updateField('hue', val)}
                        suffix="°"
                      />

                      <SliderWithInput 
                        label="Saturation" min={-100} max={100} 
                        value={selectedClip.saturation ?? 0}
                        onChange={(val) => updateField('saturation', val)}
                      />

                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#ffd21f', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '6px' }}>Effects</div>

                      <SliderWithInput 
                        label="Sharpen" min={0} max={100} 
                        value={selectedClip.sharpen ?? 0}
                        onChange={(val) => updateField('sharpen', val)}
                      />

                      <SliderWithInput 
                        label="Noise" min={0} max={100} 
                        value={selectedClip.noise ?? 0}
                        onChange={(val) => updateField('noise', val)}
                      />

                      <SliderWithInput 
                        label="Blur" min={0} max={100} 
                        value={selectedClip.blur ?? 0}
                        onChange={(val) => updateField('blur', val)}
                      />

                      <SliderWithInput 
                        label="Vignette" min={0} max={100} 
                        value={selectedClip.vignette ?? 0}
                        onChange={(val) => updateField('vignette', val)}
                      />

                      <button
                        onClick={() => {
                          onChange({
                            ...selectedClip,
                            brightness: 0,
                            contrast: 0,
                            exposure: 0,
                            hue: 0,
                            saturation: 0,
                            sharpen: 0,
                            noise: 0,
                            blur: 0,
                            vignette: 0
                          });
                        }}
                        style={{
                          width: '100%',
                          padding: '6px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          marginTop: '6px',
                          textAlign: 'center'
                        }}
                      >
                        Reset All
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Opacity Section */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <SliderWithInput 
                    label="Opacity" min={0} max={100} 
                    value={selectedClip.opacity ?? 100}
                    onChange={(val) => updateField('opacity', val)}
                  />
                </div>

                {/* 3. Position & Style Section */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div 
                    onClick={() => toggleSection('position')}
                    style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.01)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="13" width="13" style={{ color: 'var(--text-secondary)' }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                      </svg>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>Position & Style</span>
                    </div>
                    <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="11" width="11" style={{ transform: openSections.position ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-secondary)' }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>

                  {openSections.position && (
                    <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <SliderWithInput 
                        label="X Position" min={0} max={100} 
                        value={selectedClip.x ?? 50}
                        onChange={(val) => updateField('x', val)}
                      />

                      <SliderWithInput 
                        label="Y Position" min={0} max={100} 
                        value={selectedClip.y ?? 50}
                        onChange={(val) => updateField('y', val)}
                      />

                      <SliderWithInput 
                        label="Scale" min={10} max={200} 
                        value={Math.round((selectedClip.scale ?? 1.0) * 100)}
                        onChange={(val) => updateField('scale', val / 100)}
                      />

                      <SliderWithInput 
                        label="Rotation" min={0} max={360} 
                        value={selectedClip.rotation ?? 0}
                        onChange={(val) => updateField('rotation', val)}
                        suffix="°"
                      />

                      <SliderWithInput 
                        label="Border Radius" min={0} max={100} 
                        value={selectedClip.borderRadius ?? 0}
                        onChange={(val) => updateField('borderRadius', val)}
                      />

                      <SliderWithInput 
                        label="Padding Space" min={0} max={50} 
                        value={selectedClip.paddingSpace ?? 0}
                        onChange={(val) => updateField('paddingSpace', val)}
                      />

                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Padding Background</div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {[
                            { id: 'transparent', color: null, label: 'None' },
                            { id: '#000000', color: '#000000', label: 'Black' },
                            { id: '#ffffff', color: '#ffffff', label: 'White' },
                            { id: '#ff3b30', color: '#ff3b30', label: 'Red' },
                            { id: '#0084ff', color: '#0084ff', label: 'Blue' },
                            { id: '#4cd964', color: '#4cd964', label: 'Green' },
                          ].map(pc => {
                            const isActive = (selectedClip.paddingBackground || 'transparent') === pc.id;
                            return (
                              <button
                                key={pc.id}
                                title={pc.label}
                                onClick={() => updateField('paddingBackground', pc.id)}
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '4px',
                                  backgroundColor: pc.color || 'transparent',
                                  border: isActive ? '2px solid #00a8ff' : '1px solid rgba(255,255,255,0.15)',
                                  backgroundImage: !pc.color
                                    ? `linear-gradient(135deg, rgba(255,255,255,0.15) 25%, transparent 25%),
                                       linear-gradient(225deg, rgba(255,255,255,0.15) 25%, transparent 25%),
                                       linear-gradient(315deg, rgba(255,255,255,0.15) 25%, transparent 25%),
                                       linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%)`
                                    : 'none',
                                  backgroundSize: !pc.color ? '6px 6px' : 'auto',
                                  cursor: 'pointer',
                                  padding: 0,
                                  transition: 'all 0.15s'
                                }}
                              />
                            );
                          })}
                          <div style={{ position: 'relative', width: '20px', height: '20px', borderRadius: '4px', border: '1.5px dashed rgba(255,255,255,0.2)', overflow: 'hidden', cursor: 'pointer' }} title="Custom Color">
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff)', opacity: 0.7 }} />
                            <input 
                              type="color" 
                              value={selectedClip.paddingBackground === 'transparent' || !selectedClip.paddingBackground ? '#000000' : selectedClip.paddingBackground}
                              onChange={(e) => updateField('paddingBackground', e.target.value)}
                              style={{ position: 'absolute', top: '-4px', left: '-4px', width: '28px', height: '28px', border: 'none', cursor: 'pointer', opacity: 0 }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Flip Horizontally & Vertically */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Flip Layout</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => updateField('flipH', !selectedClip.flipH)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid ' + (selectedClip.flipH ? '#00a8ff' : 'rgba(255,255,255,0.08)'),
                        backgroundColor: selectedClip.flipH ? 'rgba(0, 168, 255, 0.12)' : 'rgba(255,255,255,0.02)',
                        color: selectedClip.flipH ? '#00a8ff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="12" width="12">
                        <path d="M12 2v20M4 12h16"></path>
                      </svg>
                      Flip Horizontally
                    </button>
                    <button
                      onClick={() => updateField('flipV', !selectedClip.flipV)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid ' + (selectedClip.flipV ? '#00a8ff' : 'rgba(255,255,255,0.08)'),
                        backgroundColor: selectedClip.flipV ? 'rgba(0, 168, 255, 0.12)' : 'rgba(255,255,255,0.02)',
                        color: selectedClip.flipV ? '#00a8ff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="12" width="12">
                        <path d="M12 2v20M2 12h22"></path>
                      </svg>
                      Flip Vertically
                    </button>
                  </div>
                </div>

                {/* 5. Fit & Size Actions */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Fit Layout</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        onChange({
                          ...selectedClip,
                          fitMode: 'cover',
                          x: 50,
                          y: 50,
                          scale: 1.0,
                          rotation: 0,
                          cropEnabled: false,
                          cropTop: 0,
                          cropBottom: 0,
                          cropLeft: 0,
                          cropRight: 0,
                          borderRadius: 0,
                          paddingSpace: 0
                        });
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid ' + (selectedClip.fitMode === 'cover' ? '#00a8ff' : 'rgba(255,255,255,0.08)'),
                        backgroundColor: selectedClip.fitMode === 'cover' ? 'rgba(0, 168, 255, 0.12)' : 'rgba(255,255,255,0.02)',
                        color: selectedClip.fitMode === 'cover' ? '#00a8ff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      Full Canvas
                    </button>
                    <button
                      onClick={() => {
                        onChange({
                          ...selectedClip,
                          fitMode: 'contain',
                          x: 50,
                          y: 50,
                          scale: 1.0,
                          rotation: 0,
                          cropEnabled: false,
                          cropTop: 0,
                          cropBottom: 0,
                          cropLeft: 0,
                          cropRight: 0,
                          borderRadius: 0,
                          paddingSpace: 0
                        });
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid ' + (selectedClip.fitMode === 'contain' ? '#00a8ff' : 'rgba(255,255,255,0.08)'),
                        backgroundColor: selectedClip.fitMode === 'contain' ? 'rgba(0, 168, 255, 0.12)' : 'rgba(255,255,255,0.02)',
                        color: selectedClip.fitMode === 'contain' ? '#00a8ff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      Fit to Canvas
                    </button>
                  </div>
                </div>

                {/* 6. Filter Preset Selection */}
                {(() => {
                  const filters = [
                    { id: 'none', label: 'None', gradient: 'linear-gradient(135deg, #2b2b36, #1b1b22)' },
                    { id: 'vintage', label: 'Vintage', gradient: 'linear-gradient(135deg, #a88862, #6b4d32)' },
                    { id: 'dramatic', label: 'Dramatic', gradient: 'linear-gradient(135deg, #444, #111)' },
                    { id: 'film_noir', label: 'Noir', gradient: 'linear-gradient(135deg, #888, #222)' },
                    { id: 'retro', label: 'Retro', gradient: 'linear-gradient(135deg, #a66, #411)' },
                    { id: 'cool', label: 'Cool', gradient: 'linear-gradient(135deg, #6aa, #144)' },
                    { id: 'warm', label: 'Warm', gradient: 'linear-gradient(135deg, #a85, #642)' },
                    { id: 'soft', label: 'Soft', gradient: 'linear-gradient(135deg, #aaa, #777)' },
                    { id: 'vibrant', label: 'Vibrant', gradient: 'linear-gradient(135deg, #ff3b30, #ff8a00)' }
                  ];
                  const activeFilter = filters.find(f => f.id === (selectedClip.filter ?? 'none')) || filters[0];
                  return (
                    <div style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Filter Preset</span>
                      </div>
                      <button
                        onClick={() => setFilterDropdownOpen(v => !v)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          backgroundColor: 'var(--bg-deep)',
                          border: '1px solid ' + (filterDropdownOpen ? '#3b82f6' : 'rgba(255,255,255,0.08)'),
                          borderRadius: '6px',
                          cursor: 'pointer',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '22px', height: '14px', borderRadius: '3px', background: activeFilter.gradient, flexShrink: 0 }} />
                          <span style={{ fontSize: '12px', color: 'var(--text-main)' }}>{activeFilter.label}</span>
                        </div>
                        <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="10" width="10" style={{ transform: filterDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>

                      {filterDropdownOpen && (
                        <>
                          <div onClick={() => setFilterDropdownOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99 }} />
                          <div style={{
                            position: 'absolute', bottom: '105%', left: 0, right: 0,
                            backgroundColor: '#161925',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            zIndex: 100,
                            padding: '8px',
                            boxShadow: '0 12px 32px rgba(0,0,0,0.7)',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '6px'
                          }}>
                            {filters.map(f => {
                              const isActive = (selectedClip.filter ?? 'none') === f.id;
                              return (
                                <button
                                  key={f.id}
                                  onClick={() => { updateField('filter', f.id); setFilterDropdownOpen(false); }}
                                  style={{
                                    padding: '6px 4px',
                                    borderRadius: '5px',
                                    backgroundColor: isActive ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.02)',
                                    border: '1.5px solid ' + (isActive ? '#3b82f6' : 'rgba(255,255,255,0.06)'),
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'all 0.15s'
                                  }}
                                >
                                  <div style={{ width: '100%', height: '22px', borderRadius: '3px', background: f.gradient, position: 'relative' }}>
                                    {isActive && (
                                      <div style={{ position: 'absolute', top: '2px', right: '2px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ width: '6px', height: '6px' }}>
                                          <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  <span style={{ fontSize: '9px', fontWeight: 600, color: isActive ? '#fff' : 'rgba(255,255,255,0.5)' }}>{f.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}

              </div>
            )}

             {/* Style Settings for Text */}
            {isText && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Snap to Grid Option */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg stroke="#00a8ff" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="14" width="14">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="3" x2="9" y2="21"></line>
                      <line x1="15" y1="3" x2="15" y2="21"></line>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="3" y1="15" x2="21" y2="15"></line>
                    </svg>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Snap to Grid</span>
                  </div>
                  <div 
                    className={`premium-switch ${selectedClip.snapToGrid ? 'active' : ''}`}
                    onClick={() => updateField('snapToGrid', !selectedClip.snapToGrid)}
                  >
                    <div className="premium-switch-thumb" />
                  </div>
                </div>

                {/* Transform Accordion */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div
                    onClick={() => toggleSection('transformText')}
                    style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.01)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="13" width="13" style={{ color: 'var(--text-secondary)' }}>
                        <circle cx="12" cy="12" r="3"></circle><path d="M12 2v3m0 14v3M2 12h3m14 0h3"></path>
                      </svg>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Transform</span>
                    </div>
                    <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="11" width="11" style={{ transform: openSections.transformText ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-secondary)' }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  {openSections.transformText && (
                    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                       <SliderWithInput 
                        label="X Position" min={0} max={100}
                        value={selectedClip.x ?? 50}
                        onChange={(val) => updateField('x', val)}
                      />
                      <SliderWithInput 
                        label="Y Position" min={0} max={100}
                        value={selectedClip.y ?? 80}
                        onChange={(val) => updateField('y', val)}
                      />
                      <SliderWithInput 
                        label="Scale" min={10} max={300}
                        value={Math.round((selectedClip.scale ?? 1.0) * 100)}
                        onChange={(val) => updateField('scale', val / 100)}
                      />
                      <SliderWithInput 
                        label="Rotation" min={0} max={360}
                        value={selectedClip.rotation ?? 0}
                        onChange={(val) => updateField('rotation', val)}
                      />
                    </div>
                  )}
                </div>

                {/* Layout & Size Accordion */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div
                    onClick={() => toggleSection('layoutText')}
                    style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.01)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="13" width="13" style={{ color: 'var(--text-secondary)' }}>
                        <path d="M4 7h16M4 12h16M4 17h16"></path>
                      </svg>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Layout & Size</span>
                    </div>
                    <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="11" width="11" style={{ transform: openSections.layoutText ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-secondary)' }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  {openSections.layoutText && (
                    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <SliderWithInput 
                        label="Font Size" min={12} max={120}
                        value={selectedClip.fontSize ?? 36}
                        onChange={(val) => updateField('fontSize', val)}
                      />
                      <SliderWithInput 
                        label="Letter Spacing" min={-2} max={20}
                        value={selectedClip.letterSpacing ?? 0}
                        onChange={(val) => updateField('letterSpacing', val)}
                      />
                      <SliderWithInput 
                        label="Word Spacing" min={-5} max={40}
                        value={selectedClip.wordSpacing ?? 0}
                        onChange={(val) => updateField('wordSpacing', val)}
                      />
                      <SliderWithInput 
                        label="Padding" min={0} max={80}
                        value={selectedClip.padding ?? 8}
                        onChange={(val) => updateField('padding', val)}
                      />
                      <SliderWithInput 
                        label="Corner Radius" min={0} max={30}
                        value={selectedClip.textBorderRadius ?? 4}
                        onChange={(val) => updateField('textBorderRadius', val)}
                      />
                    </div>
                  )}
                </div>

                {/* Font choices & preset Selection */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <CustomSelect
                      label="Font Family"
                      value={selectedClip.fontFamily ?? 'Inter'}
                      onChange={(val) => updateField('fontFamily', val)}
                      options={[
                        { value: 'Inter', label: 'Inter' },
                        { value: 'Arial', label: 'Arial' },
                        { value: 'Montserrat', label: 'Montserrat' },
                        { value: 'Poppins', label: 'Poppins' },
                        { value: 'Georgia', label: 'Georgia' },
                        { value: 'Anton', label: 'Anton' }
                      ]}
                      renderOption={(val) => <span style={{ fontFamily: val, fontWeight: 'bold' }}>{val}</span>}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <CustomSelect
                      label="Font Weight"
                      value={selectedClip.fontWeight ?? 'Bold'}
                      onChange={(val) => updateField('fontWeight', val)}
                      options={[
                        { value: 'Regular', label: 'Regular' },
                        { value: 'Medium', label: 'Medium' },
                        { value: 'Bold', label: 'Bold' },
                        { value: 'Black', label: 'Black' }
                      ]}
                      renderOption={(val) => <span style={{ fontWeight: getFontWeightCSS(val) }}>{val}</span>}
                    />
                  </div>
                </div>

                <CustomSelect 
                  label="Style Preset"
                  value={selectedClip.stylePreset ?? 'default'}
                  onChange={(val) => {
                    const presetDefaults = {
                      // === Original 28 Presets ===
                      o_modern_title: { fontFamily: 'Inter', fontWeight: 'Black', fontSize: 36, italic: false, bold: true, underline: false, shadowEnabled: false, bgEnabled: false, outlineEnabled: false, color: '#ffffff' },
                      o_impact_statement: { fontFamily: 'Anton', fontWeight: 'Bold', fontSize: 38, italic: true, bold: true, underline: false, shadowEnabled: true, shadowColor: '#000000', shadowX: 3, shadowY: 3, shadowBlur: 0, bgEnabled: false, outlineEnabled: true, outlineColor: '#000000', outlineWidth: 3, color: '#ffffff' },
                      o_highlighted_text: { fontFamily: 'Poppins', fontWeight: 'ExtraBold', fontSize: 28, italic: false, bold: true, underline: false, shadowEnabled: false, bgEnabled: true, textBgColor: '#0084ff', padding: 10, textBorderRadius: 8, outlineEnabled: false, color: '#ffffff' },
                      o_ultra_minimal: { fontFamily: 'Inter', fontWeight: 'Medium', fontSize: 24, italic: false, bold: false, underline: false, shadowEnabled: false, bgEnabled: false, outlineEnabled: false, letterSpacing: 6, color: '#cccccc' },
                      o_minimal_box: { fontFamily: 'Inter', fontWeight: 'SemiBold', fontSize: 24, italic: false, bold: true, underline: false, shadowEnabled: false, bgEnabled: true, textBgColor: 'rgba(255,255,255,0.06)', outlineEnabled: true, outlineColor: '#ffffff', outlineWidth: 1.5, padding: 8, textBorderRadius: 4, color: '#ffffff' },
                      o_clean_subtitle: { fontFamily: 'DM Sans', fontWeight: 'Bold', fontSize: 24, italic: false, bold: true, underline: false, shadowEnabled: false, bgEnabled: true, textBgColor: 'rgba(0,0,0,0.65)', padding: 8, textBorderRadius: 6, outlineEnabled: false, color: '#ffffff' },
                      o_dynamic_subtitle: { fontFamily: 'Manrope', fontWeight: 'Bold', fontSize: 26, italic: false, bold: true, underline: false, outlineEnabled: true, outlineColor: '#000000', outlineWidth: 2, shadowEnabled: true, shadowColor: '#000000', shadowX: 2, shadowY: 2, shadowBlur: 0, bgEnabled: false, color: '#facc15' },
                      o_documentary_title: { fontFamily: 'Bebas Neue', fontWeight: 'Regular', fontSize: 40, italic: false, bold: false, underline: false, shadowEnabled: true, shadowColor: 'rgba(0,0,0,0.8)', shadowX: 3, shadowY: 3, shadowBlur: 4, bgEnabled: false, outlineEnabled: false, letterSpacing: 2, color: '#ffffff' },
                      o_cinematic_title: { fontFamily: 'League Spartan', fontWeight: 'Bold', fontSize: 34, italic: false, bold: true, underline: false, shadowEnabled: false, bgEnabled: false, outlineEnabled: false, letterSpacing: 4, color: '#ffffff' },
                      o_movie_trailer: { fontFamily: 'Archivo Black', fontWeight: 'Bold', fontSize: 36, italic: false, bold: true, underline: false, shadowEnabled: true, shadowColor: '#1e293b', shadowX: 4, shadowY: 4, shadowBlur: 0, bgEnabled: false, outlineEnabled: false, color: '#ffffff' },
                      o_breaking_news: { fontFamily: 'Oswald', fontWeight: 'Bold', fontSize: 26, italic: false, bold: true, underline: false, shadowEnabled: false, bgEnabled: true, textBgColor: '#ef4444', padding: 10, textBorderRadius: 0, outlineEnabled: false, color: '#ffffff' },
                      o_lower_third: { fontFamily: 'Inter', fontWeight: 'SemiBold', fontSize: 22, italic: false, bold: true, underline: false, shadowEnabled: false, bgEnabled: true, textBgColor: 'rgba(255,255,255,0.08)', padding: 6, textBorderRadius: 4, outlineEnabled: false, color: '#ffffff' },
                      o_podcast_title: { fontFamily: 'Poppins', fontWeight: 'Bold', fontSize: 28, italic: false, bold: true, underline: false, shadowEnabled: true, shadowColor: 'rgba(0,0,0,0.5)', shadowX: 2, shadowY: 2, shadowBlur: 4, bgEnabled: false, outlineEnabled: false, color: '#ff2458' },
                      o_speaker_name: { fontFamily: 'Montserrat', fontWeight: 'SemiBold', fontSize: 24, italic: false, bold: true, underline: false, shadowEnabled: false, bgEnabled: true, textBgColor: '#0084ff', padding: 8, textBorderRadius: 30, outlineEnabled: false, color: '#ffffff' },
                      o_quote_highlight: { fontFamily: 'Playfair Display', fontWeight: 'Bold', fontSize: 32, italic: true, bold: true, underline: false, shadowEnabled: false, bgEnabled: false, outlineEnabled: false, color: '#f59e0b' },
                      o_mrbeast_style: { fontFamily: 'Anton', fontWeight: 'Bold', fontSize: 36, italic: false, bold: true, underline: false, outlineEnabled: true, outlineColor: '#000000', outlineWidth: 4, shadowEnabled: true, shadowColor: '#000000', shadowX: 4, shadowY: 4, shadowBlur: 0, bgEnabled: false, color: '#facc15' },
                      o_instagram_reel: { fontFamily: 'Montserrat', fontWeight: 'Bold', fontSize: 28, italic: false, bold: true, underline: false, outlineEnabled: true, outlineColor: '#000000', outlineWidth: 2, shadowEnabled: false, bgEnabled: false, color: '#ffffff' },
                      o_youtube_thumbnail: { fontFamily: 'Anton', fontWeight: 'Bold', fontSize: 42, italic: false, bold: true, underline: false, outlineEnabled: true, outlineColor: '#000000', outlineWidth: 4, shadowEnabled: true, shadowColor: '#ff0000', shadowX: 4, shadowY: 4, shadowBlur: 0, bgEnabled: false, color: '#ffffff' },
                      o_viral_hook: { fontFamily: 'Bebas Neue', fontWeight: 'Regular', fontSize: 38, italic: false, bold: false, underline: false, outlineEnabled: true, outlineColor: '#000000', outlineWidth: 3, shadowEnabled: false, bgEnabled: false, color: '#ffd21f' },
                      o_bold_commanding: { fontFamily: 'Archivo Black', fontWeight: 'Bold', fontSize: 32, italic: false, bold: true, underline: false, outlineEnabled: true, outlineColor: '#000000', outlineWidth: 3, shadowEnabled: false, bgEnabled: false, color: '#ffffff' },
                      o_luxury_gold: { fontFamily: 'Cormorant Garamond', fontWeight: 'Bold', fontSize: 32, italic: true, bold: true, underline: false, shadowEnabled: false, bgEnabled: false, outlineEnabled: false, color: '#f59e0b' },
                      o_elegant_serif: { fontFamily: 'Playfair Display', fontWeight: 'Regular', fontSize: 32, italic: false, bold: false, underline: false, shadowEnabled: false, bgEnabled: false, outlineEnabled: false, color: '#ffffff' },
                      o_corporate_title: { fontFamily: 'Manrope', fontWeight: 'SemiBold', fontSize: 26, italic: false, bold: true, underline: false, bgEnabled: true, textBgColor: '#e2e8f0', padding: 8, textBorderRadius: 6, outlineEnabled: false, shadowEnabled: false, color: '#1e293b' },
                      o_gaming_title: { fontFamily: 'Teko', fontWeight: 'Bold', fontSize: 42, italic: false, bold: true, underline: false, outlineEnabled: true, outlineColor: '#000000', outlineWidth: 2, shadowEnabled: false, bgEnabled: false, color: '#ff2458' },
                      o_neon_glow: { fontFamily: 'League Spartan', fontWeight: 'Bold', fontSize: 30, italic: false, bold: true, underline: false, shadowEnabled: true, shadowColor: '#00f0ff', shadowX: 0, shadowY: 0, shadowBlur: 10, bgEnabled: false, outlineEnabled: false, color: '#00f0ff' },
                      o_editorial_classic: { fontFamily: 'Merriweather', fontWeight: 'Regular', fontSize: 26, italic: false, bold: false, underline: false, shadowEnabled: false, bgEnabled: false, outlineEnabled: false, color: '#ffffff' },
                      o_signature: { fontFamily: 'Great Vibes', fontWeight: 'Regular', fontSize: 38, italic: false, bold: false, underline: false, shadowEnabled: false, bgEnabled: false, outlineEnabled: false, color: '#f59e0b' },
                      o_custom_blank: { fontFamily: 'Inter', fontWeight: 'Regular', fontSize: 28, italic: false, bold: false, underline: false, shadowEnabled: false, bgEnabled: false, outlineEnabled: false, color: '#ffffff' },

                      // === New 40 Presets ===
                      alpha_focus: { fontFamily: 'Anton', fontWeight: 'Bold', fontSize: 38, italic: true, bold: true, underline: false, shadowEnabled: true, shadowColor: '#000000', shadowX: 3, shadowY: 3, shadowBlur: 0, bgEnabled: false, outlineEnabled: true, outlineColor: '#000000', outlineWidth: 3, color: '#ff9f1c' },
                      power_frame: { fontFamily: 'Archivo Black', fontWeight: 'Bold', fontSize: 32, italic: false, bold: true, underline: false, shadowEnabled: false, bgEnabled: true, textBgColor: '#000000', padding: 10, textBorderRadius: 6, outlineEnabled: true, outlineColor: '#ffffff', outlineWidth: 1.5, color: '#ffffff' },
                      vision_title: { fontFamily: 'Inter', fontWeight: 'Black', fontSize: 36, italic: false, bold: true, underline: false, shadowEnabled: false, bgEnabled: false, outlineEnabled: false, letterSpacing: 4, color: '#ffffff' },
                      elite_caption: { fontFamily: 'Poppins', fontWeight: 'ExtraBold', fontSize: 28, italic: false, bold: true, underline: false, shadowEnabled: false, bgEnabled: true, textBgColor: '#0084ff', padding: 10, textBorderRadius: 8, outlineEnabled: false, color: '#ffffff' },
                      sharp_focus: { fontFamily: 'League Spartan', fontWeight: 'Bold', fontSize: 34, italic: false, bold: true, underline: false, shadowEnabled: true, shadowColor: 'rgba(0,0,0,0.65)', shadowX: 0, shadowY: 3, shadowBlur: 5, bgEnabled: false, outlineEnabled: false, color: '#ffffff' },
                      prime_header: { fontFamily: 'Bebas Neue', fontWeight: 'Regular', fontSize: 40, italic: false, bold: false, underline: false, outlineEnabled: true, outlineColor: '#000000', outlineWidth: 4, shadowEnabled: true, shadowColor: '#000000', shadowX: 3, shadowY: 3, shadowBlur: 0, bgEnabled: false, color: '#facc15' },
                      clean_focus: { fontFamily: 'Inter', fontWeight: 'Medium', fontSize: 24, italic: false, bold: false, underline: false, shadowEnabled: false, bgEnabled: false, outlineEnabled: false, letterSpacing: 6, color: '#cccccc' },
                      horizon: { fontFamily: 'Space Grotesk', fontWeight: 'Bold', fontSize: 32, italic: false, bold: true, underline: false, shadowEnabled: true, shadowColor: '#00f0ff', shadowX: 0, shadowY: 0, shadowBlur: 8, bgEnabled: false, outlineEnabled: false, color: '#00f0ff' },
                      blueprint: { fontFamily: 'Manrope', fontWeight: 'Bold', fontSize: 26, italic: false, bold: true, underline: false, bgEnabled: true, textBgColor: 'rgba(255,255,255,0.08)', outlineEnabled: true, outlineColor: '#ffffff', outlineWidth: 1.5, padding: 8, textBorderRadius: 4, color: '#ffffff' },
                      spotlight: { fontFamily: 'Montserrat', fontWeight: 'ExtraBold', fontSize: 28, italic: false, bold: true, underline: false, bgEnabled: true, textBgColor: '#8b5cf6', padding: 10, textBorderRadius: 8, outlineEnabled: false, color: '#ffffff' },
                      pulse: { fontFamily: 'Outfit', fontWeight: 'Bold', fontSize: 30, italic: false, bold: true, underline: false, shadowEnabled: true, shadowColor: '#ffffff', shadowX: 0, shadowY: 0, shadowBlur: 8, bgEnabled: false, outlineEnabled: false, color: '#ec4899' },
                      next_chapter: { fontFamily: 'Oswald', fontWeight: 'Bold', fontSize: 26, italic: false, bold: true, underline: false, bgEnabled: true, textBgColor: '#ef4444', padding: 10, textBorderRadius: 0, outlineEnabled: false, color: '#ffffff' },
                      focus_line: { fontFamily: 'DM Sans', fontWeight: 'Bold', fontSize: 24, italic: false, bold: true, underline: false, bgEnabled: true, textBgColor: 'rgba(0,0,0,0.65)', padding: 8, textBorderRadius: 6, outlineEnabled: false, color: '#ffffff' },
                      core_message: { fontFamily: 'Rubik', fontWeight: 'Bold', fontSize: 32, italic: false, bold: true, underline: false, outlineEnabled: true, outlineColor: '#000000', outlineWidth: 3, letterSpacing: 2, bgEnabled: false, color: '#ffffff' },
                      prestige: { fontFamily: 'Playfair Display', fontWeight: 'Bold', fontSize: 32, italic: true, bold: true, underline: false, shadowEnabled: false, bgEnabled: false, outlineEnabled: false, color: '#d97706' },
                      legacy: { fontFamily: 'Merriweather', fontWeight: 'Bold', fontSize: 26, italic: false, bold: true, underline: false, bgEnabled: true, textBgColor: '#e2e8f0', padding: 8, textBorderRadius: 4, outlineEnabled: false, color: '#1e293b' },
                      signature_pro: { fontFamily: 'Great Vibes', fontWeight: 'Regular', fontSize: 38, italic: false, bold: false, underline: false, shadowEnabled: false, bgEnabled: false, outlineEnabled: false, color: '#ec4899' },
                      elevate: { fontFamily: 'Urbanist', fontWeight: 'Bold', fontSize: 32, italic: false, bold: true, underline: false, shadowEnabled: true, shadowColor: '#a855f7', shadowX: 0, shadowY: 0, shadowBlur: 10, bgEnabled: false, outlineEnabled: false, color: '#ffffff' },
                      fusion: { fontFamily: 'Lexend', fontWeight: 'Bold', fontSize: 26, italic: false, bold: true, underline: false, bgEnabled: true, textBgColor: '#f97316', padding: 8, textBorderRadius: 8, outlineEnabled: false, color: '#ffffff' },
                      ignite: { fontFamily: 'Archivo Black', fontWeight: 'Bold', fontSize: 36, italic: false, bold: true, underline: false, shadowEnabled: true, shadowColor: '#b91c1c', shadowX: 4, shadowY: 4, shadowBlur: 0, bgEnabled: false, outlineEnabled: false, color: '#ffd21f' },
                      momentum: { fontFamily: 'Anton', fontWeight: 'Bold', fontSize: 38, italic: true, bold: true, underline: false, outlineEnabled: true, outlineColor: '#000000', outlineWidth: 3, shadowEnabled: true, shadowColor: '#000000', shadowX: 3, shadowY: 3, shadowBlur: 0, bgEnabled: false, color: '#ffffff' },
                      vision_box: { fontFamily: 'Poppins', fontWeight: 'Bold', fontSize: 26, italic: false, bold: true, underline: false, bgEnabled: true, textBgColor: 'rgba(0, 0, 0, 0.7)', padding: 10, textBorderRadius: 30, outlineEnabled: false, color: '#ffffff' },
                      platinum: { fontFamily: 'Cormorant Garamond', fontWeight: 'Bold', fontSize: 32, italic: true, bold: true, underline: false, shadowEnabled: false, bgEnabled: false, outlineEnabled: false, color: '#94a3b8' },
                      catalyst: { fontFamily: 'League Spartan', fontWeight: 'Bold', fontSize: 30, italic: false, bold: true, underline: false, bgEnabled: true, textBgColor: '#22c55e', padding: 8, textBorderRadius: 6, outlineEnabled: false, color: '#0f172a' },
                      storyline: { fontFamily: 'Inter', fontWeight: 'SemiBold', fontSize: 24, italic: false, bold: true, underline: false, shadowEnabled: true, shadowColor: 'rgba(0,0,0,0.5)', shadowX: 0, shadowY: 2, shadowBlur: 4, bgEnabled: false, outlineEnabled: false, color: '#ffffff' },
                      insight: { fontFamily: 'Plus Jakarta Sans', fontWeight: 'Bold', fontSize: 30, italic: false, bold: true, underline: false, shadowEnabled: true, shadowColor: '#22c55e', shadowX: 0, shadowY: 0, shadowBlur: 8, bgEnabled: false, outlineEnabled: false, color: '#22c55e' },
                      broadcast_pro: { fontFamily: 'Oswald', fontWeight: 'Bold', fontSize: 28, italic: false, bold: true, underline: false, bgEnabled: true, textBgColor: '#1e293b', padding: 10, textBorderRadius: 4, outlineEnabled: false, color: '#ffffff' },
                      deep_focus: { fontFamily: 'Bebas Neue', fontWeight: 'Regular', fontSize: 38, italic: false, bold: false, underline: false, shadowEnabled: true, shadowColor: 'rgba(0,0,0,0.85)', shadowX: 4, shadowY: 4, shadowBlur: 3, bgEnabled: false, outlineEnabled: false, color: '#ffffff' },
                      creator_plus: { fontFamily: 'Montserrat', fontWeight: 'Bold', fontSize: 28, italic: false, bold: true, underline: false, outlineEnabled: true, outlineColor: '#ffffff', outlineWidth: 2, shadowEnabled: false, bgEnabled: false, color: '#f43f5e' },
                      echo: { fontFamily: 'Space Grotesk', fontWeight: 'Bold', fontSize: 32, italic: false, bold: true, underline: false, outlineEnabled: true, outlineColor: '#000000', outlineWidth: 3, shadowEnabled: false, bgEnabled: false, color: '#ffffff' },
                      blueprint_box: { fontFamily: 'Inter', fontWeight: 'Bold', fontSize: 24, italic: false, bold: true, underline: false, bgEnabled: true, textBgColor: 'rgba(255,255,255,0.06)', outlineEnabled: true, outlineColor: '#0084ff', outlineWidth: 2, padding: 8, textBorderRadius: 4, color: '#ffffff' },
                      prestige_serif: { fontFamily: 'Libre Baskerville', fontWeight: 'Bold', fontSize: 28, italic: false, bold: true, underline: false, shadowEnabled: true, shadowColor: 'rgba(0,0,0,0.45)', shadowX: 0, shadowY: 2, shadowBlur: 6, bgEnabled: false, outlineEnabled: false, color: '#ffffff' },
                      motion_caption: { fontFamily: 'Outfit', fontWeight: 'ExtraBold', fontSize: 30, italic: false, bold: true, underline: false, outlineEnabled: true, outlineColor: '#000000', outlineWidth: 3, shadowEnabled: true, shadowColor: '#000000', shadowX: 2, shadowY: 2, shadowBlur: 0, bgEnabled: false, color: '#facc15' },
                      vision_glow: { fontFamily: 'League Spartan', fontWeight: 'Bold', fontSize: 30, italic: false, bold: true, underline: false, shadowEnabled: true, shadowColor: '#22c55e', shadowX: 0, shadowY: 0, shadowBlur: 10, bgEnabled: false, outlineEnabled: false, color: '#22c55e' },
                      quantum: { fontFamily: 'Archivo Black', fontWeight: 'Bold', fontSize: 34, italic: false, bold: true, underline: false, outlineEnabled: true, outlineColor: '#000000', outlineWidth: 3.5, shadowEnabled: true, shadowColor: '#0084ff', shadowX: 3, shadowY: 3, shadowBlur: 0, bgEnabled: false, color: '#ffffff' },
                      vector: { fontFamily: 'Manrope', fontWeight: 'Bold', fontSize: 28, italic: false, bold: true, underline: false, shadowEnabled: false, bgEnabled: false, outlineEnabled: false, letterSpacing: 2, color: '#ffffff' },
                      origin: { fontFamily: 'Inter', fontWeight: 'Black', fontSize: 36, italic: false, bold: true, underline: false, shadowEnabled: false, bgEnabled: false, outlineEnabled: false, color: '#ffffff' },
                      horizon_plus: { fontFamily: 'Poppins', fontWeight: 'SemiBold', fontSize: 30, italic: false, bold: true, underline: false, shadowEnabled: false, bgEnabled: false, outlineEnabled: false, letterSpacing: 1.5, color: '#ffffff' },
                      apex: { fontFamily: 'Anton', fontWeight: 'Bold', fontSize: 40, italic: true, bold: true, underline: false, outlineEnabled: true, outlineColor: '#000000', outlineWidth: 3, shadowEnabled: false, bgEnabled: false, color: '#ef4444' },
                      default: { fontFamily: 'Inter', fontWeight: 'Regular', fontSize: 28, italic: false, bold: false, underline: false, shadowEnabled: false, bgEnabled: false, outlineEnabled: false, color: '#ffffff' }
                    };
                    const defaults = presetDefaults[val] || {};
                    onChange({
                      ...selectedClip,
                      stylePreset: val,
                      ...defaults
                    });
                  }}
                  options={[
                    // === Original 28 Presets ===
                    { value: 'o_modern_title', label: 'Modern Title' },
                    { value: 'o_impact_statement', label: 'Impact Statement' },
                    { value: 'o_highlighted_text', label: 'Highlighted Text' },
                    { value: 'o_ultra_minimal', label: 'Ultra Minimal' },
                    { value: 'o_minimal_box', label: 'Minimal Box' },
                    { value: 'o_clean_subtitle', label: 'Clean Subtitle' },
                    { value: 'o_dynamic_subtitle', label: 'Dynamic Subtitle' },
                    { value: 'o_documentary_title', label: 'Documentary Title' },
                    { value: 'o_cinematic_title', label: 'Cinematic Title' },
                    { value: 'o_movie_trailer', label: 'Movie Trailer' },
                    { value: 'o_breaking_news', label: 'Breaking News' },
                    { value: 'o_lower_third', label: 'Lower Third' },
                    { value: 'o_podcast_title', label: 'Podcast Title' },
                    { value: 'o_speaker_name', label: 'Speaker Name' },
                    { value: 'o_quote_highlight', label: 'Quote Highlight' },
                    { value: 'o_mrbeast_style', label: 'MrBeast Style' },
                    { value: 'o_instagram_reel', label: 'Instagram Reel' },
                    { value: 'o_youtube_thumbnail', label: 'YouTube Thumbnail' },
                    { value: 'o_viral_hook', label: 'Viral Hook' },
                    { value: 'o_bold_commanding', label: 'Bold & Commanding' },
                    { value: 'o_luxury_gold', label: 'Luxury Gold' },
                    { value: 'o_elegant_serif', label: 'Elegant Serif' },
                    { value: 'o_corporate_title', label: 'Corporate Title' },
                    { value: 'o_gaming_title', label: 'Gaming Title' },
                    { value: 'o_neon_glow', label: 'Neon Glow' },
                    { value: 'o_editorial_classic', label: 'Editorial Classic' },
                    { value: 'o_signature', label: 'Signature' },
                    { value: 'o_custom_blank', label: 'Custom Blank' },

                    // === New 40 Presets ===
                    { value: 'alpha_focus', label: 'Alpha Focus' },
                    { value: 'power_frame', label: 'Power Frame' },
                    { value: 'vision_title', label: 'Vision Title' },
                    { value: 'elite_caption', label: 'Elite Caption' },
                    { value: 'sharp_focus', label: 'Sharp Focus' },
                    { value: 'prime_header', label: 'Prime Header' },
                    { value: 'clean_focus', label: 'Clean Focus' },
                    { value: 'horizon', label: 'Horizon' },
                    { value: 'blueprint', label: 'Blueprint' },
                    { value: 'spotlight', label: 'Spotlight' },
                    { value: 'pulse', label: 'Pulse' },
                    { value: 'next_chapter', label: 'Next Chapter' },
                    { value: 'focus_line', label: 'Focus Line' },
                    { value: 'core_message', label: 'Core Message' },
                    { value: 'prestige', label: 'Prestige' },
                    { value: 'legacy', label: 'Legacy' },
                    { value: 'signature_pro', label: 'Signature Pro' },
                    { value: 'elevate', label: 'Elevate' },
                    { value: 'fusion', label: 'Fusion' },
                    { value: 'ignite', label: 'Ignite' },
                    { value: 'momentum', label: 'Momentum' },
                    { value: 'vision_box', label: 'Vision Box' },
                    { value: 'platinum', label: 'Platinum' },
                    { value: 'catalyst', label: 'Catalyst' },
                    { value: 'storyline', label: 'Storyline' },
                    { value: 'insight', label: 'Insight' },
                    { value: 'broadcast_pro', label: 'Broadcast Pro' },
                    { value: 'deep_focus', label: 'Deep Focus' },
                    { value: 'creator_plus', label: 'Creator Plus' },
                    { value: 'echo', label: 'Echo' },
                    { value: 'blueprint_box', label: 'Blueprint Box' },
                    { value: 'prestige_serif', label: 'Prestige Serif' },
                    { value: 'motion_caption', label: 'Motion Caption' },
                    { value: 'vision_glow', label: 'Vision Glow' },
                    { value: 'quantum', label: 'Quantum' },
                    { value: 'vector', label: 'Vector' },
                    { value: 'origin', label: 'Origin' },
                    { value: 'horizon_plus', label: 'Horizon Plus' },
                    { value: 'apex', label: 'Apex' },
                    { value: 'default', label: 'Blank Canvas' }
                  ]}
                />

                {/* Bold, Italic, Underline & Alignment Group */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {/* Style Toggles */}
                  <div style={{ display: 'flex', gap: '3px', backgroundColor: 'var(--bg-deep)', border: '1px solid var(--bg-border)', borderRadius: '6px', padding: '4px' }}>
                    <button
                      onClick={() => updateField('bold', !selectedClip.bold)}
                      style={{
                        padding: '6px 12px', borderRadius: '4px', border: 'none',
                        backgroundColor: selectedClip.bold ? 'var(--primary)' : 'transparent',
                        color: selectedClip.bold ? '#000000' : 'var(--text-secondary)',
                        fontWeight: 'bold', cursor: 'pointer', fontSize: '12px'
                      }}
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      onClick={() => updateField('italic', !selectedClip.italic)}
                      style={{
                        padding: '6px 12px', borderRadius: '4px', border: 'none',
                        backgroundColor: selectedClip.italic ? 'var(--primary)' : 'transparent',
                        color: selectedClip.italic ? '#000000' : 'var(--text-secondary)',
                        fontStyle: 'italic', cursor: 'pointer', fontSize: '12px'
                      }}
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      onClick={() => updateField('underline', !selectedClip.underline)}
                      style={{
                        padding: '6px 12px', borderRadius: '4px', border: 'none',
                        backgroundColor: selectedClip.underline ? 'var(--primary)' : 'transparent',
                        color: selectedClip.underline ? '#000000' : 'var(--text-secondary)',
                        textDecoration: 'underline', cursor: 'pointer', fontSize: '12px'
                      }}
                      title="Underline"
                    >
                      U
                    </button>
                  </div>

                  {/* Alignment buttons */}
                  <div style={{ flex: 1, display: 'flex', gap: '3px', backgroundColor: 'var(--bg-deep)', border: '1px solid var(--bg-border)', borderRadius: '6px', padding: '4px' }}>
                    {[
                      { id: 'left', icon: (
                        <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="13" width="13">
                          <line x1="17" y1="10" x2="3" y2="10"></line>
                          <line x1="21" y1="6" x2="3" y2="6"></line>
                          <line x1="21" y1="14" x2="3" y2="14"></line>
                          <line x1="17" y1="18" x2="3" y2="18"></line>
                        </svg>
                      )},
                      { id: 'center', icon: (
                        <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="13" width="13">
                          <line x1="18" y1="10" x2="6" y2="10"></line>
                          <line x1="21" y1="6" x2="3" y2="6"></line>
                          <line x1="21" y1="14" x2="3" y2="14"></line>
                          <line x1="18" y1="18" x2="6" y2="18"></line>
                        </svg>
                      )},
                      { id: 'right', icon: (
                        <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="13" width="13">
                          <line x1="21" y1="10" x2="7" y2="10"></line>
                          <line x1="21" y1="6" x2="3" y2="6"></line>
                          <line x1="21" y1="14" x2="3" y2="14"></line>
                          <line x1="21" y1="18" x2="7" y2="18"></line>
                        </svg>
                      )}
                    ].map(opt => {
                      const isActive = (selectedClip.align ?? 'center') === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            const newX = opt.id === 'left' ? 10 : opt.id === 'right' ? 90 : 50;
                            onChange({ ...selectedClip, align: opt.id, x: newX });
                          }}
                          style={{
                            flex: 1, padding: '6px', borderRadius: '4px', border: 'none',
                            backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                            color: isActive ? '#000000' : 'var(--text-secondary)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s'
                          }}
                          title={`Align ${opt.id}`}
                        >
                          {opt.icon}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Text Color (Color Wheel / ColorPicker) */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <ColorPicker 
                    label="Text Color" 
                    value={selectedClip.color ?? '#ffffff'} 
                    onChange={(val) => updateField('color', val)} 
                  />
                </div>

                {/* Text Outlines (Toggle + Slider + ColorPicker) */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Text Outline</span>
                    <div 
                      className={`premium-switch ${selectedClip.outlineEnabled ? 'active' : ''}`}
                      onClick={() => updateField('outlineEnabled', !selectedClip.outlineEnabled)}
                    >
                      <div className="premium-switch-thumb" />
                    </div>
                  </div>
                  {selectedClip.outlineEnabled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                      <ColorPicker 
                        label="Outline Color" 
                        value={selectedClip.outlineColor ?? '#000000'} 
                        onChange={(val) => updateField('outlineColor', val)} 
                      />
                      <SliderWithInput 
                        label="Outline Width" min={1} max={10} 
                        value={selectedClip.outlineWidth ?? 2}
                        onChange={(val) => updateField('outlineWidth', val)}
                      />
                    </div>
                  )}
                </div>

                {/* Text Background (Toggle + ColorPicker) */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Text Background</span>
                    <div 
                      className={`premium-switch ${selectedClip.bgEnabled !== false ? 'active' : ''}`}
                      onClick={() => updateField('bgEnabled', selectedClip.bgEnabled === false ? true : false)}
                    >
                      <div className="premium-switch-thumb" />
                    </div>
                  </div>
                  {selectedClip.bgEnabled !== false && (
                    <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                      {selectedClip.stylePreset === 'highlight_box' ? (
                        <ColorPicker 
                          label="Highlight Color" 
                          value={selectedClip.highlightColor ?? '#4b4ded'} 
                          onChange={(val) => updateField('highlightColor', val)} 
                        />
                      ) : (
                        <ColorPicker 
                          label="Background Color" 
                          value={selectedClip.textBgColor ?? 'rgba(0, 0, 0, 0.5)'} 
                          onChange={(val) => updateField('textBgColor', val)} 
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Text Shadow (Toggle + ColorPicker + Sliders) */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Text Shadow</span>
                    <div 
                      className={`premium-switch ${selectedClip.shadowEnabled ? 'active' : ''}`}
                      onClick={() => updateField('shadowEnabled', !selectedClip.shadowEnabled)}
                    >
                      <div className="premium-switch-thumb" />
                    </div>
                  </div>
                  {selectedClip.shadowEnabled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                      <ColorPicker 
                        label="Shadow Color" 
                        value={selectedClip.shadowColor ?? '#000000'} 
                        onChange={(val) => updateField('shadowColor', val)} 
                      />
                      <SliderWithInput 
                        label="Shadow Blur" min={0} max={20} 
                        value={selectedClip.shadowBlur ?? 4}
                        onChange={(val) => updateField('shadowBlur', val)}
                      />
                      <SliderWithInput 
                        label="Offset X" min={-15} max={15} 
                        value={selectedClip.shadowX ?? 2}
                        onChange={(val) => updateField('shadowX', val)}
                      />
                      <SliderWithInput 
                        label="Offset Y" min={-15} max={15} 
                        value={selectedClip.shadowY ?? 2}
                        onChange={(val) => updateField('shadowY', val)}
                      />
                    </div>
                  )}
                </div>

              </div>
            )}

            {isImage && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Snap to Grid Option */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg stroke="#00a8ff" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="14" width="14">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="3" x2="9" y2="21"></line>
                      <line x1="15" y1="3" x2="15" y2="21"></line>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="3" y1="15" x2="21" y2="15"></line>
                    </svg>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Snap to Grid</span>
                  </div>
                  <div 
                    className={`premium-switch ${selectedClip.snapToGrid ? 'active' : ''}`}
                    onClick={() => updateField('snapToGrid', !selectedClip.snapToGrid)}
                  >
                    <div className="premium-switch-thumb" />
                  </div>
                </div>
                
                {/* 1. Adjust Image (Color Correction & Effects) */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div 
                    onClick={() => toggleSection('adjust')}
                    style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.01)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="13" width="13" style={{ color: 'var(--text-secondary)' }}>
                        <path d="M12 20v-6M6 20V10M18 20V4M12 10V4M6 6V4"></path>
                      </svg>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>Adjust Image</span>
                    </div>
                    <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="11" width="11" style={{ transform: openSections.adjust ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-secondary)' }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>

                  {openSections.adjust && (
                    <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#ffd21f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Color Correction</div>
                      
                      <SliderWithInput 
                        label="Brightness" min={-100} max={100} 
                        value={selectedClip.brightness ?? 0}
                        onChange={(val) => updateField('brightness', val)}
                      />

                      <SliderWithInput 
                        label="Contrast" min={-100} max={100} 
                        value={selectedClip.contrast ?? 0}
                        onChange={(val) => updateField('contrast', val)}
                      />

                      <SliderWithInput 
                        label="Exposure" min={-100} max={100} 
                        value={selectedClip.exposure ?? 0}
                        onChange={(val) => updateField('exposure', val)}
                      />

                      <SliderWithInput 
                        label="Hue" min={-180} max={180} 
                        value={selectedClip.hue ?? 0}
                        onChange={(val) => updateField('hue', val)}
                        suffix="°"
                      />

                      <SliderWithInput 
                        label="Saturation" min={-100} max={100} 
                        value={selectedClip.saturation ?? 0}
                        onChange={(val) => updateField('saturation', val)}
                      />

                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#ffd21f', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '6px' }}>Effects</div>

                      <SliderWithInput 
                        label="Sharpen" min={0} max={100} 
                        value={selectedClip.sharpen ?? 0}
                        onChange={(val) => updateField('sharpen', val)}
                      />

                      <SliderWithInput 
                        label="Noise" min={0} max={100} 
                        value={selectedClip.noise ?? 0}
                        onChange={(val) => updateField('noise', val)}
                      />

                      <SliderWithInput 
                        label="Blur" min={0} max={100} 
                        value={selectedClip.blur ?? 0}
                        onChange={(val) => updateField('blur', val)}
                      />

                      <SliderWithInput 
                        label="Vignette" min={0} max={100} 
                        value={selectedClip.vignette ?? 0}
                        onChange={(val) => updateField('vignette', val)}
                      />

                      <button
                        onClick={() => {
                          onChange({
                            ...selectedClip,
                            brightness: 0,
                            contrast: 0,
                            exposure: 0,
                            hue: 0,
                            saturation: 0,
                            sharpen: 0,
                            noise: 0,
                            blur: 0,
                            vignette: 0
                          });
                        }}
                        style={{
                          width: '100%',
                          padding: '6px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          marginTop: '6px',
                          textAlign: 'center'
                        }}
                      >
                        Reset All
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Opacity Section */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <SliderWithInput 
                    label="Opacity" min={0} max={100} 
                    value={selectedClip.opacity ?? 100}
                    onChange={(val) => updateField('opacity', val)}
                  />
                </div>

                {/* 3. Position & Style Section */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div 
                    onClick={() => toggleSection('position')}
                    style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.01)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="13" width="13" style={{ color: 'var(--text-secondary)' }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                      </svg>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>Position & Style</span>
                    </div>
                    <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="11" width="11" style={{ transform: openSections.position ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-secondary)' }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>

                  {openSections.position && (
                    <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <SliderWithInput 
                        label="X Position" min={0} max={100} 
                        value={selectedClip.x ?? 50}
                        onChange={(val) => updateField('x', val)}
                      />

                      <SliderWithInput 
                        label="Y Position" min={0} max={100} 
                        value={selectedClip.y ?? 50}
                        onChange={(val) => updateField('y', val)}
                      />

                      <SliderWithInput 
                        label="Scale" min={10} max={200} 
                        value={Math.round((selectedClip.scale ?? 1.0) * 100)}
                        onChange={(val) => updateField('scale', val / 100)}
                      />

                      <SliderWithInput 
                        label="Rotation" min={0} max={360} 
                        value={selectedClip.rotation ?? 0}
                        onChange={(val) => updateField('rotation', val)}
                        suffix="°"
                      />

                      <SliderWithInput 
                        label="Border Radius" min={0} max={100} 
                        value={selectedClip.borderRadius ?? 0}
                        onChange={(val) => updateField('borderRadius', val)}
                      />

                      <SliderWithInput 
                        label="Padding Space" min={0} max={50} 
                        value={selectedClip.paddingSpace ?? 0}
                        onChange={(val) => updateField('paddingSpace', val)}
                      />

                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Padding Background</div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {[
                            { id: 'transparent', color: null, label: 'None' },
                            { id: '#000000', color: '#000000', label: 'Black' },
                            { id: '#ffffff', color: '#ffffff', label: 'White' },
                            { id: '#ff3b30', color: '#ff3b30', label: 'Red' },
                            { id: '#0084ff', color: '#0084ff', label: 'Blue' },
                            { id: '#4cd964', color: '#4cd964', label: 'Green' },
                          ].map(pc => {
                            const isActive = (selectedClip.paddingBackground || 'transparent') === pc.id;
                            return (
                              <button
                                key={pc.id}
                                title={pc.label}
                                onClick={() => updateField('paddingBackground', pc.id)}
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '4px',
                                  backgroundColor: pc.color || 'transparent',
                                  border: isActive ? '2px solid #00a8ff' : '1px solid rgba(255,255,255,0.15)',
                                  backgroundImage: !pc.color
                                    ? `linear-gradient(135deg, rgba(255,255,255,0.15) 25%, transparent 25%),
                                       linear-gradient(225deg, rgba(255,255,255,0.15) 25%, transparent 25%),
                                       linear-gradient(315deg, rgba(255,255,255,0.15) 25%, transparent 25%),
                                       linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%)`
                                    : 'none',
                                  backgroundSize: !pc.color ? '6px 6px' : 'auto',
                                  cursor: 'pointer',
                                  padding: 0,
                                  transition: 'all 0.15s'
                                }}
                              />
                            );
                          })}
                          <div style={{ position: 'relative', width: '20px', height: '20px', borderRadius: '4px', border: '1.5px dashed rgba(255,255,255,0.2)', overflow: 'hidden', cursor: 'pointer' }} title="Custom Color">
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff)', opacity: 0.7 }} />
                            <input 
                              type="color" 
                              value={selectedClip.paddingBackground === 'transparent' || !selectedClip.paddingBackground ? '#000000' : selectedClip.paddingBackground}
                              onChange={(e) => updateField('paddingBackground', e.target.value)}
                              style={{ position: 'absolute', top: '-4px', left: '-4px', width: '28px', height: '28px', border: 'none', cursor: 'pointer', opacity: 0 }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Flip Layout Section */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Flip Layout</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => updateField('flipH', !selectedClip.flipH)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid ' + (selectedClip.flipH ? '#00a8ff' : 'rgba(255,255,255,0.08)'),
                        backgroundColor: selectedClip.flipH ? 'rgba(0, 168, 255, 0.12)' : 'rgba(255,255,255,0.02)',
                        color: selectedClip.flipH ? '#00a8ff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="12" width="12">
                        <path d="M12 2v20M4 12h16"></path>
                      </svg>
                      Flip Horizontally
                    </button>
                    <button
                      onClick={() => updateField('flipV', !selectedClip.flipV)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid ' + (selectedClip.flipV ? '#00a8ff' : 'rgba(255,255,255,0.08)'),
                        backgroundColor: selectedClip.flipV ? 'rgba(0, 168, 255, 0.12)' : 'rgba(255,255,255,0.02)',
                        color: selectedClip.flipV ? '#00a8ff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="12" width="12">
                        <path d="M12 2v20M2 12h22"></path>
                      </svg>
                      Flip Vertically
                    </button>
                  </div>
                </div>

                {/* 5. Fit & Size Actions */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Fit Layout</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        onChange({
                          ...selectedClip,
                          fitMode: 'cover',
                          x: 50,
                          y: 50,
                          scale: 1.0,
                          rotation: 0,
                          cropEnabled: false,
                          cropTop: 0,
                          cropBottom: 0,
                          cropLeft: 0,
                          cropRight: 0,
                          borderRadius: 0,
                          paddingSpace: 0
                        });
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid ' + (selectedClip.fitMode === 'cover' ? '#00a8ff' : 'rgba(255,255,255,0.08)'),
                        backgroundColor: selectedClip.fitMode === 'cover' ? 'rgba(0, 168, 255, 0.12)' : 'rgba(255,255,255,0.02)',
                        color: selectedClip.fitMode === 'cover' ? '#00a8ff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      Full Canvas
                    </button>
                    <button
                      onClick={() => {
                        onChange({
                          ...selectedClip,
                          fitMode: 'contain',
                          x: 50,
                          y: 50,
                          scale: 1.0,
                          rotation: 0,
                          cropEnabled: false,
                          cropTop: 0,
                          cropBottom: 0,
                          cropLeft: 0,
                          cropRight: 0,
                          borderRadius: 0,
                          paddingSpace: 0
                        });
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid ' + (selectedClip.fitMode === 'contain' ? '#00a8ff' : 'rgba(255,255,255,0.08)'),
                        backgroundColor: selectedClip.fitMode === 'contain' ? 'rgba(0, 168, 255, 0.12)' : 'rgba(255,255,255,0.02)',
                        color: selectedClip.fitMode === 'contain' ? '#00a8ff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      Fit to Canvas
                    </button>
                  </div>
                </div>

                {/* 6. Filter Preset Selection */}
                {(() => {
                  const filters = [
                    { id: 'none', label: 'None', gradient: 'linear-gradient(135deg, #2b2b36, #1b1b22)' },
                    { id: 'vintage', label: 'Vintage', gradient: 'linear-gradient(135deg, #a88862, #6b4d32)' },
                    { id: 'dramatic', label: 'Dramatic', gradient: 'linear-gradient(135deg, #444, #111)' },
                    { id: 'film_noir', label: 'Noir', gradient: 'linear-gradient(135deg, #888, #222)' },
                    { id: 'retro', label: 'Retro', gradient: 'linear-gradient(135deg, #a66, #411)' },
                    { id: 'cool', label: 'Cool', gradient: 'linear-gradient(135deg, #6aa, #144)' },
                    { id: 'warm', label: 'Warm', gradient: 'linear-gradient(135deg, #a85, #642)' },
                    { id: 'soft', label: 'Soft', gradient: 'linear-gradient(135deg, #aaa, #777)' },
                    { id: 'vibrant', label: 'Vibrant', gradient: 'linear-gradient(135deg, #ff3b30, #ff8a00)' }
                  ];
                  const activeFilter = filters.find(f => f.id === (selectedClip.filter ?? 'none')) || filters[0];
                  return (
                    <div style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Filter Preset</span>
                      </div>
                      <button
                        onClick={() => setFilterDropdownOpen(v => !v)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          backgroundColor: 'var(--bg-deep)',
                          border: '1px solid ' + (filterDropdownOpen ? '#3b82f6' : 'rgba(255,255,255,0.08)'),
                          borderRadius: '6px',
                          cursor: 'pointer',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '22px', height: '14px', borderRadius: '3px', background: activeFilter.gradient, flexShrink: 0 }} />
                          <span style={{ fontSize: '12px', color: 'var(--text-main)' }}>{activeFilter.label}</span>
                        </div>
                        <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="10" width="10" style={{ transform: filterDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>

                      {filterDropdownOpen && (
                        <>
                          <div onClick={() => setFilterDropdownOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99 }} />
                          <div style={{
                            position: 'absolute', bottom: '105%', left: 0, right: 0,
                            backgroundColor: '#161925',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            zIndex: 100,
                            padding: '8px',
                            boxShadow: '0 12px 32px rgba(0,0,0,0.7)',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '6px'
                          }}>
                            {filters.map(f => {
                              const isActive = (selectedClip.filter ?? 'none') === f.id;
                              return (
                                <button
                                  key={f.id}
                                  onClick={() => { updateField('filter', f.id); setFilterDropdownOpen(false); }}
                                  style={{
                                    padding: '6px 4px',
                                    borderRadius: '5px',
                                    backgroundColor: isActive ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.02)',
                                    border: '1.5px solid ' + (isActive ? '#3b82f6' : 'rgba(255,255,255,0.06)'),
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'all 0.15s'
                                  }}
                                >
                                  <div style={{ width: '100%', height: '22px', borderRadius: '3px', background: f.gradient, position: 'relative' }}>
                                    {isActive && (
                                      <div style={{ position: 'absolute', top: '2px', right: '2px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ width: '6px', height: '6px' }}>
                                          <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  <span style={{ fontSize: '9px', fontWeight: 600, color: isActive ? '#fff' : 'rgba(255,255,255,0.5)' }}>{f.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}

              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 3: AI FEATURES ===================== */}
        {activeTab === 'AI' && isVideo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>AI Lip Sync</span>
                <div style={{ width: '34px', height: '18px', borderRadius: '9px', backgroundColor: 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'not-allowed' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#fff', position: 'absolute', top: '3px', left: '3px' }} />
                </div>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                Automatically synchronize actor mouth movements with the timeline voiceover track.
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>AI Smart Cut</span>
                <button disabled style={{ padding: '4px 8px', fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', cursor: 'not-allowed' }}>
                  Run
                </button>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                Detect and cut silent intervals in the select video track automatically.
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>AI Translation</span>
                <button disabled style={{ padding: '4px 8px', fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', cursor: 'not-allowed' }}>
                  Translate
                </button>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                Translate video audio vocals to alternative languages with voice cloning.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--text-muted)', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              <span>AI options initialized. Ready for scaling.</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
