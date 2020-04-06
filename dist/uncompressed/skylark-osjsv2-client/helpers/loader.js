define(function () {
    'use strict';
    class Loader {
        constructor() {
            this.loaders = {};
            this.loaderGraze = {};
            this.$container = document.createElement('osjs-loaders');
        }
        create(name, opts) {
            opts = opts || {};
            if (!this.$container.parentNode) {
                document.body.appendChild(this.$container);
            }
            if (this.loaders[name]) {
                return;
            }
            const el = document.createElement('osjs-loading');
            el.title = opts.title || '';
            if (opts.icon) {
                const img = document.createElement('img');
                img.src = opts.icon;
                el.appendChild(img);
            }
            this.$container.appendChild(el);
            this.loaderGraze[name] = setTimeout(() => {
                el.style.display = 'inline-block';
            }, 100);
            this.loaders[name] = el;
        }
        destroy(name) {
            if (!this.loaders[name]) {
                return;
            }
            clearTimeout(this.loaderGraze[name]);
            this.loaders[name].remove();
            delete this.loaders[name];
            delete this.loaderGraze[name];
        }
    }
    return new Loader();
});