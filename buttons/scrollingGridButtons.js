function rsVisScrollingGrid(rsQno, rsSubqIndex, rsParams) {
  // to handle button iQuest  
  const QuestionID = "#" + rsQno;
  const btnDivID = QuestionID + "_btn";
  const btnDivIDattr = rsQno + "_btn";
  const scrollDivID = QuestionID + "_scroll";
  const scrollDivIDattr = rsQno + "_scroll";
  let strHTML = "";

  ////Should check strtucture
  structOK = true;
  //Check parameters
  rsParams.autonext = (typeof rsParams.autonext === "undefined") ? false : rsParams.autonext;
  rsParams.buttonsperrow = (typeof rsParams.buttonsperrow === "undefined") ? 0 : rsParams.buttonsperrow;
  rsParams.hidebuttontext = (typeof rsParams.hidebuttontext === "undefined") ? false : rsParams.hidebuttontext;
  rsParams.imageautosizing = (typeof rsParams.imageautosizing === "undefined") ? false : rsParams.imageautosizing;
  rsParams.specialbuttons = (typeof rsParams.specialbuttons === "undefined") ? 0 : rsParams.specialbuttons;
  rsParams.minwidth = (typeof rsParams.minwidth === "undefined") ? "" : rsParams.minwidth;
  rsParams.maxwidth = (typeof rsParams.maxwidth === "undefined") ? "" : rsParams.maxwidth;
  rsParams.scrollMinwidth = (typeof rsParams.scrollMinwidth === "undefined") ? "" : rsParams.scrollMinwidth;
  rsParams.scrollMaxwidth = (typeof rsParams.scrollMaxwidth === "undefined") ? "" : rsParams.scrollMaxwidth;
  rsParams.useimagesasbackground = (typeof rsParams.useimagesasbackground === "undefined") ? false : rsParams.useimagesasbackground;
  rsParams.randomizecolumns = (typeof rsParams.randomizecolumns === "undefined") ? "no" : rsParams.randomizecolumns;
  rsParams.randomseed = (typeof rsParams.randomseed === "undefined") ? 0 : rsParams.randomseed;
  rsParams.excludecolumnend = (typeof rsParams.excludecolumnend === "undefined") ? 0 : rsParams.excludecolumnend;
  rsParams.excludecolumnstart = (typeof rsParams.excludecolumnstart === "undefined") ? 0 : rsParams.excludecolumnstart;
  rsParams.prescript = (typeof rsParams.prescript === "undefined") ? "" : rsParams.prescript;
  rsParams.postscript = (typeof rsParams.postscript === "undefined") ? "" : rsParams.postscript;

  //Check for prescript
  if (rsParams.prescript.length > 0) sParam.prescript;

  //Various info from question
  const intNumRows = $(QuestionID).find('.rsRow').length;
  const intNumRadios = $(QuestionID).find('.rsRow').eq(0).find('.cRadio').length;
  const intNumChecks = $(QuestionID).find('.rsRow').eq(0).find('.cCheck').length;
  const intNumButtons = intNumRadios + intNumChecks;
  const intNumColumns = $(QuestionID).find('.cTable tr').eq(1).find('td , th').length; //Including text column

  let intSpecialButtons = rsParams.specialbuttons;
  //Check specialbuttons
  if (intSpecialButtons > 0) {
    IntSpecialButtons = Math.min(intSpecialButtons, intNumButtons);
    //Ilogical to have exclude columns less than special if rotation
    rsParams.excludecolumnend = Math.max(rsParams.excludecolumnend, IntSpecialButtons);
  }
  const intNormalButtons = intNumButtons - intSpecialButtons;
  let intNumButtonsPrRow = rsParams.buttonsperrow;
  if (intNumButtonsPrRow > 0) {
    intNumButtonsPrRow = Math.min(intNumButtonsPrRow, intNormalButtons);
  }

  //Turn of "final" autonext if more than one subquestion
  rsParams.finalAutonext = rsParams.autonext;
  if ($(QuestionID).find('.cCellSubQuestion').length > 1) {
    rsParams.finalAutonext = false;
  }

  //Radmomize columns if set
  if (rsParams.randomizecolumns != "no") {
    shuffleColumns(QuestionID, rsParams.randomizecolumns, rsParams.randomseed, rsParams.excludecolumnstart, rsParams.excludecolumnend, intNumColumns);
  }
  //Check for WCAG
  if ($('#btnToggleWcag').val() == 1) {
    return false;
  }
  //Build buttons
  buildScrollingGridButtons(QuestionID, intNumButtons, intNumButtonsPrRow, intSpecialButtons, btnDivID, btnDivIDattr, rsParams)

  //Hide question
  $(QuestionID).find('.cCellHeader,.rsRow,.cFooter').hide();

  //Create dummy next/previous buttons
  if ($('#btnPrevious').length > 0) {
    $('#btnPrevious').before('<input id="btnPrevious2" onclick="rsScrollingGridPreviousClick(\'' + QuestionID + '\',\'' + btnDivID + '\',\'' + scrollDivID + '\',' + intNumRows + ',' + rsParams.useimagesasbackground + ',' + rsParams.autonext + ')" class="buttonPrevious" name="btnPrevious2" value="Previous" type="button"></input>');
    $('#btnPrevious2').val($('#btnPrevious').val());
    $('#btnPrevious').hide();
  }
  $('#btnNext').after('<input id="btnNext2" onclick="rsScrollingGridNextClick(\'' + QuestionID + '\',\'' + btnDivID + '\',\'' + scrollDivID + '\',' + intNumRows + ',' + rsParams.useimagesasbackground + ',' + rsParams.autonext + ')" class="buttonNext" name="btnNext2" value="Next" type="button"></input>');
  $('#btnNext2').val($('#btnNext').val());
  $('#btnNext').hide();
  //Hide the next button until something selected if autonext
  if (rsParams.autonext) {
    $('#btnNext2').hide();
  }

  //Create scroll wrapper
  strHTML = '<div id="' + scrollDivIDattr + '" class="rsScrollGridWrappper">';
  strHTML += '<div class="rsScrollAnimate" width="100%"><div class="rsScrollGridContent"></div></div></div>';
  $(QuestionID).after(strHTML);
  //Check width of scroll area
  if (rsParams.scrollMinwidth != null) {$(scrollDivID).find('.rsScrollGridContent').css('min-width', rsParams.scrollMinwidth);
	console.log("set min " + rsParams.scrollMinwidth + " l " + $(scrollDivID).find('.rsScrollGridContent').length); }
  if (rsParams.scrollMaxwidth != null) {$(scrollDivID).find('.rsScrollGridContent').css('max-width', rsParams.scrollMaxwidth);
  	console.log("set max " + rsParams.scrollMaxwidth + " l " + $(scrollDivID).find('.rsScrollGridContent').length); }
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

  //Button Click Event
  $(btnDivID).find(baseBtnClassSelect).on('click', function() {
    //Are we allowed to click?
    if (!$(QuestionID).data('blnClickOn')) {
      return;
    } else {
      //Do not allow any more clicks before this is handled
      $(QuestionID).data('blnClickOn', false);
    }

    let intBtnNum = 0;
    let wrapNo = $(scrollDivID).find('.rsScrollGridContent').html(strHtml).data('wrapNo');
    const intInpID = $(this).attr('alt');
    const isExclusive = $(this).hasClass('exclusive');
    const wrapNoRow = $(QuestionID).find('.rsRow').eq(wrapNo);
    let doneNext = false;
    if (!isExclusive) { //Answer type checkbox
      if ((wrapNoRow).find('.cRadio, .cCheck').eq(intInpID).prop('checked')) { //already answered so remove answer
        wrapNoRow.find('.cRadio, .cCheck').eq(intInpID).prop('checked', false);
        if (!wrapNoRow.find('.cRadio, .cCheck').eq(intInpID).prop('checked')) { //If remove answer worked format button
          $(this).removeClass(checkedBtnClass);
        }
      } else { //Not answered
        wrapNoRow.find('.cRadio, .cCheck').eq(intInpID).prop('checked', true);
        if (wrapNoRow.find('.cRadio, .cCheck').eq(intInpID).prop('checked')) {
          $(this).addClass(checkedBtnClass);
        }
      }
      intBtnNum = 0;
      //clear radio
      wrapNoRow.find('.cRadio').prop('checked', false);
      $(btnDivID).find(baseBtnClassSelectExclusive).removeClass(checkedBtnClass);
      $(QuestionID).data('blnClickOn', true);
    } else { //Answer is a radio
      //Change all buttons to unclicked
      const curElm = wrapNoRow.find('.cRadio, .cCheck').eq(intInpID);
      wrapNoRow.find('.cRadio, .cCheck').not(curElm).prop('checked', false);
      $(btnDivID).find(baseBtnClassSelect).removeClass(checkedBtnClass);
      //Answered already
      if (wrapNoRow.find('.cRadio, .cCheck').eq(intInpID).prop('checked')) { //Already answered
        wrapNoRow.find('.cRadio, .cCheck').eq(intInpID).prop('checked', false);
        $(this).removeClass(checkedBtnClass);
      } else { //Not already answered
        $(this).addClass(checkedBtnClass);
        wrapNoRow.find('.cRadio, .cCheck').eq(intInpID).prop('checked', true);
        if (rsParams.autonext) {
          doneNext = true;
          $('#btnNext2').click();
        }
      }
      $(QuestionID).data('blnClickOn', true);
    }
    //Check for any answer and no-autonext, if so display next button		
    if (rsParams.autonext && !doneNext) {
      if (wrapNoRow.find('.cRadio:checked, .cCheck:checked').length > 0) {
        $('#btnNext2').show();
      }
    }
  });
  //Display first or last row
  let startRow = 0;
  let direction = parseInt($('#rs_dir').val());
  if (direction == -1) {
    startRow = intNumRows - 1;
  }
  //Do not allow click before animation completed
  $(QuestionID).data('blnClickOn', false);
  //Animate row
  $(scrollDivID).find('.rsScrollAnimate').hide();
  animateScrollingGridRow(QuestionID, btnDivID, scrollDivID, startRow, direction, rsParams.useimagesasbackground, rsParams.autonext);

  //Check for prescript
  if (rsParams.postscript.length > 0) sParam.postscript;
}

//Helper functions
$.fn.reverse = [].reverse;

function shuffle(array, seed) {
  let m = array.length;
  let temp = 0;
  let index = 0;
  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    index = Math.floor(random(seed) * m--);
    // And swap it with the current element.
    temp = array[m];
    array[m] = array[index];
    array[index] = temp;
    ++seed;
  }
  return array;
}

function random(seed) {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function shuffleColumns(QuestionID, shuffleType, seed, skipStart, skipEnd, numColumns) {
  //Various checks
  if (skipStart > (numColumns - 1)) {
    skipsStart = numColumns - 1;
  }
  if (skipEnd > (numColumns - 1)) {
    skipsEnd = numColumns - 1;
  }
  if ((skipStart + skipEnd) > (numColumns - 1)) {
    skipStart = 0;
    skipEnd = 0;
    blnDoShuffle = false;
  }

  let colOrder = [];
  let colStart = skipStart + 1;
  for (i = colStart; i < (numColumns - skipEnd); i++) {
    colOrder.push(i);
  }
  const sys_random = parseInt($('#rs_rnd').val());
  const quesPos = parseInt($(QuestionID).find('.cTable').prop('id').substr(2));
  if (seed == 0) {
    seed = quesPos + 1;
  }
  const useSeed = sys_random * seed;
  if (shuffleType == "random") {
    shuffle(colOrder, useSeed);
  } else if (shuffleType == "alternate") {
    if (Math.floor(random(useSeed) * 2)) {
      //Reveres by random (about every second time)
      colOrder = colOrder.reverse();
    }
  }
  for (i = skipStart; i >= 0; i = i - 1) {
    colOrder.unshift(i);
  }
  for (i = (numColumns - skipEnd); i < numColumns; i++) {
    colOrder.push(i);
  }
  let strArr = "";
  for (i = 0; i < colOrder.length; i++) {
    strArr += " - arr[" + i + "] :" + colOrder[i];
  }
  $(QuestionID).find('.cTable tr:not(:first)').html(function(i) {
    return $(this).children().sort(function(a, b) {
      const aOrder = colOrder[$(a).index()];
      const bOrder = colOrder[$(b).index()];
      return aOrder - bOrder;
    });
  });
}

function buildScrollingGridButtons(QuestionID, intNumButtons, intNumButtonsPrRow, intSpecialButtons, btnDivID, btnDivIDattr, rsParams) {
  let strHTML = "";
  //Find column number for start of special buttons
  let intSpecialButtonsStart = intNumButtons;
  if (intSpecialButtons > 0) {
    intSpecialButtonsStart = intNumButtons - intSpecialButtons;
  }
  //Find width to use if set number of buttons
  var pctWidth = '';
  if (intNumButtonsPrRow > 0) {
    pctWidth = parseInt(100 / intNumButtonsPrRow);
  }

  //Build HTML for buttons etc
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
  const headRow = $(QuestionID).find('.cTable tr').eq(1);
  const firstAnswerRow = $(QuestionID).find('.rsRow').eq(0);
  //Loop buttons
  firstAnswerRow.find('td').each(function(i) {
    //Check for break to special buttons
    if (i == intSpecialButtonsStart) {
      if (blnInBtnDiv) {
        strHTML += '</div>';
        intNumBtnInDiv = 0;
        blnInBtnDiv = false;
      }
      blnMakeNormalBtn = false;
    }

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
    strHTML += '<div class="' + btnClass + '" alt="' + intBtnCnt + '">' + headRow.find('th').eq(i).html().replace(/&nbsp;/g, '') + '</div>';
    intBtnCnt++;
    intNumBtnInDiv++;
  });

  strHTML += '</div>';
  $(QuestionID).after(strHTML);
  
  //Check for minwidth and maxwidth (only if not specifying the number of buttons)
  if (intNumButtonsPrRow == 0) {
	if (rsParams.minwidth != null) $(btnDivID).find('.rsBtn').css('min-width', rsParams.minwidth);
	if (rsParams.maxwidth != null) $(btnDivID).find('.rsBtn').css('max-width', rsParams.maxwidth);
  }

  
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
  //Check for setting width
  if (pctWidth != '') {
    const valuel = $('.rsBtn').css('margin-left');
    const valuer = $('.rsBtn').css('margin-right');
    const valuepl = $('.rsBtn').css('padding-left');
    const valuepr = $('.rsBtn').css('padding-right');
    $(baseBtnClassSelect).not('.rsBtnSpecial').css('width', 'calc(' + pctWidth + '% - ' + valuel + ' - ' + valuer + ' - ' + valuepl + ' - ' + valuepr + ' - 10px)');
  }
}

function animateScrollingGridRow(QuestionID, btnDivID, scrollDivID, wrapNo, direction, useimagesasbackground, doAutonext) {
  const wrpScrollTime = 200;
  let strHTML = "";
  let baseBtnClass = "rsBtn";
  let baseBtnClassSelect = ".rsBtn";
  let checkedBtnClass = "rsBtnChecked";
  if (useimagesasbackground) {
    baseBtnClass = "rsImgBtn";
    baseBtnClassSelect = ".rsImgBtn";
    checkedBtnClass = "rsImgBtnChecked";
  }
  let animateDirectionIn = "right";
  let animateDirectionOut = "left";
  if (direction == -1) {
    animateDirectionIn = "left";
    animateDirectionOut = "right";
  }
  let wrpScrollTimeOut = wrpScrollTime;
  if ($(scrollDivID).find('.rsScrollGridContent').is(':empty')) {
    wrpScrollTimeOut = 0;
  }
  $(scrollDivID).find('.rsScrollAnimate').hide("slide", {
      direction: animateDirectionOut
    }, wrpScrollTimeOut,
    //Animation Complete Function
    function() {
      //Create new main image
      strHtml = $(QuestionID).find('.cCellRowText:nth(' + (wrapNo) + ')').html();
      $(scrollDivID).find('.rsScrollGridContent').html(strHtml);
      $(scrollDivID).find('.rsScrollGridContent').data('wrapNo', wrapNo)
      //Show new main image
      $(scrollDivID).find('.rsScrollAnimate').show("slide", {
          direction: animateDirectionIn
        }, wrpScrollTime,
        function() { //when animation complete allow buttons to be clicked again.
          scrollingGridSetAnswers(QuestionID, btnDivID, wrapNo, baseBtnClassSelect, checkedBtnClass, doAutonext);
          $(QuestionID).data('blnClickOn', true);
        });
    });
}

function scrollingGridSetAnswers(QuestionID, btnDivID, wrapNo, baseBtnClassSelect, checkedBtnClass, doAutonext) {
  let gotAnswer = false;
  $(QuestionID).find('.rsRow').eq(wrapNo).find('.cRadio, .cCheck').each(function(i) {
    if ($(this).prop('checked')) {
      gotAnswer = true;
      $(btnDivID).find(baseBtnClassSelect).eq(i).addClass(checkedBtnClass);
    } else {
      $(btnDivID).find(baseBtnClassSelect).eq(i).removeClass(checkedBtnClass);
    }
  });
  if (doAutonext) {
    if (gotAnswer) {
      $('#btnNext2').show();
    } else {
      $('#btnNext2').hide();
    }
  }
}
window.rsScrollingGridNextClick = function(QuestionID, btnDivID, scrollDivID, intNumRows, useimagesasbackground, doAutonext) {
  let wrapNo = parseInt($(scrollDivID).find('.rsScrollGridContent').data('wrapNo'));
  if (wrapNo < intNumRows - 1) {
    wrapNo++;
    animateScrollingGridRow(QuestionID, btnDivID, scrollDivID, wrapNo, 1, useimagesasbackground, doAutonext);
    return;
  }
  //Display buttons again
  $('#btnNext2').remove();
  $('#btnPrevious2').remove();
  $('#btnNext').show();
  $('#btnPrevious').show();
  $('#btnNext').click();
}

window.rsScrollingGridPreviousClick = function(QuestionID, btnDivID, scrollDivID, intNumRows, useimagesasbackground, doAutonext) {
  let wrapNo = parseInt($(scrollDivID).find('.rsScrollGridContent').data('wrapNo'));
  if (wrapNo > 0) {
    wrapNo--;
    animateScrollingGridRow(QuestionID, btnDivID, scrollDivID, wrapNo, -1, useimagesasbackground, doAutonext);
    return;
  }
  //Display buttons again
  $('#btnNext2').remove();
  $('#btnPrevious2').remove();
  $('#btnNext').show();
  $('#btnPrevious').show();
  $('#btnPrevious').click();
}
