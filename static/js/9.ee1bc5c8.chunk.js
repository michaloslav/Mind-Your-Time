(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{1020:function(e,t,n){},1197:function(e,t,n){"use strict";n.r(t);var a=n(30),o=n(53),r=n(54),l=n(68),i=n(67),s=n(69),u=n(1),c=n.n(u),d=n(767),f=n(756),p=n.n(f),m=n(898),h=n.n(m),v=n(752),b=n.n(v),y=n(770),C=n.n(y),g=n(771),k=n.n(g),E=n(759),j=n.n(E),O=n(753),w=n.n(O),N=n(150),D=n.n(N),S=n(772),T=n.n(S),I=n(159),P=n.n(I),M=n(754),x=n.n(M),_=n(875),R=n.n(_),F=n(155),A=n(151),B=n(841),U=(n(1020),{general:{order:0,label:"General settings",icon:"settings"},detection:{order:1,label:"Automatic detection",icon:"search"},misc:{order:2,label:"Miscellaneous",icon:"menu"}}),L={timeFormat24H:{label:"Use the 24-hour time format",type:"boolean",section:"general",order:0,icon:"timer"},bufferTimePercentage:{label:"Bufffer time percentage",type:"percentage",max:1,tooltip:"Buffer times are short breaks inserted after each project. Their length depends on the length of the project before them. This field determines what percentage of the previous project's duration the buffer will be.",section:"general",order:1,icon:"view_week"},showResetButtonAfter:{label:"Show reset button after (hours)",type:"int",section:"misc",order:3,icon:"restore"},defaultColors:{label:"Default colors:",type:"colors",section:"misc",order:0,icon:"color_lens"},updateTimesAfterDrag:{label:"Adjust planned times after changing the order of projects",type:"boolean",section:"detection",order:0,icon:"swap_vert"},updateTimesAfterEdit:{label:"Adjust planned times after editing a project",type:"boolean",section:"detection",order:1,icon:"edit"},updateTimesAfterDelete:{label:"Adjust planned times after deleting a project",type:"boolean",section:"detection",order:2,icon:"delete"},roundTo:{label:"Round to (minutes)",type:"int",section:"misc",order:2,icon:"access_time"},changeModeOnTab:{label:"Change mode when the Tab key is pressed",type:"boolean",section:"misc",order:1,icon:"redo"},detectBreaksAutomatically:{label:"Detect breaks automatically",type:"boolean",section:"detection",order:3,icon:"pause"},adjustDurationOnPause:{label:"If you set progress to a number higher than the project's duration, adjust its duration",type:"boolean",section:"detection",order:4,icon:"input"},offerToAdjustDurationOnDone:{label:"If a project takes longer than expected, offer to adjust its duration",type:"boolean",section:"detection",order:5,icon:"build"},darkTheme:{label:"Dark theme",type:"boolean",section:"general",order:0,icon:"invert_colors"}},H=function(e){function t(e){var n;return Object(o.a)(this,t),(n=Object(l.a)(this,Object(i.a)(t).call(this,e))).save=function(){for(var e=n.state.inputs,t=Object.keys(e),a=0;a<t.length;a++)if(L[t[a]]&&"percentage"===L[t[a]].type&&"%"===e[t[a]]){var o=n.state.showErrors;return o[t[a]]=!0,void n.setState({showErrors:o})}n.props.update({settings:e}),n.props.history.push("/")},n.resetToDefault=function(){window.confirm("Are you sure you want to reset your settings back to default?")&&(n.setState({inputs:n.props.defaultSettings}),n.props.update({settings:n.props.defaultSettings}))},n.handleFirstSectionIconClick=function(){var e=n.state.temp.firstSectionIconClickCounter;if(e||(e=0),++e>12)if(localStorage.devUnlocked)window.confirm("Are you sure you want to turn off dev options?")&&localStorage.removeItem("devUnlocked");else if(window.confirm("Howdy there! Looks like you just clicked the settings icon 13 times\nin a row which means a) you just had a stroke or b) you're trying to unlock developer options.\nIf it's the former, please seek help immediately. If the latter, click OK.")){localStorage.devUnlocked=!0,clearTimeout(n.state.temp.firstSectionIconClickCounterTimeout);var t=n.state.temp;delete t.firstSectionIconClickCounter,delete t.firstSectionIconClickCounterTimeout,n.setState({temp:t})}clearTimeout(n.state.temp.firstSectionIconClickCounterTimeout);var o=setTimeout(function(){n.setState({temp:Object(a.a)({},n.state.temp,{firstSectionIconClickCounter:0})})},3e3);n.setState({temp:Object(a.a)({},n.state.temp,{firstSectionIconClickCounter:e,firstSectionIconClickCounterTimeout:o})})},n.state={inputs:n.props.settings,showErrors:{},temp:{}},n}return Object(s.a)(t,e),Object(r.a)(t,[{key:"componentDidUpdate",value:function(){!Object.keys(this.state.inputs).length&&this.props.settings&&this.setState({inputs:this.props.settings})}},{key:"componentWillUnmount",value:function(){clearTimeout(this.state.temp.firstSectionIconClickCounterTimeout)}},{key:"handleInputChange",value:function(e,t){var n="boolean"===L[e].type?t.target.checked:t.target.value;switch(L[e].type){case"int":if(isNaN(n)&&""!==n)return;break;case"percentage":var a=n.split("%")[0];if(""!==a&&(n=a/100),isNaN(n)&&"%"!==n)return}if(!("undefined"!==typeof L[e].max&&n>L[e].max)){var o={inputs:this.state.inputs,showErrors:this.state.showErrors};o.inputs[e]=n,o.showErrors[e]=!1,this.setState({newState:o})}}},{key:"render",value:function(){var e=this,t=[],n=Object.keys(U);n.sort(function(e,t){return U[e].order>U[t].order?1:-1});for(var a=function(){var a=n[o],r=Object.keys(e.state.inputs).filter(function(e){return L[e].section===a});r.sort(function(e,t){return L[e].order>L[t].order?1:-1}),t.push(r)},o=0;o<n.length;o++)a();return c.a.createElement("div",{className:"Settings container"},c.a.createElement(C.a,null,c.a.createElement(k.a,null,t.map(function(t,n){var a=Object.keys(U).find(function(e){return U[e].order===n});return c.a.createElement(c.a.Fragment,{key:n},c.a.createElement(j.a,null,c.a.createElement(w.a,{className:"sectionIconCell"},c.a.createElement(R.a,{onClick:n?function(){}:e.handleFirstSectionIconClick},U[a].icon)),c.a.createElement(w.a,{colSpan:3},c.a.createElement(P.a,{variant:"h5",style:{paddingTop:"2.5rem"}},U[a].label,":"))),t.map(function(t,n){return"defaultColors"===t?c.a.createElement(j.a,{key:n},c.a.createElement(w.a,{className:"iconCell"},c.a.createElement(R.a,null,L[t].icon)),c.a.createElement(w.a,null,"Default colors:"),c.a.createElement(A.a.Consumer,null,function(t){return t?c.a.createElement(w.a,{className:"value"},c.a.createElement(F.Link,{to:"/settings/defaultColors","aria-label":"Set default colors"},c.a.createElement(b.a,{variant:"outlined"},"Set"))):c.a.createElement(w.a,{id:"defaultColorsCell",className:"value"},e.state.inputs.defaultColors.map(function(t,n){return c.a.createElement("div",{key:n},c.a.createElement(d.a,{value:t,onChange:e.props.onDefaultColorChange.bind(e,n)}),c.a.createElement("div",{className:"removeDefaultColorDiv"},c.a.createElement(D.a,{"aria-label":"Remove the color",className:"removeDefaultColor",disableRipple:!0,onClick:e.props.removeDefaultColor.bind(e,n)},c.a.createElement(R.a,null,"remove"))))}),c.a.createElement(D.a,{id:"addDefaultColor","aria-label":"Add a new default color",onClick:e.props.addDefaultColor},c.a.createElement(R.a,null,"add")))}),c.a.createElement(w.a,{className:"rightCell"})):c.a.createElement(j.a,{key:n},c.a.createElement(w.a,{className:"iconCell"},c.a.createElement(R.a,null,L[t].icon)),c.a.createElement(w.a,null,L[t].label,L[t].tooltip&&c.a.createElement(T.a,{title:L[t].tooltip,disableFocusListener:!0,disableTouchListener:!0},c.a.createElement(R.a,{className:"tooltipIcon"},"help")),":"),c.a.createElement(w.a,{className:"value"},"boolean"===L[t].type?c.a.createElement(h.a,{color:"primary",checked:e.state.inputs[t],onChange:e.handleInputChange.bind(e,t),"aria-label":L[t].label}):c.a.createElement(p.a,{value:"percentage"===L[t].type&&"%"!==e.state.inputs[t]?100*e.state.inputs[t]+"%":e.state.inputs[t],onChange:e.handleInputChange.bind(e,t),error:e.state.showErrors[t],"aria-label":L[t].label})),c.a.createElement(w.a,{className:"rightCell"}))}))}),c.a.createElement(j.a,null,c.a.createElement(w.a,{colSpan:4},c.a.createElement(x.a,{container:!0,alignItems:"baseline",justify:"space-around"},c.a.createElement(x.a,null,c.a.createElement(b.a,{onClick:this.save,variant:"contained",color:"primary"},"Save")),c.a.createElement(x.a,null,c.a.createElement(b.a,{onClick:this.resetToDefault,variant:"contained"},"Reset to default"))))))))}}]),t}(u.Component);t.default=Object(B.a)(H)},755:function(e,t,n){"use strict";var a=n(4);Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){var t=function(t){return r.default.createElement(i.default.Consumer,null,function(n){return r.default.createElement(e,(0,o.default)({muiFormControl:n},t))})};0;return(0,l.default)(t,e),t};var o=a(n(18)),r=a(n(1)),l=a(n(112)),i=a(n(787));n(38)},758:function(e,t,n){"use strict";var a=n(4);Object.defineProperty(t,"__esModule",{value:!0}),t.cloneElementWithClassName=l,t.cloneChildrenWithClassName=function(e,t){return o.default.Children.map(e,function(e){return o.default.isValidElement(e)&&l(e,t)})},t.isMuiElement=function(e,t){return o.default.isValidElement(e)&&-1!==t.indexOf(e.type.muiName)},t.setRef=function(e,t){"function"===typeof e?e(t):e&&(e.current=t)};var o=a(n(1)),r=a(n(61));function l(e,t){return o.default.cloneElement(e,{className:(0,r.default)(e.props.className,t)})}},767:function(e,t,n){"use strict";n.d(t,"a",function(){return u});var a=n(53),o=n(68),r=n(67),l=n(69),i=n(1),s=n.n(i),u=(n(783),function(e){function t(e){var n;return Object(a.a)(this,t),(n=Object(o.a)(this,Object(r.a)(t).call(this,e))).render=function(){return s.a.createElement("span",{className:"ColorPicker"},s.a.createElement("input",{className:"colorInput",ref:function(e){return n.colorInput=e},type:"color","aria-label":"Color",value:n.props.value,onChange:function(e){n.props.onChange(e.target.value)}}),s.a.createElement("svg",{width:n.props.xl?50:20,height:n.props.xl?30:20,onClick:function(){n.colorInput.click()}},n.props.xl?s.a.createElement("rect",{width:"50",height:"30",rx:"5",ry:"5",style:{fill:n.props.value}}):s.a.createElement("circle",{cx:"10",cy:"10",r:".5rem",fill:n.props.value})))},n.state={},n.colorInput=s.a.createRef(),n}return Object(l.a)(t,e),t}(i.Component))},776:function(e,t,n){"use strict";var a=n(4);Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"default",{enumerable:!0,get:function(){return o.default}});var o=a(n(815))},783:function(e,t,n){},787:function(e,t,n){"use strict";var a=n(4);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var o=a(n(1)).default.createContext();t.default=o},815:function(e,t,n){"use strict";var a=n(4);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var o=a(n(44)),r=a(n(45)),l=a(n(46)),i=a(n(47)),s=a(n(48)),u=a(n(1)),c=a(n(72)),d=(a(n(16)),n(38),n(758));var f=function(e){function t(){return(0,o.default)(this,t),(0,l.default)(this,(0,i.default)(t).apply(this,arguments))}return(0,s.default)(t,e),(0,r.default)(t,[{key:"componentDidMount",value:function(){this.ref=c.default.findDOMNode(this),(0,d.setRef)(this.props.rootRef,this.ref)}},{key:"componentDidUpdate",value:function(e){var t=c.default.findDOMNode(this);e.rootRef===this.props.rootRef&&this.ref===t||(e.rootRef!==this.props.rootRef&&(0,d.setRef)(e.rootRef,null),this.ref=t,(0,d.setRef)(this.props.rootRef,this.ref))}},{key:"componentWillUnmount",value:function(){this.ref=null,(0,d.setRef)(this.props.rootRef,null)}},{key:"render",value:function(){return this.props.children}}]),t}(u.default.Component);t.default=f},824:function(e,t,n){"use strict";var a=n(4);Object.defineProperty(t,"__esModule",{value:!0}),t.default=t.styles=void 0;var o=a(n(18)),r=a(n(32)),l=a(n(23)),i=a(n(44)),s=a(n(45)),u=a(n(46)),c=a(n(47)),d=a(n(48)),f=a(n(1)),p=(a(n(16)),a(n(61))),m=a(n(755)),h=a(n(62)),v=a(n(150)),b={root:{display:"inline-flex",alignItems:"center",transition:"none","&:hover":{backgroundColor:"transparent"}},checked:{},disabled:{},input:{cursor:"inherit",position:"absolute",opacity:0,width:"100%",height:"100%",top:0,left:0,margin:0,padding:0}};t.styles=b;var y=function(e){function t(e){var n;return(0,i.default)(this,t),(n=(0,u.default)(this,(0,c.default)(t).call(this))).handleFocus=function(e){n.props.onFocus&&n.props.onFocus(e);var t=n.props.muiFormControl;t&&t.onFocus&&t.onFocus(e)},n.handleBlur=function(e){n.props.onBlur&&n.props.onBlur(e);var t=n.props.muiFormControl;t&&t.onBlur&&t.onBlur(e)},n.handleInputChange=function(e){var t=e.target.checked;n.isControlled||n.setState({checked:t}),n.props.onChange&&n.props.onChange(e,t)},n.isControlled=null!=e.checked,n.state={},n.isControlled||(n.state.checked=void 0!==e.defaultChecked&&e.defaultChecked),n}return(0,d.default)(t,e),(0,s.default)(t,[{key:"render",value:function(){var e,t=this.props,n=t.autoFocus,a=t.checked,i=t.checkedIcon,s=t.classes,u=t.className,c=t.defaultChecked,d=t.disabled,m=t.icon,h=t.id,b=t.inputProps,y=t.inputRef,C=t.muiFormControl,g=t.name,k=(t.onBlur,t.onChange,t.onFocus,t.readOnly),E=t.required,j=t.tabIndex,O=t.type,w=t.value,N=(0,l.default)(t,["autoFocus","checked","checkedIcon","classes","className","defaultChecked","disabled","icon","id","inputProps","inputRef","muiFormControl","name","onBlur","onChange","onFocus","readOnly","required","tabIndex","type","value"]),D=d;C&&"undefined"===typeof D&&(D=C.disabled);var S=this.isControlled?a:this.state.checked,T="checkbox"===O||"radio"===O;return f.default.createElement(v.default,(0,o.default)({component:"span",className:(0,p.default)(s.root,(e={},(0,r.default)(e,s.checked,S),(0,r.default)(e,s.disabled,D),e),u),disabled:D,tabIndex:null,role:void 0,onFocus:this.handleFocus,onBlur:this.handleBlur},N),S?i:m,f.default.createElement("input",(0,o.default)({autoFocus:n,checked:a,defaultChecked:c,className:s.input,disabled:D,id:T&&h,name:g,onChange:this.handleInputChange,readOnly:k,ref:y,required:E,tabIndex:j,type:O,value:w},b)))}}]),t}(f.default.Component),C=(0,h.default)(b,{name:"MuiPrivateSwitchBase"})((0,m.default)(y));t.default=C},826:function(e,t,n){"use strict";var a=n(4);Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"default",{enumerable:!0,get:function(){return o.default}});var o=a(n(827))},827:function(e,t,n){"use strict";var a=n(4);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var o=a(n(44)),r=a(n(45)),l=a(n(46)),i=a(n(47)),s=a(n(48)),u=a(n(1)),c=a(n(72)),d=(a(n(16)),a(n(145)));n(38);var f=function(e){function t(){var e,n;(0,o.default)(this,t);for(var a=arguments.length,r=new Array(a),s=0;s<a;s++)r[s]=arguments[s];return(n=(0,l.default)(this,(e=(0,i.default)(t)).call.apply(e,[this].concat(r)))).getMountNode=function(){return n.mountNode},n}return(0,s.default)(t,e),(0,r.default)(t,[{key:"componentDidMount",value:function(){this.setMountNode(this.props.container),this.props.disablePortal||this.forceUpdate(this.props.onRendered)}},{key:"componentDidUpdate",value:function(e){var t=this;e.container===this.props.container&&e.disablePortal===this.props.disablePortal||(this.setMountNode(this.props.container),this.props.disablePortal||this.forceUpdate(function(){t.props.onRendered&&(clearTimeout(t.renderedTimer),t.renderedTimer=setTimeout(t.props.onRendered))}))}},{key:"componentWillUnmount",value:function(){this.mountNode=null,clearTimeout(this.renderedTimer)}},{key:"setMountNode",value:function(e){var t;this.props.disablePortal?this.mountNode=c.default.findDOMNode(this).parentElement:this.mountNode=function(e,t){return e="function"===typeof e?e():e,c.default.findDOMNode(e)||t}(e,(t=this,(0,d.default)(c.default.findDOMNode(t))).body)}},{key:"render",value:function(){var e=this.props,t=e.children;return e.disablePortal?t:this.mountNode?c.default.createPortal(t,this.mountNode):null}}]),t}(u.default.Component);f.defaultProps={disablePortal:!1};var p=f;t.default=p},836:function(e,t,n){"use strict";var a=n(4);Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"default",{enumerable:!0,get:function(){return o.default}});var o=a(n(837))},837:function(e,t,n){"use strict";var a=n(4);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var o=a(n(18)),r=a(n(23)),l=a(n(44)),i=a(n(45)),s=a(n(46)),u=a(n(47)),c=a(n(48)),d=a(n(1)),f=(a(n(16)),a(n(154))),p=a(n(153)),m=n(161);function h(e){return"scale(".concat(e,", ").concat(Math.pow(e,2),")")}var v={entering:{opacity:1,transform:h(1)},entered:{opacity:1,transform:"".concat(h(1)," translateZ(0)")}},b=function(e){function t(){var e,n;(0,l.default)(this,t);for(var a=arguments.length,o=new Array(a),r=0;r<a;r++)o[r]=arguments[r];return(n=(0,s.default)(this,(e=(0,u.default)(t)).call.apply(e,[this].concat(o)))).handleEnter=function(e){var t=n.props,a=t.theme,o=t.timeout;(0,m.reflow)(e);var r=(0,m.getTransitionProps)(n.props,{mode:"enter"}),l=r.duration,i=r.delay,s=0;"auto"===o?(s=a.transitions.getAutoHeightDuration(e.clientHeight),n.autoTimeout=s):s=l,e.style.transition=[a.transitions.create("opacity",{duration:s,delay:i}),a.transitions.create("transform",{duration:.666*s,delay:i})].join(","),n.props.onEnter&&n.props.onEnter(e)},n.handleExit=function(e){var t=n.props,a=t.theme,o=t.timeout,r=0,l=(0,m.getTransitionProps)(n.props,{mode:"exit"}),i=l.duration,s=l.delay;"auto"===o?(r=a.transitions.getAutoHeightDuration(e.clientHeight),n.autoTimeout=r):r=i,e.style.transition=[a.transitions.create("opacity",{duration:r,delay:s}),a.transitions.create("transform",{duration:.666*r,delay:s||.333*r})].join(","),e.style.opacity="0",e.style.transform=h(.75),n.props.onExit&&n.props.onExit(e)},n.addEndListener=function(e,t){"auto"===n.props.timeout&&(n.timer=setTimeout(t,n.autoTimeout||0))},n}return(0,c.default)(t,e),(0,i.default)(t,[{key:"componentWillUnmount",value:function(){clearTimeout(this.timer)}},{key:"render",value:function(){var e=this.props,t=e.children,n=(e.onEnter,e.onExit,e.style),a=(e.theme,e.timeout),l=(0,r.default)(e,["children","onEnter","onExit","style","theme","timeout"]),i=(0,o.default)({},n,d.default.isValidElement(t)?t.props.style:{});return d.default.createElement(f.default,(0,o.default)({appear:!0,onEnter:this.handleEnter,onExit:this.handleExit,addEndListener:this.addEndListener,timeout:"auto"===a?null:a},l),function(e,n){return d.default.cloneElement(t,(0,o.default)({style:(0,o.default)({opacity:0,transform:h(.75)},v[e],i)},n))})}}]),t}(d.default.Component);b.defaultProps={timeout:"auto"},b.muiSupportAuto=!0;var y=(0,p.default)()(b);t.default=y},841:function(e,t,n){"use strict";var a=n(53),o=n(54),r=n(68),l=n(67),i=n(69),s=n(152),u=n(1),c=n.n(u);t.a=function(e){return function(t){function n(t){var o;Object(a.a)(this,n),(o=Object(r.a)(this,Object(l.a)(n).call(this,t))).addDefaultColor=function(){var e=o.state.defaultColors,t="#"+(16777216*Math.random()).toString(16).substr(0,6);e.push(t),o.setState({defaultColors:e})},o.save=function(){"function"===typeof o.props.save&&o.props.save(o.state.defaultColors)},o.render=function(){return c.a.createElement(e,Object.assign({},o.props,{onDefaultColorChange:o.handleDefaultColorChange.bind(Object(s.a)(Object(s.a)(o))),addDefaultColor:o.addDefaultColor,removeDefaultColor:o.removeDefaultColor.bind(Object(s.a)(Object(s.a)(o))),save:o.save}))};var i={};return o.props.settings&&o.props.settings.defaultColors&&(i.defaultColors=o.props.settings.defaultColors),o.state=i,o}return Object(i.a)(n,t),Object(o.a)(n,[{key:"componentDidUpdate",value:function(){"undefined"===typeof this.state.defaultColors&&this.props.settings&&this.setState({defaultColors:this.props.settings.defaultColors})}},{key:"handleDefaultColorChange",value:function(e,t){var n=this.state.defaultColors;n[e]=t,this.setState({defaultColors:n})}},{key:"removeDefaultColor",value:function(e){var t=this.state.defaultColors;t.splice(e,1),this.setState({defaultColors:t})}}]),n}(u.Component)}}}]);
//# sourceMappingURL=9.ee1bc5c8.chunk.js.map