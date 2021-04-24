define([
    '../file',
    '../../utils/fs',
    '../../core/connection',
    '../transport',
    '../../core/config',
    '../../core/locales'
], function (FileMetadata, FS, Connection, Transport, Config, Locales) {
    'use strict';
    return class OSjsTransport extends Transport {
        _request(method, args, options) {
            return Connection.request('FS:' + method, args, options);
        }
        _requestUpload(dest, file, options) {
            options = options || {};
            dest = dest instanceof FileMetadata ? dest.path : dest;
            if (typeof file.size !== 'undefined') {
                const maxSize = Config.getConfig('VFS.MaxUploadSize');
                if (maxSize > 0) {
                    const bytes = file.size;
                    if (bytes > maxSize) {
                        const msg = Locales._('DIALOG_UPLOAD_TOO_BIG_FMT', FS.humanFileSize(maxSize));
                        return Promise.reject(new Error(msg));
                    }
                }
            }
            const fd = new FormData();
            fd.append('path', dest);
            if (file) {
                fd.append('filename', file.filename);
            }
            if (options) {
                Object.keys(options).forEach(key => {
                    if (key !== 'meta' && typeof options[key] !== 'function') {
                        fd.append(key, String(options[key]));
                    }
                });
            }
            if (file instanceof window.ArrayBuffer) {
                fd.append('size', String(file.byteLength));
            }
            FS.addFormFile(fd, 'upload', file, options.meta);
            return this._request('upload', fd, options);
        }
        scandir(item, options) {
            options = options || {};
            const args = {
                path: item.path,
                options: { shortcuts: options.shortcuts }
            };
            return new Promise((resolve, reject) => {
                this._request('scandir', args, options).then(result => {
                    return resolve(result.map(i => new FileMetadata(i)));
                }).catch(reject);
            });
        }
        read(item, options) {
            return this._request('get', { path: item.path }, options);
        }
        write(file, data, options) {
            options = options || {};
            options.meta = file;
            options.overwrite = true;
            options.onprogress = options.onprogress || function () {
            };
            const parentfile = new FileMetadata(FS.dirname(file.path), file.mime);
            return this._requestUpload(parentfile, data, options);
        }
        unlink(src) {
            return this._request('unlink', { path: src.path });
        }
        copy(src, dest, options) {
            return this._request('copy', {
                src: src.path,
                dest: dest.path
            }, options);
        }
        move(src, dest, options) {
            return this._request('move', {
                src: src.path,
                dest: dest.path
            }, options);
        }
        exists(item) {
            return this._request('exists', { path: item.path });
        }
        fileinfo(item) {
            return this._request('fileinfo', { path: item.path });
        }
        mkdir(dir) {
            return this._request('mkdir', { path: dir.path });
        }
        upload(dest, data, options) {
            return this._requestUpload(dest, data, options);
        }
        url(item, options) {
            if (typeof item === 'string') {
                item = new FileMetadata(item);
            }
            return Promise.resolve(Connection.instance.getVFSPath(item, options));
        }
        find(file, options) {
            return this._request('find', {
                path: file.path,
                args: options
            });
        }
        trash(file) {
            return Promise.reject(new Error(Locales._('ERR_VFS_UNAVAILABLE')));
        }
        untrash(file) {
            return Promise.reject(new Error(Locales._('ERR_VFS_UNAVAILABLE')));
        }
        emptyTrash() {
            return Promise.reject(new Error(Locales._('ERR_VFS_UNAVAILABLE')));
        }
        freeSpace(root) {
            return this._request('freeSpace', { root: root });
        }
    };
});