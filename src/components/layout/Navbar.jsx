import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Services', path: '/services' },
    { label: 'Shop', path: '/shop' },
    { label: 'Resources', path: '/resources' },
    { label: 'Packages', path: '/packages' },
    { label: 'Journal', path: '/journal' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const accountLabel = isAdmin ? 'Admin' : 'Account';
  const accountPath = isAdmin ? '/admin' : '/account';

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <img
              src="/images/logo.svg"
              alt="Margin Studio"
              className="h-14 w-auto hover:opacity-70 transition-opacity"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-mono text-xs tracking-widest uppercase transition-colors ${
                  isActive(link.path) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-5">
            {isAuthenticated ? (
              <>
                <Link
                  to={accountPath}
                  className="font-mono text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  {accountLabel}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="font-mono text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="font-mono text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </button>
            )}
            <Link
              to="/shop"
              className="font-mono text-xs tracking-widest uppercase border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2"
            >
              Browse shop
            </Link>
          </div>

          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background -mx-6 lg:-mx-10 px-6 py-6 space-y-5">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="block font-mono text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-5 border-t border-border space-y-4">
            {isAuthenticated ? (
              <>
                <Link
                  to={accountPath}
                  className="block font-mono text-xs tracking-widest uppercase text-muted-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {accountLabel}
                </Link>
                <button
                  className="block font-mono text-xs tracking-widest uppercase text-muted-foreground"
                  onClick={() => { setMobileOpen(false); handleSignOut(); }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                className="block font-mono text-xs tracking-widest uppercase text-muted-foreground"
                onClick={() => navigate('/login')}
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
