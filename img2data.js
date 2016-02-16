#!/usr/bin/env node

var program = require('commander'),
    util = require('util'),
    chalk = require('chalk'),
    fs = require('fs');
var imgformatsStr = 'png | jpg | jpeg | gif | svg',
    imgformatsArr = imgformatsStr.split(' | ');
(function init() {
    program.version('0.0.1').usage('<filenames> | [options]')
    program.parse(process.argv);
        convertOpt(program.args);
})();
// data2img *.png *.svg ...
function convertOpt(imgs) {
    var imgs, img, meta, result, imgData, css;
    result = '';
    for (var i = 0, length = imgs.length; i < length; i++) {
        var img = imgs[i],
            meta = analyse(img);
        if (!meta) {
            errlog('not_img', img);
            process.exit(0);
        }
        if (!checkFormat(meta.format)) {
            errlog('format', img);
            process.exit(0);
        }
        imgData = img2data(img);
        if (!imgData) {
            process.exit(0);
        }
        css = getCSS(meta, imgData);
        result += css;
       
    }
    util.print(result);
}
/*
  return file meta data
  {format: 'png|jpg|jpeg|svg+xml',
  name: ''}
*/
function analyse(img) {
    var data = img.split('.');
    if (data.length <= 1) {
        return false;
    }
    return {
        format: data[data.length - 1].toLowerCase(),
        name: data.slice(0, data.length - 1).join('_').replace(/@/g, '_')
    };
}

function checkFormat(format) {
    if (imgformatsArr.indexOf(format) === -1) {
        return false;
    }
    return true;
}
// img 2 data uri
function img2data(img) {
    try {
        var bitmap = fs.readFileSync(img);
    } catch (e) {
        if (e.code === 'ENOENT') {
            errlog('not_found', img);
        } else {
            errlog('err', img);
            throw e;
        }
        return false;
    }
    var string = new Buffer(bitmap).toString('base64');
    return string;
}

function getCSS(meta, imgData) {
    var imgformat = meta.format === 'svg' ? meta.format + '+xml' : meta.format;
    return util.format('background-image: url("data:image/%s;base64,%s")\n\n', imgformat, imgData);

}
