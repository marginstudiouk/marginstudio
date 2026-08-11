import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { getServiceBySlug, services } from '@/lib/servicesData';
import CaseStudyRow from '@/components/case-studies/CaseStudyRow';

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = getServiceBySlug(slug);

  if (!service) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">Service not found.</p>
        <Link to="/services" className="font-mono text-xs tracking-widest uppercase text-primary border-b border-primary pb-0.5">Back to services</Link>
      </div>
    );
  }

  const nextService = services[(parseInt(service.num) - 1 + 1) % services.length];

  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-5xl mx-auto">
        {/* Back link */}
        <Link
          to="/services"
          className="inline-flex items-center font-mono text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors mb-12 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-2 transition-transform group-hover:-translate-x-1" />
          All services
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="font-mono text-xs tracking-widest uppercase text-primary mb-3 block">{service.num} Service</span>
          <h1 className="font-display text-5xl md:text-7xl tracking-wide text-foreground leading-[0.9] mb-6">
            {service.name}
          </h1>
          <p className="text-base font-sans text-muted-foreground leading-relaxed max-w-xl">
            {service.shortDescription}
          </p>
        </motion.div>

        {/* Hero image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-20 overflow-hidden"
        >
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-[280px] md:h-[440px] object-cover"
          />
        </motion.div>

        {/* Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20"
        >
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground md:col-span-3">Overview</p>
          <p className="text-base font-sans text-foreground leading-relaxed md:col-span-9 max-w-2xl">{service.overview}</p>
        </motion.div>

        {/* Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-8">How it works</p>
          <div className="space-y-8">
            {service.process.map((p, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
                <span className="font-mono text-xs text-primary md:col-span-1 pt-1">{service.num}.{i + 1}</span>
                <h3 className="font-sans text-lg font-semibold text-foreground md:col-span-4">{p.step}</h3>
                <p className="text-sm font-sans text-muted-foreground leading-relaxed md:col-span-7">{p.detail}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Deliverables */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-8">What you get</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
            {service.deliverables.map((d, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm font-sans text-foreground">{d}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-secondary/50 p-10 md:p-14 mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl tracking-wide text-foreground leading-[0.9] mb-4">
            Interested in<br />{service.name.toLowerCase()}?
          </h2>
          <p className="text-sm font-sans text-muted-foreground mb-8 leading-relaxed whitespace-nowrap">
            {service.related
              ? 'Prefer something ready-made? Start from a ready-made option.'
              : 'Tell us about your project and we will let you know how we can help.'}
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-8 py-4 group"
            >
              {service.related?.customLabel || 'Get in touch'}
              <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
            {service.related ? (
              <Link
                to={service.related.path}
                className="inline-flex items-center font-mono text-xs tracking-widest uppercase border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors px-8 py-4 group"
              >
                {service.related.kind === 'package' ? `View ${service.related.label}` : `Browse ${service.related.label}`}
                <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : null}
          </div>
        </motion.div>

        <CaseStudyRow serviceType={service.slug} />

        {/* Next service */}
        <Link
          to={`/services/${nextService.slug}`}
          className="flex items-center justify-between py-8 group"
        >
          <div>
            <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground block mb-2">Next service</span>
            <span className="font-display text-2xl md:text-3xl uppercase tracking-wide text-foreground group-hover:text-primary transition-colors">
              {nextService.name}
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}