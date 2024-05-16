// --------------------------------------------------
// MX Packer Agent for RPG Maker MZ : AOT Converter Interaction
// Copyright (c) 2022 June(aka handbros) all rights reserved.
// --------------------------------------------------

// 'fs' and 'path' are inherited from io_helper.
const { spawn } = require('child_process');

// From process.cwd()
const SYSTEM_JSON_PATH = './data/System.json';
const SETTINGS_PATH = './js/plugins/mx-agent/settings.json';
const ICS_PATH = './js/plugins/mx-agent/externals/ImageConversionServer.exe';
// From current base directory
const CLOSER_PATH = './closer.html';

function setTitle(text) {
    let progressBar = document.getElementById("title");
    progressBar.innerText = text;
}

function setCaption(text) {
    let progressBar = document.getElementById("caption");
    progressBar.innerText = text;
}

function setProgress(percentage) {
    let progressBar = document.getElementById("inner-progress-bar");
    progressBar.style.width = percentage + '%';
    progressBar.setAttribute('aria-valuenow', percentage);
}

const mainDirectory = IOHelper.getMainDirectory();

// Get settings.
let settingsPath = path.resolve(mainDirectory, SETTINGS_PATH);
let settingsJson = JSON.parse(fs.readFileSync(settingsPath));

let icsPort = 49696;
let atpQuality = settingsJson.avif_to_png.q;
let atpEffort = settingsJson.avif_to_png.effort;
let atpCompressionLevel = settingsJson.avif_to_png.compression_level;
let atpUseInterlace = settingsJson.avif_to_png.use_interlace;

// Get encryption data.
let systemPath = path.resolve(mainDirectory, SYSTEM_JSON_PATH);
let systemJson = JSON.parse(fs.readFileSync(systemPath));
let isEncrypted = systemJson.hasEncryptedImages;
let encryptionKey = systemJson.encryptionKey;

let useRMMZ = true;

// Start ICS.
const icsPath = path.resolve(mainDirectory, ICS_PATH);

let icsOptions = ['-p', icsPort, '-t', '8', '--png-q', atpQuality, '--png-effort', atpEffort, '--png-compressionlevel', atpCompressionLevel];

if (atpUseInterlace) {
    icsOptions.push('--png-useinterlace');
}

let ics = spawn(icsPath, icsOptions, {
    stdio: 'ignore',
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

const imgDirectory = path.resolve(mainDirectory, './img');

if (!fs.existsSync(imgDirectory)) {
    alert("AOT conversion failed because the image directory doesn't exist.\nPlease restart the program to run the game in normal mode.");
    nw.Window.get().close();
    process.exit();
}

IOHelper.getFiles(imgDirectory, '.avif').then(async(files) => {
    const filesCount = files.length;
    setCaption(`${filesCount} items have been indexed.`);
    console.log(`${filesCount} items have been indexed.`);

    if (files.length == 0) {
        window.location.href = CLOSER_PATH;
    }

    // Convert images.
    setTitle('Converting files...');

    let finishedCount = 0;

    for (var i = 0; i < filesCount; i++) {
        let filePath = files[i];
        let extension = path.parse(filePath).ext;

        if (extension.toLowerCase() == '.avif') {
            AOTConversionHelper.convert(icsPort, filePath, isEncrypted, encryptionKey, useRMMZ, 0,
                () => {
                    // On finished...
                    let progress = Math.round(++finishedCount / filesCount * 100);
                    setCaption(`${progress}% (${finishedCount}/${filesCount})`);
                    setProgress(progress);
                },
                () => {
                    // On error...
                    let settingsPath = path.resolve(mainDirectory, SETTINGS_PATH);
                    let settingsJson = JSON.parse(fs.readFileSync(settingsPath));
                    settingsJson.use_aot_conversion = false;

                    fs.writeFileSync(settingsPath, JSON.stringify(settingsJson), 'utf8');

                    alert(`AOT conversion failed.\nPlease restart the program to run the game in normal mode.`);
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