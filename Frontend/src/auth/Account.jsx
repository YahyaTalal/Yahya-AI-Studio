import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getAccount, updateDisplayName, deleteAccount } from '../api';

function formatBytes(n) {
  if (!n || n <= 0) return '0 B';
  if (n >= 1024 * 1024 * 1024) return (n / 1024 / 1024 / 1024).toFixed(2) + ' GB';
  if (n >= 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + ' MB';
  return Math.round(n / 1024) + ' KB';
}

/**
 * Account page — rendered as a modal overlay on top of the editor.
 * Works in both auth modes; password change / account deletion are only
 * available in Supabase mode (no real auth exists in local bypass mode).
 */
export default function Account({ onClose }) {
  const { user, isBypass, signOut, updatePassword } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [name, setName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState('');

  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await getAccount();
        if (!cancelled) {
          setProfile(d);
          setName(d.display_name || '');
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e.message || 'Could not load account info.');
          // Fall back to auth-user info so the page still shows something.
          setProfile({ email: user?.email || '', display_name: '', storage_used_bytes: 0, storage_quota_bytes: 0 });
          setName('');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const handleSaveName = async () => {
    setNameMsg('');
    const trimmed = name.trim();
    setSavingName(true);
    try {
      const updated = await updateDisplayName(trimmed);
      setProfile((p) => ({ ...p, display_name: updated.display_name ?? trimmed }));
      setNameMsg('✅ Saved');
    } catch (e) {
      setNameMsg('⚠️ ' + (e.message || 'Could not save.'));
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    setPassMsg('');
    if (newPass.length < 6) { setPassMsg('⚠️ Password must be at least 6 characters.'); return; }
    setSavingPass(true);
    try {
      await updatePassword(newPass);
      setNewPass('');
      setPassMsg('✅ Password updated');
    } catch (e) {
      setPassMsg('⚠️ ' + (e.message || 'Could not update password.'));
    } finally {
      setSavingPass(false);
    }
  };

  const handleDelete = async () => {
    setDeleteError('');
    setDeleting(true);
    try {
      await deleteAccount();
      await signOut();
      onClose();
    } catch (e) {
      setDeleteError(e.message || 'Could not delete account.');
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  const used = profile?.storage_used_bytes || 0;
  const quota = profile?.storage_quota_bytes || 0;
  const pct = quota > 0 ? Math.min(100, (used / quota) * 100) : 0;

  return (
    <div className="account-overlay" onClick={onClose}>
      <div className="account-card" onClick={(e) => e.stopPropagation()}>
        <div className="account-header">
          <div className="account-title">👤 Account</div>
          <button className="account-close" onClick={onClose} title="Close">✕</button>
        </div>

        {loading ? (
          <div className="account-loading"><div className="vp-loading-spinner" /><span>Loading account…</span></div>
        ) : (
          <>
            {loadError && <div className="auth-error" style={{ marginBottom: '12px' }}>⚠️ {loadError}</div>}

            <div className="account-row">
              <div className="account-label">Email</div>
              <div className="account-value">{profile?.email || user?.email || '—'}</div>
            </div>

            <div className="account-row">
              <div className="account-label">Display name</div>
              <div className="account-name-edit">
                <input
                  className="auth-input"
                  placeholder="Your display name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); }}
                />
                <button className="account-save-btn" onClick={handleSaveName} disabled={savingName}>
                  {savingName ? '…' : 'Save'}
                </button>
              </div>
              {nameMsg && <div className="account-note">{nameMsg}</div>}
            </div>

            <div className="account-row">
              <div className="account-label">Storage</div>
              <div className="storage-bar-wrap">
                <div className="storage-bar">
                  <div className="storage-bar-fill" style={{ width: pct + '%' }} />
                </div>
                <div className="storage-text">
                  {formatBytes(used)}{quota > 0 ? ` of ${formatBytes(quota)} used` : ' used'}
                </div>
              </div>
            </div>

            {!isBypass && (
              <div className="account-row">
                <div className="account-label">Change password</div>
                <div className="account-name-edit">
                  <input
                    className="auth-input"
                    type="password"
                    placeholder="New password (min 6 characters)"
                    autoComplete="new-password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleChangePassword(); }}
                  />
                  <button className="account-save-btn" onClick={handleChangePassword} disabled={savingPass}>
                    {savingPass ? '…' : 'Update'}
                  </button>
                </div>
                {passMsg && <div className="account-note">{passMsg}</div>}
              </div>
            )}
            {isBypass && (
              <div className="account-note">Running in local mode — no online account or password to manage.</div>
            )}

            <div className="account-actions">
              {!isBypass && (
                <button className="account-btn secondary" onClick={signOut}>
                  🚪 Log out
                </button>
              )}
              {!isBypass && !confirmingDelete && (
                <button className="account-btn danger" onClick={() => setConfirmingDelete(true)}>
                  🗑 Delete account
                </button>
              )}
            </div>

            {confirmingDelete && (
              <div className="account-delete-confirm">
                <div className="account-delete-text">
                  Permanently delete your account, all projects, media and API keys?
                  This cannot be undone.
                </div>
                {deleteError && <div className="auth-error">⚠️ {deleteError}</div>}
                <div className="account-delete-btns">
                  <button className="account-btn secondary" onClick={() => setConfirmingDelete(false)} disabled={deleting}>
                    Cancel
                  </button>
                  <button className="account-btn danger" onClick={handleDelete} disabled={deleting}>
                    {deleting ? 'Deleting…' : 'Yes, delete everything'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
