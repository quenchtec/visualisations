function allocSlider(rsQno, rsSubqIndex, rsParams) {
    rsParams.blnShowStatus = (typeof rsParams.blnShowStatus === "undefined") ? true : rsParams.blnShowStatus; //Display Status Box
    rsParams.statusPosition = (typeof rsParams.statusPosition === "undefined") ? "right" : rsParams.statusPosition; //Position of the Status Box
    blnShowTarget = (typeof blnShowTarget === "undefined") ? true : blnShowTarget; //Display Target Value
    strTargetLabel = (typeof strTargetLabel === "undefined") ? "Target" : strTargetLabel; //Target Label
    intTargetValue = (typeof intTargetValue === "undefined") ? 100 : intTargetValue; //Target Value
    intInputSize = (typeof intInputSize === "undefined") ? 4 : intInputSize; //Size of field to show value of slider
    intSldMax = (typeof intSldMax === "undefined") ? 100 : intSldMax; //Size of field to show value of slider
    intSnapToValue = (typeof intSnapToValue === "undefined") ? 1 : intSnapToValue; //Snap lider to this value
    blnShowCurrent = (typeof blnShowCurrent === "undefined") ? true : blnShowCurrent; //Display Current Total
    strCurrentLabel = (typeof strCurrentLabel === "undefined") ? "Current Value" : strCurrentLabel; //Current Value Label
    blnShowAvailable = (typeof blnShowAvailable === "undefined") ? true : blnShowAvailable; //Display Available
    strAvailableLabel = (typeof strAvailableLabel === "undefined") ? "Available" : strAvailableLabel; //Available Label
    sldHeight = (typeof sldHeight === "undefined") ? "30px" : sldHeight; //Slider Height
    sldWidth = (typeof sldWidth === "undefined") ? "20vw" : sldWidth; //Slider Width
    sldLabelWidth = (typeof sldLabelWidth === "undefined") ? "30%" : sldLabelWidth; //Slider Width
    sldBackground = (typeof sldBackground === "undefined") ? "#F7F6F7" : sldBackground; //Slider background colour
    sldFillColour = (typeof sldFillColour === "undefined") ? "#E15200" : sldFillColour; //Slider fill colour
    sldHandleColour = (typeof sldHandleColour === "undefined") ? "#8E8075" : sldHandleColour; //Slider handle colour
    blnPreFill = (typeof blnPreFill === "undefined") ? false : blnPreFill; //Pre-Fill Values
    strPreFillValue = (typeof strPreFillValue === "undefined") ? 0 : strPreFillValue; //Pre-Fill Value
    blnShowPrefix = (typeof blnShowPrefix === "undefined") ? false : blnShowPrefix; //Show Prefix
    strPrefixText = (typeof strPrefixText === "undefined") ? "â‚¬" : strPrefixText; //Prefix Text
    blnShowSuffix = (typeof blnShowSuffix === "undefined") ? false : blnShowSuffix; //Show Suffix
    strSuffixText = (typeof strSuffixText === "undefined") ? "%" : strSuffixText; //Suffix Text
    var intCurrentValue = 0;
    var intAvailableValue = intTargetValue;
    var intMaxUp = 0;
    var blnReset = false;
    var blnStartSet = false;
    var strSliderHTML = '';
    strSliderHTML += '<table class="cSliderTable" style="width: auto;">';
    $('.cRowText').each(function(i) {
        strSliderHTML += '<tr><td class="cSliderLabel">' + $(this).html() + '</td><td><div class="cSlider" SldIndex="' + i + '"></div></td><td><input type="text" class="cSliderValue" size="' + intInputSize + '" readonly></td></tr>';
    });
    strSliderHTML += '</table>';
    if (rsParams.blnShowStatus == true) {
        var strStatusHTML = '';
        strStatusHTML += '<table class="cStatusTable" style="width: auto;">';
        if (blnShowTarget == true) {
            strStatusHTML += '<tr><td><span class="cRowText cTargetLabel">' + strTargetLabel + '</span></td><td><input type="text" class="cSliderValue cTargetValue" size="' + intInputSize + '" readonly></td></tr>';
        }
        if (blnShowCurrent == true) {
            strStatusHTML += '<tr><td><span class="cRowText cCurrentLabel">' + strCurrentLabel + '</span></td><td><input type="text" class="cSliderValue cCurrentValue" size="' + intInputSize + '" readonly></td></tr>';
        }
        if (blnShowAvailable == true) {
            strStatusHTML += '<tr><td><span class="cRowText cAvailableLabel">' + strAvailableLabel + '</span></td><td><input type="text" class="cSliderValue cAvailableValue" size="' + intInputSize + '" readonly></td></tr>';
        }
        strStatusHTML += '</table>';
        var strHTML = '';
        switch (rsParams.statusPosition) {
            case 'top':
                strHTML += '<div class="cWrapper">';
                strHTML += '<table class="ciQuestTable" style="width: auto;"><tr><td>' + strStatusHTML + '</td></tr><tr><td>' + strSliderHTML + '</td></tr></table>';
                strHTML += '</div>';
                break;
            case 'bottom':
                strHTML += '<div class="cWrapper">';
                strHTML += '<table class="ciQuestTable" style="width: auto;"><tr><td>' + strSliderHTML + '</td></tr><tr><td>' + strStatusHTML + '</td></tr></table>';
                strHTML += '</div>';
                break;
            case 'left':
                strHTML += '<div class="cWrapper">';
                strHTML += '<table class="ciQuestTable" style="width: auto;"><tr><td>' + strStatusHTML + '</td><td>' + strSliderHTML + '</td></tr></table>';
                strHTML += '</div>';
                break;
            case 'right':
                strHTML += '<div class="cWrapper">';
                strHTML += '<table class="ciQuestTable" style="width: auto;"><tr><td>' + strSliderHTML + '</td><td>' + strStatusHTML + '</td></tr></table>';
                strHTML += '</div>';
                break;
        }	
        $('#rsPanelMain').append(strHTML);
        //Set status initial values
        $('.cTargetValue').val(intTargetValue);
        $('.cCurrentValue').val(0);
        $('.cAvailableValue').val(intTargetValue);
    } else {
        $('#rsPanelMain').append(strSliderHTML);
    }
    //Hide question
    $('.cCellHeader,.cCellHeaderCode,.cRow,.cRowAlt,.cRowSelected,.cRowAltSelected,.cFooter').css('display', 'none');
    $('.cSlider').slider({
        animate: false,
        range: "min",
        min: 0,
        max: intSldMax,
        value: 0,
        start: function(event, ui) {
            if (blnStartSet == false) {
                var intSliderIndex = $(this).attr('SldIndex');
                CurrDiff = intTargetValue - intCurrentValue;
                var snapValue = Math.round(ui.value / intSnapToValue) * intSnapToValue;
                intMaxUp = snapValue + CurrDiff;
                blnStartSet = true;
            }
        },
        slide: function(event, ui) {
            var intSliderIndex = $(this).attr('SldIndex');
            if (ui.value <= intMaxUp) {
                //Snap to
                var snapValue = Math.round(ui.value / intSnapToValue) * intSnapToValue;
                $('.cSliderTable').find('.cSliderValue').eq(intSliderIndex).val(snapValue);
                $('.cFInput').eq(intSliderIndex).val(snapValue);
                var intTotal = 0;
                $('.cSliderTable').find('.cSliderValue').each(function() {
                    if ($(this).val().length != 0) {
                        intTotal = intTotal + parseInt($(this).val());
                    }
                });
                $('.cCurrentValue').val(intTotal);
                $('.cAvailableValue').val(intTargetValue - intTotal);
            } else {
                intMaxUp;
                $('.cSliderTable').find('.cSliderValue').eq(intSliderIndex).val(intMaxUp);
                $('.cFInput').eq(intSliderIndex).val(intMaxUp);
                var intTotal = 0;
                $('.cSliderTable').find('.cSliderValue').each(function() {
                    if ($(this).val().length != 0) {
                        intTotal = intTotal + parseInt($(this).val());
                    }
                });
                $('.cCurrentValue').val(intTotal);
                $('.cAvailableValue').val(intTargetValue - intTotal);
            }
        },
        stop: function(event, ui) {
            var intSliderIndex = $(this).attr('SldIndex');
            //Snap to
            var snapValue = Math.round(ui.value / intSnapToValue) * intSnapToValue;
            if (snapValue != ui.value) {
                $(this).slider('value', snapValue);
            }
            $('.cSliderTable').find('.cSliderValue').eq(intSliderIndex).val(snapValue);
            $('.cFInput').eq(intSliderIndex).val(snapValue);
            if (snapValue > intMaxUp && blnReset == false) {
                blnReset = true;
                $(this).slider('value', intMaxUp);
                $('.cSliderTable').find('.cSliderValue').eq(intSliderIndex).val(intMaxUp);
                $('.cFInput').eq(intSliderIndex).val(intMaxUp);
                $('.cAvailableValue').val(0);
                blnReset = false;
            }
            intCurrentValue = $('.cCurrentValue').val();
            blnStartSet = false;
        }
    });
    //Set Slider values to previous answers
    var intTotal = 0;
    $('.cFInput').each(function(i) {
        var intValue = $(this).val();
        $('.cSlider').eq(i).slider('value', intValue);
        $('.cSliderTable').find('.cSliderValue').eq(i).val(intValue);
        if ($(this).val().length != 0) {
            intTotal = intTotal + parseInt($(this).val());
        }
    });
    $('.cCurrentValue').val(intTotal);
    intCurrentValue = intTotal;
    intAvailableValue = intTargetValue - intTotal;
    $('.cAvailableValue').val(intTargetValue - intTotal);
    $('.cSlider').css('height', sldHeight);
    $('.cSlider').css('width', sldWidth);
    $('.cSliderLabel').css('width', sldLabelWidth);
    var sldHandleHeight = parseInt($('.cSlider').eq(0).height()) + 8;
    $('.ui-slider .ui-slider-handle').css('height', sldHandleHeight + 'px');
    $('.ui-slider-range').css('background', sldFillColour);
    $('.cSlider').css('background', sldBackground);
    $('.cSlider').css('margin-bottom', '5px');
    $('.ui-slider-handle').css('background', sldHandleColour);
    $('.cSliderValue').css('text-align', 'right');
    if (blnPreFill == true) {
        intTotal = 0;
        var blnHasAnswers = false;
        $('.cSliderTable').find('.cSliderValue').each(function(i) {
            if ($(this).val().length == 0) {
                $(this).val(strPreFillValue);
                $('.cFInput').eq(i).val(strPreFillValue);
                intValue = parseInt(strPreFillValue);
                $('.cSlider').eq(i).slider('value', intValue);
                intTotal = intTotal + intValue;
            } else {
                blnHasAnswers = true;
            }
        });
        if (blnHasAnswers == false) {
            $('.cCurrentValue').val(intTotal);
            intCurrentValue = intTotal;
            $('.cAvailableValue').val(intTargetValue - intTotal);
        }
    }
    //Add a Prefix
    if (blnShowPrefix == true) {
        $('.cSliderValue').before('<span class="cRowText">' + strPrefixText + '&nbsp;</span');
    }
    //Add a Suffix
    if (blnShowSuffix == true) {
        $('.cSliderValue').after('<span class="cRowText">&nbsp;' + strSuffixText + '</span');
    }
}
