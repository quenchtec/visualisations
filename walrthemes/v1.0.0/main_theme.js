// Define the target node
var targetNode = document.querySelector('.cTable');

// Create a MutationObserver instance
var observer = new MutationObserver(function(mutationsList) {
    for (var mutation of mutationsList) {
        if (mutation.type === 'childList') {
            // Call your function when changes are detected
            cthemePageReady();
        }
    }
});

// Configuration of the observer:
var config = { childList: true, subtree: true };

// Start observing the target node for configured mutations
observer.observe(targetNode, config);




//themePageReady();
function cthemePageReady() {
    alert("test");
    console.log("TPR call");
    $(document).ready(function () {
        ghostText("Please, type in...");
        gridUpdate();
    });

    function isMobileDevice() {
        return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
    }
    function ghostText(custText) {
        console.log("TPR GT call");
        $('.cTextInput').each(function () {
            $(this).attr("placeholder", custText);
        });
    }
    function gridUpdate() {
        console.log("TPR GU call");

        if (($(".cTable").hasClass("rsSingleGrid") || $(".cTable").hasClass("rsMultiGrid")) && (!$(".cTable").hasClass("rsCQ"))) {
            let gridID = $(".rsSingleGrid, .rsMultiGrid").prop("id");
            let gridIND = gridID.split("_")[1];
            //rearrange the grid for mobiles
            if (isMobileDevice()) {
                $(".rsRow").each(function () { $(this).children(".cCell").each(function (e) { $(this).append($("#h_" + gridIND + "_" + e).clone()); }); });
                $("td.cCellHeader").parent().remove();
            } else {
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
