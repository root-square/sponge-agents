// --------------------------------------------------
// MX Packer Agent for RPG Maker MZ : Injector
// Copyright (c) 2022 June(aka handbros) all rights reserved.
// --------------------------------------------------

// --------------------------------------------------
// Functions to Inject : MZ
// --------------------------------------------------

function startLoading() {
    this._image = new Image();
    this._image.onload = this._onLoad.bind(this);
    this._image.onerror = this._onError.bind(this);
    this._destroyCanvas();
    this._loadingState = "loading";

    // Create an avif file path.
    let avifUrl = this._url.substr(0, this._url.lastIndexOf(".")) + '.avif';
    let avifPath = decodeURIComponent(path.resolve(Bitmap.prototype._mainDirectory, avifUrl)); // Decode the avif path to check its existence.

    if (IS_DEV_MODE) {
        console.log(`avifPath : ${avifPath}, isExist : ${fs.existsSync(avifPath)}`);
    }

    if (fs.existsSync(avifPath) /* If the avif file exists... */) {
        ImageProcessor.convertAvifToPng(avifPath, this);
    } else if (Utils.hasEncryptedImages()) {
        this._startDecrypting();
    } else {
        this._image.src = this._url;
    }
};

// --------------------------------------------------
// Injector
// --------------------------------------------------

console.log('The MX Packer injector has been loaded.');

// Inject functions.
let rpgMakerName = Utils.RPGMAKER_NAME;
let rpgMakerVersion = Utils.RPGMAKER_VERSION;

if (rpgMakerName == 'MZ') {
    switch (rpgMakerVersion) {
        default:
            Bitmap.prototype._mainDirectory = getMainDirectory();
            Bitmap.prototype._startLoading = startLoading;
            break;
    }
}
else {
    alert('This game is made with an unknown tool. The injector cannot inject functions into the game.');
    nw.Window.get().close();
    process.exit();
}

console.log('Modified functions are injected successfully.');