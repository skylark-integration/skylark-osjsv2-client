define(['./locales'], function (Translations) {
    'use strict';
    const Locales = OSjs.require('core/locales');
    const Dialog = OSjs.require('core/dialog');
    const Config = OSjs.require('core/config');
    const Connection = OSjs.require('core/connection');
    const Window = OSjs.require('core/window');
    const _ = Locales.createLocalizer(Translations);
    function renderUsers(win, scheme) {
        Connection.request('users', { command: 'list' }).then(users => {
            if (users instanceof Array) {
                win._find('UsersList').clear().add(users.map(function (iter, idx) {
                    return {
                        value: iter,
                        columns: [
                            { label: iter.id },
                            { label: iter.username },
                            { label: iter.name }
                        ]
                    };
                }));
            }
        });
    }
    function showDialog(win, scheme, data, id) {
        win._toggleDisabled(true);
        if (id) {
            Dialog.create('Input', {
                message: _('Set user password'),
                type: 'password'
            }, function (ev, button, value) {
                if (!value) {
                    win._toggleDisabled(false);
                    return;
                }
                Connection.request('users', {
                    command: 'passwd',
                    user: {
                        password: value,
                        id: id
                    }
                }).then(() => {
                    win._toggleDisabled(false);
                    renderUsers(win, scheme);
                }).catch(err => {
                    win._toggleDisabled(false);
                    OSjs.error('Settings', _('Error while managing users'), err);
                });
            });
            return;
        }
        const action = data === null ? 'add' : 'edit';
        data = data || {};
        const nwin = new Window('SettingsUserWindow', {
            icon: win._app.__metadata.icon,
            title: win._app.__metadata.name,
            width: 400,
            height: 250
        }, win._app);
        nwin._on('destroy', function (root) {
            win._toggleDisabled(false);
        });
        nwin._on('init', function (root) {
            scheme.render(nwin, nwin._name);
            if (Object.keys(data).length) {
                nwin._find('UserUsername').set('value', data.username);
                nwin._find('UserName').set('value', data.name);
                nwin._find('UserGroups').set('value', (data.groups || []).join(','));
            }
            nwin._find('ButtonClose').on('click', function () {
                nwin._close();
            });
            nwin._find('ButtonOK').on('click', function () {
                data.username = nwin._find('UserUsername').get('value');
                data.name = nwin._find('UserName').get('value') || data.username;
                data.groups = nwin._find('UserGroups').get('value').replace(/\s/g, '').split(',');
                if (!data.username || !data.groups) {
                    nwin._close();
                    return;
                }
                Connection.request('users', {
                    command: action,
                    user: data
                }).then(() => {
                    renderUsers(win, scheme);
                    nwin._close();
                }).catch(err => {
                    OSjs.error('Settings', _('Error while managing users'), err);
                });
            });
        });
        win._addChild(nwin, true, true);
    }
    function removeUser(win, scheme, data) {
        Connection.request('users', {
            command: 'remove',
            user: data
        }).then(users => {
            renderUsers(win, scheme);
        }).catch(err => {
            OSjs.error('Settings', _('Error while managing users'), err);
        });
    }
    return {
        group: 'system',
        name: 'Users',
        label: 'LBL_USERS',
        icon: 'apps/system-users.png',
        button: false,
        compatible: function () {
            const cfg = Config.getConfig('Connection.Authenticator');
            return [
                'demo',
                'pam',
                'shadow'
            ].indexOf(cfg) === -1;
        },
        init: function () {
        },
        update: function (win, scheme, settings, wm) {
            renderUsers(win, scheme);
        },
        render: function (win, scheme, root, settings, wm) {
            function _action(cb, te) {
                const sel = win._find('UsersList').get('selected');
                if (sel && sel.length) {
                    const data = sel[0].data;
                    data._username = data.username;
                    cb(data);
                } else {
                    if (te) {
                        cb(null);
                    }
                }
            }
            win._find('UsersAdd').on('click', function () {
                showDialog(win, scheme, null);
            });
            win._find('UsersRemove').on('click', function () {
                _action(function (data) {
                    removeUser(win, scheme, data);
                });
            });
            win._find('UsersEdit').on('click', function () {
                _action(function (data) {
                    showDialog(win, scheme, data);
                });
            });
            win._find('UsersPasswd').on('click', function () {
                _action(function (data) {
                    showDialog(win, scheme, null, data.id);
                });
            });
        },
        save: function (win, scheme, settings, wm) {
        }
    };
});