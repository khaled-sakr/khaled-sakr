import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import '../showcase/showcase.css';
import { Ar, VhsDetailBody, VhsDossier, VhsScreens, type Shot } from './VhsBits';
import ProjectsLedger, { type LedgerItem } from './ProjectsLedger';

/*
 * VHS project shelf ported from "Khaled Sakr — Full-Stack Engineer.html".
 * The shelf, caption swap, tab indicator, custom cursor and the ink-reveal
 * detail sheet are driven by the source's own rAF loop and Web Animations
 * calls (same springs, easings, durations and delays). React renders the
 * static markup; the effect below is the source script, typed and with every
 * listener / timer / frame cleaned up on unmount.
 *
 * Added on top of the source: the "My part" list, stack chips and screenshots in
 * the detail sheet (VhsBits), previous / next inside the sheet, and the ledger of
 * live projects with its call to action under the shelf (ProjectsLedger).
 */

interface Project {
  id: string;
  title: string;
  ar: string;
  sub: string;
  cat: string;
  stack: string;
  role: string;
  status: string;
  /** Summary: the problem first, then what the project is. Keep in sync with index.html (JSON-LD + noscript). */
  syn: string;
  /** One line for the ledger row. */
  line?: string;
  /** What Khaled did on it. Only verified points; leave out rather than guess. */
  did?: string[];
  /*
   * The dossier under the sheet's first screen. Taken from each project's live site (fetched
   * November 2026) or, where a store page could not be read, from its own screenshots in
   * public/projects. Nothing here is inferred; claims the site makes about itself are the
   * site's claims, not Khaled's.
   */
  /** Who it is for. */
  who?: string;
  /** What is in it: concrete features from the live product. */
  features?: string[];
  /** Where it runs. */
  platforms?: string;
  /** One fact from the product itself, set large. */
  fact?: string;
  shots?: Shot[];
  url?: string;
  top?: boolean;
  btn?: string;
  btnAr?: string;
}

const shot = (file: string, caption: string, w: number, h: number): Shot => ({ src: `/projects/${file}.webp`, caption, w, h });

const VP: Project[] = [
  {
    id: 'etqantutor', title: 'Etqan Tutor', ar: 'إتقان تيوتر', sub: 'ETQAN TUTOR', cat: 'Education', stack: 'NEXT.JS · DJANGO · AR / EN', role: 'Founder and engineer', status: 'Live',
    url: 'https://tutor.etqanpp.com/en/', btn: 'Open Etqan Tutor', btnAr: 'افتح المنصة',
    line: 'Runs a whole online Quran school, surah by surah',
    who: "Quran, Arabic and Islamic studies academies, especially growing online ones",
    features: ["Subscriptions that generate recurring sessions, with make-ups and trial lessons", "Attendance for students and teachers, with absence alerts to parents", "Family invoices, Stripe and PayPal, student wallets", "Teacher payroll worked out from the sessions taught", "Levels linked to surahs and verse ranges, homework, monthly reports and certificates"],
    platforms: "Web, installable on phones and computers without an app store. Arabic and English, right to left. Four portals: office, teacher, parent and student.",
    fact: "114 surahs built in, and a separate database for every academy.",
    syn: 'An online Quran school juggles students, teachers, live lessons, payments and parents who want to see progress. Etqan Tutor is the Quran academy platform that runs all of it, tracking every student surah by surah and verse by verse, with reports parents can follow. Built with Next.js and Django.',
    did: ['Founded the product and built it on Next.js and Django', 'Linked every lesson to a surah and verse range, across all 114 surahs'],
    shots: [
      shot('etqan-tutor', 'Students, teachers, lessons, attendance and payments in one platform.', 1600, 893),
      shot('etqan-tutor-quran', 'Progress parents can see, surah by surah, verse by verse.', 1600, 879),
    ],
  },
  {
    id: 'dsmate', title: 'DS-Mate', ar: 'دي إس ميت', sub: 'DS-MATE', cat: 'Commerce', stack: 'NEXT.JS · NODE.JS · TYPESCRIPT', role: 'Frontend lead, full-stack engineer', status: 'Live',
    url: 'https://ds-mate.com/', btn: 'Open ds-mate.com', btnAr: 'افتح المنصة',
    line: 'Dropshipping across nine sales channels, with the busywork automated',
    who: "Dropshippers and their virtual assistants, selling on several channels at once",
    features: ["Syncs orders between nine sales channels and suppliers such as AliExpress and Alibaba", "Auto-fulfilment waits six hours by default before paying the supplier, so early cancellations cost nothing", "Edit a product once, publish it to every store", "Profit reports with supplier costs and marketplace fees already taken out", "Separate logins for assistants, with every action in an audit log"],
    platforms: "Web app for Shopify, Amazon, eBay, TikTok Shop, Walmart, Shein, Temu, WooCommerce and AliExpress.",
    fact: "Nine sales channels, one workspace, one audit trail.",
    syn: 'Selling on several marketplaces means oversells, orders copied by hand and “where is my order?” tickets. DS-Mate, a dropshipping automation platform built for Almdrasa, a UK company, connects stores on Shopify, Amazon, eBay, TikTok Shop and more to their suppliers and fulfils orders automatically.',
    did: ['Lead the frontend team: architecture, code reviews and task planning', 'Build the Next.js dashboards, admin panels and automation workflows', 'Work side by side with the backend engineers'],
    shots: [shot('dsmate', 'Connect stores to suppliers and automate fulfilment.', 1600, 895)],
  },
  {
    id: 'agentopia', title: 'Agentopia', ar: 'أجنتوبيا', sub: 'AGENTOPIA', cat: 'AI', stack: 'NEXT.JS · CLAUDE CODE · OPENAI CODEX', role: 'Engineer', status: 'Live',
    url: 'https://agentopia-ai.vercel.app/', btn: 'Try Agentopia', btnAr: 'جرّب أجنتوبيا',
    line: 'Hire a team of AI agents, give them an office, review their work',
    who: "People who already use Claude Code or OpenAI Codex and want a team, not a terminal",
    features: ["Six role templates: manager, frontend, backend, UI/UX, QA and research", "Every employee has an editable eleven-field prompt, versioned with rollback", "The AI manager plans the work and hands subtasks to specialists", "Shell commands, network access and file edits wait for your approval", "A live office view of who is working, waiting or blocked"],
    platforms: "Web app plus a local runner on your computer, signed in to your own Claude Code or Codex CLI. Your tokens are never stored.",
    fact: "Nothing runs on a model until you connect one.",
    syn: 'AI agents are easy to start and hard to keep track of. Agentopia turns them into a company: hire AI employees, give them an office, hand the manager a task and review the work before it counts. A Next.js app that runs on your own Claude Code or OpenAI Codex sign-in.',
    shots: [shot('agentopia', 'Build your own AI company, then watch it work.', 1600, 891)],
  },
  {
    id: 'etqan', title: 'Etqan', ar: 'إتقان', sub: 'ETQAN', cat: 'Agency', stack: 'NEXT.JS · DJANGO · AI', role: 'Founder', status: 'Live',
    url: 'https://www.etqanpp.com/', btn: 'Open etqanpp.com', btnAr: 'افتح الموقع',
    line: 'The software and AI studio I founded in Giza',
    who: "Companies in Egypt and the Gulf that need a website, an app or an internal system",
    features: ["Websites and web platforms", "iOS and Android apps from one codebase", "Custom software: ERP, CRM and internal systems", "UI/UX, brand identities and design systems"],
    platforms: "Next.js, React, Flutter, TypeScript, Node.js, Django, PostgreSQL, Firebase and Docker. Based in 6th of October, Giza.",
    fact: "Six steps, from discovery to launch, then support that keeps going.",
    syn: 'One studio for the website, the app and the system behind them. Etqan is the software and AI studio I founded in Giza, Egypt: websites, iOS and Android apps and custom software such as ERP and CRM systems for companies in Egypt and the Gulf, from first idea to launch and support.',
    did: ['Founded the studio and run it', 'Built the studio site in Next.js on a Django back end', 'Built the admin CMS the team uses to edit it'],
    shots: [shot('etqan-portfolio', 'The Etqan studio site.', 1600, 871)],
  },
  {
    id: 'tazakka', title: 'Tazakka', ar: 'تزكّى', sub: 'TAZAKKA', cat: 'Mobile', stack: 'REACT NATIVE · REANIMATED · MMKV · I18N', role: 'React Native developer', status: 'Live',
    url: 'https://play.google.com/store/apps/details?id=com.tazkiahapp', btn: 'Get it on Google Play', btnAr: 'حمّله من جوجل بلاي',
    line: 'A Fajr alarm, prayer times and a streak for every prayer',
    who: "Muslims who want to wake up for Fajr and keep every prayer on time",
    features: ["Prayer times from your local time, with a live countdown to the next prayer", "Fajr alarm and prayer reminders", "A score and streak for every prayer, from 7 days to a year", "A prayer-by-prayer history grid", "Step counting and motivational content"],
    platforms: "Android, on Google Play as “Tazakka: Fajr Alarm & Prayers”. Arabic and English.",
    fact: "Every prayer gets its own streak.",
    syn: 'Tazakka is an Islamic companion app built in React Native that helps people wake up for Fajr: prayer times to the minute, reminders, a streak for every prayer, motivational content and step counting.',
    did: ['Implemented push notifications and deep linking', 'Added Arabic and English (i18n) and fast local storage with MMKV', 'Shipped with an Agile team on GitLab, Jira and Slack'],
    shots: [
      shot('tazakka-phone', 'Prayer times from your local time, counting down to Fajr.', 882, 1590),
      shot('tazakka-tracking', 'A streak for every prayer and three months of history.', 890, 1600),
    ],
  },
  {
    id: 'hawadeet', title: 'Hawadeet', ar: 'حواديت', sub: 'HAWADEET', cat: 'Mobile', stack: 'REACT NATIVE · EXPO · REACT QUERY', role: 'Mobile engineer', status: 'Live',
    url: 'https://apps.apple.com/eg/app/hawadeet/id6670516431', btn: 'Get it on the App Store', btnAr: 'حمّله من آب ستور',
    line: 'Arabic stories, written together one segment at a time',
    who: "Arabic speakers who like to tell stories together",
    features: ["Start a story and let others add the next segment", "Likes, comments and chat", "Deep linking and lighter media loading"],
    platforms: "iPhone, iPad and Apple-silicon Macs (iOS 15.1 or later), and Android. Published by TechYAM.",
    fact: "One story, many writers, a segment each.",
    syn: 'A social app where Arabic speakers write stories together, one segment each. Built in React Native and Expo, with posts, likes, comments, chat, deep linking and optimised media, and published on the App Store and Google Play.',
    did: ['Worked on the React Native and Expo app: feed, likes, comments and chat', 'React Query for data, plus deep linking and lighter media loading', 'Released on the App Store and Google Play'],
    shots: [shot('hawadeet-app', 'Share your tales, a segment at a time.', 492, 1100)],
  },
  {
    id: 'dsmatetutorial', title: 'DS-Mate Tutorial', ar: 'دليل دي إس ميت', sub: 'DS-MATE TUTORIAL', cat: 'Commerce', stack: 'NEXT.JS · TYPESCRIPT', role: 'Frontend engineer', status: 'Live',
    url: 'https://tutorial.ds-mate.com/', btn: 'Watch the lessons', btnAr: 'شوف الدروس',
    line: 'Fifteen minutes of video, from first store to first order',
    who: "New DS-Mate sellers on their first day",
    features: ["Five lessons of about three minutes each, in three modules: setup, daily work, optimise", "Connect a store, import a product, link existing products, fulfil orders, handle billing", "A progress tracker, and you can start from any lesson", "Free, with no extra sign-up"],
    platforms: "Web, alongside the DS-Mate app.",
    fact: "About fifteen minutes from first store to first fulfilled order.",
    syn: 'The guided onboarding for DS-Mate: five short video lessons, about fifteen minutes in all, that take a new seller from connecting a store to importing products and fulfilling the first order.',
    did: ['Worked on the tutorial site’s frontend in Next.js and TypeScript'],
    shots: [shot('dsmate-tutorial', 'Five lessons, about fifteen minutes in all.', 1600, 894)],
  },
  {
    id: 'original', title: 'Original Software', ar: 'أوريجينال سوفت', sub: 'ORIGINAL SOFTWARE', cat: 'Commerce', stack: 'NEXT.JS · DJANGO REST · AR / EN', role: 'Full-stack engineer', status: 'Live',
    url: 'https://original-software.com/', btn: 'Open the store', btnAr: 'افتح المتجر',
    line: 'Genuine software licences, sold and delivered online in Iraq',
    who: "Individuals, companies, banks and government departments in Iraq",
    features: ["Licences from more than twenty software companies", "Local payment: Zain Cash, FIB, Visa and Mastercard", "Activation with the original licence code; downloads from the official site"],
    platforms: "Web store in Arabic, English and Kurdish. Based in Duhok, Iraq.",
    fact: "Genuine licences, paid for locally, delivered digitally.",
    syn: 'An online store for genuine software licences in Iraq and the region, selling to individuals, companies, banks and government institutions. Arabic first with English, prices in Iraqi dinar, secure checkout and digital delivery, all run from a full admin dashboard.',
    did: ['Worked on the Arabic and English storefront in Next.js: catalogue, wishlist, cart and checkout', 'Worked on the Django REST API and the admin dashboard for orders, users and licence delivery'],
    shots: [shot('original-software', 'The storefront, Arabic first, with an English switch.', 1600, 891)],
  },
  {
    id: 'qalamy', title: 'Qalamy Academy', ar: 'أكاديمية قلمي', sub: 'QALAMY ACADEMY', cat: 'Education', stack: 'ETQAN TUTOR · AR / EN', role: 'Engineer', status: 'Live',
    url: 'https://qalami.tutor.etqanpp.com/', btn: 'Open the academy', btnAr: 'افتح الأكاديمية',
    line: 'Live one-to-one Quran and Arabic lessons, running on Etqan Tutor',
    who: "Children from age five, and adults",
    features: ["Live one-to-one video lessons, at a time you pick", "Tajweed, Quran memorisation and Arabic", "Choose a male or female teacher", "20% off when two or more family members join", "An intensive Ramadan programme: daily lessons after Taraweeh"],
    platforms: "Web, running on Etqan Tutor. Arabic and English.",
    fact: "A free trial lesson, and a reply within one working day.",
    syn: 'Etqan Tutor with a real school on it. Qalamy is an online Quran and Arabic academy: one-to-one live lessons in tajweed, Quran memorisation and Arabic for children and adults, with dedicated teachers, flexible times and a free trial session.',
    did: ['Runs on Etqan Tutor, the platform I built'],
    shots: [shot('qalamy-academy', 'The Qalamy Academy home page.', 1600, 893)],
  },
  {
    id: 'tesla', title: 'Teslla Study', ar: 'تسلا ستادي', sub: 'TESLLA STUDY', cat: 'Education', stack: 'BILINGUAL · AR / EN', role: 'Developer', status: 'Live',
    url: 'https://tesllastudy.com/', btn: 'Open tesllastudy.com', btnAr: 'افتح الموقع',
    line: 'Guides Arab students applying to universities in Türkiye',
    who: "Arab students heading to Türkiye for a bachelor’s, master’s or PhD",
    features: ["Five steps: choose, documents, apply, accept, arrive", "Certificate review, translations and attestations", "Applications submitted on the university portals", "Guidance on visas, residence permits and housing", "A free consultation, in Arabic, on WhatsApp"],
    platforms: "Web, Arabic by default with an English switch.",
    fact: "Five partner universities in Istanbul, from Işık (1996) to Fenerbahçe (2016).",
    syn: 'Studying in Türkiye from abroad means shortlists, applications and a visa. Teslla Study is a bilingual Arabic and English site that walks students through all three, with partner universities in Istanbul and a free consultation form.',
    did: ['Built the bilingual site, right to left and left to right, with the consultation form'],
    shots: [shot('teslla-study', 'The Teslla Study home page.', 1600, 894)],
  },
  {
    id: 'lmfoundry', title: 'LMFoundry', ar: 'إل إم فاوندري', sub: 'LMFOUNDRY', cat: 'AI', stack: 'LLMS · AI AGENTS · ON-PREMISE', role: 'Engineer', status: 'Live',
    url: 'https://www.lmfoundry.com/', btn: 'Open lmfoundry.com', btnAr: 'افتح الموقع',
    line: 'Build and run your own language models, wherever your data lives',
    who: "Business teams and IT departments that want their own AI, on their own infrastructure",
    features: ["AI Workbench to build, train and refine models", "A model gallery of pre-built and custom models", "Fine-tuning, evaluation and observability for models in production", "AI agents that work together on business tasks", "Enterprise knowledge sources, with governance built in"],
    platforms: "Web platform. Deploys to the cloud, on-premise or at the edge. English and French.",
    fact: "“Your data never leaves your domain.”",
    syn: 'For companies that need AI to run where their data lives. LMFoundry is an enterprise AI platform for building, fine-tuning and running language models and AI agents in the cloud, on-premise or at the edge, with security and governance built in.',
    shots: [shot('lmfoundry', 'AI anywhere, enterprise-ready: the LMFoundry home page.', 1600, 891)],
  },
];
const STATUS_AR: Record<string, string> = { Built: 'مكتمل', 'In progress': 'قيد التنفيذ', 'In development': 'قيد التطوير', 'In design': 'قيد التصميم' };
const CATS = ['AI', 'Agency', 'Mobile', 'Commerce', 'Education'];
/** Arabic tab labels, shown beside the English on wide screens ("ALL / الكل" style). */
const CAT_AR: Record<string, string> = { AI: 'ذكاء', Agency: 'الشركة', Mobile: 'موبايل', Commerce: 'تجارة', Education: 'تعليم', Tools: 'أدوات', Lab: 'معمل' };
const L = VP.length, NT = L * 3;
const IMG = (kind: 'spine' | 'cover', id: string) => `/showcase/vhs/${kind}-${id}.webp?v=5`;
const EASE = 'cubic-bezier(.2,.8,.2,1)';
const LIVE: LedgerItem[] = VP.filter((p) => p.url).map((p) => ({
  id: p.id, title: p.title, ar: p.ar, line: p.line ?? p.syn, role: p.role, url: p.url!, btn: p.btn!, shot: p.shots?.[0],
}));
function arEl(text: string) {
  const b = document.createElement('bdi');
  b.className = 'a';
  b.lang = 'ar';
  b.dir = 'rtl';
  b.textContent = text;
  return b;
}
/** "LATIN / عربي" as DOM nodes (the source used innerHTML). */
function bilingual(el: Element, latin: string, ar: string) {
  el.replaceChildren(document.createTextNode(`${latin} / `), arEl(ar));
}

export default function VhsProjects() {
  const secRef = useRef<HTMLElement>(null);
  const curRef = useRef<HTMLDivElement>(null);
  const detRef = useRef<HTMLDivElement>(null);
  /** The project the detail sheet shows; drives the React-rendered parts of the sheet. */
  const [detId, setDetId] = useState<string | null>(null);
  /** Set by the effect: lets the ledger open the sheet for a project. */
  const apiRef = useRef<{ play: (id: string, from: HTMLElement | null, trigger?: HTMLElement) => void } | null>(null);
  const detP = VP.find((p) => p.id === detId) ?? null;

  useEffect(() => {
    const sec = secRef.current, cur = curRef.current, det = detRef.current;
    if (!sec || !cur || !det) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: (() => void)[] = [];
    const on = <K extends keyof WindowEventMap>(t: Window | HTMLElement, type: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions) => {
      t.addEventListener(type, fn as EventListener, opts);
      cleanups.push(() => t.removeEventListener(type, fn as EventListener, opts));
    };
    const timeouts = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => { timeouts.delete(id); fn(); }, ms);
      timeouts.add(id);
      return id;
    };

    const stage = sec.querySelector<HTMLElement>('.stage')!, shelf = sec.querySelector<HTMLElement>('.vshelf')!;
    type Tape = { el: HTMLElement; v: number; i: number; sp: HTMLElement; cv: HTMLElement; lift: number; cvOn: boolean };
    const tapes: Tape[] = [...stage.querySelectorAll<HTMLElement>('.tape')].map((el, v) => ({
      el, v, i: v % L, sp: el.children[0] as HTMLElement, cv: el.children[1] as HTMLElement, lift: 0, cvOn: false,
    }));

    // Images: the spines (~15 KB each) all attach once the shelf is near. The covers (100-300 KB
    // each, and only the centred tape shows one) attach for the tapes within COVER_R of the
    // active slot, so neighbours are already decoded before they slide in. Once set, a cover stays.
    const COVER_R = 3;
    let imgsOn = false;
    function attachCovers() {
      if (!imgsOn) return;
      for (const t of tapes) {
        if (t.cvOn || Math.abs(rel(t.v)) > COVER_R) continue;
        t.cvOn = true;
        t.cv.style.backgroundImage = `url(${IMG('cover', VP[t.i].id)})`;
      }
    }
    const near = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      near.disconnect();
      imgsOn = true;
      tapes.forEach((t) => { t.sp.style.backgroundImage = `url(${IMG('spine', VP[t.i].id)})`; });
      attachCovers();
    }, { rootMargin: '100% 0px' });
    near.observe(sec);
    cleanups.push(() => near.disconnect());

    // state
    let s = 0 + L, T = s, hover = -1, active = 0, mx = -999, my = -999, cxp = 0, cyp = 0, tiltX = 0, tiltY = 0, onCover = false, isOpen = false, inSec = false;
    let dragging = false, dragged = false, downX = 0, T0 = 0, pid: number | null = null;
    const rel = (v: number) => { let r = (v - s) % NT; r = ((r + NT * 1.5) % NT) - NT / 2; return r; };
    const B = (r: number) => (Math.abs(r) < 1 ? (r + Math.sin(Math.PI * r) / Math.PI) / 2 : Math.sign(r) * 0.5);
    const F = (r: number) => r * (ws + gap) + (d - ws + 1.6 * gap) * B(r);
    const sm = (x: number) => x * x * (3 - 2 * x);

    tapes.forEach((t) => {
      on(t.el, 'pointerenter', () => { hover = t.v; });
      on(t.el, 'pointerleave', () => { if (hover === t.v) hover = -1; });
      on(t.el, 'click', () => {
        if (dragged) return;
        const r = rel(t.v);
        if (Math.abs(r) < 0.5) openDetail(); else T = Math.round(T + r);
      });
    });

    // geometry
    let H = 0, ws = 0, d = 0, gap = 0, W = 0, SH = 0;
    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;height:var(--H);width:1px;left:-9px;top:0';
    sec.appendChild(probe);
    cleanups.push(() => probe.remove());
    function measure() {
      H = probe.offsetHeight; ws = (H * 142) / 840; d = (H * 474) / 900; gap = H * 0.03;
      W = sec!.clientWidth; SH = sec!.clientHeight;
      stage.style.setProperty('--h', H + 'px'); stage.style.setProperty('--ws', ws + 'px'); stage.style.setProperty('--d', d + 'px');
      moveInd();
    }

    // tabs
    const tabs = sec.querySelector<HTMLElement>('.vtabs')!, ind = sec.querySelector<HTMLElement>('.vind')!;
    const tabBtns = [...tabs.querySelectorAll<HTMLButtonElement>('button')];
    const [allBtn, ...catBtns] = tabBtns;
    function moveInd() {
      const b = catBtns[CATS.indexOf(VP[active].cat)];
      if (!b) return;
      ind.style.width = b.offsetWidth + 'px';
      ind.style.transform = `translateX(${b.offsetLeft}px)`;
      catBtns.forEach((x) => {
        x.classList.toggle('on', x === b);
        x.setAttribute('aria-selected', String(x === b));
      });
      // Roving tabindex: the selected category is the tab stop.
      tabBtns.forEach((x) => { x.tabIndex = x === b ? 0 : -1; });
    }
    function jumpTo(i: number) { const c = Math.round(T), m = ((c % L) + L) % L; let diff = i - m; if (diff > L / 2) diff -= L; if (diff < -L / 2) diff += L; T = c + diff; }
    const tabTarget = (b: HTMLButtonElement) => (b === allBtn ? 0 : VP.findIndex((p) => p.cat === CATS[catBtns.indexOf(b)]));
    tabBtns.forEach((b) => on(b, 'click', () => jumpTo(tabTarget(b))));
    on(tabs, 'keydown', (e) => {
      const i = tabBtns.indexOf(document.activeElement as HTMLButtonElement);
      if (i < 0) return;
      let n = -1;
      if (e.key === 'ArrowRight') n = (i + 1) % tabBtns.length;
      else if (e.key === 'ArrowLeft') n = (i - 1 + tabBtns.length) % tabBtns.length;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = tabBtns.length - 1;
      if (n < 0) return;
      e.preventDefault();
      tabBtns[n].focus();
      jumpTo(tabTarget(tabBtns[n]));
    });

    // caption
    const capT = sec.querySelector<HTMLElement>('.vt')!, capS = sec.querySelector<HTMLElement>('.vs')!, capY = sec.querySelector<HTMLElement>('.vy')!;
    function swap(box: HTMLElement, fill: (n: HTMLSpanElement) => void, dir: number) {
      const n = document.createElement('span'); fill(n);
      const old = ([...box.children] as HTMLElement[]).filter((c) => !c.dataset.leaving);
      box.appendChild(n);
      if (reduced) { old.forEach((o) => o.remove()); return; }
      n.animate([{ transform: `translateY(${dir * 105}%)` }, { transform: 'translateY(0)' }], { duration: 650, easing: EASE, fill: 'both' });
      old.forEach((o) => {
        o.dataset.leaving = '1';
        o.setAttribute('aria-hidden', 'true');
        const c = getComputedStyle(o).transform;
        const a = o.animate([{ transform: c === 'none' ? 'translateY(0)' : c }, { transform: `translateY(${-dir * 105}%)` }], { duration: 650, easing: EASE, fill: 'both' });
        a.onfinish = () => o.remove();
      });
    }
    const play = sec.querySelector<HTMLButtonElement>('.vplay')!;
    function setActive(i: number, dir: number) {
      active = i; const p = VP[i];
      swap(capT, (n) => { n.textContent = p.title; }, dir);
      swap(capS, (n) => bilingual(n, p.sub, p.ar), dir);
      swap(capY, (n) => { n.textContent = p.stack; }, dir);
      play.setAttribute('aria-label', `Open ${p.title}`);
      moveInd();
      attachCovers();
    }

    // inputs
    const prev = () => { T = Math.round(T) - 1; };
    const next = () => { T = Math.round(T) + 1; };
    on(sec.querySelector<HTMLElement>('.varrow.l')!, 'click', prev);
    on(sec.querySelector<HTMLElement>('.varrow.r')!, 'click', next);
    on(play, 'click', () => openDetail());
    let secVisible = false;
    const visIo = new IntersectionObserver((es) => { secVisible = es[0].intersectionRatio > 0.55; }, { threshold: [0, 0.55, 1] });
    visIo.observe(sec);
    cleanups.push(() => visIo.disconnect());
    const typing = (el: Element | null) => !!el && (el.matches('input, textarea, select, [contenteditable]') || !!el.closest('.vtabs, [role="dialog"]:not(.vdetail)'));
    on(window, 'keydown', (e) => {
      if (isOpen) {
        if (e.key === 'Escape') closeDetail();
        else if (e.key === 'Tab') trapFocus(e);
        else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !e.altKey && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          navDetail(e.key === 'ArrowRight' ? 1 : -1);
        }
        return;
      }
      const ae = document.activeElement;
      const focusInShelf = ae === shelf;
      if (!secVisible && !focusInShelf) return;
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || typing(ae)) return;
      if (e.key === 'ArrowLeft') { prev(); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
      else if (e.key === 'Enter' && (ae === document.body || !ae || focusInShelf)) {
        // Without this the Enter's keypress "clicks" the Close button that just took focus.
        e.preventDefault();
        openDetail();
      }
    });
    let wheelT = 0;
    on(sec, 'wheel', (e) => {
      if (isOpen || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical scrolling still scrolls the page
      e.preventDefault(); T += (e.deltaX / (ws + gap)) * 0.5;
      clearTimeout(wheelT); wheelT = later(() => { T = Math.round(T); }, 160);
    }, { passive: false });
    on(shelf, 'pointerdown', (e) => { pid = e.pointerId; downX = e.clientX; T0 = T; dragging = false; dragged = false; });
    on(window, 'pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      const r = sec.getBoundingClientRect();
      inSec = !isOpen && mx >= r.left && mx <= r.right && my >= r.top && my <= r.bottom;
      if (pid === e.pointerId) {
        const dx = e.clientX - downX;
        if (!dragging && Math.abs(dx) > 5) { dragging = true; dragged = true; try { shelf.setPointerCapture(pid); } catch { /* pointer already gone */ } }
        if (dragging) T = T0 - dx / (ws + gap);
      }
    });
    const up = (e: PointerEvent) => { if (pid !== e.pointerId) return; pid = null; if (dragging) { T = Math.round(T); dragging = false; later(() => { dragged = false; }, 0); } };
    on(window, 'pointerup', up); on(window, 'pointercancel', up);

    // cursor
    const setCur = (st: string) => { cur!.classList.toggle('spine', st === 'spine'); cur!.classList.toggle('btn', st === 'btn'); cur!.classList.toggle('open', st === 'open'); };

    // detail
    const dImg = det.querySelector<SVGImageElement>('.vd-img')!, circles = [...det.querySelectorAll<SVGCircleElement>('mask circle')];
    const closeBtn = det.querySelector<HTMLButtonElement>('.vclose')!;
    const dBtn = det.querySelector<HTMLAnchorElement>('.vd-btn')!;
    const DELAYS = [0, 120, 220, 300, 360, 420, 180];
    let inkStart = 0, inkRaf = 0, returnFocus: HTMLElement | null = null;
    function coverRect() { let best: Tape | null = null, bd = 9; tapes.forEach((t) => { const r = Math.abs(rel(t.v)); if (r < bd) { bd = r; best = t; } }); return (best as Tape | null)!.cv.getBoundingClientRect(); }
    const insetOf = (r: DOMRect) => `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round 3px)`;
    function trapFocus(e: KeyboardEvent) {
      const f = [...det!.querySelectorAll<HTMLElement>('button, a[href]')];
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || !det!.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !det!.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    }
    let dBtnClick: ((e: MouseEvent) => void) | null = null;
    // shown: the project in the sheet (can differ from `active` while the shelf is still sliding).
    // originEl: set when the sheet was opened from outside the shelf (the ledger); it opens from and closes into that element.
    let shown = 0, originEl: HTMLElement | null = null;
    const ink = (now: number) => {
      const t = now - inkStart;
      circles.forEach((c, i) => { const pr = Math.min(1, Math.max(0, (t - DELAYS[i]) / 1250)); c.setAttribute('r', (720 * (1 - Math.pow(1 - pr, 3))).toFixed(1)); });
      if (t < 2400) inkRaf = requestAnimationFrame(ink);
    };
    /** Line-by-line text reveal plus the ink bleed on the poster, starting `delay` ms from now. */
    function reveal(delay: number) {
      circles.forEach((c) => c.setAttribute('r', '0'));
      const lines = det!.querySelectorAll('.ln');
      lines.forEach((l) => { l.getAnimations().forEach((a) => a.cancel()); (l as HTMLElement).style.transform = ''; });
      lines.forEach((l, i) => {
        const a = l.animate([{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], { duration: reduced ? 1 : 900, delay: reduced ? 0 : delay + i * 75, easing: EASE, fill: 'both' });
        // Commit the end state and drop the filled animation. Left filled, Chrome kept stale composited
        // layers for some lines on the second and later opens: present in the DOM, painted blank.
        a.onfinish = () => { (l as HTMLElement).style.transform = 'none'; a.cancel(); };
      });
      inkStart = performance.now() + (reduced ? -5000 : delay - 100);
      cancelAnimationFrame(inkRaf);
      inkRaf = requestAnimationFrame(ink);
    }
    function openDetail(i = active, from: HTMLElement | null = null) {
      if (isOpen) return;
      T = Math.round(T);
      returnFocus = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : play;
      fill(i);
      originEl = from;
      const r = from ? from.getBoundingClientRect() : coverRect();
      isOpen = true; inSec = false; cur!.classList.remove('on');
      document.documentElement.style.overflow = 'hidden';
      det!.style.visibility = 'visible'; det!.style.transformOrigin = `${(r.left + r.right) / 2}px ${(r.top + r.bottom) / 2}px`;
      det!.getAnimations().forEach((a) => a.cancel());
      const D = reduced ? 1 : 1050;
      det!.animate([{ clipPath: insetOf(r), transform: 'rotate(-4.5deg)' }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', transform: 'rotate(0deg)' }], { duration: D, easing: 'cubic-bezier(.76,0,.18,1)', fill: 'both' });
      reveal(620);
      closeBtn.focus({ preventScroll: true });
    }
    /** Previous / next inside the open sheet; the shelf behind it follows. */
    function navDetail(dir: number) {
      if (!isOpen) return;
      T = Math.round(T) + dir;
      const rr = sec!.getBoundingClientRect();
      if (rr.bottom < 0 || rr.top > innerHeight) s = T; // shelf off screen: no slide to watch, just be there
      fill((shown + dir + L) % L);
      reveal(40);
    }
    function fill(i: number) {
      shown = i; const p = VP[i];
      // The bullets, chips and screenshots are React; render them now so the reveal below finds their lines.
      flushSync(() => setDetId(p.id));
      det!.scrollTop = 0;
      bilingual(det!.querySelector('.vd-sub')!, p.sub, p.ar);
      det!.querySelector('.vd-title')!.textContent = p.title;
      det!.querySelector('.vd-meta')!.textContent = `${p.role} / ${p.cat} / ${p.status}`;
      det!.querySelector('.vd-syn')!.textContent = p.syn;
      dBtn.classList.toggle('off', !p.url && !p.top);
      if (dBtnClick) { dBtn.removeEventListener('click', dBtnClick); dBtnClick = null; }
      dBtn.removeAttribute('target'); dBtn.removeAttribute('rel'); dBtn.removeAttribute('aria-disabled');
      if (p.url) { dBtn.href = p.url; dBtn.target = '_blank'; dBtn.rel = 'noopener'; bilingual(dBtn, p.btn!, p.btnAr!); }
      else if (p.top) {
        // "Try it at the top": close the sheet, then scroll back up to the portrait.
        dBtn.href = '#hero'; bilingual(dBtn, p.btn!, p.btnAr!);
        dBtnClick = (e) => { e.preventDefault(); closeDetail(); later(() => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }), 300); };
        dBtn.addEventListener('click', dBtnClick);
      } else { dBtn.removeAttribute('href'); dBtn.setAttribute('aria-disabled', 'true'); bilingual(dBtn, p.status, STATUS_AR[p.status] || ''); }
      dImg.setAttribute('href', IMG('cover', p.id));
    }
    function closeDetail() {
      if (!isOpen) return;
      const r = originEl && originEl.getClientRects().length ? originEl.getBoundingClientRect() : coverRect();
      const a = det!.animate([{ clipPath: 'inset(0px 0px 0px 0px round 0px)', transform: 'rotate(0deg)' }, { clipPath: insetOf(r), transform: 'rotate(-4.5deg)' }], { duration: reduced ? 1 : 850, easing: 'cubic-bezier(.76,0,.18,1)', fill: 'both' });
      a.onfinish = () => {
        det!.style.visibility = 'hidden'; det!.getAnimations().forEach((x) => x.cancel()); det!.querySelectorAll<HTMLElement>('.ln').forEach((l) => { l.getAnimations().forEach((x) => x.cancel()); l.style.transform = ''; });
        isOpen = false; document.documentElement.style.overflow = '';
        returnFocus?.focus({ preventScroll: true });
      };
    }
    on(closeBtn, 'click', closeDetail);
    on(det.querySelector<HTMLElement>('.vdnav .prev')!, 'click', () => navDetail(-1));
    on(det.querySelector<HTMLElement>('.vdnav .next')!, 'click', () => navDetail(1));

    // The ledger under the shelf opens the sheet for its row, grown from the row's picture.
    apiRef.current = {
      play(id, from, trigger) {
        const i = VP.findIndex((p) => p.id === id);
        if (i < 0 || isOpen) return;
        jumpTo(i);
        const rr = sec!.getBoundingClientRect();
        if (rr.bottom < 0 || rr.top > innerHeight) s = T; // the shelf waits on the right tape for when the visitor scrolls back up
        // Safari does not focus a clicked button; focus it so closing the sheet returns here.
        trigger?.focus({ preventScroll: true });
        openDetail(i, from);
      },
    };
    cleanups.push(() => { apiRef.current = null; });

    // frame
    let last = performance.now(), ready = false, raf = 0;
    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const rect = sec!.getBoundingClientRect();
      if (rect.bottom < -50 || rect.top > innerHeight + 50) { cur!.classList.remove('on'); return; }
      const k = reduced ? 1e3 : dragging ? 18 : 5.2;
      s += (T - s) * (1 - Math.exp(-k * dt)); if (Math.abs(T - s) < 1e-4) s = T;
      if (s > 3 * L) { s -= L; T -= L; T0 -= L; } else if (s < L) { s += L; T += L; T0 += L; }
      const a = ((Math.round(s) % L) + L) % L;
      if (a !== active || !ready) { ready = true; setActive(a, Math.sign(T - s) || 1); }

      // pointer inside the section, in section coordinates
      const lx = mx - rect.left, ly = my - rect.top, cy = SH / 2;
      const settled = Math.abs(T - s) < 0.3;
      onCover = inSec && !isOpen && settled && Math.abs(lx - W / 2) < 0.55 * d && Math.abs(ly - cy) < 0.55 * H;
      const f7 = 1 - Math.exp(-7 * dt);
      const ty = onCover ? ((lx - W / 2) / (0.55 * d)) * 9 : inSec ? ((lx - W / 2) / W) * 5 : 0;
      const tx = onCover ? (-(ly - cy) / (H / 2)) * 6 : 0;
      tiltY += (ty - tiltY) * f7; tiltX += (tx - tiltX) * f7;

      const lim = W / 2 + 1.5 * d, fl = reduced ? 1 : 1 - Math.exp(-12 * dt);
      for (const t of tapes) {
        const r = rel(t.v), x = F(r);
        if (Math.abs(x) > lim) { if (t.el.style.visibility !== 'hidden') t.el.style.visibility = 'hidden'; continue; }
        t.el.style.visibility = '';
        const o = sm(Math.max(0, 1 - Math.abs(r)));
        t.lift += ((hover === t.v && Math.abs(r) > 0.5 ? 1 : 0) - t.lift) * fl;
        const y = -o * 0.025 * H - t.lift * 0.045 * H, z = o * 0.2 * H;
        t.el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateZ(${(-4.5 * o).toFixed(3)}deg) rotateX(${(tiltX * o).toFixed(3)}deg) rotateY(${(-90 * o + tiltY * o).toFixed(3)}deg)`;
        t.el.style.zIndex = String(Math.round(100 - Math.abs(r) * 4));
        t.sp.style.setProperty('--shade', (o * 0.55).toFixed(3)); t.cv.style.setProperty('--shade', ((1 - o) * 0.5).toFixed(3));
      }

      const ps = isOpen ? 0 : sm(Math.max(0, 1 - Math.abs(T - s) * 3));
      play.style.left = W / 2 - 0.5 * d - 6 + 'px'; play.style.top = cy + 0.36 * H + 'px'; play.style.transform = `scale(${ps.toFixed(3)})`;
      play.style.visibility = ps < 0.05 ? 'hidden' : ''; // a11y: no invisible tab stop mid-slide

      // cursor
      cur!.classList.toggle('on', inSec);
      if (inSec) {
        const fc = 1 - Math.exp(-16 * dt); cxp += (mx - cxp) * fc; cyp += (my - cyp) * fc;
        cur!.style.transform = `translate3d(${cxp}px,${cyp}px,0)`;
        const el = document.elementFromPoint(mx, my);
        const overTape = el && el.closest('.tape');
        setCur(onCover ? 'open' : overTape ? 'spine' : el && el.closest('button,a') ? 'btn' : '');
      } else { cxp = mx; cyp = my; }
    }
    measure();
    on(window, 'resize', measure);
    let alive = true;
    document.fonts?.ready.then(() => { if (alive) measure(); });
    raf = requestAnimationFrame(frame);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(inkRaf);
      timeouts.forEach(clearTimeout);
      cleanups.forEach((fn) => fn());
      if (dBtnClick) dBtn.removeEventListener('click', dBtnClick);
      [capT, capS, capY].forEach((b) => b.replaceChildren());
      det.getAnimations().forEach((x) => x.cancel());
      det.style.visibility = '';
      cur.classList.remove('on');
      if (isOpen) document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <>
      <section className="vhs" id="projects" aria-labelledby="projects-heading" ref={secRef}>
        <h2 id="projects-heading" className="sr-only">Projects by Khaled Sakr: full-stack, React Native and AI work</h2>
        <div className="vgrain" aria-hidden="true" />
        <div className="vbar" data-nav-hide>
          <a className="box lbl vback" href="#experience">
            Back / <Ar>رجوع</Ar>
          </a>
          <div className="vlogo" aria-hidden="true">
            <b className="a" lang="ar" dir="rtl">خالد صقر</b>
            <span>KHALED SAKR</span>
          </div>
          <span className="lbl vcareer">
            {L} live projects / <Ar>أعمال مختارة</Ar>
          </span>
        </div>
        <div className="vtabs" role="tablist" aria-label="Categories">
          <span className="vind" aria-hidden="true" />
          <button type="button" role="tab" className="lbl" aria-selected="false" aria-controls="vhs-shelf" tabIndex={-1}>
            All / <Ar>الكل</Ar>
          </button>
          {CATS.map((c) => (
            <button key={c} type="button" role="tab" className="lbl" aria-selected="false" aria-controls="vhs-shelf" tabIndex={-1}>
              {c}
              <span className="vtab-ar">
                {' / '}
                <Ar>{CAT_AR[c]}</Ar>
              </span>
            </button>
          ))}
        </div>
        <div
          className="vshelf"
          id="vhs-shelf"
          role="tabpanel"
          tabIndex={0}
          aria-roledescription="shelf"
          aria-label="Projects shelf. Use the left and right arrow keys to browse and Enter to open."
        >
          <div className="stage">
            {[0, 1, 2].flatMap((c) =>
              VP.map((p) => (
                <div className="tape" key={`${c}-${p.id}`} aria-hidden="true">
                  <div className={`f sp sp-${p.id}`} />
                  <div className={`f cv cv-${p.id}`} />
                </div>
              )),
            )}
          </div>
        </div>
        <button type="button" className="vplay" aria-label="Open project">
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
            <path d="M2 1 L11 6 L2 11z" fill="currentColor" />
          </svg>
        </button>
        <div className="vcap" aria-live="polite">
          <div className="vm vt" />
          <div className="vm vs lbl" />
          <div className="vm vy" />
        </div>
        <button type="button" className="varrow l" aria-label="Previous project">
          <svg width="18" height="10" viewBox="0 0 18 10" aria-hidden="true">
            <path d="M5 1 L1 5 L5 9 M1 5 H17" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
        <button type="button" className="varrow r" aria-label="Next project">
          <svg width="18" height="10" viewBox="0 0 18 10" aria-hidden="true">
            <path d="M13 1 L17 5 L13 9 M17 5 H1" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
        <div className="vfoot">
          <span className="lbl">© Khaled Sakr. All rights reserved.</span>
          <span className="lbl">
            <a href="https://www.etqanpp.com/" target="_blank" rel="noopener">
              etqanpp.com
            </a>
          </span>
        </div>
      </section>

      <ProjectsLedger items={LIVE} total={L} onPlay={(id, from, trigger) => apiRef.current?.play(id, from, trigger)} />

      <div className="vcursor" aria-hidden="true" ref={curRef}>
        <i className="ring" />
        <i className="dot" />
        <span className="vlabel">
          <span>PLAY</span>
          <bdi className="a" lang="ar" dir="rtl">شغّل</bdi>
        </span>
      </div>

      <div className="vdetail" role="dialog" aria-modal="true" aria-labelledby="vd-title" ref={detRef}>
        <button type="button" className="box lbl vclose">
          Close / <Ar>إغلاق</Ar>
        </button>
        <div className="vdnav">
          <button type="button" className="box lbl prev" aria-label="Previous project">
            <svg width="14" height="8" viewBox="0 0 18 10" aria-hidden="true">
              <path d="M5 1 L1 5 L5 9 M1 5 H17" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            <span className="vdnav-t">
              Prev / <Ar>السابق</Ar>
            </span>
          </button>
          <button type="button" className="box lbl next" aria-label="Next project">
            <span className="vdnav-t">
              Next / <Ar>التالي</Ar>
            </span>
            <svg width="14" height="8" viewBox="0 0 18 10" aria-hidden="true">
              <path d="M13 1 L17 5 L13 9 M17 5 H1" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </div>
        <div className="vlogo vdlogo" aria-hidden="true">
          <b className="a" lang="ar" dir="rtl">خالد صقر</b>
          <span>KHALED SAKR</span>
        </div>
        <div className="vdgrid">
          <div className="vdtext">
            <div className="mk"><div className="ln lbl vd-sub" /></div>
            <div className="mk"><h3 className="ln vd-title" id="vd-title" /></div>
            <div className="mk"><div className="ln lbl vd-meta" /></div>
            <div className="mk"><p className="ln vd-syn" /></div>
            <VhsDetailBody p={detP} />
            <div className="mk"><div className="ln"><a className="box lbl vd-btn" /></div></div>
            {!!(detP && (detP.fact || detP.features?.length || detP.did?.length || detP.shots?.length)) && (
              <button
                type="button"
                className="lbl vdmore"
                onClick={() => detRef.current?.querySelector('.vddoss, .vdshots')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
              >
                The full story / <Ar>التفاصيل</Ar>
                <svg width="8" height="12" viewBox="0 0 10 18" aria-hidden="true">
                  <path d="M1 13 L5 17 L9 13 M5 17 V1" fill="none" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </button>
            )}
          </div>
          <div className="vdposter">
            <svg viewBox="0 0 474 900" aria-hidden="true">
              <defs>
                <filter id="vInk" x="-50%" y="-50%" width="200%" height="200%">
                  <feTurbulence type="fractalNoise" baseFrequency=".011" numOctaves={3} seed={7} result="n" />
                  <feDisplacementMap in="SourceGraphic" in2="n" scale={120} xChannelSelector="R" yChannelSelector="G" />
                </filter>
                <mask id="vMask" maskUnits="userSpaceOnUse" x="-200" y="-200" width="874" height="1300">
                  <g filter="url(#vInk)" fill="#fff">
                    <circle cx="150" cy="330" r="0" />
                    <circle cx="340" cy="600" r="0" />
                    <circle cx="250" cy="120" r="0" />
                    <circle cx="90" cy="760" r="0" />
                    <circle cx="400" cy="250" r="0" />
                    <circle cx="260" cy="860" r="0" />
                    <circle cx="230" cy="470" r="0" />
                  </g>
                </mask>
                <clipPath id="vClip">
                  <rect width="474" height="900" />
                </clipPath>
              </defs>
              <g clipPath="url(#vClip)">
                <image className="vd-img" width="474" height="900" preserveAspectRatio="none" mask="url(#vMask)" />
              </g>
            </svg>
          </div>
        </div>
        <VhsDossier p={detP} />
        <VhsScreens p={detP} />
      </div>
    </>
  );
}
