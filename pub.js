const mditOptions = {
    highlight: function(str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value;
            } catch (__) {}
        }

        return ''; // use external default escaping
    }
};

const hljs = require('highlight.js');
const mdit = require('markdown-it')(mditOptions);
const walk = require('t3hmun-walk');
const path = require('path');
const fs = require('fs');

// The following config should should mostly be loaded from json.

var outputDirs = ["./t3hmun.github.io"];

function procMarkdown(input) {
    return mdit.render(input);
}

/** Process HTML (TODO: add minifier). */
function procHtml(input) {
    return input;
}

/** @type {Object} Standard set of file exts and methods to process them. */
var fileProcessors = {
    ".md": procMarkdown,
    ".html": procHtml
};

/** Log then crash. */
function fatalError(message, err) {
    console.log(message);
    throw (err);
}

var contentDirs = [{
    dir: "./content",
    outDir: "./output",
    processors: fileProcessors
}];


contentDirs.forEach(function(dircfg) {
    // Resolve a full path, a relative dir would be hard to change to output.
    var cleanDir = path.resolve(dircfg.dir);
    var dirLen = cleanDir.length;
    // Get a flat list of all the files in the dir and subdirs.
    walk(cleanDir, function(err, files) {
        if (err) fatalError(err);
        procFiles(dircfg, files, dirLen);
    });

});


function procFiles(dircfg, files, dirLen) {
    var promises = [];
    files.forEach(function(filePath) {
        var info = path.parse(filePath);
        var proc = dircfg.processors[info.ext];
        // Ignore file if no processor defined for its extension.
        if (!proc) return;

        promises.push(new Promise(function(resolve, reject) {
            fs.readFile(filePath, 'utf-8', function(err, data) {
                if (err) {
                    reject(err);
                    return;
                }
                console.log(data);
                var output = proc(data);

                // Splice the right part of file path with the output dir.
                var rightOfDir = filePath.slice(dirLen);
                var target = path.join(dircfg.outDir, rightOfDir);


                // Use stat to check if dir exists
                var targetDir = path.parse(target).dir;
                fs.stat(targetDir, function(err, stat) {
                    if (err) {
                        // Create dir on 'not exists' error.
                        if (err.code == 'ENOENT') {
                            fs.mkdir(targetDir, function(err) {
                                if (err) {
                                    reject(err);
                                    return;
                                }
                            });
                        }
                        // Other errors are a failure condition.
                        else {
                            reject(err);
                            return;
                        }
                    }

                    // Finally, write the output file.
                    fs.writeFile(target, output, 'utf-8', function(err) {
                        if (err) {
                            reject(err);
                            return;
                        };
                        // End of callback chain, yay (file written).
                        resolve();
                    });
                });
            });
        }));
    });

    console.log('promises' + promises);
    Promise.all(promises).then(function() {
        console.log("Publish completed successfully.");
    }, function(err) {
        // May want to make some errors not fatal in future?
        console.log('file related error');
        fatalError(err);
    }).catch(function(err) {
        // This catches the errors that 'should never happen'.
        console.log("Unexpected error.");
        fatalError(err);
    }).catch(function(err) {
        // This catches the errors that 'should never happen'.
        console.log("A very Unexpected error.");
        fatalError(err);
    }).catch(function(err) {
        // This catches the errors that 'should never happen'.
        console.log("I should probbly read up on what this actually does.");
        fatalError(err);
    });
}
