//rsNoUiGridSlider(rsQno, rsSubqIndex, rsParams)


function rsNoUiGridSlider(rsQno, rsSubqIndex, rsParams) {
  const QuestionID = "#" + rsQno;
  let SubQIndex = rsSubqIndex; //This we use in selectors to stay within the question
  let intlengthFix = (typeof rsParams.blnOptOut === "undefined" || !rsParams.blnOptOut) ? 0 : 1;
  let strAllHeaders = "";
  let strAllHeadersPositions = "";
  let intMin = 1;
  let intMax = ($(".cCellHeader").length - 1) - intlengthFix;
    $(QuestionID).find(".cTable").eq([SubQIndex]).addClass("rsRatingSlider").addClass("rsCQ");

  $(".cCellHeader").each(function(e) {
    if (e && (e <= intMax)) {
      strAllHeadersPositions = strAllHeadersPositions + (e).toString() + " ";
    }
    if (e && (e < intMax)) {
      strAllHeaders = strAllHeaders + $(this).find(".rs-ht").text() + "|";
    } else {
      strAllHeaders = strAllHeaders + $(this).find(".rs-ht").text();
    }
  });

  if (intlengthFix) {
    strAllHeaders = strAllHeaders.slice(0, -1);
  }

  //////////////////////////////////////////////////////
  //ALL SLIDER RELATED SETTINGS
  rsParams.intSliderMinValue = (typeof rsParams.intSliderMinValue === "undefined") ? intMin : rsParams.intSliderMinValue; // The min value of the slider
  rsParams.intSliderMaxValue = (typeof rsParams.intSliderMaxValue === "undefined") ? intMax : rsParams.intSliderMaxValue; //The max value of the slider
  rsParams.intSliderMinRestriction = (typeof rsParams.intSliderMinRestriction === "undefined") ? rsParams.intSliderMinValue : rsParams.intSliderMinRestriction; //Points to the first available value for selection
  rsParams.intSliderMaxRestriction = (typeof rsParams.intSliderMaxRestriction === "undefined") ? rsParams.intSliderMaxValue : rsParams.intSliderMaxRestriction; // Maximum selectable value
  rsParams.intSliderSteps = (typeof rsParams.intSliderSteps === "undefined") ? 1 : rsParams.intSliderSteps; //How many points should the handle take on move
  rsParams.blnOffScaleHandle = (typeof rsParams.blnOffScaleHandle === "undefined") ? true : rsParams.blnOffScaleHandle; // When true, the handle will be just outside the slider
  rsParams.intSliderDecimals = (typeof rsParams.intSliderDecimals === "undefined") ? 0 : rsParams.intSliderDecimals; // Specifies Adding decimal point and digit
  rsParams.blnSliderColumnLabels = (typeof rsParams.blnSliderColumnLabels === "undefined") ? true : rsParams.blnSliderColumnLabels;
  rsParams.strSliderPips = (typeof rsParams.strSliderPips === "undefined") ? $.trim(strAllHeadersPositions).replaceAll(" ", ",") : rsParams.strSliderPips;
  rsParams.strSliderColumnLabels = (typeof rsParams.strSliderColumnLabels === "undefined") ? strAllHeaders : rsParams.strSliderColumnLabels;
  rsParams.choicePips = (typeof rsParams.choicePips === "undefined") ? "values" : rsParams.choicePips;

  rsParams.blnTooltip = (typeof rsParams.blnTooltip === "undefined") ? true : rsParams.blnTooltip;
  rsParams.blnColumnToTooltip = (typeof rsParams.blnColumnToTooltip === "undefined") ? false : rsParams.blnColumnToTooltip;


  //////////////////////////////////////////////////////
  //ALL PIPS (LABELS) RELATED SETTINGS
  rsParams.intSliderDens = (typeof rsParams.intSliderDens === "undefined") ? 1000 : rsParams.intSliderDens; // Defines the density btween the values
  rsParams.blnClickablePips = (typeof rsParams.blnClickablePips === "undefined") ? true : rsParams.blnClickablePips;
  rsParams.blnHighlightPips = (typeof rsParams.blnHighlightPips === "undefined") ? true : rsParams.blnHighlightPips;
  rsParams.intSliderPipsDecimals = (typeof rsParams.intSliderPipsDecimals === "undefined") ? 0 : rsParams.intSliderPipsDecimals;
  rsParams.strSliderLabelsPrefeix = (typeof rsParams.strSliderLabelsPrefeix === "undefined") ? "1" : rsParams.strSliderLabelsPrefeix;
  rsParams.blnSliderLabelsPrefeix = (typeof rsParams.blnSliderLabelsPrefeix === "undefined") ? true : rsParams.blnSliderLabelsPrefeix;
  rsParams.strSliderLabelsSuffix = (typeof rsParams.strSliderLabelsSuffix === "undefined") ? "a" : rsParams.strSliderLabelsSuffix;
  rsParams.blnSliderLabelsSuffix = (typeof rsParams.blnSliderLabelsSuffix === "undefined") ? true : rsParams.blnSliderLabelsSuffix;
  rsParams.blnSliderLabelsVertical = (typeof rsParams.blnSliderLabelsVertical === "undefined") ? false : rsParams.blnSliderLabelsVertical;

  /////////////////////////////////////////////////
  //OPT OUT SETTINGS
  rsParams.blnOptOut = (typeof rsParams.blnOptOut === "undefined") ? false : rsParams.blnOptOut;
  rsParams.intSliderOptOutValue = (typeof rsParams.intSliderOptOutValue === "undefined") ? intMax : rsParams.intSliderOptOutValue;
  rsParams.strOptOutText = (typeof rsParams.strOptOutText === "undefined") ? "Prefer not to answer" : rsParams.strOptOutText;
  rsParams.blnOptOutBigButton = (typeof rsParams.blnOptOutBigButton === "undefined") ? true : rsParams.blnOptOutBigButton;

  let arrPips = rsParams.strSliderPips.split(",").map(Number);

  //console.log(rsParams.blnClickablePips)

  $(".cRowText").each(function(e) {
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
      //Here?
      //console.log(tooltip);
      if (rsParams.blnColumnToTooltip) {
        $(".noUi-tooltip").eq(tooltip).html(strAllHeaders.split("|")[Number(values) - 1]);
      }
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

      if (rsParams.blnColumnToTooltip) {
        $(".noUi-tooltip").eq(e).html(strAllHeaders.split("|")[Number(values) - 1]);
      }
      if (values[handle] < rsParams.intSliderMinValue) {
        slider.noUiSlider.set(rsParams.intSliderMinValue);
      } else if (values[handle] > rsParams.intSliderMaxRestriction) {
        slider.noUiSlider.set(rsParams.intSliderMaxRestriction);
      }
    });

    if (rsParams.blnClickablePips) {
      let pips = slider.querySelectorAll('.noUi-value');

      function clickOnPip() {
        let value = Number(this.getAttribute('data-value'));
        slider.noUiSlider.set(value);
      }
      for (let i = 0; i < pips.length; i++) {
        //console.log("clicked me")
        pips[i].style.cursor = 'pointer';
        pips[i].addEventListener('click', clickOnPip);
      }
    }

    if (rsParams.blnOptOut) {
      objReSetButton.addEventListener('click', function() {
        //Set where should the slider go click

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
          if (rsParams.blnOffScaleHandle) {
            $(slider).find(".noUi-handle").addClass("initialPositioner");
          }
          SliderIsTouched(QuestionID, e, intMax + 1);
        }
      });
      //what happens if they want vertical labels? All the style is here 
      if (rsParams.blnSliderLabelsVertical && rsParams.blnOptOut) {
        $(".noUi-value-horizontal").addClass("noUi-custom-value-vertical");
        $(".aero-opt-out-button").addClass("vertical-scale");
      } else if (rsParams.blnSliderLabelsVertical && !rsParams.blnOptOut) {
        $(".noUi-value-horizontal").addClass("noUi-custom-value-vertical");
      }
    }
    SliderIsTouched(QuestionID, e, "");
    if (!rsParams.blnTooltip) {
      $(".noUi-tooltip").addClass("hideTooltip")
    }
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
    }
  }
  if (rsParams.blnOptOutBigButton) {
    $(".aero-opt-out-button").css("width", "90%");
  }

  function SliderIsTouched(objQuestion, intSliderIndex, numSliderValue) {
    let _objQuestion = objQuestion;
    let _intSliderIndex = Number(intSliderIndex);
    let _numSliderValue = parseInt(numSliderValue);
    if (_numSliderValue >= rsParams.intSliderMinValue) {
      $(_objQuestion).find(".rsRow").eq(_intSliderIndex).find(":input:radio").eq(_numSliderValue - 1).prop("checked", "checked");
    } else if (_numSliderValue == rsParams.intSliderOptOutValue) {
      //Set value if OptOut is selected
      $(_objQuestion).find(".rsRow").eq(_intSliderIndex).find(":input:radio").eq(intMax).prop("checked", "checked");
    } else {
      $(_objQuestion).find(".rsRow").eq(_intSliderIndex).find(":input:radio").prop("checked", false);
    }
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
    $(".noUi-value-large").each(function(e) {
      if (intCountPips == _strColLabels.length) {
        intCountPips = 0;
      }
      if (_strColLabels.length < 1) {
        let currentText = $(this).text();
        $(this).text(currentText + _suffix);
      } else {
        $(this).text(_strColLabels[intCountPips]);
        $(this).addClass("multi-text-scale");
        if (!rsParams.blnSliderColumnLabels) {
          $(".aero-opt-out-button").css("margin-top", "1rem");
        } else {
          $(".aero-opt-out-button").css("margin-top", "5rem");
        }
      }
      intCountPips++;
    });
  }
  let date = new Date(Date.now());
  console.log('GH LL - Formatted Time:', date.toLocaleTimeString());
}
