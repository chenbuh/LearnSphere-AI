import{d as S,h as o,A as C,c as u,r as x,y as k}from"./vue-core-k66yWm0l.js";import{h as f,e as c,aq as $,f as v,aF as w,l as T,m as h,b2 as R,$ as N,v as B,n as O}from"./index-DahIAh76.js";import{u as j}from"./use-compitable-C8LpTH9g.js";const P=f([f("@keyframes spin-rotate",`
 from {
 transform: rotate(0);
 }
 to {
 transform: rotate(360deg);
 }
 `),c("spin-container",`
 position: relative;
 `,[c("spin-body",`
 position: absolute;
 top: 50%;
 left: 50%;
 transform: translateX(-50%) translateY(-50%);
 `,[$()])]),c("spin-body",`
 display: inline-flex;
 align-items: center;
 justify-content: center;
 flex-direction: column;
 `),c("spin",`
 display: inline-flex;
 height: var(--n-size);
 width: var(--n-size);
 font-size: var(--n-size);
 color: var(--n-color);
 `,[v("rotate",`
 animation: spin-rotate 2s linear infinite;
 `)]),c("spin-description",`
 display: inline-block;
 font-size: var(--n-font-size);
 color: var(--n-text-color);
 transition: color .3s var(--n-bezier);
 margin-top: 8px;
 `),c("spin-content",`
 opacity: 1;
 transition: opacity .3s var(--n-bezier);
 pointer-events: all;
 `,[v("spinning",`
 user-select: none;
 -webkit-user-select: none;
 pointer-events: none;
 opacity: var(--n-opacity-spinning);
 `)])]),V={small:20,medium:18,large:16},W=Object.assign(Object.assign({},h.props),{contentClass:String,contentStyle:[Object,String],description:String,stroke:String,size:{type:[String,Number],default:"medium"},show:{type:Boolean,default:!0},strokeWidth:Number,rotate:{type:Boolean,default:!0},spinning:{type:Boolean,validator:()=>!0,default:void 0},delay:Number}),D=S({name:"Spin",props:W,slots:Object,setup(e){const{mergedClsPrefixRef:r,inlineThemeDisabled:t}=T(e),s=h("Spin","-spin",P,R,e,r),d=u(()=>{const{size:n}=e,{common:{cubicBezierEaseInOut:a},self:m}=s.value,{opacitySpinning:y,color:g,textColor:b}=m,z=typeof n=="number"?N(n):m[B("size",n)];return{"--n-bezier":a,"--n-opacity-spinning":y,"--n-size":z,"--n-color":g,"--n-text-color":b}}),i=t?O("spin",u(()=>{const{size:n}=e;return typeof n=="number"?String(n):n[0]}),d,e):void 0,p=j(e,["spinning","show"]),l=x(!1);return k(n=>{let a;if(p.value){const{delay:m}=e;if(m){a=window.setTimeout(()=>{l.value=!0},m),n(()=>{clearTimeout(a)});return}}l.value=p.value}),{mergedClsPrefix:r,active:l,mergedStrokeWidth:u(()=>{const{strokeWidth:n}=e;if(n!==void 0)return n;const{size:a}=e;return V[typeof a=="number"?"medium":a]}),cssVars:t?void 0:d,themeClass:i==null?void 0:i.themeClass,onRender:i==null?void 0:i.onRender}},render(){var e,r;const{$slots:t,mergedClsPrefix:s,description:d}=this,i=t.icon&&this.rotate,p=(d||t.description)&&o("div",{class:`${s}-spin-description`},d||((e=t.description)===null||e===void 0?void 0:e.call(t))),l=t.icon?o("div",{class:[`${s}-spin-body`,this.themeClass]},o("div",{class:[`${s}-spin`,i&&`${s}-spin--rotate`],style:t.default?"":this.cssVars},t.icon()),p):o("div",{class:[`${s}-spin-body`,this.themeClass]},o(w,{clsPrefix:s,style:t.default?"":this.cssVars,stroke:this.stroke,"stroke-width":this.mergedStrokeWidth,class:`${s}-spin`}),p);return(r=this.onRender)===null||r===void 0||r.call(this),t.default?o("div",{class:[`${s}-spin-container`,this.themeClass],style:this.cssVars},o("div",{class:[`${s}-spin-content`,this.active&&`${s}-spin-content--spinning`,this.contentClass],style:this.contentStyle},t),o(C,{name:"fade-in-transition"},{default:()=>this.active?l:null})):l}});export{D as N};
