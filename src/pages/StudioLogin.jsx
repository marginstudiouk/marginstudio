import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Loader2 } from 'lucide-react';

const inputClass = "w-full bg-secondary/50 px-4 py-3 text-sm font-sans text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition";
const labelClass = "font-mono text-xs tracking-widest uppercase text-muted-foreground mb-2 block";

export default function StudioLogin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await signIn(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Incorrect email or password.' : err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-sm w-full">
        <p className="font-mono text-xs tracking-widest uppercase text-primary mb-3 text-center">Margin Studio</p>
        <h1 className="font-display text-3xl tracking-wide text-foreground text-center mb-10">Studio Admin</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <p className="text-sm font-sans text-destructive">{error}</p>}
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors py-4 font-mono text-xs tracking-widest uppercase flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Signing in</> : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
