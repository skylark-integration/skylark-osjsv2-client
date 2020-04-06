define([
    './locales',
    './config',
    './connection',
    './settings-manager',
    './package-manager'
], function ( a, b, Connection, SettingsManager, PackageManager) {
    'use strict';
    let _instance;
    return class Authenticator {
        static get instance() {
            return _instance;
        }
        constructor() {
            _instance = this;
            this.userData = {
                id: 0,
                username: 'root',
                name: 'root user',
                groups: ['admin']
            };
            this.loggedIn = false;
            this.isStandalone = false;
        }
        init() {
            return this.createUI();
        }
        destroy() {
            _instance = null;
        }
        getUser() {
            return Object.assign({}, this.userData);
        }
        isLoggedIn() {
            return this.isLoggedIn;
        }
        login(data) {
            return new Promise((resolve, reject) => {
                Connection.request('login', data).then(result => {
                    return resolve(result ? result : a._('ERR_LOGIN_INVALID'));
                }).catch(error => {
                    reject(new Error(a._('ERR_LOGIN_FMT', error)));
                });
            });
        }
        logout() {
            return new Promise((resolve, reject) => {
                Connection.request('logout', {}).then(result => {
                    return resolve(!!result);
                }).catch(err => {
                    reject(new Error('An error occured: ' + err));
                });
            });
        }
        checkPermission(group) {
            const user = this.getUser();
            const userGroups = user.groups || [];
            if (!(group instanceof Array)) {
                group = [group];
            }
            if (userGroups.indexOf('admin') === -1) {
                return !!group.every(g => userGroups.indexOf(g) >= 0);
            }
            return true;
        }
        requestLogin(data) {
            return new Promise((resolve, reject) => {
                this.login(data).then(res => {
                    return this.onLogin(res).then(resolve).catch(reject);
                }).catch(reject);
            });
        }
        onLogin(data) {
            let userSettings = data.userSettings;
            if (!userSettings || userSettings instanceof Array) {
                userSettings = {};
            }
            this.userData = data.userData;
            function getLocale() {
                let curLocale = b.getConfig('Locale');
                let detectedLocale = b.getUserLocale();
                if (b.getConfig('LocaleOptions.AutoDetect', true) && detectedLocale) {
                    console.info('Auto-detected user locale via browser', detectedLocale);
                    curLocale = detectedLocale;
                }
                let result = SettingsManager.get('CoreWM');
                if (!result) {
                    try {
                        result = userSettings.CoreWM;
                    } catch (e) {
                    }
                }
                return result ? result.language || curLocale : curLocale;
            }
            document.getElementById('LoadingScreen').style.display = 'block';
            a.setLocale(getLocale());
            SettingsManager.init(userSettings);
            if (data.blacklistedPackages) {
                PackageManager.setBlacklist(data.blacklistedPackages);
            }
            this.loggedIn = true;
            return Promise.resolve(true);
        }
        createUI() {
            this._renderUI();
            return this._createUI();
        }
        _renderUI(html) {
            if (!html) {
                html = require('osjs-scheme-loader!login.html');
            }
            const tempNode = document.createElement('div');
            tempNode.innerHTML = html;
            tempNode.childNodes.forEach(n => {
                const nn = n.cloneNode(true);
                if ([
                        'STYLE',
                        'SCRIPT'
                    ].indexOf(n.tagName) === -1) {
                    document.body.appendChild(nn);
                } else {
                    document.querySelector('head').appendChild(nn);
                }
            });
        }
        _createUI() {
            const container = document.getElementById('Login');
            const login = document.getElementById('LoginForm');
            const u = document.getElementById('LoginUsername');
            const p = document.getElementById('LoginPassword');
            const s = document.getElementById('LoginSubmit');
            function _restore() {
                s.removeAttribute('disabled');
                u.removeAttribute('disabled');
                p.removeAttribute('disabled');
            }
            function _lock() {
                s.setAttribute('disabled', 'disabled');
                u.setAttribute('disabled', 'disabled');
                p.setAttribute('disabled', 'disabled');
            }
            container.style.display = 'block';
            _restore();
            return new Promise((resolve, reject) => {
                login.onsubmit = ev => {
                    _lock();
                    if (ev) {
                        ev.preventDefault();
                    }
                    this.requestLogin({
                        username: u.value,
                        password: p.value
                    }).then(() => {
                        container.parentNode.removeChild(container);
                        return resolve();
                    }).catch(err => {
                        alert(err);
                        _restore();
                    });
                };
            });
        }
    };
});