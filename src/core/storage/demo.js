define([
    '../config',
    '../storage'
], function (Config, Storage) {
    'use strict';
    return class DemoStorage extends Storage {
        init() {
            const curr = Config.getConfig('Version');
            const version = localStorage.getItem('__version__');
            if (curr !== version) {
                localStorage.clear();
            }
            localStorage.setItem('__version__', String(curr));
            return Promise.resolve();
        }
        saveSettings(pool, storage) {
            Object.keys(storage).forEach(key => {
                if (pool && key !== pool) {
                    return;
                }
                try {
                    localStorage.setItem('OSjs/' + key, JSON.stringify(storage[key]));
                } catch (e) {
                    console.warn('DemoStorage::settings()', e, e.stack);
                }
            });
            return Promise.resolve();
        }
    };
});