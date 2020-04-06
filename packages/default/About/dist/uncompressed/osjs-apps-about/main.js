define([
    "./scheme.html"
],function(schemeHtml){
  const Window = OSjs.require('core/window');
  const Application = OSjs.require('core/application');

  class ApplicationAboutWindow extends Window {
    constructor(app, metadata) {
      super('ApplicationAboutWindow', {
        icon: metadata.icon,
        title: metadata.name,
        gravity: 'center',
        allow_resize: false,
        allow_maximize: false,
        width: 320,
        height: 320,
        min_width: 320,
        min_height: 320
      }, app);
    }

    init(wm, app) {
      const root = super.init(...arguments);

      this._render('AboutWindow', schemeHtml);

      return root;
    }
  }

  class ApplicationAbout extends Application {
    constructor(args, metadata) {
      super('ApplicationAbout', args, metadata);
    }

    init(settings, metadata) {
      super.init(...arguments);
      this._addWindow(new ApplicationAboutWindow(this, metadata));
    }
  }

  OSjs.Applications.ApplicationAbout = ApplicationAbout;


});

