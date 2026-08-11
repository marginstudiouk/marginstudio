import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Download, ArrowRight, UserCircle, Check } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';


const inputClass = "w-full bg-secondary/50 px-4 py-3 text-sm font-sans text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition";
const labelClass = "font-mono text-xs tracking-widest uppercase text-muted-foreground mb-2 block";

export default function Account() {
  const { user, isAdmin, signOut, updateProfile } = useAuth();
  const [form, setForm] = useState({ organisation: '', audience: 'author', website: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        organisation: user.organisation || '',
        audience: user.audience || 'author',
        website: user.website || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setSaved(false);
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateProfile(form);
      setSaved(true);
    } catch (err) {
      setError(err?.message || 'Could not save your details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="font-mono text-xs tracking-widest uppercase text-primary mb-3 block">Account</span>
          <h1 className="font-display text-5xl md:text-6xl tracking-wide text-foreground leading-[0.9] mb-2">
            Your account
          </h1>
          <p className="text-sm font-sans text-muted-foreground">{user?.email}</p>
        </motion.div>

        {/* Personal details */}
        <motion.form
          onSubmit={handleSave}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-3">
            <UserCircle className="w-5 h-5 text-primary" />
            <h2 className="font-sans text-lg font-semibold text-foreground">Personal details</h2>
          </div>
          <p className="text-sm font-sans text-muted-foreground leading-relaxed mb-8 max-w-md">
            Keep your details current so we can tailor resources and support to you. Your name and email are managed through your login.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass} htmlFor="organisation">Organisation / pen name</label>
              <input id="organisation" name="organisation" value={form.organisation} onChange={handleChange} className={inputClass} placeholder="Your imprint or pen name" />
            </div>
            <div>
              <label className={labelClass} htmlFor="audience">I am a</label>
              <select id="audience" name="audience" value={form.audience} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`}>
                <option value="author">Author</option>
                <option value="publisher">Publisher</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="website">Website</label>
              <input id="website" name="website" value={form.website} onChange={handleChange} className={inputClass} placeholder="https://" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="bio">About you</label>
              <textarea id="bio" name="bio" value={form.bio} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder="A short note about you and your work" />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-8">
            <button
              type="submit"
              disabled={saving}
              className="font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-8 py-4 disabled:opacity-50"
            >
              {saving ? 'Saving' : 'Save details'}
            </button>
            {saved && (
              <span className="inline-flex items-center gap-2 font-mono text-xs text-primary">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            {error && (
              <span className="font-mono text-xs text-destructive">{error}</span>
            )}
          </div>
        </motion.form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-secondary/50 p-8"
          >
            <Download className="w-5 h-5 text-primary mb-5" />
            <h2 className="font-sans text-lg font-semibold text-foreground mb-2">Your downloads</h2>
            <p className="text-sm font-sans text-muted-foreground leading-relaxed mb-6">
              Access every resource you have purchased, ready to download anytime.
            </p>
            <Link to="/library" className="inline-flex items-center font-mono text-xs tracking-widest uppercase text-primary group">
              Open library
              <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-secondary/50 p-8"
          >
            <LogOut className="w-5 h-5 text-primary mb-5" />
            <h2 className="font-sans text-lg font-semibold text-foreground mb-2">Sign out</h2>
            <p className="text-sm font-sans text-muted-foreground leading-relaxed mb-6">
              End your session on this device.
            </p>
            <button onClick={() => signOut()} className="font-mono text-xs tracking-widest uppercase text-primary group">
              Sign out
            </button>
            <Link to="/reset-password" className="block mt-4 font-mono text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors">
              Change password
            </Link>
          </motion.div>
        </div>

        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <Link to="/admin" className="font-mono text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors">
              Studio CMS →
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}