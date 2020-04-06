define(function () {
    'use strict';
    return class FileDataURL {
        constructor(dataURL) {
            this.dataURL = dataURL;
        }
        toBase64() {
            return this.data.split(',')[1];
        }
        toString() {
            return this.dataURL;
        }
    };
});