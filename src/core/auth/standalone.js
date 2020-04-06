define([
    './demo'
], function (DemoAuthenticator) {
    'use strict';
    return class StandaloneAuthenticator extends DemoAuthenticator {
        constructor() {
            super();
            this.isStandalone = true;
        }
        login(login) {
            return Promise.resolve({
                userData: {
                    id: 1,
                    username: 'root',
                    name: 'Administrator User',
                    groups: ['admin']
                },
                userSettings: this._getSettings(),
                blacklistedPackages: []
            });
        }
    };
});