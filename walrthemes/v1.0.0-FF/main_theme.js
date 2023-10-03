$(document).ready(function() {
    // Create a MutationObserver when the document is fully loaded
   //console.log("doc ready");
 cthemePageReady();
    var targetNode = document.getElementById('rsPanelMain');
    var config = { attributes: true, childList: true, subtree: true };
    var observer = new MutationObserver(function(mutationsList, observer) {
        for(var mutation of mutationsList) {
            if (mutation.type === 'childList') {
                //console.log("call the theme in mutation");

                cthemePageReady(); // Call your function here
                $(".rsRow").click(function() {
                  putSomeClasses($(this))
                  putSomeClasses2()
                });
                  putSomeClasses3()

                break; // We've handled the mutation, no need to continue
            }
        }
    });
    observer.observe(targetNode, config);
});
function putSomeClasses(isThis) {
    console.log("1");
  // Let's set some classes
    let $answers = $(isThis).find("input");
    if ($answers.prop("checked")) {
      $answers.addClass("rsSelected");
    } else {
      $answers.removeClass("rsSelected");
    }
  }
}

function putSomeClasses2() {
    console.log("2");
    $(".rsRow").click(function() {
    console.log("2 clicked");
  // Let's set some classes
    let $answers = $(this).find("input");
    if ($answers.prop("checked")) {
      $answers.addClass("rsSelected");
    } else {
      $answers.removeClass("rsSelected");
    }
    });
}

function putSomeClasses3() {
    console.log("3");
    $(".rsRow").click(function() {
    console.log("3 clicked");
  // Let's set some classes
    let $answers = $(this).find("input");
    if ($answers.prop("checked")) {
      $answers.addClass("rsSelected");
    } else {
      $answers.removeClass("rsSelected");
    }
    });
}


function cthemePageReady() {
    //console.log("inside cthemePageReady");

    ghostText("Please, type in...");
   $(".rsSingleGrid, .rsMultiGrid").each(function(){
     //if(!$(this).hasClass("rsProcessedGrid")){
     if((!$(this).hasClass("rsProcessedGrid")) && (!$(this).hasClass("rsCQ"))){
       console.log("rsProcessedGrid is not in calsses");
         gridUpdate($(this));
     }
   });
    function isMobileDevice() {
        return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
    }
    
    function ghostText(custText) {
        //console.log("TPR GT call");
        $('.cTextInput').each(function () {
            $(this).attr("placeholder", custText);
        });
    }
    
    function gridUpdate(grid_this) {
      let _grid_this = grid_this;
      let gridID = $(_grid_this).prop("id");

      
      if (($(_grid_this).hasClass("rsSingleGrid") || $(_grid_this).hasClass("rsMultiGrid")) && (!$(_grid_this).hasClass("rsCQ")) && (!$(_grid_this).hasClass("rsProcessedGrid"))) {
            //let gridID = $(".rsSingleGrid, .rsMultiGrid").prop("id");
            let gridIND = gridID.split("_")[1];
             console.log("add rsProcessedGrid to ", gridID);
              $("#"+gridID).addClass("rsProcessedGrid");
        
            //rearrange the grid for mobiles
            if (isMobileDevice()) {
                //console.log("TPR MOB GU call");
                setTimeout(function () {
                  $(".rsRow").each(function () { $(this).children(".cCell").each(function (e) { $(this).append($("#h_" + gridIND + "_" + e).clone()); }); });
                  $("td.cCellHeader").parent().remove();
                }, 100);
            } else {
                //console.log("TPR DESK GU call");
                let colLength = $('#' + gridID).find(".cCellHeader").not(".cCellFirstHeader").length;
                var cHeight = 19;
                $(".cCellFirstHeader").css("min-width", 100 / colLength + 'rem');
                $('#' + gridID).find(".cCellHeader").not(".cCellFirstHeader").css("width", (100 / colLength) / 2 + 'rem');
                setTimeout(function () {
                    $('.rsRow').find(".rs-ht").each(function () { if ($(this)[0].clientHeight > cHeight) { cHeight = $(this)[0].clientHeight; } });
                    $(".rsRow").each(function () { $(this).css("height", cHeight + "px"); });
                }, 100);
            }
        }
    }
}





