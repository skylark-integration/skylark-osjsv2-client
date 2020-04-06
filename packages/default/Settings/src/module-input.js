define(['./locales'], function (Translations) {
    'use strict';
    const Locales = OSjs.require('core/locales');
    const Dialog = OSjs.require('core/dialog');
    const Utils = OSjs.require('utils/misc');
    const _ = Locales.createLocalizer(Translations);
    let hotkeys = {};
    function renderList(win, scheme) {
        win._find('HotkeysList').clear().add(Object.keys(hotkeys).map(function (name) {
            return {
                value: {
                    name: name,
                    value: hotkeys[name]
                },
                columns: [
                    { label: name },
                    { label: hotkeys[name] }
                ]
            };
        }));
    }
    function editList(win, scheme, key) {
        win._toggleDisabled(true);
        Dialog.create('Input', {
            message: _('Enter shortcut for:') + ' ' + key.name,
            value: key.value
        }, function (ev, button, value) {
            win._toggleDisabled(false);
            value = value || '';
            if (value.indexOf('+') !== -1) {
                hotkeys[key.name] = value;
            }
            renderList(win, scheme);
        });
    }
    return {
        group: 'system',
        name: 'Input',
        label: 'LBL_INPUT',
        icon: 'apps/preferences-desktop-keyboard-shortcuts.png',
        init: function () {
        },
        update: function (win, scheme, settings, wm) {
            win._find('EnableHotkeys').set('value', settings.enableHotkeys);
            hotkeys = Utils.cloneObject(settings.hotkeys);
            renderList(win, scheme);
        },
        render: function (win, scheme, root, settings, wm) {
            win._find('HotkeysEdit').on('click', function () {
                const selected = win._find('HotkeysList').get('selected');
                if (selected && selected[0]) {
                    editList(win, scheme, selected[0].data);
                }
            });
        },
        save: function (win, scheme, settings, wm) {
            settings.enableHotkeys = win._find('EnableHotkeys').get('value');
            if (hotkeys && Object.keys(hotkeys).length) {
                settings.hotkeys = hotkeys;
            }
        }
    };
});