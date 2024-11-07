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
            applyWatermark(img);

            // Use ResizeObserver to reapply watermark on resize
            const observer = new ResizeObserver(() => {
                applyWatermark(img);
            });
            observer.observe(img);
        });
    });

    function applyWatermark(img) {
        try {
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
            img.dataset.watermarked = 'true';
        } catch (e) {
            console.error("Error applying watermark: ", e);
        }
    }
}
