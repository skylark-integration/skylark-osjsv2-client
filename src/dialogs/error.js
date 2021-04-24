define([
    '../core/dialog',
    '../core/locales',
    '../core/config'
], function (DialogWindow, Locales, Config) {
    'use strict';
    return class ErrorDialog extends DialogWindow {
        constructor(args, callback) {
            args = Object.assign({}, {}, args);
            const exception = args.exception || {};
            let error = '';
            if (exception.stack) {
                error = exception.stack;
            } else {
                if (Object.keys(exception).length) {
                    error = exception.name;
                    error += '\nFilename: ' + exception.fileName || '<unknown>';
                    error += '\nLine: ' + exception.lineNumber;
                    error += '\nMessage: ' + exception.message;
                    if (exception.extMessage) {
                        error += '\n' + exception.extMessage;
                    }
                }
            }
            super('ErrorDialog', {
                title: args.title || Locales._('DIALOG_ERROR_TITLE'),
                icon: 'status/dialog-error.png',
                width: 400,
                height: error ? 400 : 200
            }, args, callback);
            this._sound = 'ERROR';
            this._soundVolume = 1;
            this.traceMessage = error;
        }
        init() {
            const root = super.init(...arguments);
            root.setAttribute('role', 'alertdialog');
            const msg = DialogWindow.parseMessage(this.args.message);
            this._find('Message').empty().append(msg);
            this._find('Summary').set('value', this.args.error);
            this._find('Trace').set('value', this.traceMessage);
            if (!this.traceMessage) {
                this._find('Trace').hide();
                this._find('TraceLabel').hide();
            }
            if (this.args.bugreport) {
                this._find('ButtonBugReport').on('click', () => {
                    let title = '';
                    let body = [];
                    if (Config.getConfig('BugReporting.options.issue')) {
                        const obj = {};
                        const keys = [
                            'userAgent',
                            'platform',
                            'language',
                            'appVersion'
                        ];
                        keys.forEach(k => {
                            obj[k] = navigator[k];
                        });
                        title = Config.getConfig('BugReporting.options.title');
                        body = [
                            '**' + Config.getConfig('BugReporting.options.message').replace('%VERSION%', Config.getConfig('Version')) + ':**',
                            '\n',
                            '> ' + this.args.message,
                            '\n',
                            '> ' + (this.args.error || 'Unknown error'),
                            '\n',
                            '## Expected behaviour',
                            '\n',
                            '## Actual behaviour',
                            '\n',
                            '## Steps to reproduce the error',
                            '\n',
                            '## (Optinal) Browser and OS information',
                            '\n',
                            '```\n' + JSON.stringify(obj) + '\n```'
                        ];
                        if (this.traceMessage) {
                            body.push('\n## Stack Trace \n```\n' + this.traceMessage + '\n```\n');
                        }
                    }
                    const url = Config.getConfig('BugReporting.url').replace('%TITLE%', encodeURIComponent(title)).replace('%BODY%', encodeURIComponent(body.join('\n')));
                    window.open(url);
                });
            } else {
                this._find('ButtonBugReport').hide();
            }
            return root;
        }
    };
});