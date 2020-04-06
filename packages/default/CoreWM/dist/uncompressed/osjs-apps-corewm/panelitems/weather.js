define(['../panelitem'], function (PanelItem) {
    'use strict';
    const DOM = OSjs.require('utils/dom');
    const Utils = OSjs.require('utils/misc');
    const Theme = OSjs.require('core/theme');
    const Events = OSjs.require('utils/events');
    const Connection = OSjs.require('core/connection');
    return class PanelItemWeather extends PanelItem {
        constructor() {
            super('PanelItemWeather corewm-panel-right corewm-panel-dummy');
            this.clockInterval = null;
            this.position = null;
            this.interval = null;
            this.$element = null;
            this.$image = null;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(pos => {
                    this.position = pos;
                    setTimeout(() => this.updateWeather(), 100);
                });
            }
        }
        init() {
            const root = super.init(...arguments);
            this.$element = document.createElement('li');
            this.$image = document.createElement('img');
            this.$element.appendChild(this.$image);
            this._$container.appendChild(this.$element);
            this.updateWeather();
            return root;
        }
        destroy() {
            Events.$unbind(this._$root, 'click');
            this.interval = clearInterval(this.interval);
            this.$image = DOM.$remove(this.$image);
            this.$element = DOM.$remove(this.$element);
            return super.destroy(...arguments);
        }
        updateWeather() {
            if (!this.$image) {
                return;
            }
            this.$image.title = 'Not allowed or unavailable';
            var busy = false;
            const setImage = src => {
                if (this.$image) {
                    this.$image.src = src;
                }
            };
            const setWeather = (name, weather, main) => {
                if (!this.$image) {
                    return;
                }
                name = name || '<unknown location>';
                weather = weather || {};
                main = main || {};
                var desc = weather.description || '<unknown weather>';
                var temp = main.temp || '<unknown temp>';
                if (main.temp) {
                    temp += 'C';
                }
                var icon = 'sunny.png';
                switch (desc) {
                case 'clear sky':
                    if (weather.icon === '01n') {
                        icon = 'weather-clear-night.png';
                    } else {
                        icon = 'weather-clear.png';
                    }
                    break;
                case 'few clouds':
                    if (weather.icon === '02n') {
                        icon = 'weather-few-clouds-night.png';
                    } else {
                        icon = 'weather-few-clouds.png';
                    }
                    break;
                case 'scattered clouds':
                case 'broken clouds':
                    icon = 'weather-overcast.png';
                    break;
                case 'shower rain':
                    icon = 'weather-showers.png';
                    break;
                case 'rain':
                    icon = 'weather-showers-scattered.png';
                    break;
                case 'thunderstorm':
                    icon = 'stock_weather-storm.png';
                    break;
                case 'snow':
                    icon = 'stock_weather-snow.png';
                    break;
                case 'mist':
                    icon = 'stock_weather-fog.png';
                    break;
                default:
                    if (desc.match(/rain$/)) {
                        icon = 'weather-showers-scattered.png';
                    }
                    break;
                }
                var src = Theme.getIcon('status/' + icon);
                this.$image.title = Utils.format('{0} - {1} - {2}', name, desc, temp);
                setImage(src);
            };
            const updateWeather = () => {
                if (busy || !this.position) {
                    return;
                }
                busy = true;
                var lat = this.position.coords.latitude;
                var lon = this.position.coords.longitude;
                var unt = 'metric';
                var key = '4ea33327bcfa4ea0293b2d02b6fda385';
                var url = Utils.format('http://api.openweathermap.org/data/2.5/weather?lat={0}&lon={1}&units={2}&APPID={3}', lat, lon, unt, key);
                Connection.request('curl', { url: url }).then(response => {
                    if (response) {
                        var result = null;
                        try {
                            result = JSON.parse(response.body);
                        } catch (e) {
                        }
                        if (result) {
                            setWeather(result.name, result.weather ? result.weather[0] : null, result.main);
                        }
                    }
                    busy = false;
                }).catch(() => {
                    busy = false;
                });
            };
            setImage(Theme.getIcon('status/weather-severe-alert.png'));
            this.interval = setInterval(function () {
                updateWeather();
            }, 60 * 60 * 1000);
            Events.$bind(this._$root, 'click', () => updateWeather());
            setTimeout(() => updateWeather(), 1000);
        }
    };
});