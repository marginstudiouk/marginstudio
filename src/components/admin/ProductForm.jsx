import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2, Plus, X } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

const categoryOptions = [
  { value: 'launch_kits', label: 'Launch kits' },
  { value: 'content_systems', label: 'Content systems' },
  { value: 'branding_kits', label: 'Branding kits' },
  { value: 'templates', label: 'Templates' },
  { value: 'premade_covers', label: 'Premade covers' },
];

export default function ProductForm() {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [form, setForm] = useState({
    name: '', slug: '', short_description: '', positioning_statement: '', what_this_is: '',
    included_items: '', audience: '', category: 'templates', price: '', cover_image_url: '',
    gallery_urls: [], storage_path: '', stripe_price_id: '', is_free: false,
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from('product-files').upload(path, file);
      if (error) throw error;
      setForm((f) => ({ ...f, storage_path: path }));
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setGalleryUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const path = `product-gallery/${crypto.randomUUID()}-${file.name}`;
        const { error } = await supabase.storage.from('images').upload(path, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(path);
        uploadedUrls.push(publicUrl);
      }
      setForm((f) => ({ ...f, gallery_urls: [...f.gallery_urls, ...uploadedUrls] }));
    } finally {
      setGalleryUploading(false);
      e.target.value = '';
    }
  };

  const removeGalleryImage = (url) => {
    setForm((f) => ({ ...f, gallery_urls: f.gallery_urls.filter((u) => u !== url) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setDone(false);
    try {
      const { error } = await supabase.from('products').insert({
        name: form.name,
        slug: form.slug || slugify(form.name),
        short_description: form.short_description,
        positioning_statement: form.positioning_statement,
        what_this_is: form.what_this_is,
        included_items: form.included_items.split('\n').map((s) => s.trim()).filter(Boolean),
        audience: form.audience,
        category: form.category,
        price: form.price ? Number(form.price) : 0,
        cover_image_url: form.cover_image_url,
        gallery_urls: form.gallery_urls,
        storage_path: form.storage_path || null,
        stripe_price_id: form.stripe_price_id || null,
        is_free: form.is_free,
      });
      if (error) throw error;
      setForm({ name: '', slug: '', short_description: '', positioning_statement: '', what_this_is: '', included_items: '', audience: '', category: 'templates', price: '', cover_image_url: '', gallery_urls: [], storage_path: '', stripe_price_id: '', is_free: false });
      setDone(true);
      qc.invalidateQueries({ queryKey: ['admin-products'] });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {done && <p className="text-sm font-sans text-primary">Product saved.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Name *</Label>
          <Input required value={form.name} onChange={set('name')} className="bg-background rounded-none" />
        </div>
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Slug (auto from name)</Label>
          <Input value={form.slug} onChange={set('slug')} placeholder={slugify(form.name) || 'auto'} className="bg-background rounded-none" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Short description *</Label>
        <Input required value={form.short_description} onChange={set('short_description')} className="bg-background rounded-none" />
      </div>
      <div className="space-y-1.5">
        <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Positioning statement</Label>
        <Input value={form.positioning_statement} onChange={set('positioning_statement')} className="bg-background rounded-none" />
      </div>
      <div className="space-y-1.5">
        <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">What this is</Label>
        <Textarea rows={4} value={form.what_this_is} onChange={set('what_this_is')} className="bg-background rounded-none resize-none" />
      </div>
      <div className="space-y-1.5">
        <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Included items (one per line)</Label>
        <Textarea rows={5} value={form.included_items} onChange={set('included_items')} className="bg-background rounded-none resize-none" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Audience</Label>
          <Input value={form.audience} onChange={set('audience')} className="bg-background rounded-none" />
        </div>
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
            <SelectTrigger className="bg-background rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categoryOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Price (GBP) *</Label>
          <Input required type="number" step="0.01" value={form.price} onChange={set('price')} className="bg-background rounded-none" />
        </div>
      </div>
      <div className="flex items-center justify-between py-2">
        <div>
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Free resource</Label>
          <p className="text-xs font-sans text-muted-foreground/70 mt-1">Shows on the Resources page instead of the Shop.</p>
        </div>
        <Switch checked={form.is_free} onCheckedChange={(v) => setForm((f) => ({ ...f, is_free: v }))} />
      </div>
      {!form.is_free && (
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Stripe price ID</Label>
          <Input
            value={form.stripe_price_id}
            onChange={set('stripe_price_id')}
            placeholder="price_1AbCdEfGhIjKlMn"
            className="bg-background rounded-none font-mono text-sm"
          />
          <p className="text-xs font-sans text-muted-foreground/70">
            Create a matching Product + Price in the Stripe Dashboard first, then paste the Price ID here. Required before this can be purchased.
          </p>
        </div>
      )}
      <div className="space-y-1.5">
        <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Cover image URL</Label>
        <Input value={form.cover_image_url} onChange={set('cover_image_url')} className="bg-background rounded-none" placeholder="/images/products/... or a full URL" />
        <p className="text-xs font-sans text-muted-foreground/70">The main thumbnail shown in the shop grid.</p>
      </div>
      <div className="space-y-1.5">
        <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Additional images</Label>
        <p className="text-xs font-sans text-muted-foreground/70 mb-2">Shown as a gallery on the product page. Select multiple files at once, or add more one at a time.</p>
        {form.gallery_urls.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {form.gallery_urls.map((url) => (
              <div key={url} className="relative aspect-square bg-muted overflow-hidden group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(url)}
                  className="absolute top-1 right-1 bg-background/90 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="flex items-center justify-center cursor-pointer bg-muted hover:bg-muted/70 px-4 py-6 transition-colors">
          <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">{galleryUploading ? 'Uploading…' : 'Add image(s)'}</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={galleryUploading} />
        </label>
      </div>
      <div className="space-y-1.5">
        <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Downloadable file</Label>
        {form.storage_path ? (
          <div className="flex items-center justify-between bg-muted px-4 py-3">
            <span className="font-mono text-xs text-muted-foreground truncate max-w-[60%]">{form.storage_path.split('/').pop()}</span>
            <button type="button" onClick={() => setForm((f) => ({ ...f, storage_path: '' }))} className="font-mono text-xs text-primary hover:underline">Replace</button>
          </div>
        ) : (
          <label className="flex items-center justify-center cursor-pointer bg-muted hover:bg-muted/70 px-4 py-6 transition-colors">
            <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">{uploading ? 'Uploading…' : 'Choose file'}</span>
            <input type="file" className="hidden" onChange={handleFile} disabled={uploading} />
          </label>
        )}
      </div>
      <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-mono text-xs tracking-widest uppercase px-6 py-4 disabled:opacity-60">
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
        Save product
      </Button>
    </form>
  );
}

export function ProductsList() {
  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });
  const qc = useQueryClient();

  const remove = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['admin-products'] });
  };

  if (products.length === 0) return <p className="font-mono text-xs text-muted-foreground">No products yet.</p>;

  return (
    <div className="space-y-2">
      {products.map((p) => (
        <div key={p.id} className="flex items-center justify-between py-3">
          <div>
            <p className="font-sans text-sm font-medium text-foreground">{p.name}</p>
            <p className="font-mono text-xs text-muted-foreground">
              £{p.price} · {p.category}{p.is_free ? ' · free' : ''}{!p.is_free && !p.stripe_price_id ? ' · ⚠ no Stripe price' : ''}
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
