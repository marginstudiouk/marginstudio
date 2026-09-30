import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { services } from '@/lib/servicesData';

export default function Services() {
  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-2xl"
        >
          <h1 className="font-display text-6xl md:text-8xl tracking-wide text-foreground leading-[0.9] mb-6">
            Services
          </h1>
          <p className="text-sm font-sans text-muted-foreground leading-relaxed">
            Creative, marketing, and publishing support for authors and publishing businesses, built around the work rather than a fixed formula.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 [grid-auto-rows:1fr]">
          {services.map((service, i) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.04 }}
            >
              <Link
                to={`/services/${service.slug}`}
                className="group bg-secondary/50 p-8 lg:p-10 h-full flex flex-col hover:bg-primary transition-colors rounded-[8px]"
              >
                <h2 className="font-display text-2xl md:text-3xl uppercase tracking-wide text-foreground group-hover:text-primary-foreground leading-none mb-4 transition-colors">
                  {service.name}
                </h2>
                <p className="text-sm font-sans text-muted-foreground group-hover:text-primary-foreground/80 leading-relaxed flex-1 transition-colors">
                  {service.shortDescription}
                </p>
                <span className="font-mono text-xs tracking-widest uppercase text-primary group-hover:text-primary-foreground mt-8 transition-colors">
                  Learn more
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center"
        >
          <div className="md:col-span-8">
            <h2 className="font-display text-3xl md:text-4xl tracking-wide text-foreground leading-[0.95] mb-4">
              Premade book covers
            </h2>
            <p className="text-sm font-sans text-muted-foreground leading-relaxed max-w-md mb-6">
              Ready-to-buy cover designs for authors who want a professional cover without a full custom commission. Each design is sold once.
            </p>
            <Link
              to="/shop?category=premade_covers"
              className="inline-flex items-center font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-6 py-3"
            >
              Browse premade covers
            </Link>
          </div>

          <div className="md:col-span-4 aspect-[3/4] overflow-hidden bg-secondary/50 rounded-[8px]">
            <img
              src="/images/services/book-covers.svg"
              alt="Premade book covers"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 max-w-4xl mx-auto bg-secondary/50 p-10 md:p-16 rounded-[8px] text-center"
        >
          <h2 className="font-display text-4xl md:text-5xl tracking-wide text-foreground leading-[0.9] mb-4">
            Ready to work together?
          </h2>
          <p className="text-sm font-sans text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
            Tell us about your project, where you are in the process, and what you need help with.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-8 py-4"
          >
            Get in touch
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
