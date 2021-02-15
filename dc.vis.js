/*
* Test function for buttons.
* Writes a message containing parameter information to console.
* qno: question ID.
* subqIndex: zero based subq index.
* paramObj: object with settings as properties.
*/
function rsVisButton(qno, subqIndex, paramObj) {
    var msg = "This is the rsVisButton function\n qno: " + qno + ", subqIndex: " + subqIndex + "\nObject properties:\n";
    for (const property in paramObj) {
        msg += ` ${property}: ${paramObj[property]}\n`;
    }

    console.log(msg);
}
