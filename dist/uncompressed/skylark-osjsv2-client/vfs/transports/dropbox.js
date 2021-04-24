define([
    '../transport',
    '../../utils/preloader',
    '../../core/config',
    '../file',
    '../../utils/misc',
    '../../core/locales',
    '../../utils/fs'
], function (Transport, Preloader, Config, FileMetadata, b, Locales, FS) {
    'use strict';
    const AUTH_TIMEOUT = 1000 * 30;
    const MAX_RESULTS = 100;
    return class DropboxTransport extends Transport {
        constructor() {
            super(...arguments);
            this.loaded = false;
            this.authed = false;
            this.dbx = null;
        }
        _loadDependencies() {
            if (this.loaded) {
                return Promise.resolve(true);
            }
            return new Promise((resolve, reject) => {
                Preloader.preload(['https://unpkg.com/dropbox/dist/Dropbox-sdk.min.js']).then(() => {
                    if (window.Dropbox) {
                        this.loaded = true;
                        return resolve(true);
                    }
                    return reject(new Error(Locales._('ERR_DROPBOX_API')));
                }).catch(err => {
                    this.loaded = true;
                    return reject(err);
                });
            });
        }
        _createClient(clientId) {
            if (this.authed) {
                return Promise.resolve(true);
            }
            return new Promise((resolve, reject) => {
                let timedOut;
                let loginTimeout;
                this.dbx = new window.Dropbox({ clientId: clientId });
                const redirectUrl = window.location.href.replace(/\/?$/, '/') + 'dropbox-oauth.html';
                const callbackName = '__osjs__dropbox_callback__';
                window[callbackName] = url => {
                    clearTimeout(loginTimeout);
                    if (timedOut) {
                        return;
                    }
                    const params = b.urlparams(url, true);
                    if (params.access_token) {
                        this.authed = true;
                        this.dbx = new window.Dropbox({ accessToken: params.access_token });
                        resolve(true);
                    } else {
                        reject(new Error(Locales._('ERR_DROPBOX_AUTH')));
                    }
                };
                const authUrl = this.dbx.getAuthenticationUrl(redirectUrl);
                loginTimeout = setTimeout(() => {
                    timedOut = true;
                    reject(new Error(Locales._('ERR_DROPBOX_AUTH')));
                }, AUTH_TIMEOUT);
                window.open(authUrl);
            });
        }
        _init() {
            const clientId = Config.getConfig('DropboxAPI.ClientKey');
            if (!clientId) {
                return Promise.reject(new Error(Locales._('ERR_DROPBOX_KEY')));
            }
            return new Promise((resolve, reject) => {
                this._loadDependencies().then(() => {
                    return this._createClient(clientId).then(resolve).catch(reject);
                }).catch(reject);
            });
        }
        request(method, args, options, mount) {
            const fargs = arguments;
            return new Promise((resolve, reject) => {
                this._init().then(() => {
                    return super.request(...fargs).then(resolve).catch(err => {
                        if (typeof err !== 'string' && !(err instanceof Error)) {
                            if (err.status && err.response && err.error) {
                                return reject(new Error(err.error.error_summary));
                            }
                        }
                        return reject(err);
                    });
                }).catch(reject);
            });
        }
        _createMetadata(root, iter) {
            return {
                id: iter.id,
                filename: iter.name,
                path: FS.pathJoin(root, iter.path_display),
                type: iter['.tag'] === 'folder' ? 'dir' : 'file',
                size: iter.size || 0
            };
        }
        find(file, options, a, mount) {
            const root = FS.getPathFromVirtual(file.path);
            return new Promise((resolve, reject) => {
                this.dbx.filesSearch({
                    path: root === '/' ? '' : root,
                    query: options.query,
                    max_results: MAX_RESULTS,
                    mode: { '.tag': 'filename' }
                }).then(response => {
                    return resolve(response.matches.map(iter => {
                        return this._createMetadata(mount.option('root'), iter.metadata);
                    }));
                }).catch(reject);
            });
        }
        scandir(item, options, mount) {
            const root = FS.getPathFromVirtual(item.path);
            let result = [];
            const scandir = cursor => new Promise((resolve, reject) => {
                const m = cursor ? 'filesListFolderContinue' : 'filesListFolder';
                const a = cursor ? { cursor } : { path: root === '/' ? '' : root };
                this.dbx[m](a).then(response => {
                    const found = (response.entries || []).map(iter => {
                        return this._createMetadata(mount.option('root'), iter);
                    });
                    result = result.concat(found);
                    if (response.has_more && response.cursor) {
                        return scandir(response.cursor).then(resolve).catch(reject);
                    }
                    return resolve(result);
                }).catch(reject);
            });
            return scandir(null);
        }
        read(item, options, mount) {
            return new Promise((resolve, reject) => {
                this.url(item, { dl: 0 }).then(url => {
                    this.dbx.sharingGetSharedLinkFile({ url }).then(data => {
                        return resolve(data.fileBlob);
                    }).catch(reject);
                }).catch(reject);
            });
        }
        write(file, data) {
            return new Promise((resolve, reject) => {
                this.dbx.filesUpload({
                    path: FS.getPathFromVirtual(file.path),
                    mode: { '.tag': 'overwrite' },
                    contents: data
                }).then(() => resolve(true)).catch(reject);
            });
        }
        copy(src, dest) {
            return new Promise((resolve, reject) => {
                this.dbx.filesCopy({
                    from_path: FS.getPathFromVirtual(src.path),
                    to_path: FS.getPathFromVirtual(dest.path)
                }).then(() => resolve(true)).catch(reject);
            });
        }
        move(src, dest) {
            return new Promise((resolve, reject) => {
                this.dbx.filesMove({
                    from_path: FS.getPathFromVirtual(src.path),
                    to_path: FS.getPathFromVirtual(dest.path)
                }).then(() => resolve(true)).catch(reject);
            });
        }
        exists(item) {
            return new Promise((resolve, reject) => {
                this.fileinfo(item).then(() => resolve(true)).catch(() => resolve(false));
            });
        }
        fileinfo(item) {
            return this.dbx.filesGetMetadata({ path: FS.getPathFromVirtual(item.path) });
        }
        url(item, options) {
            const visibility = 'public';
            const hasLink = () => new Promise((resolve, reject) => {
                this.dbx.sharingGetSharedLinks({ path: FS.getPathFromVirtual(item.path) }).then(response => {
                    if (response.links.length) {
                        const found = response.links.find(iter => iter.visibility['.tag'] === visibility);
                        const dl = typeof options.dl === 'undefined' ? 1 : options.dl;
                        if (found) {
                            return resolve(found.url.replace('dl=0', 'dl=' + String(dl)));
                        }
                    }
                    return resolve(false);
                }).catch(reject);
            });
            const newLink = () => new Promise((resolve, reject) => {
                this.dbx.sharingCreateSharedLinkWithSettings({
                    path: FS.getPathFromVirtual(item.path),
                    settings: { requested_visibility: visibility }
                }).then(response => {
                    return resolve(response.url);
                }).catch(reject);
            });
            return new Promise((resolve, reject) => {
                hasLink().then(url => {
                    if (url) {
                        console.warn('ALREADY HAS URL', url);
                        return resolve(url);
                    }
                    console.warn('CREATING NEW URL');
                    return newLink().then(resolve).catch(reject);
                }).catch(reject);
            });
        }
        mkdir(dir) {
            return new Promise((resolve, reject) => {
                this.dbx.filesCreateFolder({ path: FS.getPathFromVirtual(dir.path) }).then(() => resolve(true)).catch(reject);
            });
        }
        upload(dest, file) {
            const item = new FileMetadata({
                filename: file.name,
                path: FS.pathJoin(dest.path, file.name),
                mime: file.type,
                size: file.size
            });
            return this.write(item, file);
        }
        freeSpace(root) {
            return new Promise((resolve, reject) => {
                this.dbx.usersGetSpaceUsage().then(response => {
                    try {
                        if (response.allocation && typeof response.allocation.individual !== 'undefined') {
                            return resolve(response.allocation.individual.allocated);
                        }
                    } catch (e) {
                        console.warn(e);
                    }
                    return resolve(-1);
                }).catch(reject);
            });
        }
        unlink(src) {
            return new Promise((resolve, reject) => {
                this.dbx.filesDelete({ path: FS.getPathFromVirtual(src.path) }).then(() => resolve(true)).catch(reject);
            });
        }
    };
});