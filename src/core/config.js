define(['../helpers/simplejsonconf'], function (SimpleJSON) {
    'use strict';
    function getConfig(path, defaultValue) {
        const config = OSjs.getConfig();
        if (!path) {
            return config;
        }
        const result = SimpleJSON.getJSON(config, path, defaultValue);
        return typeof result === 'object' && !(result instanceof Array) ? Object.assign({}, result) : result;
    }
    function getDefaultPath(fallback) {
        if (fallback && fallback.match(/^\//)) {
            fallback = null;
        }
        return getConfig('VFS.Home') || fallback || getConfig('VFS.Dist');
    }
    function getBrowserPath(app) {
        let str = getConfig('Connection.RootURI');
        if (typeof app === 'string') {
            str = str.replace(/\/?$/, app.replace(/^\/?/, '/'));
        }
        return str;
    }
    function getUserLocale() {
        const loc = (window.navigator.userLanguage || window.navigator.language || 'en-EN').replace('-', '_');
        const map = {
            'nb': 'no_NO',
            'es': 'es_ES',
            'ru': 'ru_RU',
            'en': 'en_EN'
        };
        const major = loc.split('_')[0] || 'en';
        const minor = loc.split('_')[1] || major.toUpperCase();
        if (map[major]) {
            return map[major];
        }
        return major + '_' + minor;
    }
    return {
        getConfig: getConfig,
        getDefaultPath: getDefaultPath,
        getBrowserPath: getBrowserPath,
        getUserLocale: getUserLocale
    };
});