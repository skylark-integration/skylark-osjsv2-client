define([
    './locales',
    "./scheme.html"
], function (Translations,schemeHtml) {
    'use strict';
    const VFS = OSjs.require('vfs/fs');
    const Config = OSjs.require('core/config');
    const Dialog = OSjs.require('core/dialog');
    const GUIElement = OSjs.require('gui/element');
    const Utils = OSjs.require('utils/misc');
    const Locales = OSjs.require('core/locales');
    const DefaultApplication = OSjs.require('helpers/default-application');
    const DefaultApplicationWindow = OSjs.require('helpers/default-application-window');
    const _ = Locales.createLocalizer(Translations);
    class ApplicationWriterWindow extends DefaultApplicationWindow {
        constructor(app, metadata, file) {
            const config = Config.getConfig();
            super('ApplicationWriterWindow', {
                allow_drop: true,
                icon: metadata.icon,
                title: metadata.name,
                width: 550,
                height: 400,
                translator: _
            }, app, file);
            this.checkChangeLength = -1;
            this.checkChangeInterval = null;
            this.color = {
                background: '#ffffff',
                foreground: '#000000'
            };
            this.font = {
                name: config.Fonts['default'],
                size: 3
            };
        }
        destroy() {
            this.checkChangeInterval = clearInterval(this.checkChangeInterval);
            super.destroy(...arguments);
        }
        init(wmRef, app) {
            const root = super.init(...arguments);
            var self = this;
            this._render('WriterWindow', schemeHtml);
            var text = this._find('Text');
            var buttons = {
                'text-bold': { command: 'bold' },
                'text-italic': { command: 'italic' },
                'text-underline': { command: 'underline' },
                'text-strikethrough': { command: 'strikeThrough' },
                'justify-left': { command: 'justifyLeft' },
                'justify-center': { command: 'justifyCenter' },
                'justify-right': { command: 'justifyRight' },
                'indent': { command: 'indent' },
                'unindent': { command: 'outdent' }
            };
            var menuEntries = {
                'MenuUndo': function () {
                    text.command('undo', false);
                },
                'MenuRedo': function () {
                    text.command('redo', false);
                },
                'MenuCopy': function () {
                    text.command('copy', false);
                },
                'MenuCut': function () {
                    text.command('cut', false);
                },
                'MenuDelete': function () {
                    text.command('delete', false);
                },
                'MenuPaste': function () {
                    text.command('paste', false);
                },
                'MenuUnlink': function () {
                    text.command('unlink', false);
                },
                'MenuInsertOL': function () {
                    text.command('insertOrderedList', false);
                },
                'MenuInsertUL': function () {
                    text.command('insertUnorderedList', false);
                },
                'MenuInsertImage': function () {
                    Dialog.create('File', { filter: ['^image'] }, function (ev, button, result) {
                        if (button !== 'ok' || !result) {
                            return;
                        }
                        VFS.url(result).then(url => {
                            text.command('insertImage', false, url);
                        });
                    }, self);
                },
                'MenuInsertLink': function () {
                    Dialog.create('Input', {
                        message: _('Insert URL'),
                        placeholder: 'https://os-js.org'
                    }, function (ev, button, result) {
                        if (button !== 'ok' || !result) {
                            return;
                        }
                        text.command('createLink', false, result);
                    }, self);
                }
            };
            function menuEvent(ev) {
                if (menuEntries[ev.detail.id]) {
                    menuEntries[ev.detail.id]();
                }
            }
            this._find('SubmenuEdit').on('select', menuEvent);
            this._find('SubmenuInsert').on('select', menuEvent);
            function getSelectionStyle() {
                function _call(cmd) {
                    return text.query(cmd);
                }
                var style = {
                    fontName: (_call('fontName') || '').split(',')[0].replace(/^'/, '').replace(/'$/, ''),
                    fontSize: parseInt(_call('fontSize'), 10) || self.font.size,
                    foreColor: _call('foreColor'),
                    hiliteColor: _call('hiliteColor')
                };
                Object.keys(buttons).forEach(function (b) {
                    var button = buttons[b];
                    style[button.command] = {
                        button: b,
                        value: _call(button.command)
                    };
                });
                return style;
            }
            function createColorDialog(current, cb) {
                self._toggleDisabled(true);
                Dialog.create('Color', { color: current }, function (ev, button, result) {
                    self._toggleDisabled(false);
                    if (button === 'ok' && result) {
                        cb(result.hex);
                    }
                }, self);
            }
            function createFontDialog(current, cb) {
                self._toggleDisabled(true);
                Dialog.create('Font', {
                    fontSize: self.font.size,
                    fontName: self.font.name,
                    minSize: 1,
                    maxSize: 8,
                    unit: 'null'
                }, function (ev, button, result) {
                    self._toggleDisabled(false);
                    if (button === 'ok' && result) {
                        cb(result);
                    }
                }, self);
            }
            var back = this._find('Background').on('click', function () {
                createColorDialog(self.color.background, function (hex) {
                    text.command('hiliteColor', false, hex);
                    self.color.background = hex;
                    back.set('value', hex);
                });
            });
            var front = this._find('Foreground').on('click', function () {
                createColorDialog(self.color.foreground, function (hex) {
                    text.command('foreColor', false, hex);
                    self.color.foreground = hex;
                    front.set('value', hex);
                });
            });
            var font = this._find('Font').on('click', function () {
                createFontDialog(null, function (font) {
                    text.command('fontName', false, font.fontName);
                    text.command('fontSize', false, font.fontSize);
                    self.font.name = font.fontName;
                    self.font.size = font.fontSize;
                });
            });
            root.querySelectorAll('gui-toolbar > gui-button').forEach(function (b) {
                var id = b.getAttribute('data-id');
                var button = buttons[id];
                if (button) {
                    GUIElement.createFromNode(b).on('click', function () {
                        text.command(button.command);
                    }).on('mousedown', function (ev) {
                        ev.preventDefault();
                    });
                }
            });
            function updateToolbar(style) {
                back.set('value', style.hiliteColor);
                front.set('value', style.foreColor);
                if (style.fontName) {
                    font.set('label', Utils.format('{0} ({1})', style.fontName, style.fontSize.toString()));
                }
            }
            function updateSelection() {
                var style = getSelectionStyle();
                updateToolbar(style);
            }
            back.set('value', this.color.background);
            front.set('value', this.color.foreground);
            font.set('label', Utils.format('{0} ({1})', this.font.name, this.font.size.toString()));
            text.on('selection', function () {
                updateSelection();
            });
            this.checkChangeInterval = setInterval(function () {
                if (self.hasChanged) {
                    return;
                }
                if (self.checkChangeLength < 0) {
                    self.checkChangeLength = text.get('value').length;
                }
                var len = text.get('value').length;
                if (len !== self.checkChangeLength) {
                    self.hasChanged = true;
                }
                self.checkChangeLength = len;
            }, 500);
            return root;
        }
        updateFile(file) {
            DefaultApplicationWindow.prototype.updateFile.apply(this, arguments);
            try {
                var el = this._find('Text');
                el.$element.focus();
            } catch (e) {
            }
            this.checkChangeLength = -1;
        }
        showFile(file, content) {
            this._find('Text').set('value', content || '');
            DefaultApplicationWindow.prototype.showFile.apply(this, arguments);
        }
        getFileData() {
            return this._find('Text').get('value');
        }
        _focus(file, content) {
            if (super._focus(...arguments)) {
                this._find('Text').focus();
                return true;
            }
            return false;
        }
    }
    class ApplicationWriter extends DefaultApplication {
        constructor(args, metadata) {
            super('ApplicationWriter', args, metadata, {
                extension: 'odoc',
                mime: 'osjs/document',
                filename: 'New text file.odoc'
            });
        }
        init(settings, metadata) {
            super.init(...arguments);
            const file = this._getArgument('file');
            this._addWindow(new ApplicationWriterWindow(this, metadata, file));
        }
    }
    OSjs.Applications.ApplicationWriter = ApplicationWriter;
});