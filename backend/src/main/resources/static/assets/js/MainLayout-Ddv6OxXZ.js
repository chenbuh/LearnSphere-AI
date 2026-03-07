import{l as pe,a as me,p as ve,_ as Z,N as G,b as fe,c as be,d as he}from"./logo-Czb2-FDD.js";import{d as X,h as t,a as ye,r as I,u as J,c as n,z as xe,X as ue,o as ce,Y as F,R as P,f as u,Q as p,Z as a,N as r,q as ee,$ as k,K as oe,a4 as ke,b as Ce,a5 as v,O as we,P as H,a0 as V,a2 as _e}from"./vue-core-k66yWm0l.js";import{e as y,f as R,g as f,h as q,i as Se,S as Te,j as W,k as ze,l as Be,m as te,n as Le,o as Y,N as U,u as Ne,B as Me}from"./index-DahIAh76.js";import{u as Re}from"./useVipPermission-Cu1wx4EL.js";import{_ as de}from"./_plugin-vue_export-helper-DlAUqK2U.js";import{N as re}from"./Tag-BCMARYeD.js";import{N as ae}from"./Popover-DLi66xIH.js";import{N as le}from"./Progress-RG6LBX1F.js";import{d as Pe}from"./utils-D4YdDhUH.js";import{l as $e,N as se,a as Ie}from"./LayoutContent-Cdo7BANw.js";import{C as Ee}from"./ChevronRight-CnFJfdWZ.js";import{u as Oe}from"./use-merged-state-DCOVafah.js";import{a as Ve,b as ne,U as Q,H as Ue,c as D,d as je,e as qe,f as K,g as ie,h as Ae,F as He,i as Ye,j as De}from"./icons-C9GocgtY.js";import{N as Fe}from"./Dropdown-BMkeGnuK.js";import{N as We}from"./Avatar-B3oJtXtE.js";import"./Tooltip-Dq7o15sY.js";import"./create-D3Vn69pI.js";import"./use-compitable-C8LpTH9g.js";import"./index-k4lpeCHj.js";import"./cssr-D4Wn-_UV.js";import"./vendor-Ctmwp_ns.js";import"./next-frame-once-C5Ksf8W7.js";import"./create-ref-setter-C4J8sofl.js";const Qe=y("layout-sider",`
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
`,[R("bordered",[f("border",`
 content: "";
 position: absolute;
 top: 0;
 bottom: 0;
 width: 1px;
 background-color: var(--n-border-color);
 transition: background-color .3s var(--n-bezier);
 `)]),f("left-placement",[R("bordered",[f("border",`
 right: 0;
 `)])]),R("right-placement",`
 justify-content: flex-start;
 `,[R("bordered",[f("border",`
 left: 0;
 `)]),R("collapsed",[y("layout-toggle-button",[y("base-icon",`
 transform: rotate(180deg);
 `)]),y("layout-toggle-bar",[q("&:hover",[f("top",{transform:"rotate(-12deg) scale(1.15) translateY(-2px)"}),f("bottom",{transform:"rotate(12deg) scale(1.15) translateY(2px)"})])])]),y("layout-toggle-button",`
 left: 0;
 transform: translateX(-50%) translateY(-50%);
 `,[y("base-icon",`
 transform: rotate(0);
 `)]),y("layout-toggle-bar",`
 left: -28px;
 transform: rotate(180deg);
 `,[q("&:hover",[f("top",{transform:"rotate(12deg) scale(1.15) translateY(-2px)"}),f("bottom",{transform:"rotate(-12deg) scale(1.15) translateY(2px)"})])])]),R("collapsed",[y("layout-toggle-bar",[q("&:hover",[f("top",{transform:"rotate(-12deg) scale(1.15) translateY(-2px)"}),f("bottom",{transform:"rotate(12deg) scale(1.15) translateY(2px)"})])]),y("layout-toggle-button",[y("base-icon",`
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
 `,[f("top, bottom",`
 position: absolute;
 width: 4px;
 border-radius: 2px;
 height: 38px;
 left: 14px;
 transition: 
 background-color .3s var(--n-bezier),
 transform .3s var(--n-bezier);
 `),f("bottom",`
 position: absolute;
 top: 34px;
 `),q("&:hover",[f("top",{transform:"rotate(12deg) scale(1.15) translateY(-2px)"}),f("bottom",{transform:"rotate(-12deg) scale(1.15) translateY(2px)"})]),f("top, bottom",{backgroundColor:"var(--n-toggle-bar-color)"}),q("&:hover",[f("top, bottom",{backgroundColor:"var(--n-toggle-bar-color-hover)"})])]),f("border",`
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
 `),R("show-content",[y("layout-sider-scroll-container",{opacity:1})]),R("absolute-positioned",`
 position: absolute;
 left: 0;
 top: 0;
 bottom: 0;
 `)]),Ke=X({props:{clsPrefix:{type:String,required:!0},onClick:Function},render(){const{clsPrefix:o}=this;return t("div",{onClick:this.onClick,class:`${o}-layout-toggle-bar`},t("div",{class:`${o}-layout-toggle-bar__top`}),t("div",{class:`${o}-layout-toggle-bar__bottom`}))}}),Xe=X({name:"LayoutToggleButton",props:{clsPrefix:{type:String,required:!0},onClick:Function},render(){const{clsPrefix:o}=this;return t("div",{class:`${o}-layout-toggle-button`,onClick:this.onClick},t(Se,{clsPrefix:o},{default:()=>t(Ee,null)}))}}),Ze={position:ve,bordered:Boolean,collapsedWidth:{type:Number,default:48},width:{type:[Number,String],default:272},contentClass:String,contentStyle:{type:[String,Object],default:""},collapseMode:{type:String,default:"transform"},collapsed:{type:Boolean,default:void 0},defaultCollapsed:Boolean,showCollapsedContent:{type:Boolean,default:!0},showTrigger:{type:[Boolean,String],default:!1},nativeScrollbar:{type:Boolean,default:!0},inverted:Boolean,scrollbarProps:Object,triggerClass:String,triggerStyle:[String,Object],collapsedTriggerClass:String,collapsedTriggerStyle:[String,Object],"onUpdate:collapsed":[Function,Array],onUpdateCollapsed:[Function,Array],onAfterEnter:Function,onAfterLeave:Function,onExpand:[Function,Array],onCollapse:[Function,Array],onScroll:Function},Ge=X({name:"LayoutSider",props:Object.assign(Object.assign({},te.props),Ze),setup(o){const l=ye($e),c=I(null),x=I(null),B=I(o.defaultCollapsed),h=Oe(J(o,"collapsed"),B),S=n(()=>W(h.value?o.collapsedWidth:o.width)),s=n(()=>o.collapseMode!=="transform"?{}:{minWidth:W(o.width)}),L=n(()=>l?l.siderPlacement:"left");function T(d,e){if(o.nativeScrollbar){const{value:m}=c;m&&(e===void 0?m.scrollTo(d):m.scrollTo(d,e))}else{const{value:m}=x;m&&m.scrollTo(d,e)}}function i(){const{"onUpdate:collapsed":d,onUpdateCollapsed:e,onExpand:m,onCollapse:A}=o,{value:O}=h;e&&Y(e,!O),d&&Y(d,!O),B.value=!O,O?m&&Y(m):A&&Y(A)}let N=0,E=0;const j=d=>{var e;const m=d.target;N=m.scrollLeft,E=m.scrollTop,(e=o.onScroll)===null||e===void 0||e.call(o,d)};ze(()=>{if(o.nativeScrollbar){const d=c.value;d&&(d.scrollTop=E,d.scrollLeft=N)}}),xe(pe,{collapsedRef:h,collapseModeRef:J(o,"collapseMode")});const{mergedClsPrefixRef:$,inlineThemeDisabled:z}=Be(o),M=te("Layout","-layout-sider",Qe,me,o,$);function C(d){var e,m;d.propertyName==="max-width"&&(h.value?(e=o.onAfterLeave)===null||e===void 0||e.call(o):(m=o.onAfterEnter)===null||m===void 0||m.call(o))}const g={scrollTo:T},w=n(()=>{const{common:{cubicBezierEaseInOut:d},self:e}=M.value,{siderToggleButtonColor:m,siderToggleButtonBorder:A,siderToggleBarColor:O,siderToggleBarColorHover:ge}=e,_={"--n-bezier":d,"--n-toggle-button-color":m,"--n-toggle-button-border":A,"--n-toggle-bar-color":O,"--n-toggle-bar-color-hover":ge};return o.inverted?(_["--n-color"]=e.siderColorInverted,_["--n-text-color"]=e.textColorInverted,_["--n-border-color"]=e.siderBorderColorInverted,_["--n-toggle-button-icon-color"]=e.siderToggleButtonIconColorInverted,_.__invertScrollbar=e.__invertScrollbar):(_["--n-color"]=e.siderColor,_["--n-text-color"]=e.textColor,_["--n-border-color"]=e.siderBorderColor,_["--n-toggle-button-icon-color"]=e.siderToggleButtonIconColor),_}),b=z?Le("layout-sider",n(()=>o.inverted?"a":"b"),w,o):void 0;return Object.assign({scrollableElRef:c,scrollbarInstRef:x,mergedClsPrefix:$,mergedTheme:M,styleMaxWidth:S,mergedCollapsed:h,scrollContainerStyle:s,siderPlacement:L,handleNativeElScroll:j,handleTransitionend:C,handleTriggerClick:i,inlineThemeDisabled:z,cssVars:w,themeClass:b==null?void 0:b.themeClass,onRender:b==null?void 0:b.onRender},g)},render(){var o;const{mergedClsPrefix:l,mergedCollapsed:c,showTrigger:x}=this;return(o=this.onRender)===null||o===void 0||o.call(this),t("aside",{class:[`${l}-layout-sider`,this.themeClass,`${l}-layout-sider--${this.position}-positioned`,`${l}-layout-sider--${this.siderPlacement}-placement`,this.bordered&&`${l}-layout-sider--bordered`,c&&`${l}-layout-sider--collapsed`,(!c||this.showCollapsedContent)&&`${l}-layout-sider--show-content`],onTransitionend:this.handleTransitionend,style:[this.inlineThemeDisabled?void 0:this.cssVars,{maxWidth:this.styleMaxWidth,width:W(this.width)}]},this.nativeScrollbar?t("div",{class:[`${l}-layout-sider-scroll-container`,this.contentClass],onScroll:this.handleNativeElScroll,style:[this.scrollContainerStyle,{overflow:"auto"},this.contentStyle],ref:"scrollableElRef"},this.$slots):t(Te,Object.assign({},this.scrollbarProps,{onScroll:this.onScroll,ref:"scrollbarInstRef",style:this.scrollContainerStyle,contentStyle:this.contentStyle,contentClass:this.contentClass,theme:this.mergedTheme.peers.Scrollbar,themeOverrides:this.mergedTheme.peerOverrides.Scrollbar,builtinThemeOverrides:this.inverted&&this.cssVars.__invertScrollbar==="true"?{colorHover:"rgba(255, 255, 255, .4)",color:"rgba(255, 255, 255, .3)"}:void 0}),this.$slots),x?x==="bar"?t(Ke,{clsPrefix:l,class:c?this.collapsedTriggerClass:this.triggerClass,style:c?this.collapsedTriggerStyle:this.triggerStyle,onClick:this.handleTriggerClick}):t(Xe,{clsPrefix:l,class:c?this.collapsedTriggerClass:this.triggerClass,style:c?this.collapsedTriggerStyle:this.triggerStyle,onClick:this.handleTriggerClick}):null,this.bordered?t("div",{class:`${l}-layout-sider__border`}):null)}}),Je={class:"quota-container"},eo={class:"quota-text"},oo={class:"quota-popover"},to={class:"popover-header"},ro={class:"quota-progress"},ao={class:"progress-text"},lo={class:"quota-text"},so={class:"quota-popover"},no={class:"popover-header"},io={class:"quota-progress"},uo={class:"progress-text"},co={__name:"QuotaDisplay",setup(o){ue();const{quotaInfo:l,fetchQuotaInfo:c,setupQuotaListener:x,isVip:B,vipLevelLabel:h}=Re();I(!1);const S=n(()=>l.value.usedToday||0),s=n(()=>l.value.dailyQuota||5),L=n(()=>l.value.remainingToday||0),T=n(()=>Math.round(l.value.usagePercent||0)),i=n(()=>L.value<=2&&L.value>0),N=n(()=>L.value===0),E=n(()=>h.value),j=n(()=>l.value.tutorUsedToday||0),$=n(()=>l.value.dailyTutorQuota||3),z=n(()=>l.value.tutorRemainingToday||0),M=n(()=>Math.round(l.value.tutorUsagePercent||0)),C=n(()=>z.value<=1&&z.value>0),g=n(()=>z.value===0),w=n(()=>B.value?"success":"default");n(()=>N.value?"#f56c6c":i.value?"#e6a23c":B.value?"#f59e0b":"#67c23a");const b=n(()=>{const d=T.value;return d>=90?"#f56c6c":d>=70?"#e6a23c":B.value?"#f59e0b":"#67c23a"});return ce(()=>{c(),x(),setInterval(()=>{c()},30*1e3)}),(d,e)=>(P(),F("div",Je,[u(r(ae),{trigger:"hover",placement:"bottom"},{trigger:p(()=>[a("div",{class:oe(["quota-badge content-badge",{warning:i.value,danger:N.value}])},[u(r(U),{size:"16",color:"#f59e0b"},{default:p(()=>[...e[0]||(e[0]=[a("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor"},[a("path",{d:"M13 10h-2V8h2m0 6h-2v-2h2m-1-9C6.48 3 2 7.48 2 13s4.48 10 10 10 10-4.48 10-10S17.52 3 12 3z"})],-1)])]),_:1}),a("span",eo,k(L.value)+"/"+k(s.value),1)],2)]),default:p(()=>[a("div",oo,[a("div",to,[e[1]||(e[1]=a("div",{class:"header-title"},"今日内容生成配额",-1)),u(r(re),{type:w.value,size:"small",round:""},{default:p(()=>[ee(k(E.value),1)]),_:1},8,["type"])]),a("div",ro,[u(r(le),{type:"line",percentage:T.value,color:b.value,"rail-color":"rgba(255, 255, 255, 0.1)","show-indicator":!1},null,8,["percentage","color"]),a("div",ao,"已使用 "+k(S.value)+" / "+k(s.value)+" 点 ("+k(T.value)+"%)",1)]),e[2]||(e[2]=a("div",{class:"reset-time"},"内容消耗与题目质量挂钩",-1))])]),_:1}),u(r(ae),{trigger:"hover",placement:"bottom"},{trigger:p(()=>[a("div",{class:oe(["quota-badge tutor-badge",{warning:C.value,danger:g.value}])},[u(r(U),{size:"16",color:"#ec4899"},{default:p(()=>[...e[3]||(e[3]=[a("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor"},[a("path",{"fill-rule":"evenodd",d:"M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z","clip-rule":"evenodd"})],-1)])]),_:1}),a("span",lo,k(z.value)+"/"+k($.value),1)],2)]),default:p(()=>[a("div",so,[a("div",no,[e[5]||(e[5]=a("div",{class:"header-title"},"今日助教提问配额",-1)),u(r(re),{type:"info",size:"small",round:""},{default:p(()=>[...e[4]||(e[4]=[ee("对话次数",-1)])]),_:1})]),a("div",io,[u(r(le),{type:"line",percentage:M.value,color:"#ec4899","rail-color":"rgba(255, 255, 255, 0.1)","show-indicator":!1},null,8,["percentage"]),a("div",uo,"已使用 "+k(j.value)+"/"+k($.value)+" 次 ("+k(M.value)+"%)",1)]),e[6]||(e[6]=a("div",{class:"reset-time"},"每日 0 点重置提问次数",-1))])]),_:1})]))}},go=de(co,[["__scopeId","data-v-0473dc28"]]),po={class:"logo"},mo={key:0,class:"logo-text"},vo={class:"header-left"},fo={class:"header-right"},bo={class:"user-profile"},ho={key:0,class:"user-meta",style:{display:"flex","flex-direction":"column","line-height":"1.2","margin-left":"8px"}},yo={key:0,style:{"font-size":"10px",color:"#f59e0b"}},xo={__name:"MainLayout",setup(o){const l=Ne(),c=I(!1),x=ke(),B=ue(),h=I(!1),S=I(!1),{t:s}=Pe(),L={Dashboard:"menu.dashboard",Vocabulary:"menu.vocabulary",VocabularyNew:"menu.vocabulary",VocabularyTest:"menu.vocabularyTest",Review:"menu.review",DailyTasks:"menu.dailyTasks",DailyPlan:"menu.dailyTasks",StudyPlanCreate:"menu.dailyTasks",Grammar:"menu.grammar",Listening:"menu.listening",Speaking:"menu.speaking",Reading:"menu.reading",Writing:"menu.writing",MockExam:"menu.mockExam",Analysis:"menu.analysis",ErrorBook:"menu.errorBook",AnswerHistory:"menu.answerHistory",SpeakingMock:"menu.speaking",Profile:"menu.profile",Settings:"menu.settings",LearningHub:"menu.learningHub"},T=()=>{h.value=window.innerWidth<=768,h.value?c.value=!0:(c.value=!1,S.value=!1)};ce(()=>{T(),window.addEventListener("resize",T)}),Ce(()=>{window.removeEventListener("resize",T)});const i=C=>()=>t(U,null,{default:()=>t(C)}),N=n(()=>[{label:()=>t(v,{to:"/app/dashboard"},{default:()=>s("menu.dashboard")}),key:"dashboard",icon:i(Ue)},{label:()=>t(v,{to:"/vocabulary"},{default:()=>s("menu.vocabulary")}),key:"vocabulary",icon:i(D)},{label:()=>t(v,{to:"/vocabulary-test"},{default:()=>s("menu.vocabularyTest")}),key:"vocabulary-test",icon:i(D)},{label:()=>t(v,{to:"/review"},{default:()=>s("menu.review")}),key:"review",icon:i(je)},{label:()=>t(v,{to:"/daily-tasks"},{default:()=>s("menu.dailyTasks")}),key:"daily-tasks",icon:i(qe)},{label:()=>t(v,{to:"/grammar"},{default:()=>s("menu.grammar")}),key:"grammar",icon:i(K)},{label:()=>t(v,{to:"/listening"},{default:()=>s("menu.listening")}),key:"listening",icon:i(ne)},{label:()=>t(v,{to:"/speaking"},{default:()=>s("menu.speaking")}),key:"speaking",icon:i(K)},{label:()=>t(v,{to:"/reading"},{default:()=>s("menu.reading")}),key:"reading",icon:i(D)},{label:()=>t(v,{to:"/writing"},{default:()=>s("menu.writing")}),key:"writing",icon:i(K)},{label:()=>t(v,{to:"/mock-exam"},{default:()=>s("menu.mockExam")}),key:"mock-exam",icon:i(ie)},{label:()=>t(v,{to:"/learning-hub"},{default:()=>s("menu.learningHub")}),key:"learning-hub",icon:i(Ae)},{label:()=>t(v,{to:"/analysis"},{default:()=>s("menu.analysis")}),key:"analysis",icon:i(ie)},{label:()=>t(v,{to:"/error-book"},{default:()=>s("menu.errorBook")}),key:"error-book",icon:i(D)},{label:()=>t(v,{to:"/answer-history"},{default:()=>s("menu.answerHistory")}),key:"answer-history",icon:i(He)},{label:()=>t(v,{to:"/profile"},{default:()=>s("menu.profile")}),key:"profile",icon:i(Q)},{label:()=>t(v,{to:"/settings"},{default:()=>s("menu.settings")}),key:"settings",icon:i(Ye)}]),E=n(()=>[{label:s("menu.profile"),key:"profile",icon:i(Q)},{label:s("menu.logout"),key:"logout",icon:i(De)}]),j=n(()=>{var b;const C=x.name?String(x.name):"",g=L[C];if(g)return s(g);const w=(b=x.meta)==null?void 0:b.title;return typeof w=="string"&&w.trim()?w:"LearnSphere AI"}),$=C=>{C==="logout"?l.logout():C==="profile"&&B.push("/profile")},z=(C,g)=>{h.value&&(S.value=!1)},M=n(()=>x.name?x.name.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase():null);return(C,g)=>{const w=we("router-view");return P(),H(r(se),{"has-sider":"",class:"layout-container"},{default:p(()=>[h.value?V("",!0):(P(),H(r(Ge),{key:0,"collapse-mode":"width","collapsed-width":64,width:240,collapsed:c.value,"show-trigger":"",onCollapse:g[0]||(g[0]=b=>c.value=!0),onExpand:g[1]||(g[1]=b=>c.value=!1),bordered:""},{default:p(()=>[a("div",po,[g[4]||(g[4]=a("img",{src:Z,alt:"LearnSphere Logo",class:"logo-side-img"},null,-1)),c.value?V("",!0):(P(),F("span",mo,"LearnSphere"))]),u(r(G),{collapsed:c.value,"collapsed-width":64,"collapsed-icon-size":22,options:N.value,value:M.value},null,8,["collapsed","options","value"])]),_:1},8,["collapsed"])),u(r(fe),{show:S.value,"onUpdate:show":g[2]||(g[2]=b=>S.value=b),width:240,placement:"left"},{default:p(()=>[u(r(be),{"body-content-style":"padding: 0;"},{default:p(()=>[g[5]||(g[5]=a("div",{class:"logo mobile-logo"},[a("img",{src:Z,alt:"LearnSphere Logo",class:"logo-side-img"}),a("span",{class:"logo-text"},"LearnSphere")],-1)),u(r(G),{options:N.value,value:M.value,"onUpdate:value":z},null,8,["options","value"])]),_:1})]),_:1},8,["show"]),u(r(se),null,{default:p(()=>[u(r(he),{bordered:"",class:"header"},{default:p(()=>[a("div",vo,[h.value?(P(),H(r(Me),{key:0,secondary:"",class:"mobile-menu-toggle",onClick:g[3]||(g[3]=b=>S.value=!0)},{default:p(()=>[u(r(U),{size:"22"},{default:p(()=>[u(r(Ve))]),_:1})]),_:1})):V("",!0),a("h3",null,k(j.value),1)]),a("div",fo,[h.value?V("",!0):(P(),H(go,{key:0})),u(r(U),{size:"20",class:"icon-btn"},{default:p(()=>[u(r(ne))]),_:1}),u(r(Fe),{options:E.value,onSelect:$},{default:p(()=>[a("div",bo,[u(r(We),{round:"",size:"small",src:r(l).avatar},{default:p(()=>[u(r(U),{component:r(Q)},null,8,["component"])]),_:1},8,["src"]),h.value?V("",!0):(P(),F("div",ho,[a("span",{class:"username",style:_e({color:r(l).isVip()?"#f59e0b":"inherit",fontWeight:"bold"})},k(r(l).username),5),r(l).isVip()?(P(),F("span",yo,"PRO MEMBER")):V("",!0)]))])]),_:1},8,["options"])])]),_:1}),u(r(Ie),{embedded:"","native-scrollbar":!0,"content-style":"padding: 24px;",class:"main-content"},{default:p(()=>[u(w)]),_:1})]),_:1})]),_:1})}}},Yo=de(xo,[["__scopeId","data-v-fc53cd8f"]]);export{Yo as default};
