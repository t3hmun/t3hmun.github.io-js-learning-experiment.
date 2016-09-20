'use strict';
// @flow

const universal = require('./universal');
const path = require('path');

module.exports = function (file: SourceFile, content : string): string | Error {
    let site = file.siteConfig;
    let page = file.fileConfig;

    if (!site) return new Error('Site config missing: ' + file.inPath);
    if (!page) return new Error('Page config missing: ' + file.inPath);

    {
        //Auto-generate the title and date from the filename unless already defined.
        let titleExists = page.title && /\S/.test(page.title);
        let dateExists = page.date && /\S/.test(page.date);

        let dateTime;
        let title;

        if (!titleExists || !dateExists) {
            let filename = path.parse(file.inPath).name;
            let dateTimeLen = filename.indexOf('_');
            if (dateTimeLen < 8) return new Error('Datetime too short, invalid filename for post template: ' + file.inPath);
            dateTime = filename.substring(0, dateTimeLen);
            title = filename.slice(dateTimeLen + 1);
        }

        // There is an extra !..|| because otherwise flow thinks it might be undefined.
        if (!page.title || !titleExists) {
            if (!title) return new Error('Failed to load title from path: ' + file.inPath);
            page.title = title;
        }
        if (!page.date || !dateExists) {
            if (!dateTime) return new Error('Failed to load date from path.');
            page.date = dateTime;
        }
    }
    //TODO: reformat date.
    // Create the content the at is inserted into the HTML5 main tags.
    let main = `<article><h1>${page.title}</h1><div class="pageDate">${page.date}</div>${content}</article>`;

    return universal(file, main);
};