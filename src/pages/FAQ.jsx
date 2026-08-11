import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'What is the difference between your digital products and bespoke services?',
    a: 'Our digital products kits, systems, and templates in the shop are self-serve resources you buy and use yourself. Bespoke services are projects we take on directly: branding, campaigns, covers, websites, and ongoing retainers, tailored to you and your work.',
  },
  {
    q: 'How do I access my purchased resources?',
    a: 'Every purchase appears in your Resources page once you are signed in. From there you can download your files and access any included templates directly.',
  },
  {
    q: 'Do the kits work for both self-published and traditionally published authors?',
    a: 'Yes. The kits are designed around the foundations every author needs identity, visibility, and usable assets regardless of how you publish. Traditionally published authors use them to supplement what their publisher provides; self-published authors use them as the backbone of their marketing.',
  },
  {
    q: 'What happens after I purchase a kit?',
    a: 'You get instant access to the download and any included templates. The kits are built to be practical and self-explanatory, with clear instructions and editable files so you can put them to work straight away.',
  },
  {
    q: 'How long does a bespoke project take?',
    a: 'It depends on the scope. Branding typically takes four to six weeks, a campaign three to four, and a cover two to three. We will give you a clear timeline before we begin.',
  },
  {
    q: 'How do we start working together?',
    a: 'Use the contact form to tell us about your book and your goals. We will reply within two working days, arrange a call if it is a good fit, and send a proposal with scope, timeline, and cost.',
  },
  {
    q: 'Do you work with publishers as well as authors?',
    a: 'Yes. We work with independent authors, small presses, and larger publishers. The approach is the same; the scale adjusts to fit.',
  },
  {
    q: 'What if I need help using the templates?',
    a: 'Our templates come with clear guidance, and Canva-based templates are designed to be easy to edit. If you get stuck, get in touch and we will point you in the right direction.',
  },
];

export default function FAQ() {
  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <span className="font-mono text-xs tracking-widest uppercase text-primary mb-3 block">Help</span>
          <h1 className="font-display text-5xl md:text-7xl tracking-wide text-foreground leading-[0.9] mb-6">
            FAQ
          </h1>
          <p className="text-base font-sans text-muted-foreground leading-relaxed max-w-lg">
            Common questions about our digital products and what it is like to work with the studio.
          </p>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
            >
              <AccordionItem value={`item-${i}`} className="border-b border-border/40">
                <AccordionTrigger className="font-sans text-base font-medium text-foreground text-left hover:no-underline py-6">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm font-sans text-muted-foreground leading-relaxed pb-6">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>

        <div className="mt-16">
          <p className="text-sm font-sans text-muted-foreground mb-4">Still have a question?</p>
          <Link
            to="/contact"
            className="font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-8 py-4 inline-block"
          >
            Get in touch
          </Link>
        </div>
      </div>
    </div>
  );
}