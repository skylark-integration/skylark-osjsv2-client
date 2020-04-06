define(['./event-handler'], function (EventHandler) {
    'use strict';
    let handler = new EventHandler('core-hooks', [
        'initialize',
        'initialized',
        'sessionLoaded',
        'shudown',
        'processStart',
        'processStarted',
        'menuBlur'
    ]);
    function triggerHook(name, args, thisarg) {
        if (handler) {
            handler.emit(name, args, thisarg, true);
        }
    }
    function addHook(name, fn) {
        if (handler) {
            return handler.on(name, fn);
        }
        return -1;
    }
    function removeHook(name, index) {
        if (handler) {
            return handler.off(name, index);
        }
        return false;
    }
    return {
        triggerHook: triggerHook,
        addHook: addHook,
        removeHook: removeHook
    };
});