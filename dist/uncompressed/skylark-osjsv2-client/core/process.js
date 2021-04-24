define([
    './connection',
    '../helpers/event-handler',
    './theme',
    '../utils/fs',
    './config',
    '../utils/compability',
    './locales',
    '../helpers/hooks',
    '../helpers/loader',
    '../vfs/file',
    '../utils/preloader',
    './settings-manager',
    './package-manager'
], function (
    Connection, 
    EventHandler, 
    Theme, 
    FS, 
    Config, 
    Compability, 
    locales, 
    hooks, 
    Loader, 
    FileMetadata, 
    Preloader, 
    SettingsManager, 
    PackageManager
) {
    'use strict';
    let alreadyLaunching = [];
    let runningProcesses = [];
    function _kill(pid, force) {
        if (pid >= 0 && runningProcesses[pid]) {
            try {
                const res = runningProcesses[pid].destroy(force);
                console.warn('Killing application', pid, res);
                if (res !== false) {
                    runningProcesses[pid] = null;
                    return true;
                }
            } catch (e) {
                console.warn(e);
            }
        }
        return false;
    }
    function getLaunchObject(s) {
        if (typeof s === 'string') {
            const spl = s.split('@');
            const name = spl[0];
            let args = {};
            if (typeof spl[1] !== 'undefined') {
                try {
                    args = JSON.parse(spl[1]);
                } catch (e) {
                }
            }
            s = {
                name: name,
                args: args
            };
        }
        return s;
    }
    return class Process {
        constructor(name, args, metadata) {
            console.group('Process::constructor()', runningProcesses.length, arguments);
            this.__pid = runningProcesses.push(this) - 1;
            this.__pname = name;
            this.__args = args || {};
            this.__metadata = metadata || {};
            this.__started = new Date();
            this.__destroyed = false;
            this.__evHandler = new EventHandler(name, [
                'message',
                'attention',
                'hashchange',
                'api',
                'destroy',
                'destroyWindow',
                'vfs',
                'vfs:mount',
                'vfs:unmount',
                'vfs:mkdir',
                'vfs:write',
                'vfs:move',
                'vfs:copy',
                'vfs:delete',
                'vfs:upload',
                'vfs:update'
            ]);
            this.__label = this.__metadata.name;
            this.__path = this.__metadata.path;
            this.__scope = this.__metadata.scope || 'system';
            this.__iter = this.__metadata.className;
            console.groupEnd();
        }
        destroy() {
            if (!this.__destroyed) {
                this.__destroyed = true;
                console.group('Process::destroy()', this.__pid, this.__pname);
                this._emit('destroy', []);
                if (this.__evHandler) {
                    this.__evHandler = this.__evHandler.destroy();
                }
                if (this.__pid >= 0) {
                    runningProcesses[this.__pid] = null;
                }
                console.groupEnd();
                return true;
            }
            return false;
        }
        _onMessage(msg, obj, opts) {
            opts = opts || {};
            let sourceId = opts.source;
            if (sourceId && typeof sourceId === 'object') {
                if (sourceId instanceof Process) {
                    sourceId = sourceId.__pid;
                } else if (sourceId._app) {
                    sourceId = sourceId._app ? sourceId._app.__pid : -1;
                }
            }
            if (this.__evHandler && sourceId !== this.__pid) {
                console.debug('Process::_onMessage()', msg, obj, opts, this.__pid, this.__pname);
                this.__evHandler.emit('message', [
                    msg,
                    obj,
                    opts
                ]);
                if (msg.substr(0, 3) === 'vfs') {
                    this.__evHandler.emit('vfs', [
                        msg,
                        obj,
                        opts
                    ]);
                }
                this.__evHandler.emit(msg, [
                    obj,
                    opts,
                    msg
                ]);
            }
        }
        _emit(k, args) {
            return this.__evHandler ? this.__evHandler.emit(k, args) : null;
        }
        _on(k, func) {
            return this.__evHandler ? this.__evHandler.on(k, func, this) : null;
        }
        _off(k, idx) {
            if (this.__evHandler) {
                this.__evHandler.off(k, idx);
            }
        }
        _api(method, args, options) {
            if (typeof options === 'boolean') {
                options = { indicator: options };
            } else if (typeof options !== 'object') {
                options = {};
            }
            this._emit('api', [method]);
            return new Promise((resolve, reject) => {
                Connection.request('application', {
                    application: this.__iter,
                    path: this.__path,
                    method: method,
                    args: args
                }, options).then(res => {
                    if (!this.__destroyed) {
                        resolve(res);
                        return true;
                    }
                    console.warn('Process::_api()', 'INGORED RESPONSE: Process was closed');
                    return false;
                }).catch(err => {
                    if (!this.__destroyed) {
                        reject(err instanceof Error ? err : new Error(err));
                    }
                });
            });
        }
        _getArgument(k) {
            return typeof this.__args[k] === 'undefined' ? null : this.__args[k];
        }
        _getArguments() {
            return this.__args;
        }
        _getResource(src, vfspath) {
            return PackageManager.getPackageResource(this, src, vfspath);
        }
        _setArgument(k, v) {
            this.__args[k] = v;
        }
        static kill(pid) {
            return _kill(pid);
        }
        static killAll(match) {
            let matcher = () => true;
            if (match) {
                matcher = match instanceof RegExp ? p => p.__pname.match(match) : p => p.__pname === match;
            }
            this.getProcesses().filter(p => matcher(p)).forEach(p => _kill(p.__pid, true));
            runningProcesses = [];
        }
        static message(msg, obj, opts) {
            opts = opts || {};
            console.debug('Process::message()', msg, obj, opts);
            let filter = opts.filter || (() => true);
            if (typeof filter === 'string') {
                const s = filter;
                filter = p => {
                    return p.__pname === s;
                };
            }
            this.getProcesses().filter(filter).forEach(p => p._onMessage(msg, obj, opts));
        }
        static getProcess(name, first) {
            if (typeof name === 'number') {
                return runningProcesses[name];
            }
            const found = this.getProcesses().filter(p => {
                return p.__pname === name;
            });
            return first ? found[0] : found;
        }
        static getProcesses() {
            return runningProcesses.filter(p => !!p);
        }
        static reload(n) {
            if (!(n instanceof Array)) {
                n = [n];
            }
            n.map(name => this.getProcess(name, true)).filter(p => !!p).forEach(p => {
                let promise = null;
                let data = p._getSessionData();
                let args = {};
                let name;
                try {
                    name = p.__pname;
                    promise = p.destroy();
                } catch (e) {
                    console.warn('Process::reload()', e.stack, e);
                }
                if (data !== null) {
                    args = data.args;
                    args.__resume__ = true;
                    args.__windows__ = data.windows || [];
                }
                args.__preload__ = { force: true };
                if (!(promise instanceof Promise)) {
                    promise = Promise.resolve(true);
                }
                if (name) {
                    promise.then(() => {
                        return setTimeout(() => {
                            this.create(name, args);
                        }, 500);
                    });
                }
            });
        }
        static create(name, args, onconstruct) {
            args = args || {};
            onconstruct = onconstruct || function () {
            };
            const hash = name + JSON.stringify(args);
            if (alreadyLaunching.indexOf(hash) !== -1) {
                return Promise.resolve(null);
            }
            alreadyLaunching.push(hash);
            const init = () => {
                if (!name) {
                    throw new Error('Cannot Process::create() witout a application name');
                }
                const compability = Compability.getCompability();
                const metadata = PackageManager.getPackage(name);
                const alreadyRunning = Process.getProcess(name, true);
                if (!metadata) {
                    throw new Error(locales._('ERR_APP_LAUNCH_MANIFEST_FAILED_FMT', name));
                }
                const compabilityFailures = (metadata.compability || []).filter(c => {
                    if (typeof compability[c] !== 'undefined') {
                        return !compability[c];
                    }
                    return false;
                });
                if (compabilityFailures.length) {
                    throw new Error(locales._('ERR_APP_LAUNCH_COMPABILITY_FAILED_FMT', name, compabilityFailures.join(', ')));
                }
                if (metadata.singular === true && alreadyRunning) {
                    console.warn('Process::create()', 'detected that this application is a singular and already running...');
                    alreadyRunning._onMessage('attention', args);
                    return Promise.resolve(alreadyRunning);
                }
                hooks.triggerHook('processStart', [
                    name,
                    args
                ]);
                Loader.create('Main.launch.' + name, {
                    title: locales._('LBL_STARTING') + ' ' + metadata.name,
                    icon: Theme.getIcon(metadata.icon, '16x16')
                });
                let pargs = { max: metadata.preloadParallel === true ? Config.getConfig('Connection.PreloadParallel') : metadata.preloadParallel };
                if (args.__preload__) {
                    pargs = Object.assign(pargs, args.__preload__);
                    delete args.__preload__;
                }
                return new Promise((resolve, reject) => {
                    const onerror = e => {
                        console.warn(e);
                        return reject(new Error(e));
                    };
                    Preloader.preload(metadata.preload, pargs).then(result => {
                        if (result.failed.length) {
                            return onerror(locales._('ERR_APP_PRELOAD_FAILED_FMT', name, result.failed.join(',')));
                        }
                        if (typeof OSjs.Applications[name] === 'undefined') {
                            return onerror(new Error(locales._('ERR_APP_RESOURCES_MISSING_FMT', name)));
                        }
                        let instance;
                        try {
                            const ResolvedPackage = OSjs.Applications[name];
                            instance = new ResolvedPackage(args, metadata);
                            onconstruct(instance, metadata);
                        } catch (e) {
                            return onerror(e);
                        }
                        try {
                            const settings = SettingsManager.get(instance.__pname) || {};
                            instance.init(settings, metadata);
                            hooks.triggerHook('processStarted', [{
                                    application: instance,
                                    name: name,
                                    args: args,
                                    settings: settings,
                                    metadata: metadata
                                }]);
                        } catch (e) {
                            return onerror(e);
                        }
                        return resolve(instance);
                    }).catch(onerror);
                });
            };
            const onerror = err => {
                OSjs.error(locales._('ERR_APP_LAUNCH_FAILED'), locales._('ERR_APP_LAUNCH_FAILED_FMT', name), err, err, true);
            };
            return new Promise((resolve, reject) => {
                console.group('Process::create()', name, args);
                const remove = () => {
                    console.groupEnd();
                    const i = alreadyLaunching.indexOf(hash);
                    if (i >= 0) {
                        alreadyLaunching.splice(i, 1);
                    }
                    Loader.destroy('Main.launch.' + name);
                };
                const fail = e => {
                    Loader.destroy('Main.launch.' + name);
                    remove();
                    onerror(e);
                    return reject(e);
                };
                try {
                    init().then(resolve).catch(fail).finally(remove);
                } catch (e) {
                    fail(e);
                }
            });
        }
        static createFromArray(list, onconstruct) {
            list = list || [];
            onconstruct = onconstruct || function () {
            };
            console.info('Process::createFromArray()', list);
            return Promise.each(list, s => {
                return new Promise((resolve, reject) => {
                    s = getLaunchObject(s);
                    if (s.name) {
                        try {
                            this.create(s.name, s.args, (instance, metadata) => {
                                onconstruct(instance, metadata, s.name, s.args);
                            }).then(resolve).catch(reject);
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        resolve();
                    }
                });
            });
        }
        static createFromFile(file, args) {
            file = new FileMetadata(file);
            args = Object.assign({ file: file }, args || {});
            if (args.args) {
                Object.keys(args.args).forEach(i => {
                    args[i] = args.args[i];
                });
            }
            if (!file.path) {
                throw new Error('Cannot open file without a path');
            }
            console.info('Process::createFromFile()', file, args);
            if (file.mime === 'osjs/application') {
                return this.create(FS.filename(file.path));
            } else if (file.type === 'dir') {
                const fm = SettingsManager.instance('DefaultApplication').get('dir', 'ApplicationFileManager');
                return this.create(fm, { path: file.path });
            }
            return new Promise((resolve, reject) => {
                const val = SettingsManager.get('DefaultApplication', file.mime);
                let pack = PackageManager.getPackagesByMime(file.mime);
                if (!args.forceList && val) {
                    if (PackageManager.getPackage(val)) {
                        console.debug('Process::createFromFile()', 'default application', val);
                        pack = [val];
                    }
                }
                if (pack.length === 0) {
                    OSjs.error(locales._('ERR_FILE_OPEN'), locales._('ERR_FILE_OPEN_FMT', file.path), locales._('ERR_APP_MIME_NOT_FOUND_FMT', file.mime));
                    reject(new Error(locales._('ERR_APP_MIME_NOT_FOUND_FMT', file.mime)));
                } else if (pack.length === 1) {
                    this.create(pack[0], args).then(resolve).catch(reject);
                } else {
                    const DialogWindow = OSjs.require('core/dialog');
                    DialogWindow.default.create('ApplicationChooser', {
                        file: file,
                        list: pack
                    }, (ev, btn, result) => {
                        if (btn === 'ok') {
                            this.create(result.name, args);
                            SettingsManager.set('DefaultApplication', file.mime, result.useDefault ? result.name : null, true).then(resolve).catch(err => {
                                reject(typeof err === 'string' ? new Error(err) : err);
                            });
                        }
                    });
                }
            });
        }
    };
});