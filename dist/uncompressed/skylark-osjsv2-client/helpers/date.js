define(function () {
    'use strict';
    class ExtendedDate {
        constructor(date) {
            if (date) {
                if (date instanceof Date) {
                    this.date = date;
                } else if (date instanceof ExtendedDate) {
                    this.date = date.date;
                } else if (typeof date === 'string') {
                    this.date = new Date(date);
                }
            }
            if (!this.date) {
                this.date = new Date();
            }
        }
        static get config() {
            return { defaultFormat: 'isoDateTime' };
        }
        static get dayNames() {
            return [
                'Sun',
                'Mon',
                'Tue',
                'Wed',
                'Thu',
                'Fri',
                'Sat',
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday'
            ];
        }
        static get monthNames() {
            return [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
            ];
        }
        get() {
            return this.date;
        }
        format(fmt) {
            return ExtendedDate.format(this, fmt);
        }
        getFirstDayInMonth(fmt) {
            return ExtendedDate.getFirstDayInMonth(fmt, null, null, this);
        }
        getLastDayInMonth(fmt) {
            return ExtendedDate.getLastDayInMonth(fmt, null, null, this);
        }
        getDaysInMonth() {
            return ExtendedDate.getDaysInMonth(null, null, this);
        }
        getWeekNumber() {
            return ExtendedDate.getWeekNumber(this);
        }
        isWithinMonth(from, to) {
            return ExtendedDate.isWithinMonth(this, from, to);
        }
        getDayOfTheYear() {
            return ExtendedDate.getDayOfTheYear();
        }
        static format(date, fmt) {
            return format(fmt, date);
        }
        static getPreviousMonth(now) {
            now = now ? now instanceof ExtendedDate ? now.date : now : new Date();
            let current;
            if (now.getMonth() === 0) {
                current = new Date(now.getFullYear() - 1, 11, now.getDate());
            } else {
                current = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            }
            return new ExtendedDate(current);
        }
        static getNextMonth(now) {
            now = now ? now instanceof ExtendedDate ? now.date : now : new Date();
            let current;
            if (now.getMonth() === 11) {
                current = new Date(now.getFullYear() + 1, 0, now.getDate());
            } else {
                current = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
            }
            return new ExtendedDate(current);
        }
        static getFirstDayInMonth(fmt, y, m, now) {
            now = _now(now);
            y = _y(y, now);
            m = _m(m, now);
            const date = new Date();
            date.setFullYear(y, m, 1);
            if (fmt === true) {
                return date.getDate();
            }
            return fmt ? format(fmt, date) : new ExtendedDate(date);
        }
        static getLastDayInMonth(fmt, y, m, now) {
            now = _now(now);
            y = _y(y, now);
            m = _m(m, now);
            const date = new Date();
            date.setFullYear(y, m, 0);
            if (fmt === true) {
                return date.getDate();
            }
            return fmt ? format(fmt, date) : new ExtendedDate(date);
        }
        static getDaysInMonth(y, m, now) {
            now = _now(now);
            y = _y(y, now);
            m = _m(m, now);
            const date = new Date();
            date.setFullYear(y, m, 0);
            return parseInt(date.getDate(), 10);
        }
        static getWeekNumber(now) {
            now = now ? now instanceof ExtendedDate ? now.date : now : new Date();
            const d = new Date(+now);
            d.setHours(0, 0, 0);
            d.setDate(d.getDate() + 4 - (d.getDay() || 7));
            return Math.ceil(((d - new Date(d.getFullYear(), 0, 1)) / 86400000 + 1) / 7);
        }
        static getDayName(index, shrt) {
            if (index < 0 || index === null || typeof index === 'undefined') {
                return filter(ExtendedDate.dayNames, index, shrt, 7);
            }
            shrt = shrt ? 0 : 1;
            const idx = index + (shrt + 7);
            return ExtendedDate.dayNames[idx];
        }
        static getMonthName(index, shrt) {
            if (index < 0 || index === null || typeof index === 'undefined') {
                return filter(ExtendedDate.monthNames, index, shrt, 12);
            }
            shrt = shrt ? 0 : 1;
            const idx = index + (shrt + 12);
            return ExtendedDate.monthNames[idx];
        }
        static isWithinMonth(now, from, to) {
            if (now.getFullYear() >= from.getFullYear() && now.getMonth() >= from.getMonth()) {
                if (now.getFullYear() <= to.getFullYear() && now.getMonth() <= to.getMonth()) {
                    return true;
                }
            }
            return false;
        }
        static getDayOfTheYear() {
            const now = new Date();
            const start = new Date(now.getFullYear(), 0, 0);
            const diff = now - start;
            const oneDay = 1000 * 60 * 60 * 24;
            return Math.floor(diff / oneDay);
        }
    };
    const methods = [
        'UTC',
        'toString',
        'now',
        'parse',
        'getDate',
        'getDay',
        'getFullYear',
        'getHours',
        'getMilliseconds',
        'getMinutes',
        'getMonth',
        'getSeconds',
        'getTime',
        'getTimezoneOffset',
        'getUTCDate',
        'getUTCDay',
        'getUTCFullYear',
        'getUTCHours',
        'getUTCMilliseconds',
        'getUTCMinutes',
        'getUTCMonth',
        'getUTCSeconds',
        'getYear',
        'setDate',
        'setFullYear',
        'setHours',
        'setMilliseconds',
        'setMinutes',
        'setMonth',
        'setSeconds',
        'setTime',
        'setUTCDate',
        'setUTCFullYear',
        'setUTCHours',
        'setUTCMilliseconds',
        'setUTCMinutes',
        'setUTCMonth',
        'setUTCSeconds',
        'setYear',
        'toDateString',
        'toGMTString',
        'toISOString',
        'toJSON',
        'toLocaleDateString',
        'toLocaleFormat',
        'toLocaleString',
        'toLocaleTimeString',
        'toSource',
        'toString',
        'toTimeString',
        'toUTCString',
        'valueOf'
    ];
    methods.forEach(function (m) {
        ExtendedDate.prototype[m] = function () {
            return this.date[m].apply(this.date, arguments);
        };
    });
    function formatDate(date, format, utc) {
        utc = utc === true;
        function pad(val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) {
                val = '0' + val;
            }
            return val;
        }
        const defaultFormats = {
            'default': 'Y-m-d H:i:s',
            shortDate: 'm/d/y',
            mediumDate: 'M d, Y',
            longDate: 'F d, Y',
            fullDate: 'l, F d, Y',
            shortTime: 'h:i A',
            mediumTime: 'h:i:s A',
            longTime: 'h:i:s A T',
            isoDate: 'Y-m-d',
            isoTime: 'H:i:s',
            isoDateTime: 'Y-m-d H:i:s'
        };
        format = defaultFormats[format] || format;
        if (!(date instanceof ExtendedDate)) {
            date = new ExtendedDate(date);
        }
        const map = {
            d: function (s) {
                return pad(map.j(s));
            },
            D: function (s) {
                return ExtendedDate.dayNames[utc ? date.getUTCDay() : date.getDay()];
            },
            j: function (s) {
                return utc ? date.getUTCDate() : date.getDate();
            },
            l: function (s) {
                return ExtendedDate.dayNames[(utc ? date.getUTCDay() : date.getDay()) + 7];
            },
            w: function (s) {
                return utc ? date.getUTCDay() : date.getDay();
            },
            z: function (s) {
                return date.getDayOfTheYear();
            },
            S: function (s) {
                const d = utc ? date.getUTCDate() : date.getDate();
                return [
                    'th',
                    'st',
                    'nd',
                    'rd'
                ][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10];
            },
            W: function (s) {
                return date.getWeekNumber();
            },
            F: function (s) {
                return ExtendedDate.monthNames[(utc ? date.getUTCMonth() : date.getMonth()) + 12];
            },
            m: function (s) {
                return pad(map.n(s));
            },
            M: function (s) {
                return ExtendedDate.monthNames[utc ? date.getUTCMonth() : date.getMonth()];
            },
            n: function (s) {
                return (utc ? date.getUTCMonth() : date.getMonth()) + 1;
            },
            t: function (s) {
                return date.getDaysInMonth();
            },
            Y: function (s) {
                return utc ? date.getUTCFullYear() : date.getFullYear();
            },
            y: function (s) {
                return String(map.Y(s)).slice(2);
            },
            a: function (s) {
                return map.G(s) < 12 ? 'am' : 'pm';
            },
            A: function (s) {
                return map.a(s).toUpperCase();
            },
            g: function (s) {
                return map.G(s) % 12 || 12;
            },
            G: function (s) {
                return utc ? date.getUTCHours() : date.getHours();
            },
            h: function (s) {
                return pad(map.g(s));
            },
            H: function (s) {
                return pad(map.G(s));
            },
            i: function (s) {
                return pad(utc ? date.getUTCMinutes() : date.getMinutes());
            },
            s: function (s) {
                return pad(utc ? date.getUTCSeconds() : date.getSeconds());
            },
            O: function (s) {
                const tzo = -date.getTimezoneOffset();
                const dif = tzo >= 0 ? '+' : '-';
                function ppad(num) {
                    const norm = Math.abs(Math.floor(num));
                    return (norm < 10 ? '0' : '') + norm;
                }
                const str = dif + ppad(tzo / 60) + ':' + ppad(tzo % 60);
                return str;
            },
            T: function (s) {
                if (utc) {
                    return 'UTC';
                }
                const timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
                const zones = String(date.date).match(timezone) || [''];
                return zones.pop().replace(/(\+|\-)[0-9]+$/, '');
            },
            U: function (s) {
                return date.getTime();
            }
        };
        const result = [];
        format.split('').forEach(function (s) {
            result.push(map[s] ? map[s]() : s);
        });
        return result.join('');
    }

    function filter(from, index, shrt, toindex) {
        const list = [];
        for (let i = shrt ? 0 : toindex; i < from.length; i++) {
            list.push(from[i]);
        }
        return list;
    }
    function format(fmt, date) {
        let utc;
        if (typeof fmt === 'undefined' || !fmt) {
            fmt = ExtendedDate.config.defaultFormat;
        } else {
            if (typeof fmt !== 'string') {
                utc = fmt.utc;
                fmt = fmt.format;
            } else {
                utc = ExtendedDate.config.utc;
            }
        }
        return formatDate(date, fmt, utc);
    }
    function _now(now) {
        return now ? now instanceof ExtendedDate ? now.date : now : new Date();
    }
    function _y(y, now) {
        return typeof y === 'undefined' || y === null || y < 0 ? now.getFullYear() : y;
    }
    function _m(m, now) {
        return typeof m === 'undefined' || m === null || m < 0 ? now.getMonth() : m;
    }
    return ExtendedDate;
});