import{m as q,n as b,r as S,ai as Ct,aj as St,ak as ne,al as Tt,l as Rt,p as Be,am as zt,t as $t,an as Pt,ao as _t,a8 as Lt,ap as Wt,j as re,ab as kt,H as r,J as s,G as C,R as W,aq as Et,E as le,S as Te,V as de,x as At,L as je,ar as Bt,a0 as ce,z as Ie,A as jt,C as j,Q as It,O as I,as as ee,P as Ht,ah as Ot,at as Nt,v as Dt,au as Ft,F as Mt,av as be,ad as te,_ as Vt,a as Ut,c as Xt,b as Y,d as D,w as ae,e as F,N as Gt,h as Re,o as Yt}from"./index-CsP2vrk3.js";import{e as ze,f as qt,o as Kt,N as $e,a as Jt}from"./DataTable-DhHLCY3R.js";import{u as Pe}from"./get-slot-D2RoEEih.js";import{a as Qt}from"./Input-C32BY57l.js";const Zt=ze(".v-x-scroll",{overflow:"auto",scrollbarWidth:"none"},[ze("&::-webkit-scrollbar",{width:0,height:0})]),ea=q({name:"XScroll",props:{disabled:Boolean,onScroll:Function},setup(){const e=S(null);function n(l){!(l.currentTarget.offsetWidth<l.currentTarget.scrollWidth)||l.deltaY===0||(l.currentTarget.scrollLeft+=l.deltaY+l.deltaX,l.preventDefault())}const i=Ct();return Zt.mount({id:"vueuc/x-scroll",head:!0,anchorMetaName:qt,ssr:i}),Object.assign({selfRef:e,handleWheel:n},{scrollTo(...l){var y;(y=e.value)===null||y===void 0||y.scrollTo(...l)}})},render(){return b("div",{ref:"selfRef",onScroll:this.onScroll,onWheel:this.disabled?void 0:this.handleWheel,class:"v-x-scroll"},this.$slots)}});var ta=/\s/;function aa(e){for(var n=e.length;n--&&ta.test(e.charAt(n)););return n}var ra=/^\s+/;function na(e){return e&&e.slice(0,aa(e)+1).replace(ra,"")}var _e=NaN,oa=/^[-+]0x[0-9a-f]+$/i,ia=/^0b[01]+$/i,sa=/^0o[0-7]+$/i,la=parseInt;function Le(e){if(typeof e=="number")return e;if(St(e))return _e;if(ne(e)){var n=typeof e.valueOf=="function"?e.valueOf():e;e=ne(n)?n+"":n}if(typeof e!="string")return e===0?e:+e;e=na(e);var i=ia.test(e);return i||sa.test(e)?la(e.slice(2),i?2:8):oa.test(e)?_e:+e}var fe=function(){return Tt.Date.now()},da="Expected a function",ca=Math.max,ba=Math.min;function fa(e,n,i){var p,l,y,v,f,g,m=0,x=!1,z=!1,P=!0;if(typeof e!="function")throw new TypeError(da);n=Le(n)||0,ne(i)&&(x=!!i.leading,z="maxWait"in i,y=z?ca(Le(i.maxWait)||0,n):y,P="trailing"in i?!!i.trailing:P);function w(u){var L=p,N=l;return p=l=void 0,m=u,v=e.apply(N,L),v}function $(u){return m=u,f=setTimeout(_,n),x?w(u):v}function d(u){var L=u-g,N=u-m,K=n-L;return z?ba(K,y-N):K}function T(u){var L=u-g,N=u-m;return g===void 0||L>=n||L<0||z&&N>=y}function _(){var u=fe();if(T(u))return k(u);f=setTimeout(_,d(u))}function k(u){return f=void 0,P&&p?w(u):(p=l=void 0,v)}function O(){f!==void 0&&clearTimeout(f),m=0,p=g=l=f=void 0}function E(){return f===void 0?v:k(fe())}function h(){var u=fe(),L=T(u);if(p=arguments,l=this,g=u,L){if(f===void 0)return $(g);if(z)return clearTimeout(f),f=setTimeout(_,n),w(g)}return f===void 0&&(f=setTimeout(_,n)),v}return h.cancel=O,h.flush=E,h}var ua="Expected a function";function pa(e,n,i){var p=!0,l=!0;if(typeof e!="function")throw new TypeError(ua);return ne(i)&&(p="leading"in i?!!i.leading:p,l="trailing"in i?!!i.trailing:l),fa(e,n,{leading:p,maxWait:n,trailing:l})}const va=q({name:"Add",render(){return b("svg",{width:"512",height:"512",viewBox:"0 0 512 512",fill:"none",xmlns:"http://www.w3.org/2000/svg"},b("path",{d:"M256 112V400M400 256H112",stroke:"currentColor","stroke-width":"32","stroke-linecap":"round","stroke-linejoin":"round"}))}}),he=Rt("n-tabs"),He={tab:[String,Number,Object,Function],name:{type:[String,Number],required:!0},disabled:Boolean,displayDirective:{type:String,default:"if"},closable:{type:Boolean,default:void 0},tabProps:Object,label:[String,Number,Object,Function]},We=q({__TAB_PANE__:!0,name:"TabPane",alias:["TabPanel"],props:He,slots:Object,setup(e){const n=Be(he,null);return n||zt("tab-pane","`n-tab-pane` must be placed inside `n-tabs`."),{style:n.paneStyleRef,class:n.paneClassRef,mergedClsPrefix:n.mergedClsPrefixRef}},render(){return b("div",{class:[`${this.mergedClsPrefix}-tab-pane`,this.class],style:this.style},this.$slots)}}),ha=Object.assign({internalLeftPadded:Boolean,internalAddable:Boolean,internalCreatedByPane:Boolean},kt(He,["displayDirective"])),ve=q({__TAB__:!0,inheritAttrs:!1,name:"Tab",props:ha,setup(e){const{mergedClsPrefixRef:n,valueRef:i,typeRef:p,closableRef:l,tabStyleRef:y,addTabStyleRef:v,tabClassRef:f,addTabClassRef:g,tabChangeIdRef:m,onBeforeLeaveRef:x,triggerRef:z,handleAdd:P,activateTab:w,handleClose:$}=Be(he);return{trigger:z,mergedClosable:re(()=>{if(e.internalAddable)return!1;const{closable:d}=e;return d===void 0?l.value:d}),style:y,addStyle:v,tabClass:f,addTabClass:g,clsPrefix:n,value:i,type:p,handleClose(d){d.stopPropagation(),!e.disabled&&$(e.name)},activateTab(){if(e.disabled)return;if(e.internalAddable){P();return}const{name:d}=e,T=++m.id;if(d!==i.value){const{value:_}=x;_?Promise.resolve(_(e.name,i.value)).then(k=>{k&&m.id===T&&w(d)}):w(d)}}}},render(){const{internalAddable:e,clsPrefix:n,name:i,disabled:p,label:l,tab:y,value:v,mergedClosable:f,trigger:g,$slots:{default:m}}=this,x=l??y;return b("div",{class:`${n}-tabs-tab-wrapper`},this.internalLeftPadded?b("div",{class:`${n}-tabs-tab-pad`}):null,b("div",Object.assign({key:i,"data-name":i,"data-disabled":p?!0:void 0},$t({class:[`${n}-tabs-tab`,v===i&&`${n}-tabs-tab--active`,p&&`${n}-tabs-tab--disabled`,f&&`${n}-tabs-tab--closable`,e&&`${n}-tabs-tab--addable`,e?this.addTabClass:this.tabClass],onClick:g==="click"?this.activateTab:void 0,onMouseenter:g==="hover"?this.activateTab:void 0,style:e?this.addStyle:this.style},this.internalCreatedByPane?this.tabProps||{}:this.$attrs)),b("span",{class:`${n}-tabs-tab__label`},e?b(_t,null,b("div",{class:`${n}-tabs-tab__height-placeholder`}," "),b(Lt,{clsPrefix:n},{default:()=>b(va,null)})):m?m():typeof x=="object"?x:Pt(x??i)),f&&this.type==="card"?b(Wt,{clsPrefix:n,class:`${n}-tabs-tab__close`,onClick:this.handleClose,disabled:p}):null))}}),ga=r("tabs",`
 box-sizing: border-box;
 width: 100%;
 display: flex;
 flex-direction: column;
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
`,[s("segment-type",[r("tabs-rail",[C("&.transition-disabled",[r("tabs-capsule",`
 transition: none;
 `)])])]),s("top",[r("tab-pane",`
 padding: var(--n-pane-padding-top) var(--n-pane-padding-right) var(--n-pane-padding-bottom) var(--n-pane-padding-left);
 `)]),s("left",[r("tab-pane",`
 padding: var(--n-pane-padding-right) var(--n-pane-padding-bottom) var(--n-pane-padding-left) var(--n-pane-padding-top);
 `)]),s("left, right",`
 flex-direction: row;
 `,[r("tabs-bar",`
 width: 2px;
 right: 0;
 transition:
 top .2s var(--n-bezier),
 max-height .2s var(--n-bezier),
 background-color .3s var(--n-bezier);
 `),r("tabs-tab",`
 padding: var(--n-tab-padding-vertical); 
 `)]),s("right",`
 flex-direction: row-reverse;
 `,[r("tab-pane",`
 padding: var(--n-pane-padding-left) var(--n-pane-padding-top) var(--n-pane-padding-right) var(--n-pane-padding-bottom);
 `),r("tabs-bar",`
 left: 0;
 `)]),s("bottom",`
 flex-direction: column-reverse;
 justify-content: flex-end;
 `,[r("tab-pane",`
 padding: var(--n-pane-padding-bottom) var(--n-pane-padding-right) var(--n-pane-padding-top) var(--n-pane-padding-left);
 `),r("tabs-bar",`
 top: 0;
 `)]),r("tabs-rail",`
 position: relative;
 padding: 3px;
 border-radius: var(--n-tab-border-radius);
 width: 100%;
 background-color: var(--n-color-segment);
 transition: background-color .3s var(--n-bezier);
 display: flex;
 align-items: center;
 `,[r("tabs-capsule",`
 border-radius: var(--n-tab-border-radius);
 position: absolute;
 pointer-events: none;
 background-color: var(--n-tab-color-segment);
 box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .08);
 transition: transform 0.3s var(--n-bezier);
 `),r("tabs-tab-wrapper",`
 flex-basis: 0;
 flex-grow: 1;
 display: flex;
 align-items: center;
 justify-content: center;
 `,[r("tabs-tab",`
 overflow: hidden;
 border-radius: var(--n-tab-border-radius);
 width: 100%;
 display: flex;
 align-items: center;
 justify-content: center;
 `,[s("active",`
 font-weight: var(--n-font-weight-strong);
 color: var(--n-tab-text-color-active);
 `),C("&:hover",`
 color: var(--n-tab-text-color-hover);
 `)])])]),s("flex",[r("tabs-nav",`
 width: 100%;
 position: relative;
 `,[r("tabs-wrapper",`
 width: 100%;
 `,[r("tabs-tab",`
 margin-right: 0;
 `)])])]),r("tabs-nav",`
 box-sizing: border-box;
 line-height: 1.5;
 display: flex;
 transition: border-color .3s var(--n-bezier);
 `,[W("prefix, suffix",`
 display: flex;
 align-items: center;
 `),W("prefix","padding-right: 16px;"),W("suffix","padding-left: 16px;")]),s("top, bottom",[C(">",[r("tabs-nav",[r("tabs-nav-scroll-wrapper",[C("&::before",`
 top: 0;
 bottom: 0;
 left: 0;
 width: 20px;
 `),C("&::after",`
 top: 0;
 bottom: 0;
 right: 0;
 width: 20px;
 `),s("shadow-start",[C("&::before",`
 box-shadow: inset 10px 0 8px -8px rgba(0, 0, 0, .12);
 `)]),s("shadow-end",[C("&::after",`
 box-shadow: inset -10px 0 8px -8px rgba(0, 0, 0, .12);
 `)])])])])]),s("left, right",[r("tabs-nav-scroll-content",`
 flex-direction: column;
 `),C(">",[r("tabs-nav",[r("tabs-nav-scroll-wrapper",[C("&::before",`
 top: 0;
 left: 0;
 right: 0;
 height: 20px;
 `),C("&::after",`
 bottom: 0;
 left: 0;
 right: 0;
 height: 20px;
 `),s("shadow-start",[C("&::before",`
 box-shadow: inset 0 10px 8px -8px rgba(0, 0, 0, .12);
 `)]),s("shadow-end",[C("&::after",`
 box-shadow: inset 0 -10px 8px -8px rgba(0, 0, 0, .12);
 `)])])])])]),r("tabs-nav-scroll-wrapper",`
 flex: 1;
 position: relative;
 overflow: hidden;
 `,[r("tabs-nav-y-scroll",`
 height: 100%;
 width: 100%;
 overflow-y: auto; 
 scrollbar-width: none;
 `,[C("&::-webkit-scrollbar, &::-webkit-scrollbar-track-piece, &::-webkit-scrollbar-thumb",`
 width: 0;
 height: 0;
 display: none;
 `)]),C("&::before, &::after",`
 transition: box-shadow .3s var(--n-bezier);
 pointer-events: none;
 content: "";
 position: absolute;
 z-index: 1;
 `)]),r("tabs-nav-scroll-content",`
 display: flex;
 position: relative;
 min-width: 100%;
 min-height: 100%;
 width: fit-content;
 box-sizing: border-box;
 `),r("tabs-wrapper",`
 display: inline-flex;
 flex-wrap: nowrap;
 position: relative;
 `),r("tabs-tab-wrapper",`
 display: flex;
 flex-wrap: nowrap;
 flex-shrink: 0;
 flex-grow: 0;
 `),r("tabs-tab",`
 cursor: pointer;
 white-space: nowrap;
 flex-wrap: nowrap;
 display: inline-flex;
 align-items: center;
 color: var(--n-tab-text-color);
 font-size: var(--n-tab-font-size);
 background-clip: padding-box;
 padding: var(--n-tab-padding);
 transition:
 box-shadow .3s var(--n-bezier),
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 `,[s("disabled",{cursor:"not-allowed"}),W("close",`
 margin-left: 6px;
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 `),W("label",`
 display: flex;
 align-items: center;
 z-index: 1;
 `)]),r("tabs-bar",`
 position: absolute;
 bottom: 0;
 height: 2px;
 border-radius: 1px;
 background-color: var(--n-bar-color);
 transition:
 left .2s var(--n-bezier),
 max-width .2s var(--n-bezier),
 opacity .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 `,[C("&.transition-disabled",`
 transition: none;
 `),s("disabled",`
 background-color: var(--n-tab-text-color-disabled)
 `)]),r("tabs-pane-wrapper",`
 position: relative;
 overflow: hidden;
 transition: max-height .2s var(--n-bezier);
 `),r("tab-pane",`
 color: var(--n-pane-text-color);
 width: 100%;
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 opacity .2s var(--n-bezier);
 left: 0;
 right: 0;
 top: 0;
 `,[C("&.next-transition-leave-active, &.prev-transition-leave-active, &.next-transition-enter-active, &.prev-transition-enter-active",`
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 transform .2s var(--n-bezier),
 opacity .2s var(--n-bezier);
 `),C("&.next-transition-leave-active, &.prev-transition-leave-active",`
 position: absolute;
 `),C("&.next-transition-enter-from, &.prev-transition-leave-to",`
 transform: translateX(32px);
 opacity: 0;
 `),C("&.next-transition-leave-to, &.prev-transition-enter-from",`
 transform: translateX(-32px);
 opacity: 0;
 `),C("&.next-transition-leave-from, &.next-transition-enter-to, &.prev-transition-leave-from, &.prev-transition-enter-to",`
 transform: translateX(0);
 opacity: 1;
 `)]),r("tabs-tab-pad",`
 box-sizing: border-box;
 width: var(--n-tab-gap);
 flex-grow: 0;
 flex-shrink: 0;
 `),s("line-type, bar-type",[r("tabs-tab",`
 font-weight: var(--n-tab-font-weight);
 box-sizing: border-box;
 vertical-align: bottom;
 `,[C("&:hover",{color:"var(--n-tab-text-color-hover)"}),s("active",`
 color: var(--n-tab-text-color-active);
 font-weight: var(--n-tab-font-weight-active);
 `),s("disabled",{color:"var(--n-tab-text-color-disabled)"})])]),r("tabs-nav",[s("line-type",[s("top",[W("prefix, suffix",`
 border-bottom: 1px solid var(--n-tab-border-color);
 `),r("tabs-nav-scroll-content",`
 border-bottom: 1px solid var(--n-tab-border-color);
 `),r("tabs-bar",`
 bottom: -1px;
 `)]),s("left",[W("prefix, suffix",`
 border-right: 1px solid var(--n-tab-border-color);
 `),r("tabs-nav-scroll-content",`
 border-right: 1px solid var(--n-tab-border-color);
 `),r("tabs-bar",`
 right: -1px;
 `)]),s("right",[W("prefix, suffix",`
 border-left: 1px solid var(--n-tab-border-color);
 `),r("tabs-nav-scroll-content",`
 border-left: 1px solid var(--n-tab-border-color);
 `),r("tabs-bar",`
 left: -1px;
 `)]),s("bottom",[W("prefix, suffix",`
 border-top: 1px solid var(--n-tab-border-color);
 `),r("tabs-nav-scroll-content",`
 border-top: 1px solid var(--n-tab-border-color);
 `),r("tabs-bar",`
 top: -1px;
 `)]),W("prefix, suffix",`
 transition: border-color .3s var(--n-bezier);
 `),r("tabs-nav-scroll-content",`
 transition: border-color .3s var(--n-bezier);
 `),r("tabs-bar",`
 border-radius: 0;
 `)]),s("card-type",[W("prefix, suffix",`
 transition: border-color .3s var(--n-bezier);
 `),r("tabs-pad",`
 flex-grow: 1;
 transition: border-color .3s var(--n-bezier);
 `),r("tabs-tab-pad",`
 transition: border-color .3s var(--n-bezier);
 `),r("tabs-tab",`
 font-weight: var(--n-tab-font-weight);
 border: 1px solid var(--n-tab-border-color);
 background-color: var(--n-tab-color);
 box-sizing: border-box;
 position: relative;
 vertical-align: bottom;
 display: flex;
 justify-content: space-between;
 font-size: var(--n-tab-font-size);
 color: var(--n-tab-text-color);
 `,[s("addable",`
 padding-left: 8px;
 padding-right: 8px;
 font-size: 16px;
 justify-content: center;
 `,[W("height-placeholder",`
 width: 0;
 font-size: var(--n-tab-font-size);
 `),Et("disabled",[C("&:hover",`
 color: var(--n-tab-text-color-hover);
 `)])]),s("closable","padding-right: 8px;"),s("active",`
 background-color: #0000;
 font-weight: var(--n-tab-font-weight-active);
 color: var(--n-tab-text-color-active);
 `),s("disabled","color: var(--n-tab-text-color-disabled);")])]),s("left, right",`
 flex-direction: column; 
 `,[W("prefix, suffix",`
 padding: var(--n-tab-padding-vertical);
 `),r("tabs-wrapper",`
 flex-direction: column;
 `),r("tabs-tab-wrapper",`
 flex-direction: column;
 `,[r("tabs-tab-pad",`
 height: var(--n-tab-gap-vertical);
 width: 100%;
 `)])]),s("top",[s("card-type",[r("tabs-scroll-padding","border-bottom: 1px solid var(--n-tab-border-color);"),W("prefix, suffix",`
 border-bottom: 1px solid var(--n-tab-border-color);
 `),r("tabs-tab",`
 border-top-left-radius: var(--n-tab-border-radius);
 border-top-right-radius: var(--n-tab-border-radius);
 `,[s("active",`
 border-bottom: 1px solid #0000;
 `)]),r("tabs-tab-pad",`
 border-bottom: 1px solid var(--n-tab-border-color);
 `),r("tabs-pad",`
 border-bottom: 1px solid var(--n-tab-border-color);
 `)])]),s("left",[s("card-type",[r("tabs-scroll-padding","border-right: 1px solid var(--n-tab-border-color);"),W("prefix, suffix",`
 border-right: 1px solid var(--n-tab-border-color);
 `),r("tabs-tab",`
 border-top-left-radius: var(--n-tab-border-radius);
 border-bottom-left-radius: var(--n-tab-border-radius);
 `,[s("active",`
 border-right: 1px solid #0000;
 `)]),r("tabs-tab-pad",`
 border-right: 1px solid var(--n-tab-border-color);
 `),r("tabs-pad",`
 border-right: 1px solid var(--n-tab-border-color);
 `)])]),s("right",[s("card-type",[r("tabs-scroll-padding","border-left: 1px solid var(--n-tab-border-color);"),W("prefix, suffix",`
 border-left: 1px solid var(--n-tab-border-color);
 `),r("tabs-tab",`
 border-top-right-radius: var(--n-tab-border-radius);
 border-bottom-right-radius: var(--n-tab-border-radius);
 `,[s("active",`
 border-left: 1px solid #0000;
 `)]),r("tabs-tab-pad",`
 border-left: 1px solid var(--n-tab-border-color);
 `),r("tabs-pad",`
 border-left: 1px solid var(--n-tab-border-color);
 `)])]),s("bottom",[s("card-type",[r("tabs-scroll-padding","border-top: 1px solid var(--n-tab-border-color);"),W("prefix, suffix",`
 border-top: 1px solid var(--n-tab-border-color);
 `),r("tabs-tab",`
 border-bottom-left-radius: var(--n-tab-border-radius);
 border-bottom-right-radius: var(--n-tab-border-radius);
 `,[s("active",`
 border-top: 1px solid #0000;
 `)]),r("tabs-tab-pad",`
 border-top: 1px solid var(--n-tab-border-color);
 `),r("tabs-pad",`
 border-top: 1px solid var(--n-tab-border-color);
 `)])])])]),ue=pa,ma=Object.assign(Object.assign({},je.props),{value:[String,Number],defaultValue:[String,Number],trigger:{type:String,default:"click"},type:{type:String,default:"bar"},closable:Boolean,justifyContent:String,size:{type:String,default:"medium"},placement:{type:String,default:"top"},tabStyle:[String,Object],tabClass:String,addTabStyle:[String,Object],addTabClass:String,barWidth:Number,paneClass:String,paneStyle:[String,Object],paneWrapperClass:String,paneWrapperStyle:[String,Object],addable:[Boolean,Object],tabsPadding:{type:Number,default:0},animated:Boolean,onBeforeLeave:Function,onAdd:Function,"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array],onClose:[Function,Array],labelSize:String,activeName:[String,Number],onActiveNameChange:[Function,Array]}),xa=q({name:"Tabs",props:ma,slots:Object,setup(e,{slots:n}){var i,p,l,y;const{mergedClsPrefixRef:v,inlineThemeDisabled:f}=At(e),g=je("Tabs","-tabs",ga,Bt,e,v),m=S(null),x=S(null),z=S(null),P=S(null),w=S(null),$=S(null),d=S(!0),T=S(!0),_=Pe(e,["labelSize","size"]),k=Pe(e,["activeName","value"]),O=S((p=(i=k.value)!==null&&i!==void 0?i:e.defaultValue)!==null&&p!==void 0?p:n.default?(y=(l=le(n.default())[0])===null||l===void 0?void 0:l.props)===null||y===void 0?void 0:y.name:null),E=Qt(k,O),h={id:0},u=re(()=>{if(!(!e.justifyContent||e.type==="card"))return{display:"flex",justifyContent:e.justifyContent}});ce(E,()=>{h.id=0,J(),me()});function L(){var t;const{value:a}=E;return a===null?null:(t=m.value)===null||t===void 0?void 0:t.querySelector(`[data-name="${a}"]`)}function N(t){if(e.type==="card")return;const{value:a}=x;if(!a)return;const o=a.style.opacity==="0";if(t){const c=`${v.value}-tabs-bar--disabled`,{barWidth:R,placement:A}=e;if(t.dataset.disabled==="true"?a.classList.add(c):a.classList.remove(c),["top","bottom"].includes(A)){if(ge(["top","maxHeight","height"]),typeof R=="number"&&t.offsetWidth>=R){const B=Math.floor((t.offsetWidth-R)/2)+t.offsetLeft;a.style.left=`${B}px`,a.style.maxWidth=`${R}px`}else a.style.left=`${t.offsetLeft}px`,a.style.maxWidth=`${t.offsetWidth}px`;a.style.width="8192px",o&&(a.style.transition="none"),a.offsetWidth,o&&(a.style.transition="",a.style.opacity="1")}else{if(ge(["left","maxWidth","width"]),typeof R=="number"&&t.offsetHeight>=R){const B=Math.floor((t.offsetHeight-R)/2)+t.offsetTop;a.style.top=`${B}px`,a.style.maxHeight=`${R}px`}else a.style.top=`${t.offsetTop}px`,a.style.maxHeight=`${t.offsetHeight}px`;a.style.height="8192px",o&&(a.style.transition="none"),a.offsetHeight,o&&(a.style.transition="",a.style.opacity="1")}}}function K(){if(e.type==="card")return;const{value:t}=x;t&&(t.style.opacity="0")}function ge(t){const{value:a}=x;if(a)for(const o of t)a.style[o]=""}function J(){if(e.type==="card")return;const t=L();t?N(t):K()}function me(){var t;const a=(t=w.value)===null||t===void 0?void 0:t.$el;if(!a)return;const o=L();if(!o)return;const{scrollLeft:c,offsetWidth:R}=a,{offsetLeft:A,offsetWidth:B}=o;c>A?a.scrollTo({top:0,left:A,behavior:"smooth"}):A+B>c+R&&a.scrollTo({top:0,left:A+B-R,behavior:"smooth"})}const Q=S(null);let oe=0,H=null;function Oe(t){const a=Q.value;if(a){oe=t.getBoundingClientRect().height;const o=`${oe}px`,c=()=>{a.style.height=o,a.style.maxHeight=o};H?(c(),H(),H=null):H=c}}function Ne(t){const a=Q.value;if(a){const o=t.getBoundingClientRect().height,c=()=>{document.body.offsetHeight,a.style.maxHeight=`${o}px`,a.style.height=`${Math.max(oe,o)}px`};H?(H(),H=null,c()):H=c}}function De(){const t=Q.value;if(t){t.style.maxHeight="",t.style.height="";const{paneWrapperStyle:a}=e;if(typeof a=="string")t.style.cssText=a;else if(a){const{maxHeight:o,height:c}=a;o!==void 0&&(t.style.maxHeight=o),c!==void 0&&(t.style.height=c)}}}const xe={value:[]},ye=S("next");function Fe(t){const a=E.value;let o="next";for(const c of xe.value){if(c===a)break;if(c===t){o="prev";break}}ye.value=o,Me(t)}function Me(t){const{onActiveNameChange:a,onUpdateValue:o,"onUpdate:value":c}=e;a&&te(a,t),o&&te(o,t),c&&te(c,t),O.value=t}function Ve(t){const{onClose:a}=e;a&&te(a,t)}function we(){const{value:t}=x;if(!t)return;const a="transition-disabled";t.classList.add(a),J(),t.classList.remove(a)}const M=S(null);function ie({transitionDisabled:t}){const a=m.value;if(!a)return;t&&a.classList.add("transition-disabled");const o=L();o&&M.value&&(M.value.style.width=`${o.offsetWidth}px`,M.value.style.height=`${o.offsetHeight}px`,M.value.style.transform=`translateX(${o.offsetLeft-Ot(getComputedStyle(a).paddingLeft)}px)`,t&&M.value.offsetWidth),t&&a.classList.remove("transition-disabled")}ce([E],()=>{e.type==="segment"&&be(()=>{ie({transitionDisabled:!1})})}),Ie(()=>{e.type==="segment"&&ie({transitionDisabled:!0})});let Ce=0;function Ue(t){var a;if(t.contentRect.width===0&&t.contentRect.height===0||Ce===t.contentRect.width)return;Ce=t.contentRect.width;const{type:o}=e;if((o==="line"||o==="bar")&&we(),o!=="segment"){const{placement:c}=e;se((c==="top"||c==="bottom"?(a=w.value)===null||a===void 0?void 0:a.$el:$.value)||null)}}const Xe=ue(Ue,64);ce([()=>e.justifyContent,()=>e.size],()=>{be(()=>{const{type:t}=e;(t==="line"||t==="bar")&&we()})});const V=S(!1);function Ge(t){var a;const{target:o,contentRect:{width:c,height:R}}=t,A=o.parentElement.parentElement.offsetWidth,B=o.parentElement.parentElement.offsetHeight,{placement:X}=e;if(!V.value)X==="top"||X==="bottom"?A<c&&(V.value=!0):B<R&&(V.value=!0);else{const{value:G}=P;if(!G)return;X==="top"||X==="bottom"?A-c>G.$el.offsetWidth&&(V.value=!1):B-R>G.$el.offsetHeight&&(V.value=!1)}se(((a=w.value)===null||a===void 0?void 0:a.$el)||null)}const Ye=ue(Ge,64);function qe(){const{onAdd:t}=e;t&&t(),be(()=>{const a=L(),{value:o}=w;!a||!o||o.scrollTo({left:a.offsetLeft,top:0,behavior:"smooth"})})}function se(t){if(!t)return;const{placement:a}=e;if(a==="top"||a==="bottom"){const{scrollLeft:o,scrollWidth:c,offsetWidth:R}=t;d.value=o<=0,T.value=o+R>=c}else{const{scrollTop:o,scrollHeight:c,offsetHeight:R}=t;d.value=o<=0,T.value=o+R>=c}}const Ke=ue(t=>{se(t.target)},64);jt(he,{triggerRef:j(e,"trigger"),tabStyleRef:j(e,"tabStyle"),tabClassRef:j(e,"tabClass"),addTabStyleRef:j(e,"addTabStyle"),addTabClassRef:j(e,"addTabClass"),paneClassRef:j(e,"paneClass"),paneStyleRef:j(e,"paneStyle"),mergedClsPrefixRef:v,typeRef:j(e,"type"),closableRef:j(e,"closable"),valueRef:E,tabChangeIdRef:h,onBeforeLeaveRef:j(e,"onBeforeLeave"),activateTab:Fe,handleClose:Ve,handleAdd:qe}),Kt(()=>{J(),me()}),It(()=>{const{value:t}=z;if(!t)return;const{value:a}=v,o=`${a}-tabs-nav-scroll-wrapper--shadow-start`,c=`${a}-tabs-nav-scroll-wrapper--shadow-end`;d.value?t.classList.remove(o):t.classList.add(o),T.value?t.classList.remove(c):t.classList.add(c)});const Je={syncBarPosition:()=>{J()}},Qe=()=>{ie({transitionDisabled:!0})},Se=re(()=>{const{value:t}=_,{type:a}=e,o={card:"Card",bar:"Bar",line:"Line",segment:"Segment"}[a],c=`${t}${o}`,{self:{barColor:R,closeIconColor:A,closeIconColorHover:B,closeIconColorPressed:X,tabColor:G,tabBorderColor:Ze,paneTextColor:et,tabFontWeight:tt,tabBorderRadius:at,tabFontWeightActive:rt,colorSegment:nt,fontWeightStrong:ot,tabColorSegment:it,closeSize:st,closeIconSize:lt,closeColorHover:dt,closeColorPressed:ct,closeBorderRadius:bt,[I("panePadding",t)]:Z,[I("tabPadding",c)]:ft,[I("tabPaddingVertical",c)]:ut,[I("tabGap",c)]:pt,[I("tabGap",`${c}Vertical`)]:vt,[I("tabTextColor",a)]:ht,[I("tabTextColorActive",a)]:gt,[I("tabTextColorHover",a)]:mt,[I("tabTextColorDisabled",a)]:xt,[I("tabFontSize",t)]:yt},common:{cubicBezierEaseInOut:wt}}=g.value;return{"--n-bezier":wt,"--n-color-segment":nt,"--n-bar-color":R,"--n-tab-font-size":yt,"--n-tab-text-color":ht,"--n-tab-text-color-active":gt,"--n-tab-text-color-disabled":xt,"--n-tab-text-color-hover":mt,"--n-pane-text-color":et,"--n-tab-border-color":Ze,"--n-tab-border-radius":at,"--n-close-size":st,"--n-close-icon-size":lt,"--n-close-color-hover":dt,"--n-close-color-pressed":ct,"--n-close-border-radius":bt,"--n-close-icon-color":A,"--n-close-icon-color-hover":B,"--n-close-icon-color-pressed":X,"--n-tab-color":G,"--n-tab-font-weight":tt,"--n-tab-font-weight-active":rt,"--n-tab-padding":ft,"--n-tab-padding-vertical":ut,"--n-tab-gap":pt,"--n-tab-gap-vertical":vt,"--n-pane-padding-left":ee(Z,"left"),"--n-pane-padding-right":ee(Z,"right"),"--n-pane-padding-top":ee(Z,"top"),"--n-pane-padding-bottom":ee(Z,"bottom"),"--n-font-weight-strong":ot,"--n-tab-color-segment":it}}),U=f?Ht("tabs",re(()=>`${_.value[0]}${e.type[0]}`),Se,e):void 0;return Object.assign({mergedClsPrefix:v,mergedValue:E,renderedNames:new Set,segmentCapsuleElRef:M,tabsPaneWrapperRef:Q,tabsElRef:m,barElRef:x,addTabInstRef:P,xScrollInstRef:w,scrollWrapperElRef:z,addTabFixed:V,tabWrapperStyle:u,handleNavResize:Xe,mergedSize:_,handleScroll:Ke,handleTabsResize:Ye,cssVars:f?void 0:Se,themeClass:U?.themeClass,animationDirection:ye,renderNameListRef:xe,yScrollElRef:$,handleSegmentResize:Qe,onAnimationBeforeLeave:Oe,onAnimationEnter:Ne,onAnimationAfterEnter:De,onRender:U?.onRender},Je)},render(){const{mergedClsPrefix:e,type:n,placement:i,addTabFixed:p,addable:l,mergedSize:y,renderNameListRef:v,onRender:f,paneWrapperClass:g,paneWrapperStyle:m,$slots:{default:x,prefix:z,suffix:P}}=this;f?.();const w=x?le(x()).filter(h=>h.type.__TAB_PANE__===!0):[],$=x?le(x()).filter(h=>h.type.__TAB__===!0):[],d=!$.length,T=n==="card",_=n==="segment",k=!T&&!_&&this.justifyContent;v.value=[];const O=()=>{const h=b("div",{style:this.tabWrapperStyle,class:`${e}-tabs-wrapper`},k?null:b("div",{class:`${e}-tabs-scroll-padding`,style:i==="top"||i==="bottom"?{width:`${this.tabsPadding}px`}:{height:`${this.tabsPadding}px`}}),d?w.map((u,L)=>(v.value.push(u.props.name),pe(b(ve,Object.assign({},u.props,{internalCreatedByPane:!0,internalLeftPadded:L!==0&&(!k||k==="center"||k==="start"||k==="end")}),u.children?{default:u.children.tab}:void 0)))):$.map((u,L)=>(v.value.push(u.props.name),pe(L!==0&&!k?Ae(u):u))),!p&&l&&T?Ee(l,(d?w.length:$.length)!==0):null,k?null:b("div",{class:`${e}-tabs-scroll-padding`,style:{width:`${this.tabsPadding}px`}}));return b("div",{ref:"tabsElRef",class:`${e}-tabs-nav-scroll-content`},T&&l?b(de,{onResize:this.handleTabsResize},{default:()=>h}):h,T?b("div",{class:`${e}-tabs-pad`}):null,T?null:b("div",{ref:"barElRef",class:`${e}-tabs-bar`}))},E=_?"top":i;return b("div",{class:[`${e}-tabs`,this.themeClass,`${e}-tabs--${n}-type`,`${e}-tabs--${y}-size`,k&&`${e}-tabs--flex`,`${e}-tabs--${E}`],style:this.cssVars},b("div",{class:[`${e}-tabs-nav--${n}-type`,`${e}-tabs-nav--${E}`,`${e}-tabs-nav`]},Te(z,h=>h&&b("div",{class:`${e}-tabs-nav__prefix`},h)),_?b(de,{onResize:this.handleSegmentResize},{default:()=>b("div",{class:`${e}-tabs-rail`,ref:"tabsElRef"},b("div",{class:`${e}-tabs-capsule`,ref:"segmentCapsuleElRef"},b("div",{class:`${e}-tabs-wrapper`},b("div",{class:`${e}-tabs-tab`}))),d?w.map((h,u)=>(v.value.push(h.props.name),b(ve,Object.assign({},h.props,{internalCreatedByPane:!0,internalLeftPadded:u!==0}),h.children?{default:h.children.tab}:void 0))):$.map((h,u)=>(v.value.push(h.props.name),u===0?h:Ae(h))))}):b(de,{onResize:this.handleNavResize},{default:()=>b("div",{class:`${e}-tabs-nav-scroll-wrapper`,ref:"scrollWrapperElRef"},["top","bottom"].includes(E)?b(ea,{ref:"xScrollInstRef",onScroll:this.handleScroll},{default:O}):b("div",{class:`${e}-tabs-nav-y-scroll`,onScroll:this.handleScroll,ref:"yScrollElRef"},O()))}),p&&l&&T?Ee(l,!0):null,Te(P,h=>h&&b("div",{class:`${e}-tabs-nav__suffix`},h))),d&&(this.animated&&(E==="top"||E==="bottom")?b("div",{ref:"tabsPaneWrapperRef",style:m,class:[`${e}-tabs-pane-wrapper`,g]},ke(w,this.mergedValue,this.renderedNames,this.onAnimationBeforeLeave,this.onAnimationEnter,this.onAnimationAfterEnter,this.animationDirection)):ke(w,this.mergedValue,this.renderedNames)))}});function ke(e,n,i,p,l,y,v){const f=[];return e.forEach(g=>{const{name:m,displayDirective:x,"display-directive":z}=g.props,P=$=>x===$||z===$,w=n===m;if(g.key!==void 0&&(g.key=m),w||P("show")||P("show:lazy")&&i.has(m)){i.has(m)||i.add(m);const $=!P("if");f.push($?Nt(g,[[Dt,w]]):g)}}),v?b(Ft,{name:`${v}-transition`,onBeforeLeave:p,onEnter:l,onAfterEnter:y},{default:()=>f}):f}function Ee(e,n){return b(ve,{ref:"addTabInstRef",key:"__addable",name:"__addable",internalCreatedByPane:!0,internalAddable:!0,internalLeftPadded:n,disabled:typeof e=="object"&&e.disabled})}function Ae(e){const n=Mt(e);return n.props?n.props.internalLeftPadded=!0:n.props={internalLeftPadded:!0},n}function pe(e){return Array.isArray(e.dynamicProps)?e.dynamicProps.includes("internalLeftPadded")||e.dynamicProps.push("internalLeftPadded"):e.dynamicProps=["internalLeftPadded"],e}const ya={class:"content-page"},wa={class:"pagination"},Ca={__name:"Content",setup(e){const n=Ut(),i=S(!1),p=S("listening"),l=S([]),y=S([]),v=S(0),f=S(1),g=S(10),m=[{title:"ID",key:"id",width:60},{title:"标题",key:"title",width:300},{title:"考试类型",key:"examType",width:100},{title:"难度等级",key:"difficultyLevel",width:100},{title:"创建时间",key:"createTime",width:180,render:d=>d.createTime?new Date(d.createTime).toLocaleString("zh-CN"):"-"}],x=[{title:"ID",key:"id",width:60},{title:"标题",key:"title",width:300},{title:"考试类型",key:"examType",width:100},{title:"难度等级",key:"difficultyLevel",width:100},{title:"创建时间",key:"createTime",width:180,render:d=>d.createTime?new Date(d.createTime).toLocaleString("zh-CN"):"-"}],z=async()=>{i.value=!0;try{const d=await Re.getListeningList({page:f.value,size:g.value});l.value=d.data.records,v.value=d.data.total}catch{n.error("获取听力材料失败")}finally{i.value=!1}},P=async()=>{i.value=!0;try{const d=await Re.getReadingList({page:f.value,size:g.value});y.value=d.data.records,v.value=d.data.total}catch{n.error("获取阅读文章失败")}finally{i.value=!1}},w=d=>{p.value=d,f.value=1,d==="listening"?z():P()},$=d=>{f.value=d,p.value==="listening"?z():P()};return Ie(()=>{z()}),(d,T)=>(Yt(),Xt("div",ya,[T[1]||(T[1]=Y("header",{class:"page-header"},[Y("div",null,[Y("h1",null,"内容管理"),Y("p",null,"管理听力和阅读材料")])],-1)),D(F(Gt),{class:"content-card"},{default:ae(()=>[D(F(xa),{value:p.value,"onUpdate:value":w},{default:ae(()=>[D(F(We),{name:"listening",tab:"听力材料"},{default:ae(()=>[D(F($e),{columns:m,data:l.value,loading:i.value,bordered:!1},null,8,["data","loading"])]),_:1}),D(F(We),{name:"reading",tab:"阅读文章"},{default:ae(()=>[D(F($e),{columns:x,data:y.value,loading:i.value,bordered:!1},null,8,["data","loading"])]),_:1})]),_:1},8,["value"]),Y("div",wa,[D(F(Jt),{page:f.value,"onUpdate:page":[T[0]||(T[0]=_=>f.value=_),$],"page-count":Math.ceil(v.value/g.value)},null,8,["page","page-count"])])]),_:1})]))}},$a=Vt(Ca,[["__scopeId","data-v-4e83c037"]]);export{$a as default};
