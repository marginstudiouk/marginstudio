import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const principles = [
  { num: '01', title: 'Editorial first', description: 'We approach marketing the way good editors approach a manuscript: with attention, intent, and respect for the work.' },
  { num: '02', title: 'Built to last', description: 'We do not chase trends. We build identities and systems that hold up over a career, not just a launch.' },
  { num: '03', title: 'Reader-centred', description: 'Every decision starts with your reader. Who they are, what they need, and where they already are.' },
  { num: '04', title: 'Practical by design', description: 'We deliver work you can actually use: templates, systems, and assets that fit a real publishing schedule.' },
];

export default function About() {
  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20 max-w-2xl"
        >
          <span className="font-mono text-xs tracking-widest uppercase text-primary mb-3 block">Studio</span>
          <h1 className="font-display text-5xl md:text-7xl tracking-wide text-foreground leading-[0.9] mb-10">
            It's time to<br /><span className="text-primary">find</span> your<br />readers.
          </h1>
          <p className="font-display text-2xl md:text-3xl uppercase tracking-wide text-foreground mb-8 leading-[0.95]">
            We know books.
          </p>
          <div className="space-y-5 text-base font-sans text-muted-foreground leading-relaxed max-w-xl">
            <p>
              Margin work with creatively bold clients who understand that good work needs more than talent alone to sell. Branding and marketing are how stories travel, how readers recognise what matters to them, and how creative careers are sustained.
            </p>
            <p>
              With over 20 years book marketing and design experience, we bring strategy and creative together to build work that feels intentional, distinctive, and owned, supporting books and book-led businesses as they launch and grow.
            </p>
          </div>
        </motion.div>

        {/* Principles */}
        <div className="mb-20">
          <h2 className="font-display text-3xl md:text-4xl tracking-wide text-foreground mb-10">
            What we believe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {principles.map((p, i) => (
              <motion.div
                key={p.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
              >
                <span className="font-mono text-xs text-primary block mb-3">{p.num}</span>
                <h3 className="font-sans text-lg font-semibold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm font-sans text-muted-foreground leading-relaxed">{p.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-secondary/50 p-10 md:p-14"
        >
          <h2 className="font-display text-3xl md:text-4xl tracking-wide text-foreground leading-[0.9] mb-4">
            Want to work<br />together?
          </h2>
          <p className="text-sm font-sans text-muted-foreground mb-8 max-w-sm leading-relaxed">
            We take on a limited number of projects each quarter. Tell us about your book and your goals.
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