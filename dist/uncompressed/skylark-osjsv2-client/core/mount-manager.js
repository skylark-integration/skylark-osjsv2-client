define([
    '../vfs/mountpoint',
    './locales',
    './config'
], function (Mountpoint, a, b) {
    'use strict';

    class MountManager {
        constructor() {
            this.inited = false;
            this.mountpoints = [];
//            this.transports = loadTransports();
        }
        init(loadTransports) { // modified by lwf
            if (this.inited) {
                return Promise.resolve();
            }
            this.transports = loadTransports();
            this.inited = true;
            const config = b.getConfig('VFS.Mountpoints', {});
            const enabled = Object.keys(config).filter(name => {
                return config[name].enabled !== false;
            });
            return Promise.each(enabled, name => {
                return new Promise(resolve => {
                    const iter = Object.assign({
                        name: name,
                        dynamic: false
                    }, config[name]);
                    this.add(iter, true, { notify: false }).then(resolve).catch(e => {
                        console.warn('Failed to init VFS Mountpoint', name, iter, String(e));
                        return resolve(false);
                    });
                });
            });
        }
        addList(mountPoints) {
            return Promise.each(mountPoints, iter => this.add(iter));
        }
        add(point, mount, options) {
            try {
                if (!(point instanceof Mountpoint)) {
                    if (typeof point.transport === 'string') {
                        const T = this.transports[point.transport];
                        if (!T) {
                            return Promise.reject(new Error('No such transport: ' + point.transport));
                        }
                        point.transport = new T();
                    }
                    point = new Mountpoint(point);
                }
                const found = this.mountpoints.filter(m => {
                    if (m.option('name') === point.option('name')) {
                        return true;
                    }
                    if (m.option('root') === point.option('root')) {
                        return true;
                    }
                    return false;
                });
                if (found.length) {
                    return Promise.reject(new Error(a._('ERR_VFSMODULE_ALREADY_MOUNTED_FMT', point.option('name'))));
                }
                this.mountpoints.push(point);
            } catch (e) {
                return Promise.reject(e);
            }
            console.info('Mounting', point);
            return new Promise((resolve, reject) => {
                if (mount) {
                    point.mount().then(() => {
                        return resolve(point);
                    }).catch(reject);
                } else {
                    resolve(point);
                }
            });
        }
        remove(moduleName, options) {
            const module = this.getModule(moduleName);
            const index = this.getModule(moduleName, true);
            if (module) {
                return new Promise((resolve, reject) => {
                    module.unmount(options).then(res => {
                        if (index !== -1) {
                            this.mountpoints.splice(index, 1);
                        }
                        return resolve(res);
                    }).catch(reject);
                });
            }
            return Promise.reject(new Error(a._('ERR_VFSMODULE_NOT_MOUNTED_FMT', moduleName)));
        }
        getModules(filter) {
            filter = Object.assign({}, {
                visible: true,
                special: false
            }, filter);
            return this.mountpoints.filter(mount => {
                if (mount.enabled() && mount.option('visible')) {
                    const hits = Object.keys(filter).filter(filterName => {
                        return mount.option(filterName) === filter[filterName];
                    });
                    return hits.length > 0;
                }
                return false;
            });
        }
        getModuleFromPath(test) {
            return this.mountpoints.find(mount => {
                if (typeof test === 'string' && mount.enabled()) {
                    if (mount.option('match') && test.match(mount.option('match'))) {
                        return true;
                    }
                }
                return false;
            });
        }
        getModule(name, idx) {
            const m = idx ? 'findIndex' : 'find';
            return this.mountpoints[m](i => i.option('name') === name);
        }
        getTransport(name) {
            return this.transports[name];
        }
    }
    return new MountManager();
});