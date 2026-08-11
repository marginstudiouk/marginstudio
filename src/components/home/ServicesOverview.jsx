import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { services } from '@/lib/servicesData';

export default function ServicesOverview() {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-10 bg-muted">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-3">Studio</p>
            <h2 className="font-display text-4xl md:text-5xl uppercase tracking-wide text-foreground">
              What we do
            </h2>
          </div>
          <Link
            to="/services"
            className="hidden md:inline-flex items-center font-mono text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors group"
          >
            Learn more
            <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div>
          {services.map((service, i) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.04 }}
            >
              <Link to={`/services/${service.slug}`} className="group block py-7 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline">
                <span className="font-mono text-xs text-primary md:col-span-1">{service.num}</span>
                <h3 className="font-display text-2xl uppercase tracking-wide text-foreground md:col-span-3 group-hover:text-primary transition-colors">{service.name}</h3>
                <p className="text-sm font-sans text-muted-foreground leading-relaxed md:col-span-8">{service.shortDescription}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}