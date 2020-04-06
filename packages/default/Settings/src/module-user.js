define(function () {
    'use strict';
    const Authenticator = OSjs.require('core/authenticator');
    return {
        group: 'user',
        name: 'User',
        label: 'LBL_USER',
        icon: 'apps/user-info.png',
        button: false,
        init: function () {
        },
        update: function (win, scheme, settings, wm) {
            const user = Authenticator.instance.getUser();
            win._find('UserID').set('value', user.id);
            win._find('UserName').set('value', user.name);
            win._find('UserUsername').set('value', user.username);
            win._find('UserGroups').set('value', user.groups);
        },
        render: function (win, scheme, root, settings, wm) {
        },
        save: function (win, scheme, settings, wm) {
        }
    };
});