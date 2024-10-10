function rsEssay(rsQno, rsSubqIndex, rsParams = {}) {
    const setDefault = (param, defaultValue) => (typeof param === "undefined" ? defaultValue : param);
    if ($('#btnToggleWcag').val() == 1) return;
    const $questionContainer = $(`#${rsQno}`);
    const $textAreas = $questionContainer.find(".cTextArea");
    $questionContainer.find(".rsRowOpen").addClass("rsCuQeEssay");
    $questionContainer.find(".cTable").addClass("rsCQ rsCQEssay");
    rsParams.blnShowProgress = setDefault(rsParams.blnShowProgress, true);
    rsParams.blnNextButton = setDefault(rsParams.blnNextButton, true);
    rsParams.intIdealLength = setDefault(rsParams.intIdealLength, 200);
    rsParams.blnProgressBarText = setDefault(rsParams.blnProgressBarText, true);
    rsParams.strProgressText = setDefault(rsParams.strProgressText, "");
    if (rsParams.blnNextButton) $("#btnNext").hide();
    if (rsParams.blnShowProgress) {
        const arrMessages = rsParams.strProgressText.split("#|#").map(msg => msg.split("|"));
        const intBoxWidth = $textAreas[0].clientWidth;
        $textAreas.each((index, textArea) => {
            $(textArea).after(`
                <div class='essay-progress-bar' style='width: ${intBoxWidth}px; height: 30px;'>
                    <div class='progress-bar-messages-holder'>
                        <span class='progress-bar-messages'></span>
                    </div>
                    <div class='essay-progress-fill'></div>
                </div>
            `);
            $(textArea).on("input", function() {
                $(".essay-progress-bar").show();
                updateProgressBar(rsParams.intIdealLength, arrMessages[index], index);
            });
        });
    }
    if (rsParams.blnNextButton) {
        $textAreas.on("input", function() {
            const textLength = $textAreas.eq(rsSubqIndex).val().length;
            $("#btnNext").toggle(textLength >= rsParams.intIdealLength);
        });
    }
    function updateProgressBar(intIdealLength, messages, index) {
        const intStep = 100 / messages.length;
        const inputLength = $textAreas.eq(rsSubqIndex).val().length;
        const percentage = (inputLength / intIdealLength) * 100;
        $(".essay-progress-fill").eq(index).width(`${Math.min(percentage, 100)}%`);
        $(".essay-progress-bar").eq(index).width($textAreas[0].clientWidth);
        if (rsParams.blnProgressBarText) {
            $(".progress-bar-messages").eq(index).text(messages[Math.floor(percentage / intStep)]);
        }
    }
}