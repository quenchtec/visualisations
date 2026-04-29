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

(function (global) {
  if (!global.__RS_SURVEY_IMG_SELECTORS) {
    global.__RS_SURVEY_IMG_SELECTORS = {
      question: ".cQuestionText img, .cTDContainQues > .rs-ht img, .question-texts img, .information-text img",
      answer: ".rsRow img, .rsScrollGridContent img, .rsBtn img, .theCard img, .answer-texts img, .answers-texts img, .numeric-answer-texts-wrapper img, .carousel-answer-text-wrapper img, .carousel-answer-text-wrapper > * > img, .answer-text-cell img, .ansText-Regular img, .ansText-Instruction img, .ansText-Supplementary img, .slider-question-text img, .slider-holder img, .rsSliderQuestionHolder img, .answer-button img, .rsHeaderRow img, .answerText-Regular img"
    };
  }
})(window);

(function (global) {
  var IMG = global.__RS_SURVEY_IMG_SELECTORS;

  // Main watermark entry point for selected survey images.
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

  // --- collect targets (one query when both question and answer regions are enabled)
  var imgs = [];
  if (blnQuestionText && blnAnswers) {
    imgs = Array.from(document.querySelectorAll(IMG.question + ", " + IMG.answer));
  } else if (blnQuestionText) {
    imgs = Array.from(document.querySelectorAll(IMG.question));
  } else if (blnAnswers) {
    imgs = Array.from(document.querySelectorAll(IMG.answer));
  }

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

    ensureLoaded(img).then(function () { applyWatermark(img); }).catch(function () { /* ignore */ });

    if (!img.dataset.resizeObserved) {
      var debouncers = new WeakMap();
      var resizeObserver = new ResizeObserver(function () {
        var pending = debouncers.get(img);
        if (pending) clearTimeout(pending);
        pending = setTimeout(function () {
          debouncers.delete(img);
          applyWatermark(img);
        }, 100);
        debouncers.set(img, pending);
      });
      resizeObserver.observe(img);
      img.dataset.resizeObserved = 'true';
    }
  });

  // --- helpers ---
  // Gets thumbnail render size while preserving aspect ratio.
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
  
  // Creates the popup modal once and returns it.
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

  // Parses popup size config into width and height values.
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

  // Opens the popup with the selected image source.
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

  // Closes the popup and clears image state.
  function closeWatermarkPopup() {
    const modal = document.getElementById('rsWatermarkPopupModal');
    const popupImage = document.getElementById('rsWatermarkPopupImage');
    if (!modal || !popupImage) return;

    popupImage.src = '';
    popupImage.style.width = '';
    popupImage.style.height = '';
    modal.classList.remove('active');
  }

  // Binds thumbnail clicks to open the popup.
  function bindWatermarkPopup(img) {
    img.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      openWatermarkPopup(img.dataset.watermarkedFullSrc || img.src);
    });
  }

  // Normalizes a value to an array.
  function asArray(value) {
    return Array.isArray(value) ? value : [value];
  }

  // Returns a safe item at index from an array.
  function pick(arr, index) {
    if (!arr.length) return undefined;
    return arr[Math.min(index, arr.length - 1)];
  }

  // Waits for an image to finish loading or fail.
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

  // Loads the base image with cross-origin handling when needed.
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

  // Resolves watermark font size from config or auto mode.
  function computeFontPx(width, height, fontSizeValue) {
    const numericFontSize = Number(fontSizeValue);
    if (!fontSizeValue || fontSizeValue === 'auto' || Number.isNaN(numericFontSize)) {
      return Math.max(24, Math.round(Math.min(width, height) * (autoScale || 0.05)));
    }
    return Math.max(1, Math.round(numericFontSize));
  }

  // Normalizes angle input to 0-359 or auto.
  function normalizeAngleDeg(value) {
    if (value === 'auto' || value == null || value === '') return 'auto';
    const numericAngle = Number(value);
    if (!Number.isFinite(numericAngle)) return 'auto';
    let normalizedAngle = numericAngle % 360;
    if (normalizedAngle < 0) normalizedAngle += 360;
    return normalizedAngle;
  }

  // Resolves relative or absolute coordinates to canvas points.
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

  // Draws one or more center-based diagonal watermark stamps.
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

  // Reads rendered image size with fallback values.
  function getRenderedImageSize(img, fallbackWidth, fallbackHeight) {
    const rect = img.getBoundingClientRect();
    const renderedWidth = Math.max(1, Math.round(rect.width || img.clientWidth || fallbackWidth || 1));
    const renderedHeight = Math.max(1, Math.round(rect.height || img.clientHeight || fallbackHeight || 1));
    return {
      width: renderedWidth,
      height: renderedHeight
    };
  }

  // Resolves thumbnail anchor coordinates from anchor mode.
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

  // Resolves thumbnail text angle from orientation mode.
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

  // Computes fit span for thumbnail text sizing.
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

  // Computes thumbnail font size within fit limits.
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

  // Draws the thumbnail watermark with configured style and placement.
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
  global.customWatermark = customWatermark;
})(window);

const RS_GALLERY_QUESTION_SELECTOR = ".cQuestionText img, .cTDContainQues > .rs-ht img, .question-texts img, .information-text img";
const RS_GALLERY_ANSWER_SELECTOR = ".rsRow img, .rsScrollGridContent img, .rsBtn img, .theCard img, .answer-texts img, .answers-texts img, .numeric-answer-texts-wrapper img, .carousel-answer-text-wrapper img, .carousel-answer-text-wrapper > * > img, .answer-text-cell img, .ansText-Regular img, .ansText-Instruction img, .ansText-Supplementary img, .slider-question-text img, .slider-holder img, .rsSliderQuestionHolder img, .answer-button img, .rsHeaderRow img, .answerText-Regular img";

// Builds gallery items and binds modal behavior.
function fnGalleryProcess(scope, controls) {
    controls = controls === true;
    window.__rsGalleryScope = scope;
    window.__rsGalleryControls = controls;

    const STYLE_ID = "rs-inline-gallery-style";
    const DATA_BOUND = "data-rs-gallery-bound";
    const MODAL_ID = "rsInlineGalleryModal";
    injectGalleryStyles();
    createModalIfNeeded();

    const questionSelector = RS_GALLERY_QUESTION_SELECTOR;
    const answerSelector = RS_GALLERY_ANSWER_SELECTOR;

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

    targetImages.forEach(function (img) {
        img.setAttribute(DATA_BOUND, "true");
        img.style.cursor = "zoom-in";
    });

    // Collects usable images for a selector.
    function collectImages(selector) {
        const found = Array.from(document.querySelectorAll(selector));

        return found.filter(function (img) {
            const src = img.getAttribute("src") || "";
            return !!src;
        });
    }

    // Normalizes image names for matching.
    function normaliseName(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\.[a-z0-9]+$/i, "");
    }

    // Parses image file information for matching and conversion.
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

    // Converts thumbnail filenames to full-size filenames.
    function getFullImageSrc(src) {
        const rawSrc = String(src || "");
        const info = getImageInfo(rawSrc);

        if (!/(_s|_thumbnail|_small)$/i.test(info.fileWithoutExt)) {
            return rawSrc;
        }

        const rebuiltFileName = info.baseWithoutThumbSuffix + info.extension;
        return rawSrc.replace(info.fileName, rebuiltFileName);
    }
    window.__rsGalleryGetFullImageSrc = getFullImageSrc;

    // Injects gallery styles once.
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

    // Creates gallery modal markup and event handlers once.
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

    // Opens the gallery at a specific index.
    function openGallery(startIndex, items) {
        //console.log("openGallery called", startIndex, items);
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

    window.__rsOpenGallery = openGallery;

    // Closes the gallery and restores page scrolling.
    function closeGallery() {
        const modal = document.getElementById(MODAL_ID);
        if (!modal) {
            return;
        }

        modal.classList.remove("rs-gallery-open");
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
    }

    // Moves to the next or previous gallery item.
    function stepGallery(direction) {
        const modal = document.getElementById(MODAL_ID);
        if (!modal || !modal._galleryItems || !modal._galleryItems.length) {
            return;
        }

        const total = modal._galleryItems.length;
        modal._galleryIndex = (modal._galleryIndex + direction + total) % total;
        renderGalleryImage();
    }

    // Renders the current gallery image and UI state.
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

    // Preloads neighboring gallery images for smoother navigation.
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

// Observes container updates and re-runs gallery binding.
function fnGlobalGallery(scope, controls) {
    controls = controls === true;
    if (window.__rsGalleryContainerObserverBound) return;

    const container = document.querySelector("#pageContainerContent, #rsPanelMain");
    if (!container) return;

    window.__rsGalleryContainerObserverBound = true;

    let galleryTimer = null;

    fnGalleryProcess(scope, controls);

    const observer = new MutationObserver(function () {
        if (galleryTimer) clearTimeout(galleryTimer);

        galleryTimer = setTimeout(function () {
            fnGalleryProcess(scope, controls);
        }, 150);
    });

    observer.observe(container, {
        childList: true,
        subtree: true
    });
}

// Retries gallery setup until images are available.
function fnGallery(scope, controls, maxAttempts, delay) {
    maxAttempts = Number(maxAttempts) || 15;
    delay = Number(delay) || 100;

    let attempt = 0;

    // Runs one retry cycle and schedules the next one.
    function run() {
        attempt++;
        fnGalleryProcess(scope, controls);

        if (attempt < maxAttempts) {
            setTimeout(run, delay);
        }
    }

    run();
}

(function () {
    if (window.__rsGalleryDelegatedClickBound) return;
    window.__rsGalleryDelegatedClickBound = true;

    const questionSelector = RS_GALLERY_QUESTION_SELECTOR;
    const answerSelector = RS_GALLERY_ANSWER_SELECTOR;

    // Normalizes image names for matching.
    function normaliseName(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\.[a-z0-9]+$/i, "");
    }

    // Collects visible live images for the current scope.
    function collectLiveImages(scope) {
        // Collects visible images for a single selector.
        function collect(selector) {
            return Array.from(document.querySelectorAll(selector)).filter(function (img) {
                const src = img.getAttribute("src") || "";
                if (!src) return false;
                if (img.closest(".rankhide")) return false;

                const style = window.getComputedStyle(img);
                if (style.display === "none" || style.visibility === "hidden") return false;

                return true;
            });
        }

        if (typeof scope === "undefined" || scope === null || String(scope).trim() === "") {
            return collect(questionSelector + ", " + answerSelector);
        }

        const mode = String(scope).trim();

        if (mode.toUpperCase() === "Q") {
            return collect(questionSelector);
        }

        if (mode.toUpperCase() === "A") {
            return collect(answerSelector);
        }

        const requestedNames = mode
            .split(",")
            .map(function (item) {
                return normaliseName(item);
            })
            .filter(Boolean);

        return collect(questionSelector + ", " + answerSelector).filter(function (img) {
            const src = img.getAttribute("src") || "";
            const cleanSrc = src.split("?")[0].split("#")[0];
            const fileName = cleanSrc.substring(cleanSrc.lastIndexOf("/") + 1);
            const baseName = fileName
                .replace(/\.[a-z0-9]+$/i, "")
                .replace(/(_s|_thumbnail|_small)$/i, "")
                .toLowerCase();

            return requestedNames.indexOf(baseName) !== -1;
        });
    }

    document.addEventListener("click", function (event) {
        const img = event.target.closest("img[data-rs-gallery-bound='true']");
        if (!img) return;

        const liveImages = collectLiveImages(window.__rsGalleryScope);
        const clickedIndex = liveImages.indexOf(img);

        if (clickedIndex === -1) return;

        const liveItems = liveImages.map(function (node) {
            const src = node.getAttribute("src") || "";

            return {
                thumbSrc: src,
                fullSrc: typeof window.__rsGalleryGetFullImageSrc === "function"
                    ? window.__rsGalleryGetFullImageSrc(src)
                    : src,
                element: node,
                alt: node.getAttribute("alt") || "",
                title: node.getAttribute("title") || ""
            };
        });

        event.preventDefault();
        event.stopPropagation();

        if (typeof window.__rsOpenGallery === "function") {
            window.__rsOpenGallery(clickedIndex, liveItems);
        }
    }, true);
})();



(function (global) {

// Retries magnifier setup until images are available.
function fnMagnifier(scope, options, maxAttempts, delay) {
    maxAttempts = Number(maxAttempts) || 15;
    delay = Number(delay) || 100;

    global.__rsMagnifierScope = scope;
    global.__rsMagnifierOptions = options || {};

    let attempt = 0;

    // Runs one retry cycle and schedules the next one.
    function run() {
        attempt++;
        magnifierProcess(scope, options || {});

        if (attempt < maxAttempts) {
            setTimeout(run, delay);
        }
    }

    run();
}

// Observes container updates and re-runs magnifier binding.
function fnGlobalMagnifier(scope, options) {
    global.__rsMagnifierScope = scope;
    global.__rsMagnifierOptions = options || {};

    if (global.__rsMagnifierContainerObserverBound) {
        magnifierProcess(scope, options || {});
        return;
    }

    const container = document.querySelector("#pageContainerContent, #rsPanelMain");

    if (!container) {
        fnMagnifier(scope, options);
        return;
    }

    global.__rsMagnifierContainerObserverBound = true;

    let magnifierTimer = null;

    magnifierProcess(scope, options || {});

    const observer = new MutationObserver(function () {
        if (magnifierTimer) {
            clearTimeout(magnifierTimer);
        }

        magnifierTimer = setTimeout(function () {
            magnifierProcess(global.__rsMagnifierScope, global.__rsMagnifierOptions || {});
        }, 150);
    });

    observer.observe(container, {
        childList: true,
        subtree: true
    });
}
    // Debounces and schedules magnifier reprocessing.
    function queueGlobalMagnifierProcess(delayMs) {
        if (global.__rsMagnifierObserverTimer) {
            clearTimeout(global.__rsMagnifierObserverTimer);
        }

        global.__rsMagnifierObserverTimer = setTimeout(function () {
            global.__rsMagnifierObserverTimer = null;
            magnifierProcess(global.__rsMagnifierScope, global.__rsMagnifierOptions || {});
        }, Math.max(0, Number(delayMs) || 0));
    }

    // Binds magnifier behavior to target images.
    function magnifierProcess(scope, options) {
        const IMG = global.__RS_SURVEY_IMG_SELECTORS;

        if (!IMG || !IMG.question || !IMG.answer) {
            console.error("fnMagnifier: shared image selectors are missing.");
            return;
        }

        const questionSelector = IMG.question;
        const answerSelector = IMG.answer;

        const config = {
            zoom: 2,
            lensSize: 180,
            shape: "circle", // circle | square
            border: "2px solid rgba(255,255,255,0.95)",
            background: "#ffffff",
            shadow: true,
            offsetX: 0,
            offsetY: 0,
            touch: true,
            touchOffsetX: 0,
            touchOffsetY: null,
            disableRightClick: true,
            useLargeImage: true,
            zIndex: 999999,
            ...(options || {})
        };

        injectMagnifierStyles();
        createMagnifierLens();

        const targetImages = getTargetImages(scope, questionSelector, answerSelector);

        if (!targetImages.length) return 0;

        targetImages.forEach(function (img) {
            if (!img.dataset.rsMagnifierOriginalSrc) {
                img.dataset.rsMagnifierOriginalSrc = img.currentSrc || img.getAttribute("src") || img.src || "";
            }

            img.dataset.rsMagnifierFullSrc = config.useLargeImage
                ? getFullImageSrc(img.dataset.rsMagnifierOriginalSrc || img.getAttribute("src") || "")
                : (img.dataset.rsMagnifierOriginalSrc || img.getAttribute("src") || "");

            img._rsMagnifierOptions = config;
            img.setAttribute("data-rs-magnifier-bound", "true");
            //img.style.cursor = "zoom-in";
            img.style.cursor = "none";
            
            /*
            if (img.dataset.rsMagnifierListenersBound === "true") {
                return;
            }
            */
            if (img._rsMagnifierListenersBound === true) {
                return;
            }

            img._rsMagnifierListenersBound = true;
            img.dataset.rsMagnifierListenersBound = "true";




            if (config.disableRightClick) {
                img.addEventListener("contextmenu", function (event) {
                    event.preventDefault();
                });
            }

            img.addEventListener("mouseenter", function (event) {
                showMagnifier(img, event, false);
            });

            img.addEventListener("mousemove", function (event) {
                moveMagnifier(img, event, false);
            });

            img.addEventListener("mouseleave", function () {
                hideMagnifier();
            });

            if (config.touch) {
                img.addEventListener("touchstart", function (event) {
                    if (!event.touches || !event.touches.length) {
                        return;
                    }

                    event.preventDefault();
                    showMagnifier(img, event.touches[0], true);
                }, { passive: false });

                img.addEventListener("touchmove", function (event) {
                    if (!event.touches || !event.touches.length) {
                        return;
                    }

                    event.preventDefault();
                    moveMagnifier(img, event.touches[0], true);
                }, { passive: false });

                img.addEventListener("touchend", hideMagnifier);
                img.addEventListener("touchcancel", hideMagnifier);
            }
        });

        return targetImages.length;
    }

    // Selects target images by scope or filename filter.
    function getTargetImages(scope, questionSelector, answerSelector) {
        if (typeof scope === "undefined" || scope === null || String(scope).trim() === "") {
            return collectImages(questionSelector + ", " + answerSelector);
        }

        const mode = String(scope).trim();

        if (mode.toUpperCase() === "Q") {
            return collectImages(questionSelector);
        }

        if (mode.toUpperCase() === "A") {
            return collectImages(answerSelector);
        }

        const requestedNames = mode
            .split(",")
            .map(function (item) {
                return normaliseName(item);
            })
            .filter(Boolean);

        return collectImages(questionSelector + ", " + answerSelector).filter(function (img) {
            const src = img.dataset.rsMagnifierOriginalSrc || img.getAttribute("src") || "";
            const info = getImageInfo(src);

            return requestedNames.indexOf(info.baseNameNormalised) !== -1;
        });
    }

    // Collects usable images for a selector.
    function collectImages(selector) {
        return Array.from(document.querySelectorAll(selector)).filter(function (img) {
            const src = img.getAttribute("src") || img.currentSrc || img.src || "";

            if (!src) {
                return false;
            }

            if (img.closest(".rankhide")) {
                return false;
            }

            const style = window.getComputedStyle(img);

            if (style.display === "none" || style.visibility === "hidden") {
                return false;
            }

            return true;
        });
    }

    // Normalizes image names for matching.
    function normaliseName(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\.[a-z0-9]+$/i, "");
    }

    // Parses image file information for matching and conversion.
    function getImageInfo(src) {
        const cleanSrc = String(src || "").split("?")[0].split("#")[0];
        const fileName = cleanSrc.substring(cleanSrc.lastIndexOf("/") + 1);

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

    // Converts thumbnail filenames to full-size filenames.
    function getFullImageSrc(src) {
        const rawSrc = String(src || "");
        const info = getImageInfo(rawSrc);

        if (!/(_s|_thumbnail|_small)$/i.test(info.fileWithoutExt)) {
            return rawSrc;
        }

        const rebuiltFileName = info.baseWithoutThumbSuffix + info.extension;

        return rawSrc.replace(info.fileName, rebuiltFileName);
    }

    // Injects magnifier lens styles once.
    function injectMagnifierStyles() {
        const STYLE_ID = "rs-inline-magnifier-style";

        if (document.getElementById(STYLE_ID)) {
            return;
        }

        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.type = "text/css";
        style.innerHTML = `
            .rs-magnifier-lens {
                position: fixed;
                left: 0;
                top: 0;
                width: 180px;
                height: 180px;
                z-index: 999999;
                overflow: hidden;
                pointer-events: none;
                opacity: 0;
                visibility: hidden;
                background: #ffffff;
                border: 2px solid rgba(255,255,255,0.95);
                border-radius: 50%;
                box-sizing: border-box;
                /*transform: translate3d(-9999px, -9999px, 0) scale(0.98);
                transition: opacity 0.12s ease, visibility 0.12s ease, transform 0.12s ease;*/
                transform: translate3d(-9999px, -9999px, 0) scale(1);
                transition: opacity 0.12s ease, visibility 0.12s ease;
            }

            .rs-magnifier-lens.rs-magnifier-show {
                opacity: 1;
                visibility: visible;
            }

            .rs-magnifier-lens img {
                position: absolute;
                left: 0;
                top: 0;
                display: block;
                max-width: none !important;
                max-height: none !important;
                width: auto;
                height: auto;
                user-select: none;
                -webkit-user-select: none;
                -webkit-user-drag: none;
                pointer-events: none;
            }

            img[data-rs-magnifier-bound="true"] {
                cursor: zoom-in;
            }
        `;

        document.head.appendChild(style);
    }

    // Creates the shared magnifier lens element once.
    function createMagnifierLens() {
        if (document.getElementById("rsMagnifierLens")) {
            return;
        }

        const lens = document.createElement("div");
        lens.id = "rsMagnifierLens";
        lens.className = "rs-magnifier-lens";
        lens.innerHTML = '<img id="rsMagnifierLensImage" src="" alt="">';

        document.body.appendChild(lens);
    }

    // Shows the lens and syncs it to the active image.
    function showMagnifier(img, eventPoint, isTouch) {
        const lens = document.getElementById("rsMagnifierLens");
        const lensImg = document.getElementById("rsMagnifierLensImage");

        if (!lens || !lensImg || !img) {
            return;
        }

        const config = img._rsMagnifierOptions || {};
        const fullSrc = img.dataset.rsMagnifierFullSrc || img.dataset.rsMagnifierOriginalSrc || img.getAttribute("src") || "";

		const srcChanged = lensImg.getAttribute("src") !== fullSrc;

		if (srcChanged) {
			lensImg.onload = function () {
				moveMagnifier(img, eventPoint, isTouch);
			};

			lensImg.setAttribute("src", fullSrc);
		}

		applyMagnifierConfig(lens, config);
		moveMagnifier(img, eventPoint, isTouch);
		lens.classList.add("rs-magnifier-show");
    }

    // Moves and updates zoomed lens content on pointer movement.
    function moveMagnifier(img, eventPoint, isTouch) {
        const lens = document.getElementById("rsMagnifierLens");
        const lensImg = document.getElementById("rsMagnifierLensImage");

        if (!lens || !lensImg || !img || !eventPoint) {
            return;
        }

        const config = img._rsMagnifierOptions || {};
        const rect = img.getBoundingClientRect();

        if (!rect.width || !rect.height) {
            return;
        }

        const zoom = Math.max(1, Number(config.zoom) || 2);
        const lensSize = Math.max(80, Number(config.lensSize) || 180);
        const lensRadius = lensSize / 2;

        let x = eventPoint.clientX - rect.left;
        let y = eventPoint.clientY - rect.top;

        x = Math.max(0, Math.min(rect.width, x));
        y = Math.max(0, Math.min(rect.height, y));

        const desktopOffsetX = Number(config.offsetX) || 0;
        const desktopOffsetY = Number(config.offsetY) || 0;

        const touchOffsetX = Number(config.touchOffsetX) || 0;
        const touchOffsetY = config.touchOffsetY === null || typeof config.touchOffsetY === "undefined"
            ? -(lensSize * 1.25)
            : Number(config.touchOffsetY) || 0;

        const offsetX = isTouch ? touchOffsetX : desktopOffsetX;
        const offsetY = isTouch ? touchOffsetY : desktopOffsetY;

        const lensLeft = eventPoint.clientX - lensRadius + offsetX;
        const lensTop = eventPoint.clientY - lensRadius + offsetY;

        lens.style.width = lensSize + "px";
        lens.style.height = lensSize + "px";
        lens.style.transform = "translate3d(" + lensLeft + "px, " + lensTop + "px, 0) scale(1)";

		const naturalWidth = lensImg.naturalWidth || img.naturalWidth || rect.width;
		const naturalHeight = lensImg.naturalHeight || img.naturalHeight || rect.height;

		const scaleX = naturalWidth / rect.width;
		const scaleY = naturalHeight / rect.height;

		lensImg.style.width = (naturalWidth * zoom) + "px";
		lensImg.style.height = (naturalHeight * zoom) + "px";
		lensImg.style.left = (lensRadius - (x * scaleX * zoom)) + "px";
		lensImg.style.top = (lensRadius - (y * scaleY * zoom)) + "px";
    }

    // Hides the magnifier lens.
    function hideMagnifier() {
        const lens = document.getElementById("rsMagnifierLens");

        if (!lens) {
            return;
        }

        lens.classList.remove("rs-magnifier-show");
        lens.style.transform = "translate3d(-9999px, -9999px, 0) scale(0.98)";
    }

    // Applies lens visual settings from config.
    function applyMagnifierConfig(lens, config) {
        const lensSize = Math.max(80, Number(config.lensSize) || 180);
        const shape = String(config.shape || "circle").toLowerCase();

        lens.style.width = lensSize + "px";
        lens.style.height = lensSize + "px";
        lens.style.zIndex = Number(config.zIndex) || 999999;
        lens.style.border = config.border || "2px solid rgba(255,255,255,0.95)";
        lens.style.background = config.background || "#ffffff";
        lens.style.borderRadius = shape === "square" ? "12px" : "50%";

        if (config.shadow === false) {
            lens.style.boxShadow = "none";
        } else {
            lens.style.boxShadow = "0 10px 34px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(0,0,0,0.08)";
        }
    }

    global.fnMagnifier = fnMagnifier;
    global.fnGlobalMagnifier = fnGlobalMagnifier;
})(window);
