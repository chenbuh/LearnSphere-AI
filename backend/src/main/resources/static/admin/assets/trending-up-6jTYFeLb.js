import{R as T,r as $,s as x,a5 as A,ab as O,V as r,H as _,P as c,aj as q,K as o,ak as D,a7 as u,Q as f,al as X,am as H,an as K,ao as M,ap as Y,aq as U,T as I,ar as Z,Y as E,$ as N,as as G,q as J,a8 as Q,a1 as S,a2 as V,a3 as ee,at as te,J as ne,aa as ie,W,Z as ae,ac as oe,m as re}from"./index-eQW6EF3G.js";import{g as le}from"./Tooltip-OxfLjhjJ.js";import{f as se}from"./use-locale-fpq4J6xd.js";import{u as ce}from"./use-houdini-BK_6MIN3.js";const F=T({name:"SlotMachineNumber",props:{clsPrefix:{type:String,required:!0},value:{type:[Number,String],required:!0},oldOriginalNumber:{type:Number,default:void 0},newOriginalNumber:{type:Number,default:void 0}},setup(e){const i=$(null),a=$(e.value),l=$(e.value),t=$("up"),n=$(!1),m=x(()=>n.value?`${e.clsPrefix}-base-slot-machine-current-number--${t.value}-scroll`:null),p=x(()=>n.value?`${e.clsPrefix}-base-slot-machine-old-number--${t.value}-scroll`:null);A(O(e,"value"),(s,d)=>{a.value=d,l.value=s,_(y)});function y(){const s=e.newOriginalNumber,d=e.oldOriginalNumber;d===void 0||s===void 0||(s>d?g("up"):d>s&&g("down"))}function g(s){t.value=s,n.value=!1,_(()=>{var d;(d=i.value)===null||d===void 0||d.offsetWidth,n.value=!0})}return()=>{const{clsPrefix:s}=e;return r("span",{ref:i,class:`${s}-base-slot-machine-number`},a.value!==null?r("span",{class:[`${s}-base-slot-machine-old-number ${s}-base-slot-machine-old-number--top`,p.value]},a.value):null,r("span",{class:[`${s}-base-slot-machine-current-number`,m.value]},r("span",{ref:"numberWrapper",class:[`${s}-base-slot-machine-current-number__inner`,typeof e.value!="number"&&`${s}-base-slot-machine-current-number__inner--not-number`]},l.value)),a.value!==null?r("span",{class:[`${s}-base-slot-machine-old-number ${s}-base-slot-machine-old-number--bottom`,p.value]},a.value):null)}}}),{cubicBezierEaseOut:C}=q;function me({duration:e=".2s"}={}){return[c("&.fade-up-width-expand-transition-leave-active",{transition:`
 opacity ${e} ${C},
 max-width ${e} ${C},
 transform ${e} ${C}
 `}),c("&.fade-up-width-expand-transition-enter-active",{transition:`
 opacity ${e} ${C},
 max-width ${e} ${C},
 transform ${e} ${C}
 `}),c("&.fade-up-width-expand-transition-enter-to",{opacity:1,transform:"translateX(0) translateY(0)"}),c("&.fade-up-width-expand-transition-enter-from",{maxWidth:"0 !important",opacity:0,transform:"translateY(60%)"}),c("&.fade-up-width-expand-transition-leave-from",{opacity:1,transform:"translateY(0)"}),c("&.fade-up-width-expand-transition-leave-to",{maxWidth:"0 !important",opacity:0,transform:"translateY(60%)"})]}const de=c([c("@keyframes n-base-slot-machine-fade-up-in",`
 from {
 transform: translateY(60%);
 opacity: 0;
 }
 to {
 transform: translateY(0);
 opacity: 1;
 }
 `),c("@keyframes n-base-slot-machine-fade-down-in",`
 from {
 transform: translateY(-60%);
 opacity: 0;
 }
 to {
 transform: translateY(0);
 opacity: 1;
 }
 `),c("@keyframes n-base-slot-machine-fade-up-out",`
 from {
 transform: translateY(0%);
 opacity: 1;
 }
 to {
 transform: translateY(-60%);
 opacity: 0;
 }
 `),c("@keyframes n-base-slot-machine-fade-down-out",`
 from {
 transform: translateY(0%);
 opacity: 1;
 }
 to {
 transform: translateY(60%);
 opacity: 0;
 }
 `),o("base-slot-machine",`
 overflow: hidden;
 white-space: nowrap;
 display: inline-block;
 height: 18px;
 line-height: 18px;
 `,[o("base-slot-machine-number",`
 display: inline-block;
 position: relative;
 height: 18px;
 width: .6em;
 max-width: .6em;
 `,[me({duration:".2s"}),D({duration:".2s",delay:"0s"}),o("base-slot-machine-old-number",`
 display: inline-block;
 opacity: 0;
 position: absolute;
 left: 0;
 right: 0;
 `,[u("top",{transform:"translateY(-100%)"}),u("bottom",{transform:"translateY(100%)"}),u("down-scroll",{animation:"n-base-slot-machine-fade-down-out .2s cubic-bezier(0, 0, .2, 1)",animationIterationCount:1}),u("up-scroll",{animation:"n-base-slot-machine-fade-up-out .2s cubic-bezier(0, 0, .2, 1)",animationIterationCount:1})]),o("base-slot-machine-current-number",`
 display: inline-block;
 position: absolute;
 left: 0;
 top: 0;
 bottom: 0;
 right: 0;
 opacity: 1;
 transform: translateY(0);
 width: .6em;
 `,[u("down-scroll",{animation:"n-base-slot-machine-fade-down-in .2s cubic-bezier(0, 0, .2, 1)",animationIterationCount:1}),u("up-scroll",{animation:"n-base-slot-machine-fade-up-in .2s cubic-bezier(0, 0, .2, 1)",animationIterationCount:1}),f("inner",`
 display: inline-block;
 position: absolute;
 right: 0;
 top: 0;
 width: .6em;
 `,[u("not-number",`
 right: unset;
 left: 0;
 `)])])])])]),ue=T({name:"BaseSlotMachine",props:{clsPrefix:{type:String,required:!0},value:{type:[Number,String],default:0},max:{type:Number,default:void 0},appeared:{type:Boolean,required:!0}},setup(e){X("-base-slot-machine",de,O(e,"clsPrefix"));const i=$(),a=$(),l=x(()=>{if(typeof e.value=="string")return[];if(e.value<1)return[0];const t=[];let n=e.value;for(e.max!==void 0&&(n=Math.min(e.max,n));n>=1;)t.push(n%10),n/=10,n=Math.floor(n);return t.reverse(),t});return A(O(e,"value"),(t,n)=>{typeof t=="string"?(a.value=void 0,i.value=void 0):typeof n=="string"?(a.value=t,i.value=void 0):(a.value=t,i.value=n)}),()=>{const{value:t,clsPrefix:n}=e;return typeof t=="number"?r("span",{class:`${n}-base-slot-machine`},r(H,{name:"fade-up-width-expand-transition",tag:"span"},{default:()=>l.value.map((m,p)=>r(F,{clsPrefix:n,key:l.value.length-p-1,oldOriginalNumber:i.value,newOriginalNumber:a.value,value:m}))}),r(K,{key:"+",width:!0},{default:()=>e.max!==void 0&&e.max<t?r(F,{clsPrefix:n,value:"+"}):null})):r("span",{class:`${n}-base-slot-machine`},t)}}});function fe(e){const{errorColor:i,infoColor:a,successColor:l,warningColor:t,fontFamily:n}=e;return{color:i,colorInfo:a,colorSuccess:l,colorError:i,colorWarning:t,fontSize:"12px",fontFamily:n}}const pe={common:M,self:fe},be=c([c("@keyframes badge-wave-spread",{from:{boxShadow:"0 0 0.5px 0px var(--n-ripple-color)",opacity:.6},to:{boxShadow:"0 0 0.5px 4.5px var(--n-ripple-color)",opacity:0}}),o("badge",`
 display: inline-flex;
 position: relative;
 vertical-align: middle;
 font-family: var(--n-font-family);
 `,[u("as-is",[o("badge-sup",{position:"static",transform:"translateX(0)"},[Y({transformOrigin:"left bottom",originalTransform:"translateX(0)"})])]),u("dot",[o("badge-sup",`
 height: 8px;
 width: 8px;
 padding: 0;
 min-width: 8px;
 left: 100%;
 bottom: calc(100% - 4px);
 `,[c("::before","border-radius: 4px;")])]),o("badge-sup",`
 background: var(--n-color);
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 color: #FFF;
 position: absolute;
 height: 18px;
 line-height: 18px;
 border-radius: 9px;
 padding: 0 6px;
 text-align: center;
 font-size: var(--n-font-size);
 transform: translateX(-50%);
 left: 100%;
 bottom: calc(100% - 9px);
 font-variant-numeric: tabular-nums;
 z-index: 2;
 display: flex;
 align-items: center;
 `,[Y({transformOrigin:"left bottom",originalTransform:"translateX(-50%)"}),o("base-wave",{zIndex:1,animationDuration:"2s",animationIterationCount:"infinite",animationDelay:"1s",animationTimingFunction:"var(--n-ripple-bezier)",animationName:"badge-wave-spread"}),c("&::before",`
 opacity: 0;
 transform: scale(1);
 border-radius: 9px;
 content: "";
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 `)])])]),he=Object.assign(Object.assign({},N.props),{value:[String,Number],max:Number,dot:Boolean,type:{type:String,default:"default"},show:{type:Boolean,default:!0},showZero:Boolean,processing:Boolean,color:String,offset:Array}),Re=T({name:"Badge",props:he,setup(e,{slots:i}){const{mergedClsPrefixRef:a,inlineThemeDisabled:l,mergedRtlRef:t}=E(e),n=N("Badge","-badge",be,pe,e,a),m=$(!1),p=()=>{m.value=!0},y=()=>{m.value=!1},g=x(()=>e.show&&(e.dot||e.value!==void 0&&!(!e.showZero&&Number(e.value)<=0)||!G(i.value)));J(()=>{g.value&&(m.value=!0)});const s=Q("Badge",t,a),d=x(()=>{const{type:h,color:b}=e,{common:{cubicBezierEaseInOut:v,cubicBezierEaseOut:R},self:{[S("color",h)]:w,fontFamily:k,fontSize:P}}=n.value;return{"--n-font-size":P,"--n-font-family":k,"--n-color":b||w,"--n-ripple-color":b||w,"--n-bezier":v,"--n-ripple-bezier":R}}),z=l?V("badge",x(()=>{let h="";const{type:b,color:v}=e;return b&&(h+=b[0]),v&&(h+=ee(v)),h}),d,e):void 0,B=x(()=>{const{offset:h}=e;if(!h)return;const[b,v]=h,R=typeof b=="number"?`${b}px`:b,w=typeof v=="number"?`${v}px`:v;return{transform:`translate(calc(${s?.value?"50%":"-50%"} + ${R}), ${w})`}});return{rtlEnabled:s,mergedClsPrefix:a,appeared:m,showBadge:g,handleAfterEnter:p,handleAfterLeave:y,cssVars:l?void 0:d,themeClass:z?.themeClass,onRender:z?.onRender,offsetStyle:B}},render(){var e;const{mergedClsPrefix:i,onRender:a,themeClass:l,$slots:t}=this;a?.();const n=(e=t.default)===null||e===void 0?void 0:e.call(t);return r("div",{class:[`${i}-badge`,this.rtlEnabled&&`${i}-badge--rtl`,l,{[`${i}-badge--dot`]:this.dot,[`${i}-badge--as-is`]:!n}],style:this.cssVars},n,r(U,{name:"fade-in-scale-up-transition",onAfterEnter:this.handleAfterEnter,onAfterLeave:this.handleAfterLeave},{default:()=>this.showBadge?r("sup",{class:`${i}-badge-sup`,title:le(this.value),style:this.offsetStyle},I(t.value,()=>[this.dot?null:r(ue,{clsPrefix:i,appeared:this.appeared,max:this.max,value:this.value})]),this.processing?r(Z,{clsPrefix:i}):null):null}))}});function ve(e){const{textColor3:i,infoColor:a,errorColor:l,successColor:t,warningColor:n,textColor1:m,textColor2:p,railColor:y,fontWeightStrong:g,fontSize:s}=e;return Object.assign(Object.assign({},te),{contentFontSize:s,titleFontWeight:g,circleBorder:`2px solid ${i}`,circleBorderInfo:`2px solid ${a}`,circleBorderError:`2px solid ${l}`,circleBorderSuccess:`2px solid ${t}`,circleBorderWarning:`2px solid ${n}`,iconColor:i,iconColorInfo:a,iconColorError:l,iconColorSuccess:t,iconColorWarning:n,titleTextColor:m,contentTextColor:p,metaTextColor:i,lineColor:y})}const ge={common:M,self:ve},j=1.25,xe=o("timeline",`
 position: relative;
 width: 100%;
 display: flex;
 flex-direction: column;
 line-height: ${j};
`,[u("horizontal",`
 flex-direction: row;
 `,[c(">",[o("timeline-item",`
 flex-shrink: 0;
 padding-right: 40px;
 `,[u("dashed-line-type",[c(">",[o("timeline-item-timeline",[f("line",`
 background-image: linear-gradient(90deg, var(--n-color-start), var(--n-color-start) 50%, transparent 50%, transparent 100%);
 background-size: 10px 1px;
 `)])])]),c(">",[o("timeline-item-content",`
 margin-top: calc(var(--n-icon-size) + 12px);
 `,[c(">",[f("meta",`
 margin-top: 6px;
 margin-bottom: unset;
 `)])]),o("timeline-item-timeline",`
 width: 100%;
 height: calc(var(--n-icon-size) + 12px);
 `,[f("line",`
 left: var(--n-icon-size);
 top: calc(var(--n-icon-size) / 2 - 1px);
 right: 0px;
 width: unset;
 height: 2px;
 `)])])])])]),u("right-placement",[o("timeline-item",[o("timeline-item-content",`
 text-align: right;
 margin-right: calc(var(--n-icon-size) + 12px);
 `),o("timeline-item-timeline",`
 width: var(--n-icon-size);
 right: 0;
 `)])]),u("left-placement",[o("timeline-item",[o("timeline-item-content",`
 margin-left: calc(var(--n-icon-size) + 12px);
 `),o("timeline-item-timeline",`
 left: 0;
 `)])]),o("timeline-item",`
 position: relative;
 `,[c("&:last-child",[o("timeline-item-timeline",[f("line",`
 display: none;
 `)]),o("timeline-item-content",[f("meta",`
 margin-bottom: 0;
 `)])]),o("timeline-item-content",[f("title",`
 margin: var(--n-title-margin);
 font-size: var(--n-title-font-size);
 transition: color .3s var(--n-bezier);
 font-weight: var(--n-title-font-weight);
 color: var(--n-title-text-color);
 `),f("content",`
 transition: color .3s var(--n-bezier);
 font-size: var(--n-content-font-size);
 color: var(--n-content-text-color);
 `),f("meta",`
 transition: color .3s var(--n-bezier);
 font-size: 12px;
 margin-top: 6px;
 margin-bottom: 20px;
 color: var(--n-meta-text-color);
 `)]),u("dashed-line-type",[o("timeline-item-timeline",[f("line",`
 --n-color-start: var(--n-line-color);
 transition: --n-color-start .3s var(--n-bezier);
 background-color: transparent;
 background-image: linear-gradient(180deg, var(--n-color-start), var(--n-color-start) 50%, transparent 50%, transparent 100%);
 background-size: 1px 10px;
 `)])]),o("timeline-item-timeline",`
 width: calc(var(--n-icon-size) + 12px);
 position: absolute;
 top: calc(var(--n-title-font-size) * ${j} / 2 - var(--n-icon-size) / 2);
 height: 100%;
 `,[f("circle",`
 border: var(--n-circle-border);
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 width: var(--n-icon-size);
 height: var(--n-icon-size);
 border-radius: var(--n-icon-size);
 box-sizing: border-box;
 `),f("icon",`
 color: var(--n-icon-color);
 font-size: var(--n-icon-size);
 height: var(--n-icon-size);
 width: var(--n-icon-size);
 display: flex;
 align-items: center;
 justify-content: center;
 `),f("line",`
 transition: background-color .3s var(--n-bezier);
 position: absolute;
 top: var(--n-icon-size);
 left: calc(var(--n-icon-size) / 2 - 1px);
 bottom: 0px;
 width: 2px;
 background-color: var(--n-line-color);
 `)])])]),ye=Object.assign(Object.assign({},N.props),{horizontal:Boolean,itemPlacement:{type:String,default:"left"},size:{type:String,default:"medium"},iconSize:Number}),L=ne("n-timeline"),Te=T({name:"Timeline",props:ye,setup(e,{slots:i}){const{mergedClsPrefixRef:a}=E(e),l=N("Timeline","-timeline",xe,ge,e,a);return ie(L,{props:e,mergedThemeRef:l,mergedClsPrefixRef:a}),()=>{const{value:t}=a;return r("div",{class:[`${t}-timeline`,e.horizontal&&`${t}-timeline--horizontal`,`${t}-timeline--${e.size}-size`,!e.horizontal&&`${t}-timeline--${e.itemPlacement}-placement`]},i)}}}),ze={time:[String,Number],title:String,content:String,color:String,lineType:{type:String,default:"default"},type:{type:String,default:"default"}},Ne=T({name:"TimelineItem",props:ze,slots:Object,setup(e){const i=ae(L);i||oe("timeline-item","`n-timeline-item` must be placed inside `n-timeline`."),ce();const{inlineThemeDisabled:a}=E(),l=x(()=>{const{props:{size:n,iconSize:m},mergedThemeRef:p}=i,{type:y}=e,{self:{titleTextColor:g,contentTextColor:s,metaTextColor:d,lineColor:z,titleFontWeight:B,contentFontSize:h,[S("iconSize",n)]:b,[S("titleMargin",n)]:v,[S("titleFontSize",n)]:R,[S("circleBorder",y)]:w,[S("iconColor",y)]:k},common:{cubicBezierEaseInOut:P}}=p.value;return{"--n-bezier":P,"--n-circle-border":w,"--n-icon-color":k,"--n-content-font-size":h,"--n-content-text-color":s,"--n-line-color":z,"--n-meta-text-color":d,"--n-title-font-size":R,"--n-title-font-weight":B,"--n-title-margin":v,"--n-title-text-color":g,"--n-icon-size":se(m)||b}}),t=a?V("timeline-item",x(()=>{const{props:{size:n,iconSize:m}}=i,{type:p}=e;return`${n[0]}${m||"a"}${p[0]}`}),l,i.props):void 0;return{mergedClsPrefix:i.mergedClsPrefixRef,cssVars:a?void 0:l,themeClass:t?.themeClass,onRender:t?.onRender}},render(){const{mergedClsPrefix:e,color:i,onRender:a,$slots:l}=this;return a?.(),r("div",{class:[`${e}-timeline-item`,this.themeClass,`${e}-timeline-item--${this.type}-type`,`${e}-timeline-item--${this.lineType}-line-type`],style:this.cssVars},r("div",{class:`${e}-timeline-item-timeline`},r("div",{class:`${e}-timeline-item-timeline__line`}),W(l.icon,t=>t?r("div",{class:`${e}-timeline-item-timeline__icon`,style:{color:i}},t):r("div",{class:`${e}-timeline-item-timeline__circle`,style:{borderColor:i}}))),r("div",{class:`${e}-timeline-item-content`},W(l.header,t=>t||this.title?r("div",{class:`${e}-timeline-item-content__title`},t||this.title):null),r("div",{class:`${e}-timeline-item-content__content`},I(l.default,()=>[this.content])),r("div",{class:`${e}-timeline-item-content__meta`},I(l.footer,()=>[this.time]))))}});const Be=re("trending-up",[["path",{d:"M16 7h6v6",key:"box55l"}],["path",{d:"m22 7-8.5 8.5-5-5L2 17",key:"1t1m79"}]]);export{Re as N,Be as T,Te as a,Ne as b};
