function reCaptchas(rsQno, rsSubqIndex, rsParams) {
    // Check for WCAG, if the flag is set, do nothing as these buttons are not WCAG compliant at the current state
    if ($('#btnToggleWcag').val() == 1) {
        return false;
    }

    const QuestionID = "#" + rsQno;
    const $question = $(QuestionID);
    const $table = $question.find(".cTable");

    // Add classes to the table
    $table.addClass("rsCQ").addClass("rsCQreCaptcha");

    // Cache frequently used elements
    const $inputFields = $question.find('.cFInput');
    const $radioButtons = $question.find('input[type=radio]');
    const $loadingContainer = $question.find('.cTDContainQues');
    const $btnNext = $('#btnNext');

    // Hide elements
    $loadingContainer.hide();
    $btnNext.hide();

    // Create a loading message
    $loadingContainer.append('<center><iframe style="display:block" src="https://assets.walr.com/p/CAPTCHA/V3.php?a=1" id="cccc"></iframe><br><img src="https://assets.walr.com/p/CAPTCHA/loading.gif"><center>');

    // Define the message handler for reCAPTCHA
    function ReceiveMessage(evt) {
        const message = evt.data.toString();
        console.log("-Captcha-");
        const [validRequest, score] = message.split('|');

        // Update input values
        $inputFields.eq(0).val(score);
        $inputFields.eq(1).val(validRequest);

        if (score >= 0.6 || validRequest == 1) {
            // Valid Captcha
            $radioButtons.eq(1).prop('checked', true);
        } else {
            // Invalid Captcha
            $radioButtons.eq(2).prop('checked', true);
        }

        if (score >= 0 || validRequest >= 0) {
            if (window.removeEventListener) {
                window.removeEventListener("message", ReceiveMessage, false);
            } else {
                window.detachEvent("onmessage", ReceiveMessage);
            }
            // Uncomment the following line if you want to automatically click the "Next" button
            $btnNext.click();
        }
    }

    if (!window.postMessage) {
        console.log("Something is not supported.");
    } else {
        if (window.addEventListener) {
            window.addEventListener("message", ReceiveMessage, false);
        } else {
            window.attachEvent("onmessage", ReceiveMessage);
        }
    }
}