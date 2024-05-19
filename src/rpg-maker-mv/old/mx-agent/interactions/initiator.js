// --------------------------------------------------
// MX Packer Agent for RPG Maker MV : Initiator Interaction
// Copyright (c) 2022 June(aka handbros) all rights reserved.
// --------------------------------------------------

'use strict';

// 'fs' and 'path' are inherited from io_helper.

// From process.cwd()
var ITEMS_TO_PRELOAD_PATH = './js/plugins/mx-agent/items_to_preload.txt';
var SETTINGS_PATH = './js/plugins/mx-agent/settings.json';
// From current base directory
var AOT_CONVERTER_PATH = './aot_converter.html';
var CLOSER_PATH = './closer.html';

// Settings.
var highPerformanceSettings = {
    use_aot_conversion: false,
    ics: {
        port: 49696,
        max_threads: 8,
        use_caching: true,
        cache_duration: 10,
        use_preloading: false,
        items_to_preload: ""
    },
    avif_to_png: {
        q: 80,
        effort: 1,
        compression_level: 6,
        use_interlace: false
    }
};

var balancedSettings = {
    use_aot_conversion: false,
    ics: {
        port: 49696,
        max_threads: 8,
        use_caching: true,
        cache_duration: 10,
        use_preloading: false,
        items_to_preload: ""
    },
    avif_to_png: {
        q: 80,
        effort: 4,
        compression_level: 6,
        use_interlace: false
    }
};

var highQualitySettings = {
    use_aot_conversion: false,
    ics: {
        port: 49696,
        max_threads: 16,
        use_caching: true,
        cache_duration: 10,
        use_preloading: false,
        items_to_preload: ""
    },
    avif_to_png: {
        q: 100,
        effort: 4,
        compression_level: 6,
        use_interlace: false
    }
};

var settings = balancedSettings;

function validateSettings(settings) {
    if (settings.ics.port < 0 || settings.ics.port > 65535) {
        return [false, "ICS Port is out of range."];
    } else if (settings.ics.max_threads < 2 || settings.ics.max_threads > 100) {
        return [false, "ICS Max Threads is out of range."];
    } else if (settings.ics.use_caching && (settings.ics.cache_duration < 1 || settings.ics.cache_duration > 60)) {
        return [false, "ICS Cache Duration is out of range."];
    } else if (settings.avif_to_png.q < 0 || settings.avif_to_png.q > 100) {
        return [false, "ICS AVIF to PNG Quality is out of range."];
    } else if (settings.avif_to_png.effort < 1 || settings.avif_to_png.effort > 10) {
        return [false, "AVIF to PNG CPU Effort is out of range."];
    } else if (settings.avif_to_png.compression_level < 0 || settings.avif_to_png.compression_level > 9) {
        return [false, "AVIF to PNG Compression Level is out of range."];
    }

    return [true, "OK."];
}

function validateItemsToPreload(itemsToPreloadString) {
    var baseDirectory = IOHelper.getMainDirectory();
    var preloadingItemArray = itemsToPreloadString.split('|');

    for (var i = 0; i < preloadingItemArray.length; i++) {
        var itemPath = path.resolve(baseDirectory, preloadingItemArray[i]);

        if (!fs.existsSync(itemPath)) {
            return [false, 'An item does not exist(PATH: ' + itemPath + ').'];
        }
    }

    return [true, "OK."];
}

function changePreset(presetName) {
    var selectedSettings = null;

    switch (presetName) {
        case 'high_performance':
            selectedSettings = highPerformanceSettings;
            break;
        case 'balanced':
            selectedSettings = balancedSettings;
            break;
        case 'high_quality':
            selectedSettings = highQualitySettings;
            break;
    }

    document.getElementById("portInput").value = selectedSettings.ics.port;
    document.getElementById("maxThreadsInput").value = selectedSettings.ics.max_threads;
    document.getElementById("useCachingSwitch").checked = selectedSettings.ics.use_caching;
    document.getElementById("cacheDurationInput").value = selectedSettings.ics.cache_duration;
    document.getElementById("qualityInput").value = selectedSettings.avif_to_png.q;
    document.getElementById("effortInput").value = selectedSettings.avif_to_png.effort;
    document.getElementById("compressionLevelInput").value = selectedSettings.avif_to_png.compression_level;
    document.getElementById("useInterlaceSwitch").checked = selectedSettings.avif_to_png.use_interlace;
}

function getSettingsFromDocument() {
    return {
        use_aot_conversion: document.getElementById("useAotConversionSwitch").checked,
        ics: {
            port: document.getElementById("portInput").value,
            max_threads: document.getElementById("maxThreadsInput").value,
            use_caching: document.getElementById("useCachingSwitch").checked,
            cache_duration: document.getElementById("cacheDurationInput").value,
            use_preloading: document.getElementById("usePreloadingSwitch").checked,
            items_to_preload: document.getElementById("itemsToPreloadInput").value.toString()
        },
        avif_to_png: {
            q: document.getElementById("qualityInput").value,
            effort: document.getElementById("effortInput").value,
            compression_level: document.getElementById("compressionLevelInput").value,
            use_interlace: document.getElementById("useInterlaceSwitch").checked
        }
    };
}

function applySettings() {
    var documentSettings = getSettingsFromDocument();
    var settingsValidationResult = validateSettings(documentSettings);
    var itemsToPreloadValidationResult = validateItemsToPreload(documentSettings.ics.items_to_preload);

    if (settingsValidationResult[0] == false) {
        alert('Unable to save settings. ' + settingsValidationResult[1]);
    } else if (itemsToPreloadValidationResult[0] == false) {
        alert('Unable to save settings. ' + itemsToPreloadValidationResult[1]);
    } else {
        settings.use_aot_conversion = documentSettings.use_aot_conversion;
        settings.ics.port = settings.ics.port;
        settings.ics.max_threads = settings.ics.max_threads;
        settings.ics.use_caching = settings.ics.use_caching;
        settings.ics.cache_duration = settings.ics.cache_duration;
        settings.ics.use_preloading = settings.ics.use_preloading;
        settings.ics.items_to_preload = settings.ics.items_to_preload;
        settings.avif_to_png.q = settings.avif_to_png.q;
        settings.avif_to_png.effort = settings.avif_to_png.effort;
        settings.avif_to_png.compression_level = settings.avif_to_png.compression_level;
        settings.avif_to_png.use_interlace = settings.avif_to_png.use_interlace;

        var modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('settingsModal'));
        modal.hide();
    }
}

function start() {
    // Save settings as JSON.
    var settingsValidationResult = validateSettings(settings);
    var itemsToPreloadValidationResult = validateItemsToPreload(settings.ics.items_to_preload);

    if (settingsValidationResult[0] == false) {
        alert('Unable to save settings. ' + settingsValidationResult[1]);
    } else if (itemsToPreloadValidationResult[0] == false) {
        alert('Unable to save settings. ' + itemsToPreloadValidationResult[1]);
    } else {
        var settingsPath = path.resolve(IOHelper.getMainDirectory(), SETTINGS_PATH);
        var settingsJson = JSON.stringify(settings);

        fs.writeFileSync(settingsPath, settingsJson, 'utf8');

        if (settings.use_aot_conversion) {
            window.location.href = AOT_CONVERTER_PATH;
        } else {
            window.location.href = CLOSER_PATH;
        }
    }
}

// Set window location to center screen.
var currentWindow = nw.Window.get();
var locationX = window.screen.width / 2 - currentWindow.width / 2;
var locationY = window.screen.height / 2 - currentWindow.height / 2;
window.moveTo(locationX, locationY);

// Get items to preload preset created by MX Packer.
var itpPath = path.resolve(IOHelper.getMainDirectory(), ITEMS_TO_PRELOAD_PATH);

if (fs.existsSync(itpPath)) {
    var itp = fs.readFileSync(itpPath, { encoding: 'utf8', flag: 'r' });

    var itemsToPreloadValidationResult = validateItemsToPreload(itp);

    if (itemsToPreloadValidationResult[0] == true) {
        settings.ics.use_preloading = true;
        settings.ics.items_to_preload = itp;
        document.getElementById("usePreloadingSwitch").checked = true;
        document.getElementById("itemsToPreloadInput").value = itp;
    }
}