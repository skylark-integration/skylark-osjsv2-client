define([
    './storage',
    '../helpers/settings-fragment'
], function (Storage, SettingsFragment) {
    'use strict';
    class SettingsManager {
        constructor() {
            this.storage = {};
            this.defaultSettings = {};
            this.watches = [];
        }
        init(settings) {
            this.storage = settings || {};
            return Promise.resolve();
        }
        get(pool, key) {
            try {
                if (this.storage[pool] && Object.keys(this.storage[pool]).length) {
                    return key ? this.storage[pool][key] : this.storage[pool];
                }
                return key ? this.defaultSettings[pool][key] : this.defaultSettings[pool];
            } catch (e) {
                console.warn('SettingsManager::get()', 'exception', e, e.stack);
            }
            return false;
        }
        set(pool, key, value, save, triggerWatch) {
            let promise = Promise.resolve(true);
            try {
                if (key) {
                    if (typeof this.storage[pool] === 'undefined') {
                        this.storage[pool] = {};
                    }
                    if ([
                            'number',
                            'string'
                        ].indexOf(typeof key) >= 0) {
                        this.storage[pool][key] = value;
                    } else {
                        console.warn('SettingsManager::set()', 'expects key to be a valid iter, not', key);
                    }
                } else {
                    this.storage[pool] = value;
                }
            } catch (e) {
                console.warn('SettingsManager::set()', 'exception', e, e.stack);
            }
            if (save) {
                promise = this.save(pool);
                if (typeof save === 'function') {
                    console.warn('Using a callback is deprecated, you should use the returned promise');
                    promise.then(res => save(false, res)).catch(err => save(err, false));
                }
            }
            if (typeof triggerWatch === 'undefined' || triggerWatch === true) {
                this.changed(pool);
            }
            return promise;
        }
        save(pool) {
            console.debug('SettingsManager::save()', pool, this.storage);
            const saveableStorage = {};
            Object.keys(this.storage).filter(n => {
                return !n.match(/^__/);
            }).forEach(n => {
                saveableStorage[n] = this.storage[n];
            });
            return Storage.instance.saveSettings(pool, saveableStorage);
        }
        defaults(pool, defaults) {
            this.defaultSettings[pool] = defaults;
        }
        instance(pool, defaults) {
            if (!this.storage[pool] || this.storage[pool] instanceof Array) {
                this.storage[pool] = {};
            }
            const instance = new SettingsFragment(this.storage[pool], pool, this);
            if (arguments.length > 1) {
                this.defaults(pool, defaults);
                instance.mergeDefaults(defaults);
            }
            return instance;
        }
        unwatch(index) {
            if (typeof this.watches[index] !== 'undefined') {
                delete this.watches[index];
            }
        }
        watch(pool, callback) {
            if (!this.storage[pool]) {
                return false;
            }
            const index = this.watches.push({
                pool: pool,
                callback: callback
            });
            return index - 1;
        }
        changed(pool) {
            this.watches.forEach(watch => {
                if (watch && watch.pool === pool) {
                    watch.callback(this.storage[pool]);
                }
            });
            return this;
        }
        clear(pool, save) {
            save = typeof save === 'undefined' || save === true;
            this.set(pool, null, {}, save);
            return this;
        }
    }
    return new SettingsManager();
});