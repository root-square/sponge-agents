/*!
  * Sponge for RPG Maker MV
  * Copyright (c) 2024 Sponge Contributors all rights reserved.
  * Licensed under the MIT License.
  */

'use strict';

var fs = require('fs');
var path = require('path');

function Injector() {
    throw new Error('This is a static class');
}

Injector.mainDirectory = function() {
    var packageJsonPath = path.resolve(process.cwd(), 'package.json');
    var json = JSON.parse(fs.readFileSync(packageJsonPath));
    var resourcePath = path.dirname(json.main);
    return path.resolve(process.cwd(), resourcePath);
};

Injector.payload = function(url) {
    if (Bitmap._reuseImages.length !== 0) {
        this._image = Bitmap._reuseImages.pop();
    } else {
        this._image = new Image();
    }

    if (this._decodeAfterRequest && !this._loader) {
        this._loader = ResourceHandler.createLoader(url, this._requestImage.bind(this, url), this._onError.bind(this));
    }

    this._image = new Image();
    this._url = url;
    this._loadingState = 'requesting';

    // Create an avif file path.
    var avifUrl = url.substr(0, url.lastIndexOf(".")) + '.avif';
    var avifPath = decodeURIComponent(path.resolve(Bitmap.prototype._mainDirectory, avifUrl)); // Decode the avif path to check its existence.

    if (IS_DEV_MODE) {
        console.log('avifPath : ' + avifPath + ', isExist : ' + fs.existsSync(avifPath));
    }

    if (fs.existsSync(avifPath) /* If the avif file exists... */) {
            this._loadingState = 'decrypting';
            this._url = avifUrl;
            ImageProcessor.convertAvifToPng(avifPath, this);
        } else if (!Decrypter.checkImgIgnore(url) && Decrypter.hasEncryptedImages) {
        this._loadingState = 'decrypting';
        Decrypter.decryptImg(url, this);
    } else {
        this._image.src = url;

        this._image.addEventListener('load', this._loadListener = Bitmap.prototype._onLoad.bind(this));
        this._image.addEventListener('error', this._errorListener = this._loader || Bitmap.prototype._onError.bind(this));
    }
};

Injector.inject = function () {
    // Inject functions.
    var rpgMakerName = Utils.RPGMAKER_NAME;
    var rpgMakerVersion = Utils.RPGMAKER_VERSION;

    if (rpgMakerName == 'MV') {
        switch (rpgMakerVersion) {
            default:
                Bitmap.prototype._mainDirectory = Injector.mainDirectory();
                Bitmap.prototype._requestImage = Injector.payload;
                break;
        }
    } else {
        var message = "Cannot found RPG Maker MV Core Engine. Failed to inject the payload.";
        console.error(message);

        if (Graphics.printError) {
            Graphics.printError("Sponge Error", message); // TODO: Add error param on MZ
        }
    }
}