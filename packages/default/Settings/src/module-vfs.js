define(function () {
    'use strict';
    const SettingsManager = OSjs.require('core/settings-manager');
    const MountManager = OSjs.require('core/mount-manager');
    const Authenticator = OSjs.require('core/authenticator');
    const Window = OSjs.require('core/window');
    const Utils = OSjs.require('utils/misc');
    const TEMPLATES = {
        WebDAV: {
            MountName: 'owncloud',
            MountDescription: 'OwnCloud',
            MountHost: 'http://localhost/remote.php/webdav/',
            MountNamespace: 'DAV:',
            MountUsername: function () {
                return Authenticator.instance.getUser().username;
            }
        }
    };
    let removeMounts = [];
    let addMounts = [];
    function createMountWindow(win, scheme, selected, ondone) {
        const nwin = new Window('SettingsMountWindow', {
            icon: win._app.__metadata.icon,
            title: win._app.__metadata.name,
            width: 400,
            height: 440
        }, win._app);
        nwin._on('destroy', function (root) {
            win._toggleDisabled(false);
        });
        nwin._on('inited', function (root) {
            win._toggleDisabled(true);
        });
        nwin._on('init', function (root) {
            function setTemplate(name) {
                const tpl = TEMPLATES[name];
                if (tpl) {
                    Object.keys(tpl).forEach(function (k) {
                        let val = tpl[k];
                        if (typeof val === 'function') {
                            val = val();
                        }
                        nwin._find(k).set('value', val);
                    });
                }
            }
            function done() {
                ondone({
                    transport: nwin._find('MountType').get('value'),
                    name: nwin._find('MountName').get('value'),
                    description: nwin._find('MountDescription').get('value'),
                    options: {
                        host: nwin._find('MountHost').get('value'),
                        ns: nwin._find('MountNamespace').get('value'),
                        username: nwin._find('MountUsername').get('value'),
                        password: nwin._find('MountPassword').get('value'),
                        cors: nwin._find('MountCORS').get('value')
                    }
                }, selected);
                nwin._close();
            }
            scheme.render(nwin, nwin._name);
            if (selected) {
                nwin._find('MountType').set('value', selected.transport);
                nwin._find('MountName').set('value', selected.name);
                nwin._find('MountDescription').set('value', selected.description);
                if (selected.options) {
                    nwin._find('MountHost').set('value', selected.options.host);
                    nwin._find('MountNamespace').set('value', selected.options.ns);
                    nwin._find('MountUsername').set('value', selected.options.username);
                    nwin._find('MountPassword').set('value', selected.options.password);
                    nwin._find('MountCORS').set('value', selected.options.cors);
                }
            } else {
                setTemplate(nwin._find('MountType').get('value'));
                nwin._find('MountType').on('change', function (ev) {
                    setTemplate(ev.detail);
                });
            }
            nwin._find('ButtonClose').on('click', function () {
                nwin._close();
            });
            nwin._find('ButtonOK').on('click', function () {
                done();
            });
        });
        return win._addChild(nwin, true, true);
    }
    function renderMounts(win, scheme) {
        const sf = SettingsManager.instance('VFS');
        const entries = sf.get('mounts', []).map(function (i, idx) {
            return {
                value: idx,
                columns: [
                    { label: i.name },
                    { label: i.description }
                ]
            };
        });
        win._find('MountList').clear().add(entries);
    }
    return {
        group: 'system',
        name: 'VFS',
        label: 'VFS',
        icon: 'devices/drive-harddisk.png',
        watch: ['VFS'],
        init: function (app) {
        },
        update: function (win, scheme, settings, wm) {
            const vfsOptions = Utils.cloneObject(SettingsManager.get('VFS') || {});
            const scandirOptions = vfsOptions.scandir || {};
            win._find('ShowFileExtensions').set('value', scandirOptions.showFileExtensions === true);
            win._find('ShowHiddenFiles').set('value', scandirOptions.showHiddenFiles === true);
            renderMounts(win, scheme);
        },
        render: function (win, scheme, root, settings, wm) {
            function ondone(connection, replace) {
                if (connection) {
                    if (replace) {
                        removeMounts.push(replace);
                    }
                    addMounts.push(connection);
                }
                win.onButtonOK();
                win.onModuleSelect(module.name);
            }
            win._find('MountList').set('columns', [
                { label: 'Name' },
                { label: 'Description' }
            ]);
            win._find('MountRemove').on('click', function () {
                const sel = win._find('MountList').get('selected');
                if (sel instanceof Array) {
                    sel.forEach(function (item) {
                        const mounts = SettingsManager.instance('VFS').get('mounts', []);
                        const idx = item.data;
                        if (mounts[idx]) {
                            removeMounts.push(mounts[idx]);
                            win.onButtonOK();
                            win.onModuleSelect(module.name);
                        }
                    });
                }
            });
            win._find('MountAdd').on('click', function () {
                createMountWindow(win, scheme, null, ondone);
            });
            win._find('MountEdit').on('click', function () {
                const sel = win._find('MountList').get('selected');
                const mounts = SettingsManager.instance('VFS').get('mounts', []);
                if (sel && sel.length) {
                    const mount = mounts[sel[0].data];
                    if (mount) {
                        createMountWindow(win, scheme, mount, ondone);
                    }
                }
            });
        },
        save: function (win, scheme, settings, wm) {
            const si = SettingsManager.instance('VFS');
            const mounts = si.get('mounts', []).filter(function (iter) {
                for (let i = 0; i < removeMounts.length; i++) {
                    const name = removeMounts[i].name;
                    if (name === iter.name) {
                        MountManager.remove(name);
                        removeMounts.splice(i, 1);
                        return false;
                    }
                }
                return true;
            });
            addMounts.forEach(function (iter) {
                try {
                    MountManager.add(Object.assign({}, iter));
                    mounts.push(iter);
                } catch (e) {
                    OSjs.error('Settings', 'An error occured while trying to mount', e);
                    console.warn(e.stack, e);
                }
            });
            const vfsSettings = {
                mounts: mounts,
                scandir: {
                    showHiddenFiles: win._find('ShowHiddenFiles').get('value'),
                    showFileExtensions: win._find('ShowFileExtensions').get('value')
                }
            };
            si.set(null, vfsSettings, false, false);
            addMounts = [];
            removeMounts = [];
        }
    };
});