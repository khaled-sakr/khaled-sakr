import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Khaled Sakr', href: '#hero' },
  { label: 'Highlights', href: '#highlights' },
  { label: 'Projects', href: '#projects' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/khaledskr', external: true },
  { label: 'Get in touch', href: '#contact' },
];

const sectionIds = navLinks.filter((l) => !l.external).map((l) => l.href.slice(1));

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  // The hero has its own nav row and the projects shelf has its own header bar;
  // while either sits under the floating pill, the pill steps aside.
  const [tuckedAway, setTuckedAway] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback((restoreFocus: boolean) => {
    setMenuOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      const bars = document.querySelectorAll<HTMLElement>('[data-nav-hide]');
      setTuckedAway(
        Array.from(bars).some((el) => {
          const r = el.getBoundingClientRect();
          return r.bottom > 8 && r.top < 80;
        }),
      );
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Track which section is in view for aria-current on the desktop nav.
  useEffect(() => {
    const els = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!('IntersectionObserver' in window) || els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActiveId(hit.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Mobile menu behaviour: scroll lock, focus management, Escape, focus trap,
  // and auto-close when the viewport grows to the desktop breakpoint.
  useEffect(() => {
    if (!menuOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusFirst = requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLElement>('a')?.focus();
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu(true);
        return;
      }
      if (e.key !== 'Tab') return;
      const links = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('a') ?? []);
      const focusables = [toggleRef.current, ...links].filter((el): el is HTMLElement => el !== null);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const inside = active !== null && focusables.includes(active);
      if (e.shiftKey && (active === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };

    const mq = window.matchMedia('(min-width: 768px)');
    const onMqChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    mq.addEventListener('change', onMqChange);

    return () => {
      cancelAnimationFrame(focusFirst);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
      mq.removeEventListener('change', onMqChange);
    };
  }, [menuOpen, closeMenu]);

  return (
    <header>
      <motion.nav
        aria-label="Primary"
        initial={{ y: -100, opacity: 0 }}
        animate={tuckedAway ? { y: -100, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        inert={tuckedAway}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-max transition-colors duration-300 ${
          scrolled ? 'bg-black/90 backdrop-blur-md' : 'bg-black/80 backdrop-blur-sm'
        } border border-slate/25 rounded-full p-1.5 lg:p-2 shadow-nav hidden md:flex`}
      >
        <ul className="flex items-center gap-0.5 lg:gap-1">
          {navLinks.map((link) => {
            const isActive = !link.external && activeId === link.href.slice(1);
            return (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  aria-current={isActive ? 'location' : undefined}
                  className={`block whitespace-nowrap px-3 lg:px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                    isActive ? 'text-snow bg-rose' : 'text-snow hover:bg-snow/10'
                  }`}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>
      </motion.nav>

      {/* Mobile top bar: brand + menu toggle. Sits above the menu overlay so the toggle can close it. */}
      <div
        inert={tuckedAway && !menuOpen}
        className={`fixed top-4 inset-x-4 z-[70] md:hidden flex items-center justify-between rounded-full bg-black/90 backdrop-blur-md border border-slate/25 shadow-nav pl-5 pr-1 py-1 transition-[transform,opacity] duration-500 ease-out motion-reduce:transition-none ${
          tuckedAway && !menuOpen ? '-translate-y-24 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <a href="#hero" className="py-2.5 text-base font-bold text-snow whitespace-nowrap" onClick={() => setMenuOpen(false)}>
          Khaled Sakr
        </a>
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-snow/10 transition-colors"
        >
          <span className="w-5 h-4 flex flex-col justify-between" aria-hidden="true">
            <span className={`block h-0.5 bg-snow transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block h-0.5 bg-snow transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-snow transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </span>
        </button>
      </div>

      {/* Mobile menu (z above the availability banner) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[60] bg-black flex flex-col items-center overflow-y-auto pt-24 pb-10 short:pt-20 short:pb-4 md:hidden"
          >
            <ul className="my-auto flex flex-col items-center gap-2 short:gap-0">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    onClick={() => closeMenu(false)}
                    className="flex items-center min-h-11 px-4 py-2 rounded-lg text-2xl short:text-xl font-bold text-snow hover:text-orchid transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
