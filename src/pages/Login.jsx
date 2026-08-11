import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const inputClass = "w-full bg-secondary/50 px-4 py-3 text-sm font-sans text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition";
const labelClass = "font-mono text-xs tracking-widest uppercase text-muted-foreground mb-2 block";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from || '/account';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Incorrect email or password.' : err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-sm mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10">
          <span className="font-mono text-xs tracking-widest uppercase text-primary mb-3 block">Account</span>
          <h1 className="font-display text-4xl md:text-5xl tracking-wide text-foreground leading-[0.9] mb-2">Sign in</h1>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <p className="text-sm font-sans text-destructive">{error}</p>}

          <div>
            <label className={labelClass}>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelClass + ' mb-0'}>Password</label>
              <Link to="/forgot-password" className="font-mono text-xs text-primary hover:underline">Forgot?</Link>
            </div>
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

        <p className="text-sm font-sans text-muted-foreground mt-8 text-center">
          New here?{' '}
          <Link to="/signup" className="text-primary hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
