function customWatermark(wtx, qt, at, fs, retryCount = 20) {
    $(document).find('div[id^="question_"]').addClass("rsWatermark");

    let strWaterMarkText = wtx;
    let blnQuestionText = qt;
    let blnAnswers = at;

    var imgs = [];

    // Collect all <img> elements for watermarking based on the flags
    if (blnQuestionText) imgs = imgs.concat($(document).find(".imghotspotContainer img, .question-text img").toArray());
    if (blnAnswers) imgs = imgs.concat($(document).find(".row-elements img").toArray());

    // Find any canvases with background images
    const canvases = $(document).find("canvas[style*='background-image']");
    if (canvases.length) {
        canvases.each(function() {
            const bgImageUrl = $(this).css("background-image").replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
            const canvasElement = $(this).get(0);

            loadAndApplyCanvasBackgroundWatermark(bgImageUrl, canvasElement, fs, strWaterMarkText, retryCount);
        });
    }

    // Retry logic if no standard <img> elements or canvases are found
    if (!imgs.length && !canvases.length) {
        if (retryCount > 0) {
            setTimeout(() => customWatermark(wtx, qt, at, fs, retryCount - 1), 100);
        } else {
            console.error("No images or canvases with background images found after multiple attempts.");
        }
        return;
    }

    imgs.forEach(function(img) {
        img.crossOrigin = "Anonymous";

        function loadAndApplyWatermark() {
            if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
                applyWatermark(img);
            } else {
                img.onload = function() {
                    applyWatermark(img);
                    img.onload = null;
                };
            }
        }

        loadAndApplyWatermark();

        const observer = new ResizeObserver(() => {
            applyWatermark(img);
        });
        observer.observe(img);
    });

    function applyWatermark(img) {
        try {
            if (img.naturalWidth === 0 || img.naturalHeight === 0) {
                console.warn("Image dimensions are zero. Skipping watermark for:", img);
                return;
            }

            var canvas = document.createElement('canvas');
            canvas.classList.add("waterCanvas");
            var ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

            var fontSize = fs;
            ctx.font = fontSize + 'px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            var x = canvas.width / 2;
            var y = canvas.height / 2;
            ctx.fillText(strWaterMarkText, x, y);

            img.src = canvas.toDataURL('image/png');
            img.dataset.watermarked = 'true';
        } catch (e) {
            console.error("Error applying watermark:", e);
            if (e.name === "SecurityError") {
                console.warn("Cross-origin error: Make sure the image is hosted on the same domain or allows cross-origin access.");
            }
        }
    }

    function loadAndApplyCanvasBackgroundWatermark(bgImageUrl, canvasElement, fontSize, watermarkText, retries) {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = bgImageUrl;

        img.onload = function() {
            applyWatermarkToCanvasBackground(img, canvasElement, fontSize, watermarkText);
        };

        img.onerror = function() {
            console.error("Failed to load background image for watermarking:", bgImageUrl);
            if (retries > 0) {
                setTimeout(() => loadAndApplyCanvasBackgroundWatermark(bgImageUrl, canvasElement, fontSize, watermarkText, retries - 1), 100);
            }
        };
    }

    function applyWatermarkToCanvasBackground(img, targetCanvas, fontSize, watermarkText) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(img, 0, 0, img.width, img.height);

        ctx.font = fontSize + 'px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        ctx.fillText(watermarkText, x, y);

        $(targetCanvas).css("background-image", `url(${canvas.toDataURL("image/png")})`);
    }
}
