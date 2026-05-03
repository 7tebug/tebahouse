'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  Upload,
  Trash2,
  Music2,
  Image as ImageIcon,
  Loader2,
  X,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  Save,
} from 'lucide-react';
import { getSupabaseClient, ADMIN_EMAIL, BEATS_BUCKET } from '@/lib/supabase';

function bytesToHuman(b) {
  if (!b && b !== 0) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export default function AdminPage() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginErr, setLoginErr] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [beats, setBeats] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const initialUpload = {
    title: '',
    genre: '',
    bpm: '',
    price: '',
    cover: null,
    audio: null,
  };
  const [upload, setUpload] = useState(initialUpload);
  const [coverPreview, setCoverPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState('');
  const [uploadErr, setUploadErr] = useState('');
  const [uploadOk, setUploadOk] = useState('');
  const [coverDrag, setCoverDrag] = useState(false);
  const [audioDrag, setAudioDrag] = useState(false);

  const coverInputRef = useRef(null);
  const audioInputRef = useRef(null);

  // Watch auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!upload.cover) {
      setCoverPreview('');
      return;
    }
    const url = URL.createObjectURL(upload.cover);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [upload.cover]);

  const fetchBeats = async () => {
    setLoadingList(true);
    try {
      const { data, error } = await supabase
        .from('beats')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('fetchBeats error', error);
        setBeats([]);
      } else {
        setBeats(data || []);
      }
    } catch (err) {
      console.error('fetchBeats threw', err);
      setBeats([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email === ADMIN_EMAIL) fetchBeats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const login = async (e) => {
    e.preventDefault();
    setLoginErr('');
    setLoggingIn(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });
    setLoggingIn(false);
    if (error) {
      setLoginErr(error.message);
      return;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const onField = (k) => (e) =>
    setUpload((u) => ({ ...u, [k]: e.target.value }));

  const setFile = (k) => (file) => {
    if (!file) return;
    setUpload((u) => ({ ...u, [k]: file }));
  };

  const onCoverDrop = (e) => {
    e.preventDefault();
    setCoverDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith('image/')) setFile('cover')(f);
  };
  const onAudioDrop = (e) => {
    e.preventDefault();
    setAudioDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith('audio/')) setFile('audio')(f);
  };

  const resetForm = () => {
    setUpload(initialUpload);
    if (coverInputRef.current) coverInputRef.current.value = '';
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const submitUpload = async (e) => {
    e.preventDefault();
    setUploadErr('');
    setUploadOk('');
    if (
      !upload.title ||
      !upload.genre ||
      !upload.bpm ||
      !upload.price ||
      !upload.cover ||
      !upload.audio
    ) {
      setUploadErr('All fields + cover + audio required');
      return;
    }
    setUploading(true);
    const titleSnapshot = upload.title;
    try {
      // Verify session is still valid (could've expired during long uploads)
      const { data: sessData } = await supabase.auth.getSession();
      if (!sessData?.session) {
        throw new Error('Session expired — please sign in again');
      }

      const beatId = crypto.randomUUID();
      const coverExt = (upload.cover.name.split('.').pop() || 'jpg').toLowerCase();
      const audioExt = (upload.audio.name.split('.').pop() || 'mp3').toLowerCase();
      const coverPath = `covers/${beatId}.${coverExt}`;
      const audioPath = `audio/${beatId}.${audioExt}`;

      setUploadStep('Uploading cover…');
      const { error: coverErr } = await supabase.storage
        .from(BEATS_BUCKET)
        .upload(coverPath, upload.cover, {
          contentType: upload.cover.type,
          upsert: false,
        });
      if (coverErr) throw coverErr;

      setUploadStep('Uploading audio…');
      const { error: audioErr } = await supabase.storage
        .from(BEATS_BUCKET)
        .upload(audioPath, upload.audio, {
          contentType: upload.audio.type,
          upsert: false,
        });
      if (audioErr) {
        // rollback cover
        await supabase.storage.from(BEATS_BUCKET).remove([coverPath]).catch(() => {});
        throw audioErr;
      }

      setUploadStep('Saving…');
      const coverUrl = supabase.storage
        .from(BEATS_BUCKET)
        .getPublicUrl(coverPath).data.publicUrl;
      const audioUrl = supabase.storage
        .from(BEATS_BUCKET)
        .getPublicUrl(audioPath).data.publicUrl;

      const { error: insertErr } = await supabase.from('beats').insert({
        id: beatId,
        title: upload.title,
        genre: upload.genre,
        bpm: parseInt(upload.bpm, 10),
        price: parseFloat(upload.price),
        cover_url: coverUrl,
        audio_url: audioUrl,
      });
      if (insertErr) {
        // rollback storage
        await supabase.storage
          .from(BEATS_BUCKET)
          .remove([coverPath, audioPath])
          .catch(() => {});
        throw insertErr;
      }

      resetForm();
      setUploadOk(`"${titleSnapshot}" uploaded`);
      try { await fetchBeats(); } catch (err) { console.error('post-upload refresh failed', err); }
      setTimeout(() => setUploadOk(''), 4000);
    } catch (err) {
      console.error('Upload failed', err);
      setUploadErr(err?.message || 'Upload failed');
    } finally {
      setUploadStep('');
      setUploading(false);
    }
  };

  const deleteBeat = async (b) => {
    if (!window.confirm(`Delete "${b.title}"? This cannot be undone.`)) return;
    try {
      const extractPath = (url) => {
        if (!url) return null;
        const marker = `/${BEATS_BUCKET}/`;
        const i = url.indexOf(marker);
        return i >= 0 ? url.substring(i + marker.length) : null;
      };
      const toRemove = [extractPath(b.cover_url), extractPath(b.audio_url)].filter(Boolean);
      if (toRemove.length) await supabase.storage.from(BEATS_BUCKET).remove(toRemove);
      await supabase.from('beats').delete().eq('id', b.id);
      fetchBeats();
    } catch (err) {
      alert(err?.message || 'Delete failed');
    }
  };

  // --- Edit beat ---
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editCoverPreview, setEditCoverPreview] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editErr, setEditErr] = useState('');
  const [editStep, setEditStep] = useState('');
  const editCoverRef = useRef(null);
  const editAudioRef = useRef(null);

  const startEdit = (b) => {
    setEditing(b);
    setEditForm({
      title: b.title || '',
      genre: b.genre || '',
      bpm: String(b.bpm ?? ''),
      price: String(b.price ?? ''),
      cover: null,
      audio: null,
    });
    setEditCoverPreview('');
    setEditErr('');
  };
  const cancelEdit = () => {
    setEditing(null);
    setEditForm(null);
    setEditCoverPreview('');
    setEditErr('');
  };

  // Edit cover preview
  useEffect(() => {
    if (!editForm?.cover) {
      setEditCoverPreview('');
      return;
    }
    const url = URL.createObjectURL(editForm.cover);
    setEditCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [editForm?.cover]);

  const editField = (k) => (e) =>
    setEditForm((f) => ({ ...f, [k]: e.target.value }));
  const editSetFile = (k) => (file) => {
    if (!file) return;
    setEditForm((f) => ({ ...f, [k]: file }));
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editing || !editForm) return;
    setEditErr('');
    if (!editForm.title || !editForm.genre || !editForm.bpm || !editForm.price) {
      setEditErr('Title, genre, BPM and price are required');
      return;
    }
    setEditSaving(true);
    try {
      const extractPath = (url) => {
        if (!url) return null;
        const marker = `/${BEATS_BUCKET}/`;
        const i = url.indexOf(marker);
        return i >= 0 ? url.substring(i + marker.length) : null;
      };

      const updates = {
        title: editForm.title,
        genre: editForm.genre,
        bpm: parseInt(editForm.bpm, 10),
        price: parseFloat(editForm.price),
      };
      const oldPathsToRemove = [];

      // Replace cover?
      if (editForm.cover) {
        setEditStep('Uploading new cover…');
        const ext = (editForm.cover.name.split('.').pop() || 'jpg').toLowerCase();
        const newPath = `covers/${editing.id}-${Date.now()}.${ext}`;
        const { error } = await supabase.storage
          .from(BEATS_BUCKET)
          .upload(newPath, editForm.cover, { contentType: editForm.cover.type, upsert: false });
        if (error) throw error;
        updates.cover_url = supabase.storage.from(BEATS_BUCKET).getPublicUrl(newPath).data.publicUrl;
        const oldPath = extractPath(editing.cover_url);
        if (oldPath) oldPathsToRemove.push(oldPath);
      }

      // Replace audio?
      if (editForm.audio) {
        setEditStep('Uploading new audio…');
        const ext = (editForm.audio.name.split('.').pop() || 'mp3').toLowerCase();
        const newPath = `audio/${editing.id}-${Date.now()}.${ext}`;
        const { error } = await supabase.storage
          .from(BEATS_BUCKET)
          .upload(newPath, editForm.audio, { contentType: editForm.audio.type, upsert: false });
        if (error) throw error;
        updates.audio_url = supabase.storage.from(BEATS_BUCKET).getPublicUrl(newPath).data.publicUrl;
        const oldPath = extractPath(editing.audio_url);
        if (oldPath) oldPathsToRemove.push(oldPath);
      }

      setEditStep('Saving…');
      const { error: updErr } = await supabase.from('beats').update(updates).eq('id', editing.id);
      if (updErr) throw updErr;

      // Remove old files (best-effort, don't fail if this errors)
      if (oldPathsToRemove.length) {
        await supabase.storage.from(BEATS_BUCKET).remove(oldPathsToRemove).catch(() => {});
      }

      cancelEdit();
      try { await fetchBeats(); } catch (err) { console.error(err); }
    } catch (err) {
      console.error('Edit failed', err);
      setEditErr(err?.message || 'Edit failed');
    } finally {
      setEditStep('');
      setEditSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="noise min-h-screen flex items-center justify-center text-white/40 font-mono text-sm uppercase tracking-[0.2em]">
        Loading…
      </div>
    );
  }

  // Wrong user logged in (not admin)
  if (session && session.user?.email !== ADMIN_EMAIL) {
    return (
      <div className="noise min-h-screen flex items-center justify-center p-6">
        <div
          className="max-w-md text-center border border-red-500/30 bg-[#121214] p-8"
          data-testid="access-denied"
        >
          <AlertTriangle size={28} className="mx-auto text-red-400" />
          <h1 className="mt-4 font-display uppercase font-extrabold text-white text-2xl">
            Access denied
          </h1>
          <p className="mt-3 font-mono text-sm text-white/50">
            Logged in as <span className="text-white">{session.user.email}</span>, but this is not the admin account.
          </p>
          <button onClick={logout} className="btn-neon mt-6" data-testid="signout-button">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return (
      <div className="noise min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <div className="purple-glow absolute -top-32 -right-32 w-[500px] h-[500px] pointer-events-none" />
        <div className="purple-glow absolute -bottom-32 -left-32 w-[500px] h-[500px] pointer-events-none opacity-60" />

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={login}
          className="w-full max-w-md border border-white/10 bg-[#121214]/95 backdrop-blur-sm p-8 md:p-10 relative z-10"
          data-testid="admin-login-form"
        >
          <Link href="/" className="inline-flex items-center group">
            <img
              src="/brand/th-logo.png"
              alt="TebaHouse"
              className="h-10 w-auto transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(157,76,221,0.7)]"
            />
          </Link>
          <h1 className="mt-6 font-display uppercase font-extrabold text-white text-3xl tracking-tight">
            Admin <span style={{ color: 'var(--neon)' }}>access</span>
          </h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            TebaHouse control panel
          </p>

          <div className="mt-8 space-y-6">
            <input
              className="raw-input"
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm((f) => ({ ...f, email: e.target.value }))
              }
              autoComplete="username"
              required
              data-testid="login-email-input"
            />
            <input
              className="raw-input"
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm((f) => ({ ...f, password: e.target.value }))
              }
              autoComplete="current-password"
              required
              data-testid="login-password-input"
            />
          </div>

          <AnimatePresence>
            {loginErr && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-5 text-red-400 font-mono text-xs uppercase tracking-[0.2em] flex items-center gap-2"
                data-testid="login-error"
              >
                <AlertTriangle size={12} /> {loginErr}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loggingIn}
            className="btn-solid mt-8 w-full"
            data-testid="login-submit-button"
          >
            {loggingIn ? (
              <Loader2 size={14} className="animate-spin" />
            ) : null}
            <span style={{ marginLeft: loggingIn ? 8 : 0 }}>
              {loggingIn ? 'Signing in…' : 'Sign in'}
            </span>
          </button>

          <p className="mt-8 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/25 text-center">
            Authorised personnel only
          </p>
        </motion.form>
      </div>
    );
  }

  // Logged in as admin
  return (
    <div className="noise min-h-screen">
      <header className="border-b border-white/5 bg-black/70 backdrop-blur-md sticky top-0 z-50">
        <div className="container-x flex items-center justify-between h-[72px]">
          <Link href="/" className="flex items-center group">
            <img
              src="/brand/th-logo.png"
              alt="TebaHouse"
              className="h-9 w-auto transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(157,76,221,0.7)]"
            />
            <span className="ml-3 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-[var(--neon)] border border-[var(--neon)]/40 px-2 py-0.5 hidden sm:inline">
              Admin
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-white/50 hidden md:inline">
              {session.user.email}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-white/60 hover:text-[var(--neon)] transition-colors"
              data-testid="logout-button"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container-x py-10 md:py-16 grid lg:grid-cols-12 gap-8 md:gap-10">
        <form
          onSubmit={submitUpload}
          className="lg:col-span-5 space-y-5 border border-white/10 bg-[#121214] p-5 sm:p-6 md:p-8 h-fit lg:sticky lg:top-[88px]"
          data-testid="upload-form"
        >
          <div>
            <span className="label-tag">Upload</span>
            <h2 className="mt-4 font-display uppercase font-extrabold text-white text-2xl md:text-3xl tracking-tight">
              New <span style={{ color: 'var(--neon)' }}>beat</span>
            </h2>
          </div>

          <input
            className="raw-input"
            placeholder="Title"
            value={upload.title}
            onChange={onField('title')}
            data-testid="upload-title"
          />
          <input
            className="raw-input"
            placeholder="Genre (e.g. Trap, Drill, RnB)"
            value={upload.genre}
            onChange={onField('genre')}
            data-testid="upload-genre"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              className="raw-input"
              placeholder="BPM"
              type="number"
              value={upload.bpm}
              onChange={onField('bpm')}
              data-testid="upload-bpm"
            />
            <input
              className="raw-input"
              placeholder="Price (€)"
              type="number"
              step="0.01"
              value={upload.price}
              onChange={onField('price')}
              data-testid="upload-price"
            />
          </div>

          {/* Cover dropzone */}
          <label
            className={`dropzone ${coverDrag ? 'is-dragging' : ''} ${
              upload.cover ? 'has-file' : ''
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setCoverDrag(true);
            }}
            onDragLeave={() => setCoverDrag(false)}
            onDrop={onCoverDrop}
            data-testid="cover-dropzone"
          >
            {coverPreview ? (
              <div className="flex items-center gap-4">
                <img
                  src={coverPreview}
                  alt="cover preview"
                  className="h-20 w-20 object-cover border border-white/10"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/80 truncate">
                    {upload.cover.name}
                  </p>
                  <p className="font-mono text-[0.65rem] tracking-wider text-white/40 mt-1">
                    {bytesToHuman(upload.cover.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setUpload((u) => ({ ...u, cover: null }));
                    if (coverInputRef.current) coverInputRef.current.value = '';
                  }}
                  className="text-white/40 hover:text-red-400 transition-colors"
                  aria-label="Remove cover"
                  data-testid="remove-cover"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-white/60">
                <ImageIcon size={16} />
                <span className="font-mono text-xs uppercase tracking-[0.2em]">
                  Drop cover image · or click
                </span>
              </div>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setFile('cover')(e.target.files?.[0])}
              className="hidden"
              data-testid="cover-input"
            />
          </label>

          {/* Audio dropzone */}
          <label
            className={`dropzone ${audioDrag ? 'is-dragging' : ''} ${
              upload.audio ? 'has-file' : ''
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setAudioDrag(true);
            }}
            onDragLeave={() => setAudioDrag(false)}
            onDrop={onAudioDrop}
            data-testid="audio-dropzone"
          >
            {upload.audio ? (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center bg-[var(--neon)]/15 border border-[var(--neon)]/40">
                  <Music2 size={16} className="text-[var(--neon)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/80 truncate">
                    {upload.audio.name}
                  </p>
                  <p className="font-mono text-[0.65rem] tracking-wider text-white/40 mt-1">
                    {bytesToHuman(upload.audio.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setUpload((u) => ({ ...u, audio: null }));
                    if (audioInputRef.current) audioInputRef.current.value = '';
                  }}
                  className="text-white/40 hover:text-red-400 transition-colors"
                  aria-label="Remove audio"
                  data-testid="remove-audio"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-white/60">
                <Music2 size={16} />
                <span className="font-mono text-xs uppercase tracking-[0.2em]">
                  Drop audio file · or click (mp3, wav…)
                </span>
              </div>
            )}
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={(e) => setFile('audio')(e.target.files?.[0])}
              className="hidden"
              data-testid="audio-input"
            />
          </label>

          <AnimatePresence>
            {uploadErr && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 font-mono text-xs uppercase tracking-[0.2em] flex items-center gap-2"
                data-testid="upload-error"
              >
                <AlertTriangle size={12} /> {uploadErr}
              </motion.p>
            )}
            {uploadOk && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[var(--neon)] font-mono text-xs uppercase tracking-[0.2em] flex items-center gap-2"
                data-testid="upload-success"
              >
                <CheckCircle2 size={12} /> {uploadOk}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={uploading}
            className="btn-solid w-full"
            data-testid="upload-submit"
          >
            {uploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Upload size={14} />
            )}
            <span style={{ marginLeft: 8 }}>
              {uploading ? (uploadStep || 'Uploading…') : 'Upload beat'}
            </span>
          </button>
        </form>

        <div className="lg:col-span-7" data-testid="library">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="label-tag">Library</span>
              <h2 className="mt-4 font-display uppercase font-extrabold text-white text-2xl md:text-3xl tracking-tight">
                Your beats{' '}
                <span className="text-white/30">({beats.length})</span>
              </h2>
            </div>
          </div>

          {loadingList && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 border border-white/10 bg-[#121214] p-3"
                >
                  <div className="w-16 h-16 bg-white/5 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 bg-white/5 animate-pulse" />
                    <div className="h-3 w-1/3 bg-white/5 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <AnimatePresence>
              {!loadingList &&
                beats.map((b) => (
                  <motion.div
                    key={b.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-4 border border-white/10 hover:border-[var(--neon)]/30 bg-[#121214] p-3 transition-colors"
                    data-testid={`library-row-${b.id}`}
                  >
                    <img
                      src={b.cover_url}
                      alt={b.title}
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover border border-white/5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-bold text-white truncate text-sm sm:text-base">
                        {b.title}
                      </h4>
                      <p className="font-mono text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-white/40 mt-1 truncate">
                        {b.genre} · {b.bpm} BPM ·{' '}
                        <span className="text-[var(--neon)]">
                          €{Number(b.price).toFixed(0)}
                        </span>
                      </p>
                    </div>
                    <audio
                      src={b.audio_url}
                      controls
                      preload="none"
                      onError={() => {}}
                      className="hidden lg:block h-9 max-w-[220px]"
                      style={{ filter: 'invert(1) hue-rotate(180deg) saturate(0.6)' }}
                    />
                    <button
                      onClick={() => startEdit(b)}
                      className="h-10 w-10 flex-shrink-0 flex items-center justify-center border border-white/10 text-white/50 hover:text-[var(--neon)] hover:border-[var(--neon)]/50 transition-colors"
                      aria-label="Edit beat"
                      data-testid={`edit-beat-${b.id}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => deleteBeat(b)}
                      className="h-10 w-10 flex-shrink-0 flex items-center justify-center border border-white/10 text-white/50 hover:text-red-400 hover:border-red-400/50 transition-colors"
                      aria-label="Delete beat"
                      data-testid={`delete-beat-${b.id}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
            </AnimatePresence>
            {!loadingList && beats.length === 0 && (
              <div
                className="border border-dashed border-white/10 p-10 text-center"
                data-testid="library-empty"
              >
                <Music2 size={28} className="mx-auto text-white/30" />
                <p className="mt-4 font-mono text-white/50 text-xs uppercase tracking-[0.2em]">
                  No beats yet — upload your first one.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && editForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/75 backdrop-blur-sm"
            onClick={() => !editSaving && cancelEdit()}
            data-testid="edit-modal"
          >
            <motion.form
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={saveEdit}
              className="w-full max-w-lg max-h-[92vh] overflow-y-auto border border-white/10 bg-[#121214] p-5 sm:p-7"
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <span className="label-tag">Edit</span>
                  <h3 className="mt-3 font-display uppercase font-extrabold text-white text-xl sm:text-2xl tracking-tight">
                    Edit <span style={{ color: 'var(--neon)' }}>beat</span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={editSaving}
                  className="text-white/40 hover:text-white transition-colors disabled:opacity-40"
                  aria-label="Close"
                  data-testid="edit-close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5">
                <input
                  className="raw-input"
                  placeholder="Title"
                  value={editForm.title}
                  onChange={editField('title')}
                  data-testid="edit-title"
                />
                <input
                  className="raw-input"
                  placeholder="Genre"
                  value={editForm.genre}
                  onChange={editField('genre')}
                  data-testid="edit-genre"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    className="raw-input"
                    placeholder="BPM"
                    type="number"
                    value={editForm.bpm}
                    onChange={editField('bpm')}
                    data-testid="edit-bpm"
                  />
                  <input
                    className="raw-input"
                    placeholder="Price (€)"
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={editField('price')}
                    data-testid="edit-price"
                  />
                </div>

                {/* Current + optional new cover */}
                <div>
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/40 mb-2">
                    Cover {editForm.cover ? '— new file selected' : '(keep current if empty)'}
                  </p>
                  <label className={`dropzone ${editForm.cover ? 'has-file' : ''}`}>
                    <div className="flex items-center gap-4">
                      <img
                        src={editCoverPreview || editing.cover_url}
                        alt=""
                        className="h-16 w-16 object-cover border border-white/10 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/80 truncate">
                          {editForm.cover ? editForm.cover.name : 'Tap to replace'}
                        </p>
                        <p className="font-mono text-[0.65rem] text-white/40 mt-1">
                          {editForm.cover ? bytesToHuman(editForm.cover.size) : 'Or drop a new file here'}
                        </p>
                      </div>
                      {editForm.cover && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setEditForm((f) => ({ ...f, cover: null }));
                            if (editCoverRef.current) editCoverRef.current.value = '';
                          }}
                          className="text-white/40 hover:text-red-400 transition-colors"
                          aria-label="Reset cover"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    <input
                      ref={editCoverRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => editSetFile('cover')(e.target.files?.[0])}
                      className="hidden"
                      data-testid="edit-cover-input"
                    />
                  </label>
                </div>

                {/* Audio */}
                <div>
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/40 mb-2">
                    Audio {editForm.audio ? '— new file selected' : '(keep current if empty)'}
                  </p>
                  <label className={`dropzone ${editForm.audio ? 'has-file' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center bg-[var(--neon)]/15 border border-[var(--neon)]/40">
                        <Music2 size={16} className="text-[var(--neon)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/80 truncate">
                          {editForm.audio ? editForm.audio.name : 'Tap to replace audio'}
                        </p>
                        <p className="font-mono text-[0.65rem] text-white/40 mt-1">
                          {editForm.audio ? bytesToHuman(editForm.audio.size) : 'mp3, wav…'}
                        </p>
                      </div>
                      {editForm.audio && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setEditForm((f) => ({ ...f, audio: null }));
                            if (editAudioRef.current) editAudioRef.current.value = '';
                          }}
                          className="text-white/40 hover:text-red-400 transition-colors"
                          aria-label="Reset audio"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    <input
                      ref={editAudioRef}
                      type="file"
                      accept="audio/*"
                      onChange={(e) => editSetFile('audio')(e.target.files?.[0])}
                      className="hidden"
                      data-testid="edit-audio-input"
                    />
                  </label>
                </div>

                {editErr && (
                  <p className="text-red-400 font-mono text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                    <AlertTriangle size={12} /> {editErr}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={editSaving}
                    className="btn-neon flex-1 disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSaving}
                    className="btn-solid flex-1"
                    data-testid="edit-submit"
                  >
                    {editSaving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    <span style={{ marginLeft: 8 }}>
                      {editSaving ? (editStep || 'Saving…') : 'Save changes'}
                    </span>
                  </button>
                </div>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
