var de=(l,d,D)=>new Promise((C,p)=>{var y=_=>{try{T(D.next(_))}catch(U){p(U)}},K=_=>{try{T(D.throw(_))}catch(U){p(U)}},T=_=>_.done?C(_.value):Promise.resolve(_.value).then(y,K);T((D=D.apply(l,d)).next())});import{a8 as xt,d as yt,h as R,z as kt,r as x,w as je,D as Ce,m as _t,u as St,c as Y,o as Ct,b as zt,N as Tt,Q as b,X as k,Y as o,f as i,P as h,M as r,q as N,Z as A,a1 as Ne,O as De,F as Z,$ as ee,J as $e,a0 as Vt,a9 as Mt,a2 as Rt}from"./vue-core-Qok9l9dg.js";import{b as Ae}from"./utils-xYuYZ4Xr.js";import{a as xe}from"./ai-2YeNd3uZ.js";import{A as Nt,a9 as Dt,h as ce,e as c,f as E,g as ye,aa as Pe,ab as $t,ac as At,E as It,l as Bt,m as Ze,C as Ft,n as Le,ad as Et,o as ke,F as _e,ae as Se,d as Ut,a2 as Ht,u as jt,B as W,N as Pt,a as Ie,b as Lt}from"./index-DWq0_FoP.js";import{u as Ot}from"./useTextAudio-BShkqbSt.js";import{e as Wt,i as Kt,M as Xt,V as qt}from"./voskSpeechRecognizer-D0nBTiPY.js";import{_ as Yt}from"./_plugin-vue_export-helper-DlAUqK2U.js";import{aa as Oe,F as Qt,V as Gt,al as Jt,aj as We,am as Zt,U as ea,h as Ke,an as ta,t as Xe,I as aa,C as oa,a7 as sa}from"./icons-FSQdP13O.js";import{N as na}from"./Tooltip-BxzNnQFo.js";import{B as la,V as ra,a as ia,u as Fe}from"./Popover-BBNE_ZHP.js";import{u as da}from"./use-merged-state-3vwOMuut.js";import{S as ca}from"./Scrollbar-DqA1t-eK.js";import{N as ua}from"./NumberAnimation-CV2THjAT.js";import{N as Be}from"./Space-CayeV20q.js";import{N as fa}from"./Tag-Bz8Q9YAP.js";import{N as qe}from"./Avatar-B6D6ke41.js";import{N as va}from"./Input-Do-5bQCM.js";import{N as ha}from"./Empty-DrmdyfSY.js";import{N as Ye}from"./Spin-D4ijDEdW.js";import{N as Qe}from"./Progress-CjIm-v4S.js";import{N as ma}from"./Divider-B51AXF0k.js";import"./vendor-CcVv25CF.js";import"./cssr-CRQrCRnn.js";import"./next-frame-once-C5Ksf8W7.js";import"./use-compitable-CoNRZgmE.js";import"./use-locale-DXGQ8vop.js";import"./get-slot-Bk_rJcZu.js";import"./Suffix-wo5bWPcj.js";function pa(l){const d="rgba(0, 0, 0, .85)",D="0 2px 8px 0 rgba(0, 0, 0, 0.12)",{railColor:C,primaryColor:p,baseColor:y,cardColor:K,modalColor:T,popoverColor:_,borderRadius:U,fontSize:G,opacityDisabled:Q}=l;return Object.assign(Object.assign({},Dt),{fontSize:G,markFontSize:G,railColor:C,railColorHover:C,fillColor:p,fillColorHover:p,opacityDisabled:Q,handleColor:"#FFF",dotColor:K,dotColorModal:T,dotColorPopover:_,handleBoxShadow:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",handleBoxShadowHover:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",handleBoxShadowActive:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",handleBoxShadowFocus:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",indicatorColor:d,indicatorBoxShadow:D,indicatorTextColor:y,indicatorBorderRadius:U,dotBorder:`2px solid ${C}`,dotBorderActive:`2px solid ${p}`,dotBoxShadow:""})}const ga={common:Nt,self:pa},ba=ce([c("slider",`
 display: block;
 padding: calc((var(--n-handle-size) - var(--n-rail-height)) / 2) 0;
 position: relative;
 z-index: 0;
 width: 100%;
 cursor: pointer;
 user-select: none;
 -webkit-user-select: none;
 `,[E("reverse",[c("slider-handles",[c("slider-handle-wrapper",`
 transform: translate(50%, -50%);
 `)]),c("slider-dots",[c("slider-dot",`
 transform: translateX(50%, -50%);
 `)]),E("vertical",[c("slider-handles",[c("slider-handle-wrapper",`
 transform: translate(-50%, -50%);
 `)]),c("slider-marks",[c("slider-mark",`
 transform: translateY(calc(-50% + var(--n-dot-height) / 2));
 `)]),c("slider-dots",[c("slider-dot",`
 transform: translateX(-50%) translateY(0);
 `)])])]),E("vertical",`
 box-sizing: content-box;
 padding: 0 calc((var(--n-handle-size) - var(--n-rail-height)) / 2);
 width: var(--n-rail-width-vertical);
 height: 100%;
 `,[c("slider-handles",`
 top: calc(var(--n-handle-size) / 2);
 right: 0;
 bottom: calc(var(--n-handle-size) / 2);
 left: 0;
 `,[c("slider-handle-wrapper",`
 top: unset;
 left: 50%;
 transform: translate(-50%, 50%);
 `)]),c("slider-rail",`
 height: 100%;
 `,[ye("fill",`
 top: unset;
 right: 0;
 bottom: unset;
 left: 0;
 `)]),E("with-mark",`
 width: var(--n-rail-width-vertical);
 margin: 0 32px 0 8px;
 `),c("slider-marks",`
 top: calc(var(--n-handle-size) / 2);
 right: unset;
 bottom: calc(var(--n-handle-size) / 2);
 left: 22px;
 font-size: var(--n-mark-font-size);
 `,[c("slider-mark",`
 transform: translateY(50%);
 white-space: nowrap;
 `)]),c("slider-dots",`
 top: calc(var(--n-handle-size) / 2);
 right: unset;
 bottom: calc(var(--n-handle-size) / 2);
 left: 50%;
 `,[c("slider-dot",`
 transform: translateX(-50%) translateY(50%);
 `)])]),E("disabled",`
 cursor: not-allowed;
 opacity: var(--n-opacity-disabled);
 `,[c("slider-handle",`
 cursor: not-allowed;
 `)]),E("with-mark",`
 width: 100%;
 margin: 8px 0 32px 0;
 `),ce("&:hover",[c("slider-rail",{backgroundColor:"var(--n-rail-color-hover)"},[ye("fill",{backgroundColor:"var(--n-fill-color-hover)"})]),c("slider-handle",{boxShadow:"var(--n-handle-box-shadow-hover)"})]),E("active",[c("slider-rail",{backgroundColor:"var(--n-rail-color-hover)"},[ye("fill",{backgroundColor:"var(--n-fill-color-hover)"})]),c("slider-handle",{boxShadow:"var(--n-handle-box-shadow-hover)"})]),c("slider-marks",`
 position: absolute;
 top: 18px;
 left: calc(var(--n-handle-size) / 2);
 right: calc(var(--n-handle-size) / 2);
 `,[c("slider-mark",`
 position: absolute;
 transform: translateX(-50%);
 white-space: nowrap;
 `)]),c("slider-rail",`
 width: 100%;
 position: relative;
 height: var(--n-rail-height);
 background-color: var(--n-rail-color);
 transition: background-color .3s var(--n-bezier);
 border-radius: calc(var(--n-rail-height) / 2);
 `,[ye("fill",`
 position: absolute;
 top: 0;
 bottom: 0;
 border-radius: calc(var(--n-rail-height) / 2);
 transition: background-color .3s var(--n-bezier);
 background-color: var(--n-fill-color);
 `)]),c("slider-handles",`
 position: absolute;
 top: 0;
 right: calc(var(--n-handle-size) / 2);
 bottom: 0;
 left: calc(var(--n-handle-size) / 2);
 `,[c("slider-handle-wrapper",`
 outline: none;
 position: absolute;
 top: 50%;
 transform: translate(-50%, -50%);
 cursor: pointer;
 display: flex;
 `,[c("slider-handle",`
 height: var(--n-handle-size);
 width: var(--n-handle-size);
 border-radius: 50%;
 overflow: hidden;
 transition: box-shadow .2s var(--n-bezier), background-color .3s var(--n-bezier);
 background-color: var(--n-handle-color);
 box-shadow: var(--n-handle-box-shadow);
 `,[ce("&:hover",`
 box-shadow: var(--n-handle-box-shadow-hover);
 `)]),ce("&:focus",[c("slider-handle",`
 box-shadow: var(--n-handle-box-shadow-focus);
 `,[ce("&:hover",`
 box-shadow: var(--n-handle-box-shadow-active);
 `)])])])]),c("slider-dots",`
 position: absolute;
 top: 50%;
 left: calc(var(--n-handle-size) / 2);
 right: calc(var(--n-handle-size) / 2);
 `,[E("transition-disabled",[c("slider-dot","transition: none;")]),c("slider-dot",`
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
 `,[E("active","border: var(--n-dot-border-active);")])])]),c("slider-handle-indicator",`
 font-size: var(--n-font-size);
 padding: 6px 10px;
 border-radius: var(--n-indicator-border-radius);
 color: var(--n-indicator-text-color);
 background-color: var(--n-indicator-color);
 box-shadow: var(--n-indicator-box-shadow);
 `,[Pe()]),c("slider-handle-indicator",`
 font-size: var(--n-font-size);
 padding: 6px 10px;
 border-radius: var(--n-indicator-border-radius);
 color: var(--n-indicator-text-color);
 background-color: var(--n-indicator-color);
 box-shadow: var(--n-indicator-box-shadow);
 `,[E("top",`
 margin-bottom: 12px;
 `),E("right",`
 margin-left: 12px;
 `),E("bottom",`
 margin-top: 12px;
 `),E("left",`
 margin-right: 12px;
 `),Pe()]),$t(c("slider",[c("slider-dot","background-color: var(--n-dot-color-modal);")])),At(c("slider",[c("slider-dot","background-color: var(--n-dot-color-popover);")]))]);function Ge(l){return window.TouchEvent&&l instanceof window.TouchEvent}function Je(){const l=new Map,d=D=>C=>{l.set(D,C)};return xt(()=>{l.clear()}),[l,d]}const wa=0,xa=Object.assign(Object.assign({},Ze.props),{to:Fe.propTo,defaultValue:{type:[Number,Array],default:0},marks:Object,disabled:{type:Boolean,default:void 0},formatTooltip:Function,keyboard:{type:Boolean,default:!0},min:{type:Number,default:0},max:{type:Number,default:100},step:{type:[Number,String],default:1},range:Boolean,value:[Number,Array],placement:String,showTooltip:{type:Boolean,default:void 0},tooltip:{type:Boolean,default:!0},vertical:Boolean,reverse:Boolean,"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array],onDragstart:[Function],onDragend:[Function]}),ya=yt({name:"Slider",props:xa,slots:Object,setup(l){const{mergedClsPrefixRef:d,namespaceRef:D,inlineThemeDisabled:C}=Bt(l),p=Ze("Slider","-slider",ba,ga,l,d),y=x(null),[K,T]=Je(),[_,U]=Je(),G=x(new Set),Q=Ft(l),{mergedDisabledRef:H}=Q,ae=Y(()=>{const{step:t}=l;if(Number(t)<=0||t==="mark")return 0;const a=t.toString();let s=0;return a.includes(".")&&(s=a.length-a.indexOf(".")-1),s}),j=x(l.defaultValue),P=St(l,"value"),te=da(P,j),S=Y(()=>{const{value:t}=te;return(l.range?t:[t]).map(e)}),oe=Y(()=>S.value.length>2),L=Y(()=>l.placement===void 0?l.vertical?"right":"top":l.placement),se=Y(()=>{const{marks:t}=l;return t?Object.keys(t).map(Number.parseFloat):null}),I=x(-1),m=x(-1),w=x(-1),B=x(!1),O=x(!1),X=Y(()=>{const{vertical:t,reverse:a}=l;return t?a?"top":"bottom":a?"right":"left"}),ue=Y(()=>{if(oe.value)return;const t=S.value,a=v(l.range?Math.min(...t):l.min),s=v(l.range?Math.max(...t):t[0]),{value:f}=X;return l.vertical?{[f]:`${a}%`,height:`${s-a}%`}:{[f]:`${a}%`,width:`${s-a}%`}}),ze=Y(()=>{const t=[],{marks:a}=l;if(a){const s=S.value.slice();s.sort((M,V)=>M-V);const{value:f}=X,{value:g}=oe,{range:z}=l,q=g?()=>!1:M=>z?M>=s[0]&&M<=s[s.length-1]:M<=s[0];for(const M of Object.keys(a)){const V=Number(M);t.push({active:q(V),key:V,label:a[M],style:{[f]:`${v(V)}%`}})}}return t});function Te(t,a){const s=v(t),{value:f}=X;return{[f]:`${s}%`,zIndex:a===I.value?1:0}}function fe(t){return l.showTooltip||w.value===t||I.value===t&&B.value}function ve(t){return B.value?!(I.value===t&&m.value===t):!0}function Ve(t){var a;~t&&(I.value=t,(a=K.get(t))===null||a===void 0||a.focus())}function he(){_.forEach((t,a)=>{fe(a)&&t.syncPosition()})}function me(t){const{"onUpdate:value":a,onUpdateValue:s}=l,{nTriggerFormInput:f,nTriggerFormChange:g}=Q;s&&ke(s,t),a&&ke(a,t),j.value=t,f(),g()}function ne(t){const{range:a}=l;if(a){if(Array.isArray(t)){const{value:s}=S;t.join()!==s.join()&&me(t)}}else Array.isArray(t)||S.value[0]!==t&&me(t)}function le(t,a){if(l.range){const s=S.value.slice();s.splice(a,1,t),ne(s)}else ne(t)}function u(t,a,s){const f=s!==void 0;s||(s=t-a>0?1:-1);const g=se.value||[],{step:z}=l;if(z==="mark"){const V=F(t,g.concat(a),f?s:void 0);return V?V.value:a}if(z<=0)return a;const{value:q}=ae;let M;if(f){const V=Number((a/z).toFixed(q)),J=Math.floor(V),Me=V>J?J:J-1,Re=V<J?J:J+1;M=F(a,[Number((Me*z).toFixed(q)),Number((Re*z).toFixed(q)),...g],s)}else{const V=$(t);M=F(t,[...g,V])}return M?e(M.value):a}function e(t){return Math.min(l.max,Math.max(l.min,t))}function v(t){const{max:a,min:s}=l;return(t-s)/(a-s)*100}function n(t){const{max:a,min:s}=l;return s+(a-s)*t}function $(t){const{step:a,min:s}=l;if(Number(a)<=0||a==="mark")return t;const f=Math.round((t-s)/a)*a+s;return Number(f.toFixed(ae.value))}function F(t,a=se.value,s){if(!(a!=null&&a.length))return null;let f=null,g=-1;for(;++g<a.length;){const z=a[g]-t,q=Math.abs(z);(s===void 0||z*s>0)&&(f===null||q<f.distance)&&(f={index:g,distance:q,value:a[g]})}return f}function Ee(t){const a=y.value;if(!a)return;const s=Ge(t)?t.touches[0]:t,f=a.getBoundingClientRect();let g;return l.vertical?g=(f.bottom-s.clientY)/f.height:g=(s.clientX-f.left)/f.width,l.reverse&&(g=1-g),n(g)}function et(t){if(H.value||!l.keyboard)return;const{vertical:a,reverse:s}=l;switch(t.key){case"ArrowUp":t.preventDefault(),pe(a&&s?-1:1);break;case"ArrowRight":t.preventDefault(),pe(!a&&s?-1:1);break;case"ArrowDown":t.preventDefault(),pe(a&&s?1:-1);break;case"ArrowLeft":t.preventDefault(),pe(!a&&s?1:-1);break}}function pe(t){const a=I.value;if(a===-1)return;const{step:s}=l,f=S.value[a],g=Number(s)<=0||s==="mark"?f:f+s*t;le(u(g,f,t>0?1:-1),a)}function tt(t){var a,s;if(H.value||!Ge(t)&&t.button!==wa)return;const f=Ee(t);if(f===void 0)return;const g=S.value.slice(),z=l.range?(s=(a=F(f,g))===null||a===void 0?void 0:a.index)!==null&&s!==void 0?s:-1:0;z!==-1&&(t.preventDefault(),Ve(z),at(),le(u(f,S.value[z]),z))}function at(){B.value||(B.value=!0,l.onDragstart&&ke(l.onDragstart),_e("touchend",document,we),_e("mouseup",document,we),_e("touchmove",document,be),_e("mousemove",document,be))}function ge(){B.value&&(B.value=!1,l.onDragend&&ke(l.onDragend),Se("touchend",document,we),Se("mouseup",document,we),Se("touchmove",document,be),Se("mousemove",document,be))}function be(t){const{value:a}=I;if(!B.value||a===-1){ge();return}const s=Ee(t);s!==void 0&&le(u(s,S.value[a]),a)}function we(){ge()}function ot(t){I.value=t,H.value||(w.value=t)}function st(t){I.value===t&&(I.value=-1,ge()),w.value===t&&(w.value=-1)}function nt(t){w.value=t}function lt(t){w.value===t&&(w.value=-1)}je(I,(t,a)=>{Ce(()=>m.value=a)}),je(te,()=>{if(l.marks){if(O.value)return;O.value=!0,Ce(()=>{O.value=!1})}Ce(he)}),_t(()=>{ge()});const Ue=Y(()=>{const{self:{markFontSize:t,railColor:a,railColorHover:s,fillColor:f,fillColorHover:g,handleColor:z,opacityDisabled:q,dotColor:M,dotColorModal:V,handleBoxShadow:J,handleBoxShadowHover:Me,handleBoxShadowActive:Re,handleBoxShadowFocus:rt,dotBorder:it,dotBoxShadow:dt,railHeight:ct,railWidthVertical:ut,handleSize:ft,dotHeight:vt,dotWidth:ht,dotBorderRadius:mt,fontSize:pt,dotBorderActive:gt,dotColorPopover:bt},common:{cubicBezierEaseInOut:wt}}=p.value;return{"--n-bezier":wt,"--n-dot-border":it,"--n-dot-border-active":gt,"--n-dot-border-radius":mt,"--n-dot-box-shadow":dt,"--n-dot-color":M,"--n-dot-color-modal":V,"--n-dot-color-popover":bt,"--n-dot-height":vt,"--n-dot-width":ht,"--n-fill-color":f,"--n-fill-color-hover":g,"--n-font-size":pt,"--n-handle-box-shadow":J,"--n-handle-box-shadow-active":Re,"--n-handle-box-shadow-focus":rt,"--n-handle-box-shadow-hover":Me,"--n-handle-color":z,"--n-handle-size":ft,"--n-opacity-disabled":q,"--n-rail-color":a,"--n-rail-color-hover":s,"--n-rail-height":ct,"--n-rail-width-vertical":ut,"--n-mark-font-size":t}}),re=C?Le("slider",void 0,Ue,l):void 0,He=Y(()=>{const{self:{fontSize:t,indicatorColor:a,indicatorBoxShadow:s,indicatorTextColor:f,indicatorBorderRadius:g}}=p.value;return{"--n-font-size":t,"--n-indicator-border-radius":g,"--n-indicator-box-shadow":s,"--n-indicator-color":a,"--n-indicator-text-color":f}}),ie=C?Le("slider-indicator",void 0,He,l):void 0;return{mergedClsPrefix:d,namespace:D,uncontrolledValue:j,mergedValue:te,mergedDisabled:H,mergedPlacement:L,isMounted:Et(),adjustedTo:Fe(l),dotTransitionDisabled:O,markInfos:ze,isShowTooltip:fe,shouldKeepTooltipTransition:ve,handleRailRef:y,setHandleRefs:T,setFollowerRefs:U,fillStyle:ue,getHandleStyle:Te,activeIndex:I,arrifiedValues:S,followerEnabledIndexSet:G,handleRailMouseDown:tt,handleHandleFocus:ot,handleHandleBlur:st,handleHandleMouseEnter:nt,handleHandleMouseLeave:lt,handleRailKeyDown:et,indicatorCssVars:C?void 0:He,indicatorThemeClass:ie==null?void 0:ie.themeClass,indicatorOnRender:ie==null?void 0:ie.onRender,cssVars:C?void 0:Ue,themeClass:re==null?void 0:re.themeClass,onRender:re==null?void 0:re.onRender}},render(){var l;const{mergedClsPrefix:d,themeClass:D,formatTooltip:C}=this;return(l=this.onRender)===null||l===void 0||l.call(this),R("div",{class:[`${d}-slider`,D,{[`${d}-slider--disabled`]:this.mergedDisabled,[`${d}-slider--active`]:this.activeIndex!==-1,[`${d}-slider--with-mark`]:this.marks,[`${d}-slider--vertical`]:this.vertical,[`${d}-slider--reverse`]:this.reverse}],style:this.cssVars,onKeydown:this.handleRailKeyDown,onMousedown:this.handleRailMouseDown,onTouchstart:this.handleRailMouseDown},R("div",{class:`${d}-slider-rail`},R("div",{class:`${d}-slider-rail__fill`,style:this.fillStyle}),this.marks?R("div",{class:[`${d}-slider-dots`,this.dotTransitionDisabled&&`${d}-slider-dots--transition-disabled`]},this.markInfos.map(p=>R("div",{key:p.key,class:[`${d}-slider-dot`,{[`${d}-slider-dot--active`]:p.active}],style:p.style}))):null,R("div",{ref:"handleRailRef",class:`${d}-slider-handles`},this.arrifiedValues.map((p,y)=>{const K=this.isShowTooltip(y);return R(la,null,{default:()=>[R(ra,null,{default:()=>R("div",{ref:this.setHandleRefs(y),class:`${d}-slider-handle-wrapper`,tabindex:this.mergedDisabled?-1:0,role:"slider","aria-valuenow":p,"aria-valuemin":this.min,"aria-valuemax":this.max,"aria-orientation":this.vertical?"vertical":"horizontal","aria-disabled":this.disabled,style:this.getHandleStyle(p,y),onFocus:()=>{this.handleHandleFocus(y)},onBlur:()=>{this.handleHandleBlur(y)},onMouseenter:()=>{this.handleHandleMouseEnter(y)},onMouseleave:()=>{this.handleHandleMouseLeave(y)}},It(this.$slots.thumb,()=>[R("div",{class:`${d}-slider-handle`})]))}),this.tooltip&&R(ia,{ref:this.setFollowerRefs(y),show:K,to:this.adjustedTo,enabled:this.showTooltip&&!this.range||this.followerEnabledIndexSet.has(y),teleportDisabled:this.adjustedTo===Fe.tdkey,placement:this.mergedPlacement,containerClass:this.namespace},{default:()=>R(kt,{name:"fade-in-scale-up-transition",appear:this.isMounted,css:this.shouldKeepTooltipTransition(y),onEnter:()=>{this.followerEnabledIndexSet.add(y)},onAfterLeave:()=>{this.followerEnabledIndexSet.delete(y)}},{default:()=>{var T;return K?((T=this.indicatorOnRender)===null||T===void 0||T.call(this),R("div",{class:[`${d}-slider-handle-indicator`,this.indicatorThemeClass,`${d}-slider-handle-indicator--${this.mergedPlacement}`],style:this.indicatorCssVars},typeof C=="function"?C(p):p)):null}})})]})})),this.marks?R("div",{class:`${d}-slider-marks`},this.markInfos.map(p=>R("div",{key:p.key,class:`${d}-slider-mark`,style:p.style},typeof p.label=="function"?p.label():p.label))):null))}}),ka={class:"mock-container"},_a={class:"view-header"},Sa={class:"flex items-center justify-between"},Ca={class:"flex items-center gap-4"},za={key:0,class:"flex items-center gap-4 voice-controls"},Ta={class:"volume-slider w-24"},Va={class:"main-content"},Ma={class:"setup-content"},Ra={class:"icon-hero"},Na={class:"form-grid"},Da={class:"form-group"},$a={class:"form-group mt-6"},Aa={key:1,class:"exam-view-container flex gap-6 h-[75vh]"},Ia={class:"exam-view flex-1 flex flex-col"},Ba={class:"exam-header"},Fa={class:"chat-wrapper"},Ea={class:"messages-list"},Ua={class:"avatar-wrap"},Ha={class:"msg-content"},ja={key:0,class:"ai-feedback"},Pa={class:"feedback-tag"},La={class:"text"},Oa={key:0,class:"interim-overlay"},Wa={class:"wave-lines"},Ka={class:"interim-text"},Xa={class:"input-area"},qa={class:"flex gap-4 items-end"},Ya={class:"recorder-btn-wrap"},Qa={key:1,class:"recording-bars"},Ga={class:"flex-1"},Ja={class:"leaderboard-sidebar w-72"},Za={class:"sidebar-header flex items-center gap-2 mb-4"},eo={key:0,class:"leaderboard-list"},to={class:"info"},ao={class:"name"},oo={class:"score"},so={class:"p-4 flex justify-between items-center"},no={class:"text-2xl font-black text-white flex items-center gap-2"},lo={key:0,class:"report-content p-6"},ro={class:"score-hero"},io={class:"main-score"},co={class:"score-circle"},uo={class:"text-center"},fo={class:"text-4xl font-black text-white"},vo={class:"dimension-stats grid grid-cols-2 gap-4 flex-1"},ho={class:"flex justify-between mb-1"},mo={class:"text-xs text-zinc-400 uppercase font-bold"},po={class:"text-xs text-white font-bold"},go={class:"grid grid-cols-2 gap-8 mt-6"},bo={class:"feedback-col"},wo={class:"flex items-center gap-2 text-emerald-400 mb-4 font-bold"},xo={class:"feedback-list highlight"},yo={class:"feedback-col"},ko={class:"flex items-center gap-2 text-amber-400 mb-4 font-bold"},_o={class:"feedback-list warning"},So={class:"model-answer-section mt-8"},Co={class:"flex items-center gap-2 text-indigo-400 mb-4 font-bold"},zo={class:"model-bubble"},To={key:1,class:"h-80 flex flex-col items-center justify-center gap-4"},Vo={class:"flex justify-between p-4 bg-black/20 rounded-b-3xl"},Mo={__name:"SpeakingMockView",setup(l){const d=Ut(),D=Ht(),C=jt(),{playAudio:p,stopAudio:y,warmVoices:K}=Ot({notifyWarning:u=>d.warning(u)}),T=x(!1),_=x(!1),U=x(null),G=x("Work & Study"),Q=x("Medium"),H=x(!0),ae=x(80),j=x([]),P=x(""),te=x(null),S=x(!1),oe=x(!1),L=x(null),se=x([]),I=()=>de(null,null,function*(){try{const u=yield xe.getSpeakingLeaderboard();u.code===200&&(se.value=u.data)}catch(u){}});let m=null,w=null;const B=x(!1),O=x("");let X="";const ue=(u,e)=>{const v=String(u||"").replace(/\s+/g," ").trim(),n=String(e||"").replace(/\s+/g," ").trim();if(!n)return v;if(!v)return n;if(v===n||v.endsWith(` ${n}`)||v.endsWith(n)||v.includes(n))return v;if(n.startsWith(`${v} `)||n.startsWith(v)||n.includes(v))return n;const $=Math.min(v.length,n.length);for(let F=$;F>0;F-=1)if(v.slice(-F)===n.slice(0,F))return`${v}${n.slice(F)}`.replace(/\s+/g," ").trim();return`${v} ${n}`.replace(/\s+/g," ").trim()},ze=["Work & Study","Hobbies","Technology","Culture","Travel","Daily Life"],Te=[{label:"简单",value:"Easy"},{label:"中等",value:"Medium"},{label:"困难",value:"Hard"}],fe=()=>de(null,null,function*(){if(B.value){if(w&&(yield w.stop(),w=null),m!=null&&m.isRecording){try{yield m.stopRecording()}catch(e){}m.destroy(),m=null}B.value=!1;return}const u=window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1";if(!window.isSecureContext&&!u){d.error("浏览器安全限制：Vosk 识别需要 HTTPS 或 localhost。",{duration:1e4});return}if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){d.error("当前浏览器无法访问麦克风接口，请使用最新版 Chrome/Edge。");return}try{yield Wt(),Kt("en-US")||d.warning("当前超轻量 Vosk 模型仅支持英文识别，请使用英文作答。"),m=new Xt,yield m.init(),yield m.startRecording(),X=P.value.trim(),O.value="",w=new qt({lang:"en-US",onPartialResult:e=>{const v=ue(X,e);O.value=v,P.value=v},onFinalResult:e=>{e&&(X=ue(X,e),P.value=X,O.value=X)},onError:e=>{console.error("Vosk recognition error",e),d.error("Vosk 语音识别出错，请检查麦克风权限")}}),yield w.start(m.stream),B.value=!0}catch(e){console.error("Start recording failed",e),d.error((e==null?void 0:e.message)||"无法启动 Vosk 麦克风识别，请检查浏览器权限",{duration:1e4})}}),ve=u=>{H.value&&p(u,{mode:"native",nativeOptions:{lang:"en-US",volume:ae.value/100,voiceSelector:e=>e.find(v=>v.lang.startsWith("en-US")&&v.name.includes("Google"))||e.find(v=>v.lang.startsWith("en"))}})},Ve=()=>de(null,null,function*(){_.value=!0;try{const u=yield xe.startSpeakingMock({topic:G.value,difficulty:Q.value});u.code===200&&(U.value=u.data.sessionId,T.value=!0,j.value=[{role:"assistant",content:u.data.greeting},{role:"assistant",content:u.data.firstQuestion}],setTimeout(()=>ve(u.data.greeting+". "+u.data.firstQuestion),500))}catch(u){d.error("启动失败")}finally{_.value=!1,ne()}}),he=()=>de(null,null,function*(){if(!P.value.trim()||_.value)return;const u=P.value;P.value="",O.value="",j.value.push({role:"user",content:u}),ne(),_.value=!0;try{const e=yield xe.continueSpeakingMock({sessionId:U.value,transcription:u});e.code===200&&(j.value.push({role:"assistant",content:e.data.nextQuestion,feedback:e.data.feedback}),ve(e.data.nextQuestion))}catch(e){d.error("信号中断...")}finally{_.value=!1,ne()}}),me=()=>de(null,null,function*(){var u;if(j.value.length<4){d.warning("对话轮数太少，建议至少进行3轮对话后再生成报告。");return}oe.value=!0,S.value=!0;try{const e=yield xe.generateSpeakingReport(j.value);e.code===200&&(L.value=e.data,((u=e.data.newAchievements)==null?void 0:u.length)>0&&(Ae({particleCount:150,spread:70,origin:{y:.6},colors:["#6366f1","#a855f7","#fbbf24"]}),setTimeout(()=>{Ae({particleCount:100,spread:100,origin:{x:.3,y:.7}})},200),setTimeout(()=>{Ae({particleCount:100,spread:100,origin:{x:.7,y:.7}})},400),e.data.newAchievements.forEach(v=>{D.success({title:"✨ 荣获新成就！",content:`恭喜！您已点亮勋章：【${v.name}】。${v.description}`,duration:8e3,meta:new Date().toLocaleString()})})))}catch(e){d.error("生成报告失败"),S.value=!1}finally{oe.value=!1}}),ne=()=>{Ce(()=>{te.value&&te.value.scrollTo({top:999999,behavior:"smooth"})})},le=()=>{var u,e;if(y(),(u=w==null?void 0:w.stop)==null||u.call(w),w=null,m!=null&&m.isRecording)try{m.stopRecording()}catch(v){}(e=m==null?void 0:m.destroy)==null||e.call(m),m=null,T.value=!1,U.value=null,j.value=[],S.value=!1,L.value=null};return Ct(()=>{K(),I()}),zt(()=>{var u,e;y(),(u=w==null?void 0:w.stop)==null||u.call(w),(e=m==null?void 0:m.destroy)==null||e.call(m)}),(u,e)=>{const v=Tt("n-input-group");return b(),k("div",ka,[o("header",_a,[o("div",Sa,[o("div",Ca,[i(r(W),{quaternary:"",circle:"",onClick:e[0]||(e[0]=n=>u.$router.back())},{default:h(()=>[i(r(Oe))]),_:1}),e[7]||(e[7]=o("div",null,[o("h1",null,"AI 1V1 口语智能模考"),o("p",null,"沉浸式全英对话，AI 考官实时追踪你的表达质量")],-1))]),T.value?(b(),k("div",za,[i(r(W),{type:"primary",secondary:"",round:"",onClick:me},{icon:h(()=>[i(r(Qt),{size:16})]),default:h(()=>[e[8]||(e[8]=N(" 生成结课报告 ",-1))]),_:1}),i(r(na),{trigger:"hover"},{trigger:h(()=>[i(r(W),{quaternary:"",circle:"",onClick:e[1]||(e[1]=n=>H.value=!H.value)},{default:h(()=>[i(r(Pt),{component:H.value?r(Gt):r(Jt),color:H.value?"#10b981":"#71717a"},null,8,["component","color"])]),_:1})]),default:h(()=>[N(" "+A(H.value?"AI 语音已开启":"AI 语音已静音"),1)]),_:1}),o("div",Ta,[i(r(ya),{value:ae.value,"onUpdate:value":e[2]||(e[2]=n=>ae.value=n),step:10},null,8,["value"])])])):Ne("",!0)])]),o("main",Va,[T.value?(b(),k("div",Aa,[o("div",Ia,[o("div",Ba,[e[17]||(e[17]=o("div",{class:"flex items-center gap-3"},[o("div",{class:"pulse-red"}),o("span",{class:"text-zinc-400 font-mono tracking-tighter"},"IELTS SIMULATION • ACTIVE")],-1)),i(r(W),{size:"small",type:"error",quaternary:"",round:"",onClick:le},{default:h(()=>[...e[16]||(e[16]=[N("终止会话",-1)])]),_:1})]),o("div",Fa,[i(r(ca),{ref_key:"scrollRef",ref:te,class:"chat-area"},{default:h(()=>[o("div",Ea,[(b(!0),k(Z,null,ee(j.value,(n,$)=>{var F;return b(),k("div",{key:$,class:$e(["msg-bubble",n.role])},[o("div",Ua,[i(r(qe),{round:"",size:"small",src:n.role==="assistant"?"":(F=r(C).userInfo)==null?void 0:F.avatar,style:Vt({background:n.role==="assistant"?"linear-gradient(135deg, #6366f1, #a855f7)":"#3f3f46"})},Mt({_:2},[n.role==="assistant"?{name:"icon",fn:h(()=>[i(r(Zt))]),key:"0"}:{name:"icon",fn:h(()=>[i(r(ea))]),key:"1"}]),1032,["src","style"])]),o("div",Ha,[n.feedback?(b(),k("div",ja,[o("div",Pa,[i(r(Ke),{size:10}),e[18]||(e[18]=N(" Real-time feedback",-1))]),N(A(n.feedback),1)])):Ne("",!0),o("div",La,A(n.content),1)])],2)}),128))])]),_:1},512),O.value?(b(),k("div",Oa,[o("div",Wa,[(b(),k(Z,null,ee(5,n=>o("div",{key:n,class:"line",style:{animationDuration:"0.5s"}})),64))]),o("span",Ka,A(O.value),1)])):Ne("",!0),o("div",Xa,[o("div",qa,[o("div",Ya,[o("button",{class:$e(["recorder-btn",{recording:B.value}]),onClick:fe},[B.value?(b(),k("div",Qa,[...e[19]||(e[19]=[o("span",null,null,-1),o("span",null,null,-1),o("span",null,null,-1),o("span",null,null,-1)])])):(b(),De(r(We),{key:0,size:24}))],2)]),o("div",Ga,[i(v,null,{default:h(()=>[i(r(va),{value:P.value,"onUpdate:value":e[3]||(e[3]=n=>P.value=n),placeholder:"点击麦克风或直接回复...",round:"",disabled:_.value,onKeyup:Rt(he,["enter"])},null,8,["value","disabled"]),i(r(W),{type:"primary",circle:"",disabled:!P.value.trim()||_.value,onClick:he,style:{width:"44px",height:"44px"}},{default:h(()=>[i(r(ta),{size:18})]),_:1},8,["disabled"])]),_:1})])])])])]),o("div",Ja,[i(r(Ie),{bordered:!1,class:"sidebar-card h-full"},{default:h(()=>[o("div",Za,[i(r(Xe),{size:20,class:"text-yellow-500"}),e[20]||(e[20]=o("span",{class:"font-black text-lg"},"口语高分榜",-1))]),se.value.length?(b(),k("div",eo,[(b(!0),k(Z,null,ee(se.value,(n,$)=>(b(),k("div",{key:$,class:"leader-item"},[o("div",{class:$e(["rank","rank-"+($+1)])},A($+1),3),i(r(qe),{round:"",size:"small",src:n.avatar,class:"avatar"},null,8,["src"]),o("div",to,[o("div",ao,A(n.username),1),o("div",oo,A(n.score)+" pts",1)])]))),128))])):(b(),De(r(ha),{key:1,description:"暂无记录"}))]),_:1})])])):(b(),De(r(Ie),{key:0,class:"setup-card",bordered:!1},{default:h(()=>[o("div",Ma,[o("div",Ra,[e[9]||(e[9]=o("div",{class:"blob indigo"},null,-1)),e[10]||(e[10]=o("div",{class:"pulse-ring"},null,-1)),i(r(We),{size:48,class:"relative z-10 text-indigo-400"})]),e[14]||(e[14]=o("h2",null,"开启一场高阶口语实战",-1)),e[15]||(e[15]=o("p",null,"本次模考将记录您的发音、词汇及逻辑，完成后可一键生成 360° AI 分析报告。",-1)),o("div",Na,[o("div",Da,[e[11]||(e[11]=o("label",null,"选择话题",-1)),i(r(Be),null,{default:h(()=>[(b(),k(Z,null,ee(ze,n=>i(r(fa),{key:n,checked:G.value===n,checkable:"","onUpdate:checked":$=>G.value=n},{default:h(()=>[N(A(n),1)]),_:2},1032,["checked","onUpdate:checked"])),64))]),_:1})]),o("div",$a,[e[12]||(e[12]=o("label",null,"难度等级",-1)),i(r(Be),null,{default:h(()=>[(b(),k(Z,null,ee(Te,n=>i(r(W),{key:n.value,round:"",secondary:Q.value!==n.value,type:Q.value===n.value?"primary":"default",onClick:$=>Q.value=n.value},{default:h(()=>[N(A(n.label),1)]),_:2},1032,["secondary","type","onClick"])),64))]),_:1})])]),i(r(W),{type:"primary",size:"large",round:"",block:"",class:"mt-8 start-btn",loading:_.value,onClick:Ve},{default:h(()=>[...e[13]||(e[13]=[N("立即开启训练",-1)])]),_:1},8,["loading"])])]),_:1}))]),i(r(Lt),{show:S.value,"onUpdate:show":e[6]||(e[6]=n=>S.value=n),"mask-closable":!1,"trap-focus":!0,"auto-focus":!0,class:"report-modal"},{default:h(()=>[i(r(Ie),{style:{width:"800px","border-radius":"32px"},bordered:!1,class:"premium-dark-card"},{header:h(()=>[o("div",so,[o("h2",no,[i(r(Xe),{class:"text-yellow-500"}),e[21]||(e[21]=N(" AI 结课深度评估报告",-1))]),i(r(W),{quaternary:"",circle:"",onClick:e[4]||(e[4]=n=>S.value=!1)},{default:h(()=>[i(r(Oe))]),_:1})])]),footer:h(()=>[o("div",Vo,[i(r(Be),null,{default:h(()=>[i(r(W),{secondary:"",round:"",onClick:le},{default:h(()=>[...e[27]||(e[27]=[N("重新模考",-1)])]),_:1}),i(r(W),{quaternary:"",round:""},{default:h(()=>[i(r(sa),{size:16,class:"mr-1"}),e[28]||(e[28]=N(" 分享战绩",-1))]),_:1})]),_:1}),i(r(W),{type:"primary",round:"",style:{padding:"0 30px"},onClick:e[5]||(e[5]=n=>S.value=!1)},{default:h(()=>[...e[29]||(e[29]=[N("掌握并返回",-1)])]),_:1})])]),default:h(()=>[i(r(Ye),{show:oe.value},{default:h(()=>[L.value?(b(),k("div",lo,[o("div",ro,[o("div",io,[o("div",co,[i(r(Qe),{type:"circle",percentage:L.value.score,"stroke-width":10,color:"#6366f1"},{default:h(()=>[o("div",uo,[e[22]||(e[22]=o("p",{class:"text-zinc-500 text-xs font-bold uppercase"},"Overall",-1)),o("h3",fo,[i(r(ua),{from:0,to:L.value.score},null,8,["to"])])])]),_:1},8,["percentage"])])]),o("div",vo,[(b(!0),k(Z,null,ee(L.value.dimensions,(n,$)=>(b(),k("div",{key:$,class:"dim-item"},[o("div",ho,[o("span",mo,A($),1),o("span",po,A(n),1)]),i(r(Qe),{type:"line",percentage:n,"show-indicator":!1,height:4,color:n>80?"#10b981":"#f59e0b"},null,8,["percentage","color"])]))),128))])]),i(r(ma)),o("div",go,[o("div",bo,[o("h4",wo,[i(r(aa),{size:18}),e[23]||(e[23]=N(" 核心亮点",-1))]),o("ul",xo,[(b(!0),k(Z,null,ee(L.value.strengths,n=>(b(),k("li",{key:n},A(n),1))),128))])]),o("div",yo,[o("h4",ko,[i(r(oa),{size:18}),e[24]||(e[24]=N(" 改进空间",-1))]),o("ul",_o,[(b(!0),k(Z,null,ee(L.value.weaknesses,n=>(b(),k("li",{key:n},A(n),1))),128))])])]),o("div",So,[o("h4",Co,[i(r(Ke),{size:18}),e[25]||(e[25]=N(" AI 之选 (Model Answer)",-1))]),o("div",zo,A(L.value.modelAnswer),1)])])):(b(),k("div",To,[i(r(Ye),{size:"large"}),e[26]||(e[26]=o("p",{class:"text-zinc-500 italic"},"智囊团正在深度复盘您的表现...",-1))]))]),_:1},8,["show"])]),_:1})]),_:1},8,["show"])])}}},ns=Yt(Mo,[["__scopeId","data-v-125e4d61"]]);export{ns as default};
