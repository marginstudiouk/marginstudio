import React from 'react';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
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
            Privacy Policy
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
            <h2 className="font-display text-xl tracking-wide text-foreground mb-4">Overview</h2>
            <p>
              Margin Studio respects your privacy and is committed to protecting your personal data. This policy explains what information we collect, why we collect it, and how we use it. It applies to visitors of this website and customers who purchase our digital products and services.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl tracking-wide text-foreground mb-4">Information we collect</h2>
            <p className="mb-4">We may collect and process the following:</p>
            <ul className="space-y-2 list-disc pl-5">
              <li>Account details you provide, such as your name and email address when you register or sign in.</li>
              <li>Order information, including the products you purchase and transaction records.</li>
              <li>Profile details you choose to add, such as your organisation, role, website, and biography.</li>
              <li>Enquiry details submitted through our contact form, including your name, email, and message.</li>
              <li>Technical data such as your browser type and usage patterns, used to keep the site running smoothly.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl tracking-wide text-foreground mb-4">How we use your information</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>To deliver the digital products and services you request.</li>
              <li>To manage your account and provide access to your purchased resources.</li>
              <li>To respond to enquiries and provide support.</li>
              <li>To send relevant updates where you have agreed to receive them.</li>
              <li>To improve our website, products, and services.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl tracking-wide text-foreground mb-4">Sharing your data</h2>
            <p>
              We do not sell your personal data. We may share information with trusted service providers who help us operate the site and process payments, only where necessary and under appropriate safeguards. We will disclose information where required by law.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl tracking-wide text-foreground mb-4">Your rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal data. You can update your profile details at any time from your account. To exercise other rights, contact us and we will respond promptly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl tracking-wide text-foreground mb-4">Security</h2>
            <p>
              We take reasonable steps to protect your data using appropriate technical and organisational measures. However, no method of transmission over the internet is fully secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl tracking-wide text-foreground mb-4">Cookies</h2>
            <p>
              The site uses essential cookies to function and may use analytics to understand usage. You can control cookies through your browser settings. Disabling certain cookies may affect how the site works.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl tracking-wide text-foreground mb-4">Contact</h2>
            <p>
              If you have questions about this policy or how your data is handled, please reach out through our contact page and we will be glad to help.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}