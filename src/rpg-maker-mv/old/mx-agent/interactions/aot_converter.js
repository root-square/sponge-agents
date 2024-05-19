// --------------------------------------------------
// MX Packer Agent for RPG Maker MV : AOT Converter Interaction
// Copyright (c) 2022 June(aka handbros) all rights reserved.
// --------------------------------------------------

'use strict';

// 'fs' and 'path' are inherited from io_helper.
var _child_process = require('child_process');

var spawn = _child_process.spawn;

// From process.cwd()
var SYSTEM_JSON_PATH = './data/System.json';
var SETTINGS_PATH = './js/plugins/mx-agent/settings.json';
var ICS_PATH = './js/plugins/mx-agent/externals/ImageConversionServer.exe';
// From current base directory
var CLOSER_PATH = './closer.html';

function setTitle(text) {
    var progressBar = document.getElementById("title");
    progressBar.innerText = text;
}

function setCaption(text) {
    var progressBar = document.getElementById("caption");
    progressBar.innerText = text;
}

function setProgress(percentage) {
    var progressBar = document.getElementById("inner-progress-bar");
    progressBar.style.width = percentage + '%';
    progressBar.setAttribute('aria-valuenow', percentage);
}

var mainDirectory = IOHelper.getMainDirectory();

// Get settings.
var settingsPath = path.resolve(mainDirectory, SETTINGS_PATH);
var settingsJson = JSON.parse(fs.readFileSync(settingsPath));

var icsPort = 49696;
var atpQuality = settingsJson.avif_to_png.q;
var atpEffort = settingsJson.avif_to_png.effort;
var atpCompressionLevel = settingsJson.avif_to_png.compression_level;
var atpUseInterlace = settingsJson.avif_to_png.use_interlace;

// Get encryption data.
var systemPath = path.resolve(mainDirectory, SYSTEM_JSON_PATH);
var systemJson = JSON.parse(fs.readFileSync(systemPath));
var isEncrypted = systemJson.hasEncryptedImages;
var encryptionKey = systemJson.encryptionKey;

var useRMMZ = false;

// Start ICS.
var icsPath = path.resolve(mainDirectory, ICS_PATH);

var icsOptions = ['-p', icsPort, '-t', '8', '--png-q', atpQuality, '--png-effort', atpEffort, '--png-compressionlevel', atpCompressionLevel];

if (atpUseInterlace) {
    icsOptions.push('--png-useinterlace');
}

var ics = spawn(icsPath, icsOptions, {
    stdio: 'ignore'
});

/*
ics.stdout.setEncoding('utf8');

ics.stdout.on('data', function (data) {
    console.log(data);
});
*/

// Index images.

setTitle('Indexing files...');
setCaption('Now indexing files. Hold on a minute please.');
setProgress(0);

var imgDirectory = path.resolve(mainDirectory, './img');

if (!fs.existsSync(imgDirectory)) {
    alert("AOT conversion failed because the image directory doesn't exist.\nPlease restart the program to run the game in normal mode.");
    nw.Window.get().close();
    process.exit();
}

IOHelper.getFiles(imgDirectory, '.avif').then(async function (files) {
    var filesCount = files.length;
    setCaption(filesCount + ' items have been indexed.');
    console.log(filesCount + ' items have been indexed.');

    if (files.length == 0) {
        window.location.href = CLOSER_PATH;
    }

    // Convert images.
    setTitle('Converting files...');

    var finishedCount = 0;

    for (var i = 0; i < filesCount; i++) {
        var filePath = files[i];
        var extension = path.parse(filePath).ext;

        if (extension.toLowerCase() == '.avif') {
            AOTConversionHelper.convert(icsPort, filePath, isEncrypted, encryptionKey, useRMMZ, 0, function () {
                // On finished...
                var progress = Math.round(++finishedCount / filesCount * 100);
                setCaption(progress + '% (' + finishedCount + '/' + filesCount + ')');
                setProgress(progress);
            }, function () {
                // On error...
                var settingsPath = path.resolve(mainDirectory, SETTINGS_PATH);
                var settingsJson = JSON.parse(fs.readFileSync(settingsPath));
                settingsJson.use_aot_conversion = false;

                fs.writeFileSync(settingsPath, JSON.stringify(settingsJson), 'utf8');

                alert('AOT conversion failed.\nPlease restart the program to run the game in normal mode.');
                nw.Window.get().close();
                process.exit();
            });
        }
    }

    while (true) {
        await AOTConversionHelper._sleep(100);

        if (finishedCount == filesCount) {
            window.location.href = CLOSER_PATH;
        }
    }
});