function rsTxtArea(rsQno,rsSubqIndex,rsParams) {

    //Check for WCAG, if the flag is set, we do not do anything as these buttons are not WCAG compliant at crrent
  if ($('#btnToggleWcag').val() == 1) {
    return false;
  }
  let QuestionID = "#" + rsQno; //This we use in selectors to stay within the question
  let SubQIndex = rsSubqIndex; //This we use in selectors to stay within the question
  $(QuestionID).find(".rsRowOpen").addClass("rsCuQeTextArea");
  $(QuestionID).find(".cTable").addClass("rsCQTextArea").addClass("rsCQ");
 
};
