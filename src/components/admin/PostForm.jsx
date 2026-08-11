import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from './RichTextEditor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

const today = () => new Date().toISOString().slice(0, 10);

const isoToDMY = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
};

const dmyToISO = (dmy) => {
  const match = dmy.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
};

export default function PostForm() {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '', cover_image_url: '', author: '', tags: '', status: 'published', published_date: today(),
  });
  const [dateText, setDateText] = useState(isoToDMY(today()));

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const path = `journal-covers/${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from('images').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(path);
      setForm((f) => ({ ...f, cover_image_url: publicUrl }));
    } finally {
      setCoverUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setDone(false);
    try {
      const { error } = await supabase.from('posts').insert({
        title: form.title,
        slug: form.slug || slugify(form.title),
        excerpt: form.excerpt,
        content: form.content,
        cover_image_url: form.cover_image_url,
        author: form.author,
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
        status: form.status,
        published_date: form.published_date,
      });
      if (error) throw error;
      setForm({ title: '', slug: '', excerpt: '', content: '', cover_image_url: '', author: '', tags: '', status: 'published', published_date: today() });
      setDateText(isoToDMY(today()));
      setDone(true);
      qc.invalidateQueries({ queryKey: ['admin-posts'] });
      qc.invalidateQueries({ queryKey: ['journal-posts'] });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {done && <p className="text-sm font-sans text-primary">Post saved.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Title *</Label>
          <Input required value={form.title} onChange={set('title')} className="bg-background rounded-none" />
        </div>
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Slug (auto from title)</Label>
          <Input value={form.slug} onChange={set('slug')} placeholder={slugify(form.title) || 'auto'} className="bg-background rounded-none" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Excerpt</Label>
        <Input value={form.excerpt} onChange={set('excerpt')} className="bg-background rounded-none" />
      </div>
      <div className="space-y-1.5">
        <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Content</Label>
        <RichTextEditor
          value={form.content}
          onChange={(html) => setForm((f) => ({ ...f, content: html }))}
          placeholder="Write the post…"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Cover image</Label>
          {form.cover_image_url ? (
            <div className="flex items-center justify-between bg-muted px-4 py-3">
              <span className="font-mono text-xs text-muted-foreground truncate max-w-[60%]">{form.cover_image_url.split('/').pop()}</span>
              <button type="button" onClick={() => setForm((f) => ({ ...f, cover_image_url: '' }))} className="font-mono text-xs text-primary hover:underline">Replace</button>
            </div>
          ) : (
            <label className="flex items-center justify-center cursor-pointer bg-muted hover:bg-muted/70 px-4 py-6 transition-colors">
              <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">{coverUploading ? 'Uploading…' : 'Choose image'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={coverUploading} />
            </label>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Author</Label>
          <Input value={form.author} onChange={set('author')} className="bg-background rounded-none" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Tags (comma separated)</Label>
          <Input value={form.tags} onChange={set('tags')} className="bg-background rounded-none" />
        </div>
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
            <SelectTrigger className="bg-background rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Publish date (DD/MM/YYYY)</Label>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="11/08/2026"
            value={dateText}
            onChange={(e) => {
              const text = e.target.value;
              setDateText(text);
              const iso = dmyToISO(text);
              if (iso) setForm((f) => ({ ...f, published_date: iso }));
            }}
            className="bg-background rounded-none"
          />
        </div>
      </div>
      <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-mono text-xs tracking-widest uppercase px-6 py-4 disabled:opacity-60">
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
        Save post
      </Button>
    </form>
  );
}

export function PostsList() {
  const { data: posts = [] } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });
  const qc = useQueryClient();

  const remove = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    await supabase.from('posts').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['admin-posts'] });
    qc.invalidateQueries({ queryKey: ['journal-posts'] });
  };

  if (posts.length === 0) return <p className="font-mono text-xs text-muted-foreground">No posts yet.</p>;

  return (
    <div className="space-y-2">
      {posts.map((p) => (
        <div key={p.id} className="flex items-center justify-between py-3">
          <div>
            <p className="font-sans text-sm font-medium text-foreground">{p.title}</p>
            <p className="font-mono text-xs text-muted-foreground">{p.status} · {p.published_date}</p>
          </div>
          <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
