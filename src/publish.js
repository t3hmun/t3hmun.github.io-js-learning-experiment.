'use strict';
// @flow

const path = require('path');
const processors = require('./processors');
const layouts = {universal: require('./layouts/universal')};
const pubDir = '../t3hmun.github.io';
const contentDir = '../site';
const site = {
    "title": "t3hmun",
    "baseUrl": "t3hmun.github.io/",
    "description": "t3hmun's web log.",
    "nav": [
        "index"
    ]
};

const contentGroup = {
    name: 'md and html content',
    inDir: contentDir,
    outDir: pubDir,
    filePredicate: (filePath)=>filePath.endsWith('.md') || filePath.endsWith('.html'),
    dirPredicate: (dirPath)=>true,
    proc: processContent
};

processors.processGroup(contentGroup, site);

function processContent(filePath: string, data: string, groupConfig, siteConfig): Promise<void> {
    let fileConfig = {
        inPath: filePath,
        data: data,
        siteConfig: siteConfig,
        groupConfig: groupConfig
    };

    processors.extractJsonFrontMatter(fileConfig).then((file)=> {
        let ext = path.parse(file.inPath).ext;
        if (ext == '.md') return processors.markdownToHtml(file);
        if (ext == '.html') return processors.htmlToHtml(file);
        return Promise.reject(new Error('Unexpected file extension:"' + ext + '": ', fileConfig));
    }).then((file)=> {
        return processors.applyTemplate(file, layouts);
    }).then((file)=> {
        return processors.writeFile(file);
    }).catch((err)=> {
        throw err;
    });
    return Promise.reject(new Error('Something went wrong with processContent().'));
}


