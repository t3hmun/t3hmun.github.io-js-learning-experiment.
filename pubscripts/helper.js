"use strict";

const path = require('path');

module.exports.splitJsonAndFile = splitJsonAndFile;
module.exports.changeExtension = changeExtension;


/**
 * Splits the Json front-matter from the rest of the file, returns both parts.
 * @param {string} fileContents - The contents of a file with Json front-matter.
 * @returns {{file: (string), json: (string)}} Separated file and json.
 */
function splitJsonAndFile(fileContents) {
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

/**
 * Changes the extension on a file.
 * @param {string} filePath
 * @param {string} extension
 * @returns {string} The path with changed extension.
 */
function changeExtension(filePath, extension) {
    if (!extension.startsWith('.')) extension = '.' + extension;
    var info = path.parse(filePath);
    return path.format({
        dir: info.dir,
        root: info.root,
        name: info.name,
        ext: extension
    });
}