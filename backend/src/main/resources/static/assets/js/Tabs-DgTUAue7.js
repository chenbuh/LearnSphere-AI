import{d as q,h as l,r as $,a as Se,D as bt,F as ct,c as J,w as te,E as ae,o as ft,z as pt,u as E,y as ut,I as vt,J as ht,B as gt,H as xt}from"./vue-core-k66yWm0l.js";import{aI as mt,I as yt,M as wt,aK as St,i as Ct,aA as Rt,a7 as zt,e as r,f as n,h as f,g as m,t as $t,J as re,r as he,aH as oe,l as Tt,m as Ce,b1 as Pt,v as j,aB as K,n as Wt,aE as _t,o as Y}from"./index-DahIAh76.js";import{A as At}from"./Add-SAKJ-sh2.js";import{c as ge,a as Bt,o as Lt}from"./cssr-D4Wn-_UV.js";import{u as xe}from"./use-compitable-C8LpTH9g.js";import{u as Et}from"./use-merged-state-DCOVafah.js";import{t as jt}from"./utils-D4YdDhUH.js";const kt=ge(".v-x-scroll",{overflow:"auto",scrollbarWidth:"none"},[ge("&::-webkit-scrollbar",{width:0,height:0})]),Ht=q({name:"XScroll",props:{disabled:Boolean,onScroll:Function},setup(){const e=$(null);function i(d){!(d.currentTarget.offsetWidth<d.currentTarget.scrollWidth)||d.deltaY===0||(d.currentTarget.scrollLeft+=d.deltaY+d.deltaX,d.preventDefault())}const c=mt();return kt.mount({id:"vueuc/x-scroll",head:!0,anchorMetaName:Bt,ssr:c}),Object.assign({selfRef:e,handleWheel:i},{scrollTo(...d){var y;(y=e.value)===null||y===void 0||y.scrollTo(...d)}})},render(){return l("div",{ref:"selfRef",onScroll:this.onScroll,onWheel:this.disabled?void 0:this.handleWheel,class:"v-x-scroll"},this.$slots)}}),le=yt("n-tabs"),Re={tab:[String,Number,Object,Function],name:{type:[String,Number],required:!0},disabled:Boolean,displayDirective:{type:String,default:"if"},closable:{type:Boolean,default:void 0},tabProps:Object,label:[String,Number,Object,Function]},Kt=q({__TAB_PANE__:!0,name:"TabPane",alias:["TabPanel"],props:Re,slots:Object,setup(e){const i=Se(le,null);return i||wt("tab-pane","`n-tab-pane` must be placed inside `n-tabs`."),{style:i.paneStyleRef,class:i.paneClassRef,mergedClsPrefix:i.mergedClsPrefixRef}},render(){return l("div",{class:[`${this.mergedClsPrefix}-tab-pane`,this.class],style:this.style},this.$slots)}}),Ot=Object.assign({internalLeftPadded:Boolean,internalAddable:Boolean,internalCreatedByPane:Boolean},zt(Re,["displayDirective"])),se=q({__TAB__:!0,inheritAttrs:!1,name:"Tab",props:Ot,setup(e){const{mergedClsPrefixRef:i,valueRef:c,typeRef:w,closableRef:d,tabStyleRef:y,addTabStyleRef:v,tabClassRef:S,addTabClassRef:C,tabChangeIdRef:h,onBeforeLeaveRef:p,triggerRef:k,handleAdd:B,activateTab:g,handleClose:R}=Se(le);return{trigger:k,mergedClosable:J(()=>{if(e.internalAddable)return!1;const{closable:x}=e;return x===void 0?d.value:x}),style:y,addStyle:v,tabClass:S,addTabClass:C,clsPrefix:i,value:c,type:w,handleClose(x){x.stopPropagation(),!e.disabled&&R(e.name)},activateTab(){if(e.disabled)return;if(e.internalAddable){B();return}const{name:x}=e,P=++h.id;if(x!==c.value){const{value:L}=p;L?Promise.resolve(L(e.name,c.value)).then(T=>{T&&h.id===P&&g(x)}):g(x)}}}},render(){const{internalAddable:e,clsPrefix:i,name:c,disabled:w,label:d,tab:y,value:v,mergedClosable:S,trigger:C,$slots:{default:h}}=this,p=d!=null?d:y;return l("div",{class:`${i}-tabs-tab-wrapper`},this.internalLeftPadded?l("div",{class:`${i}-tabs-tab-pad`}):null,l("div",Object.assign({key:c,"data-name":c,"data-disabled":w?!0:void 0},bt({class:[`${i}-tabs-tab`,v===c&&`${i}-tabs-tab--active`,w&&`${i}-tabs-tab--disabled`,S&&`${i}-tabs-tab--closable`,e&&`${i}-tabs-tab--addable`,e?this.addTabClass:this.tabClass],onClick:C==="click"?this.activateTab:void 0,onMouseenter:C==="hover"?this.activateTab:void 0,style:e?this.addStyle:this.style},this.internalCreatedByPane?this.tabProps||{}:this.$attrs)),l("span",{class:`${i}-tabs-tab__label`},e?l(ct,null,l("div",{class:`${i}-tabs-tab__height-placeholder`}," "),l(Ct,{clsPrefix:i},{default:()=>l(At,null)})):h?h():typeof p=="object"?p:St(p!=null?p:c)),S&&this.type==="card"?l(Rt,{clsPrefix:i,class:`${i}-tabs-tab__close`,onClick:this.handleClose,disabled:w}):null))}}),It=r("tabs",`
 box-sizing: border-box;
 width: 100%;
 display: flex;
 flex-direction: column;
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
`,[n("segment-type",[r("tabs-rail",[f("&.transition-disabled",[r("tabs-capsule",`
 transition: none;
 `)])])]),n("top",[r("tab-pane",`
 padding: var(--n-pane-padding-top) var(--n-pane-padding-right) var(--n-pane-padding-bottom) var(--n-pane-padding-left);
 `)]),n("left",[r("tab-pane",`
 padding: var(--n-pane-padding-right) var(--n-pane-padding-bottom) var(--n-pane-padding-left) var(--n-pane-padding-top);
 `)]),n("left, right",`
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
 `)]),n("right",`
 flex-direction: row-reverse;
 `,[r("tab-pane",`
 padding: var(--n-pane-padding-left) var(--n-pane-padding-top) var(--n-pane-padding-right) var(--n-pane-padding-bottom);
 `),r("tabs-bar",`
 left: 0;
 `)]),n("bottom",`
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
 `,[n("active",`
 font-weight: var(--n-font-weight-strong);
 color: var(--n-tab-text-color-active);
 `),f("&:hover",`
 color: var(--n-tab-text-color-hover);
 `)])])]),n("flex",[r("tabs-nav",`
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
 `,[m("prefix, suffix",`
 display: flex;
 align-items: center;
 `),m("prefix","padding-right: 16px;"),m("suffix","padding-left: 16px;")]),n("top, bottom",[f(">",[r("tabs-nav",[r("tabs-nav-scroll-wrapper",[f("&::before",`
 top: 0;
 bottom: 0;
 left: 0;
 width: 20px;
 `),f("&::after",`
 top: 0;
 bottom: 0;
 right: 0;
 width: 20px;
 `),n("shadow-start",[f("&::before",`
 box-shadow: inset 10px 0 8px -8px rgba(0, 0, 0, .12);
 `)]),n("shadow-end",[f("&::after",`
 box-shadow: inset -10px 0 8px -8px rgba(0, 0, 0, .12);
 `)])])])])]),n("left, right",[r("tabs-nav-scroll-content",`
 flex-direction: column;
 `),f(">",[r("tabs-nav",[r("tabs-nav-scroll-wrapper",[f("&::before",`
 top: 0;
 left: 0;
 right: 0;
 height: 20px;
 `),f("&::after",`
 bottom: 0;
 left: 0;
 right: 0;
 height: 20px;
 `),n("shadow-start",[f("&::before",`
 box-shadow: inset 0 10px 8px -8px rgba(0, 0, 0, .12);
 `)]),n("shadow-end",[f("&::after",`
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
 `,[f("&::-webkit-scrollbar, &::-webkit-scrollbar-track-piece, &::-webkit-scrollbar-thumb",`
 width: 0;
 height: 0;
 display: none;
 `)]),f("&::before, &::after",`
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
 `,[n("disabled",{cursor:"not-allowed"}),m("close",`
 margin-left: 6px;
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 `),m("label",`
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
 `,[f("&.transition-disabled",`
 transition: none;
 `),n("disabled",`
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
 `,[f("&.next-transition-leave-active, &.prev-transition-leave-active, &.next-transition-enter-active, &.prev-transition-enter-active",`
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 transform .2s var(--n-bezier),
 opacity .2s var(--n-bezier);
 `),f("&.next-transition-leave-active, &.prev-transition-leave-active",`
 position: absolute;
 `),f("&.next-transition-enter-from, &.prev-transition-leave-to",`
 transform: translateX(32px);
 opacity: 0;
 `),f("&.next-transition-leave-to, &.prev-transition-enter-from",`
 transform: translateX(-32px);
 opacity: 0;
 `),f("&.next-transition-leave-from, &.next-transition-enter-to, &.prev-transition-leave-from, &.prev-transition-enter-to",`
 transform: translateX(0);
 opacity: 1;
 `)]),r("tabs-tab-pad",`
 box-sizing: border-box;
 width: var(--n-tab-gap);
 flex-grow: 0;
 flex-shrink: 0;
 `),n("line-type, bar-type",[r("tabs-tab",`
 font-weight: var(--n-tab-font-weight);
 box-sizing: border-box;
 vertical-align: bottom;
 `,[f("&:hover",{color:"var(--n-tab-text-color-hover)"}),n("active",`
 color: var(--n-tab-text-color-active);
 font-weight: var(--n-tab-font-weight-active);
 `),n("disabled",{color:"var(--n-tab-text-color-disabled)"})])]),r("tabs-nav",[n("line-type",[n("top",[m("prefix, suffix",`
 border-bottom: 1px solid var(--n-tab-border-color);
 `),r("tabs-nav-scroll-content",`
 border-bottom: 1px solid var(--n-tab-border-color);
 `),r("tabs-bar",`
 bottom: -1px;
 `)]),n("left",[m("prefix, suffix",`
 border-right: 1px solid var(--n-tab-border-color);
 `),r("tabs-nav-scroll-content",`
 border-right: 1px solid var(--n-tab-border-color);
 `),r("tabs-bar",`
 right: -1px;
 `)]),n("right",[m("prefix, suffix",`
 border-left: 1px solid var(--n-tab-border-color);
 `),r("tabs-nav-scroll-content",`
 border-left: 1px solid var(--n-tab-border-color);
 `),r("tabs-bar",`
 left: -1px;
 `)]),n("bottom",[m("prefix, suffix",`
 border-top: 1px solid var(--n-tab-border-color);
 `),r("tabs-nav-scroll-content",`
 border-top: 1px solid var(--n-tab-border-color);
 `),r("tabs-bar",`
 top: -1px;
 `)]),m("prefix, suffix",`
 transition: border-color .3s var(--n-bezier);
 `),r("tabs-nav-scroll-content",`
 transition: border-color .3s var(--n-bezier);
 `),r("tabs-bar",`
 border-radius: 0;
 `)]),n("card-type",[m("prefix, suffix",`
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
 `,[n("addable",`
 padding-left: 8px;
 padding-right: 8px;
 font-size: 16px;
 justify-content: center;
 `,[m("height-placeholder",`
 width: 0;
 font-size: var(--n-tab-font-size);
 `),$t("disabled",[f("&:hover",`
 color: var(--n-tab-text-color-hover);
 `)])]),n("closable","padding-right: 8px;"),n("active",`
 background-color: #0000;
 font-weight: var(--n-tab-font-weight-active);
 color: var(--n-tab-text-color-active);
 `),n("disabled","color: var(--n-tab-text-color-disabled);")])]),n("left, right",`
 flex-direction: column; 
 `,[m("prefix, suffix",`
 padding: var(--n-tab-padding-vertical);
 `),r("tabs-wrapper",`
 flex-direction: column;
 `),r("tabs-tab-wrapper",`
 flex-direction: column;
 `,[r("tabs-tab-pad",`
 height: var(--n-tab-gap-vertical);
 width: 100%;
 `)])]),n("top",[n("card-type",[r("tabs-scroll-padding","border-bottom: 1px solid var(--n-tab-border-color);"),m("prefix, suffix",`
 border-bottom: 1px solid var(--n-tab-border-color);
 `),r("tabs-tab",`
 border-top-left-radius: var(--n-tab-border-radius);
 border-top-right-radius: var(--n-tab-border-radius);
 `,[n("active",`
 border-bottom: 1px solid #0000;
 `)]),r("tabs-tab-pad",`
 border-bottom: 1px solid var(--n-tab-border-color);
 `),r("tabs-pad",`
 border-bottom: 1px solid var(--n-tab-border-color);
 `)])]),n("left",[n("card-type",[r("tabs-scroll-padding","border-right: 1px solid var(--n-tab-border-color);"),m("prefix, suffix",`
 border-right: 1px solid var(--n-tab-border-color);
 `),r("tabs-tab",`
 border-top-left-radius: var(--n-tab-border-radius);
 border-bottom-left-radius: var(--n-tab-border-radius);
 `,[n("active",`
 border-right: 1px solid #0000;
 `)]),r("tabs-tab-pad",`
 border-right: 1px solid var(--n-tab-border-color);
 `),r("tabs-pad",`
 border-right: 1px solid var(--n-tab-border-color);
 `)])]),n("right",[n("card-type",[r("tabs-scroll-padding","border-left: 1px solid var(--n-tab-border-color);"),m("prefix, suffix",`
 border-left: 1px solid var(--n-tab-border-color);
 `),r("tabs-tab",`
 border-top-right-radius: var(--n-tab-border-radius);
 border-bottom-right-radius: var(--n-tab-border-radius);
 `,[n("active",`
 border-left: 1px solid #0000;
 `)]),r("tabs-tab-pad",`
 border-left: 1px solid var(--n-tab-border-color);
 `),r("tabs-pad",`
 border-left: 1px solid var(--n-tab-border-color);
 `)])]),n("bottom",[n("card-type",[r("tabs-scroll-padding","border-top: 1px solid var(--n-tab-border-color);"),m("prefix, suffix",`
 border-top: 1px solid var(--n-tab-border-color);
 `),r("tabs-tab",`
 border-bottom-left-radius: var(--n-tab-border-radius);
 border-bottom-right-radius: var(--n-tab-border-radius);
 `,[n("active",`
 border-top: 1px solid #0000;
 `)]),r("tabs-tab-pad",`
 border-top: 1px solid var(--n-tab-border-color);
 `),r("tabs-pad",`
 border-top: 1px solid var(--n-tab-border-color);
 `)])])])]),ne=jt,Ft=Object.assign(Object.assign({},Ce.props),{value:[String,Number],defaultValue:[String,Number],trigger:{type:String,default:"click"},type:{type:String,default:"bar"},closable:Boolean,justifyContent:String,size:{type:String,default:"medium"},placement:{type:String,default:"top"},tabStyle:[String,Object],tabClass:String,addTabStyle:[String,Object],addTabClass:String,barWidth:Number,paneClass:String,paneStyle:[String,Object],paneWrapperClass:String,paneWrapperStyle:[String,Object],addable:[Boolean,Object],tabsPadding:{type:Number,default:0},animated:Boolean,onBeforeLeave:Function,onAdd:Function,"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array],onClose:[Function,Array],labelSize:String,activeName:[String,Number],onActiveNameChange:[Function,Array]}),Yt=q({name:"Tabs",props:Ft,slots:Object,setup(e,{slots:i}){var c,w,d,y;const{mergedClsPrefixRef:v,inlineThemeDisabled:S}=Tt(e),C=Ce("Tabs","-tabs",It,Pt,e,v),h=$(null),p=$(null),k=$(null),B=$(null),g=$(null),R=$(null),x=$(!0),P=$(!0),L=xe(e,["labelSize","size"]),T=xe(e,["activeName","value"]),N=$((w=(c=T.value)!==null&&c!==void 0?c:e.defaultValue)!==null&&w!==void 0?w:i.default?(y=(d=re(i.default())[0])===null||d===void 0?void 0:d.props)===null||y===void 0?void 0:y.name:null),W=Et(T,N),b={id:0},z=J(()=>{if(!(!e.justifyContent||e.type==="card"))return{display:"flex",justifyContent:e.justifyContent}});te(W,()=>{b.id=0,X(),be()});function H(){var t;const{value:a}=W;return a===null?null:(t=h.value)===null||t===void 0?void 0:t.querySelector(`[data-name="${a}"]`)}function ze(t){if(e.type==="card")return;const{value:a}=p;if(!a)return;const o=a.style.opacity==="0";if(t){const s=`${v.value}-tabs-bar--disabled`,{barWidth:u,placement:_}=e;if(t.dataset.disabled==="true"?a.classList.add(s):a.classList.remove(s),["top","bottom"].includes(_)){if(de(["top","maxHeight","height"]),typeof u=="number"&&t.offsetWidth>=u){const A=Math.floor((t.offsetWidth-u)/2)+t.offsetLeft;a.style.left=`${A}px`,a.style.maxWidth=`${u}px`}else a.style.left=`${t.offsetLeft}px`,a.style.maxWidth=`${t.offsetWidth}px`;a.style.width="8192px",o&&(a.style.transition="none"),a.offsetWidth,o&&(a.style.transition="",a.style.opacity="1")}else{if(de(["left","maxWidth","width"]),typeof u=="number"&&t.offsetHeight>=u){const A=Math.floor((t.offsetHeight-u)/2)+t.offsetTop;a.style.top=`${A}px`,a.style.maxHeight=`${u}px`}else a.style.top=`${t.offsetTop}px`,a.style.maxHeight=`${t.offsetHeight}px`;a.style.height="8192px",o&&(a.style.transition="none"),a.offsetHeight,o&&(a.style.transition="",a.style.opacity="1")}}}function $e(){if(e.type==="card")return;const{value:t}=p;t&&(t.style.opacity="0")}function de(t){const{value:a}=p;if(a)for(const o of t)a.style[o]=""}function X(){if(e.type==="card")return;const t=H();t?ze(t):$e()}function be(){var t;const a=(t=g.value)===null||t===void 0?void 0:t.$el;if(!a)return;const o=H();if(!o)return;const{scrollLeft:s,offsetWidth:u}=a,{offsetLeft:_,offsetWidth:A}=o;s>_?a.scrollTo({top:0,left:_,behavior:"smooth"}):_+A>s+u&&a.scrollTo({top:0,left:_+A-u,behavior:"smooth"})}const U=$(null);let Q=0,O=null;function Te(t){const a=U.value;if(a){Q=t.getBoundingClientRect().height;const o=`${Q}px`,s=()=>{a.style.height=o,a.style.maxHeight=o};O?(s(),O(),O=null):O=s}}function Pe(t){const a=U.value;if(a){const o=t.getBoundingClientRect().height,s=()=>{document.body.offsetHeight,a.style.maxHeight=`${o}px`,a.style.height=`${Math.max(Q,o)}px`};O?(O(),O=null,s()):O=s}}function We(){const t=U.value;if(t){t.style.maxHeight="",t.style.height="";const{paneWrapperStyle:a}=e;if(typeof a=="string")t.style.cssText=a;else if(a){const{maxHeight:o,height:s}=a;o!==void 0&&(t.style.maxHeight=o),s!==void 0&&(t.style.height=s)}}}const ce={value:[]},fe=$("next");function _e(t){const a=W.value;let o="next";for(const s of ce.value){if(s===a)break;if(s===t){o="prev";break}}fe.value=o,Ae(t)}function Ae(t){const{onActiveNameChange:a,onUpdateValue:o,"onUpdate:value":s}=e;a&&Y(a,t),o&&Y(o,t),s&&Y(s,t),N.value=t}function Be(t){const{onClose:a}=e;a&&Y(a,t)}function pe(){const{value:t}=p;if(!t)return;const a="transition-disabled";t.classList.add(a),X(),t.classList.remove(a)}const I=$(null);function Z({transitionDisabled:t}){const a=h.value;if(!a)return;t&&a.classList.add("transition-disabled");const o=H();o&&I.value&&(I.value.style.width=`${o.offsetWidth}px`,I.value.style.height=`${o.offsetHeight}px`,I.value.style.transform=`translateX(${o.offsetLeft-_t(getComputedStyle(a).paddingLeft)}px)`,t&&I.value.offsetWidth),t&&a.classList.remove("transition-disabled")}te([W],()=>{e.type==="segment"&&ae(()=>{Z({transitionDisabled:!1})})}),ft(()=>{e.type==="segment"&&Z({transitionDisabled:!0})});let ue=0;function Le(t){var a;if(t.contentRect.width===0&&t.contentRect.height===0||ue===t.contentRect.width)return;ue=t.contentRect.width;const{type:o}=e;if((o==="line"||o==="bar")&&pe(),o!=="segment"){const{placement:s}=e;ee((s==="top"||s==="bottom"?(a=g.value)===null||a===void 0?void 0:a.$el:R.value)||null)}}const Ee=ne(Le,64);te([()=>e.justifyContent,()=>e.size],()=>{ae(()=>{const{type:t}=e;(t==="line"||t==="bar")&&pe()})});const F=$(!1);function je(t){var a;const{target:o,contentRect:{width:s,height:u}}=t,_=o.parentElement.parentElement.offsetWidth,A=o.parentElement.parentElement.offsetHeight,{placement:M}=e;if(!F.value)M==="top"||M==="bottom"?_<s&&(F.value=!0):A<u&&(F.value=!0);else{const{value:V}=B;if(!V)return;M==="top"||M==="bottom"?_-s>V.$el.offsetWidth&&(F.value=!1):A-u>V.$el.offsetHeight&&(F.value=!1)}ee(((a=g.value)===null||a===void 0?void 0:a.$el)||null)}const ke=ne(je,64);function He(){const{onAdd:t}=e;t&&t(),ae(()=>{const a=H(),{value:o}=g;!a||!o||o.scrollTo({left:a.offsetLeft,top:0,behavior:"smooth"})})}function ee(t){if(!t)return;const{placement:a}=e;if(a==="top"||a==="bottom"){const{scrollLeft:o,scrollWidth:s,offsetWidth:u}=t;x.value=o<=0,P.value=o+u>=s}else{const{scrollTop:o,scrollHeight:s,offsetHeight:u}=t;x.value=o<=0,P.value=o+u>=s}}const Oe=ne(t=>{ee(t.target)},64);pt(le,{triggerRef:E(e,"trigger"),tabStyleRef:E(e,"tabStyle"),tabClassRef:E(e,"tabClass"),addTabStyleRef:E(e,"addTabStyle"),addTabClassRef:E(e,"addTabClass"),paneClassRef:E(e,"paneClass"),paneStyleRef:E(e,"paneStyle"),mergedClsPrefixRef:v,typeRef:E(e,"type"),closableRef:E(e,"closable"),valueRef:W,tabChangeIdRef:b,onBeforeLeaveRef:E(e,"onBeforeLeave"),activateTab:_e,handleClose:Be,handleAdd:He}),Lt(()=>{X(),be()}),ut(()=>{const{value:t}=k;if(!t)return;const{value:a}=v,o=`${a}-tabs-nav-scroll-wrapper--shadow-start`,s=`${a}-tabs-nav-scroll-wrapper--shadow-end`;x.value?t.classList.remove(o):t.classList.add(o),P.value?t.classList.remove(s):t.classList.add(s)});const Ie={syncBarPosition:()=>{X()}},Fe=()=>{Z({transitionDisabled:!0})},ve=J(()=>{const{value:t}=L,{type:a}=e,o={card:"Card",bar:"Bar",line:"Line",segment:"Segment"}[a],s=`${t}${o}`,{self:{barColor:u,closeIconColor:_,closeIconColorHover:A,closeIconColorPressed:M,tabColor:V,tabBorderColor:De,paneTextColor:Me,tabFontWeight:Ne,tabBorderRadius:Ve,tabFontWeightActive:Xe,colorSegment:Ue,fontWeightStrong:Ge,tabColorSegment:Ke,closeSize:Ye,closeIconSize:Je,closeColorHover:qe,closeColorPressed:Qe,closeBorderRadius:Ze,[j("panePadding",t)]:G,[j("tabPadding",s)]:et,[j("tabPaddingVertical",s)]:tt,[j("tabGap",s)]:at,[j("tabGap",`${s}Vertical`)]:rt,[j("tabTextColor",a)]:ot,[j("tabTextColorActive",a)]:nt,[j("tabTextColorHover",a)]:it,[j("tabTextColorDisabled",a)]:st,[j("tabFontSize",t)]:lt},common:{cubicBezierEaseInOut:dt}}=C.value;return{"--n-bezier":dt,"--n-color-segment":Ue,"--n-bar-color":u,"--n-tab-font-size":lt,"--n-tab-text-color":ot,"--n-tab-text-color-active":nt,"--n-tab-text-color-disabled":st,"--n-tab-text-color-hover":it,"--n-pane-text-color":Me,"--n-tab-border-color":De,"--n-tab-border-radius":Ve,"--n-close-size":Ye,"--n-close-icon-size":Je,"--n-close-color-hover":qe,"--n-close-color-pressed":Qe,"--n-close-border-radius":Ze,"--n-close-icon-color":_,"--n-close-icon-color-hover":A,"--n-close-icon-color-pressed":M,"--n-tab-color":V,"--n-tab-font-weight":Ne,"--n-tab-font-weight-active":Xe,"--n-tab-padding":et,"--n-tab-padding-vertical":tt,"--n-tab-gap":at,"--n-tab-gap-vertical":rt,"--n-pane-padding-left":K(G,"left"),"--n-pane-padding-right":K(G,"right"),"--n-pane-padding-top":K(G,"top"),"--n-pane-padding-bottom":K(G,"bottom"),"--n-font-weight-strong":Ge,"--n-tab-color-segment":Ke}}),D=S?Wt("tabs",J(()=>`${L.value[0]}${e.type[0]}`),ve,e):void 0;return Object.assign({mergedClsPrefix:v,mergedValue:W,renderedNames:new Set,segmentCapsuleElRef:I,tabsPaneWrapperRef:U,tabsElRef:h,barElRef:p,addTabInstRef:B,xScrollInstRef:g,scrollWrapperElRef:k,addTabFixed:F,tabWrapperStyle:z,handleNavResize:Ee,mergedSize:L,handleScroll:Oe,handleTabsResize:ke,cssVars:S?void 0:ve,themeClass:D==null?void 0:D.themeClass,animationDirection:fe,renderNameListRef:ce,yScrollElRef:R,handleSegmentResize:Fe,onAnimationBeforeLeave:Te,onAnimationEnter:Pe,onAnimationAfterEnter:We,onRender:D==null?void 0:D.onRender},Ie)},render(){const{mergedClsPrefix:e,type:i,placement:c,addTabFixed:w,addable:d,mergedSize:y,renderNameListRef:v,onRender:S,paneWrapperClass:C,paneWrapperStyle:h,$slots:{default:p,prefix:k,suffix:B}}=this;S==null||S();const g=p?re(p()).filter(b=>b.type.__TAB_PANE__===!0):[],R=p?re(p()).filter(b=>b.type.__TAB__===!0):[],x=!R.length,P=i==="card",L=i==="segment",T=!P&&!L&&this.justifyContent;v.value=[];const N=()=>{const b=l("div",{style:this.tabWrapperStyle,class:`${e}-tabs-wrapper`},T?null:l("div",{class:`${e}-tabs-scroll-padding`,style:c==="top"||c==="bottom"?{width:`${this.tabsPadding}px`}:{height:`${this.tabsPadding}px`}}),x?g.map((z,H)=>(v.value.push(z.props.name),ie(l(se,Object.assign({},z.props,{internalCreatedByPane:!0,internalLeftPadded:H!==0&&(!T||T==="center"||T==="start"||T==="end")}),z.children?{default:z.children.tab}:void 0)))):R.map((z,H)=>(v.value.push(z.props.name),ie(H!==0&&!T?we(z):z))),!w&&d&&P?ye(d,(x?g.length:R.length)!==0):null,T?null:l("div",{class:`${e}-tabs-scroll-padding`,style:{width:`${this.tabsPadding}px`}}));return l("div",{ref:"tabsElRef",class:`${e}-tabs-nav-scroll-content`},P&&d?l(oe,{onResize:this.handleTabsResize},{default:()=>b}):b,P?l("div",{class:`${e}-tabs-pad`}):null,P?null:l("div",{ref:"barElRef",class:`${e}-tabs-bar`}))},W=L?"top":c;return l("div",{class:[`${e}-tabs`,this.themeClass,`${e}-tabs--${i}-type`,`${e}-tabs--${y}-size`,T&&`${e}-tabs--flex`,`${e}-tabs--${W}`],style:this.cssVars},l("div",{class:[`${e}-tabs-nav--${i}-type`,`${e}-tabs-nav--${W}`,`${e}-tabs-nav`]},he(k,b=>b&&l("div",{class:`${e}-tabs-nav__prefix`},b)),L?l(oe,{onResize:this.handleSegmentResize},{default:()=>l("div",{class:`${e}-tabs-rail`,ref:"tabsElRef"},l("div",{class:`${e}-tabs-capsule`,ref:"segmentCapsuleElRef"},l("div",{class:`${e}-tabs-wrapper`},l("div",{class:`${e}-tabs-tab`}))),x?g.map((b,z)=>(v.value.push(b.props.name),l(se,Object.assign({},b.props,{internalCreatedByPane:!0,internalLeftPadded:z!==0}),b.children?{default:b.children.tab}:void 0))):R.map((b,z)=>(v.value.push(b.props.name),z===0?b:we(b))))}):l(oe,{onResize:this.handleNavResize},{default:()=>l("div",{class:`${e}-tabs-nav-scroll-wrapper`,ref:"scrollWrapperElRef"},["top","bottom"].includes(W)?l(Ht,{ref:"xScrollInstRef",onScroll:this.handleScroll},{default:N}):l("div",{class:`${e}-tabs-nav-y-scroll`,onScroll:this.handleScroll,ref:"yScrollElRef"},N()))}),w&&d&&P?ye(d,!0):null,he(B,b=>b&&l("div",{class:`${e}-tabs-nav__suffix`},b))),x&&(this.animated&&(W==="top"||W==="bottom")?l("div",{ref:"tabsPaneWrapperRef",style:h,class:[`${e}-tabs-pane-wrapper`,C]},me(g,this.mergedValue,this.renderedNames,this.onAnimationBeforeLeave,this.onAnimationEnter,this.onAnimationAfterEnter,this.animationDirection)):me(g,this.mergedValue,this.renderedNames)))}});function me(e,i,c,w,d,y,v){const S=[];return e.forEach(C=>{const{name:h,displayDirective:p,"display-directive":k}=C.props,B=R=>p===R||k===R,g=i===h;if(C.key!==void 0&&(C.key=h),g||B("show")||B("show:lazy")&&c.has(h)){c.has(h)||c.add(h);const R=!B("if");S.push(R?vt(C,[[ht,g]]):C)}}),v?l(gt,{name:`${v}-transition`,onBeforeLeave:w,onEnter:d,onAfterEnter:y},{default:()=>S}):S}function ye(e,i){return l(se,{ref:"addTabInstRef",key:"__addable",name:"__addable",internalCreatedByPane:!0,internalAddable:!0,internalLeftPadded:i,disabled:typeof e=="object"&&e.disabled})}function we(e){const i=xt(e);return i.props?i.props.internalLeftPadded=!0:i.props={internalLeftPadded:!0},i}function ie(e){return Array.isArray(e.dynamicProps)?e.dynamicProps.includes("internalLeftPadded")||e.dynamicProps.push("internalLeftPadded"):e.dynamicProps=["internalLeftPadded"],e}export{Yt as N,Kt as a};
