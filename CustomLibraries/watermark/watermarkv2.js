function customWatermark(wtx, qt, at, fs, retryCount = 20) {
    $(document).find(".cTable").addClass("rsWatermark");

    let strWaterMarkText = wtx;
    let blnQuestionText = qt;
    let blnAnswers = at;

    var imgs = [];

    // Collect images for watermarking based on the flags
    if (blnQuestionText) imgs = imgs.concat($(document).find(".cQuestionText img").toArray());
    if (blnAnswers) imgs = imgs.concat($(document).find(".rsRow img").toArray());

    // Retry logic if no images are found, with a retry limit
    if (!imgs.length) {
        if (retryCount > 0) {
            setTimeout(() => customWatermark(wtx, qt, at, fs, retryCount - 1), 50);
        } else {
            console.error("No images found after multiple attempts.");
        }
        return;
    }

    imgs.forEach(function(img) {
        img.crossOrigin = "Anonymous";

        // Apply watermark when the image is fully loaded
        if (!img.dataset.watermarked) {
            img.onload = function() {
                applyWatermark(img);
                img.dataset.watermarked = 'true';
                img.onload = null;
            };

            // Apply watermark immediately if the image is already loaded
            if (img.complete && img.width > 0 && img.height > 0) {
                applyWatermark(img);
                img.dataset.watermarked = 'true';
                img.onload = null;
            }
        }

        // Set up ResizeObserver to handle image resizing
        const observer = new ResizeObserver(() => {
            if (img.dataset.watermarked) {
                applyWatermark(img);
            }
        });
        observer.observe(img);
    });

    function applyWatermark(img) {
        try {
            if (img.width === 0 || img.height === 0) {
                console.warn("Image dimensions are zero. Skipping watermark for:", img);
                return;
            }

            var canvas = document.createElement('canvas');
            canvas.classList.add("waterCanvas");
            var ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            var fontSize = fs;
            ctx.font = fontSize + 'px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            var x = canvas.width / 2;
            var y = canvas.height / 2;
            ctx.fillText(strWaterMarkText, x, y);

            img.src = canvas.toDataURL('image/png');
        } catch (e) {
            console.error("Error applying watermark: ", e);
        }
    }
}
