import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 lg:px-10 py-16 bg-background">
      <div className="max-w-xl w-full text-center">
        <p className="font-mono text-xs tracking-widest uppercase text-primary mb-8">
          Margin · 404
        </p>

        <h1 className="font-display text-6xl md:text-8xl tracking-wide text-foreground leading-[0.9] mb-8">
          This page is<br />unpublished.
        </h1>

        <p className="text-base font-sans text-muted-foreground leading-relaxed max-w-md mx-auto mb-12">
          Either the manuscript never made it to print, or you have wandered into the slush pile. Either way, the page you were looking for is not here.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-8 py-4 group"
          >
            Back to the homepage
            <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/journal"
            className="inline-flex items-center font-mono text-xs tracking-widest uppercase text-primary border-b border-primary pb-0.5 hover:text-foreground hover:border-foreground transition-colors"
          >
            Read the journal
          </Link>
        </div>
      </div>
    </div>
  );
}