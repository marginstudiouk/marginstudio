import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function WorkInProgressCTA() {
  return (
    <section className="px-6 lg:px-10 py-16 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto bg-secondary/50 p-10 md:p-16 rounded-[8px] text-center"
      >
        <h2 className="font-display text-4xl md:text-5xl tracking-wide text-foreground leading-[0.9] mb-6">
          Still feel like a work in progress?
        </h2>
        <p className="text-sm font-sans text-muted-foreground leading-relaxed mb-10 max-w-lg mx-auto">
          Practical planners, guides, and templates to help you organise your marketing, understand your options, and feel more confident sharing your work.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/shop"
            className="inline-flex items-center font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-8 py-4 group"
          >
            Browse the shop
          </Link>
          <Link
            to="/resources"
            className="inline-flex items-center font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-8 py-4 group"
          >
            Free resources
          </Link>
        </div>
      </motion.div>
    </section>
  );
}