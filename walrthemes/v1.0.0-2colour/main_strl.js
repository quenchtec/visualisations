var devTest = false;
var straightLinerProtection = false;

$(document).ready(function () {
  localStorage.removeItem('strlner');
  devTest = window.location.search.includes('devtest');
  straightLinerProtection = window.location.search.includes('wcslpvmbmb');
  
  // Call your initial setup function
  cthemeff();
  cthemePageReady();
  tooltipshandle();
  if (devTest) console.log("call from DR");
  // Event delegation for click on .rsRow elements
  // Create a MutationObserver when the document is fully loaded
  var targetNode = document.getElementById("rsPanelMain");
  var config = { attributes: true, childList: true, subtree: true };
  var observer = new MutationObserver(function (mutationsList, observer) {
      for (var mutation of mutationsList) {
          if (mutation.type === "childList") {
              cthemePageReady(); // Call your function here
              if (devTest) console.log("log from Brfore Break and after cThemePageReady was called");
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
  if (devTest) console.log("putSomeClasses start");
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
  try {
    $("[id$='qual_check']").hide();
    
    if($("[id$='qual_check']").length > 0){
      const strlnerData = JSON.parse(localStorage.getItem('strlner')) || [];
      const formattedData = JSON.stringify(strlnerData, null, 2);
      $("[id$='qual_check']").find(".cTextInput").val(formattedData);
      $("#btnNext").click();
      localStorage.removeItem('strlner');
    }
  } catch (error) {
    console.error('Tried to store the straightliner', error);
  }

  
  if (typeof CustomGhostMessage === "undefined") {CustomGhostMessage = "Please, type in...";}
  if (typeof myCustomGhost != "undefined") {CustomGhostMessage = myCustomGhost[strID];}

  if (strID == "sv") {CustomGhostMessage = "Snälla, skriv in...";}
  
  if (typeof myCustomNext != "undefined") {customNext = myCustomNext[strID];}
  if (typeof myCustomPrevious != "undefined") {customPrev = myCustomPrevious[strID];}
  if (typeof myCustomError != "undefined") {customError = myCustomError[strID];}
  
  checkforsec();
  ghostText(CustomGhostMessage);
  custNavigationText(customNext,customPrev,customError);

  $(".rsSingleGrid, .rsMultiGrid").each(function () {
      if ((!$(this).hasClass("rsProcessedGrid")) && (!$(this).hasClass("rsCQ"))) {
          gridUpdate($(this));
          if (devTest) console.log("gridUpdate cthemePageReady");
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
  $("#btnNext").click(function(){strlcheck();debouncedScrollFunc();});
  putSomeClasses();
  if (devTest) console.log("putSomeClasses from theme ready");
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
  
  if (devTest) console.log(_theNext,_thePrevious,_theError);
  
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
  if (devTest) console.log("grid update start");
  var _grid_this;
  if (grid_this) {
      _grid_this = grid_this;
  } else {
      $(`.rsSingleGrid .rsMultiGrid`).each(function () {
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






function strlcheck() {
    let flag = 0;
    let totalSame = [];
    let traps = [];
    let trapsStat = [];
    let gridID;
    let newVariable;
    let respID = document.getElementById("rs_r").value==0 ? document.getElementById("rs_tr").value : document.getElementById("rs_r").value;

    if($(`[class$="Grid"]`).length){
        let inputsl = $(`[class$="Grid"] .rsRow:first`).find("td").length;
        $(`[class$="Grid"]`).each(function(){
            let coefficient;
            newVariable = $(this).parent().parent().parent().parent().prop("id");
            let _this = $(this).find(".rsRow");
            let checkers = _this.find('[id^="correct_"]').length;
            if (checkers) {
              for(let x=1; x < checkers+1; x++) {
                  let correct_value, trap_value;
                  _this.each(function(){
                    if($(this).find(`#correct_${x}`).length > 0){
                      correct_value = $(this).find("input:checked").attr("value");
                      //console.log(`#correct_${x}   `, $(this), $(this).find("input:checked"), $(this).find("input:checked").attr("value"), $(this).find("input:checked").prop("value"));
                    }
                    if($(this).find(`#trap_${x}`).length > 0){
                      trap_value = $(this).find("input:checked").attr("value");
                      //console.log(`#trap_${x}   `, $(this), $(this).find("input:checked"), $(this).find("input:checked").attr("value"), $(this).find("input:checked").prop("value"));
                    }
                  });
                  trapsStat.push("pass");
                  traps.push(`trap${x}`);

                flag += compareValues(correct_value, trap_value, inputsl);
                if(compareValues(correct_value, trap_value, inputsl)) {
                  trapsStat[x-1] = "fail";
                }
                
                if (devTest) console.log(`x: ${x},  flag:${flag},   ${correct_value},   ${trap_value},   inputs : ${inputsl}`);
              }
            }

          //Get all answers from the grid and calcularing the entropy index
                totalSame = [];
                $(this).find("input:checked").each(function() {totalSame.push(parseInt($(this).val()));});
                coefficient = calculateCoefficient(totalSame);
                updateLocalStorage(true, respID, coefficient, checkers, newVariable, traps, trapsStat);

          });
    }
}


/////////////////////////building the JSON for the coefficient and traps
function updateLocalStorage(flag, respID, coefficient, checkers, newVariable, traps, trapsStat) {
        const new_Variable = newVariable;
        const existing_Data = JSON.parse(localStorage.getItem('strlner')) || [];
        let personData = existing_Data.find(person => person.person_id === respID);
        
        if (!personData) {
            personData = {
                person_id: respID,
                labels: []
            };
            existing_Data.push(personData);
        }
        let existingLabel = personData.labels.find(label => label.label === new_Variable);
        const trapsData = [];
        let isStraightliner = coefficient < 10.0 ? 1 : 0;

        for (let i = 0; i < checkers; i++) {
          console.log(traps[i])
          trapsData.push({
              trap_id: traps[i],
              status: trapsStat[i]
          });
        }

        if (devTest) console.log(trapsData);
        let traps_triggered_value = trapsData !="" ? trapsData.filter(trap => trap.status === "fail").length : "";
  
        const newLabel = {
          label: new_Variable,
          is_straightliner: isStraightliner,
          straightliner_coefficient: coefficient,
          traps_triggered: traps_triggered_value,
          traps: trapsData
        };

        if (existingLabel) {
            // Update existing label
            Object.assign(existingLabel, newLabel);
        } else {
            personData.labels.push(newLabel);
        }
        localStorage.setItem('strlner', JSON.stringify(existing_Data));
}










function entropyIndex(values) {
    let valueCounts = {};
    values.forEach(v => {
        if (valueCounts[v] === undefined) valueCounts[v] = 0;
        valueCounts[v]++;
    });
    let probabilities = Object.values(valueCounts).map(count => count / values.length);
    probabilities = probabilities.filter(p => p > 0);
    let entropy = 0;
    probabilities.forEach(p => {entropy += -p * Math.log2(p);});
    return entropy;
}

function calculateCoefficient(values) {
    if (values.length === 0) return 0;
    let entropyValue = entropyIndex(values);
    let maxEntropy = Math.log2(values.length);
    return Math.round(100 * entropyValue / maxEntropy * 100) / 100;
}


function checkforsec() {
    if(straightLinerProtection && $(`[class$="Grid"]`).length){
        $(`[class$="Grid"] .rsRow`).each(function(){
            let _this = $(this);
            if ($(this).find('[id^="trap_"]').length > 0) {
                $(this).hide();
                $('[id^="trap_"]').each(function(){
                    _this.find("input").eq(Math.floor(_this.find("input").length / 2)).prop("checked", true);
                });
            }
        });
    }
}

function compareValues(correct_value, trap_value, inputsl) {
    //if (correct_value <= 3) {
        if (inputsl <= 7) {
            //if(correct_value <= 2 && trap_value > inputsl - 2){ //Opposite values
            if((correct_value <= 2 && trap_value <= 2) || (correct_value > (inputsl - 2) && trap_value > (inputsl - 2))){ //Same values
                return 1;
            }
        } else if (inputsl > 7) {
            //if(correct_value <= 3 && trap_value > inputsl - 3){ //Opposite values
            if((correct_value <= 3 && trap_value <= 3) || (correct_value > (inputsl - 3) && trap_value > (inputsl - 3))){ //Same values
                return 1;
            }
        }
    //}
    return 0;
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
