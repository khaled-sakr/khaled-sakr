// Generates VHS spine (213x1260) and cover (711x1350) art for each project,
// with the project's own screenshot inside. Run: node assets-raw/vhs-gen/gen.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const pub = resolve(root, 'public');
const out = resolve(here, 'out');
mkdirSync(out, { recursive: true });
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const C = { cream: '#d9cdb2', ink: '#1b1a17', red: '#c9432e', blue: '#2238b5', green: '#1f5a3e', black: '#191816' };

// spineImg: square-ish crop shown at the top of the spine. cover: framed screenshot.
const I = '#e9dfc7';
const P = [
  { id: 'lmfoundry', t: 'LMFOUNDRY', lines: ['LM', 'FOUNDRY'], bg: '#f4f0ff', paper: '#f4f0ff', fg: '#2b1b66', acc: '#5b2fd6', ground: '#1d1838', cover: 'lmfoundry' },
  { id: 'dsmate', t: 'DS-MATE', lines: ['DS-MATE'], bg: C.black, fg: I, paper: '#d4ee48', acc: '#111a10', ground: '#111a10', cover: 'dsmate' },
  { id: 'tazakka', t: 'TAZAKKA', lines: ['TAZAKKA'], bg: C.green, fg: I, paper: '#cfe3dc', acc: '#1f5a3e', ground: '#1f5a3e', cover: 'tazakka-phone', tall: true, soft: true },
  { id: 'hawadeet', t: 'HAWADEET', lines: ['HAWADEET'], bg: C.blue, fg: I, paper: '#e3f1fb', acc: '#1f78b8', ground: '#2b8fd6', cover: 'hawadeet-app', tall: true },
  { id: 'original', t: 'ORIGINAL SOFTWARE', lines: ['ORIGINAL', 'SOFTWARE'], bg: C.red, fg: I, paper: '#d9aa4c', acc: '#141414', ground: '#141414', cover: 'original-software' },
  { id: 'agentopia', t: 'AGENTOPIA', lines: ['AGENTOPIA'], bg: C.black, fg: I, paper: '#f4c77a', acc: '#14132b', ground: '#14132b', cover: 'agentopia' },
  { id: 'etqan', t: 'ETQAN', lines: ['ETQAN'], bg: '#ffffff', paper: '#ffffff', fg: '#1d2b55', acc: '#1f4fa0', ground: '#1f4fa0', cover: 'etqan-portfolio' },
  { id: 'etqantutor', t: 'ETQAN TUTOR', lines: ['ETQAN', 'TUTOR'], bg: C.green, fg: I, paper: '#eef5ee', acc: '#1f5a3e', ground: '#1f5a3e', cover: 'etqan-tutor' },
  { id: 'qalamy', t: 'QALAMY ACADEMY', lines: ['QALAMY', 'ACADEMY'], bg: C.black, fg: I, paper: '#d8b45a', acc: '#1e4b37', ground: '#1e4b37', cover: 'qalamy-academy' },
  { id: 'tesla', t: 'TESLLA STUDY', lines: ['TESLLA', 'STUDY'], bg: '#ffffff', paper: '#ffffff', fg: C.ink, acc: '#c8302c', ground: '#c8302c', cover: 'teslla-study' },
  { id: 'dsmatetutorial', t: 'DS-MATE TUTORIAL', lines: ['DS-MATE', 'TUTORIAL'], bg: C.blue, fg: I, paper: '#eef5dc', acc: '#2f5a33', ground: '#2f5a33', cover: 'dsmate-tutorial' },
];
const logo = (id) => `file://${pub}/logos/${id}.webp`;

const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400&family=Oswald:wght@600;700&display=block" rel="stylesheet">`;
const GRAIN = `<svg width="0" height="0" style="position:absolute"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0"/></filter></svg>`;
const img = (n) => `file://${pub}/projects/${n}.webp`;

function spine(p) {
  const fg = p.fg;
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>
*{margin:0;box-sizing:border-box}html,body{width:213px;height:1260px;overflow:hidden;background:${p.ground || p.bg}}
.s{position:relative;width:213px;height:1260px;background:${p.bg};box-shadow:inset 6px 0 10px rgba(0,0,0,.25),inset -6px 0 10px rgba(0,0,0,.25)}
.ph{position:absolute;left:${p.soft ? 14 : 30}px;top:${p.soft ? 18 : 36}px;width:${p.soft ? 185 : 153}px;height:${p.soft ? 215 : 170}px;background:url(${logo(p.id)}) center/contain no-repeat}
.tt{position:absolute;left:50%;top:${p.lines.join(' ').length > 12 ? 262 : 300}px;transform:translateX(-50%);writing-mode:vertical-rl;font-family:Newsreader,serif;
  font-size:${p.t.length > 14 ? 74 : p.t.length > 10 ? 84 : 96}px;line-height:1;color:${fg};letter-spacing:.01em;white-space:nowrap}
.sk{position:absolute;bottom:108px;width:100%;text-align:center;font:600 22px/1 Oswald,sans-serif;letter-spacing:.24em;color:${fg};padding-left:.24em}
.v{position:absolute;bottom:42px;left:50%;transform:translateX(-50%);border:2px solid ${fg};padding:3px;}
.v span{display:block;border:1.5px solid ${fg};font:400 30px/1 Newsreader,serif;color:${fg};padding:4px 22px 2px}
.g{position:absolute;inset:0;filter:url(#n);opacity:${String(p.bg).startsWith("#f") ? .12 : .35};mix-blend-mode:overlay}
</style></head><body>${GRAIN}<div class="s"><div class="ph"></div><div class="tt">${p.t}</div><div class="sk">SAKR</div><div class="v"><span>VHS</span></div><div class="g"></div></div></body></html>`;
}

function cover(p) {
  const title = p.lines.map((l) => `<div>${l}</div>`).join('');
  const big = Math.max(...p.lines.map((l) => l.length));
  const fs = big > 9 ? 104 : big > 7 ? 124 : 140;
  const shot = `<div class="plate"><div class="mark"></div></div>`;
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>
*{margin:0;box-sizing:border-box}html,body{width:711px;height:1350px;overflow:hidden;background:${p.paper || C.cream}}
.c{position:relative;width:711px;height:1350px;background:${p.paper || C.cream};overflow:hidden}
.k{position:absolute;top:48px;width:100%;text-align:center;font:600 22px/1 Oswald,sans-serif;letter-spacing:.12em;color:${C.ink}}
.t{position:absolute;top:92px;width:100%;text-align:center;font:700 ${fs}px/.92 Oswald,sans-serif;color:${p.acc};letter-spacing:-.005em}
.sun{position:absolute;width:520px;height:520px;border-radius:50%;background:${C.red};left:50%;top:${p.lines.length > 1 ? 470 : 400}px;transform:translateX(-50%);opacity:.95}
.sun:after{content:"";position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.22) 1.4px,transparent 1.6px) 0 0/11px 11px}
.ground{position:absolute;left:0;right:0;bottom:0;height:300px;background:${p.ground || (p.bg === C.cream ? p.acc : p.bg)}}
.ground:before{content:"";position:absolute;left:0;right:0;top:40px;height:3px;background:rgba(233,223,199,.45);box-shadow:0 34px 0 rgba(233,223,199,.3),0 68px 0 rgba(233,223,199,.2)}
.plate{position:absolute;left:50%;top:${p.lines.length > 1 ? 500 : 440}px;width:430px;height:430px;margin-left:-215px;transform:rotate(-4deg);background:${p.bg};border:5px solid ${C.ink};border-radius:46% 54% 48% 52% / 52% 46% 54% 48%;box-shadow:12px 14px 0 rgba(0,0,0,.28)}
.plate .mark{position:absolute;inset:${p.soft ? 70 : 100}px;background:url(${logo(p.id)}) center/contain no-repeat;transform:rotate(4deg)}
.win{position:absolute;left:50%;top:${p.lines.length > 1 ? 560 : 500}px;transform:translateX(-50%) rotate(-2.5deg);width:620px;background:${C.ink};padding:0 10px 10px;border-radius:10px;box-shadow:14px 18px 0 rgba(0,0,0,.35)}
.win .bar{height:34px;display:flex;gap:8px;align-items:center;padding-left:6px}.win .bar i{width:12px;height:12px;border-radius:50%;background:${C.cream};opacity:.7}
.win .scr{height:350px;background:center top/cover no-repeat;border-radius:3px}
.phone{position:absolute;left:50%;top:${p.lines.length > 1 ? 470 : 400}px;transform:translateX(-50%) rotate(-3deg);width:330px;height:660px;background:${C.ink};border-radius:44px;padding:14px;box-shadow:16px 20px 0 rgba(0,0,0,.35)}
.phone .scr{width:100%;height:100%;border-radius:32px;background:center top/cover no-repeat}
.lg{position:absolute;left:34px;bottom:26px;width:150px;height:110px;background:url(${logo(p.id)}) left bottom/contain no-repeat}
.v{position:absolute;right:34px;bottom:30px;background:${p.paper || C.cream};border:2px solid ${C.ink};padding:3px}
.v span{display:block;border:1.5px solid ${C.ink};font:400 34px/1 Newsreader,serif;color:${C.ink};padding:4px 22px 2px}
.g{position:absolute;inset:0;filter:url(#n);opacity:${p.paper ? .14 : .45};mix-blend-mode:multiply}
.edge{position:absolute;inset:0;box-shadow:inset 0 0 60px ${p.paper ? "rgba(0,0,0,.08)" : "rgba(60,40,10,.25)"}}
</style></head><body>${GRAIN}<div class="c"><div class="k">A KHALED SAKR PROJECT</div><div class="t">${title}</div><div class="sun"></div><div class="ground"></div>${shot}<div class="v"><span>VHS</span></div><div class="g"></div><div class="edge"></div></div></body></html>`;
}

const only = process.argv[2];
for (const p of P) {
  if (only && p.id !== only) continue;
  for (const [kind, html, w, h] of [['spine', spine(p), 213, 1260], ['cover', cover(p), 711, 1350]]) {
    const f = `${out}/${kind}-${p.id}.html`, png = `${out}/${kind}-${p.id}.png`;
    writeFileSync(f, html);
    execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', `--window-size=${w},${h}`,
      '--virtual-time-budget=4000', `--screenshot=${png}`, `file://${f}`], { stdio: 'ignore' });
    execFileSync('magick', [png, '-crop', `${w}x${h}+0+0`, '+repage', '-quality', '84', `${pub}/showcase/vhs/${kind}-${p.id}.webp`]);
  }
  console.log('done', p.id);
}
