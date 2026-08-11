import React from 'react';
import { motion } from 'framer-motion';

export default function TermsOfService() {
  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="font-mono text-xs tracking-widest uppercase text-primary mb-3 block">Legal</span>
          <h1 className="font-display text-5xl md:text-7xl tracking-wide text-foreground leading-[0.9] mb-6">
            Terms of Service
          </h1>
          <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
            Last updated · August 2026
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-12 text-sm font-sans text-muted-foreground leading-relaxed"
        >
          <section>
            <h2 className="font-display text-xl tracking-wide text-foreground mb-4">Agreement to terms</h2>
            <p>
              By accessing this site and purchasing our digital products and services, you agree to these terms. If you do not agree, please do not use the site or buy our products. These terms apply to all visitors and customers.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl tracking-wide text-foreground mb-4">Digital product licensing</h2>
            <p className="mb-4">
              When you purchase a digital product from Margin Studio, you are granted a single, non-exclusive, non-transferable licence to use that product for your own personal or professional work. Specifically:
            </p>
            <ul className="space-y-2 list-disc pl-5">
              <li>You may use the product for your own author or publisher brand and projects.</li>
              <li>You may not resell, redistribute, sublicense, or share the source files.</li>
              <li>You may not repackage the product for sale or as a free download elsewhere.</li>
              <li>You may not claim the product as your own original work.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl tracking-wide text-foreground mb-4">Bespoke services</h2>
            <p>
              For custom branding, campaigns, and design work, the scope, deliverables, and timelines are agreed in writing before a project begins. Final files are transferred to you for your use on completion, and Margin Studio retains the right to feature the work in our portfolio unless agreed otherwise.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl tracking-wide text-foreground mb-4">Payments and refunds</h2>
            <p>
              Digital products are delivered immediately upon purchase. Because these are downloadable goods, refunds are considered on a case-by-case basis. If you experience a problem accessing or using a product, contact us and we will work to resolve it. Bespoke service payments follow the terms set out in your project agreement.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl tracking-wide text-foreground mb-4">Intellectual property</h2>
            <p>
              All content on this site, including text, imagery, and design, is owned by Margin Studio unless stated otherwise. You may not copy, reproduce, or distribute site content without permission. The licensed digital products you purchase remain the intellectual property of Margin Studio, licensed to you under the terms above.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl tracking-wide text-foreground mb-4">Limitation of liability</h2>
            <p>
              Our products and services are provided in good faith. Margin Studio is not liable for any indirect or consequential loss arising from the use of our products or site. Our liability is limited to the amount you paid for the relevant product or service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl tracking-wide text-foreground mb-4">Changes to these terms</h2>
            <p>
              We may update these terms from time to time. The current version will always be posted here with the latest date. Continued use of the site after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl tracking-wide text-foreground mb-4">Contact</h2>
            <p>
              Questions about these terms are welcome through our contact page, and we will respond as soon as we can.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}