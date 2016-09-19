'use strict';
// @flow

const path = require('path');
const processors = require('./processors');
const layouts = {universal: require('./layouts/universal')};

// Following dirs rely on the script being run from the project root, not src.
const pubDir = './t3hmun.github.io';
const contentDir = './site';
const site = {
    "title": "t3hmun",
    "baseUrl": "t3hmun.github.io/",
    "description": "t3hmun's web log.",
    "nav": [
        "index"
    ]
};

// Config to process html and md content.
const contentGroup = {
    name: 'md and html content',
    inDir: contentDir, // Process files from
    outDir: pubDir, // Write files to
    relUrl: '', // The URL is relative to (inDir could be a sub-dir that should map to a sub-path).
    filePredicate: (filePath)=>filePath.endsWith('.md') || filePath.endsWith('.html'),
    dirPredicate: (dirPath)=>true,
    proc: processContent
};

processors.processGroup(contentGroup, site)
    .then(()=> {
        console.log('content group processed successfully.')
    })
    .catch((err)=> {
        console.log('content group processing failed.');
        console.log(err);
        // Kill program as result of error.
        process.exit();
    });


function processContent(filePath: string, data: string, groupConfig, siteConfig): Promise<void> {
    let fileConfig = {
        inPath: filePath,
        data: data,
        siteConfig: siteConfig,
        groupConfig: groupConfig
    };
    return new Promise((resolve, reject) => {
        processors.extractJsonFrontMatter(fileConfig).then((file)=> {
            let ext = path.parse(file.inPath).ext;
            if (ext == '.md') return processors.markdownToHtml(file);
            if (ext == '.html') return processors.htmlToHtml(file);
            return Promise.reject(new Error('Unexpected file extension:"' + ext + '": ', fileConfig));
        }).then((file)=> {
            return processors.setUrlIfUndefined(file);
        }).then((file)=> {
            return processors.applyTemplate(file, layouts);
        }).then((file)=> {
            return processors.writeFile(file);
        }).then(()=> {
            resolve();
        }).catch((err)=> {
            reject(err);
        });
    });
}


