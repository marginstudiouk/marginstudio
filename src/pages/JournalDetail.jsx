import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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

  const { data: allPosts = [] } = useQuery({
    queryKey: ['journal-related-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('published_date', { ascending: false });

      if (error) throw error;
      return data || [];
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

  const otherPosts = allPosts.filter((item) => item.id !== post.id);

  const relatedByTag = otherPosts.filter((item) =>
    (item.tags || []).some((tag) => (post.tags || []).includes(tag))
  );

  const relatedPosts = [
    ...relatedByTag,
    ...otherPosts.filter((item) => !relatedByTag.some((related) => related.id === item.id)),
  ].slice(0, 2);

  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
       <div className="max-w-4xl mx-auto">
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
            className="w-full h-auto mb-12 rounded-[8px]"
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
          <div dangerouslySetInnerHTML={{ __html: post.content || '' }} />
        </motion.article>

        {post.gallery_urls && post.gallery_urls.length > 0 && (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4">
            {post.gallery_urls.map((url, i) => (
              <div key={i} className="aspect-square overflow-hidden bg-background rounded-[8px]">
                <img src={url} alt={`${post.title} ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="font-mono text-xs text-muted-foreground bg-muted px-3 py-1">{tag}</span>
            ))}
          </div>
        )}

        {relatedPosts.length > 0 && (
          <section className="mt-24">
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-8">
              You might also like
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  to={`/journal/${related.slug}`}
                  className="group block"
                >
                  {related.cover_image_url && (
                    <div className="aspect-[4/3] overflow-hidden bg-secondary/50 rounded-[8px] mb-5">
                      <img
                        src={related.cover_image_url}
                        alt={related.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                  )}

                  <p className="font-mono text-xs tracking-widest uppercase text-primary mb-3">
                    {fmtDate(related.published_date)}
                  </p>

                  <h2 className="font-display text-2xl md:text-3xl tracking-wide text-foreground leading-tight mb-3 group-hover:text-primary transition-colors">
                    {related.title}
                  </h2>

                  {related.excerpt && (
                    <p className="text-sm font-sans text-muted-foreground leading-relaxed mb-4">
                      {related.excerpt}
                    </p>
                  )}

                  <span className="font-mono text-xs tracking-widest uppercase text-primary">
                    Read article
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
       </div>
      </div>
    </div>
  );
}
