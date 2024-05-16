// --------------------------------------------------
// MX Packer Agent for RPG Maker MZ : Image Processor
// Copyright (c) 2022 June(aka handbros) all rights reserved.
// --------------------------------------------------

console.log('The MX Packer image processor has been loaded.');

function ImageProcessor() {
     throw new Error('This is a static class');
}

ImageProcessor.convertAvifToPng = function(filepath, bitmap) {
    let path = encodeURIComponent(filepath);
    let requestUrl = `http://localhost:49696/convert?format=png&filepath=${path}`;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", requestUrl);
    xhr.responseType = "arraybuffer"; 
    xhr.onload = () => {
        if (xhr.status < 400) {
            const arrayBuffer = xhr.response;
            const blob = new Blob([arrayBuffer]);
            bitmap._image.src = URL.createObjectURL(blob);
        } else {
            bitmap._onError();
        }
    };
    xhr.onerror = bitmap._onError.bind(bitmap);
    xhr.send();
};