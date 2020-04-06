define([
    "./scheme.html"
], function (schemeHtml) {

  const DefaultApplication = OSjs.require('helpers/default-application');
  const DefaultApplicationWindow = OSjs.require('helpers/default-application-window');

  class ApplicationHTMLViewerWindow extends DefaultApplicationWindow {

    constructor(app, metadata, file) {
      super('ApplicationHTMLViewerWindow', {
        icon: metadata.icon,
        title: metadata.name,
        width: 400,
        height: 200
      }, app, file);
    }

    init(wmRef, app) {
      const root = super.init(...arguments);
      this._render('HTMLViewerWindow', schemeHtml);
      return root;
    }

    showFile(file, url) {
      if ( this._scheme ) {
        this._find('iframe').set('src', url);
      }
      super.showFile(...arguments);
    }
  }

  class ApplicationHTMLViewer extends DefaultApplication {

    constructor(args, metadata) {
      super('ApplicationHTMLViewer', args, metadata, {
        extension: 'html',
        mime: 'text/htm',
        filename: 'index.html',
        fileypes: ['htm', 'html'],
        readData: false
      });
    }

    init(settings, metadata) {
      super.init(...arguments);

      const file = this._getArgument('file');
      this._addWindow(new ApplicationHTMLViewerWindow(this, metadata, file));
    }
  }

  OSjs.Applications.ApplicationHTMLViewer = ApplicationHTMLViewer;

});