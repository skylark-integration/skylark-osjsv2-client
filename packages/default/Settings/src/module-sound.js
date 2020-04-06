define(['./locales'], function (Translations) {
    'use strict';
    const Theme = OSjs.require('core/theme');
    const Locales = OSjs.require('core/locales');
    const Dialog = OSjs.require('core/dialog');
    const Utils = OSjs.require('utils/misc');
    const _ = Locales.createLocalizer(Translations);
    let sounds = {};
    function renderList(win, scheme) {
        win._find('SoundsList').clear().add(Object.keys(sounds).map(function (name) {
            return {
                value: {
                    name: name,
                    value: sounds[name]
                },
                columns: [
                    { label: name },
                    { label: sounds[name] }
                ]
            };
        }));
    }
    function editList(win, scheme, key) {
        win._toggleDisabled(true);
        Dialog.create('Input', {
            message: _('Enter filename for:') + ' ' + key.name,
            value: key.value
        }, function (ev, button, value) {
            win._toggleDisabled(false);
            value = value || '';
            if (value.length) {
                sounds[key.name] = value;
            }
            renderList(win, scheme);
        });
    }
    return {
        group: 'personal',
        name: 'Sounds',
        label: 'LBL_SOUNDS',
        icon: 'status/audio-volume-high.png',
        init: function () {
        },
        update: function (win, scheme, settings, wm) {
            win._find('SoundThemeName').set('value', settings.soundTheme);
            win._find('EnableSounds').set('value', settings.enableSounds);
            sounds = Utils.cloneObject(settings.sounds);
            renderList(win, scheme);
        },
        render: function (win, scheme, root, settings, wm) {
            const soundThemes = function (tmp) {
                return Object.keys(tmp).map(function (t) {
                    return {
                        label: tmp[t],
                        value: t
                    };
                });
            }(Theme.getSoundThemes());
            win._find('SoundThemeName').add(soundThemes);
            win._find('SoundsEdit').on('click', function () {
                const selected = win._find('SoundsList').get('selected');
                if (selected && selected[0]) {
                    editList(win, scheme, selected[0].data);
                }
            });
        },
        save: function (win, scheme, settings, wm) {
            settings.soundTheme = win._find('SoundThemeName').get('value');
            settings.enableSounds = win._find('EnableSounds').get('value');
            if (sounds && Object.keys(sounds).length) {
                settings.sounds = sounds;
            }
        }
    };
});