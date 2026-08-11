import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';

const serviceLabels = {
  branding: 'Branding',
  campaigns: 'Campaigns',
  'social-media': 'Social media',
  'email-marketing': 'Email marketing',
  'book-covers': 'Book covers',
  websites: 'Websites',
};

export default function CaseStudy() {
  const { slug } = useParams();

  const { data: portfolio = [], isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const { data, error } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });

  const item = portfolio.find((p) => p.slug === slug);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-border border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
          Case study not found.
        </p>
        <Link
          to="/services"
          className="font-mono text-xs tracking-widest uppercase text-primary border-b border-primary pb-0.5"
        >
          Back to services
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-5xl mx-auto">
        <Link
          to={`/services/${item.service_type}`}
          className="inline-flex items-center font-mono text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors mb-12 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-2 transition-transform group-hover:-translate-x-1" />
          {serviceLabels[item.service_type] || 'Services'}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <span className="font-mono text-xs tracking-widest uppercase text-primary mb-3 block">
            Case study
          </span>
          {item.client && (
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-3">
              {item.client}
            </p>
          )}
          <h1 className="font-display text-5xl md:text-7xl tracking-wide text-foreground leading-[0.9] mb-6">
            {item.name}
          </h1>
          {item.excerpt && (
            <p className="text-base font-sans text-muted-foreground leading-relaxed max-w-xl">
              {item.excerpt}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="mb-16 overflow-hidden"
        >
          <div className="aspect-[16/10] bg-secondary/50 overflow-hidden">
            {item.cover_image_url && (
              <img
                src={item.cover_image_url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </motion.div>

        {item.content && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="prose-content space-y-6">
              <ReactMarkdown
                components={{
                  h2: ({ node, ...props }) => (
                    <h2 className="font-display text-2xl md:text-3xl tracking-wide text-foreground leading-[0.95] mt-10 mb-4" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-base font-sans text-foreground leading-relaxed" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-5 space-y-2 text-base font-sans text-foreground leading-relaxed" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-semibold text-foreground" {...props} />
                  ),
                }}
              >
                {item.content}
              </ReactMarkdown>
            </div>
          </motion.div>
        )}

        <div className="bg-secondary/50 p-10 md:p-14 mt-20">
          <h2 className="font-display text-3xl md:text-4xl tracking-wide text-foreground leading-[0.9] mb-4">
            Work with us
          </h2>
          <p className="text-sm font-sans text-muted-foreground mb-8 max-w-sm leading-relaxed">
            Tell us about your project and we'll let you know how we can help.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-8 py-4 group"
          >
            Get in touch
            <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}