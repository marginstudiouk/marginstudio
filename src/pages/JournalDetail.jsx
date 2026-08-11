import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';

const fmtDate = (d) => {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return d;
  }
};

export default function JournalDetail() {
  const { slug } = useParams();
  const { data: post, isLoading } = useQuery({
    queryKey: ['journal-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase.from('posts').select('*').eq('slug', slug).eq('status', 'published').limit(1);
      if (error) throw error;
      return data?.[0];
    },
  });

  if (isLoading) {
    return <div className="px-6 lg:px-10 py-32 text-center">
      <div className="w-6 h-6 border-2 border-border border-t-foreground rounded-full animate-spin mx-auto" />
    </div>;
  }

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">Post not found.</p>
        <Link to="/journal" className="font-mono text-xs tracking-widest uppercase text-primary border-b border-primary pb-0.5">Back to journal</Link>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/journal"
          className="inline-flex items-center font-mono text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors mb-12 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-2 transition-transform group-hover:-translate-x-1" />
          Journal
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-xs tracking-widest uppercase text-primary">{fmtDate(post.published_date)}</span>
            {post.author && <span className="font-mono text-xs text-muted-foreground">/ {post.author}</span>}
          </div>
          <h1 className="font-display text-4xl md:text-6xl tracking-wide text-foreground leading-[0.9] mb-6">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg font-sans text-muted-foreground leading-relaxed">{post.excerpt}</p>
          )}
        </motion.div>

        {post.cover_image_url && (
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-auto mb-12"
          />
        )}

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="prose prose-lg max-w-none font-sans text-foreground
            [&>p]:text-base [&>p]:text-muted-foreground [&>p]:leading-relaxed [&>p]:mb-6
            [&>h2]:font-display [&>h2]:tracking-wide [&>h2]:text-2xl [&>h2]:text-foreground [&>h2]:mt-10 [&>h2]:mb-4
            [&>h3]:font-sans [&>h3]:font-semibold [&>h3]:text-lg [&>h3]:text-foreground [&>h3]:mt-8 [&>h3]:mb-3
            [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:text-muted-foreground [&>ul]:space-y-2 [&>ul]:mb-6
            [&>a]:text-primary [&>a]:underline
            [&>blockquote]:border-l-2 [&>blockquote]:border-primary [&>blockquote]:pl-5 [&>blockquote]:italic [&>blockquote]:text-muted-foreground"
        >
          <ReactMarkdown
            components={{
              h2: ({ node, ...props }) => <h2 className="font-display tracking-wide" {...props} />,
              p: ({ node, ...props }) => <p {...props} />,
            }}
          >
            {post.content || ''}
          </ReactMarkdown>
        </motion.article>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="font-mono text-xs text-muted-foreground bg-muted px-3 py-1">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}