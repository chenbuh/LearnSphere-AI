var G=(n,c,I)=>new Promise((y,h)=>{var m=C=>{try{R(I.next(C))}catch(B){h(B)}},E=C=>{try{R(I.throw(C))}catch(B){h(B)}},R=C=>C.done?y(C.value):Promise.resolve(C.value).then(m,E);R((I=I.apply(n,c)).next())});import{a9 as yt,d as kt,h as N,A as _t,r as b,c as X,u as St,w as je,E as Se,m as Ct,o as zt,b as Rt,O as Tt,Y as w,R as g,Z as o,f as i,a0 as Ne,Q as f,N as r,q as D,$ as A,P as De,F as Z,a1 as J,K as Ie,a2 as Pe,aa as Mt,a3 as Vt}from"./vue-core-k66yWm0l.js";import{b as Be}from"./utils-D4YdDhUH.js";import{aiApi as de}from"./ai-CWs6cvWR.js";import{A as Nt,ai as Dt,h as ce,e as d,aj as It,ak as Bt,f as H,g as xe,al as Le,F as At,l as $t,m as et,C as Ft,n as Oe,am as Ut,o as ye,G as ke,an as _e,d as Ht,a9 as Et,u as jt,B as K,N as Pt,a as Ae,b as Lt}from"./index-DahIAh76.js";import{_ as Ot}from"./_plugin-vue_export-helper-DlAUqK2U.js";import{v as We,F as Wt,V as Kt,av as qt,a3 as Ke,aw as Xt,U as Yt,h as qe,ak as Qt,o as Xe,$ as Gt,C as Zt,a6 as Jt}from"./icons-C9GocgtY.js";import{B as ea,V as ta,a as aa,u as Fe}from"./Popover-DLi66xIH.js";import{u as oa}from"./use-merged-state-DCOVafah.js";import{S as sa}from"./Scrollbar-DNqeEPg9.js";import{N as na}from"./Tooltip-Dq7o15sY.js";import{N as $e}from"./Space-BGNXJLHt.js";import{N as la}from"./Tag-BCMARYeD.js";import{N as Ye}from"./Avatar-B3oJtXtE.js";import{N as ra}from"./Input-DnsJRt06.js";import{N as ia}from"./Empty-B86ET1iS.js";import{N as Qe}from"./Spin-DFOgoplj.js";import{N as Ge}from"./Progress-RG6LBX1F.js";import{N as da}from"./NumberAnimation-Cjh_c9rH.js";import{N as ca}from"./Divider-n8Xp3EPu.js";import"./vendor-Ctmwp_ns.js";import"./cssr-D4Wn-_UV.js";import"./next-frame-once-C5Ksf8W7.js";import"./use-compitable-C8LpTH9g.js";import"./get-slot-Bk_rJcZu.js";import"./use-locale-B2J8zvEP.js";function ua(n){const c="rgba(0, 0, 0, .85)",I="0 2px 8px 0 rgba(0, 0, 0, 0.12)",{railColor:y,primaryColor:h,baseColor:m,cardColor:E,modalColor:R,popoverColor:C,borderRadius:B,fontSize:Y,opacityDisabled:j}=n;return Object.assign(Object.assign({},Dt),{fontSize:Y,markFontSize:Y,railColor:y,railColorHover:y,fillColor:h,fillColorHover:h,opacityDisabled:j,handleColor:"#FFF",dotColor:E,dotColorModal:R,dotColorPopover:C,handleBoxShadow:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",handleBoxShadowHover:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",handleBoxShadowActive:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",handleBoxShadowFocus:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",indicatorColor:c,indicatorBoxShadow:I,indicatorTextColor:m,indicatorBorderRadius:B,dotBorder:`2px solid ${y}`,dotBorderActive:`2px solid ${h}`,dotBoxShadow:""})}const va={common:Nt,self:ua},fa=ce([d("slider",`
 display: block;
 padding: calc((var(--n-handle-size) - var(--n-rail-height)) / 2) 0;
 position: relative;
 z-index: 0;
 width: 100%;
 cursor: pointer;
 user-select: none;
 -webkit-user-select: none;
 `,[H("reverse",[d("slider-handles",[d("slider-handle-wrapper",`
 transform: translate(50%, -50%);
 `)]),d("slider-dots",[d("slider-dot",`
 transform: translateX(50%, -50%);
 `)]),H("vertical",[d("slider-handles",[d("slider-handle-wrapper",`
 transform: translate(-50%, -50%);
 `)]),d("slider-marks",[d("slider-mark",`
 transform: translateY(calc(-50% + var(--n-dot-height) / 2));
 `)]),d("slider-dots",[d("slider-dot",`
 transform: translateX(-50%) translateY(0);
 `)])])]),H("vertical",`
 box-sizing: content-box;
 padding: 0 calc((var(--n-handle-size) - var(--n-rail-height)) / 2);
 width: var(--n-rail-width-vertical);
 height: 100%;
 `,[d("slider-handles",`
 top: calc(var(--n-handle-size) / 2);
 right: 0;
 bottom: calc(var(--n-handle-size) / 2);
 left: 0;
 `,[d("slider-handle-wrapper",`
 top: unset;
 left: 50%;
 transform: translate(-50%, 50%);
 `)]),d("slider-rail",`
 height: 100%;
 `,[xe("fill",`
 top: unset;
 right: 0;
 bottom: unset;
 left: 0;
 `)]),H("with-mark",`
 width: var(--n-rail-width-vertical);
 margin: 0 32px 0 8px;
 `),d("slider-marks",`
 top: calc(var(--n-handle-size) / 2);
 right: unset;
 bottom: calc(var(--n-handle-size) / 2);
 left: 22px;
 font-size: var(--n-mark-font-size);
 `,[d("slider-mark",`
 transform: translateY(50%);
 white-space: nowrap;
 `)]),d("slider-dots",`
 top: calc(var(--n-handle-size) / 2);
 right: unset;
 bottom: calc(var(--n-handle-size) / 2);
 left: 50%;
 `,[d("slider-dot",`
 transform: translateX(-50%) translateY(50%);
 `)])]),H("disabled",`
 cursor: not-allowed;
 opacity: var(--n-opacity-disabled);
 `,[d("slider-handle",`
 cursor: not-allowed;
 `)]),H("with-mark",`
 width: 100%;
 margin: 8px 0 32px 0;
 `),ce("&:hover",[d("slider-rail",{backgroundColor:"var(--n-rail-color-hover)"},[xe("fill",{backgroundColor:"var(--n-fill-color-hover)"})]),d("slider-handle",{boxShadow:"var(--n-handle-box-shadow-hover)"})]),H("active",[d("slider-rail",{backgroundColor:"var(--n-rail-color-hover)"},[xe("fill",{backgroundColor:"var(--n-fill-color-hover)"})]),d("slider-handle",{boxShadow:"var(--n-handle-box-shadow-hover)"})]),d("slider-marks",`
 position: absolute;
 top: 18px;
 left: calc(var(--n-handle-size) / 2);
 right: calc(var(--n-handle-size) / 2);
 `,[d("slider-mark",`
 position: absolute;
 transform: translateX(-50%);
 white-space: nowrap;
 `)]),d("slider-rail",`
 width: 100%;
 position: relative;
 height: var(--n-rail-height);
 background-color: var(--n-rail-color);
 transition: background-color .3s var(--n-bezier);
 border-radius: calc(var(--n-rail-height) / 2);
 `,[xe("fill",`
 position: absolute;
 top: 0;
 bottom: 0;
 border-radius: calc(var(--n-rail-height) / 2);
 transition: background-color .3s var(--n-bezier);
 background-color: var(--n-fill-color);
 `)]),d("slider-handles",`
 position: absolute;
 top: 0;
 right: calc(var(--n-handle-size) / 2);
 bottom: 0;
 left: calc(var(--n-handle-size) / 2);
 `,[d("slider-handle-wrapper",`
 outline: none;
 position: absolute;
 top: 50%;
 transform: translate(-50%, -50%);
 cursor: pointer;
 display: flex;
 `,[d("slider-handle",`
 height: var(--n-handle-size);
 width: var(--n-handle-size);
 border-radius: 50%;
 overflow: hidden;
 transition: box-shadow .2s var(--n-bezier), background-color .3s var(--n-bezier);
 background-color: var(--n-handle-color);
 box-shadow: var(--n-handle-box-shadow);
 `,[ce("&:hover",`
 box-shadow: var(--n-handle-box-shadow-hover);
 `)]),ce("&:focus",[d("slider-handle",`
 box-shadow: var(--n-handle-box-shadow-focus);
 `,[ce("&:hover",`
 box-shadow: var(--n-handle-box-shadow-active);
 `)])])])]),d("slider-dots",`
 position: absolute;
 top: 50%;
 left: calc(var(--n-handle-size) / 2);
 right: calc(var(--n-handle-size) / 2);
 `,[H("transition-disabled",[d("slider-dot","transition: none;")]),d("slider-dot",`
 transition:
 border-color .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 position: absolute;
 transform: translate(-50%, -50%);
 height: var(--n-dot-height);
 width: var(--n-dot-width);
 border-radius: var(--n-dot-border-radius);
 overflow: hidden;
 box-sizing: border-box;
 border: var(--n-dot-border);
 background-color: var(--n-dot-color);
 `,[H("active","border: var(--n-dot-border-active);")])])]),d("slider-handle-indicator",`
 font-size: var(--n-font-size);
 padding: 6px 10px;
 border-radius: var(--n-indicator-border-radius);
 color: var(--n-indicator-text-color);
 background-color: var(--n-indicator-color);
 box-shadow: var(--n-indicator-box-shadow);
 `,[Le()]),d("slider-handle-indicator",`
 font-size: var(--n-font-size);
 padding: 6px 10px;
 border-radius: var(--n-indicator-border-radius);
 color: var(--n-indicator-text-color);
 background-color: var(--n-indicator-color);
 box-shadow: var(--n-indicator-box-shadow);
 `,[H("top",`
 margin-bottom: 12px;
 `),H("right",`
 margin-left: 12px;
 `),H("bottom",`
 margin-top: 12px;
 `),H("left",`
 margin-right: 12px;
 `),Le()]),It(d("slider",[d("slider-dot","background-color: var(--n-dot-color-modal);")])),Bt(d("slider",[d("slider-dot","background-color: var(--n-dot-color-popover);")]))]);function Ze(n){return window.TouchEvent&&n instanceof window.TouchEvent}function Je(){const n=new Map,c=I=>y=>{n.set(I,y)};return yt(()=>{n.clear()}),[n,c]}const ha=0,ma=Object.assign(Object.assign({},et.props),{to:Fe.propTo,defaultValue:{type:[Number,Array],default:0},marks:Object,disabled:{type:Boolean,default:void 0},formatTooltip:Function,keyboard:{type:Boolean,default:!0},min:{type:Number,default:0},max:{type:Number,default:100},step:{type:[Number,String],default:1},range:Boolean,value:[Number,Array],placement:String,showTooltip:{type:Boolean,default:void 0},tooltip:{type:Boolean,default:!0},vertical:Boolean,reverse:Boolean,"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array],onDragstart:[Function],onDragend:[Function]}),pa=kt({name:"Slider",props:ma,slots:Object,setup(n){const{mergedClsPrefixRef:c,namespaceRef:I,inlineThemeDisabled:y}=$t(n),h=et("Slider","-slider",fa,va,n,c),m=b(null),[E,R]=Je(),[C,B]=Je(),Y=b(new Set),j=Ft(n),{mergedDisabledRef:$}=j,ee=X(()=>{const{step:t}=n;if(Number(t)<=0||t==="mark")return 0;const a=t.toString();let s=0;return a.includes(".")&&(s=a.length-a.indexOf(".")-1),s}),L=b(n.defaultValue),ne=St(n,"value"),F=oa(ne,L),T=X(()=>{const{value:t}=F;return(n.range?t:[t]).map(U)}),ue=X(()=>T.value.length>2),x=X(()=>n.placement===void 0?n.vertical?"right":"top":n.placement),P=X(()=>{const{marks:t}=n;return t?Object.keys(t).map(Number.parseFloat):null}),k=b(-1),O=b(-1),M=b(-1),W=b(!1),te=b(!1),le=X(()=>{const{vertical:t,reverse:a}=n;return t?a?"top":"bottom":a?"right":"left"}),ve=X(()=>{if(ue.value)return;const t=T.value,a=l(n.range?Math.min(...t):n.min),s=l(n.range?Math.max(...t):t[0]),{value:u}=le;return n.vertical?{[u]:`${a}%`,height:`${s-a}%`}:{[u]:`${a}%`,width:`${s-a}%`}}),Ce=X(()=>{const t=[],{marks:a}=n;if(a){const s=T.value.slice();s.sort((V,z)=>V-z);const{value:u}=le,{value:p}=ue,{range:S}=n,q=p?()=>!1:V=>S?V>=s[0]&&V<=s[s.length-1]:V<=s[0];for(const V of Object.keys(a)){const z=Number(V);t.push({active:q(z),key:z,label:a[V],style:{[u]:`${l(z)}%`}})}}return t});function ze(t,a){const s=l(t),{value:u}=le;return{[u]:`${s}%`,zIndex:a===k.value?1:0}}function re(t){return n.showTooltip||M.value===t||k.value===t&&W.value}function Re(t){return W.value?!(k.value===t&&O.value===t):!0}function fe(t){var a;~t&&(k.value=t,(a=E.get(t))===null||a===void 0||a.focus())}function Te(){C.forEach((t,a)=>{re(a)&&t.syncPosition()})}function ae(t){const{"onUpdate:value":a,onUpdateValue:s}=n,{nTriggerFormInput:u,nTriggerFormChange:p}=j;s&&ye(s,t),a&&ye(a,t),L.value=t,u(),p()}function ie(t){const{range:a}=n;if(a){if(Array.isArray(t)){const{value:s}=T;t.join()!==s.join()&&ae(t)}}else Array.isArray(t)||T.value[0]!==t&&ae(t)}function v(t,a){if(n.range){const s=T.value.slice();s.splice(a,1,t),ie(s)}else ie(t)}function e(t,a,s){const u=s!==void 0;s||(s=t-a>0?1:-1);const p=P.value||[],{step:S}=n;if(S==="mark"){const z=me(t,p.concat(a),u?s:void 0);return z?z.value:a}if(S<=0)return a;const{value:q}=ee;let V;if(u){const z=Number((a/S).toFixed(q)),Q=Math.floor(z),Me=z>Q?Q:Q-1,Ve=z<Q?Q:Q+1;V=me(a,[Number((Me*S).toFixed(q)),Number((Ve*S).toFixed(q)),...p],s)}else{const z=he(t);V=me(t,[...p,z])}return V?U(V.value):a}function U(t){return Math.min(n.max,Math.max(n.min,t))}function l(t){const{max:a,min:s}=n;return(t-s)/(a-s)*100}function _(t){const{max:a,min:s}=n;return s+(a-s)*t}function he(t){const{step:a,min:s}=n;if(Number(a)<=0||a==="mark")return t;const u=Math.round((t-s)/a)*a+s;return Number(u.toFixed(ee.value))}function me(t,a=P.value,s){if(!(a!=null&&a.length))return null;let u=null,p=-1;for(;++p<a.length;){const S=a[p]-t,q=Math.abs(S);(s===void 0||S*s>0)&&(u===null||q<u.distance)&&(u={index:p,distance:q,value:a[p]})}return u}function Ue(t){const a=m.value;if(!a)return;const s=Ze(t)?t.touches[0]:t,u=a.getBoundingClientRect();let p;return n.vertical?p=(u.bottom-s.clientY)/u.height:p=(s.clientX-u.left)/u.width,n.reverse&&(p=1-p),_(p)}function tt(t){if($.value||!n.keyboard)return;const{vertical:a,reverse:s}=n;switch(t.key){case"ArrowUp":t.preventDefault(),pe(a&&s?-1:1);break;case"ArrowRight":t.preventDefault(),pe(!a&&s?-1:1);break;case"ArrowDown":t.preventDefault(),pe(a&&s?1:-1);break;case"ArrowLeft":t.preventDefault(),pe(!a&&s?1:-1);break}}function pe(t){const a=k.value;if(a===-1)return;const{step:s}=n,u=T.value[a],p=Number(s)<=0||s==="mark"?u:u+s*t;v(e(p,u,t>0?1:-1),a)}function at(t){var a,s;if($.value||!Ze(t)&&t.button!==ha)return;const u=Ue(t);if(u===void 0)return;const p=T.value.slice(),S=n.range?(s=(a=me(u,p))===null||a===void 0?void 0:a.index)!==null&&s!==void 0?s:-1:0;S!==-1&&(t.preventDefault(),fe(S),ot(),v(e(u,T.value[S]),S))}function ot(){W.value||(W.value=!0,n.onDragstart&&ye(n.onDragstart),ke("touchend",document,we),ke("mouseup",document,we),ke("touchmove",document,ge),ke("mousemove",document,ge))}function be(){W.value&&(W.value=!1,n.onDragend&&ye(n.onDragend),_e("touchend",document,we),_e("mouseup",document,we),_e("touchmove",document,ge),_e("mousemove",document,ge))}function ge(t){const{value:a}=k;if(!W.value||a===-1){be();return}const s=Ue(t);s!==void 0&&v(e(s,T.value[a]),a)}function we(){be()}function st(t){k.value=t,$.value||(M.value=t)}function nt(t){k.value===t&&(k.value=-1,be()),M.value===t&&(M.value=-1)}function lt(t){M.value=t}function rt(t){M.value===t&&(M.value=-1)}je(k,(t,a)=>{Se(()=>O.value=a)}),je(F,()=>{if(n.marks){if(te.value)return;te.value=!0,Se(()=>{te.value=!1})}Se(Te)}),Ct(()=>{be()});const He=X(()=>{const{self:{markFontSize:t,railColor:a,railColorHover:s,fillColor:u,fillColorHover:p,handleColor:S,opacityDisabled:q,dotColor:V,dotColorModal:z,handleBoxShadow:Q,handleBoxShadowHover:Me,handleBoxShadowActive:Ve,handleBoxShadowFocus:it,dotBorder:dt,dotBoxShadow:ct,railHeight:ut,railWidthVertical:vt,handleSize:ft,dotHeight:ht,dotWidth:mt,dotBorderRadius:pt,fontSize:bt,dotBorderActive:gt,dotColorPopover:wt},common:{cubicBezierEaseInOut:xt}}=h.value;return{"--n-bezier":xt,"--n-dot-border":dt,"--n-dot-border-active":gt,"--n-dot-border-radius":pt,"--n-dot-box-shadow":ct,"--n-dot-color":V,"--n-dot-color-modal":z,"--n-dot-color-popover":wt,"--n-dot-height":ht,"--n-dot-width":mt,"--n-fill-color":u,"--n-fill-color-hover":p,"--n-font-size":bt,"--n-handle-box-shadow":Q,"--n-handle-box-shadow-active":Ve,"--n-handle-box-shadow-focus":it,"--n-handle-box-shadow-hover":Me,"--n-handle-color":S,"--n-handle-size":ft,"--n-opacity-disabled":q,"--n-rail-color":a,"--n-rail-color-hover":s,"--n-rail-height":ut,"--n-rail-width-vertical":vt,"--n-mark-font-size":t}}),oe=y?Oe("slider",void 0,He,n):void 0,Ee=X(()=>{const{self:{fontSize:t,indicatorColor:a,indicatorBoxShadow:s,indicatorTextColor:u,indicatorBorderRadius:p}}=h.value;return{"--n-font-size":t,"--n-indicator-border-radius":p,"--n-indicator-box-shadow":s,"--n-indicator-color":a,"--n-indicator-text-color":u}}),se=y?Oe("slider-indicator",void 0,Ee,n):void 0;return{mergedClsPrefix:c,namespace:I,uncontrolledValue:L,mergedValue:F,mergedDisabled:$,mergedPlacement:x,isMounted:Ut(),adjustedTo:Fe(n),dotTransitionDisabled:te,markInfos:Ce,isShowTooltip:re,shouldKeepTooltipTransition:Re,handleRailRef:m,setHandleRefs:R,setFollowerRefs:B,fillStyle:ve,getHandleStyle:ze,activeIndex:k,arrifiedValues:T,followerEnabledIndexSet:Y,handleRailMouseDown:at,handleHandleFocus:st,handleHandleBlur:nt,handleHandleMouseEnter:lt,handleHandleMouseLeave:rt,handleRailKeyDown:tt,indicatorCssVars:y?void 0:Ee,indicatorThemeClass:se==null?void 0:se.themeClass,indicatorOnRender:se==null?void 0:se.onRender,cssVars:y?void 0:He,themeClass:oe==null?void 0:oe.themeClass,onRender:oe==null?void 0:oe.onRender}},render(){var n;const{mergedClsPrefix:c,themeClass:I,formatTooltip:y}=this;return(n=this.onRender)===null||n===void 0||n.call(this),N("div",{class:[`${c}-slider`,I,{[`${c}-slider--disabled`]:this.mergedDisabled,[`${c}-slider--active`]:this.activeIndex!==-1,[`${c}-slider--with-mark`]:this.marks,[`${c}-slider--vertical`]:this.vertical,[`${c}-slider--reverse`]:this.reverse}],style:this.cssVars,onKeydown:this.handleRailKeyDown,onMousedown:this.handleRailMouseDown,onTouchstart:this.handleRailMouseDown},N("div",{class:`${c}-slider-rail`},N("div",{class:`${c}-slider-rail__fill`,style:this.fillStyle}),this.marks?N("div",{class:[`${c}-slider-dots`,this.dotTransitionDisabled&&`${c}-slider-dots--transition-disabled`]},this.markInfos.map(h=>N("div",{key:h.key,class:[`${c}-slider-dot`,{[`${c}-slider-dot--active`]:h.active}],style:h.style}))):null,N("div",{ref:"handleRailRef",class:`${c}-slider-handles`},this.arrifiedValues.map((h,m)=>{const E=this.isShowTooltip(m);return N(ea,null,{default:()=>[N(ta,null,{default:()=>N("div",{ref:this.setHandleRefs(m),class:`${c}-slider-handle-wrapper`,tabindex:this.mergedDisabled?-1:0,role:"slider","aria-valuenow":h,"aria-valuemin":this.min,"aria-valuemax":this.max,"aria-orientation":this.vertical?"vertical":"horizontal","aria-disabled":this.disabled,style:this.getHandleStyle(h,m),onFocus:()=>{this.handleHandleFocus(m)},onBlur:()=>{this.handleHandleBlur(m)},onMouseenter:()=>{this.handleHandleMouseEnter(m)},onMouseleave:()=>{this.handleHandleMouseLeave(m)}},At(this.$slots.thumb,()=>[N("div",{class:`${c}-slider-handle`})]))}),this.tooltip&&N(aa,{ref:this.setFollowerRefs(m),show:E,to:this.adjustedTo,enabled:this.showTooltip&&!this.range||this.followerEnabledIndexSet.has(m),teleportDisabled:this.adjustedTo===Fe.tdkey,placement:this.mergedPlacement,containerClass:this.namespace},{default:()=>N(_t,{name:"fade-in-scale-up-transition",appear:this.isMounted,css:this.shouldKeepTooltipTransition(m),onEnter:()=>{this.followerEnabledIndexSet.add(m)},onAfterLeave:()=>{this.followerEnabledIndexSet.delete(m)}},{default:()=>{var R;return E?((R=this.indicatorOnRender)===null||R===void 0||R.call(this),N("div",{class:[`${c}-slider-handle-indicator`,this.indicatorThemeClass,`${c}-slider-handle-indicator--${this.mergedPlacement}`],style:this.indicatorCssVars},typeof y=="function"?y(h):h)):null}})})]})})),this.marks?N("div",{class:`${c}-slider-marks`},this.markInfos.map(h=>N("div",{key:h.key,class:`${c}-slider-mark`,style:h.style},typeof h.label=="function"?h.label():h.label))):null))}}),ba={class:"mock-container"},ga={class:"view-header"},wa={class:"flex items-center justify-between"},xa={class:"flex items-center gap-4"},ya={key:0,class:"flex items-center gap-4 voice-controls"},ka={class:"volume-slider w-24"},_a={class:"main-content"},Sa={class:"setup-content"},Ca={class:"icon-hero"},za={class:"form-grid"},Ra={class:"form-group"},Ta={class:"form-group mt-6"},Ma={key:1,class:"exam-view-container flex gap-6 h-[75vh]"},Va={class:"exam-view flex-1 flex flex-col"},Na={class:"exam-header"},Da={class:"chat-wrapper"},Ia={class:"messages-list"},Ba={class:"avatar-wrap"},Aa={class:"msg-content"},$a={key:0,class:"ai-feedback"},Fa={class:"feedback-tag"},Ua={class:"text"},Ha={key:0,class:"interim-overlay"},Ea={class:"wave-lines"},ja={class:"interim-text"},Pa={class:"input-area"},La={class:"flex gap-4 items-end"},Oa={class:"recorder-btn-wrap"},Wa={key:1,class:"recording-bars"},Ka={class:"flex-1"},qa={class:"leaderboard-sidebar w-72"},Xa={class:"sidebar-header flex items-center gap-2 mb-4"},Ya={key:0,class:"leaderboard-list"},Qa={class:"info"},Ga={class:"name"},Za={class:"score"},Ja={class:"p-4 flex justify-between items-center"},eo={class:"text-2xl font-black text-white flex items-center gap-2"},to={key:0,class:"report-content p-6"},ao={class:"score-hero"},oo={class:"main-score"},so={class:"score-circle"},no={class:"text-center"},lo={class:"text-4xl font-black text-white"},ro={class:"dimension-stats grid grid-cols-2 gap-4 flex-1"},io={class:"flex justify-between mb-1"},co={class:"text-xs text-zinc-400 uppercase font-bold"},uo={class:"text-xs text-white font-bold"},vo={class:"grid grid-cols-2 gap-8 mt-6"},fo={class:"feedback-col"},ho={class:"flex items-center gap-2 text-emerald-400 mb-4 font-bold"},mo={class:"feedback-list highlight"},po={class:"feedback-col"},bo={class:"flex items-center gap-2 text-amber-400 mb-4 font-bold"},go={class:"feedback-list warning"},wo={class:"model-answer-section mt-8"},xo={class:"flex items-center gap-2 text-indigo-400 mb-4 font-bold"},yo={class:"model-bubble"},ko={key:1,class:"h-80 flex flex-col items-center justify-center gap-4"},_o={class:"flex justify-between p-4 bg-black/20 rounded-b-3xl"},So={__name:"SpeakingMockView",setup(n){const c=Ht(),I=Et(),y=jt(),h=b(!1);b(!1);const m=b(!1),E=b(null),R=b("Work & Study"),C=b("Medium"),B=b(!0),Y=b(80),j=b([]),$=b(""),ee=b(null),L=b(!1),ne=b(!1),F=b(null),T=b([]),ue=()=>G(null,null,function*(){try{const v=yield de.getSpeakingLeaderboard();v.code===200&&(T.value=v.data)}catch(v){}});let x=null;const P=b(!1),k=b(!1),O=b("");let M=null,W=[];const te=["Work & Study","Hobbies","Technology","Culture","Travel","Daily Life"],le=[{label:"简单",value:"Easy"},{label:"中等",value:"Medium"},{label:"困难",value:"Hard"}],ve=()=>{const v=window.SpeechRecognition||window.webkitSpeechRecognition;if(!v){c.warning("您的浏览器不支持语音识别，请手动输入文字。");return}x=new v,x.continuous=!1,x.interimResults=!0,x.lang="en-US",x.onstart=()=>{P.value=!0,O.value=""},x.onresult=e=>{const U=Array.from(e.results).map(l=>l[0]).map(l=>l.transcript).join("");O.value=U,$.value=U},x.onerror=e=>{P.value=!1,e.error!=="no-speech"&&c.error("语音识别出错: "+e.error)},x.onend=()=>{P.value=!1}},Ce=()=>G(null,null,function*(){if(x||ve(),P.value)x&&x.stop(),M&&M.state!=="inactive"&&M.stop(),P.value=!1;else{if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){c.error("浏览器安全限制：语音功能仅支持 HTTPS 或 localhost。若使用 IP 访问，请查看配置教程。",{duration:1e4});return}try{const v=yield navigator.mediaDevices.getUserMedia({audio:!0});W=[],M=new MediaRecorder(v),M.ondataavailable=e=>{e.data.size>0&&W.push(e.data)},M.onstop=()=>G(null,null,function*(){const e=new Blob(W,{type:"audio/webm"});yield ze(e)}),M.start(),x&&x.start(),P.value=!0}catch(v){console.error("Start recording failed",v),c.error("无法启动麦克风")}}}),ze=v=>G(null,null,function*(){k.value=!0,O.value="Whisper 正在识别...";try{const e=yield de.transcribe(v);e.code===200&&e.data&&($.value=e.data,O.value=e.data)}catch(e){console.error("Whisper failed",e)}finally{k.value=!1,setTimeout(()=>{P.value||(O.value="")},2e3)}}),re=v=>{if(!B.value)return;window.speechSynthesis.cancel();const e=new SpeechSynthesisUtterance(v);e.lang="en-US",e.volume=Y.value/100;const U=window.speechSynthesis.getVoices(),l=U.find(_=>_.lang.startsWith("en-US")&&_.name.includes("Google"))||U.find(_=>_.lang.startsWith("en"));l&&(e.voice=l),window.speechSynthesis.speak(e)},Re=()=>G(null,null,function*(){m.value=!0;try{const v=yield de.startSpeakingMock({topic:R.value,difficulty:C.value});v.code===200&&(E.value=v.data.sessionId,h.value=!0,j.value=[{role:"assistant",content:v.data.greeting},{role:"assistant",content:v.data.firstQuestion}],setTimeout(()=>re(v.data.greeting+". "+v.data.firstQuestion),500))}catch(v){c.error("启动失败")}finally{m.value=!1,ae()}}),fe=()=>G(null,null,function*(){if(!$.value.trim()||m.value)return;const v=$.value;$.value="",O.value="",j.value.push({role:"user",content:v}),ae(),m.value=!0;try{const e=yield de.continueSpeakingMock({sessionId:E.value,transcription:v});e.code===200&&(j.value.push({role:"assistant",content:e.data.nextQuestion,feedback:e.data.feedback}),re(e.data.nextQuestion))}catch(e){c.error("信号中断...")}finally{m.value=!1,ae()}}),Te=()=>G(null,null,function*(){var v;if(j.value.length<4){c.warning("对话轮数太少，建议至少进行3轮对话后再生成报告。");return}ne.value=!0,L.value=!0;try{const e=yield de.generateSpeakingReport(j.value);e.code===200&&(F.value=e.data,((v=e.data.newAchievements)==null?void 0:v.length)>0&&(Be({particleCount:150,spread:70,origin:{y:.6},colors:["#6366f1","#a855f7","#fbbf24"]}),setTimeout(()=>{Be({particleCount:100,spread:100,origin:{x:.3,y:.7}})},200),setTimeout(()=>{Be({particleCount:100,spread:100,origin:{x:.7,y:.7}})},400),e.data.newAchievements.forEach(U=>{I.success({title:"✨ 荣获新成就！",content:`恭喜！您已点亮勋章：【${U.name}】。${U.description}`,duration:8e3,meta:new Date().toLocaleString()})})))}catch(e){c.error("生成报告失败"),L.value=!1}finally{ne.value=!1}}),ae=()=>{Se(()=>{ee.value&&ee.value.scrollTo({top:999999,behavior:"smooth"})})},ie=()=>{window.speechSynthesis.cancel(),x&&x.stop(),h.value=!1,E.value=null,j.value=[],L.value=!1,F.value=null};return zt(()=>{ve(),window.speechSynthesis.getVoices(),ue()}),Rt(()=>{window.speechSynthesis.cancel(),x&&x.stop()}),(v,e)=>{const U=Tt("n-input-group");return g(),w("div",ba,[o("header",ga,[o("div",wa,[o("div",xa,[i(r(K),{quaternary:"",circle:"",onClick:e[0]||(e[0]=l=>v.$router.back())},{default:f(()=>[i(r(We))]),_:1}),e[7]||(e[7]=o("div",null,[o("h1",null,"AI 1V1 口语智能模考"),o("p",null,"沉浸式全英对话，AI 考官实时追踪你的表达质量")],-1))]),h.value?(g(),w("div",ya,[i(r(K),{type:"primary",secondary:"",round:"",onClick:Te},{icon:f(()=>[i(r(Wt),{size:16})]),default:f(()=>[e[8]||(e[8]=D(" 生成结课报告 ",-1))]),_:1}),i(r(na),{trigger:"hover"},{trigger:f(()=>[i(r(K),{quaternary:"",circle:"",onClick:e[1]||(e[1]=l=>B.value=!B.value)},{default:f(()=>[i(r(Pt),{component:B.value?r(Kt):r(qt),color:B.value?"#10b981":"#71717a"},null,8,["component","color"])]),_:1})]),default:f(()=>[D(" "+A(B.value?"AI 语音已开启":"AI 语音已静音"),1)]),_:1}),o("div",ka,[i(r(pa),{value:Y.value,"onUpdate:value":e[2]||(e[2]=l=>Y.value=l),step:10},null,8,["value"])])])):Ne("",!0)])]),o("main",_a,[h.value?(g(),w("div",Ma,[o("div",Va,[o("div",Na,[e[17]||(e[17]=o("div",{class:"flex items-center gap-3"},[o("div",{class:"pulse-red"}),o("span",{class:"text-zinc-400 font-mono tracking-tighter"},"IELTS SIMULATION • ACTIVE")],-1)),i(r(K),{size:"small",type:"error",quaternary:"",round:"",onClick:ie},{default:f(()=>[...e[16]||(e[16]=[D("终止会话",-1)])]),_:1})]),o("div",Da,[i(r(sa),{ref_key:"scrollRef",ref:ee,class:"chat-area"},{default:f(()=>[o("div",Ia,[(g(!0),w(Z,null,J(j.value,(l,_)=>{var he;return g(),w("div",{key:_,class:Ie(["msg-bubble",l.role])},[o("div",Ba,[i(r(Ye),{round:"",size:"small",src:l.role==="assistant"?"":(he=r(y).userInfo)==null?void 0:he.avatar,style:Pe({background:l.role==="assistant"?"linear-gradient(135deg, #6366f1, #a855f7)":"#3f3f46"})},Mt({_:2},[l.role==="assistant"?{name:"icon",fn:f(()=>[i(r(Xt))]),key:"0"}:{name:"icon",fn:f(()=>[i(r(Yt))]),key:"1"}]),1032,["src","style"])]),o("div",Aa,[l.feedback?(g(),w("div",$a,[o("div",Fa,[i(r(qe),{size:10}),e[18]||(e[18]=D(" Real-time feedback",-1))]),D(A(l.feedback),1)])):Ne("",!0),o("div",Ua,A(l.content),1)])],2)}),128))])]),_:1},512),O.value||k.value?(g(),w("div",Ha,[o("div",Ea,[(g(),w(Z,null,J(5,l=>o("div",{key:l,class:"line",style:Pe({animationDuration:k.value?"0.3s":"0.5s"})},null,4)),64))]),o("span",ja,A(k.value?"AI 正在深度识别语音...":O.value),1)])):Ne("",!0),o("div",Pa,[o("div",La,[o("div",Oa,[o("button",{class:Ie(["recorder-btn",{recording:P.value}]),onMousedown:Ce},[P.value?(g(),w("div",Wa,[...e[19]||(e[19]=[o("span",null,null,-1),o("span",null,null,-1),o("span",null,null,-1),o("span",null,null,-1)])])):(g(),De(r(Ke),{key:0,size:24}))],34)]),o("div",Ka,[i(U,null,{default:f(()=>[i(r(ra),{value:$.value,"onUpdate:value":e[3]||(e[3]=l=>$.value=l),placeholder:"点击麦克风或直接回复...",round:"",disabled:m.value,onKeyup:Vt(fe,["enter"])},null,8,["value","disabled"]),i(r(K),{type:"primary",circle:"",disabled:!$.value.trim()||m.value,onClick:fe,style:{width:"44px",height:"44px"}},{default:f(()=>[i(r(Qt),{size:18})]),_:1},8,["disabled"])]),_:1})])])])])]),o("div",qa,[i(r(Ae),{bordered:!1,class:"sidebar-card h-full"},{default:f(()=>[o("div",Xa,[i(r(Xe),{size:20,class:"text-yellow-500"}),e[20]||(e[20]=o("span",{class:"font-black text-lg"},"口语高分榜",-1))]),T.value.length?(g(),w("div",Ya,[(g(!0),w(Z,null,J(T.value,(l,_)=>(g(),w("div",{key:_,class:"leader-item"},[o("div",{class:Ie(["rank","rank-"+(_+1)])},A(_+1),3),i(r(Ye),{round:"",size:"small",src:l.avatar,class:"avatar"},null,8,["src"]),o("div",Qa,[o("div",Ga,A(l.username),1),o("div",Za,A(l.score)+" pts",1)])]))),128))])):(g(),De(r(ia),{key:1,description:"暂无记录"}))]),_:1})])])):(g(),De(r(Ae),{key:0,class:"setup-card",bordered:!1},{default:f(()=>[o("div",Sa,[o("div",Ca,[e[9]||(e[9]=o("div",{class:"blob indigo"},null,-1)),e[10]||(e[10]=o("div",{class:"pulse-ring"},null,-1)),i(r(Ke),{size:48,class:"relative z-10 text-indigo-400"})]),e[14]||(e[14]=o("h2",null,"开启一场高阶口语实战",-1)),e[15]||(e[15]=o("p",null,"本次模考将记录您的发音、词汇及逻辑，完成后可一键生成 360° AI 分析报告。",-1)),o("div",za,[o("div",Ra,[e[11]||(e[11]=o("label",null,"选择话题",-1)),i(r($e),null,{default:f(()=>[(g(),w(Z,null,J(te,l=>i(r(la),{key:l,checked:R.value===l,checkable:"","onUpdate:checked":_=>R.value=l},{default:f(()=>[D(A(l),1)]),_:2},1032,["checked","onUpdate:checked"])),64))]),_:1})]),o("div",Ta,[e[12]||(e[12]=o("label",null,"难度等级",-1)),i(r($e),null,{default:f(()=>[(g(),w(Z,null,J(le,l=>i(r(K),{key:l.value,round:"",secondary:C.value!==l.value,type:C.value===l.value?"primary":"default",onClick:_=>C.value=l.value},{default:f(()=>[D(A(l.label),1)]),_:2},1032,["secondary","type","onClick"])),64))]),_:1})])]),i(r(K),{type:"primary",size:"large",round:"",block:"",class:"mt-8 start-btn",loading:m.value,onClick:Re},{default:f(()=>[...e[13]||(e[13]=[D("立即开启训练",-1)])]),_:1},8,["loading"])])]),_:1}))]),i(r(Lt),{show:L.value,"onUpdate:show":e[6]||(e[6]=l=>L.value=l),"mask-closable":!1,"trap-focus":!0,"auto-focus":!0,class:"report-modal"},{default:f(()=>[i(r(Ae),{style:{width:"800px","border-radius":"32px"},bordered:!1,class:"premium-dark-card"},{header:f(()=>[o("div",Ja,[o("h2",eo,[i(r(Xe),{class:"text-yellow-500"}),e[21]||(e[21]=D(" AI 结课深度评估报告",-1))]),i(r(K),{quaternary:"",circle:"",onClick:e[4]||(e[4]=l=>L.value=!1)},{default:f(()=>[i(r(We))]),_:1})])]),footer:f(()=>[o("div",_o,[i(r($e),null,{default:f(()=>[i(r(K),{secondary:"",round:"",onClick:ie},{default:f(()=>[...e[27]||(e[27]=[D("重新模考",-1)])]),_:1}),i(r(K),{quaternary:"",round:""},{default:f(()=>[i(r(Jt),{size:16,class:"mr-1"}),e[28]||(e[28]=D(" 分享战绩",-1))]),_:1})]),_:1}),i(r(K),{type:"primary",round:"",style:{padding:"0 30px"},onClick:e[5]||(e[5]=l=>L.value=!1)},{default:f(()=>[...e[29]||(e[29]=[D("掌握并返回",-1)])]),_:1})])]),default:f(()=>[i(r(Qe),{show:ne.value},{default:f(()=>[F.value?(g(),w("div",to,[o("div",ao,[o("div",oo,[o("div",so,[i(r(Ge),{type:"circle",percentage:F.value.score,"stroke-width":10,color:"#6366f1"},{default:f(()=>[o("div",no,[e[22]||(e[22]=o("p",{class:"text-zinc-500 text-xs font-bold uppercase"},"Overall",-1)),o("h3",lo,[i(r(da),{from:0,to:F.value.score},null,8,["to"])])])]),_:1},8,["percentage"])])]),o("div",ro,[(g(!0),w(Z,null,J(F.value.dimensions,(l,_)=>(g(),w("div",{key:_,class:"dim-item"},[o("div",io,[o("span",co,A(_),1),o("span",uo,A(l),1)]),i(r(Ge),{type:"line",percentage:l,"show-indicator":!1,height:4,color:l>80?"#10b981":"#f59e0b"},null,8,["percentage","color"])]))),128))])]),i(r(ca)),o("div",vo,[o("div",fo,[o("h4",ho,[i(r(Gt),{size:18}),e[23]||(e[23]=D(" 核心亮点",-1))]),o("ul",mo,[(g(!0),w(Z,null,J(F.value.strengths,l=>(g(),w("li",{key:l},A(l),1))),128))])]),o("div",po,[o("h4",bo,[i(r(Zt),{size:18}),e[24]||(e[24]=D(" 改进空间",-1))]),o("ul",go,[(g(!0),w(Z,null,J(F.value.weaknesses,l=>(g(),w("li",{key:l},A(l),1))),128))])])]),o("div",wo,[o("h4",xo,[i(r(qe),{size:18}),e[25]||(e[25]=D(" AI 之选 (Model Answer)",-1))]),o("div",yo,A(F.value.modelAnswer),1)])])):(g(),w("div",ko,[i(r(Qe),{size:"large"}),e[26]||(e[26]=o("p",{class:"text-zinc-500 italic"},"智囊团正在深度复盘您的表现...",-1))]))]),_:1},8,["show"])]),_:1})]),_:1},8,["show"])])}}},Go=Ot(So,[["__scopeId","data-v-718924ed"]]);export{Go as default};
