import { Link } from 'react-router-dom';

const footerLinks = {
  Platform: [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Features', href: '/#pricing' },
    { label: 'Pricing', href: '/#pricing' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'FAQ', href: '#' },
    { label: 'Support', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Disclaimer', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Contact', href: '#' },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-bg-surface border-t border-border-dark">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="font-heading text-2xl text-text-light">
              OHS Remote
            </Link>
            <p className="mt-4 text-text-muted text-sm">
              Professional Health & Safety compliance made simple.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-text-muted text-xs font-medium uppercase tracking-wide mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-text-light/80 hover:text-text-light text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border-dark flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">
            © 2026 OHS Remote. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-text-muted hover:text-text-light text-sm transition-colors">
              X
            </a>
            <a href="#" className="text-text-muted hover:text-text-light text-sm transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
