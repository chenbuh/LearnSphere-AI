import{ao as Ve,cw as Be,b0 as Re,K as te,Q as r,P as j,a7 as k,aJ as le,bU as oe,R as $e,as as O,V as g,W as R,bK as Ne,bA as Ue,Y as ze,$ as re,aL as Fe,r as N,ab as Ie,s as M,a1 as $,aZ as E,be as x,a2 as Ae,aP as Y,m as Te,_ as ue,q as de,a5 as Me,d as Z,o as G,a as l,u as o,g as Ke,b,w as i,B as Q,i as c,S as De,k as K,e as He,C as Le,l as ie}from"./index-Dy9YIUY0.js";import{N as ee}from"./Input-CwQxmPcH.js";import{u as Pe}from"./get-CZgJeNp6.js";import{C as ne}from"./cpu-CBU97FiX.js";import{N as X,a as f}from"./FormItem-yf4VEjCC.js";import{N as We}from"./Space-kLet4wNH.js";import{N as je}from"./Divider-pybwvGQq.js";import{N as p}from"./InputNumber-BWr_0xsc.js";import"./use-locale-C9scqsBf.js";import"./get-slot-Bk_rJcZu.js";import"./Add-CMA6rX6o.js";function Oe(n){const{primaryColor:h,opacityDisabled:y,borderRadius:a,textColor3:d}=n;return Object.assign(Object.assign({},Be),{iconColor:d,textColor:"white",loadingColor:h,opacityDisabled:y,railColor:"rgba(0, 0, 0, .14)",railColorActive:h,buttonBoxShadow:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",buttonColor:"#FFF",railBorderRadiusSmall:a,railBorderRadiusMedium:a,railBorderRadiusLarge:a,buttonBorderRadiusSmall:a,buttonBorderRadiusMedium:a,buttonBorderRadiusLarge:a,boxShadowFocus:`0 0 0 2px ${Re(h,{alpha:.2})}`})}const Ee={common:Ve,self:Oe},Ye=te("switch",`
 height: var(--n-height);
 min-width: var(--n-width);
 vertical-align: middle;
 user-select: none;
 -webkit-user-select: none;
 display: inline-flex;
 outline: none;
 justify-content: center;
 align-items: center;
`,[r("children-placeholder",`
 height: var(--n-rail-height);
 display: flex;
 flex-direction: column;
 overflow: hidden;
 pointer-events: none;
 visibility: hidden;
 `),r("rail-placeholder",`
 display: flex;
 flex-wrap: none;
 `),r("button-placeholder",`
 width: calc(1.75 * var(--n-rail-height));
 height: var(--n-rail-height);
 `),te("base-loading",`
 position: absolute;
 top: 50%;
 left: 50%;
 transform: translateX(-50%) translateY(-50%);
 font-size: calc(var(--n-button-width) - 4px);
 color: var(--n-loading-color);
 transition: color .3s var(--n-bezier);
 `,[oe({left:"50%",top:"50%",originalTransform:"translateX(-50%) translateY(-50%)"})]),r("checked, unchecked",`
 transition: color .3s var(--n-bezier);
 color: var(--n-text-color);
 box-sizing: border-box;
 position: absolute;
 white-space: nowrap;
 top: 0;
 bottom: 0;
 display: flex;
 align-items: center;
 line-height: 1;
 `),r("checked",`
 right: 0;
 padding-right: calc(1.25 * var(--n-rail-height) - var(--n-offset));
 `),r("unchecked",`
 left: 0;
 justify-content: flex-end;
 padding-left: calc(1.25 * var(--n-rail-height) - var(--n-offset));
 `),j("&:focus",[r("rail",`
 box-shadow: var(--n-box-shadow-focus);
 `)]),k("round",[r("rail","border-radius: calc(var(--n-rail-height) / 2);",[r("button","border-radius: calc(var(--n-button-height) / 2);")])]),le("disabled",[le("icon",[k("rubber-band",[k("pressed",[r("rail",[r("button","max-width: var(--n-button-width-pressed);")])]),r("rail",[j("&:active",[r("button","max-width: var(--n-button-width-pressed);")])]),k("active",[k("pressed",[r("rail",[r("button","left: calc(100% - var(--n-offset) - var(--n-button-width-pressed));")])]),r("rail",[j("&:active",[r("button","left: calc(100% - var(--n-offset) - var(--n-button-width-pressed));")])])])])])]),k("active",[r("rail",[r("button","left: calc(100% - var(--n-button-width) - var(--n-offset))")])]),r("rail",`
 overflow: hidden;
 height: var(--n-rail-height);
 min-width: var(--n-rail-width);
 border-radius: var(--n-rail-border-radius);
 cursor: pointer;
 position: relative;
 transition:
 opacity .3s var(--n-bezier),
 background .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier);
 background-color: var(--n-rail-color);
 `,[r("button-icon",`
 color: var(--n-icon-color);
 transition: color .3s var(--n-bezier);
 font-size: calc(var(--n-button-height) - 4px);
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 display: flex;
 justify-content: center;
 align-items: center;
 line-height: 1;
 `,[oe()]),r("button",`
 align-items: center; 
 top: var(--n-offset);
 left: var(--n-offset);
 height: var(--n-button-height);
 width: var(--n-button-width-pressed);
 max-width: var(--n-button-width);
 border-radius: var(--n-button-border-radius);
 background-color: var(--n-button-color);
 box-shadow: var(--n-button-box-shadow);
 box-sizing: border-box;
 cursor: inherit;
 content: "";
 position: absolute;
 transition:
 background-color .3s var(--n-bezier),
 left .3s var(--n-bezier),
 opacity .3s var(--n-bezier),
 max-width .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier);
 `)]),k("active",[r("rail","background-color: var(--n-rail-color-active);")]),k("loading",[r("rail",`
 cursor: wait;
 `)]),k("disabled",[r("rail",`
 cursor: not-allowed;
 opacity: .5;
 `)])]),Qe=Object.assign(Object.assign({},re.props),{size:{type:String,default:"medium"},value:{type:[String,Number,Boolean],default:void 0},loading:Boolean,defaultValue:{type:[String,Number,Boolean],default:!1},disabled:{type:Boolean,default:void 0},round:{type:Boolean,default:!0},"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array],checkedValue:{type:[String,Number,Boolean],default:!0},uncheckedValue:{type:[String,Number,Boolean],default:!1},railStyle:Function,rubberBand:{type:Boolean,default:!0},onChange:[Function,Array]});let F;const se=$e({name:"Switch",props:Qe,slots:Object,setup(n){F===void 0&&(typeof CSS<"u"?typeof CSS.supports<"u"?F=CSS.supports("width","max(1px)"):F=!1:F=!0);const{mergedClsPrefixRef:h,inlineThemeDisabled:y}=ze(n),a=re("Switch","-switch",Ye,Ee,n,h),d=Fe(n),{mergedSizeRef:_,mergedDisabledRef:s}=d,S=N(n.defaultValue),C=Ie(n,"value"),w=Pe(C,S),B=M(()=>w.value===n.checkedValue),v=N(!1),e=N(!1),t=M(()=>{const{railStyle:u}=n;if(u)return u({focused:e.value,checked:B.value})});function m(u){const{"onUpdate:value":I,onChange:A,onUpdateValue:T}=n,{nTriggerFormInput:D,nTriggerFormChange:H}=d;I&&Y(I,u),T&&Y(T,u),A&&Y(A,u),S.value=u,D(),H()}function ce(){const{nTriggerFormFocus:u}=d;u()}function ve(){const{nTriggerFormBlur:u}=d;u()}function me(){n.loading||s.value||(w.value!==n.checkedValue?m(n.checkedValue):m(n.uncheckedValue))}function fe(){e.value=!0,ce()}function be(){e.value=!1,ve(),v.value=!1}function he(u){n.loading||s.value||u.key===" "&&(w.value!==n.checkedValue?m(n.checkedValue):m(n.uncheckedValue),v.value=!1)}function ge(u){n.loading||s.value||u.key===" "&&(u.preventDefault(),v.value=!0)}const ae=M(()=>{const{value:u}=_,{self:{opacityDisabled:I,railColor:A,railColorActive:T,buttonBoxShadow:D,buttonColor:H,boxShadowFocus:pe,loadingColor:ye,textColor:_e,iconColor:we,[$("buttonHeight",u)]:q,[$("buttonWidth",u)]:ke,[$("buttonWidthPressed",u)]:xe,[$("railHeight",u)]:V,[$("railWidth",u)]:z,[$("railBorderRadius",u)]:Se,[$("buttonBorderRadius",u)]:Ce},common:{cubicBezierEaseInOut:qe}}=a.value;let L,P,W;return F?(L=`calc((${V} - ${q}) / 2)`,P=`max(${V}, ${q})`,W=`max(${z}, calc(${z} + ${q} - ${V}))`):(L=E((x(V)-x(q))/2),P=E(Math.max(x(V),x(q))),W=x(V)>x(q)?z:E(x(z)+x(q)-x(V))),{"--n-bezier":qe,"--n-button-border-radius":Ce,"--n-button-box-shadow":D,"--n-button-color":H,"--n-button-width":ke,"--n-button-width-pressed":xe,"--n-button-height":q,"--n-height":P,"--n-offset":L,"--n-opacity-disabled":I,"--n-rail-border-radius":Se,"--n-rail-color":A,"--n-rail-color-active":T,"--n-rail-height":V,"--n-rail-width":z,"--n-width":W,"--n-box-shadow-focus":pe,"--n-loading-color":ye,"--n-text-color":_e,"--n-icon-color":we}}),U=y?Ae("switch",M(()=>_.value[0]),ae,n):void 0;return{handleClick:me,handleBlur:be,handleFocus:fe,handleKeyup:he,handleKeydown:ge,mergedRailStyle:t,pressed:v,mergedClsPrefix:h,mergedValue:w,checked:B,mergedDisabled:s,cssVars:y?void 0:ae,themeClass:U?.themeClass,onRender:U?.onRender}},render(){const{mergedClsPrefix:n,mergedDisabled:h,checked:y,mergedRailStyle:a,onRender:d,$slots:_}=this;d?.();const{checked:s,unchecked:S,icon:C,"checked-icon":w,"unchecked-icon":B}=_,v=!(O(C)&&O(w)&&O(B));return g("div",{role:"switch","aria-checked":y,class:[`${n}-switch`,this.themeClass,v&&`${n}-switch--icon`,y&&`${n}-switch--active`,h&&`${n}-switch--disabled`,this.round&&`${n}-switch--round`,this.loading&&`${n}-switch--loading`,this.pressed&&`${n}-switch--pressed`,this.rubberBand&&`${n}-switch--rubber-band`],tabindex:this.mergedDisabled?void 0:0,style:this.cssVars,onClick:this.handleClick,onFocus:this.handleFocus,onBlur:this.handleBlur,onKeyup:this.handleKeyup,onKeydown:this.handleKeydown},g("div",{class:`${n}-switch__rail`,"aria-hidden":"true",style:a},R(s,e=>R(S,t=>e||t?g("div",{"aria-hidden":!0,class:`${n}-switch__children-placeholder`},g("div",{class:`${n}-switch__rail-placeholder`},g("div",{class:`${n}-switch__button-placeholder`}),e),g("div",{class:`${n}-switch__rail-placeholder`},g("div",{class:`${n}-switch__button-placeholder`}),t)):null)),g("div",{class:`${n}-switch__button`},R(C,e=>R(w,t=>R(B,m=>g(Ne,null,{default:()=>this.loading?g(Ue,{key:"loading",clsPrefix:n,strokeWidth:20}):this.checked&&(t||e)?g("div",{class:`${n}-switch__button-icon`,key:t?"checked-icon":"icon"},t||e):!this.checked&&(m||e)?g("div",{class:`${n}-switch__button-icon`,key:m?"unchecked-icon":"icon"},m||e):null})))),R(s,e=>e&&g("div",{key:"checked",class:`${n}-switch__checked`},e)),R(S,e=>e&&g("div",{key:"unchecked",class:`${n}-switch__unchecked`},e)))))}});const J=Te("save",[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]]),Xe={class:"rich-text-editor-simple"},Je={__name:"RichTextEditor",props:{modelValue:{type:String,default:""},placeholder:{type:String,default:"请输入内容..."}},emits:["update:modelValue"],setup(n,{emit:h}){const y=n,a=h,d=N("");de(()=>{d.value=y.modelValue}),Me(()=>y.modelValue,s=>{s!==d.value&&(d.value=s)});const _=s=>{d.value=s,a("update:modelValue",s)};return(s,S)=>(G(),Z("div",Xe,[l(o(ee),{value:d.value,"onUpdate:value":_,type:"textarea",placeholder:n.placeholder,rows:8,autosize:{minRows:8,maxRows:15}},null,8,["value","placeholder"])]))}},Ze=ue(Je,[["__scopeId","data-v-7ae525cc"]]),Ge={class:"page-container"},ea={class:"settings-grid"},aa={class:"switch-item"},ta={class:"switch-item"},la={key:0,class:"mt-4"},oa={class:"quota-grid"},ia={__name:"SystemSettings",setup(n){const h=Ke(),y=N(!1),a=N({"sys.site_name":"","sys.announcement":"","sys.user_registration":!0,"sys.maintenance_mode":!1,"sys.maintenance_message":"","ai.limit.daily.0":5,"ai.limit.daily.1":50,"ai.limit.daily.2":100,"ai.limit.daily.3":200,quota_cost_reading:2,quota_cost_writing_topic:1,quota_cost_writing_eval:3,quota_cost_listening:2,quota_cost_grammar:1,quota_cost_speaking_topic:1,quota_cost_speaking_eval:3,quota_cost_error_analysis:2,quota_cost_speaking_mock:5,quota_cost_mock_exam:4,"ui.theme.primary_color":"#6366f1","ui.theme.dark_mode":!0}),d=N([]),_=async()=>{y.value=!0;try{const v=await ie.getSystemConfigs();d.value=v.data,v.data.forEach(e=>{const t=e.configKey;let m=e.configValue;m==="true"||m==="false"?a.value[t]=m==="true":!isNaN(Number(m))&&m.trim()!==""?a.value[t]=Number(m):a.value[t]=m})}catch{h.error("加载系统配置失败")}finally{y.value=!1}},s=async v=>{const e=String(a.value[v]);try{await ie.updateSystemConfig(v,e),h.success("配置已更新")}catch{h.error("更新失败")}},S=()=>{s("sys.site_name"),s("sys.announcement")},C=v=>{s(v)},w=()=>{s("ai.limit.daily.0"),s("ai.limit.daily.1"),s("ai.limit.daily.2"),s("ai.limit.daily.3")},B=()=>{s("quota_cost_reading"),s("quota_cost_writing_topic"),s("quota_cost_writing_eval"),s("quota_cost_listening"),s("quota_cost_grammar"),s("quota_cost_speaking_topic"),s("quota_cost_speaking_eval"),s("quota_cost_error_analysis"),s("quota_cost_speaking_mock"),s("quota_cost_mock_exam")};return de(()=>{_()}),(v,e)=>(G(),Z("div",Ge,[e[42]||(e[42]=b("header",{class:"page-header"},[b("div",null,[b("h1",null,"系统配置"),b("p",null,"管理全局系统设置、开关及 AI 配额")])],-1)),b("div",ea,[l(o(K),{title:"基础设置",class:"setting-card"},{"header-extra":i(()=>[l(o(De),{class:"icon"})]),default:i(()=>[l(o(X),{"label-placement":"top"},{default:i(()=>[l(o(f),{label:"网站名称"},{default:i(()=>[l(o(ee),{value:a.value["sys.site_name"],"onUpdate:value":e[0]||(e[0]=t=>a.value["sys.site_name"]=t),placeholder:"LearnSphere AI"},null,8,["value"])]),_:1}),l(o(f),{label:"系统公告"},{default:i(()=>[l(Ze,{modelValue:a.value["sys.announcement"],"onUpdate:modelValue":e[1]||(e[1]=t=>a.value["sys.announcement"]=t),placeholder:"发布带有丰富样式的全局通知..."},null,8,["modelValue"])]),_:1}),l(o(Q),{type:"primary",onClick:S},{icon:i(()=>[l(o(J))]),default:i(()=>[e[22]||(e[22]=c(" 保存基础设置 ",-1))]),_:1})]),_:1})]),_:1}),l(o(K),{title:"系统开关",class:"setting-card"},{"header-extra":i(()=>[l(o(Le),{class:"icon"})]),default:i(()=>[l(o(We),{vertical:"",size:"large"},{default:i(()=>[b("div",aa,[e[23]||(e[23]=b("div",{class:"switch-info"},[b("span",{class:"switch-title"},"开放用户注册"),b("span",{class:"switch-desc"},"关闭后新用户将无法注册，现有用户不受影响")],-1)),l(o(se),{value:a.value["sys.user_registration"],"onUpdate:value":[e[2]||(e[2]=t=>a.value["sys.user_registration"]=t),e[3]||(e[3]=t=>C("sys.user_registration"))]},null,8,["value"])]),l(o(je),{style:{margin:"0"}}),b("div",ta,[e[24]||(e[24]=b("div",{class:"switch-info"},[b("span",{class:"switch-title"},"系统维护模式"),b("span",{class:"switch-desc text-warning"},"开启后除管理员外无法访问，请谨慎操作")],-1)),l(o(se),{value:a.value["sys.maintenance_mode"],"onUpdate:value":[e[4]||(e[4]=t=>a.value["sys.maintenance_mode"]=t),e[5]||(e[5]=t=>C("sys.maintenance_mode"))],"rail-style":({checked:t})=>t?{background:"#d03050"}:{}},null,8,["value","rail-style"])]),a.value["sys.maintenance_mode"]?(G(),Z("div",la,[l(o(ee),{value:a.value["sys.maintenance_message"],"onUpdate:value":e[6]||(e[6]=t=>a.value["sys.maintenance_message"]=t),type:"textarea",placeholder:"请输入维护公告内容（支持 HTML）",rows:3,onBlur:e[7]||(e[7]=t=>C("sys.maintenance_message"))},null,8,["value"])])):He("",!0)]),_:1})]),_:1}),l(o(K),{title:"AI 资源配额",class:"setting-card"},{"header-extra":i(()=>[l(o(ne),{class:"icon"})]),default:i(()=>[l(o(X),{"label-placement":"left","label-width":"140"},{default:i(()=>[l(o(f),{label:"普通用户每日限额"},{feedback:i(()=>[...e[25]||(e[25]=[c("次/天",-1)])]),default:i(()=>[l(o(p),{value:a.value["ai.limit.daily.0"],"onUpdate:value":e[8]||(e[8]=t=>a.value["ai.limit.daily.0"]=t),min:0},null,8,["value"])]),_:1}),l(o(f),{label:"月度会员每日限额"},{feedback:i(()=>[...e[26]||(e[26]=[c("次/天",-1)])]),default:i(()=>[l(o(p),{value:a.value["ai.limit.daily.1"],"onUpdate:value":e[9]||(e[9]=t=>a.value["ai.limit.daily.1"]=t),min:0},null,8,["value"])]),_:1}),l(o(f),{label:"季度会员每日限额"},{feedback:i(()=>[...e[27]||(e[27]=[c("次/天",-1)])]),default:i(()=>[l(o(p),{value:a.value["ai.limit.daily.2"],"onUpdate:value":e[10]||(e[10]=t=>a.value["ai.limit.daily.2"]=t),min:0},null,8,["value"])]),_:1}),l(o(f),{label:"年度会员每日限额"},{feedback:i(()=>[...e[28]||(e[28]=[c("次/天",-1)])]),default:i(()=>[l(o(p),{value:a.value["ai.limit.daily.3"],"onUpdate:value":e[11]||(e[11]=t=>a.value["ai.limit.daily.3"]=t),min:0},null,8,["value"])]),_:1}),l(o(Q),{type:"primary",onClick:w,secondary:""},{icon:i(()=>[l(o(J))]),default:i(()=>[e[29]||(e[29]=c(" 保存配额设置 ",-1))]),_:1})]),_:1})]),_:1}),l(o(K),{title:"AI 模块配额消耗",class:"setting-card quota-cost-card"},{"header-extra":i(()=>[l(o(ne),{class:"icon"})]),default:i(()=>[e[41]||(e[41]=b("p",{class:"card-desc"},"配置每个 AI 功能的配额消耗值（配额 = 次数）",-1)),l(o(X),{"label-placement":"left","label-width":"140"},{default:i(()=>[b("div",oa,[l(o(f),{label:"阅读理解生成"},{feedback:i(()=>[...e[30]||(e[30]=[c("次/每次调用",-1)])]),default:i(()=>[l(o(p),{value:a.value.quota_cost_reading,"onUpdate:value":e[12]||(e[12]=t=>a.value.quota_cost_reading=t),min:1,max:20},null,8,["value"])]),_:1}),l(o(f),{label:"写作题目生成"},{feedback:i(()=>[...e[31]||(e[31]=[c("次/每次调用",-1)])]),default:i(()=>[l(o(p),{value:a.value.quota_cost_writing_topic,"onUpdate:value":e[13]||(e[13]=t=>a.value.quota_cost_writing_topic=t),min:1,max:20},null,8,["value"])]),_:1}),l(o(f),{label:"写作批改"},{feedback:i(()=>[...e[32]||(e[32]=[c("次/每次调用",-1)])]),default:i(()=>[l(o(p),{value:a.value.quota_cost_writing_eval,"onUpdate:value":e[14]||(e[14]=t=>a.value.quota_cost_writing_eval=t),min:1,max:20},null,8,["value"])]),_:1}),l(o(f),{label:"听力生成"},{feedback:i(()=>[...e[33]||(e[33]=[c("次/每次调用",-1)])]),default:i(()=>[l(o(p),{value:a.value.quota_cost_listening,"onUpdate:value":e[15]||(e[15]=t=>a.value.quota_cost_listening=t),min:1,max:20},null,8,["value"])]),_:1}),l(o(f),{label:"语法生成"},{feedback:i(()=>[...e[34]||(e[34]=[c("次/每次调用",-1)])]),default:i(()=>[l(o(p),{value:a.value.quota_cost_grammar,"onUpdate:value":e[16]||(e[16]=t=>a.value.quota_cost_grammar=t),min:1,max:20},null,8,["value"])]),_:1}),l(o(f),{label:"口语生成"},{feedback:i(()=>[...e[35]||(e[35]=[c("次/每次调用",-1)])]),default:i(()=>[l(o(p),{value:a.value.quota_cost_speaking_topic,"onUpdate:value":e[17]||(e[17]=t=>a.value.quota_cost_speaking_topic=t),min:1,max:20},null,8,["value"])]),_:1}),l(o(f),{label:"口语评测"},{feedback:i(()=>[...e[36]||(e[36]=[c("次/每次调用",-1)])]),default:i(()=>[l(o(p),{value:a.value.quota_cost_speaking_eval,"onUpdate:value":e[18]||(e[18]=t=>a.value.quota_cost_speaking_eval=t),min:1,max:20},null,8,["value"])]),_:1}),l(o(f),{label:"错题深度分析"},{feedback:i(()=>[...e[37]||(e[37]=[c("次/每次调用",-1)])]),default:i(()=>[l(o(p),{value:a.value.quota_cost_error_analysis,"onUpdate:value":e[19]||(e[19]=t=>a.value.quota_cost_error_analysis=t),min:1,max:20},null,8,["value"])]),_:1}),l(o(f),{label:"口语1V1模考"},{feedback:i(()=>[...e[38]||(e[38]=[c("次/每次调用",-1)])]),default:i(()=>[l(o(p),{value:a.value.quota_cost_speaking_mock,"onUpdate:value":e[20]||(e[20]=t=>a.value.quota_cost_speaking_mock=t),min:1,max:20},null,8,["value"])]),_:1}),l(o(f),{label:"模拟考试生成"},{feedback:i(()=>[...e[39]||(e[39]=[c("次/每次调用",-1)])]),default:i(()=>[l(o(p),{value:a.value.quota_cost_mock_exam,"onUpdate:value":e[21]||(e[21]=t=>a.value.quota_cost_mock_exam=t),min:1,max:20},null,8,["value"])]),_:1})]),l(o(Q),{type:"primary",onClick:B,secondary:"",style:{"margin-top":"16px"}},{icon:i(()=>[l(o(J))]),default:i(()=>[e[40]||(e[40]=c(" 保存配额消耗设置 ",-1))]),_:1})]),_:1})]),_:1})])]))}},ga=ue(ia,[["__scopeId","data-v-88a76d1f"]]);export{ga as default};
