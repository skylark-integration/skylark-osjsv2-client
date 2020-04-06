define([
    './locales',
    "./scheme.html"
], function (Translations,schemeHtml) {
    'use strict';
    const Locales = OSjs.require('core/locales');
    const Dialog = OSjs.require('core/dialog');
    const GUI = OSjs.require('utils/gui');
    const DOM = OSjs.require('utils/dom');
    const Colors = OSjs.require('utils/colors');
    const FileDataURL = OSjs.require('vfs/filedataurl');
    const DefaultApplication = OSjs.require('helpers/default-application');
    const DefaultApplicationWindow = OSjs.require('helpers/default-application-window');
    const doTranslate = Locales.createLocalizer(Translations);
    var DEFAULT_WIDTH = 1024;
    var DEFAULT_HEIGHT = 768;
    var tools = {
        pointer: { statusText: '' },
        picker: { statusText: 'LMB: Pick foreground-, RMB: Pick background color' },
        bucket: { statusText: 'LMB: Fill with foreground-, RMB: Fill with background color' },
        pencil: { statusText: 'LMB: Use foreground-, RMB: Use background color' },
        path: { statusText: 'LMB: Use foreground-, RMB: Use background color' },
        rectangle: { statusText: 'LMB: Use foreground-, RMB: Use background color. SHIFT: Toggle rectangle/square mode' },
        circle: { statusText: 'LMB: Use foreground-, RMB: Use background color. SHIFT: Toggle circle/ellipse mode' }
    };
    var toolEvents = {
        pointer: {},
        picker: function () {
            var imageData;
            function pick(ev, args) {
                var value = '#000000';
                var t = ev.shiftKey || ev.button > 0 ? 'background' : 'foreground';
                if (!imageData) {
                    imageData = args.ctx.getImageData(0, 0, args.canvas.width, args.canvas.height).data;
                }
                var index = (args.pos.x + args.pos.y * args.canvas.width) * 4;
                try {
                    value = Colors.convertToHEX({
                        r: imageData[index + 0],
                        g: imageData[index + 1],
                        b: imageData[index + 2],
                        a: imageData[index + 3]
                    });
                } catch (e) {
                }
                args.win.setToolProperty(t, value);
            }
            return {
                mousedown: pick,
                mousemove: pick,
                mouseup: function (ev, pos, canvas, ctx, win) {
                    imageData = null;
                }
            };
        }(),
        bucket: {
            mousedown: function (ev, args) {
                var t = ev.shiftKey || ev.button > 0 ? 'background' : 'foreground';
                args.ctx.fillStyle = args.win.tool[t];
                args.ctx.fillRect(0, 0, args.canvas.width, args.canvas.height);
            }
        },
        pencil: {
            mousedown: function (ev, args) {
                var t = ev.shiftKey || ev.button > 0 ? 'background' : 'foreground';
                args.ctx.strokeStyle = args.win.tool[t];
            },
            mousemove: function (ev, args) {
                args.ctx.beginPath();
                args.ctx.moveTo(args.pos.x - 1, args.pos.y);
                args.ctx.lineTo(args.pos.x, args.pos.y);
                args.ctx.closePath();
                args.ctx.stroke();
            }
        },
        path: {
            mousemove: function (ev, args) {
                if (args.tmpContext) {
                    args.tmpContext.clearRect(0, 0, args.tmpCanvas.width, args.tmpCanvas.height);
                    args.tmpContext.beginPath();
                    args.tmpContext.moveTo(args.start.x, args.start.y);
                    args.tmpContext.lineTo(args.pos.x, args.pos.y);
                    args.tmpContext.closePath();
                    args.tmpContext.stroke();
                }
            }
        },
        rectangle: {
            mousedown: function (ev, args) {
                args.tmpContext.fillStyle = ev.button > 0 ? args.win.tool.background : args.win.tool.foreground;
                args.tmpContext.strokeStyle = ev.button <= 0 ? args.win.tool.background : args.win.tool.foreground;
            },
            mousemove: function (ev, args) {
                var x, y, w, h;
                if (ev.shiftKey) {
                    x = Math.min(args.pos.x, args.start.x);
                    y = Math.min(args.pos.y, args.start.y);
                    w = Math.abs(args.pos.x - args.start.x);
                    h = Math.abs(args.pos.y - args.start.y);
                } else {
                    x = args.start.x;
                    y = args.start.y;
                    w = Math.abs(args.pos.x - args.start.x) * (args.pos.x < args.start.x ? -1 : 1);
                    h = Math.abs(w) * (args.pos.y < args.start.y ? -1 : 1);
                }
                args.tmpContext.clearRect(0, 0, args.tmpCanvas.width, args.tmpCanvas.height);
                if (w && h) {
                    if (args.win.tool.lineStroke) {
                        args.tmpContext.strokeRect(x, y, w, h);
                    }
                    args.tmpContext.fillRect(x, y, w, h);
                }
            }
        },
        circle: {
            mousedown: function (ev, args) {
                args.tmpContext.fillStyle = ev.button > 0 ? args.win.tool.background : args.win.tool.foreground;
                args.tmpContext.strokeStyle = ev.button <= 0 ? args.win.tool.background : args.win.tool.foreground;
            },
            mousemove: function (ev, args) {
                if (ev.shiftKey) {
                    var width = Math.abs(args.start.x - args.pos.x);
                    var height = Math.abs(args.start.y - args.pos.y);
                    args.tmpContext.clearRect(0, 0, args.tmpCanvas.width, args.tmpCanvas.height);
                    if (width > 0 && height > 0) {
                        args.tmpContext.beginPath();
                        args.tmpContext.moveTo(args.start.x, args.start.y - height * 2);
                        args.tmpContext.bezierCurveTo(args.start.x + width * 2, args.start.y - height * 2, args.start.x + width * 2, args.start.y + height * 2, args.start.x, args.start.y + height * 2);
                        args.tmpContext.bezierCurveTo(args.start.x - width * 2, args.start.y + height * 2, args.start.x - width * 2, args.start.y - height * 2, args.start.x, args.start.y - height * 2);
                        args.tmpContext.closePath();
                        if (args.win.tool.lineStroke) {
                            args.tmpContext.stroke();
                        }
                        args.tmpContext.fill();
                    }
                } else {
                    var x = Math.abs(args.start.x - args.pos.x);
                    var y = Math.abs(args.start.y - args.pos.y);
                    var r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
                    args.tmpContext.clearRect(0, 0, args.tmpCanvas.width, args.tmpCanvas.height);
                    if (r > 0) {
                        args.tmpContext.beginPath();
                        args.tmpContext.arc(args.start.x, args.start.y, r, 0, Math.PI * 2, true);
                        args.tmpContext.closePath();
                        if (args.win.tool.lineStroke) {
                            args.tmpContext.stroke();
                        }
                        args.tmpContext.fill();
                    }
                }
            }
        }
    };
    class ApplicationDrawWindow extends DefaultApplicationWindow {
        constructor(app, metadata, file) {
            super('ApplicationDrawWindow', {
                icon: metadata.icon,
                title: metadata.name,
                allow_drop: true,
                min_width: 400,
                min_height: 450,
                width: 800,
                height: 450,
                translator: doTranslate
            }, app, file);
            this.tool = {
                name: 'pointer',
                background: '#ffffff',
                foreground: '#000000',
                lineJoin: 'round',
                lineWidth: 1,
                lineStroke: false
            };
        }
        init(wm, app) {
            const root = super.init(...arguments);
            var self = this;
            this._render('DrawWindow', schemeHtml);
            var statusbar = this._find('Statusbar');
            var canvas = this._find('Canvas').querySelector('canvas');
            canvas.width = DEFAULT_WIDTH;
            canvas.height = DEFAULT_HEIGHT;
            var ctx = canvas.getContext('2d');
            var startPos = {
                x: 0,
                y: 0
            };
            var cpos = {
                x: 0,
                y: 0
            };
            var tmpTools = [
                'path',
                'rectangle',
                'circle'
            ];
            var tmpCanvas, tmpContext;
            function createTempCanvas(ev) {
                tmpCanvas = document.createElement('canvas');
                tmpCanvas.width = canvas.width;
                tmpCanvas.height = canvas.height;
                tmpCanvas.style.position = 'absolute';
                tmpCanvas.style.top = '0px';
                tmpCanvas.style.left = '0px';
                tmpCanvas.style.zIndex = 9999999999;
                canvas.parentNode.appendChild(tmpCanvas);
                var t = ev.shiftKey || ev.button > 0;
                tmpContext = tmpCanvas.getContext('2d');
                tmpContext.strokeStyle = t ? ctx.fillStyle : ctx.strokeStyle;
                tmpContext.fillStyle = t ? ctx.strokeStyle : ctx.fillStyle;
                tmpContext.lineWidth = ctx.lineWidth;
                tmpContext.lineJoin = ctx.lineJoin;
            }
            function removeTempCanvas() {
                DOM.$remove(tmpCanvas);
                tmpContext = null;
                tmpCanvas = null;
            }
            function toolAction(action, ev, pos, diff) {
                if (action === 'down') {
                    startPos = {
                        x: pos.x,
                        y: pos.y
                    };
                    removeTempCanvas();
                    var elpos = DOM.$position(canvas);
                    startPos.x = pos.x - elpos.left;
                    startPos.y = pos.y - elpos.top;
                    cpos = {
                        x: startPos.x,
                        y: startPos.y
                    };
                    ctx.strokeStyle = self.tool.foreground;
                    ctx.fillStyle = self.tool.background;
                    ctx.lineWidth = self.tool.lineWidth;
                    ctx.lineJoin = self.tool.lineJoin;
                    if (tmpTools.indexOf(self.tool.name) >= 0) {
                        createTempCanvas(ev);
                    }
                } else if (action === 'move') {
                    cpos.x = startPos.x + diff.x;
                    cpos.y = startPos.y + diff.y;
                } else if (action === 'up') {
                    if (tmpCanvas && ctx) {
                        ctx.drawImage(tmpCanvas, 0, 0);
                    }
                    removeTempCanvas();
                    startPos = null;
                }
                if (toolEvents[self.tool.name] && toolEvents[self.tool.name]['mouse' + action]) {
                    toolEvents[self.tool.name]['mouse' + action](ev, {
                        pos: cpos,
                        start: startPos,
                        canvas: canvas,
                        ctx: ctx,
                        tmpContext: tmpContext,
                        tmpCanvas: tmpCanvas,
                        win: self
                    });
                }
            }
            GUI.createDrag(canvas, function (ev, pos) {
                toolAction('down', ev, pos);
            }, function (ev, diff, pos) {
                toolAction('move', ev, pos, diff);
            }, function (ev, pos) {
                toolAction('up', ev, pos);
                self.hasChanged = true;
            });
            this._find('Foreground').on('click', function () {
                self.openColorDialog('foreground');
            });
            this._find('Background').on('click', function () {
                self.openColorDialog('background');
            });
            var ts = Object.keys(tools);
            ts.forEach(function (t) {
                self._find('tool-' + t).on('click', function () {
                    var stats = tools[t].statusText || '';
                    statusbar.set('value', doTranslate(stats));
                    self.setToolProperty('name', t);
                });
            });
            var lineWidths = [];
            for (var i = 1; i < 22; i++) {
                lineWidths.push({
                    label: i.toString(),
                    value: i
                });
            }
            this._find('LineWidth').add(lineWidths).on('change', function (ev) {
                self.setToolProperty('lineWidth', parseInt(ev.detail, 10));
            });
            this._find('LineJoin').on('change', function (ev) {
                self.setToolProperty('lineJoin', ev.detail);
            });
            this._find('LineStroke').on('change', function (ev) {
                self.setToolProperty('lineStroke', ev.detail);
            });
            this.setToolProperty('background', null);
            this.setToolProperty('foreground', null);
            this.setToolProperty('lineJoin', null);
            this.setToolProperty('lineWidth', null);
            this.setToolProperty('lineStroke', null);
            return root;
        }
        openColorDialog(param) {
            var self = this;
            var colorParam = null;
            if (param === 'background') {
                colorParam = doTranslate('Set background color');
            } else if (param === 'foreground') {
                colorParam = doTranslate('Set foreground color');
            }
            Dialog.create('Color', {
                title: colorParam,
                color: self.tool[param]
            }, function (ev, button, result) {
                if (button !== 'ok') {
                    return;
                }
                self.setToolProperty(param, result.hex);
            }, this);
        }
        setToolProperty(param, value) {
            console.warn('setToolProperty', param, value);
            if (typeof this.tool[param] !== 'undefined') {
                if (value !== null) {
                    this.tool[param] = value;
                }
            }
            this._find('Foreground').set('value', this.tool.foreground);
            this._find('Background').set('value', this.tool.background);
            this._find('LineJoin').set('value', this.tool.lineJoin);
            this._find('LineWidth').set('value', this.tool.lineWidth);
            this._find('LineStroke').set('value', this.tool.lineStroke);
        }
        showFile(file, result) {
            var self = this;
            super.showFile(...arguments);
            var canvas = this._find('Canvas').querySelector('canvas');
            var ctx = canvas.getContext('2d');
            function open(img) {
                if (window.Uint8Array && img instanceof Uint8Array) {
                    var image = ctx.createImageData(canvas.width, ctx.height);
                    for (var i = 0; i < img.length; i++) {
                        image.data[i] = img[i];
                    }
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(image, 0, 0);
                } else if (img instanceof Image || img instanceof HTMLImageElement) {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.clearRect(0, 0, img.width, img.height);
                    ctx.drawImage(img, 0, 0);
                }
            }
            if (result) {
                this._toggleLoading(true);
                var tmp = new Image();
                tmp.onerror = function () {
                    self._toggleLoading(false);
                    alert('Failed to open image');
                };
                tmp.onload = function () {
                    self._toggleLoading(false);
                    open(this);
                };
                tmp.src = result;
            } else {
                canvas.width = DEFAULT_WIDTH;
                canvas.height = DEFAULT_HEIGHT;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
        getFileData() {
            var canvas = this._find('Canvas').querySelector('canvas');
            if (canvas) {
                return new FileDataURL(canvas.toDataURL('image/png'));
            }
            return null;
        }
    }
    class ApplicationDraw extends DefaultApplication {
        constructor(args, metadata) {
            super('ApplicationDraw', args, metadata, {
                readData: false,
                extension: 'png',
                mime: 'image/png',
                filename: 'New image.png',
                filetypes: [{
                        label: 'PNG Image',
                        mime: 'image/png',
                        extension: 'png'
                    }]
            });
        }
        init(settings, metadata) {
            super.init(...arguments);
            const file = this._getArgument('file');
            this._addWindow(new ApplicationDrawWindow(this, metadata, file));
        }
    }
    OSjs.Applications.ApplicationDraw = ApplicationDraw;
});