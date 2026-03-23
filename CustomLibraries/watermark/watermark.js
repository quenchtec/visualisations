    /*
// EXAMPLE USE
customWatermark(
  document.getElementById("rs_c")?.value,            // watermark text - best practice is to use the respondent id or session
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
document.querySelectorAll(".cTable").forEach(function(el) {
  el.classList.add("rsWatermark");
});

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
  if (blnQuestionText) imgs = imgs.concat(Array.from(document.querySelectorAll(".cQuestionText img, .cTDContainQues > .rs-ht img, .question-texts img, .information-text img")));
  if (blnAnswers) imgs = imgs.concat(Array.from(document.querySelectorAll(".rsRow img, .rsScrollGridContent img, .rsBtn img, .theCard img, .answer-texts img")));

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
  function getRenderedThumbnailSize(img, naturalWidth, naturalHeight) {
    const rect = img.getBoundingClientRect();
    const renderedWidth = Math.max(1, Math.round(rect.width || img.clientWidth || naturalWidth || 1));
  
    const aspectRatio = naturalWidth / naturalHeight;
    const renderedHeight = Math.max(1, Math.round(renderedWidth / aspectRatio));
  
    return {
      width: renderedWidth,
      height: renderedHeight
    };
  }
  
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
        //const renderedSize = getRenderedImageSize(img, naturalWidth, naturalHeight);
        // As iOS Safari rerenders the image - quick fix
        const renderedSize = getRenderedThumbnailSize(img, naturalWidth, naturalHeight);
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

function fnGallery(scope, controls) {
    controls = controls === true;
    const STYLE_ID = "rs-inline-gallery-style";
    const DATA_BOUND = "data-rs-gallery-bound";
    const MODAL_ID = "rsInlineGalleryModal";
    injectGalleryStyles();
    createModalIfNeeded();

    const questionSelector = ".cQuestionText img, .cTDContainQues > .rs-ht img, .question-texts img, .information-text img";
    const answerSelector = ".rsRow img, .rsScrollGridContent img, .rsBtn img, .theCard img, .answer-texts img, .numeric-answer-texts-wrapper img";

    let targetImages = [];

    if (typeof scope === "undefined" || scope === null || String(scope).trim() === "") {
        targetImages = collectImages(questionSelector + ", " + answerSelector);
    } else {
        const mode = String(scope).trim();

        if (mode.toUpperCase() === "Q") {
            targetImages = collectImages(questionSelector);
        } else if (mode.toUpperCase() === "A") {
            targetImages = collectImages(answerSelector);
        } else {
            const requestedNames = mode
                .split(",")
                .map(function (item) {
                    return normaliseName(item);
                })
                .filter(Boolean);

            const allImages = collectImages(questionSelector + ", " + answerSelector);

            targetImages = allImages.filter(function (img) {
                const info = getImageInfo(img.getAttribute("src") || "");
                return requestedNames.indexOf(info.baseNameNormalised) !== -1;
            });
        }
    }

    if (!targetImages.length) {
        return;
    }

    const galleryItems = targetImages.map(function (img) {
        const src = img.getAttribute("src") || "";
        const fullSrc = getFullImageSrc(src);

        return {
            thumbSrc: src,
            fullSrc: fullSrc,
            element: img,
            alt: img.getAttribute("alt") || "",
            title: img.getAttribute("title") || ""
        };
    });

    targetImages.forEach(function (img, index) {
        if (img.getAttribute(DATA_BOUND) === "true") {
            return;
        }

        img.setAttribute(DATA_BOUND, "true");
        img.style.cursor = "zoom-in";

        img.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            openGallery(index, galleryItems);
        });
    });

    function collectImages(selector) {
        const found = Array.from(document.querySelectorAll(selector));

        return found.filter(function (img) {
            const src = img.getAttribute("src") || "";
            return !!src;
        });
    }

    function normaliseName(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\.[a-z0-9]+$/i, "");
    }

    function getImageInfo(src) {
        let cleanSrc = String(src || "").split("?")[0].split("#")[0];
        let fileName = cleanSrc.substring(cleanSrc.lastIndexOf("/") + 1);
        let extension = "";
        let fileWithoutExt = fileName;

        const extMatch = fileName.match(/(\.[a-z0-9]+)$/i);
        if (extMatch) {
            extension = extMatch[1];
            fileWithoutExt = fileName.slice(0, -extension.length);
        }

        const baseWithoutThumbSuffix = fileWithoutExt.replace(/(_s|_thumbnail|_small)$/i, "");

        return {
            cleanSrc: cleanSrc,
            fileName: fileName,
            extension: extension,
            fileWithoutExt: fileWithoutExt,
            baseWithoutThumbSuffix: baseWithoutThumbSuffix,
            baseNameNormalised: baseWithoutThumbSuffix.toLowerCase()
        };
    }

    function getFullImageSrc(src) {
        const rawSrc = String(src || "");
        const info = getImageInfo(rawSrc);

        if (!/(_s|_thumbnail|_small)$/i.test(info.fileWithoutExt)) {
            return rawSrc;
        }

        const rebuiltFileName = info.baseWithoutThumbSuffix + info.extension;
        return rawSrc.replace(info.fileName, rebuiltFileName);
    }

    function injectGalleryStyles() {
        if (document.getElementById(STYLE_ID)) {
            return;
        }

        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.type = "text/css";
        style.innerHTML = `
            .rs-gallery-modal {
                position: fixed;
                inset: 0;
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(10, 14, 24, 0.88);
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
                transition: opacity 0.22s ease, visibility 0.22s ease;
                backdrop-filter: blur(4px);
            }

            .rs-gallery-dialog,
            .rs-gallery-dialog * {
                -webkit-user-select: none;
                user-select: none;
            }

            .rs-gallery-modal.rs-gallery-open {
                opacity: 1;
                visibility: visible;
                pointer-events: auto;
            }

            .rs-gallery-dialog {
                position: relative;
                width: min(92vw, 1400px);
                height: min(88vh, 900px);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
                box-sizing: border-box;
            }

            .rs-gallery-image-wrap {
                position: relative;
                max-width: 100%;
                max-height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .rs-gallery-image {
                max-width: 100%;
                max-height: calc(88vh - 48px);
                width: auto;
                height: auto;
                display: block;
                border-radius: 0;
                box-shadow: 0 18px 48px rgba(0, 0, 0, 0.35);
                background: transparent;
                object-fit: contain;
                transform: scale(0.985);
                opacity: 0;
                transition: opacity 0.18s ease, transform 0.18s ease;
                -webkit-user-select: none;
                user-select: none;
                -webkit-user-drag: none;
            }

            .rs-gallery-image.rs-gallery-image-ready {
                opacity: 1;
                transform: scale(1);
            }

            .rs-gallery-close,
            .rs-gallery-prev,
            .rs-gallery-next {
                position: absolute;
                border: 0;
                outline: 0;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.14);
                color: #ffffff;
                transition: background 0.18s ease, transform 0.18s ease, opacity 0.18s ease;
                user-select: none;
                -webkit-user-select: none;
            }

            .rs-gallery-close:hover,
            .rs-gallery-prev:hover,
            .rs-gallery-next:hover {
                background: rgba(255, 255, 255, 0.24);
                transform: scale(1.04);
            }

            .rs-gallery-close {
                top: 18px;
                right: 18px;
                width: 46px;
                height: 46px;
                font-size: 26px;
                line-height: 1;
            }

            .rs-gallery-prev,
            .rs-gallery-next {
                top: 50%;
                transform: translateY(-50%);
                width: 52px;
                height: 52px;
                font-size: 30px;
                line-height: 1;
            }

            .rs-gallery-prev:hover,
            .rs-gallery-next:hover {
                transform: translateY(-50%) scale(1.04);
            }

            .rs-gallery-prev {
                left: 16px;
            }

            .rs-gallery-next {
                right: 16px;
            }

            .rs-gallery-caption {
                position: absolute;
                left: 50%;
                bottom: 14px;
                transform: translateX(-50%);
                max-width: min(85vw, 1000px);
                padding: 10px 16px;
                border-radius: 999px;
                background: rgba(0, 0, 0, 0.34);
                color: #ffffff;
                font-size: 14px;
                line-height: 1.4;
                text-align: center;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .rs-gallery-loader {
                position: absolute;
                width: 54px;
                height: 54px;
                border-radius: 50%;
                border: 4px solid rgba(255, 255, 255, 0.16);
                border-top-color: rgba(255, 255, 255, 0.92);
                animation: rsGallerySpin 0.85s linear infinite;
            }

            .rs-gallery-hidden {
                display: none !important;
            }

            @keyframes rsGallerySpin {
                to {
                    transform: rotate(360deg);
                }
            }

            @media (max-width: 768px) {
                .rs-gallery-dialog {
                    width: 96vw;
                    height: 92vh;
                    padding: 18px;
                }

                .rs-gallery-close {
                    top: 10px;
                    right: 10px;
                    width: 42px;
                    height: 42px;
                    font-size: 24px;
                }

                .rs-gallery-prev,
                .rs-gallery-next {
                    width: 44px;
                    height: 44px;
                    font-size: 26px;
                }

                .rs-gallery-prev {
                    left: 8px;
                }

                .rs-gallery-next {
                    right: 8px;
                }

                .rs-gallery-caption {
                    max-width: 90vw;
                    font-size: 13px;
                    bottom: 10px;
                }
            }
            img[data-rs-gallery-bound="true"] {
                cursor: zoom-in;
                box-sizing: border-box;
                border: 1px solid rgba(0, 0, 0, 0.05);
                border-radius: 8px;
                transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
            }

            img[data-rs-gallery-bound="true"]:hover {
                transform: translateY(-1px);
                border-color: rgba(0, 0, 0, 0.12);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.10);
            }
        `;
        document.head.appendChild(style);
    }

    function createModalIfNeeded() {
        if (document.getElementById(MODAL_ID)) {
            return;
        }

        const modal = document.createElement("div");
        modal.id = MODAL_ID;
        modal.className = "rs-gallery-modal";
        modal.innerHTML = `
            <div class="rs-gallery-dialog">
                <button type="button" class="rs-gallery-close" aria-label="Close gallery">&times;</button>
                <button type="button" class="rs-gallery-prev" aria-label="Previous image">&#8249;</button>
                <div class="rs-gallery-image-wrap">
                    <div class="rs-gallery-loader rs-gallery-hidden"></div>
                    <img class="rs-gallery-image" alt="">
                </div>
                <button type="button" class="rs-gallery-next" aria-label="Next image">&#8250;</button>
                <div class="rs-gallery-caption rs-gallery-hidden"></div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeButton = modal.querySelector(".rs-gallery-close");
        const prevButton = modal.querySelector(".rs-gallery-prev");
        const nextButton = modal.querySelector(".rs-gallery-next");
        const dialog = modal.querySelector(".rs-gallery-dialog");

        closeButton.addEventListener("click", function () {
            closeGallery();
        });

        prevButton.addEventListener("click", function (event) {
            event.stopPropagation();
            stepGallery(-1);
        });

        nextButton.addEventListener("click", function (event) {
            event.stopPropagation();
            stepGallery(1);
        });

        modal.addEventListener("click", function (event) {
            if (!dialog.contains(event.target) || event.target === modal) {
                closeGallery();
            }
        });

        document.addEventListener("keydown", function (event) {
            const activeModal = document.getElementById(MODAL_ID);
            if (!activeModal || !activeModal.classList.contains("rs-gallery-open")) {
                return;
            }

            if (event.key === "Escape") {
                closeGallery();
                return;
            }

            if (activeModal._galleryControls !== true) {
                return;
            }

            if (event.key === "ArrowLeft") {
                stepGallery(-1);
            } else if (event.key === "ArrowRight") {
                stepGallery(1);
            }
        });
    }

    function openGallery(startIndex, items) {
        const modal = document.getElementById(MODAL_ID);
        if (!modal) {
            return;
        }

        modal._galleryItems = items;
        modal._galleryIndex = startIndex;
        modal._galleryControls = controls;

        modal.classList.add("rs-gallery-open");
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        renderGalleryImage();
    }

    function closeGallery() {
        const modal = document.getElementById(MODAL_ID);
        if (!modal) {
            return;
        }

        modal.classList.remove("rs-gallery-open");
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
    }

    function stepGallery(direction) {
        const modal = document.getElementById(MODAL_ID);
        if (!modal || !modal._galleryItems || !modal._galleryItems.length) {
            return;
        }

        const total = modal._galleryItems.length;
        modal._galleryIndex = (modal._galleryIndex + direction + total) % total;
        renderGalleryImage();
    }

    function renderGalleryImage() {
        const modal = document.getElementById(MODAL_ID);
        if (!modal || !modal._galleryItems || !modal._galleryItems.length) {
            return;
        }

        const imgEl = modal.querySelector(".rs-gallery-image");
        const loaderEl = modal.querySelector(".rs-gallery-loader");
        const captionEl = modal.querySelector(".rs-gallery-caption");
        const prevEl = modal.querySelector(".rs-gallery-prev");
        const nextEl = modal.querySelector(".rs-gallery-next");

        const item = modal._galleryItems[modal._galleryIndex];
        const total = modal._galleryItems.length;

        imgEl.classList.remove("rs-gallery-image-ready");
        loaderEl.classList.remove("rs-gallery-hidden");

        if (modal._galleryControls === true && total > 1) {
            prevEl.classList.remove("rs-gallery-hidden");
            nextEl.classList.remove("rs-gallery-hidden");
        } else {
            prevEl.classList.add("rs-gallery-hidden");
            nextEl.classList.add("rs-gallery-hidden");
        }

        const captionText = item.alt || item.title || "";
        if (captionText) {
            captionEl.textContent = captionText;
            captionEl.classList.remove("rs-gallery-hidden");
        } else {
            captionEl.textContent = "";
            captionEl.classList.add("rs-gallery-hidden");
        }

        const preload = new Image();

        preload.onload = function () {
            imgEl.onload = null;
            imgEl.onerror = null;
            imgEl.src = item.fullSrc;
            imgEl.alt = item.alt || "";
            loaderEl.classList.add("rs-gallery-hidden");

            window.requestAnimationFrame(function () {
                imgEl.classList.add("rs-gallery-image-ready");
            });

            preloadAdjacentImages(modal._galleryItems, modal._galleryIndex);
        };

        preload.onerror = function () {
            const fallback = item.thumbSrc || item.fullSrc;
            imgEl.src = fallback;
            imgEl.alt = item.alt || "";
            loaderEl.classList.add("rs-gallery-hidden");

            window.requestAnimationFrame(function () {
                imgEl.classList.add("rs-gallery-image-ready");
            });
        };

        preload.src = item.fullSrc;
    }

    function preloadAdjacentImages(items, currentIndex) {
        const modal = document.getElementById(MODAL_ID);

        if (!modal || modal._galleryControls !== true) {
            return;
        }

        if (!items || items.length < 2) {
            return;
        }

        const nextIndex = (currentIndex + 1) % items.length;
        const prevIndex = (currentIndex - 1 + items.length) % items.length;

        [items[nextIndex], items[prevIndex]].forEach(function (item) {
            if (!item || !item.fullSrc) {
                return;
            }
            const preImg = new Image();
            preImg.src = item.fullSrc;
        });
    }
}

function fnGlobalGallery(scope, controls) {
    controls = controls === true;
    if (window.__rsGalleryContainerObserverBound) return;

    const container = document.querySelector("#pageContainerContent, #rsPanelMain");
    if (!container) return;

    window.__rsGalleryContainerObserverBound = true;
    
    let galleryTimer = null;

    fnGallery(scope, controls);

    const observer = new MutationObserver(function () {
        if (galleryTimer) clearTimeout(galleryTimer);

        galleryTimer = setTimeout(function () {
            fnGallery(scope, controls);
        }, 150);
    });

    observer.observe(container, {
        childList: true,
        subtree: true
    });
}
