define([
    '../utils/fs',
    './file',
    './filedataurl',
    '../core/process',
    '../core/mount-manager',
    '../core/package-manager',
    '../core/settings-manager',
    '../core/connection',
    '../core/locales'
], function (FS, FileMetadata, FileDataURL, Process, MountManager, PackageManager, SettingsManager, Connection, a) {
    'use strict';
    let watches = [];
    function noop(err, res) {
        if (err) {
            console.error('VFS operation without callback caused an error', err);
        } else {
            console.warn('VFS operation without callback', res);
        }
    }
    function hasAlias(item, retm) {
        const module = MountManager.getModuleFromPath(item.path);
        if (module) {
            const match = module.option('match');
            const options = module.option('options');
            if (options && options.alias) {
                return retm ? module : item.path.replace(match, options.alias);
            }
        }
        return false;
    }
    function checkMetadataArgument(item, err, checkRo) {
        if (typeof item === 'string') {
            item = new FileMetadata(item);
        } else if (typeof item === 'object' && item.path) {
            item = new FileMetadata(item);
        }
        if (!(item instanceof FileMetadata)) {
            throw new TypeError(err || a._('ERR_VFS_EXPECT_FILE'));
        }
        const alias = hasAlias(item);
        if (alias) {
            item.path = alias;
        }
        const mountpoint = MountManager.getModuleFromPath(item.path);
        if (!mountpoint) {
            throw new Error(a._('ERR_VFSMODULE_NOT_FOUND_FMT', item.path));
        }
        if (checkRo && mountpoint.isReadOnly()) {
            throw new Error(a._('ERR_VFSMODULE_READONLY_FMT', mountpoint.name));
        }
        return item;
    }
    function hasSameTransport(src, dest) {
        const msrc = MountManager.getModuleFromPath(src.path);
        const mdst = MountManager.getModuleFromPath(dest.path);
        if (!msrc || !mdst || msrc === mdst) {
            return true;
        }
        if (msrc && mdst && (msrc.option('internal') && mdst.option('internal'))) {
            return true;
        }
        return msrc.option('transport') === mdst.option('tranport');
    }
    function existsWrapper(item, options) {
        options = options || {};
        if (options.overwrite) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            exists(item).then(result => {
                if (result) {
                    return reject(new Error(a._('ERR_VFS_FILE_EXISTS')));
                }
                return resolve();
            }).catch(error => {
                if (error) {
                    console.warn('existsWrapper() error', error);
                }
                reject(error);
            });
        });
    }
    function createBackLink(item, result, alias, oitem) {
        const path = item.path.split('://')[1].replace(/\/+/g, '/').replace(/^\/?/, '/');
        let isOnRoot = path === '/';
        if (alias) {
            isOnRoot = oitem.path === alias.root;
        }
        if (!isOnRoot) {
            const foundBack = result.some(function (iter) {
                return iter.filename === '..';
            });
            if (!foundBack) {
                return new FileMetadata({
                    filename: '..',
                    path: FS.dirname(item.path),
                    mime: null,
                    size: 0,
                    type: 'dir'
                });
            }
        }
        return false;
    }
    function checkWatches(msg, obj) {
        watches.forEach(function (w) {
            const checkPath = w.path;
            function _check(f) {
                if (w.type === 'dir') {
                    return f.path.substr(0, checkPath.length) === checkPath;
                }
                return f.path === checkPath;
            }
            let wasTouched = false;
            if (obj.destination) {
                wasTouched = _check(obj.destination);
                if (!wasTouched) {
                    wasTouched = _check(obj.source);
                }
            } else {
                wasTouched = _check(obj);
            }
            if (wasTouched) {
                w.cb(msg, obj);
            }
        });
    }
    function findAlias(item) {
        const mm = MountManager;
        let found = null;
        mm.getModules().forEach(function (iter) {
            if (!found && iter.option('options').alias) {
                const a = iter.option('options').alias;
                if (item.path.substr(0, a.length) === a) {
                    found = iter;
                }
            }
        });
        return found;
    }
    function convertWriteData(data, mime) {
        const convertTo = (m, d, resolve, reject) => {
            FS[m](d, mime, function (error, response) {
                if (error) {
                    reject(new Error(error));
                } else {
                    resolve(response);
                }
            });
        };
        return new Promise((resolve, reject) => {
            try {
                if (typeof data === 'string') {
                    if (data.length) {
                        return convertTo('textToAb', data, resolve, reject);
                    }
                } else {
                    if (data instanceof FileDataURL) {
                        return convertTo('dataSourceToAb', data.toString(), resolve, reject);
                    } else if (window.Blob && data instanceof window.Blob) {
                        return convertTo('blobToAb', data, resolve, reject);
                    }
                }
            } catch (e) {
                return reject(e);
            }
            return resolve(data);
        });
    }
    function requestWrapper(mountpoint, method, args, options, appRef) {
        console.info('VFS operation', ...arguments);
        if (!mountpoint) {
            return Promise.reject(new Error(a._('ERR_VFSMODULE_INVALID')));
        }
        return new Promise((resolve, reject) => {
            mountpoint.request(method, args, options).then(response => {
                return Connection.instance.onVFSRequestCompleted(mountpoint, method, args, response, appRef).then(() => resolve(response)).catch(reject);
            }).catch(reject);
        });
    }
    function performRequest(method, args, options, test, appRef, errorStr) {
        return new Promise((resolve, reject) => {
            if (options && !(options instanceof Object)) {
                reject(new TypeError(a._('ERR_ARGUMENT_FMT', 'VFS::' + method, 'options', 'Object', typeof options)));
                return;
            }
            const mountpoint = MountManager.getModuleFromPath(test);
            if (!mountpoint) {
                reject(new Error(a._('ERR_VFSMODULE_NOT_FOUND_FMT', test)));
                return;
            }
            requestWrapper(mountpoint, method, args, options, appRef).then(resolve).catch(reject);
        });
    }
    function broadcastMessage(msg, item, appRef) {
        function _message(i) {
            Process.message(msg, i, { source: appRef ? appRef.__pid : null });
            checkWatches(msg, item);
        }
        const aliased = function () {
            function _transform(i) {
                if (i instanceof FileMetadata) {
                    const n = new FileMetadata(i);
                    const alias = findAlias(n);
                    if (alias) {
                        n.path = n.path.replace(alias.option('options').alias, alias.option('root'));
                        return n;
                    }
                }
                return false;
            }
            if (item instanceof FileMetadata) {
                return _transform(item);
            } else if (item && item.destination && item.source) {
                return {
                    source: _transform(item.source),
                    destination: _transform(item.destination)
                };
            }
            return null;
        }();
        _message(item);
        const tuple = aliased.source || aliased.destination;
        if (aliased && (aliased instanceof FileMetadata || tuple)) {
            if (tuple) {
                aliased.source = aliased.source || item.source;
                aliased.destination = aliased.destination || item.destination;
            }
            _message(aliased);
        }
    }
    function find(item, args, options) {
        options = options || {};
        if (arguments.length < 2) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            item = checkMetadataArgument(item);
        } catch (e) {
            return Promise.reject(e);
        }
        return performRequest('find', [
            item,
            args
        ], options, item.path, null, 'ERR_VFSMODULE_FIND_FMT');
    }
    function scandir(item, options) {
        const vfsSettings = SettingsManager.get('VFS');
        options = options || {};
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        const oitem = new FileMetadata(item);
        const alias = hasAlias(oitem, true);
        try {
            item = checkMetadataArgument(item);
        } catch (e) {
            return Promise.reject(e);
        }
        return new Promise((resolve, reject) => {
            performRequest('scandir', [item], options, item.path, null, 'ERR_VFSMODULE_SCANDIR_FMT').then(result => {
                if (result instanceof Array) {
                    result = FS.filterScandir(result, options, vfsSettings);
                    if (alias) {
                        result = result.map(function (iter) {
                            const isShortcut = iter.shortcut === true;
                            const niter = new FileMetadata(iter);
                            if (!isShortcut) {
                                const str = iter.path.replace(/\/?$/, '');
                                const opt = alias.option('options') || {};
                                const tmp = opt.alias.replace(/\/?$/, '');
                                niter.path = FS.pathJoin(alias.option('root'), str.replace(tmp, ''));
                            }
                            return niter;
                        });
                    }
                    if (options.backlink !== false) {
                        const back = createBackLink(item, result, alias, oitem);
                        if (back) {
                            result.unshift(back);
                        }
                    }
                }
                return resolve(result);
            }).catch(reject);
        });
    }
    function write(item, data, options, appRef) {
        options = options || {};
        if (arguments.length < 2) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            item = checkMetadataArgument(item, null, true);
        } catch (e) {
            return Promise.reject(e);
        }
        return new Promise((resolve, reject) => {
            const mountpoint = MountManager.getModuleFromPath(item.path);
            convertWriteData(data, item.mime).then(ab => {
                requestWrapper(mountpoint, 'write', [
                    item,
                    ab
                ], options, appRef).then(resolve).catch(e => {
                    reject(new Error(a._('ERR_VFSMODULE_WRITE_FMT', e)));
                });
                return true;
            }).catch(e => {
                reject(new Error(a._('ERR_VFSMODULE_WRITE_FMT', e)));
            });
        });
    }
    function read(item, options) {
        options = options || {};
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            item = checkMetadataArgument(item);
        } catch (e) {
            return Promise.reject(e);
        }
        return new Promise((resolve, reject) => {
            const mountpoint = MountManager.getModuleFromPath(item.path);
            requestWrapper(mountpoint, 'read', [item], options).then(response => {
                if (options.type) {
                    const types = {
                        datasource: () => new Promise((yes, no) => {
                            FS.abToDataSource(response, item.mime, function (error, dataSource) {
                                return error ? no(error) : yes(dataSource);
                            });
                        }),
                        text: () => new Promise((yes, no) => {
                            FS.abToText(response, item.mime, function (error, text) {
                                return error ? no(error) : yes(text);
                            });
                        }),
                        blob: () => new Promise((yes, no) => {
                            FS.abToBlob(response, item.mime, function (error, blob) {
                                return error ? no(error) : yes(blob);
                            });
                        }),
                        json: () => new Promise((yes, no) => {
                            FS.abToText(response, item.mime, function (error, text) {
                                let jsn;
                                if (typeof text === 'string') {
                                    try {
                                        jsn = JSON.parse(text);
                                    } catch (e) {
                                        console.warn('VFS::read()', 'readToJSON', e.stack, e);
                                    }
                                }
                                return error ? no(error) : yes(jsn);
                            });
                        })
                    };
                    const type = options.type.toLowerCase();
                    if (types[type]) {
                        return types[type]().then(resolve).catch(reject);
                    }
                }
                return resolve(response);
            }).catch(e => {
                reject(new Error(a._('ERR_VFSMODULE_READ_FMT', e)));
            });
        });
    }
    function copy(src, dest, options, appRef) {
        options = options || {};
        if (arguments.length < 2) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            src = checkMetadataArgument(src, a._('ERR_VFS_EXPECT_SRC_FILE'));
            dest = checkMetadataArgument(dest, a._('ERR_VFS_EXPECT_DST_FILE'), true);
        } catch (e) {
            return Promise.reject(e);
        }
        options = Object.assign({}, {
            type: 'binary',
            dialog: null
        }, options);
        options.arrayBuffer = true;
        function dialogProgress(prog) {
            if (options.dialog) {
                options.dialog.setProgress(prog);
            }
        }
        const promise = new Promise((resolve, reject) => {
            existsWrapper(dest, options).then(() => {
                const sourceMountpoint = MountManager.getModuleFromPath(src.path);
                const destMountpoint = MountManager.getModuleFromPath(dest.path);
                if (hasSameTransport(src, dest)) {
                    requestWrapper(sourceMountpoint, 'copy', [
                        src,
                        dest
                    ], options, appRef).then(() => {
                        dialogProgress(100);
                        return resolve(true);
                    }).catch(reject);
                } else {
                    requestWrapper(sourceMountpoint, 'read', [src], options, appRef).then(data => {
                        dialogProgress(50);
                        return requestWrapper(destMountpoint, 'write', [
                            dest,
                            data
                        ], options, appRef).then(res => {
                            dialogProgress(100);
                            return resolve(res);
                        }).catch(reject);
                    }).catch(reject);
                }
                return true;
            }).catch(reject);
        });
        return new Promise((resolve, reject) => {
            promise.then(resolve).catch(e => {
                dialogProgress(100);
                reject(new Error(a._('ERR_VFSMODULE_COPY_FMT', e)));
            });
        });
    }
    function move(src, dest, options, appRef) {
        options = options || {};
        if (arguments.length < 2) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            src = checkMetadataArgument(src, a._('ERR_VFS_EXPECT_SRC_FILE'));
            dest = checkMetadataArgument(dest, a._('ERR_VFS_EXPECT_DST_FILE'), true);
        } catch (e) {
            return Promise.reject(e);
        }
        function dialogProgress(prog) {
            if (options.dialog) {
                options.dialog.setProgress(prog);
            }
        }
        const promise = new Promise((resolve, reject) => {
            existsWrapper(dest, options).then(() => {
                const sourceMountpoint = MountManager.getModuleFromPath(src.path);
                const destMountpoint = MountManager.getModuleFromPath(dest.path);
                if (hasSameTransport(src, dest)) {
                    requestWrapper(sourceMountpoint, 'move', [
                        src,
                        dest
                    ], options, appRef).then(() => {
                        dialogProgress(100);
                        return resolve(true);
                    }).catch(reject);
                } else {
                    requestWrapper(sourceMountpoint, 'read', [src], options, appRef).then(data => {
                        dialogProgress(50);
                        return requestWrapper(destMountpoint, 'write', [
                            dest,
                            data
                        ], options, appRef).then(res => {
                            return requestWrapper(sourceMountpoint, 'unlink', [src], options, appRef).then(res => {
                                dialogProgress(100);
                                return resolve(res);
                            }).catch(reject);
                        }).catch(reject);
                    }).catch(reject);
                }
                return true;
            }).catch(reject);
        });
        return new Promise((resolve, reject) => {
            promise.then(resolve).catch(e => {
                dialogProgress(100);
                reject(new Error(a._('ERR_VFSMODULE_MOVE_FMT', e)));
            });
        });
    }
    function rename(src, dest) {
        return move(...arguments);
    }
    function unlink(item, options, appRef) {
        options = options || {};
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            item = checkMetadataArgument(item, null, true);
        } catch (e) {
            return Promise.reject(e);
        }
        return new Promise((resolve, reject) => {
            performRequest('unlink', [item], options, item.path, appRef, 'ERR_VFSMODULE_UNLINK_FMT').then(response => {
                const pkgdir = SettingsManager.instance('PackageManager').get('PackagePaths', []);
                const found = pkgdir.some(function (i) {
                    const chkdir = new FileMetadata(i);
                    const idir = FS.dirname(item.path);
                    return idir === chkdir.path;
                });
                if (found) {
                    PackageManager.generateUserMetadata(function () {
                    });
                }
                return resolve(response);
            }).catch(reject);
        });
    }
    function mkdir(item, options, appRef) {
        options = options || {};
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            item = checkMetadataArgument(item, null, true);
        } catch (e) {
            return Promise.reject(e);
        }
        return performRequest('mkdir', [item], options, item.path, appRef, 'ERR_VFSMODULE_MKDIR_FMT');
    }
    function exists(item) {
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            item = checkMetadataArgument(item);
        } catch (e) {
            return Promise.reject(e);
        }
        return performRequest('exists', [item], {}, item.path, null, 'ERR_VFSMODULE_EXISTS_FMT');
    }
    function fileinfo(item) {
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            item = checkMetadataArgument(item);
        } catch (e) {
            return Promise.reject(e);
        }
        return performRequest('fileinfo', [item], {}, item.path, null, 'ERR_VFSMODULE_FILEINFO_FMT');
    }
    function url(item, options) {
        options = options || {};
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            item = checkMetadataArgument(item);
        } catch (e) {
            return Promise.reject(e);
        }
        return performRequest('url', [item], options, item.path, null, 'ERR_VFSMODULE_URL_FMT');
    }
    function upload(args, options, appRef) {
        args = args || {};
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        if (!args.files) {
            return Promise.reject(new Error(a._('ERR_VFS_UPLOAD_NO_FILES')));
        }
        if (!args.destination) {
            return Promise.reject(new Error(a._('ERR_VFS_UPLOAD_NO_DEST')));
        }
        const dest = new FileMetadata(args.destination);
        const mountpoint = MountManager.getModuleFromPath(args.destination);
        return new Promise((resolve, reject) => {
            Promise.all(args.files.map(f => {
                const filename = f instanceof window.File ? f.name : f.filename;
                const fileDest = new FileMetadata(FS.pathJoin(args.destination, filename));
                return new Promise((resolve, reject) => {
                    existsWrapper(fileDest, options).then(() => {
                        return requestWrapper(mountpoint, 'upload', [
                            dest,
                            f
                        ], options, appRef).then(resolve).catch(reject);
                    }).catch(reject);
                });
            })).then(resolve).catch(e => {
                reject(new Error(a._('ERR_VFS_UPLOAD_FAIL_FMT', e)));
            });
        });
    }
    function download(file) {
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            file = checkMetadataArgument(file);
        } catch (e) {
            return Promise.reject(e);
        }
        if (!file.path) {
            return Promise.reject(new Error(a._('ERR_VFS_DOWNLOAD_NO_FILE')));
        }
        const promise = new Promise((resolve, reject) => {
            const mountpoint = MountManager.getModuleFromPath(file);
            requestWrapper(mountpoint, 'download', [file], {}).then(() => {
                if (mountpoint.option('internal')) {
                    mountpoint.download(file).then(resolve).catch(reject);
                } else {
                    mountpoint.read(file).then(resolve).catch(reject);
                }
                return true;
            });
        });
        return new Promise((resolve, reject) => {
            promise.then(resolve).catch(e => {
                reject(new Error(a._('ERR_VFS_DOWNLOAD_FAILED', e)));
            });
        });
    }
    function trash(item) {
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            item = checkMetadataArgument(item);
        } catch (e) {
            return Promise.reject(e);
        }
        return performRequest('trash', [item], {}, item.path, null, 'ERR_VFSMODULE_TRASH_FMT');
    }
    function untrash(item) {
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            item = checkMetadataArgument(item);
        } catch (e) {
            return Promise.reject(e);
        }
        return performRequest('untrash', [item], {}, item.path, null, 'ERR_VFSMODULE_UNTRASH_FMT');
    }
    function emptyTrash() {
        return performRequest('emptyTrash', [], {}, null, null, 'ERR_VFSMODULE_EMPTYTRASH_FMT');
    }
    function freeSpace(item) {
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            item = checkMetadataArgument(item);
        } catch (e) {
            return Promise.reject(e);
        }
        const m = MountManager.getModuleFromPath(item.path, false, true);
        return performRequest('freeSpace', [m.option('root')], {}, item.path, null, 'ERR_VFSMODULE_FREESPACE_FMT');
    }
    function watch(item, callback) {
        callback = callback || noop;
        if (arguments.length < 2) {
            callback(a._('ERR_VFS_NUM_ARGS'));
            return -1;
        }
        try {
            item = checkMetadataArgument(item);
        } catch (e) {
            return Promise.reject(e);
        }
        return Promise.resolve(watches.push({
            path: item.path,
            type: item.type,
            cb: callback
        }) - 1);
    }
    function unwatch(idx) {
        if (typeof watches[idx] !== 'undefined') {
            delete watches[idx];
        }
    }
    function triggerWatch(method, arg, appRef) {
        broadcastMessage('vfs:' + method, arg, appRef);
    }
    return {
        broadcastMessage: broadcastMessage,
        find: find,
        scandir: scandir,
        write: write,
        read: read,
        copy: copy,
        move: move,
        rename: rename,
        unlink: unlink,
        mkdir: mkdir,
        exists: exists,
        fileinfo: fileinfo,
        url: url,
        upload: upload,
        download: download,
        trash: trash,
        untrash: untrash,
        emptyTrash: emptyTrash,
        freeSpace: freeSpace,
        watch: watch,
        unwatch: unwatch,
        triggerWatch: triggerWatch
    };
});