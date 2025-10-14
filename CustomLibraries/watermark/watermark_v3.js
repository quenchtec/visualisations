function customWatermark(wtx, qt, at, fs, retryCount = 20) {
    $(document).find(".cTable").addClass("rsWatermark");

    let strWaterMarkText = wtx;
    let blnQuestionText = qt;
    let blnAnswers = at;

    var imgs = [];

    // Collect all images for watermarking based on the flags
    if (blnQuestionText) imgs = imgs.concat($(document).find(".cQuestionText img").toArray());
    if (blnAnswers) imgs = imgs.concat($(document).find(".rsRow img, .rsScrollGridContent img, .rsBtn img, .theCard img").toArray());

    // Retry logic if no images are found, with a retry limit
    if (!imgs.length) {
        if (retryCount > 0) {
            setTimeout(() => customWatermark(wtx, qt, at, fs, retryCount - 1), 100);
        } else {
            console.error("No images found after multiple attempts.");
        }
        return;
    }

    imgs.forEach(function(img) {
        img.crossOrigin = "Anonymous";

        // Ensure the image is loaded before applying the watermark
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

        // Set up dynamic resizing to handle image resizing (for responsive layouts)
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
}
