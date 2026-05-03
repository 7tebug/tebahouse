'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogOut, Upload, Trash2, Music2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { getSupabaseClient, ADMIN_EMAIL, BEATS_BUCKET } from '@/lib/supabase';

export default function AdminPage() {
  const supabase = getSupabaseClient();
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginErr, setLoginErr] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [beats, setBeats] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [upload, setUpload] = useState({ title: '', genre: '', bpm: '', price: '', cover: null, audio: null });
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const [uploadOk, setUploadOk] = useState('');

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

  const fetchBeats = async () => {
    setLoadingList(true);
    const { data, error } = await supabase.from('beats').select('*').order('created_at', { ascending: false });
    if (!error) setBeats(data || []);
    setLoadingList(false);
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

  const logout = async () => { await supabase.auth.signOut(); };

  const onField = (k) => (e) => setUpload((u) => ({ ...u, [k]: e.target.value }));
  const onFile = (k) => (e) => setUpload((u) => ({ ...u, [k]: e.target.files?.[0] || null }));

  const submitUpload = async (e) => {
    e.preventDefault();
    setUploadErr('');
    setUploadOk('');
    if (!upload.title || !upload.genre || !upload.bpm || !upload.price || !upload.cover || !upload.audio) {
      setUploadErr('All fields + cover + audio required');
      return;
    }
    setUploading(true);
    try {
      const beatId = crypto.randomUUID();
      const coverExt = upload.cover.name.split('.').pop() || 'jpg';
      const audioExt = upload.audio.name.split('.').pop() || 'mp3';
      const coverPath = `covers/${beatId}.${coverExt}`;
      const audioPath = `audio/${beatId}.${audioExt}`;

      // 1. Upload cover
      const { error: coverErr } = await supabase.storage
        .from(BEATS_BUCKET)
        .upload(coverPath, upload.cover, { contentType: upload.cover.type, upsert: false });
      if (coverErr) throw coverErr;

      // 2. Upload audio
      const { error: audioErr } = await supabase.storage
        .from(BEATS_BUCKET)
        .upload(audioPath, upload.audio, { contentType: upload.audio.type, upsert: false });
      if (audioErr) throw audioErr;

      // 3. Get public URLs
      const coverUrl = supabase.storage.from(BEATS_BUCKET).getPublicUrl(coverPath).data.publicUrl;
      const audioUrl = supabase.storage.from(BEATS_BUCKET).getPublicUrl(audioPath).data.publicUrl;

      // 4. Insert row
      const { error: insertErr } = await supabase.from('beats').insert({
        id: beatId,
        title: upload.title,
        genre: upload.genre,
        bpm: parseInt(upload.bpm, 10),
        price: parseFloat(upload.price),
        cover_url: coverUrl,
        audio_url: audioUrl,
      });
      if (insertErr) throw insertErr;

      setUpload({ title: '', genre: '', bpm: '', price: '', cover: null, audio: null });
      setUploadOk('Beat uploaded');
      const ci = document.getElementById('cover-input'); if (ci) ci.value = '';
      const ai = document.getElementById('audio-input'); if (ai) ai.value = '';
      fetchBeats();
      setTimeout(() => setUploadOk(''), 4000);
    } catch (err) {
      setUploadErr(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const deleteBeat = async (b) => {
    if (!window.confirm('Delete this beat?')) return;
    try {
      // Find storage paths from URLs
      const extractPath = (url) => {
        const marker = `/${BEATS_BUCKET}/`;
        const i = url.indexOf(marker);
        return i >= 0 ? url.substring(i + marker.length) : null;
      };
      const coverPath = extractPath(b.cover_url);
      const audioPath = extractPath(b.audio_url);
      const toRemove = [coverPath, audioPath].filter(Boolean);
      if (toRemove.length) await supabase.storage.from(BEATS_BUCKET).remove(toRemove);
      await supabase.from('beats').delete().eq('id', b.id);
      fetchBeats();
    } catch (err) {
      alert(err?.message || 'Delete failed');
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
        <div className="max-w-md text-center border border-red-500/30 bg-[#121214] p-8">
          <h1 className="font-display uppercase font-extrabold text-white text-2xl">Access denied</h1>
          <p className="mt-3 font-mono text-sm text-white/50">
            Logged in as <span className="text-white">{session.user.email}</span>, but this is not the admin account.
          </p>
          <button onClick={logout} className="btn-neon mt-6">Sign out</button>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return (
      <div className="noise min-h-screen flex items-center justify-center p-6">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={login}
          className="w-full max-w-md border border-white/10 bg-[#121214] p-8 md:p-10"
        >
          <Link href="/" className="inline-flex items-center">
            <img src="/brand/th-logo.png" alt="TebaHouse" className="h-10 w-auto" />
          </Link>
          <h1 className="mt-6 font-display uppercase font-extrabold text-white text-3xl tracking-tight">Admin access</h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-white/40">TebaHouse control panel</p>

          <div className="mt-8 space-y-6">
            <input
              className="raw-input"
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
              autoComplete="username"
              required
            />
            <input
              className="raw-input"
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
              autoComplete="current-password"
              required
            />
          </div>

          {loginErr && <p className="mt-5 text-red-400 font-mono text-xs uppercase tracking-[0.2em]">{loginErr}</p>}

          <button type="submit" disabled={loggingIn} className="btn-solid mt-8 w-full">
            {loggingIn ? 'Signing in…' : 'Sign in'}
          </button>
        </motion.form>
      </div>
    );
  }

  // Logged in as admin
  return (
    <div className="noise min-h-screen">
      <header className="border-b border-white/5 bg-black/70 backdrop-blur-md sticky top-0 z-50">
        <div className="container-x flex items-center justify-between h-[72px]">
          <Link href="/" className="flex items-center">
            <img src="/brand/th-logo.png" alt="TebaHouse" className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-6">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-white/50 hidden md:inline">
              {session.user.email}
            </span>
            <button onClick={logout} className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-white/60 hover:text-[var(--neon)] transition-colors">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container-x py-12 md:py-16 grid lg:grid-cols-12 gap-10">
        <form onSubmit={submitUpload} className="lg:col-span-5 space-y-5 border border-white/10 bg-[#121214] p-6 md:p-8">
          <div>
            <span className="label-tag">Upload</span>
            <h2 className="mt-4 font-display uppercase font-extrabold text-white text-2xl md:text-3xl tracking-tight">New beat</h2>
          </div>

          <input className="raw-input" placeholder="Title" value={upload.title} onChange={onField('title')} />
          <input className="raw-input" placeholder="Genre (e.g. Trap, Drill, RnB)" value={upload.genre} onChange={onField('genre')} />
          <div className="grid grid-cols-2 gap-4">
            <input className="raw-input" placeholder="BPM" type="number" value={upload.bpm} onChange={onField('bpm')} />
            <input className="raw-input" placeholder="Price (€)" type="number" step="0.01" value={upload.price} onChange={onField('price')} />
          </div>

          <label className="block border border-dashed border-white/15 p-4 cursor-pointer hover:border-[var(--neon)]/60 transition-colors">
            <div className="flex items-center gap-3 text-white/60">
              <ImageIcon size={16} />
              <span className="font-mono text-xs uppercase tracking-[0.2em]">
                {upload.cover ? upload.cover.name : 'Upload cover (square image)'}
              </span>
            </div>
            <input id="cover-input" type="file" accept="image/*" onChange={onFile('cover')} className="hidden" />
          </label>

          <label className="block border border-dashed border-white/15 p-4 cursor-pointer hover:border-[var(--neon)]/60 transition-colors">
            <div className="flex items-center gap-3 text-white/60">
              <Music2 size={16} />
              <span className="font-mono text-xs uppercase tracking-[0.2em]">
                {upload.audio ? upload.audio.name : 'Upload audio (mp3, wav…)'}
              </span>
            </div>
            <input id="audio-input" type="file" accept="audio/*" onChange={onFile('audio')} className="hidden" />
          </label>

          {uploadErr && <p className="text-red-400 font-mono text-xs uppercase tracking-[0.2em]">{uploadErr}</p>}
          {uploadOk && <p className="text-[var(--neon)] font-mono text-xs uppercase tracking-[0.2em]">{uploadOk}</p>}

          <button type="submit" disabled={uploading} className="btn-solid w-full">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            <span style={{ marginLeft: 8 }}>{uploading ? 'Uploading…' : 'Upload beat'}</span>
          </button>
        </form>

        <div className="lg:col-span-7">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="label-tag">Library</span>
              <h2 className="mt-4 font-display uppercase font-extrabold text-white text-2xl md:text-3xl tracking-tight">
                Your beats <span className="text-white/30">({beats.length})</span>
              </h2>
            </div>
          </div>

          {loadingList && <p className="text-white/40 font-mono text-sm">Loading…</p>}

          <div className="space-y-3">
            {beats.map((b) => (
              <div key={b.id} className="flex items-center gap-4 border border-white/10 bg-[#121214] p-3">
                <img src={b.cover_url} alt={b.title} className="w-16 h-16 object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-white truncate">{b.title}</h4>
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/40 mt-1">
                    {b.genre} · {b.bpm} BPM · €{Number(b.price).toFixed(0)}
                  </p>
                </div>
                <button
                  onClick={() => deleteBeat(b)}
                  className="h-10 w-10 flex items-center justify-center border border-white/10 text-white/50 hover:text-red-400 hover:border-red-400/50 transition-colors"
                  aria-label="Delete beat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {!loadingList && beats.length === 0 && (
              <p className="text-white/40 font-mono text-sm">No beats yet. Upload your first one.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
