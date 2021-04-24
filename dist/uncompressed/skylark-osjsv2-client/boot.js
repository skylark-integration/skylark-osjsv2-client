define([
    './core/init',
    "./utils/pepjs"
], function (Init) {
    'use strict';
    window.OSjs = Object.assign({
        error: (title, message, error, exception, bugreport) => {
            console.error(title, message, error, exception);
        },
        runTests: () => {
        },
        getConfig: () => {
            return {};
        },
        getManifest: () => {
            return {};
        },
        Themes: {},
        Dialogs: {},
        Locales: {},
        Extensions: {},
        Applications: {}
    }, window.OSjs || {});
    window.OSjs.require = n => {
        const mod = require('skylark-osjsv2-client/' + n);
        return mod;
        //return mod && mod.default ? mod.default : mod;
    };
    if (document.readyState !== 'loading') {
        Init.start();
    } else {
        document.addEventListener('DOMContentLoaded', () => Init.start());
    }
});