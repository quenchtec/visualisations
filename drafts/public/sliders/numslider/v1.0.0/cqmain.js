function rsNoUiSlider(rsQno, rsSubqIndex, rsParams) {
  const QuestionID = "#" + rsQno;
  $(QuestionID).find(".cTable").addClass("rsSliderQuestion").addClass("rsCQ");
  $(QuestionID).find(".cRowText").addClass("cRowTextSlider");
  $(QuestionID).find(".cCellF").addClass("cCellFSlider");
  $(QuestionID).find(".rsRow").addClass("rsRowSlider");
  if (/^(testlink|preview|review)\./.test(window.location.hostname)) console.log("add the rsCQ");

  //////////////////////////////////////////////////////
  //ALL SLIDER FUNCTIONALITY RELATED SETTINGS
  //rsParams.strHandlePosition = (typeof rsParams.strHandlePosition === "undefined") ? 0 : rsParams.strHandlePosition; //Where the handles starts on load (if offscale handle is needed, value must be less than the min value of the slider)
  //console.log(rsQno)
  rsParams.intSliderMinValue = (typeof rsParams.intSliderMinValue === "undefined") ? 1 : rsParams.intSliderMinValue; // The min value of the slider
  rsParams.intSliderMaxValue = (typeof rsParams.intSliderMaxValue === "undefined") ? 7 : rsParams.intSliderMaxValue; //The max value of the slider
  rsParams.intSliderMinRestriction = (typeof rsParams.intSliderMinRestriction === "undefined") ? rsParams.intSliderMinValue : rsParams.intSliderMinRestriction; //Points to the first available value for selection
  rsParams.intSliderMaxRestriction = (typeof rsParams.intSliderMaxRestriction === "undefined") ? rsParams.intSliderMaxValue : rsParams.intSliderMaxRestriction; // Maximum selectable value
  rsParams.intSliderSteps = (typeof rsParams.intSliderSteps === "undefined") ? 1 : rsParams.intSliderSteps; //How many points should the handle take on move
  rsParams.blnOffScaleHandle = (typeof rsParams.blnOffScaleHandle === "undefined") ? true : rsParams.blnOffScaleHandle; // When true, the handle will be just outside the slider
  rsParams.intSliderDecimals = (typeof rsParams.intSliderDecimals === "undefined") ? 0 : rsParams.intSliderDecimals; // Specifies Adding decimal point and digit
  rsParams.strSliderPips = (typeof rsParams.strSliderPips === "undefined") ? "" : rsParams.strSliderPips;
  rsParams.strSliderColumnLabels = (typeof rsParams.strSliderColumnLabels === "undefined") ? "" : rsParams.strSliderColumnLabels;
  rsParams.blnSliderColumnLabels = (typeof rsParams.blnSliderColumnLabels === "undefined") ? false : rsParams.blnSliderColumnLabels;
  rsParams.choicePips = (typeof rsParams.choicePips === "undefined") ? "steps" : rsParams.choicePips;

  //////////////////////////////////////////////////////
  //ALL PIPS (LABELS) RELATED SETTINGS
  rsParams.intSliderDens = (typeof rsParams.intSliderDens === "undefined") ? 1 : rsParams.intSliderDens; // Defines the density btween the values
  rsParams.blnClickablePips = (typeof rsParams.blnClickablePips === "undefined") ? true : rsParams.blnClickablePips;
  rsParams.blnHighlightPips = (typeof rsParams.blnHighlightPips === "undefined") ? false : rsParams.blnHighlightPips;
  rsParams.intSliderPipsDecimals = (typeof rsParams.intSliderPipsDecimals === "undefined") ? 0 : rsParams.intSliderPipsDecimals;
  rsParams.strSliderLabelsPrefeix = (typeof rsParams.strSliderLabelsPrefeix === "undefined") ? "" : rsParams.strSliderLabelsPrefeix;
  rsParams.blnSliderLabelsPrefeix = (typeof rsParams.blnSliderLabelsPrefeix === "undefined") ? false : rsParams.blnSliderLabelsPrefeix;
  rsParams.strSliderLabelsSuffix = (typeof rsParams.strSliderLabelsSuffix === "undefined") ? "" : rsParams.strSliderLabelsSuffix;
  rsParams.blnSliderLabelsSuffix = (typeof rsParams.blnSliderLabelsSuffix === "undefined") ? false : rsParams.blnSliderLabelsSuffix;
  rsParams.blnSliderLabelsVertical = (typeof rsParams.blnSliderLabelsVertical === "undefined") ? false : rsParams.blnSliderLabelsVertical;

  /////////////////////////////////////////////////
  //OPT OUT SETTINGS
  rsParams.intSliderOptOutValue = (typeof rsParams.intSliderOptOutValue === "undefined") ? -99999 : rsParams.intSliderOptOutValue;
  rsParams.blnOptOut = (typeof rsParams.blnOptOut === "undefined") ? true : rsParams.blnOptOut;
  rsParams.strOptOutText = (typeof rsParams.strOptOutText === "undefined") ? "Prefer not to answer" : rsParams.strOptOutText;
  rsParams.blnOptOutBigButton = (typeof rsParams.blnOptOutBigButton === "undefined") ? true : rsParams.blnOptOutBigButton;


  if (rsParams.strSliderColumnLabels.indexOf("#") != -1) rsParams.strSliderColumnLabels = $(".rsSliderQuestion").find(`${rsParams.strSliderColumnLabels}`).html();
  if (rsParams.strOptOutText.indexOf("#") != -1) rsParams.strOptOutText = $(".rsSliderQuestion").find(`${rsParams.strOptOutText}`).html();

  //Prevent ceating too big slider

  if (((Math.abs(rsParams.intSliderMaxValue - rsParams.intSliderMinValue) / rsParams.intSliderSteps) > 10000) && rsParams.choicePips == "steps") {
    alert("Slider with minimum point " + rsParams.intSliderMinValue + " and maximum point " + rsParams.intSliderMaxValue + " with steps of " + rsParams.intSliderSteps + " will create performance issues due to slider size of " + Math.abs(rsParams.intSliderMaxValue - rsParams.intSliderMinValue) / rsParams.intSliderSteps + "! \n\nConsider moving the slider type to 'values' or reduce your slider! \n\nSlider type changed to 'value' for this test.");
    rsParams.choicePips = "values";
  }

  let arrPips = rsParams.strSliderPips.split(",").map(Number);

  $(QuestionID).find(".cRowText").each(function(e) {
    $(this).append("<div id='slider" + e + "'></div>");
    if (rsParams.blnOptOut) {
        $(this).after("<div id='opt-out" + e + "' / class='aero-opt-out-button' title='SlideOptOut'>" + rsParams.strOptOutText + "</div>");
        var objReSetButton = document.getElementById('opt-out' + e);
    }
    let slider = document.getElementById('slider' + e);
    noUiSlider.create(slider, {
        //start: rsParams.strHandlePosition,
        start: (rsParams.intSliderMinValue),
        tooltips: [wNumb({
            decimals: rsParams.intSliderDecimals
        })],
        range: {
            //min: (rsParams.strHandlePosition + rsParams.intSliderMinValue),
            min: (rsParams.intSliderMinValue),
            max: rsParams.intSliderMaxValue
        },
        step: rsParams.intSliderSteps,
        pips: {
            mode: rsParams.choicePips,
            values: arrPips,
            density: rsParams.intSliderDens,
            format: wNumb({
                decimals: rsParams.intSliderLabelsDecimals,
                prefix: rsParams.strSliderLabelsPrefeix,
            })
        },
    });
    $(slider).find(".noUi-tooltip").addClass("initialTooltip");
    if (rsParams.blnOffScaleHandle) {
        $(slider).find(".noUi-handle").addClass("initialPositioner");
        //$(slider).find(".noUi-tooltip").addClass("initialTooltip");
    }
    $(slider).find(".noUi-handle").addClass("slider-handle-" + e);
    $(slider).find(".noUi-handle").attr("data", e);


    let activePips = [null];

    slider.noUiSlider.on('update', function(values, handle, event) {
        let tooltip = $('.noUi-tooltip')[e];
        $("#opt-out" + e).removeClass("opt-out-selected");
        $("#slider" + e).removeClass("bluring");

        if (event[0] < rsParams.intSliderMinValue) {
            tooltip.style.display = 'none';
        } else {
            tooltip.style.display = 'block';
        }
        SliderIsTouched(QuestionID, e, event[0]);

        if (rsParams.blnHighlightPips) {
            if (activePips[handle]) {
                activePips[handle].classList.remove('active-pip');
            }
            dataValue = Math.round(values[handle]);
            // Find the pip matching the value
            activePips[handle] = slider.querySelector('.noUi-value[data-value="' + dataValue + '"]');
            if (activePips[handle]) {
                activePips[handle].classList.remove('active-pip');
            }
            // Add the active class
            if (activePips[handle]) {
                activePips[handle].classList.add('active-pip');
            }
        }
    });

    slider.noUiSlider.on("change", function(values, handle) {
        $(".slider-handle-" + e).removeClass("initialPositioner");
        $("#slider" + e).removeClass("bluring");
        if (values[handle] < rsParams.intSliderMinValue) {
            slider.noUiSlider.set(rsParams.intSliderMinValue);
        } else if (values[handle] > rsParams.intSliderMaxRestriction) {
            slider.noUiSlider.set(rsParams.intSliderMaxRestriction);
        }
    });

    if (rsParams.blnClickablePips) {
        var pips = slider.querySelectorAll('.noUi-value');
        var pipr = slider.querySelectorAll('.noUi-marker');

        function clickOnPip() {
            //console.log($(this).parent().parent().prop("id"))
            var value = Number(this.getAttribute('data-value'));
            slider.noUiSlider.set(value);
        }
        for (var i = 0; i < pips.length; i++) {
            pips[i].style.cursor = 'pointer';
            pips[i].addEventListener('click', clickOnPip);
        }
        for (var i = 0; i < pipr.length; i++) {
            pipr[i].style.cursor = 'pointer';
            pipr[i].addEventListener('click', clickOnPip);
        }
    }

    if (rsParams.blnOptOut) {
        objReSetButton.addEventListener('click', function() {
            //slider.noUiSlider.set(rsParams.strHandlePosition);
            slider.noUiSlider.set(rsParams.intSliderMinValue);
            $(".slider-handle-" + e).addClass("initialPositioner");

            if ($(this).hasClass("opt-out-selected")) {
                $(this).removeClass("opt-out-selected");
                SliderIsTouched(QuestionID, e, "");
            } else {
                $(this).addClass("opt-out-selected");
                $("#slider" + e).addClass("bluring");
                $(".noUi-pips").find(".active-pip").removeClass("active-pip");
                $(slider).find(".noUi-tooltip").addClass("initialTooltip");
                //additional style if offsite handle is on
                if (rsParams.blnOffScaleHandle) {
                    $(slider).find(".noUi-handle").addClass("initialPositioner");
                }
                SliderIsTouched(QuestionID, e, rsParams.intSliderOptOutValue);
            }
        });

        if (rsParams.blnSliderLabelsVertical && rsParams.blnOptOut) {
            $(".noUi-value-horizontal").addClass("noUi-custom-value-vertical");
            $(".aero-opt-out-button").addClass("vertical-scale");
        } else if (rsParams.blnSliderLabelsVertical && !rsParams.blnOptOut) {
            $(".noUi-value-horizontal").addClass("noUi-custom-value-vertical");
        }
    }
    SliderIsTouched(QuestionID, e, "");
});

$(document).ready(function() {
    //remove the initial offslide handle class if there 
    OffsideHandleHandler();
    if (!rsParams.blnOffScaleHandle) {
        $(".noUi-handle").on("click touched keyup blur focus", function() {
            $(this).parent().parent().parent().find(".noUi-value").eq(0).addClass("active-pip");
            SliderIsTouched(QuestionID, $(this).attr('data'), rsParams.intSliderMinValue);
        });
    }
    $(".noUi-base").click(function() {
        let strIndex = $(this).parent().attr("id").toString().replace("slider", "");
        //console.log("this   ", strIndex)
        $(".slider-handle-" + strIndex).find(".noUi-tooltip").removeClass("initialTooltip");
    });

    if (!rsParams.blnSliderColumnLabels) {
        //$(".noUi-pips").addClass("no-pips-allowed");
    }
});


if (rsParams.blnSliderLabelsSuffix || rsParams.blnSliderColumnLabels) {
    if (rsParams.choicePips == "values") {
        addSuffix(rsParams.strSliderLabelsSuffix, rsParams.strSliderColumnLabels);
    } else {
        addSuffix(rsParams.strSliderLabelsSuffix, "");
    }
}
if (rsParams.blnOptOutBigButton) {
    $(".aero-opt-out-button").css("width", "90%");
}

function SliderIsTouched(objQuestion, intSliderIndex, numSliderValue) {
    let _objQuestion = objQuestion;
    let _intSliderIndex = Number(intSliderIndex);
    let _numSliderValue = numSliderValue;

    //We need to add this line as otherwise empty is interpreted as 0, when creating the slider and sets 0 az initial value
    if (numSliderValue === "") {
        $(_objQuestion).find(".cFInput:input").eq(_intSliderIndex).val("");
    } else if (_numSliderValue >= rsParams.intSliderMinValue) {
        if (rsParams.intSliderDecimals) {
            $(_objQuestion).find(".cFInput:input").eq(_intSliderIndex).val(_numSliderValue.toFixed(rsParams.intSliderDecimals));
        } else {
            $(_objQuestion).find(".cFInput:input").eq(_intSliderIndex).val(Math.round(_numSliderValue).toFixed(rsParams.intSliderDecimals));
        }
    } else if (numSliderValue == rsParams.intSliderOptOutValue) { //Set value if OptOut is selected
        $(_objQuestion).find(".cFInput:input").eq(_intSliderIndex).val(Math.round(rsParams.intSliderOptOutValue).toFixed(rsParams.intSliderDecimals));
    } else {
        $(_objQuestion).find(".cFInput:input").eq(_intSliderIndex).val("");
    }
}

function makeArray(intMxValue, intMnValue, intStps) {
    let result = [];
    for (var i = intMnValue - 1; i <= intMxValue; i = i + intStps) {
        result.push(i);
    }
    return result;
}

function OffsideHandleHandler() {
    $(".noUi-pips").find(".active-pip").removeClass("active-pip");
    $(".noUi-handle").on("click touchstart keyup blur focus", function() {
        if ($(this).hasClass("initialPositioner")) {
            if (rsParams.blnHighlightPips) {
                $(this).parent().parent().parent().find(".noUi-value").eq(0).addClass("active-pip");
            }
            SliderIsTouched(QuestionID, $(this).attr('data'), rsParams.intSliderMinValue);
        }
        $(this).removeClass("initialPositioner");
        $(this).children(".initialTooltip").removeClass("initialTooltip");
        if ($("#opt-out" + (Number($(this).attr('data'))).toString()).hasClass("opt-out-selected")) {
            $("#opt-out" + (Number($(this).attr('data'))).toString()).removeClass("opt-out-selected");
            $("#slider" + (Number($(this).attr('data'))).toString()).removeClass("bluring");
        }
    });
    $(".noUi-pips").children().on("click touchstart keyup blur focus load", function() {
        if ($(this).hasClass("initialPositioner")) {
            if (rsParams.blnHighlightPips) {
                $(this).parent().find(".noUi-value").eq(0).addClass("active-pip");
            }
        }
        $(this).removeClass("initialPositioner");
        $(this).children(".initialTooltip").removeClass("initialTooltip");
        $(this).parent().parent().find(".initialPositioner").removeClass("initialPositioner");
        $(this).parent().parent().find(".initialTooltip").removeClass("initialTooltip");
    });
  }

  function addSuffix(theSufix, strColLabels) {
      let _strColLabels = strColLabels.split("|");
      let _suffix = theSufix;
      let intCountPips = 0;
      if (strColLabels.length) {
          $(".noUi-value-large").each(function(e) {
              if (intCountPips == _strColLabels.length) {
                  intCountPips = 0;
              }
              if (_strColLabels.length < 1) {
                  //let currentText = $(this).text();
                  //$(this).text(currentText + _suffix);
                  let currentText = $(this).html();
                  $(this).html(currentText + _suffix);
              } else {
                  //$(this).text(_strColLabels[intCountPips]);
                  $(this).html(_strColLabels[intCountPips]);
                  $(this).addClass("multi-text-scale");
                  if (!rsParams.blnSliderColumnLabels) {
                      $(".aero-opt-out-button").css("margin-top", "1rem");
                  } else {
                      $(".aero-opt-out-button").css("margin-top", "5rem");
                  }
              }
              intCountPips++;
          });
      } else {
          $(QuestionID).find(".noUi-value-horizontal").each(function() {
              //$(this).text($(this).text() + _suffix);
              $(this).html($(this).html() + _suffix);
          });
      }
  }
}
