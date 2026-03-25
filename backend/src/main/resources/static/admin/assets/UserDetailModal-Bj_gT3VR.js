var Xe=Object.defineProperty,Ye=Object.defineProperties;var Qe=Object.getOwnPropertyDescriptors;var Ce=Object.getOwnPropertySymbols;var Ze=Object.prototype.hasOwnProperty,Je=Object.prototype.propertyIsEnumerable;var ke=(e,t,i)=>t in e?Xe(e,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):e[t]=i,Te=(e,t)=>{for(var i in t||(t={}))Ze.call(t,i)&&ke(e,i,t[i]);if(Ce)for(var i of Ce(t))Je.call(t,i)&&ke(e,i,t[i]);return e},$e=(e,t)=>Ye(e,Qe(t));var ce=(e,t,i)=>new Promise((g,v)=>{var p=c=>{try{b(i.next(c))}catch(r){v(r)}},y=c=>{try{b(i.throw(c))}catch(r){v(r)}},b=c=>c.done?g(c.value):Promise.resolve(c.value).then(p,y);b((i=i.apply(e,t)).next())});import{P as et,Q as _e,g as x,R as De,e as I,S as Me,j as _,r as xe,H as ye,V as tt,p as te,q as K,T as it,t as le,x as rt,w as Y,m as nt,U as ot,i as V,s as He,W as at,X as Fe,Y as st,u as lt,N as Le,B as Re,y as dt,a as ue}from"./index-CyjrJ4_E.js";import"./echarts-ZFsoJFlT.js";import{_ as ct}from"./_plugin-vue_export-helper-DlAUqK2U.js";import{t as ut,N as ie}from"./Tag-Bid1lt5u.js";import{m as Q,h as f,l as se,d as D,r as B,f as mt,q as vt,e as Ve,w as ze,u as We,t as ft,F as ae,S as E,P as A,Q as s,R as d,K as o,V as u,X as T,k as P,Z as X,U as re,W as me,z as gt}from"./vue-core-D0hS1H_N.js";import{r as ht,A as Oe,x as pt,B as Ee,M as bt,T as xt}from"./icons-CvkHsZ-X.js";import{f as yt}from"./use-locale-UAqvieSt.js";import{u as zt}from"./use-houdini-BOU-9NEw.js";import{N as Pe}from"./Spin-jv-Ufsq3.js";import{N as _t,a as ne}from"./Tabs-D0F8tc1F.js";import{a as ve,N as G}from"./Grid-eBpzNkLc.js";import{N as Ie}from"./Divider-VUxMylMd.js";import{N as St,a as oe}from"./DescriptionsItem-DqdpN3x_.js";import{N as je}from"./Empty-CrpKdJgp.js";import{N as Ne}from"./Space-CdmhL9Vi.js";import{N as wt}from"./Alert-CKQmaNYE.js";import{N as Ct}from"./Progress-rOZgIVkC.js";import{e as fe}from"./echarts-vendor-BqruBGPJ.js";import"./utils-CLwJHxMN.js";import"./vendor-DpTcvmEL.js";import"./use-compitable-Dsw3m3ey.js";import"./Add-D-Z7YLlB.js";import"./cssr-D1dZ0xQm.js";import"./use-merged-state-CN_abeNs.js";import"./get-slot-Bk_rJcZu.js";import"./next-frame-once-C5Ksf8W7.js";const kt=et&&"loading"in document.createElement("img");function Tt(e={}){var t;const{root:i=null}=e;return{hash:`${e.rootMargin||"0px 0px 0px 0px"}-${Array.isArray(e.threshold)?e.threshold.join(","):(t=e.threshold)!==null&&t!==void 0?t:"0"}`,options:Object.assign(Object.assign({},e),{root:(typeof i=="string"?document.querySelector(i):i)||document.documentElement})}}const ge=new WeakMap,he=new WeakMap,pe=new WeakMap,$t=(e,t,i)=>{if(!e)return()=>{};const g=Tt(t),{root:v}=g.options;let p;const y=ge.get(v);y?p=y:(p=new Map,ge.set(v,p));let b,c;p.has(g.hash)?(c=p.get(g.hash),c[1].has(e)||(b=c[0],c[1].add(e),b.observe(e))):(b=new IntersectionObserver($=>{$.forEach(C=>{if(C.isIntersecting){const w=he.get(C.target),R=pe.get(C.target);w&&w(),R&&(R.value=!0)}})},g.options),b.observe(e),c=[b,new Set([e])],p.set(g.hash,c));let r=!1;const m=()=>{r||(he.delete(e),pe.delete(e),r=!0,c[1].has(e)&&(c[0].unobserve(e),c[1].delete(e)),c[1].size<=0&&p.delete(g.hash),p.size||ge.delete(v))};return he.set(e,m),pe.set(e,i),m},Lt=_e("n-avatar-group"),Rt=x("avatar",`
 width: var(--n-merged-size);
 height: var(--n-merged-size);
 color: #FFF;
 font-size: var(--n-font-size);
 display: inline-flex;
 position: relative;
 overflow: hidden;
 text-align: center;
 border: var(--n-border);
 border-radius: var(--n-border-radius);
 --n-merged-color: var(--n-color);
 background-color: var(--n-merged-color);
 transition:
 border-color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
`,[De(I("&","--n-merged-color: var(--n-color-modal);")),Me(I("&","--n-merged-color: var(--n-color-popover);")),I("img",`
 width: 100%;
 height: 100%;
 `),_("text",`
 white-space: nowrap;
 display: inline-block;
 position: absolute;
 left: 50%;
 top: 50%;
 `),x("icon",`
 vertical-align: bottom;
 font-size: calc(var(--n-merged-size) - 6px);
 `),_("text","line-height: 1.25")]),Ot=Object.assign(Object.assign({},K.props),{size:[String,Number],src:String,circle:{type:Boolean,default:void 0},objectFit:String,round:{type:Boolean,default:void 0},bordered:{type:Boolean,default:void 0},onError:Function,fallbackSrc:String,intersectionObserverOptions:Object,lazy:Boolean,onLoad:Function,renderPlaceholder:Function,renderFallback:Function,imgProps:Object,color:String}),Et=Q({name:"Avatar",props:Ot,slots:Object,setup(e){const{mergedClsPrefixRef:t,inlineThemeDisabled:i}=te(e),g=B(!1);let v=null;const p=B(null),y=B(null),b=()=>{const{value:l}=p;if(l&&(v===null||v!==l.innerHTML)){v=l.innerHTML;const{value:z}=y;if(z){const{offsetWidth:k,offsetHeight:M}=z,{offsetWidth:N,offsetHeight:Z}=l,q=.9,J=Math.min(k/N*q,M/Z*q,1);l.style.transform=`translateX(-50%) translateY(-50%) scale(${J})`}}},c=se(Lt,null),r=D(()=>{const{size:l}=e;if(l)return l;const{size:z}=c||{};return z||"medium"}),m=K("Avatar","-avatar",Rt,it,e,t),$=se(ut,null),C=D(()=>{if(c)return!0;const{round:l,circle:z}=e;return l!==void 0||z!==void 0?l||z:$?$.roundRef.value:!1}),w=D(()=>c?!0:e.bordered||!1),R=D(()=>{const l=r.value,z=C.value,k=w.value,{color:M}=e,{self:{borderRadius:N,fontSize:Z,color:q,border:J,colorModal:de,colorPopover:a},common:{cubicBezierEaseInOut:n}}=m.value;let S;return typeof l=="number"?S=`${l}px`:S=m.value.self[Y("height",l)],{"--n-font-size":Z,"--n-border":k?J:"none","--n-border-radius":z?"50%":N,"--n-color":M||q,"--n-color-modal":M||de,"--n-color-popover":M||a,"--n-bezier":n,"--n-merged-size":`var(--n-avatar-size-override, ${S})`}}),L=i?le("avatar",D(()=>{const l=r.value,z=C.value,k=w.value,{color:M}=e;let N="";return l&&(typeof l=="number"?N+=`a${l}`:N+=l[0]),z&&(N+="b"),k&&(N+="c"),M&&(N+=rt(M)),N}),R,e):void 0,j=B(!e.lazy);mt(()=>{if(e.lazy&&e.intersectionObserverOptions){let l;const z=vt(()=>{l==null||l(),l=void 0,e.lazy&&(l=$t(y.value,e.intersectionObserverOptions,j))});Ve(()=>{z(),l==null||l()})}}),ze(()=>{var l;return e.src||((l=e.imgProps)===null||l===void 0?void 0:l.src)},()=>{g.value=!1});const W=B(!e.lazy);return{textRef:p,selfRef:y,mergedRoundRef:C,mergedClsPrefix:t,fitTextTransform:b,cssVars:i?void 0:R,themeClass:L==null?void 0:L.themeClass,onRender:L==null?void 0:L.onRender,hasLoadError:g,shouldStartLoading:j,loaded:W,mergedOnError:l=>{if(!j.value)return;g.value=!0;const{onError:z,imgProps:{onError:k}={}}=e;z==null||z(l),k==null||k(l)},mergedOnLoad:l=>{const{onLoad:z,imgProps:{onLoad:k}={}}=e;z==null||z(l),k==null||k(l),W.value=!0}}},render(){var e,t;const{$slots:i,src:g,mergedClsPrefix:v,lazy:p,onRender:y,loaded:b,hasLoadError:c,imgProps:r={}}=this;y==null||y();let m;const $=!b&&!c&&(this.renderPlaceholder?this.renderPlaceholder():(t=(e=this.$slots).placeholder)===null||t===void 0?void 0:t.call(e));return this.hasLoadError?m=this.renderFallback?this.renderFallback():xe(i.fallback,()=>[f("img",{src:this.fallbackSrc,style:{objectFit:this.objectFit}})]):m=ye(i.default,C=>{if(C)return f(tt,{onResize:this.fitTextTransform},{default:()=>f("span",{ref:"textRef",class:`${v}-avatar__text`},C)});if(g||r.src){const w=this.src||r.src;return f("img",Object.assign(Object.assign({},r),{loading:kt&&!this.intersectionObserverOptions&&p?"lazy":"eager",src:p&&this.intersectionObserverOptions?this.shouldStartLoading?w:void 0:w,"data-image-src":w,onLoad:this.mergedOnLoad,onError:this.mergedOnError,style:[r.style||"",{objectFit:this.objectFit},$?{height:"0",width:"0",visibility:"hidden",position:"absolute"}:""]}))}}),f("span",{ref:"selfRef",class:[`${v}-avatar`,this.themeClass],style:this.cssVars},m,p&&$)}});function Pt(e){const{textColor3:t,infoColor:i,errorColor:g,successColor:v,warningColor:p,textColor1:y,textColor2:b,railColor:c,fontWeightStrong:r,fontSize:m}=e;return Object.assign(Object.assign({},ot),{contentFontSize:m,titleFontWeight:r,circleBorder:`2px solid ${t}`,circleBorderInfo:`2px solid ${i}`,circleBorderError:`2px solid ${g}`,circleBorderSuccess:`2px solid ${v}`,circleBorderWarning:`2px solid ${p}`,iconColor:t,iconColorInfo:i,iconColorError:g,iconColorSuccess:v,iconColorWarning:p,titleTextColor:y,contentTextColor:b,metaTextColor:t,lineColor:c})}const It={common:nt,self:Pt},jt=I([x("list",`
 --n-merged-border-color: var(--n-border-color);
 --n-merged-color: var(--n-color);
 --n-merged-color-hover: var(--n-color-hover);
 margin: 0;
 font-size: var(--n-font-size);
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 padding: 0;
 list-style-type: none;
 color: var(--n-text-color);
 background-color: var(--n-merged-color);
 `,[V("show-divider",[x("list-item",[I("&:not(:last-child)",[_("divider",`
 background-color: var(--n-merged-border-color);
 `)])])]),V("clickable",[x("list-item",`
 cursor: pointer;
 `)]),V("bordered",`
 border: 1px solid var(--n-merged-border-color);
 border-radius: var(--n-border-radius);
 `),V("hoverable",[x("list-item",`
 border-radius: var(--n-border-radius);
 `,[I("&:hover",`
 background-color: var(--n-merged-color-hover);
 `,[_("divider",`
 background-color: transparent;
 `)])])]),V("bordered, hoverable",[x("list-item",`
 padding: 12px 20px;
 `),_("header, footer",`
 padding: 12px 20px;
 `)]),_("header, footer",`
 padding: 12px 0;
 box-sizing: border-box;
 transition: border-color .3s var(--n-bezier);
 `,[I("&:not(:last-child)",`
 border-bottom: 1px solid var(--n-merged-border-color);
 `)]),x("list-item",`
 position: relative;
 padding: 12px 0; 
 box-sizing: border-box;
 display: flex;
 flex-wrap: nowrap;
 align-items: center;
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 `,[_("prefix",`
 margin-right: 20px;
 flex: 0;
 `),_("suffix",`
 margin-left: 20px;
 flex: 0;
 `),_("main",`
 flex: 1;
 `),_("divider",`
 height: 1px;
 position: absolute;
 bottom: 0;
 left: 0;
 right: 0;
 background-color: transparent;
 transition: background-color .3s var(--n-bezier);
 pointer-events: none;
 `)])]),De(x("list",`
 --n-merged-color-hover: var(--n-color-hover-modal);
 --n-merged-color: var(--n-color-modal);
 --n-merged-border-color: var(--n-border-color-modal);
 `)),Me(x("list",`
 --n-merged-color-hover: var(--n-color-hover-popover);
 --n-merged-color: var(--n-color-popover);
 --n-merged-border-color: var(--n-border-color-popover);
 `))]),Nt=Object.assign(Object.assign({},K.props),{size:{type:String,default:"medium"},bordered:Boolean,clickable:Boolean,hoverable:Boolean,showDivider:{type:Boolean,default:!0}}),Ue=_e("n-list"),Ae=Q({name:"List",props:Nt,slots:Object,setup(e){const{mergedClsPrefixRef:t,inlineThemeDisabled:i,mergedRtlRef:g}=te(e),v=He("List",g,t),p=K("List","-list",jt,at,e,t);We(Ue,{showDividerRef:ft(e,"showDivider"),mergedClsPrefixRef:t});const y=D(()=>{const{common:{cubicBezierEaseInOut:c},self:{fontSize:r,textColor:m,color:$,colorModal:C,colorPopover:w,borderColor:R,borderColorModal:L,borderColorPopover:j,borderRadius:W,colorHover:l,colorHoverModal:z,colorHoverPopover:k}}=p.value;return{"--n-font-size":r,"--n-bezier":c,"--n-text-color":m,"--n-color":$,"--n-border-radius":W,"--n-border-color":R,"--n-border-color-modal":L,"--n-border-color-popover":j,"--n-color-modal":C,"--n-color-popover":w,"--n-color-hover":l,"--n-color-hover-modal":z,"--n-color-hover-popover":k}}),b=i?le("list",void 0,y,e):void 0;return{mergedClsPrefix:t,rtlEnabled:v,cssVars:i?void 0:y,themeClass:b==null?void 0:b.themeClass,onRender:b==null?void 0:b.onRender}},render(){var e;const{$slots:t,mergedClsPrefix:i,onRender:g}=this;return g==null||g(),f("ul",{class:[`${i}-list`,this.rtlEnabled&&`${i}-list--rtl`,this.bordered&&`${i}-list--bordered`,this.showDivider&&`${i}-list--show-divider`,this.hoverable&&`${i}-list--hoverable`,this.clickable&&`${i}-list--clickable`,this.themeClass],style:this.cssVars},t.header?f("div",{class:`${i}-list__header`},t.header()):null,(e=t.default)===null||e===void 0?void 0:e.call(t),t.footer?f("div",{class:`${i}-list__footer`},t.footer()):null)}}),be=Q({name:"ListItem",slots:Object,setup(){const e=se(Ue,null);return e||Fe("list-item","`n-list-item` must be placed in `n-list`."),{showDivider:e.showDividerRef,mergedClsPrefix:e.mergedClsPrefixRef}},render(){const{$slots:e,mergedClsPrefix:t}=this;return f("li",{class:`${t}-list-item`},e.prefix?f("div",{class:`${t}-list-item__prefix`},e.prefix()):null,e.default?f("div",{class:`${t}-list-item__main`},e):null,e.suffix?f("div",{class:`${t}-list-item__suffix`},e.suffix()):null,this.showDivider&&f("div",{class:`${t}-list-item__divider`}))}}),At=x("thing",`
 display: flex;
 transition: color .3s var(--n-bezier);
 font-size: var(--n-font-size);
 color: var(--n-text-color);
`,[x("thing-avatar",`
 margin-right: 12px;
 margin-top: 2px;
 `),x("thing-avatar-header-wrapper",`
 display: flex;
 flex-wrap: nowrap;
 `,[x("thing-header-wrapper",`
 flex: 1;
 `)]),x("thing-main",`
 flex-grow: 1;
 `,[x("thing-header",`
 display: flex;
 margin-bottom: 4px;
 justify-content: space-between;
 align-items: center;
 `,[_("title",`
 font-size: 16px;
 font-weight: var(--n-title-font-weight);
 transition: color .3s var(--n-bezier);
 color: var(--n-title-text-color);
 `)]),_("description",[I("&:not(:last-child)",`
 margin-bottom: 4px;
 `)]),_("content",[I("&:not(:first-child)",`
 margin-top: 12px;
 `)]),_("footer",[I("&:not(:first-child)",`
 margin-top: 12px;
 `)]),_("action",[I("&:not(:first-child)",`
 margin-top: 12px;
 `)])])]),Bt=Object.assign(Object.assign({},K.props),{title:String,titleExtra:String,description:String,descriptionClass:String,descriptionStyle:[String,Object],content:String,contentClass:String,contentStyle:[String,Object],contentIndented:Boolean}),Dt=Q({name:"Thing",props:Bt,slots:Object,setup(e,{slots:t}){const{mergedClsPrefixRef:i,inlineThemeDisabled:g,mergedRtlRef:v}=te(e),p=K("Thing","-thing",At,st,e,i),y=He("Thing",v,i),b=D(()=>{const{self:{titleTextColor:r,textColor:m,titleFontWeight:$,fontSize:C},common:{cubicBezierEaseInOut:w}}=p.value;return{"--n-bezier":w,"--n-font-size":C,"--n-text-color":m,"--n-title-font-weight":$,"--n-title-text-color":r}}),c=g?le("thing",void 0,b,e):void 0;return()=>{var r;const{value:m}=i,$=y?y.value:!1;return(r=c==null?void 0:c.onRender)===null||r===void 0||r.call(c),f("div",{class:[`${m}-thing`,c==null?void 0:c.themeClass,$&&`${m}-thing--rtl`],style:g?void 0:b.value},t.avatar&&e.contentIndented?f("div",{class:`${m}-thing-avatar`},t.avatar()):null,f("div",{class:`${m}-thing-main`},!e.contentIndented&&(t.header||e.title||t["header-extra"]||e.titleExtra||t.avatar)?f("div",{class:`${m}-thing-avatar-header-wrapper`},t.avatar?f("div",{class:`${m}-thing-avatar`},t.avatar()):null,t.header||e.title||t["header-extra"]||e.titleExtra?f("div",{class:`${m}-thing-header-wrapper`},f("div",{class:`${m}-thing-header`},t.header||e.title?f("div",{class:`${m}-thing-header__title`},t.header?t.header():e.title):null,t["header-extra"]||e.titleExtra?f("div",{class:`${m}-thing-header__extra`},t["header-extra"]?t["header-extra"]():e.titleExtra):null),t.description||e.description?f("div",{class:[`${m}-thing-main__description`,e.descriptionClass],style:e.descriptionStyle},t.description?t.description():e.description):null):null):f(ae,null,t.header||e.title||t["header-extra"]||e.titleExtra?f("div",{class:`${m}-thing-header`},t.header||e.title?f("div",{class:`${m}-thing-header__title`},t.header?t.header():e.title):null,t["header-extra"]||e.titleExtra?f("div",{class:`${m}-thing-header__extra`},t["header-extra"]?t["header-extra"]():e.titleExtra):null):null,t.description||e.description?f("div",{class:[`${m}-thing-main__description`,e.descriptionClass],style:e.descriptionStyle},t.description?t.description():e.description):null),t.default||e.content?f("div",{class:[`${m}-thing-main__content`,e.contentClass],style:e.contentStyle},t.default?t.default():e.content):null,t.footer?f("div",{class:`${m}-thing-main__footer`},t.footer()):null,t.action?f("div",{class:`${m}-thing-main__action`},t.action()):null))}}}),Be=1.25,Mt=x("timeline",`
 position: relative;
 width: 100%;
 display: flex;
 flex-direction: column;
 line-height: ${Be};
`,[V("horizontal",`
 flex-direction: row;
 `,[I(">",[x("timeline-item",`
 flex-shrink: 0;
 padding-right: 40px;
 `,[V("dashed-line-type",[I(">",[x("timeline-item-timeline",[_("line",`
 background-image: linear-gradient(90deg, var(--n-color-start), var(--n-color-start) 50%, transparent 50%, transparent 100%);
 background-size: 10px 1px;
 `)])])]),I(">",[x("timeline-item-content",`
 margin-top: calc(var(--n-icon-size) + 12px);
 `,[I(">",[_("meta",`
 margin-top: 6px;
 margin-bottom: unset;
 `)])]),x("timeline-item-timeline",`
 width: 100%;
 height: calc(var(--n-icon-size) + 12px);
 `,[_("line",`
 left: var(--n-icon-size);
 top: calc(var(--n-icon-size) / 2 - 1px);
 right: 0px;
 width: unset;
 height: 2px;
 `)])])])])]),V("right-placement",[x("timeline-item",[x("timeline-item-content",`
 text-align: right;
 margin-right: calc(var(--n-icon-size) + 12px);
 `),x("timeline-item-timeline",`
 width: var(--n-icon-size);
 right: 0;
 `)])]),V("left-placement",[x("timeline-item",[x("timeline-item-content",`
 margin-left: calc(var(--n-icon-size) + 12px);
 `),x("timeline-item-timeline",`
 left: 0;
 `)])]),x("timeline-item",`
 position: relative;
 `,[I("&:last-child",[x("timeline-item-timeline",[_("line",`
 display: none;
 `)]),x("timeline-item-content",[_("meta",`
 margin-bottom: 0;
 `)])]),x("timeline-item-content",[_("title",`
 margin: var(--n-title-margin);
 font-size: var(--n-title-font-size);
 transition: color .3s var(--n-bezier);
 font-weight: var(--n-title-font-weight);
 color: var(--n-title-text-color);
 `),_("content",`
 transition: color .3s var(--n-bezier);
 font-size: var(--n-content-font-size);
 color: var(--n-content-text-color);
 `),_("meta",`
 transition: color .3s var(--n-bezier);
 font-size: 12px;
 margin-top: 6px;
 margin-bottom: 20px;
 color: var(--n-meta-text-color);
 `)]),V("dashed-line-type",[x("timeline-item-timeline",[_("line",`
 --n-color-start: var(--n-line-color);
 transition: --n-color-start .3s var(--n-bezier);
 background-color: transparent;
 background-image: linear-gradient(180deg, var(--n-color-start), var(--n-color-start) 50%, transparent 50%, transparent 100%);
 background-size: 1px 10px;
 `)])]),x("timeline-item-timeline",`
 width: calc(var(--n-icon-size) + 12px);
 position: absolute;
 top: calc(var(--n-title-font-size) * ${Be} / 2 - var(--n-icon-size) / 2);
 height: 100%;
 `,[_("circle",`
 border: var(--n-circle-border);
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 width: var(--n-icon-size);
 height: var(--n-icon-size);
 border-radius: var(--n-icon-size);
 box-sizing: border-box;
 `),_("icon",`
 color: var(--n-icon-color);
 font-size: var(--n-icon-size);
 height: var(--n-icon-size);
 width: var(--n-icon-size);
 display: flex;
 align-items: center;
 justify-content: center;
 `),_("line",`
 transition: background-color .3s var(--n-bezier);
 position: absolute;
 top: var(--n-icon-size);
 left: calc(var(--n-icon-size) / 2 - 1px);
 bottom: 0px;
 width: 2px;
 background-color: var(--n-line-color);
 `)])])]),Ht=Object.assign(Object.assign({},K.props),{horizontal:Boolean,itemPlacement:{type:String,default:"left"},size:{type:String,default:"medium"},iconSize:Number}),Ge=_e("n-timeline"),Ft=Q({name:"Timeline",props:Ht,setup(e,{slots:t}){const{mergedClsPrefixRef:i}=te(e),g=K("Timeline","-timeline",Mt,It,e,i);return We(Ge,{props:e,mergedThemeRef:g,mergedClsPrefixRef:i}),()=>{const{value:v}=i;return f("div",{class:[`${v}-timeline`,e.horizontal&&`${v}-timeline--horizontal`,`${v}-timeline--${e.size}-size`,!e.horizontal&&`${v}-timeline--${e.itemPlacement}-placement`]},t)}}}),Vt={time:[String,Number],title:String,content:String,color:String,lineType:{type:String,default:"default"},type:{type:String,default:"default"}},Wt=Q({name:"TimelineItem",props:Vt,slots:Object,setup(e){const t=se(Ge);t||Fe("timeline-item","`n-timeline-item` must be placed inside `n-timeline`."),zt();const{inlineThemeDisabled:i}=te(),g=D(()=>{const{props:{size:p,iconSize:y},mergedThemeRef:b}=t,{type:c}=e,{self:{titleTextColor:r,contentTextColor:m,metaTextColor:$,lineColor:C,titleFontWeight:w,contentFontSize:R,[Y("iconSize",p)]:L,[Y("titleMargin",p)]:j,[Y("titleFontSize",p)]:W,[Y("circleBorder",c)]:l,[Y("iconColor",c)]:z},common:{cubicBezierEaseInOut:k}}=b.value;return{"--n-bezier":k,"--n-circle-border":l,"--n-icon-color":z,"--n-content-font-size":R,"--n-content-text-color":m,"--n-line-color":C,"--n-meta-text-color":$,"--n-title-font-size":W,"--n-title-font-weight":w,"--n-title-margin":j,"--n-title-text-color":r,"--n-icon-size":yt(y)||L}}),v=i?le("timeline-item",D(()=>{const{props:{size:p,iconSize:y}}=t,{type:b}=e;return`${p[0]}${y||"a"}${b[0]}`}),g,t.props):void 0;return{mergedClsPrefix:t.mergedClsPrefixRef,cssVars:i?void 0:g,themeClass:v==null?void 0:v.themeClass,onRender:v==null?void 0:v.onRender}},render(){const{mergedClsPrefix:e,color:t,onRender:i,$slots:g}=this;return i==null||i(),f("div",{class:[`${e}-timeline-item`,this.themeClass,`${e}-timeline-item--${this.type}-type`,`${e}-timeline-item--${this.lineType}-line-type`],style:this.cssVars},f("div",{class:`${e}-timeline-item-timeline`},f("div",{class:`${e}-timeline-item-timeline__line`}),ye(g.icon,v=>v?f("div",{class:`${e}-timeline-item-timeline__icon`,style:{color:t}},v):f("div",{class:`${e}-timeline-item-timeline__circle`,style:{borderColor:t}}))),f("div",{class:`${e}-timeline-item-content`},ye(g.header,v=>v||this.title?f("div",{class:`${e}-timeline-item-content__title`},v||this.title):null),f("div",{class:`${e}-timeline-item-content__content`},xe(g.default,()=>[this.content])),f("div",{class:`${e}-timeline-item-content__meta`},xe(g.footer,()=>[this.time]))))}}),Ut={class:"user-profile-header p-6 bg-black/10"},Gt={class:"flex items-center gap-6"},Kt={class:"flex-1"},qt={class:"flex items-center gap-3 mb-2"},Xt={class:"text-2xl font-bold text-white mb-0"},Yt={class:"flex items-center gap-4 text-zinc-400 text-sm"},Qt={class:"flex items-center gap-1"},Zt={key:0,class:"flex flex-col items-end text-red-400"},Jt={class:"flex flex-col"},ei={class:"stat-box"},ti={class:"flex justify-between items-start mb-2"},ii={class:"value"},ri={class:"stat-box"},ni={class:"flex justify-between items-start mb-2"},oi={class:"value"},ai={class:"stat-box"},si={class:"flex justify-between items-start mb-2"},li={class:"value"},di={class:"stat-box"},ci={class:"flex justify-between items-start mb-2"},ui={class:"value text-rose-500"},mi={class:"chart-container"},vi={class:"chart-container"},fi={class:"text-xs text-gray-500"},gi={class:"text-xs text-gray-500"},hi={class:"bg-black/20 p-3 rounded text-sm text-gray-300 font-mono"},pi={class:"flex items-center justify-center p-4"},bi={class:"flex items-center gap-2"},xi={__name:"UserDetailModal",props:{show:{type:Boolean,default:!1},user:{type:Object,default:()=>({})}},emits:["update:show"],setup(e,{emit:t}){const i=e,g=t,v=lt(),p=D({get:()=>i.show,set:a=>g("update:show",a)}),y=B("overview"),b=B(!1),c=B(!1),r=B({}),m=B([]),$=B(null),C=B(null);let w=null,R=null,L=null,j=null;const W=D(()=>{var a,n,S,H;return((a=r.value.user)==null?void 0:a.nickname)||((n=r.value.user)==null?void 0:n.username)||((S=i.user)==null?void 0:S.nickname)||((H=i.user)==null?void 0:H.username)||"未命名用户"}),l=D(()=>{var n,S,H;const a=((n=r.value.user)==null?void 0:n.username)||((S=i.user)==null?void 0:S.username)||"user";return((H=r.value.user)==null?void 0:H.avatar)||`https://api.dicebear.com/7.x/avataaars/svg?seed=${a}`}),z=(a={})=>$e(Te({},a),{riskLevel:a.riskLevel||"LOW",skillScores:a.skillScores||{},usageTrend:a.usageTrend||[],statistics:a.statistics||{},learningTrack:a.learningTrack||{recentActivities:[]},valueSegmentation:a.valueSegmentation||{}}),k=()=>{w&&(w.dispose(),w=null),R&&(R.dispose(),R=null)},M=()=>{L&&(clearTimeout(L),L=null),j&&(clearTimeout(j),j=null)},N=()=>{if(!(!i.show||y.value!=="overview")){if($.value){w&&w.dispose(),w=fe.init($.value);const a=r.value.skillScores||{};w.setOption({backgroundColor:"transparent",radar:{indicator:[{name:"词汇",max:100},{name:"语法",max:100},{name:"阅读",max:100},{name:"听力",max:100},{name:"口语",max:100},{name:"写作",max:100}],splitArea:{show:!1},axisLine:{lineStyle:{color:"rgba(255,255,255,0.1)"}}},series:[{type:"radar",data:[{value:[a.vocabulary||0,a.grammar||0,a.reading||0,a.listening||0,a.speaking||0,a.writing||0],name:"能力评价",areaStyle:{color:"rgba(99, 102, 241, 0.4)"},lineStyle:{width:2},itemStyle:{color:"#6366f1"}}]}]})}if(C.value){R&&R.dispose(),R=fe.init(C.value);const a=r.value.usageTrend||[];R.setOption({backgroundColor:"transparent",tooltip:{trigger:"axis"},grid:{left:40,right:20,bottom:20,top:20},xAxis:{type:"category",data:a.map(n=>(n.date||"").slice(5)),axisLabel:{color:"#666",fontSize:10}},yAxis:{type:"value",min:0,axisLabel:{color:"#666",fontSize:10},splitLine:{lineStyle:{color:"rgba(255,255,255,0.05)"}}},series:[{data:a.map(n=>n.value),type:"line",smooth:!0,itemStyle:{color:"#f59e0b"},areaStyle:{color:new fe.graphic.LinearGradient(0,0,0,1,[{offset:0,color:"rgba(245, 158, 11, 0.2)"},{offset:1,color:"transparent"}])}}]})}}},Z=(a=300)=>{L&&clearTimeout(L),L=setTimeout(()=>{N(),L=null},a)},q=a=>({SUCCESS:"成功",FAILED:"失败",ERROR:"失败",PENDING:"处理中"})[a]||a||"未知状态",J=a=>ce(null,null,function*(){var n;c.value=!0;try{const S=yield ue.getAILogs({userId:a,page:1,size:50});m.value=((n=S.data)==null?void 0:n.records)||[]}catch(S){console.error("Fetch AI logs failed",S),m.value=[]}finally{c.value=!1}}),de=()=>ce(null,null,function*(){var n;const a=(n=i.user)==null?void 0:n.id;if(!(!a||b.value)){y.value="overview",b.value=!0;try{try{const S=yield ue.getUserProfile(a);r.value=z(S.data)}catch(S){console.warn("Advanced profile failed, falling back to basic details",S);const O=(yield ue.getUserDetails(a)).data||{};r.value=z({user:O.user,vip:O.vip,vipExpireTime:O.vipExpireTime,userTag:O.userTag||"普通用户",riskLevel:O.riskLevel||"LOW",skillScores:O.skillScores||{},usageTrend:O.usageTrend||[],statistics:{totalWordsLearned:O.totalWordsLearned||0,totalAiUsage:O.totalAiUsage||0,totalCheckins:0,studyStreak:0},learningTrack:{recentActivities:[]},valueSegmentation:{segment:O.userTag||"普通用户",ltv:0,engagementScore:50,churnRisk:O.riskLevel==="HIGH"?80:20,reasons:["基础数据视图"]}}),v.warning("用户详情服务暂不可用，已切换到基础视图")}yield J(a),gt(()=>{Z()})}catch(S){console.error(S),v.error("获取用户详情失败")}finally{b.value=!1}}});return ze(()=>{var a;return[i.show,(a=i.user)==null?void 0:a.id]},([a,n],S=[])=>{const[H,O]=S;a&&n&&(!H||n!==O)&&de(),a||(M(),k(),y.value="overview",r.value={},m.value=[])},{immediate:!0}),ze(y,a=>{a!=="overview"||!i.show||(j&&clearTimeout(j),j=setTimeout(()=>{N(),j=null},150))}),Ve(()=>{M(),k()}),(a,n)=>(E(),A(o(dt),{show:p.value,"onUpdate:show":n[1]||(n[1]=S=>p.value=S),preset:"card",title:"用户详情",style:{width:"900px",height:"85vh"},"content-style":{padding:0,overflowY:"auto"}},{default:s(()=>[d(o(Pe),{show:b.value},{default:s(()=>{var S,H,O,Se,we;return[u("div",Ut,[u("div",Gt,[d(o(Et),{round:"",size:80,src:l.value},null,8,["src"]),u("div",Kt,[u("div",qt,[u("h2",Xt,T(W.value),1),d(o(ie),{bordered:!1,type:"info",round:"",size:"small"},{icon:s(()=>[r.value.vip?(E(),A(o(ht),{key:0,size:12})):X("",!0)]),default:s(()=>[P(" "+T(r.value.vip?"VIP会员":"普通用户"),1)]),_:1}),(S=r.value.valueSegmentation)!=null&&S.segment?(E(),A(o(ie),{key:0,bordered:!1,type:r.value.riskLevel==="HIGH"?"error":"warning",round:"",size:"small"},{default:s(()=>[P(T(r.value.valueSegmentation.segment),1)]),_:1},8,["type"])):X("",!0)]),u("div",Yt,[u("span",null,"ID: "+T(((H=r.value.user)==null?void 0:H.id)||((O=i.user)==null?void 0:O.id)),1),n[2]||(n[2]=u("span",null,"|",-1)),u("span",null,"注册时间: "+T((Se=r.value.user)!=null&&Se.createTime?new Date(r.value.user.createTime).toLocaleDateString():"-"),1),n[3]||(n[3]=u("span",null,"|",-1)),u("span",Qt,[d(o(Oe),{size:14}),P(" 最近登录: "+T((we=r.value.user)!=null&&we.lastLoginTime?new Date(r.value.user.lastLoginTime).toLocaleString():"从未登录"),1)])])]),r.value.riskLevel==="HIGH"?(E(),re("div",Zt,[d(o(pt),{size:24}),n[4]||(n[4]=u("span",{class:"text-xs font-bold mt-1"},"需重点关注",-1))])):X("",!0)])]),u("div",Jt,[d(o(_t),{value:y.value,"onUpdate:value":n[0]||(n[0]=h=>y.value=h),type:"line",animated:"",class:"w-full","pane-class":"p-6"},{default:s(()=>[d(o(ne),{name:"overview",tab:"基础概览","display-directive":"show"},{default:s(()=>[d(o(ve),{cols:4,"x-gap":16,class:"mb-8","item-responsive":"",responsive:"screen"},{default:s(()=>[d(o(G),{span:"4 m:1"},{default:s(()=>{var h;return[u("div",ei,[u("div",ti,[n[5]||(n[5]=u("div",{class:"label"},"累计学习词汇",-1)),d(o(Ee),{size:16,class:"text-indigo-400"})]),u("div",ii,T(((h=r.value.statistics)==null?void 0:h.totalWordsLearned)||0),1)])]}),_:1}),d(o(G),{span:"4 m:1"},{default:s(()=>{var h;return[u("div",ri,[u("div",ni,[n[6]||(n[6]=u("div",{class:"label"},"AI 对话次数",-1)),d(o(bt),{size:16,class:"text-emerald-400"})]),u("div",oi,T(((h=r.value.statistics)==null?void 0:h.totalAiUsage)||0),1)])]}),_:1}),d(o(G),{span:"4 m:1"},{default:s(()=>{var h;return[u("div",ai,[u("div",si,[n[7]||(n[7]=u("div",{class:"label"},"连续签到",-1)),d(o(Oe),{size:16,class:"text-amber-400"})]),u("div",li,[P(T(((h=r.value.statistics)==null?void 0:h.totalCheckins)||0)+" ",1),n[8]||(n[8]=u("span",{class:"unit"},"天",-1))])])]}),_:1}),d(o(G),{span:"4 m:1"},{default:s(()=>{var h;return[u("div",di,[u("div",ci,[n[9]||(n[9]=u("div",{class:"label"},"活跃度评分",-1)),d(o(xt),{size:16,class:"text-rose-400"})]),u("div",ui,T(((h=r.value.valueSegmentation)==null?void 0:h.engagementScore)||0),1)])]}),_:1})]),_:1}),d(o(ve),{cols:2,"x-gap":24,class:"mb-6"},{default:s(()=>[d(o(G),null,{default:s(()=>[u("div",mi,[n[10]||(n[10]=u("h4",{class:"chart-title"},"能力分布",-1)),u("div",{ref_key:"radarChartRef",ref:$,style:{height:"300px"}},null,512)])]),_:1}),d(o(G),null,{default:s(()=>[u("div",vi,[n[11]||(n[11]=u("h4",{class:"chart-title"},"近 7 日 AI 使用趋势",-1)),u("div",{ref_key:"usageChartRef",ref:C,style:{height:"300px"}},null,512)])]),_:1})]),_:1}),d(o(Ie),{dashed:""},{default:s(()=>[...n[12]||(n[12]=[P("账户明细",-1)])]),_:1}),d(o(St),{bordered:"",size:"small",column:2},{default:s(()=>[d(o(oe),{label:"账号名称"},{default:s(()=>{var h;return[P(T((h=r.value.user)==null?void 0:h.username),1)]}),_:1}),d(o(oe),{label:"绑定邮箱"},{default:s(()=>{var h;return[P(T(((h=r.value.user)==null?void 0:h.email)||"未绑定"),1)]}),_:1}),d(o(oe),{label:"VIP 到期"},{default:s(()=>[P(T(r.value.vipExpireTime?new Date(r.value.vipExpireTime).toLocaleString():"未开通"),1)]),_:1}),d(o(oe),{label:"最后登录"},{default:s(()=>{var h;return[P(T((h=r.value.user)!=null&&h.lastLoginTime?new Date(r.value.user.lastLoginTime).toLocaleString():"从未登录"),1)]}),_:1})]),_:1})]),_:1}),d(o(ne),{name:"journey",tab:"学习记录"},{default:s(()=>{var h,U;return[((U=(h=r.value.learningTrack)==null?void 0:h.recentActivities)==null?void 0:U.length)>0?(E(),A(o(Ft),{key:0},{default:s(()=>[(E(!0),re(ae,null,me(r.value.learningTrack.recentActivities,(F,ee)=>(E(),A(o(Wt),{key:ee,type:ee===0?"success":"default",title:F.title,content:`得分: ${F.score}`,time:new Date(F.time).toLocaleString()},{icon:s(()=>[F.type==="vocabulary"?(E(),A(o(Ee),{key:0,size:14})):X("",!0)]),_:2},1032,["type","title","content","time"]))),128))]),_:1})):(E(),A(o(je),{key:1,description:"暂无近期学习记录"}))]}),_:1}),d(o(ne),{name:"ai-logs",tab:"AI 调用日志"},{default:s(()=>[d(o(Pe),{show:c.value},{default:s(()=>[d(o(Ae),{hoverable:"",clickable:""},{default:s(()=>[m.value.length>0?(E(!0),re(ae,{key:0},me(m.value,h=>(E(),A(o(be),{key:h.id},{default:s(()=>[d(o(Dt),{title:h.actionType,"content-style":"margin-top: 10px;"},{description:s(()=>[d(o(Ne),{size:"small",style:{"margin-top":"4px"}},{default:s(()=>[d(o(ie),{size:"tiny",bordered:!1},{default:s(()=>[P(T(h.modelName),1)]),_:2},1024),d(o(ie),{size:"tiny",type:h.status==="SUCCESS"?"success":"error",bordered:!1},{default:s(()=>[P(T(q(h.status)),1)]),_:2},1032,["type"]),u("span",fi,T(new Date(h.createTime).toLocaleString()),1),u("span",gi,"耗时: "+T(h.durationMs)+"ms",1)]),_:2},1024)]),default:s(()=>[u("div",hi," 提问摘要: "+T(h.promptPreview),1)]),_:2},1032,["title"])]),_:2},1024))),128)):(E(),A(o(je),{key:1,description:"暂无 AI 调用记录"}))]),_:1})]),_:1},8,["show"])]),_:1}),d(o(ne),{name:"value",tab:"运营关注"},{default:s(()=>{var h;return[((h=r.value.valueSegmentation)==null?void 0:h.churnRisk)>70?(E(),A(o(wt),{key:0,type:"error",title:"流失风险偏高",class:"mb-4"},{default:s(()=>[...n[13]||(n[13]=[P(" 建议优先核对最近登录、学习频次和人工跟进记录，确认是否需要触达。 ",-1)])]),_:1})):X("",!0),d(o(ve),{cols:2,"x-gap":20,"y-gap":20},{default:s(()=>[d(o(G),null,{default:s(()=>[d(o(Le),{title:"活跃度评分",size:"small",embedded:""},{default:s(()=>{var U,F;return[u("div",pi,[d(o(Ct),{type:"dashboard",percentage:((U=r.value.valueSegmentation)==null?void 0:U.engagementScore)||0,color:((F=r.value.valueSegmentation)==null?void 0:F.engagementScore)>60?"#10b981":"#f59e0b"},null,8,["percentage","color"])]),n[14]||(n[14]=u("p",{class:"text-center text-xs text-gray-500"},"基于近期学习频率、学习时长和 AI 使用情况计算",-1))]}),_:1})]),_:1}),d(o(G),null,{default:s(()=>[d(o(Le),{title:"标签说明",size:"small",embedded:""},{default:s(()=>[d(o(Ae),null,{default:s(()=>{var U,F,ee;return[(E(!0),re(ae,null,me((U=r.value.valueSegmentation)==null?void 0:U.reasons,(Ke,qe)=>(E(),A(o(be),{key:qe},{default:s(()=>[u("div",bi,[n[15]||(n[15]=u("div",{class:"w-1.5 h-1.5 rounded-full bg-blue-500"},null,-1)),P(" "+T(Ke),1)])]),_:2},1024))),128)),(ee=(F=r.value.valueSegmentation)==null?void 0:F.reasons)!=null&&ee.length?X("",!0):(E(),A(o(be),{key:0},{default:s(()=>[...n[16]||(n[16]=[P(" 暂无特别标签 ",-1)])]),_:1}))]}),_:1})]),_:1})]),_:1})]),_:1}),d(o(Ie)),d(o(Ne),{justify:"end"},{default:s(()=>[d(o(Re),{secondary:"",type:"info"},{default:s(()=>[...n[17]||(n[17]=[P("发送站内消息",-1)])]),_:1}),d(o(Re),{secondary:"",type:"warning"},{default:s(()=>[...n[18]||(n[18]=[P("发放 VIP 体验卡",-1)])]),_:1})]),_:1})]}),_:1})]),_:1},8,["value"])])]}),_:1},8,["show"])]),_:1},8,["show"]))}},Ki=ct(xi,[["__scopeId","data-v-08cd7161"]]);export{Ki as default};
