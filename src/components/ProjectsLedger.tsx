import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Ar, type Shot } from './VhsBits';

/*
 * The ledger under the VHS shelf: every live project as a readable row, a sticky
 * screenshot that follows the row under the pointer (or keyboard focus), and the
 * call to action that closes the projects section. "Play" opens the shelf's own
 * detail sheet, grown out of the row's picture.
 */

export interface LedgerItem {
  id: string;
  title: string;
  ar: string;
  line: string;
  role: string;
  url: string;
  btn: string;
  shot?: Shot;
}

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'];
const arNum = (n: number) => n.toLocaleString('ar-EG');

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] as const } },
};
const list = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

export default function ProjectsLedger({
  items,
  total,
  onPlay,
}: {
  items: LedgerItem[];
  total: number;
  onPlay: (id: string, from: HTMLElement | null, trigger: HTMLElement) => void;
}) {
  const [active, setActive] = useState(items[0]?.id ?? '');
  // Preview pictures mount the first time their row is pointed at, so the
  // eleven screenshots are not all fetched up front.
  const [seen, setSeen] = useState<string[]>(() => (items[0] ? [items[0].id] : []));
  const frameRef = useRef<HTMLDivElement>(null);
  const n = items.length;
  const cur = items.find((p) => p.id === active) ?? items[0];

  const pick = (id: string) => {
    setActive(id);
    setSeen((s) => (s.includes(id) ? s : [...s, id]));
  };

  const play = (id: string, btn: HTMLElement) => {
    const li = btn.closest('li');
    // Grow the sheet from the picture the visitor is looking at: the row's own
    // thumbnail on narrow screens, the sticky preview on wide ones.
    const thumb = li?.querySelector<HTMLElement>('.vl-thumb');
    const from = thumb && thumb.offsetParent ? thumb : frameRef.current;
    onPlay(id, from, btn);
  };

  return (
    <section className="vledger" id="live" aria-labelledby="vl-h">
      <motion.header className="vl-head" variants={list} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
        <motion.h2 id="vl-h" className="vl-title" variants={rise}>
          {WORDS[n] ?? n} are live. Go use them.
        </motion.h2>
        <motion.div className="vl-intro" variants={rise}>
          <p className="vl-lede">
            Web platforms, mobile apps and AI tools, built for teams in Egypt, Saudi Arabia, Iraq and the UK. Open any of them today, or play
            the tape for the full story.
          </p>
          <p className="lbl vl-count">
            {n} live · {total} on the shelf / <Ar>{`${arNum(n)} شغّالين من ${arNum(total)}`}</Ar>
          </p>
        </motion.div>
      </motion.header>

      <div className="vl-body">
        <motion.ul className="vl-list" variants={list} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
          {items.map((p) => (
            <motion.li
              key={p.id}
              variants={rise}
              className={p.id === active ? 'on' : undefined}
              onPointerEnter={() => pick(p.id)}
              onFocus={() => pick(p.id)}
            >
              {p.shot && (
                <img className="vl-thumb" src={p.shot.src} alt="" width={p.shot.w} height={p.shot.h} loading="lazy" decoding="async" draggable={false} />
              )}
              <div className="vl-text">
                <h3 className="vl-name">
                  {p.title} <Ar>{p.ar}</Ar>
                </h3>
                <p className="vl-line">{p.line}</p>
                <p className="lbl vl-role">{p.role}</p>
              </div>
              <div className="vl-acts">
                <button
                  type="button"
                  className="vl-btn lbl"
                  aria-label={`Play the ${p.title} tape`}
                  onClick={(e) => play(p.id, e.currentTarget)}
                >
                  <svg viewBox="0 0 12 12" width="9" height="9" aria-hidden="true">
                    <path d="M2 1 L11 6 L2 11z" fill="currentColor" />
                  </svg>
                  Play / <Ar>شغّل</Ar>
                </button>
                <a className="vl-btn lbl" href={p.url} target="_blank" rel="noopener">
                  {p.btn}
                  <svg viewBox="0 0 10 10" width="8" height="8" aria-hidden="true">
                    <path d="M2 8 L8 2 M3 2 H8 V7" fill="none" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                </a>
              </div>
            </motion.li>
          ))}
        </motion.ul>

        {/* Wide screens only: the picture of the row under the pointer. Decorative; each row is complete without it. */}
        <figure className="vl-preview" aria-hidden="true">
          <div className="vl-frame" ref={frameRef}>
            {items.map((p) =>
              p.shot && seen.includes(p.id) ? (
                <img
                  key={p.id}
                  src={p.shot.src}
                  alt=""
                  className={`${p.shot.h > p.shot.w ? 'tall' : ''}${p.id === active ? ' on' : ''}`}
                  decoding="async"
                  draggable={false}
                />
              ) : null,
            )}
          </div>
          {cur?.shot && (
            <figcaption>
              <b>{cur.title}.</b> {cur.shot.caption}
            </figcaption>
          )}
        </figure>
      </div>

      <motion.div className="vl-cta" variants={list} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
        <motion.div variants={rise}>
          <h3 className="vl-cta-t">Got a project like these?</h3>
          <p className="vl-cta-ar">
            <Ar>عندك مشروع زي دول؟</Ar>
          </p>
        </motion.div>
        <motion.div className="vl-cta-r" variants={rise}>
          <p>Send me the problem, not a spec. I&rsquo;ll reply with how I&rsquo;d build it and what I&rsquo;d ship first.</p>
          <a className="vl-start" href="#contact">
            <span>
              Start a project / <Ar>ابدأ مشروعك</Ar>
            </span>
            <svg width="18" height="10" viewBox="0 0 18 10" aria-hidden="true">
              <path d="M13 1 L17 5 L13 9 M17 5 H1" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
