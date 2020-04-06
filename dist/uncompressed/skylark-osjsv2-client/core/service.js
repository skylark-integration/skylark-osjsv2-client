define([
	'./process'
], function (Process) {
    'use strict';
    return class Service extends Process {
        constructor(name, args, metadata) {
            console.group('Service::constructor()', name);
            super(...arguments);
            console.groupEnd();
        }
    };
});