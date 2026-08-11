import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { services } from '@/lib/servicesData';

export default function Services() {
  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20 max-w-2xl"
        >
          <span className="font-mono text-xs tracking-widest uppercase text-primary mb-3 block">Studio</span>
          <h1 className="font-display text-6xl md:text-8xl tracking-wide text-foreground leading-[0.9] mb-6">
            Services
          </h1>
          <p className="text-sm font-sans text-muted-foreground leading-relaxed">
            We work with authors and publishers who want thoughtful, strategic marketing that respects their readers and elevates their work. Every engagement is bespoke.
          </p>
        </motion.div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 [grid-auto-rows:1fr]">
          {services.map((service, i) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
            >
              <Link to={`/services/${service.slug}`} className="group bg-secondary/50 p-8 lg:p-10 h-full flex flex-col hover:bg-primary transition-colors">
                <span className="font-mono text-xs text-primary group-hover:text-primary-foreground/70 tracking-widest block mb-6 transition-colors">
                  {service.num}
                </span>
                <h3 className="font-display text-2xl md:text-3xl uppercase tracking-wide text-foreground group-hover:text-primary-foreground leading-none mb-4 transition-colors">
                  {service.name}
                </h3>
                <p className="text-sm font-sans text-muted-foreground group-hover:text-primary-foreground/80 leading-relaxed mb-6 flex-1 transition-colors">
                  {service.shortDescription}
                </p>
                <span className="inline-flex items-center font-mono text-xs tracking-widest uppercase text-primary group-hover:text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Premade covers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 pt-16 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center"
        >
          <div className="md:col-span-8">
            <p className="font-mono text-xs tracking-widest uppercase text-primary mb-3">Shop</p>
            <h2 className="font-display text-3xl md:text-4xl tracking-wide text-foreground leading-[0.95] mb-4">
              Premade book covers
            </h2>
            <p className="text-sm font-sans text-muted-foreground leading-relaxed max-w-md mb-6">
              Ready-to-buy cover designs for authors who want a professional look without a full custom commission. Each cover is sold once and made yours.
            </p>
            <Link
              to="/shop?category=premade_covers"
              className="inline-flex items-center font-mono text-xs tracking-widest uppercase border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors px-6 py-3 group"
            >
              Browse premade covers
              <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="md:col-span-4 aspect-[3/4] overflow-hidden bg-secondary/50">
            <img
              src="/images/services/book-covers.svg"
              alt="Premade book covers"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* CTA block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 pt-16"
        >
          <h2 className="font-display text-4xl md:text-5xl tracking-wide text-foreground leading-[0.9] mb-4">
            Ready to work<br />together?
          </h2>
          <p className="text-sm font-sans text-muted-foreground mb-10 max-w-md leading-relaxed">
            We take on a limited number of projects each quarter. Get in touch to discuss your book, your goals, and how we can help.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-8 py-4 group"
          >
            Get in touch
            <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>


      </div>
    </div>
  );
}