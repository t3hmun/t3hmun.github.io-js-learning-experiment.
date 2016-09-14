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
    data: string,
    ext: string,
    fileConfig: {},
    dirConfig: {},
    siteConfig: {}
}

exports.markdownToHtml = function (file: FileWithConfig) {
    file.data = markdownIt.render(file.data);
    file.ext = '.md';
};

exports.htmlToHtml = function (file: FileWithConfig) {
    //Todo: something to minify or cleanup html?
    file.ext = '.html';
};

exports.loadJsonFrontMatter = function (file: FileWithConfig) {
    let dataAndConfig = helpers.splitJsonAndFile(file.data);
    file.fileConfig = dataAndConfig.json;
    file.data = dataAndConfig.file;
    return file;
};
