$(document).ready(function () {
  // Call your initial setup function
  cthemePageReady();
  //putSomeClasses();
  // Event delegation for click on .rsRow elements


  // Create a MutationObserver when the document is fully loaded
  var targetNode = document.getElementById("rsPanelMain");
  var config = { attributes: true, childList: true, subtree: true };
  var observer = new MutationObserver(function (mutationsList, observer) {
    for (var mutation of mutationsList) {
      if (mutation.type === "childList") {
        cthemePageReady(); // Call your function here
        putSomeClasses();
        break; // We've handled the mutation, no need to continue
      }
    }
  });
  observer.observe(targetNode, config);
});

function putSomeClasses() {
  var $cTables = $(".cTable");
  $cTables.each(function(){
    if($(this).hasClass("rsSingle") || $(this).hasClass("rsMulti")){
      $(".rsRow").on("click", function () {
        $(".rsRow").each(function(){
          if ($(this).find("input").prop("checked")) {
            $(this).addClass("rsSelected");
          } else {
            $(this).removeClass("rsSelected");
          }
        });
      });
    } else if ($(this).hasClass("rsProcessedGrid") && isMobileDevice()){
      $(".rsRow").find(".cCell").on("click", function () {
        $(".cCell").each(function(){
          if ($(this).find("input").prop("checked")) {
            $(this).addClass("rsSelected");
          } else {
            $(this).removeClass("rsSelected");
          }
        });
      });
    }
  });

}

    function isMobileDevice() {
        return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
    }
function cthemePageReady() {
    //console.log("inside cthemePageReady");
  var strID = "";
  strID = $('#rs_lang').val();
  if (strID == "sv") {
    ghostText("Snälla, skriv in...");
  } else {
    //EN
    ghostText("Please, type in...");
  }
   $(".rsSingleGrid, .rsMultiGrid").each(function(){
     //if(!$(this).hasClass("rsProcessedGrid")){
     if((!$(this).hasClass("rsProcessedGrid")) && (!$(this).hasClass("rsCQ"))){
       //console.log("rsProcessedGrid is not in calsses");
         gridUpdate($(this));
     }
   });

    
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
             //console.log("add rsProcessedGrid to ", gridID);
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
