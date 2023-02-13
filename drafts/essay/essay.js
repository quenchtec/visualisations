
var rsEssay = (function () {
	rsParams.blnShowProgress = (typeof rsParams.blnShowProgress === "undefined") ? true : rsParams.blnShowProgress;


  if(rsParams.blnShowProgress){

	  rsParams.blnProgressBarText = (typeof rsParams.blnProgressBarText === "undefined") ? true : rsParams.blnProgressBarText;
	  rsParams.intIdealLength = (typeof rsParams.intIdealLength === "undefined") ? 200 : rsParams.intIdealLength;
	  rsParams.strProgressText = (typeof rsParams.strProgressText === "undefined") ? "" : rsParams.strProgressText;

    let intBoxWidth = $('.cTextArea')[0].clientWidth;
    let arrMessage = rsParams.strProgressText.split("|");
    $(".cTextArea ").after("<div class='essay-progress-bar' style='width: " + intBoxWidth + "px;'><span class='progress-bar-messages'></span><div class='essay-progress-fill'></div></div>");
    $(".cTextArea ").keyup(function() {OETool(rsParams.intIdealLength, arrMessage);});
  }
function OETool(intIdealLength, arrMessage) {
  let arrMessages = arrMessage;
  let x = 0;
  let intIL = intIdealLength;
  let stringInputed = $(".cTextArea").val().length;
  var intStep = 100 / arrMessages.length;
  if ((intIL > 0) && (stringInputed > 0)) {x = stringInputed / (intIL / 100);}
  if (x < 100) {$(".essay-progress-fill").width(x + "%");}
  else {$(".essay-progress-fill").width("100%");}
  if(rsParams.blnProgressBarText){$(".progress-bar-messages").text(arrMessages[Math.floor(x / intStep)]);}
}
})();