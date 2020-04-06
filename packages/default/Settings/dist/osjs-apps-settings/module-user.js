/**
 * osjs-apps-settings - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define(function(){"use strict";const e=OSjs.require("core/authenticator");return{group:"user",name:"User",label:"LBL_USER",icon:"apps/user-info.png",button:!1,init:function(){},update:function(n,s,t,r){const u=e.instance.getUser();n._find("UserID").set("value",u.id),n._find("UserName").set("value",u.name),n._find("UserUsername").set("value",u.username),n._find("UserGroups").set("value",u.groups)},render:function(e,n,s,t,r){},save:function(e,n,s,t){}}});
//# sourceMappingURL=sourcemaps/module-user.js.map
