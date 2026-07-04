/* ============================================================
   Berker DAL — Yatay Yapay Sinir Ağı arka planı + Sekme UI
   ============================================================ */

/* ---------- 1. Yatay Sinir Ağı (Canvas 2D, siyah) ---------- */
(function initNetwork() {
  const canvas = document.getElementById('net-canvas');
  const ctx = canvas.getContext('2d');

  const INK = '20, 21, 26'; // siyah (rgb)
  const MONO = '"JetBrains Mono", monospace';

  let W, H, dpr;
  let layers = [];       // [[node, ...], ...]  node: {x, y, baseY, phase, bob, r, act}
  let connections = [];  // {a, b, w}  — w: ağırlık [-1, 1]
  let pulses = [];       // bağlantı üzerinde ilerleyen sinyaller
  let weightLabels = []; // seyrek w=… etiketleri
  let actLabels = [];    // seyrek a=… etiketleri
  let formulas = [];     // boşluklarda süzülen formüller
  let layerNames = [];
  let mouse = { x: -9999, y: -9999 };

  // Eğitim günlüğü (köşede akan epoch/loss)
  let epoch = 1, loss = 2.312, logLines = [], logTimer = 0;

  const FORMULAS = [
    'a = σ(Wx + b)',
    'ŷ = softmax(z)',
    'L = −Σ yᵢ log ŷᵢ',
    'W ← W − η·∇L',
    '∂L/∂W = δ·aᵀ',
    'ReLU(z) = max(0, z)',
    'z = Σ wᵢxᵢ + b',
    'η = 1e−3',
    'δ = ∇a L ⊙ σ′(z)'
  ];

  function build() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth;
    H = innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    layers = []; connections = []; pulses = [];
    weightLabels = []; actLabels = []; formulas = []; layerNames = [];

    // Katmanlar: girdi → gizli katmanlar → çıktı
    const layerCount = Math.max(5, Math.min(11, Math.round(W / 170)));
    const marginX = -40;
    const spanX = W - marginX * 2;

    for (let i = 0; i < layerCount; i++) {
      const t = i / (layerCount - 1);
      const bell = Math.sin(t * Math.PI);
      const nodeCount = Math.round(3 + bell * 4 + Math.random() * 1.5);

      const x = marginX + t * spanX;
      const layer = [];
      const spreadY = H * (0.42 + bell * 0.26); // dikeyde daha fazla alan kapla
      for (let j = 0; j < nodeCount; j++) {
        const yt = nodeCount === 1 ? 0.5 : j / (nodeCount - 1);
        layer.push({
          x: x + (Math.random() - 0.5) * 24,
          baseY: H * 0.5 + (yt - 0.5) * spreadY + (Math.random() - 0.5) * 22,
          y: 0,
          phase: Math.random() * Math.PI * 2,
          bob: 4 + Math.random() * 7,
          r: 2.6 + Math.random() * 2.2,
          act: Math.random() * 0.35   // aktivasyon [0,1] — sinyal geldikçe artar
        });
      }
      layers.push(layer);

      // Katman adları (site diline göre)
      const en = (document.documentElement.lang || 'tr').toLowerCase().startsWith('en');
      if (i === 0) layerNames.push({ x, text: en ? 'input' : 'girdi' });
      else if (i === layerCount - 1) layerNames.push({ x, text: en ? 'output' : 'çıktı' });
      else layerNames.push({ x, text: (en ? 'hidden ' : 'gizli ') + i });
    }

    // Bağlantılar + ağırlıklar
    for (let i = 0; i < layers.length - 1; i++) {
      for (const a of layers[i]) {
        for (const b of layers[i + 1]) {
          if (Math.random() < 0.7) {
            connections.push({ a, b, w: Math.random() * 2 - 1 });
          }
        }
      }
    }

    // Seyrek ağırlık etiketleri (~10 bağlantı)
    const shuffled = [...connections].sort(() => Math.random() - 0.5);
    weightLabels = shuffled.slice(0, Math.min(10, shuffled.length)).map((c) => ({
      conn: c,
      phase: Math.random() * Math.PI * 2
    }));

    // Seyrek aktivasyon etiketleri (~7 düğüm)
    const allNodes = layers.flat().sort(() => Math.random() - 0.5);
    actLabels = allNodes.slice(0, Math.min(7, allNodes.length)).map((n) => ({
      node: n,
      phase: Math.random() * Math.PI * 2
    }));

    // Formüller — plakanın kapladığı orta bölgeden kaçınıp kenar bantlarına yerleş
    for (const text of FORMULAS) {
      let fx, fy, tries = 0;
      do {
        fx = 30 + Math.random() * (W - 160);
        fy = 60 + Math.random() * (H - 120);
        tries++;
      } while (tries < 40 &&
               fx > W * 0.14 && fx < W * 0.78 &&
               fy > H * 0.12 && fy < H * 0.88);
      formulas.push({
        text, x: fx, y: fy,
        phase: Math.random() * Math.PI * 2,
        drift: 6 + Math.random() * 8
      });
    }

    logLines = [];
  }

  function spawnPulse() {
    if (pulses.length > 26 || connections.length === 0) return;
    pulses.push({
      conn: connections[(Math.random() * connections.length) | 0],
      t: 0,
      speed: 0.004 + Math.random() * 0.007
    });
  }

  addEventListener('resize', build);
  addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  /* --- Köşe süslemeleri --- */

  // Gradyan inişi konturları (sağ üst): iç içe elipsler + inen nokta izi
  function drawContours(t) {
    if (W < 900) return;
    const cx = W - 130, cy = 120;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.35);
    for (let i = 1; i <= 5; i++) {
      ctx.strokeStyle = `rgba(${INK}, ${0.09 - i * 0.008})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, i * 22, i * 13, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Minimuma inen iz (küçük noktalar)
    const steps = 6;
    for (let i = 0; i < steps; i++) {
      const p = i / (steps - 1);
      const ang = 2.6 - p * 1.4;
      const rad = (1 - p) * 95 + 4;
      const px = Math.cos(ang) * rad;
      const py = Math.sin(ang) * rad * 0.6;
      const blink = 0.5 + 0.5 * Math.sin(t * 0.001 - i * 0.9);
      ctx.fillStyle = `rgba(${INK}, ${0.15 + blink * 0.11})`;
      ctx.beginPath();
      ctx.arc(px, py, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = `rgba(${INK}, 0.20)`;
    ctx.font = `9px ${MONO}`;
    ctx.fillText('∇L → 0', -18, 5 * 13 + 16);
    ctx.restore();
  }

  // Kayıp eğrisi (sol alt): eksenler + üstel azalan eğri
  function drawLossCurve() {
    if (W < 900) return;
    const ox = 46, oy = H - 130, w = 120, h = 62;
    ctx.strokeStyle = `rgba(${INK}, 0.18)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ox, oy - h); ctx.lineTo(ox, oy); ctx.lineTo(ox + w, oy);
    ctx.stroke();

    ctx.strokeStyle = `rgba(${INK}, 0.24)`;
    ctx.beginPath();
    for (let i = 0; i <= w; i += 3) {
      const p = i / w;
      const y = oy - h * (0.12 + 0.88 * Math.exp(-p * 4) + Math.sin(p * 30) * 0.03 * (1 - p));
      i === 0 ? ctx.moveTo(ox + i, y) : ctx.lineTo(ox + i, y);
    }
    ctx.stroke();

    ctx.fillStyle = `rgba(${INK}, 0.20)`;
    ctx.font = `9px ${MONO}`;
    ctx.fillText('loss', ox - 4, oy - h - 6);
    ctx.fillText('epoch', ox + w - 26, oy + 12);
  }

  // Eğitim günlüğü (sol alt köşe, kayıp eğrisinin altında)
  function drawTrainingLog(t) {
    if (W < 900) return;
    if (t - logTimer > 2400) {
      logTimer = t;
      loss = Math.max(0.041, 0.03 + (loss - 0.03) * 0.9 + (Math.random() - 0.5) * 0.01);
      logLines.push(`epoch ${String(epoch).padStart(3, '0')}  ·  loss ${loss.toFixed(4)}`);
      if (logLines.length > 4) logLines.shift();
      epoch++;
      if (epoch > 200) { epoch = 1; loss = 2.312; }
    }
    ctx.font = `9px ${MONO}`;
    logLines.forEach((line, i) => {
      const alpha = 0.10 + (i / logLines.length) * 0.13;
      ctx.fillStyle = `rgba(${INK}, ${alpha})`;
      ctx.fillText(line, 46, H - 44 + i * 12 - (logLines.length - 1) * 12);
    });
  }

  function frame(t) {
    requestAnimationFrame(frame);
    ctx.clearRect(0, 0, W, H);

    // Köşe süslemeleri
    drawContours(t);
    drawLossCurve();
    drawTrainingLog(t);

    // Süzülen formüller
    ctx.font = `11px ${MONO}`;
    for (const f of formulas) {
      const breathe = 0.5 + 0.5 * Math.sin(t * 0.00035 + f.phase);
      const dy = Math.sin(t * 0.0002 + f.phase) * f.drift;
      ctx.fillStyle = `rgba(${INK}, ${0.08 + breathe * 0.10})`;
      ctx.fillText(f.text, f.x, f.y + dy);
    }

    // Düğüm salınımı + aktivasyon sönümü
    for (const layer of layers) {
      for (const n of layer) {
        n.y = n.baseY + Math.sin(t * 0.00055 + n.phase) * n.bob;
        n.act *= 0.996; // aktivasyon zamanla söner
      }
    }

    // Bağlantılar — kalınlık ve koyuluk |ağırlık| ile orantılı,
    // negatif ağırlıklar kesikli çizgi
    for (const c of connections) {
      const mx = (c.a.x + c.b.x) / 2;
      const my = (c.a.y + c.b.y) / 2;
      const md = Math.hypot(mouse.x - mx, mouse.y - my);
      const boost = Math.max(0, 1 - md / 260) * 0.14;
      const aw = Math.abs(c.w);

      ctx.strokeStyle = `rgba(${INK}, ${0.05 + aw * 0.11 + boost})`;
      ctx.lineWidth = 0.5 + aw * 1.3;
      ctx.setLineDash(c.w < 0 ? [5, 5] : []);
      ctx.beginPath();
      ctx.moveTo(c.a.x, c.a.y);
      ctx.lineTo(c.b.x, c.b.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.lineWidth = 1;

    // Sinyal darbeleri — varışta hedef düğümün aktivasyonunu artırır
    if (Math.random() < 0.3) spawnPulse();
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.t += p.speed;
      if (p.t >= 1) {
        p.conn.b.act = Math.min(1, p.conn.b.act + 0.45 * Math.abs(p.conn.w));
        pulses.splice(i, 1);
        continue;
      }
      const { a, b, w } = p.conn;
      const x = a.x + (b.x - a.x) * p.t;
      const y = a.y + (b.y - a.y) * p.t;
      const fade = Math.sin(p.t * Math.PI) * (0.35 + Math.abs(w) * 0.4);

      ctx.fillStyle = `rgba(${INK}, ${fade})`;
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(${INK}, ${fade * 0.4})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      const tx = a.x + (b.x - a.x) * Math.max(0, p.t - 0.07);
      const ty = a.y + (b.y - a.y) * Math.max(0, p.t - 0.07);
      ctx.moveTo(tx, ty);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.lineWidth = 1;
    }

    // Düğümler — dolgu koyuluğu aktivasyonla orantılı
    for (const layer of layers) {
      for (const n of layer) {
        const md = Math.hypot(mouse.x - n.x, mouse.y - n.y);
        const boost = Math.max(0, 1 - md / 200);

        ctx.strokeStyle = `rgba(${INK}, ${0.20 + boost * 0.4})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 3.5 + boost * 3 + n.act * 1.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(${INK}, ${0.30 + n.act * 0.55 + boost * 0.15})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + boost * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Seyrek ağırlık etiketleri — w=+0.47
    ctx.font = `9px ${MONO}`;
    for (const wl of weightLabels) {
      const breathe = 0.5 + 0.5 * Math.sin(t * 0.0004 + wl.phase);
      const { a, b, w } = wl.conn;
      const lx = a.x + (b.x - a.x) * 0.5 + 6;
      const ly = a.y + (b.y - a.y) * 0.5 - 5;
      ctx.fillStyle = `rgba(${INK}, ${0.07 + breathe * 0.17})`;
      ctx.fillText(`w=${w >= 0 ? '+' : '−'}${Math.abs(w).toFixed(2)}`, lx, ly);
    }

    // Seyrek aktivasyon etiketleri — a=0.82 (canlı değer)
    for (const al of actLabels) {
      const breathe = 0.5 + 0.5 * Math.sin(t * 0.0004 + al.phase);
      ctx.fillStyle = `rgba(${INK}, ${0.07 + breathe * 0.17})`;
      ctx.fillText(`a=${al.node.act.toFixed(2)}`, al.node.x + 10, al.node.y - 9);
    }

    // Katman adları (alt kenar)
    ctx.font = `9px ${MONO}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(${INK}, 0.17)`;
    for (const ln of layerNames) {
      if (ln.x > 20 && ln.x < W - 20) ctx.fillText(ln.text, ln.x, H - 16);
    }
    ctx.textAlign = 'left';
  }

  build();
  requestAnimationFrame(frame);

  // Dil değişince katman adlarının güncellenebilmesi için
  window.__netRebuild = build;
})();

/* ---------- 2. Sekmeler ---------- */
(function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  const indicator = document.getElementById('tab-indicator');

  function moveIndicator(tab) {
    indicator.style.left = tab.offsetLeft + 'px';
    indicator.style.width = tab.offsetWidth + 'px';
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      moveIndicator(tab);

      document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
      const panel = document.getElementById(tab.dataset.panel);
      panel.classList.remove('active');
      void panel.offsetWidth; // animasyonu yeniden tetikle
      panel.classList.add('active');
    });
  });

  // Başlangıç konumu (fontlar yüklendikten sonra da düzelt)
  const active = document.querySelector('.tab.active');
  moveIndicator(active);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => moveIndicator(document.querySelector('.tab.active')));
  }
  addEventListener('resize', () => moveIndicator(document.querySelector('.tab.active')));
})();

/* ---------- 3. Kaydırma rayı (panel içi) ---------- */
(function initScrollRail() {
  const panels = document.querySelector('.panels');
  const rail = document.getElementById('scroll-rail');
  const up = document.getElementById('rail-up');
  const down = document.getElementById('rail-down');
  const thumb = document.getElementById('rail-thumb');
  if (!panels || !rail) return;

  function update() {
    const canScroll = panels.scrollHeight > panels.clientHeight + 4;
    rail.classList.toggle('visible', canScroll);
    if (!canScroll) return;

    const maxScroll = panels.scrollHeight - panels.clientHeight;
    const progress = panels.scrollTop / maxScroll;

    // İlerleme topuzu ray boyunca kayar
    const track = thumb.parentElement;
    const range = track.clientHeight - thumb.clientHeight;
    thumb.style.top = (progress * Math.max(0, range)) + 'px';

    up.classList.toggle('disabled', panels.scrollTop <= 8);
    down.classList.toggle('disabled', panels.scrollTop >= maxScroll - 8);
  }

  panels.addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);

  up.addEventListener('click', () =>
    panels.scrollBy({ top: -panels.clientHeight * 0.7, behavior: 'smooth' })
  );
  down.addEventListener('click', () =>
    panels.scrollBy({ top: panels.clientHeight * 0.7, behavior: 'smooth' })
  );

  // Ray üzerine tıklayınca o orana atla
  thumb.parentElement.addEventListener('click', (e) => {
    if (e.target === thumb) return;
    const r = e.currentTarget.getBoundingClientRect();
    const p = (e.clientY - r.top) / r.height;
    panels.scrollTo({
      top: p * (panels.scrollHeight - panels.clientHeight),
      behavior: 'smooth'
    });
  });

  // Sekme değişince başa dön ve rayı güncelle
  document.querySelectorAll('.tab').forEach((t) =>
    t.addEventListener('click', () => {
      panels.scrollTop = 0;
      setTimeout(update, 80);
    })
  );

  update();
  // Fontlar/görseller yüklenince yükseklikler değişebilir
  setTimeout(update, 400);
  addEventListener('load', update);
})();
