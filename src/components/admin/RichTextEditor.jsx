
import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import {
  Bold, Italic, Heading2, List, ListOrdered, Quote,
  Undo, Redo, Link2, Unlink, ImagePlus,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

function Tool({ label, active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={Boolean(active)}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`p-2 transition-colors disabled:opacity-40 ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  onUploadStateChange,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing…',
      }),
      Image.configure({ allowBase64: false }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    const incoming = value || '';
    if (editor.getHTML() !== incoming) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
  }, [editor, value]);

  const addLink = () => {
    const oldUrl = editor.getAttributes('link').href || '';
    const answer = window.prompt('Enter link URL:', oldUrl);
    if (answer === null) return;

    const raw = answer.trim();
    if (!raw) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    const url = /^(https?:\/\/|mailto:|\/)/i.test(raw)
      ? raw
      : `https://${raw}`;

    let valid = url.startsWith('/') && !url.startsWith('//');

    if (/^https?:\/\//i.test(url)) {
      try {
        const parsed = new URL(url);
        valid = ['http:', 'https:'].includes(parsed.protocol)
          && Boolean(parsed.hostname);
      } catch {
        valid = false;
      }
    }

    if (/^mailto:/i.test(url)) {
      valid = /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(url);
    }

    if (!valid) {
      window.alert('Please enter a valid URL.');
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({
      href: url,
      target: url.startsWith('/') ? '_self' : '_blank',
      rel: 'noopener noreferrer',
    }).run();
  };

  const insertImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !editor) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    const alt = window.prompt('Image description (alt text):');
    if (alt === null) return;

    const position = editor.state.selection.from;
    setUploading(true);
    onUploadStateChange?.(true);
    setError('');

    try {
      const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const path = `journal-inline/${crypto.randomUUID()}-${filename}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(path, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(path);

      const safePosition = Math.min(position, editor.state.doc.content.size);

      const success = editor.chain().focus().insertContentAt(
        safePosition,
        {
          type: 'image',
          attrs: { src: data.publicUrl, alt: alt.trim() },
        }
      ).run();

      if (!success) throw new Error('The image could not be inserted.');
    } catch (err) {
      setError(`Image upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      onUploadStateChange?.(false);
    }
  };

  if (!editor) return null;

  return (
    <div className="border border-input bg-background">
      <div className="flex items-center flex-wrap gap-1 border-b border-input p-1.5">
        <Tool label="Bold" active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-4 h-4" />
        </Tool>

        <Tool label="Italic" active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-4 h-4" />
        </Tool>

        <Tool label="Heading" active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="w-4 h-4" />
        </Tool>

        <Tool label="Bullet list" active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-4 h-4" />
        </Tool>

        <Tool label="Numbered list" active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-4 h-4" />
        </Tool>

        <Tool label="Quote" active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="w-4 h-4" />
        </Tool>

        <div className="w-px h-5 bg-border mx-1" />

        <Tool label="Add or edit link" active={editor.isActive('link')}
          onClick={addLink}>
          <Link2 className="w-4 h-4" />
        </Tool>

        <Tool label="Remove link" disabled={!editor.isActive('link')}
          onClick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()}>
          <Unlink className="w-4 h-4" />
        </Tool>

        <Tool label="Insert image" disabled={uploading}
          onClick={() => inputRef.current?.click()}>
          <ImagePlus className="w-4 h-4" />
        </Tool>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={insertImage}
        />

        <div className="w-px h-5 bg-border mx-1" />

        <Tool label="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="w-4 h-4" />
        </Tool>

        <Tool label="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="w-4 h-4" />
        </Tool>
      </div>

      <p className="px-4 pt-2 text-xs text-muted-foreground">
        Enter for a new paragraph. Shift + Enter for a single line break.
      </p>

      {uploading && (
        <p className="px-4 pt-2 text-sm text-muted-foreground">
          Uploading image…
        </p>
      )}
      {error && (
        <p role="alert" className="px-4 pt-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <EditorContent
        editor={editor}
        className="prose prose-lg max-w-none p-4 min-h-[300px] font-sans
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror]:min-h-[280px]
          [&_.ProseMirror_p]:text-base
          [&_.ProseMirror_p]:text-muted-foreground
          [&_.ProseMirror_p]:leading-relaxed
          [&_.ProseMirror_p]:mb-6
          [&_.ProseMirror_h2]:font-display
          [&_.ProseMirror_h2]:text-2xl
          [&_.ProseMirror_h2]:text-foreground
          [&_.ProseMirror_h2]:mt-10
          [&_.ProseMirror_h2]:mb-4
          [&_.ProseMirror_h3]:text-lg
          [&_.ProseMirror_h3]:font-semibold
          [&_.ProseMirror_ul]:list-disc
          [&_.ProseMirror_ul]:pl-6
          [&_.ProseMirror_ol]:list-decimal
          [&_.ProseMirror_ol]:pl-6
          [&_.ProseMirror_a]:text-primary
          [&_.ProseMirror_a]:underline
          [&_.ProseMirror_img]:max-w-full
          [&_.ProseMirror_img]:h-auto
          [&_.ProseMirror_img]:my-8"
      />
    </div>
  );
}
