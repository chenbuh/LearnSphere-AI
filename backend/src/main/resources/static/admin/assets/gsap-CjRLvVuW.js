var k=(e,s,o)=>new Promise((i,n)=>{var t=a=>{try{d(o.next(a))}catch(c){n(c)}},r=a=>{try{d(o.throw(a))}catch(c){n(c)}},d=a=>a.done?i(a.value):Promise.resolve(a.value).then(t,r);d((o=o.apply(e,s)).next())});import{m as N,e as y,g as O,a2 as L,p as A,q as P,w as H,O as z,b as T}from"./index-524yyVVb.js";import{m as j,h as _,y as F,F as I,d as S}from"./vue-core-ry9EWEYQ.js";import{u as V}from"./use-houdini-KfXiS9uN.js";function $(e){const{heightSmall:s,heightMedium:o,heightLarge:i,borderRadius:n}=e;return{color:"#eee",colorEnd:"#ddd",borderRadius:n,heightSmall:s,heightMedium:o,heightLarge:i}}const q={common:N,self:$},D=y([O("skeleton",`
 height: 1em;
 width: 100%;
 transition:
 --n-color-start .3s var(--n-bezier),
 --n-color-end .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 animation: 2s skeleton-loading infinite cubic-bezier(0.36, 0, 0.64, 1);
 background-color: var(--n-color-start);
 `),y("@keyframes skeleton-loading",`
 0% {
 background: var(--n-color-start);
 }
 40% {
 background: var(--n-color-end);
 }
 80% {
 background: var(--n-color-start);
 }
 100% {
 background: var(--n-color-start);
 }
 `)]),G=Object.assign(Object.assign({},P.props),{text:Boolean,round:Boolean,circle:Boolean,height:[String,Number],width:[String,Number],size:String,repeat:{type:Number,default:1},animated:{type:Boolean,default:!0},sharp:{type:Boolean,default:!0}}),Q=j({name:"Skeleton",inheritAttrs:!1,props:G,setup(e){V();const{mergedClsPrefixRef:s,mergedComponentPropsRef:o}=A(e),i=S(()=>{var t,r;return e.size||((r=(t=o==null?void 0:o.value)===null||t===void 0?void 0:t.Skeleton)===null||r===void 0?void 0:r.size)}),n=P("Skeleton","-skeleton",D,q,e,s);return{mergedClsPrefix:s,style:S(()=>{var t,r;const d=n.value,{common:{cubicBezierEaseInOut:a}}=d,c=d.self,{color:x,colorEnd:R,borderRadius:B}=c;let u;const{circle:m,sharp:C,round:w,width:l,height:g,text:v,animated:E}=e,b=i.value;b!==void 0&&(u=c[H("height",b)]);const h=m?(t=l!=null?l:g)!==null&&t!==void 0?t:u:l,f=(r=m&&l!=null?l:g)!==null&&r!==void 0?r:u;return{display:v?"inline-block":"",verticalAlign:v?"-0.125em":"",borderRadius:m?"50%":w?"4096px":C?"":B,width:typeof h=="number"?z(h):h,height:typeof f=="number"?z(f):f,animation:E?"":"none","--n-bezier":a,"--n-color-start":x,"--n-color-end":R}})}},render(){const{repeat:e,style:s,mergedClsPrefix:o,$attrs:i}=this,n=_("div",F({class:`${o}-skeleton`,style:s},i));return e>1?_(I,null,L(e,null).map(t=>[n,`
`])):n}});let p=null;const U=()=>k(null,null,function*(){return p||(p=T(()=>import("./gsap-vendor-Blvgmn9I.js"),[]).then(e=>e.default)),p});export{Q as N,U as l};
