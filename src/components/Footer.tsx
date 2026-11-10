import { motion } from 'framer-motion';

const footerLinks = [
  { label: 'GitHub', href: 'https://github.com/khaled-sakr', external: true },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/khaledskr', external: true },
  { label: 'Email', href: 'mailto:khaledsakr12345@gmail.com', external: false },
];

export default function Footer() {
  return (
    <footer id="site-footer" className="bg-black">
      {/* Thanks Section */}
      <div className="py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center mb-4">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true" className="text-snow">
              <circle cx="24" cy="24" r="24" className="fill-panel" />
              <path d="M16 28c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="19" cy="20" r="2" fill="currentColor" />
              <circle cx="29" cy="20" r="2" fill="currentColor" />
            </svg>
          </div>
          <h2 className="hero-heading text-5xl md:text-7xl font-black uppercase tracking-tight leading-none mb-6">
            Thanks for visiting!
          </h2>
          <p className="text-slate max-w-md mx-auto">
            Appreciate your time! Feel free to reach out for collaboration or just to say hi :)
          </p>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div className="on-dark bg-black text-snow border-t border-slate/20 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
          <p className="text-sm text-slate">
            &copy; {new Date().getFullYear()} Khaled Sakr. All rights reserved.
          </p>
          <ul className="flex gap-2">
            {footerLinks.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target={l.external ? '_blank' : undefined}
                  rel={l.external ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center min-h-11 px-2 py-3 text-sm text-slate hover:text-snow transition-colors"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
