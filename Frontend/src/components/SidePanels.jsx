import React, { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// API Keys Panel
// ─────────────────────────────────────────────────────────────────────────────
const PROVIDERS = [
  {
    id: 'gemini',
    name: 'Gemini API',
    color: '#4285f4',
    icon: '✦',
    url: 'https://aistudio.google.com/api-keys',
    desc: 'Google Gemini Flash & Pro — Script generation & AI Chat'
  },
  {
    id: 'groq',
    name: 'Groq API',
    color: '#f97316',
    icon: '⚡',
    url: 'https://console.groq.com/keys',
    desc: 'Groq LLaMA — Ultra-fast script generation & AI Chat'
  },
  {
    id: 'pexels',
    name: 'Pexels API',
    color: '#05a081',
    icon: '📷',
    url: 'https://www.pexels.com/api/key/',
    desc: 'Free stock videos & photos — Videos and Images search'
  },
  {
    id: 'pixabay',
    name: 'Pixabay API',
    color: '#c8a000',
    icon: '🎵',
    url: 'https://pixabay.com/api/docs/',
    desc: 'Free stock media — Videos, Images, Music & SFX search'
  }
];

export function APIKeysPanel() {
  const [keys, setKeys] = useState({});
  const [inputs, setInputs] = useState({});
  const [revealed, setRevealed] = useState({});
  const [testing, setTesting] = useState({});
  const [testResult, setTestResult] = useState({});
  const [saving, setSaving] = useState({});

  useEffect(() => {
    // Load masked keys on mount
    fetch('/api/api-keys')
      .then(r => r.json())
      .then(d => setKeys(d.keys || {}))
      .catch(() => {});
  }, []);

  const handleSave = async (provider) => {
    const val = inputs[provider]?.trim();
    if (!val) return;
    setSaving(s => ({ ...s, [provider]: true }));
    try {
      const fd = new FormData();
      fd.append('provider', provider);
      fd.append('key', val);
      await fetch('/api/api-keys', { method: 'POST', body: fd });
      setKeys(k => ({ ...k, [provider]: val.slice(0, 8) + '*'.repeat(Math.max(0, val.length - 8)) }));
      setInputs(i => ({ ...i, [provider]: '' }));
    } finally {
      setSaving(s => ({ ...s, [provider]: false }));
    }
  };

  const handleDelete = async (provider) => {
    if (!confirm(`Delete ${provider} API key?`)) return;
    await fetch(`/api/api-keys/${provider}`, { method: 'DELETE' });
    setKeys(k => { const n = { ...k }; delete n[provider]; return n; });
    setTestResult(t => { const n = { ...t }; delete n[provider]; return n; });
  };

  const handleReveal = async (provider) => {
    if (revealed[provider]) {
      setRevealed(r => ({ ...r, [provider]: null }));
      return;
    }
    const r = await fetch(`/api/api-keys/reveal/${provider}`).then(x => x.json());
    setRevealed(rv => ({ ...rv, [provider]: r.key }));
  };

  const handleTest = async (provider) => {
    setTesting(t => ({ ...t, [provider]: true }));
    setTestResult(t => ({ ...t, [provider]: null }));
    try {
      const fd = new FormData();
      fd.append('provider', provider);
      const res = await fetch('/api/api-keys/test', { method: 'POST', body: fd });
      const d = await res.json();
      setTestResult(t => ({ ...t, [provider]: d.valid ? 'valid' : `invalid: ${d.error || ''}` }));
    } catch (e) {
      setTestResult(t => ({ ...t, [provider]: 'error: ' + e.message }));
    } finally {
      setTesting(t => ({ ...t, [provider]: false }));
    }
  };

  return (
    <div className="api-panel">
      <div className="api-panel-intro">
        <p>Add your API keys to enable AI features. Keys are stored securely on your local machine.</p>
      </div>
      {PROVIDERS.map(p => (
        <div key={p.id} className="api-key-card" style={{ '--card-color': p.color }}>
          <div className="api-card-header">
            <span className="api-card-icon" style={{ background: p.color + '22', color: p.color }}>{p.icon}</span>
            <div>
              <div className="api-card-name">{p.name}</div>
              <div className="api-card-desc">{p.desc}</div>
            </div>
          </div>

          <a href={p.url} target="_blank" rel="noreferrer" className="api-get-link">
            🔗 Get API Key — {p.url.replace('https://', '').split('/')[0]}
          </a>

          {keys[p.id] && (
            <div className="api-key-current">
              <span className="api-key-value">{revealed[p.id] || keys[p.id]}</span>
              <div className="api-key-actions-row">
                <button className="api-action-btn" onClick={() => handleReveal(p.id)} title={revealed[p.id] ? 'Hide' : 'Reveal'}>
                  {revealed[p.id] ? '🙈 Hide' : '👁 Reveal'}
                </button>
                <button className="api-action-btn danger" onClick={() => handleDelete(p.id)}>🗑 Delete</button>
                <button
                  className={`api-action-btn ${testResult[p.id] === 'valid' ? 'success' : testResult[p.id]?.startsWith('invalid') ? 'danger' : ''}`}
                  onClick={() => handleTest(p.id)}
                  disabled={testing[p.id]}
                >
                  {testing[p.id] ? '⏳ Testing...' : testResult[p.id] === 'valid' ? '✅ Valid' : testResult[p.id]?.startsWith('invalid') ? '❌ Invalid' : '🔧 Test'}
                </button>
              </div>
              {testResult[p.id] && testResult[p.id] !== 'valid' && (
                <div className="api-test-error">{testResult[p.id]}</div>
              )}
            </div>
          )}

          <div className="api-input-row">
            <input
              className="api-key-input"
              type="password"
              placeholder={keys[p.id] ? 'Replace key...' : `Paste ${p.name} key here`}
              value={inputs[p.id] || ''}
              onChange={e => setInputs(i => ({ ...i, [p.id]: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(p.id); }}
            />
            <button className="api-save-btn" onClick={() => handleSave(p.id)} disabled={saving[p.id] || !inputs[p.id]}>
              {saving[p.id] ? '...' : '💾 Save'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Script Generator Panel
// ─────────────────────────────────────────────────────────────────────────────
function CustomSelect({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find(o => o.name === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="sp-custom-select-container" ref={ref}>
      <button
        type="button"
        className={`sp-custom-select-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span className="sp-custom-select-val">
          <span className="sp-custom-select-icon">{selected.icon}</span>
          <span>{selected.name}</span>
        </span>
        <span className={`sp-custom-select-chevron ${open ? 'open' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="sp-custom-select-dropdown">
          {options.map((opt) => {
            const isSelected = opt.name === value;
            return (
              <div
                key={opt.name}
                className={`sp-custom-select-item ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  onChange(opt.name);
                  setOpen(false);
                }}
              >
                <span className="sp-custom-select-item-icon">{opt.icon}</span>
                <span className="sp-custom-select-item-name">{opt.name}</span>
                {isSelected && <span className="sp-custom-select-check">✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ScriptPanel({ onScriptGenerated }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [style, setStyle] = useState('Documentary');
  const [customStyle, setCustomStyle] = useState('');
  const [provider, setProvider] = useState('gemini');
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState(null);
  const [error, setError] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);

  const STYLES = [
    { name: 'Documentary', icon: '📽️' },
    { name: 'Explainer', icon: '💡' },
    { name: 'Vlog', icon: '📱' },
    { name: 'Tutorial', icon: '🎓' },
    { name: 'Short-Form', icon: '⚡' },
    { name: 'News Report', icon: '📰' },
    { name: 'Cinematic', icon: '🎬' },
    { name: 'Educational', icon: '📚' },
    { name: 'Custom Style...', icon: '✨' },
  ];

  const handleGenerate = async () => {
    if (!title.trim()) { setError('Video title is required.'); return; }
    const finalStyle = style === 'Custom Style...' ? (customStyle.trim() || 'Custom') : style;
    setError(''); setLoading(true); setScript(null);
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: desc, style: finalStyle, provider })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Script generation failed');
      setScript(data.script);
      if (onScriptGenerated) onScriptGenerated(data.script);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  };

  const copyFullScript = () => {
    if (!script) return;
    const full = script.scenes.map(s =>
      `Scene ${s.scene} [${s.timestamp}]\n${s.script}`
    ).join('\n\n');
    copyText(full, 'full');
  };

  return (
    <div className="script-panel">
      <div className="script-form">
        <div className="sp-field">
          <label className="sp-label">
            <span>🎬 VIDEO TITLE</span>
            <span className="sp-req-star">*</span>
          </label>
          <input 
            className="sp-input" 
            placeholder="e.g. The History of Ancient Rome" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
          />
        </div>

        <div className="sp-field">
          <label className="sp-label">
            <span>📝 STORY / CONTEXT</span>
            <span style={{ fontSize: '9px', opacity: 0.6, fontWeight: 'normal', textTransform: 'lowercase' }}>(optional)</span>
          </label>
          <textarea 
            className="sp-textarea" 
            rows={3} 
            placeholder="Additional context, key points to cover, audience tone..." 
            value={desc} 
            onChange={e => setDesc(e.target.value)} 
          />
        </div>

        <div className="sp-row">
          <div className="sp-field">
            <label className="sp-label">🎭 GENRE / STYLE</label>
            <CustomSelect options={STYLES} value={style} onChange={setStyle} />
            {style === 'Custom Style...' && (
              <input
                className="sp-input"
                style={{ marginTop: '6px' }}
                placeholder="Type custom style (e.g. Sci-Fi Thriller)..."
                value={customStyle}
                onChange={e => setCustomStyle(e.target.value)}
                autoFocus
              />
            )}
          </div>

          <div className="sp-field">
            <label className="sp-label">🤖 AI MODEL</label>
            <div className="sp-model-toggle">
              <button
                type="button"
                className={`sp-model-btn gemini ${provider === 'gemini' ? 'active' : ''}`}
                onClick={() => setProvider('gemini')}
              >
                ✦ Gemini
              </button>
              <button
                type="button"
                className={`sp-model-btn groq ${provider === 'groq' ? 'active' : ''}`}
                onClick={() => setProvider('groq')}
              >
                ⚡ Groq
              </button>
            </div>
          </div>
        </div>

        <button className="sp-generate-btn" onClick={handleGenerate} disabled={loading}>
          {loading ? <><span className="sp-spinner" />Generating Script...</> : '🎬 Generate AI Script'}
        </button>
        {error && <div className="sp-error">⚠️ {error}</div>}
      </div>

      {script && (
        <div className="script-output">
          <div className="script-output-header">
            <span className="script-output-title">{script.title}</span>
            <span className="script-duration">~{script.total_duration_estimate}</span>
            <button className="sp-copy-full-btn" onClick={copyFullScript} title="Copy full script">
              {copiedIdx === 'full' ? '✅ Copied!' : '📋 Copy All'}
            </button>
          </div>

          <div className="script-scenes">
            {(script.scenes || []).map((scene, i) => (
              <div key={i} className="scene-card">
                <div className="scene-card-header">
                  <span className="scene-num">Scene {scene.scene}</span>
                  <span className="scene-timestamp">⏱ {scene.timestamp}</span>
                  <span className="scene-duration">{scene.duration_seconds}s</span>
                  <button className="scene-copy-btn" onClick={() => copyText(scene.script, i)}>
                    {copiedIdx === i ? '✅' : '📋'}
                  </button>
                </div>
                <p className="scene-script">{scene.script}</p>
                <div className="scene-meta-grid">
                  {scene.screen_text && <div className="scene-meta-item"><span className="smi-label">📝 Screen Text</span><span className="smi-val">{scene.screen_text}</span></div>}
                  {scene.stock_query_pexels && <div className="scene-meta-item"><span className="smi-label">🎞 Pexels Query</span><span className="smi-val">{scene.stock_query_pexels}</span></div>}
                  {scene.stock_query_pixabay && <div className="scene-meta-item"><span className="smi-label">📸 Pixabay Query</span><span className="smi-val">{scene.stock_query_pixabay}</span></div>}
                  {scene.voiceover_style && <div className="scene-meta-item"><span className="smi-label">🎙 Voice Style</span><span className="smi-val">{scene.voiceover_style}</span></div>}
                  {scene.background_music && <div className="scene-meta-item"><span className="smi-label">🎵 Music</span><span className="smi-val">{scene.background_music}</span></div>}
                  {scene.sfx && <div className="scene-meta-item"><span className="smi-label">🔊 SFX</span><span className="smi-val">{scene.sfx}</span></div>}
                  {scene.transition && <div className="scene-meta-item"><span className="smi-label">✨ Transition</span><span className="smi-val">{scene.transition}</span></div>}
                </div>
              </div>
            ))}
          </div>

          {script.hashtags?.length > 0 && (
            <div className="script-hashtags">
              <div className="script-section-label">Hashtags</div>
              <div className="hashtags-row">
                {script.hashtags.map((h, i) => (
                  <span key={i} className="hashtag-chip">{h}</span>
                ))}
                <button className="sp-copy-btn" onClick={() => copyText(script.hashtags.join(' '), 'hashtags')}>
                  {copiedIdx === 'hashtags' ? '✅' : '📋'}
                </button>
              </div>
            </div>
          )}

          {script.thumbnail_prompt && (
            <div className="script-thumbnail-prompt">
              <div className="script-section-label">🖼 Thumbnail Prompt</div>
              <p className="thumbnail-text">{script.thumbnail_prompt}</p>
              <button className="sp-copy-btn" onClick={() => copyText(script.thumbnail_prompt, 'thumb')}>
                {copiedIdx === 'thumb' ? '✅ Copied' : '📋 Copy Prompt'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Voice Over Panel
// ─────────────────────────────────────────────────────────────────────────────
export function VoiceOverPanel({ onFileUploaded }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewId, setPreviewId] = useState(null);
  const [error, setError] = useState('');
  const audioRef = useRef(null);
  const dropRef = useRef(null);

  const loadFiles = () => {
    fetch('/api/folder-scan?path=' + encodeURIComponent('Media Library/Voice Over') + '&types=mp3,wav')
      .then(r => r.json())
      .then(d => setFiles(d.files || []))
      .catch(() => {});
  };

  useEffect(() => { loadFiles(); }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'mp3' && ext !== 'wav') {
      setError('Invalid file format. Only MP3 and WAV are supported for Voice Over.');
      return;
    }
    setError('');
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload/voiceover', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.status === 'success') {
        loadFiles();
        if (onFileUploaded) onFileUploaded(data);
      }
    } catch (err) {
      setError('Upload failed. Please check connection or file size.');
    } finally { setUploading(false); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleUpload(f);
  };

  const togglePreview = (file) => {
    if (previewId === file.path) {
      audioRef.current?.pause();
      setPreviewId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(encodeURI('/' + file.path.replace(/\\/g, '/')));
      audioRef.current.play().catch(() => {});
      setPreviewId(file.path);
      audioRef.current.onended = () => setPreviewId(null);
    }
  };

  return (
    <div className="vo-panel">
      <div
        ref={dropRef}
        className={`vo-dropzone ${uploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => {
          const inp = document.createElement('input');
          inp.type = 'file';
          inp.accept = '.mp3,.wav';
          inp.onchange = e => handleUpload(e.target.files[0]);
          inp.click();
        }}
      >
        {uploading ? (
          <div className="vo-spinner-wrapper">
            <div className="premium-loading-circle" />
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#a855f7' }}>Uploading Voice Over...</span>
          </div>
        ) : (
          <>
            <div className="vo-upload-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </div>
            <span className="vo-drop-text">Drop MP3/WAV or click to browse</span>
            <span className="vo-drop-hint">Saved to: Media Library / Voice Over</span>
          </>
        )}
      </div>

      {error && (
        <div className="premium-error-banner">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="vo-files-list">
          <div className="vo-files-header">Voice Over Files ({files.length})</div>
          {files.map((f, i) => (
            <div key={i} className="vo-file-row">
              <button className="vo-play-btn" onClick={() => togglePreview(f)}>
                {previewId === f.path ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="4" y="4" width="16" height="16" />
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>
              <div className="vo-file-info">
                <span className="vo-file-name" title={f.name}>{f.name}</span>
                <span className="vo-file-size">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export function TranscribePanel({ addAssetToTimeline, onSendToAI }) {
  const [file, setFile] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      const ext = selected.name.split('.').pop().toLowerCase();
      if (!['mp3', 'mp4', 'mov', 'avi'].includes(ext)) {
        setFile(null);
        setError('Invalid file format. Only MP3, MP4, MOV, and AVI are supported for Transcription.');
        setResult(null);
      } else {
        setFile(selected);
        setResult(null);
        setError('');
      }
    }
  };

  const handleTranscribe = async () => {
    if (!file) return;
    setTranscribing(true); setError(''); setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/transcribe', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Transcription failed');
      setResult(data);
    } catch (e) { setError(e.message); }
    finally { setTranscribing(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result?.full_text || '').then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = async (format) => {
    if (!result) return;
    const fd = new FormData();
    fd.append('segments_json', JSON.stringify(result.segments));
    fd.append('full_text', result.full_text || '');
    fd.append('format', format);
    fd.append('filename', (file?.name || 'transcript').replace(/\.[^.]+$/, ''));
    const res = await fetch('/api/transcribe/download', { method: 'POST', body: fd });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `transcript.${format}`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleTurnToCaptions = () => {
    if (!result || !addAssetToTimeline) return;
    result.segments.forEach((seg, idx) => {
      addAssetToTimeline({
        filename: `caption_${idx}`, text: seg.text,
        start: seg.start, duration: Math.max(0.5, seg.end - seg.start)
      }, 'caption');
    });
  };

  const AI_ACTIONS = [
    'Turn Transcript Into Script', 'Summarize', 'Rewrite', 'Translate',
    'Convert to YouTube Script', 'Generate SEO Title', 'Generate Description'
  ];

  return (
    <div className="transcribe-panel">
      <div className="tp-file-section">
        <div className="tp-supported">Supported: MP3, MP4, MOV, AVI</div>
        <label className="tp-file-label">
          <input type="file" accept=".mp3,.mp4,.mov,.avi" onChange={handleFileChange} style={{ display: 'none' }} />
          <div className="tp-file-picker">
            {file ? (
              <>
                <div className="tp-file-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                </div>
                <span className="tp-file-text">{file.name}</span>
                <span className="tp-file-hint">{(file.size / 1024 / 1024).toFixed(1)} MB · Ready to transcribe</span>
              </>
            ) : (
              <>
                <div className="tp-file-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span className="tp-file-text">Select File to Transcribe</span>
                <span className="tp-file-hint">Click to choose from folder</span>
              </>
            )}
          </div>
        </label>

        {error && (
          <div className="premium-error-banner">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {file && !transcribing && (
          <button className="tp-transcribe-btn" onClick={handleTranscribe}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}>
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
            </svg>
            Generate Transcript
          </button>
        )}

        {transcribing && (
          <div className="tp-spinner-wrapper" style={{ marginTop: '16px' }}>
            <div className="premium-loading-circle" />
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#a855f7' }}>Transcribing Media Audio...</span>
          </div>
        )}
      </div>

      {result && (
        <div className="tp-result">
          <div className="tp-result-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Transcript Ready</span>
            </div>
            <span className="tp-seg-count">{result.segments.length} segments</span>
          </div>
          <div className="tp-text-box">
            {result.segments.map((s, i) => (
              <div key={i} className="tp-seg-row">
                <span className="tp-seg-time">{s.start.toFixed(1)}s</span>
                <span className="tp-seg-text">{s.text}</span>
              </div>
            ))}
          </div>

          <div className="tp-actions-row">
            <button className="tp-action-btn" onClick={handleCopy}>{copied ? '✅' : '📋 Copy'}</button>
            <button className="tp-action-btn" onClick={() => handleDownload('txt')}>TXT</button>
            <button className="tp-action-btn" onClick={() => handleDownload('srt')}>SRT</button>
            <button className="tp-action-btn" onClick={() => handleDownload('vtt')}>VTT</button>
          </div>

          <button className="tp-captions-btn" onClick={handleTurnToCaptions}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Turn Transcript into Captions
          </button>

          <div className="tp-send-to-ai">
            <div className="tp-send-label">Send to AI Chat Director</div>
            <div className="tp-ai-actions-grid">
              {AI_ACTIONS.map(act => (
                <button
                  key={act}
                  className="tp-ai-action-btn"
                  onClick={() => onSendToAI && onSendToAI(act, result.full_text)}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// AI Chat Director Panel
// ─────────────────────────────────────────────────────────────────────────────
export function AIChatPanel({ scriptData, project, addAssetToTimeline, pushHistory, prefillMsg, onPrefillConsumed }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your **AI Video Director**.\n\nWhat I can do:\n• Add/remove/edit any timeline element\n• Search Pexels videos and images\n• Search Pixabay videos, images, music, and SFX\n• Add background music from local library\n• Add sound effects from local library\n• Generate scripts with AI\n• Create full videos from scratch\n\nJust tell me what you want!`,
      actions: []
    }
  ]);
  const [input, setInput] = useState('');
  const [provider, setProvider] = useState('gemini');
  const [sending, setSending] = useState(false);
  const [actionLog, setActionLog] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Auto-fill from Transcribe "Send to AI" action
  useEffect(() => {
    if (prefillMsg && prefillMsg.trim()) {
      setInput(prefillMsg);
      if (onPrefillConsumed) onPrefillConsumed();
    }
  }, [prefillMsg]);

  const parseActions = (reply) => {
    const match = reply.match(/```json\s*([\s\S]*?)\s*```/);
    if (!match) return [];
    try {
      const parsed = JSON.parse(match[1]);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch { return []; }
  };

  const executeActions = async (actions) => {
    const logs = [];
    for (const act of actions) {
      if (act.action === 'search_pexels') {
        logs.push(`[Pexels] Searching "${act.query}"...`);
        setActionLog(l => [...l, `[Pexels] Searching Pexels: "${act.query}"…`]);
        try {
          const res = await fetch(`/api/search/pexels?query=${encodeURIComponent(act.query)}&media_type=${act.type || 'videos'}&per_page=${act.count || 3}`);
          const data = await res.json();
          if (data.results?.[0]) {
            const item = data.results[0];
            addAssetToTimeline?.({
              filename: `pexels_${act.query.replace(/\s/g, '_')}`,
              path: item.url,
              type: item.type
            }, item.type === 'video' ? 'video' : 'image');
            setActionLog(l => [...l, `✅ Added video clip.`]);
            setMessages(m => [...m, { role: 'system', content: `Searching for video... Added video clip.`, isAction: true }]);
          }
        } catch (e) { setActionLog(l => [...l, `❌ Pexels error: ${e.message}`]); }
      } else if (act.action === 'search_pixabay') {
        setActionLog(l => [...l, `[Pixabay] Searching "${act.query}" (${act.type})…`]);
        try {
          const res = await fetch(`/api/search/pixabay?query=${encodeURIComponent(act.query)}&media_type=${act.type || 'film'}&per_page=${act.count || 3}`);
          const data = await res.json();
          if (data.results?.[0]) {
            const item = data.results[0];
            const ttype = act.type === 'film' ? 'video' : act.type === 'photo' ? 'image' : 'music';
            addAssetToTimeline?.({ filename: `pixabay_${act.query.replace(/\s/g, '_')}`, path: item.url, type: item.type }, ttype);
            setActionLog(l => [...l, `✅ Added ${act.type} clip.`]);
          }
        } catch (e) { setActionLog(l => [...l, `❌ Pixabay error: ${e.message}`]); }
      } else if (act.action === 'add_text') {
        addAssetToTimeline?.({ filename: 'ai_text', text: act.text }, 'text');
        setActionLog(l => [...l, `✅ Added text: "${act.text}"`]);
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const userMsg = { role: 'user', content: input };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setSending(true);
    try {
      const scriptCtx = scriptData ? `Script: ${scriptData.title} (${scriptData.scenes?.length || 0} scenes)` : '';
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages.filter(m => !m.isAction), userMsg].map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
          provider,
          script_context: scriptCtx
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'AI chat failed');
      const reply = data.reply || '';
      const actions = parseActions(reply);
      const displayReply = reply.replace(/```json[\s\S]*?```/g, '').trim();
      setMessages(m => [...m, { role: 'assistant', content: displayReply, actions }]);
      if (actions.length > 0) await executeActions(actions);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: `⚠️ Error: ${e.message}` }]);
    } finally { setSending(false); }
  };

  const QUICK_ACTIONS = [
    {
      id: 'ocean',
      icon: '🌊',
      title: 'Add Ocean Waves Video',
      prompt: 'Add a video clip of ocean waves',
      desc: 'Auto-search & add background video clip'
    },
    {
      id: 'music',
      icon: '🎵',
      title: 'Cinematic BGM Track',
      prompt: 'Add background music: cinematic epic',
      desc: 'Add epic background music to timeline'
    },
    {
      id: 'text',
      icon: '✍️',
      title: 'Add Chapter Title Text',
      prompt: 'Add screen text: "Chapter 1"',
      desc: 'Insert stylized screen title clip'
    },
    {
      id: 'sfx',
      icon: '🔊',
      title: 'Nature Sound Effect',
      prompt: 'Search Pixabay for nature SFX',
      desc: 'Search & place ambient sound effect'
    }
  ];

  const renderFormattedContent = (content) => {
    if (!content) return null;
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');
      
      if (isBullet) {
        const cleanText = trimmed.replace(/^[•\-]\s*/, '');
        const parts = cleanText.split(/(\*\*.*?\*\*)/g);
        return (
          <div key={idx} className="chat-bullet-row">
            <span className="chat-bullet-spark">✦</span>
            <span className="chat-bullet-text">
              {parts.map((p, pIdx) => {
                if (p.startsWith('**') && p.endsWith('**')) {
                  return <strong key={pIdx} className="chat-bold-highlight">{p.slice(2, -2)}</strong>;
                }
                return p;
              })}
            </span>
          </div>
        );
      }

      if (trimmed === '') {
        return <div key={idx} className="chat-spacer" />;
      }

      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={idx} className="chat-text-line">
          {parts.map((p, pIdx) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return <strong key={pIdx} className="chat-bold-highlight">{p.slice(2, -2)}</strong>;
            }
            return p;
          })}
        </div>
      );
    });
  };

  return (
    <div className="chat-panel">
      {/* ── Model Selector Header ── */}
      <div className="chat-model-selector-card">
        <div className="chat-model-selector-header">
          <span className="chat-model-title-label">CHOOSE AI MODEL</span>
          <span className="chat-model-status-badge">
            <span className="chat-pulse-dot" />
            {provider === 'gemini' ? 'Gemini 1.5 Active' : 'Groq LLaMA Active'}
          </span>
        </div>
        <div className="chat-model-buttons-grid">
          <button
            className={`chat-model-card-btn gemini ${provider === 'gemini' ? 'active' : ''}`}
            onClick={() => setProvider('gemini')}
          >
            <span className="chat-model-icon">✦</span>
            <div className="chat-model-info">
              <span className="chat-model-name">Gemini 1.5</span>
              <span className="chat-model-tag">Google AI</span>
            </div>
            {provider === 'gemini' && <span className="chat-model-check">✓</span>}
          </button>

          <button
            className={`chat-model-card-btn groq ${provider === 'groq' ? 'active' : ''}`}
            onClick={() => setProvider('groq')}
          >
            <span className="chat-model-icon">⚡</span>
            <div className="chat-model-info">
              <span className="chat-model-name">Groq LLaMA</span>
              <span className="chat-model-tag">Ultra Fast</span>
            </div>
            {provider === 'groq' && <span className="chat-model-check">✓</span>}
          </button>
        </div>
      </div>

      {scriptData && (
        <div className="chat-script-context">
          <span className="chat-context-icon">🎬</span>
          <span className="chat-context-text">{scriptData.title} — {scriptData.scenes?.length || 0} scenes</span>
        </div>
      )}

      {/* ── Chat Messages ── */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role} ${msg.isAction ? 'action-msg' : ''}`}>
            {msg.role === 'assistant' && !msg.isAction && (
              <div className="chat-avatar">AI</div>
            )}
            <div className="chat-bubble">
              {msg.isAction
                ? <span className="chat-action-text">• {msg.content}</span>
                : renderFormattedContent(msg.content)
              }
            </div>
          </div>
        ))}
        {sending && (
          <div className="chat-msg assistant">
            <div className="chat-avatar">AI</div>
            <div className="chat-bubble"><div className="chat-typing"><span/><span/><span/></div></div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* ── Quick Direct Action Cards ── */}
      {messages.length <= 1 && (
        <div className="chat-quick-section">
          <div className="chat-quick-section-title">
            <span>⚡ QUICK DIRECT ACTIONS</span>
          </div>
          <div className="chat-quick-cards-grid">
            {QUICK_ACTIONS.map((item) => (
              <div
                key={item.id}
                className="chat-quick-action-card"
                onClick={() => setInput(item.prompt)}
              >
                <div className="chat-quick-content">
                  <div className="chat-quick-title">{item.title}</div>
                  <div className="chat-quick-desc">{item.desc}</div>
                </div>
                <div className="chat-quick-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Input Bar ── */}
      <div className="chat-input-wrapper">
        <input
          className="chat-input"
          placeholder="Ask AI Director to edit, search, or arrange..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
        />
        <button className="chat-send-btn" onClick={sendMessage} disabled={sending || !input.trim()}>
          <span>Send</span>
          <span className="chat-send-icon">✨</span>
        </button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// AI Video Arranger Panel
// ─────────────────────────────────────────────────────────────────────────────
export function ArrangerPanel({ scriptData, project, setProject, pushHistory, uuidv4, addAssetToTimeline }) {
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState([]);
  const [done, setDone] = useState(false);
  const [provider, setProvider] = useState('gemini');

  const addStep = (text, status = 'running') => {
    setSteps(s => [...s, { text, status, time: Date.now() }]);
  };

  const updateLastStep = (status) => {
    setSteps(s => s.map((st, i) => i === s.length - 1 ? { ...st, status } : st));
  };

  const handleGenerate = async () => {
    if (!scriptData) { alert('Please generate a script first in the Script panel.'); return; }
    if (!project) { alert('Please open a project first.'); return; }
    setRunning(true); setSteps([]); setDone(false);

    pushHistory?.(project.tracks);
    let newTracks = { video1: [], video2: [], text1: [], text2: [], audio1: [], audio2: [] };

    let cursor = 0;
    addStep('🎬 Starting AI Video Arrangement...');
    await delay(400); updateLastStep('done');

    for (const scene of (scriptData.scenes || [])) {
      addStep(`Scene ${scene.scene}: Searching Pexels "${scene.stock_query_pexels}"...`);
      // Search Pexels for video
      try {
        const res = await fetch(`/api/search/pexels?query=${encodeURIComponent(scene.stock_query_pexels || scene.script.slice(0, 30))}&media_type=videos&per_page=1`);
        const data = await res.json();
        if (data.results?.[0]) {
          const vid = data.results[0];
          const dur = scene.duration_seconds || 15;
          newTracks.video1.push({
              id: `arr_v_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
            track: 'video1', path: vid.url, filename: `scene${scene.scene}_video.mp4`,
            start: cursor, duration: dur, originalDuration: dur, sourceStart: 0,
            x: 50, y: 50, scale: 1.0, fitMode: 'cover', speed: 1.0, volume: 100, opacity: 1.0
          });
          updateLastStep('done');
        } else { updateLastStep('skip'); }
      } catch { updateLastStep('error'); }

      // Add screen text
      if (scene.screen_text) {
        addStep(`Scene ${scene.scene}: Adding screen text...`);
        const dur = scene.duration_seconds || 15;
        newTracks.text1.push({
          id: `arr_t_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
          track: 'text1', text: scene.screen_text,
          start: cursor, duration: Math.min(dur, 5), originalDuration: 5,
          x: 50, y: 85, fontSize: 28, fontFamily: 'Inter', fontWeight: 'Bold',
          color: '#ffffff', highlightColor: '#ffd21f', stylePreset: 'highlight_box',
          scale: 1.0, opacity: 1.0
        });
        updateLastStep('done');
      }

      // Search SFX from Pixabay
      if (scene.sfx) {
        addStep(`Scene ${scene.scene}: Searching SFX "${scene.sfx}"...`);
        try {
          const res = await fetch(`/api/search/pixabay?query=${encodeURIComponent(scene.sfx)}&media_type=sound&per_page=1`);
          const data = await res.json();
          if (data.results?.[0]) {
            const sfx = data.results[0];
            const dur = scene.duration_seconds || 15;
            newTracks.audio2.push({
              id: `arr_sfx_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
              track: 'audio2', path: sfx.url, filename: `scene${scene.scene}_sfx`,
              start: cursor, duration: Math.min(sfx.duration || 5, dur), originalDuration: sfx.duration || 5,
              volume: 60, speed: 1.0, fadeIn: 0.5, fadeOut: 0.5
            });
            updateLastStep('done');
          } else { updateLastStep('skip'); }
        } catch { updateLastStep('error'); }
      }

      // Search BGM from Pixabay
      if (scene.background_music && newTracks.audio2.filter(c => c.filename?.includes('music')).length === 0) {
        addStep(`Scene 1: Searching background music...`);
        try {
          const res = await fetch(`/api/search/pixabay?query=${encodeURIComponent(scene.background_music)}&media_type=music&per_page=1`);
          const data = await res.json();
          if (data.results?.[0]) {
            const mus = data.results[0];
            newTracks.audio2.push({
              id: `arr_mus_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
              track: 'audio2', path: mus.url, filename: `bgm_music`,
              start: 0, duration: scriptData.scenes.reduce((a, s) => a + (s.duration_seconds || 15), 0),
              originalDuration: mus.duration || 120,
              volume: 25, speed: 1.0, fadeIn: 2.0, fadeOut: 3.0
            });
            updateLastStep('done');
          } else { updateLastStep('skip'); }
        } catch { updateLastStep('error'); }
      }

      cursor += scene.duration_seconds || 15;
    }

    addStep('💬 Captions will be generated after voice-over is added.');
    await delay(300); updateLastStep('done');

    addStep('✅ AI Arrangement complete! Timeline populated.');
    await delay(200); updateLastStep('done');

    setProject(prev => ({
      ...prev,
      duration: Math.max(prev.duration, cursor + 5),
      tracks: { ...prev.tracks, ...newTracks }
    }));
    setRunning(false);
    setDone(true);
  };

  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  const stepIcon = (status) => {
    if (status === 'done') return '✅';
    if (status === 'error') return '❌';
    if (status === 'skip') return '⏭';
    return '⏳';
  };

  return (
    <div className="arranger-panel">
      <div className="arranger-form-card">
        <div className="arranger-header-block">
          <div className="arranger-title-row">
            <span className="arranger-title-icon">🚀</span>
            <span className="arranger-title-text">AI Video Arranger</span>
          </div>
          <p className="arranger-desc-text">
            Auto-assemble footage, background music & SFX onto your timeline matching script storyboards.
          </p>
        </div>

        <div className="arranger-model-section">
          <label className="sp-label">🤖 CHOOSE AI MODEL</label>
          <div className="arranger-model-toggle">
            <button
              type="button"
              className={`arr-model-btn gemini ${provider === 'gemini' ? 'active' : ''}`}
              onClick={() => setProvider('gemini')}
            >
              ✦ Gemini 1.5
            </button>
            <button
              type="button"
              className={`arr-model-btn groq ${provider === 'groq' ? 'active' : ''}`}
              onClick={() => setProvider('groq')}
            >
              ⚡ Groq LLaMA
            </button>
          </div>
        </div>

        {scriptData ? (
          <div className="arranger-script-card">
            <div className="arranger-script-card-header">
              <span className="arranger-script-icon">📜</span>
              <div className="arranger-script-info">
                <div className="arranger-script-title">{scriptData.title}</div>
                <div className="arranger-script-meta">
                  <span className="arranger-meta-badge">{scriptData.scenes?.length || 0} Scenes</span>
                  <span className="arranger-meta-dot">•</span>
                  <span>~{scriptData.total_duration_estimate || '2 mins'} estimated</span>
                </div>
              </div>
            </div>
            {scriptData.scenes && scriptData.scenes.length > 0 && (
              <div className="arranger-scene-chips">
                {scriptData.scenes.slice(0, 4).map((s, idx) => (
                  <span key={idx} className="arranger-scene-chip">
                    Scene {s.scene} ({s.duration_seconds || 15}s)
                  </span>
                ))}
                {scriptData.scenes.length > 4 && (
                  <span className="arranger-scene-chip more">+{scriptData.scenes.length - 4} more</span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="arranger-no-script">
            <span className="arr-no-script-icon">⚠️</span>
            <div className="arr-no-script-text">
              <strong>No Active Script Found</strong>
              <span>Generate a video script in the <strong>Script panel</strong> first to auto-arrange clips.</span>
            </div>
          </div>
        )}

        <button
          className={`arranger-generate-btn ${running ? 'running' : ''}`}
          onClick={handleGenerate}
          disabled={running || !scriptData}
        >
          {running ? (
            <>
              <span className="sp-spinner" style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: '6px' }} />
              Assembling Timeline Tracks...
            </>
          ) : (
            '🚀 Generate AI Arrangement Plan'
          )}
        </button>
      </div>

      {steps.length > 0 && (
        <div className="arranger-steps">
          <div className="arranger-steps-title">⚡ Timeline Assembly Log</div>
          {steps.map((step, i) => (
            <div key={i} className={`arranger-step ${step.status}`}>
              <span className="arr-step-icon">{stepIcon(step.status)}</span>
              <span className="arr-step-text">{step.text}</span>
            </div>
          ))}
        </div>
      )}

      {done && (
        <div className="arranger-done-msg">
          🎉 All clips added to timeline! Review and fine-tune your project in the timeline.
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Assets Panel
// ─────────────────────────────────────────────────────────────────────────────
export function AssetsPanel({ addAssetToTimeline, library }) {
  const [search, setSearch] = useState('');
  const [expandedFolder, setExpandedFolder] = useState(null);
  const [folderFiles, setFolderFiles] = useState({});
  const [loading, setLoading] = useState({});

  const FOLDERS = [
    { name: 'Avatar Videos', types: 'mp4,mov,avi,webm', trackType: 'video' },
    { name: 'Background Music', types: 'mp3,wav,ogg,aac', trackType: 'music' },
    { name: 'Downloaded Audios', types: 'mp3,wav,ogg', trackType: 'music' },
    { name: 'Downloaded Clips', types: 'mp4,mov,avi,webm', trackType: 'video' },
    { name: 'Downloaded Images', types: 'jpg,jpeg,png,webp,gif', trackType: 'image' },
    { name: 'Images', types: 'jpg,jpeg,png,webp,gif,bmp', trackType: 'image' },
    { name: 'Sound Effects SFX', types: 'mp3,wav', trackType: 'music' },
    { name: 'Stock Videos', types: 'mp4,mov,avi,webm', trackType: 'video' },
    { name: 'Templates', types: 'json', trackType: null },
    { name: 'Transcribed Files', types: 'mp3,wav,mp4,mov', trackType: null },
    { name: 'Voice Over', types: 'mp3,wav', trackType: 'voiceover' }
  ];

  const loadFolder = async (folderName, types) => {
    setLoading(l => ({ ...l, [folderName]: true }));
    try {
      const path = encodeURIComponent(`Media Library/${folderName}`);
      const res = await fetch(`/api/folder-scan?path=${path}&types=${types}`);
      const data = await res.json();
      setFolderFiles(f => ({ ...f, [folderName]: data.files || [] }));
    } catch { setFolderFiles(f => ({ ...f, [folderName]: [] })); }
    finally { setLoading(l => ({ ...l, [folderName]: false })); }
  };

  const toggleFolder = (folder) => {
    if (expandedFolder === folder.name) {
      setExpandedFolder(null);
    } else {
      setExpandedFolder(folder.name);
      if (!folderFiles[folder.name]) loadFolder(folder.name, folder.types);
    }
  };

  const isAudio = (f) => /\.(mp3|wav|ogg|aac|flac)$/i.test(f.name);
  const isImage = (f) => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f.name);
  const isVideo = (f) => /\.(mp4|mov|avi|webm|mkv)$/i.test(f.name);

  const allFiles = FOLDERS.flatMap(folder => (folderFiles[folder.name] || []).map(f => ({ ...f, folder: folder.name, trackType: folder.trackType })));
  const filtered = search ? allFiles.filter(f => f.name.toLowerCase().includes(search.toLowerCase())) : [];

  const getFileIcon = (f) => {
    if (isVideo(f)) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
      );
    }
    if (isImage(f)) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      );
    }
    if (isAudio(f)) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    }
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
  };

  return (
    <div className="assets-panel">
      <div className="assets-search-row">
        <input
          className="assets-search"
          placeholder="Search files by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {search && (
        <div className="assets-search-results">
          <div className="assets-results-label" style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
            {filtered.length} results found
          </div>
          {filtered.length === 0 && <div className="assets-empty">No matching files found</div>}
          {filtered.map((f, i) => (
            <div key={i} className="asset-file-row" onClick={() => f.trackType && addAssetToTimeline({ filename: f.name, path: f.path }, f.trackType)}>
              <span className="asset-file-icon">{getFileIcon(f)}</span>
              <span className="asset-file-name" title={f.name}>{f.name}</span>
              <span className="asset-file-folder">{f.folder}</span>
              {f.trackType && (
                <button className="asset-row-add-btn" title="Add to timeline" onClick={(e) => { e.stopPropagation(); addAssetToTimeline({ filename: f.name, path: f.path }, f.trackType); }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!search && (
        <div className="assets-folders">
          {FOLDERS.map(folder => {
            const isExpanded = expandedFolder === folder.name;
            return (
              <div key={folder.name} className={`assets-folder-section ${isExpanded ? 'active-folder' : ''}`}>
                <button
                  className={`assets-folder-btn ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => toggleFolder(folder)}
                >
                  <span className="folder-icon-svg">
                    {isExpanded ? (
                      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                    ) : (
                      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                    )}
                  </span>
                  <span className="folder-name">{folder.name}</span>
                  {folderFiles[folder.name] && (
                    <span className="folder-count">{folderFiles[folder.name].length}</span>
                  )}
                  <span className="folder-chevron">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>

                {isExpanded && (
                  <div className="assets-folder-files">
                    {loading[folder.name] && (
                      <div className="assets-loading">
                        <span className="sp-spinner" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid rgba(168, 85, 247, 0.3)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: '6px', verticalAlign: 'middle' }} />
                        Scanning folder contents...
                      </div>
                    )}
                    {!loading[folder.name] && (folderFiles[folder.name] || []).length === 0 && (
                      <div className="assets-empty">📂 No files found in this folder</div>
                    )}
                    {(folderFiles[folder.name] || []).map((f, i) => {
                      const formattedSize = f.size > 1024 * 1024 
                        ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` 
                        : `${Math.round(f.size / 1024)} KB`;
                      return (
                        <div key={i} className="asset-file-row" onClick={() => folder.trackType && addAssetToTimeline({ filename: f.name, path: f.path }, folder.trackType)}>
                          <span className="asset-file-icon">{getFileIcon(f)}</span>
                          <span className="asset-file-name" title={f.name}>{f.name}</span>
                          {f.size > 0 && <span className="asset-file-size">{formattedSize}</span>}
                          {folder.trackType && (
                            <button className="asset-row-add-btn" title="Add to timeline" onClick={(e) => { e.stopPropagation(); addAssetToTimeline({ filename: f.name, path: f.path }, folder.trackType); }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// AudioDuration Component for file durations
// ─────────────────────────────────────────────────────────────────────────────
function AudioDuration({ path }) {
  const [duration, setDuration] = useState('');
  useEffect(() => {
    if (!path) return;
    const audio = new Audio(path);
    const handleLoaded = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration.toFixed(1) + 's');
      }
    };
    audio.addEventListener('loadedmetadata', handleLoaded);
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoaded);
    };
  }, [path]);

  return <span className="sfx-result-source" style={{ opacity: 0.5, fontSize: '10px' }}>{duration || 'Loading...'}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sound Effects SFX Panel
// ─────────────────────────────────────────────────────────────────────────────
export function SFXPanel({ addAssetToTimeline, refreshKey }) {
  const [section, setSection] = useState('local');
  const [localFolderPath, setLocalFolderPath] = useState(() => localStorage.getItem('sfx_folder_path') || '');
  const [folderDisplayName, setFolderDisplayName] = useState(() => localStorage.getItem('sfx_folder_display') || 'No Folder Selected');
  const [localFiles, setLocalFiles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sfx_files') || '[]');
    } catch {
      return [];
    }
  });
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [browsingFolder, setBrowsingFolder] = useState(false);

  const [searchKeywords, setSearchKeywords] = useState(() => localStorage.getItem('sfx_search_keywords') || '');
  const [searchLimit, setSearchLimit] = useState(() => parseInt(localStorage.getItem('sfx_search_limit') || '5'));
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sfx_search_results') || '[]');
    } catch {
      return [];
    }
  });
  const [previewId, setPreviewId] = useState(null);
  const audioRef = useRef(null);

  // Scan folder if localFolderPath changes
  useEffect(() => {
    if (localFolderPath) {
      scanFolder(localFolderPath);
    }
  }, [localFolderPath, refreshKey]);

  // Persist search keywords/limit/results
  useEffect(() => {
    localStorage.setItem('sfx_search_keywords', searchKeywords);
  }, [searchKeywords]);

  useEffect(() => {
    localStorage.setItem('sfx_search_results', JSON.stringify(searchResults));
  }, [searchResults]);

  useEffect(() => {
    localStorage.setItem('sfx_search_limit', searchLimit.toString());
  }, [searchLimit]);

  const toAudioUrl = (p) => encodeURI('/' + p.replace(/\\/g, '/'));

  const scanFolder = async (folderPath) => {
    if (!folderPath.trim()) return;
    setLoadingLocal(true);
    try {
      const res = await fetch(`/api/folder-scan?path=${encodeURIComponent(folderPath)}&types=mp3,wav`);
      const data = await res.json();
      const files = data.files || [];
      setLocalFiles(files);
      localStorage.setItem('sfx_files', JSON.stringify(files));
    } finally { setLoadingLocal(false); }
  };

  const browseLocalFolder = async () => {
    if (browsingFolder) return;
    setBrowsingFolder(true);
    try {
      const res = await fetch('/api/select-folder', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'ok' && data.path) {
        setLocalFolderPath(data.path);
        const parts = data.path.replace(/\\/g, '/').split('/');
        const displayName = parts[parts.length - 1] || data.path;
        setFolderDisplayName(displayName);
        localStorage.setItem('sfx_folder_path', data.path);
        localStorage.setItem('sfx_folder_display', displayName);
        scanFolder(data.path);
      }
    } catch (e) {
      console.error('Failed to select folder', e);
    } finally {
      setBrowsingFolder(false);
    }
  };

  const handleSearch = async () => {
    const keywords = searchKeywords.split('\n').map(k => k.trim()).filter(Boolean);
    if (!keywords.length) return;
    setSearching(true); setSearchResults([]);
    const all = [];
    for (const kw of keywords) {
      try {
        const res = await fetch(`/api/search/pixabay?query=${encodeURIComponent(kw)}&media_type=sound&per_page=${searchLimit}`);
        const data = await res.json();
        all.push(...(data.results || []).map(r => ({ ...r, keyword: kw, source: 'Pixabay' })));
      } catch {}
    }
    setSearchResults(all);
    setSearching(false);
  };

  const togglePreview = (url, id) => {
    if (previewId === id) {
      audioRef.current?.pause();
      setPreviewId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(url);
      audioRef.current.play().catch(() => {});
      setPreviewId(id);
      audioRef.current.onended = () => setPreviewId(null);
    }
  };

  return (
    <div className="media-panel">
      {/* Premium Tab Row */}
      <div className="vp-tab-row">
        <button className={`vp-tab ${section === 'local' ? 'active' : ''}`} onClick={() => setSection('local')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          Local
        </button>
        <button className={`vp-tab ${section === 'search' ? 'active' : ''}`} onClick={() => setSection('search')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search
        </button>
      </div>

      {/* LOCAL TAB */}
      {section === 'local' && (
        <div className="vp-local-section">
          {/* Premium Folder Chooser */}
          <button
            className={`vp-folder-btn ${browsingFolder ? 'loading' : ''}`}
            onClick={browseLocalFolder}
            disabled={browsingFolder}
            title="Choose folder to scan sound effects"
          >
            <div className="vp-folder-btn-icon">
              {browsingFolder ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="vp-spin">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  <line x1="12" y1="11" x2="12" y2="17" />
                  <line x1="9" y1="14" x2="15" y2="14" />
                </svg>
              )}
            </div>
            <div className="vp-folder-btn-text">
              <span className="vp-folder-btn-label">
                {browsingFolder ? 'Opening...' : 'Choose Folder'}
              </span>
              <span className="vp-folder-btn-sub">
                {folderDisplayName}
              </span>
            </div>
            <div className="vp-folder-btn-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>

          {/* Files List */}
          <div className="sfx-files-list">
            {loadingLocal && (
              <div className="vp-loading">
                <div className="vp-loading-spinner" />
                <span>Loading sound effects...</span>
              </div>
            )}
            {!loadingLocal && localFiles.length === 0 && (
              <div className="vp-empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
                <span>No sound effects found.<br/>Choose a folder above.</span>
              </div>
            )}
            {localFiles.map((f, i) => {
              const fileUrl = toAudioUrl(f.path);
              return (
                <div key={i} className="sfx-file-row">
                  <button className="sfx-play-btn" onClick={() => togglePreview(fileUrl, f.path)}>
                    {previewId === f.path ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="4" y="4" width="4" height="16" />
                        <rect x="16" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '1px' }}>
                        <polygon points="5 3 19 12 5 21" />
                      </svg>
                    )}
                  </button>
                  <div className="sfx-result-info">
                    <span className="sfx-file-name" title={f.name}>{f.name}</span>
                    <AudioDuration path={fileUrl} />
                  </div>
                  <button
                    className="sfx-add-btn"
                    onClick={() => addAssetToTimeline({ filename: f.name, path: f.path }, 'music')}
                    title="Add to Timeline"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SEARCH TAB */}
      {section === 'search' && (
        <div className="vp-search-section">
          <div className="vp-search-header">
            <div className="vp-search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <div>
              <div className="vp-search-title">Search Sound Effects</div>
              <div className="vp-search-subtitle">Royalty Free SFX Assets</div>
            </div>
          </div>

          <div className="vp-search-input-wrap">
            <svg className="vp-search-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <textarea
              className="vp-search-keywords"
              rows={3}
              placeholder={`gunshot\nexplosion\nocean waves`}
              value={searchKeywords}
              onChange={e => setSearchKeywords(e.target.value)}
            />
          </div>

          {/* Premium Search Settings (Active Services + Limit) */}
          <div className="vp-search-options">
            <div className="vp-option-group">
              <span className="vp-option-label">Active Service</span>
              <div className="vp-services-row">
                <button type="button" className="vp-service-toggle active">
                  <span className="vp-toggle-dot" />
                  Pixabay
                </button>
              </div>
            </div>

            <div className="vp-option-group">
              <div className="vp-slider-header">
                <span className="vp-option-label">Search Limit (0 - 10)</span>
                <span className="vp-slider-val">{searchLimit}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={searchLimit}
                onChange={e => setSearchLimit(parseInt(e.target.value))}
                className="vp-premium-slider"
                style={{ '--val': `${searchLimit * 10}%` }}
              />
            </div>
          </div>

          <button
            className={`vp-collect-btn ${searching ? 'loading' : ''}`}
            onClick={handleSearch}
            disabled={searching}
          >
            {searching ? (
              <>
                <div className="vp-btn-spinner" />
                Searching...
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Collect SFX Assets
              </>
            )}
          </button>

          {searchResults.length > 0 && (
            <div className="vp-search-results">
              <div className="vp-results-count">{searchResults.length} results found</div>
              <div className="sfx-files-list">
                {searchResults.map((r, i) => (
                  <div key={i} className="sfx-file-row">
                    <button className="sfx-play-btn" onClick={() => togglePreview(r.url, r.id)}>
                      {previewId === r.id ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="4" y="4" width="4" height="16" />
                          <rect x="16" y="4" width="4" height="16" />
                        </svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '1px' }}>
                          <polygon points="5 3 19 12 5 21" />
                        </svg>
                      )}
                    </button>
                    <div className="sfx-result-info">
                      <span className="sfx-file-name" title={r.title || r.keyword}>{r.title || r.keyword}</span>
                      <span className="sfx-result-source">Pixabay · {r.duration}s</span>
                    </div>
                    <button
                      className="sfx-add-btn"
                      onClick={() => addAssetToTimeline({ filename: r.title || r.keyword, path: r.url }, 'music')}
                      title="Add to Timeline"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Video Panel — Local + Avatar + Search
// ─────────────────────────────────────────────────────────────────────────────
export function VideoPanel({ addAssetToTimeline, toUrlPath, refreshKey }) {
  const [section, setSection] = useState('local');
  const [localFolderPath, setLocalFolderPath] = useState(() => localStorage.getItem('vp_folder_path') || '');
  const [folderDisplayName, setFolderDisplayName] = useState(() => localStorage.getItem('vp_folder_display') || 'No Folder Selected');
  const [localFiles, setLocalFiles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vp_files') || '[]');
    } catch {
      return [];
    }
  });
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [searchKeywords, setSearchKeywords] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [browsingFolder, setBrowsingFolder] = useState(false);

  // Search options
  const [sources, setSources] = useState({ pexels: true, pixabay: true });
  const [searchLimit, setSearchLimit] = useState(5);

  // Avatar state
  const [avatarFile, setAvatarFile] = useState(null);

  // Scan folder if localFolderPath changes
  useEffect(() => {
    if (localFolderPath) {
      scanFolder(localFolderPath);
    }
  }, [localFolderPath, refreshKey]);

  const scanFolder = async (folderPath) => {
    if (!folderPath.trim()) return;
    setLoadingLocal(true);
    try {
      const res = await fetch(`/api/folder-scan?path=${encodeURIComponent(folderPath)}&types=mp4`);
      const data = await res.json();
      const files = data.files || [];
      setLocalFiles(files);
      localStorage.setItem('vp_files', JSON.stringify(files));
    } finally { setLoadingLocal(false); }
  };

  const browseLocalFolder = async () => {
    if (browsingFolder) return;
    setBrowsingFolder(true);
    try {
      const res = await fetch('/api/select-folder', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'ok' && data.path) {
        setLocalFolderPath(data.path);
        const parts = data.path.replace(/\\/g, '/').split('/');
        const displayName = parts[parts.length - 1] || data.path;
        setFolderDisplayName(displayName);
        localStorage.setItem('vp_folder_path', data.path);
        localStorage.setItem('vp_folder_display', displayName);
        scanFolder(data.path);
      }
    } catch (e) {
      console.error('Failed to select folder', e);
    } finally {
      setBrowsingFolder(false);
    }
  };

  const handleAvatarSelect = (e) => {
    const f = e.target.files[0];
    if (f) setAvatarFile(f);
  };

  const handleSearch = async () => {
    const keywords = searchKeywords.split('\n').map(k => k.trim()).filter(Boolean);
    if (!keywords.length) return;
    if (!sources.pexels && !sources.pixabay) {
      alert("Please select at least one active service.");
      return;
    }
    setSearching(true); setSearchResults([]);
    const all = [];
    for (const kw of keywords) {
      if (sources.pexels) {
        try {
          const res = await fetch(`/api/search/pexels?query=${encodeURIComponent(kw)}&media_type=videos&per_page=${searchLimit}`);
          const data = await res.json();
          all.push(...(data.results || []).map(r => ({ ...r, keyword: kw, source: 'Pexels' })));
        } catch {}
      }
      if (sources.pixabay) {
        try {
          const res = await fetch(`/api/search/pixabay?query=${encodeURIComponent(kw)}&media_type=film&per_page=${searchLimit}`);
          const data = await res.json();
          all.push(...(data.results || []).map(r => ({ ...r, keyword: kw, source: 'Pixabay' })));
        } catch {}
      }
    }
    setSearchResults(all);
    setSearching(false);
  };

  return (
    <div className="media-panel">
      {/* Premium Tab Row */}
      <div className="vp-tab-row">
        <button className={`vp-tab ${section === 'local' ? 'active' : ''}`} onClick={() => setSection('local')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          Local
        </button>
        <button className={`vp-tab ${section === 'avatar' ? 'active' : ''}`} onClick={() => setSection('avatar')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Avatar
        </button>
        <button className={`vp-tab ${section === 'search' ? 'active' : ''}`} onClick={() => setSection('search')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search
        </button>
      </div>

      {/* LOCAL TAB */}
      {section === 'local' && (
        <div className="vp-local-section">
          {/* Premium Folder Chooser */}
          <button
            className={`vp-folder-btn ${browsingFolder ? 'loading' : ''}`}
            onClick={browseLocalFolder}
            disabled={browsingFolder}
            title="Choose a folder to load MP4 videos"
          >
            <div className="vp-folder-btn-icon">
              {browsingFolder ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="vp-spin">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  <line x1="12" y1="11" x2="12" y2="17" />
                  <line x1="9" y1="14" x2="15" y2="14" />
                </svg>
              )}
            </div>
            <div className="vp-folder-btn-text">
              <span className="vp-folder-btn-label">
                {browsingFolder ? 'Opening...' : 'Choose Folder'}
              </span>
              <span className="vp-folder-btn-sub">
                {folderDisplayName}
              </span>
            </div>
            <div className="vp-folder-btn-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>

          {/* Video Grid */}
          <div className="media-grid">
            {loadingLocal && (
              <div className="vp-loading">
                <div className="vp-loading-spinner" />
                <span>Loading videos...</span>
              </div>
            )}
            {!loadingLocal && localFiles.length === 0 && (
              <div className="vp-empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                  <line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                </svg>
                <span>No MP4 files found.<br/>Choose a folder above.</span>
              </div>
            )}
            {localFiles.map((f, i) => (
              <div
                key={i}
                className="media-card vp-video-card"
                onClick={() => addAssetToTimeline({ filename: f.name, path: f.path }, 'video')}
                title={f.name}
              >
                <video
                  src={toUrlPath(f.path) + '#t=1'}
                  muted
                  preload="metadata"
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', background: '#000' }}
                  onMouseEnter={e => { e.currentTarget.src = toUrlPath(f.path); e.currentTarget.play().catch(() => {}); }}
                  onMouseLeave={e => { e.currentTarget.pause(); e.currentTarget.src = toUrlPath(f.path) + '#t=1'; }}
                />
                <div className="vp-card-overlay">
                  <div className="vp-play-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AVATAR TAB */}
      {section === 'avatar' && (
        <div className="vp-avatar-section">
          <div className="vp-avatar-header">
            <div className="vp-avatar-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <div className="vp-avatar-title">Choose Avatar Video</div>
              <div className="vp-avatar-subtitle">Sync avatar with voiceover audio</div>
            </div>
          </div>

          <label className="vp-avatar-pick-label">
            <input type="file" accept=".mp4,.mov,.avi,.webm" onChange={handleAvatarSelect} style={{ display: 'none' }} />
            <div className="vp-avatar-pick-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>{avatarFile ? `Change File (${avatarFile.name})` : 'Select Avatar Video File'}</span>
            </div>
          </label>

          {avatarFile && (
            <div className="vp-avatar-preview-wrap">
              <video src={URL.createObjectURL(avatarFile)} controls className="vp-avatar-preview-video" />
              <button 
                className="vp-avatar-add-btn" 
                onClick={() => addAssetToTimeline({ filename: avatarFile.name, path: URL.createObjectURL(avatarFile) }, 'video')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Add to Timeline</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* SEARCH TAB — Premium Clean UI */}
      {section === 'search' && (
        <div className="vp-search-section">
          <div className="vp-search-header">
            <div className="vp-search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <div>
              <div className="vp-search-title">Search Stock Videos</div>
              <div className="vp-search-subtitle">Royalty Free Video Assets</div>
            </div>
          </div>

          <div className="vp-search-input-wrap">
            <svg className="vp-search-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <textarea
              className="vp-search-keywords"
              rows={3}
              placeholder={`ocean waves\nsunset sky\ncity traffic`}
              value={searchKeywords}
              onChange={e => setSearchKeywords(e.target.value)}
            />
          </div>

          {/* Premium Search Settings (Active Services + Limit) */}
          <div className="vp-search-options">
            <div className="vp-option-group">
              <span className="vp-option-label">Active Service</span>
              <div className="vp-services-row">
                <button
                  type="button"
                  className={`vp-service-toggle ${sources.pexels ? 'active' : ''}`}
                  onClick={() => setSources(s => ({ ...s, pexels: !s.pexels }))}
                >
                  <span className="vp-toggle-dot" />
                  Pexels
                </button>
                <button
                  type="button"
                  className={`vp-service-toggle ${sources.pixabay ? 'active' : ''}`}
                  onClick={() => setSources(s => ({ ...s, pixabay: !s.pixabay }))}
                >
                  <span className="vp-toggle-dot" />
                  Pixabay
                </button>
              </div>
            </div>

            <div className="vp-option-group">
              <div className="vp-slider-header">
                <span className="vp-option-label">Search Limit (0 - 10)</span>
                <span className="vp-slider-val">{searchLimit}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={searchLimit}
                onChange={e => setSearchLimit(parseInt(e.target.value))}
                className="vp-premium-slider"
                style={{ '--val': `${searchLimit * 10}%` }}
              />
            </div>
          </div>

          <button
            className={`vp-collect-btn ${searching ? 'loading' : ''}`}
            onClick={handleSearch}
            disabled={searching}
          >
            {searching ? (
              <>
                <div className="vp-btn-spinner" />
                Searching...
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Collect Media Assets
              </>
            )}
          </button>

          {searchResults.length > 0 && (
            <div className="vp-search-results">
              <div className="vp-results-count">{searchResults.length} results found</div>
              <div className="media-grid">
                {searchResults.map((r, i) => (
                  <div
                    key={i}
                    className="media-card vp-result-card"
                    onClick={() => addAssetToTimeline({ filename: r.keyword + '_video', path: r.url }, 'video')}
                    title={`${r.keyword} · ${r.source}`}
                  >
                    {r.thumb ? (
                      <img src={r.thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '22px' }}>🎬</div>
                    )}
                    <div className="vp-card-overlay">
                      <div className="vp-play-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                    </div>
                    <div className="media-card-label" style={{ fontSize: '8px' }}>{r.source} · {r.duration}s</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}



// ─────────────────────────────────────────────────────────────────────────────
// Images Panel with 2 Sections
// ─────────────────────────────────────────────────────────────────────────────
export function ImagesPanel({ addAssetToTimeline, refreshKey }) {
  const [section, setSection] = useState('local');
  const [localFolderPath, setLocalFolderPath] = useState(() => localStorage.getItem('image_folder_path') || '');
  const [folderDisplayName, setFolderDisplayName] = useState(() => localStorage.getItem('image_folder_display') || 'No Folder Selected');
  const [localFiles, setLocalFiles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('image_files') || '[]');
    } catch {
      return [];
    }
  });
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [browsingFolder, setBrowsingFolder] = useState(false);

  const [searchKeywords, setSearchKeywords] = useState(() => localStorage.getItem('image_search_keywords') || '');
  const [sources, setSources] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('image_search_sources') || '{"pexels":true,"pixabay":true}');
    } catch {
      return { pexels: true, pixabay: true };
    }
  });
  const [searchLimit, setSearchLimit] = useState(() => parseInt(localStorage.getItem('image_search_limit') || '5'));
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('image_search_results') || '[]');
    } catch {
      return [];
    }
  });

  // Scan folder if localFolderPath changes
  useEffect(() => {
    if (localFolderPath) {
      scanFolder(localFolderPath);
    }
  }, [localFolderPath, refreshKey]);

  // Persist search state
  useEffect(() => {
    localStorage.setItem('image_search_keywords', searchKeywords);
  }, [searchKeywords]);

  useEffect(() => {
    localStorage.setItem('image_search_sources', JSON.stringify(sources));
  }, [sources]);

  useEffect(() => {
    localStorage.setItem('image_search_results', JSON.stringify(searchResults));
  }, [searchResults]);

  useEffect(() => {
    localStorage.setItem('image_search_limit', searchLimit.toString());
  }, [searchLimit]);

  const toUrlPath = (p) => {
    if (!p) return '';
    if (typeof p === 'string' && (p.startsWith('blob:') || p.startsWith('data:') || p.startsWith('http://') || p.startsWith('https://'))) {
      return p;
    }
    const cleanPath = p.replace(/\\/g, '/');
    const backendOrigin = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : 'http://localhost:8000';
    return `${backendOrigin}/api/serve-media?path=${encodeURIComponent(cleanPath)}`;
  };

  const scanFolder = async (folderPath) => {
    if (!folderPath.trim()) return;
    setLoadingLocal(true);
    try {
      const res = await fetch(`/api/folder-scan?path=${encodeURIComponent(folderPath)}&types=jpg,jpeg,png,webp,gif,bmp`);
      const data = await res.json();
      const files = data.files || [];
      setLocalFiles(files);
      localStorage.setItem('image_files', JSON.stringify(files));
    } finally { setLoadingLocal(false); }
  };

  const browseLocalFolder = async () => {
    if (browsingFolder) return;
    setBrowsingFolder(true);
    try {
      const res = await fetch('/api/select-folder', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'ok' && data.path) {
        setLocalFolderPath(data.path);
        const parts = data.path.replace(/\\/g, '/').split('/');
        const displayName = parts[parts.length - 1] || data.path;
        setFolderDisplayName(displayName);
        localStorage.setItem('image_folder_path', data.path);
        localStorage.setItem('image_folder_display', displayName);
        scanFolder(data.path);
      }
    } catch (e) {
      console.error('Failed to select folder', e);
    } finally {
      setBrowsingFolder(false);
    }
  };

  const handleSearch = async () => {
    const keywords = searchKeywords.split('\n').map(k => k.trim()).filter(Boolean);
    if (!keywords.length) return;
    if (!sources.pexels && !sources.pixabay) {
      alert("Please select at least one active service.");
      return;
    }
    setSearching(true); setSearchResults([]);
    const all = [];
    for (const kw of keywords) {
      if (sources.pexels) {
        try {
          const res = await fetch(`/api/search/pexels?query=${encodeURIComponent(kw)}&media_type=photos&per_page=${searchLimit}`);
          const data = await res.json();
          all.push(...(data.results || []).map(r => ({ ...r, keyword: kw, source: 'Pexels' })));
        } catch {}
      }
      if (sources.pixabay) {
        try {
          const res = await fetch(`/api/search/pixabay?query=${encodeURIComponent(kw)}&media_type=photo&per_page=${searchLimit}`);
          const data = await res.json();
          all.push(...(data.results || []).map(r => ({ ...r, keyword: kw, source: 'Pixabay' })));
        } catch {}
      }
    }
    setSearchResults(all);
    setSearching(false);
  };

  return (
    <div className="media-panel">
      {/* Premium Tab Row */}
      <div className="vp-tab-row">
        <button className={`vp-tab ${section === 'local' ? 'active' : ''}`} onClick={() => setSection('local')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          Local
        </button>
        <button className={`vp-tab ${section === 'search' ? 'active' : ''}`} onClick={() => setSection('search')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search
        </button>
      </div>

      {/* LOCAL TAB */}
      {section === 'local' && (
        <div className="vp-local-section">
          {/* Premium Folder Chooser */}
          <button
            className={`vp-folder-btn ${browsingFolder ? 'loading' : ''}`}
            onClick={browseLocalFolder}
            disabled={browsingFolder}
            title="Choose folder to scan images"
          >
            <div className="vp-folder-btn-icon">
              {browsingFolder ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="vp-spin">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  <line x1="12" y1="11" x2="12" y2="17" />
                  <line x1="9" y1="14" x2="15" y2="14" />
                </svg>
              )}
            </div>
            <div className="vp-folder-btn-text">
              <span className="vp-folder-btn-label">
                {browsingFolder ? 'Opening...' : 'Choose Folder'}
              </span>
              <span className="vp-folder-btn-sub">
                {folderDisplayName}
              </span>
            </div>
            <div className="vp-folder-btn-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>

          {/* Grid Layout */}
          <div className="media-grid">
            {loadingLocal && (
              <div className="vp-loading">
                <div className="vp-loading-spinner" />
                <span>Loading images...</span>
              </div>
            )}
            {!loadingLocal && localFiles.length === 0 && (
              <div className="vp-empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>No images found.<br/>Choose a folder above.</span>
              </div>
            )}
            {localFiles.map((f, i) => (
              <div
                key={i}
                className="media-card"
                onClick={() => addAssetToTimeline({ filename: f.name, path: f.path }, 'image')}
                title={f.name}
              >
                <img src={toUrlPath(f.path)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div className="vp-card-overlay">
                  <div className="vp-play-icon" style={{ background: 'rgba(0, 132, 255, 0.85)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                </div>
                <div className="media-card-label" style={{ fontSize: '8.5px' }}>{f.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH TAB */}
      {section === 'search' && (
        <div className="vp-search-section">
          <div className="vp-search-header">
            <div className="vp-search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div>
              <div className="vp-search-title">Search Stock Images</div>
              <div className="vp-search-subtitle">Royalty Free Image Assets</div>
            </div>
          </div>

          <div className="vp-search-input-wrap">
            <svg className="vp-search-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <textarea
              className="vp-search-keywords"
              rows={3}
              placeholder={`beautiful flowers\nmountain landscape\noffice desk`}
              value={searchKeywords}
              onChange={e => setSearchKeywords(e.target.value)}
            />
          </div>

          {/* Premium Search Settings (Active Services + Limit) */}
          <div className="vp-search-options">
            <div className="vp-option-group">
              <span className="vp-option-label">Active Services</span>
              <div className="vp-services-row">
                <button
                  type="button"
                  className={`vp-service-toggle ${sources.pexels ? 'active' : ''}`}
                  onClick={() => setSources(s => ({ ...s, pexels: !s.pexels }))}
                >
                  <span className="vp-toggle-dot" />
                  Pexels
                </button>
                <button
                  type="button"
                  className={`vp-service-toggle ${sources.pixabay ? 'active' : ''}`}
                  onClick={() => setSources(s => ({ ...s, pixabay: !s.pixabay }))}
                >
                  <span className="vp-toggle-dot" />
                  Pixabay
                </button>
              </div>
            </div>

            <div className="vp-option-group">
              <div className="vp-slider-header">
                <span className="vp-option-label">Search Limit (0 - 10)</span>
                <span className="vp-slider-val">{searchLimit}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={searchLimit}
                onChange={e => setSearchLimit(parseInt(e.target.value))}
                className="vp-premium-slider"
                style={{ '--val': `${searchLimit * 10}%` }}
              />
            </div>
          </div>

          <button
            className={`vp-collect-btn ${searching ? 'loading' : ''}`}
            onClick={handleSearch}
            disabled={searching}
          >
            {searching ? (
              <>
                <div className="vp-btn-spinner" />
                Searching...
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Collect Images Assets
              </>
            )}
          </button>

          {searchResults.length > 0 && (
            <div className="vp-search-results">
              <div className="vp-results-count">{searchResults.length} results found</div>
              <div className="media-grid">
                {searchResults.map((r, i) => (
                  <div
                    key={i}
                    className="media-card vp-result-card"
                    onClick={() => addAssetToTimeline({ filename: r.keyword + '_image', path: r.url }, 'image')}
                    title={`${r.keyword} · ${r.source}`}
                  >
                    {r.preview_url || r.thumb ? (
                      <img src={r.preview_url || r.thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '22px' }}>📷</div>
                    )}
                    <div className="vp-card-overlay">
                      <div className="vp-play-icon" style={{ background: 'rgba(0, 132, 255, 0.85)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </div>
                    </div>
                    <div className="media-card-label" style={{ fontSize: '8px' }}>{r.source}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Audio Panel with 2 Sections
// ─────────────────────────────────────────────────────────────────────────────
export function AudioPanel({ addAssetToTimeline, refreshKey }) {
  const [section, setSection] = useState('local');
  const [localFolderPath, setLocalFolderPath] = useState(() => localStorage.getItem('audio_folder_path') || '');
  const [folderDisplayName, setFolderDisplayName] = useState(() => localStorage.getItem('audio_folder_display') || 'No Folder Selected');
  const [localFiles, setLocalFiles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('audio_files') || '[]');
    } catch {
      return [];
    }
  });
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [browsingFolder, setBrowsingFolder] = useState(false);

  const [searchKeywords, setSearchKeywords] = useState(() => localStorage.getItem('audio_search_keywords') || '');
  const [searchLimit, setSearchLimit] = useState(() => parseInt(localStorage.getItem('audio_search_limit') || '5'));
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('audio_search_results') || '[]');
    } catch {
      return [];
    }
  });
  const [previewId, setPreviewId] = useState(null);
  const audioRef = useRef(null);

  // Scan folder if localFolderPath changes
  useEffect(() => {
    if (localFolderPath) {
      scanFolder(localFolderPath);
    }
  }, [localFolderPath, refreshKey]);

  // Persist search state
  useEffect(() => {
    localStorage.setItem('audio_search_keywords', searchKeywords);
  }, [searchKeywords]);

  useEffect(() => {
    localStorage.setItem('audio_search_results', JSON.stringify(searchResults));
  }, [searchResults]);

  useEffect(() => {
    localStorage.setItem('audio_search_limit', searchLimit.toString());
  }, [searchLimit]);

  const toAudioUrl = (p) => encodeURI('/' + p.replace(/\\/g, '/'));

  const scanFolder = async (folderPath) => {
    if (!folderPath.trim()) return;
    setLoadingLocal(true);
    try {
      const res = await fetch(`/api/folder-scan?path=${encodeURIComponent(folderPath)}&types=mp3,wav,ogg,aac`);
      const data = await res.json();
      const files = data.files || [];
      setLocalFiles(files);
      localStorage.setItem('audio_files', JSON.stringify(files));
    } finally { setLoadingLocal(false); }
  };

  const browseLocalFolder = async () => {
    if (browsingFolder) return;
    setBrowsingFolder(true);
    try {
      const res = await fetch('/api/select-folder', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'ok' && data.path) {
        setLocalFolderPath(data.path);
        const parts = data.path.replace(/\\/g, '/').split('/');
        const displayName = parts[parts.length - 1] || data.path;
        setFolderDisplayName(displayName);
        localStorage.setItem('audio_folder_path', data.path);
        localStorage.setItem('audio_folder_display', displayName);
        scanFolder(data.path);
      }
    } catch (e) {
      console.error('Failed to select folder', e);
    } finally {
      setBrowsingFolder(false);
    }
  };

  const handleSearch = async () => {
    const keywords = searchKeywords.split('\n').map(k => k.trim()).filter(Boolean);
    if (!keywords.length) return;
    setSearching(true); setSearchResults([]);
    const all = [];
    for (const kw of keywords) {
      try {
        const res = await fetch(`/api/search/pixabay?query=${encodeURIComponent(kw)}&media_type=music&per_page=${searchLimit}`);
        const data = await res.json();
        all.push(...(data.results || []).map(r => ({ ...r, keyword: kw, source: 'Pixabay' })));
      } catch {}
    }
    setSearchResults(all);
    setSearching(false);
  };

  const togglePreview = (url, id) => {
    if (previewId === id) {
      audioRef.current?.pause();
      setPreviewId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(url);
      audioRef.current.play().catch(() => {});
      setPreviewId(id);
      audioRef.current.onended = () => setPreviewId(null);
    }
  };

  return (
    <div className="media-panel">
      {/* Premium Tab Row */}
      <div className="vp-tab-row">
        <button className={`vp-tab ${section === 'local' ? 'active' : ''}`} onClick={() => setSection('local')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          Local
        </button>
        <button className={`vp-tab ${section === 'search' ? 'active' : ''}`} onClick={() => setSection('search')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search
        </button>
      </div>

      {/* LOCAL TAB */}
      {section === 'local' && (
        <div className="vp-local-section">
          {/* Premium Folder Chooser */}
          <button
            className={`vp-folder-btn ${browsingFolder ? 'loading' : ''}`}
            onClick={browseLocalFolder}
            disabled={browsingFolder}
            title="Choose folder to scan background music"
          >
            <div className="vp-folder-btn-icon">
              {browsingFolder ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="vp-spin">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  <line x1="12" y1="11" x2="12" y2="17" />
                  <line x1="9" y1="14" x2="15" y2="14" />
                </svg>
              )}
            </div>
            <div className="vp-folder-btn-text">
              <span className="vp-folder-btn-label">
                {browsingFolder ? 'Opening...' : 'Choose Folder'}
              </span>
              <span className="vp-folder-btn-sub">
                {folderDisplayName}
              </span>
            </div>
            <div className="vp-folder-btn-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>

          {/* Files List */}
          <div className="sfx-files-list">
            {loadingLocal && (
              <div className="vp-loading">
                <div className="vp-loading-spinner" />
                <span>Loading background music...</span>
              </div>
            )}
            {!loadingLocal && localFiles.length === 0 && (
              <div className="vp-empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
                <span>No background music files found.<br/>Choose a folder above.</span>
              </div>
            )}
            {localFiles.map((f, i) => {
              const fileUrl = toAudioUrl(f.path);
              return (
                <div key={i} className="sfx-file-row">
                  <button className="sfx-play-btn" onClick={() => togglePreview(fileUrl, f.path)}>
                    {previewId === f.path ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="4" y="4" width="4" height="16" />
                        <rect x="16" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '1px' }}>
                        <polygon points="5 3 19 12 5 21" />
                      </svg>
                    )}
                  </button>
                  <div className="sfx-result-info">
                    <span className="sfx-file-name" title={f.name}>{f.name}</span>
                    <AudioDuration path={fileUrl} />
                  </div>
                  <button
                    className="sfx-add-btn"
                    onClick={() => addAssetToTimeline({ filename: f.name, path: f.path }, 'music')}
                    title="Add to Timeline"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SEARCH TAB */}
      {section === 'search' && (
        <div className="vp-search-section">
          <div className="vp-search-header">
            <div className="vp-search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <div>
              <div className="vp-search-title">Search Background Music</div>
              <div className="vp-search-subtitle">Royalty Free Background Music Assets</div>
            </div>
          </div>

          <div className="vp-search-input-wrap">
            <svg className="vp-search-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <textarea
              className="vp-search-keywords"
              rows={3}
              placeholder={`happy cinematic\ninspirational piano\nlofi beats`}
              value={searchKeywords}
              onChange={e => setSearchKeywords(e.target.value)}
            />
          </div>

          {/* Premium Search Settings (Active Services + Limit) */}
          <div className="vp-search-options">
            <div className="vp-option-group">
              <span className="vp-option-label">Active Service</span>
              <div className="vp-services-row">
                <button type="button" className="vp-service-toggle active">
                  <span className="vp-toggle-dot" />
                  Pixabay
                </button>
              </div>
            </div>

            <div className="vp-option-group">
              <div className="vp-slider-header">
                <span className="vp-option-label">Search Limit (0 - 10)</span>
                <span className="vp-slider-val">{searchLimit}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={searchLimit}
                onChange={e => setSearchLimit(parseInt(e.target.value))}
                className="vp-premium-slider"
                style={{ '--val': `${searchLimit * 10}%` }}
              />
            </div>
          </div>

          <button
            className={`vp-collect-btn ${searching ? 'loading' : ''}`}
            onClick={handleSearch}
            disabled={searching}
          >
            {searching ? (
              <>
                <div className="vp-btn-spinner" />
                Searching...
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Collect Background Music Assets
              </>
            )}
          </button>

          {searchResults.length > 0 && (
            <div className="vp-search-results">
              <div className="vp-results-count">{searchResults.length} results found</div>
              <div className="sfx-files-list">
                {searchResults.map((r, i) => (
                  <div key={i} className="sfx-file-row">
                    <button className="sfx-play-btn" onClick={() => togglePreview(r.url, r.id)}>
                      {previewId === r.id ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="4" y="4" width="4" height="16" />
                          <rect x="16" y="4" width="4" height="16" />
                        </svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '1px' }}>
                          <polygon points="5 3 19 12 5 21" />
                        </svg>
                      )}
                    </button>
                    <div className="sfx-result-info">
                      <span className="sfx-file-name" title={r.title || r.keyword}>{r.title || r.keyword}</span>
                      <span className="sfx-result-source">Pixabay · {r.duration}s</span>
                    </div>
                    <button
                      className="sfx-add-btn"
                      onClick={() => addAssetToTimeline({ filename: r.title || r.keyword, path: r.url }, 'music')}
                      title="Add to Timeline"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
