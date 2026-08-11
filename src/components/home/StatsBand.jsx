import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { value: '3', label: 'ways to work together' },
  { value: '20+', label: 'Years of Experience' },
  { value: '1', label: 'Focus: you' },
];

export default function StatsBand() {
  return (
    <section className="border-t border-border py-14 md:py-16 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 text-center">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex flex-col items-center"
          >
            <span className="font-display text-6xl md:text-7xl uppercase tracking-wide text-foreground leading-none block mb-3">
              {s.value}
            </span>
            <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
              {s.label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}