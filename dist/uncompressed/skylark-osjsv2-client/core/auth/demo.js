define([
    '../authenticator'
], function (Authenticator) {
    'use strict';
    return class DemoAuthenticator extends Authenticator {
        _getSettings() {
            let settings = {};
            let key;
            for (let i = 0; i < localStorage.length; i++) {
                key = localStorage.key(i);
                if (key.match(/^OSjs\//)) {
                    try {
                        settings[key.replace(/^OSjs\//, '')] = JSON.parse(localStorage.getItem(key));
                    } catch (e) {
                        console.warn('DemoAuthenticator::login()', e, e.stack);
                    }
                }
            }
            return settings;
        }
        login(login) {
            return new Promise((resolve, reject) => {
                super.login(login).then(result => {
                    result.userSettings = this._getSettings();
                    return resolve(result);
                }).catch(reject);
            });
        }
        createUI() {
            return this.requestLogin({
                username: 'demo',
                password: 'demo'
            });
        }
    };
});