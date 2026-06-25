/* ============================================================
   hero-rain.js — manuscript rain across the WHOLE page, behind
   all content. Content blocks sit on their own soft-edged ivory
   panels, so text stays clean while the rain runs full-width.
   Text: Wang Dun passage (Zizhi Tongjian), Noto Serif TC.
   - fixed to viewport, full width, covers header→footer;
   - column count scales with full page width (many columns on
     large screens);
   - motion time-based (size-independent speed);
   - glyphs mutate a touch more often than before.
   Disabled under prefers-reduced-motion.
   ============================================================ */

(function () {
  const canvas = document.getElementById("hero-rain");
  if (!canvas) return;

  const glyphs = (
    "春正月郭璞複上疏請因皇孫生下赦令帝從之乙卯大赦改元王敦以璞爲記室參軍璞善卜筮知敦必爲亂己預其禍甚憂之大將軍掾穎川陳述卒璞哭之極哀曰嗣祖焉知非福也敦既與朝廷乖離乃羈錄朝士有時望者置己幕府以羊曼及陳國謝鯤爲長史曼祜之兄孫也曼鯤終日酣醉故敦不委以事敦將作亂謂鯤曰劉隗奸邪將危社稷吾欲除君側之惡何如鯤曰隗誠始禍然城狐社鼠敦怒曰君庸才豈達大體出爲豫章太守又留不遣戊辰敦舉兵于武昌上疏罪狀劉隗稱隗佞邪讒賊威福自由妄興事役勞擾士民賦役煩重怨聲盈路臣備位宰輔不可坐視成敗輒進軍致討隗首朝懸諸軍夕退"
  ).split("");

  const rnd = () => glyphs[Math.floor(Math.random() * glyphs.length)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const dpr = window.devicePixelRatio || 1;
  const fs = 18;             // glyph size px
  const colW = 155;           // column spacing px (larger -> sparser)
  const ROWS_PER_SEC = 5.2;  // fall speed, rows per second
  const MUTATE = 0.96;      // higher chance to change than before (was .992)

  let W = 0, H = 0, cols = 0, ctx = null, streams = [], last = 0, raf = 0;

  function setup() {
    W = Math.round(document.documentElement.clientWidth || window.innerWidth);
    H = Math.round(window.innerHeight);

    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cols = Math.max(3, Math.ceil(W / colW));   // columns across the WHOLE width

    streams = [];
    for (let i = 0; i < cols; i++) {
      streams.push({
        head: Math.random() * -(H / fs),
        speedMul: 0.75 + Math.random() * 0.6,
        len: 5 + Math.floor(Math.random() * 7),
        cells: {}
      });
    }
    last = performance.now();
  }

  function glyphAt(s, row) {
    if (!s.cells[row] || Math.random() > MUTATE) s.cells[row] = rnd();
    return s.cells[row];
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    ctx.clearRect(0, 0, W, H);
    ctx.font = fs + "px 'Noto Serif TC', serif";

    for (let i = 0; i < cols; i++) {
      const s = streams[i];
      const x = i * colW + colW / 2 - fs / 2;
      const headRow = Math.floor(s.head);
      for (let k = 0; k < s.len; k++) {
        const row = headRow - k;
        if (row < 0) continue;
        const y = row * fs + fs;
        if (y > H + fs) continue;
        const fade = 1 - k / s.len;
        ctx.fillStyle = "rgba(21,36,59," + (0.07 + fade * 0.24).toFixed(3) + ")";
        ctx.fillText(glyphAt(s, row), x, y);
      }
      s.head += ROWS_PER_SEC * s.speedMul * dt;
      if ((s.head - s.len) * fs > H) {
        s.head = Math.random() * -6;
        s.speedMul = 0.75 + Math.random() * 0.6;
        s.len = 5 + Math.floor(Math.random() * 7);
        s.cells = {};
      }
    }
    raf = requestAnimationFrame(frame);
  }

  function staticFill() {
    ctx.font = fs + "px 'Noto Serif TC', serif";
    ctx.fillStyle = "rgba(21,36,59,0.16)";
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < Math.ceil(H / fs); j++)
        ctx.fillText(rnd(), i * colW + colW / 2 - fs / 2, j * fs + fs);
  }

  function start() {
    cancelAnimationFrame(raf);
    setup();
    if (reduce) staticFill();
    else raf = requestAnimationFrame(frame);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start);
  } else {
    window.addEventListener("load", start);
  }

  let t;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(start, 150);
  });
})();
