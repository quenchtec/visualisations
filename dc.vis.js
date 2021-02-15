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
