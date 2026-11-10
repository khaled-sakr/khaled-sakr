/*
 * "Living portrait": Khaled's photo on a soft WebGL sheet (damped wave equation)
 * that stretches when grabbed, ripples under the cursor and runs idle "acts".
 * Ported from the source page's inline script with the same constants, physics
 * and timings. Differences: typed, every listener / observer / rAF is torn down
 * by the returned cleanup, and it is not started under prefers-reduced-motion
 * (the caller shows the still photo instead).
 */

type Act = [string, number, number, ActOpts?][];
interface ActOpts {
  glint?: number;
  lean?: [number, number];
  jolt?: [number, number, number, number, number];
  wake?: number;
  call?: (now: number) => void;
}
type Brush = { u: number; v: number; list: [number, number, number, number][]; px: number; py: number };

const BASE = '/showcase/hero/';
const FACES: Record<string, string> = {
  rest: `${BASE}face-rest.webp`,
  pink: `${BASE}face-pink.webp`,
  blue: `${BASE}face-blue.webp`,
  blonde: `${BASE}face-blonde.webp`,
};
const LENS = `${BASE}face-lens.webp`;
export const PORTRAIT_SRC = FACES.rest;

export function livingPortrait(wrap: HTMLElement): () => void {
  const cleanups: (() => void)[] = [];
  const on = <K extends keyof WindowEventMap>(
    target: Window | HTMLElement,
    type: K,
    fn: (e: WindowEventMap[K]) => void,
    opts?: AddEventListenerOptions,
  ) => {
    target.addEventListener(type, fn as EventListener, opts);
    cleanups.push(() => target.removeEventListener(type, fn as EventListener, opts));
  };
  let disposed = false;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  const RING_EYEFILE: Record<string, string> = { e: 'right', ene: 'ene', ne: 'upright', nne: 'nne', n: 'up', nnw: 'nnw', nw: 'wnw', wnw: 'wnw', w: 'left', wsw: 'wsw', sw: 'downleft', ssw: 'ssw', s: 'down', sse: 'sse', se: 'downright', ese: 'ese', half: 'half', closed: 'closed' };
  const HAIRS = ['pink', 'blue', 'blonde'];

  const OVER = 1.7, N = 72, M = N + 1, SPAN = OVER / N, ORIGIN = 0.5 - OVER / 2;
  const WOBBLE = 2.3 * 2 * Math.PI, REACH = 0.085 / SPAN, C = REACH * WOBBLE, GAMMA = 2 * 0.14 * WOBBLE, NU = 0.2 * C;

  const canvas = wrap.querySelector<HTMLCanvasElement>('.faceGl')!;
  const fallback = wrap.querySelector<HTMLImageElement>('.faceFallback')!;
  const fly = wrap.querySelector<SVGSVGElement>('.faceFly')!;
  const hand = wrap.querySelector<SVGSVGElement>('.faceHand')!;
  const hearts = wrap.querySelector<HTMLElement>('.faceHearts')!;
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true });
  if (!gl) return () => {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const VS = `attribute vec2 a, d; attribute float s; varying vec2 vUv; varying float vS;
      uniform vec2 lean; uniform float overS;
      void main(){ vUv = a; vS = s; vec2 p = a + d + lean; gl_Position = vec4(vec2(p.x-.5, .5-p.y)*2./overS, 0., 1.); }`;
  const FS = `precision highp float; varying vec2 vUv; varying float vS;
      uniform sampler2D faceA, faceB, lensT;
      uniform float fade; uniform vec3 glint;
      const vec3 SNOW = vec3(1., .980, .984); // palette Snow #fffafb: the lens glint is snow light
      void main(){
        if(vUv.x<0.||vUv.y<0.||vUv.x>1.||vUv.y>1.){ gl_FragColor = vec4(0.); return; }
        vec4 c = mix(texture2D(faceA,vUv), texture2D(faceB,vUv), fade);
        if(c.a<.004){ gl_FragColor = vec4(0.); return; }
        float lm = texture2D(lensT, vUv).a;
        float q = vUv.x + vUv.y*.6 - glint.x;
        float band = exp(-q*q/.0005)*.5 + exp(-pow(q-.035,2.)/.00006)*.35;
        vec3 rgb = c.rgb*vS + SNOW*(band*lm*glint.y*c.a) + SNOW*(lm*glint.z*.35*c.a);
        gl_FragColor = vec4(rgb, c.a);
      }`;
  const sh = (t: number, s: string) => {
    const o = gl.createShader(t)!;
    gl.shaderSource(o, s);
    gl.compileShader(o);
    if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(o));
    return o;
  };
  const pr = gl.createProgram()!;
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(pr);
  gl.useProgram(pr);
  const U: Record<string, WebGLUniformLocation | null> = { over_: gl.getUniformLocation(pr, 'overS') };
  for (const n of ['lean', 'faceA', 'faceB', 'fade', 'lensT', 'glint']) U[n] = gl.getUniformLocation(pr, n);
  gl.uniform1f(U.over_, OVER);
  gl.uniform1i(U.faceA, 0);
  gl.uniform1i(U.faceB, 1);
  gl.uniform1i(U.lensT, 2);

  // ---- the sheet: a damped wave equation on the displacement of each node ----
  const count = M * M, ux = new Float32Array(count), uy = new Float32Array(count), vx = new Float32Array(count), vy = new Float32Array(count);
  const rest = new Float32Array(count * 2), dyn = new Float32Array(count * 3);
  const sx = new Float32Array(count), sy = new Float32Array(count);
  for (let j = 0, k = 0; j < M; j++) for (let i = 0; i < M; i++) { rest[k++] = ORIGIN + i * SPAN; rest[k++] = ORIGIN + j * SPAN; }
  const idx = new Uint16Array(N * N * 6);
  for (let j = 0, k = 0; j < N; j++) for (let i = 0; i < N; i++) { const a = j * M + i, b = a + 1, c = a + M, d = c + 1; idx[k++] = a; idx[k++] = c; idx[k++] = b; idx[k++] = b; idx[k++] = c; idx[k++] = d; }
  const restBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, restBuf); gl.bufferData(gl.ARRAY_BUFFER, rest, gl.STATIC_DRAW);
  const aa = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(aa); gl.vertexAttribPointer(aa, 2, gl.FLOAT, false, 0, 0);
  const dynBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, dynBuf); gl.bufferData(gl.ARRAY_BUFFER, dyn, gl.DYNAMIC_DRAW);
  const ad = gl.getAttribLocation(pr, 'd'), as = gl.getAttribLocation(pr, 's');
  gl.enableVertexAttribArray(ad); gl.vertexAttribPointer(ad, 2, gl.FLOAT, false, 12, 0);
  gl.enableVertexAttribArray(as); gl.vertexAttribPointer(as, 1, gl.FLOAT, false, 12, 8);
  const idxBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.clearColor(0, 0, 0, 0);

  let brush: Brush | null = null;
  function takeHold(u: number, v: number, radius = 0.22) {
    const list: Brush['list'] = [];
    for (let k = 0; k < count; k++) {
      const dx = rest[k * 2] + ux[k] - u, dy = rest[k * 2 + 1] + uy[k] - v, w = Math.exp(-(dx * dx + dy * dy) / (radius * radius));
      if (w > 0.02) list.push([k, w, ux[k], uy[k]]);
    }
    brush = { u, v, list, px: 0, py: 0 };
  }
  // keep every row and column in order so the sheet squashes but never folds
  const GAP = SPAN * 0.34, lineA = new Float32Array(M), lineB = new Float32Array(M), lineP = new Float32Array(M);
  function order(start: number, stride: number, field: Float32Array, base: Float32Array) {
    for (let i = 0; i < M; i++) { const k = start + i * stride; lineP[i] = base[k] + field[k]; }
    lineA[0] = lineP[0]; for (let i = 1; i < M; i++) lineA[i] = Math.max(lineP[i], lineA[i - 1] + GAP);
    lineB[N] = lineP[N]; for (let i = N - 1; i >= 0; i--) lineB[i] = Math.min(lineP[i], lineB[i + 1] - GAP);
    for (let i = 0; i < M; i++) { const k = start + i * stride; field[k] = (lineA[i] + lineB[i]) / 2 - base[k]; }
  }
  const restX = new Float32Array(count), restY = new Float32Array(count);
  for (let k = 0; k < count; k++) { restX[k] = rest[k * 2]; restY[k] = rest[k * 2 + 1]; }
  function untangle() {
    for (let pass = 0; pass < 2; pass++) {
      for (let j = 0; j < M; j++) order(j * M, 1, sx, restX);
      for (let i = 0; i < M; i++) order(i, M, sy, restY);
    }
  }

  const H = 1 / 240; let simLeft = 0;
  function step(dt: number) {
    const c2 = C * C, wo2 = WOBBLE * WOBBLE;
    for (let j = 1; j < N; j++) for (let i = 1; i < N; i++) {
      const k = j * M + i, l = k - 1, r = k + 1, t = k - M, b = k + M;
      const lx = ux[l] + ux[r] + ux[t] + ux[b] - 4 * ux[k], ly = uy[l] + uy[r] + uy[t] + uy[b] - 4 * uy[k];
      const lvx = vx[l] + vx[r] + vx[t] + vx[b] - 4 * vx[k], lvy = vy[l] + vy[r] + vy[t] + vy[b] - 4 * vy[k];
      vx[k] += (c2 * lx - wo2 * ux[k] - GAMMA * vx[k] + NU * lvx) * dt;
      vy[k] += (c2 * ly - wo2 * uy[k] - GAMMA * vy[k] + NU * lvy) * dt;
    }
    if (brush) for (const [k, w, u0, v0] of brush.list) {
      const K = 3000 * w, D = 90 * w;
      vx[k] += ((u0 + brush.px * w - ux[k]) * K - vx[k] * D) * dt;
      vy[k] += ((v0 + brush.py * w - uy[k]) * K - vy[k] * D) * dt;
    }
    for (let k = 0; k < count; k++) { ux[k] += vx[k] * dt; uy[k] += vy[k] * dt; }
  }
  function poke(u: number, v: number, dx: number, dy: number, radius = 0.09) {
    for (let k = 0; k < count; k++) {
      const ax = rest[k * 2] - u, ay = rest[k * 2 + 1] - v, w = Math.exp(-(ax * ax + ay * ay) / (radius * radius));
      vx[k] += dx * w; vy[k] += dy * w;
    }
  }

  // ---- pictures ----
  const tex: Record<string, WebGLTexture> = {};
  const param = () => { gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); };
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  const loadSrc = (src?: string) => new Promise<HTMLImageElement | null>((res) => { if (!src) return res(null); const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  const load = (name: string) => loadSrc(FACES[name]);
  function upload(name: string, img: HTMLImageElement, unit = 5) { const t = gl!.createTexture()!; gl!.activeTexture(gl!.TEXTURE0 + unit); gl!.bindTexture(gl!.TEXTURE_2D, t); gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, img); param(); tex[name] = t; return t; }

  let alphaMap: Uint8ClampedArray | null = null;
  function hitMap(img: HTMLImageElement) {
    const a = document.createElement('canvas'); a.width = a.height = 128;
    const ac = a.getContext('2d', { willReadFrequently: true })!; ac.drawImage(img, 0, 0, 128, 128);
    alphaMap = ac.getImageData(0, 0, 128, 128).data;
  }

  // ---- what he does ----
  const SPOT: Record<string, [number, number]> = { nose: [0.42, 0.55], brow: [0.47, 0.33], cheekR: [0.62, 0.6], cheekL: [0.33, 0.6], mouth: [0.45, 0.615] };
  const ACTS: Record<string, Act | 'fly' | 'tug' | 'hair'> = {
    yawn: [['yawn1', 140, 240], ['yawn2', 140, 200], ['yawn', 170, 900], ['yawn2', 150, 130], ['yawn4', 180, 700]],
    whistle: [['whistle1', 150, 700], ['whistle2', 100, 700], ['whistle1', 100, 620], ['whistle2', 100, 620]],
    shifty: [['eye:w', 60, 520, { glint: 0.2 }], ['eye:e', 60, 600, { glint: 0.85 }], ['eye:w', 60, 400, { glint: 0.2 }], ['eye:rest', 60, 260]],
    sneeze: [['sneeze1', 130, 380, { lean: [0, -0.01] }], ['half', 90, 120], ['sneeze1', 90, 560, { lean: [0, -0.018] }], ['sneeze2', 50, 300, { jolt: [0.45, 0.58, 0, 1.5, 0.34], lean: [0, 0.03] }], ['dizzy', 110, 620], ['shy', 140, 650]],
    doze: [['half', 450, 700, { lean: [0.006, 0.006] }], ['closed', 320, 500, { lean: [0.012, 0.012] }], ['half', 200, 340], ['closed', 400, 1100, { lean: [0.02, 0.02] }], ['snore', 260, 3400, { lean: [0.03, 0.03], wake: 1 }], ['shock', 50, 650, { jolt: [0.47, 0.5, 0, -0.9, 0.3] }]],
    flirt: [['smug', 130, 520], ['winkr', 80, 420], ['kiss', 120, 560, { call: () => burstHearts(5) }], ['hearts', 120, 900], ['shy', 160, 620]],
    cross: [['cross', 140, 800], ['fish', 130, 800], ['puff', 120, 700, { jolt: [0.45, 0.6, 0, -0.25, 0.3] }], ['laugh', 90, 800]],
    fly: 'fly', tug: 'tug', hair: 'hair',
  };
  // with only his photo loaded the picture-only acts are skipped; add pictures to FACES and they join in
  const ROTATION = ['fly', 'shifty', 'sneeze', 'hair', 'tug', 'doze', 'flirt', 'yawn', 'cross', 'whistle'];
  const ZONES: { hover: Record<string, string>; tap: Record<string, string> } = {
    hover: { eyeL: 'winkl', eyeR: 'winkr', nose: 'cross', mouth: 'kiss' },
    tap: { brow: 'angry', eyeL: 'ouch', eyeR: 'ouch', nose: 'act:sneeze', mouth: 'tongue', cheek: 'puff', chin: 'laugh' },
  };
  const zoneAt = (u: number, v: number) => {
    const a = (u - 0.49) / 0.23, b = (v - 0.5) / 0.27;
    if (a * a + b * b > 1 || v < 0.29) return 'hair';
    if (v < 0.395) return 'brow';
    if (v < 0.535 && u > 0.27 && u < 0.405) return 'eyeL';
    if (v < 0.51 && u > 0.435 && u < 0.58) return 'eyeR';
    if (u > 0.38 && u < 0.47 && v < 0.58) return 'nose';
    if (v > 0.58 && v < 0.66 && u > 0.36 && u < 0.54) return 'mouth';
    return v > 0.66 ? 'chin' : 'cheek';
  };
  const usable = (a: Act | string) => typeof a === 'string' || a.some((f) => f[0].startsWith('eye:') || f[0] === 'half' || f[0] === 'closed' || f[3] || tex[f[0]]);

  let ready = false, tStart = 0, last = performance.now();
  let mx = 0, my = 0, pu = 0.5, pv = 0.5, zone: string | null = null, zoneSince = 0;
  let lastInput = -1e9, awake = false, pressed = false, downAt = 0, downU = 0, downV = 0, lastX = 0, lastY = 0, speed = 0, shake = 0;
  let moodFace: string | null = null, moodUntil = 0, pulls: number[] = [], lookAt: (() => [number, number]) | null = null;
  let act: Act | null = null, actI = 0, actT = 0, rotation: string[] = [], nextIdle = 30000;
  let faceA = 'rest', faceB = 'rest', fadeT = 0, fadeMs = 1;
  let logical = 'rest', logicalMs = 70, eyeNow = 'rest', eyeNowMs = 40;
  let leanX = 0, leanY = 0, lvX = 0, lvY = 0, wantLean: [number, number] = [0, 0];
  let hairI = -1, glintX = 0.65, glintI = 0, flash = 0, glintWant: number | null = null, nextGust = 0;
  let onHead = false;

  const fileOf = (cell: string) => (cell === 'rest' ? 'rest' : RING_EYEFILE[cell]);
  const setFace = (n: string, ms: number) => { logical = n; logicalMs = ms; };
  const setEye = (cell: string, ms: number) => { if (tex[fileOf(cell)]) { eyeNow = cell; eyeNowMs = ms; } };
  function show(n: string, ms: number, now: number) {
    if (!tex[n] || n === faceB) return;
    faceA = (now - fadeT) / fadeMs > 0.5 ? faceB : faceA; faceB = n; fadeT = now; fadeMs = Math.min(70, Math.max(1, ms));
  }
  function compose(now: number) {
    if (logical !== 'rest' && tex[logical]) show(logical, logicalMs, now);
    else if (hairI >= 0) show(HAIRS[hairI], 70, now);
    else show(fileOf(eyeNow), eyeNowMs, now);
  }

  function burstHearts(n = 7) {
    for (let i = 0; i < n; i++) later(() => {
      const s = document.createElement('span'); s.textContent = '❤';
      s.style.left = (30 + Math.random() * 40) + '%'; s.style.top = (30 + Math.random() * 25) + '%'; s.style.setProperty('--dx', (Math.random() * 80 - 40) + 'px');
      hearts.appendChild(s); later(() => s.remove(), 1700);
    }, i * 110);
  }

  let handHeld = false, handFrom: [number, number] = [1.4, 0.9], handTo: [number, number] = [1.4, 0.9], flyFrom: [number, number] = [1.4, 0], flyTo: [number, number] = [1.4, 0], moveT = 0, moveMs = 1;
  let handGrip: false | 'on' | 'pull' | 'off' = false, actHair = false, savedHair = -1;
  let flyPos: [number, number] = [1.4, 0], visible = true;

  function startAct(name: string, now: number) {
    endAct();
    const a = ACTS[name];
    if (a === 'fly') act = flyAct(); else if (a === 'tug') act = tugAct(); else if (a === 'hair') act = hairAct(); else act = a;
    actI = -1; actT = now; advance(now);
  }
  function endAct() {
    act = null; fly.style.opacity = '0'; hand.style.opacity = '0'; lookAt = null; glintWant = null;
    if (handHeld) { handHeld = false; brush = null; }
    if (actHair) { hairI = savedHair; actHair = false; }
  }
  function advance(now: number) {
    actI++;
    if (!act || actI >= act.length) { endAct(); return; }
    const [shw, fade, , x] = act[actI]; actT = now;
    if (shw.startsWith('eye:')) { setFace('rest', fade); setEye(shw.slice(4), fade); }
    else if (shw === 'half' || shw === 'closed') { setFace('rest', fade); setEye(shw, fade); }
    else if (shw.startsWith('hair:')) { setFace('rest', fade); hairI = +shw.slice(5); }
    else setFace(shw, fade);
    glintWant = x && x.glint != null ? x.glint : null;
    if (x) { if (x.jolt) poke(...x.jolt); wantLean = x.lean || [0, 0]; if (x.call) x.call(now); }
    else wantLean = [0, 0];
  }
  const place = (el: SVGSVGElement, u: number, v: number) => { el.style.left = ((u - 0.5) * 100 + 50) + '%'; el.style.top = ((v - 0.5) * 100 + 50) + '%'; };
  const moveHand = (u: number, v: number, ms: number) => (now: number) => { handFrom = handTo; handTo = [u, v]; moveT = now; moveMs = ms; };
  const moveFly = (u: number, v: number, ms: number) => (now: number) => { flyFrom = flyTo; flyTo = [u, v]; moveT = now; moveMs = ms; };

  function flyAct(): Act {
    flyTo = [1.35, 0.02]; fly.style.opacity = '1'; lookAt = () => flyPos;
    const hop = (u: number, v: number, ms: number): Act[number] => ['rest', 40, ms, { call: moveFly(u, v, ms * 0.9) }];
    return [hop(0.92, 0.2, 620), hop(0.1, 0.32, 680), hop(0.9, 0.66, 640), hop(0.16, 0.62, 600), hop(...SPOT.nose, 520),
      ['cross', 110, 950, { jolt: [...SPOT.nose, 0, 0.28, 0.05] }],
      ['whistle1', 90, 340, { call: moveFly(0.5, 0.3, 280), lean: [0, -0.006] }], ['deadpan', 110, 480, { call: moveFly(...SPOT.nose, 320) }],
      ['cross', 90, 560, { jolt: [...SPOT.nose, 0, 0.28, 0.05] }],
      ['whistle2', 90, 620, { call: moveFly(1.5, -0.35, 600), jolt: [...SPOT.mouth, 0.02, -0.4, 0.08] }], ['smug', 120, 600]];
  }
  function tugAct(): Act {
    handTo = [1.3, 0.86]; hand.style.opacity = '1'; hand.classList.remove('shut');
    const g = (u: number, v: number, ms: number, face: string, grip: typeof handGrip): Act[number] => [face, 90, ms, { call: (now) => { moveHand(u, v, ms * 0.8)(now); handGrip = grip; } }];
    return [g(...SPOT.cheekR, 760, 'eye:se', false), g(...SPOT.cheekR, 240, 'shock', 'on'),
      g(0.95, 0.52, 620, 'ouch', 'pull'), g(0.84, 0.6, 240, 'ouch', 'pull'), g(0.98, 0.5, 240, 'ouch', 'pull'), g(0.88, 0.56, 260, 'ouch', 'pull'),
      g(1.4, 0.22, 1000, 'dizzy', 'off'), ['angry', 120, 620]];
  }
  function hairAct(): Act { actHair = true; savedHair = hairI; return [['hair:0', 70, 950], ['hair:1', 70, 850], ['hair:2', 70, 950], ['hair:-1', 70, 200]]; }

  // ---- input ----
  const toUv = (x: number, y: number): [number, number] => { const r = canvas.getBoundingClientRect(); return [((x - r.left) / r.width - 0.5) * OVER + 0.5, ((y - r.top) / r.height - 0.5) * OVER + 0.5]; };
  const solid = (u: number, v: number) => !!alphaMap && u >= 0 && v >= 0 && u < 1 && v < 1 && alphaMap[((v * 128 | 0) * 128 + (u * 128 | 0)) * 4 + 3] > 40;
  function wake(now: number) { lastInput = now; awake = true; nextIdle = 30000 + Math.random() * 15000; }

  on(window, 'pointermove', (e) => {
    const now = performance.now();
    const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY;
    mx = e.clientX; my = e.clientY; [pu, pv] = toUv(mx, my);
    speed += Math.hypot(dx, dy) * 0.004;
    wake(now);
    if (act && !pressed && act !== ACTS.doze) endAct(); else if (act === ACTS.doze) { actI = act.length - 2; advance(now); }
    onHead = solid(pu, pv);
    const z = onHead ? zoneAt(pu, pv) : null;
    if (z !== zone) { zone = z; zoneSince = now; }
    wrap.style.cursor = pressed ? 'grabbing' : onHead ? 'grab' : '';
    if (onHead && !pressed) poke(pu, pv, dx * 0.00035, dy * 0.00035, 0.07);
    if (pressed && brush) {
      let px = pu - brush.u, py = pv - brush.v; const L = Math.hypot(px, py), lim = 0.24;
      if (L > 0) { const k = lim * (1 - Math.exp(-L / lim)) / L; px *= k; py *= k; }
      brush.px = px; brush.py = py;
    }
  });
  on(wrap, 'pointerdown', (e) => {
    const now = performance.now(), [u, v] = toUv(e.clientX, e.clientY);
    if (!solid(u, v)) return;
    wake(now); endAct(); pressed = true; downAt = now; downU = u; downV = v; takeHold(u, v);
    moodFace = null; wrap.setPointerCapture(e.pointerId); e.preventDefault();
  });
  function release() {
    if (!pressed || !brush) return;
    const now = performance.now(), L = Math.hypot(brush.px, brush.py), z = zoneAt(downU, downV), held = now - downAt;
    pressed = false; brush = null; wrap.style.cursor = onHead ? 'grab' : '';
    pulls = pulls.filter((t) => now - t < 14000);
    if (L < 0.03 && held < 380) {
      if (z === 'hair') { hairI = hairI + 1 >= HAIRS.length ? -1 : hairI + 1; poke(downU, downV, 0, -0.35, 0.12); }
      else {
        const r = ZONES.tap[z];
        if (r.startsWith('act:')) startAct(r.slice(4), now); else { moodFace = r; moodUntil = now + 1100; }
        if (z === 'eyeL' || z === 'eyeR') flash = 1;
        poke(downU, downV, 0, 0.5, 0.06);
      }
      return;
    }
    pulls.push(now);
    const n = pulls.length;
    moodFace = n >= 8 ? 'cry' : n >= 5 ? 'angry' : L > 0.22 ? 'dizzy' : L > 0.1 ? 'scrunch' : 'deadpan';
    moodUntil = now + (n >= 5 ? 2600 : 700 + L * 2800);
  }
  on(window, 'pointerup', release); on(window, 'pointercancel', release);
  on(window, 'pointerleave', () => { zone = null; });
  document.querySelectorAll<HTMLElement>('.contact-btn').forEach((b) => {
    on(b, 'pointerenter', () => { moodFace = 'hearts'; moodUntil = performance.now() + 1e7; burstHearts(); poke(0.47, 0.62, 0, -0.3, 0.12); });
    on(b, 'pointerleave', () => { moodFace = 'grin'; moodUntil = performance.now() + 700; });
  });
  let lastScroll = scrollY, scrollUntil = 0;
  on(window, 'scroll', () => { const n = performance.now(); if (Math.abs(scrollY - lastScroll) > 2) { scrollUntil = n + 500; lastScroll = scrollY; } wake(n); }, { passive: true });

  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0 });
  io.observe(canvas);
  const ro = new ResizeObserver(() => { const r = Math.min(devicePixelRatio || 1, 2), b = canvas.getBoundingClientRect(); canvas.width = b.width * r; canvas.height = b.height * r; gl.viewport(0, 0, canvas.width, canvas.height); });
  ro.observe(canvas);
  cleanups.push(() => { io.disconnect(); ro.disconnect(); });

  let raf = 0;
  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.04, (now - last) / 1000); last = now;
    if (!ready || !visible) return;
    const f = (r: number) => 1 - Math.exp(-dt * r);

    speed *= Math.exp(-dt * 6); shake += ((speed > 1.5 ? 1 : 0) - shake) * f(speed > 1.5 ? 1.2 : 0.9);

    if (act) { if (now - actT > act[actI][2]) advance(now); }
    else if (!reduced && !pressed && tStart && now - Math.max(lastInput, tStart) > nextIdle) {
      if (!rotation.length) rotation = ROTATION.filter((n) => usable(ACTS[n]));
      if (rotation.length) startAct(rotation.shift()!, now);
      lastInput = now; nextIdle = 30000 + Math.random() * 15000;
    }

    const mk = Math.min(1, (now - moveT) / moveMs), me = mk * mk * (3 - 2 * mk);
    flyPos = [flyFrom[0] + (flyTo[0] - flyFrom[0]) * me + Math.sin(now * 0.02) * 0.012 * (mk >= 1 ? 0.15 : 1), flyFrom[1] + (flyTo[1] - flyFrom[1]) * me + Math.cos(now * 0.027) * 0.012 * (mk >= 1 ? 0.15 : 1)];
    place(fly, flyPos[0], flyPos[1]);
    const hp: [number, number] = [handFrom[0] + (handTo[0] - handFrom[0]) * me, handFrom[1] + (handTo[1] - handFrom[1]) * me];
    place(hand, hp[0], hp[1]);
    if (handGrip === 'on' && !handHeld) { takeHold(hp[0], hp[1], 0.22); handHeld = true; hand.classList.add('shut'); handGrip = 'pull'; }
    if (handHeld && brush) { brush.px = hp[0] - brush.u; brush.py = hp[1] - brush.v; }
    if (handGrip === 'off' && handHeld) { handHeld = false; brush = null; hand.classList.remove('shut'); handGrip = false; }

    // which picture (only ones that exist are ever shown)
    let want: string | null = 'rest';
    const b = brush as Brush | null;
    const pull = b ? Math.hypot(b.px, b.py) : 0;
    if (act) want = null;
    else if (pressed) want = pull > 0.24 ? 'scared' : pull > 0.1 ? 'ouch' : pull > 0.02 || zoneAt(downU, downV) !== 'hair' ? 'shock' : 'rest';
    else if (moodFace && now < moodUntil) want = moodFace;
    else if (shake > 0.55) want = shake > 0.92 ? 'sick' : 'wind';
    else if (zone && now - zoneSince > 80 && ZONES.hover[zone]) want = ZONES.hover[zone];
    if (want) setFace(want, want === 'rest' ? 110 : 90);

    // a fast-shaking cursor blows his hair about
    if (shake > 0.55 && now > nextGust) { poke(0.35 + Math.random() * 0.3, 0.18 + Math.random() * 0.08, (Math.random() - 0.5) * 1.2 * shake, -0.3 * shake, 0.12); nextGust = now + 90; }

    // the lenses catch the light from wherever the cursor is
    let gx: number;
    if (glintWant != null) gx = 0.45 + glintWant * 0.45;
    else if (lookAt) { const p = lookAt(); gx = 0.45 + Math.min(1, Math.max(0, p[0])) * 0.45; }
    else if (now < scrollUntil) gx = 0.7;
    else gx = 0.45 + Math.min(1.1, Math.max(-0.1, pu)) * 0.4 + (pv - 0.5) * 0.12;
    glintX += (gx - glintX) * f(9);
    glintI += ((awake ? 0.6 : 0.25) - glintI) * f(3);
    flash *= Math.exp(-dt * 5);

    compose(now);

    const tx = (pressed || handHeld ? (b ? b.px * 0.16 : 0) : awake ? (pu - 0.5) * 0.012 : 0) + wantLean[0] + Math.sin(now * 0.0009) * 0.0015;
    const ty = (pressed || handHeld ? (b ? b.py * 0.16 : 0) : awake ? (now < scrollUntil ? 0.006 : (pv - 0.46) * 0.008) : 0) + wantLean[1] + Math.sin(now * 0.0013) * 0.0022;
    lvX += ((tx - leanX) * 70 - lvX * 8) * dt; lvY += ((ty - leanY) * 70 - lvY * 8) * dt;
    leanX += lvX * dt; leanY += lvY * dt;

    simLeft += dt;
    let steps = 0;
    while (simLeft >= H && steps < 9) { step(H); simLeft -= H; steps++; }
    if (steps === 9) simLeft = 0;
    for (let j = 0; j < M; j++) for (let i = 0; i < M; i++) {
      const k = j * M + i, edge = i === 0 || j === 0 || i === N || j === N;
      sx[k] = edge ? ux[k] : (ux[k] * 4 + ux[k - 1] + ux[k + 1] + ux[k - M] + ux[k + M]) / 8;
      sy[k] = edge ? uy[k] : (uy[k] * 4 + uy[k - 1] + uy[k + 1] + uy[k - M] + uy[k + M]) / 8;
    }
    untangle();
    for (let k = 0, o = 0; k < count; k++) {
      dyn[o++] = sx[k]; dyn[o++] = sy[k];
      const r = k % M, c = k / M | 0;
      let s = 1;
      if (r > 0 && r < N && c > 0 && c < N) s = Math.max(0.86, Math.min(1.16, 1 - ((sx[k + 1] - sx[k - 1]) + (sy[k + M] - sy[k - M])) * 1.8));
      dyn[o++] = s;
    }
    gl!.bindBuffer(gl!.ARRAY_BUFFER, dynBuf); gl!.bufferSubData(gl!.ARRAY_BUFFER, 0, dyn);

    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.activeTexture(gl!.TEXTURE0); gl!.bindTexture(gl!.TEXTURE_2D, tex[faceA] || tex.rest);
    gl!.activeTexture(gl!.TEXTURE1); gl!.bindTexture(gl!.TEXTURE_2D, tex[faceB] || tex.rest);
    gl!.activeTexture(gl!.TEXTURE2); gl!.bindTexture(gl!.TEXTURE_2D, tex.__lens || tex.rest);
    gl!.uniform1f(U.fade, Math.min(1, (now - fadeT) / fadeMs));
    gl!.uniform2f(U.lean, leanX, leanY);
    gl!.uniform3f(U.glint, glintX, tex.__lens ? glintI : 0, tex.__lens ? flash : 0);
    gl!.drawElements(gl!.TRIANGLES, idx.length, gl!.UNSIGNED_SHORT, 0);
  }

  (async () => {
    const base = await load('rest');
    if (!base || disposed) return;
    upload('rest', base); hitMap(base);
    const lens = await loadSrc(LENS); if (disposed) return; if (lens) upload('__lens', lens);
    fallback.style.visibility = 'hidden';
    ready = true; tStart = performance.now(); raf = requestAnimationFrame(frame);
    for (const n of Object.keys(FACES)) if (n !== 'rest') { const img = await load(n); if (disposed) return; if (img) upload(n, img); }
  })();

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    timers.forEach((id) => clearTimeout(id));
    cleanups.forEach((fn) => fn());
    hearts.replaceChildren();
    fallback.style.visibility = '';
    // Free GPU memory; the canvas keeps its context so a remount (StrictMode) can reuse it.
    Object.values(tex).forEach((t) => gl.deleteTexture(t));
    [restBuf, dynBuf, idxBuf].forEach((b) => gl.deleteBuffer(b));
    gl.deleteProgram(pr);
    gl.clear(gl.COLOR_BUFFER_BIT);
  };
}
