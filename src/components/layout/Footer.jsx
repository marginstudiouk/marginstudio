
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import FooterNewsletter from './FooterNewsletter';

function ThreadsIcon({ size = 17 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.81 11.5c-.12-.06-.24-.12-.37-.17-.22-4.09-2.46-6.43-6.22-6.45h-.05c-2.25 0-4.12.96-5.27 2.7l2.07 1.42c.86-1.3 2.21-1.58 3.2-1.58h.03c1.24.01 2.17.37 2.75 1.08.42.51.7 1.17.84 1.98-1.1-.19-2.28-.25-3.54-.18-3.54.2-5.82 2.26-5.67 5.13.08 1.46.81 2.71 2.06 3.52 1.06.68 2.43 1.02 3.84.94 1.86-.1 3.32-.81 4.34-2.1.77-.98 1.26-2.24 1.49-3.83.91.56 1.58 1.29 1.95 2.16.63 1.47.66 3.89-1.31 5.86-1.73 1.72-3.8 2.47-6.94 2.49-3.49-.03-6.14-1.18-7.87-3.42C.55 17.29.09 14.6.37 11.52.75 7.32 2.38 4.57 5.35 2.64 7.55 1.21 10.41.65 13.84.98c3.47.34 5.93 1.47 7.75 3.57 1.71 1.98 2.57 4.5 2.6 7.7h-2.52c-.02-2.58-.68-4.5-1.99-6.01-1.38-1.59-3.32-2.46-6.11-2.73-2.84-.28-5.16.16-6.93 1.31-2.3 1.49-3.54 3.64-3.85 7.05-.25 2.76.14 4.98 1.32 6.6 1.27 1.73 3.35 2.61 6.19 2.63 2.52-.02 4.13-.58 5.43-1.87 1.44-1.43 1.59-3.16 1.12-4.26-.26-.59-.7-1.09-1.3-1.49-.23 1.37-.65 2.47-1.3 3.3-.83 1.06-2 1.64-3.48 1.72-2.2.12-3.63-.85-3.72-2.53-.11-1.93 1.42-3.22 4-3.37 1.39-.08 2.65.03 3.82.34-.06-.88-.25-1.59-.57-2.14-.57-.98-1.58-1.48-3.08-1.49h-.03c-1.73 0-2.91.63-3.84 2.04L3.3 6.14C4.68 4.05 6.91 2.9 9.64 2.9h.06c4.39.03 7.09 2.93 7.34 7.86.15.07.3.14.45.22l-.68.52Z" />
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

            <FooterNewsletter />
          </div>

          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-5">
              Studio
            </p>

            <div className="space-y-3">
              <Link to="/services" className="block text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
                Services
              </Link>
              <Link to="/packages" className="block text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
                Packages
              </Link>
              <Link to="/shop" className="block text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
                Shop
              </Link>
              <Link to="/resources" className="block text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
                Resources
              </Link>
              <Link to="/about" className="block text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link to="/faq" className="block text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </Link>
              <Link to="/contact" className="block text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div className="flex flex-col">
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-5">
              Legal
            </p>

            <div className="space-y-3">
              <Link to="/privacy-policy" className="block text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
                Privacy policy
              </Link>
              <Link to="/terms-of-service" className="block text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
                Terms of service
              </Link>
            </div>

            <div className="flex items-center justify-end gap-4 mt-8 md:mt-auto">
              <a
                href="https://www.instagram.com/margin__studio/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Margin Studio on Instagram"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram size={17} strokeWidth={1.8} />
              </a>

              <a
                href="https://www.threads.com/@margin__studio"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Margin Studio on Threads"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ThreadsIcon size={17} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
