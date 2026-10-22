/* 
    { id:'dog', name:'Aso / Dog', svg:`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><g fill="white" stroke="#24212b" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"><path d="M280 210 Q210 110 170 190 L200 340 Q220 390 280 350Z"/><path d="M520 210 Q590 110 630 190 L600 340 Q580 390 520 350Z"/><path d="M270 210 Q400 130 530 210 L550 370 Q540 480 400 480 Q260 480 250 370Z"/><ellipse cx="400" cy="375" rx="90" ry="65"/><circle cx="340" cy="300" r="12"/><circle cx="460" cy="300" r="12"/><path d="M375 350 Q400 330 425 350 Q410 375 400 375 Q390 375 375 350Z"/><path d="M400 375 L400 395 Q370 425 345 395 M400 395 Q430 425 455 395"/></g></svg>` },
 starter prototype — no external services or personal-data collection. */
(() => {
  const canvas = document.getElementById('artCanvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const pageList = document.getElementById('pageList');
  const paletteEl = document.getElementById('palette');
  const statusEl = document.getElementById('status');
  const modeHint = document.getElementById('modeHint');
  const brushSize = document.getElementById('brushSize');
  const brushValue = document.getElementById('brushValue');
  const installBtn = document.getElementById('installBtn');

  const colors = ['#ff5d8f','#ff9f1c','#ffd166','#06d6a0','#36a2eb','#6c63ff','#b565d9','#8b5e3c','#ff7f50','#222222','#ffffff'];
  let selectedColor = colors[0];
  let mode = 'fill';
  let erasing = false;
  let drawing = false;
  let lastPoint = null;
  let activePage = 'cat';
  let undoStack = [];
  let deferredInstallPrompt = null;

  // Original simple SVG coloring pages, drawn locally (no image downloads).
  const pages = [
    { id:'cat', name:'Pusa / Cat', svg:`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><g fill="white" stroke="#24212b" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"><path d="M270 210 L245 90 L350 155 Q400 130 450 155 L555 90 L530 215 Q585 275 570 375 Q555 475 400 475 Q245 475 230 375 Q215 275 270 210Z"/><path d="M300 315 Q320 290 340 315"/><path d="M460 315 Q480 290 500 315"/><path d="M385 350 Q400 365 415 350 Q400 385 385 350Z"/><path d="M400 380 L400 395 M400 395 Q375 420 350 395 M400 395 Q425 420 450 395"/><path d="M280 365 L170 345 M280 390 L165 395 M520 365 L630 345 M520 390 L635 395"/><path d="M325 465 Q310 515 350 520 L450 520 Q490 515 475 465"/></g><g fill="none" stroke="#24212b" stroke-width="8" stroke-linecap="round"><path d="M340 230 Q355 250 370 230 M430 230 Q445 250 460 230"/><path d="M365 160 Q350 190 365 205 M435 160 Q450 190 435 205"/></g></svg>` },
    { id:'sun', name:'Araw / Sun', svg:`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><g fill="white" stroke="#24212b" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"><path d="M400 80 L435 150 L510 110 L510 190 L590 185 L555 255 L630 300 L555 345 L590 420 L510 410 L510 490 L435 450 L400 520 L365 450 L290 490 L290 410 L210 420 L245 345 L170 300 L245 255 L210 185 L290 190 L290 110 L365 150Z"/><circle cx="400" cy="300" r="125"/></g><g fill="none" stroke="#24212b" stroke-width="9" stroke-linecap="round"><path d="M345 280 Q365 255 385 280 M415 280 Q435 255 455 280"/><path d="M345 335 Q400 395 455 335"/></g></svg>` },
    { id:'fish', name:'Isda / Fish', svg:`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><g fill="white" stroke="#24212b" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"><path d="M180 300 Q300 150 485 230 Q530 250 565 300 Q530 350 485 370 Q300 450 180 300Z"/><path d="M555 300 L680 205 L670 395Z"/><path d="M350 220 Q385 150 435 210 M350 380 Q385 450 435 390"/><circle cx="280" cy="275" r="18"/><path d="M370 250 Q405 300 370 350"/></g><g fill="none" stroke="#24212b" stroke-width="7" stroke-linecap="round"><path d="M200 300 Q225 320 245 300"/></g></svg>` },
    { id:'flower', name:'Bulaklak / Flower', svg:`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><g fill="white" stroke="#24212b" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="400" cy="170" rx="65" ry="95"/><ellipse cx="400" cy="430" rx="65" ry="95"/><ellipse cx="300" cy="300" rx="95" ry="65"/><ellipse cx="500" cy="300" rx="95" ry="65"/><ellipse cx="330" cy="220" rx="65" ry="90" transform="rotate(-45 330 220)"/><ellipse cx="470" cy="220" rx="65" ry="90" transform="rotate(45 470 220)"/><ellipse cx="330" cy="380" rx="65" ry="90" transform="rotate(45 330 380)"/><ellipse cx="470" cy="380" rx="65" ry="90" transform="rotate(-45 470 380)"/><circle cx="400" cy="300" r="80"/><path d="M400 380 L400 520"/><path d="M400 460 Q320 420 290 470 Q340 520 400 485"/><path d="M400 475 Q480 425 520 470 Q470 520 400 500"/></g><g fill="none" stroke="#24212b" stroke-width="8" stroke-linecap="round"><path d="M370 290 Q385 270 395 290 M405 290 Q420 270 430 290 M370 325 Q400 350 430 325"/></g></svg>` }
  ];

  function setStatus(message) { statusEl.textContent = message; }
  function svgData(svg) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }

  function drawPage(pageId) {
    activePage = pageId;
    const page = pages.find(p => p.id === pageId) || pages[0];
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      undoStack = [];
      saveUndo();
      renderPageButtons();
      setStatus(`${page.name} ready! Puwede ka nang magkulay.`);
    };
    img.src = svgData(page.svg);
  }

  function renderPageButtons() {
    pageList.innerHTML = '';
    pages.forEach(page => {
      const btn = document.createElement('button');
      btn.className = 'page-card' + (page.id === activePage ? ' active' : '');
      btn.setAttribute('aria-pressed', String(page.id === activePage));
      const img = document.createElement('img');
      img.className = 'page-thumb';
      img.alt = '';
      img.src = svgData(page.svg);
      const label = document.createElement('span');
      label.textContent = page.name;
      btn.append(img, label);
      btn.addEventListener('click', () => drawPage(page.id));
      pageList.appendChild(btn);
    });
  }

  function renderPalette() {
    paletteEl.innerHTML = '';
    colors.forEach(color => {
      const btn = document.createElement('button');
      btn.className = 'swatch' + (color === selectedColor ? ' active' : '');
      btn.style.background = color;
      btn.setAttribute('aria-label', `Choose ${color}`);
      btn.setAttribute('aria-pressed', String(color === selectedColor));
      btn.addEventListener('click', () => {
        selectedColor = color;
        erasing = false;
        document.getElementById('eraserBtn').classList.remove('active');
        renderPalette();
      });
      paletteEl.appendChild(btn);
    });
  }

  function saveUndo() {
    try {
      undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      if (undoStack.length > 25) undoStack.shift();
    } catch (e) { /* Ignore browser memory limits gracefully. */ }
  }

  function undo() {
    if (undoStack.length <= 1) {
      setStatus('Wala pang ibang action na puwedeng i-undo.');
      return;
    }
    undoStack.pop();
    ctx.putImageData(undoStack[undoStack.length - 1], 0, 0);
    setStatus('Undo complete!');
  }

  function pointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(canvas.width - 1, Math.floor((event.clientX - rect.left) * canvas.width / rect.width))),
      y: Math.max(0, Math.min(canvas.height - 1, Math.floor((event.clientY - rect.top) * canvas.height / rect.height)))
    };
  }

  // Flood fill: fills a connected white/light area while preserving dark outlines.
  function floodFill(startX, startY, hex) {
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = image.data;
    const width = image.width, height = image.height;
    const start = (startY * width + startX) * 4;
    const target = [data[start], data[start + 1], data[start + 2], data[start + 3]];
    const replacement = hexToRgb(hex);
    if (target[0] < 225 && target[1] < 225 && target[2] < 225) {
      setStatus('Pumili ng puting bahagi sa loob ng outline para mag-fill.');
      return false;
    }
    if (Math.abs(target[0] - replacement[0]) < 4 && Math.abs(target[1] - replacement[1]) < 4 && Math.abs(target[2] - replacement[2]) < 4) return false;

    const stack = [[startX, startY]];
    const visited = new Uint8Array(width * height);
    let count = 0;
    const tolerance = 26;
    while (stack.length && count < width * height) {
      const [x, y] = stack.pop();
      if (x < 0 || y < 0 || x >= width || y >= height) continue;
      const pixel = y * width + x;
      if (visited[pixel]) continue;
      visited[pixel] = 1;
      const i = pixel * 4;
      if (data[i] < 225 || data[i+1] < 225 || data[i+2] < 225 || Math.abs(data[i] - target[0]) > tolerance || Math.abs(data[i+1] - target[1]) > tolerance || Math.abs(data[i+2] - target[2]) > tolerance) continue;
      data[i] = replacement[0]; data[i+1] = replacement[1]; data[i+2] = replacement[2]; data[i+3] = 255;
      stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
      count++;
    }
    ctx.putImageData(image, 0, 0);
    return count > 0;
  }

  function hexToRgb(hex) {
    const clean = hex.replace('#','');
    return [parseInt(clean.slice(0,2),16), parseInt(clean.slice(2,4),16), parseInt(clean.slice(4,6),16)];
  }

  function startDraw(event) {
    event.preventDefault();
    const point = pointFromEvent(event);
    if (mode === 'fill') {
      if (floodFill(point.x, point.y, erasing ? '#ffffff' : selectedColor)) {
        saveUndo();
        setStatus('Nice coloring! Ang galing mo!');
      }
      return;
    }
    drawing = true;
    lastPoint = point;
    canvas.setPointerCapture?.(event.pointerId);
    ctx.beginPath();
    ctx.arc(point.x, point.y, Number(brushSize.value)/2, 0, Math.PI*2);
    ctx.fillStyle = erasing ? '#ffffff' : selectedColor;
    ctx.fill();
  }

  function moveDraw(event) {
    if (!drawing || mode !== 'draw') return;
    event.preventDefault();
    const point = pointFromEvent(event);
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(point.x, point.y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Number(brushSize.value);
    ctx.strokeStyle = erasing ? '#ffffff' : selectedColor;
    ctx.stroke();
    lastPoint = point;
  }

  function stopDraw() {
    if (!drawing) return;
    drawing = false;
    lastPoint = null;
    saveUndo();
    setStatus('Drawing saved in this session. Tap Save artwork to download it.');
  }

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      mode = btn.dataset.mode;
      document.querySelectorAll('.mode-btn').forEach(b => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      modeHint.textContent = mode === 'fill'
        ? 'Tap a white area inside the outline to fill it with color.'
        : 'Drag your finger or mouse across the page to draw.';
      setStatus(mode === 'fill' ? 'Fill mode selected.' : 'Draw mode selected.');
    });
  });

  canvas.addEventListener('pointerdown', startDraw);
  canvas.addEventListener('pointermove', moveDraw);
  canvas.addEventListener('pointerup', stopDraw);
  canvas.addEventListener('pointercancel', stopDraw);
  canvas.addEventListener('pointerleave', stopDraw);

  brushSize.addEventListener('input', () => { brushValue.textContent = brushSize.value; });
  document.getElementById('undoBtn').addEventListener('click', undo);
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (window.confirm('I-reset ang coloring page? Mawawala ang kasalukuyang kulay.')) drawPage(activePage);
  });
  document.getElementById('eraserBtn').addEventListener('click', () => {
    erasing = !erasing;
    document.getElementById('eraserBtn').classList.toggle('active', erasing);
    setStatus(erasing ? 'Eraser selected.' : 'Eraser off.');
  });
  document.getElementById('saveBtn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `kulaykidz-${activePage}-${new Date().toISOString().slice(0,10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setStatus('Artwork downloaded! Tingnan ang Downloads o Photos.');
  });

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installBtn.hidden = false;
  });
  installBtn.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installBtn.hidden = true;
  });

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        setStatus('Online mode works. Offline install may need HTTPS hosting.');
      });
    });
  }

  renderPalette();
  renderPageButtons();
  drawPage('cat');
})();
