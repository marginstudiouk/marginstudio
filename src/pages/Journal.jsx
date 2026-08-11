import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';

export default function Journal() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['journal-posts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('posts').select('*').eq('status', 'published').order('published_date', { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-2xl"
        >
          <span className="font-mono text-xs tracking-widest uppercase text-primary mb-3 block">Studio</span>
          <h1 className="font-display text-5xl md:text-7xl tracking-wide text-foreground leading-[0.9] mb-6">
            Journal
          </h1>
          <p className="text-base font-sans text-muted-foreground leading-relaxed">
            Notes on book marketing, branding, and the craft of getting good work in front of the right readers.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="break-inside-avoid mb-6 bg-secondary/50 animate-pulse" style={{ height: `${200 + (i % 3) * 80}px` }} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">No posts yet.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.05 }}
                className="break-inside-avoid mb-6"
              >
                <Link to={`/journal/${post.slug}`} className="group block">
                  {post.cover_image_url ? (
                    <div className="overflow-hidden bg-secondary/50">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-secondary/50 flex items-center justify-center p-8">
                      <span className="font-display text-2xl uppercase tracking-wide text-muted-foreground/60 text-center">{post.title}</span>
                    </div>
                  )}
                  <h3 className="font-display text-xl md:text-2xl uppercase tracking-wide text-foreground group-hover:text-primary transition-colors mt-4 leading-none">
                    {post.title}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}