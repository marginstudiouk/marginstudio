import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SplitDecision() {
  return (
    <section className="border-t border-border py-16 md:py-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pb-16 md:pb-24 text-center">
        <h2 className="font-display text-4xl md:text-6xl tracking-wide text-foreground leading-[1] mb-4">
          It's time to tell your story
        </h2>
        <p className="text-base md:text-lg font-sans text-muted-foreground max-w-xl mx-auto">
          With campaigns &amp; assets that speak to your readers
        </p>
      </div>

      {/* Two boxes */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-2 border-t border-border">
        {/* Indigo block */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-primary p-10 md:p-12 lg:p-16 relative overflow-hidden md:border-r md:border-primary-foreground/10"
        >
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }}
          />
          <div className="relative z-10">
            <p className="font-mono text-xs tracking-widest uppercase text-primary-foreground/60 mb-8">01</p>
            <h3 className="font-display text-4xl md:text-5xl uppercase tracking-wide text-primary-foreground leading-[0.95] mb-6">
              Done for you
            </h3>
            <p className="text-sm font-sans text-primary-foreground/70 leading-relaxed mb-10 max-w-sm">
              Bespoke branding, campaigns, and creative support for authors and publishers who want a thoughtful, hands-on approach to marketing their books.
            </p>
            <Link
              to="/services"
              className="inline-flex items-center font-mono text-xs tracking-widest uppercase text-primary-foreground border-b border-primary-foreground/40 pb-0.5 hover:border-primary-foreground transition-colors group"
            >
              View services
              <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>

        {/* Muted block */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-secondary/50 p-10 md:p-12 lg:p-16"
        >
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-8">02</p>
          <h3 className="font-display text-4xl md:text-5xl uppercase tracking-wide text-foreground leading-[0.95] mb-6">
            Do it yourself
          </h3>
          <p className="text-sm font-sans text-muted-foreground leading-relaxed mb-10 max-w-sm">
            Templates, guides, and ready-made resources for authors who want to handle their own marketing with clarity and confidence.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center font-mono text-xs tracking-widest uppercase text-foreground border-b border-border pb-0.5 hover:border-foreground transition-colors group"
          >
            Visit shop
            <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}