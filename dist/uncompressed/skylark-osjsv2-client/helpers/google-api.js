define([
    '../core/mount-manager',
    './service-notification-icon',
    '../utils/preloader',
    '../core/locales',
    '../core/config',
    './then-jsonp'
], function (MountManager, ServiceNotificationIcon, Preloader, Locales, b, jsonp) {
    'use strict';
    const gapi = window.gapi = window.gapi || {};
    let SingletonInstance = null;
    class GoogleAPI {
        constructor(clientId) {
            this.clientId = clientId;
            this.accessToken = null;
            this.userId = null;
            this.preloaded = false;
            this.authenticated = false;
            this.loaded = [];
            this.preloads = [{
                    type: 'javascript',
                    src: 'https://apis.google.com/js/api.js'
                }];
        }
        destroy() {
        }
        init(callback) {
            callback = callback || function () {
            };
            if (this.preloaded) {
                callback(false, true);
            } else {
                Preloader.preload(this.preloads).then(result => {
                    if (result.failed.length) {
                        this.preloaded = true;
                    }
                    callback(result.failed.join('\n'));
                }).catch(callback);
            }
        }
        load(load, scope, client, callback) {
            const auth = cb => {
                this.authenticate(scope, (error, result) => {
                    if (error) {
                        cb(error);
                    } else {
                        if (!this.authenticated) {
                            cb(Locales._('GAPI_AUTH_FAILURE'));
                            return;
                        }
                        cb(false, result);
                    }
                });
            };
            const loadAll = finished => {
                const lload = [];
                load.forEach(i => {
                    if (this.loaded.indexOf(i) === -1) {
                        lload.push(i);
                    }
                });
                let current = 0;
                let total = lload.length;
                console.debug('GoogleAPI::load()', load, '=>', lload, scope);
                const _load = (iter, cb) => {
                    let args = [];
                    let name = null;
                    if (iter instanceof Array) {
                        if (iter.length > 0 && iter.length < 3) {
                            args = args.concat(iter);
                            name = iter[0];
                        }
                    } else {
                        args.push(iter);
                        name = iter;
                    }
                    args.push((a, b, c, d) => {
                        this.loaded.push(name);
                        cb.call(this, a, b, c, d);
                    });
                    if (client) {
                        gapi.client.load.apply(gapi, args);
                    } else {
                        gapi.load.apply(gapi, args);
                    }
                };
                function _next() {
                    if (current >= total) {
                        finished();
                    } else {
                        _load(lload[current], () => {
                            _next();
                        });
                        current++;
                    }
                }
                _next();
            };
            this.init(error => {
                if (error) {
                    callback(error);
                    return;
                }
                if (!window.gapi || !gapi.load) {
                    callback(Locales._('GAPI_LOAD_FAILURE'));
                    return;
                }
                auth(error => {
                    if (error) {
                        callback(error);
                        return;
                    }
                    loadAll((error, result) => {
                        callback(error, result, SingletonInstance);
                    });
                });
            });
        }
        signOut(cb) {
            cb = cb || function () {
            };
            console.info('GoogleAPI::signOut()');
            if (this.authenticated) {
                try {
                    gapi.auth.signOut();
                } catch (e) {
                    console.warn('GoogleAPI::signOut()', 'failed', e);
                    console.warn(e.stack);
                }
                this.authenticated = false;
                ServiceNotificationIcon.remove('Google API');
            }
            MountManager.remove('GoogleDrive');
            cb(false, true);
        }
        revoke(callback) {
            console.info('GoogleAPI::revoke()');
            if (!this.accessToken) {
                callback(false);
                return;
            }
            const url = 'https://accounts.google.com/o/oauth2/revoke?token=' + this.accessToken;
            jsonp('GET', url).then(() => callback(true)).catch(() => callback(false));
        }
        authenticate(scope, callback) {
            console.info('GoogleAPI::authenticate()');
            callback = callback || function () {
            };
            const getUserId = cb => {
                cb = cb || function () {
                };
                gapi.client.load('oauth2', 'v2', () => {
                    gapi.client.oauth2.userinfo.get().execute(resp => {
                        console.info('GoogleAPI::authenticate() => getUserId()', resp);
                        cb(resp.id);
                    });
                });
            };
            const login = (immediate, cb) => {
                console.info('GoogleAPI::authenticate() => login()', immediate);
                cb = cb || function () {
                };
                gapi.auth.authorize({
                    client_id: this.clientId,
                    scope: scope,
                    user_id: this.userId,
                    immediate: immediate
                }, cb);
            };
            const createRingNotification = () => {
                ServiceNotificationIcon.remove('Google API');
                ServiceNotificationIcon.add('Google API', [
                    {
                        title: Locales._('GAPI_SIGN_OUT'),
                        onClick: () => {
                            this.signOut();
                        }
                    },
                    {
                        title: Locales._('GAPI_REVOKE'),
                        onClick: () => {
                            this.revoke(() => {
                                this.signOut();
                            });
                        }
                    }
                ]);
            };
            const handleAuthResult = (authResult, immediate) => {
                console.info('GoogleAPI::authenticate() => handleAuthResult()', authResult);
                if (authResult.error) {
                    if (authResult.error_subtype === 'origin_mismatch' || authResult.error_subtype === 'access_denied' && !immediate) {
                        const msg = Locales._('GAPI_AUTH_FAILURE_FMT', authResult.error, authResult.error_subtype);
                        callback(msg);
                        return;
                    }
                }
                if (authResult && !authResult.error) {
                    getUserId(id => {
                        this.userId = id;
                        if (id) {
                            createRingNotification();
                            this.authenticated = true;
                            this.accessToken = authResult.access_token || null;
                            callback(false, true);
                        } else {
                            callback(false, false);
                        }
                    });
                } else {
                    login(false, res => {
                        handleAuthResult(res, false);
                    });
                }
            };
            gapi.load('auth:client', result => {
                if (result && result.error) {
                    const msg = Locales._('GAPI_AUTH_FAILURE_FMT', result.error, result.error_subtype);
                    callback(msg);
                    return;
                }
                login(true, res => {
                    handleAuthResult(res, true);
                });
            });
        }
    }
    function instance() {
        return SingletonInstance;
    }
    function create(args, callback) {
        const load = args.load || [];
        const scope = args.scope || [];
        const client = args.client === true;
        function _run() {
            SingletonInstance.load(load, scope, client, callback);
        }
        if (SingletonInstance) {
            _run();
            return;
        }
        let clientId = null;
        try {
            clientId = b.getConfig('GoogleAPI.ClientId');
        } catch (e) {
            console.warn('getGoogleAPI()', e, e.stack);
        }
        if (!clientId) {
            callback(Locales._('GAPI_DISABLED'));
            return;
        }
        SingletonInstance = new GoogleAPI(clientId);
        _run();
    }
    return {
        instance: instance,
        create: create
    };
});