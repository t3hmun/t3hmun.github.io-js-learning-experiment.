"use strict";

module.exports.splitJsonAndFile = splitJsonAndFile;

/**
 * Splits the Json front-matter from the rest of the file, returns both parts.
 * @param fileContents {string} The contents of a file with Json front-matter.
 * @returns {{file: (string), json: (string)}} Separated file and json.
 */
function splitJsonAndFile (fileContents) {
    var prev = '';
    var open = 0;
    var close = 0;
    var end;

    for (var i = 0, len = file.length; i < len; i++) {
        let current = fileContents[i];
        if (current == "{" && prev != '\\') open++;
        if (current == "}" && prev != '\\') close++;
        if (open == close) {
            end = i;
            break;
        }
        prev = current;
    }
    return {
        file: file.slice(end + 1),
        json: JSON.parse(file.substring(0, end))
    }
}