
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2, Plus, X, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-');

const categoryOptions = [
  { value: 'diy_kits', label: 'DIY Kits' },
  { value: 'templates', label: 'Templates' },
  { value: 'premade_covers', label: 'Premade Covers' },
  { value: 'elements', label: 'Elements' },
];

const emptyVariant = () => ({
  id: crypto.randomUUID(),
  label: '',
  price: '',
});

const makeEmptyForm = () => ({
  name: '', slug: '', short_description: '',
  positioning_statement: '', what_this_is: '',
  included_items: '', audience: '',
  category: 'diy_kits', price: '',
  cover_image_url: '', gallery_urls: [],
  storage_path: '', is_free: false,
  sold_out: false, variants: [],
});

const productToForm = (p) => ({
  name: p.name || '',
  slug: p.slug || '',
  short_description: p.short_description || '',
  positioning_statement: p.positioning_statement || '',
  what_this_is: p.what_this_is || '',
  included_items: (p.included_items || []).join('\n'),
  audience: p.audience || '',
  category: p.category || 'diy_kits',
  price: p.price != null ? String(p.price) : '',
  cover_image_url: p.cover_image_url || '',
  gallery_urls: Array.isArray(p.gallery_urls) ? p.gallery_urls : [],
  storage_path: p.storage_path || '',
  is_free: !!p.is_free,
  sold_out: !!p.sold_out,
  variants: (p.variants || []).map((v) => ({
    id: v.id,
    label: v.label,
    price: String(v.price),
  })),
});

async function uploadImage(folder, file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file.');
  }

  const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `${folder}/${crypto.randomUUID()}-${filename}`;

  const { error } = await supabase.storage
    .from('images')
    .upload(path, file, { contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(path);

  return data.publicUrl;
}

export default function ProductForm({ editingProduct, onDone }) {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(makeEmptyForm);

  React.useEffect(() => {
    setForm(editingProduct ? productToForm(editingProduct) : makeEmptyForm());
    setDone(false);
    setError('');
  }, [editingProduct]);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const addVariant = () =>
    setForm((f) => ({
      ...f,
      variants: [...f.variants, emptyVariant()],
    }));

  const removeVariant = (id) =>
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((v) => v.id !== id),
    }));

  const updateVariant = (id, field, value) =>
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      ),
    }));

  const persistGallery = async (urls) => {
    if (!editingProduct) return;

    const { error: saveError } = await supabase
      .from('products')
      .update({ gallery_urls: urls })
      .eq('id', editingProduct.id);

    if (saveError) throw saveError;

    qc.invalidateQueries({ queryKey: ['admin-products'] });
    qc.invalidateQueries({ queryKey: ['product'] });
    qc.invalidateQueries({ queryKey: ['products'] });
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setCoverUploading(true);
    setError('');

    try {
      const url = await uploadImage('product-covers', file);
      setForm((f) => ({ ...f, cover_image_url: url }));
    } catch (err) {
      setError(`Cover upload failed: ${err.message}`);
    } finally {
      setCoverUploading(false);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const path = `${crypto.randomUUID()}-${filename}`;

      const { error: uploadError } = await supabase.storage
        .from('product-files')
        .upload(path, file);

      if (uploadError) throw uploadError;

      setForm((f) => ({ ...f, storage_path: path }));
    } catch (err) {
      setError(`File upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    setGalleryUploading(true);
    setError('');

    try {
      // Each successful upload is retained, even if a later file fails.
      for (const file of files) {
        const url = await uploadImage('product-gallery', file);

        const currentUrls = Array.isArray(form.gallery_urls)
          ? form.gallery_urls
          : [];

        // Read the latest saved state for existing products.
        let urls = [...currentUrls];

        if (editingProduct) {
          const { data, error: fetchError } = await supabase
            .from('products')
            .select('gallery_urls')
            .eq('id', editingProduct.id)
            .single();

          if (fetchError) throw fetchError;

          const savedUrls = Array.isArray(data.gallery_urls)
            ? data.gallery_urls
            : [];

          urls = [...new Set([...savedUrls, ...urls, url])];
          await persistGallery(urls);
        } else {
          urls = [...new Set([...urls, url])];
        }

        form.gallery_urls = urls;
        setForm((f) => ({ ...f, gallery_urls: urls }));
      }
    } catch (err) {
      setError(`Gallery upload or save failed: ${err.message}`);
    } finally {
      setGalleryUploading(false);
    }
  };

  const removeGalleryImage = async (url) => {
    const previous = [...form.gallery_urls];
    const next = previous.filter((item) => item !== url);

    setError('');
    setGalleryUploading(true);

    try {
      await persistGallery(next);
      setForm((f) => ({ ...f, gallery_urls: next }));
    } catch (err) {
      setError(`Could not remove image: ${err.message}`);
    } finally {
      setGalleryUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (uploading || coverUploading || galleryUploading) {
      setError('Please finish uploading before saving.');
      return;
    }

    setSaving(true);
    setDone(false);
    setError('');

    try {
      const cleanVariants = form.variants
        .filter((v) => v.label && v.price)
        .map((v) => ({
          id: v.id,
          label: v.label,
          price: Number(v.price),
        }));

      const derivedPrice = cleanVariants.length > 0
        ? Math.min(...cleanVariants.map((v) => v.price))
        : form.price ? Number(form.price) : 0;

      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        short_description: form.short_description,
        positioning_statement: form.positioning_statement,
        what_this_is: form.what_this_is,
        included_items: form.included_items.split('\n')
          .map((s) => s.trim()).filter(Boolean),
        audience: form.audience,
        category: form.category,
        price: derivedPrice,
        cover_image_url: form.cover_image_url,
        gallery_urls: form.gallery_urls,
        storage_path: form.storage_path || null,
        is_free: form.is_free,
        sold_out: form.sold_out,
        variants: cleanVariants,
      };

      const { error: saveError } = editingProduct
        ? await supabase.from('products')
            .update(payload).eq('id', editingProduct.id)
        : await supabase.from('products').insert(payload);

      if (saveError) throw saveError;

      setDone(true);
      await qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['product'] });
      qc.invalidateQueries({ queryKey: ['products'] });

      if (editingProduct) {
        onDone?.();
      } else {
        setForm(makeEmptyForm());
      }
    } catch (err) {
      setError(`Could not save product: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const busy = saving || uploading || coverUploading || galleryUploading;

  return (
    <form onSubmit={submit} className="space-y-6">
      {editingProduct && (
        <div className="flex items-center justify-between bg-primary/5 border border-primary/30 px-4 py-3">
          <p className="font-mono text-xs tracking-widest uppercase text-primary">
            Editing "{editingProduct.name}"
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
          {editingProduct ? 'Product updated.' : 'Product saved.'}
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
            Name *
          </Label>
          <Input
            required
            value={form.name}
            onChange={set('name')}
            className="bg-background rounded-none"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
            Slug (auto from name)
          </Label>
          <Input
            value={form.slug}
            onChange={set('slug')}
            placeholder={slugify(form.name) || 'auto'}
            className="bg-background rounded-none"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
          Short description *
        </Label>
        <Input
          required
          value={form.short_description}
          onChange={set('short_description')}
          className="bg-background rounded-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
          Positioning statement
        </Label>
        <Input
          value={form.positioning_statement}
          onChange={set('positioning_statement')}
          className="bg-background rounded-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
          What this is
        </Label>
        <Textarea
          rows={4}
          value={form.what_this_is}
          onChange={set('what_this_is')}
          className="bg-background rounded-none resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
          Included items (one per line)
        </Label>
        <Textarea
          rows={5}
          value={form.included_items}
          onChange={set('included_items')}
          className="bg-background rounded-none resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
            Audience
          </Label>
          <Input
            value={form.audience}
            onChange={set('audience')}
            className="bg-background rounded-none"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
            Category
          </Label>
          <Select
            value={form.category}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, category: v }))
            }
          >
            <SelectTrigger className="bg-background rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {form.variants.length === 0 && (
          <div className="space-y-1.5">
            <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
              Price (GBP) *
            </Label>
            <Input
              required
              type="number"
              step="0.01"
              value={form.price}
              onChange={set('price')}
              className="bg-background rounded-none"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between py-2">
        <div>
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
            Free resource
          </Label>
          <p className="text-xs font-sans text-muted-foreground/70 mt-1">
            Shows on the Resources page instead of the Shop.
          </p>
        </div>
        <Switch
          checked={form.is_free}
          onCheckedChange={(v) =>
            setForm((f) => ({ ...f, is_free: v }))
          }
        />
      </div>

      <div className="flex items-center justify-between py-2">
        <div>
          <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
            Sold out
          </Label>
          <p className="text-xs font-sans text-muted-foreground/70 mt-1">
            Hides the buy button and shows "Sold out". Premade covers
            get this set automatically when they sell.
          </p>
        </div>
        <Switch
          checked={form.sold_out}
          onCheckedChange={(v) =>
            setForm((f) => ({ ...f, sold_out: v }))
          }
        />
      </div>

      {!form.is_free && (
        <div className="space-y-2">
          <div>
            <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
              Pricing options
            </Label>
            <p className="text-xs font-sans text-muted-foreground/70 mt-1">
              E.g. Ebook at £65 and Ebook + Print at £95.
              The cheapest option shows in the shop grid.
            </p>
          </div>

          {form.variants.map((v) => (
            <div
              key={v.id}
              className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_auto] gap-2 items-start bg-muted/50 p-3 rounded-[8px]"
            >
              <Input
                placeholder="Label, e.g. Ebook + Print"
                value={v.label}
                onChange={(e) =>
                  updateVariant(v.id, 'label', e.target.value)
                }
                className="bg-background rounded-none"
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Price"
                value={v.price}
                onChange={(e) =>
                  updateVariant(v.id, 'price', e.target.value)
                }
                className="bg-background rounded-none"
              />
              <button
                type="button"
                onClick={() => removeVariant(v.id)}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addVariant}
            className="font-mono text-xs tracking-widest uppercase text-primary hover:underline"
          >
            + Add pricing option
          </button>
        </div>
      )}

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

        <p className="text-xs font-sans text-muted-foreground/70">
          The main thumbnail shown in the shop grid.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
          Additional images
        </Label>
        <p className="text-xs font-sans text-muted-foreground/70 mb-2">
          Shown as a gallery on the product page.
          You can select multiple images.
        </p>

        {form.gallery_urls.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {form.gallery_urls.map((url) => (
              <div
                key={url}
                className="relative aspect-square bg-muted overflow-hidden group rounded-[8px]"
              >
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(url)}
                  disabled={busy}
                  aria-label="Remove image"
                  className="absolute top-1 right-1 bg-background/90 p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="flex items-center justify-center cursor-pointer bg-muted hover:bg-muted/70 px-4 py-6 transition-colors">
          <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
            {galleryUploading ? 'Uploading and saving…' : 'Add image(s)'}
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

        {!editingProduct && (
          <p className="text-xs text-muted-foreground">
            For a new product, click Save product after adding images.
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
          Downloadable file
        </Label>

        {form.storage_path ? (
          <div className="flex items-center justify-between bg-muted px-4 py-3">
            <span className="font-mono text-xs text-muted-foreground truncate max-w-[60%]">
              {form.storage_path.split('/').pop()}
            </span>
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, storage_path: '' }))
              }
              className="font-mono text-xs text-primary hover:underline"
            >
              Replace
            </button>
          </div>
        ) : (
          <label className="flex items-center justify-center cursor-pointer bg-muted hover:bg-muted/70 px-4 py-6 transition-colors">
            <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
              {uploading ? 'Uploading…' : 'Choose file'}
            </span>
            <input
              type="file"
              className="hidden"
              onChange={handleFile}
              disabled={busy}
            />
          </label>
        )}
      </div>

      <Button
        type="submit"
        disabled={busy}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-mono text-xs tracking-widest uppercase px-6 py-4 disabled:opacity-60"
      >
        {saving
          ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          : <Plus className="w-4 h-4 mr-2" />}
        {editingProduct ? 'Update product' : 'Save product'}
      </Button>
    </form>
  );
}

export function ProductsList({ onEdit }) {
  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
  });

  const qc = useQueryClient();

  const remove = async (id) => {
    if (!window.confirm('Delete this product?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      window.alert(`Could not delete product: ${error.message}`);
      return;
    }

    qc.invalidateQueries({ queryKey: ['admin-products'] });
    qc.invalidateQueries({ queryKey: ['product'] });
    qc.invalidateQueries({ queryKey: ['products'] });
  };

  if (!products.length) {
    return (
      <p className="font-mono text-xs text-muted-foreground">
        No products yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {products.map((p) => {
        const hasVariants =
          Array.isArray(p.variants) && p.variants.length > 0;

        return (
          <div
            key={p.id}
            className="flex items-center justify-between py-3"
          >
            <div>
              <p className="font-sans text-sm font-medium text-foreground">
                {p.name}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                £{p.price} · {p.category}
                {p.is_free ? ' · free' : ''}
                {p.sold_out ? ' · sold out' : ''}
                {hasVariants ? ` · ${p.variants.length} options` : ''}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onEdit?.(p)}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Edit ${p.name}`}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label={`Delete ${p.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
