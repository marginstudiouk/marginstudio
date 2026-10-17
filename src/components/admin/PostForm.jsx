
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2, Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from './RichTextEditor';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';

const slugify = (s) =>
  s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

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
  const date = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T12:00:00Z`);
  if (
    date.getUTCFullYear() !== Number(y) ||
    date.getUTCMonth() + 1 !== Number(m) ||
    date.getUTCDate() !== Number(d)
  ) return null;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
};

const makeEmptyForm = () => ({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image_url: '',
  gallery_urls: [],
  author: '',
  tags: '',
  status: 'published',
  published_date: today(),
});

const postToForm = (p) => ({
  title: p.title || '',
  slug: p.slug || '',
  excerpt: p.excerpt || '',
  content: p.content || '',
  cover_image_url: p.cover_image_url || '',
  gallery_urls: Array.isArray(p.gallery_urls) ? p.gallery_urls : [],
  author: p.author || '',
  tags: (p.tags || []).join(', '),
  status: p.status || 'published',
  published_date: p.published_date || today(),
});

const imagePath = (folder, file) =>
  `${folder}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;

async function uploadImage(folder, file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file.');
  }

  const path = imagePath(folder, file);
  const { error } = await supabase.storage.from('images')
    .upload(path, file, { contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from('images').getPublicUrl(path);
  return data.publicUrl;
}

export default function PostForm({ editingPost, onDone }) {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [inlineUploading, setInlineUploading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(makeEmptyForm);
  const [dateText, setDateText] = useState(isoToDMY(today()));

  React.useEffect(() => {
    const next = editingPost ? postToForm(editingPost) : makeEmptyForm();
    setForm(next);
    setDateText(isoToDMY(next.published_date));
    setDone(false);
    setError('');
  }, [editingPost]);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setCoverUploading(true);
    setError('');

    try {
      const url = await uploadImage('journal-covers', file);
      setForm((f) => ({ ...f, cover_image_url: url }));
    } catch (err) {
      setError(`Cover upload failed: ${err.message}`);
    } finally {
      setCoverUploading(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    setGalleryUploading(true);
    setError('');

    try {
      const urls = [];
      for (const file of files) {
        urls.push(await uploadImage('journal-gallery', file));
      }
      setForm((f) => ({
        ...f,
        gallery_urls: [...f.gallery_urls, ...urls],
      }));
    } catch (err) {
      setError(`Gallery upload failed: ${err.message}`);
    } finally {
      setGalleryUploading(false);
    }
  };

  const removeGalleryImage = (url) => {
    setForm((f) => ({
      ...f,
      gallery_urls: f.gallery_urls.filter((item) => item !== url),
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (coverUploading || galleryUploading || inlineUploading) {
      setError('Please finish uploading images before saving.');
      return;
    }

    const parsedDate = dmyToISO(dateText);
    if (!parsedDate) {
      setError('Please enter a valid publication date (DD/MM/YYYY).');
      return;
    }

    setSaving(true);
    setDone(false);
    setError('');

    try {
      const payload = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        excerpt: form.excerpt,
        content: form.content,
        cover_image_url: form.cover_image_url,
        gallery_urls: form.gallery_urls,
        author: form.author,
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
        status: form.status,
        published_date: parsedDate,
      };

      const { error: saveError } = editingPost
        ? await supabase.from('posts')
            .update(payload).eq('id', editingPost.id)
        : await supabase.from('posts').insert(payload);

      if (saveError) throw saveError;

      setDone(true);

      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin-posts'] }),
        qc.invalidateQueries({ queryKey: ['journal-posts'] }),
        qc.invalidateQueries({ queryKey: ['journal-post'] }),
        qc.invalidateQueries({ queryKey: ['journal-related-posts'] }),
      ]);

      if (editingPost) {
        onDone?.();
      } else {
        setForm(makeEmptyForm());
        setDateText(isoToDMY(today()));
      }
    } catch (err) {
      setError(`Could not save post: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const busy = saving || coverUploading || galleryUploading || inlineUploading;

  return (
    <form onSubmit={submit} className="space-y-6">
      {editingPost && (
        <div className="flex items-center justify-between bg-primary/5 border border-primary/30 px-4 py-3">
          <p className="font-mono text-xs tracking-widest uppercase text-primary">
            Editing "{editingPost.title}"
          </p>
          <button
            type="button"
            onClick={() => onDone?.()}
            className="font-mono text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      )}

      {done && (
        <p className="text-sm font-sans text-primary">
          {editingPost ? 'Post updated.' : 'Post saved.'}
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm font-sans text-destructive">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
            Title *
          </Label>
          <Input
            required
            value={form.title}
            onChange={set('title')}
            className="bg-background rounded-none"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
            Slug (auto from title)
          </Label>
          <Input
            value={form.slug}
            onChange={set('slug')}
            placeholder={slugify(form.title) || 'auto'}
            className="bg-background rounded-none"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
          Excerpt
        </Label>
        <Input
          value={form.excerpt}
          onChange={set('excerpt')}
          className="bg-background rounded-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
          Content
        </Label>
        <RichTextEditor
          key={editingPost?.id || 'new-post'}
          value={form.content}
          onChange={(html) =>
            setForm((f) => ({ ...f, content: html }))
          }
          onUploadStateChange={setInlineUploading}
          placeholder="Write the post…"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
            Cover image
          </Label>

          {form.cover_image_url ? (
            <div className="flex items-center justify-between bg-muted px-4 py-3">
              <span className="font-mono text-xs text-muted-foreground truncate max-w-[60%]">
                {form.cover_image_url.split('/').pop()}
              </span>
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, cover_image_url: '' }))
                }
                className="font-mono text-xs text-primary hover:underline"
              >
                Replace
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center cursor-pointer bg-muted hover:bg-muted/70 px-4 py-6 transition-colors">
              <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
                {coverUploading ? 'Uploading…' : 'Choose image'}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
                disabled={busy}
              />
            </label>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
            Author
          </Label>
          <Input
            value={form.author}
            onChange={set('author')}
            className="bg-background rounded-none"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
          Additional images
        </Label>

        {form.gallery_urls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {form.gallery_urls.map((url, i) => (
              <div
                key={url}
                className="relative aspect-square overflow-hidden bg-muted rounded-[8px]"
              >
                <img
                  src={url}
                  alt={`Additional image ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(url)}
                  className="absolute top-2 right-2 bg-background/90 text-foreground px-2 py-1 font-mono text-[10px] uppercase"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="flex items-center justify-center cursor-pointer bg-muted hover:bg-muted/70 px-4 py-6 transition-colors rounded-[8px]">
          <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
            {galleryUploading ? 'Uploading…' : 'Add images'}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleGalleryUpload}
            disabled={busy}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
            Tags (comma separated)
          </Label>
          <Input
            value={form.tags}
            onChange={set('tags')}
            className="bg-background rounded-none"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
            Status
          </Label>
          <Select
            value={form.status}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, status: v }))
            }
          >
            <SelectTrigger className="bg-background rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
            Publish date (DD/MM/YYYY)
          </Label>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="11/08/2026"
            value={dateText}
            onChange={(e) => {
              const text = e.target.value;
              setDateText(text);
              const iso = dmyToISO(text);
              if (iso) {
                setForm((f) => ({ ...f, published_date: iso }));
              }
            }}
            className="bg-background rounded-none"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={busy}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-mono text-xs tracking-widest uppercase px-6 py-4 disabled:opacity-60"
      >
        {saving
          ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          : <Plus className="w-4 h-4 mr-2" />}
        {editingPost ? 'Update post' : 'Save post'}
      </Button>
    </form>
  );
}

export function PostsList({ onEdit }) {
  const { data: posts = [] } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
  });

  const qc = useQueryClient();

  const remove = async (id) => {
    if (!window.confirm('Delete this post?')) return;

    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) {
      window.alert(`Could not delete post: ${error.message}`);
      return;
    }

    qc.invalidateQueries({ queryKey: ['admin-posts'] });
    qc.invalidateQueries({ queryKey: ['journal-posts'] });
    qc.invalidateQueries({ queryKey: ['journal-related-posts'] });
  };

  if (!posts.length) {
    return (
      <p className="font-mono text-xs text-muted-foreground">
        No posts yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {posts.map((p) => (
        <div key={p.id} className="flex items-center justify-between py-3">
          <div>
            <p className="font-sans text-sm font-medium text-foreground">
              {p.title}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {p.status} · {p.published_date}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onEdit?.(p)}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label={`Edit ${p.title}`}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => remove(p.id)}
              className="text-muted-foreground hover:text-destructive transition-colors"
              aria-label={`Delete ${p.title}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
