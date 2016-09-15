"use strict";
// @flow
const markdownItOptions = {
    highlight: function (str, lang) {
        if (lang && highlightJs.getLanguage(lang)) {
            try {
                return highlightJs.highlight(lang, str).value;
            }
            catch (__) {
            }
        }
        return ''; // use external default escaping
    }
};
const highlightJs = require('highlight.js');
const markdownIt = require('markdown-it')(markdownItOptions);
const path = require('path');
const fs = require('fs');
const helpers = require('./helper');

interface FileWithConfig {
    inPath: string,
    outPath: ?string,
    data: string,
    ext: ?string,
    fileConfig: ?FileConfig,
    dirConfig: ?{},
    siteConfig: ?{}
}

interface FileConfig {
    layout: string
}

exports.markdownToHtml = function (file: FileWithConfig): Promise<FileWithConfig> {
    file.data = markdownIt.render(file.data);
    file.ext = '.md';
    return Promise.resolve(file);
};

exports.htmlToHtml = function (file: FileWithConfig): Promise<FileWithConfig> {
    //Todo: something to minify or cleanup html?
    file.ext = '.html';
    return Promise.resolve(file);
};

exports.applyTemplate = function (file: FileWithConfig, templates: {}): Promise<FileWithConfig> {

    let fileConfig = file.fileConfig;
    if (!fileConfig) return Promise.reject('No file config: ' + file.inPath);

    let layoutName = fileConfig.layout;
    if (!layoutName) return Promise.reject('File config has no layout: ' + file.inPath);

    let layout = templates[layoutName];
    if (!layout) return Promise.reject('Template ' + layoutName + 'does not exist:' + file.inPath);

    file.data = layout(file.siteConfig, file.fileConfig, file.data);

    return Promise.resolve(file);
};


/**
 * Extracts the Json front-matter from the start of the file, adds it as config.
 * @param file - The contents of a file with Json front-matter.
 * @returns Modified file
 */
module.exports.extractJsonFrontMatter = function (file: FileWithConfig): Promise<FileWithConfig> {
    let prev = '';
    let open = 0;
    let close = 0;
    let end;
    let data = file.data;
    for (let i = 0, len = data.length; i < len; i++) {
        let current = data[i];
        if (current == "{" && prev != '\\')
            open++;
        if (current == "}" && prev != '\\')
            close++;
        if (open == close) {
            end = i;
            break;
        }
        prev = current;
    }

    file.data = data.slice(end + 1);
    file.fileConfig = JSON.parse(data.substring(0, end));
    return Promise.resolve(file);
};

module.exports.writeFile = function (file: FileWithConfig): Promise<FileWithConfig> {
    let ext = file.ext;
    if (!ext) return Promise.reject('No file.ext defined, process step missing: ' + file.inPath);
    let outPath = helpers.changeExtension(file.inPath, ext);
    file.outPath = outPath;
    return new Promise((resolve, reject)=> {
        fs.writeFile(outPath, file.data, 'utf-8', (err)=> {
            if (err) reject(err);
            else resolve(file);
        });
    });
};