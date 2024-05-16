// --------------------------------------------------
// MX Packer Agent for RPG Maker MZ : Initializer
// Copyright (c) 2022 June(aka handbros) all rights reserved.
// --------------------------------------------------

const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const IS_DEV_MODE = false;
const IS_ICS_TEST_MODE = false;

const ICS_PATH = './js/plugins/mx-agent/externals/ImageConversionServer.exe';
const SETTINGS_PATH = './js/plugins/mx-agent/settings.json';
const INITIATOR_PATH = './js/plugins/mx-agent/interactions/initiator.html';
const IMG_PROCESSOR_PATH = './js/plugins/mx-agent/image_processor.js';
const INJECTOR_PATH = './js/plugins/mx-agent/injector.js';

let ics = null; // Image Converter Server Process.
let settings = null;

function getMainDirectory() {
    let workirectory = process.cwd();
    let packageJsonPath = path.resolve(workirectory, 'package.json');

    let jsonData = JSON.parse(fs.readFileSync(packageJsonPath));
    let resourceDirectory = path.dirname(jsonData.main);

    return path.resolve(workirectory, resourceDirectory);
}

function checkPlatform() {
    let isSuitablePlatform = false;

    if (os.type() == 'Windows_NT' && (os.arch == 'ia32' || os.arch == 'x64')) {
        isSuitablePlatform = true;
    }

    return isSuitablePlatform;
}

function checkDotnetRuntime() {
    let execResult = execSync('dotnet --list-runtimes').toString();

    let dotnetCoreAppRuntimes = execResult.match(/Microsoft.NETCore.App \d{1,3}.\d{1,3}.\d{1,3}/g); // array

    let result = false;

    for (var value of dotnetCoreAppRuntimes) {
        let versionRegex = /6.\d{1,3}.\d{1,3}/g;

        if (versionRegex.test(value)) {
            result = true;
        } else {
            result = false;
        }
    }

    return result;
}

function checkICS() {
    const icsPath = path.resolve(getMainDirectory(), ICS_PATH);
    return fs.existsSync(icsPath);
}

function checkSettings() {
    const settingsPath = path.resolve(getMainDirectory(), SETTINGS_PATH);
    return fs.existsSync(settingsPath)
}

function initializeICS() {
    if (!IS_ICS_TEST_MODE) {
        const icsPath = path.resolve(getMainDirectory(), ICS_PATH);

        let icsOptions = ['-p', settings.ics.port, '-t', settings.ics.max_threads, '--png-q', settings.avif_to_png.q, '--png-effort', settings.avif_to_png.effort, '--png-compressionlevel', settings.avif_to_png.compression_level];

        if (settings.ics.use_caching) {
            icsOptions.push('--use-caching');
            icsOptions.push('-d');
            icsOptions.push(settings.ics.cache_duration);
        }

        if (settings.ics.use_preloading && settings.ics.items_to_preload != '' && settings.ics.items_to_preload != null) {
            // Check and resolve paths.
            const baseDirectory = getMainDirectory();
            const preloadingItemArray = settings.ics.items_to_preload.split('|');
            const preloadnigItemPaths = [];

            for (var i = 0; i < preloadingItemArray.length; i++) {
                const itemPath = path.resolve(baseDirectory, preloadingItemArray[i]);

                if (fs.existsSync(itemPath)) {
                    preloadnigItemPaths.push(itemPath);
                }
            }

            icsOptions.push('--use-preloading');
            icsOptions.push('-f');
            icsOptions.push('png');
            icsOptions.push('-i');
            icsOptions.push(`${preloadnigItemPaths.join('|')}`);
        }

        if (settings.avif_to_png.use_interlace) {
            icsOptions.push('--png-useinterlace');
        }

        ics = spawn(icsPath, icsOptions, {
            stdio: 'ignore'
        });

        /*
        ics.stdout.setEncoding('utf8');

        ics.stdout.on('data', function (data) {
            console.log(data);
        });
        */
    }
}

function initializeAgent() {
    // Loads the image processor.
    let imageProcessorScript = document.createElement('script');
    imageProcessorScript.type = 'text/javascript';
    imageProcessorScript.src = IMG_PROCESSOR_PATH;
    document.head.appendChild(imageProcessorScript);

    // Loads the injector.
    let injectorScript = document.createElement('script');
    injectorScript.type = 'text/javascript';
    injectorScript.src = INJECTOR_PATH;
    document.head.appendChild(injectorScript);
}

function initializeSettings() {
    const settingsPath = path.resolve(getMainDirectory(), SETTINGS_PATH);
    settings = JSON.parse(fs.readFileSync(settingsPath));
}

function initializeDevTools() {
    require('nw.gui').Window.get().showDevTools();
}

// Check requirements.
if (checkPlatform() == false) {
    alert(`The MX Packer Agent is not available in your system environment.${os.EOL}(OS : ${os.platform}, Architecture : ${os.arch})`);
    nw.Window.get().close();
    process.exit();
}

if (checkDotnetRuntime() == false) {
    alert(`To use the MX Packer Agent, .NET 6 runtime is required.`);
    nw.Window.get().close();
    process.exit();
}

if (checkICS() == false) {
    alert(`MX Image Conversion Server does not exist. Unable to start the game.`);
    nw.Window.get().close();
    process.exit();
}

if (checkSettings() == false) {
    window.location.href = INITIATOR_PATH; // This changes nw.js base directory to 'process.cwd()/.../js/plugins/mx-agent/interactions/'
} else {
    initializeSettings();

    // If an error has occurred while AOT converting, remove the 'settings.json'. 
    if (settings.use_aot_conversion == false) {
        // Initialize components.
        initializeICS();
        initializeAgent();

        if (IS_DEV_MODE) {
            // Check current environment is nw.js SDK.
            if (process.versions["nw-flavor"] === "sdk") {
                initializeDevTools();
            } else {
                alert(`The developer mode is only available in SDK version of nw.js.`);
                nw.Window.get().close();
                process.exit();
            }
        }
    }

    // Set window location to center screen.
    var currentWindow = nw.Window.get();
    let locationX = (window.screen.width / 2) - (currentWindow.width / 2);
    let locationY = (window.screen.height / 2) - (currentWindow.height / 2);
    window.moveTo(locationX, locationY);
}