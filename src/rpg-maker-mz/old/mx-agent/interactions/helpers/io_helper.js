// --------------------------------------------------
// MX Packer Agent for RPG Maker MZ : IO Helper
// Copyright (c) 2022 June(aka handbros) all rights reserved.
// --------------------------------------------------

const fs = require('fs');
const path = require('path');

function IOHelper() {
    throw new Error('This is a static class');
}

IOHelper.getMainDirectory = function() {
    let workDirectory = process.cwd();
    let packageJsonPath = path.resolve(workDirectory, 'package.json');

    let jsonData = JSON.parse(fs.readFileSync(packageJsonPath));
    let resourceDirectory = path.dirname(jsonData.main);

    return path.resolve(workDirectory, resourceDirectory);
}

IOHelper.getFiles = async (dirName, extension) => {
    let files = [];
    const items = await fs.promises.readdir(dirName, { withFileTypes: true });

    for (const item of items) {
        if (item.isDirectory()) {
            files = [
                ...files,
                ...(await IOHelper.getFiles(`${dirName}/${item.name}`)),
            ];
        } else {
            files.push(`${dirName}/${item.name}`);
        }
    }
    
    if(extension != null) {
        let filteredFiles = [];

        for (var i=0; i<files.length; i++) {
            let filextension = path.extname(files[i]).toLowerCase();
    
            if (extension != filextension) {
                continue;
            }
    
            filteredFiles.push(files[i]);
        }
    
        files = filteredFiles;
    }

    return files;
};