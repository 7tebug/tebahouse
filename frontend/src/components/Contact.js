'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus('error');
      setError('All fields are required');
      return;
    }
    setStatus('sending');
    try {
      const supabase = getSupabaseClient();
      const { error: insertError } = await supabase.from('contact_messages').insert({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      if (insertError) throw insertError;
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      setStatus('error');
      setError(err?.message || 'Something went wrong. Try again.');
    }
  };

  return (
    <section id="contact" className="relative section-pad border-t border-white/5">
      <div className="purple-glow absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none" />

      <div className="container-x grid md:grid-cols-12 gap-10 md:gap-16 relative">
        <div className="md:col-span-5">
          <span className="label-tag">Contact · 06</span>
          <h2
            className="mt-5 font-display uppercase font-extrabold text-white leading-[1] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 4.5rem)' }}
          >
            Let&apos;s make
            <br />
            <span style={{ color: 'var(--neon)' }}>noise</span>.
          </h2>

          <p className="mt-8 font-mono text-white/55 text-sm leading-relaxed max-w-md">
            Got a track in mind, a rough idea, or just want to chat about sound?
            Drop a line — I reply fast.
          </p>

          <div className="mt-10 space-y-4 font-mono text-sm">
            <div>
              <div className="text-white/30 text-[0.65rem] uppercase tracking-[0.25em]">Email</div>
              <a href="mailto:7tebahouse@gmail.com" className="text-white hover:text-[var(--neon)] transition-colors">
                7tebahouse@gmail.com
              </a>
            </div>
            <div>
              <div className="text-white/30 text-[0.65rem] uppercase tracking-[0.25em]">Phone</div>
              <a href="tel:+393755264359" className="text-white hover:text-[var(--neon)] transition-colors">
                +39 375 526 4359
              </a>
            </div>
            <div>
              <div className="text-white/30 text-[0.65rem] uppercase tracking-[0.25em]">Studio</div>
              <p className="text-white">Verona / Pescantina 37026, IT</p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="md:col-span-7 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <input type="text" className="raw-input" placeholder="Your name" value={form.name} onChange={update('name')} maxLength={100} required />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.08 }}>
            <input type="email" className="raw-input" placeholder="Your email" value={form.email} onChange={update('email')} required />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.16 }}>
            <textarea className="raw-input" placeholder="Tell me about your project" rows={5} value={form.message} onChange={update('message')} maxLength={4000} required />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="pt-4 flex flex-wrap items-center gap-5"
          >
            <button type="submit" disabled={status === 'sending'} className="btn-solid">
              {status === 'sending' ? 'Sending…' : 'Send message'}
              <Send size={14} style={{ marginLeft: 8 }} />
            </button>

            {status === 'success' && (
              <span className="flex items-center gap-2 text-[var(--neon)] font-mono text-xs uppercase tracking-[0.2em]">
                <CheckCircle2 size={14} /> Message sent
              </span>
            )}
            {status === 'error' && (
              <span className="flex items-center gap-2 text-red-400 font-mono text-xs uppercase tracking-[0.2em]">
                <AlertCircle size={14} /> {error || 'Error'}
              </span>
            )}
          </motion.div>
        </form>
      </div>
    </section>
  );
}
