function customWatermark(wtx, qt, at, fs) {
    $(document).find(".cTable").addClass("rsWatermark");

    let strWaterMarkText = wtx;
    let blnQuestionText = qt;
    let blnAnswers = at;

    $(document).ready(function() {
        var imgs = [];

        if (blnQuestionText) imgs = imgs.concat($(document).find(".cQuestionText img").toArray());
        if (blnAnswers) imgs = imgs.concat($(document).find(".rsRow img").toArray());

        if (!imgs.length) {
            console.error("No images found");
            return;
        }

        imgs.forEach(function(img) {
            img.crossOrigin = "Anonymous";

            // Apply watermark when the image is loaded
            if (!img.dataset.watermarked) {
                img.onload = function() {
                    applyWatermark(img);
                    img.onload = null;
                };

                // If the image is already loaded and has valid dimensions, apply the watermark immediately
                if (img.complete && img.width > 0 && img.height > 0) {
                    applyWatermark(img);
                    img.onload = null;
                }
            }

            // Set up dynamic resize handling
            const observer = new ResizeObserver(() => {
                applyWatermark(img);
            });
            observer.observe(img);
        });
    });

    function applyWatermark(img) {
        try {
            // Ensure image dimensions are non-zero before drawing
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

            // Watermark position at the center
            var x = canvas.width / 2;
            var y = canvas.height / 2;
            ctx.fillText(strWaterMarkText, x, y);

            // Replace the original image source with the watermarked version
            img.src = canvas.toDataURL('image/png');
            img.dataset.watermarked = 'true';
        } catch (e) {
            console.error("Error applying watermark: ", e);
        }
    }
}
