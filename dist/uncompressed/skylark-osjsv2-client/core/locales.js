define([
    '../utils/misc'
], function (misc) {
    'use strict';
    let DefaultLocale = 'en_EN';
    let CurrentLocale = 'en_EN';
    let CurrentRTL = [];
    function _() {
        let userLocale = {};
        let systemLocale = {};
        try {
            userLocale = OSjs.require('locales/' + CurrentLocale ); // modified by lwf
            systemLocale = OSjs.require('locales/' + DefaultLocale ); // modified by lwf
        } catch (e) {
            console.warn('Locale error', e);
        }
        const s = arguments[0];
        let a = arguments;
        try {
            if (userLocale && userLocale[s]) {
                a[0] = userLocale[s];
            } else {
                a[0] = systemLocale[s] || s;
            }
            return a.length > 1 ? misc.format.apply(null, a) : a[0];
        } catch (e) {
            console.warn(e.stack, e);
        }
        return s;
    }
    function __() {
        const l = arguments[0];
        const s = arguments[1];
        let a = Array.prototype.slice.call(arguments, 1);
        if (l[CurrentLocale] && l[CurrentLocale][s]) {
            a[0] = l[CurrentLocale][s];
        } else {
            a[0] = l[DefaultLocale] ? l[DefaultLocale][s] || s : s;
            if (a[0] && a[0] === s) {
                a[0] = _.apply(null, a);
            }
        }
        return a.length > 1 ? misc.format.apply(null, a) : a[0];
    }
    function getLocale() {
        return CurrentLocale;
    }
    function setLocale(l) {
        let locale;
        try {
            locale = OSjs.require('locales/' + l); // modified by lwf
        } catch (e) {
            console.warn('Failed to set locale', e);
            return;
        }
        if (locale) {
            CurrentLocale = l;
        } else {
            console.warn('Locales::setLocale()', 'Invalid locale', l, '(Using default)');
            CurrentLocale = DefaultLocale;
        }
        const major = CurrentLocale.split('_')[0];
        const html = document.querySelector('html');
        if (html) {
            html.setAttribute('lang', l);
            html.setAttribute('dir', CurrentRTL.indexOf(major) !== -1 ? 'rtl' : 'ltr');
        }
        console.info('Locales::setLocale()', CurrentLocale);
    }
    function createLocalizer(locales) {
        return function () {
            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift(locales);
            return __(...args);
        };
    }
    function init(locale, options, languages) {
        options = options || {};
        const names = languages ? Object.keys(languages) : {};
        if (names instanceof Array && names.indexOf(locale) !== -1) {
            CurrentLocale = locale;
        }
        CurrentRTL = options.RTL || [];
        names.forEach(k => {
            OSjs.Locales[k] = OSjs.require('locales/' + k);//modified by lwf
        });
    }
    return {
        _: _,
        __: __,
        getLocale: getLocale,
        setLocale: setLocale,
        createLocalizer: createLocalizer,
        init: init
    };
});