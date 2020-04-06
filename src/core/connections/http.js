define([
    '../../vfs/fs',
    '../../vfs/file',
    '../connection'
], function (VFS, FileMetadata, Connection) {
    'use strict';
    return class HttpConnection extends Connection {
        onVFSRequestCompleted(module, method, args, result, appRef) {
            if ([
                    'upload',
                    'write',
                    'mkdir',
                    'copy',
                    'move',
                    'unlink'
                ].indexOf(method) !== -1) {
                const arg = method === 'move' ? {
                    source: args[0] instanceof FileMetadata ? args[0] : null,
                    destination: args[1] instanceof FileMetadata ? args[1] : null
                } : args[method === 'copy' ? 1 : 0];
                VFS.triggerWatch(method, arg, appRef);
            }
            return super.onVFSRequestCompleted(...arguments);
        }
    };
});