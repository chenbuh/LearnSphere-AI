import{a as R,p as z}from"./logo-Czb2-FDD.js";import{e as m,f as L,I as O,S as j,l as P,m as v,k as E,n as I}from"./index-DahIAh76.js";import{d as $,h as c,r as y,c as S,z as w}from"./vue-core-k66yWm0l.js";const B=m("layout",`
 color: var(--n-text-color);
 background-color: var(--n-color);
 box-sizing: border-box;
 position: relative;
 z-index: auto;
 flex: auto;
 overflow: hidden;
 transition:
 box-shadow .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
`,[m("layout-scroll-container",`
 overflow-x: hidden;
 box-sizing: border-box;
 height: 100%;
 `),L("absolute-positioned",`
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 `)]),N={embedded:Boolean,position:z,nativeScrollbar:{type:Boolean,default:!0},scrollbarProps:Object,onScroll:Function,contentClass:String,contentStyle:{type:[String,Object],default:""},hasSider:Boolean,siderPlacement:{type:String,default:"left"}},k=O("n-layout");function g(d){return $({name:d?"LayoutContent":"Layout",props:Object.assign(Object.assign({},v.props),N),setup(e){const s=y(null),a=y(null),{mergedClsPrefixRef:r,inlineThemeDisabled:i}=P(e),u=v("Layout","-layout",B,R,e,r);function x(o,t){if(e.nativeScrollbar){const{value:l}=s;l&&(t===void 0?l.scrollTo(o):l.scrollTo(o,t))}else{const{value:l}=a;l&&l.scrollTo(o,t)}}w(k,e);let h=0,f=0;const C=o=>{var t;const l=o.target;h=l.scrollLeft,f=l.scrollTop,(t=e.onScroll)===null||t===void 0||t.call(e,o)};E(()=>{if(e.nativeScrollbar){const o=s.value;o&&(o.scrollTop=f,o.scrollLeft=h)}});const p={display:"flex",flexWrap:"nowrap",width:"100%",flexDirection:"row"},T={scrollTo:x},b=S(()=>{const{common:{cubicBezierEaseInOut:o},self:t}=u.value;return{"--n-bezier":o,"--n-color":e.embedded?t.colorEmbedded:t.color,"--n-text-color":t.textColor}}),n=i?I("layout",S(()=>e.embedded?"e":""),b,e):void 0;return Object.assign({mergedClsPrefix:r,scrollableElRef:s,scrollbarInstRef:a,hasSiderStyle:p,mergedTheme:u,handleNativeElScroll:C,cssVars:i?void 0:b,themeClass:n==null?void 0:n.themeClass,onRender:n==null?void 0:n.onRender},T)},render(){var e;const{mergedClsPrefix:s,hasSider:a}=this;(e=this.onRender)===null||e===void 0||e.call(this);const r=a?this.hasSiderStyle:void 0,i=[this.themeClass,d&&`${s}-layout-content`,`${s}-layout`,`${s}-layout--${this.position}-positioned`];return c("div",{class:i,style:this.cssVars},this.nativeScrollbar?c("div",{ref:"scrollableElRef",class:[`${s}-layout-scroll-container`,this.contentClass],style:[this.contentStyle,r],onScroll:this.handleNativeElScroll},this.$slots):c(j,Object.assign({},this.scrollbarProps,{onScroll:this.onScroll,ref:"scrollbarInstRef",theme:this.mergedTheme.peers.Scrollbar,themeOverrides:this.mergedTheme.peerOverrides.Scrollbar,contentClass:this.contentClass,contentStyle:[this.contentStyle,r]}),this.$slots))}})}const M=g(!1),_=g(!0);export{M as N,_ as a,k as l};
