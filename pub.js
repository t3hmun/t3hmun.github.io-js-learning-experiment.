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
    outdir: "./output",
    processors: fileProcessors
}];


contentDirs.forEach(function(dircfg) {
    // Resolve a full path, a relative dir would be hard to change to output.
    var cleandir = path.resolve(dircfg.dir);
    var dirlen = cleandir.length;
    // Get a flat list of all the files in the dir and subdirs.
    walk(cleandir, function(err, files) {
        var walkpromises = [];
        if (err) fatalError(err);
        files.forEach(function(filePath) {
            var info = path.parse(filePath);
            var proc = dircfg.processors[info.ext];
            // Process if there is a processor defined otherwise ignore.

            //console.log(filePath);
            //console.log(proc);
            //console.log(dircfg);

            if (proc) {
                walkpromises.push(new Promise(function(resolve, reject) {
                    fs.readFile(filePath, 'utf-8', function(err, data) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        console.log(data);
                        var output = proc(data);
                        // Remove upto and including the root dir of the walk.
                        var rightOfDir = filePath.slice(dirlen);
                        var target = path.join(dircfg.outdir, rightOfDir);
                        fs.writeFile(target, output, 'utf-8', function(err) {
                            if (err) {
                                reject(err);
                                return;
                            };
                            // End of callback chain, yay (file written).
                            resolve();
                        });
                    });
                }));
            }
        });

        console.log('promises' + walkpromises);
        Promise.all(walkpromises).then(function() {
            console.log("Publish completed successfully.");
        }, function(err) {
            // May want to make some errors not fatal in future?
            console('file related error');
            fatalError(err);
        }).catch(function(err) {
            // This catches the errors that 'should never happen'.
            console.log("Unexpected error.");
            fatalError(err);
        }).catch(function(err) {
            // This catches the errors that 'should never happen'.
            console.log("A very Unexpected error.");
            fatalError(err);
        });
    });

});
