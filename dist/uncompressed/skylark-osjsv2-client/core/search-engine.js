define([
    './package-manager',
    './settings-manager',
    '../vfs/file',
    './theme',
    '../vfs/fs'
], function (PackageManager, SettingsManager, FileMetadata, Theme, VFS) {
    'use strict';
    function search(list, query) {
        const result = [];
        list.forEach(obj => {
            let found = false;
            obj.fields.forEach(s => {
                if (found) {
                    return;
                }
                const qry = String(query).toLowerCase();
                const str = String(s).toLowerCase();
                if (str.indexOf(qry) !== -1) {
                    result.push(obj.value);
                    found = true;
                }
            });
        });
        return result;
    }
    function SearchObject(obj) {
        Object.keys(obj).forEach(k => {
            this[k] = obj[k];
        });
    }
    const ApplicationModule = function () {
        function query() {
            const packages = PackageManager.getPackages(); 
            return Object.keys(packages).map(pn => {
                const p = packages[pn];
                return new SearchObject({
                    value: {
                        title: p.name,
                        description: p.description,
                        icon: Theme.getFileIcon(new FileMetadata('applications:///' + p.className, 'application'), '16x16'),
                        launch: {
                            application: pn,
                            args: {}
                        }
                    },
                    fields: [
                        p.className,
                        p.name,
                        p.description
                    ]
                });
            });
        }
        return {
            search: function (q, args, settings) {
                if (settings.applications) {
                    let results = search(query(), q);
                    if (args.limit && results.length > args.dlimit) {
                        results = results.splice(0, args.dlimit);
                    }
                    return Promise.resolve(results);
                }
                return Promise.resolve([]);
            },
            reindex: function (args) {
                return Promise.resolve(true);
            },
            destroy: function () {
            }
        };
    }();
    const FilesystemModule = {
        search: function (q, args, settings, cb) {
            if (!settings.files || !settings.paths) {
                return Promise.resolve([]);
            }
            let found = [];
            const append = result => {
                if (result) {
                    found = found.concat(result.map(iter => {
                        return {
                            title: iter.filename,
                            description: iter.path,
                            icon: Theme.getFileIcon(new FileMetadata(iter)),
                            launch: {
                                application: '',
                                args: '',
                                file: iter
                            }
                        };
                    }));
                }
            };
            return new Promise((resolve, reject) => {
                Promise.each(settings.paths, e => {
                    return new Promise(n => {
                        VFS.find(e, {
                            query: q,
                            limit: args.limit ? args.dlimit : 0,
                            recursive: args.recursive
                        }).then(result => {
                            return n(append(result));
                        }).catch(error => {
                            console.warn(error);
                            n();
                        });
                    });
                }).then(() => {
                    return resolve(found);
                }).catch(reject);
            });
        },
        reindex: function (args) {
            return Promise.resolve();
        },
        destroy: function () {
        }
    };
    class SearchEngine {
        constructor() {
            this.settings = {};
            this.inited = false;
            this.modules = [
                ApplicationModule,
                FilesystemModule
            ];
        }
        init() {
            console.debug('SearchEngine::init()');
            if (!this.inited) {
                this.settings = SettingsManager.get('SearchEngine') || {};
                this.inited = true;
            }
            return Promise.resolve();
        }
        destroy() {
            console.debug('SearchEngine::destroy()');
            this.modules.forEach(m => {
                m.destroy();
            });
            this.modules = [];
            this.settings = {};
            this.inited = false;
        }
        search(q, args) {
            let result = [];
            let errors = [];
            args = Object.assign({}, {
                recursive: false,
                limit: 0,
                dlimit: 0
            }, args);
            if (args.limit) {
                args.dlimit = args.limit;
            }
            return new Promise((resolve, reject) => {
                Promise.each(this.modules, module => {
                    return new Promise((next, reject) => {
                        console.debug('SearchEngine::search()', '=>', module);
                        if (!args.limit || args.dlimit > 0) {
                            module.search(q, args, this.settings).then(res => {
                                args.dlimit -= res.length;
                                result = result.concat(res);
                                next();
                            }).catch(err => {
                                console.warn(err);
                                errors.push(err instanceof Error ? err.toString() : err);
                                next();
                            });
                        } else {
                            next();
                        }
                    });
                }).then(() => resolve(result)).catch(reject);
            });
        }
        reindex(args) {
            const errors = [];
            return Promise.each(this.modules, module => {
                return new Promise(next => {
                    console.debug('SearchEngine::reindex()', '=>', module);
                    module.reindex(args).then(next).catch(err => {
                        if (err) {
                            errors.push(err);
                        }
                        next();
                    });
                });
            });
        }
        configure(opts, save) {
        }
    }
    return new SearchEngine();
});