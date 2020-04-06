define([
    '../panelitem',
    '../panelitemdialog'
], function (PanelItem, PanelDialog) {
    'use strict';
    const DOM = OSjs.require('utils/dom');
    const ExtendedDate = OSjs.require('helpers/date');
    class ClockSettingsDialog extends PanelDialog {
        constructor(panelItem, scheme, closeCallback) {
            super('ClockSettingsDialog', {
                title: 'Clock Settings',
                icon: 'status/appointment-soon.png',
                width: 400,
                height: 280
            }, panelItem._settings, scheme, closeCallback);
        }
        init(wm, app) {
            const root = super.init(...arguments);
            this._find('InputUseUTC').set('value', this._settings.get('utc'));
            this._find('InputInterval').set('value', String(this._settings.get('interval')));
            this._find('InputTimeFormatString').set('value', this._settings.get('format'));
            this._find('InputTooltipFormatString').set('value', this._settings.get('tooltip'));
            return root;
        }
        applySettings() {
            this._settings.set('utc', this._find('InputUseUTC').get('value'));
            this._settings.set('interval', parseInt(this._find('InputInterval').get('value'), 10));
            this._settings.set('format', this._find('InputTimeFormatString').get('value'));
            this._settings.set('tooltip', this._find('InputTooltipFormatString').get('value'), true);
        }
    }
    return class PanelItemClock extends PanelItem {
        constructor(settings) {
            super('PanelItemClock corewm-panel-right', 'Clock', settings, {
                utc: false,
                interval: 1000,
                format: 'H:i:s',
                tooltip: 'l, j F Y'
            });
            this.clockInterval = null;
            this.$clock = null;
        }
        createInterval() {
            const timeFmt = this._settings.get('format');
            const tooltipFmt = this._settings.get('tooltip');
            const update = () => {
                let clock = this.$clock;
                if (clock) {
                    const now = new Date();
                    const t = ExtendedDate.format(now, timeFmt);
                    const d = ExtendedDate.format(now, tooltipFmt);
                    DOM.$empty(clock);
                    clock.appendChild(document.createTextNode(t));
                    clock.setAttribute('aria-label', String(t));
                    clock.title = d;
                }
                clock = null;
            };
            const create = interval => {
                clearInterval(this.clockInterval);
                this.clockInterval = clearInterval(this.clockInterval);
                this.clockInterval = setInterval(() => update(), interval);
            };
            create(this._settings.get('interval'));
            update();
        }
        init() {
            const root = super.init(...arguments);
            this.$clock = document.createElement('span');
            this.$clock.innerHTML = '00:00:00';
            this.$clock.setAttribute('role', 'button');
            const li = document.createElement('li');
            li.appendChild(this.$clock);
            this._$container.appendChild(li);
            this.createInterval();
            return root;
        }
        applySettings() {
            this.createInterval();
        }
        openSettings() {
            return super.openSettings(ClockSettingsDialog, {});
        }
        destroy() {
            this.clockInterval = clearInterval(this.clockInterval);
            this.$clock = DOM.$remove(this.$clock);
            return super.destroy(...arguments);
        }
    };
});