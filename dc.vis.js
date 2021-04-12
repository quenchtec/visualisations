/*
* Test function for buttons.
* Writes a message containing parameter information to console.
* qno: Question ID.
* subqIndex: Zero based subq index.
* paramObj: Object with settings as properties.
*/
function rsVisButton(qno, subqIndex, paramObj) {
    var msg = "This is the rsVisButton function\n qno: " + qno + ", subqIndex: " + subqIndex + "\nObject properties:\n";
    for (const p in paramObj) {
        msg += ` ${p}: ${paramObj[p]}\n`;
    }

    console.log(msg);
}

/*
* Test function for scrolling grids.
* Writes a message containing parameter information to console.
* qno: Question ID.
* subqIndex: Zero based subq index.
* paramObj: Object with settings as properties.
*/
function rsVisScrollingGrid(qno, subqIndex, paramObj) {
    var msg = "This is the rsVisButton function\n qno: " + qno + ", subqIndex: " + subqIndex + "\nObject properties:\n";
    for (const p in paramObj) {
        msg += ` ${p}: ${paramObj[p]}\n`;
    }

    console.log(msg);
}

$.getScript("https://static.quenchtec.net/46033bcf-0124-4b26-b4ea-30726bd5357c/9rdiDsHsCw7/newBtniQuest.js");
