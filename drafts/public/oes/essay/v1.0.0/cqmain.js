function rsEssay(rsQno,rsSubqIndex,rsParams) {
  rsParams.blnShowProgress = (typeof rsParams.blnShowProgress === "undefined") ? true : rsParams.blnShowProgress;
  if (rsParams.blnShowProgress) {
    rsParams.blnProgressBarText = (typeof rsParams.blnProgressBarText === "undefined") ? true : rsParams.blnProgressBarText;
    rsParams.intIdealLength = (typeof rsParams.intIdealLength === "undefined") ? 200 : rsParams.intIdealLength;
    rsParams.strProgressText = (typeof rsParams.strProgressText === "undefined") ? "" : rsParams.strProgressText;
    let intBoxWidth = $('.cTextArea')[0].clientWidth;
    let arrMessage = rsParams.strProgressText.split("#|#");//this is the separator for multiple essays with progress bars
    $(arrMessage).each(function(e){
        arrMessage[e] = arrMessage[e].split("|");
    });

    $(".cTextArea").each(function(e){
      $(this).after("<div class='essay-progress-bar' style='width: " + intBoxWidth + "px;'><span class='progress-bar-messages'></span><div class='essay-progress-fill'></div></div>");
      $(this).on("keydown keyup", function() {OETool(rsParams.intIdealLength, arrMessage[e], e);});
    });
  }

  function OETool(intIdealLength, arrMessage, intInd) {
    let intIndex = intInd;
    let arrMessages = arrMessage;
    let x = 0;
    let intIL = intIdealLength;
    let stringInputed = $(".cTextArea").eq(intIndex).val().length;
    var intStep = 100 / arrMessages.length;
    if ((intIL > 0) && (stringInputed > 0)) {x = stringInputed / (intIL / 100);}
    if (x < 100) {$(".essay-progress-fill").eq(intIndex).width(x + "%");}
    else {$(".essay-progress-fill").eq(intIndex).width("100%");}
    if (rsParams.blnProgressBarText) {$(".progress-bar-messages").eq(intIndex).text(arrMessages[Math.floor(x / intStep)]);}
  }
};