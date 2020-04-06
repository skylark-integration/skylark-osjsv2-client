define(function () {
    'use strict';
    class SplashScreen {
        constructor() {
            this.$el = document.getElementById('LoadingScreen');
            this.$progress = this.$el ? this.$el.querySelector('.progress') : null;
        }
        watermark(config) {
            if (config.Watermark.enabled) {
                var ver = config.Version || 'unknown version';
                var html = config.Watermark.lines || [];
                var el = document.createElement('osjs-watermark');
                el.setAttribute('aria-hidden', 'true');
                el.innerHTML = html.join('<br />').replace(/%VERSION%/, ver);
                document.body.appendChild(el);
            }
        }
        show() {
            if (this.$el) {
                this.$el.style.display = 'block';
            }
        }
        hide() {
            if (this.$el) {
                this.$el.style.display = 'none';
            }
        }
        update(p, c) {
            if (this.$progress) {
                let per = c ? 0 : 100;
                if (c) {
                    per = p / c * 100;
                }
                this.$progress.style.width = String(per) + '%';
            }
        }
    }
    return new SplashScreen();
});