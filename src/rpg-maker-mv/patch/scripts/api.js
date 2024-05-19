/*!
  * Sponge for RPG Maker MV
  * Copyright (c) 2024 Sponge Contributors all rights reserved.
  * Licensed under the MIT License.
  */

'use strict';

function API() {
    throw new Error('This is a static class');
}

API.createBlobUrl = function (arrayBuffer) {
    var blob = new Blob([arrayBuffer]);
    return window.URL.createObjectURL(blob);
};

API.encodeResourceFile = function (filepath, bitmap) {
    var path = encodeURIComponent(filepath);
    var requestUrl = 'http://localhost:40126/api/v1/convert?format=png&filepath=' + path;

    var request = new XMLHttpRequest();
    request.open("GET", requestUrl);
    request.responseType = "arraybuffer";
    request.send();

    request.onload = function () {
        if (this.status < Decrypter._xhrOk) {
            var arrayBuffer = request.response;
            bitmap._image.src = API.createBlobUrl(arrayBuffer);
            bitmap._image.addEventListener('load', bitmap._loadListener = Bitmap.prototype._onLoad.bind(bitmap));
            bitmap._image.addEventListener('error', bitmap._errorListener = bitmap._loader || Bitmap.prototype._onError.bind(bitmap));
        }
    };

    request.onerror = function () {
        if (bitmap._loader) {
            bitmap._loader();
        } else {
            bitmap._onError();
        }
    };
};

API.decodeResourceFile = function (filepath, bitmap) {
    var path = encodeURIComponent(filepath);
    var requestUrl = 'http://localhost:40126/api/v1/convert?format=png&filepath=' + path;

    var request = new XMLHttpRequest();
    request.open("GET", requestUrl);
    request.responseType = "arraybuffer";
    request.send();

    request.onload = function () {
        if (this.status < Decrypter._xhrOk) {
            var arrayBuffer = request.response;
            bitmap._image.src = API.createBlobUrl(arrayBuffer);
            bitmap._image.addEventListener('load', bitmap._loadListener = Bitmap.prototype._onLoad.bind(bitmap));
            bitmap._image.addEventListener('error', bitmap._errorListener = bitmap._loader || Bitmap.prototype._onError.bind(bitmap));
        }
    };

    request.onerror = function () {
        if (bitmap._loader) {
            bitmap._loader();
        } else {
            bitmap._onError();
        }
    };
};

API.status = function (callback, onError) {
    var requestUrl = 'http://localhost:40126/api/v1/status';

    var request = new XMLHttpRequest();
    request.open("GET", requestUrl);
    request.responseType = "json";
    request.send();

    request.onload = function () {
        if (this.status < Decrypter._xhrOk) {
            callback(request.response)
        }
    };

    request.onerror = function () {
        onError();
    };
};