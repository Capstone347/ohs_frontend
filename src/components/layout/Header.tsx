import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { label: 'Platform', href: '/#how-it-works' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Security', href: '/#trust' },
  { label: 'Resources', href: '#' },
  { label: 'About', href: '#' },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 h-[72px] bg-bg-dark border-b border-border-dark/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-heading text-2xl text-text-light tracking-tight">
          OHS Remote
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-text-muted hover:text-text-light transition-colors text-sm font-medium"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-4">
          <Link to="/login" className="text-text-muted hover:text-text-light transition-colors text-sm font-medium">
            Login
          </Link>
          <Button asChild variant="default" size="sm">
            <Link to="/app/step-1">Start Now</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-text-light p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-[72px] left-0 right-0 bg-bg-dark border-b border-border-dark p-6">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-text-muted hover:text-text-light transition-colors text-base"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <hr className="border-border-dark my-2" />
            <Link
              to="/login"
              className="text-text-muted hover:text-text-light transition-colors text-base"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Button asChild variant="default" className="mt-2">
              <Link to="/app/step-1" onClick={() => setMobileMenuOpen(false)}>
                Start Now
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};
