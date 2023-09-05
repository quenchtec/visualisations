function rsAutoCoder(rsQno, rsSubqIndex, rsParams) {
    //Check for WCAG, if the flag is set, we do not do anything as these buttons are not WCAG compliant at crrent
    if ($('#btnToggleWcag').val() == 1) {
        return false;
    }
    const QuestionID = "#" + rsQno; //This we use in selectors to stay within the question
    const allTXTInputs = $(QuestionID).find(".rsRowOpen").find("input[type='text']");
    const arrAllOpenRows = $(QuestionID).find(".rsRowOpen");
    const arrAllRegRows = $(QuestionID).find(".rsRow");
    const liveTextboxes = $('input[type="text"]:gt(0)');
    //console.log(arrAllOpenRows.length, (arrAllRegRows.length-arrAllOpenRows.length));
    $(".rsRowOpen").eq(1).show();
    $(".rsRowOpen").eq(1).css("display", "flex");
    rsParams.strLink = (typeof rsParams.strLink === "undefined") ? "" : rsParams.strLink;
    rsParams.blnTest = (typeof rsParams.blnTest === "undefined") ? false : rsParams.blnTest;
    rsParams.minLength = (typeof rsParams.minLength === "undefined") ? 2 : rsParams.minLength - 1;
    rsParams.prescript = (typeof rsParams.prescript === "undefined") ? "" : rsParams.prescript;
    rsParams.postscript = (typeof rsParams.postscript === "undefined") ? "" : rsParams.postscript;
    //Check for prescript
    if (rsParams.prescript.length) rsParam.prescript;

    $(document).ready(function() {
        $(".rsRow").addClass("rsCQACRow");
        $(".rsRowOpen").eq(1).removeClass("rsCQACRow");
        if (rsParams.blnTest) {
            //console.log("stopMEEEEE")
            $(".rsRow").removeClass("rsCQACRow");
            clickReg = $(".logo1");
        } else {
            clickReg = $("#btnNext");
        }
        var xhr = new XMLHttpRequest();
        //xhr.open('GET', rsParams.strLink, true);
        xhr.open('GET', "https://resources.walr.com/3ef11f3f-290d-4a64-925c-34ae02f863ce/Mihail/CodeTest.xlsx", true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function() {
            if (xhr.status === 200) {
                var arrayBuffer = xhr.response;
                var data = new Uint8Array(arrayBuffer);
                var workbook = XLSX.read(data, {
                    type: 'array'
                });
                $(clickReg).on("click", function(event) {
                    $(allTXTInputs).each(function() {
                        if (!isNaN(handleExcelData(workbook, $(this).val()))) {
                            $(QuestionID).find("input:checkbox").eq(handleExcelData(workbook, $(this).val())).attr("checked", "checked");
                        } else {
                            if ($(this).val()) {
                                let uncodedValues = $(QuestionID).find(".rsRowOpen").eq(0).find("input:text").val();
                                if (("|" + ($(QuestionID).find(".rsRowOpen").eq(0).find("input:text").val()).indexOf($(this).val()) != -1)) {
                                    $(QuestionID).find("input:checkbox").eq((arrAllRegRows.length - arrAllOpenRows.length) - 1).attr("checked", "checked");
                                    $(QuestionID).find("input:checkbox").eq((arrAllRegRows.length - arrAllOpenRows.length)).attr("checked", "checked");
                                    $(QuestionID).find(".rsRowOpen").eq(0).find("input:text").val($(QuestionID).find(".rsRowOpen").eq(0).find("input:text").val() + "|" + $(this).val());
                                }
                            }
                        }
                    });
                });
            } else {
                console.error('Error fetching Excel file:', xhr.statusText);
            }
        };
        xhr.onerror = function() {
            console.error('Error fetching Excel file');
        };
        xhr.send();

        $(liveTextboxes).on("keydown keyup click change", function(e) {
            let allinputs = "";
            $(liveTextboxes).each(function() {
                allinputs += "|" + $(this).val() + "|";
            });
            let count = allinputs.split("|" + $(this).val() + "|").length - 1;
            currentOE = liveTextboxes.index($(this));
            //console.log(liveTextboxes.index($(this)), e)
            if ($(this).val() && (allinputs.indexOf($(this).val()) != -1) && (count > 1)) {
                //console.log("not unique")
                $(".rsRowOpen").eq(currentOE + 2).hide();
            } else {
                if ($(this).val().length > rsParams.minLength) {
                    $(".rsRowOpen").eq(currentOE + 2).show();
                    $(".rsRowOpen").eq(currentOE + 2).removeClass("rsCQACRow");

                }
            }
        });
    });

    $(arrAllOpenRows).click(function(event) {
        event.preventDefault(); //let's block the click on the answer to stop messing up with the data-text attribute
    });

    function handleExcelData(workbook, textvalue) {
        let sheetName = workbook.SheetNames[0]; // Assuming you have only one sheet
        let sheet = workbook.Sheets[sheetName];
        let columnIndex;
        //console.log(sheet)
        let columnDict = {};
        let range = XLSX.utils.decode_range(sheet['!ref']);
        for (let c = range.s.c; c <= range.e.c; c++) {
            let colKey = XLSX.utils.encode_col(c);
            columnDict[colKey] = false;
            for (let r = range.s.r + 1; r <= range.e.r; r++) {
                let cellAddress = colKey + r;
                let cellValue = sheet[cellAddress] ? sheet[cellAddress].v : '';
                if ((cellValue.toLowerCase() == textvalue.toLowerCase()) && (cellValue)) { // Let's compare the cell with the text
                    columnDict[colKey] = true;
                    columnIndex = Object.keys(columnDict).findIndex(function(colKey) {
                        return columnDict[colKey] === true;
                    });
                    break;
                }
            }
        }
        //console.log(columnDict);
        if (!isNaN(columnIndex)) return columnIndex;
        // Now you have a dictionary indicating if each column has at least one non-empty cell
    }

    //Check for postscript
    if (rsParams.postscript.length) rsParam.postscript;
}