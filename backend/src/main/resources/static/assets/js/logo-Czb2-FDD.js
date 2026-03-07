import{d as j,h as c,I as ge,A as Be,D as Ee,J as Pe,r as L,a as U,c as C,y as pe,w as De,m as Ke,z as V,u as ee,F as Ue}from"./vue-core-k66yWm0l.js";import{b8 as Ve,S as Te,b9 as Ce,l as te,w as We,aO as Ge,ba as qe,bb as Xe,bc as Ye,bd as Qe,h as s,R as re,e as m,f as I,g as b,aq as Ze,as as Je,ar as eo,am as oo,m as Y,be as to,j as Ne,bf as ro,n as we,bg as no,o as T,aA as io,M as lo,x as ao,bh as so,A as co,az as He,I as ne,t as Q,aa as uo,aK as X,i as vo,Q as ze,D as be,a6 as me,ac as ho,aH as mo,bi as fo,T as go}from"./index-DahIAh76.js";import{u as oe}from"./use-merged-state-DCOVafah.js";import{N as po}from"./Tooltip-Dq7o15sY.js";import{N as bo}from"./Dropdown-BMkeGnuK.js";import{c as fe}from"./create-D3Vn69pI.js";import{u as xo}from"./use-compitable-C8LpTH9g.js";import{V as yo}from"./index-k4lpeCHj.js";const Co=j({name:"ChevronDownFilled",render(){return c("svg",{viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg"},c("path",{d:"M3.20041 5.73966C3.48226 5.43613 3.95681 5.41856 4.26034 5.70041L8 9.22652L11.7397 5.70041C12.0432 5.41856 12.5177 5.43613 12.7996 5.73966C13.0815 6.0432 13.0639 6.51775 12.7603 6.7996L8.51034 10.7996C8.22258 11.0668 7.77743 11.0668 7.48967 10.7996L3.23966 6.7996C2.93613 6.51775 2.91856 6.0432 3.20041 5.73966Z",fill:"currentColor"}))}}),wo=j({name:"NDrawerContent",inheritAttrs:!1,props:{blockScroll:Boolean,show:{type:Boolean,default:void 0},displayDirective:{type:String,required:!0},placement:{type:String,required:!0},contentClass:String,contentStyle:[Object,String],nativeScrollbar:{type:Boolean,required:!0},scrollbarProps:Object,trapFocus:{type:Boolean,default:!0},autoFocus:{type:Boolean,default:!0},showMask:{type:[Boolean,String],required:!0},maxWidth:Number,maxHeight:Number,minWidth:Number,minHeight:Number,resizable:Boolean,onClickoutside:Function,onAfterLeave:Function,onAfterEnter:Function,onEsc:Function},setup(e){const t=L(!!e.show),o=L(null),d=U(Ce);let a=0,i="",u=null;const h=L(!1),l=L(!1),p=C(()=>e.placement==="top"||e.placement==="bottom"),{mergedClsPrefixRef:A,mergedRtlRef:P}=te(e),g=We("Drawer",P,A),R=x,$=z=>{l.value=!0,a=p.value?z.clientY:z.clientX,i=document.body.style.cursor,document.body.style.cursor=p.value?"ns-resize":"ew-resize",document.body.addEventListener("mousemove",F),document.body.addEventListener("mouseleave",R),document.body.addEventListener("mouseup",x)},k=()=>{u!==null&&(window.clearTimeout(u),u=null),l.value?h.value=!0:u=window.setTimeout(()=>{h.value=!0},300)},O=()=>{u!==null&&(window.clearTimeout(u),u=null),h.value=!1},{doUpdateHeight:M,doUpdateWidth:W}=d,_=z=>{const{maxWidth:H}=e;if(H&&z>H)return H;const{minWidth:B}=e;return B&&z<B?B:z},D=z=>{const{maxHeight:H}=e;if(H&&z>H)return H;const{minHeight:B}=e;return B&&z<B?B:z};function F(z){var H,B;if(l.value)if(p.value){let E=((H=o.value)===null||H===void 0?void 0:H.offsetHeight)||0;const K=a-z.clientY;E+=e.placement==="bottom"?K:-K,E=D(E),M(E),a=z.clientY}else{let E=((B=o.value)===null||B===void 0?void 0:B.offsetWidth)||0;const K=a-z.clientX;E+=e.placement==="right"?K:-K,E=_(E),W(E),a=z.clientX}}function x(){l.value&&(a=0,l.value=!1,document.body.style.cursor=i,document.body.removeEventListener("mousemove",F),document.body.removeEventListener("mouseup",x),document.body.removeEventListener("mouseleave",R))}pe(()=>{e.show&&(t.value=!0)}),De(()=>e.show,z=>{z||x()}),Ke(()=>{x()});const w=C(()=>{const{show:z}=e,H=[[Pe,z]];return e.showMask||H.push([Ge,e.onClickoutside,void 0,{capture:!0}]),H});function N(){var z;t.value=!1,(z=e.onAfterLeave)===null||z===void 0||z.call(e)}return qe(C(()=>e.blockScroll&&t.value)),V(Xe,o),V(Ye,null),V(Qe,null),{bodyRef:o,rtlEnabled:g,mergedClsPrefix:d.mergedClsPrefixRef,isMounted:d.isMountedRef,mergedTheme:d.mergedThemeRef,displayed:t,transitionName:C(()=>({right:"slide-in-from-right-transition",left:"slide-in-from-left-transition",top:"slide-in-from-top-transition",bottom:"slide-in-from-bottom-transition"})[e.placement]),handleAfterLeave:N,bodyDirectives:w,handleMousedownResizeTrigger:$,handleMouseenterResizeTrigger:k,handleMouseleaveResizeTrigger:O,isDragging:l,isHoverOnResizeTrigger:h}},render(){const{$slots:e,mergedClsPrefix:t}=this;return this.displayDirective==="show"||this.displayed||this.show?ge(c("div",{role:"none"},c(Ve,{disabled:!this.showMask||!this.trapFocus,active:this.show,autoFocus:this.autoFocus,onEsc:this.onEsc},{default:()=>c(Be,{name:this.transitionName,appear:this.isMounted,onAfterEnter:this.onAfterEnter,onAfterLeave:this.handleAfterLeave},{default:()=>ge(c("div",Ee(this.$attrs,{role:"dialog",ref:"bodyRef","aria-modal":"true",class:[`${t}-drawer`,this.rtlEnabled&&`${t}-drawer--rtl`,`${t}-drawer--${this.placement}-placement`,this.isDragging&&`${t}-drawer--unselectable`,this.nativeScrollbar&&`${t}-drawer--native-scrollbar`]}),[this.resizable?c("div",{class:[`${t}-drawer__resize-trigger`,(this.isDragging||this.isHoverOnResizeTrigger)&&`${t}-drawer__resize-trigger--hover`],onMouseenter:this.handleMouseenterResizeTrigger,onMouseleave:this.handleMouseleaveResizeTrigger,onMousedown:this.handleMousedownResizeTrigger}):null,this.nativeScrollbar?c("div",{class:[`${t}-drawer-content-wrapper`,this.contentClass],style:this.contentStyle,role:"none"},e):c(Te,Object.assign({},this.scrollbarProps,{contentStyle:this.contentStyle,contentClass:[`${t}-drawer-content-wrapper`,this.contentClass],theme:this.mergedTheme.peers.Scrollbar,themeOverrides:this.mergedTheme.peerOverrides.Scrollbar}),e)]),this.bodyDirectives)})})),[[Pe,this.displayDirective==="if"||this.displayed||this.show]]):null}}),{cubicBezierEaseIn:zo,cubicBezierEaseOut:Io}=re;function So({duration:e="0.3s",leaveDuration:t="0.2s",name:o="slide-in-from-bottom"}={}){return[s(`&.${o}-transition-leave-active`,{transition:`transform ${t} ${zo}`}),s(`&.${o}-transition-enter-active`,{transition:`transform ${e} ${Io}`}),s(`&.${o}-transition-enter-to`,{transform:"translateY(0)"}),s(`&.${o}-transition-enter-from`,{transform:"translateY(100%)"}),s(`&.${o}-transition-leave-from`,{transform:"translateY(0)"}),s(`&.${o}-transition-leave-to`,{transform:"translateY(100%)"})]}const{cubicBezierEaseIn:Ro,cubicBezierEaseOut:$o}=re;function Po({duration:e="0.3s",leaveDuration:t="0.2s",name:o="slide-in-from-left"}={}){return[s(`&.${o}-transition-leave-active`,{transition:`transform ${t} ${Ro}`}),s(`&.${o}-transition-enter-active`,{transition:`transform ${e} ${$o}`}),s(`&.${o}-transition-enter-to`,{transform:"translateX(0)"}),s(`&.${o}-transition-enter-from`,{transform:"translateX(-100%)"}),s(`&.${o}-transition-leave-from`,{transform:"translateX(0)"}),s(`&.${o}-transition-leave-to`,{transform:"translateX(-100%)"})]}const{cubicBezierEaseIn:No,cubicBezierEaseOut:Ho}=re;function Ao({duration:e="0.3s",leaveDuration:t="0.2s",name:o="slide-in-from-right"}={}){return[s(`&.${o}-transition-leave-active`,{transition:`transform ${t} ${No}`}),s(`&.${o}-transition-enter-active`,{transition:`transform ${e} ${Ho}`}),s(`&.${o}-transition-enter-to`,{transform:"translateX(0)"}),s(`&.${o}-transition-enter-from`,{transform:"translateX(100%)"}),s(`&.${o}-transition-leave-from`,{transform:"translateX(0)"}),s(`&.${o}-transition-leave-to`,{transform:"translateX(100%)"})]}const{cubicBezierEaseIn:ko,cubicBezierEaseOut:Bo}=re;function Eo({duration:e="0.3s",leaveDuration:t="0.2s",name:o="slide-in-from-top"}={}){return[s(`&.${o}-transition-leave-active`,{transition:`transform ${t} ${ko}`}),s(`&.${o}-transition-enter-active`,{transition:`transform ${e} ${Bo}`}),s(`&.${o}-transition-enter-to`,{transform:"translateY(0)"}),s(`&.${o}-transition-enter-from`,{transform:"translateY(-100%)"}),s(`&.${o}-transition-leave-from`,{transform:"translateY(0)"}),s(`&.${o}-transition-leave-to`,{transform:"translateY(-100%)"})]}const To=s([m("drawer",`
 word-break: break-word;
 line-height: var(--n-line-height);
 position: absolute;
 pointer-events: all;
 box-shadow: var(--n-box-shadow);
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 background-color: var(--n-color);
 color: var(--n-text-color);
 box-sizing: border-box;
 `,[Ao(),Po(),Eo(),So(),I("unselectable",`
 user-select: none; 
 -webkit-user-select: none;
 `),I("native-scrollbar",[m("drawer-content-wrapper",`
 overflow: auto;
 height: 100%;
 `)]),b("resize-trigger",`
 position: absolute;
 background-color: #0000;
 transition: background-color .3s var(--n-bezier);
 `,[I("hover",`
 background-color: var(--n-resize-trigger-color-hover);
 `)]),m("drawer-content-wrapper",`
 box-sizing: border-box;
 `),m("drawer-content",`
 height: 100%;
 display: flex;
 flex-direction: column;
 `,[I("native-scrollbar",[m("drawer-body-content-wrapper",`
 height: 100%;
 overflow: auto;
 `)]),m("drawer-body",`
 flex: 1 0 0;
 overflow: hidden;
 `),m("drawer-body-content-wrapper",`
 box-sizing: border-box;
 padding: var(--n-body-padding);
 `),m("drawer-header",`
 font-weight: var(--n-title-font-weight);
 line-height: 1;
 font-size: var(--n-title-font-size);
 color: var(--n-title-text-color);
 padding: var(--n-header-padding);
 transition: border .3s var(--n-bezier);
 border-bottom: 1px solid var(--n-divider-color);
 border-bottom: var(--n-header-border-bottom);
 display: flex;
 justify-content: space-between;
 align-items: center;
 `,[b("main",`
 flex: 1;
 `),b("close",`
 margin-left: 6px;
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 `)]),m("drawer-footer",`
 display: flex;
 justify-content: flex-end;
 border-top: var(--n-footer-border-top);
 transition: border .3s var(--n-bezier);
 padding: var(--n-footer-padding);
 `)]),I("right-placement",`
 top: 0;
 bottom: 0;
 right: 0;
 border-top-left-radius: var(--n-border-radius);
 border-bottom-left-radius: var(--n-border-radius);
 `,[b("resize-trigger",`
 width: 3px;
 height: 100%;
 top: 0;
 left: 0;
 transform: translateX(-1.5px);
 cursor: ew-resize;
 `)]),I("left-placement",`
 top: 0;
 bottom: 0;
 left: 0;
 border-top-right-radius: var(--n-border-radius);
 border-bottom-right-radius: var(--n-border-radius);
 `,[b("resize-trigger",`
 width: 3px;
 height: 100%;
 top: 0;
 right: 0;
 transform: translateX(1.5px);
 cursor: ew-resize;
 `)]),I("top-placement",`
 top: 0;
 left: 0;
 right: 0;
 border-bottom-left-radius: var(--n-border-radius);
 border-bottom-right-radius: var(--n-border-radius);
 `,[b("resize-trigger",`
 width: 100%;
 height: 3px;
 bottom: 0;
 left: 0;
 transform: translateY(1.5px);
 cursor: ns-resize;
 `)]),I("bottom-placement",`
 left: 0;
 bottom: 0;
 right: 0;
 border-top-left-radius: var(--n-border-radius);
 border-top-right-radius: var(--n-border-radius);
 `,[b("resize-trigger",`
 width: 100%;
 height: 3px;
 top: 0;
 left: 0;
 transform: translateY(-1.5px);
 cursor: ns-resize;
 `)])]),s("body",[s(">",[m("drawer-container",`
 position: fixed;
 `)])]),m("drawer-container",`
 position: relative;
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 pointer-events: none;
 `,[s("> *",`
 pointer-events: all;
 `)]),m("drawer-mask",`
 background-color: rgba(0, 0, 0, .3);
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 `,[I("invisible",`
 background-color: rgba(0, 0, 0, 0)
 `),Ze({enterDuration:"0.2s",leaveDuration:"0.2s",enterCubicBezier:"var(--n-bezier-in)",leaveCubicBezier:"var(--n-bezier-out)"})])]),Oo=Object.assign(Object.assign({},Y.props),{show:Boolean,width:[Number,String],height:[Number,String],placement:{type:String,default:"right"},maskClosable:{type:Boolean,default:!0},showMask:{type:[Boolean,String],default:!0},to:[String,Object],displayDirective:{type:String,default:"if"},nativeScrollbar:{type:Boolean,default:!0},zIndex:Number,onMaskClick:Function,scrollbarProps:Object,contentClass:String,contentStyle:[Object,String],trapFocus:{type:Boolean,default:!0},onEsc:Function,autoFocus:{type:Boolean,default:!0},closeOnEsc:{type:Boolean,default:!0},blockScroll:{type:Boolean,default:!0},maxWidth:Number,maxHeight:Number,minWidth:Number,minHeight:Number,resizable:Boolean,defaultWidth:{type:[Number,String],default:251},defaultHeight:{type:[Number,String],default:251},onUpdateWidth:[Function,Array],onUpdateHeight:[Function,Array],"onUpdate:width":[Function,Array],"onUpdate:height":[Function,Array],"onUpdate:show":[Function,Array],onUpdateShow:[Function,Array],onAfterEnter:Function,onAfterLeave:Function,drawerStyle:[String,Object],drawerClass:String,target:null,onShow:Function,onHide:Function}),at=j({name:"Drawer",inheritAttrs:!1,props:Oo,setup(e){const{mergedClsPrefixRef:t,namespaceRef:o,inlineThemeDisabled:d}=te(e),a=oo(),i=Y("Drawer","-drawer",To,to,e,t),u=L(e.defaultWidth),h=L(e.defaultHeight),l=oe(ee(e,"width"),u),p=oe(ee(e,"height"),h),A=C(()=>{const{placement:x}=e;return x==="top"||x==="bottom"?"":Ne(l.value)}),P=C(()=>{const{placement:x}=e;return x==="left"||x==="right"?"":Ne(p.value)}),g=x=>{const{onUpdateWidth:w,"onUpdate:width":N}=e;w&&T(w,x),N&&T(N,x),u.value=x},R=x=>{const{onUpdateHeight:w,"onUpdate:width":N}=e;w&&T(w,x),N&&T(N,x),h.value=x},$=C(()=>[{width:A.value,height:P.value},e.drawerStyle||""]);function k(x){const{onMaskClick:w,maskClosable:N}=e;N&&_(!1),w&&w(x)}function O(x){k(x)}const M=ro();function W(x){var w;(w=e.onEsc)===null||w===void 0||w.call(e),e.show&&e.closeOnEsc&&no(x)&&(M.value||_(!1))}function _(x){const{onHide:w,onUpdateShow:N,"onUpdate:show":z}=e;N&&T(N,x),z&&T(z,x),w&&!x&&T(w,x)}V(Ce,{isMountedRef:a,mergedThemeRef:i,mergedClsPrefixRef:t,doUpdateShow:_,doUpdateHeight:R,doUpdateWidth:g});const D=C(()=>{const{common:{cubicBezierEaseInOut:x,cubicBezierEaseIn:w,cubicBezierEaseOut:N},self:{color:z,textColor:H,boxShadow:B,lineHeight:E,headerPadding:K,footerPadding:q,borderRadius:ie,bodyPadding:le,titleFontSize:ae,titleTextColor:se,titleFontWeight:ce,headerBorderBottom:de,footerBorderTop:v,closeIconColor:y,closeIconColorHover:r,closeIconColorPressed:f,closeColorHover:S,closeColorPressed:ue,closeIconSize:ve,closeSize:he,closeBorderRadius:n,resizableTriggerColorHover:je}}=i.value;return{"--n-line-height":E,"--n-color":z,"--n-border-radius":ie,"--n-text-color":H,"--n-box-shadow":B,"--n-bezier":x,"--n-bezier-out":N,"--n-bezier-in":w,"--n-header-padding":K,"--n-body-padding":le,"--n-footer-padding":q,"--n-title-text-color":se,"--n-title-font-size":ae,"--n-title-font-weight":ce,"--n-header-border-bottom":de,"--n-footer-border-top":v,"--n-close-icon-color":y,"--n-close-icon-color-hover":r,"--n-close-icon-color-pressed":f,"--n-close-size":he,"--n-close-color-hover":S,"--n-close-color-pressed":ue,"--n-close-icon-size":ve,"--n-close-border-radius":n,"--n-resize-trigger-color-hover":je}}),F=d?we("drawer",void 0,D,e):void 0;return{mergedClsPrefix:t,namespace:o,mergedBodyStyle:$,handleOutsideClick:O,handleMaskClick:k,handleEsc:W,mergedTheme:i,cssVars:d?void 0:D,themeClass:F==null?void 0:F.themeClass,onRender:F==null?void 0:F.onRender,isMounted:a}},render(){const{mergedClsPrefix:e}=this;return c(eo,{to:this.to,show:this.show},{default:()=>{var t;return(t=this.onRender)===null||t===void 0||t.call(this),ge(c("div",{class:[`${e}-drawer-container`,this.namespace,this.themeClass],style:this.cssVars,role:"none"},this.showMask?c(Be,{name:"fade-in-transition",appear:this.isMounted},{default:()=>this.show?c("div",{"aria-hidden":!0,class:[`${e}-drawer-mask`,this.showMask==="transparent"&&`${e}-drawer-mask--invisible`],onClick:this.handleMaskClick}):null}):null,c(wo,Object.assign({},this.$attrs,{class:[this.drawerClass,this.$attrs.class],style:[this.mergedBodyStyle,this.$attrs.style],blockScroll:this.blockScroll,contentStyle:this.contentStyle,contentClass:this.contentClass,placement:this.placement,scrollbarProps:this.scrollbarProps,show:this.show,displayDirective:this.displayDirective,nativeScrollbar:this.nativeScrollbar,onAfterEnter:this.onAfterEnter,onAfterLeave:this.onAfterLeave,trapFocus:this.trapFocus,autoFocus:this.autoFocus,resizable:this.resizable,maxHeight:this.maxHeight,minHeight:this.minHeight,maxWidth:this.maxWidth,minWidth:this.minWidth,showMask:this.showMask,onEsc:this.handleEsc,onClickoutside:this.handleOutsideClick}),this.$slots)),[[Je,{zIndex:this.zIndex,enabled:this.show}]])}})}}),Fo={title:String,headerClass:String,headerStyle:[Object,String],footerClass:String,footerStyle:[Object,String],bodyClass:String,bodyStyle:[Object,String],bodyContentClass:String,bodyContentStyle:[Object,String],nativeScrollbar:{type:Boolean,default:!0},scrollbarProps:Object,closable:Boolean},st=j({name:"DrawerContent",props:Fo,slots:Object,setup(){const e=U(Ce,null);e||lo("drawer-content","`n-drawer-content` must be placed inside `n-drawer`.");const{doUpdateShow:t}=e;function o(){t(!1)}return{handleCloseClick:o,mergedTheme:e.mergedThemeRef,mergedClsPrefix:e.mergedClsPrefixRef}},render(){const{title:e,mergedClsPrefix:t,nativeScrollbar:o,mergedTheme:d,bodyClass:a,bodyStyle:i,bodyContentClass:u,bodyContentStyle:h,headerClass:l,headerStyle:p,footerClass:A,footerStyle:P,scrollbarProps:g,closable:R,$slots:$}=this;return c("div",{role:"none",class:[`${t}-drawer-content`,o&&`${t}-drawer-content--native-scrollbar`]},$.header||e||R?c("div",{class:[`${t}-drawer-header`,l],style:p,role:"none"},c("div",{class:`${t}-drawer-header__main`,role:"heading","aria-level":"1"},$.header!==void 0?$.header():e),R&&c(io,{onClick:this.handleCloseClick,clsPrefix:t,class:`${t}-drawer-header__close`,absolute:!0})):null,o?c("div",{class:[`${t}-drawer-body`,a],style:i,role:"none"},c("div",{class:[`${t}-drawer-body-content-wrapper`,u],style:h,role:"none"},$)):c(Te,Object.assign({themeOverrides:d.peerOverrides.Scrollbar,theme:d.peers.Scrollbar},g,{class:`${t}-drawer-body`,contentClass:[`${t}-drawer-body-content-wrapper`,u],contentStyle:h}),$),$.footer?c("div",{class:[`${t}-drawer-footer`,A],style:P,role:"none"},$.footer()):null)}});function Mo(e){const{baseColor:t,textColor2:o,bodyColor:d,cardColor:a,dividerColor:i,actionColor:u,scrollbarColor:h,scrollbarColorHover:l,invertedColor:p}=e;return{textColor:o,textColorInverted:"#FFF",color:d,colorEmbedded:u,headerColor:a,headerColorInverted:p,footerColor:u,footerColorInverted:p,headerBorderColor:i,headerBorderColorInverted:p,footerBorderColor:i,footerBorderColorInverted:p,siderBorderColor:i,siderBorderColorInverted:p,siderColor:a,siderColorInverted:p,siderToggleButtonBorder:`1px solid ${i}`,siderToggleButtonColor:t,siderToggleButtonIconColor:o,siderToggleButtonIconColorInverted:o,siderToggleBarColor:He(d,h),siderToggleBarColorHover:He(d,l),__invertScrollbar:"true"}}const Lo=ao({name:"Layout",common:co,peers:{Scrollbar:so},self:Mo}),_o=ne("n-layout-sider"),jo={type:String,default:"static"},Do=m("layout-header",`
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 box-sizing: border-box;
 width: 100%;
 background-color: var(--n-color);
 color: var(--n-text-color);
`,[I("absolute-positioned",`
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 `),I("bordered",`
 border-bottom: solid 1px var(--n-border-color);
 `)]),Ko={position:jo,inverted:Boolean,bordered:{type:Boolean,default:!1}},ct=j({name:"LayoutHeader",props:Object.assign(Object.assign({},Y.props),Ko),setup(e){const{mergedClsPrefixRef:t,inlineThemeDisabled:o}=te(e),d=Y("Layout","-layout-header",Do,Lo,e,t),a=C(()=>{const{common:{cubicBezierEaseInOut:u},self:h}=d.value,l={"--n-bezier":u};return e.inverted?(l["--n-color"]=h.headerColorInverted,l["--n-text-color"]=h.textColorInverted,l["--n-border-color"]=h.headerBorderColorInverted):(l["--n-color"]=h.headerColor,l["--n-text-color"]=h.textColor,l["--n-border-color"]=h.headerBorderColor),l}),i=o?we("layout-header",C(()=>e.inverted?"a":"b"),a,e):void 0;return{mergedClsPrefix:t,cssVars:o?void 0:a,themeClass:i==null?void 0:i.themeClass,onRender:i==null?void 0:i.onRender}},render(){var e;const{mergedClsPrefix:t}=this;return(e=this.onRender)===null||e===void 0||e.call(this),c("div",{class:[`${t}-layout-header`,this.themeClass,this.position&&`${t}-layout-header--${this.position}-positioned`,this.bordered&&`${t}-layout-header--bordered`],style:this.cssVars},this.$slots)}}),Z=ne("n-menu"),Oe=ne("n-submenu"),Ie=ne("n-menu-item-group"),Ae=[s("&::before","background-color: var(--n-item-color-hover);"),b("arrow",`
 color: var(--n-arrow-color-hover);
 `),b("icon",`
 color: var(--n-item-icon-color-hover);
 `),m("menu-item-content-header",`
 color: var(--n-item-text-color-hover);
 `,[s("a",`
 color: var(--n-item-text-color-hover);
 `),b("extra",`
 color: var(--n-item-text-color-hover);
 `)])],ke=[b("icon",`
 color: var(--n-item-icon-color-hover-horizontal);
 `),m("menu-item-content-header",`
 color: var(--n-item-text-color-hover-horizontal);
 `,[s("a",`
 color: var(--n-item-text-color-hover-horizontal);
 `),b("extra",`
 color: var(--n-item-text-color-hover-horizontal);
 `)])],Uo=s([m("menu",`
 background-color: var(--n-color);
 color: var(--n-item-text-color);
 overflow: hidden;
 transition: background-color .3s var(--n-bezier);
 box-sizing: border-box;
 font-size: var(--n-font-size);
 padding-bottom: 6px;
 `,[I("horizontal",`
 max-width: 100%;
 width: 100%;
 display: flex;
 overflow: hidden;
 padding-bottom: 0;
 `,[m("submenu","margin: 0;"),m("menu-item","margin: 0;"),m("menu-item-content",`
 padding: 0 20px;
 border-bottom: 2px solid #0000;
 `,[s("&::before","display: none;"),I("selected","border-bottom: 2px solid var(--n-border-color-horizontal)")]),m("menu-item-content",[I("selected",[b("icon","color: var(--n-item-icon-color-active-horizontal);"),m("menu-item-content-header",`
 color: var(--n-item-text-color-active-horizontal);
 `,[s("a","color: var(--n-item-text-color-active-horizontal);"),b("extra","color: var(--n-item-text-color-active-horizontal);")])]),I("child-active",`
 border-bottom: 2px solid var(--n-border-color-horizontal);
 `,[m("menu-item-content-header",`
 color: var(--n-item-text-color-child-active-horizontal);
 `,[s("a",`
 color: var(--n-item-text-color-child-active-horizontal);
 `),b("extra",`
 color: var(--n-item-text-color-child-active-horizontal);
 `)]),b("icon",`
 color: var(--n-item-icon-color-child-active-horizontal);
 `)]),Q("disabled",[Q("selected, child-active",[s("&:focus-within",ke)]),I("selected",[G(null,[b("icon","color: var(--n-item-icon-color-active-hover-horizontal);"),m("menu-item-content-header",`
 color: var(--n-item-text-color-active-hover-horizontal);
 `,[s("a","color: var(--n-item-text-color-active-hover-horizontal);"),b("extra","color: var(--n-item-text-color-active-hover-horizontal);")])])]),I("child-active",[G(null,[b("icon","color: var(--n-item-icon-color-child-active-hover-horizontal);"),m("menu-item-content-header",`
 color: var(--n-item-text-color-child-active-hover-horizontal);
 `,[s("a","color: var(--n-item-text-color-child-active-hover-horizontal);"),b("extra","color: var(--n-item-text-color-child-active-hover-horizontal);")])])]),G("border-bottom: 2px solid var(--n-border-color-horizontal);",ke)]),m("menu-item-content-header",[s("a","color: var(--n-item-text-color-horizontal);")])])]),Q("responsive",[m("menu-item-content-header",`
 overflow: hidden;
 text-overflow: ellipsis;
 `)]),I("collapsed",[m("menu-item-content",[I("selected",[s("&::before",`
 background-color: var(--n-item-color-active-collapsed) !important;
 `)]),m("menu-item-content-header","opacity: 0;"),b("arrow","opacity: 0;"),b("icon","color: var(--n-item-icon-color-collapsed);")])]),m("menu-item",`
 height: var(--n-item-height);
 margin-top: 6px;
 position: relative;
 `),m("menu-item-content",`
 box-sizing: border-box;
 line-height: 1.75;
 height: 100%;
 display: grid;
 grid-template-areas: "icon content arrow";
 grid-template-columns: auto 1fr auto;
 align-items: center;
 cursor: pointer;
 position: relative;
 padding-right: 18px;
 transition:
 background-color .3s var(--n-bezier),
 padding-left .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 `,[s("> *","z-index: 1;"),s("&::before",`
 z-index: auto;
 content: "";
 background-color: #0000;
 position: absolute;
 left: 8px;
 right: 8px;
 top: 0;
 bottom: 0;
 pointer-events: none;
 border-radius: var(--n-border-radius);
 transition: background-color .3s var(--n-bezier);
 `),I("disabled",`
 opacity: .45;
 cursor: not-allowed;
 `),I("collapsed",[b("arrow","transform: rotate(0);")]),I("selected",[s("&::before","background-color: var(--n-item-color-active);"),b("arrow","color: var(--n-arrow-color-active);"),b("icon","color: var(--n-item-icon-color-active);"),m("menu-item-content-header",`
 color: var(--n-item-text-color-active);
 `,[s("a","color: var(--n-item-text-color-active);"),b("extra","color: var(--n-item-text-color-active);")])]),I("child-active",[m("menu-item-content-header",`
 color: var(--n-item-text-color-child-active);
 `,[s("a",`
 color: var(--n-item-text-color-child-active);
 `),b("extra",`
 color: var(--n-item-text-color-child-active);
 `)]),b("arrow",`
 color: var(--n-arrow-color-child-active);
 `),b("icon",`
 color: var(--n-item-icon-color-child-active);
 `)]),Q("disabled",[Q("selected, child-active",[s("&:focus-within",Ae)]),I("selected",[G(null,[b("arrow","color: var(--n-arrow-color-active-hover);"),b("icon","color: var(--n-item-icon-color-active-hover);"),m("menu-item-content-header",`
 color: var(--n-item-text-color-active-hover);
 `,[s("a","color: var(--n-item-text-color-active-hover);"),b("extra","color: var(--n-item-text-color-active-hover);")])])]),I("child-active",[G(null,[b("arrow","color: var(--n-arrow-color-child-active-hover);"),b("icon","color: var(--n-item-icon-color-child-active-hover);"),m("menu-item-content-header",`
 color: var(--n-item-text-color-child-active-hover);
 `,[s("a","color: var(--n-item-text-color-child-active-hover);"),b("extra","color: var(--n-item-text-color-child-active-hover);")])])]),I("selected",[G(null,[s("&::before","background-color: var(--n-item-color-active-hover);")])]),G(null,Ae)]),b("icon",`
 grid-area: icon;
 color: var(--n-item-icon-color);
 transition:
 color .3s var(--n-bezier),
 font-size .3s var(--n-bezier),
 margin-right .3s var(--n-bezier);
 box-sizing: content-box;
 display: inline-flex;
 align-items: center;
 justify-content: center;
 `),b("arrow",`
 grid-area: arrow;
 font-size: 16px;
 color: var(--n-arrow-color);
 transform: rotate(180deg);
 opacity: 1;
 transition:
 color .3s var(--n-bezier),
 transform 0.2s var(--n-bezier),
 opacity 0.2s var(--n-bezier);
 `),m("menu-item-content-header",`
 grid-area: content;
 transition:
 color .3s var(--n-bezier),
 opacity .3s var(--n-bezier);
 opacity: 1;
 white-space: nowrap;
 color: var(--n-item-text-color);
 `,[s("a",`
 outline: none;
 text-decoration: none;
 transition: color .3s var(--n-bezier);
 color: var(--n-item-text-color);
 `,[s("&::before",`
 content: "";
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 `)]),b("extra",`
 font-size: .93em;
 color: var(--n-group-text-color);
 transition: color .3s var(--n-bezier);
 `)])]),m("submenu",`
 cursor: pointer;
 position: relative;
 margin-top: 6px;
 `,[m("menu-item-content",`
 height: var(--n-item-height);
 `),m("submenu-children",`
 overflow: hidden;
 padding: 0;
 `,[uo({duration:".2s"})])]),m("menu-item-group",[m("menu-item-group-title",`
 margin-top: 6px;
 color: var(--n-group-text-color);
 cursor: default;
 font-size: .93em;
 height: 36px;
 display: flex;
 align-items: center;
 transition:
 padding-left .3s var(--n-bezier),
 color .3s var(--n-bezier);
 `)])]),m("menu-tooltip",[s("a",`
 color: inherit;
 text-decoration: none;
 `)]),m("menu-divider",`
 transition: background-color .3s var(--n-bezier);
 background-color: var(--n-divider-color);
 height: 1px;
 margin: 6px 18px;
 `)]);function G(e,t){return[I("hover",e,t),s("&:hover",e,t)]}const Fe=j({name:"MenuOptionContent",props:{collapsed:Boolean,disabled:Boolean,title:[String,Function],icon:Function,extra:[String,Function],showArrow:Boolean,childActive:Boolean,hover:Boolean,paddingLeft:Number,selected:Boolean,maxIconSize:{type:Number,required:!0},activeIconSize:{type:Number,required:!0},iconMarginRight:{type:Number,required:!0},clsPrefix:{type:String,required:!0},onClick:Function,tmNode:{type:Object,required:!0},isEllipsisPlaceholder:Boolean},setup(e){const{props:t}=U(Z);return{menuProps:t,style:C(()=>{const{paddingLeft:o}=e;return{paddingLeft:o&&`${o}px`}}),iconStyle:C(()=>{const{maxIconSize:o,activeIconSize:d,iconMarginRight:a}=e;return{width:`${o}px`,height:`${o}px`,fontSize:`${d}px`,marginRight:`${a}px`}})}},render(){const{clsPrefix:e,tmNode:t,menuProps:{renderIcon:o,renderLabel:d,renderExtra:a,expandIcon:i}}=this,u=o?o(t.rawNode):X(this.icon);return c("div",{onClick:h=>{var l;(l=this.onClick)===null||l===void 0||l.call(this,h)},role:"none",class:[`${e}-menu-item-content`,{[`${e}-menu-item-content--selected`]:this.selected,[`${e}-menu-item-content--collapsed`]:this.collapsed,[`${e}-menu-item-content--child-active`]:this.childActive,[`${e}-menu-item-content--disabled`]:this.disabled,[`${e}-menu-item-content--hover`]:this.hover}],style:this.style},u&&c("div",{class:`${e}-menu-item-content__icon`,style:this.iconStyle,role:"none"},[u]),c("div",{class:`${e}-menu-item-content-header`,role:"none"},this.isEllipsisPlaceholder?this.title:d?d(t.rawNode):X(this.title),this.extra||a?c("span",{class:`${e}-menu-item-content-header__extra`}," ",a?a(t.rawNode):X(this.extra)):null),this.showArrow?c(vo,{ariaHidden:!0,class:`${e}-menu-item-content__arrow`,clsPrefix:e},{default:()=>i?i(t.rawNode):c(Co,null)}):null)}}),J=8;function Se(e){const t=U(Z),{props:o,mergedCollapsedRef:d}=t,a=U(Oe,null),i=U(Ie,null),u=C(()=>o.mode==="horizontal"),h=C(()=>u.value?o.dropdownPlacement:"tmNodes"in e?"right-start":"right"),l=C(()=>{var g;return Math.max((g=o.collapsedIconSize)!==null&&g!==void 0?g:o.iconSize,o.iconSize)}),p=C(()=>{var g;return!u.value&&e.root&&d.value&&(g=o.collapsedIconSize)!==null&&g!==void 0?g:o.iconSize}),A=C(()=>{if(u.value)return;const{collapsedWidth:g,indent:R,rootIndent:$}=o,{root:k,isGroup:O}=e,M=$===void 0?R:$;return k?d.value?g/2-l.value/2:M:i&&typeof i.paddingLeftRef.value=="number"?R/2+i.paddingLeftRef.value:a&&typeof a.paddingLeftRef.value=="number"?(O?R/2:R)+a.paddingLeftRef.value:0}),P=C(()=>{const{collapsedWidth:g,indent:R,rootIndent:$}=o,{value:k}=l,{root:O}=e;return u.value||!O||!d.value?J:($===void 0?R:$)+k+J-(g+k)/2});return{dropdownPlacement:h,activeIconSize:p,maxIconSize:l,paddingLeft:A,iconMarginRight:P,NMenu:t,NSubmenu:a,NMenuOptionGroup:i}}const Re={internalKey:{type:[String,Number],required:!0},root:Boolean,isGroup:Boolean,level:{type:Number,required:!0},title:[String,Function],extra:[String,Function]},Vo=j({name:"MenuDivider",setup(){const e=U(Z),{mergedClsPrefixRef:t,isHorizontalRef:o}=e;return()=>o.value?null:c("div",{class:`${t.value}-menu-divider`})}}),Me=Object.assign(Object.assign({},Re),{tmNode:{type:Object,required:!0},disabled:Boolean,icon:Function,onClick:Function}),Wo=ze(Me),Go=j({name:"MenuOption",props:Me,setup(e){const t=Se(e),{NSubmenu:o,NMenu:d,NMenuOptionGroup:a}=t,{props:i,mergedClsPrefixRef:u,mergedCollapsedRef:h}=d,l=o?o.mergedDisabledRef:a?a.mergedDisabledRef:{value:!1},p=C(()=>l.value||e.disabled);function A(g){const{onClick:R}=e;R&&R(g)}function P(g){p.value||(d.doSelect(e.internalKey,e.tmNode.rawNode),A(g))}return{mergedClsPrefix:u,dropdownPlacement:t.dropdownPlacement,paddingLeft:t.paddingLeft,iconMarginRight:t.iconMarginRight,maxIconSize:t.maxIconSize,activeIconSize:t.activeIconSize,mergedTheme:d.mergedThemeRef,menuProps:i,dropdownEnabled:be(()=>e.root&&h.value&&i.mode!=="horizontal"&&!p.value),selected:be(()=>d.mergedValueRef.value===e.internalKey),mergedDisabled:p,handleClick:P}},render(){const{mergedClsPrefix:e,mergedTheme:t,tmNode:o,menuProps:{renderLabel:d,nodeProps:a}}=this,i=a==null?void 0:a(o.rawNode);return c("div",Object.assign({},i,{role:"menuitem",class:[`${e}-menu-item`,i==null?void 0:i.class]}),c(po,{theme:t.peers.Tooltip,themeOverrides:t.peerOverrides.Tooltip,trigger:"hover",placement:this.dropdownPlacement,disabled:!this.dropdownEnabled||this.title===void 0,internalExtraClass:["menu-tooltip"]},{default:()=>d?d(o.rawNode):X(this.title),trigger:()=>c(Fe,{tmNode:o,clsPrefix:e,paddingLeft:this.paddingLeft,iconMarginRight:this.iconMarginRight,maxIconSize:this.maxIconSize,activeIconSize:this.activeIconSize,selected:this.selected,title:this.title,extra:this.extra,disabled:this.mergedDisabled,icon:this.icon,onClick:this.handleClick})}))}}),Le=Object.assign(Object.assign({},Re),{tmNode:{type:Object,required:!0},tmNodes:{type:Array,required:!0}}),qo=ze(Le),Xo=j({name:"MenuOptionGroup",props:Le,setup(e){const t=Se(e),{NSubmenu:o}=t,d=C(()=>o!=null&&o.mergedDisabledRef.value?!0:e.tmNode.disabled);V(Ie,{paddingLeftRef:t.paddingLeft,mergedDisabledRef:d});const{mergedClsPrefixRef:a,props:i}=U(Z);return function(){const{value:u}=a,h=t.paddingLeft.value,{nodeProps:l}=i,p=l==null?void 0:l(e.tmNode.rawNode);return c("div",{class:`${u}-menu-item-group`,role:"group"},c("div",Object.assign({},p,{class:[`${u}-menu-item-group-title`,p==null?void 0:p.class],style:[(p==null?void 0:p.style)||"",h!==void 0?`padding-left: ${h}px;`:""]}),X(e.title),e.extra?c(Ue,null," ",X(e.extra)):null),c("div",null,e.tmNodes.map(A=>$e(A,i))))}}});function xe(e){return e.type==="divider"||e.type==="render"}function Yo(e){return e.type==="divider"}function $e(e,t){const{rawNode:o}=e,{show:d}=o;if(d===!1)return null;if(xe(o))return Yo(o)?c(Vo,Object.assign({key:e.key},o.props)):null;const{labelField:a}=t,{key:i,level:u,isGroup:h}=e,l=Object.assign(Object.assign({},o),{title:o.title||o[a],extra:o.titleExtra||o.extra,key:i,internalKey:i,level:u,root:u===0,isGroup:h});return e.children?e.isGroup?c(Xo,me(l,qo,{tmNode:e,tmNodes:e.children,key:i})):c(ye,me(l,Qo,{key:i,rawNodes:o[t.childrenField],tmNodes:e.children,tmNode:e})):c(Go,me(l,Wo,{key:i,tmNode:e}))}const _e=Object.assign(Object.assign({},Re),{rawNodes:{type:Array,default:()=>[]},tmNodes:{type:Array,default:()=>[]},tmNode:{type:Object,required:!0},disabled:Boolean,icon:Function,onClick:Function,domId:String,virtualChildActive:{type:Boolean,default:void 0},isEllipsisPlaceholder:Boolean}),Qo=ze(_e),ye=j({name:"Submenu",props:_e,setup(e){const t=Se(e),{NMenu:o,NSubmenu:d}=t,{props:a,mergedCollapsedRef:i,mergedThemeRef:u}=o,h=C(()=>{const{disabled:g}=e;return d!=null&&d.mergedDisabledRef.value||a.disabled?!0:g}),l=L(!1);V(Oe,{paddingLeftRef:t.paddingLeft,mergedDisabledRef:h}),V(Ie,null);function p(){const{onClick:g}=e;g&&g()}function A(){h.value||(i.value||o.toggleExpand(e.internalKey),p())}function P(g){l.value=g}return{menuProps:a,mergedTheme:u,doSelect:o.doSelect,inverted:o.invertedRef,isHorizontal:o.isHorizontalRef,mergedClsPrefix:o.mergedClsPrefixRef,maxIconSize:t.maxIconSize,activeIconSize:t.activeIconSize,iconMarginRight:t.iconMarginRight,dropdownPlacement:t.dropdownPlacement,dropdownShow:l,paddingLeft:t.paddingLeft,mergedDisabled:h,mergedValue:o.mergedValueRef,childActive:be(()=>{var g;return(g=e.virtualChildActive)!==null&&g!==void 0?g:o.activePathRef.value.includes(e.internalKey)}),collapsed:C(()=>a.mode==="horizontal"?!1:i.value?!0:!o.mergedExpandedKeysRef.value.includes(e.internalKey)),dropdownEnabled:C(()=>!h.value&&(a.mode==="horizontal"||i.value)),handlePopoverShowChange:P,handleClick:A}},render(){var e;const{mergedClsPrefix:t,menuProps:{renderIcon:o,renderLabel:d}}=this,a=()=>{const{isHorizontal:u,paddingLeft:h,collapsed:l,mergedDisabled:p,maxIconSize:A,activeIconSize:P,title:g,childActive:R,icon:$,handleClick:k,menuProps:{nodeProps:O},dropdownShow:M,iconMarginRight:W,tmNode:_,mergedClsPrefix:D,isEllipsisPlaceholder:F,extra:x}=this,w=O==null?void 0:O(_.rawNode);return c("div",Object.assign({},w,{class:[`${D}-menu-item`,w==null?void 0:w.class],role:"menuitem"}),c(Fe,{tmNode:_,paddingLeft:h,collapsed:l,disabled:p,iconMarginRight:W,maxIconSize:A,activeIconSize:P,title:g,extra:x,showArrow:!u,childActive:R,clsPrefix:D,icon:$,hover:M,onClick:k,isEllipsisPlaceholder:F}))},i=()=>c(ho,null,{default:()=>{const{tmNodes:u,collapsed:h}=this;return h?null:c("div",{class:`${t}-submenu-children`,role:"menu"},u.map(l=>$e(l,this.menuProps)))}});return this.root?c(bo,Object.assign({size:"large",trigger:"hover"},(e=this.menuProps)===null||e===void 0?void 0:e.dropdownProps,{themeOverrides:this.mergedTheme.peerOverrides.Dropdown,theme:this.mergedTheme.peers.Dropdown,builtinThemeOverrides:{fontSizeLarge:"14px",optionIconSizeLarge:"18px"},value:this.mergedValue,disabled:!this.dropdownEnabled,placement:this.dropdownPlacement,keyField:this.menuProps.keyField,labelField:this.menuProps.labelField,childrenField:this.menuProps.childrenField,onUpdateShow:this.handlePopoverShowChange,options:this.rawNodes,onSelect:this.doSelect,inverted:this.inverted,renderIcon:o,renderLabel:d}),{default:()=>c("div",{class:`${t}-submenu`,role:"menu","aria-expanded":!this.collapsed,id:this.domId},a(),this.isHorizontal?null:i())}):c("div",{class:`${t}-submenu`,role:"menu","aria-expanded":!this.collapsed,id:this.domId},a(),i())}}),Zo=Object.assign(Object.assign({},Y.props),{options:{type:Array,default:()=>[]},collapsed:{type:Boolean,default:void 0},collapsedWidth:{type:Number,default:48},iconSize:{type:Number,default:20},collapsedIconSize:{type:Number,default:24},rootIndent:Number,indent:{type:Number,default:32},labelField:{type:String,default:"label"},keyField:{type:String,default:"key"},childrenField:{type:String,default:"children"},disabledField:{type:String,default:"disabled"},defaultExpandAll:Boolean,defaultExpandedKeys:Array,expandedKeys:Array,value:[String,Number],defaultValue:{type:[String,Number],default:null},mode:{type:String,default:"vertical"},watchProps:{type:Array,default:void 0},disabled:Boolean,show:{type:Boolean,default:!0},inverted:Boolean,"onUpdate:expandedKeys":[Function,Array],onUpdateExpandedKeys:[Function,Array],onUpdateValue:[Function,Array],"onUpdate:value":[Function,Array],expandIcon:Function,renderIcon:Function,renderLabel:Function,renderExtra:Function,dropdownProps:Object,accordion:Boolean,nodeProps:Function,dropdownPlacement:{type:String,default:"bottom"},responsive:Boolean,items:Array,onOpenNamesChange:[Function,Array],onSelect:[Function,Array],onExpandedNamesChange:[Function,Array],expandedNames:Array,defaultExpandedNames:Array}),dt=j({name:"Menu",inheritAttrs:!1,props:Zo,setup(e){const{mergedClsPrefixRef:t,inlineThemeDisabled:o}=te(e),d=Y("Menu","-menu",Uo,fo,e,t),a=U(_o,null),i=C(()=>{var v;const{collapsed:y}=e;if(y!==void 0)return y;if(a){const{collapseModeRef:r,collapsedRef:f}=a;if(r.value==="width")return(v=f.value)!==null&&v!==void 0?v:!1}return!1}),u=C(()=>{const{keyField:v,childrenField:y,disabledField:r}=e;return fe(e.items||e.options,{getIgnored(f){return xe(f)},getChildren(f){return f[y]},getDisabled(f){return f[r]},getKey(f){var S;return(S=f[v])!==null&&S!==void 0?S:f.name}})}),h=C(()=>new Set(u.value.treeNodes.map(v=>v.key))),{watchProps:l}=e,p=L(null);l!=null&&l.includes("defaultValue")?pe(()=>{p.value=e.defaultValue}):p.value=e.defaultValue;const A=ee(e,"value"),P=oe(A,p),g=L([]),R=()=>{g.value=e.defaultExpandAll?u.value.getNonLeafKeys():e.defaultExpandedNames||e.defaultExpandedKeys||u.value.getPath(P.value,{includeSelf:!1}).keyPath};l!=null&&l.includes("defaultExpandedKeys")?pe(R):R();const $=xo(e,["expandedNames","expandedKeys"]),k=oe($,g),O=C(()=>u.value.treeNodes),M=C(()=>u.value.getPath(P.value).keyPath);V(Z,{props:e,mergedCollapsedRef:i,mergedThemeRef:d,mergedValueRef:P,mergedExpandedKeysRef:k,activePathRef:M,mergedClsPrefixRef:t,isHorizontalRef:C(()=>e.mode==="horizontal"),invertedRef:ee(e,"inverted"),doSelect:W,toggleExpand:D});function W(v,y){const{"onUpdate:value":r,onUpdateValue:f,onSelect:S}=e;f&&T(f,v,y),r&&T(r,v,y),S&&T(S,v,y),p.value=v}function _(v){const{"onUpdate:expandedKeys":y,onUpdateExpandedKeys:r,onExpandedNamesChange:f,onOpenNamesChange:S}=e;y&&T(y,v),r&&T(r,v),f&&T(f,v),S&&T(S,v),g.value=v}function D(v){const y=Array.from(k.value),r=y.findIndex(f=>f===v);if(~r)y.splice(r,1);else{if(e.accordion&&h.value.has(v)){const f=y.findIndex(S=>h.value.has(S));f>-1&&y.splice(f,1)}y.push(v)}_(y)}const F=v=>{const y=u.value.getPath(v!=null?v:P.value,{includeSelf:!1}).keyPath;if(!y.length)return;const r=Array.from(k.value),f=new Set([...r,...y]);e.accordion&&h.value.forEach(S=>{f.has(S)&&!y.includes(S)&&f.delete(S)}),_(Array.from(f))},x=C(()=>{const{inverted:v}=e,{common:{cubicBezierEaseInOut:y},self:r}=d.value,{borderRadius:f,borderColorHorizontal:S,fontSize:ue,itemHeight:ve,dividerColor:he}=r,n={"--n-divider-color":he,"--n-bezier":y,"--n-font-size":ue,"--n-border-color-horizontal":S,"--n-border-radius":f,"--n-item-height":ve};return v?(n["--n-group-text-color"]=r.groupTextColorInverted,n["--n-color"]=r.colorInverted,n["--n-item-text-color"]=r.itemTextColorInverted,n["--n-item-text-color-hover"]=r.itemTextColorHoverInverted,n["--n-item-text-color-active"]=r.itemTextColorActiveInverted,n["--n-item-text-color-child-active"]=r.itemTextColorChildActiveInverted,n["--n-item-text-color-child-active-hover"]=r.itemTextColorChildActiveInverted,n["--n-item-text-color-active-hover"]=r.itemTextColorActiveHoverInverted,n["--n-item-icon-color"]=r.itemIconColorInverted,n["--n-item-icon-color-hover"]=r.itemIconColorHoverInverted,n["--n-item-icon-color-active"]=r.itemIconColorActiveInverted,n["--n-item-icon-color-active-hover"]=r.itemIconColorActiveHoverInverted,n["--n-item-icon-color-child-active"]=r.itemIconColorChildActiveInverted,n["--n-item-icon-color-child-active-hover"]=r.itemIconColorChildActiveHoverInverted,n["--n-item-icon-color-collapsed"]=r.itemIconColorCollapsedInverted,n["--n-item-text-color-horizontal"]=r.itemTextColorHorizontalInverted,n["--n-item-text-color-hover-horizontal"]=r.itemTextColorHoverHorizontalInverted,n["--n-item-text-color-active-horizontal"]=r.itemTextColorActiveHorizontalInverted,n["--n-item-text-color-child-active-horizontal"]=r.itemTextColorChildActiveHorizontalInverted,n["--n-item-text-color-child-active-hover-horizontal"]=r.itemTextColorChildActiveHoverHorizontalInverted,n["--n-item-text-color-active-hover-horizontal"]=r.itemTextColorActiveHoverHorizontalInverted,n["--n-item-icon-color-horizontal"]=r.itemIconColorHorizontalInverted,n["--n-item-icon-color-hover-horizontal"]=r.itemIconColorHoverHorizontalInverted,n["--n-item-icon-color-active-horizontal"]=r.itemIconColorActiveHorizontalInverted,n["--n-item-icon-color-active-hover-horizontal"]=r.itemIconColorActiveHoverHorizontalInverted,n["--n-item-icon-color-child-active-horizontal"]=r.itemIconColorChildActiveHorizontalInverted,n["--n-item-icon-color-child-active-hover-horizontal"]=r.itemIconColorChildActiveHoverHorizontalInverted,n["--n-arrow-color"]=r.arrowColorInverted,n["--n-arrow-color-hover"]=r.arrowColorHoverInverted,n["--n-arrow-color-active"]=r.arrowColorActiveInverted,n["--n-arrow-color-active-hover"]=r.arrowColorActiveHoverInverted,n["--n-arrow-color-child-active"]=r.arrowColorChildActiveInverted,n["--n-arrow-color-child-active-hover"]=r.arrowColorChildActiveHoverInverted,n["--n-item-color-hover"]=r.itemColorHoverInverted,n["--n-item-color-active"]=r.itemColorActiveInverted,n["--n-item-color-active-hover"]=r.itemColorActiveHoverInverted,n["--n-item-color-active-collapsed"]=r.itemColorActiveCollapsedInverted):(n["--n-group-text-color"]=r.groupTextColor,n["--n-color"]=r.color,n["--n-item-text-color"]=r.itemTextColor,n["--n-item-text-color-hover"]=r.itemTextColorHover,n["--n-item-text-color-active"]=r.itemTextColorActive,n["--n-item-text-color-child-active"]=r.itemTextColorChildActive,n["--n-item-text-color-child-active-hover"]=r.itemTextColorChildActiveHover,n["--n-item-text-color-active-hover"]=r.itemTextColorActiveHover,n["--n-item-icon-color"]=r.itemIconColor,n["--n-item-icon-color-hover"]=r.itemIconColorHover,n["--n-item-icon-color-active"]=r.itemIconColorActive,n["--n-item-icon-color-active-hover"]=r.itemIconColorActiveHover,n["--n-item-icon-color-child-active"]=r.itemIconColorChildActive,n["--n-item-icon-color-child-active-hover"]=r.itemIconColorChildActiveHover,n["--n-item-icon-color-collapsed"]=r.itemIconColorCollapsed,n["--n-item-text-color-horizontal"]=r.itemTextColorHorizontal,n["--n-item-text-color-hover-horizontal"]=r.itemTextColorHoverHorizontal,n["--n-item-text-color-active-horizontal"]=r.itemTextColorActiveHorizontal,n["--n-item-text-color-child-active-horizontal"]=r.itemTextColorChildActiveHorizontal,n["--n-item-text-color-child-active-hover-horizontal"]=r.itemTextColorChildActiveHoverHorizontal,n["--n-item-text-color-active-hover-horizontal"]=r.itemTextColorActiveHoverHorizontal,n["--n-item-icon-color-horizontal"]=r.itemIconColorHorizontal,n["--n-item-icon-color-hover-horizontal"]=r.itemIconColorHoverHorizontal,n["--n-item-icon-color-active-horizontal"]=r.itemIconColorActiveHorizontal,n["--n-item-icon-color-active-hover-horizontal"]=r.itemIconColorActiveHoverHorizontal,n["--n-item-icon-color-child-active-horizontal"]=r.itemIconColorChildActiveHorizontal,n["--n-item-icon-color-child-active-hover-horizontal"]=r.itemIconColorChildActiveHoverHorizontal,n["--n-arrow-color"]=r.arrowColor,n["--n-arrow-color-hover"]=r.arrowColorHover,n["--n-arrow-color-active"]=r.arrowColorActive,n["--n-arrow-color-active-hover"]=r.arrowColorActiveHover,n["--n-arrow-color-child-active"]=r.arrowColorChildActive,n["--n-arrow-color-child-active-hover"]=r.arrowColorChildActiveHover,n["--n-item-color-hover"]=r.itemColorHover,n["--n-item-color-active"]=r.itemColorActive,n["--n-item-color-active-hover"]=r.itemColorActiveHover,n["--n-item-color-active-collapsed"]=r.itemColorActiveCollapsed),n}),w=o?we("menu",C(()=>e.inverted?"a":"b"),x,e):void 0,N=go(),z=L(null),H=L(null);let B=!0;const E=()=>{var v;B?B=!1:(v=z.value)===null||v===void 0||v.sync({showAllItemsBeforeCalculate:!0})};function K(){return document.getElementById(N)}const q=L(-1);function ie(v){q.value=e.options.length-v}function le(v){v||(q.value=-1)}const ae=C(()=>{const v=q.value;return{children:v===-1?[]:e.options.slice(v)}}),se=C(()=>{const{childrenField:v,disabledField:y,keyField:r}=e;return fe([ae.value],{getIgnored(f){return xe(f)},getChildren(f){return f[v]},getDisabled(f){return f[y]},getKey(f){var S;return(S=f[r])!==null&&S!==void 0?S:f.name}})}),ce=C(()=>fe([{}]).treeNodes[0]);function de(){var v;if(q.value===-1)return c(ye,{root:!0,level:0,key:"__ellpisisGroupPlaceholder__",internalKey:"__ellpisisGroupPlaceholder__",title:"···",tmNode:ce.value,domId:N,isEllipsisPlaceholder:!0});const y=se.value.treeNodes[0],r=M.value,f=!!(!((v=y.children)===null||v===void 0)&&v.some(S=>r.includes(S.key)));return c(ye,{level:0,root:!0,key:"__ellpisisGroup__",internalKey:"__ellpisisGroup__",title:"···",virtualChildActive:f,tmNode:y,domId:N,rawNodes:y.rawNode.children||[],tmNodes:y.children||[],isEllipsisPlaceholder:!0})}return{mergedClsPrefix:t,controlledExpandedKeys:$,uncontrolledExpanededKeys:g,mergedExpandedKeys:k,uncontrolledValue:p,mergedValue:P,activePath:M,tmNodes:O,mergedTheme:d,mergedCollapsed:i,cssVars:o?void 0:x,themeClass:w==null?void 0:w.themeClass,overflowRef:z,counterRef:H,updateCounter:()=>{},onResize:E,onUpdateOverflow:le,onUpdateCount:ie,renderCounter:de,getCounter:K,onRender:w==null?void 0:w.onRender,showOption:F,deriveResponsiveState:E}},render(){const{mergedClsPrefix:e,mode:t,themeClass:o,onRender:d}=this;d==null||d();const a=()=>this.tmNodes.map(l=>$e(l,this.$props)),u=t==="horizontal"&&this.responsive,h=()=>c("div",Ee(this.$attrs,{role:t==="horizontal"?"menubar":"menu",class:[`${e}-menu`,o,`${e}-menu--${t}`,u&&`${e}-menu--responsive`,this.mergedCollapsed&&`${e}-menu--collapsed`],style:this.cssVars}),u?c(yo,{ref:"overflowRef",onUpdateOverflow:this.onUpdateOverflow,getCounter:this.getCounter,onUpdateCount:this.onUpdateCount,updateCounter:this.updateCounter,style:{width:"100%",display:"flex",overflow:"hidden"}},{default:a,counter:this.renderCounter}):a());return u?c(mo,{onResize:this.onResize},{default:h}):h()}}),ut="data:image/svg+xml,%3csvg%20width='100'%20height='100'%20viewBox='0%200%20100%20100'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3clinearGradient%20id='ls-grad'%20x1='0%25'%20y1='0%25'%20x2='100%25'%20y2='100%25'%3e%3cstop%20offset='0%25'%20stop-color='%236366f1'%20/%3e%3cstop%20offset='100%25'%20stop-color='%23a855f7'%20/%3e%3c/linearGradient%3e%3cfilter%20id='glow'%20x='-20%25'%20y='-20%25'%20width='140%25'%20height='140%25'%3e%3cfeGaussianBlur%20stdDeviation='2'%20result='blur'%20/%3e%3cfeComposite%20in='SourceGraphic'%20in2='blur'%20operator='over'%20/%3e%3c/filter%3e%3c/defs%3e%3c!--%20Sphere%20Base%20--%3e%3ccircle%20cx='50'%20cy='50'%20r='45'%20stroke='url(%23ls-grad)'%20stroke-width='1'%20opacity='0.3'%20/%3e%3c!--%20Neural%20Pattern%20Lines%20--%3e%3cpath%20d='M50%205%20Q70%205%2085%2020%20Q95%2035%2095%2050%20Q95%2065%2085%2080%20Q70%2095%2050%2095%20Q30%2095%2015%2080%20Q5%2065%205%2050%20Q5%2035%2015%2020%20Q30%205%2050%205Z'%20stroke='url(%23ls-grad)'%20stroke-width='0.5'%20opacity='0.5'%20/%3e%3cellipse%20cx='50'%20cy='50'%20rx='42'%20ry='15'%20stroke='url(%23ls-grad)'%20stroke-width='1'%20transform='rotate(45%2050%2050)'%20opacity='0.6'%20/%3e%3cellipse%20cx='50'%20cy='50'%20rx='42'%20ry='15'%20stroke='url(%23ls-grad)'%20stroke-width='1'%20transform='rotate(-45%2050%2050)'%20opacity='0.6'%20/%3e%3c!--%20Central%20L%20S%20Mark%20--%3e%3cpath%20d='M40%2035%20V65%20H55'%20stroke='white'%20stroke-width='6'%20stroke-linecap='round'%20stroke-linejoin='round'%20filter='url(%23glow)'%20/%3e%3cpath%20d='M62%2038%20C62%2038%2052%2038%2052%2048%20C52%2058%2062%2058%2062%2068%20C62%2078%2052%2078%2052%2078'%20stroke='white'%20stroke-width='6'%20stroke-linecap='round'%20filter='url(%23glow)'%20/%3e%3c!--%20Connection%20Points%20--%3e%3ccircle%20cx='50'%20cy='5'%20r='2'%20fill='%23ef4444'%20/%3e%3ccircle%20cx='95'%20cy='50'%20r='2'%20fill='%2310b981'%20/%3e%3ccircle%20cx='5'%20cy='50'%20r='2'%20fill='%236366f1'%20/%3e%3ccircle%20cx='50'%20cy='95'%20r='2'%20fill='%23f59e0b'%20/%3e%3c/svg%3e";export{dt as N,ut as _,Lo as a,at as b,st as c,ct as d,_o as l,jo as p};
