function rsVisIRT2(rsQno, rsSubqIndex, rsParams) {
  //all variables for advanced options are defined here
  rsParams.blnDecresingTimer = (typeof rsParams.blnDecresingTimer === "undefined") ? true : rsParams.blnDecresingTimer;
  rsParams.blnShowCooldown = (typeof rsParams.blnShowCooldown === "undefined") ? true : rsParams.blnShowCooldown;
  rsParams.blnShowQuestionText = (typeof rsParams.blnShowQuestionText === "undefined") ? false : rsParams.blnShowQuestionText;
  rsParams.blnShowCardInAdvance = (typeof rsParams.blnShowCardInAdvance === "undefined") ? false : rsParams.blnShowCardInAdvance;
  rsParams.blnCustomDefaultValue = (typeof rsParams.blnCustomDefaultValue === "undefined") ? true : rsParams.blnCustomDefaultValue;
  rsParams.blnShowButtonsOnCountDown = (typeof rsParams.blnShowButtonsOnCountDown === "undefined") ? true : rsParams.blnShowButtonsOnCountDown;

  rsParams.intMaxMinTriggerTime = (typeof rsParams.intMaxMinTriggerTime === "undefined") ? 15 : rsParams.intMaxMinTriggerTime;
  rsParams.intShowCardInAdvanceSeconds = (rsParams.blnShowCardInAdvance) ? rsParams.intShowCardInAdvanceSeconds : 0;
  rsParams.intCustomDefaultValue = (typeof rsParams.intCustomDefaultValue === "undefined") ? -1 : rsParams.intCustomDefaultValue;
  rsParams.intCooldownBetweenStatements = (typeof rsParams.intCooldownBetweenStatements === "undefined") ? 5 : rsParams.intCooldownBetweenStatements;
  rsParams.strStartButton = (typeof rsParams.strStartButton === "undefined") ? "Press to start" : rsParams.strStartButton;
  rsParams.strDialogTitle = (typeof rsParams.strDialogTitle === "undefined") ? "Great job, but..." : rsParams.strDialogTitle;
  rsParams.strDialogMessage = (typeof rsParams.strDialogMessage === "undefined") ? "You need to be faster for the next one!" : rsParams.strDialogMessage;
  console.log(rsParams.intCooldownBetweenStatements)

  var blnExcerStarted = false;
  var intCounting = 0;
  //For now, these are static, but if people want them changed in future, we will allow it
  var arrLRButtons = [90, 77, 32]; //Z, M, Space
  var arrAllPageInputs = new Array();
  var objAllRows = $(".rsRow ");
  fnGetAllInputs(objAllRows);
  rsParams.intCooldownBetweenStatements = (rsParams.blnShowCardInAdvance) ? (rsParams.intShowCardInAdvanceSeconds + rsParams.intCooldownBetweenStatements) : rsParams.intCooldownBetweenStatements;
  //Here is the HTML creator for the BUTTONS and the CARD
  var theHTML = "<table id='IQTcontainer'><tbody class='IQTtable'><tr style='display: table-row;' class='hideStart'><td colspan='2'><div id='theCard' class='theCard hideStart'>" + arrAllPageInputs[intCounting].strText + "</div></td></tr><tr class='cardscontainer hideStart'><td class='npButtons' id='iqtPositive'><div class='iqtButton iqtPositive'>" + arrAllPageInputs[intCounting].firstRating + "<div class='subSelectors'>(Z)</div></div></td><td class='npButtons' id='iqtNegative'><div class='iqtButton iqtNegative'>" + arrAllPageInputs[intCounting].secondRating + "<div class='subSelectors'>(M)</div></div></td></tr><tr class='cardscontainer hideStart'><td class='iqtNeither' id='iqtNeither' colspan='2'><div class='iqtButton optingOut'>" + arrAllPageInputs[intCounting].optOut + "<div class='subSelectors'>(SPACEBAR)</div></div></td></tr><tr><td class='beginButton' colspan='2'><div class='iqtButton start'>" + rsParams.strStartButton + "</div></td></tr></tbody></table><input type='text' value='0' class='cTimerTotal' />";
  //Here is the html for the dialog which pops up on delay
  var promptHTML = "<div id='dialog' style='display:none;' title='" + rsParams.strDialogTitle + "'>" + rsParams.strDialogMessage + "</div>";
  var countdownHTML = "<div id='countdown'>" + rsParams.intCooldownBetweenStatements + "</div>";
  var blnCanHitButtons = false;
  var intTimeCounter = rsParams.intMaxMinTriggerTime;
  var theInterval;
  $(".cTDContainQues").append(countdownHTML, promptHTML, theHTML);
  $(".cTimerTotal").val(0);

  function startTimer() {
    if (rsParams.blnDecresingTimer) {
      intTimeCounter = intTimeCounter * 100;
    } else {
      intTimeCounter = 0;
    }
    theInterval = setInterval(function() {
      if (rsParams.blnDecresingTimer) {
        intTimeCounter--;
      } else {
        intTimeCounter++;
      }
      $(".cTimerTotal").val(intTimeCounter / 100);
      if (intTimeCounter === 0 || intTimeCounter === (rsParams.intMaxMinTriggerTime * 100)) {
        clearInterval(theInterval);

        //This is the dialog on timeout
        $("#dialog").dialog({
          closeOnEscape: false,
          classes: {
            "ui-dialog-titlebar-close": "no-close"
          },
          modal: true,
          buttons: {
            "OK": function() {
              $(this).dialog("close");
              buttonCheck(arrAllPageInputs[0].timeOutPositions, rsParams.blnCustomDefaultValue);
            }
          },
          open: function() {
            // Block hitting the buttons once opened
            blnCanHitButtons = false;
          },
          close: function() {
            // Allow for hitting the buttons once closed
            blnCanHitButtons = true;
          }
        });
      }
    }, 10);
  }

  //Reseting the timmer to 5 seconds and starting the countdown again
  function restartTimer() {
    intTimeCounter = rsParams.intMaxMinTriggerTime;
    $(".hideStart").css("visibility", "visible");
    clearInterval(theInterval);
    startTimer();
  }

  //Lets start it all by clicking on the start button
  $(".start").click(function() {
    $(this).hide();
    //Hide question text if we don't want it visible
    if (!rsParams.blnShowQuestionText) {
      $(".cQuestionText").hide();
    }

    //If we want the card to be show before the answers
    if (rsParams.blnShowCardInAdvance) {
      $("#countdown").css("visibility", "visible");
      $("#countdown").show();
      cooldownCountdown();
      $(".theCard").show("highlight");
      $(".theCard").css("visibility", "visible");
      $(".theCard").parent().css("visibility", "visible");
      $(".theCard").parent().parent().css("visibility", "visible");
    } else {
      $("#countdown").show();
      cooldownCountdown();
    }


    //Show the buttons during the countdown between statements
    if (rsParams.blnShowButtonsOnCountDown) {
      $(".cardscontainer").removeClass("hideStart");
      $(".theParent").addClass("disable-select");
    }

    setTimeout(function() {
      if (rsParams.blnShowCardInAdvance) {
        startTimer();
        $("#countdown").css("visibility", "collapse");
        $("#IQTcontainer").show();
        $(".hideStart").css("visibility", "visible");
        blnExcerStarted = true;
        blnCanHitButtons = true;
      } else {
        startTimer();
        $("#IQTcontainer").show();
        $(".hideStart").css("visibility", "visible");
        blnExcerStarted = true;
        blnCanHitButtons = true;
      }
    }, rsParams.intCooldownBetweenStatements * 1000);
  });

  //All events based on the keys
  $(document).keydown(function(event) {
    //Left buttom Z and right button M, neither button SPACE
    if ((event.keyCode == arrLRButtons[0] || event.keyCode == arrLRButtons[1] || event.keyCode == arrLRButtons[2]) && blnExcerStarted && blnCanHitButtons) {
      if (event.keyCode == arrLRButtons[0]) {
        $('.iqtPositive').click();
      } else if (event.keyCode == arrLRButtons[1]) {
        $('.iqtNegative').click();
      } else if (event.keyCode == arrLRButtons[2]) {
        $('.iqtNeither').click();
      }
    } else {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  $(".iqtPositive, .iqtNegative, .iqtNeither").click(function(event) {
    // If blnCanHitButtons has not been reset to true, keep blocking key hit. It will allow us, once the countdown is off the table
    if (!blnCanHitButtons) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      $("#countdown").html(rsParams.intCooldownBetweenStatements);
      if ($(this).hasClass('iqtPositive')) {
        buttonCheck(0);
      } else if ($(this).hasClass('iqtNegative')) {
        buttonCheck(1);
      } else if ($(this).hasClass('iqtNeither')) {
        buttonCheck(2);
      }
    }
  });

  function buttonCheck(intBtn, blnTimeOutVal) {
    let _blnTimeOutVal = blnTimeOutVal;
    let _intBtn = intBtn;

    arrAllPageInputs[intCounting].radioInputs[_intBtn].checked = true;
    if (_blnTimeOutVal) {
      arrAllPageInputs[intCounting].floatInput.val(rsParams.intCustomDefaultValue);
    } else {
      arrAllPageInputs[intCounting].floatInput.val($(".cTimerTotal").val());
    }
    changeCard();
  }
//We store all page inputs here
  function fnGetAllInputs(vals) {
    let _vals = vals
    let allHeathers = $(".cTable").find("th.cCellHeader p");
    let optOutText = (allHeathers.length == 3) ? "None" : allHeathers[2].innerHTML;
    let showOptOut = (allHeathers.length == 3) ? "hidden" : "collapse";

    $(_vals).each(function() {
      let questionInputs = {
        strAllClasses: this.className,
        strText: $(this).find(".rs-ht").html(),
        floatInput: $(this).find(":input.cFInput"),
        radioInputs: $(this).find(":input.cRadio"),
        firstRating: allHeathers[0].innerHTML,
        secondRating: allHeathers[1].innerHTML,
        optOut: optOutText,
        timeOut: allHeathers[allHeathers.length - 1].innerHTML,
        timeOutPositions: allHeathers.length - 1,
        showOptOut: showOptOut
      }
      arrAllPageInputs.push(questionInputs);
    });
  }
//In this function we Show/Hide the card in order to change it once it has been answered or timed out
//We mainly handle css in it
  function changeCard() {
    if (intCounting + 1 < arrAllPageInputs.length) {
      //showing the proper text
      $(".theCard").html(arrAllPageInputs[intCounting + 1].strText);
      //If we want the card to be shown in advance so that the person have enough time to read it
      if (rsParams.blnShowCardInAdvance) {
        $(".theCard").toggle("highlight");
        $(".theCard").show("highlight");
      } else {
        setTimeout(function() {
          //showing the card and hiding the timer
          $(".theCard").show("highlight");
          $("#countdown").css("visibility", "collapse");
        }, rsParams.intCooldownBetweenStatements * 1000);
      }
      if (intCounting < (arrAllPageInputs.length - 1)) {
        stopTimer();
        //block all buttons or clicks since the statement is now not visible and the new one is still not allowed for answer
        blnCanHitButtons = false;
        $(".hideStart").css("visibility", "hidden");
        if (rsParams.blnShowCooldown) {
          $("#countdown").show();
          $("#countdown").css("visibility", "visible");
          cooldownCountdown();
        }
        setTimeout(function() {
          $("#countdown").css("visibility", "collapse");
          restartTimer();
          blnCanHitButtons = true;
        }, (rsParams.intCooldownBetweenStatements) * 1000);
      }
    } else {
      blnCanHitButtons = false;
      stopTimer();
      submitForm();
    }
    intCounting++;
  }
//once all is done, submit the page
  function submitForm() {
    $("#btnNext").click();
  }
//this is the function which stops the timer and clears it
  function stopTimer() {
    clearInterval(theInterval);
  }
//This is the cooldown function for the timer between the statements
  function cooldownCountdown() {
    $("#countdown").html(rsParams.intCooldownBetweenStatements);
    let timeLeft = rsParams.intCooldownBetweenStatements;
    setTimeout(function tick() {
      if (timeLeft <= 1) {
        $("#countdown").css("visibility", "collapse");
      } else {
        timeLeft--;
        $("#countdown").html(timeLeft);
        setTimeout(tick, 1000);
      }
    }, 1000);
  }
};
