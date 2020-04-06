define(['./locales'], function (Translations) {
    'use strict';
    const Locales = OSjs.require('core/locales');
    const Theme = OSjs.require('core/theme');
    const Utils = OSjs.require('utils/misc');
    const PackageManager = OSjs.require('core/package-manager');
    const _ = Locales.createLocalizer(Translations);
    let widgets = [];
    let items = [];
    function renderItems(win, setSelected) {
        const list = [];
        widgets.forEach(function (i, idx) {
            const name = i.name;
            if (items[name]) {
                list.push({
                    value: idx,
                    columns: [{
                            icon: Theme.getIcon(items[name].Icon),
                            label: Utils.format('{0} ({1})', items[name].Name, items[name].Description)
                        }]
                });
            }
        });
        const view = win._find('WidgetItems');
        view.clear();
        view.add(list);
    }
    function createDialog(win, scheme, cb) {
        if (scheme) {
            const app = win._app;
            const nwin = new OSjs.Applications.ApplicationSettings.SettingsItemDialog(app, app.__metadata, scheme, cb);
            nwin._on('inited', function (scheme) {
                nwin._find('List').clear().add(Object.keys(items).map(function (i, idx) {
                    return {
                        value: i,
                        columns: [{
                                icon: Theme.getIcon(items[i].Icon),
                                label: Utils.format('{0} ({1})', items[i].Name, items[i].Description)
                            }]
                    };
                }));
                nwin._setTitle('Widgets', true);
            });
            win._addChild(nwin, true, true);
        }
    }
    function updateLabel(win, lbl, value) {
        const map = {
            DesktopMargin: 'Desktop Margin ({0}px)',
            CornerSnapping: 'Desktop Corner Snapping ({0}px)',
            WindowSnapping: 'Window Snapping ({0}px)'
        };
        const label = Utils.format(_(map[lbl]), value);
        win._find(lbl + 'Label').set('value', label);
    }
    return {
        group: 'personal',
        name: 'Desktop',
        label: 'LBL_DESKTOP',
        icon: 'devices/video-display.png',
        watch: ['CoreWM'],
        init: function (app) {
        },
        update: function (win, scheme, settings, wm) {
            win._find('EnableAnimations').set('value', settings.animations);
            win._find('EnableTouchMenu').set('value', settings.useTouchMenu);
            win._find('EnableWindowSwitcher').set('value', settings.enableSwitcher);
            win._find('DesktopMargin').set('value', settings.desktopMargin);
            win._find('CornerSnapping').set('value', settings.windowCornerSnap);
            win._find('WindowSnapping').set('value', settings.windowSnap);
            updateLabel(win, 'DesktopMargin', settings.desktopMargin);
            updateLabel(win, 'CornerSnapping', settings.windowCornerSnap);
            updateLabel(win, 'WindowSnapping', settings.windowSnap);
            items = PackageManager.getPackage('CoreWM').widgets;
            widgets = settings.widgets || [];
            renderItems(win);
        },
        render: function (win, scheme, root, settings, wm) {
            win._find('DesktopMargin').on('change', function (ev) {
                updateLabel(win, 'DesktopMargin', ev.detail);
            });
            win._find('CornerSnapping').on('change', function (ev) {
                updateLabel(win, 'CornerSnapping', ev.detail);
            });
            win._find('WindowSnapping').on('change', function (ev) {
                updateLabel(win, 'WindowSnapping', ev.detail);
            });
            win._find('EnableIconView').set('value', settings.enableIconView);
            win._find('EnableIconViewInvert').set('value', settings.invertIconViewColor);
            win._find('WidgetButtonAdd').on('click', function () {
                win._toggleDisabled(true);
                createDialog(win, scheme, function (ev, result) {
                    win._toggleDisabled(false);
                    if (result) {
                        widgets.push({ name: result.data });
                        renderItems(win);
                    }
                });
            });
            win._find('WidgetButtonRemove').on('click', function () {
                const selected = win._find('WidgetItems').get('selected');
                if (selected.length) {
                    widgets.splice(selected[0].index, 1);
                    renderItems(win);
                }
            });
            win._find('WidgetButtonOptions').on('click', function () {
            });
        },
        save: function (win, scheme, settings, wm) {
            settings.animations = win._find('EnableAnimations').get('value');
            settings.useTouchMenu = win._find('EnableTouchMenu').get('value');
            settings.enableSwitcher = win._find('EnableWindowSwitcher').get('value');
            settings.desktopMargin = win._find('DesktopMargin').get('value');
            settings.windowCornerSnap = win._find('CornerSnapping').get('value');
            settings.windowSnap = win._find('WindowSnapping').get('value');
            settings.enableIconView = win._find('EnableIconView').get('value');
            settings.invertIconViewColor = win._find('EnableIconViewInvert').get('value');
            settings.widgets = widgets;
        }
    };
});