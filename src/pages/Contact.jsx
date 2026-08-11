import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const projectOptions = [
  { value: 'branding', label: 'Branding' },
  { value: 'campaign', label: 'Campaign' },
  { value: 'social_media', label: 'Social media' },
  { value: 'email_marketing', label: 'Email marketing' },
  { value: 'book_cover', label: 'Book cover' },
  { value: 'website', label: 'Website' },
  { value: 'package', label: 'A package' },
  { value: 'other', label: 'Something else' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', project_type: 'other', budget: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { error: dbError } = await supabase.from('inquiries').insert({
        name: form.name,
        email: form.email,
        project_type: form.project_type,
        budget: form.budget,
        message: form.message,
        status: 'new',
      });
      if (dbError) throw dbError;

      // Best-effort email notification — the enquiry is already saved either way.
      supabase.functions.invoke('send-contact-email', { body: form }).catch(() => {});

      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <span className="font-mono text-xs tracking-widest uppercase text-primary mb-3 block">Studio</span>
          <h1 className="font-display text-5xl md:text-7xl tracking-wide text-foreground leading-[0.9] mb-6">
            Contact
          </h1>
          <p className="text-base font-sans text-muted-foreground leading-relaxed max-w-lg">
            Tell us about your book, your goals, and how you are hoping to work together. We reply to every genuine enquiry.
          </p>
        </motion.div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-secondary/50 p-10 text-center"
          >
            <div className="w-10 h-10 mx-auto mb-5 flex items-center justify-center bg-primary">
              <Check className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="font-display text-2xl tracking-wide text-foreground mb-3">Message received</h2>
            <p className="text-sm font-sans text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Thank you for getting in touch. We will get back to you within two working days.
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Name</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={handleChange('name')}
                  className="bg-transparent rounded-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange('email')}
                  className="bg-transparent rounded-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Project type</Label>
                <Select value={form.project_type} onValueChange={(v) => setForm((f) => ({ ...f, project_type: v }))}>
                  <SelectTrigger className="bg-transparent rounded-none">
                    <SelectValue placeholder="Select a project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget" className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Budget (optional)</Label>
                <Input
                  id="budget"
                  value={form.budget}
                  onChange={handleChange('budget')}
                  placeholder="e.g. £500–£1,000"
                  className="bg-transparent rounded-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Message</Label>
              <Textarea
                id="message"
                required
                rows={6}
                value={form.message}
                onChange={handleChange('message')}
                className="bg-transparent rounded-none resize-none"
              />
            </div>

            {error && <p className="text-sm font-sans text-destructive">{error}</p>}

            <Button
              type="submit"
              disabled={submitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-mono text-xs tracking-widest uppercase px-8 py-6 disabled:opacity-60"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending</>
              ) : 'Send enquiry'}
            </Button>
          </motion.form>
        )}
      </div>
    </div>
  );
}