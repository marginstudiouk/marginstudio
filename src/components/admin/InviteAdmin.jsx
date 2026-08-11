import React, { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { callFunction } from '@/lib/supabaseClient';

export default function InviteAdmin() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null); // { ok: true } | { error: string }

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setResult(null);
    try {
      await callFunction('invite-admin', { email });
      setResult({ ok: true });
      setEmail('');
    } catch (err) {
      setResult({ error: err.message || 'Something went wrong.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-md">
      <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-5">
        Invite a new admin
      </p>
      <p className="text-sm font-sans text-muted-foreground leading-relaxed mb-6">
        They'll get an email to set their own password and land straight in as an admin —
        this never touches an existing customer account, and only admins can send invites.
      </p>
      <form onSubmit={submit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@marginstudio.co.uk"
          className="flex-1 bg-background border border-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors px-5 py-3"
        >
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Invite
        </button>
      </form>
      {result?.ok && (
        <p className="text-sm font-sans text-primary mt-4">Invite sent.</p>
      )}
      {result?.error && (
        <p className="text-sm font-sans text-destructive mt-4">{result.error}</p>
      )}
    </div>
  );
}
