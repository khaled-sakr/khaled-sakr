import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import profileImg from '../assets/khaled_sakr.webp';

const STORAGE_KEY = 'availableBannerDismissed';

function readDismissed() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export default function AvailableBanner() {
  const [dismissed, setDismissed] = useState(readDismissed);
  // True while the hero's own CTA row, the projects shelf (its footer and arrows
  // sit at the bottom edge), the contact section or the footer is on screen:
  // the banner steps aside so it never covers them.
  const [nearEnd, setNearEnd] = useState(true);

  useEffect(() => {
    if (dismissed || !('IntersectionObserver' in window)) return;
    const targets = [
      document.querySelector('#hero .hero-bottom'),
      document.getElementById('projects'),
      document.getElementById('contact'),
      document.getElementById('site-footer'),
    ].filter(
      (el): el is HTMLElement => el !== null,
    );
    const inView = new Map<Element, boolean>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => inView.set(entry.target, entry.isIntersecting));
      setNearEnd([...inView.values()].some(Boolean));
    });
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [dismissed]);

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* storage unavailable: dismissal lasts for this visit only */
    }
  };

  return (
    <AnimatePresence>
      {!dismissed && !nearEnd && (
        <motion.aside
          aria-label="Availability"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="on-dark fixed bottom-4 sm:bottom-6 short:bottom-2 inset-x-4 mx-auto w-fit max-w-[calc(100%-2rem)] z-50 bg-panel text-snow border border-slate/25 rounded-full pl-2 pr-1 py-1 flex items-center gap-2 sm:gap-3 shadow-2xl"
        >
          <img
            src={profileImg}
            alt=""
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover shrink-0 max-[379px]:hidden short:hidden"
          />
          <div className="min-w-0 pl-2 min-[380px]:pl-0 short:pl-2">
            <p className="text-xs sm:text-sm font-medium whitespace-nowrap">
              <span className="min-[380px]:hidden">Available for hire</span>
              <span className="max-[379px]:hidden">Khaled is available for hire</span>
            </p>
            <p className="hidden sm:block short:hidden text-xs text-slate whitespace-nowrap">Availability: Immediately</p>
          </div>
          <a
            href="#contact"
            className="shrink-0 inline-flex items-center h-11 px-4 bg-rose text-snow rounded-full text-xs font-bold whitespace-nowrap hover:bg-rose-deep transition-colors"
          >
            Hire Khaled
          </a>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-slate hover:text-snow hover:bg-snow/10 text-xl leading-none transition-colors"
            aria-label="Dismiss availability banner"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
