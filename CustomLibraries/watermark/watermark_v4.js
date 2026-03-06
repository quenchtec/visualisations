/*
// EXAMPLE USE
customWatermark(
  $("#rs_c").val(),            // watermark text - best practice is to use the respondent id or session
  true,                        // apply to images in the question text
  true,                        // apply to images in the answer text
  24,                          // full-size watermark font size in px, or use 'auto'
  "rgba(255,255,255,0.45)",    // full-size watermark colour
  20,                          // max retries to apply watermark; do not go below 20
  0.05,                        // full-size auto font scale when fs='auto'
  [0.35, 0.69],                // full-size posX; single value or array; 0..1 = relative position
  [0.5, 0.4],                  // full-size posY; single value or array; 0..1 = relative position
  [285, 270],                  // full-size angle; single value or array; 0..360, or 'auto'
  true,                        // full-size shadow on/off
  true,                        // true = clicking the image opens popup with the full-size watermarked version
  "50%",                       // popup size; '' = natural fit, '50%' = width only, or '1920px,1080px'

  // If you do not want a separate watermarked thumbnail, remove the object below.
  {
    enabled: true,                 // true = use separate thumbnail watermark settings
    color: "rgba(255,255,255,0.78)", // thumbnail watermark colour
    shadow: true,                  // thumbnail shadow on/off
    orientation: "diagonal",       // horizontal | vertical | diagonal | backdiagonal
    anchor: "middle",              // top | middle | bottom | left | right
    fit: "diagonal",               // width | height | diagonal
    autoScale: 0.18,               // thumbnail auto font scale
    maxFontPx: 120,                // maximum thumbnail font size
    minFontPx: 18,                 // minimum thumbnail font size
    marginRatio: 0.06              // inner safe margin so text does not go outside image
  }
);
*/

function customWatermark (
  wtx,                 // watermark text string
  qt,                  // true = apply watermark to images inside .cQuestionText
  at,                  // true = apply watermark to images inside answers / rows / cards / buttons
  fs,                  // full-size watermark font size in px, or 'auto' to size automatically
  fc,                  // full-size watermark colour, e.g. 'rgba(255,255,255,0.45)'
  retryCount = 20,     // how many times to retry finding images before giving up; do not go below 20
  autoScale = 0.05,    // auto font scale for full-size watermark when fs='auto'; based on min(width,height)
  posX = 0.5,          // full-size watermark X position; single value or array; 0..1 = relative, otherwise px
  posY = 0.5,          // full-size watermark Y position; single value or array; 0..1 = relative, otherwise px
  angleDeg = 'auto',   // full-size watermark angle in degrees; single value or array; 'auto' = diagonal fit
  blnShadow = false,   // true = add shadow behind the full-size watermark text
  blnPopupGallery = false, // true = clicking the image opens popup with the watermarked full-size image
  popupSize = '',      // popup image size; '' = natural fit, '50%' = width only, or '1920px,1080px' = width,height
  thumbnailOptions = null // optional object with separate settings for thumbnail watermark appearance
) {
  $(document).find(".cTable").addClass("rsWatermark");

  const strWaterMarkText = wtx;
  const blnQuestionText = qt;
  const blnAnswers = at;

  const thumbnailConfig = {
    enabled: false,          // true = use a separate thumbnail-specific watermark instead of reusing the full-size one
    color: '',               // thumbnail watermark colour; if empty, falls back to fc or internal default
    shadow: null,            // true/false to force thumbnail shadow; null = use internal default behaviour
    orientation: 'diagonal', // text direction: horizontal | vertical | diagonal | backdiagonal
    anchor: 'middle',        // placement anchor: top | middle | bottom | left | right
    fit: 'diagonal',         // axis used to size text so it fits: width | height | diagonal
    autoScale: 0.18,         // thumbnail auto font scale; larger than full-size default so thumbnails stay readable
    maxFontPx: 140,          // maximum allowed thumbnail font size in px
    minFontPx: 16,           // minimum allowed thumbnail font size in px
    marginRatio: 0.06,       // safe inner margin ratio to keep text from touching image edges
    ...(thumbnailOptions || {})
  };

  // --- collect targets
  let imgs = [];
  if (blnQuestionText) imgs = imgs.concat($(document).find(".cQuestionText img").toArray());
  if (blnAnswers) imgs = imgs.concat($(document).find(".rsRow img, .rsScrollGridContent img, .rsBtn img, .theCard img").toArray());

  // retry if nothing yet
  if (!imgs.length) {
    if (retryCount > 0) {
      setTimeout(
        () => customWatermark(
          wtx, qt, at, fs, fc,
          retryCount - 1,
          autoScale,
          posX,
          posY,
          angleDeg,
          blnShadow,
          blnPopupGallery,
          popupSize,
          thumbnailOptions
        ),
        100
      );
    } else {
      console.error("No images found after multiple attempts.");
    }
    return;
  }

  // Prepare and observe
  imgs.forEach((img) => {
    if (!img.dataset.originalSrc) {
      img.dataset.originalSrc = img.currentSrc || img.src || '';
    }

    img.crossOrigin = "anonymous";

    if (blnPopupGallery && !img.dataset.popupBound) {
      bindWatermarkPopup(img);
      img.dataset.popupBound = 'true';
    }

    ensureLoaded(img).then(() => applyWatermark(img)).catch(() => { /* ignore */ });

    if (!img.dataset.resizeObserved) {
      const resizeObserver = new ResizeObserver(() => applyWatermark(img));
      resizeObserver.observe(img);
      img.dataset.resizeObserved = 'true';
    }
  });

  // --- helpers ---
  function ensurePopupModal() {
    let modal = document.getElementById('rsWatermarkPopupModal');
    if (modal) return modal;

    const style = document.createElement('style');
    style.innerHTML = `
      #rsWatermarkPopupModal {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: none;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.88);
        padding: 20px;
        box-sizing: border-box;
      }

      #rsWatermarkPopupModal.active {
        display: flex;
      }

      #rsWatermarkPopupInner {
        position: relative;
        max-width: 100%;
        max-height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #rsWatermarkPopupImage {
        display: block;
        max-width: 95vw;
        max-height: 95vh;
        width: auto;
        height: auto;
        box-shadow: 0 8px 30px rgba(0,0,0,0.45);
      }

      #rsWatermarkPopupClose {
        position: absolute;
        top: -12px;
        right: -12px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(255,255,255,0.15);
        color: #fff;
        font-size: 24px;
        line-height: 36px;
        text-align: center;
        cursor: pointer;
        user-select: none;
      }

      .rsWatermark img {
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);

    modal = document.createElement('div');
    modal.id = 'rsWatermarkPopupModal';
    modal.innerHTML = `
      <div id="rsWatermarkPopupInner">
        <div id="rsWatermarkPopupClose">×</div>
        <img id="rsWatermarkPopupImage" src="" alt="">
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#rsWatermarkPopupClose');
    closeBtn.addEventListener('click', closeWatermarkPopup);

    modal.addEventListener('click', function (event) {
      if (event.target === modal) {
        closeWatermarkPopup();
      }
    });

    window.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && modal.classList.contains('active')) {
        closeWatermarkPopup();
      }
    });

    return modal;
  }

  function parsePopupSize(sizeValue) {
    if (!sizeValue || !String(sizeValue).trim()) {
      return { width: '', height: '' };
    }

    const parts = String(sizeValue).split(',').map(function(part) {
      return part.trim();
    }).filter(Boolean);

    return {
      width: parts[0] || '',
      height: parts[1] || ''
    };
  }

  function openWatermarkPopup(src) {
    const modal = ensurePopupModal();
    const popupImage = document.getElementById('rsWatermarkPopupImage');
    const parsedSize = parsePopupSize(popupSize);

    popupImage.src = src;
    popupImage.style.width = parsedSize.width || '';
    popupImage.style.height = parsedSize.height || '';

    if (parsedSize.width && !parsedSize.height) {
      popupImage.style.height = 'auto';
    }

    modal.classList.add('active');
  }

  function closeWatermarkPopup() {
    const modal = document.getElementById('rsWatermarkPopupModal');
    const popupImage = document.getElementById('rsWatermarkPopupImage');
    if (!modal || !popupImage) return;

    popupImage.src = '';
    popupImage.style.width = '';
    popupImage.style.height = '';
    modal.classList.remove('active');
  }

  function bindWatermarkPopup(img) {
    img.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      openWatermarkPopup(img.dataset.watermarkedFullSrc || img.src);
    });
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [value];
  }

  function pick(arr, index) {
    if (!arr.length) return undefined;
    return arr[Math.min(index, arr.length - 1)];
  }

  function ensureLoaded(img) {
    return new Promise((resolve) => {
      if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
        resolve();
      } else {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      }
    });
  }

  function loadBase(src) {
    return new Promise((resolve, reject) => {
      if (!src) return reject(new Error('Empty base src'));
      const base = new Image();
      try {
        const anchor = document.createElement('a');
        anchor.href = src;
        const sameOrigin = (anchor.origin === window.location.origin) || anchor.origin === 'null';
        if (!sameOrigin) base.crossOrigin = 'anonymous';
      } catch (_) { }
      base.onload = () => resolve(base);
      base.onerror = (error) => reject(error);
      base.src = src;
    });
  }

  function computeFontPx(width, height, fontSizeValue) {
    const numericFontSize = Number(fontSizeValue);
    if (!fontSizeValue || fontSizeValue === 'auto' || Number.isNaN(numericFontSize)) {
      return Math.max(24, Math.round(Math.min(width, height) * (autoScale || 0.05)));
    }
    return Math.max(1, Math.round(numericFontSize));
  }

  function normalizeAngleDeg(value) {
    if (value === 'auto' || value == null || value === '') return 'auto';
    const numericAngle = Number(value);
    if (!Number.isFinite(numericAngle)) return 'auto';
    let normalizedAngle = numericAngle % 360;
    if (normalizedAngle < 0) normalizedAngle += 360;
    return normalizedAngle;
  }

  function resolveXY(width, height, xValue, yValue) {
    const numericX = Number(xValue);
    const numericY = Number(yValue);

    const resolvedX = (Number.isFinite(numericX) && numericX >= 0 && numericX <= 1) ? (width * numericX) : numericX;
    const resolvedY = (Number.isFinite(numericY) && numericY >= 0 && numericY <= 1) ? (height * numericY) : numericY;

    return {
      x: Number.isFinite(resolvedX) ? resolvedX : (width / 2),
      y: Number.isFinite(resolvedY) ? resolvedY : (height / 2)
    };
  }

  function drawDiagonalCenter(ctx, width, height, text, fontPx, color, xPos, yPos, degVal, shadowOn) {
    const xValues = asArray(xPos);
    const yValues = asArray(yPos);
    const degreeValues = asArray(degVal);

    const stamps = Math.max(xValues.length, yValues.length, degreeValues.length, 1);

    for (let index = 0; index < stamps; index++) {
      ctx.save();
      ctx.font = `${fontPx}px Arial`;
      ctx.fillStyle = color || 'rgba(255,255,255,0.5)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (shadowOn) {
        ctx.shadowColor = 'rgba(0,0,0,0.45)';
        ctx.shadowBlur = Math.max(1, Math.round(fontPx * 0.15));
        ctx.shadowOffsetX = Math.max(1, Math.round(fontPx * 0.05));
        ctx.shadowOffsetY = Math.max(1, Math.round(fontPx * 0.05));
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      const currentX = pick(xValues, index);
      const currentY = pick(yValues, index);
      const currentDeg = pick(degreeValues, index);

      const resolvedPoint = resolveXY(width, height, currentX, currentY);
      const normalizedAngle = normalizeAngleDeg(currentDeg);

      const angleRad = (normalizedAngle === 'auto')
        ? -Math.atan2(height, width)
        : (normalizedAngle * Math.PI / 180);

      ctx.translate(resolvedPoint.x, resolvedPoint.y);
      ctx.rotate(angleRad);
      ctx.fillText(text, 0, 0);

      ctx.restore();
    }
  }

  function getRenderedImageSize(img, fallbackWidth, fallbackHeight) {
    const rect = img.getBoundingClientRect();
    const renderedWidth = Math.max(1, Math.round(rect.width || img.clientWidth || fallbackWidth || 1));
    const renderedHeight = Math.max(1, Math.round(rect.height || img.clientHeight || fallbackHeight || 1));
    return {
      width: renderedWidth,
      height: renderedHeight
    };
  }

  function getThumbnailAnchorPoint(width, height, anchor, marginRatio) {
    const margin = Math.round(Math.min(width, height) * marginRatio);
    const normalizedAnchor = String(anchor || 'middle').toLowerCase();

    switch (normalizedAnchor) {
      case 'top':
        return { x: width / 2, y: margin + Math.round(height * 0.08) };
      case 'bottom':
        return { x: width / 2, y: height - margin - Math.round(height * 0.08) };
      case 'left':
        return { x: margin + Math.round(width * 0.08), y: height / 2 };
      case 'right':
        return { x: width - margin - Math.round(width * 0.08), y: height / 2 };
      default:
        return { x: width / 2, y: height / 2 };
    }
  }

  function getThumbnailAngleRad(width, height, orientation) {
    const normalizedOrientation = String(orientation || 'diagonal').toLowerCase();

    switch (normalizedOrientation) {
      case 'horizontal':
        return 0;
      case 'vertical':
        return Math.PI / 2;
      case 'backdiagonal':
        return Math.atan2(height, width);
      case 'diagonal':
      default:
        return -Math.atan2(height, width);
    }
  }

  function getFitSpan(width, height, fitMode) {
    const normalizedFitMode = String(fitMode || 'diagonal').toLowerCase();

    switch (normalizedFitMode) {
      case 'width':
        return width;
      case 'height':
        return height;
      case 'diagonal':
      default:
        return Math.sqrt((width * width) + (height * height));
    }
  }

  function computeThumbnailFontPx(ctx, width, height, text, options) {
    const marginRatio = Number.isFinite(Number(options.marginRatio)) ? Number(options.marginRatio) : 0.06;
    const safeMarginRatio = Math.max(0, Math.min(0.25, marginRatio));
    const fitSpan = getFitSpan(width, height, options.fit);
    const maxAllowedSpan = fitSpan * (1 - (safeMarginRatio * 2));

    let fontPx = Math.max(
      Number(options.minFontPx) || 16,
      Math.round(Math.min(width, height) * (Number(options.autoScale) || 0.18))
    );

    const maxFontPx = Math.max(fontPx, Number(options.maxFontPx) || 140);
    fontPx = Math.min(fontPx, maxFontPx);

    ctx.save();

    for (let attempt = 0; attempt < 60; attempt++) {
      ctx.font = `${fontPx}px Arial`;
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width || 0;

      if (textWidth <= maxAllowedSpan || fontPx <= (Number(options.minFontPx) || 16)) {
        break;
      }

      fontPx -= 1;
    }

    ctx.restore();
    return Math.max(Number(options.minFontPx) || 16, fontPx);
  }

  function drawThumbnailWatermark(ctx, width, height, text, options) {
    const watermarkColor = options.color || fc || 'rgba(255,255,255,0.72)';
    const shadowEnabled = (options.shadow == null) ? true : !!options.shadow;
    const marginRatio = Number.isFinite(Number(options.marginRatio)) ? Number(options.marginRatio) : 0.06;

    const fontPx = computeThumbnailFontPx(ctx, width, height, text, options);
    const anchorPoint = getThumbnailAnchorPoint(width, height, options.anchor, marginRatio);
    const angleRad = getThumbnailAngleRad(width, height, options.orientation);

    ctx.save();
    ctx.font = `${fontPx}px Arial`;
    ctx.fillStyle = watermarkColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (shadowEnabled) {
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = Math.max(1, Math.round(fontPx * 0.18));
      ctx.shadowOffsetX = Math.max(1, Math.round(fontPx * 0.05));
      ctx.shadowOffsetY = Math.max(1, Math.round(fontPx * 0.05));
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    ctx.translate(anchorPoint.x, anchorPoint.y);
    ctx.rotate(angleRad);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  async function createFullWatermarkedSrc(baseSrc, width, height) {
    const base = await loadBase(baseSrc);
    const canvas = document.createElement('canvas');
    canvas.classList.add("waterCanvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(base, 0, 0, width, height);

    const fontPx = computeFontPx(width, height, fs);
    drawDiagonalCenter(ctx, width, height, strWaterMarkText, fontPx, fc, posX, posY, angleDeg, blnShadow);

    return canvas.toDataURL('image/png');
  }

  async function createThumbnailWatermarkedSrc(baseSrc, renderedWidth, renderedHeight) {
    const base = await loadBase(baseSrc);
    const canvas = document.createElement('canvas');
    canvas.classList.add("waterCanvas");
    canvas.width = renderedWidth;
    canvas.height = renderedHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(base, 0, 0, renderedWidth, renderedHeight);
    drawThumbnailWatermark(ctx, renderedWidth, renderedHeight, strWaterMarkText, thumbnailConfig);

    return canvas.toDataURL('image/png');
  }

  async function applyWatermark(img) {
    try {
      const baseSrc = img.dataset.originalSrc || img.currentSrc || img.src;
      if (!baseSrc) return;

      const base = await loadBase(baseSrc);
      const naturalWidth = base.naturalWidth || base.width || img.naturalWidth;
      const naturalHeight = base.naturalHeight || base.height || img.naturalHeight;
      if (!naturalWidth || !naturalHeight) return;

      const fullWatermarkedSrc = await createFullWatermarkedSrc(baseSrc, naturalWidth, naturalHeight);
      img.dataset.watermarkedFullSrc = fullWatermarkedSrc;

      if (thumbnailConfig.enabled) {
        const renderedSize = getRenderedImageSize(img, naturalWidth, naturalHeight);
        const thumbnailWatermarkedSrc = await createThumbnailWatermarkedSrc(
          baseSrc,
          renderedSize.width,
          renderedSize.height
        );

        img.src = thumbnailWatermarkedSrc;
        img.dataset.watermarkedThumbSrc = thumbnailWatermarkedSrc;
      } else {
        img.src = fullWatermarkedSrc;
      }

      img.dataset.watermarked = 'true';
    } catch (e) {
      console.error("Error applying watermark:", e);
      if (e && e.name === "SecurityError") {
        console.warn("Cross-origin error: host image on same domain or enable CORS.");
      }
    }
  }
}
