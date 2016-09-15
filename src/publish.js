'use strict';
// @flow

const helpers = require('./helper');
const processors = require('./processors');

const pubDir = '../t3hmun.github.io';

const topLevelConfig = {
    dir : '../site',
    dirPredicate: (_)=>true,
    filePredicate: (filePath)=>filePath.endsWith('.md')||filePath.endsWith('.html'),
    process: (file)=>{

    }


};