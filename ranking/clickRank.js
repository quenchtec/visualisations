function ClickRank(rsQno, rsSubqIndex, rsParams) {
  //Check for WCAG, if the flag is set, we do not do anything as these buttons are not WCAG compliant at crrent
  if ($('#btnToggleWcag').val() == 1) {
    return false;
  }
  //These parameters come from the settings the user have selected
  rsParams.autonext = (typeof rsParams.autonext === "undefined") ? true : rsParams.autonext;
  rsParams.min = (typeof rsParams.min === "undefined") ? 0 : rsParams.min;
  rsParams.max = (typeof rsParams.max === "undefined") ? 0 : rsParams.max;
  rsParams.hideNextMin = (typeof rsParams.hideNextMin === "undefined") ? true : rsParams.hideNextMin;
  rsParams.prescript = (typeof rsParams.prescript === "undefined") ? "" : rsParams.prescript;
  rsParams.postscript = (typeof rsParams.postscript === "undefined") ? "" : rsParams.postscript;

  //Check for prescript
  if (rsParams.prescript.length > 0) sParam.prescript;

  //Since there can be mutiple questions on a page, we must make sure all selectors are addressing the proper question (and subquestion) only
  const QuestionID = "#" + rsQno; //This we use in selectors to stay within the question
  const btnDivID = "#" + rsQno + "_btn"; //We create our own ID's that will be unique within the page and question
  const btnDivIDattr = rsQno + "_btn"; //Same id without # to use when we set the ID

  //Turn of autonext if more than one question/subquestion on the page
  if ($('.cCellSubQuestion').length > 1) {
    rsParams.autonext = false;
  }

  let index = 0;
  $(QuestionID).find('.rsRow').each(function() {
    $(this).css('justify-content', 'start');
    $(this).click(function() {
      checkClick(rsQno, rsParams, this);
    });
    $(this).find('td').each(function(i) {
      if (i == 0) {
        $(this).css('order', 2);
      }
      if (i == 1) {
        $(this).css({
          'order': '1',
        });
        let value = $(this).find('.cFInput').val();
        $(this).find('.cFInput').addClass('rsBtnRank');
        $(this).find('.cFInput').attr('readonly', true);
        if (value != '') {
          index++;
          $(this).find('.cFInput').addClass('rsBtnRankSelected');
        }
      }
      $(QuestionID).find('.cCellSubQuestion').attr('data-index', index);
    });
    //Check for hide min
    if (rsParams.min > 0 && $('.cCellSubQuestion').length == 1) {
      if (index < rsParams.min) $('#btnNext').hide();
    }
  });
  //Check for postscript
  if (rsParams.postscript.length > 0) sParam.postscript;
}

function checkClick(rsQno, rsParams, item) {
  const QuestionID = "#" + rsQno; //This we use in selectors to stay within the question	
  let index = $(QuestionID).find('.cCellSubQuestion').attr('data-index');
  const value = $(item).find('.cFInput').val();
  if (value == '') {
    //We clicked an empty row
    if (rsParams.max > 0 && index >= rsParams.max) {
      return;
    }
    if (index >= rsParams.max) $('#btnNext').show();
    index++;
    $(item).find('.cFInput').val(index);
    $(item).find('.cFInput').addClass('rsBtnRankSelected');
    $(QuestionID).find('.cCellSubQuestion').attr('data-index', index);
    if (rsParams.min > 0 && $('.cCellSubQuestion').length == 1) {
      if (index >= rsParams.min) $('#btnNext').show();
    }
    if (rsParams.max > 0 && rsParams.autonext) {
      if (index == rsParams.max) $('#btnNext').click();
    }
  } else {
    //We clicked on an already ranked row
    index = index - 1;
    if (index < 0) index = 0;
    $(item).find('.cFInput').removeClass('rsBtnRankSelected');
    $(item).find('.cFInput').val('');
    $(QuestionID).find('.cCellSubQuestion').attr('data-index', index);
    $(QuestionID).find('.rsRow').each(function() {
      const thisValue = $(this).find('.cFInput').val();
      if (thisValue != '') {
        if (thisValue > value) {
          $(this).find('.cFInput').val(thisValue - 1);
        }
      }
    });
    if (rsParams.min > 0 && $('.cCellSubQuestion').length == 1) {
      if (index < rsParams.min) $('#btnNext').hide();
    }
  }
}
