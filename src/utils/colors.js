define(function () {
    'use strict';
    function convertToRGB(hex) {
        const rgb = parseInt(hex.replace('#', ''), 16);
        const val = {};
        val.r = (rgb & 255 << 16) >> 16;
        val.g = (rgb & 255 << 8) >> 8;
        val.b = rgb & 255;
        return val;
    }
    function convertToHEX(r, g, b) {
        if (typeof r === 'object') {
            g = r.g;
            b = r.b;
            r = r.r;
        }
        if (typeof r === 'undefined' || typeof g === 'undefined' || typeof b === 'undefined') {
            throw new Error('Invalid RGB supplied to convertToHEX()');
        }
        const hex = [
            parseInt(r, 10).toString(16),
            parseInt(g, 10).toString(16),
            parseInt(b, 10).toString(16)
        ];
        Object.keys(hex).forEach(i => {
            if (hex[i].length === 1) {
                hex[i] = '0' + hex[i];
            }
        });
        return '#' + hex.join('').toUpperCase();
    }
    function invertHEX(hex) {
        let color = parseInt(hex.replace('#', ''), 16);
        color = 16777215 ^ color;
        color = color.toString(16);
        color = ('000000' + color).slice(-6);
        return '#' + color;
    }
    return {
        convertToRGB: convertToRGB,
        convertToHEX: convertToHEX,
        invertHEX: invertHEX
    };
});