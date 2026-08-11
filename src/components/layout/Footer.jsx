import React from 'react';
import { Link } from 'react-router-dom';
import FooterNewsletter from './FooterNewsletter';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <img
              src="/images/logo.svg"
              alt="Margin Studio"
              className="h-9 w-auto opacity-70 mb-5"
            />
            <p className="text-sm text-muted-foreground font-sans leading-relaxed max-w-sm">
              Manchester based boutique marketing and branding agency specialising in authors, publishers and bookish brands.
            </p>
            <FooterNewsletter />
          </div>

          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-5">Studio</p>
            <div className="space-y-3">
              <Link to="/services" className="block text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">Services</Link>
              <Link to="/packages" className="block text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">Packages</Link>
              <Link to="/shop" className="block text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">Shop</Link>
              <Link to="/resources" className="block text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">Resources</Link>
              <Link to="/about" className="block text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link to="/faq" className="block text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
              <Link to="/contact" className="block text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>

          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-5">Legal</p>
            <div className="space-y-3">
              <Link to="/privacy-policy" className="block text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">Privacy policy</Link>
              <Link to="/terms-of-service" className="block text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">Terms of service</Link>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="font-mono text-xs text-muted-foreground/50">
            &copy; {new Date().getFullYear()} Margin Studio
          </p>
          <p className="font-mono text-xs text-muted-foreground/40">
            Built for authors who take their work seriously.
          </p>
          <a
            href="https://www.rolke.studio"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            Made by Rolke
          </a>
        </div>
      </div>
    </footer>
  );
}