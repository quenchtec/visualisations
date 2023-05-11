function rsMultiOE(rsQno, rsSubqIndex, rsParams) {
  //Check for WCAG, if the flag is set, we do not do anything as these buttons are not WCAG compliant at crrent
  if ($('#btnToggleWcag').val() == 1) {
    return false;
  }

  const QuestionID = "#" + rsQno; //This we use in selectors to stay within the question
  const allTXTInputs = $(QuestionID).find(".rsRowOpen").find("input[type='text']");
  //const arrAllRows = document.getElementsByClassName("rsRowOpen");
  const arrAllRows = allTXTInputs.find(".rsRowOpen");
  HideFollowTextBoxes();

  rsParams.blnHideNextOnDuplicates = (typeof rsParams.blnHideNextOnDuplicates === "undefined") ? true : rsParams.blnHideNextOnDuplicates; // Hide the next button if duplicates were located
  rsParams.blnHighlightOnDuplicates = (typeof rsParams.blnHighlightOnDuplicates === "undefined") ? true : rsParams.blnHighlightOnDuplicates; // Highlight if duplicates were located
  rsParams.blnHideNextOnDuplicates = true;
  if (rsParams.blnHideNextOnDuplicates) {
    rsParams.blnHighlightOnDuplicates = true;
  }

  $(allTXTInputs).on("keydown keyup click change", function(e) {
    HideNextTextBox("called from row 23");
    let intIndexTxt = e.currentTarget.getAttribute("aria-labelledby").split("_")[2];
    //Now making sure that the data-text is being always populated
    e.currentTarget.setAttribute("data-text", e.currentTarget.value);
    if ((checkUniqueInputs(allTXTInputs)) && ((e.currentTarget.getAttribute("data-text").length > 1))) {
      ShowNextTextBox(allTXTInputs, intIndexTxt);
    }
  });

  $('.cRadio').parent().click(function() {
    HideFollowTextBoxes();
  });

  $(arrAllRows).click(function(event) {
    event.preventDefault(); //let's block the click on the answer to stop messing up with the data-text attribute
    HideNextTextBox("called from row 43");
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
    //console.log("ShowNextTextBox function ");
    let txtInp = textInputs;
    let intInd = intIndex;
    if (typeof arrAllRows[intInd] !== 'undefined') {
      $(txtInp[intInd]).show();
      arrAllRows[intInd].style.display = 'flex';
    }
  }

  function HideNextTextBox(strtxt) {
    //console.log(strtxt);
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
    //full reset of all OpenEnd rows, except for the first one
    allTXTInputs[0].setAttribute('data-text', '');
    for (let x = 1; x < arrAllRows.length; x++) {
      arrAllRows[x].style.display = 'none';
      allTXTInputs[x].setAttribute('data-text', '');
    }
  }
}
