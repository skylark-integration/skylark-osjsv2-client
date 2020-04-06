define([
    './connection',
], function (Connection) {
    'use strict';
    let _instance;
    return class Storage {
        static get instance() {
            return _instance;
        }
        constructor() {
            _instance = this;
            this.saveTimeout = null;
        }
        init() {
            return Promise.resolve();
        }
        destroy() {
            _instance = null;
        }
        saveSettings(pool, storage) {
            clearTimeout(this.saveTimeout);
            return new Promise((resolve, reject) => {
                this.saveTimeout = setTimeout(() => {
                    Connection.request('settings', {
                        pool: pool,
                        settings: Object.assign({}, storage)
                    }).then(resolve).catch(reject);
                    clearTimeout(this.saveTimeout);
                }, 250);
            });
        }
        saveSession(Process,SettingsManager) { // modified by lwf
            return new Promise((resolve, reject) => {
                const data = Process.getProcesses().filter(proc => typeof proc._getSessionData === 'function').map(proc => proc._getSessionData());
                SettingsManager.set('UserSession', null, data, (err, res) => {
                    return err ? reject(err) : resolve(res);
                });
            });
        }
        getLastSession(SettingsManager) { // modified by lwf
            const res = SettingsManager.get('UserSession');
            const list = (res || []).map(iter => {
                const args = iter.args;
                args.__resume__ = true;
                args.__windows__ = iter.windows || [];
                return {
                    name: iter.name,
                    args
                };
            });
            return Promise.resolve(list);
        }
    };
});