import{ak as _,K as N,e as H,ab as K,h as P,ac as G,g as T,E as V,r as q,l as D,m as $,aJ as J,n as U,aG as X,w as Y,aB as Q}from"./index-kvCe5h5c.js";import{t as Z}from"./Tag-CHjg5cnQ.js";import{d as ee,h as y,a as B,c as x,r as R,o as re,j as te,m as oe,w as ne}from"./vue-core-Qok9l9dg.js";const se=_&&"loading"in document.createElement("img");function ae(e={}){var a;const{root:l=null}=e;return{hash:`${e.rootMargin||"0px 0px 0px 0px"}-${Array.isArray(e.threshold)?e.threshold.join(","):(a=e.threshold)!==null&&a!==void 0?a:"0"}`,options:Object.assign(Object.assign({},e),{root:(typeof l=="string"?document.querySelector(l):l)||document.documentElement})}}const F=new WeakMap,k=new WeakMap,M=new WeakMap,ie=(e,a,l)=>{if(!e)return()=>{};const i=ae(a),{root:d}=i.options;let n;const c=F.get(d);c?n=c:(n=new Map,F.set(d,n));let h,o;n.has(i.hash)?(o=n.get(i.hash),o[1].has(e)||(h=o[0],o[1].add(e),h.observe(e))):(h=new IntersectionObserver(p=>{p.forEach(f=>{if(f.isIntersecting){const m=k.get(f.target),O=M.get(f.target);m&&m(),O&&(O.value=!0)}})},i.options),h.observe(e),o=[h,new Set([e])],n.set(i.hash,o));let u=!1;const g=()=>{u||(k.delete(e),M.delete(e),u=!0,o[1].has(e)&&(o[0].unobserve(e),o[1].delete(e)),o[1].size<=0&&n.delete(i.hash),n.size||F.delete(d))};return k.set(e,g),M.set(e,l),g},le=N("n-avatar-group"),de=H("avatar",`
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
`,[K(P("&","--n-merged-color: var(--n-color-modal);")),G(P("&","--n-merged-color: var(--n-color-popover);")),P("img",`
 width: 100%;
 height: 100%;
 `),T("text",`
 white-space: nowrap;
 display: inline-block;
 position: absolute;
 left: 50%;
 top: 50%;
 `),H("icon",`
 vertical-align: bottom;
 font-size: calc(var(--n-merged-size) - 6px);
 `),T("text","line-height: 1.25")]),ce=Object.assign(Object.assign({},$.props),{size:[String,Number],src:String,circle:{type:Boolean,default:void 0},objectFit:String,round:{type:Boolean,default:void 0},bordered:{type:Boolean,default:void 0},onError:Function,fallbackSrc:String,intersectionObserverOptions:Object,lazy:Boolean,onLoad:Function,renderPlaceholder:Function,renderFallback:Function,imgProps:Object,color:String}),he=ee({name:"Avatar",props:ce,slots:Object,setup(e){const{mergedClsPrefixRef:a,inlineThemeDisabled:l}=D(e),i=R(!1);let d=null;const n=R(null),c=R(null),h=()=>{const{value:r}=n;if(r&&(d===null||d!==r.innerHTML)){d=r.innerHTML;const{value:t}=c;if(t){const{offsetWidth:s,offsetHeight:b}=t,{offsetWidth:v,offsetHeight:S}=r,j=.9,L=Math.min(s/v*j,b/S*j,1);r.style.transform=`translateX(-50%) translateY(-50%) scale(${L})`}}},o=B(le,null),u=x(()=>{const{size:r}=e;if(r)return r;const{size:t}=o||{};return t||"medium"}),g=$("Avatar","-avatar",de,J,e,a),p=B(Z,null),f=x(()=>{if(o)return!0;const{round:r,circle:t}=e;return r!==void 0||t!==void 0?r||t:p?p.roundRef.value:!1}),m=x(()=>o?!0:e.bordered||!1),O=x(()=>{const r=u.value,t=f.value,s=m.value,{color:b}=e,{self:{borderRadius:v,fontSize:S,color:j,border:L,colorModal:A,colorPopover:I},common:{cubicBezierEaseInOut:W}}=g.value;let w;return typeof r=="number"?w=`${r}px`:w=g.value.self[Y("height",r)],{"--n-font-size":S,"--n-border":s?L:"none","--n-border-radius":t?"50%":v,"--n-color":b||j,"--n-color-modal":b||A,"--n-color-popover":b||I,"--n-bezier":W,"--n-merged-size":`var(--n-avatar-size-override, ${w})`}}),z=l?U("avatar",x(()=>{const r=u.value,t=f.value,s=m.value,{color:b}=e;let v="";return r&&(typeof r=="number"?v+=`a${r}`:v+=r[0]),t&&(v+="b"),s&&(v+="c"),b&&(v+=Q(b)),v}),O,e):void 0,E=R(!e.lazy);re(()=>{if(e.lazy&&e.intersectionObserverOptions){let r;const t=te(()=>{r==null||r(),r=void 0,e.lazy&&(r=ie(c.value,e.intersectionObserverOptions,E))});oe(()=>{t(),r==null||r()})}}),ne(()=>{var r;return e.src||((r=e.imgProps)===null||r===void 0?void 0:r.src)},()=>{i.value=!1});const C=R(!e.lazy);return{textRef:n,selfRef:c,mergedRoundRef:f,mergedClsPrefix:a,fitTextTransform:h,cssVars:l?void 0:O,themeClass:z==null?void 0:z.themeClass,onRender:z==null?void 0:z.onRender,hasLoadError:i,shouldStartLoading:E,loaded:C,mergedOnError:r=>{if(!E.value)return;i.value=!0;const{onError:t,imgProps:{onError:s}={}}=e;t==null||t(r),s==null||s(r)},mergedOnLoad:r=>{const{onLoad:t,imgProps:{onLoad:s}={}}=e;t==null||t(r),s==null||s(r),C.value=!0}}},render(){var e,a;const{$slots:l,src:i,mergedClsPrefix:d,lazy:n,onRender:c,loaded:h,hasLoadError:o,imgProps:u={}}=this;c==null||c();let g;const p=!h&&!o&&(this.renderPlaceholder?this.renderPlaceholder():(a=(e=this.$slots).placeholder)===null||a===void 0?void 0:a.call(e));return this.hasLoadError?g=this.renderFallback?this.renderFallback():V(l.fallback,()=>[y("img",{src:this.fallbackSrc,style:{objectFit:this.objectFit}})]):g=q(l.default,f=>{if(f)return y(X,{onResize:this.fitTextTransform},{default:()=>y("span",{ref:"textRef",class:`${d}-avatar__text`},f)});if(i||u.src){const m=this.src||u.src;return y("img",Object.assign(Object.assign({},u),{loading:se&&!this.intersectionObserverOptions&&n?"lazy":"eager",src:n&&this.intersectionObserverOptions?this.shouldStartLoading?m:void 0:m,"data-image-src":m,onLoad:this.mergedOnLoad,onError:this.mergedOnError,style:[u.style||"",{objectFit:this.objectFit},p?{height:"0",width:"0",visibility:"hidden",position:"absolute"}:""]}))}}),y("span",{ref:"selfRef",class:[`${d}-avatar`,this.themeClass],style:this.cssVars},g,n&&p)}});export{he as N,se as i,ie as o};
