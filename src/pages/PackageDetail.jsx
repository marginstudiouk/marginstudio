import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { getPackageBySlug, packages } from '@/lib/packagesData';

export default function PackageDetail() {
  const { slug } = useParams();
  const pkg = getPackageBySlug(slug);

  if (!pkg) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">Package not found.</p>
        <Link to="/packages" className="font-mono text-xs tracking-widest uppercase text-primary border-b border-primary pb-0.5">View all packages</Link>
      </div>
    );
  }

  const otherPackages = packages.filter((p) => p.slug !== pkg.slug);

  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h1 className="font-display text-5xl md:text-7xl tracking-wide text-foreground leading-[0.9] mb-6">
            {pkg.name}
          </h1>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-mono text-3xl text-foreground">{pkg.price}</span>
            <span className="font-mono text-xs text-muted-foreground">{pkg.cadence}</span>
          </div>
          <p className="text-base font-sans text-muted-foreground leading-relaxed max-w-xl">
            {pkg.description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20"
        >
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground md:col-span-3">What's included</p>
          <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
            {pkg.includes.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm font-sans text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20"
        >
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground md:col-span-3">Who it's for</p>
          <p className="text-base font-sans text-foreground leading-relaxed md:col-span-9 max-w-2xl">{pkg.whoFor}</p>
        </motion.div>

        {pkg.note && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20"
          >
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground md:col-span-3">Good to know</p>
            <p className="text-base font-sans text-foreground leading-relaxed md:col-span-9 max-w-2xl">{pkg.note}</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-secondary/50 p-10 md:p-14 mb-16 rounded-[8px]"
        >
          <h2 className="font-display text-3xl md:text-4xl tracking-wide text-foreground leading-[0.9] mb-4">
            Interested in<br />{pkg.name.toLowerCase()}?
          </h2>
          <p className="text-sm font-sans text-muted-foreground mb-8 max-w-md leading-relaxed">
            Tell us a little about you and your books and we will let you know how we can help.
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-8 py-4 group"
            >
              Enquire
              <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to={`/services/${pkg.service.slug}`}
              className="inline-flex items-center font-mono text-xs tracking-widest uppercase border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors px-8 py-4 group"
            >
              About our {pkg.service.label.toLowerCase()} service
              <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>

        <div className="pt-4">
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-6">Other packages</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherPackages.map((p) => (
              <Link key={p.slug} to={`/packages/${p.slug}`} className="group flex items-baseline justify-between gap-4 py-3">
                <span className="font-sans text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{p.name}</span>
                <span className="font-mono text-sm text-muted-foreground whitespace-nowrap">{p.price} {p.cadence}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
