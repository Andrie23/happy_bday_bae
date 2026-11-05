/* ==========================================================
   ✏️  CONFIGURATION – EDIT THIS SECTION ONLY
   Everything she reads is here. Change the text between the
   quotes. Keep the quote marks and commas.
   ========================================================== */
const CONFIG = {
  // --- Names & date -------------------------------------------------
  girlfriendName: "Bae",          // used in the greeting title
  fromName: "Andrie",         // handwritten signature on the card
  birthday: "December 8",             // shown on the front of the card

  // --- Card ---------------------------------------------------------
  cardTo: "To My Gorgeous Girl",
  cardTitle: "Happy Birthday, Bae!",
  cardSmall: "Wishing you the happiest birthday! May your day be filled with love, laughter, and endless smiles.",

  // --- Greeting -----------------------------------------------------
  greetingTitle: "Happy Birthday, Bae!",
  greetingMessage: [          // 4 short paragraphs fit nicely inside the card (2 per page)
    "Bae, today is all about you! I hope I can make you feel extra loved and give you all the hugs and kisses you deserve.",
    "I'm so grateful to have you in my life. Every moment with you is special, and I can't wait to make more beautiful memories together.",
    "I'm so proud of you, bae. I wish you happiness, good health, peace, success, and the courage to chase all your dreams. Always remember that I'll be here, cheering for you and believing in you.",
    "I promise to keep loving you, supporting you, and choosing you every day. I can't wait to celebrate more birthdays by your side. I love you so much, bae! Here's to more birthdays, memories, and years of loving each other, to infinity."
  ],
  btnMore: "There's More for You, Bae",

  // --- Cake / wish --------------------------------------------------
  cakeTitle: "Make a Wish, Birthday Girl!",
  cakeSub: "Take a deep breath and blow out your candles, baby.",
  yayTitle: "Yay! You Did It, Bae!",
  yayText: "Now close your eyes and make your most beautiful wish. You deserve all the happiness in the world.",
  btnWish: "I've Made My Wish",
  wishText: "Your wish is between you and the universe, baby. I hope life brings you all the beautiful things your heart deserves.",

  // --- Bouquet -------------------------------------------------------
  flowerMsg1: "A bouquet of flowers for the girl who makes my world more beautiful.",
  flowerMsg2: "If I could give you one flower for every reason I love you, this garden would never end.",
  bouquetImage: "",          // optional: a transparent PNG of real magazine-cutout flowers, e.g. "assets/images/bouquet.png"
  bouquetBackdrop: true,     // torn-paper shape behind the flowers (false = none)
  btnLast: "One Last Surprise, Bae",

  // --- Song ---------------------------------------------------------
  songTitle: "A Song for You, Yours Truly",
  songFile: "assets/audio/HBDY.mp3",   // replace the mp3 or change this path
  btnFinal: "Read My Final Message",

  // --- Final message ------------------------------------------------
  finalTitle: "To My Birthday Girl, With All My Love",
  finalMessage: [
    "You mean so much to me, more than I can put into words. I hope your birthday is beautiful, peaceful, and full of people and things that make you happy.",
    "Thank you for being patient, for being you, and for choosing us every day. I look forward to celebrating so many more birthdays with you, in person, with cake on our faces and no screens between us."
  ],
  finalEnd1: "Happy Birthday, Bae!",
  finalEnd2: "I love you always, in all ways.",
  finalEnd3: "More birthdays, more memories, and more years together, to infinity.",
  btnRestart: "Start Our Birthday Surprise Again",

  // --- Theme colors (hex) -------------------------------------------
  colors: { cream:"#f1f2df", ink:"#161616", pink:"#f08bc0", peach:"#ffb48a", yellow:"#f7e35c",
            green:"#4fb34a", blue:"#4a6fc2", orange:"#ff7a2b", lav:"#c9b6f0" },

  // --- Animation & sound --------------------------------------------
  animationIntensity: 1,     // 0 = none, 0.5 = calm, 1 = normal, 1.5 = lots
  sound: { enabled: true, volume: 0.12 },   // soft chimes; she can mute with the 🔊 button
  blow: { sensitivity: 0.12, holdMs: 350, graceMs: 700 } // lower sensitivity = easier to trigger
};
/* ============== END OF CONFIGURATION ===================== */

(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const body = document.body;
  const rand = (a, b) => a + Math.random() * (b - a);
  const COLORS = ["--pink", "--peach", "--yellow", "--lav", "--green"];
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* ---------- Apply config to page ---------- */
  Object.entries(CONFIG.colors).forEach(([k, v]) => document.documentElement.style.setProperty("--" + k, v));
  const texts = { ...CONFIG, dateLabel: CONFIG.birthday };
  $$("[data-cfg]").forEach(el => { const v = texts[el.dataset.cfg]; if (typeof v === "string") el.textContent = v; });
  const greet = $("#greetTitle");
  greet.textContent = CONFIG.greetingTitle.replace("{name}", CONFIG.girlfriendName);
  const fill = (id, arr) => arr.forEach(t => { const p = document.createElement("p"); p.textContent = t; $(id).appendChild(p); });
  const gm = CONFIG.greetingMessage, half = Math.ceil(gm.length / 2);
  fill("#cardLeft", gm.slice(0, half)); fill("#cardRight", gm.slice(half));
  fill("#finalBody", CONFIG.finalMessage);

  const wt = $(".wish-text");
  wt.innerHTML = wt.textContent.split(" ").map((w, i) => `<span class="w" style="--k:${i}">${w}</span>`).join(" ");
  let seed = 7;
  const prand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function sprinkles(id, x, y, w, h, n) {
    const cols = ["#ff7a2b", "#4a6fc2", "#4fb34a", "#f7e35c", "#ffffff", "#c9b6f0"]; let o = "";
    for (let i = 0; i < n; i++) { const cx = x + prand() * w, cy = y + prand() * h; o += `<rect x="${(cx - 3.5).toFixed(1)}" y="${(cy - 1.3).toFixed(1)}" width="7" height="2.6" rx="1.3" fill="${cols[i % 6]}" transform="rotate(${(prand() * 180).toFixed(0)} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>`; }
    $(id).innerHTML = o;
  }
  sprinkles("#sp1", 52, 302, 296, 62, 40); sprinkles("#sp2", 92, 222, 216, 18, 16); sprinkles("#sp3", 132, 150, 136, 20, 12);

  /* ---------- State ---------- */
  const TOTAL = 6;
  let step = 0, cardOpen = false, candlesOut = false, muted = !CONFIG.sound.enabled;
  const safeTimeouts = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); safeTimeouts.push(t); return t; };

  /* ---------- Reduced motion ---------- */
  const motionBtn = $("#motionBtn");
  function setReduced(on) {
    body.classList.toggle("reduced", on);
    motionBtn.setAttribute("aria-pressed", on);
    motionBtn.setAttribute("aria-label", on ? "Turn animations back on" : "Reduce animations");
    on ? stopBg() : startBg();
  }
  motionBtn.addEventListener("click", () => setReduced(!body.classList.contains("reduced")));

  /* ---------- Progress dots ---------- */
  const prog = $("#progress");
  for (let i = 0; i < TOTAL; i++) prog.appendChild(document.createElement("i"));
  function updateProgress() {
    $$("i", prog).forEach((d, i) => { d.className = i < step ? "done" : i === step ? "now" : ""; });
    prog.setAttribute("aria-valuenow", step + 1);
  }

  /* ---------- Background: balloons + confetti ---------- */
  const bg = $("#bg"), fx = $("#fx");
  function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function startBg() {
    if (bg.childElementCount || CONFIG.animationIntensity <= 0) return;
    const k = CONFIG.animationIntensity, small = innerWidth < 600;
    const balloons = Math.round((small ? 5 : 8) * k), pieces = Math.round((small ? 14 : 26) * k);
    for (let i = 0; i < balloons; i++) {
      const b = document.createElement("div"); b.className = "balloon";
      b.style.cssText = `left:${rand(2, 92)}%;--w:${rand(44, 70)}px;--c:${cssVar(COLORS[i % COLORS.length])};--d:${rand(16, 28)}s;--delay:${-rand(0, 24)}s;--dx:${rand(-40, 40)}px`;
      bg.appendChild(b);
    }
    for (let i = 0; i < pieces; i++) {
      const c = document.createElement("div"); c.className = "confetti";
      c.style.cssText = `left:${rand(0, 100)}%;--s:${rand(5, 9)}px;--c:${cssVar(COLORS[i % COLORS.length])};--d:${rand(12, 22)}s;--delay:${-rand(0, 20)}s;--dx:${rand(-60, 60)}px`;
      bg.appendChild(c);
    }
  }
  function stopBg() { bg.innerHTML = ""; }

  /* ---------- Floating hearts / sparkles ---------- */
  function floaters(n, area, glyphs = ["♥", "✦", "♡"]) {
    if (body.classList.contains("reduced")) return;
    const r = area ? area.getBoundingClientRect() : { left: 0, top: innerHeight * .4, width: innerWidth, height: innerHeight * .4 };
    n = Math.round(n * CONFIG.animationIntensity);
    for (let i = 0; i < n; i++) {
      const f = document.createElement("span"); f.className = "float";
      f.textContent = glyphs[i % glyphs.length];
      f.style.cssText = `left:${r.left + rand(0, r.width)}px;top:${r.top + rand(0, r.height)}px;--c:${cssVar(COLORS[i % COLORS.length])};--s:${rand(14, 28)}px;--d:${rand(2.5, 4.5)}s;--dx:${rand(-40, 40)}px;animation-delay:${rand(0, 1)}s`;
      fx.appendChild(f); setTimeout(() => f.remove(), 6000);
    }
  }
  function stars(n) {
    if (body.classList.contains("reduced")) n = Math.min(n, 8);
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span"); s.className = "star"; s.dataset.wish = "1";
      s.textContent = i % 3 ? "✦" : "♥";
      s.style.cssText = `left:${rand(2, 96)}%;top:${rand(8, 92)}%;font-size:${rand(10, 24)}px;--d:${rand(2, 4.5)}s;animation-delay:${-rand(0, 3)}s`;
      fx.appendChild(s);
    }
  }
  const clearStars = () => $$("[data-wish]", fx).forEach(s => s.remove());

  /* ---------- Soft sound effects (WebAudio, no files) ---------- */
  let actx;
  function chime(notes = [660, 880, 1320]) {
    if (muted) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      notes.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * .13;
        o.type = "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(CONFIG.sound.volume, t + .02);
        g.gain.exponentialRampToValueAtTime(.0001, t + .9);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 1);
      });
    } catch (e) { /* sound is optional */ }
  }
  const muteBtn = $("#muteBtn");
  function paintMute() {
    muteBtn.textContent = muted ? "🔇" : "🔊"; muteBtn.setAttribute("aria-pressed", muted);
    muteBtn.setAttribute("aria-label", muted ? "Unmute sound effects" : "Mute sound effects");
  }
  muteBtn.addEventListener("click", () => { muted = !muted; paintMute(); if (!muted) chime([880]); });
  paintMute();

  /* ---------- Navigation ---------- */
  function go(n) {
    if (n === step) return;
    $$(".screen")[step].classList.remove("active");
    step = n;
    const sc = $$(".screen")[n]; sc.classList.add("active"); sc.scrollTop = 0;
    updateProgress();
    body.classList.toggle("calm", n === 2);
    $("#dream").classList.toggle("on", n === 2);
    if (n !== 2) clearStars();
    if (n !== 4) pauseSong();
    overlay.classList.add("hidden");
    if (n === 1) later(() => floaters(8, cake, ["✦", "♥"]), 2400);
    if (n === 2) runWish();
    if (n === 3) runFlower();
    if (n === 5) runFinal();
  }
  $$("[data-next]").forEach(b => b.addEventListener("click", () => go(+b.dataset.next)));

  /* ---------- 1. Card ---------- */
  const card = $("#card");
  function openCard() {
    if (cardOpen) return;
    cardOpen = true; card.classList.add("open"); card.setAttribute("aria-expanded", "true");
    $("#openBtn").classList.add("hidden");
    chime([523, 659, 784, 1047]);
    floaters(14, card);
    later(() => floaters(10, card), 900);
    later(() => { $("#afterOpenBtn").classList.remove("hidden"); $("#afterOpenBtn").focus({ preventScroll: true }); }, 1300);
  }
  card.addEventListener("click", openCard);
  card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openCard(); } });
  $("#openBtn").addEventListener("click", openCard);

  /* ---------- 3. Cake: blow out ---------- */
  const cake = $("#cake"), micBtn = $("#micBtn"), tapBtn = $("#tapBlowBtn");
  const status = $("#micStatus"), meter = $("#meter"), meterBar = $("i", meter);
  let stream, mctx, raf;

  function stopMic() {
    cancelAnimationFrame(raf);
    if (stream) stream.getTracks().forEach(t => t.stop());   // microphone released immediately
    if (mctx) mctx.close().catch(() => {});
    stream = mctx = null; meter.classList.add("hidden");
  }
  function blowOut(viaMic) {
    if (candlesOut) return;
    candlesOut = true; stopMic();
    cake.classList.add("out");
    status.textContent = viaMic ? "" : "";
    $("#cakeAsk").classList.add("hidden");
    floaters(14, cake, ["✦", "✧", "♥"]);
    chime([784, 659, 523]);
    later(() => { $("#yay").classList.remove("hidden"); $("#yay button").focus({ preventScroll: true }); }, 1200);
  }
  tapBtn.addEventListener("click", () => blowOut(false));
  // The tap button stays hidden unless the microphone is blocked or unsupported.
  function fallback(msg) { status.textContent = msg; tapBtn.classList.remove("hidden"); }

  micBtn.addEventListener("click", async () => {
    if (stream) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.isSecureContext) {
      fallback("Microphone isn't available here. Use the tap button instead, baby.");
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch (e) {
      fallback("No microphone access, that's okay! Tap the button below to blow out the candles.");
      return;
    }
    try {
      mctx = new (window.AudioContext || window.webkitAudioContext)();
      const an = mctx.createAnalyser(); an.fftSize = 1024;
      mctx.createMediaStreamSource(stream).connect(an);        // analysed live, never recorded or sent anywhere
      const buf = new Float32Array(an.fftSize);
      const { sensitivity, holdMs, graceMs } = CONFIG.blow;
      const t0 = performance.now(); let last = t0, held = 0, base = 0, n = 0;
      meter.classList.remove("hidden"); micBtn.disabled = true;
      status.textContent = "Listening... take a deep breath and blow toward your phone.";
      const tick = now => {
        an.getFloatTimeDomainData(buf);
        let s = 0; for (const v of buf) s += v * v;
        const rms = Math.sqrt(s / buf.length), dt = now - last; last = now;
        meterBar.style.width = Math.min(100, rms * 400) + "%";
        if (now - t0 < graceMs) { base += rms; n++; }          // brief cooldown + background noise calibration
        else {
          const threshold = Math.max(sensitivity, (base / Math.max(n, 1)) * 3);
          held = rms > threshold ? held + dt : Math.max(0, held - dt * 2);
          if (held >= holdMs) { blowOut(true); return; }
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    } catch (e) {
      stopMic(); micBtn.disabled = false;
      fallback("Couldn't use the microphone. Tap the button below instead.");
    }
  });

  /* ---------- 4. Wish ---------- */
  let wishTimer;
  function fireflies(n) {
    if (body.classList.contains("reduced")) n = 4;
    for (let i = 0; i < n; i++) {
      const f = document.createElement("span"); f.className = "fly"; f.dataset.wish = "1";
      f.style.cssText = `left:${rand(5, 95)}%;top:${rand(10, 90)}%;--d:${rand(5, 9)}s;--dx:${rand(-80, 80)}px;--dy:${rand(-90, 60)}px;animation-delay:${-rand(0, 5)}s`;
      fx.appendChild(f);
    }
  }
  function runWish() {
    stars(46); fireflies(14); chime([659, 988, 1319]);
    later(() => chime([784, 1175]), 3500);
    clearInterval(wishTimer);
    wishTimer = setInterval(() => { if (step !== 2) return clearInterval(wishTimer); floaters(6, null, ["✦", "♥", "✧"]); }, 1300);
    later(() => go(3), 11500);
  }

  /* ---------- 4. Bouquet: white roses + lavender, drawn as paper "magazine cut-outs" ---------- */
  function flowerSVG(u = "a") {
    if (CONFIG.bouquetImage) return `<img class="photo" src="${CONFIG.bouquetImage}" alt="">`;
    let k = 0; seed = 3;
    const piece = (inner, f) => `<g class="piece" style="--k:${k++}"><g filter="url(#${f}${u})">${inner}</g></g>`;
    const leaf = (x, y, len, w, ang) => piece(`<g transform="translate(${x} ${y}) rotate(${ang})"><path d="M0 0C${w} ${-len * .3} ${w * .8} ${-len * .8} 0 ${-len}C${-w * .8} ${-len * .8} ${-w} ${-len * .3} 0 0Z" fill="url(#lf${u})" stroke="#3f6f3a" stroke-opacity=".55"/><path d="M0 -4L0 ${-len * .9}" stroke="#355f31" stroke-opacity=".45" stroke-width="1.2" fill="none"/></g>`, "cutl");
    const rose = (cx, cy, r, rot) => {
      const layers = [[6, 30, 27, 25, 0, 0], [5, 21, 21, 20, 25, 1], [5, 13, 15, 15, 45, 0], [4, 6, 10, 10, 10, 1]];
      let g = "";
      layers.forEach(([n, d, rx, ry, off, gi]) => { for (let i = 0; i < n; i++) g += `<ellipse cx="0" cy="${-d}" rx="${rx}" ry="${ry}" transform="rotate(${off + i * 360 / n})" fill="url(#pet${gi}${u})" stroke="#c9bba3" stroke-opacity=".6" stroke-width=".9"/>`; });
      g += `<path d="M-5 -1C-5 -9 6 -9 6 -1C6 5 -3 6 -4 1" fill="none" stroke="#b9a68a" stroke-opacity=".7" stroke-width="1.3"/><circle r="2.2" fill="#e8d9c2"/>`;
      return piece(`<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${r / 57})">${g}</g>`, "cut");
    };
    const lav = (x0, y0, cx, cy, x1, y1, n = 16, sz = 1) => {
      let g = `<path d="M${x0} ${y0}Q${cx} ${cy} ${x1} ${y1}" fill="none" stroke="#6f8f5e" stroke-width="2.6" stroke-linecap="round"/>`;
      for (let i = 0; i < n; i++) {
        const t = .3 + .7 * i / (n - 1), m = 1 - t;
        const x = m * m * x0 + 2 * m * t * cx + t * t * x1, y = m * m * y0 + 2 * m * t * cy + t * t * y1;
        const ang = Math.atan2(2 * m * (cy - y0) + 2 * t * (y1 - cy), 2 * m * (cx - x0) + 2 * t * (x1 - cx)) * 180 / Math.PI + 90;
        const f = (1.15 - .6 * i / (n - 1)) * sz;
        for (const sd of [-1, 1]) g += `<ellipse cx="${(sd * 3.2 * f).toFixed(1)}" rx="${(3.1 * f).toFixed(1)}" ry="${(6.4 * f).toFixed(1)}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(ang + sd * 24).toFixed(1)})" fill="url(#flo${u})" stroke="#5b3f99" stroke-opacity=".35" stroke-width=".5"/>`;
      }
      return piece(g, "cutl");
    };
    let blob = "";
    for (let i = 0; i < 30; i++) { const a = i / 30 * Math.PI * 2, r = 172 + prand() * 22 - 8; blob += `${i ? "L" : "M"}${(210 + Math.cos(a) * r * 1.05).toFixed(1)} ${(205 + Math.sin(a) * r * .98).toFixed(1)}`; }
    blob += "Z";
    const bars = [[165, 444, 80], [168, 456, 70], [163, 468, 76], [180, 480, 50]].map(b => `<rect x="${b[0]}" y="${b[1]}" width="${b[2]}" height="3" rx="1.5"/>`).join("");
    const filt = (id, grain) => `<filter id="${id}${u}" x="-40%" y="-20%" width="180%" height="140%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="d"/><feFlood flood-color="#fff" result="w"/><feComposite in="w" in2="d" operator="in" result="outline"/>
      <feGaussianBlur in="d" stdDeviation="3" result="b"/><feOffset in="b" dx="2" dy="4" result="o"/><feFlood flood-color="#3b2a1a" flood-opacity=".35"/><feComposite in2="o" operator="in" result="shadow"/>
      ${grain ? `<feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .35  0 0 0 0 .3  0 0 0 0 .25  1.2 0 0 0 -.45" result="gr"/><feComposite in="gr" in2="SourceAlpha" operator="in" result="g2"/>` : ""}
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="outline"/><feMergeNode in="SourceGraphic"/>${grain ? '<feMergeNode in="g2"/>' : ""}</feMerge></filter>`;
    let body_ = "";
    if (CONFIG.bouquetBackdrop) body_ += piece(`<path d="${blob}" fill="#eadff8"/><path d="${blob}" fill="url(#ht${u})"/>`, "cut");
    [[-62, 200], [-38, 215], [-14, 190], [16, 195], [40, 215], [64, 200]].forEach(([a, l]) => body_ += leaf(210, 405, l, 34, a));
    [[205, 430, 150, 300, 95, 95, 16], [208, 430, 170, 260, 150, 40, 17], [212, 430, 215, 240, 215, 20, 17], [214, 430, 255, 260, 275, 45, 17], [218, 430, 280, 300, 330, 100, 16], [200, 430, 110, 330, 45, 200, 14], [222, 430, 320, 330, 385, 205, 14]].forEach(a => body_ += lav(...a));
    [[160, 150, 46, -10], [258, 146, 44, 15], [122, 252, 56, 8], [298, 250, 56, -12], [210, 214, 66, 0]].forEach(r => body_ += rose(...r));
    body_ += lav(190, 425, 120, 330, 70, 262, 11, .9) + lav(232, 425, 300, 330, 352, 260, 11, .9) + leaf(170, 338, 80, 22, -52) + leaf(250, 338, 80, 22, 52);
    body_ += piece(`<path d="M80 328Q210 304 340 328L262 508Q210 522 158 508Z" fill="url(#kraft${u})" stroke="#c9ab7e"/><path d="M80 328Q210 304 340 328L262 508Q210 522 158 508Z" fill="url(#ht${u})"/>`, "cut");
    body_ += piece(`<path d="M104 336Q210 318 316 336L254 494Q210 504 166 494Z" fill="#eadff8" stroke="#cdb9ee"/><path d="M104 336Q210 318 316 336L254 494Q210 504 166 494Z" fill="url(#ht${u})"/><g fill="#9a8fb0" opacity=".5">${bars}</g>`, "cut");
    body_ += piece(`<path d="M204 376L186 430L206 416Z" fill="#a58ae0"/><path d="M216 376L236 432L214 416Z" fill="#a58ae0"/><path d="M112 350Q210 368 308 350L306 372Q210 390 114 372Z" fill="#b9a2e6" stroke="#8d6fd0" stroke-opacity=".5"/><path d="M114 356Q210 372 306 356" stroke="#fff" stroke-opacity=".55" fill="none" stroke-width="2"/><ellipse cx="180" cy="364" rx="30" ry="15" fill="#c8b6ee" stroke="#8d6fd0" stroke-opacity=".5" transform="rotate(-18 180 364)"/><ellipse cx="240" cy="364" rx="30" ry="15" fill="#c8b6ee" stroke="#8d6fd0" stroke-opacity=".5" transform="rotate(18 240 364)"/><circle cx="210" cy="366" r="10" fill="#a58ae0" stroke="#8d6fd0" stroke-opacity=".5"/>`, "cutl");
    return `<svg viewBox="0 0 420 520" aria-hidden="true"><defs>
      <linearGradient id="pet0${u}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d8ccb7"/><stop offset=".5" stop-color="#f5f0e7"/><stop offset="1" stop-color="#fff"/></linearGradient>
      <linearGradient id="pet1${u}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e4d9c6"/><stop offset=".5" stop-color="#fbf8f2"/><stop offset="1" stop-color="#fff"/></linearGradient>
      <linearGradient id="flo${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c8b4f2"/><stop offset=".6" stop-color="#9677d3"/><stop offset="1" stop-color="#6f4fb0"/></linearGradient>
      <linearGradient id="lf${u}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#4f8a4a"/><stop offset="1" stop-color="#9cc88a"/></linearGradient>
      <linearGradient id="kraft${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ecd9b9"/><stop offset="1" stop-color="#d6bb8d"/></linearGradient>
      <pattern id="ht${u}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="4.5" cy="4.5" r="1.7" fill="#9d84d6" opacity=".45"/></pattern>
      ${filt("cut", true)}${filt("cutl", false)}</defs>${body_}</svg>`;
  }
  const tag = $("#tagBtn"), overlay = $("#noteOverlay"), lastBtn = $("#lastBtn");
  function runFlower() {
    const box = $("#flowerBox"); tag.classList.remove("show");
    box.innerHTML = flowerSVG(); void box.offsetWidth; box.classList.add("grow");
    chime([523, 784]);
    later(() => floaters(10, box, ["❀", "✿", "♥"]), 4500);
    later(() => tag.classList.add("show"), body.classList.contains("reduced") ? 300 : 5400);
  }
  function openNote() { overlay.classList.remove("hidden"); lastBtn.classList.remove("hidden"); chime([659, 988]); $("#noteClose").focus(); }
  function closeNote() { overlay.classList.add("hidden"); tag.focus({ preventScroll: true }); }
  tag.addEventListener("click", openNote);
  $("#noteClose").addEventListener("click", closeNote);
  overlay.addEventListener("click", e => { if (e.target === overlay) closeNote(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !overlay.classList.contains("hidden")) closeNote(); });

  /* ---------- 6. Song ---------- */
  const audio = new Audio(); audio.preload = "metadata"; audio.src = CONFIG.songFile;
  const playBtn = $("#playBtn"), seek = $("#seek"), vol = $("#vol"), record = $("#record"), bars = $$("#viz i");
  let audioOK = true, vizTimer, analyser, vdata;
  const fmt = s => isFinite(s) ? Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0") : "0:00";
  audio.volume = +vol.value;
  audio.addEventListener("error", () => {
    audioOK = false; $("#audioNote").classList.remove("hidden");
    $("#audioNote").textContent = "The song isn't here yet. Add birthday-song.mp3 to assets/audio/ and refresh. The rest of the surprise still works!";
  });
  audio.addEventListener("loadedmetadata", () => { $("#tAll").textContent = fmt(audio.duration); });
  audio.addEventListener("timeupdate", () => { $("#tNow").textContent = fmt(audio.currentTime); if (audio.duration) seek.value = audio.currentTime / audio.duration * 100; });
  audio.addEventListener("ended", () => setPlaying(false));
  seek.addEventListener("input", () => { if (audio.duration) audio.currentTime = seek.value / 100 * audio.duration; });
  vol.addEventListener("input", () => { audio.volume = +vol.value; });

  function setPlaying(on) {
    playBtn.textContent = on ? "❚❚" : "▶";
    playBtn.setAttribute("aria-label", on ? "Pause birthday song" : "Play birthday song");
    record.classList.toggle("spin", on); $("#turntable").classList.toggle("playing", on);
    clearInterval(vizTimer);
    if (on) {
      try { // optional real visualizer; falls back to a gentle random one
        if (!analyser) { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const src = actx.createMediaElementSource(audio); analyser = actx.createAnalyser(); analyser.fftSize = 64; src.connect(analyser); analyser.connect(actx.destination); vdata = new Uint8Array(analyser.frequencyBinCount); }
        if (actx.state === "suspended") actx.resume();
      } catch (e) { analyser = null; }
      vizTimer = setInterval(() => {
        if (analyser) analyser.getByteFrequencyData(vdata);
        bars.forEach((b, i) => { b.style.height = (analyser && vdata[i + 1] ? 6 + vdata[i + 1] / 255 * 38 : rand(8, 38)) + "px"; });
        if (Math.random() < .3) floaters(1, record);
      }, 140);
    } else bars.forEach(b => b.style.height = "6px");
  }
  async function playSong(fromStart) {
    if (!audioOK) return;
    try { if (fromStart) audio.currentTime = 0; await audio.play(); setPlaying(true); }
    catch (e) { $("#audioNote").classList.remove("hidden"); $("#audioNote").textContent = "Couldn't play the song. Check that assets/audio/birthday-song.mp3 exists."; }
  }
  function pauseSong() { if (!audio.paused) audio.pause(); setPlaying(false); }
  playBtn.addEventListener("click", () => audio.paused ? playSong() : pauseSong());
  $("#replayBtn").addEventListener("click", () => playSong(true));
  if (!audioOK) playBtn.disabled = true;
  audio.addEventListener("error", () => { playBtn.disabled = true; $("#replayBtn").disabled = true; });

  /* ---------- 7. Final ---------- */
  let finalTimer;
  function runFinal() {
    const box = $("#finalFlower"); box.innerHTML = flowerSVG(); void box.offsetWidth; box.classList.add("grow");
    chime([523, 659, 784, 1047, 1319]);
    clearInterval(finalTimer);
    floaters(16);
    finalTimer = setInterval(() => { if (step !== 5) return clearInterval(finalTimer); floaters(5); }, 2500);
  }

  /* ---------- Restart ---------- */
  $("#restartBtn").addEventListener("click", () => {
    clearInterval(finalTimer); safeTimeouts.forEach(clearTimeout); pauseSong(); audio.currentTime = 0; seek.value = 0;
    cardOpen = candlesOut = false;
    card.classList.remove("open"); card.setAttribute("aria-expanded", "false");
    $("#openBtn").classList.remove("hidden"); $("#afterOpenBtn").classList.add("hidden");
    cake.classList.remove("out"); $("#cakeAsk").classList.remove("hidden"); $("#yay").classList.add("hidden");
    micBtn.disabled = false; status.textContent = ""; tapBtn.classList.add("hidden"); stopMic();
    $("#flowerBox").classList.remove("grow"); $("#finalFlower").classList.remove("grow");
    overlay.classList.add("hidden"); lastBtn.classList.add("hidden"); tag.classList.remove("show");
    go(0);
  });

  /* ---------- Start ---------- */
  updateProgress();
  setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  if (!body.classList.contains("reduced")) startBg();
})();
