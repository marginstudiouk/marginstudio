import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function WorkInProgressCTA() {
  return (
    <section className="px-6 lg:px-10 py-16 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto bg-secondary/50 p-10 md:p-16"
      >
        <span className="font-mono text-xs tracking-widest uppercase text-primary mb-4 block">Resources</span>
        <h2 className="font-display text-4xl md:text-5xl tracking-wide text-foreground leading-[0.9] mb-6">
          Still feel like a work in progress?
        </h2>
        <p className="text-sm font-sans text-muted-foreground leading-relaxed mb-10 max-w-lg">
          Practical planners, guides, and templates to help you organise your marketing, understand your options, and feel more confident sharing your work.
        </p>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Link
            to="/shop"
            className="inline-flex items-center font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-8 py-4 group"
          >
            Browse the shop
            <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/resources"
            className="inline-flex items-center font-mono text-xs tracking-widest uppercase text-primary border border-primary hover:bg-primary hover:text-primary-foreground transition-colors px-8 py-4 group"
          >
            Free resources
            <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}