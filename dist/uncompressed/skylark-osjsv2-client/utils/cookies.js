define(function () {
    'use strict';
    function getCookie(k) {
        const map = {};
        document.cookie.split(/;\s+?/g).forEach(i => {
            const idx = i.indexOf('=');
            map[i.substr(i, idx)] = i.substr(idx + 1);
        });
        return k ? map[k] : map;
    }
    return { getCookie: getCookie };
});