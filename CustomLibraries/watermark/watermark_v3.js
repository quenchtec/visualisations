function customWatermark(wtx, qt, at, fs, fc, retryCount = 20, autoScale = 0.05) {
  $(document).find(".cTable").addClass("rsWatermark");

  const strWaterMarkText = wtx;
  const blnQuestionText = qt;
  const blnAnswers = at;

  // --- collect targets
  let imgs = [];
  if (blnQuestionText) imgs = imgs.concat($(document).find(".cQuestionText img").toArray());
  if (blnAnswers)      imgs = imgs.concat($(document).find(".rsRow img, .rsScrollGridContent img, .rsBtn img, .theCard img").toArray());

  // retry if nothing yet
  if (!imgs.length) {
    if (retryCount > 0) {
      setTimeout(() => customWatermark(wtx, qt, at, fs, fc, retryCount - 1, autoScale), 100);
    } else {
      console.error("No images found after multiple attempts.");
    }
    return;
  }

  // Prepare and observe
  imgs.forEach((img) => {
    // keep original source exactly once to avoid stacking the watermark
    if (!img.dataset.originalSrc) {
      img.dataset.originalSrc = img.currentSrc || img.src || '';
    }

    // ensure we can load cross-origin when possible
    img.crossOrigin = "anonymous";

    // load and draw initially
    ensureLoaded(img).then(() => applyWatermark(img)).catch(() => { /* ignore */ });

    // re-apply on resize (from ORIGINAL src, not the already stamped one)
    const ro = new ResizeObserver(() => applyWatermark(img));
    ro.observe(img);
  });

  // --- helpers ---

  function ensureLoaded(img) {
    return new Promise((resolve) => {
      if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
        resolve();
      } else {
        img.onload = () => { img.onload = null; resolve(); };
      }
    });
  }

  function loadBase(src) {
    return new Promise((resolve, reject) => {
      if (!src) return reject(new Error('Empty base src'));
      const base = new Image();
      try {
        const a = document.createElement('a');
        a.href = src;
        const sameOrigin = (a.origin === window.location.origin) || a.origin === 'null';
        if (!sameOrigin) base.crossOrigin = 'anonymous';
      } catch (_) {}
      base.onload = () => resolve(base);
      base.onerror = (e) => reject(e);
      base.src = src;
    });
  }

  function computeFontPx(w, h, fsVal) {
    // mirror internal “auto” sizing with floor 24px and default scale 0.05
    const n = Number(fsVal);
    if (!fsVal || fsVal === 'auto' || Number.isNaN(n)) {
      return Math.max(24, Math.round(Math.min(w, h) * (autoScale || 0.05)));
    }
    return Math.max(1, Math.round(n));
  }

  function drawDiagonalCenter(ctx, w, h, text, fontPx, color) {
    ctx.save();
    ctx.font = `${fontPx}px Arial`;
    ctx.fillStyle = color || 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // EXACT SAME DIAGONAL as internal code: -atan2(h, w)
    const angle = -Math.atan2(h, w);
    ctx.translate(w / 2, h / 2);
    ctx.rotate(angle);

    // No stroke / shadow → clean fill only
    ctx.fillText(text, 0, 0);

    ctx.restore();
  }

  async function applyWatermark(img) {
    try {
      const baseSrc = img.dataset.originalSrc || img.currentSrc || img.src;
      if (!baseSrc) return;

      // Always redraw from ORIGINAL source to prevent stacking
      const base = await loadBase(baseSrc);
      let w = base.naturalWidth || base.width || img.naturalWidth;
      let h = base.naturalHeight || base.height || img.naturalHeight;
      if (!w || !h) return;

      const canvas = document.createElement('canvas');
      canvas.classList.add("waterCanvas");
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(base, 0, 0, w, h);

      const fontPx = computeFontPx(w, h, fs);
      drawDiagonalCenter(ctx, w, h, strWaterMarkText, fontPx, fc);

      img.src = canvas.toDataURL('image/png');
      img.dataset.watermarked = 'true';
    } catch (e) {
      console.error("Error applying watermark:", e);
      if (e.name === "SecurityError") {
        console.warn("Cross-origin error: host image on same domain or enable CORS.");
      }
    }
  }
}
