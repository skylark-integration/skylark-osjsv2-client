define([
    './iframe-application-window',
    '../core/application'
], function (IFrameApplicationWindow, Application) {
    'use strict';
    return class IFrameApplication extends Application {
        constructor(name, args, metadata, opts) {
            super(...arguments);
            this.options = Object.assign({}, {
                icon: '',
                title: 'IframeApplicationWindow'
            }, opts);
            this.options.src = this._getResource(this.options.src);
        }
        init(settings, metadata) {
            super.init(...arguments);
            const name = this.__pname + 'Window';
            this._addWindow(new IFrameApplicationWindow(name, this.options, this));
        }
        onPostMessage(message, ev) {
            console.debug('IFrameApplication::onPostMessage()', message);
            const _response = (err, res) => {
                this.postMessage({
                    id: message.id,
                    method: message.method,
                    error: err,
                    result: Object.assign({}, res)
                });
            };
            if (typeof message.id === 'number' && message.method) {
                if (this[message.method]) {
                    this[message.method](message.args || {}, _response);
                } else {
                    _response('No such method');
                }
            }
        }
        postMessage(message) {
            const win = this._getMainWindow();
            if (win) {
                win.postMessage(message);
            }
        }
    };
});