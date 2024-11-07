function customWatermark(wtx, qt, at, fs) {
    $(document).find(".cTable").addClass("rsWatermark");

    let strWaterMarkText = wtx;
    let blnQuestionText = qt;
    let blnAnswers = at;

    var imgs = [];

    // Collect all images for watermarking based on the flags
    if (blnQuestionText) imgs = imgs.concat($(document).find(".cQuestionText img").toArray());
    if (blnAnswers) imgs = imgs.concat($(document).find(".rsRow img").toArray());

    if (!imgs.length) {
        console.error("No images found");
        return;
    }

    imgs.forEach(function(img) {
        img.crossOrigin = "Anonymous";

        // Apply the watermark only when the image is fully loaded
        if (!img.dataset.watermarked) {
            // Use onload to ensure the image is loaded
            img.onload = function() {
                applyWatermark(img);
                img.dataset.watermarked = 'true';
                img.onload = null; // Clear the handler to prevent re-execution
            };

            // If image is already loaded (in case of cached images), apply watermark immediately
            if (img.complete && img.width > 0 && img.height > 0) {
                applyWatermark(img);
                img.dataset.watermarked = 'true';
                img.onload = null; // Clear the handler to prevent re-execution
            }
        }

        // Watch for image resizing
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
