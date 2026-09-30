import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { getServiceBySlug } from '@/lib/servicesData';
import CaseStudyRow from '@/components/case-studies/CaseStudyRow';

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = getServiceBySlug(slug);

  if (!service) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-6">
        <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
          Service not found.
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
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-3xl"
        >
          <p className="font-mono text-xs tracking-widest uppercase text-primary mb-5">
            Services
          </p>

          <h1 className="font-display text-5xl md:text-7xl tracking-wide text-foreground leading-[0.9] mb-6">
            {service.name}
          </h1>

          <p className="text-base font-sans text-muted-foreground leading-relaxed max-w-2xl">
            {service.shortDescription}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="mb-20 overflow-hidden rounded-[8px]"
        >
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-[300px] md:h-[500px] object-cover"
          />
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-24"
        >
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground md:col-span-3">
            Overview
          </p>

          <p className="text-base font-sans text-foreground leading-relaxed md:col-span-8 max-w-3xl">
            {service.overview}
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-24"
        >
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground md:col-span-3">
            How it works
          </p>

          <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6">
            {service.process.map((item, i) => (
              <div key={i} className="bg-secondary/50 p-7 rounded-[8px]">
                <span className="font-mono text-xs tracking-widest uppercase text-primary block mb-5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h2 className="font-display text-2xl tracking-wide text-foreground mb-3">
                  {item.step}
                </h2>
                <p className="text-sm font-sans text-muted-foreground leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-24"
        >
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground md:col-span-3">
            What you get
          </p>

          <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2">
            {service.deliverables.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 py-4 border-b border-border"
              >
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm font-sans text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-secondary/50 p-10 md:p-16 mb-20 rounded-[8px] text-center"
        >
          <h2 className="font-display text-3xl md:text-5xl tracking-wide text-foreground leading-[0.95] mb-5">
            Interested in {service.name.toLowerCase()}?
          </h2>

          <p className="text-sm font-sans text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
            Tell us about your project and what you need help with, and we can work out the right next step.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-8 py-4"
            >
              {service.related?.customLabel || 'Get in touch'}
            </Link>

            {service.related && (
              <Link
                to={service.related.path}
                className="inline-flex items-center font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-8 py-4"
              >
                {service.related.kind === 'package'
                  ? `View ${service.related.label}`
                  : `Browse ${service.related.label}`}
              </Link>
            )}
          </div>
        </motion.section>

        <CaseStudyRow serviceType={service.slug} />
      </div>
    </div>
  );
}
