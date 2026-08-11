import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 lg:px-10 py-16 md:py-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Text */}
        <div className="lg:col-span-6 pt-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <span className="font-mono text-xs text-primary tracking-widest uppercase">
              Marketing studio · Publishing
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-wide text-foreground mb-8"
          >
            Written the book?<br />Find your <span className="text-primary">readers</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="text-base font-sans text-muted-foreground leading-relaxed max-w-xl mb-10"
          >
            We work with authors, publishers, and literary brands to help their books and brands reach the right readers through clear branding and focused marketing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-start gap-4"
          >
            <Link
              to="/services"
              className="font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-6 py-3"
            >
              Work with us
            </Link>
            <Link
              to="/resources"
              className="font-mono text-xs tracking-widest uppercase border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors px-6 py-3"
            >
              Explore resources
            </Link>
          </motion.div>
        </div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6"
        >
          <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-[5/6] overflow-hidden bg-muted">
            <img
              src="/images/hero.svg"
              alt="A selection of book covers designed by the studio"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-mono text-xs text-muted-foreground/40 tracking-widest uppercase mt-4 block">
            Recent covers · studio work
          </span>
        </motion.div>
      </div>
    </section>
  );
}