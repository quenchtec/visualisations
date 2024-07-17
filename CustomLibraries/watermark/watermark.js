function rsWatermark(rsQno, rsSubqIndex, rsParams) {
    const QuestionID = "#" + rsQno;
    $(QuestionID).find(".cTable").addClass("rsWatermark");
    var {
        strWaterMarkText = "WATERMARKED",
            blnQuestionText = true,
            blnAnswers = true
    } = rsParams || {};

    $(document).ready(function() {
        var imgs = [];

        if (blnQuestionText) imgs = imgs.concat($(QuestionID).find(".cQuestionText img").toArray());
        if (blnAnswers) imgs = imgs.concat($(QuestionID).find(".rsRow img").toArray());

        if (!imgs.length) {
            console.error("No images found");
            return;
        }

        imgs.forEach(function(img) {
            // crossOrigin attribute
            img.crossOrigin = "Anonymous";

            // ensure the watermark is applied only once
            if (!img.dataset.watermarked) {
                img.onload = function() {
                    applyWatermark(img);
                    // remove the onload event handler to stop stacking the watermark
                    img.onload = null;
                };

                // the image is already loaded aplply the watermark
                if (img.complete) {
                    applyWatermark(img);
                    // remove the onload event handler to stop stacking the watermark
                    img.onload = null;
                }
            }
        });
    });

    function applyWatermark(img) {
        try {
            var canvas = document.createElement('canvas');
            canvas.classList.add("waterCanvas");
            var ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            var fontSize = 40;
            ctx.font = fontSize + 'px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // position of the watermark
            var x = canvas.width / 2;
            var y = canvas.height / 2;
            ctx.fillText(strWaterMarkText, x, y);

            // replace the original
            img.src = canvas.toDataURL('image/png');
            img.dataset.watermarked = 'true';

            // Optional: Display the canvas (for debugging)
            // document.body.appendChild(canvas);
        } catch (e) {
            console.error("Error applying watermark: ", e);
        }
    }
}
