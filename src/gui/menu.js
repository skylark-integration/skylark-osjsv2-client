define([
    '../utils/gui',
    '../utils/dom',
    '../utils/events',
    './element',
    '../core/window-manager',
    '../helpers/hooks'
], function (GUI, DOM, Events, GUIElement, WindowManager, a) {
    'use strict';
    let lastMenu;
    function clickWrapper(ev, pos, onclick, original) {
        ev.stopPropagation();
        let t = ev.target;
        if (t && t.tagName === 'LABEL') {
            t = t.parentNode;
        }
        let isExpander = false;
        if (t && t.tagName === 'GUI-MENU-ENTRY') {
            let subMenu = t.querySelector('gui-menu');
            isExpander = !!subMenu;
            try {
                if (isExpander && !ev.isTrusted) {
                    t.parentNode.querySelectorAll('gui-menu-entry').forEach(pn => {
                        DOM.$removeClass(pn, 'active');
                    });
                    DOM.$addClass(t, 'active');
                }
            } catch (e) {
                console.warn(e);
            }
            onclick(ev, pos, t, original, isExpander);
        }
    }
    function clamp(r) {
        function _clamp(rm) {
            rm.querySelectorAll('gui-menu-entry').forEach(function (srm) {
                const sm = srm.querySelector('gui-menu');
                if (sm) {
                    sm.style.left = String(-parseInt(sm.offsetWidth, 10)) + 'px';
                    _clamp(sm);
                }
            });
        }
        const pos = DOM.$position(r);
        if (pos && window.innerWidth - pos.right < r.offsetWidth) {
            DOM.$addClass(r, 'gui-overflowing');
            _clamp(r);
        }
        DOM.$addClass(r, 'gui-showing');
    }
    function clampSubMenu(sm) {
        if (sm) {
            const pos = DOM.$position(sm);
            const wm = WindowManager.instance;
            const space = wm.getWindowSpace(true);
            if (pos) {
                const diff = space.height - pos.bottom;
                if (diff < 0) {
                    sm.style.marginTop = String(diff) + 'px';
                }
            }
        }
    }
    function blur(ev) {
        if (lastMenu) {
            lastMenu(ev);
        }
        lastMenu = null;
        a.triggerHook('menuBlur');
    }
    function create(items, ev, customInstance) {
        items = items || [];
        blur(ev);
        let root = customInstance;
        let callbackMap = [];
        function resolveItems(arr, par) {
            arr.forEach(function (iter) {
                const props = {
                    label: iter.title,
                    icon: iter.icon,
                    disabled: iter.disabled,
                    labelHTML: iter.titleHTML,
                    type: iter.type,
                    checked: iter.checked
                };
                const entry = GUI.createElement('gui-menu-entry', props);
                if (iter.menu) {
                    const nroot = GUI.createElement('gui-menu', {});
                    resolveItems(iter.menu, nroot);
                    entry.appendChild(nroot);
                }
                if (iter.onClick) {
                    const index = callbackMap.push(iter.onClick);
                    entry.setAttribute('data-callback-id', String(index - 1));
                }
                par.appendChild(entry);
            });
        }
        if (!root) {
            root = GUI.createElement('gui-menu', {});
            resolveItems(items || [], root);
            GUIElement.createFromNode(root, null, 'gui-menu').build(true);
            Events.$bind(root, 'mouseover', function (ev, pos) {
                if (ev.target && ev.target.tagName === 'GUI-MENU-ENTRY') {
                    setTimeout(() => {
                        clampSubMenu(ev.target.querySelector('gui-menu'));
                    }, 1);
                }
            }, true);
            Events.$bind(root, 'click', function (ev, pos) {
                clickWrapper(ev, pos, function (ev, pos, t, orig, isExpander) {
                    const index = parseInt(t.getAttribute('data-callback-id'), 10);
                    if (callbackMap[index]) {
                        callbackMap[index](ev, pos);
                    }
                    if (!isExpander) {
                        blur(ev);
                    }
                });
            }, true);
        }
        if (root.$element) {
            root = root.$element;
        }
        const wm = WindowManager.instance;
        const space = wm.getWindowSpace(true);
        const pos = Events.mousePosition(ev);
        DOM.$addClass(root, 'gui-root-menu');
        root.style.left = pos.x + 'px';
        root.style.top = pos.y + 'px';
        document.body.appendChild(root);
        setTimeout(function () {
            const pos = DOM.$position(root);
            if (pos) {
                if (pos.right > space.width) {
                    const newLeft = Math.round(space.width - pos.width);
                    root.style.left = Math.max(0, newLeft) + 'px';
                }
                if (pos.bottom > space.height) {
                    const newTop = Math.round(space.height - pos.height);
                    root.style.top = Math.max(0, newTop) + 'px';
                }
            }
            clamp(root);
            lastMenu = function () {
                callbackMap = [];
                if (root) {
                    root.querySelectorAll('gui-menu-entry').forEach(function (el) {
                        Events.$unbind(el);
                    });
                    Events.$unbind(root);
                }
                root = DOM.$remove(root);
            };
        }, 1);
    }
    function setActive(menu) {
        blur();
        lastMenu = menu;
    }
    return {
        clickWrapper: clickWrapper,
        clamp: clamp,
        blur: blur,
        create: create,
        setActive: setActive
    };
});