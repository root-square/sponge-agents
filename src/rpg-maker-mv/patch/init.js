/*!
  * Sponge for RPG Maker MV
  * Copyright (c) 2024 Sponge Contributors all rights reserved.
  * Licensed under the MIT License.
  */

'use strict';

function Initializer() {
    throw new Error('This is a static class');
}

Initializer.showDevTools = function() {
    if (process.versions["nw-flavor"] === "sdk") {
        require('nw.gui').Window.get().showDevTools();
    } else {
        var message = "The current nw.js runtime is not an SDK version. Failed to open DevTools.";
        console.error(message);

        if (Graphics.printError) {
            Graphics.printError("Sponge Error", message); // TODO: Add error param on MZ
        }
    }
};

Initializer.loadScript = function (url, callback) {
    var script = document.createElement("script")
    script.type = "text/javascript";
    if (script.readyState) {  // Note: It's only required for IE <9
        script.onreadystatechange = function () {
            if (script.readyState === "loaded" || script.readyState === "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  // Others
        script.onload = function () {
            callback();
        };
    }

    script.src = url;
    document.head.appendChild(script);
};

Initializer.showDevTools();

Initializer.loadScript("./scripts/api.js", () => {});
Initializer.loadScript("./scripts/injector.js", () => {
    Injector.inject();
});