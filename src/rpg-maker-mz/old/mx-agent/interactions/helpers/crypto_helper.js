// --------------------------------------------------
// MX Packer Agent for RPG Maker MZ : Crypto Helper
// Copyright (c) 2022 June(aka handbros) all rights reserved.
// --------------------------------------------------

// 'fs' and 'path' are inherited from io_helper.

function CryptoHelper() {
    throw new Error('This is a static class');
}

CryptoHelper._fakeHeader = [0x52, 0x50, 0x47, 0x4D, 0x56, 0x00, 0x00, 0x00, 0x00, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00];

CryptoHelper._getExtension = function(currentExtension, useRMMZ = false) {
    currentExtension = currentExtension.toLowerCase();

    if (!useRMMZ) {
        switch (currentExtension) {
            case '.png':
                return '.rpgmvp';
            case '.ogg':
                return '.rpgmvo';
            case '.m4a':
                return '.rpgmvm';
            case '.wav':
                return '.rpgmvw';
            case '.rpgmvp':
                return '.png';
            case '.rpgmvo':
                return '.ogg';
            case '.rpgmvm':
                return '.m4a';
            case '.rpgmvw':
                return '.wav';
        }
    } else {
        switch (currentExtension) {
            case '.png':
                return '.png_';
            case '.ogg':
                return '.ogg_';
            case '.m4a':
                return '.m4a_';
            case '.wav':
                return '.wav_';
            case '.png_':
                return '.png';
            case '.ogg_':
                return '.ogg';
            case '.m4a_':
                return '.m4a';
            case '.wav_':
                return '.wav';
        }
    }

    return null;
}

CryptoHelper._splitString = function(string, place) {
    let chunks = [];

    for (var i = 0, charsLength = string.length; i < charsLength; i += place) {
        chunks.push(string.substring(i, i + place));
    }

    return chunks;
}

CryptoHelper._hexStringToByte = function(hexString) {
    return Buffer.from(hexString, "hex")[0];
}

CryptoHelper._verifyFakeHeader = function(filePath) {
    if (!fs.existsSync(filePath)) {
        throw "The file dosen't exist";
    }

    const file = (fs.readFileSync(filePath));

    for (let index = 0; index < HEADER_MV.length; index++) {
        if (file[index] != CryptoHelper._fakeHeader[index]) {
            return false;
        }
    }

    return true;
}

CryptoHelper.encrypt = function(filePath, saveDirectory, key, useRMMZ = false) {
    if (!fs.existsSync(filePath)) {
        throw "The file dosen't exist";
    }

    const extension = path.parse(filePath).ext.toLowerCase();

    if (CryptoHelper._getExtension(extension, useRMMZ) == null) {
        throw "An incompatible file format is used.";
    }

    // Encrypt
    let file = fs.readFileSync(filePath);

    const keys = CryptoHelper._splitString(key, 2);

    for (let index = 0; index < keys.length; index++) {
        file[index] = (file[index] ^ CryptoHelper._hexStringToByte(keys[index]));
    }

    const fakeHeaderBuffer = Buffer.from(CryptoHelper._fakeHeader);
    const encryptedExtension = CryptoHelper._getExtension(extension, useRMMZ);
    const encryptedFile = Buffer.concat([fakeHeaderBuffer, file], fakeHeaderBuffer.length + file.length);
    fs.writeFileSync(path.join(saveDirectory, `${path.parse(filePath).name}${encryptedExtension}`), encryptedFile);
}

CryptoHelper.decrypt = function(filePath, saveDirectory, key, useRMMZ = false) {
    if (!fs.existsSync(filePath)) {
        throw "The file dosen't exist";
    }

    const extension = path.parse(filePath).ext.toLowerCase();

    if (CryptoHelper._getExtension(extension, useRMMZ) == null) {
        throw "An incompatible file format is used.";
    }

    // Decrypt
    let file = (fs.readFileSync(filePath).slice(16));
    
    const keys = CryptoHelper._splitString(key, 2);

    for (let index = 0; index < keys.length; index++) {
        file[index] = (file[index] ^ CryptoHelper._hexStringToByte(keys[index]));
    }

    const decryptedExtension = CryptoHelper._getExtension(extension, useRMMZ);
    fs.writeFileSync(path.join(saveDirectory, `${path.parse(filePath).name}${decryptedExtension}`), file);
}