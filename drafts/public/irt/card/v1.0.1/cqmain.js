function rsVisIRTtest(rsQno, rsSubqIndex, rsParams) {
    //Check for WCAG
    if ($('#btnToggleWcag').val() == 1) {
        return false;
    }
    const QuestionID = "#" + rsQno; //This we use in selectors to stay within the question
    $(QuestionID).find('.cTable').addClass("rsCQ").addClass("rsIRT");
    $(QuestionID).find('.cTable').append("<div id='newHtml'>-</div>");

    //all variables for advanced options are defined here
    var {
        blnDecresingTimer = true,
            blnShowCooldown = true,
            blnShowQuestionText = false,
            blnShowCardInAdvance = false,
            blnCustomDefaultValue = true,
            blnShowButtonsOnCountDown = true,
            blnStopMouse = true,
            intMaxMinTriggerTime = 15,
            intCustomDefaultValue = -1,
            intCooldownBetweenStatements = 5,
            strStartButton = "Press to start",
            strDialogTitle = "Great job, but...",
            strDialogMessage = "You need to be faster for the next one!",
            intShowCardInAdvanceSeconds = 0
    } = rsParams || {};
    var isMobile = (/Mobi/i.test(navigator.userAgent));
    if (isMobile) blnStopMouse = false;

    intShowCardInAdvanceSeconds = blnShowCardInAdvance ? intShowCardInAdvanceSeconds : 0;
    strStartButton = ($("#supp1").length > 0) ? $("#supp1").html() : strStartButton;
    strDialogTitle = ($("#supp2").length > 0) ? $("#supp2 p").text() : strDialogTitle;
    strDialogMessage = ($("#supp3").length > 0) ? $("#supp3").html() : strDialogMessage;

    function preventDefault(event) {
        event.preventDefault();
    }

    function preventMouse(event) {
        event.stopPropagation();
        preventDefault(event);
    }

    if (blnStopMouse) {
        document.addEventListener('click', preventMouse);
        document.addEventListener('contextmenu', preventMouse); // Prevent RMB menu
    }


    var blnExcerStarted = false;
    var allowedToProceed = true;
    var intCounting = 0;
    //For now, these are static, but if people want them changed in future, we will allow it
    var arrLRButtons = [90, 77, 32]; //Z, M, Space
    var arrAllPageInputs = new Array();
    var objAllRows = $(".rsRow");
    fnGetAllInputs(objAllRows);
    intCooldownBetweenStatements = (blnShowCardInAdvance) ? (intShowCardInAdvanceSeconds + intCooldownBetweenStatements) : intCooldownBetweenStatements;
    //Here is the HTML creator for the BUTTONS and the CARD
    var theHTML = "<table id='IQTcontainer'><tbody class='IQTtable'><tr style='display: table-row;' class='hideStart'><td colspan='2'><div id='theCard' class='theCard hideStart'>" + arrAllPageInputs[intCounting].strText + "</div></td></tr><tr class='cardscontainer hideStart'><td class='npButtons' id='iqtPositive'><div class='iqtButton iqtPositive'>" + arrAllPageInputs[intCounting].firstRating + "<div class='subSelectors'>(Z)</div></div></td><td class='npButtons' id='iqtNegative'><div class='iqtButton iqtNegative'>" + arrAllPageInputs[intCounting].secondRating + "<div class='subSelectors'>(M)</div></div></td></tr><tr class='cardscontainer hideStart'><td class='iqtNeither' id='iqtNeither' colspan='2'><div class='iqtButton optingOut'>" + arrAllPageInputs[intCounting].optOut + "<div class='subSelectors'>(SPACEBAR)</div></div></td></tr><tr><td class='beginButton' colspan='2'><div class='iqtButton start'>" + strStartButton + "</div></td></tr></tbody></table><input type='text' value='0' class='cTimerTotal' />";
    //Here is the html for the dialog which pops up on delay
    var promptHTML = "<div id='dialog' style='display:none;' title='" + strDialogTitle + "'>" + strDialogMessage + "</div>";
    var countdownHTML = "<div id='countdown'>" + intCooldownBetweenStatements + "</div>";
    var blnCanHitButtons = false;
    var intTimeCounter = intMaxMinTriggerTime;
    var theInterval;
    //$(".cTDContainQues").append(countdownHTML, promptHTML, theHTML);
    var combinedHTML = countdownHTML + promptHTML + theHTML;
    $(QuestionID).find('#newHtml').html(combinedHTML);

    $(".cTimerTotal").val(0);

    if (blnStopMouse) allowedToProceed = false;

    function startTimer() {
        if (blnDecresingTimer) {
            intTimeCounter = intTimeCounter * 100;
        } else {
            intTimeCounter = 0;
        }
        theInterval = setInterval(function() {
            if (blnDecresingTimer) {
                intTimeCounter--;
            } else {
                intTimeCounter++;
            }
            $(".cTimerTotal").val(intTimeCounter / 100);
            if (intTimeCounter === 0 || intTimeCounter === (intMaxMinTriggerTime * 100)) {
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
                            buttonCheck(arrAllPageInputs[0].timeOutPositions, blnCustomDefaultValue);
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
        intTimeCounter = intMaxMinTriggerTime;
        $(".hideStart").css("visibility", "visible");
        clearInterval(theInterval);
        startTimer();
    }

    //Lets start it all by clicking on the start button
    $(".start").click(function() {
        $(this).hide();
        if (blnStopMouse) {
            console.log(blnStopMouse);
            $("#newHtml *").addClass("forbidden");
            $(".contentContainer").addClass("hiddenC");
        }

        //Hide question text if we don't want it visible
        if (!blnShowQuestionText) {
            $(".cQuestionText").hide();
        }

        //If we want the card to be show before the answers
        if (blnShowCardInAdvance) {
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
        if (blnShowButtonsOnCountDown) {
            $(".cardscontainer").removeClass("hideStart");
            $(".theParent").addClass("disable-select");
        }


        setTimeout(function() {
            if (blnShowCardInAdvance) {
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
        }, intCooldownBetweenStatements * 1000);
    });

    //All events based on the keys
    $(document).keydown(function(event) {
        //Left buttom Z and right button M, neither button SPACE
        if ((event.keyCode == arrLRButtons[0] || event.keyCode == arrLRButtons[1] || event.keyCode == arrLRButtons[2]) && blnExcerStarted && blnCanHitButtons) {
            if (event.keyCode == arrLRButtons[0]) {
                allowedToProceed = true;
                $('.iqtPositive').click();
            } else if (event.keyCode == arrLRButtons[1]) {
                allowedToProceed = true;
                $('.iqtNegative').click();
            } else if (event.keyCode == arrLRButtons[2]) {
                allowedToProceed = true;
                $('.iqtNeither').click();
            }
        } else {
            event.preventDefault();
            event.stopPropagation();
        }
    });

    $(".iqtPositive, .iqtNegative, .iqtNeither").click(function(event) {

        // If blnCanHitButtons has not been reset to true, keep blocking key hit. It will allow us, once the countdown is off the table
        if (!blnCanHitButtons || !allowedToProceed) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            $("#countdown").html(intCooldownBetweenStatements);
            if ($(this).hasClass('iqtPositive')) {
                buttonCheck(0);
            } else if ($(this).hasClass('iqtNegative')) {
                buttonCheck(1);
            } else if ($(this).hasClass('iqtNeither')) {
                buttonCheck(2);
            }
            if (!isMobile) allowedToProceed = false;
        }
    });

    function buttonCheck(intBtn, blnTimeOutVal) {
        let _blnTimeOutVal = blnTimeOutVal;
        let _intBtn = intBtn;

        arrAllPageInputs[intCounting].radioInputs[_intBtn].checked = true;
        if (_blnTimeOutVal) {
            arrAllPageInputs[intCounting].floatInput.val(intCustomDefaultValue);
        } else {
            arrAllPageInputs[intCounting].floatInput.val($(".cTimerTotal").val());
        }
        changeCard();
    }

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

    function changeCard() {
        if (intCounting + 1 < arrAllPageInputs.length) {
            $(".theCard").html(arrAllPageInputs[intCounting + 1].strText);
            if (blnShowCardInAdvance) {
                $(".theCard").toggle("highlight");
                $(".theCard").show("highlight");
            } else {
                setTimeout(function() {
                    $(".theCard").show("highlight");
                    $("#countdown").css("visibility", "collapse");
                }, intCooldownBetweenStatements * 1000);
            }
            if (intCounting < (arrAllPageInputs.length - 1)) {
                stopTimer();
                blnCanHitButtons = false;
                $(".hideStart").css("visibility", "hidden");
                if (blnShowCooldown) {
                    $("#countdown").show();
                    $("#countdown").css("visibility", "visible");
                    cooldownCountdown();
                }
                setTimeout(function() {
                    $("#countdown").css("visibility", "collapse");
                    restartTimer();
                    blnCanHitButtons = true;
                }, (intCooldownBetweenStatements) * 1000);
            }
        } else {
            blnCanHitButtons = false;
            stopTimer();
            submitForm();
        }
        intCounting++;
    }

    function submitForm() {
        $("#btnNext").click();
    }

    function stopTimer() {
        clearInterval(theInterval);
    }

    function cooldownCountdown() {
        $("#countdown").html(intCooldownBetweenStatements);
        let timeLeft = intCooldownBetweenStatements;
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