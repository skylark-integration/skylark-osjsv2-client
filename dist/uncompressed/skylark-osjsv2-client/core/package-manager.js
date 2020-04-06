define([
    './settings-manager',
    '../utils/misc',
    './locales',
    './config',
    '../utils/fs',
    './connection'
], function ( SettingsManager, misc, locales, config, FS, Connection) {
    'use strict';
    const resolvePreloads = (metadata, pm) => {
        const packageURI = config.getConfig('Connection.PackageURI');
        const mapIter = s => typeof s === 'string' ? { src: s } : s;
        let additions = [];
        let list = (metadata.preload || []).slice(0).map(mapIter);
        if (metadata.depends instanceof Array) {
            metadata.depends.forEach(k => {
                if (!OSjs.Applications[k]) {
                    const pkg = pm.getPackage(k);
                    if (pkg) {
                        console.info('Using dependency', k);
                        additions = additions.concat(pkg.preload.map(mapIter));
                    }
                }
            });
        }
        const pkgs = pm.getPackages(false); 
        Object.keys(pkgs).forEach(pn => {
            const p = pkgs[pn];
            if (p.type === 'extension' && p.uses === name) {
                if (p) {
                    console.info('Using extension', pn);
                    additions = additions.concat(p.preload.map(mapIter));
                }
            }
        });
        return additions.concat(list).map(p => {
            if (!p.src.match(/^(\/|https?|ftp)/)) {
                if (metadata.scope === 'user') {
                    pm.VFS.url(FS.pathJoin(metadata.path, p.src)).then(url => {
                        p.src = url;
                        return true;
                    });
                } else {
                    p.src = FS.pathJoin(packageURI, metadata.path, p.src);
                }
            }
            return p;
        });
    };
    class PackageManager {
        constructor() { 
            this.packages = {};
            this.blacklist = [];
        }
        destroy() {
            this.packages = {};
            this.blacklist = [];
        }
        init(Authenticator,VFS, metadata, isStandalone) { // modified by lwf
            this.Authenticator = Authenticator;
            this.VFS = VFS;
            console.debug('PackageManager::load()', metadata);
            return new Promise((resolve, reject) => {
                const setPackages = metadata ? this.setPackages(metadata) : Promise.resolve();
                setPackages.then(() => {
                    if (isStandalone) {
                        return resolve(true);
                    }
                    return this._loadMetadata().then(() => {
                        const len = Object.keys(this.packages).length;
                        if (len) {
                            return resolve(true);
                        }
                        return reject(new Error(locales._('ERR_PACKAGE_ENUM_FAILED')));
                    }).catch(reject);
                }).catch(reject);
            });
        }
        _loadMetadata() {
            const paths = SettingsManager.instance('PackageManager').get('PackagePaths', []);
            return new Promise((resolve, reject) => {
                Connection.request('packages', {
                    command: 'list',
                    args: { paths: paths }
                }).then(res => {
                    return this.setPackages(res).then(resolve).catch(reject);
                }).catch(reject);
            });
        }
        generateUserMetadata() {
            const paths = SettingsManager.instance('PackageManager').get('PackagePaths', []);
            return new Promise((resolve, reject) => {
                const cb = () => this._loadMetadata().then(resolve).catch(reject);
                Connection.request('packages', {
                    command: 'cache',
                    args: {
                        action: 'generate',
                        scope: 'user',
                        paths: paths
                    }
                }).then(cb).catch(cb);
            });
        }
        _addPackages(result, scope) {
            console.debug('PackageManager::_addPackages()', result);
            const keys = Object.keys(result);
            if (!keys.length) {
                return;
            }
            const currLocale = locales.getLocale();
            keys.forEach(i => {
                const newIter = misc.cloneObject(result[i]);
                if (typeof newIter !== 'object') {
                    return;
                }
                if (typeof newIter.names !== 'undefined' && newIter.names[currLocale]) {
                    newIter.name = newIter.names[currLocale];
                }
                if (typeof newIter.descriptions !== 'undefined' && newIter.descriptions[currLocale]) {
                    newIter.description = newIter.descriptions[currLocale];
                }
                if (!newIter.description) {
                    newIter.description = newIter.name;
                }
                newIter.scope = scope || 'system';
                newIter.type = newIter.type || 'application';
                this.packages[i] = newIter;
            });
        }
        install(file, root) {
            const paths = SettingsManager.instance('PackageManager').get('PackagePaths', []);
            if (typeof root !== 'string') {
                root = paths[0];
            }
            const dest = FS.pathJoin(root, file.filename.replace(/\.zip$/i, ''));
            return new Promise((resolve, reject) => {
                Connection.request('packages', {
                    command: 'install',
                    args: {
                        zip: file.path,
                        dest: dest,
                        paths: paths
                    }
                }).then(() => {
                    return this.generateUserMetadata().then(resolve).catch(reject);
                }).catch(reject);
            });
        }
        uninstall(file) {
            return new Promise((resolve, reject) => {
                Connection.request('packages', {
                    command: 'uninstall',
                    args: { path: file.path }
                }).then(() => {
                    return this.generateUserMetadata().then(resolve).catch(reject);
                }).catch(reject);
            });
        }
        setBlacklist(list) {
            this.blacklist = list || [];
        }
        getStorePackages(opts) {
            const repos = SettingsManager.instance('PackageManager').get('Repositories', []);
            let entries = [];
            return new Promise((resolve, reject) => {
                Promise.all(repos.map(url => {
                    return new Promise((yes, no) => {
                        Connection.request('curl', {
                            url: url,
                            method: 'GET'
                        }).then(result => {
                            let list = [];
                            if (typeof result.body === 'string') {
                                try {
                                    list = JSON.parse(result.body);
                                } catch (e) {
                                }
                            }
                            entries = entries.concat(list.map(iter => {
                                iter._repository = url;
                                return iter;
                            }));
                            return yes();
                        }).catch(no);
                    });
                })).then(() => resolve(entries)).catch(reject);
            });
        }
        getPackage(name) {
            if (typeof this.packages[name] !== 'undefined') {
                return Object.freeze(misc.cloneObject(this.packages)[name]);
            }
            return false;
        }
        getPackages(filtered) {
            const Authenticator = this.Authenticator;

            const hidden = SettingsManager.instance('PackageManager').get('Hidden', []);
            const p = misc.cloneObject(this.packages);
            const allowed = iter => {
                if (this.blacklist.indexOf(iter.path) >= 0) {
                    return false;
                }
                if (iter && iter.groups instanceof Array) {
                    if (!Authenticator.instance().checkPermission(iter.groups)) { // modified by lwf
                        return false;
                    }
                }
                return true;
            };
            if (typeof filtered === 'undefined' || filtered === true) {
                const result = {};
                Object.keys(p).forEach(name => {
                    const iter = p[name];
                    if (!allowed(iter)) {
                        return;
                    }
                    if (iter && hidden.indexOf(name) < 0) {
                        result[name] = iter;
                    }
                });
                return Object.freeze(result);
            }
            return Object.freeze(p);
        }
        getPackagesByMime(mime) {
            const list = [];
            const p = misc.cloneObject(this.packages);
            Object.keys(p).forEach(i => {
                if (this.blacklist.indexOf(i) < 0) {
                    const a = p[i];
                    if (a && a.mime) {
                        if (FS.checkAcceptMime(mime, a.mime)) {
                            list.push(i);
                        }
                    }
                }
            });
            return list;
        }
        getPackageResource(app, name, vfspath) {
            if (name.match(/^((https?:)|\.)?\//)) {
                return name;
            }
            name = name.replace(/^\.\//, '');
            const appname = typeof app === 'string' ? app : app.__pname;
            const fsuri = config.getConfig('Connection.FSURI');
            const pkg = this.getPackage(appname);
            let path = name;
            if (pkg) {
                path = pkg.scope === 'user' ? '/user-package/' + FS.filename(pkg.path) + '/' + name.replace(/^\//, '') : 'packages/' + pkg.path + '/' + name;
                if (vfspath) {
                    return pkg.scope === 'user' ? path.substr(fsuri.length) : config.getConfig('VFS.Dist') + path;
                }
            }
            return path;
        }
        setPackages(res) { 
            const packages = {};
            const locale = locales.getLocale();
            const checkEntry = (key, iter, scope) => {
                iter = Object.assign({}, iter);
                iter.type = iter.type || 'application';
                if (scope) {
                    iter.scope = scope;
                }
                if (iter.names && iter.names[locale]) {
                    iter.name = iter.names[locale];
                }
                if (iter.descriptions && iter.descriptions[locale]) {
                    iter.description = iter.descriptions[locale];
                }
                let resolveIcon = () => {
                    if (iter.icon && iter.path) {
                        let packagePath = iter.path.replace(/^\//, '');
                        if (iter.scope === 'user') {
                            return this.VFS.url(FS.pathJoin(packagePath, iter.icon));
                        } else {
                            if (iter.icon.match(/^\.\//)) {
                                const packageURI = config.getConfig('Connection.PackageURI').replace(/\/?$/, '/');
                                return Promise.resolve(packageURI + packagePath + iter.icon.replace(/^\./, ''));
                            }
                        }
                    }
                    return Promise.resolve(iter.icon);
                };
                iter.preload = resolvePreloads(iter, this); 
                return new Promise((resolve, reject) => {
                    resolveIcon().then(icon => {
                        if (icon) {
                            iter.icon = icon;
                        }
                        return resolve(iter);
                    }).catch(reject);
                });
            };
            return new Promise((resolve, reject) => {
                const entries = Object.keys(res || {});
                Promise.each(entries, key => {
                    return new Promise((yes, no) => {
                        const iter = res[key];
                        if (iter && !packages[iter.className]) {
                            checkEntry(key, iter).then(pkg => {
                                packages[iter.className] = pkg;
                                return yes();
                            }).catch(no);
                        } else {
                            console.warn('No such package', key);
                            yes();
                        }
                    });
                }).catch(reject).then(() => {
                    this.packages = packages;
                    return resolve();
                });
            });
        }
    }
    return new PackageManager();
});