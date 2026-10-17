
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link2,
  Unlink,
} from 'lucide-react';

function ToolbarButton({ onClick, active, children, label }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={Boolean(active)}
      className={`p-2 transition-colors ${
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
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          HTMLAttributes: {
            rel: 'noopener noreferrer',
          },
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing…',
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const incoming = value || '';

    if (editor.getHTML() !== incoming) {
      editor.commands.setContent(incoming, {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  if (!editor) return null;

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href || '';

    const enteredUrl = window.prompt(
      'Enter link URL:',
      previousUrl
    );

    if (enteredUrl === null) return;

    const url = enteredUrl.trim();

    if (!url) {
      if (editor.isActive('link')) {
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .unsetLink()
          .run();
      }
      return;
    }

    let formattedUrl = url;

    if (
      !url.startsWith('/') &&
      !/^https?:\/\//i.test(url) &&
      !/^mailto:/i.test(url)
    ) {
      formattedUrl = `https://${url}`;
    }

    const isInternalPath =
      formattedUrl.startsWith('/') &&
      !formattedUrl.startsWith('//');

    const isEmail = /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(
      formattedUrl
    );

    let isWebUrl = false;

    if (/^https?:\/\//i.test(formattedUrl)) {
      try {
        const parsedUrl = new URL(formattedUrl);
        isWebUrl =
          ['http:', 'https:'].includes(parsedUrl.protocol) &&
          Boolean(parsedUrl.hostname);
      } catch {
        isWebUrl = false;
      }
    }

    if (!isInternalPath && !isEmail && !isWebUrl) {
      window.alert(
        'Please enter a valid website URL, email link or internal page path.'
      );
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({
        href: formattedUrl,
        target: isInternalPath ? '_self' : '_blank',
      })
      .run();
  };

  const removeLink = () => {
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .unsetLink()
      .run();
  };

  return (
    <div className="border border-input bg-background">
      <div className="flex items-center gap-1 border-b border-input p-1.5 flex-wrap">
        <ToolbarButton
          label="Bold"
          active={editor.isActive('bold')}
          onClick={() =>
            editor.chain().focus().toggleBold().run()
          }
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Italic"
          active={editor.isActive('italic')}
          onClick={() =>
            editor.chain().focus().toggleItalic().run()
          }
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Heading"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: 2 })
              .run()
          }
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() =>
            editor.chain().focus().toggleBulletList().run()
          }
        >
          <List className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Quote"
          active={editor.isActive('blockquote')}
          onClick={() =>
            editor.chain().focus().toggleBlockquote().run()
          }
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          label="Add or edit link"
          active={editor.isActive('link')}
          onClick={addLink}
        >
          <Link2 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Remove link"
          onClick={removeLink}
        >
          <Unlink className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          label="Undo"
          onClick={() =>
            editor.chain().focus().undo().run()
          }
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Redo"
          onClick={() =>
            editor.chain().focus().redo().run()
          }
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px] [&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline"
      />
    </div>
  );
}
