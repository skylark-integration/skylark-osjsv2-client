define(function () {
    'use strict';
    let _CLIPBOARD;
    function setClipboard(data) {
        console.debug('setClipboard()', data);
        _CLIPBOARD = data;
    }
    function getClipboard() {
        return _CLIPBOARD;
    }
    return {
        setClipboard: setClipboard,
        getClipboard: getClipboard
    };
});