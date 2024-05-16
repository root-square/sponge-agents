// --------------------------------------------------
// MX Packer Agent for RPG Maker MV : AOT Conversion Helper
// Copyright (c) 2022 June(aka handbros) all rights reserved.
// --------------------------------------------------

var http = require('http');

function AOTConversionHelper() {
    throw new Error('This is a static class');
}

AOTConversionHelper._encryptionIgnores = ['img/system/Window.png', 'img/system/Loading.png'];

AOTConversionHelper._checkImgEncryptionIgnore = function (path) {
    for (var i = 0; i < AOTConversionHelper._encryptionIgnores.length; i++) {
        if (path.toLowerCase().endsWith(AOTConversionHelper._encryptionIgnores[i].toLowerCase())) {
            return true;
        }
    }

    return false;
};

AOTConversionHelper._sleep = function (ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
};

AOTConversionHelper.convert = async function (icsPort, filePath, isEncrypted, encryptionKey, useRMMZ, retryCount, onFinished, onError) {
    var encodedFilePath = encodeURIComponent(filePath);

    await http.get('http://localhost:' + icsPort + '/convert?format=png&filepath=' + encodedFilePath, function (response) {
        var rawData = [];
        response.on('data', function (chunk) {
            rawData.push(chunk);
        });

        response.on('end', async function () {
            try {
                var convertedFilePath = filePath.substring(0, filePath.lastIndexOf('.')) + '.png';
                var convertedFile = Buffer.concat(rawData);

                fs.writeFileSync(convertedFilePath, convertedFile);

                if (isEncrypted) {
                    if (AOTConversionHelper._checkImgEncryptionIgnore(convertedFilePath)) {
                        // In RMMZ, all images be encrypted.
                        if (useRMMZ) {
                            CryptoHelper.encrypt(convertedFilePath, path.dirname(convertedFilePath), encryptionKey, useRMMZ);
                            fs.unlinkSync(convertedFilePath); // Delete the PNG file.
                        }
                    } else {
                        CryptoHelper.encrypt(convertedFilePath, path.dirname(convertedFilePath), encryptionKey, useRMMZ);
                        fs.unlinkSync(convertedFilePath); // Delete the PNG file.
                    }
                }

                fs.unlinkSync(filePath); // Delete the AVIF file.

                onFinished();
            } catch (e) {
                if (retryCount <= 10) {
                    await AOTConversionHelper._sleep(1000);
                    AOTConversionHelper.convert(icsPort, filePath, isEncrypted, encryptionKey, useRMMZ, ++retryCount, onFinished, onError);
                    console.log('Retry(#' + retryCount + ') to convert \'' + filePath + '\'');
                } else {
                    console.error('An unknown error has occurred: ' + e.message);
                    onError();
                }
            }
        });
    }).on('error', async function (e) {
        // Retry
        if (retryCount <= 10) {
            await AOTConversionHelper._sleep(1000);
            AOTConversionHelper.convert(icsPort, filePath, isEncrypted, encryptionKey, useRMMZ, ++retryCount, onFinished, onError);
            console.log('Retry(#' + retryCount + ') to convert \'' + filePath + '\'');
        } else {
            console.error('An unknown error has occurred: ' + e.message);
            onError();
        }
    });
};