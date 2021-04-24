define([
    '../../core/package-manager',
    '../transport',
    '../file',
    '../../core/locales'
], function ( PackageManager, Transport, FileMetadata, Locales) {
    'use strict';
    return class ApplicationTransport extends Transport {
        request(method, args, options) {
            if (['scandir'].indexOf(method) === -1) {
                return Promise.reject(new Error(Locales._('ERR_VFS_UNAVAILABLE')));
            }
            return super.request(...arguments);
        }
        scandir() {
            const metadata = PackageManager.getPackages(); 
            const files = [];
            Object.keys(metadata).forEach(m => {
                const iter = metadata[m];
                if (iter.type !== 'extension') {
                    files.push(new FileMetadata({
                        filename: iter.name,
                        type: 'application',
                        path: 'applications:///' + m,
                        mime: 'osjs/application'
                    }, 'osjs/application'));
                }
            });
            return Promise.resolve(files);
        }
        url(item) {
            return Promise.resolve(item.path);
        }
    };
});