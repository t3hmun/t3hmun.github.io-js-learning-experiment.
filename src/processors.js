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
    outPath?: string,
    data: string,
    ext?: string,
    fileConfig?: FileConfig,
    groupConfig?: GroupConfig,
    siteConfig?: SiteConfig
}

interface FileConfig {
    layout?: string
}
interface SiteConfig {
    title: string,
    baseUrl: string,
    description: string,
    nav: string[]
}

interface GroupConfig {
    name: string,
    inDir: string,
    outDir:string,
    filePredicate: (filePath: string)=>boolean,
    dirPredicate: (dirPath: string)=>boolean,
    proc: (filePath: string, data: string, groupConfig: GroupConfig, siteConfig: SiteConfig)=>Promise<void>
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
    console.log('hello');
    return Promise.resolve(file);
};

module.exports.writeFile = function (file: FileWithConfig): Promise<FileWithConfig> {
    let groupConfig = file.groupConfig;
    if (!groupConfig) return Promise.reject(new Error('Group config missing cant write file without in/out dir.'));
    let ext = file.ext;
    if (!ext) return Promise.reject(new Error('No file.ext defined, process step missing: ' + file.inPath));
    let extChanged = helpers.changeExtension(file.inPath, ext);
    let outPath = helpers.changePath(groupConfig.inDir, groupConfig.outDir, extChanged);
    let outFileDir = path.parse(outPath).dir;
    file.outPath = outPath;
    return new Promise((resolve, reject)=> {
        helpers.ensureDirCreated(outFileDir, (err)=> {
            if (err) reject(err);
            else {
                fs.writeFile(outPath, file.data, 'utf-8', (err)=> {
                    if (err) reject(err);
                    else resolve(file);
                });
            }
        });
    });
};

module.exports.processGroup = function (groupConfig: GroupConfig, siteConfig: SiteConfig): Promise<void> {
    return new Promise((resolve, reject)=> {
        helpers.readFiles(groupConfig.inDir, groupConfig.filePredicate, groupConfig.dirPredicate, (err, files)=> {
            if (err) {
                reject(err);
                return;
            } else if (!files) {
                reject(new Error('readfile broken.'));
                return;
            }

            let promises: Promise<void>[] = [];

            files.forEach((file)=> {
                console.log('pre');
                promises.push(groupConfig.proc(file.inPath, file.data, groupConfig, siteConfig));
                console.log('post');
            });

            Promise.all(promises).then(()=> {
                console.log('Group', groupConfig, 'processed successfully.');
                resolve();
            }).catch((err)=> {
                console.log('Group', groupConfig, 'failed to process:');
                reject(err);
            });
        });
    });
};