"use strict";
// @flow

const fs = require('fs');
const path = require('path');
const walk = require('t3hmun-walk');

module.exports.changeExtension = changeExtension;
module.exports.readFiles = readFiles;
module.exports.changePath = changePath;
module.exports.ensureDirCreated = ensureDirCreated;

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

interface DataAndPath {
    data: string,
    inPath : string
}

type ReadFilesCallback = (err: ?Error, files: ?DataAndPath[]) => void;

/**
 * Reads all files selected by filePredicated in dir and all sub-dirs selected by dirPredicate.
 * @param {string} dirPath
 * @param {function(string): boolean} filePredicate - Function that returns true on file paths that should be included.
 * @param {function(string): boolean} dirPredicate - Function that returns true on directory paths that should be included. Sub-dirs of excluded dirs are always excluded.
 * @param {function(Error, object[])} callback
 */
function readFiles(dirPath: string, filePredicate: (filePath: string)=>boolean, dirPredicate: (filePath: string)=>boolean, callback: ReadFilesCallback) {
    // The order of the predicates has flipped. Terrible mess.
    walk.where(dirPath, dirPredicate, filePredicate, (err, files) => {
        if (err) {
            callback(err, null);
            return;
        }
        console.log(files);
        let promises: Promise<DataAndPath>[] = [];
        files.forEach(filePath => {
            promises.push(new Promise((resolve, reject) => {
                fs.readFile(filePath, 'utf-8', (err, data) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve({data: data, inPath: filePath});
                });
            }));
        });
        Promise.all(promises).then(values => callback(null, values), err => callback(err, null));
    });
}

function changePath(inRootDir: string, outRootDir: string, filePath: string) {
    // Resolving in-case the function was called with a mixture of relative and absolute paths.
    let fullInDir = path.resolve(inRootDir);
    let fullFilePath = path.resolve(filePath);
    let filePathStub = fullFilePath.slice(fullInDir.length);
    // This will create a relative path if outRootDir is relative.
    return path.join(outRootDir, filePathStub);
}

function ensureDirCreated(dirPath: string, callback: (err: ?Error)=>void) {
    fs.stat(dirPath, (err)=> {
        if (err) {
            if (err.code == 'ENOENT') {
                fs.mkdir(dirPath, 666, (err)=> {
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null);
                    }
                });
            } else {
                callback(err);
            }
        }
        else {
            callback(null);
        }
    });
}