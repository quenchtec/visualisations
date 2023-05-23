//Call function to display buttons. The functions should ideally be a JavaScript common file
//When called parameters rsQno, rsSubqIndex and an object containing the parameters set by the user, has been populated
//rsHotSpots(rsQno, rsSubqIndex, rsParams)

//Function for buttons
function rsHotSpots(rsQno, rsSubqIndex, rsParam) {
  //Check for WCAG, if the flag is set, we do not do anything as these buttons are not WCAG compliant at crrent
  if ($('#btnToggleWcag').val() == 1) {
    return false;
  }

  rsParam.minClicks = (typeof rsParam.minClicks === "undefined") ? false : rsParam.minClicks;
  rsParam.maxClicks = (typeof rsParam.maxClicks === "undefined") ? false : rsParam.maxClicks;
  rsParam.pointSize = (typeof rsParam.pointSize === "undefined") ? false : rsParam.pointSize;
  rsParam.spotColor = (typeof rsParam.spotColor === "undefined") ? false : rsParam.spotColor;
  rsParam.hasReset = (typeof rsParam.hasReset === "undefined") ? false : rsParam.hasReset;
  rsParam.resetText = (typeof rsParam.resetText === "undefined") ? false : rsParam.resetText;
  rsParam.hasExclusive = (typeof rsParam.hasExclusive === "undefined") ? false : rsParam.hasExclusive;
  rsParam.exclusiveText = (typeof rsParam.exclusiveText === "undefined") ? false : rsParam.exclusiveText;
  rsParam.imagePath = (typeof rsParam.imagePath === "undefined") ? false : rsParam.imagePath;
  rsParam.showTest = (typeof rsParam.showTest === "undefined") ? false : rsParam.showTest;


  /*DO NOT TOUCH THIS! - leave the below untouched unless you know what you are doing*/
  $('.cQuestionText').after('<img src="' + rsParam.imagePath + '" id="imageHolder">');
  $('#imageHolder').after('<center><canvas id="hotspotCanvas"></canvas><div id="HSOptions"><div id="Exclusive" onclick="exclusiveAns()">' + rsParam.exclusiveText + '</div><div id="hotspotReset" onclick="resetTheClicks()">' + rsParam.resetText + '</div></div></center>');
  var dataSelector = ".cTextArea";
  var imageUrl = $('#imageHolder').attr('src');
  var screenSize = ""; /*change this if the image width is larger than 800px, leave blank if smaller: var screenSize="";*/
  var removeHeader = false; //removes the page header 

  if (!rsParam.showTest) {
    $("textarea").hide();
    $('.rsRow ').hide()
  }
  var noneData = "0,0,0,0,0,0";
  if (screenSize > 0) $('#main#PAGENAME#').attr("style", "width :" + screenSize + "px !important");
  if (removeHeader) $('.headercustom').css("display", "none");
  var clickNumber = 1;
  var startTime = new Date();
  var timeStamp, percentageX, percentageY, data;
  var canvas = document.getElementById('hotspotCanvas');

  var Wwidth, Hheight;
  var img1 = new Image();
  img1.onload = function() {
    Wwidth = this.width;
    Hheight = this.height;
    canvas.width = Wwidth;
    canvas.height = Hheight;
    var ctx = canvas.getContext('2d');
    if (rsParam.hasReset) {
      $('#hotspotReset').css('display', 'inline-block');
    }
    if (rsParam.hasExclusive) {
      $('#Exclusive').css('display', 'inline-block');
    }
    $('#hotspotCanvas').css('background-image', "url('" + imageUrl + "')");
    $('#hotspotCanvas').css('background-size', "cover");
    addClickOption();
  }
  img1.src = imageUrl; // Remember to do this AFTER defining the load handler


  function addClickOption() {
    $(dataSelector).val("");
    $('#btnNext').hide();
    $('#hotspotCanvas').click(function(e) {
    console.log(clickNumber, rsParam.minClicks);
      if (clickNumber >= Number(rsParam.minClicks)) {
        $('#btnNext').show();
      } else {
        $('#btnNext').hide();
      }
      if (clickNumber <= rsParam.maxClicks) getPosition(e);
      else return false;
    });
  }

  function storeCoord(x, y) {
    $("#Exclusive").css("background-color", "#FFFFFF");
    percentageX = Math.round(x / Wwidth * 10000) / 100;
    percentageY = Math.round(y / Hheight * 10000) / 100;
    var endTime = new Date();
    timeStamp = endTime - startTime;
    data = clickNumber + ',' + percentageX + ',' + percentageY + ',' + timeStamp;
    if ($(dataSelector).val() == '' || $(dataSelector).val() == noneData) {
      $(dataSelector).val("|");
    }
    $(dataSelector).val($(dataSelector).val() + data + '|')
    clickNumber++;
  }

  function drawCoordinates(x, y) {
    ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(x, y, rsParam.pointSize, 0, Math.PI * 2, true);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = rsParam.spotColor;
    ctx.fill();
    ctx.stroke();
  }

  function getPosition(event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    storeCoord(x, y);
    drawCoordinates(x, y);
  }
  window.resetTheClicks = function() {
    $("#hotspotReset").css("background-color", rsParam.spotColor);
    $("#Exclusive").css("background-color", "#FFFFFF");
    $('#btnNext').hide();
    $(dataSelector).val("");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    clickNumber = 1;
    setTimeout(function() {
      $("#hotspotReset").css("background-color", "#FFFFFF");
    }, 300);
  }

  window.exclusiveAns = function() {
    $('#btnNext').show();
    $(dataSelector).val(noneData);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    clickNumber = 1;
    $("#Exclusive").css("background-color", rsParam.spotColor);
  }
}
