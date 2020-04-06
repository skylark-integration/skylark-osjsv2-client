define([
    './http'
], function (HttpConnection) {
    'use strict';
    return class StandaloneConnection extends HttpConnection {
        createRequest(method, args, options) {
            if (method === 'packages') {
                return Promise.resolve({ result: OSjs.getManifest() });
            }
            return Promise.reject(new Error('You are currently running locally and cannot perform this operation!'));
        }
    };
});