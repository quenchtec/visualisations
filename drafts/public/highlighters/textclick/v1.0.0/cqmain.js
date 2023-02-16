//Call function to display buttons. The functions should ideally be a JavaScript common file
//When called parameters rsQno, rsSubqIndex and an object containing the parameters set by the user, has been populated
rsVisButton(rsQno, rsSubqIndex, rsParams)

//Function for buttons
function rsVisButton(rsQno, rsSubqIndex, rsParam) {
  //Check for WCAG, if the flag is set, we do not do anything as these buttons are not WCAG compliant at crrent
  if ($('#btnToggleWcag').val() == 1) {
    return false;
  }

  rsParam.color1 = (typeof rsParam.color1 === "undefined") ? false : rsParam.color1;
  rsParam.color2 = (typeof rsParam.color2 === "undefined") ? false : rsParam.color2;
  rsParam.showTest = (typeof rsParam.showTest === "undefined") ? false : rsParam.showTest;
  rsParam.hasExclusive = (typeof rsParam.hasExclusive === "undefined") ? false : rsParam.hasExclusive;

  $('#btnNext').hide();
  $('.cQuestionText').after('<div class="Xconcept"></div>');

  $('head').before("<style>.like {background-color:" + rsParam.color1 + "}.dislike {background-color:" + rsParam.color2 + "}</style>");
  var wordsToClick = $('.cCellRowText .rs-ht p');


  $('.cCellRowText .rs-ht p').each(function(i) {
    if (i == wordsToClick.length - 1 && rsParam.hasExclusive)
      $('.Xconcept').after('<div id="btnHolder"><div id="Exclusive">' + $(this).text() + '</div></div>');
    else
      $('.Xconcept').append('<span class="clickable none">' + $(this).text() + '</span> ');
  });



  var totalNumber = $('.clickable').length; //saves total number of clickable words 
  //////////Determine if we have 2 or just one option 
  var hasLikeDislike = false;
  if ($('th[scope="col"]').length > 1) hasLikeDislike = true;
  if (!rsParam.showTest) {
    $('.rsRow').hide();
    $('.cCellHeader').hide();
  }
  var selectorPositive = "input[type='checkbox'][value='1']";
  var selectorNegative = "input[type='checkbox'][value='2']";


  /////////Back button functionality 
  $(selectorPositive).each(function(i) {
    if (this.checked && i != wordsToClick.length - 1 && rsParam.hasExclusive) $('.clickable').eq(i).removeClass('none').addClass('like');
    else if (this.checked && rsParam.hasExclusive && i == wordsToClick.length - 1) $('#Exclusive').addClass('exclusive-selected');
    else if (this.checked && !rsParam.hasExclusive && i == wordsToClick.length - 1) $('.clickable').eq(i).removeClass('none').addClass('like');
  });


  if (hasLikeDislike) {
    $(selectorNegative).each(function(i) {
      if (this.checked && i != wordsToClick.length - 1 && rsParam.hasExclusive) $('.clickable').eq(i).removeClass('none').addClass('dislike');
      else if (this.checked && rsParam.hasExclusive && i == wordsToClick.length - 1) $('#Exclusive').addClass('exclusive-selected');
      else if (this.checked && !rsParam.hasExclusive && i == wordsToClick.length - 1) $('.clickable').eq(i).removeClass('none').addClass('dislike');
    });
  }

  ///////// ///////// Exclusive Functionality IF WE HAVE 
  if (rsParam.hasExclusive) {

    $("#Exclusive").on('click', function() {
      $(this).addClass('exclusive-selected');
      $(".like,.dislike").removeClass('like').removeClass('dislike').addClass('none');
      $(selectorPositive).prop("checked", false);
      $(selectorPositive).eq(totalNumber).prop("checked", true);
      if (hasLikeDislike) {
        $(selectorNegative).prop("checked", false);
        $(selectorNegative).eq(totalNumber).prop("checked", true);
      }
      $('#btnNext').fadeIn(50);
    });
  } else
    $("#Exclusive").parent().hide();
  ////////// //////////SELECTING WORDS 
  $(".clickable").on('click', function() {
    $(selectorPositive).eq(totalNumber).prop("checked", false);
    if (hasLikeDislike) $(selectorNegative).eq(totalNumber).prop("checked", false);

    $('.exclusive-selected').removeClass('exclusive-selected');
    //$(":checkbox:checked").siblings().click(); 
    if ($(this).hasClass('none')) {
      $(this).removeClass('none').addClass('like');
      $(selectorPositive).eq($(this).index('.clickable')).prop("checked", true);
    } else {
      if ($(this).hasClass('like')) {
        if (hasLikeDislike) {
          $(this).removeClass('like').addClass('dislike');
          $(selectorPositive).eq($(this).index('.clickable')).prop("checked", false);
          $(selectorNegative).eq($(this).index('.clickable')).prop("checked", true);
        } else {
          $(this).removeClass('like').addClass('none');
          $(selectorPositive).eq($(this).index('.clickable')).prop("checked", false);
        }
      } else {
        $(this).removeClass('dislike').addClass('none');
        $(selectorPositive).eq($(this).index('.clickable')).prop("checked", false);
        if (hasLikeDislike) {
          $(selectorNegative).eq($(this).index('.clickable')).prop("checked", false);
        }
      }
    }
  });
}



function validate() {
  if ($(":radio:checked").length > 0 || $(":checkbox:checked").length > 0) {
    $('#btnNext').fadeIn(50);
    return true;
  } else {
    $('#btnNext').fadeOut(50);
    return false;
  }
}

$("body").click(function() {
  validate();
});