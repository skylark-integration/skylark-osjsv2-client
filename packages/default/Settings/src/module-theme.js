define(['./locales'], function (Translations) {
    'use strict';
    const Locales = OSjs.require('core/locales');
    const Dialog = OSjs.require('core/dialog');
    const FileMetadata = OSjs.require('vfs/file');
    const Theme = OSjs.require('core/theme');
    const _ = Locales.createLocalizer(Translations);
    return {
        group: 'personal',
        name: 'Theme',
        label: 'LBL_THEME',
        icon: 'apps/preferences-desktop-wallpaper.png',
        watch: ['CoreWM'],
        init: function () {
        },
        update: function (win, scheme, settings, wm) {
            win._find('BackgroundImage').set('value', settings.wallpaper);
            win._find('BackgroundColor').set('value', settings.backgroundColor);
            win._find('FontName').set('value', settings.fontFamily);
            win._find('StyleThemeName').set('value', settings.styleTheme);
            win._find('IconThemeName').set('value', settings.iconTheme);
            win._find('EnableTouchMenu').set('value', settings.useTouchMenu);
            win._find('BackgroundStyle').set('value', settings.background);
            win._find('BackgroundImage').set('value', settings.wallpaper);
            win._find('BackgroundColor').set('value', settings.backgroundColor);
        },
        render: function (win, scheme, root, settings, wm) {
            function _createDialog(n, a, done) {
                win._toggleDisabled(true);
                Dialog.create(n, a, function (ev, button, result) {
                    win._toggleDisabled(false);
                    if (button === 'ok' && result) {
                        done(result);
                    }
                }, win);
            }
            win._find('StyleThemeName').add(Theme.getStyleThemes().map(function (t) {
                return {
                    label: t.title,
                    value: t.name
                };
            }));
            win._find('IconThemeName').add(function (tmp) {
                return Object.keys(tmp).map(function (t) {
                    return {
                        label: tmp[t],
                        value: t
                    };
                });
            }(Theme.getIconThemes()));
            win._find('BackgroundImage').on('open', function (ev) {
                _createDialog('File', {
                    mime: ['^image'],
                    file: new FileMetadata(ev.detail)
                }, function (result) {
                    win._find('BackgroundImage').set('value', result.path);
                });
            });
            win._find('BackgroundColor').on('open', function (ev) {
                _createDialog('Color', { color: ev.detail }, function (result) {
                    win._find('BackgroundColor').set('value', result.hex);
                }, win);
            });
            win._find('FontName').on('click', function () {
                _createDialog('Font', {
                    fontName: settings.fontFamily,
                    fontSize: -1
                }, function (result) {
                    win._find('FontName').set('value', result.fontName);
                }, win);
            });
            win._find('BackgroundStyle').add([
                {
                    value: 'image',
                    label: _('LBL_IMAGE')
                },
                {
                    value: 'image-repeat',
                    label: _('Image (Repeat)')
                },
                {
                    value: 'image-center',
                    label: _('Image (Centered)')
                },
                {
                    value: 'image-fill',
                    label: _('Image (Fill)')
                },
                {
                    value: 'image-strech',
                    label: _('Image (Streched)')
                },
                {
                    value: 'color',
                    label: _('LBL_COLOR')
                }
            ]);
        },
        save: function (win, scheme, settings, wm) {
            settings.styleTheme = win._find('StyleThemeName').get('value');
            settings.iconTheme = win._find('IconThemeName').get('value');
            settings.useTouchMenu = win._find('EnableTouchMenu').get('value');
            settings.wallpaper = win._find('BackgroundImage').get('value');
            settings.backgroundColor = win._find('BackgroundColor').get('value');
            settings.background = win._find('BackgroundStyle').get('value');
            settings.fontFamily = win._find('FontName').get('value');
        }
    };
});