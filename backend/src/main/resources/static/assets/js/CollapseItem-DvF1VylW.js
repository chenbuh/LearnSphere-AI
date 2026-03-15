import{e as f,f as x,g as l,h as z,a3 as H,t as O,l as T,m as _,a4 as V,v as k,n as W,K,o as P,a5 as q,a6 as Z,a7 as A,a8 as G,T as J,D as Q,M as X,i as Y}from"./index-kvCe5h5c.js";import{u as ee}from"./use-merged-state-3vwOMuut.js";import{d as S,h as s,r as re,c as N,y as ae,H as te,u as F,I as oe,a as le}from"./vue-core-Qok9l9dg.js";import{h as D}from"./create-D3Vn69pI.js";import{C as se}from"./ChevronRight-DlUkawXd.js";const ne=S({name:"ChevronLeft",render(){return s("svg",{viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg"},s("path",{d:"M10.3536 3.14645C10.5488 3.34171 10.5488 3.65829 10.3536 3.85355L6.20711 8L10.3536 12.1464C10.5488 12.3417 10.5488 12.6583 10.3536 12.8536C10.1583 13.0488 9.84171 13.0488 9.64645 12.8536L5.14645 8.35355C4.95118 8.15829 4.95118 7.84171 5.14645 7.64645L9.64645 3.14645C9.84171 2.95118 10.1583 2.95118 10.3536 3.14645Z",fill:"currentColor"}))}}),ie=f("collapse","width: 100%;",[f("collapse-item",`
 font-size: var(--n-font-size);
 color: var(--n-text-color);
 transition:
 color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 margin: var(--n-item-margin);
 `,[x("disabled",[l("header","cursor: not-allowed;",[l("header-main",`
 color: var(--n-title-text-color-disabled);
 `),f("collapse-item-arrow",`
 color: var(--n-arrow-color-disabled);
 `)])]),f("collapse-item","margin-left: 32px;"),z("&:first-child","margin-top: 0;"),z("&:first-child >",[l("header","padding-top: 0;")]),x("left-arrow-placement",[l("header",[f("collapse-item-arrow","margin-right: 4px;")])]),x("right-arrow-placement",[l("header",[f("collapse-item-arrow","margin-left: 4px;")])]),l("content-wrapper",[l("content-inner","padding-top: 16px;"),H({duration:"0.15s"})]),x("active",[l("header",[x("active",[f("collapse-item-arrow","transform: rotate(90deg);")])])]),z("&:not(:first-child)","border-top: 1px solid var(--n-divider-color);"),O("disabled",[x("trigger-area-main",[l("header",[l("header-main","cursor: pointer;"),f("collapse-item-arrow","cursor: default;")])]),x("trigger-area-arrow",[l("header",[f("collapse-item-arrow","cursor: pointer;")])]),x("trigger-area-extra",[l("header",[l("header-extra","cursor: pointer;")])])]),l("header",`
 font-size: var(--n-title-font-size);
 display: flex;
 flex-wrap: nowrap;
 align-items: center;
 transition: color .3s var(--n-bezier);
 position: relative;
 padding: var(--n-title-padding);
 color: var(--n-title-text-color);
 `,[l("header-main",`
 display: flex;
 flex-wrap: nowrap;
 align-items: center;
 font-weight: var(--n-title-font-weight);
 transition: color .3s var(--n-bezier);
 flex: 1;
 color: var(--n-title-text-color);
 `),l("header-extra",`
 display: flex;
 align-items: center;
 transition: color .3s var(--n-bezier);
 color: var(--n-text-color);
 `),f("collapse-item-arrow",`
 display: flex;
 transition:
 transform .15s var(--n-bezier),
 color .3s var(--n-bezier);
 font-size: 18px;
 color: var(--n-arrow-color);
 `)])])]),de=Object.assign(Object.assign({},_.props),{defaultExpandedNames:{type:[Array,String],default:null},expandedNames:[Array,String],arrowPlacement:{type:String,default:"left"},accordion:{type:Boolean,default:!1},displayDirective:{type:String,default:"if"},triggerAreas:{type:Array,default:()=>["main","extra","arrow"]},onItemHeaderClick:[Function,Array],"onUpdate:expandedNames":[Function,Array],onUpdateExpandedNames:[Function,Array],onExpandedNamesChange:{type:[Function,Array],validator:()=>!0,default:void 0}}),B=K("n-collapse"),xe=S({name:"Collapse",props:de,slots:Object,setup(e,{slots:i}){const{mergedClsPrefixRef:n,inlineThemeDisabled:o,mergedRtlRef:d}=T(e),a=re(e.defaultExpandedNames),h=N(()=>e.expandedNames),v=ee(h,a),w=_("Collapse","-collapse",ie,V,e,n);function c(p){const{"onUpdate:expandedNames":t,onUpdateExpandedNames:m,onExpandedNamesChange:b}=e;m&&P(m,p),t&&P(t,p),b&&P(b,p),a.value=p}function g(p){const{onItemHeaderClick:t}=e;t&&P(t,p)}function r(p,t,m){const{accordion:b}=e,{value:E}=v;if(b)p?(c([t]),g({name:t,expanded:!0,event:m})):(c([]),g({name:t,expanded:!1,event:m}));else if(!Array.isArray(E))c([t]),g({name:t,expanded:!0,event:m});else{const C=E.slice(),I=C.findIndex($=>t===$);~I?(C.splice(I,1),c(C),g({name:t,expanded:!1,event:m})):(C.push(t),c(C),g({name:t,expanded:!0,event:m}))}}ae(B,{props:e,mergedClsPrefixRef:n,expandedNamesRef:v,slots:i,toggleItem:r});const u=k("Collapse",d,n),R=N(()=>{const{common:{cubicBezierEaseInOut:p},self:{titleFontWeight:t,dividerColor:m,titlePadding:b,titleTextColor:E,titleTextColorDisabled:C,textColor:I,arrowColor:$,fontSize:L,titleFontSize:M,arrowColorDisabled:U,itemMargin:j}}=w.value;return{"--n-font-size":L,"--n-bezier":p,"--n-text-color":I,"--n-divider-color":m,"--n-title-padding":b,"--n-title-font-size":M,"--n-title-text-color":E,"--n-title-text-color-disabled":C,"--n-title-font-weight":t,"--n-arrow-color":$,"--n-arrow-color-disabled":U,"--n-item-margin":j}}),y=o?W("collapse",void 0,R,e):void 0;return{rtlEnabled:u,mergedTheme:w,mergedClsPrefix:n,cssVars:o?void 0:R,themeClass:y==null?void 0:y.themeClass,onRender:y==null?void 0:y.onRender}},render(){var e;return(e=this.onRender)===null||e===void 0||e.call(this),s("div",{class:[`${this.mergedClsPrefix}-collapse`,this.rtlEnabled&&`${this.mergedClsPrefix}-collapse--rtl`,this.themeClass],style:this.cssVars},this.$slots)}}),ce=S({name:"CollapseItemContent",props:{displayDirective:{type:String,required:!0},show:Boolean,clsPrefix:{type:String,required:!0}},setup(e){return{onceTrue:Z(F(e,"show"))}},render(){return s(q,null,{default:()=>{const{show:e,displayDirective:i,onceTrue:n,clsPrefix:o}=this,d=i==="show"&&n,a=s("div",{class:`${o}-collapse-item__content-wrapper`},s("div",{class:`${o}-collapse-item__content-inner`},this.$slots));return d?te(a,[[oe,e]]):e?a:null}})}}),pe={title:String,name:[String,Number],disabled:Boolean,displayDirective:String},ve=S({name:"CollapseItem",props:pe,setup(e){const{mergedRtlRef:i}=T(e),n=J(),o=Q(()=>{var r;return(r=e.name)!==null&&r!==void 0?r:n}),d=le(B);d||X("collapse-item","`n-collapse-item` must be placed inside `n-collapse`.");const{expandedNamesRef:a,props:h,mergedClsPrefixRef:v,slots:w}=d,c=N(()=>{const{value:r}=a;if(Array.isArray(r)){const{value:u}=o;return!~r.findIndex(R=>R===u)}else if(r){const{value:u}=o;return u!==r}return!0});return{rtlEnabled:k("Collapse",i,v),collapseSlots:w,randomName:n,mergedClsPrefix:v,collapsed:c,triggerAreas:F(h,"triggerAreas"),mergedDisplayDirective:N(()=>{const{displayDirective:r}=e;return r||h.displayDirective}),arrowPlacement:N(()=>h.arrowPlacement),handleClick(r){let u="main";D(r,"arrow")&&(u="arrow"),D(r,"extra")&&(u="extra"),h.triggerAreas.includes(u)&&d&&!e.disabled&&d.toggleItem(c.value,o.value,r)}}},render(){const{collapseSlots:e,$slots:i,arrowPlacement:n,collapsed:o,mergedDisplayDirective:d,mergedClsPrefix:a,disabled:h,triggerAreas:v}=this,w=A(i.header,{collapsed:o},()=>[this.title]),c=i["header-extra"]||e["header-extra"],g=i.arrow||e.arrow;return s("div",{class:[`${a}-collapse-item`,`${a}-collapse-item--${n}-arrow-placement`,h&&`${a}-collapse-item--disabled`,!o&&`${a}-collapse-item--active`,v.map(r=>`${a}-collapse-item--trigger-area-${r}`)]},s("div",{class:[`${a}-collapse-item__header`,!o&&`${a}-collapse-item__header--active`]},s("div",{class:`${a}-collapse-item__header-main`,onClick:this.handleClick},n==="right"&&w,s("div",{class:`${a}-collapse-item-arrow`,key:this.rtlEnabled?0:1,"data-arrow":!0},A(g,{collapsed:o},()=>[s(Y,{clsPrefix:a},{default:()=>this.rtlEnabled?s(ne,null):s(se,null)})])),n==="left"&&w),G(c,{collapsed:o},r=>s("div",{class:`${a}-collapse-item__header-extra`,onClick:this.handleClick,"data-extra":!0},r))),s(ce,{clsPrefix:a,displayDirective:d,show:!o},i))}});export{xe as N,ve as a};
