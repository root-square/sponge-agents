// --------------------------------------------------
// MX Packer Agent for RPG Maker MV : IO Helper
// Copyright (c) 2022 June(aka handbros) all rights reserved.
// --------------------------------------------------

'use strict';

var fs = require('fs');
var path = require('path');

function IOHelper() {
    throw new Error('This is a static class');
}

IOHelper._toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
            arr2[i] = arr[i];
        }

        return arr2;
    } else {
        return Array.from(arr);
    }
}

IOHelper.getMainDirectory = function () {
    var workDirectory = process.cwd();
    var packageJsonPath = path.resolve(workDirectory, 'package.json');

    var jsonData = JSON.parse(fs.readFileSync(packageJsonPath));
    var resourceDirectory = path.dirname(jsonData.main);

    return path.resolve(workDirectory, resourceDirectory);
};

IOHelper.getFiles = async function (dirName, extension) {
    var files = [];
    var items = await fs.promises.readdir(dirName, { withFileTypes: true });

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var item = _step.value;

            if (item.isDirectory()) {
                files = [].concat(IOHelper._toConsumableArray(files), IOHelper._toConsumableArray((await IOHelper.getFiles(dirName + '/' + item.name))));
            } else {
                files.push(dirName + '/' + item.name);
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    if (extension != null) {
        var filteredFiles = [];

        for (var i = 0; i < files.length; i++) {
            var filextension = path.extname(files[i]).toLowerCase();

            if (extension != filextension) {
                continue;
            }

            filteredFiles.push(files[i]);
        }

        files = filteredFiles;
    }

    return files;
};