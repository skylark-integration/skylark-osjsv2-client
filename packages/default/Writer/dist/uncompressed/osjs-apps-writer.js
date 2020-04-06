/**
 * osjs-apps-writer - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx/skylark");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('osjs-apps-writer/locales',[],function () {
    'use strict';
    return {
        bg_BG: { 'Insert URL': 'Въведи URL' },
        de_DE: { 'Insert URL': 'URL einfügen' },
        es_ES: { 'Insert URL': 'Insertar URL' },
        fr_FR: { 'Insert URL': 'Insérer une URL' },
        ar_DZ: { 'Insert URL': 'أدخل رابط' },
        it_IT: { 'Insert URL': 'Inserisci URL' },
        ko_KR: { 'Insert URL': '링크 삽입' },
        nl_NL: { 'Insert URL': 'URL invoegen' },
        no_NO: { 'Insert URL': 'Sett inn URL' },
        pl_PL: { 'Insert URL': 'Wpisz URL' },
        ru_RU: { 'Insert URL': 'Вставить ссылку' },
        sk_SK: { 'Insert URL': 'Vložiť URL' },
        tr_TR: { 'Insert URL': 'URL ekle' },
        vi_VN: { 'Insert URL': 'Thêm URL' }
    };
});
define('osjs-apps-writer/scheme.html',[], function() { return "<application-window data-id=\"WriterWindow\">\r\n\r\n  <gui-vbox>\r\n    <!-- MENU BAR -->\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"1\" data-basis=\"auto\">\r\n      <gui-menu-bar>\r\n\r\n        <gui-menu-bar-entry data-label=\"LBL_FILE\">\r\n          <gui-menu data-id=\"SubmenuFile\">\r\n            <gui-menu-entry data-id=\"MenuNew\" data-label=\"LBL_NEW\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuOpen\" data-label=\"LBL_OPEN\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuSave\" data-label=\"LBL_SAVE\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuSaveAs\" data-label=\"LBL_SAVEAS\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuClose\" data-label=\"LBL_CLOSE\"></gui-menu-entry>\r\n          </gui-menu>\r\n        </gui-menu-bar-entry>\r\n\r\n        <gui-menu-bar-entry data-label=\"LBL_EDIT\">\r\n          <gui-menu data-id=\"SubmenuEdit\">\r\n            <gui-menu-entry data-id=\"MenuUndo\" data-label=\"LBL_UNDO\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuRedo\" data-label=\"LBL_REDO\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuCut\" data-label=\"LBL_CUT\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuCopy\" data-label=\"LBL_COPY\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuPaste\" data-label=\"LBL_PASTE\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuDelete\" data-label=\"LBL_DELETE\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuUnlink\" data-label=\"LBL_UNLINK\"></gui-menu-entry>\r\n          </gui-menu>\r\n        </gui-menu-bar-entry>\r\n\r\n        <gui-menu-bar-entry data-label=\"LBL_INSERT\">\r\n          <gui-menu data-id=\"SubmenuInsert\">\r\n            <gui-menu-entry data-id=\"MenuInsertOL\" data-label=\"LBL_ORDERED_LIST\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuInsertUL\" data-label=\"LBL_UNORDERED_LIST\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuInsertLink\" data-label=\"LBL_LINK\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuInsertImage\" data-label=\"LBL_IMAGE\"></gui-menu-entry>\r\n          </gui-menu>\r\n        </gui-menu-bar-entry>\r\n\r\n      </gui-menu-bar>\r\n    </gui-vbox-container>\r\n\r\n    <!-- TOOLS -->\r\n    <gui-vbox-container data-shrink=\"1\" data-basis=\"auto\" data-expand=\"true\">\r\n\r\n      <gui-toolbar>\r\n        <gui-button data-id=\"text-bold\" data-icon=\"stock://actions/format-text-bold.png\"></gui-button>\r\n        <gui-button data-id=\"text-italic\" data-icon=\"stock://actions/format-text-italic.png\"></gui-button>\r\n        <gui-button data-id=\"text-underline\" data-icon=\"stock://actions/format-text-underline.png\"></gui-button>\r\n        <gui-button data-id=\"text-strikethrough\" data-icon=\"stock://actions/format-text-strikethrough.png\"></gui-button>\r\n\r\n        <gui-toolbar-separator />\r\n\r\n        <gui-button data-id=\"justify-left\" data-icon=\"stock://actions/format-justify-left.png\"></gui-button>\r\n        <gui-button data-id=\"justify-center\" data-icon=\"stock://actions/format-justify-center.png\"></gui-button>\r\n        <gui-button data-id=\"justify-right\" data-icon=\"stock://actions/format-justify-right.png\"></gui-button>\r\n\r\n        <gui-toolbar-separator />\r\n\r\n        <gui-button data-id=\"indent\" data-icon=\"stock://actions/format-indent-less.png\"></gui-button>\r\n        <gui-button data-id=\"unindent\" data-icon=\"stock://actions/format-indent-more.png\"></gui-button>\r\n\r\n        <gui-toolbar-separator />\r\n\r\n        <gui-color-box data-id=\"Foreground\"></gui-color-box>\r\n        <gui-color-box data-id=\"Background\"></gui-color-box>\r\n\r\n        <gui-toolbar-separator />\r\n\r\n        <gui-button data-id=\"Font\" data-group=\"tool\" data-tool-name=\"\">FONT (SIZE)</gui-button>\r\n      </gui-toolbar>\r\n\r\n    </gui-vbox-container>\r\n\r\n    <!-- CONTENT -->\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"0\" data-basis=\"auto\" data-fill=\"true\">\r\n      <gui-richtext data-id=\"Text\"></gui-richtext>\r\n    </gui-vbox-container>\r\n\r\n    <!-- STATUSBAR -->\r\n    <!--\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"1\" data-basis=\"auto\">\r\n      <gui-statusbar data-id=\"Statusbar\"></gui-statusbar>\r\n    </gui-vbox-container>\r\n    -->\r\n\r\n  </gui-vbox>\r\n\r\n\r\n\r\n</application-window>\r\n"; });
define('osjs-apps-writer/main',[
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
define('osjs-apps-writer', ['osjs-apps-writer/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/osjs-apps-writer.js.map
