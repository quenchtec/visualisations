function customWatermark(wtx, qt, at, fs) {
    $(document).find('div[id^="question_"]').addClass("rsWatermark");

    let strWaterMarkText = wtx;
    let blnQuestionText = qt;
    let blnAnswers = at;

    var imgs = [];

    if (blnQuestionText) imgs = imgs.concat($(document).find(".imghotspotContainer img, .question-text img").toArray());
    if (blnAnswers) imgs = imgs.concat($(document).find(".row-elements img").toArray());

    const canvases = $(document).find("canvas[style*='background-image']");
    if (canvases.length) {
        canvases.each(function() {
            const bgImageUrl = $(this).css("background-image").replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
            const canvasElement = $(this).get(0);

            loadAndApplyCanvasBackgroundWatermark(bgImageUrl, canvasElement, fs, strWaterMarkText);
        });
    }

    if (!imgs.length && !canvases.length) {
        console.error("No images or canvases with background images found.");
        return;
    }

    // Wait for all images to load before applying the watermark
    Promise.all(imgs.map(img => loadImage(img)))
        .then(() => {
            imgs.forEach(img => {
                applyWatermark(img);
                const observer = new ResizeObserver(() => {
                    applyWatermark(img);
                });
                observer.observe(img);
            });
        })
        .catch(err => console.error("Error loading images:", err));

    function loadImage(img) {
        return new Promise((resolve, reject) => {
            if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
                resolve();
            } else {
                img.onload = resolve;
                img.onerror = reject;
            }
        });
    }

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
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
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

    function loadAndApplyCanvasBackgroundWatermark(bgImageUrl, canvasElement, fontSize, watermarkText) {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = bgImageUrl;

        img.onload = function() {
            applyWatermarkToCanvasBackground(img, canvasElement, fontSize, watermarkText);
        };

        img.onerror = function() {
            console.error("Failed to load background image for watermarking:", bgImageUrl);
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
