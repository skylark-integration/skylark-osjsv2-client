define([
    './settings-manager',
    './config',
    '../vfs/file',
    './package-manager',
    '../utils/fs',
    '../utils/compability',
    '../utils/dom'
], function (SettingsManager, Config, FileMetadata, PackageManager, FS, Compability, DOM) {
    'use strict';
    class Theme {
        constructor() {
            const compability = Compability.getCompability();
            this.settings = null;
            this.$themeScript = null;
            this.audioAvailable = !!compability.audio;
            this.oggAvailable = !!compability.audioTypes.ogg;
        }
        init(VFS) { // modified by lwf
            this.VFS = VFS;

            this.settings = SettingsManager.instance('__theme__', {
                enableSounds: true,
                styleTheme: 'default',
                soundTheme: 'default',
                iconTheme: 'default',
                sounds: {}
            });
        }
        update(settings, settheme) {
            this.settings.set(null, settings);
            if (settheme) {
                this.setTheme(settings);
            }
        }
        destroy() {
            this.$themeScript = DOM.$remove(this.$themeScript);
        }
        themeAction(action, args) {
            const theme = this.getStyleTheme();
            args = args || [];
            try {
                if (OSjs.Themes[theme]) {
                    return OSjs.Themes[theme][action].apply(null, args);
                }
            } catch (e) {
                console.warn(e);
            }
            return null;
        }
        _setBackground(settings) {
            const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
            const typeMap = {
                'image': 'normal',
                'image-center': 'center',
                'image-fill': 'fill',
                'image-strech': 'strech'
            };
            let className = 'color';
            let back = 'none';
            if (settings.wallpaper && settings.background.match(/^image/)) {
                back = settings.wallpaper;
                className = typeMap[settings.background] || 'default';
            }
            if (back !== 'none') {
                try {
                    this.VFS.url(back).then(result => {
                        back = "url('" + result + "')";
                        document.body.style.backgroundImage = back;
                        return true;
                    });
                } catch (e) {
                    console.warn(e);
                }
            } else {
                document.body.style.backgroundImage = back;
            }
            if (settings.backgroundColor) {
                document.body.style.backgroundColor = settings.backgroundColor;
            }
            if (settings.fontFamily) {
                document.body.style.fontFamily = settings.fontFamily;
            }
            if (isFirefox) {
                document.body.style.backgroundAttachment = 'fixed';
            } else {
                document.body.style.backgroundAttachment = 'scroll';
            }
            document.body.setAttribute('data-background-style', className);
        }
        getThemeCSS(name) {
            let root = Config.getConfig('Connection.RootURI', '/');
            if (name === null) {
                return root + 'blank.css';
            }
            root = Config.getConfig('Connection.ThemeURI');
            return root + '/' + name + '.css';
        }
        setTheme(settings) {
            this.themeAction('destroy');
            this.setThemeScript(this.getThemeResource('theme.js'));
            document.body.setAttribute('data-style-theme', settings.styleTheme);
            document.body.setAttribute('data-icon-theme', settings.iconTheme);
            document.body.setAttribute('data-sound-theme', settings.soundTheme);
            document.body.setAttribute('data-animations', String(settings.animations));
            this._setBackground(settings);
            this.settings.set(null, settings);
        }
        setThemeScript(src) {
            if (this.$themeScript) {
                this.$themeScript = DOM.$remove(this.$themeScript);
            }
            if (src) {
                this.$themeScript = DOM.$createJS(src, null, () => {
                    this.themeAction('init');
                });
            }
        }
        getStyleTheme(returnMetadata, convert) {
            const name = this.settings.get('styleTheme') || null;
            if (returnMetadata) {
                let found = null;
                if (name) {
                    this.getStyleThemes().forEach(function (t) {
                        if (t && t.name === name) {
                            found = t;
                        }
                    });
                }
                if (found && convert === true) {
                    const tmpEl = document.createElement('div');
                    tmpEl.style.visibility = 'hidden';
                    tmpEl.style.position = 'fixed';
                    tmpEl.style.top = '-10000px';
                    tmpEl.style.left = '-10000px';
                    tmpEl.style.width = '1em';
                    tmpEl.style.height = '1em';
                    document.body.appendChild(tmpEl);
                    const wd = tmpEl.offsetWidth;
                    tmpEl.parentNode.removeChild(tmpEl);
                    if (typeof found.style.window.margin === 'string' && found.style.window.margin.match(/em$/)) {
                        const marginf = parseFloat(found.style.window.margin);
                        found.style.window.margin = marginf * wd;
                    }
                    if (typeof found.style.window.border === 'string' && found.style.window.border.match(/em$/)) {
                        const borderf = parseFloat(found.style.window.border);
                        found.style.window.border = borderf * wd;
                    }
                }
                return found;
            }
            return name;
        }
        getThemeResource(name, type) {
            name = name || null;
            type = type || null;
            const root = Config.getConfig('Connection.ThemeURI');
            function getName(str, theme) {
                if (!str.match(/^\//)) {
                    if (type === 'base' || type === null) {
                        str = `${ root }/${ theme }/${ str }`;
                    } else {
                        str = `${ root }/${ theme }/${ type }/${ str }`;
                    }
                }
                return str;
            }
            if (name) {
                const theme = this.getStyleTheme();
                name = getName(name, theme);
            }
            return name;
        }
        getSound(name) {
            name = name || null;
            if (name && !name.match(/^(https?:)?\//)) {
                const theme = this.getSoundTheme();
                const root = Config.getConfig('Connection.SoundURI');
                const ext = this.oggAvailable ? 'oga' : 'mp3';
                name = `${ root }/${ theme }/${ name }.${ ext }`;
            }
            return name;
        }
        playSound(name, volume) {
            const filename = this.getSoundFilename(name);
            if (!filename) {
                console.debug('playSound()', 'Cannot play sound, no compability or not enabled!');
                return null;
            }
            if (typeof volume === 'undefined') {
                volume = 1;
            }
            const f = this.getSound(filename);
            console.debug('playSound()', name, filename, f, volume);
            const audio = new Audio(f);
            audio.volume = volume;
            try {
                audio.play();
            } catch (e) {
                console.error(e);
            }
            return audio;
        }
        getIcon(name, size) {
            name = name || '';
            size = size || '16x16';
            if (!name.match(/^(https:?)?\//)) {
                const root = Config.getConfig('Connection.IconURI');
                const theme = this.getIconTheme();
                name = `${ root }/${ theme }/${ size }/${ name }`;
            }
            return name;
        }
        getFileIcon(file, size, icon) {
            icon = icon || 'mimetypes/text-x-preview.png';
            if (typeof file === 'object' && !(file instanceof FileMetadata)) {
                file = new FileMetadata(file);
            }
            if (!file.filename) {
                throw new Error('Filename is required for getFileIcon()');
            }
            const map = [
                {
                    match: 'application/pdf',
                    icon: 'mimetypes/x-office-document.png'
                },
                {
                    match: 'application/zip',
                    icon: 'mimetypes/package-x-generic.png'
                },
                {
                    match: 'application/x-python',
                    icon: 'mimetypes/text-x-script.png'
                },
                {
                    match: 'application/x-lua',
                    icon: 'mimetypes/text-x-script.png'
                },
                {
                    match: 'application/javascript',
                    icon: 'mimetypes/text-x-script.png'
                },
                {
                    match: 'text/html',
                    icon: 'mimetypes/text-html.png'
                },
                {
                    match: 'text/xml',
                    icon: 'mimetypes/text-html.png'
                },
                {
                    match: 'text/css',
                    icon: 'mimetypes/text-x-script.png'
                },
                {
                    match: 'osjs/document',
                    icon: 'mimetypes/x-office-document.png'
                },
                {
                    match: 'osjs/draw',
                    icon: 'mimetypes/image-x-generic.png'
                },
                {
                    match: /^text\//,
                    icon: 'mimetypes/text-x-generic.png'
                },
                {
                    match: /^audio\//,
                    icon: 'mimetypes/audio-x-generic.png'
                },
                {
                    match: /^video\//,
                    icon: 'mimetypes/video-x-generic.png'
                },
                {
                    match: /^image\//,
                    icon: 'mimetypes/image-x-generic.png'
                },
                {
                    match: /^application\//,
                    icon: 'mimetypes/application-x-executable.png'
                }
            ];
            if (file.type === 'dir') {
                icon = 'places/folder.png';
            } else if (file.type === 'trash') {
                icon = 'places/user-trash.png';
            } else if (file.type === 'application') {
                const appname = FS.filename(file.path);
                const meta = PackageManager.getPackage(appname);
                if (meta) {
                    if (!meta.icon.match(/^((https?:)|\.)?\//)) {
                        return this.getIcon(meta.icon, size);
                    }
                    return PackageManager.getPackageResource(appname, meta.icon);
                }
            } else {
                const mime = file.mime || 'application/octet-stream';
                map.every(iter => {
                    let match = false;
                    if (typeof iter.match === 'string') {
                        match = mime === iter.match;
                    } else {
                        match = mime.match(iter.match);
                    }
                    if (match) {
                        icon = iter.icon;
                        return false;
                    }
                    return true;
                });
            }
            return this.getIcon(icon, size);
        }
        getIconTheme() {
            return this.settings.get('iconTheme', 'default');
        }
        getSoundTheme() {
            return this.settings.get('soundTheme', 'default');
        }
        getSoundFilename(k) {
            if (!this.audioAvailable || !this.settings.get('enableSounds') || !k) {
                return false;
            }
            const sounds = this.settings.get('sounds', {});
            return sounds[k] || null;
        }
        getStyleThemes() {
            return Config.getConfig('Styles', []);
        }
        getSoundThemes() {
            return Config.getConfig('Sounds', []);
        }
        getIconThemes() {
            return Config.getConfig('Icons', []);
        }
    }
    return new Theme();
});