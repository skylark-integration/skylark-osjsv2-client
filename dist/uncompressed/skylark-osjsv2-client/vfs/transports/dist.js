define([
    './osjs',
    '../../core/mount-manager',
    '../../core/config',
    '../../core/locales'
], function ( OSjsTransport, MountManager, Config, Locales) {
    'use strict';
    return class DistTransport extends OSjsTransport {
        request(method, args, options) {
            if ([
                    'url',
                    'scandir',
                    'read'
                ].indexOf(method) === -1) {
                return Promise.reject(new Error(Locales._('ERR_VFS_UNAVAILABLE')));
            }
            return super.request(...arguments);
        }
        url(item) {
            const root = Config.getBrowserPath();
            const module = MountManager.getModuleFromPath(item.path);
            const url = item.path.replace(module.option('match'), root).replace(/^\/+/, '/');
            return Promise.resolve(url);
        }
    };
});