define(['../utils/misc'], function (a) {
    'use strict';
    return class SettingsFragment {
        constructor(obj, poolName, sm) {
            this._sm = sm;
            this._pool = poolName;
            if (obj.constructor !== {}.constructor) {
                if (!(obj instanceof Array)) {
                    throw new Error('SettingsFragment will not work unless you give it a object to manage.');
                }
            }
            this._settings = obj;
        }
        get(key, defaultValue) {
            const ret = key ? this._settings[key] : this._settings;
            return typeof ret === 'undefined' ? defaultValue : ret;
        }
        set(key, value, save, triggerWatch) {
            if (key === null) {
                a.mergeObject(this._settings, value);
            } else {
                if ([
                        'number',
                        'string'
                    ].indexOf(typeof key) >= 0) {
                    this._settings[key] = value;
                } else {
                    console.warn('SettingsFragment::set()', 'expects key to be a valid iter, not', key);
                }
            }
            if (save) {
                this._sm.save(this._pool, save);
            }
            if (typeof triggerWatch === 'undefined' || triggerWatch === true) {
                this._sm.changed(this._pool);
            }
            return this;
        }
        save(callback) {
            return this._sm.save(this._pool, callback);
        }
        getChained() {
            let nestedSetting = this._settings;
            arguments.every(function (key) {
                if (nestedSetting[key]) {
                    nestedSetting = nestedSetting[key];
                    return true;
                }
                return false;
            });
            return nestedSetting;
        }
        mergeDefaults(defaults) {
            a.mergeObject(this._settings, defaults, { overwrite: false });
            return this;
        }
        instance(key) {
            if (typeof this._settings[key] === 'undefined') {
                throw new Error("The object doesn't contain that key. SettingsFragment will not work.");
            }
            return new SettingsFragment(this._settings[key], this._pool, this._sm);
        }
    };
});