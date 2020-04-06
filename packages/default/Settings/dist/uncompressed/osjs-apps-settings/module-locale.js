define(function () {
    'use strict';
    const Config = OSjs.require('core/config');
    const Locales = OSjs.require('core/locales');
    return {
        group: 'user',
        name: 'Locale',
        label: 'LBL_LOCALE',
        icon: 'apps/accessories-character-map.png',
        init: function () {
        },
        update: function (win, scheme, settings, wm) {
            const config = Config.getConfig();
            const locales = config.Languages;
            win._find('UserLocale').clear().add(Object.keys(locales).filter(function (l) {
                return !!OSjs.Locales[l];
            }).map(function (l) {
                return {
                    label: locales[l],
                    value: l
                };
            })).set('value', Locales.getLocale());
        },
        render: function (win, scheme, root, settings, wm) {
        },
        save: function (win, scheme, settings, wm) {
            settings.language = win._find('UserLocale').get('value');
        }
    };
});