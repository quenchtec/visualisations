
$(document).ready(function () {
  // Call your initial setup function
  cthemeff();
  cthemePageReady();
  tooltipshandle();
  if (/^(testlink|preview|review)\./.test(window.location.hostname)) console.log("call from DR");
  // Event delegation for click on .rsRow elements
  // Create a MutationObserver when the document is fully loaded
  var targetNode = document.getElementById("rsPanelMain");
  var config = { attributes: true, childList: true, subtree: true };
  var observer = new MutationObserver(function (mutationsList, observer) {
      for (var mutation of mutationsList) {
          if (mutation.type === "childList") {
              cthemePageReady(); // Call your function here
              if (/^(testlink|preview|review)\./.test(window.location.hostname)) console.log("log from Brfore Break and after cThemePageReady was called");
              break; // We've handled the mutation, no need to continue
          }
      }
  });
  observer.observe(targetNode, config);
});

function cthemeff() {
  // Detect Firefox using JavaScript
  if (navigator.userAgent.indexOf("Firefox") != -1) {
      // User is using Firefox
      var firefoxStyles = document.createElement("link");
      firefoxStyles.rel = "stylesheet";
      firefoxStyles.type = "text/css";
      firefoxStyles.href = "https://quenchtec.github.io/visualisations/walrthemes/v1.0.0-2colour/main_theme_ff_only.css"; // Link to your Firefox-specific styles
      document.head.appendChild(firefoxStyles);
  }
}

function putSomeClasses() {
  if (/^(testlink|preview|review)\./.test(window.location.hostname)) console.log("putSomeClasses start");
  var $cTables = $(".cTable");
  $cTables.each(function () {
      if (($(this).hasClass("rsSingle") || $(this).hasClass("rsMulti")) && !$(this).hasClass("mobileGrid") && !$(this).hasClass("desktopGrid")) {
          $(this).find(".rsRow").each(function(){
              $(this).children(".cRowBlockText:not(:has(select))").addClass("GroupingHeader");
              if ($(this).find("input").prop("checked")) {
                $(this).addClass("rsSelected");
              } else {
                $(this).removeClass("rsSelected");
              }
          });

          $(this).find(".rsRow, .rsRow .cCellOpenText .cTextInput").on("click keyup", function () {
            $(".rsRow").each(function () {
              if ($(this).find("input").prop("checked")) {
                $(this).addClass("rsSelected");
              } else {
                $(this).removeClass("rsSelected");
              }
            });
          });
        
      } else if ($(this).hasClass("mobileGrid")) {
          $(this).find(".rsRow").find(".cCell").on("click", function () {
              $(this).parent().find(".cCell").each(function () {
                  if ($(this).find("input").prop("checked")) {
                      $(this).addClass("rsSelected");
                  } else {
                      $(this).removeClass("rsSelected");
                  }
              });
             $(this).parent().find(".rsRow").removeClass("rsSelected");
          });
      } else if ($(this).hasClass("desktopGrid")) {
           $(this).find(".rsRow").find("input").on("change", function () {
              $(this).parent().parent().find(".cCell").each(function () {
                  if ($(this).find("input").prop("checked")) {
                    $(this).addClass("rsGridCellSelected");
                  } else {
                    $(this).removeClass("rsGridCellSelected");
                  }
              });
          });
      }
  });
}

function isMobileDevice() {
  if(navigator.userAgent.indexOf('iPhone') > -1 ){
    document.querySelector("[name=viewport]").setAttribute("content","");
    document.querySelector("[name=viewport]").setAttribute("content","width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no");
  }
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || navigator.vendor || window.opera);
}

function cthemePageReady() {
  var strID = $('#rs_lang').val();
  var customNext = "";
  var customPrev = "";
  var customError = "";
  try {
    removeFocusFromAllElements();
  } catch (error) {
    console.error('An error occurred while scrolling:', error);
  }
  if (typeof CustomGhostMessage === "undefined") {CustomGhostMessage = "Please, type in...";}
  if (typeof myCustomGhost != "undefined") {CustomGhostMessage = myCustomGhost[strID];}

  if (strID == "sv") {CustomGhostMessage = "Snälla, skriv in...";}
  
  if (typeof myCustomNext != "undefined") {customNext = myCustomNext[strID];}
  if (typeof myCustomPrevious != "undefined") {customPrev = myCustomPrevious[strID];}
  if (typeof myCustomError != "undefined") {customError = myCustomError[strID];}

  ghostText(CustomGhostMessage);
  custNavigationText(customNext,customPrev,customError);

  $(".rsSingleGrid, .rsMultiGrid").each(function () {
      if ((!$(this).hasClass("rsProcessedGrid")) && (!$(this).hasClass("rsCQ"))) {
          gridUpdate($(this));
          if (/^(testlink|preview|review)\./.test(window.location.hostname)) console.log("gridUpdate cthemePageReady");
      }
  });

  if(navigator.userAgent.indexOf('iPhone') > -1 ){
    document.querySelector("[name=viewport]").setAttribute("content","");
    document.querySelector("[name=viewport]").setAttribute("content","width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no");
  }

  const scrollFunc = () => {
    var targetElement = document.querySelector('.progressContainer');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      debouncedScrollFunc();
    }
  };

  const debouncedScrollFunc = debounce(scrollFunc, 200); // Adjust the delay as needed
  $("#btnNext").click(function(){debouncedScrollFunc();});
  putSomeClasses();
  if (/^(testlink|preview|review)\./.test(window.location.hostname)) console.log("putSomeClasses from theme ready");
}

function removeFocusFromAllElements() {
    var btnNext = document.getElementById("btnNext");
    if (btnNext === document.activeElement) {
        btnNext.blur();
    }
}

function custNavigationText(theNext, thePrevious, theError) {
  var _theNext, _thePrevious, _theError;
  if (typeof theNext != "undefined") {_theNext = theNext;} else {_theNext = '';}
  if (typeof thePrevious != "undefined") {_thePrevious = thePrevious;} else {_thePrevious = '';}
  if (typeof theError != "undefined") {_theError = theError;} else {_theError = '';}
  
  if (/^(testlink|preview|review)\./.test(window.location.hostname)) console.log(_theNext,_thePrevious,_theError);
  
  if((_theNext !="") && (_theNext !=" ") && (_theNext.length > 1)) {$('#btnNext').val(_theNext);}
  if((_thePrevious !="") && (_thePrevious !=" ") && (_thePrevious.length > 1)) {$('#btnPrevious').val(_thePrevious);}
  if((_theError !="") && (_theError !=" ") && (_theError.length > 1)) {$('.cError').val(_theError);}
}

function ghostText(custText) {
  $('.cTextInput').each(function () {
      $(this).attr("placeholder", custText);
  });
}

function gridUpdate(grid_this) {
  if (/^(testlink|preview|review)\./.test(window.location.hostname)) console.log("grid update start");
  var _grid_this;
  if (grid_this) {
      _grid_this = grid_this;
  } else {
      $(".rsSingleGrid, .rsMultiGrid").each(function () {
          if ((!$(this).hasClass("rsProcessedGrid")) && (!$(this).hasClass("rsCQ"))) {
              _grid_this = $(this);
          }
      });
  }

  let gridID = $(_grid_this).prop("id");

  if (($(_grid_this).hasClass("rsSingleGrid") || $(_grid_this).hasClass("rsMultiGrid")) && (!$(_grid_this).hasClass("rsCQ")) && (!$(_grid_this).hasClass("rsProcessedGrid"))) {
      let gridIND = gridID.split("_")[1];
      $("#" + gridID).addClass("rsProcessedGrid");
      if (isMobileDevice()) {
          $(".rsProcessedGrid").addClass("mobileGrid");
          setTimeout(function () {
              $(".rsRow").each(function () {
                $(this).children(".cCell").each(function (e) {
                  $(this).append($("#h_" + gridIND + "_" + e).clone());
                });
              });
              $("td.cCellHeader").parent().remove();
          }, 200);
      } else {
          $(".rsProcessedGrid").addClass("desktopGrid");
          setTimeout(function () {
              //let colLength = $('#' + gridID).find(".cCellHeader").not(".cCellFirstHeader").length;
              let colLength = $('#' + gridID).find(".cCellHeader").length;
              let gridWidth = $('#' + gridID).find(".rsHeaderRow")[0].clientWidth;
              var cHeight = 40;
              var cWidth = 0;
              //console.log(gridWidth);
              $('#' + gridID).find(".rsHeaderRow").css("width", gridWidth+"px");
              $('#' + gridID).find(".cCellFirstHeader").css("min-width", '30%');
              $('#' + gridID).find(".cCellFirstHeader").css("width", ((gridWidth * 1.2) / colLength) + 'px');
              $('#' + gridID).find(".cCellFirstHeader").addClass("revisedCellFirstHeader");

              $('#' + gridID).find(".cCellHeader").not(".cCellFirstHeader").css("min-width", (50 / colLength-1) + '%');
              //$('#' + gridID).find(".cCellHeader").not(".cCellFirstHeader").css("width", (gridWidth / (colLength+1)) + 'px');
              $('#' + gridID).find(".cCellHeader").not(".cCellFirstHeader").css("width", (50 / colLength-1) + '%');

              $('#' + gridID).find(".cCellHeader").not(".cCellFirstHeader").each(function(){if(cWidth < $(this)[0].clientWidth) {cWidth = $(this)[0].clientWidth;$(this).addClass("revisedColumn");}});
              //$('#' + gridID).find(".cCellHeader").not(".cCellFirstHeader").css("min-width", (cWidth * 0.8) + 'px');
              $('#' + gridID).find(".cCellHeader").not(".cCellFirstHeader").css("width", cWidth + 'px');
            
              $(".cCellFirstHeader").css("max-width", (100-(colLength*10))+"%");
              $(".cCellFirstHeader").css("width", "auto");
              //$(".cCellFirstHeader").css("width", gridWidth-((cWidth * 1.5)*colLength) + 'px');

              $('.rsRow').find(".rs-ht").each(function () {if (($(this)[0].clientHeight > cHeight) && ($(this)[0].clientHeight <=70)) { cHeight = $(this)[0].clientHeight; } });
              $(".rsRow").each(function () { $(this).css("height", cHeight + "px"); });
          }, 350);
      }
  }
}

function debounce(func, timeout = 500) {
  let timer;
  return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

  function adjustTooltipPosition(tooltip, element) {
    var tooltipWidth = tooltip.outerWidth();
    var tooltipLeft = element.offset().left + element.outerWidth() / 2 - tooltipWidth / 2;
    var windowWidth = $(window).width();
    if (tooltipLeft < 0) {
      tooltipLeft=0;
      tooltip.css('left', '');
    } else if (tooltipLeft + tooltipWidth > windowWidth) {
      tooltipLeft = (windowWidth - tooltipWidth);
      tooltip.css('left', tooltipLeft);
    }
  }
  function tooltipshandle(){
    var tooltipTimeout;
    $(".tooltip").mouseenter(function(){
      var $tooltip = $(this).find('.tooltiptext');
      var _this = $(this);
      var delay = 500;
      tooltipTimeout = setTimeout(function(){
        $tooltip.css("visibility", "visible").animate({opacity: 1}, 350);
        adjustTooltipPosition($tooltip, _this);
      }, delay);
    }).mouseleave(function(){
      clearTimeout(tooltipTimeout);
      var $tooltip = $(this).find('.tooltiptext');
      $tooltip.css("visibility", "hidden").animate({opacity: 0}, 350);
    });
  }
window.addEventListener('resize', debounce(function (event) {
  var $tooltips = $('.tooltip .tooltiptext');
  
  // Check if there are any tooltips on the page
  if ($tooltips.length > 0) {
      var $element = $('.tooltip');
      adjustTooltipPosition($tooltips, $element);
  }
  if (window.innerWidth > 800) {
      if ($(".rsProcessedGrid").hasClass("mobileGrid")) {
          $(".rsProcessedGrid").removeClass("mobileGrid");
          $(".rsProcessedGrid").addClass("desktopGrid");
          cthemePageReady();
          gridUpdate();
      }
  } else {
      if (isMobileDevice()){
          if (!$(".rsProcessedGrid").hasClass("mobileGrid")) {
              $(".rsProcessedGrid").addClass("mobileGrid");
              $(".rsProcessedGrid").removeClass("desktopGrid");
              cthemePageReady();
              gridUpdate();
          }
      }
  }
}, 500));
