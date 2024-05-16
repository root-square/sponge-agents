// --------------------------------------------------
// MX Packer Agent for RPG Maker MV : Image Processor
// Copyright (c) 2022 June(aka handbros) all rights reserved.
// --------------------------------------------------

'use strict';

console.log('The MX Packer image processor has been loaded.');

function ImageProcessor() {
    throw new Error('This is a static class');
}

ImageProcessor.convertAvifToPng = function (filepath, bitmap) {
    var path = encodeURIComponent(filepath);
    var requestUrl = 'http://localhost:49696/convert?format=png&filepath=' + path;

    var requestFile = new XMLHttpRequest();
    requestFile.open("GET", requestUrl);
    requestFile.responseType = "arraybuffer";
    requestFile.send();

    requestFile.onload = function () {
        if (this.status < Decrypter._xhrOk) {
            var arrayBuffer = requestFile.response;
            bitmap._image.src = ImageProcessor.createBlobUrl(arrayBuffer);
            bitmap._image.addEventListener('load', bitmap._loadListener = Bitmap.prototype._onLoad.bind(bitmap));
            bitmap._image.addEventListener('error', bitmap._errorListener = bitmap._loader || Bitmap.prototype._onError.bind(bitmap));
        }
    };

    requestFile.onerror = function () {
        if (bitmap._loader) {
            bitmap._loader();
        } else {
            bitmap._onError();
        }
    };
};

ImageProcessor.createBlobUrl = function (arrayBuffer) {
    var blob = new Blob([arrayBuffer]);
    return window.URL.createObjectURL(blob);
};