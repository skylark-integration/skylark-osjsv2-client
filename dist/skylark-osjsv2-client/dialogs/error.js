/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../core/dialog","../core/locales","../core/config"],function(e,t,n){"use strict";return class extends e{constructor(e,n){const s=(e=Object.assign({},{},e)).exception||{};let i="";s.stack?i=s.stack:Object.keys(s).length&&(i=s.name,i+="\nFilename: "+s.fileName||"<unknown>",i+="\nLine: "+s.lineNumber,i+="\nMessage: "+s.message,s.extMessage&&(i+="\n"+s.extMessage)),super("ErrorDialog",{title:e.title||t._("DIALOG_ERROR_TITLE"),icon:"status/dialog-error.png",width:400,height:i?400:200},e,n),this._sound="ERROR",this._soundVolume=1,this.traceMessage=i}init(){const t=super.init(...arguments);t.setAttribute("role","alertdialog");const s=e.parseMessage(this.args.message);return this._find("Message").empty().append(s),this._find("Summary").set("value",this.args.error),this._find("Trace").set("value",this.traceMessage),this.traceMessage||(this._find("Trace").hide(),this._find("TraceLabel").hide()),this.args.bugreport?this._find("ButtonBugReport").on("click",()=>{let e="",t=[];if(n.getConfig("BugReporting.options.issue")){const s={};["userAgent","platform","language","appVersion"].forEach(e=>{s[e]=navigator[e]}),e=n.getConfig("BugReporting.options.title"),t=["**"+n.getConfig("BugReporting.options.message").replace("%VERSION%",n.getConfig("Version"))+":**","\n","> "+this.args.message,"\n","> "+(this.args.error||"Unknown error"),"\n","## Expected behaviour","\n","## Actual behaviour","\n","## Steps to reproduce the error","\n","## (Optinal) Browser and OS information","\n","```\n"+JSON.stringify(s)+"\n```"],this.traceMessage&&t.push("\n## Stack Trace \n```\n"+this.traceMessage+"\n```\n")}const s=n.getConfig("BugReporting.url").replace("%TITLE%",encodeURIComponent(e)).replace("%BODY%",encodeURIComponent(t.join("\n")));window.open(s)}):this._find("ButtonBugReport").hide(),t}}});
//# sourceMappingURL=../sourcemaps/dialogs/error.js.map