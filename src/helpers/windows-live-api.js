define([
    '../core/mount-manager',
    './service-notification-icon',
    '../utils/preloader',
    '../core/locales',
    '../core/config'
], function (MountManager, ServiceNotificationIcon, Preloader, a, b) {
    'use strict';
    const redirectURI = window.location.href.replace(/\/$/, '') + '/windows-live-oauth.html';
    let SingletonInstance = null;
    class WindowsLiveAPI {
        constructor(clientId) {
            this.hasSession = false;
            this.clientId = clientId;
            this.loaded = false;
            this.inited = false;
            this.accessToken = null;
            this.lastScope = null;
            this.preloads = [{
                    type: 'javascript',
                    src: '//js.live.net/v5.0/wl.js'
                }];
        }
        destroy() {
        }
        init(callback) {
            callback = callback || function () {
            };
            if (this.loaded) {
                callback(false, true);
            } else {
                Preloader.preload(this.preloads).then(result => {
                    if (!result.failed.length) {
                        this.loaded = true;
                    }
                    callback(result.failed.join('\n'));
                }).catch(() => callback());
            }
        }
        load(scope, callback) {
            console.debug('WindowsLiveAPI::load()', scope);
            let WL = window.WL || {};
            const _login = () => {
                const lastScope = (this.lastScope || []).sort();
                const currScope = (scope || []).sort();
                if (this.hasSession && lastScope.toString() === currScope.toString()) {
                    callback(false, true);
                    return;
                }
                this.login(scope, (error, response) => {
                    if (error) {
                        callback(error);
                        return;
                    }
                    setTimeout(() => {
                        callback(false, true);
                    }, 10);
                });
            };
            this.init(error => {
                if (error) {
                    callback(error);
                    return;
                }
                if (!window.WL) {
                    callback(a._('WLAPI_LOAD_FAILURE'));
                    return;
                }
                WL = window.WL || {};
                if (this.inited) {
                    _login();
                } else {
                    this.inited = true;
                    WL.Event.subscribe('auth.login', (a, b, c, d) => {
                        this.onLogin(a, b, c, d);
                    });
                    WL.Event.subscribe('auth.logout', (a, b, c, d) => {
                        this.onLogout(a, b, c, d);
                    });
                    WL.Event.subscribe('wl.log', (a, b, c, d) => {
                        this.onLog(a, b, c, d);
                    });
                    WL.Event.subscribe('auth.sessionChange', (a, b, c, d) => {
                        this.onSessionChange(a, b, c, d);
                    });
                    WL.init({
                        client_id: this.clientId,
                        display: 'popup',
                        redirect_uri: redirectURI
                    }).then(result => {
                        console.debug('WindowsLiveAPI::load()', '=>', result);
                        if (result.session) {
                            this.accessToken = result.session.access_token || null;
                        }
                        if (result.status === 'connected') {
                            callback(false, true);
                        } else if (result.status === 'success') {
                            _login();
                        } else {
                            callback(a._('WLAPI_INIT_FAILED_FMT', result.status.toString()));
                        }
                    }, result => {
                        console.error('WindowsLiveAPI::load()', 'init() error', result);
                        callback(result.error_description);
                    });
                }
            });
        }
        _removeRing() {
            ServiceNotificationIcon.remove('Windows Live API');
        }
        logout(callback) {
            callback = callback || function () {
            };
            const WL = window.WL || {};
            if (this.hasSession) {
                callback(false, false);
            }
            WL.Event.unsubscribe('auth.logout');
            WL.Event.subscribe('auth.logout', () => {
                this._removeRing();
                WL.Event.unsubscribe('auth.logout');
                callback(false, true);
            });
            WL.logout();
            MountManager.remove('OneDrive');
        }
        login(scope, callback) {
            const WL = window.WL || {};
            if (this.hasSession) {
                callback(false, true);
                return;
            }
            WL.login({
                scope: scope,
                redirect_uri: redirectURI
            }).then(result => {
                if (result.status === 'connected') {
                    callback(false, true);
                } else {
                    callback(a._('WLAPI_LOGIN_FAILED'));
                }
            }, result => {
                callback(a._('WLAPI_LOGIN_FAILED_FMT', result.error_description));
            });
        }
        onSessionChange() {
            console.warn('WindowsLiveAPI::onSessionChange()', arguments);
            const WL = window.WL || {};
            const session = WL.getSession();
            if (session) {
                this.hasSession = true;
            } else {
                this.hasSession = false;
            }
        }
        onLogin() {
            console.warn('WindowsLiveAPI::onLogin()', arguments);
            this.hasSession = true;
            ServiceNotificationIcon.add('Windows Live API', [{
                    title: a._('WLAPI_SIGN_OUT'),
                    onClick: () => {
                        this.logout();
                    }
                }]);
        }
        onLogout() {
            console.warn('WindowsLiveAPI::onLogout()', arguments);
            this.hasSession = false;
            this._removeRing();
        }
        onLog() {
            console.debug('WindowsLiveAPI::onLog()', arguments);
        }
    }
    function instance() {
        return SingletonInstance;
    }
    function create(args, callback) {
        args = args || {};
        function _run() {
            const scope = args.scope;
            SingletonInstance.load(scope, error => {
                callback(error ? error : false, SingletonInstance);
            });
        }
        if (SingletonInstance) {
            _run();
            return;
        }
        let clientId = null;
        try {
            clientId = b.getConfig('WindowsLiveAPI.ClientId');
        } catch (e) {
            console.warn('getWindowsLiveAPI()', e, e.stack);
        }
        if (!clientId) {
            callback(a._('WLAPI_DISABLED'));
            return;
        }
        SingletonInstance = new WindowsLiveAPI(clientId);
        _run();
    }
    return {
        instance: instance,
        create: create
    };
});