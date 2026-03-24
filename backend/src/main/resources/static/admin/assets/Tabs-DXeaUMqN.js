import{m as Q,h as l,r as $,l as Ce,y as ft,F as pt,d as X,w as ae,f as ut,q as vt,E as ht,G as gt,x as xt,D as mt,z as re,u as yt,t as E}from"./vue-core-D0hS1H_N.js";import{a1 as wt,Q as St,X as Ct,a2 as Rt,a3 as zt,a4 as $t,a5 as Tt,g as r,i as n,e as f,j as x,G as Pt,Z as oe,H as ge,V as ne,p as Wt,q as Re,a6 as _t,t as Lt,O as At,w as j,a7 as K,L as J}from"./index-CgnLzOPV.js";import{A as Bt}from"./Add-D-Z7YLlB.js";import{c as Et,a as xe,o as jt}from"./cssr-P6yp2zno.js";import{u as kt}from"./use-merged-state-CN_abeNs.js";import{u as me}from"./use-compitable-Dsw3m3ey.js";import{t as Ht}from"./vendor-DpTcvmEL.js";const Ot=xe(".v-x-scroll",{overflow:"auto",scrollbarWidth:"none"},[xe("&::-webkit-scrollbar",{width:0,height:0})]),Ft=Q({name:"XScroll",props:{disabled:Boolean,onScroll:Function},setup(){const e=$(null);function i(d){!(d.currentTarget.offsetWidth<d.currentTarget.scrollWidth)||d.deltaY===0||(d.currentTarget.scrollLeft+=d.deltaY+d.deltaX,d.preventDefault())}const c=wt();return Ot.mount({id:"vueuc/x-scroll",head:!0,anchorMetaName:Et,ssr:c}),Object.assign({selfRef:e,handleWheel:i},{scrollTo(...d){var m;(m=e.value)===null||m===void 0||m.scrollTo(...d)}})},render(){return l("div",{ref:"selfRef",onScroll:this.onScroll,onWheel:this.disabled?void 0:this.handleWheel,class:"v-x-scroll"},this.$slots)}}),de=St("n-tabs"),ze={tab:[String,Number,Object,Function],name:{type:[String,Number],required:!0},disabled:Boolean,displayDirective:{type:String,default:"if"},closable:{type:Boolean,default:void 0},tabProps:Object,label:[String,Number,Object,Function]},Kt=Q({__TAB_PANE__:!0,name:"TabPane",alias:["TabPanel"],props:ze,slots:Object,setup(e){const i=Ce(de,null);return i||Ct("tab-pane","`n-tab-pane` must be placed inside `n-tabs`."),{style:i.paneStyleRef,class:i.paneClassRef,mergedClsPrefix:i.mergedClsPrefixRef}},render(){return l("div",{class:[`${this.mergedClsPrefix}-tab-pane`,this.class],style:this.style},this.$slots)}}),It=Object.assign({internalLeftPadded:Boolean,internalAddable:Boolean,internalCreatedByPane:Boolean},Tt(ze,["displayDirective"])),le=Q({__TAB__:!0,inheritAttrs:!1,name:"Tab",props:It,setup(e){const{mergedClsPrefixRef:i,valueRef:c,typeRef:S,closableRef:d,tabStyleRef:m,addTabStyleRef:v,tabClassRef:C,addTabClassRef:y,tabChangeIdRef:R,onBeforeLeaveRef:h,triggerRef:W,handleAdd:A,activateTab:z,handleClose:g}=Ce(de);return{trigger:W,mergedClosable:X(()=>{if(e.internalAddable)return!1;const{closable:w}=e;return w===void 0?d.value:w}),style:m,addStyle:v,tabClass:C,addTabClass:y,clsPrefix:i,value:c,type:S,handleClose(w){w.stopPropagation(),!e.disabled&&g(e.name)},activateTab(){if(e.disabled)return;if(e.internalAddable){A();return}const{name:w}=e,P=++R.id;if(w!==c.value){const{value:B}=h;B?Promise.resolve(B(e.name,c.value)).then(T=>{T&&R.id===P&&z(w)}):z(w)}}}},render(){const{internalAddable:e,clsPrefix:i,name:c,disabled:S,label:d,tab:m,value:v,mergedClosable:C,trigger:y,$slots:{default:R}}=this,h=d!=null?d:m;return l("div",{class:`${i}-tabs-tab-wrapper`},this.internalLeftPadded?l("div",{class:`${i}-tabs-tab-pad`}):null,l("div",Object.assign({key:c,"data-name":c,"data-disabled":S?!0:void 0},ft({class:[`${i}-tabs-tab`,v===c&&`${i}-tabs-tab--active`,S&&`${i}-tabs-tab--disabled`,C&&`${i}-tabs-tab--closable`,e&&`${i}-tabs-tab--addable`,e?this.addTabClass:this.tabClass],onClick:y==="click"?this.activateTab:void 0,onMouseenter:y==="hover"?this.activateTab:void 0,style:e?this.addStyle:this.style},this.internalCreatedByPane?this.tabProps||{}:this.$attrs)),l("span",{class:`${i}-tabs-tab__label`},e?l(pt,null,l("div",{class:`${i}-tabs-tab__height-placeholder`}," "),l(Rt,{clsPrefix:i},{default:()=>l(Bt,null)})):R?R():typeof h=="object"?h:zt(h!=null?h:c)),C&&this.type==="card"?l($t,{clsPrefix:i,class:`${i}-tabs-tab__close`,onClick:this.handleClose,disabled:S}):null))}}),Dt=r("tabs",`
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
 `,[x("prefix, suffix",`
 display: flex;
 align-items: center;
 `),x("prefix","padding-right: 16px;"),x("suffix","padding-left: 16px;")]),n("top, bottom",[f(">",[r("tabs-nav",[r("tabs-nav-scroll-wrapper",[f("&::before",`
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
 `,[n("disabled",{cursor:"not-allowed"}),x("close",`
 margin-left: 6px;
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 `),x("label",`
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
 `),n("disabled",{color:"var(--n-tab-text-color-disabled)"})])]),r("tabs-nav",[n("line-type",[n("top",[x("prefix, suffix",`
 border-bottom: 1px solid var(--n-tab-border-color);
 `),r("tabs-nav-scroll-content",`
 border-bottom: 1px solid var(--n-tab-border-color);
 `),r("tabs-bar",`
 bottom: -1px;
 `)]),n("left",[x("prefix, suffix",`
 border-right: 1px solid var(--n-tab-border-color);
 `),r("tabs-nav-scroll-content",`
 border-right: 1px solid var(--n-tab-border-color);
 `),r("tabs-bar",`
 right: -1px;
 `)]),n("right",[x("prefix, suffix",`
 border-left: 1px solid var(--n-tab-border-color);
 `),r("tabs-nav-scroll-content",`
 border-left: 1px solid var(--n-tab-border-color);
 `),r("tabs-bar",`
 left: -1px;
 `)]),n("bottom",[x("prefix, suffix",`
 border-top: 1px solid var(--n-tab-border-color);
 `),r("tabs-nav-scroll-content",`
 border-top: 1px solid var(--n-tab-border-color);
 `),r("tabs-bar",`
 top: -1px;
 `)]),x("prefix, suffix",`
 transition: border-color .3s var(--n-bezier);
 `),r("tabs-nav-scroll-content",`
 transition: border-color .3s var(--n-bezier);
 `),r("tabs-bar",`
 border-radius: 0;
 `)]),n("card-type",[x("prefix, suffix",`
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
 `,[x("height-placeholder",`
 width: 0;
 font-size: var(--n-tab-font-size);
 `),Pt("disabled",[f("&:hover",`
 color: var(--n-tab-text-color-hover);
 `)])]),n("closable","padding-right: 8px;"),n("active",`
 background-color: #0000;
 font-weight: var(--n-tab-font-weight-active);
 color: var(--n-tab-text-color-active);
 `),n("disabled","color: var(--n-tab-text-color-disabled);")])]),n("left, right",`
 flex-direction: column; 
 `,[x("prefix, suffix",`
 padding: var(--n-tab-padding-vertical);
 `),r("tabs-wrapper",`
 flex-direction: column;
 `),r("tabs-tab-wrapper",`
 flex-direction: column;
 `,[r("tabs-tab-pad",`
 height: var(--n-tab-gap-vertical);
 width: 100%;
 `)])]),n("top",[n("card-type",[r("tabs-scroll-padding","border-bottom: 1px solid var(--n-tab-border-color);"),x("prefix, suffix",`
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
 `)])]),n("left",[n("card-type",[r("tabs-scroll-padding","border-right: 1px solid var(--n-tab-border-color);"),x("prefix, suffix",`
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
 `)])]),n("right",[n("card-type",[r("tabs-scroll-padding","border-left: 1px solid var(--n-tab-border-color);"),x("prefix, suffix",`
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
 `)])]),n("bottom",[n("card-type",[r("tabs-scroll-padding","border-top: 1px solid var(--n-tab-border-color);"),x("prefix, suffix",`
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
 `)])])])]),ie=Ht,Mt=Object.assign(Object.assign({},Re.props),{value:[String,Number],defaultValue:[String,Number],trigger:{type:String,default:"click"},type:{type:String,default:"bar"},closable:Boolean,justifyContent:String,size:String,placement:{type:String,default:"top"},tabStyle:[String,Object],tabClass:String,addTabStyle:[String,Object],addTabClass:String,barWidth:Number,paneClass:String,paneStyle:[String,Object],paneWrapperClass:String,paneWrapperStyle:[String,Object],addable:[Boolean,Object],tabsPadding:{type:Number,default:0},animated:Boolean,onBeforeLeave:Function,onAdd:Function,"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array],onClose:[Function,Array],labelSize:String,activeName:[String,Number],onActiveNameChange:[Function,Array]}),Jt=Q({name:"Tabs",props:Mt,slots:Object,setup(e,{slots:i}){var c,S,d,m;const{mergedClsPrefixRef:v,inlineThemeDisabled:C,mergedComponentPropsRef:y}=Wt(e),R=Re("Tabs","-tabs",Dt,_t,e,v),h=$(null),W=$(null),A=$(null),z=$(null),g=$(null),w=$(null),P=$(!0),B=$(!0),T=me(e,["labelSize","size"]),O=X(()=>{var t,a;if(T.value)return T.value;const o=(a=(t=y==null?void 0:y.value)===null||t===void 0?void 0:t.Tabs)===null||a===void 0?void 0:a.size;return o||"medium"}),k=me(e,["activeName","value"]),b=$((S=(c=k.value)!==null&&c!==void 0?c:e.defaultValue)!==null&&S!==void 0?S:i.default?(m=(d=oe(i.default())[0])===null||d===void 0?void 0:d.props)===null||m===void 0?void 0:m.name:null),u=kt(k,b),F={id:0},$e=X(()=>{if(!(!e.justifyContent||e.type==="card"))return{display:"flex",justifyContent:e.justifyContent}});ae(u,()=>{F.id=0,U(),ce()});function G(){var t;const{value:a}=u;return a===null?null:(t=h.value)===null||t===void 0?void 0:t.querySelector(`[data-name="${a}"]`)}function Te(t){if(e.type==="card")return;const{value:a}=W;if(!a)return;const o=a.style.opacity==="0";if(t){const s=`${v.value}-tabs-bar--disabled`,{barWidth:p,placement:_}=e;if(t.dataset.disabled==="true"?a.classList.add(s):a.classList.remove(s),["top","bottom"].includes(_)){if(be(["top","maxHeight","height"]),typeof p=="number"&&t.offsetWidth>=p){const L=Math.floor((t.offsetWidth-p)/2)+t.offsetLeft;a.style.left=`${L}px`,a.style.maxWidth=`${p}px`}else a.style.left=`${t.offsetLeft}px`,a.style.maxWidth=`${t.offsetWidth}px`;a.style.width="8192px",o&&(a.style.transition="none"),a.offsetWidth,o&&(a.style.transition="",a.style.opacity="1")}else{if(be(["left","maxWidth","width"]),typeof p=="number"&&t.offsetHeight>=p){const L=Math.floor((t.offsetHeight-p)/2)+t.offsetTop;a.style.top=`${L}px`,a.style.maxHeight=`${p}px`}else a.style.top=`${t.offsetTop}px`,a.style.maxHeight=`${t.offsetHeight}px`;a.style.height="8192px",o&&(a.style.transition="none"),a.offsetHeight,o&&(a.style.transition="",a.style.opacity="1")}}}function Pe(){if(e.type==="card")return;const{value:t}=W;t&&(t.style.opacity="0")}function be(t){const{value:a}=W;if(a)for(const o of t)a.style[o]=""}function U(){if(e.type==="card")return;const t=G();t?Te(t):Pe()}function ce(){var t;const a=(t=g.value)===null||t===void 0?void 0:t.$el;if(!a)return;const o=G();if(!o)return;const{scrollLeft:s,offsetWidth:p}=a,{offsetLeft:_,offsetWidth:L}=o;s>_?a.scrollTo({top:0,left:_,behavior:"smooth"}):_+L>s+p&&a.scrollTo({top:0,left:_+L-p,behavior:"smooth"})}const q=$(null);let Z=0,H=null;function We(t){const a=q.value;if(a){Z=t.getBoundingClientRect().height;const o=`${Z}px`,s=()=>{a.style.height=o,a.style.maxHeight=o};H?(s(),H(),H=null):H=s}}function _e(t){const a=q.value;if(a){const o=t.getBoundingClientRect().height,s=()=>{document.body.offsetHeight,a.style.maxHeight=`${o}px`,a.style.height=`${Math.max(Z,o)}px`};H?(H(),H=null,s()):H=s}}function Le(){const t=q.value;if(t){t.style.maxHeight="",t.style.height="";const{paneWrapperStyle:a}=e;if(typeof a=="string")t.style.cssText=a;else if(a){const{maxHeight:o,height:s}=a;o!==void 0&&(t.style.maxHeight=o),s!==void 0&&(t.style.height=s)}}}const fe={value:[]},pe=$("next");function Ae(t){const a=u.value;let o="next";for(const s of fe.value){if(s===a)break;if(s===t){o="prev";break}}pe.value=o,Be(t)}function Be(t){const{onActiveNameChange:a,onUpdateValue:o,"onUpdate:value":s}=e;a&&J(a,t),o&&J(o,t),s&&J(s,t),b.value=t}function Ee(t){const{onClose:a}=e;a&&J(a,t)}function ue(){const{value:t}=W;if(!t)return;const a="transition-disabled";t.classList.add(a),U(),t.classList.remove(a)}const I=$(null);function ee({transitionDisabled:t}){const a=h.value;if(!a)return;t&&a.classList.add("transition-disabled");const o=G();o&&I.value&&(I.value.style.width=`${o.offsetWidth}px`,I.value.style.height=`${o.offsetHeight}px`,I.value.style.transform=`translateX(${o.offsetLeft-At(getComputedStyle(a).paddingLeft)}px)`,t&&I.value.offsetWidth),t&&a.classList.remove("transition-disabled")}ae([u],()=>{e.type==="segment"&&re(()=>{ee({transitionDisabled:!1})})}),ut(()=>{e.type==="segment"&&ee({transitionDisabled:!0})});let ve=0;function je(t){var a;if(t.contentRect.width===0&&t.contentRect.height===0||ve===t.contentRect.width)return;ve=t.contentRect.width;const{type:o}=e;if((o==="line"||o==="bar")&&ue(),o!=="segment"){const{placement:s}=e;te((s==="top"||s==="bottom"?(a=g.value)===null||a===void 0?void 0:a.$el:w.value)||null)}}const ke=ie(je,64);ae([()=>e.justifyContent,()=>e.size],()=>{re(()=>{const{type:t}=e;(t==="line"||t==="bar")&&ue()})});const D=$(!1);function He(t){var a;const{target:o,contentRect:{width:s,height:p}}=t,_=o.parentElement.parentElement.offsetWidth,L=o.parentElement.parentElement.offsetHeight,{placement:V}=e;if(!D.value)V==="top"||V==="bottom"?_<s&&(D.value=!0):L<p&&(D.value=!0);else{const{value:N}=z;if(!N)return;V==="top"||V==="bottom"?_-s>N.$el.offsetWidth&&(D.value=!1):L-p>N.$el.offsetHeight&&(D.value=!1)}te(((a=g.value)===null||a===void 0?void 0:a.$el)||null)}const Oe=ie(He,64);function Fe(){const{onAdd:t}=e;t&&t(),re(()=>{const a=G(),{value:o}=g;!a||!o||o.scrollTo({left:a.offsetLeft,top:0,behavior:"smooth"})})}function te(t){if(!t)return;const{placement:a}=e;if(a==="top"||a==="bottom"){const{scrollLeft:o,scrollWidth:s,offsetWidth:p}=t;P.value=o<=0,B.value=o+p>=s}else{const{scrollTop:o,scrollHeight:s,offsetHeight:p}=t;P.value=o<=0,B.value=o+p>=s}}const Ie=ie(t=>{te(t.target)},64);yt(de,{triggerRef:E(e,"trigger"),tabStyleRef:E(e,"tabStyle"),tabClassRef:E(e,"tabClass"),addTabStyleRef:E(e,"addTabStyle"),addTabClassRef:E(e,"addTabClass"),paneClassRef:E(e,"paneClass"),paneStyleRef:E(e,"paneStyle"),mergedClsPrefixRef:v,typeRef:E(e,"type"),closableRef:E(e,"closable"),valueRef:u,tabChangeIdRef:F,onBeforeLeaveRef:E(e,"onBeforeLeave"),activateTab:Ae,handleClose:Ee,handleAdd:Fe}),jt(()=>{U(),ce()}),vt(()=>{const{value:t}=A;if(!t)return;const{value:a}=v,o=`${a}-tabs-nav-scroll-wrapper--shadow-start`,s=`${a}-tabs-nav-scroll-wrapper--shadow-end`;P.value?t.classList.remove(o):t.classList.add(o),B.value?t.classList.remove(s):t.classList.add(s)});const De={syncBarPosition:()=>{U()}},Me=()=>{ee({transitionDisabled:!0})},he=X(()=>{const{value:t}=O,{type:a}=e,o={card:"Card",bar:"Bar",line:"Line",segment:"Segment"}[a],s=`${t}${o}`,{self:{barColor:p,closeIconColor:_,closeIconColorHover:L,closeIconColorPressed:V,tabColor:N,tabBorderColor:Ve,paneTextColor:Ne,tabFontWeight:Xe,tabBorderRadius:Ge,tabFontWeightActive:Ue,colorSegment:qe,fontWeightStrong:Ye,tabColorSegment:Ke,closeSize:Je,closeIconSize:Qe,closeColorHover:Ze,closeColorPressed:et,closeBorderRadius:tt,[j("panePadding",t)]:Y,[j("tabPadding",s)]:at,[j("tabPaddingVertical",s)]:rt,[j("tabGap",s)]:ot,[j("tabGap",`${s}Vertical`)]:nt,[j("tabTextColor",a)]:it,[j("tabTextColorActive",a)]:st,[j("tabTextColorHover",a)]:lt,[j("tabTextColorDisabled",a)]:dt,[j("tabFontSize",t)]:bt},common:{cubicBezierEaseInOut:ct}}=R.value;return{"--n-bezier":ct,"--n-color-segment":qe,"--n-bar-color":p,"--n-tab-font-size":bt,"--n-tab-text-color":it,"--n-tab-text-color-active":st,"--n-tab-text-color-disabled":dt,"--n-tab-text-color-hover":lt,"--n-pane-text-color":Ne,"--n-tab-border-color":Ve,"--n-tab-border-radius":Ge,"--n-close-size":Je,"--n-close-icon-size":Qe,"--n-close-color-hover":Ze,"--n-close-color-pressed":et,"--n-close-border-radius":tt,"--n-close-icon-color":_,"--n-close-icon-color-hover":L,"--n-close-icon-color-pressed":V,"--n-tab-color":N,"--n-tab-font-weight":Xe,"--n-tab-font-weight-active":Ue,"--n-tab-padding":at,"--n-tab-padding-vertical":rt,"--n-tab-gap":ot,"--n-tab-gap-vertical":nt,"--n-pane-padding-left":K(Y,"left"),"--n-pane-padding-right":K(Y,"right"),"--n-pane-padding-top":K(Y,"top"),"--n-pane-padding-bottom":K(Y,"bottom"),"--n-font-weight-strong":Ye,"--n-tab-color-segment":Ke}}),M=C?Lt("tabs",X(()=>`${O.value[0]}${e.type[0]}`),he,e):void 0;return Object.assign({mergedClsPrefix:v,mergedValue:u,renderedNames:new Set,segmentCapsuleElRef:I,tabsPaneWrapperRef:q,tabsElRef:h,barElRef:W,addTabInstRef:z,xScrollInstRef:g,scrollWrapperElRef:A,addTabFixed:D,tabWrapperStyle:$e,handleNavResize:ke,mergedSize:O,handleScroll:Ie,handleTabsResize:Oe,cssVars:C?void 0:he,themeClass:M==null?void 0:M.themeClass,animationDirection:pe,renderNameListRef:fe,yScrollElRef:w,handleSegmentResize:Me,onAnimationBeforeLeave:We,onAnimationEnter:_e,onAnimationAfterEnter:Le,onRender:M==null?void 0:M.onRender},De)},render(){const{mergedClsPrefix:e,type:i,placement:c,addTabFixed:S,addable:d,mergedSize:m,renderNameListRef:v,onRender:C,paneWrapperClass:y,paneWrapperStyle:R,$slots:{default:h,prefix:W,suffix:A}}=this;C==null||C();const z=h?oe(h()).filter(b=>b.type.__TAB_PANE__===!0):[],g=h?oe(h()).filter(b=>b.type.__TAB__===!0):[],w=!g.length,P=i==="card",B=i==="segment",T=!P&&!B&&this.justifyContent;v.value=[];const O=()=>{const b=l("div",{style:this.tabWrapperStyle,class:`${e}-tabs-wrapper`},T?null:l("div",{class:`${e}-tabs-scroll-padding`,style:c==="top"||c==="bottom"?{width:`${this.tabsPadding}px`}:{height:`${this.tabsPadding}px`}}),w?z.map((u,F)=>(v.value.push(u.props.name),se(l(le,Object.assign({},u.props,{internalCreatedByPane:!0,internalLeftPadded:F!==0&&(!T||T==="center"||T==="start"||T==="end")}),u.children?{default:u.children.tab}:void 0)))):g.map((u,F)=>(v.value.push(u.props.name),se(F!==0&&!T?Se(u):u))),!S&&d&&P?we(d,(w?z.length:g.length)!==0):null,T?null:l("div",{class:`${e}-tabs-scroll-padding`,style:{width:`${this.tabsPadding}px`}}));return l("div",{ref:"tabsElRef",class:`${e}-tabs-nav-scroll-content`},P&&d?l(ne,{onResize:this.handleTabsResize},{default:()=>b}):b,P?l("div",{class:`${e}-tabs-pad`}):null,P?null:l("div",{ref:"barElRef",class:`${e}-tabs-bar`}))},k=B?"top":c;return l("div",{class:[`${e}-tabs`,this.themeClass,`${e}-tabs--${i}-type`,`${e}-tabs--${m}-size`,T&&`${e}-tabs--flex`,`${e}-tabs--${k}`],style:this.cssVars},l("div",{class:[`${e}-tabs-nav--${i}-type`,`${e}-tabs-nav--${k}`,`${e}-tabs-nav`]},ge(W,b=>b&&l("div",{class:`${e}-tabs-nav__prefix`},b)),B?l(ne,{onResize:this.handleSegmentResize},{default:()=>l("div",{class:`${e}-tabs-rail`,ref:"tabsElRef"},l("div",{class:`${e}-tabs-capsule`,ref:"segmentCapsuleElRef"},l("div",{class:`${e}-tabs-wrapper`},l("div",{class:`${e}-tabs-tab`}))),w?z.map((b,u)=>(v.value.push(b.props.name),l(le,Object.assign({},b.props,{internalCreatedByPane:!0,internalLeftPadded:u!==0}),b.children?{default:b.children.tab}:void 0))):g.map((b,u)=>(v.value.push(b.props.name),u===0?b:Se(b))))}):l(ne,{onResize:this.handleNavResize},{default:()=>l("div",{class:`${e}-tabs-nav-scroll-wrapper`,ref:"scrollWrapperElRef"},["top","bottom"].includes(k)?l(Ft,{ref:"xScrollInstRef",onScroll:this.handleScroll},{default:O}):l("div",{class:`${e}-tabs-nav-y-scroll`,onScroll:this.handleScroll,ref:"yScrollElRef"},O()))}),S&&d&&P?we(d,!0):null,ge(A,b=>b&&l("div",{class:`${e}-tabs-nav__suffix`},b))),w&&(this.animated&&(k==="top"||k==="bottom")?l("div",{ref:"tabsPaneWrapperRef",style:R,class:[`${e}-tabs-pane-wrapper`,y]},ye(z,this.mergedValue,this.renderedNames,this.onAnimationBeforeLeave,this.onAnimationEnter,this.onAnimationAfterEnter,this.animationDirection)):ye(z,this.mergedValue,this.renderedNames)))}});function ye(e,i,c,S,d,m,v){const C=[];return e.forEach(y=>{const{name:R,displayDirective:h,"display-directive":W}=y.props,A=g=>h===g||W===g,z=i===R;if(y.key!==void 0&&(y.key=R),z||A("show")||A("show:lazy")&&c.has(R)){c.has(R)||c.add(R);const g=!A("if");C.push(g?ht(y,[[gt,z]]):y)}}),v?l(xt,{name:`${v}-transition`,onBeforeLeave:S,onEnter:d,onAfterEnter:m},{default:()=>C}):C}function we(e,i){return l(le,{ref:"addTabInstRef",key:"__addable",name:"__addable",internalCreatedByPane:!0,internalAddable:!0,internalLeftPadded:i,disabled:typeof e=="object"&&e.disabled})}function Se(e){const i=mt(e);return i.props?i.props.internalLeftPadded=!0:i.props={internalLeftPadded:!0},i}function se(e){return Array.isArray(e.dynamicProps)?e.dynamicProps.includes("internalLeftPadded")||e.dynamicProps.push("internalLeftPadded"):e.dynamicProps=["internalLeftPadded"],e}export{Jt as N,Kt as a};
