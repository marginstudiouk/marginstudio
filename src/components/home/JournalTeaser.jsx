import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
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

export default function JournalTeaser() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['journal-teaser'],
    queryFn: async () => {
      const { data, error } = await supabase.from('posts').select('*').eq('status', 'published').order('published_date', { ascending: false }).limit(3);
      if (error) throw error;
      return data;
    },
  });

  if (!isLoading && posts.length === 0) return null;

  return (
    <section className="border-t border-border px-6 lg:px-10 pt-16 md:pt-20 pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="max-w-xl">
            <p className="font-mono text-xs tracking-widest uppercase text-primary mb-3">Journal</p>
            <h2 className="font-display text-4xl md:text-5xl tracking-wide text-foreground leading-[0.95] mb-5">
              Notes from the studio
            </h2>
            <p className="text-sm font-sans text-muted-foreground leading-relaxed">
              Thinking on book marketing, branding, and the craft of reaching the right readers.
            </p>
          </div>
          <Link
            to="/journal"
            className="hidden md:inline-flex items-center font-mono text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors group"
          >
            Read the journal
            <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-56 bg-secondary/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
              >
                <Link to={`/journal/${post.slug}`} className="group block h-full flex flex-col">
                  {post.cover_image_url && (
                    <div className="aspect-[4/3] overflow-hidden bg-secondary/50 mb-5">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-3 block">
                    {fmtDate(post.published_date)}
                  </span>
                  <h3 className="font-display text-xl md:text-2xl uppercase tracking-wide text-foreground group-hover:text-primary transition-colors leading-none mb-3">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm font-sans text-muted-foreground leading-relaxed">{post.excerpt}</p>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-10 md:hidden">
          <Link
            to="/journal"
            className="inline-flex items-center font-mono text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors group"
          >
            Read the journal
            <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}