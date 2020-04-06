define([
    './locales',
    './module-desktop',
    './module-input',
    './module-locale',
    './module-panel',
    './module-pm',
    './module-search',
    './module-sound',
    './module-store',
    './module-theme',
    './module-user',
    './module-users',
    './module-vfs',
    "./scheme.html"

], function (Translations, ModuleDesktop, ModuleInput, ModuleLocale, ModulePanel, ModulePM, ModuleSearch, ModuleSounds, ModuleStore, ModuleTheme, ModuleUser, ModuleUsers, ModuleVFS,schemeHtml) {
    'use strict';
    const Locales = OSjs.require('core/locales');
    const Dialog = OSjs.require('core/dialog');
    const Window = OSjs.require('core/window');
    const Events = OSjs.require('utils/events');
    const Theme = OSjs.require('core/theme');
    const Utils = OSjs.require('utils/misc');
    const Menu = OSjs.require('gui/menu');
    const SettingsManager = OSjs.require('core/settings-manager');
    const WindowManager = OSjs.require('core/window-manager');
    const Application = OSjs.require('core/application');
    const _ = Locales.createLocalizer(Translations);
    const DEFAULT_GROUP = 'misc';
    const _groups = {
        personal: { label: 'LBL_PERSONAL' },
        system: { label: 'LBL_SYSTEM' },
        user: { label: 'LBL_USER' },
        misc: { label: 'LBL_OTHER' }
    };
    const categoryMap = {
        'theme': 'Theme',
        'desktop': 'Desktop',
        'panel': 'Panel',
        'user': 'User',
        'fileview': 'VFS',
        'search': 'Search'
    };
    class SettingsItemDialog extends Dialog {
        constructor(app, metadata, scheme, callback) {
            super('ApplicationSettingsGenericsWindow', {
                icon: metadata.icon,
                title: metadata.name,
                width: 400,
                height: 300,
                translator: _
            });
            this.schemeRef = scheme;
            this.callback = callback;
            this.closed = false;
        }
        init(wm, app) {
            const root = super.init(...arguments);
            this.schemeRef.render(this, 'SettingsItemWindow');
            this._find('ButtonItemOK').on('click', () => {
                this.closed = true;
                const selected = this._find('List').get('selected');
                this.callback('ok', selected.length ? selected[0] : null);
                this._close();
            });
            this._find('ButtonItemCancel').on('click', () => this._close());
            return root;
        }
        _close() {
            if (!this.closed) {
                this.callback('cancel');
            }
            return super._close(...arguments);
        }
    }
    class ApplicationSettingsWindow extends Window {
        constructor(app, metadata, initialCategory) {
            super('ApplicationSettingsWindow', {
                icon: metadata.icon,
                title: metadata.name,
                width: 500,
                height: 450,
                allow_resize: true,
                translator: _
            }, app);
            this.initialCategory = initialCategory;
        }
        init(wmRef, app) {
            const root = super.init(...arguments);
            const wm = WindowManager.instance;
            this.scheme = this._render('SettingsWindow', schemeHtml);
            this._find('ButtonOK').son('click', this, this.onButtonOK);
            this._find('ButtonCancel').son('click', this, this.onButtonCancel);
            const container = document.createElement('div');
            container.className = 'ListView gui-generic-zebra-container gui-element';
            let containers = {};
            let tmpcontent = document.createDocumentFragment();
            Object.keys(_groups).forEach(function (k) {
                const c = document.createElement('ul');
                const h = document.createElement('span');
                const d = document.createElement('div');
                d.className = 'gui-generic-double-padded';
                h.appendChild(document.createTextNode(_(_groups[k].label)));
                containers[k] = c;
                d.appendChild(h);
                d.appendChild(c);
                container.appendChild(d);
            });
            app.modules.forEach(m => {
                if (typeof m.compatible === 'function') {
                    if (!m.compatible()) {
                        return;
                    }
                }
                if (containers[m.group]) {
                    const i = document.createElement('img');
                    i.setAttribute('src', Theme.getIcon(m.icon, '32x32'));
                    i.setAttribute('title', m.name);
                    const s = document.createElement('span');
                    s.appendChild(document.createTextNode(_(m.label || m.name)));
                    const c = document.createElement('li');
                    c.className = 'gui-generic-hoverable';
                    c.setAttribute('data-module', String(m.name));
                    c.appendChild(i);
                    c.appendChild(s);
                    containers[m.group].appendChild(c);
                    const found = root.querySelector('[data-module="' + m.name + '"]');
                    if (found) {
                        found.className = 'gui-generic-padded';
                    } else {
                        console.warn('Not found', m.name);
                    }
                    const settings = Utils.cloneObject(wm.getSettings());
                    try {
                        m.render(this, this.scheme, tmpcontent, settings, wm);
                    } catch (e) {
                        console.warn(e, e.stack);
                    }
                    try {
                        m.update(this, this.scheme, settings, wm);
                    } catch (e) {
                        console.warn(e, e.stack);
                    }
                    m._inited = true;
                }
            });
            Object.keys(containers).forEach(k => {
                if (!containers[k].children.length) {
                    containers[k].parentNode.style.display = 'none';
                }
            });
            Events.$bind(container, 'click', ev => {
                const t = ev.isTrusted ? ev.target : ev.relatedTarget || ev.target;
                Menu.blur();
                if (t && t.tagName === 'LI' && t.hasAttribute('data-module')) {
                    ev.preventDefault();
                    const m = t.getAttribute('data-module');
                    this.onModuleSelect(m);
                }
            }, true);
            root.querySelector('[data-id="ContainerSelection"]').appendChild(container);
            containers = {};
            tmpcontent = null;
            if (this.initialCategory) {
                this.onExternalAttention(this.initialCategory);
            }
            return root;
        }
        destroy() {
            if (super.destroy(...arguments)) {
                this.currentModule = null;
                return true;
            }
            return false;
        }
        onModuleSelect(name) {
            const wm = WindowManager.instance;
            const root = this._$element;
            function _d(d) {
                root.querySelector('[data-id="ContainerSelection"]').style.display = d ? 'block' : 'none';
                root.querySelector('[data-id="ContainerContent"]').style.display = d ? 'none' : 'block';
                root.querySelector('[data-id="ContainerButtons"]').style.display = d ? 'none' : 'block';
            }
            root.querySelectorAll('div[data-module]').forEach(function (mod) {
                mod.style.display = 'none';
            });
            _d(true);
            this._setTitle(null);
            let found, settings;
            if (name) {
                this._app.modules.forEach(function (m) {
                    if (!found && m.name === name) {
                        found = m;
                    }
                });
            }
            if (found) {
                const mod = root.querySelector('div[data-module="' + found.name + '"]');
                if (mod) {
                    mod.style.display = 'block';
                    settings = Utils.cloneObject(wm.getSettings());
                    try {
                        found.update(this, this.scheme, settings, wm, true);
                    } catch (e) {
                        console.warn(e, e.stack);
                    }
                    _d(false);
                    this._setTitle(_(found.name), true);
                    if (found.button === false) {
                        this._find('ButtonOK').hide();
                    } else {
                        this._find('ButtonOK').show();
                    }
                }
            } else {
                if (!name) {
                    settings = Utils.cloneObject(wm.getSettings());
                    this._app.modules.forEach(m => {
                        try {
                            if (m._inited) {
                                m.update(this, this.scheme, settings, wm);
                            }
                        } catch (e) {
                            console.warn(e, e.stack);
                        }
                    });
                }
            }
            this._app.setModule(found);
        }
        onButtonOK() {
            const settings = {};
            const wm = WindowManager.instance;
            this._app.modules.forEach(m => {
                if (m._inited) {
                    const res = m.save(this, this.scheme, settings, wm);
                    if (typeof res === 'function') {
                        res();
                    }
                }
            });
            this._toggleLoading(true);
            this._app.saveSettings(settings, () => {
                this._toggleLoading(false);
            });
        }
        onButtonCancel() {
            this.onModuleSelect(null);
        }
        onExternalAttention(cat) {
            this.onModuleSelect(categoryMap[cat] || cat);
            this._focus();
        }
    }
    class ApplicationSettings extends Application {
        constructor(args, metadata) {
            super('ApplicationSettings', args, metadata);
            const registered = OSjs.Applications.ApplicationSettings.Modules;
            this.watches = {};
            this.currentModule = null;
            this.modules = Object.keys(registered).map(function (name) {
                const opts = Utils.argumentDefaults(registered[name], {
                    _inited: false,
                    name: name,
                    group: DEFAULT_GROUP,
                    icon: 'status/error.png',
                    init: function () {
                    },
                    update: function () {
                    },
                    render: function () {
                    },
                    save: function () {
                    }
                });
                if (Object.keys(_groups).indexOf(opts.group) === -1) {
                    opts.group = DEFAULT_GROUP;
                }
                Object.keys(opts).forEach(function (k) {
                    if (typeof opts[k] === 'function') {
                        opts[k] = opts[k].bind(opts);
                    }
                });
                return opts;
            });
            this.modules.forEach(m => {
                m.init(this);
                if (m.watch && m.watch instanceof Array) {
                    m.watch.forEach(w => {
                        this.watches[m.name] = SettingsManager.watch(w, () => {
                            const win = this._getMainWindow();
                            if (m && win) {
                                if (this.currentModule && this.currentModule.name === m.name) {
                                    win.onModuleSelect(m.name);
                                }
                            }
                        });
                    });
                }
            });
        }
        destroy() {
            if (super.destroy(...arguments)) {
                Object.keys(this.watches).forEach(k => {
                    SettingsManager.unwatch(this.watches[k]);
                });
                this.watches = {};
                return true;
            }
            return false;
        }
        init(settings, metadata) {
            super.init(...arguments);
            const category = this._getArgument('category') || settings.category;
            const win = this._addWindow(new ApplicationSettingsWindow(this, metadata, category));
            this._on('attention', function (args) {
                if (win && args.category) {
                    win.onExternalAttention(args.category);
                }
            });
        }
        saveSettings(settings, cb) {
            const wm = WindowManager.instance;
            wm.applySettings(settings, false, 1);
            SettingsManager.save().then(res => cb(false, res)).catch(cb);
        }
        setModule(m) {
            this.currentModule = m;
        }
        static get SettingsItemDialog() {
            return SettingsItemDialog;
        }
        static get Modules() {
            return {
                Desktop: ModuleDesktop,
                Input: ModuleInput,
                Locale: ModuleLocale,
                Panel: ModulePanel,
                PM: ModulePM,
                Search: ModuleSearch,
                Sounds: ModuleSounds,
                Store: ModuleStore,
                Theme: ModuleTheme,
                User: ModuleUser,
                Users: ModuleUsers,
                VFS: ModuleVFS
            };
        }
    }
    OSjs.Applications.ApplicationSettings = Object.seal(ApplicationSettings);
});