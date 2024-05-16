// --------------------------------------------------
// MX Packer Agent for RPG Maker MV : Injector
// Copyright (c) 2022 June(aka handbros) all rights reserved.
// --------------------------------------------------

'use strict';

// --------------------------------------------------
// Functions to Inject : MV
// --------------------------------------------------

function requestImage(url) {
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

// --------------------------------------------------
// Injector
// --------------------------------------------------

console.log('The MX Packer injector has been loaded.');

// Inject functions.
var rpgMakerName = Utils.RPGMAKER_NAME;
var rpgMakerVersion = Utils.RPGMAKER_VERSION;

if (rpgMakerName == 'MV') {
    switch (rpgMakerVersion) {
        default:
            Bitmap.prototype._mainDirectory = getMainDirectory();
            Bitmap.prototype._requestImage = requestImage;
            break;
    }
} else {
    alert('This game is made with an unknown tool. The injector cannot inject functions into the game.');
    nw.Window.get().close();
    process.exit();
}

console.log('Modified functions are injected successfully.');