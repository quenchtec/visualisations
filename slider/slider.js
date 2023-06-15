//Slider functions
function rsVisHoriSlider(rsQno, rsSubqIndex, rsParams) { // Creates a basic slider for a Grid Single
  //Check for WCAG, if the flag is set, we do not do anything as these sliders are not WCAG compliant at current
  if ($('#btnToggleWcag').val() == 1) {
    return false;
  }

  //These parameters come from the settings the user have selected
  rsParams.prescript = (typeof rsParams.prescript === "undefined") ? "" : rsParams.prescript;
  rsParams.postscript = (typeof rsParams.postscript === "undefined") ? "" : rsParams.postscript;
  rsParams.intExclColumnLeft = (typeof rsParams.intExclColumnLeft === "undefined") ? 1 : rsParams.intExclColumnLeft; //Exclude Columns Left
  rsParams.intExclColumnRight = (typeof rsParams.intExclColumnRight === "undefined") ? 1 : rsParams.intExclColumnRight; //Exclude Columns Right
  rsParams.sldHeight = (typeof rsParams.sldHeight === "undefined") ? "30px" : rsParams.sldHeight; //Slider Height
  rsParams.sliderHeading = (typeof rsParams.sliderHeading === "undefined") ? "lr" : rsParams.sliderHeading; //Debug mode
  rsParams.showFloats = (typeof rsParams.showFloats === "undefined") ? "none" : rsParams.showFloats; //Debug mode
  rsParams.debug = (typeof rsParams.debug === "undefined") ? false : rsParams.debug; //Debug mode

  //Check for prescript
  if (rsParams.prescript.length > 0) rsParam.prescript;

  //Since there can be mutiple questions on a page, we must make sure all selectors are addressing the proper question (and subquestion) only
  const QuestionID = "#" + rsQno; //This we use in selectors to stay within the question

  //Exit function if question type not valid
  let structOK = true;
  //Number of sub-questions should be 1 and type singlegrid
  if ($(QuestionID).find('.cCellSubQuestion').length != 1) structOK = false;
  if ($(QuestionID).find('.rsSingleGrid').length != 1) structOK = false;


  if (structOK == false) {
    if (rsParams.debug) alert('Structure not OK for iQuest e.q. Wrong question type, this iQuest requires a single choice grid question');
    return false;
  }

  //Undo  possible flex layout fromn standard Theme by adding our own class
  $(QuestionID).find('.rsSingleGrid').addClass('rsGridSlider');
  //Some styling setup
  const sldHandleBackground = "var(--interactive_background_color)";
  const sldHandleCheckedBackground = "var(--button_background_color)";
  const sldBackground = "var(--question_row_background_color)"; //Slider background colour
  const sldFillColour = "var(--page_background_color)"; //Slider fill colour

  //    try {
  let intNumCol = $(QuestionID).find('.cCellHeader:not(.cCellFirstHeader)').length; //Number of Columns
  if ((rsParams.intExclColumnLeft + rsParams.intExclColumnRight) >= (intNumCol - 1)) {
    if (rsParams.debug) alert('Too many columns excluded to create slider.');
    return false;
  }
  let strHTML = '';
  let intInitVal = 0;

  //Hide all Answer Cells (radio buttons)
  if (!rsParams.debug) $(QuestionID).find('.cCell').hide();

  //Number of stops on slider
  let intSliderStops = intNumCol - (rsParams.intExclColumnLeft + rsParams.intExclColumnRight);
  //Compute column widths
  let cellWidth = Math.min((50 / intSliderStops), 10) + "%";
  //Handle headings
  //Switch to left right layout if less than 3 slider stops
  if ((rsParams.sliderHeading == "lcr") && (intSliderStops < 3)) rsParams.sliderHeading = "lr"
  //Common variabkes for header processing
  let oddEven = false;
  let cellsLeft = 0;
  let widthLeft = "";
  let cellsRight = 0;
  let widthRight = "";
  let cellsCenter = 0;
  let widthCenter = "";
  let objHeadRow;

  switch (rsParams.sliderHeading) {
    case "none":
      //If no exclusions, hide the whole row
      if (intNumCol === intSliderStops) {
        $(QuestionID).find('.cCellHeader.cCellFirstHeader').parent().hide();
      } else {
        //Blind out all heaers above slider, setting the visibility
        objHeadRow = $(QuestionID).find('.cCellHeader.cCellFirstHeader').parent();
        for (let i = 1; i <= intNumCol; i++) {
          if ((i <= rsParams.intExclColumnLeft) || (i > (rsParams.intExclColumnLeft + intSliderStops))) {
            $(objHeadRow).find('th,td').eq(i).css('width', cellWidth);
          } else $(objHeadRow).find('th,td').eq(i).css('visibility', 'hidden');
        }
      }
      break;
    case "lr":
      //Odd or even columns, compute colspan and widths
      oddEven = false;
      cellsLeft = parseInt(intSliderStops / 2);
      cellsRight = intSliderStops - cellsLeft;
      widthLeft = "25%";
      widthRight = "25%";
      if (intSliderStops % 2 == 1) oddEven = true;
      if (oddEven) {
        widthLeft = (50 * cellsLeft / intSliderStops) + "%";
        widthRight = (50 * cellsRight / intSliderStops) + "%";
      }
      objHeadRow = $(QuestionID).find('.cCellHeader.cCellFirstHeader').parent();
      for (let i = 1; i <= intNumCol; i++) {
        if ((i <= rsParams.intExclColumnLeft) || (i > (rsParams.intExclColumnLeft + intSliderStops))) {
          $(objHeadRow).find('th,td').eq(i).css('width', cellWidth);
        } else if (i == (rsParams.intExclColumnLeft + 1)) {
          $(objHeadRow).find('th,td').eq(i).css({
            'width': widthLeft,
            'text-align': 'left'
          }).attr('colspan', cellsLeft);
        } else if (i == (rsParams.intExclColumnLeft + intSliderStops)) {
          $(objHeadRow).find('th,td').eq(i).css({
            'width': widthRight,
            'text-align': 'right'
          }).attr('colspan', cellsRight);
        } else {
          $(objHeadRow).find('th,td').eq(i).hide();
        }
      }
      break;
    case "lcr":
      oddEven = false; //Here used to check for divisable by 3
      cellsLeft = parseInt(intSliderStops / 3);
      cellsRight = cellsLeft;
      cellsCenter = intSliderStops - cellsLeft - cellsRight;
      widthLeft = "16.666667%";
      widthRight = "16.666667%";
      widthCenter = "16.666667%";
      if (intSliderStops % 3 != 0) oddEven = true;
      if (oddEven) {
        widthLeft = (50 * cellsLeft / intSliderStops) + "%";
        widthRight = (50 * cellsRight / intSliderStops) + "%";
        widthCenter = (50 * cellsCenter / intSliderStops) + "%";
      }
      objHeadRow = $(QuestionID).find('.cCellHeader.cCellFirstHeader').parent();
      for (let i = 1; i <= intNumCol; i++) {
        if ((i <= rsParams.intExclColumnLeft) || (i > (rsParams.intExclColumnLeft + intSliderStops))) {
          $(objHeadRow).find('th,td').eq(i).css('width', cellWidth);
        } else if (i == (rsParams.intExclColumnLeft + 1)) {
          $(objHeadRow).find('th,td').eq(i).css({
            'width': widthLeft,
            'text-align': 'left'
          }).attr('colspan', cellsLeft);
        } else if (i == (rsParams.intExclColumnLeft + 1 + cellsLeft + parseInt(cellsCenter / 2))) {
          $(objHeadRow).find('th,td').eq(i).css({
            'width': widthCenter,
            'text-align': 'center'
          }).attr('colspan', cellsCenter);
        } else if (i == (rsParams.intExclColumnLeft + intSliderStops)) {
          $(objHeadRow).find('th,td').eq(i).css({
            'width': widthRight,
            'text-align': 'right'
          }).attr('colspan', cellsRight);
        } else {
          $(objHeadRow).find('th,td').eq(i).hide();
        }
      }
      break;
  }
  //Handle floats
  let floatTexts = [];
  switch (rsParams.showFloats) {
    case "none":
      break;
    case "text":
      $(QuestionID).find('.cCellHeader:not(:first)').each(function(j) {
        if ((j >= rsParams.intExclColumnLeft) && (j < (intSliderStops + rsParams.intExclColumnLeft))) {
          let floatText = $(this).text();
          floatText = floatText.trim();
          floatTexts.push(floatText);
        }
      });
      break;
    case "codes":
      $(QuestionID).find('.cCellHeaderCode:not(:first)').each(function(j) {
        if ((j >= rsParams.intExclColumnLeft) && (j < (intSliderStops + rsParams.intExclColumnLeft))) {
          let floatText = $(this).find('.cValue').text();
          floatText = floatText.replace('[', '').replace(']', '');
          floatTexts.push(floatText);
        }
      });
      break;
  }
  //Build HTML for sliders, loop all rows
  $(QuestionID).find('.rsRow').each(function(i) {
    strHTML = '<td colspan="' + intSliderStops + '" class="cSliderCell"><div class="cSlider" alt="' + i + '" style="height: ' + rsParams.sldHeight + '" ></div></td>';
    //Reshow radiobutons on excluded columns left
    if (rsParams.intExclColumnLeft > 0) {
      $(this).find('.cCell:lt(' + rsParams.intExclColumnLeft + ')').show().css({
        'width': cellWidth
      });
      $(this).find('.cCell:lt(' + rsParams.intExclColumnLeft + ')').find('.cRadio').addClass('cRadioExcl');
      $(this).find('.cCell:lt(' + rsParams.intExclColumnLeft + ')').find('.cRadio').attr('trow', i);
    }
    //Reshow radiobutons on excluded columns right
    if (rsParams.intExclColumnRight > 0) {
      intShowRight = intNumCol - (rsParams.intExclColumnRight + 1);
      $(this).find('.cCell:gt(' + intShowRight + ')').show().css({
        'width': cellWidth
      });
      $(this).find('.cCell:gt(' + intShowRight + ')').find('.cRadio').addClass('cRadioExcl');
      $(this).find('.cCell:gt(' + intShowRight + ')').find('.cRadio').attr('trow', i);
    }
    //Add the HTML
    $(this).find('.cCell:eq(' + rsParams.intExclColumnLeft + ')').before(strHTML);
  });


  //Setup the slider
  $(QuestionID).find('.cSlider').slider({
    animate: true,
    range: "min",
    min: 0,
    max: (intSliderStops - 1),
    value: intInitVal,
    stop: function() {
      //Move slider to centre of the column
      let intCode = parseInt($(this).slider('option', 'value')); //The relevant column calculated on where the slider is stopped

      if (intCode >= intSliderStops) {
        intCode = intSliderStops - 1;
      }
      // Set Answers
      const intRow = $(this).attr('alt');
      const objCurrRow = $(QuestionID).find('.rsRow').eq(intRow);
      $(objCurrRow).find('.checked').removeClass('checked');
      $(objCurrRow).find('.cRadio').eq(intCode + rsParams.intExclColumnLeft).prop('checked', true);
      //Set the handle to indicate that we have done a selection
      $(this).find('.ui-slider-handle').css('background', sldHandleCheckedBackground);
    }
  });
  //Set handler for excluded radio buttons
  $(QuestionID).find('.cRadioExcl').change(function() {
    //Reset the slider, position and backgroud color
    $(QuestionID).find('.cSlider').eq($(this).attr('trow')).slider('option', 'value', intInitVal);
    $(QuestionID).find('.cSlider').eq($(this).attr('trow')).find('.ui-slider-handle').css('background', sldHandleBackground);
  });
  $(QuestionID).find('.cRadioExcl').keydown(function() {
    $(QuestionID).find('.cSlider').eq($(this).attr('trow')).slider('option', 'value', intInitVal);
    $(QuestionID).find('.cSlider').eq($(this).attr('trow')).find('.ui-slider-handle').css('background', sldHandleBackground);
  });
  //Adjust the handle to be 8px more than slider 
  const sldHandleHeight = parseInt($(QuestionID).find('.cSlider').eq(0).height()) + 8;
  $(QuestionID).find('.ui-slider .ui-slider-handle').css('height', sldHandleHeight + 'px');
  $(QuestionID).find('.ui-slider-range').css('background', sldFillColour);
  $(QuestionID).find('.cSlider').css('background', sldBackground);
  $(QuestionID).find('.cSlider').css('margin-bottom', '5px');
  $(QuestionID).find('.ui-slider-handle').css({
    'background': sldHandleBackground,
    'border': '2px solid var(--button_border_color)'
  });

  //Set Previous answers
  let intChecked = 0;
  $(QuestionID).find('.rsRow').each(function(i) {
    intChecked = $(this).find('.cRadio:checked').length;
    if (intChecked != 0) {
      const radioButtons = $(this).find('.cRadio');
      const selectedIndex = radioButtons.index(radioButtons.filter(':checked'));
      if ($(this).find('.cRadio').eq(selectedIndex).hasClass('cRadioExcl') == false) {
        $(this).find('.cSlider').slider('option', 'value', (selectedIndex - 1));
        $(this).find('.ui-slider-handle').css('background', sldHandleCheckedBackground);
      }
    }
  });

  $(QuestionID).find('.cCellHeaderCode:first').parent().hide();

  //Check for postscript
  if (rsParams.postscript.length > 0) rsParam.postscript;
  //Remove any custom error classe
  //////
  //    }
  //    catch (err) {
  //        if (debug == true) {
  //            txt = "There was an error on this page.\n\n";
  //            txt += "Error description: " + err.message + "\n\n";
  //            txt += "Click OK to continue.\n\n";
  //            alert(txt);
  //        }
  //        //Clean up
  //        $('.cCell').show();
  //        $('.cSliderCell').remove();
  //    }
}
