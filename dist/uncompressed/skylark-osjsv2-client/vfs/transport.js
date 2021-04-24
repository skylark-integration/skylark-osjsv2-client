define([
    'skylark-axios',
    '../core/locales'
], function (axios, Locales) {
    'use strict';
    return class Transport {
        request(method, args, options, mount) {
            const readOnly = [
                'upload',
                'unlink',
                'write',
                'mkdir',
                'move',
                'trash',
                'untrash',
                'emptyTrash'
            ];
            if (mount.isReadOnly()) {
                if (readOnly.indexOf(method) !== -1) {
                    return Promise.reject(new Error(Locales._('ERR_VFSMODULE_READONLY')));
                }
            }
            const newArgs = args.concat([
                options,
                mount
            ]);
            return this[method](...newArgs);
        }
        scandir(item, options, mount) {
            return Promise.reject(new Error(Locales._('ERR_VFS_UNAVAILABLE')));
        }
        read(item, options, mount) {
            return Promise.reject(new Error(Locales._('ERR_VFS_UNAVAILABLE')));
        }
        write(file, data, options, mount) {
            return Promise.reject(new Error(Locales._('ERR_VFS_UNAVAILABLE')));
        }
        unlink(src, options, mount) {
            return Promise.reject(new Error(Locales._('ERR_VFS_UNAVAILABLE')));
        }
        copy(src, dest, options, mount) {
            return Promise.reject(new Error(Locales._('ERR_VFS_UNAVAILABLE')));
        }
        move(src, dest, options, mount) {
            return Promise.reject(new Error(Locales._('ERR_VFS_UNAVAILABLE')));
        }
        exists(item, options, mount) {
            return Promise.reject(new Error(Locales._('ERR_VFS_UNAVAILABLE')));
        }
        fileinfo(item, options, mount) {
            return Promise.reject(new Error(Locales._('ERR_VFS_UNAVAILABLE')));
        }
        mkdir(dir, options, mount) {
            return Promise.reject(new Error(Locales._('ERR_VFS_UNAVAILABLE')));
        }
        upload(file, dest, options, mount) {
            return Promise.reject(new Error(Locales._('ERR_VFS_UNAVAILABLE')));
        }
        download(item, options, mount) {
            return new Promise((resolve, reject) => {
                this.url(item).then(url => {
                    return axios({
                        responseType: 'arraybuffer',
                        url: url,
                        method: 'GET'
                    }).then(result => {
                        return resolve(result.data);
                    }).catch(error => {
                        reject(error.message);
                    });
                }).catch(reject);
            });
        }
        url(item, options, mount) {
            return Promise.reject(new Error(Locales._('ERR_VFS_UNAVAILABLE')));
        }
        find(file, options, mount) {
            return Promise.reject(new Error(Locales._('ERR_VFS_UNAVAILABLE')));
        }
        trash(file, options, mount) {
            return Promise.reject(new Error(Locales._('ERR_VFS_UNAVAILABLE')));
        }
        untrash(file, options, mount) {
            return Promise.reject(new Error(Locales._('ERR_VFS_UNAVAILABLE')));
        }
        emptyTrash(options, mount) {
            return Promise.reject(new Error(Locales._('ERR_VFS_UNAVAILABLE')));
        }
        freeSpace(root, options, mount) {
            return Promise.reject(new Error(Locales._('ERR_VFS_UNAVAILABLE')));
        }
    };
});