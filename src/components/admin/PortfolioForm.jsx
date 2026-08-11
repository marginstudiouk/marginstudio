import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2, Plus } from 'lucide-react';
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

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

const serviceOptions = [
  { value: 'branding', label: 'Branding' },
  { value: 'campaigns', label: 'Campaigns' },
  { value: 'social-media', label: 'Social media' },
  { value: 'email-marketing', label: 'Email marketing' },
  { value: 'book-covers', label: 'Book covers' },
  { value: 'websites', label: 'Websites' },
];

export default function PortfolioForm() {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '', slug: '', client: '', service_type: 'branding',
    cover_image_url: '', excerpt: '', content: '',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `portfolio/${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from('images').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(path);
      setForm((f) => ({ ...f, cover_image_url: publicUrl }));
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setDone(false);
    try {
      const { error } = await supabase.from('portfolio').insert({
        name: form.name,
        slug: form.slug || slugify(form.name),
        client: form.client,
        service_type: form.service_type,
        cover_image_url: form.cover_image_url,
        excerpt: form.excerpt,
        content: form.content,
      });
      if (error) throw error;
      setForm({ name: '', slug: '', client: '', service_type: 'branding', cover_image_url: '', excerpt: '', content: '' });
      setDone(true);
      qc.invalidateQueries({ queryKey: ['admin-portfolio'] });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {done && <p className="text-sm font-sans text-primary">Case study saved.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Project name *</Label>
          <Input required value={form.name} onChange={set('name')} className="bg-background rounded-none" />
        </div>
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Slug (auto from name)</Label>
          <Input value={form.slug} onChange={set('slug')} placeholder={slugify(form.name) || 'auto'} className="bg-background rounded-none" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Client / author</Label>
          <Input value={form.client} onChange={set('client')} className="bg-background rounded-none" />
        </div>
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Service type *</Label>
          <Select value={form.service_type} onValueChange={(v) => setForm((f) => ({ ...f, service_type: v }))}>
            <SelectTrigger className="bg-background rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent>
              {serviceOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Excerpt</Label>
        <Input value={form.excerpt} onChange={set('excerpt')} className="bg-background rounded-none" />
      </div>
      <div className="space-y-1.5">
        <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Cover image (square)</Label>
        {form.cover_image_url ? (
          <div className="flex items-center justify-between bg-muted px-4 py-3">
            <span className="font-mono text-xs text-muted-foreground truncate max-w-[60%]">{form.cover_image_url.split('/').pop()}</span>
            <button type="button" onClick={() => setForm((f) => ({ ...f, cover_image_url: '' }))} className="font-mono text-xs text-primary hover:underline">Replace</button>
          </div>
        ) : (
          <label className="flex items-center justify-center cursor-pointer bg-muted hover:bg-muted/70 px-4 py-6 transition-colors">
            <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">{uploading ? 'Uploading…' : 'Choose image'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
          </label>
        )}
        <Input value={form.cover_image_url} onChange={set('cover_image_url')} placeholder="or paste image URL" className="bg-background rounded-none mt-2" />
      </div>
      <div className="space-y-1.5">
        <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Case study content (markdown)</Label>
        <Textarea rows={8} value={form.content} onChange={set('content')} className="bg-background rounded-none resize-none" />
      </div>
      <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-mono text-xs tracking-widest uppercase px-6 py-4 disabled:opacity-60">
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
        Save case study
      </Button>
    </form>
  );
}

export function PortfolioList() {
  const { data: items = [] } = useQuery({
    queryKey: ['admin-portfolio'],
    queryFn: async () => {
      const { data, error } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      return data;
    },
  });
  const qc = useQueryClient();

  const remove = async (id) => {
    if (!window.confirm('Delete this case study?')) return;
    await supabase.from('portfolio').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['admin-portfolio'] });
  };

  if (items.length === 0) return <p className="font-mono text-xs text-muted-foreground">No case studies yet.</p>;

  return (
    <div className="space-y-2">
      {items.map((p) => (
        <div key={p.id} className="flex items-center justify-between py-3">
          <div>
            <p className="font-sans text-sm font-medium text-foreground">{p.name}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {p.client ? `${p.client} · ` : ''}{p.service_type}
            </p>
          </div>
          <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}