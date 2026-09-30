import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { packages } from '@/lib/packagesData';

export default function Packages() {
  const navigate = useNavigate();

  const goToPackage = (slug) => navigate(`/packages/${slug}`);

  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-2xl"
        >
          <h1 className="font-display text-5xl md:text-7xl tracking-wide text-foreground leading-[0.9] mb-6">
            Packages
          </h1>
          <p className="text-base font-sans text-muted-foreground leading-relaxed">
            Practical, cost-effective support designed to work for self-published and traditionally published authors alike.
          </p>
        </motion.div>

        {/* Intro copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 max-w-2xl space-y-5"
        >
          <p className="text-base font-sans text-muted-foreground leading-relaxed">
            Most authors, whether publishing independently or working with a traditional publisher, need the same core things in place: a clear identity, consistent visibility, and marketing assets that actually get used.
          </p>
          <p className="text-base font-sans text-muted-foreground leading-relaxed">
            These packages are built around affordable author branding and marketing essentials. They focus on the foundations that help authors and books show up professionally, sell consistently, and grow over time, without the cost or commitment of a full agency retainer.
          </p>
        </motion.div>

        {/* Packages grid — the whole card is clickable through to its own page */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              onClick={() => goToPackage(pkg.slug)}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') goToPackage(pkg.slug); }}
              className={`flex flex-col p-8 lg:p-10 rounded-[8px] cursor-pointer transition-transform hover:-translate-y-1 ${pkg.featured ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-foreground'}`}
            >
              <h3 className={`font-sans text-lg font-semibold mb-2 ${pkg.featured ? 'text-primary-foreground' : 'text-foreground'}`}>
                {pkg.name}
              </h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className={`font-mono text-2xl ${pkg.featured ? 'text-primary-foreground' : 'text-foreground'}`}>{pkg.price}</span>
                <span className={`font-mono text-xs ${pkg.featured ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{pkg.cadence}</span>
              </div>
              <p className={`text-sm font-sans leading-relaxed mb-8 ${pkg.featured ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {pkg.description}
              </p>

              <div className={`mb-6 ${pkg.featured ? 'text-primary-foreground' : 'text-foreground'}`}>
                <p className={`font-mono text-xs tracking-widest uppercase mb-4 ${pkg.featured ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>Includes</p>
                <ul className="space-y-2.5">
                  {pkg.includes.map((item, idx) => (
                    <li key={idx} className={`text-sm font-sans leading-snug ${pkg.featured ? 'text-primary-foreground/90' : 'text-foreground'}`}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {pkg.note && (
                <p className={`text-xs font-sans italic leading-relaxed mt-auto mb-6 pt-6 ${pkg.featured ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                  {pkg.note}
                </p>
              )}

              <span className={`font-mono text-xs tracking-widest uppercase mb-4 underline ${pkg.featured ? 'text-primary-foreground' : 'text-primary'}`}>
                View details
              </span>

              <Link
                to="/contact"
                onClick={(e) => e.stopPropagation()}
                className={`font-mono text-xs tracking-widest uppercase text-center py-3 transition-colors ${
                  pkg.featured
                    ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
                    : 'border border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                }`}
              >
                Enquire
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Larger project CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-secondary/50 p-10 md:p-14 rounded-[8px]"
        >
          <h2 className="font-display text-3xl md:text-4xl tracking-wide text-foreground leading-[0.9] mb-4">
            Planning a larger<br />project?
          </h2>
          <p className="text-sm font-sans text-muted-foreground mb-8 max-w-sm leading-relaxed">
            If our packages aren't quite right for you, we'd love to talk about how we can help.
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
