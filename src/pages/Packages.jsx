import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { packages } from '@/lib/packagesData';

export default function Packages() {
  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                to={`/packages/${pkg.slug}`}
                className={`group aspect-square flex flex-col justify-between p-8 lg:p-10 rounded-[8px] transition-colors ${
                  pkg.featured
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-secondary/50 text-foreground hover:bg-secondary/70'
                }`}
              >
                <div>
                  <h2
                    className={`font-sans text-lg font-semibold mb-3 ${
                      pkg.featured ? 'text-primary-foreground' : 'text-foreground'
                    }`}
                  >
                    {pkg.name}
                  </h2>

                  <div className="flex items-baseline gap-2 mb-6">
                    <span
                      className={`font-mono text-2xl ${
                        pkg.featured ? 'text-primary-foreground' : 'text-foreground'
                      }`}
                    >
                      {pkg.price}
                    </span>

                    <span
                      className={`font-mono text-xs ${
                        pkg.featured
                          ? 'text-primary-foreground/60'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {pkg.cadence}
                    </span>
                  </div>

                  <p
                    className={`text-sm font-sans leading-relaxed ${
                      pkg.featured
                        ? 'text-primary-foreground/80'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {pkg.description}
                  </p>
                </div>

                <span
                  className={`font-mono text-xs tracking-widest uppercase ${
                    pkg.featured
                      ? 'text-primary-foreground'
                      : 'text-primary'
                  }`}
                >
                  View package
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
          className="max-w-4xl mx-auto bg-secondary/50 p-10 md:p-16 rounded-[8px] text-center"
        >
          <h2 className="font-display text-3xl md:text-4xl tracking-wide text-foreground leading-[0.9] mb-4">
            Planning a larger project?
          </h2>

          <p className="text-sm font-sans text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            If our packages aren't quite right for you, we'd love to talk about how we can help.
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
