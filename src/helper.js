"use strict";
// @flow

const fs = require('fs');
const path = require('path');
const walk = require('t3hmun-walk');

module.exports.changeExtension = changeExtension;
module.exports.readFiles = readFiles;

/**
 * Changes the extension on a file.
 * @param {string} filePath
 * @param {string} extension
 * @returns {string} The path with changed extension.
 */
function changeExtension(filePath: string, extension: string): string {
    if (!extension.startsWith('.'))
        extension = '.' + extension;
    var info = path.parse(filePath);
    return path.format({
        dir: info.dir,
        root: info.root,
        name: info.name,
        ext: extension
    });
}

interface DataConfig {
    data: string,
    config : any
}

type ReadFilesCallback = (err: ?Error, files: ?any) => void;

/**
 * Reads all files selected by filePredicated in dir and all sub-dirs selected by dirPredicate.
 * @param {string} dirPath
 * @param {function(string): boolean} filePredicate - Function that returns true on file paths that should be included.
 * @param {function(string): boolean} dirPredicate - Function that returns true on directory paths that should be included. Sub-dirs of excluded dirs are always excluded.
 * @param {function(Error, object[])} callback
 */
function readFiles(dirPath: string, filePredicate: string, dirPredicate: string, callback: ReadFilesCallback) {
    walk.where(dirPath, filePredicate, dirPredicate, (err, files) => {
        if (err) {
            callback(err, null);
            return;
        }
        let promises: Promise<DataConfig>[] = [];
        files.forEach(filePath => {
            return promises.push(new Promise((resolve, reject) => {
                fs.readFile(filePath, 'utf-8', (err, data) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve({data: data, config: {inPath: filePath}});
                });
            }));
        });
        Promise.all(promises).then(values => callback(null, values), err => callback(err, null));
    });
}
