/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(function(){"use strict";const e=function(){function e(){return document.createElement("canvas").getContext?document.createElement("canvas"):null}function t(){return document.createElement("video").canPlayType?document.createElement("video"):null}function n(e,t){return function(e,t,n){const o={};return Object.keys(t).forEach(e=>{let r=t[e],a=!1;r instanceof Array?r.forEach(e=>!(a=n(e))):a=n(r),o[e]=a}),o}(0,t,t=>{try{return!!e.canPlayType(t)}catch(e){}return!1})}function o(){return document.createElement("audio").canPlayType?document.createElement("audio"):null}const r=(()=>{const t=[];return()=>{if(!t.length){const n=e();if(n){["2d","webgl","experimental-webgl","webkit-3d","moz-webgl"].forEach((e,o)=>{try{n.getContext(e)&&t.push(e)}catch(e){}})}}return t}})();function a(e){let t=!1,n="Webkit Moz ms O".split(" "),o=document.createElement("div"),r=null;if(e=e.toLowerCase(),o.style[e]&&(t=!0),!1===t){r=e.charAt(0).toUpperCase()+e.substr(1);for(let e=0;e<n.length;e++)if(void 0!==o.style[n[e]+r]){t=!0;break}}return t}const i={indexedDB:"indexedDB",localStorage:"localStorage",sessionStorage:"sessionStorage",globalStorage:"globalStorage",openDatabase:"openDatabase",socket:"WebSocket",worker:"Worker",file:"File",blob:"Blob",orientation:"onorientationchange"},c={touch:function(){try{if(navigator.userAgent.match(/Windows NT 6\.(2|3)/))return!1}catch(e){}try{if(navigator.userAgent.match(/iOS|Android|BlackBerry|IEMobile|iPad|iPhone|iPad/i))return!0}catch(e){}return!1}(),upload:function(){try{const e=new XMLHttpRequest;return!!(e&&"upload"in e&&"onprogress"in e.upload)}catch(e){}return!1}(),getUserMedia:function(){let e=!1;return window.navigator&&(e=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia||navigator.msGetUserMedia),!!e}(),fileSystem:"requestFileSystem"in window||"webkitRequestFileSystem"in window,localStorage:!1,sessionStorage:!1,globalStorage:!1,openDatabase:!1,socket:!1,worker:!1,file:!1,blob:!1,orientation:!1,dnd:!!("draggable"in document.createElement("span")),css:{transition:a("transition"),animation:a("animation")},canvas:!!e(),canvasContext:r(),webgl:function(){let e=!1,t=r();try{(e=t.length>1)||"WebGLRenderingContext"in window&&(e=!0)}catch(e){}return e}(),audioContext:!(!window.hasOwnProperty("AudioContext")&&!window.hasOwnProperty("webkitAudioContext")),svg:!!document.createElementNS&&!!document.createElementNS("http://www.w3.org/2000/svg","svg").createSVGRect,video:!!t(),videoTypes:n(t(),{webm:'video/webm; codecs="vp8.0, vorbis"',ogg:'video/ogg; codecs="theora"',h264:['video/mp4; codecs="avc1.42E01E"','video/mp4; codecs="avc1.42E01E, mp4a.40.2"'],mpeg:'video/mp4; codecs="mp4v.20.8"',mkv:'video/x-matroska; codecs="theora, vorbis"'}),audio:!!o(),audioTypes:n(o(),{ogg:'audio/ogg; codecs="vorbis',mp3:"audio/mpeg",wav:'audio/wav; codecs="1"'}),richtext:function(){try{return!!document.createElement("textarea").contentEditable}catch(e){}return!1}()};return Object.keys(i).forEach(e=>{try{c[e]=i[e]in window&&null!==window[i[e]]}catch(e){console.warn(e)}}),()=>c}();return{getCompability:function(){return e()},isIE:function(){return parseInt(document.documentMode,10)<=11||!!navigator.userAgent.match(/(MSIE|Edge)/)}}});
//# sourceMappingURL=../sourcemaps/utils/compability.js.map
