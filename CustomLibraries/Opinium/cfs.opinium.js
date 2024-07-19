function mobileIt() { //Remove padding for mobile devices
    var isMobile;
    //If a mobile browser is detected paddding is removed and the main container is centered
    if (isMobile) {
        $('html').css('padding-left', '1%');
        $('html').css('padding-right', '1%');
        $('mainContainer').css('margin-left', 'auto');
        $('mainContainer').css('margin-right', 'auto');
    }
}

function fncHideNext() {
    if ($('#uniform-btnNext').length != 0) {
        $('#uniform-btnNext').hide();
    } else {
        $('#btnNext').hide();
    }
}

function fncShowNext() {
    if ($('#uniform-btnNext').length != 0) {
        $('#uniform-btnNext').show();
    } else {
        $('#btnNext').show();
    }
}

function iQuestHelper(strMessage) {
    var strHTML = '';
    var strServer = $('#mi_server').val();
    if (strServer == 'preview.miprocloud.net' || strServer == 'test.miprocloud.net') {
        //Check if div exists
        if ($('.iQuestHelper').length == 0) {
            strHTML = '<div class="iQuestHelper" style="color: #008A2E"><strong>iQuest Helper:</strong><br></div>';
            $('.logo2Container').before(strHTML);
        }
        //Add Message
        strHTML = '<p>' + strMessage + '</p>';
        $('.iQuestHelper').append(strHTML);
    }

}

function btnMultiSetSingle(intRow, quickMode, btnColor, btnColorClick) { //Function used to set previous answers on Singles
    //Check if row answered
    //Set background of buttons to unaswered
    if (quickMode != true) {
        $('.cBtnSingleGrid').css('background-color', btnColor).removeClass('btnChecked');
    } else {
        $('.cBtnSingleGrid').css('background-color', 'transparent');
    }
    var intChecked = $('.cRow,.cRowAlt,.cRowSelected,.cRowAltSelected').eq(intRow).find('.cRadio:checked').length;

    if (intChecked != 0) {
        var radioButtons = $('.cRow,.cRowAlt,.cRowSelected,.cRowAltSelected').eq(intRow).find('.cRadio');
        var selectedIndex = radioButtons.index(radioButtons.filter(':checked'));
        $('.cBtnSingleGrid').eq(selectedIndex).css('background-color', btnColorClick).addClass('btnChecked');
    }
}

function fncSetGridBtnBackground(strID, strStyle, intMin, intMax, quickModeHideText) {
    //Add validation for number of buttons
    switch (strStyle) {
        case 'Smiley1':
            $(strID).eq(0).css('background', 'transparent url("Scripts/QuickMode/YellVSad.png") no-repeat center center');
            $(strID).eq(1).css('background', 'transparent url("Scripts/QuickMode/YelSad.png") no-repeat center center');
            $(strID).eq(2).css('background', 'transparent url("Scripts/QuickMode/YelNeutral.png") no-repeat center center');
            $(strID).eq(3).css('background', 'transparent url("Scripts/QuickMode/YelHap.png") no-repeat center center');
            $(strID).eq(4).css('background', 'transparent url("Scripts/QuickMode/YelVHap.png") no-repeat center center');
            $(strID).css('background-size', '95% 95%');
            $(strID).css('border', '0px transparent solid');
            if (quickModeHideText == true) {
                $(strID).css({ 'font-size': '0px', 'color': 'transparent' });
                $(strID).find('span').css({ 'font-size': '0px', 'color': 'transparent' });
            }
            break;
        case 'Smiley2':
            $(strID).eq(0).css('background', 'transparent url("Scripts/QuickMode/3dVSad.jpg") no-repeat center center');
            $(strID).eq(1).css('background', 'transparent url("Scripts/QuickMode/3dSad.jpg") no-repeat center center');
            $(strID).eq(2).css('background', 'transparent url("Scripts/QuickMode/3dNeutral.jpg") no-repeat center center');
            $(strID).eq(3).css('background', 'transparent url("Scripts/QuickMode/3dSmile.jpg") no-repeat center center');
            $(strID).eq(4).css('background', 'transparent url("Scripts/QuickMode/3dVHappy.jpg") no-repeat center center');
            $(strID).css('background-size', '95% 95%');
            $(strID).css('border', '0px transparent solid');
            if (quickModeHideText == true) {
                $(strID).css({ 'font-size': '0px', 'color': 'transparent' });
                $(strID).find('span').css({ 'font-size': '0px', 'color': 'transparent' });
            }
            break;
        case 'Dice1':
            $(strID).eq(0).css('background', 'transparent url("Scripts/QuickMode/BWdice1.jpg") no-repeat center center');
            $(strID).eq(1).css('background', 'transparent url("Scripts/QuickMode/BWdice2.jpg") no-repeat center center');
            $(strID).eq(2).css('background', 'transparent url("Scripts/QuickMode/BWdice3.jpg") no-repeat center center');
            $(strID).eq(3).css('background', 'transparent url("Scripts/QuickMode/BWdice4.jpg") no-repeat center center');
            $(strID).eq(4).css('background', 'transparent url("Scripts/QuickMode/BWdice5.jpg") no-repeat center center');
            $(strID).eq(6).css('background', 'transparent url("Scripts/QuickMode/BWdice6.jpg") no-repeat center center');
            $(strID).css('background-size', '95% 95%');
            $(strID).css('border', '0px transparent solid');
            if (quickModeHideText == true) {
                $(strID).css({ 'font-size': '0px', 'color': 'transparent' });
                $(strID).find('span').css({ 'font-size': '0px', 'color': 'transparent' });
            }
            break;
        case 'Dice2':
            $(strID).eq(0).css('background', 'transparent url("Scripts/QuickMode/BWdice1Style2.png") no-repeat center center');
            $(strID).eq(1).css('background', 'transparent url("Scripts/QuickMode/BWdice2Style2.png") no-repeat center center');
            $(strID).eq(2).css('background', 'transparent url("Scripts/QuickMode/BWdice3Style2.png") no-repeat center center');
            $(strID).eq(3).css('background', 'transparent url("Scripts/QuickMode/BWdice4Style2.png") no-repeat center center');
            $(strID).eq(4).css('background', 'transparent url("Scripts/QuickMode/BWdice5Style2.png") no-repeat center center');
            $(strID).eq(6).css('background', 'transparent url("Scripts/QuickMode/BWdice6Style2.png") no-repeat center center');
            $(strID).css('background-size', '95% 95%');
            $(strID).css('border', '0px transparent solid');
            if (quickModeHideText == true) {
                $(strID).css({ 'font-size': '0px', 'color': 'transparent' });
                $(strID).find('span').css({ 'font-size': '0px', 'color': 'transparent' });
            }
            break;
        case 'Temp':
            $(strID).eq(0).css('background', 'transparent url("Scripts/QuickMode/Therm1.png") no-repeat center center');
            $(strID).eq(1).css('background', 'transparent url("Scripts/QuickMode/Therm2.png") no-repeat center center');
            $(strID).eq(2).css('background', 'transparent url("Scripts/QuickMode/Therm3.png") no-repeat center center');
            $(strID).eq(3).css('background', 'transparent url("Scripts/QuickMode/Therm4.png") no-repeat center center');
            $(strID).eq(4).css('background', 'transparent url("Scripts/QuickMode/Therm5.png") no-repeat center center');
            $(strID).eq(5).css('background', 'transparent url("Scripts/QuickMode/Therm6.png") no-repeat center center');
            $(strID).eq(6).css('background', 'transparent url("Scripts/QuickMode/Therm7.png") no-repeat center center');
            $(strID).eq(7).css('background', 'transparent url("Scripts/QuickMode/Therm8.png") no-repeat center center');
            $(strID).css('background-size', '95% 95%');
            $(strID).css('border', '0px transparent solid');
            if (quickModeHideText == true) {
                $(strID).css({ 'font-size': '0px', 'color': 'transparent' });
                $(strID).find('span').css({ 'font-size': '0px', 'color': 'transparent' });
            }
            break;
        case 'Postit':
            $(strID).eq(0).css('background', 'transparent url("Scripts/QuickMode/PostitNegPlus.png") no-repeat center center');
            $(strID).eq(1).css('background', 'transparent url("Scripts/QuickMode/PostitNeg.png") no-repeat center center');
            $(strID).eq(2).css('background', 'transparent url("Scripts/QuickMode/PostitNeutral.png") no-repeat center center');
            $(strID).eq(3).css('background', 'transparent url("Scripts/QuickMode/PostitPos.png") no-repeat center center');
            $(strID).eq(4).css('background', 'transparent url("Scripts/QuickMode/PostitPosPlus.png") no-repeat center center');
            $(strID).css('background-size', '95% 95%');
            $(strID).css('border', '0px transparent solid');
            if (quickModeHideText == true) {
                $(strID).css({ 'font-size': '0px', 'color': 'transparent' });
                $(strID).find('span').css({ 'font-size': '0px', 'color': 'transparent' });
            }
            break;
        case 'Dot':
            $(strID).eq(0).css('background', 'transparent url("Scripts/QuickMode/AverageScale1.png") no-repeat center center');
            $(strID).eq(1).css('background', 'transparent url("Scripts/QuickMode/AverageScale2.png") no-repeat center center');
            $(strID).eq(2).css('background', 'transparent url("Scripts/QuickMode/AverageScale3.png") no-repeat center center');
            $(strID).eq(3).css('background', 'transparent url("Scripts/QuickMode/AverageScale4.png") no-repeat center center');
            $(strID).eq(4).css('background', 'transparent url("Scripts/QuickMode/AverageScale5.png") no-repeat center center');
            $(strID).css('background-size', '95% 95%');
            $(strID).css('border', '0px transparent solid');
            if (quickModeHideText == true) {
                $(strID).css({ 'font-size': '0px', 'color': 'transparent' });
                $(strID).find('span').css({ 'font-size': '0px', 'color': 'transparent' });
            }
            break;
        case 'Star1':
            $(strID).eq(0).css('background', 'transparent url("Scripts/QuickMode/1_Stars_200.png") no-repeat center center');
            $(strID).eq(1).css('background', 'transparent url("Scripts/QuickMode/2_Stars_200.png") no-repeat center center');
            $(strID).eq(2).css('background', 'transparent url("Scripts/QuickMode/3_Stars_200.png") no-repeat center center');
            $(strID).eq(3).css('background', 'transparent url("Scripts/QuickMode/4_Stars_200.png") no-repeat center center');
            $(strID).eq(4).css('background', 'transparent url("Scripts/QuickMode/5_Stars_200.png") no-repeat center center');
            $(strID).css('background-size', '95% 95%');
            $(strID).css('border', '0px transparent solid');
            if (quickModeHideText == true) {
                $(strID).css({ 'font-size': '0px', 'color': 'transparent' });
                $(strID).find('span').css({ 'font-size': '0px', 'color': 'transparent' });
            }
            break;
        case 'Star2':
            $(strID).eq(0).css('background', 'transparent url("Scripts/QuickMode/1_BlueStar_200.png") no-repeat center center');
            $(strID).eq(1).css('background', 'transparent url("Scripts/QuickMode/2_BlueStar_200.png") no-repeat center center');
            $(strID).eq(2).css('background', 'transparent url("Scripts/QuickMode/3_BlueStar_200.png") no-repeat center center');
            $(strID).eq(3).css('background', 'transparent url("Scripts/QuickMode/4_BlueStar_200.png") no-repeat center center');
            $(strID).eq(4).css('background', 'transparent url("Scripts/QuickMode/5_BlueStar_200.png") no-repeat center center');
            $(strID).css('background-size', '95% 95%');
            $(strID).css('border', '0px transparent solid');
            if (quickModeHideText == true) {
                $(strID).css({ 'font-size': '0px', 'color': 'transparent' });
                $(strID).find('span').css({ 'font-size': '0px', 'color': 'transparent' });
            }
            break;
        case 'Numbers':
            $(strID).eq(0).css('background', 'transparent url("Scripts/QuickMode/RoundNumberOne.png") no-repeat center center');
            $(strID).eq(1).css('background', 'transparent url("Scripts/QuickMode/RoundNumberTwo.png") no-repeat center center');
            $(strID).eq(2).css('background', 'transparent url("Scripts/QuickMode/RoundNumberThree.png") no-repeat center center');
            $(strID).eq(3).css('background', 'transparent url("Scripts/QuickMode/RoundNumberFour.png") no-repeat center center');
            $(strID).eq(4).css('background', 'transparent url("Scripts/QuickMode/RoundNumberFive.png") no-repeat center center');
            $(strID).eq(5).css('background', 'transparent url("Scripts/QuickMode/RoundNumberSix.png") no-repeat center center');
            $(strID).eq(6).css('background', 'transparent url("Scripts/QuickMode/RoundNumberSeven.png") no-repeat center center');
            $(strID).eq(7).css('background', 'transparent url("Scripts/QuickMode/RoundNumberEight.png") no-repeat center center');
            $(strID).eq(8).css('background', 'transparent url("Scripts/QuickMode/RoundNumberNine.png") no-repeat center center');
            $(strID).css('background-size', '95% 95%');
            $(strID).css('border', '0px transparent solid');
            if (quickModeHideText == true) {
                $(strID).css({ 'font-size': '0px', 'color': 'transparent' });
                $(strID).find('span').css({ 'font-size': '0px', 'color': 'transparent' });
            }
            break;
    }
}

function fncSetBtnBackground(strBkURL, strID) {
    $(strID).each(function () {
        $(this).find('img').eq(0).remove();
        $(this).css('background', 'transparent url("' + strBkURL + '") no-repeat center center');
        $(this).css('background-size', '95% 95%');
        $(this).css('border', '0px transparent solid');
    });
}


function btnMultiSetMulti(intRow, quickMode, btnColor, btnColorClick) { //Function used to set previous answers on multiples
    //Check if row answered
    //Set background of buttons to unaswered
    if (quickMode != true) {
        $('.cBtnMultiGrid').css('background-color', btnColor).removeClass('btnChecked');
    }
    else {
        $('.cBtnMultiGrid').css('background-color', 'transparent');
    }
    var intChecked = $('.cRow,.cRowAlt,.cRowSelected,.cRowAltSelected').eq(intRow).find('.cRadio:checked, .cCheck:checked').length;
    if (intChecked != 0) {
        var intBtnNum = 0;
        $('.cRow,.cRowAlt,.cRowSelected,.cRowAltSelected').eq(intRow).find('.cRadio, .cCheck').each(function () {
            if ($(this).prop('checked')) {
                $('.cBtnMultiGrid').eq(intBtnNum).css('background-color', btnColorClick).addClass('btnChecked');
            }
            intBtnNum++;
        });
    }
}
