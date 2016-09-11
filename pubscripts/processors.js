"use strict";

const help = require('./helper.js');

const markdownItOptions = {
    highlight: function(str, lang) {
        if (lang && highlighterJs.getLanguage(lang)) {
            try {
                return highlighterJs.highlight(lang, str).value;
            } catch (__) {}
        }

        return ''; // use external default escaping
    }
};

const highlighterJs = require('highlight.js');
const markdownIt = require('markdown-it')(markdownItOptions);
const path = require('path');
const fs = require('fs');

var markdown = {
    proc: function(input) {
        return markdownIt.render(input);
    },
    outExt: '.html'
}

var html = {
    proc: function(input) {
        return input
    },
    outExt: '.html'
}