function ClickRank(rsQno, rsSubqIndex, rsParams) {
    //Check for WCAG, if the flag is set, we do not do anything as these buttons are not WCAG compliant at crrent
    if ($('#btnToggleWcag').val() == 1) {
        return false;
    }
    //These parameters come from the settings the user have selected
    rsParams.autonext = (typeof rsParams.autonext === "undefined") ? true : rsParams.autonext;
    rsParams.min = (typeof rsParams.min === "undefined") ? 0 : rsParams.min;
    rsParams.max = (typeof rsParams.max === "undefined") ? 0 : rsParams.max;
    rsParams.hideNextMin = (typeof rsParams.hideNextMin === "undefined") ? true : rsParams.hideNextMin;
    rsParams.prescript = (typeof rsParams.prescript === "undefined") ? "" : rsParams.prescript;
    rsParams.postscript = (typeof rsParams.postscript === "undefined") ? "" : rsParams.postscript;
    var index = 0;

    //Check for prescript
    if (rsParams.prescript.length > 0) rsParams.prescript;

    //Since there can be mutiple questions on a page, we must make sure all selectors are addressing the proper question (and subquestion) only
    const QuestionID = "#" + rsQno; //This we use in selectors to stay within the question
    $(QuestionID).find(".cTable").addClass("rsCQ").addClass("rsClickRank");
    if (/^(testlink|preview|review)\./.test(window.location.hostname)) console.log("add the rsCQ");
    const btnDivID = "#" + rsQno + "_btn"; //We create our own ID's that will be unique within the page and question
    const btnDivIDattr = rsQno + "_btn"; //Same id without # to use when we set the ID

    //Turn of autonext if more than one question/subquestion on the page
    if ($('.cCellSubQuestion').length > 1) {
        rsParams.autonext = false;
    }

    $(QuestionID).find('.rsRow').each(function() {
        $(this).css('justify-content', 'start');
        $(this).click(function() {
            checkClick(rsQno, rsParams, this);
        });
        $(this).find('td').each(function(i) {
            if (i == 0) {
                $(this).css('order', 2);
            }
            if (i == 1) {
                $(this).css({
                    'order': '1',
                });
                let value = $(this).find('.cFInput').val();
                $(this).find('.cFInput').addClass('rsBtnRank');
                $(this).find('.cFInput').attr('readonly', true);
                if (value != '') {
                    index++;
                    $(this).find('.cFInput').addClass('rsBtnRankSelected');
                }
            }
            $(QuestionID).find('.cCellSubQuestion').attr('data-index', index);
        });
        //Check for hide min
        if (rsParams.min > 0 && $('.cCellSubQuestion').length == 1) {
            if (index < rsParams.min) $('#btnNext').hide();
        }
    });
    //Check for postscript
    if (rsParams.postscript.length > 0) rsParams.postscript;
}

function checkClick(rsQno, rsParams, item) {
    const QuestionID = "#" + rsQno;
    let index = parseInt($(QuestionID).find('.cCellSubQuestion').attr('data-index'));
    const value = $(item).find('.cFInput').val();

    if (value === '') {
        if (rsParams.max > 0 && index >= rsParams.max) {
            return;
        }
        if (index >= rsParams.max) $('#btnNext').show();
        index++;
        $(item).find('.cFInput').val(index);
        $(item).find('.cFInput').addClass('rsBtnRankSelected');
        $(QuestionID).find('.cCellSubQuestion').attr('data-index', index);

        if (rsParams.max > 0 && rsParams.autonext) {
            if (index == rsParams.max) $('#btnNext').click();
        }
    } else {
        index = index - 1;
        if (index < 0) index = 0;
        $(item).find('.cFInput').removeClass('rsBtnRankSelected');
        $(item).find('.cFInput').val('');
        $(QuestionID).find('.cCellSubQuestion').attr('data-index', index);

        // Recalculate the rankings for remaining clicked boxes
        const rankedItems = [];
        $(QuestionID).find('.rsRow').each(function() {
            const thisValue = parseInt($(this).find('.cFInput').val());
            if (!isNaN(thisValue)) {
                rankedItems.push(thisValue);
            }
        });

        rankedItems.sort((a, b) => a - b); // Sort ranked items in ascending order

        // Reassign new sequential values to the remaining ranked items
        for (let i = 0; i < rankedItems.length; i++) {
            $(QuestionID).find('.rsRow').each(function() {
                const oldValue = parseInt($(this).find('.cFInput').val());
                if (oldValue === rankedItems[i]) {
                    $(this).find('.cFInput').val(i + 1);
                    $(this).find('.cFInput').addClass('rsBtnRankSelected');
                }
            });
        }

        if (rsParams.min > 0 && $('.cCellSubQuestion').length == 1) {
            if (index < rsParams.min) $('#btnNext').hide();
        }
    }
        if (rsParams.min > 0 && $('.cCellSubQuestion').length == 1) {
        if (index < rsParams.min) {
            $('#btnNext').hide();
        }else{
            $('#btnNext').show();
        }
        }
}
