define([
    '../core/process',
    '../core/locales'
], function ( Process, Locales) {
    'use strict';
    function createMatch(m, sname) {
        if (typeof m === 'string') {
            return new RegExp(m);
        } else if (!m) {
            return new RegExp('^' + (sname + '://').replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'));
        }
        return m;
    }
    return class Mountpoint {
        constructor(options) {
            this.options = Object.assign({
                name: null,
                root: null,
                match: null,
                enabled: true,
                readOnly: false,
                transport: null,
                visible: true,
                searchable: false,
                dynamic: true,
                internal: false,
                special: false,
                options: {}
            }, options);
            if (!this.options.transport) {
                throw new Error('No transport was defined for mountpoint ' + this.options.name);
            }
            if (!this.options.name) {
                throw new Error(Locales._('ERR_VFSMODULE_INVALID_CONFIG_FMT'));
            }
            const sname = this.options.name.replace(/\s/g, '-').toLowerCase();
            const defaults = {
                icon: 'devices/drive-harddisk.png',
                name: sname,
                title: this.options.name,
                description: this.options.description || this.options.name,
                root: sname + ':///',
                match: createMatch(this.options.match, sname)
            };
            Object.keys(defaults).forEach(k => {
                if (!this.options[k]) {
                    this.options[k] = defaults[k];
                }
            });
            this.name = sname;
            this.isMounted = false;
        }
        mount(options) {
            options = Object.assign({ notify: true }, options || {});
            if (!this.isMounted && !this.option('special')) {
                if (options.notify) {
                    Process.message('vfs:mount', this.option('name'), { source: null });
                }
                this.isMounted = true;
            }
            return Promise.resolve();
        }
        unmount(options) {
            options = Object.assign({ notify: true }, options || {});
            if (this.isMounted && !this.option('special')) {
                if (options.notify) {
                    Process.message('vfs:unmount', this.option('name'), { source: null });
                }
                this.isMounted = false;
            }
            return Promise.resolve();
        }
        mounted() {
            return this.isMounted;
        }
        enabled() {
            return this.option('enabled');
        }
        option(name) {
            return this.options[name];
        }
        isReadOnly() {
            return this.option('readOnly');
        }
        setMounted(mounted) {
            this.isMounted = mounted === true;
        }
        request(method, args, options) {
            const transport = this.option('transport');
            if (transport) {
                return transport.request(method, args, options, this);
            }
            return Promise.reject(new Error(Locales._('ERR_VFSMODULE_NOT_FOUND_FMT', test)));
        }
    };
});