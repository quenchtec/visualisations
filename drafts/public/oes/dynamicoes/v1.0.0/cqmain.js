function rsMultiOE(rsQno, rsSubqIndex, rsParams) {
  //Check for WCAG, if the flag is set, we do not do anything as these buttons are not WCAG compliant at crrent
  if ($('#btnToggleWcag').val() == 1) {
    return false;
  }

  const QuestionID = "#" + rsQno; //This we use in selectors to stay within the question
  const allTXTInputs = $(QuestionID).find(".rsRowOpen").find("input[type='text']");
  const arrAllRows = document.getElementsByClassName("rsRowOpen");
  HideFollowTextBoxes();
  rsParams.blnHideNextOnDuplicates = (typeof rsParams.blnHideNextOnDuplicates === "undefined") ? false : rsParams.blnHideNextOnDuplicates; // Hide the next button if duplicates were located
  rsParams.blnHighlightOnDuplicates = (typeof rsParams.blnHighlightOnDuplicates === "undefined") ? false : rsParams.blnHighlightOnDuplicates; // Highlight if duplicates were located

  if (rsParams.blnHideNextOnDuplicates) {
    rsParams.blnHighlightOnDuplicates = true;
  }
  $(allTXTInputs).on("keydown keyup click change", function(e) {
    HideNextTextBox();
    let intIndexTxt = e.currentTarget.getAttribute("aria-labelledby").split("_")[2];
    if ((checkUniqueInputs(allTXTInputs)) && (e.currentTarget.getAttribute("data-text").length > 1)) {
      ShowNextTextBox(allTXTInputs, intIndexTxt);
    }
  });

  $('.cRadio').parent().click(function() {
    HideFollowTextBoxes();
  });
  $(arrAllRows).click(function(event) {
    event.preventDefault(); //let's block the click on the answer to stop messing up with the data-text attribute
    HideNextTextBox();
  });

  function checkUniqueInputs(textInputs) {
    let values = {};
    let duplicates = false;
    let txtInp = textInputs;
    $(txtInp).each(function() {
      if ((values[$(this).val()] !== undefined) && ($(this).val() != "")) {
        duplicates = true;
        if (rsParams.blnHighlightOnDuplicates) {
          $(this).addClass('oeShowError');
        }
      } else {
        $(this).removeClass('oeShowError');
      }
      values[$(this).val()] = true;
    });
    if (duplicates) {
      if (rsParams.blnHideNextOnDuplicates) {
        $("#btnNext").hide();
        return false;
      } else {
        return true;
      }

    } else {
      $("#btnNext").show();
      return true;
    }
  }

  function ShowNextTextBox(textInputs, intIndex) {
    let txtInp = textInputs;
    let intInd = intIndex;
    if (typeof arrAllRows[intInd] !== 'undefined') {
      $(txtInp[intInd]).show();
      arrAllRows[intInd].style.display = 'flex';
    }
  }

  function HideNextTextBox() {
    let maxVal = arrAllRows.length - 1;
    for (let x = maxVal; x > 1; x--) {
      if ((allTXTInputs[x - 1].getAttribute('data-text') != '') || (allTXTInputs[x].getAttribute('data-text') != '')) {
        break;
      }
      if ((allTXTInputs[x - 1].getAttribute('data-text') == '') && (allTXTInputs[x].getAttribute('data-text') == '')) {
        arrAllRows[x].style.display = 'none';
        allTXTInputs[x].setAttribute('data-text', '');
      }
    }
  }

  function HideFollowTextBoxes() {
    allTXTInputs[0].setAttribute('data-text', '');
    for (let x = 1; x < arrAllRows.length; x++) {
      arrAllRows[x].style.display = 'none';
      allTXTInputs[x].setAttribute('data-text', '');
    }
  }
}