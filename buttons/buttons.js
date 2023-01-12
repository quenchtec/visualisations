//Function for buttons
function rsVisButton(rsQno, rsSubqIndex, rsParams) {
  //Check for WCAG, if the flag is set, we do not do anything as these buttons are not WCAG compliant at crrent
  if ($('#btnToggleWcag').val() == 1) {
    return false;
  }

  //Since there can be mutiple questions on a page, we must make sure all selectors are addressing the proper question (and subquestion) only
  const QuestionID = "#" + rsQno; //This we use in selectors to stay within the question
  const btnDivID = "#" + rsQno + "_btn"; //We create our own ID's that will be unique within the page and question
  const btnDivIDattr = rsQno + "_btn"; //Same id without # to use when we set the ID

  //Check parameters, should allways be done this way, as new parameters might be added, and possibly some removed as well
  //These parameters come from the settings the user have selected
  rsParams.autonext = (typeof rsParams.autonext === "undefined") ? false : rsParams.autonext;
  rsParams.buttonsperrow = (typeof rsParams.buttonsperrow === "undefined") ? 0 : rsParams.buttonsperrow;
  rsParams.hidebuttontext = (typeof rsParams.hidebuttontext === "undefined") ? false : rsParams.hidebuttontext;
  rsParams.imageautosizing = (typeof rsParams.imageautosizing === "undefined") ? false : rsParams.imageautosizing;
  rsParams.specialbuttons = (typeof rsParams.specialbuttons === "undefined") ? 0 : rsParams.specialbuttons;
  rsParams.useimagesasbackground = (typeof rsParams.useimagesasbackground === "undefined") ? false : rsParams.useimagesasbackground;

  //Remove extra checkboxes possibly inserted on open-ends, in order to simplyfy the iQuest logic
  $('.rsExtraOpen').remove();

  //Various info from question
  const intNumRows = $(QuestionID).find('.rsRow').length; //Number of rows
  const intNumRadios = $(QuestionID).find('.cRadio').length; //Number of radio buttons
  const intNumChecks = $(QuestionID).find('.cCheck').length; //Number of checkboxes
  const intNumButtons = intNumRadios + intNumChecks; //Number of buttons
  const intNumOpens = $(QuestionID).find('.rsRowOpen').length; //Number of opene rows

  //Check specialbuttons
  let intSpecialButtons = rsParams.specialbuttons;
  if (intSpecialButtons > 0) {
    intSpecialButtons = Math.min(intSpecialButtons, intNumButtons); //Can't be more than number of buttons
  }

  //Check normal buttons, find number of buttons to display pr. row
  const intNormalButtons = intNumButtons - intSpecialButtons;
  let intNumButtonsPrRow = rsParams.buttonsperrow;
  if (intNumButtonsPrRow > 0) {
    intNumButtonsPrRow = Math.min(intNumButtonsPrRow, intNormalButtons); //Pick minimum of requested and actual
  }

  //Turn of autonext if more than one question/subquestion on the page
  if ($('.cCellSubQuestion').length > 1) {
    rsParams.autonext = false;
  }

  //Find row number for start of special buttons
  let intSpecialButtonsStart = intNumRows;
  if (intSpecialButtons > 0) {
    let intFoundButtons = 0;
    $($(QuestionID).find('.rsRow').get().reverse()).each(function(i) {
      if ($(this).find('.cRadio, .cCheck').length > 0) {
        intFoundButtons++;
      }
      if (intFoundButtons == intSpecialButtons) {
        intSpecialButtonsStart = intNumRows - i - 1;
        return false; //We are done searching so exit loop
      }
    });
  }

  //Find width to use if set number of buttons
  let pctWidth = '';
  if (intNumButtonsPrRow > 0) {
    pctWidth = parseInt(100 / intNumButtonsPrRow);
  }

  //Build HTML for buttons etc
  let strHTML = "";
  strHTML = '<div id="' + btnDivIDattr + '" class="rsFlexBtnContainer" width="100%">';
  let blnInBtnDiv = false;
  let intNumBtnInDiv = 0;
  let blnMakeNormalBtn = true;
  let intBtnCnt = 0;

  let baseBtnClass = "rsBtn";
  let baseBtnClassSelect = ".rsBtn";
  let baseBtnClassSelectExclusive = ".rsBtn.exclusive";
  let specialBtnClass = "rsBtnSpecial";
  let checkedBtnClass = "rsBtnChecked";
  if (rsParams.useimagesasbackground) {
    baseBtnClass = "rsImgBtn";
    baseBtnClassSelect = ".rsImgBtn";
    baseBtnClassSelectExclusive = ".rsImgBtn.exclusive";
    specialBtnClass = "rsImgBtnSpecial";
    checkedBtnClass = "rsImgBtnChecked";
  }
  //Loop through rows
  $(QuestionID).find('.rsRow').each(function(i) {
    //We have radio/check or text
    let blnTypeBtn = false;
    if ($(this).find('.cRadio, .cCheck').length > 0) {
      blnTypeBtn = true;
    }
    //Check for break to special buttons
    if (i == intSpecialButtonsStart) {
      if (blnInBtnDiv) {
        strHTML += '</div>';
        intNumBtnInDiv = 0;
        blnInBtnDiv = false;
      }
      blnMakeNormalBtn = false;
    }
    if (blnTypeBtn) {
      let strExcl = "";
      if ($(this).find('.cRadio').length > 0) {
        strExcl = " exclusive";
      }
      let btnClass = baseBtnClass + strExcl;
      let btnDivClass = "rsFlexBtnDiv";
      if (!blnMakeNormalBtn) {
        btnClass += " " + specialBtnClass;
        btnDivClass += " rsFlexBtnDivSpecial";
      }
      //Are we in a btn div check for fixed number
      if (blnInBtnDiv && (intNumButtonsPrRow > 0) && (intNumBtnInDiv >= intNumButtonsPrRow)) {
        strHTML += '</div>';
        intNumBtnInDiv = 0;
        blnInBtnDiv = false;
      }
      if (!blnInBtnDiv) {
        strHTML += '<div class="' + btnDivClass + '" style="display:flex; flex-direction: row; flex-wrap: wrap; justify-content: center; align-items: stretch;">';
        blnInBtnDiv = true;
      }
      strHTML += '<div class="' + btnClass + '" alt="' + intBtnCnt + '">' + $(this).find('.cRowText').html().replace(/&nbsp;/g, '') + '</div>';

      intBtnCnt++;
      intNumBtnInDiv++;
    } else {
      //Text
      if (blnInBtnDiv) {
        strHTML += '</div>';
        intNumBtnInDiv = 0;
        blnInBtnDiv = false;
      }
      strHTML += '<div class="rsFlexBtnDivText" style="display:flex; flex-direction: row; flex-wrap: wrap; justify-content: center;">';
      let blnDoPreText = true;
      let preText = $(this).find('div .rs-ht').html();
      if (preText == '' || preText == '<p></p>') {
        blnDoPreText = false;
      }
      if (blnDoPreText) {
        strHTML += '<div style="padding: 10px;" class="rsBtnOpenPre">' + preText.replace(/&nbsp;/g, '') + '</div>';
      }
      strHTML += '<div style="padding: 10px;" class="rsBtnOpen">';
      const textInput = $(this).find('.cTextInput, .cTextArea');
      let strExcl = "";
      if (textInput.hasClass('exclusive')) {
        strExcl = " exclusive";
      }
      if (textInput.is('.cTextArea')) {
        strHTML += '<textarea  class="rsAnimationTextArea' + strExcl + '" rows="' + textInput.attr('rows') + '" cols="' + textInput.attr('cols') + '"></textarea>';
      } else {
        strHTML += '<input class="rsAnimationText' + strExcl + '" type="text" size="' + textInput.attr('size') + '" value="' + textInput.attr('value') + '"/>';
      }
      strHTML += '</div></div>';
    }
  });

  strHTML += '</div>';
  $(QuestionID).after(strHTML);

  //Check for image btn
  if (rsParams.useimagesasbackground) {
    $(btnDivID).find(baseBtnClassSelect).each(function() {
      if ($(this).find('img').length > 0) {
        const strURL = $(this).find('img').eq(0).attr('src');
        $(this).find('img').eq(0).remove();
        $(this).css('background-image', 'url("' + strURL + '")');
        if (rsParams.hidebuttontext) {
          $(this).addClass('rsImgBtnHideText');
          $(this).find('span, div').addClass('rsImgBtnHideText');
        }
      }
    });
  }

  //Transfer previous answers (e.g. if moving back)
  intBtnCnt = 0;
  $(QuestionID).find('.cRadio, .cCheck').each(function(i) {
    if ($(this).prop('checked')) {
      $(btnDivID).find(baseBtnClassSelect).eq(i).addClass(checkedBtnClass);
    } else {
      $(btnDivID).find(baseBtnClassSelect).eq(i).removeClass(checkedBtnClass);
    }
  });

  //Transfer previous answers to new open field if there is any data
  $(QuestionID).find('.cTextInput, .cTextArea').not('.rsAnimationText, .rsAnimationTextArea').each(function(i) {
    $(btnDivID).find('.rsAnimationText, .rsAnimationTextArea').eq(i).val($(this).val());
  });

  //Hide the origional parts of the question
  $(QuestionID).find('.cCellHeader,.rsRow,.cFooter').hide();

  //Button Click Event
  $(btnDivID).find(baseBtnClassSelect).on('click', function() {
    let intBtnNum = 0;
    const intInpID = $(this).attr('alt');
    const isExclusive = $(this).hasClass('exclusive');
    if (!isExclusive) { //Answer type checkbox
      if ($(QuestionID).find('.cRadio, .cCheck').eq(intInpID).prop('checked')) { //already answered so remove answer
        $(QuestionID).find('.cRadio, .cCheck').eq(intInpID).prop('checked', false);
        if (!$(QuestionID).find('.cRadio, .cCheck').eq(intInpID).prop('checked')) { //If remove answer worked format button
          $(this).removeClass(checkedBtnClass);
        }
      } else { //Not answered
        $(QuestionID).find('.cRadio, .cCheck').eq(intInpID).prop('checked', true);
        if ($(QuestionID).find('.cRadio, .cCheck').eq(intInpID).prop('checked')) {
          $(this).addClass(checkedBtnClass);
        }
      }
      intBtnNum = 0;

      //Clear radio
      $(QuestionID).find('.cRadio').prop('checked', false);
      $(btnDivID).find(baseBtnClassSelectExclusive).removeClass(checkedBtnClass);
      //Remove exclusive text should also be cleared
      $(QuestionID).find('.cTextInput.exclusive, .cTextArea.exclusive').val('');
      $(btnDivID).find('.rsAnimationText.exclusive, .rsAnimationTextArea.exclusive').val('');
    } else { //Answer is a radio
      //Change all buttons to unclicked
      const curElm = $(QuestionID).find('.cRadio, .cCheck').eq(intInpID);
      $(QuestionID).find('.cRadio, .cCheck').not(curElm).prop('checked', false);
      $(btnDivID).find(baseBtnClassSelect).removeClass(checkedBtnClass);
      //Remove any open answers
      $(QuestionID).find('.cTextInput, .cTextArea').val('');
      $(btnDivID).find('.rsAnimationText, .rsAnimationTextArea').val('');
      //Answered already
      if ($(QuestionID).find('.cRadio, .cCheck').eq(intInpID).prop('checked')) { //Already answered
        $(QuestionID).find('.cRadio, .cCheck').eq(intInpID).prop('checked', false);
        $(this).removeClass(checkedBtnClass);
      } else { //Not already answered
        $(this).addClass(checkedBtnClass);
        $(QuestionID).find('.cRadio, .cCheck').eq(intInpID).prop('checked', true);
        if (rsParams.autonext) {
          $('#btnNext').click();
        }
      }
    }
  });

  $(btnDivID).find('.rsAnimationText, .rsAnimationTextArea').on('keydown', function() {
    //Clear all radio buttons
    $(QuestionID).find('.cRadio').prop('checked', false);
    $(btnDivID).find(baseBtnClassSelectExclusive).removeClass(checkedBtnClass);
    //Clear any exclusive text
    $(btnDivID).find('.rsAnimationText.exclusive, .rsAnimationTextArea.exclusive').not(this).val('');
    const curElm = $(QuestionID).find('.cTextInput, .cTextArea').eq($(this).index('.rsAnimationText, .rsAnimationTextArea'));
    $(QuestionID).find('.cTextInput.exclusive, .cTextArea.exclusive').not(curElm).val('');
    //If exclusive clear check and all other text		

    if ($(this).hasClass('exclusive')) {
      //clear all buttons
      $(btnDivID).find(baseBtnClassSelect).removeClass(checkedBtnClass);
      $(QuestionID).find('.cRadio, .cCheck').prop('checked', false);
      //Clear Other text boxes
      $(btnDivID).find('.rsAnimationText, .rsAnimationTextArea').not(this).val('');
      $(QuestionID).find('.cTextInput, .cTextArea').not(curElm).val('');
    }
  });
  $(btnDivID).find('.rsAnimationText, .rsAnimationTextArea').on('keyup', function() {
    $(QuestionID).find('.cTextInput, .cTextArea').eq($(this).index('.rsAnimationText, .rsAnimationTextArea')).val($(this).val());
  });

  //Check for setting width
  if (pctWidth != '') {
    const valuel = $('.rsBtn').css('margin-left');
    const valuer = $('.rsBtn').css('margin-right');
    const valuepl = $('.rsBtn').css('padding-left');
    const valuepr = $('.rsBtn').css('padding-right');
    $(baseBtnClassSelect).not('.rsBtnSpecial').css('width', 'calc(' + pctWidth + '% - ' + valuel + ' - ' + valuer + ' - ' + valuepl + ' - ' + valuepr + ' - 10px)');
  }
}
