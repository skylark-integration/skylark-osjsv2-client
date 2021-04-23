define([
    './locales',
    './mount-manager',
    './settings-manager',
    './package-manager',
    './search-engine',
    './authenticator',
    './window-manager',
    './dialog',
    './storage',
    './process',
    './theme',
    './connection',
    '../helpers/hooks',
    './config',
    '../gui/splash',
    '../utils/misc',
    '../gui/menu',
    '../gui/notification',
    '../utils/preloader',
    '../dialogs/alert',
    '../dialogs/applicationchooser',
    '../dialogs/color',
    '../dialogs/confirm',
    '../dialogs/error',
    '../dialogs/fileinfo',
    '../dialogs/file',
    '../dialogs/fileprogress',
    '../dialogs/fileupload',
    '../dialogs/font',
    '../dialogs/input',
    "../vfs/fs",
    "../vfs/transports/web",
    "../vfs/transports/osjs",
    "../vfs/transports/dist",
    "../vfs/transports/applications",
    "../vfs/transports/webdav",
    "../vfs/transports/google-drive",
    "../vfs/transports/onedrive",
    "../vfs/transports/dropbox"


], function (Locales, MountManager, SettingsManager, PackageManager, SearchEngine, Authenticator, WindowManager, DialogWindow, Storage, Process, Theme, Connection, a, b, SplashScreen, Utils, Menu, Notification,Preloader, AlertDialog, ApplicationChooserDialog, ColorDialog, ConfirmDialog, ErrorDialog, FileInfoDialog, FileDialog, FileProgressDialog, FileUploadDialog, FontDialog, InputDialog,
    VFS,
    WebTransport,
    OsjsTransport,
    DistTransport,
    ApplicationTransport,
    WebdavTransport,
    GdriveTransport,
    OnedriveTransport,
    DropboxTransport) {
    'use strict';

   const  OSJS_DEBUG = false;

    Promise.each = function(arr, fn) { // take an array and a function // added by lwf
      // invalid input
      if(!Array.isArray(arr)) return Promise.reject(new Error("Non array passed to each"));
      // empty case
      if(arr.length === 0) return Promise.resolve(); 
      return arr.reduce(function(prev, cur,idx) { 
        return prev.then(() => fn(cur,idx))
      }, Promise.resolve());
    }

    function loadTransports() {
        const result = {
            'web' : WebdavTransport.default,
            'osjs' : OnedriveTransport.default,
            'dist' : DistTransport.default,
            'applications' : ApplicationTransport.default,
            'webdav' : WebdavTransport.default,
            'google-drive' : GdriveTransport.default,
            'onedrive' : OnedriveTransport.default,
            'dropbox' : DropboxTransport.default
        };

        return result;
    }

    let hasBooted = false;
    let hasShutDown = false;
    function onError(title, message, error, exception, bugreport) {
        bugreport = (() => {
            if (b.getConfig('BugReporting.enabled')) {
                return typeof bugreport === 'undefined' ? false : bugreport ? true : false;
            }
            return false;
        })();
        function _dialog() {
            const wm = WindowManager.instance;
            if (wm && wm._fullyLoaded) {
                try {
                    DialogWindow.create('Error', {
                        title: title,
                        message: message,
                        error: error,
                        exception: exception,
                        bugreport: bugreport
                    });
                    return true;
                } catch (e) {
                    console.warn('An error occured while creating Error Dialog', e);
                    console.warn('stack', e.stack);
                }
            }
            return false;
        }
        Menu.blur();
        if (exception instanceof Error && (exception.message.match(/^Script Error/i) && String(exception.lineNumber).match(/^0/))) {
            console.error('VENDOR ERROR', {
                title: title,
                message: message,
                error: error,
                exception: exception
            });
            return;
        } else {
            console.error(title, message, error, exception);
        }
        const testMode = OSJS_DEBUG && window.location.hash.match(/mocha=true/);
        if (!testMode) {
            if (!_dialog()) {
                window.alert(title + '\n\n' + message + '\n\n' + error);
            }
        }
    }
    const initPreloading = config => new Promise((resolve, reject) => {
        const flatten = list => list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
        Preloader.preload(flatten(config.Preloads)).then(result => {
            return resolve();
        }).catch(reject);
    });
    const initHandlers = config => new Promise((resolve, reject) => {
        const options = config.Connection;
        console.log({
            authenticator: options.Authenticator,
            connection: options.Connection,
            storage: options.Storage
        });
        let Authenticator, Connection, Storage;
        let connectionName = options.Connection.split('+').indexOf('ws') !== -1 ? 'ws' : 'http';
        try {
            Authenticator = OSjs.require('core/auth/' + options.Authenticator); // modified by lwf
            Connection = OSjs.require('core/connections/' + connectionName); // modified by lwf
            Storage = OSjs.require('core/storage/' + options.Storage ); // modified by lwf
        } catch (e) {
            reject(e);
            return;
        }
        const connection = new Connection();
        const authenticator = new Authenticator();
        const storage = new Storage();
        Promise.each([
            connection,
            storage,
            authenticator
        ], iter => {
            return iter.init();
        }).then(resolve).catch(reject);
    });
    const initVFS = config => new Promise((resolve, reject) => {
        const mountPoints = SettingsManager.instance('VFS').get('mounts', []);
        MountManager.init(loadTransports).then(res => {  // modified by lwf
            return MountManager.addList(mountPoints).then(res => {
                return resolve(res);
            }).catch(e => {
                console.warn('A module failed to load!', e);
                resolve();
            });
        }).catch(reject);
    });
    const initSettingsManager = config => new Promise((resolve, reject) => {
        const pools = config.SettingsManager || {};
        Object.keys(pools).forEach(function (poolName) {
            console.debug('initSettingsManager()', 'initializes pool', poolName, pools[poolName]);
            SettingsManager.instance(poolName, pools[poolName] || {});
        });
        resolve();
    });
    const initPackageManager = config => new Promise((resolve, reject) => {
        const list = config.PreloadOnBoot || [];
        let metadata = {};
        try {
            metadata = OSjs.getManifest();
        } catch (e) {
        }
        const auth = Authenticator.instance;
        PackageManager.init(Authenticator,VFS,metadata, auth.isStandalone).then(() => { //modified by lwf
            return Promise.each(list, iter => {
                return new Promise(next => {
                    var pkg = PackageManager.getPackage(iter);
                    if (pkg && pkg.preload) {
                        Preloader.preload(pkg.preload).then(next).catch(() => next());
                    } else {
                        next();
                    }
                });
            }).then(resolve).catch(reject);
        }).catch(reject);
    });
    const initExtensions = config => new Promise((resolve, reject) => {
        const packages = PackageManager.getPackages(); 
        const preloadExtensions = () => new Promise((resolve, reject) => {
            let preloads = [];
            Object.keys(packages).forEach(k => {
                const iter = packages[k];
                if (iter.type === 'extension' && iter.preload) {
                    preloads = preloads.concat(iter.preload);
                }
            });
            if (preloads.length) {
                Preloader.preload(preloads).then(resolve).catch(() => resolve());
            } else {
                resolve();
            }
        });
        const launchExtensions = () => new Promise((resolve, reject) => {
            const exts = Object.keys(OSjs.Extensions);
            Promise.each(exts, entry => {
                return new Promise((yes, no) => {
                    try {
                        const m = packages[entry];
                        let promise = OSjs.Extensions[entry].init(m);
                        if (!(promise instanceof Promise)) {
                            promise = Promise.resolve(true);
                        }
                        promise.then(yes).catch(err => {
                            console.error(err);
                            return yes(false);
                        });
                    } catch (e) {
                        console.warn('Extension init failed', e.stack, e);
                        yes(false);
                    }
                });
            }).then(resolve).catch(err => {
                console.warn(err);
                reject(new Error(err));
            });
        });
        preloadExtensions().then(() => {
            return launchExtensions().then(resolve).catch(reject);
        }).catch(() => resolve());
    });
    const initSearchEngine = config => new Promise((resolve, reject) => {
        SearchEngine.init().then(resolve).catch(reject);
    });
    const initGUI = config => new Promise((resolve, reject) => {
        const guiElements = [
            'containers',
            'visual',
            'tabs',
            'richtext',
            'misc',
            'inputs',
            'treeview',
            'listview',
            'iconview',
            'fileview',
            'menus'
        ];
        guiElements.forEach(f => {
            const gel = OSjs.require('gui/elements/' + f); // modified by lwf
            Object.keys(gel).forEach(name => {
                gel[name].register();
            });
        });
        OSjs.error = onError;
        OSjs.Dialogs.Alert = AlertDialog;
        OSjs.Dialogs.ApplicationChooser = ApplicationChooserDialog;
        OSjs.Dialogs.Color = ColorDialog;
        OSjs.Dialogs.Confirm = ConfirmDialog;
        OSjs.Dialogs.Error = ErrorDialog;
        OSjs.Dialogs.File = FileDialog;
        OSjs.Dialogs.FileInfo = FileInfoDialog;
        OSjs.Dialogs.FileProgress = FileProgressDialog;
        OSjs.Dialogs.FileUpload = FileUploadDialog;
        OSjs.Dialogs.Font = FontDialog;
        OSjs.Dialogs.Input = InputDialog;
        Theme.init(VFS); // modified by lwf
        resolve();
    });
    const initWindowManager = config => new Promise((resolve, reject) => {
        const wmConfig = config.WindowManager;
        if (!wmConfig || !wmConfig.exec) {
            reject(new Error(Locales._('ERR_CORE_INIT_NO_WM')));
        } else {
            Process.create(wmConfig.exec, wmConfig.args || {}).then(app => {
                return app.setup().then(resolve).catch(reject);
            }).catch(error => {
                reject(new Error(Locales._('ERR_CORE_INIT_WM_FAILED_FMT', error)));
            });
        }
    });
    const initMocha = config => new Promise((resolve, reject) => {
        const div = document.createElement('div');
        div.id = 'mocha';
        document.body.appendChild(div);
        document.body.style.overflow = 'auto';
        document.body.style.backgroundColor = '#ffffff';
        Preloader.preload([
            '/test.css',
            '/test.js'
        ]).then(() => {
            OSjs.runTests();
        });
        resolve(true);
    });
    function initSession(config) {
        console.debug('initSession()');
        var list = [];
        try {
            list = config.AutoStart;
        } catch (e) {
            console.warn('initSession()->autostart()', 'exception', e, e.stack);
        }
        var checkMap = {};
        var skipMap = [];
        list.forEach(function (iter, idx) {
            if (typeof iter === 'string') {
                iter = list[idx] = { name: iter };
            }
            if (skipMap.indexOf(iter.name) === -1) {
                if (!checkMap[iter.name]) {
                    checkMap[iter.name] = idx;
                    skipMap.push(iter.name);
                }
            }
        });
        return new Promise(resolve => {
            Storage.instance.getLastSession(SettingsManager).then(adds => {  // modified by lwf
                adds.forEach(function (iter) {
                    if (typeof checkMap[iter.name] === 'undefined') {
                        list.push(iter);
                    } else {
                        if (iter.args) {
                            var refid = checkMap[iter.name];
                            var ref = list[refid];
                            if (!ref.args) {
                                ref.args = {};
                            }
                            ref.args = Utils.mergeObject(ref.args, iter.args);
                        }
                    }
                });
                console.info('initSession()->autostart()', list);
                return Process.createFromArray(list).then(resolve).catch(resolve);
            }).catch(err => {
                console.warn(err);
                resolve();
            });
        });
    }
    function onMessage(ev) {
        if (ev && ev.data && typeof ev.data.message !== 'undefined' && typeof ev.data.pid === 'number') {
            console.debug('window::message()', ev.data);
            var proc = Process.getProcess(ev.data.pid);
            if (proc) {
                if (typeof proc.onPostMessage === 'function') {
                    proc.onPostMessage(ev.data.message, ev);
                }
                if (typeof proc._getWindow === 'function') {
                    var win = proc._getWindow(ev.data.wid, 'wid');
                    if (win) {
                        win.onPostMessage(ev.data.message, ev);
                    }
                }
            }
        }
    }
    function start() {
        if (hasBooted || hasShutDown) {
            return;
        }
        hasBooted = true;
        console.info('Starting OS.js');
        const config = OSjs.getConfig();
        const testMode = OSJS_DEBUG && window.location.hash.match(/mocha=true/);
        const total = 9;
        Locales.init(config.Locale, config.LocaleOptions, config.Languages);
        SplashScreen.watermark(config);
        SplashScreen.show();
        a.triggerHook('initialize');
        Promise.each([
            initPreloading,
            initHandlers,
            initVFS,
            initSettingsManager,
            initPackageManager,
            initExtensions,
            initSearchEngine,
            initGUI,
            testMode ? initMocha : initWindowManager
        ], (fn, index) => {
            return new Promise((resolve, reject) => {
                console.group('Initializing', index + 1, 'of', total);
                SplashScreen.update(index, total);
                return fn(config).then(res => {
                    console.groupEnd();
                    return resolve(res);
                }).catch(err => {
                    console.warn(err);
                    console.groupEnd();
                    return reject(new Error(err));
                });
            });
        }).then(() => {
            console.info('Done!');
            window.addEventListener('message', onMessage, false);
            a.triggerHook('initialized');
            SplashScreen.hide();
            if (!testMode) {
                Theme.playSound('LOGIN');
                var wm = WindowManager.instance;
                if (wm) {
                    wm._fullyLoaded = true;
                }
                initSession(config).then(() => {
                    return a.triggerHook('sessionLoaded');
                });
            }
            return true;
        }).catch(err => {
            const title = Locales._('ERR_CORE_INIT_FAILED');
            const message = Locales._('ERR_CORE_INIT_FAILED_DESC');
            alert(title + '\n\n' + message);
            console.error(title, message, err);
        });
    }
    function stop(restart = false) {
        if (hasShutDown || !hasBooted) {
            return;
        }
        hasShutDown = true;
        hasBooted = false;
        window.removeEventListener('message', onMessage, false);
        const wm = WindowManager.instance;
        if (wm) {
            wm.toggleFullscreen();
        }
        Preloader.clear();
        Menu.blur();
        Process.killAll();
        SearchEngine.destroy();
        PackageManager.destroy();
        Authenticator.instance.destroy();
        Storage.instance.destroy();
        Connection.instance.destroy();
        a.triggerHook('shutdown');
        console.warn('OS.js was shut down!');
        if (!restart && b.getConfig('ReloadOnShutdown') === true) {
            window.location.reload();
        }
    }
    function restart(save = false) {
        const lout = cb => Authenticator.instance.logout().then(cb).catch(cb);
        const saveFunction = save && Storage.instance ? function (cb) {
            Storage.instance.saveSession().then(() => lout(cb)).catch(() => lout(cb));
        } : lout;
        saveFunction(function () {
            console.clear();
            stop(true);
            start();
        });
    }
    function logout() {
        const storage = Storage.instance;
        const wm = WindowManager.instance;
        function signOut(save) {
            Theme.playSound('LOGOUT');
            const lout = cb => Authenticator.instance.logout().then(cb).catch(cb);
            if (save) {
                storage.saveSession(Process,SettingsManager).then(() => lout(stop)).catch(() => lout(stop)); // modified by lwf
            } else {
                lout(stop);
            }
        }
        if (wm) {
            const user = Authenticator.instance.getUser() || { name: Locales._('LBL_UNKNOWN') };
            DialogWindow.create('Confirm', {
                title: Locales._('DIALOG_LOGOUT_TITLE'),
                message: Locales._('DIALOG_LOGOUT_MSG_FMT', user.name)
            }, function (ev, btn) {
                if ([
                        'no',
                        'yes'
                    ].indexOf(btn) !== -1) {
                    signOut(btn === 'yes');
                }
            });
        } else {
            signOut(true);
        }
    }
    function running() {
        return !hasShutDown;
    }
    return {
        start: start,
        stop: stop,
        restart: restart,
        logout: logout,
        running: running
    };
});