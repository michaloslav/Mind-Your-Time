(window.webpackJsonp=window.webpackJsonp||[]).push([[17,24],{1154:function(e,a,t){},1189:function(e,a,t){"use strict";t.r(a);var n=t(1),l=t.n(n),r=t(764),i=t(619),o=t(756),d=t.n(o),c=t(666),u=t.n(c),s=t(772),m=t.n(s),b=t(773),f=t.n(b),p=t(778),h=t.n(p),g=t(761),k=t.n(g),v=t(755),y=t.n(v),E=t(642),w=t.n(E),C=t(867),x=t.n(C),z=t(106),M=t(172);t(1154);a.default=function(e){return l.a.createElement(d.a,{className:"BreaksView container"},l.a.createElement(r.a,{onClick:e.changeView.bind(void 0,"breaks",!1)}),l.a.createElement(u.a,{variant:"h6",className:"title"},"Breaks"),l.a.createElement(m.a,null,l.a.createElement(h.a,null,l.a.createElement(k.a,null,l.a.createElement(y.a,null,"Name"),l.a.createElement(y.a,null,"Time"),l.a.createElement(y.a,null))),l.a.createElement(f.a,null,e.breaks.length?e.breaks.map(function(a){return l.a.createElement(k.a,{key:a.id},l.a.createElement(y.a,null,a.name),l.a.createElement(y.a,null,l.a.createElement(M.b.Consumer,null,function(e){return z.a.makeString(a.startTime,a.startTime.pm!==a.endTime.pm,!0,e.timeFormat24H)+"-"+z.a.makeString(a.endTime,!0,!0,e.timeFormat24H)})),l.a.createElement(y.a,null,l.a.createElement(w.a,{onClick:e.changeView.bind(void 0,"edit",!0,{type:"break",id:a.id})},l.a.createElement(x.a,null))))}):l.a.createElement(k.a,null,l.a.createElement(y.a,{colSpan:4},"You haven't set any breaks")))),l.a.createElement(i.default,{onClick:e.changeView.bind(void 0,"add",!0,{type:"break"})}))}},614:function(e,a,t){"use strict";var n=t(4);Object.defineProperty(a,"__esModule",{value:!0}),Object.defineProperty(a,"default",{enumerable:!0,get:function(){return l.default}});var l=n(t(615))},615:function(e,a,t){"use strict";var n=t(4);Object.defineProperty(a,"__esModule",{value:!0}),a.default=a.styles=void 0;var l=n(t(32)),r=n(t(23)),i=n(t(18)),o=n(t(1)),d=(n(t(16)),n(t(62))),c=(t(38),n(t(63))),u=n(t(667)),s=t(627),m=function(e){return{root:(0,i.default)({},e.typography.button,{boxSizing:"border-box",minHeight:36,transition:e.transitions.create(["background-color","box-shadow","border"],{duration:e.transitions.duration.short}),borderRadius:"50%",padding:0,minWidth:0,width:56,height:56,boxShadow:e.shadows[6],"&:active":{boxShadow:e.shadows[12]},color:e.palette.getContrastText(e.palette.grey[300]),backgroundColor:e.palette.grey[300],"&$focusVisible":{boxShadow:e.shadows[6]},"&:hover":{backgroundColor:e.palette.grey.A100,"@media (hover: none)":{backgroundColor:e.palette.grey[300]},"&$disabled":{backgroundColor:e.palette.action.disabledBackground},textDecoration:"none"},"&$disabled":{color:e.palette.action.disabled,boxShadow:e.shadows[0],backgroundColor:e.palette.action.disabledBackground}}),label:{width:"100%",display:"inherit",alignItems:"inherit",justifyContent:"inherit"},primary:{color:e.palette.primary.contrastText,backgroundColor:e.palette.primary.main,"&:hover":{backgroundColor:e.palette.primary.dark,"@media (hover: none)":{backgroundColor:e.palette.primary.main}}},secondary:{color:e.palette.secondary.contrastText,backgroundColor:e.palette.secondary.main,"&:hover":{backgroundColor:e.palette.secondary.dark,"@media (hover: none)":{backgroundColor:e.palette.secondary.main}}},extended:{borderRadius:24,padding:"0 16px",width:"auto",minHeight:"auto",minWidth:48,height:48,"&$sizeSmall":{width:"auto",padding:"0 8px",borderRadius:17,minWidth:34,height:34},"&$sizeMedium":{width:"auto",padding:"0 16px",borderRadius:20,minWidth:40,height:40}},focusVisible:{},disabled:{},colorInherit:{color:"inherit"},sizeSmall:{width:40,height:40},sizeMedium:{width:48,height:48}}};function b(e){var a,t=e.children,n=e.classes,c=e.className,m=e.color,b=e.disabled,f=e.disableFocusRipple,p=e.focusVisibleClassName,h=e.size,g=e.variant,k=(0,r.default)(e,["children","classes","className","color","disabled","disableFocusRipple","focusVisibleClassName","size","variant"]);return o.default.createElement(u.default,(0,i.default)({className:(0,d.default)(n.root,(a={},(0,l.default)(a,n.extended,"extended"===g),(0,l.default)(a,n.primary,"primary"===m),(0,l.default)(a,n.secondary,"secondary"===m),(0,l.default)(a,n["size".concat((0,s.capitalize)(h))],"large"!==h),(0,l.default)(a,n.disabled,b),(0,l.default)(a,n.colorInherit,"inherit"===m),a),c),disabled:b,focusRipple:!f,focusVisibleClassName:(0,d.default)(n.focusVisible,p)},k),o.default.createElement("span",{className:n.label},t))}a.styles=m,b.defaultProps={color:"default",component:"button",disabled:!1,disableFocusRipple:!1,size:"large",type:"button",variant:"round"};var f=(0,c.default)(m,{name:"MuiFab"})(b);a.default=f},616:function(e,a,t){},619:function(e,a,t){"use strict";t.r(a);var n=t(1),l=t.n(n),r=t(614),i=t.n(r),o=t(771),d=t.n(o);t(616);a.default=function(e){return l.a.createElement(i.a,{onClick:e.onClick,color:"primary",className:"AddFab","aria-label":"Add a project"},l.a.createElement(d.a,null))}},759:function(e,a,t){"use strict";var n=t(4);Object.defineProperty(a,"__esModule",{value:!0}),a.default=void 0;var l=n(t(1)),r=(0,n(t(665)).default)(l.default.createElement(l.default.Fragment,null,l.default.createElement("path",{fill:"none",d:"M0 0h24v24H0z"}),l.default.createElement("path",{d:"M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"})),"ArrowBack");a.default=r},764:function(e,a,t){"use strict";var n=t(1),l=t.n(n),r=t(642),i=t.n(r),o=t(759),d=t.n(o);t(765);a.a=function(e){return l.a.createElement(i.a,{onClick:e.onClick,className:"BackButton","aria-label":"Back"},l.a.createElement(d.a,null))}},765:function(e,a,t){},867:function(e,a,t){"use strict";var n=t(4);Object.defineProperty(a,"__esModule",{value:!0}),a.default=void 0;var l=n(t(1)),r=(0,n(t(665)).default)(l.default.createElement(l.default.Fragment,null,l.default.createElement("path",{d:"M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"}),l.default.createElement("path",{fill:"none",d:"M0 0h24v24H0z"})),"Edit");a.default=r}}]);
//# sourceMappingURL=17.27243316.chunk.js.map