import React, { useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
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

const today = () => new Date().toISOString().slice(0, 10);

export default function PostForm() {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '', cover_image_url: '', author: '', tags: '', status: 'published', published_date: today(),
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const quillRef = useRef(null);
  const [imgUploading, setImgUploading] = useState(false);

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      setImgUploading(true);
      try {
        const path = `journal/${crypto.randomUUID()}-${file.name}`;
        const { error } = await supabase.storage.from('images').upload(path, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(path);
        const editor = quillRef.current?.getEditor();
        const range = editor.getSelection(true);
        editor.insertEmbed(range.index, 'image', publicUrl);
        editor.setSelection(range.index + 1);
      } finally {
        setImgUploading(false);
      }
    };
  };

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote'],
        ['link', 'image'],
      ],
      handlers: { image: handleImageUpload },
    },
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
        {imgUploading && <p className="font-mono text-xs text-primary">Uploading image…</p>}
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={form.content}
          onChange={(v) => setForm((f) => ({ ...f, content: v }))}
          modules={modules}
          className="bg-background rounded-none [&_.ql-toolbar]:border-none [&_.ql-toolbar]:bg-muted [&_.ql-container]:border-border [&_.ql-editor]:min-h-[320px] [&_.ql-editor]:font-sans [&_.ql-editor]:text-sm"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Cover image URL</Label>
          <Input value={form.cover_image_url} onChange={set('cover_image_url')} className="bg-background rounded-none" />
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
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Publish date</Label>
          <Input type="date" value={form.published_date} onChange={set('published_date')} className="bg-background rounded-none" />
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