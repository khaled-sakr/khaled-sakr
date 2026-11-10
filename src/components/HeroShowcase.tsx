import { useEffect, useRef, type CSSProperties } from 'react';
import { livingPortrait, PORTRAIT_SRC } from '../showcase/livingPortrait';
import '../showcase/showcase.css';

/*
 * Hero ported from "Khaled Sakr — Full-Stack Engineer.html": the fitted
 * gradient heading, the living WebGL portrait and the staggered fade-ins.
 * Markup, classes and timings are the source's.
 */

const navLinks = [
  { label: 'About', href: '#highlights' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

const fade = (y: string): CSSProperties => ({ ['--fade-y' as string]: y });

export default function HeroShowcase() {
  const heroRef = useRef<HTMLElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // ===== FIT HEADING =====
  useEffect(() => {
    const h1 = h1Ref.current;
    if (!h1) return;
    let alive = true;
    const fitH1 = () => {
      if (!alive) return;
      h1.style.fontSize = '';
      const avail = h1.parentElement!.clientWidth * 0.97;
      if (h1.scrollWidth > avail) h1.style.fontSize = (parseFloat(getComputedStyle(h1).fontSize) * avail) / h1.scrollWidth + 'px';
    };
    fitH1();
    document.fonts?.ready.then(fitH1);
    window.addEventListener('resize', fitH1);
    return () => {
      alive = false;
      window.removeEventListener('resize', fitH1);
    };
  }, []);

  // ===== FADE IN =====
  useEffect(() => {
    const root = heroRef.current;
    if (!root) return;
    const timers: number[] = [];
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            const el = (targetOf.get(e.target) ?? e.target) as HTMLElement;
            const d = +(el.dataset.delay ?? 0) || 0;
            timers.push(window.setTimeout(() => el.classList.add('in'), d));
            io.unobserve(e.target);
          }
        }),
      { rootMargin: '50px' },
    );
    // Source bug fix: below ~330px the heading is shorter than its 40px start
    // offset, so it sat fully clipped by .h1wrap, never "intersected", and never
    // faded in. Watch the (unclipped) wrapper for it instead.
    const targetOf = new Map<Element, Element>();
    root.querySelectorAll('.fade-in').forEach((el) => {
      const watch = el.parentElement?.classList.contains('h1wrap') ? el.parentElement : el;
      targetOf.set(watch, el);
      io.observe(watch);
    });
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  // ===== LIVING PORTRAIT =====
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    return livingPortrait(wrap);
  }, []);

  return (
    <>
      <section className="hero" id="hero" ref={heroRef}>
        <nav className="nav fade-in" data-delay="0" aria-label="Sections" data-nav-hide>
          {navLinks.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="h1wrap">
          <h1 ref={h1Ref} className="big hero-heading fade-in" style={fade('40px')} data-delay="150">
            Hi, i’m khaled
          </h1>
        </div>

        <div className="hero-portrait-wrap" id="magnetWrap" ref={wrapRef} role="img" aria-label="Portrait of Khaled Sakr">
          <div className="hero-portrait-inner fade-in" id="magnetInner" style={fade('30px')} data-delay="600">
            <img className="faceFallback" src={PORTRAIT_SRC} alt="" width={1024} height={1024} fetchPriority="high" decoding="async" />
            <canvas className="faceGl" aria-hidden="true" />
            <div className="faceProps" aria-hidden="true">
              <svg className="faceFly" viewBox="0 0 32 32">
                <path className="wing" d="M15 15C12 9.500 4.500 8.500 2 13c2.500 4.500 10 4.500 13 2z" />
                <path className="wing r" d="M17 15c3-5.500 10.500-6.500 13-2-2.500 4.500-10 4.500-13 2z" />
                <ellipse cx="16" cy="19.500" rx="4" ry="6.500" />
                <circle cx="16" cy="11.500" r="3.300" />
              </svg>
              <svg className="faceHand" viewBox="0 0 32 32">
                <path className="open" d="M10.500 16.500V8.200a1.800 1.800 0 0 1 3.600 0V14v-8a1.800 1.800 0 0 1 3.600 0V14 7a1.800 1.800 0 0 1 3.600 0v8-5a1.800 1.800 0 0 1 3.600 0v10.500c0 5-3.400 8.500-8.400 8.500-3.600 0-5.700-1.600-7.600-4.600l-3.500-5.600c-.6-1 .1-2.200 1.200-2.400 1-.2 1.900.2 2.600 1z" />
                <path className="grab" d="M10.500 17v-3.300a1.800 1.800 0 0 1 3.600 0V14v-1.800a1.800 1.800 0 0 1 3.600 0V14v-1.300a1.800 1.800 0 0 1 3.600 0V14v-.3a1.800 1.800 0 0 1 3.600 0v6.800c0 5-3.400 8.500-8.400 8.500-3.600 0-5.700-1.600-7.600-4.600l-2.300-3.700c-.6-1 .1-2.200 1.200-2.400 1-.2 1.900.2 2.700 1z" />
              </svg>
              <div className="faceHearts" />
            </div>
          </div>
        </div>

        <div className="hero-bottom">
          <p className="fade-in" style={fade('20px')} data-delay="350">
            a full-stack engineer building ai products, saas platforms and fast websites from cairo
          </p>
          <div className="fade-in" style={fade('20px')} data-delay="500">
            <a className="contact-btn" href="#contact">
              Contact Me
            </a>
          </div>
        </div>
      </section>

    </>
  );
}
