define([
    '../utils/dom',
    '../utils/events',
    '../core/theme'
], function (DOM, Events, Theme) {
    'use strict';
    class BehaviourState {
        constructor(wm, win, action, mousePosition) {
            this.win = win;
            this.$element = win._$element;
            this.$top = win._$top;
            this.$handle = win._$resize;
            this.rectWorkspace = wm.getWindowSpace(true);
            this.rectWindow = {
                x: win._position.x,
                y: win._position.y,
                w: win._dimension.w,
                h: win._dimension.h,
                r: win._dimension.w + win._position.x,
                b: win._dimension.h + win._position.y
            };
            const theme = Object.assign({}, Theme.getStyleTheme(true, true));
            if (!theme.style) {
                theme.style = {
                    'window': {
                        margin: 0,
                        border: 0
                    }
                };
            }
            this.theme = {
                topMargin: theme.style.window.margin || 0,
                borderSize: theme.style.window.border || 0
            };
            this.snapping = {
                cornerSize: wm.getSetting('windowCornerSnap') || 0,
                windowSize: wm.getSetting('windowSnap') || 0
            };
            this.action = action;
            this.moved = false;
            this.direction = null;
            this.startX = mousePosition.x;
            this.startY = mousePosition.y;
            this.minWidth = win._properties.min_width;
            this.minHeight = win._properties.min_height;
            const windowRects = [];
            wm.getWindows().forEach(w => {
                if (w && w._wid !== win._wid) {
                    const pos = w._position;
                    const dim = w._dimension;
                    const rect = {
                        left: pos.x - this.theme.borderSize,
                        top: pos.y - this.theme.borderSize,
                        width: dim.w + this.theme.borderSize * 2,
                        height: dim.h + this.theme.borderSize * 2 + this.theme.topMargin
                    };
                    rect.right = rect.left + rect.width;
                    rect.bottom = pos.y + dim.h + this.theme.topMargin + this.theme.borderSize;
                    windowRects.push(rect);
                }
            });
            this.snapRects = windowRects;
        }
        getRect() {
            const win = this.win;
            return {
                left: win._position.x,
                top: win._position.y,
                width: win._dimension.w,
                height: win._dimension.h
            };
        }
        calculateDirection() {
            const dir = DOM.$position(this.$handle);
            const dirX = this.startX - dir.left;
            const dirY = this.startY - dir.top;
            const dirD = 20;
            const checks = {
                nw: dirX <= dirD && dirY <= dirD,
                n: dirX > dirD && dirY <= dirD,
                w: dirX <= dirD && dirY >= dirD,
                ne: dirX >= dir.width - dirD && dirY <= dirD,
                e: dirX >= dir.width - dirD && dirY > dirD,
                se: dirX >= dir.width - dirD && dirY >= dir.height - dirD,
                sw: dirX <= dirD && dirY >= dir.height - dirD
            };
            let direction = 's';
            Object.keys(checks).forEach(function (k) {
                if (checks[k]) {
                    direction = k;
                }
            });
            this.direction = direction;
        }
    }
    function createWindowBehaviour(win, wm) {
        let current = null;
        let newRect = {};
        function onWindowResize(ev, mousePosition, dx, dy) {
            if (!current || !current.direction) {
                return false;
            }
            let nw, nh, nl, nt;
            (function () {
                if (current.direction.indexOf('s') !== -1) {
                    nh = current.rectWindow.h + dy;
                    newRect.height = Math.max(current.minHeight, nh);
                } else if (current.direction.indexOf('n') !== -1) {
                    nh = current.rectWindow.h - dy;
                    nt = current.rectWindow.y + dy;
                    if (nt < current.rectWorkspace.top) {
                        nt = current.rectWorkspace.top;
                        nh = newRect.height;
                    } else {
                        if (nh < current.minHeight) {
                            nt = current.rectWindow.b - current.minHeight;
                        }
                    }
                    newRect.height = Math.max(current.minHeight, nh);
                    newRect.top = nt;
                }
            }());
            (function () {
                if (current.direction.indexOf('e') !== -1) {
                    nw = current.rectWindow.w + dx;
                    newRect.width = Math.max(current.minWidth, nw);
                } else if (current.direction.indexOf('w') !== -1) {
                    nw = current.rectWindow.w - dx;
                    nl = current.rectWindow.x + dx;
                    if (nw < current.minWidth) {
                        nl = current.rectWindow.r - current.minWidth;
                    }
                    newRect.width = Math.max(current.minWidth, nw);
                    newRect.left = nl;
                }
            }());
            return newRect;
        }
        function onWindowMove(ev, mousePosition, dx, dy) {
            let newWidth = null;
            let newHeight = null;
            let newLeft = current.rectWindow.x + dx;
            let newTop = current.rectWindow.y + dy;
            const borderSize = current.theme.borderSize;
            const topMargin = current.theme.topMargin;
            const cornerSnapSize = current.snapping.cornerSize;
            const windowSnapSize = current.snapping.windowSize;
            if (newTop < current.rectWorkspace.top) {
                newTop = current.rectWorkspace.top;
            }
            let newRight = newLeft + current.rectWindow.w + borderSize * 2;
            let newBottom = newTop + current.rectWindow.h + topMargin + borderSize;
            if (cornerSnapSize > 0) {
                if (newLeft - borderSize <= cornerSnapSize && newLeft - borderSize >= -cornerSnapSize) {
                    newLeft = borderSize;
                } else if (newRight >= current.rectWorkspace.width - cornerSnapSize && newRight <= current.rectWorkspace.width + cornerSnapSize) {
                    newLeft = current.rectWorkspace.width - current.rectWindow.w - borderSize;
                }
                if (newTop <= current.rectWorkspace.top + cornerSnapSize && newTop >= current.rectWorkspace.top - cornerSnapSize) {
                    newTop = current.rectWorkspace.top + borderSize;
                } else if (newBottom >= current.rectWorkspace.height + current.rectWorkspace.top - cornerSnapSize && newBottom <= current.rectWorkspace.height + current.rectWorkspace.top + cornerSnapSize) {
                    newTop = current.rectWorkspace.height + current.rectWorkspace.top - current.rectWindow.h - topMargin - borderSize;
                }
            }
            if (windowSnapSize > 0) {
                current.snapRects.every(function (rect) {
                    if (newRight >= rect.left - windowSnapSize && newRight <= rect.left + windowSnapSize) {
                        newLeft = rect.left - (current.rectWindow.w + borderSize * 2);
                        return false;
                    }
                    if (newLeft - borderSize <= rect.right + windowSnapSize && newLeft - borderSize >= rect.right - windowSnapSize) {
                        newLeft = rect.right + borderSize * 2;
                        return false;
                    }
                    if (newBottom >= rect.top - windowSnapSize && newBottom <= rect.top + windowSnapSize) {
                        newTop = rect.top - (current.rectWindow.h + borderSize * 2 + topMargin);
                        return false;
                    }
                    if (newTop <= rect.bottom + windowSnapSize && newTop >= rect.bottom - windowSnapSize) {
                        newTop = rect.bottom + borderSize * 2;
                        return false;
                    }
                    return true;
                });
            }
            return {
                left: newLeft,
                top: newTop,
                width: newWidth,
                height: newHeight
            };
        }
        function onMouseUp(ev, action, win, mousePosition) {
            if (!current) {
                return;
            }
            if (current.moved) {
                if (action === 'move') {
                    win._onChange('move', true);
                    win._emit('moved', [
                        win._position.x,
                        win._position.y
                    ]);
                } else if (action === 'resize') {
                    win._onChange('resize', true);
                    win._emit('resized', [
                        win._dimension.w,
                        win._dimension.h
                    ]);
                }
            }
            current.$element.setAttribute('data-hint', '');
            document.body.setAttribute('data-window-hint', '');
            win._emit('postop');
            current = null;
        }
        function onMouseMove(ev, action, win, mousePosition) {
            if (!wm.getMouseLocked() || !action || !current) {
                return;
            }
            ev.preventDefault();
            let result;
            const dx = mousePosition.x - current.startX;
            const dy = mousePosition.y - current.startY;
            if (action === 'move') {
                result = onWindowMove(ev, mousePosition, dx, dy);
            } else {
                result = onWindowResize(ev, mousePosition, dx, dy);
            }
            if (result) {
                if (result.left !== null && result.top !== null) {
                    win._move(result.left, result.top);
                    win._emit('move', [
                        result.left,
                        result.top
                    ]);
                }
                if (result.width !== null && result.height !== null) {
                    win._resize(result.width, result.height, true);
                    win._emit('resize', [
                        result.width,
                        result.height
                    ]);
                }
            }
            current.moved = true;
        }
        function onMouseDown(ev, action, win, mousePosition) {
            ev.preventDefault();
            if (win._state.maximized) {
                return;
            }
            current = new BehaviourState(wm, win, action, mousePosition);
            newRect = {};
            win._focus();
            if (action === 'move') {
                current.$element.setAttribute('data-hint', 'moving');
                document.body.setAttribute('data-window-hint', 'moving');
            } else {
                current.calculateDirection();
                current.$element.setAttribute('data-hint', 'resizing');
                document.body.setAttribute('data-window-hint', 'resizing');
                newRect = current.getRect();
            }
            win._emit('preop');
            function _onMouseMove(ev, pos) {
                ev.preventDefault();
                if (wm._mouselock) {
                    onMouseMove(ev, action, win, pos);
                }
            }
            function _onMouseUp(ev, pos) {
                onMouseUp(ev, action, win, pos);
                Events.$unbind(document, 'pointermove:movewindow,touchmove:movewindowTouch');
                Events.$unbind(document, 'pointerup:movewindowstop,touchend:movewindowstopTouch');
            }
            Events.$bind(document, 'pointermove:movewindow,touchmove:movewindowTouch', _onMouseMove, false);
            Events.$bind(document, 'pointerup:movewindowstop,touchend:movewindowstopTouch', _onMouseUp, false);
        }
        if (win._properties.allow_move) {
            Events.$bind(win._$top, 'pointerdown,touchstart', (ev, pos) => {
                ev.preventDefault();
                if (!win._destroyed) {
                    onMouseDown(ev, 'move', win, pos);
                }
            }, true);
        }
        if (win._properties.allow_resize) {
            Events.$bind(win._$resize, 'pointerdown,touchstart', (ev, pos) => {
                ev.preventDefault();
                if (!win._destroyed) {
                    onMouseDown(ev, 'resize', win, pos);
                }
            });
        }
    }
    return { createWindowBehaviour: createWindowBehaviour };
});