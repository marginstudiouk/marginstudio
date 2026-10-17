
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import FooterNewsletter from './FooterNewsletter';

function TikTokIcon({ size = 17 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.6 1H12.8V16.2C12.8 18 11.4 19.3 9.7 19.3S6.6 18 6.6 16.2 8 13.1 9.7 13.1c.3 0 .6 0 .9.1V9.3c-.3 0-.6-.1-.9-.1C5.8 9.2 2.7 12.3 2.7 16.2S5.8 23.2 9.7 23.2s7-3.1 7-7V8.5c1.5 1.1 3.3 1.7 5.3 1.7V6.4c-3 0-5.4-2.4-5.4-5.4Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-secondary/50">
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

            <div className="flex items-center gap-4 mt-5 mb-6">
              <a
                href="https://www.instagram.com/margin_studio/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Margin Studio on Instagram"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram size={17} strokeWidth={1.8} />
              </a>

              <a
                href="https://www.tiktok.com/@margin_studio"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Margin Studio on TikTok"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <TikTokIcon size={17} />
              </a>
            </div>

            <FooterNewsletter />
          </div>

          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-5">
              Studio
            </p>
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
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-5">
              Legal
            </p>
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
