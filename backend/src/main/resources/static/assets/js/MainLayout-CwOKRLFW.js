import{l as me,p as ve,a as fe,_ as Z,N as G,b as be,c as he,d as ye}from"./logo-DSm5iOO6.js";import{d as X,h as t,a as xe,r as U,u as J,c as n,y as ke,W as de,o as ce,Q as S,X as H,f as u,P as p,Y as r,M as a,q as ee,Z as k,J as oe,a3 as Ce,b as we,N as _e,O as q,a1 as O,a0 as Se,a4 as f}from"./vue-core-Qok9l9dg.js";import{e as y,f as M,g as b,h as A,i as Te,S as ze,j as W,k as Be,l as Le,m as te,n as Ne,o as D,N as V,u as Me,B as Pe}from"./index-DWq0_FoP.js";import{u as Re}from"./useVipPermission-D58m0Ahc.js";import{_ as ge}from"./_plugin-vue_export-helper-DlAUqK2U.js";import{N as ae}from"./Tag-Bz8Q9YAP.js";import{N as re}from"./Popover-BBNE_ZHP.js";import{N as le}from"./Progress-CjIm-v4S.js";import{d as $e}from"./utils-xYuYZ4Xr.js";import{l as Ie,N as se,a as Ee}from"./LayoutContent-CeIBkQa1.js";import{C as Oe}from"./ChevronRight-DlUkawXd.js";import{u as Ve}from"./use-merged-state-3vwOMuut.js";import{a as Ue,b as ne,U as Q,H as je,c as F,d as qe,e as Ae,f as K,g as ie,h as He,F as Ye,i as De,j as Fe}from"./icons-FSQdP13O.js";import{N as We}from"./Dropdown-B2MPsAPW.js";import{N as Qe}from"./Avatar-B6D6ke41.js";import"./Tooltip-BxzNnQFo.js";import"./index-BWJJgTLr.js";import"./cssr-CRQrCRnn.js";import"./vendor-CcVv25CF.js";import"./use-compitable-CoNRZgmE.js";import"./create-D3Vn69pI.js";import"./next-frame-once-C5Ksf8W7.js";import"./create-ref-setter-C4J8sofl.js";const Ke=y("layout-sider",`
 flex-shrink: 0;
 box-sizing: border-box;
 position: relative;
 z-index: 1;
 color: var(--n-text-color);
 transition:
 color .3s var(--n-bezier),
 border-color .3s var(--n-bezier),
 min-width .3s var(--n-bezier),
 max-width .3s var(--n-bezier),
 transform .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 background-color: var(--n-color);
 display: flex;
 justify-content: flex-end;
`,[M("bordered",[b("border",`
 content: "";
 position: absolute;
 top: 0;
 bottom: 0;
 width: 1px;
 background-color: var(--n-border-color);
 transition: background-color .3s var(--n-bezier);
 `)]),b("left-placement",[M("bordered",[b("border",`
 right: 0;
 `)])]),M("right-placement",`
 justify-content: flex-start;
 `,[M("bordered",[b("border",`
 left: 0;
 `)]),M("collapsed",[y("layout-toggle-button",[y("base-icon",`
 transform: rotate(180deg);
 `)]),y("layout-toggle-bar",[A("&:hover",[b("top",{transform:"rotate(-12deg) scale(1.15) translateY(-2px)"}),b("bottom",{transform:"rotate(12deg) scale(1.15) translateY(2px)"})])])]),y("layout-toggle-button",`
 left: 0;
 transform: translateX(-50%) translateY(-50%);
 `,[y("base-icon",`
 transform: rotate(0);
 `)]),y("layout-toggle-bar",`
 left: -28px;
 transform: rotate(180deg);
 `,[A("&:hover",[b("top",{transform:"rotate(12deg) scale(1.15) translateY(-2px)"}),b("bottom",{transform:"rotate(-12deg) scale(1.15) translateY(2px)"})])])]),M("collapsed",[y("layout-toggle-bar",[A("&:hover",[b("top",{transform:"rotate(-12deg) scale(1.15) translateY(-2px)"}),b("bottom",{transform:"rotate(12deg) scale(1.15) translateY(2px)"})])]),y("layout-toggle-button",[y("base-icon",`
 transform: rotate(0);
 `)])]),y("layout-toggle-button",`
 transition:
 color .3s var(--n-bezier),
 right .3s var(--n-bezier),
 left .3s var(--n-bezier),
 border-color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 cursor: pointer;
 width: 24px;
 height: 24px;
 position: absolute;
 top: 50%;
 right: 0;
 border-radius: 50%;
 display: flex;
 align-items: center;
 justify-content: center;
 font-size: 18px;
 color: var(--n-toggle-button-icon-color);
 border: var(--n-toggle-button-border);
 background-color: var(--n-toggle-button-color);
 box-shadow: 0 2px 4px 0px rgba(0, 0, 0, .06);
 transform: translateX(50%) translateY(-50%);
 z-index: 1;
 `,[y("base-icon",`
 transition: transform .3s var(--n-bezier);
 transform: rotate(180deg);
 `)]),y("layout-toggle-bar",`
 cursor: pointer;
 height: 72px;
 width: 32px;
 position: absolute;
 top: calc(50% - 36px);
 right: -28px;
 `,[b("top, bottom",`
 position: absolute;
 width: 4px;
 border-radius: 2px;
 height: 38px;
 left: 14px;
 transition: 
 background-color .3s var(--n-bezier),
 transform .3s var(--n-bezier);
 `),b("bottom",`
 position: absolute;
 top: 34px;
 `),A("&:hover",[b("top",{transform:"rotate(12deg) scale(1.15) translateY(-2px)"}),b("bottom",{transform:"rotate(-12deg) scale(1.15) translateY(2px)"})]),b("top, bottom",{backgroundColor:"var(--n-toggle-bar-color)"}),A("&:hover",[b("top, bottom",{backgroundColor:"var(--n-toggle-bar-color-hover)"})])]),b("border",`
 position: absolute;
 top: 0;
 right: 0;
 bottom: 0;
 width: 1px;
 transition: background-color .3s var(--n-bezier);
 `),y("layout-sider-scroll-container",`
 flex-grow: 1;
 flex-shrink: 0;
 box-sizing: border-box;
 height: 100%;
 opacity: 0;
 transition: opacity .3s var(--n-bezier);
 max-width: 100%;
 `),M("show-content",[y("layout-sider-scroll-container",{opacity:1})]),M("absolute-positioned",`
 position: absolute;
 left: 0;
 top: 0;
 bottom: 0;
 `)]),Xe=X({props:{clsPrefix:{type:String,required:!0},onClick:Function},render(){const{clsPrefix:o}=this;return t("div",{onClick:this.onClick,class:`${o}-layout-toggle-bar`},t("div",{class:`${o}-layout-toggle-bar__top`}),t("div",{class:`${o}-layout-toggle-bar__bottom`}))}}),Ze=X({name:"LayoutToggleButton",props:{clsPrefix:{type:String,required:!0},onClick:Function},render(){const{clsPrefix:o}=this;return t("div",{class:`${o}-layout-toggle-button`,onClick:this.onClick},t(Te,{clsPrefix:o},{default:()=>t(Oe,null)}))}}),Ge={position:ve,bordered:Boolean,collapsedWidth:{type:Number,default:48},width:{type:[Number,String],default:272},contentClass:String,contentStyle:{type:[String,Object],default:""},collapseMode:{type:String,default:"transform"},collapsed:{type:Boolean,default:void 0},defaultCollapsed:Boolean,showCollapsedContent:{type:Boolean,default:!0},showTrigger:{type:[Boolean,String],default:!1},nativeScrollbar:{type:Boolean,default:!0},inverted:Boolean,scrollbarProps:Object,triggerClass:String,triggerStyle:[String,Object],collapsedTriggerClass:String,collapsedTriggerStyle:[String,Object],"onUpdate:collapsed":[Function,Array],onUpdateCollapsed:[Function,Array],onAfterEnter:Function,onAfterLeave:Function,onExpand:[Function,Array],onCollapse:[Function,Array],onScroll:Function},Je=X({name:"LayoutSider",props:Object.assign(Object.assign({},te.props),Ge),setup(o){const l=xe(Ie),d=U(null),x=U(null),P=U(o.defaultCollapsed),v=Ve(J(o,"collapsed"),P),T=n(()=>W(v.value?o.collapsedWidth:o.width)),s=n(()=>o.collapseMode!=="transform"?{}:{minWidth:W(o.width)}),L=n(()=>l?l.siderPlacement:"left");function z(c,e){if(o.nativeScrollbar){const{value:m}=d;m&&(e===void 0?m.scrollTo(c):m.scrollTo(c,e))}else{const{value:m}=x;m&&m.scrollTo(c,e)}}function i(){const{"onUpdate:collapsed":c,onUpdateCollapsed:e,onExpand:m,onCollapse:Y}=o,{value:E}=v;e&&D(e,!E),c&&D(c,!E),P.value=!E,E?m&&D(m):Y&&D(Y)}let R=0,I=0;const j=c=>{var e;const m=c.target;R=m.scrollLeft,I=m.scrollTop,(e=o.onScroll)===null||e===void 0||e.call(o,c)};Be(()=>{if(o.nativeScrollbar){const c=d.value;c&&(c.scrollTop=I,c.scrollLeft=R)}}),ke(fe,{collapsedRef:v,collapseModeRef:J(o,"collapseMode")});const{mergedClsPrefixRef:$,inlineThemeDisabled:B}=Le(o),N=te("Layout","-layout-sider",Ke,me,o,$);function C(c){var e,m;c.propertyName==="max-width"&&(v.value?(e=o.onAfterLeave)===null||e===void 0||e.call(o):(m=o.onAfterEnter)===null||m===void 0||m.call(o))}const g={scrollTo:z},w=n(()=>{const{common:{cubicBezierEaseInOut:c},self:e}=N.value,{siderToggleButtonColor:m,siderToggleButtonBorder:Y,siderToggleBarColor:E,siderToggleBarColorHover:pe}=e,_={"--n-bezier":c,"--n-toggle-button-color":m,"--n-toggle-button-border":Y,"--n-toggle-bar-color":E,"--n-toggle-bar-color-hover":pe};return o.inverted?(_["--n-color"]=e.siderColorInverted,_["--n-text-color"]=e.textColorInverted,_["--n-border-color"]=e.siderBorderColorInverted,_["--n-toggle-button-icon-color"]=e.siderToggleButtonIconColorInverted,_.__invertScrollbar=e.__invertScrollbar):(_["--n-color"]=e.siderColor,_["--n-text-color"]=e.textColor,_["--n-border-color"]=e.siderBorderColor,_["--n-toggle-button-icon-color"]=e.siderToggleButtonIconColor),_}),h=B?Ne("layout-sider",n(()=>o.inverted?"a":"b"),w,o):void 0;return Object.assign({scrollableElRef:d,scrollbarInstRef:x,mergedClsPrefix:$,mergedTheme:N,styleMaxWidth:T,mergedCollapsed:v,scrollContainerStyle:s,siderPlacement:L,handleNativeElScroll:j,handleTransitionend:C,handleTriggerClick:i,inlineThemeDisabled:B,cssVars:w,themeClass:h==null?void 0:h.themeClass,onRender:h==null?void 0:h.onRender},g)},render(){var o;const{mergedClsPrefix:l,mergedCollapsed:d,showTrigger:x}=this;return(o=this.onRender)===null||o===void 0||o.call(this),t("aside",{class:[`${l}-layout-sider`,this.themeClass,`${l}-layout-sider--${this.position}-positioned`,`${l}-layout-sider--${this.siderPlacement}-placement`,this.bordered&&`${l}-layout-sider--bordered`,d&&`${l}-layout-sider--collapsed`,(!d||this.showCollapsedContent)&&`${l}-layout-sider--show-content`],onTransitionend:this.handleTransitionend,style:[this.inlineThemeDisabled?void 0:this.cssVars,{maxWidth:this.styleMaxWidth,width:W(this.width)}]},this.nativeScrollbar?t("div",{class:[`${l}-layout-sider-scroll-container`,this.contentClass],onScroll:this.handleNativeElScroll,style:[this.scrollContainerStyle,{overflow:"auto"},this.contentStyle],ref:"scrollableElRef"},this.$slots):t(ze,Object.assign({},this.scrollbarProps,{onScroll:this.onScroll,ref:"scrollbarInstRef",style:this.scrollContainerStyle,contentStyle:this.contentStyle,contentClass:this.contentClass,theme:this.mergedTheme.peers.Scrollbar,themeOverrides:this.mergedTheme.peerOverrides.Scrollbar,builtinThemeOverrides:this.inverted&&this.cssVars.__invertScrollbar==="true"?{colorHover:"rgba(255, 255, 255, .4)",color:"rgba(255, 255, 255, .3)"}:void 0}),this.$slots),x?x==="bar"?t(Xe,{clsPrefix:l,class:d?this.collapsedTriggerClass:this.triggerClass,style:d?this.collapsedTriggerStyle:this.triggerStyle,onClick:this.handleTriggerClick}):t(Ze,{clsPrefix:l,class:d?this.collapsedTriggerClass:this.triggerClass,style:d?this.collapsedTriggerStyle:this.triggerStyle,onClick:this.handleTriggerClick}):null,this.bordered?t("div",{class:`${l}-layout-sider__border`}):null)}}),eo={class:"quota-container"},oo={class:"quota-text"},to={class:"quota-popover"},ao={class:"popover-header"},ro={class:"quota-progress"},lo={class:"progress-text"},so={class:"quota-text"},no={class:"quota-popover"},io={class:"popover-header"},uo={class:"quota-progress"},co={class:"progress-text"},go={__name:"QuotaDisplay",setup(o){de();const{quotaInfo:l,fetchQuotaInfo:d,setupQuotaListener:x,isVip:P,vipLevelLabel:v}=Re(),T=n(()=>l.value.usedToday||0),s=n(()=>l.value.dailyQuota||5),L=n(()=>l.value.remainingToday||0),z=n(()=>Math.round(l.value.usagePercent||0)),i=n(()=>L.value<=2&&L.value>0),R=n(()=>L.value===0),I=n(()=>v.value),j=n(()=>l.value.tutorUsedToday||0),$=n(()=>l.value.dailyTutorQuota||3),B=n(()=>l.value.tutorRemainingToday||0),N=n(()=>Math.round(l.value.tutorUsagePercent||0)),C=n(()=>B.value<=1&&B.value>0),g=n(()=>B.value===0),w=n(()=>P.value?"success":"default"),h=n(()=>{const c=z.value;return c>=90?"#f56c6c":c>=70?"#e6a23c":P.value?"#f59e0b":"#67c23a"});return ce(()=>{d(),x(),setInterval(()=>{d()},30*1e3)}),(c,e)=>(S(),H("div",eo,[u(a(re),{trigger:"hover",placement:"bottom"},{trigger:p(()=>[r("div",{class:oe(["quota-badge content-badge",{warning:i.value,danger:R.value}])},[u(a(V),{size:"16",color:"#f59e0b"},{default:p(()=>[...e[0]||(e[0]=[r("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor"},[r("path",{d:"M13 10h-2V8h2m0 6h-2v-2h2m-1-9C6.48 3 2 7.48 2 13s4.48 10 10 10 10-4.48 10-10S17.52 3 12 3z"})],-1)])]),_:1}),r("span",oo,k(L.value)+"/"+k(s.value),1)],2)]),default:p(()=>[r("div",to,[r("div",ao,[e[1]||(e[1]=r("div",{class:"header-title"},"今日内容生成配额",-1)),u(a(ae),{type:w.value,size:"small",round:""},{default:p(()=>[ee(k(I.value),1)]),_:1},8,["type"])]),r("div",ro,[u(a(le),{type:"line",percentage:z.value,color:h.value,"rail-color":"rgba(255, 255, 255, 0.1)","show-indicator":!1},null,8,["percentage","color"]),r("div",lo,"已使用 "+k(T.value)+" / "+k(s.value)+" 点 ("+k(z.value)+"%)",1)]),e[2]||(e[2]=r("div",{class:"reset-time"},"内容消耗与题目质量挂钩",-1))])]),_:1}),u(a(re),{trigger:"hover",placement:"bottom"},{trigger:p(()=>[r("div",{class:oe(["quota-badge tutor-badge",{warning:C.value,danger:g.value}])},[u(a(V),{size:"16",color:"#ec4899"},{default:p(()=>[...e[3]||(e[3]=[r("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor"},[r("path",{"fill-rule":"evenodd",d:"M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z","clip-rule":"evenodd"})],-1)])]),_:1}),r("span",so,k(B.value)+"/"+k($.value),1)],2)]),default:p(()=>[r("div",no,[r("div",io,[e[5]||(e[5]=r("div",{class:"header-title"},"今日助教提问配额",-1)),u(a(ae),{type:"info",size:"small",round:""},{default:p(()=>[...e[4]||(e[4]=[ee("对话次数",-1)])]),_:1})]),r("div",uo,[u(a(le),{type:"line",percentage:N.value,color:"#ec4899","rail-color":"rgba(255, 255, 255, 0.1)","show-indicator":!1},null,8,["percentage"]),r("div",co,"已使用 "+k(j.value)+"/"+k($.value)+" 次 ("+k(N.value)+"%)",1)]),e[6]||(e[6]=r("div",{class:"reset-time"},"每日 0 点重置提问次数",-1))])]),_:1})]))}},ue=ge(go,[["__scopeId","data-v-0473dc28"]]),po={class:"logo"},mo={key:0,class:"logo-text"},vo={class:"header-left"},fo={class:"header-right"},bo={key:0,class:"mobile-header-meta"},ho={class:"user-profile"},yo={key:0,class:"user-meta",style:{display:"flex","flex-direction":"column","line-height":"1.2","margin-left":"8px"}},xo={key:0,style:{"font-size":"10px",color:"#f59e0b"}},ko={__name:"MainLayout",setup(o){const l=Me(),d=U(!1),x=Ce(),P=de(),v=U(!1),T=U(!1),{t:s}=$e(),L={Dashboard:"menu.dashboard",Vocabulary:"menu.vocabulary",VocabularyNew:"menu.vocabulary",VocabularyTest:"menu.vocabularyTest",Review:"menu.review",DailyTasks:"menu.dailyTasks",DailyPlan:"menu.dailyTasks",StudyPlanCreate:"menu.dailyTasks",Grammar:"menu.grammar",Listening:"menu.listening",Speaking:"menu.speaking",Reading:"menu.reading",Writing:"menu.writing",MockExam:"menu.mockExam",Analysis:"menu.analysis",ErrorBook:"menu.errorBook",AnswerHistory:"menu.answerHistory",SpeakingMock:"menu.speaking",Profile:"menu.profile",Settings:"menu.settings",LearningHub:"menu.learningHub"},z=()=>{v.value=window.innerWidth<=768,v.value?d.value=!0:(d.value=!1,T.value=!1)};ce(()=>{z(),window.addEventListener("resize",z)}),we(()=>{window.removeEventListener("resize",z)});const i=C=>()=>t(V,null,{default:()=>t(C)}),R=n(()=>[{label:()=>t(f,{to:"/app/dashboard"},{default:()=>s("menu.dashboard")}),key:"dashboard",icon:i(je)},{label:()=>t(f,{to:"/vocabulary"},{default:()=>s("menu.vocabulary")}),key:"vocabulary",icon:i(F)},{label:()=>t(f,{to:"/vocabulary-test"},{default:()=>s("menu.vocabularyTest")}),key:"vocabulary-test",icon:i(F)},{label:()=>t(f,{to:"/review"},{default:()=>s("menu.review")}),key:"review",icon:i(qe)},{label:()=>t(f,{to:"/daily-tasks"},{default:()=>s("menu.dailyTasks")}),key:"daily-tasks",icon:i(Ae)},{label:()=>t(f,{to:"/grammar"},{default:()=>s("menu.grammar")}),key:"grammar",icon:i(K)},{label:()=>t(f,{to:"/listening"},{default:()=>s("menu.listening")}),key:"listening",icon:i(ne)},{label:()=>t(f,{to:"/speaking"},{default:()=>s("menu.speaking")}),key:"speaking",icon:i(K)},{label:()=>t(f,{to:"/reading"},{default:()=>s("menu.reading")}),key:"reading",icon:i(F)},{label:()=>t(f,{to:"/writing"},{default:()=>s("menu.writing")}),key:"writing",icon:i(K)},{label:()=>t(f,{to:"/mock-exam"},{default:()=>s("menu.mockExam")}),key:"mock-exam",icon:i(ie)},{label:()=>t(f,{to:"/learning-hub"},{default:()=>s("menu.learningHub")}),key:"learning-hub",icon:i(He)},{label:()=>t(f,{to:"/analysis"},{default:()=>s("menu.analysis")}),key:"analysis",icon:i(ie)},{label:()=>t(f,{to:"/error-book"},{default:()=>s("menu.errorBook")}),key:"error-book",icon:i(F)},{label:()=>t(f,{to:"/answer-history"},{default:()=>s("menu.answerHistory")}),key:"answer-history",icon:i(Ye)},{label:()=>t(f,{to:"/profile"},{default:()=>s("menu.profile")}),key:"profile",icon:i(Q)},{label:()=>t(f,{to:"/settings"},{default:()=>s("menu.settings")}),key:"settings",icon:i(De)}]),I=n(()=>[{label:s("menu.profile"),key:"profile",icon:i(Q)},{label:s("menu.logout"),key:"logout",icon:i(Fe)}]),j=n(()=>{var h;const C=x.name?String(x.name):"",g=L[C];if(g)return s(g);const w=(h=x.meta)==null?void 0:h.title;return typeof w=="string"&&w.trim()?w:"LearnSphere AI"}),$=C=>{C==="logout"?l.logout():C==="profile"&&P.push("/profile")},B=(C,g)=>{v.value&&(T.value=!1)},N=n(()=>x.name?x.name.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase():null);return(C,g)=>{const w=_e("router-view");return S(),q(a(se),{"has-sider":"",class:"layout-container"},{default:p(()=>[v.value?O("",!0):(S(),q(a(Je),{key:0,"collapse-mode":"width","collapsed-width":64,width:240,collapsed:d.value,"show-trigger":"",onCollapse:g[0]||(g[0]=h=>d.value=!0),onExpand:g[1]||(g[1]=h=>d.value=!1),bordered:""},{default:p(()=>[r("div",po,[g[4]||(g[4]=r("img",{src:Z,alt:"LearnSphere Logo",class:"logo-side-img"},null,-1)),d.value?O("",!0):(S(),H("span",mo,"LearnSphere"))]),u(a(G),{collapsed:d.value,"collapsed-width":64,"collapsed-icon-size":22,options:R.value,value:N.value},null,8,["collapsed","options","value"])]),_:1},8,["collapsed"])),u(a(be),{show:T.value,"onUpdate:show":g[2]||(g[2]=h=>T.value=h),width:280,placement:"left"},{default:p(()=>[u(a(he),{"body-content-style":"padding: 0;"},{default:p(()=>[g[5]||(g[5]=r("div",{class:"logo mobile-logo"},[r("img",{src:Z,alt:"LearnSphere Logo",class:"logo-side-img"}),r("span",{class:"logo-text"},"LearnSphere")],-1)),u(a(G),{options:R.value,value:N.value,"onUpdate:value":B},null,8,["options","value"])]),_:1})]),_:1},8,["show"]),u(a(se),null,{default:p(()=>[u(a(ye),{bordered:"",class:"header"},{default:p(()=>[r("div",vo,[v.value?(S(),q(a(Pe),{key:0,secondary:"",class:"mobile-menu-toggle",onClick:g[3]||(g[3]=h=>T.value=!0)},{default:p(()=>[u(a(V),{size:"22"},{default:p(()=>[u(a(Ue))]),_:1})]),_:1})):O("",!0),r("h3",null,k(j.value),1)]),r("div",fo,[v.value?(S(),H("div",bo,[u(ue)])):(S(),q(ue,{key:1})),v.value?O("",!0):(S(),q(a(V),{key:2,size:"20",class:"icon-btn"},{default:p(()=>[u(a(ne))]),_:1})),u(a(We),{options:I.value,onSelect:$},{default:p(()=>[r("div",ho,[u(a(Qe),{round:"",size:"small",src:a(l).avatar},{default:p(()=>[u(a(V),{component:a(Q)},null,8,["component"])]),_:1},8,["src"]),v.value?O("",!0):(S(),H("div",yo,[r("span",{class:"username",style:Se({color:a(l).isVip()?"#f59e0b":"inherit",fontWeight:"bold"})},k(a(l).username),5),a(l).isVip()?(S(),H("span",xo,"PRO MEMBER")):O("",!0)]))])]),_:1},8,["options"])])]),_:1}),u(a(Ee),{embedded:"","native-scrollbar":!0,"content-style":v.value?"padding: 12px 12px 20px;":"padding: 24px;",class:"main-content"},{default:p(()=>[u(w)]),_:1},8,["content-style"])]),_:1})]),_:1})}}},Do=ge(ko,[["__scopeId","data-v-ae0b461e"]]);export{Do as default};
