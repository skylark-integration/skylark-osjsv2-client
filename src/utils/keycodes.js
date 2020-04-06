define(function () {
    'use strict';
    const Keycodes = function () {
        const list = {
            F1: 112,
            F2: 113,
            F3: 114,
            F4: 115,
            F6: 118,
            F7: 119,
            F8: 120,
            F9: 121,
            F10: 122,
            F11: 123,
            F12: 124,
            TILDE: 220,
            GRAVE: 192,
            CMD: 17,
            LSUPER: 91,
            RSUPER: 92,
            DELETE: 46,
            INSERT: 45,
            HOME: 36,
            END: 35,
            PGDOWN: 34,
            PGUP: 33,
            PAUSE: 19,
            BREAK: 19,
            CAPS_LOCK: 20,
            SCROLL_LOCK: 186,
            BACKSPACE: 8,
            SPACE: 32,
            TAB: 9,
            ENTER: 13,
            ESC: 27,
            LEFT: 37,
            RIGHT: 39,
            UP: 38,
            DOWN: 40
        };
        for (let n = 33; n <= 126; n++) {
            list[String.fromCharCode(n)] = n;
        }
        return Object.freeze(list);
    }();
    return Keycodes;
});