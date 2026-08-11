import React, { useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const SESSION_KEY = 'margin_subscribed';

export default function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === '1'
  );

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await supabase.from('subscribers').upsert({ email }, { onConflict: 'email' });
    } catch {
      // already subscribed or network issue — still mark done
    } finally {
      setSubmitting(false);
      sessionStorage.setItem(SESSION_KEY, '1');
      setDone(true);
    }
  };

  if (done) {
    return (
      <p className="font-mono text-xs tracking-widest uppercase text-primary mt-6">
        You're on the list
      </p>
    );
  }

  return (
    <div className="mt-6">
      <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-3">Sign up to the newsletter</p>
      <form onSubmit={submit} className="flex items-center gap-2 max-w-sm">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="flex-1 min-w-0 bg-background px-3 py-2.5 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors px-4 py-2.5"
      >
        {submitting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Mail className="w-3.5 h-3.5" />
        )}
      </button>
      </form>
    </div>
  );
}
