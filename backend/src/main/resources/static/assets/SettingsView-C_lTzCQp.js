import{aH as _e,bJ as Se,bc as Re,G as ae,as as a,E as Q,J as y,K as le,aW as oe,L as Be,bK as Y,M as b,at as B,O as $e,Q as ue,aJ as Ve,r as V,aK as ze,aL as Pe,V as M,W as $,bL as q,bM as k,X as Ne,b0 as Ue,bN as Fe,aR as Z,_ as Te,af as Oe,a0 as Ae,$ as De,aN as ie,g as W,b as j,e,d as n,w as S,n as ee,u as i,bo as Ke,bO as Me,bP as We,bQ as je,y as ne,k as te,bR as re,i as F,j as T,a7 as Le,t as de,ab as L}from"./index-DxUHCA-q.js";import{T as Ee}from"./trash-2-fc0EEABb.js";function Ie(s){const{primaryColor:c,opacityDisabled:v,borderRadius:g,textColor3:d}=s;return Object.assign(Object.assign({},Se),{iconColor:d,textColor:"white",loadingColor:c,opacityDisabled:v,railColor:"rgba(0, 0, 0, .14)",railColorActive:c,buttonBoxShadow:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",buttonColor:"#FFF",railBorderRadiusSmall:g,railBorderRadiusMedium:g,railBorderRadiusLarge:g,buttonBorderRadiusSmall:g,buttonBorderRadiusMedium:g,buttonBorderRadiusLarge:g,boxShadowFocus:`0 0 0 2px ${Re(c,{alpha:.2})}`})}const He={common:_e,self:Ie},Je=ae("switch",`
 height: var(--n-height);
 min-width: var(--n-width);
 vertical-align: middle;
 user-select: none;
 -webkit-user-select: none;
 display: inline-flex;
 outline: none;
 justify-content: center;
 align-items: center;
`,[a("children-placeholder",`
 height: var(--n-rail-height);
 display: flex;
 flex-direction: column;
 overflow: hidden;
 pointer-events: none;
 visibility: hidden;
 `),a("rail-placeholder",`
 display: flex;
 flex-wrap: none;
 `),a("button-placeholder",`
 width: calc(1.75 * var(--n-rail-height));
 height: var(--n-rail-height);
 `),ae("base-loading",`
 position: absolute;
 top: 50%;
 left: 50%;
 transform: translateX(-50%) translateY(-50%);
 font-size: calc(var(--n-button-width) - 4px);
 color: var(--n-loading-color);
 transition: color .3s var(--n-bezier);
 `,[oe({left:"50%",top:"50%",originalTransform:"translateX(-50%) translateY(-50%)"})]),a("checked, unchecked",`
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
 `),a("checked",`
 right: 0;
 padding-right: calc(1.25 * var(--n-rail-height) - var(--n-offset));
 `),a("unchecked",`
 left: 0;
 justify-content: flex-end;
 padding-left: calc(1.25 * var(--n-rail-height) - var(--n-offset));
 `),Q("&:focus",[a("rail",`
 box-shadow: var(--n-box-shadow-focus);
 `)]),y("round",[a("rail","border-radius: calc(var(--n-rail-height) / 2);",[a("button","border-radius: calc(var(--n-button-height) / 2);")])]),le("disabled",[le("icon",[y("rubber-band",[y("pressed",[a("rail",[a("button","max-width: var(--n-button-width-pressed);")])]),a("rail",[Q("&:active",[a("button","max-width: var(--n-button-width-pressed);")])]),y("active",[y("pressed",[a("rail",[a("button","left: calc(100% - var(--n-offset) - var(--n-button-width-pressed));")])]),a("rail",[Q("&:active",[a("button","left: calc(100% - var(--n-offset) - var(--n-button-width-pressed));")])])])])])]),y("active",[a("rail",[a("button","left: calc(100% - var(--n-button-width) - var(--n-offset))")])]),a("rail",`
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
 `,[a("button-icon",`
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
 `,[oe()]),a("button",`
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
 `)]),y("active",[a("rail","background-color: var(--n-rail-color-active);")]),y("loading",[a("rail",`
 cursor: wait;
 `)]),y("disabled",[a("rail",`
 cursor: not-allowed;
 opacity: .5;
 `)])]),Xe=Object.assign(Object.assign({},ue.props),{size:{type:String,default:"medium"},value:{type:[String,Number,Boolean],default:void 0},loading:Boolean,defaultValue:{type:[String,Number,Boolean],default:!1},disabled:{type:Boolean,default:void 0},round:{type:Boolean,default:!0},"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array],checkedValue:{type:[String,Number,Boolean],default:!0},uncheckedValue:{type:[String,Number,Boolean],default:!1},railStyle:Function,rubberBand:{type:Boolean,default:!0},onChange:[Function,Array]});let O;const E=Be({name:"Switch",props:Xe,slots:Object,setup(s){O===void 0&&(typeof CSS<"u"?typeof CSS.supports<"u"?O=CSS.supports("width","max(1px)"):O=!1:O=!0);const{mergedClsPrefixRef:c,inlineThemeDisabled:v}=$e(s),g=ue("Switch","-switch",Je,He,s,c),d=Ve(s),{mergedSizeRef:f,mergedDisabledRef:h}=d,r=V(s.defaultValue),z=ze(s,"value"),w=Pe(z,r),R=M(()=>w.value===s.checkedValue),x=V(!1),u=V(!1),p=M(()=>{const{railStyle:o}=s;if(o)return o({focused:u.value,checked:R.value})});function m(o){const{"onUpdate:value":A,onChange:D,onUpdateValue:K}=s,{nTriggerFormInput:I,nTriggerFormChange:H}=d;A&&Z(A,o),K&&Z(K,o),D&&Z(D,o),r.value=o,I(),H()}function P(){const{nTriggerFormFocus:o}=d;o()}function t(){const{nTriggerFormBlur:o}=d;o()}function l(){s.loading||h.value||(w.value!==s.checkedValue?m(s.checkedValue):m(s.uncheckedValue))}function ce(){u.value=!0,P()}function ve(){u.value=!1,t(),x.value=!1}function he(o){s.loading||h.value||o.key===" "&&(w.value!==s.checkedValue?m(s.checkedValue):m(s.uncheckedValue),x.value=!1)}function be(o){s.loading||h.value||o.key===" "&&(o.preventDefault(),x.value=!0)}const se=M(()=>{const{value:o}=f,{self:{opacityDisabled:A,railColor:D,railColorActive:K,buttonBoxShadow:I,buttonColor:H,boxShadowFocus:ge,loadingColor:fe,textColor:pe,iconColor:me,[$("buttonHeight",o)]:C,[$("buttonWidth",o)]:we,[$("buttonWidthPressed",o)]:ye,[$("railHeight",o)]:_,[$("railWidth",o)]:U,[$("railBorderRadius",o)]:ke,[$("buttonBorderRadius",o)]:xe},common:{cubicBezierEaseInOut:Ce}}=g.value;let J,X,G;return O?(J=`calc((${_} - ${C}) / 2)`,X=`max(${_}, ${C})`,G=`max(${U}, calc(${U} + ${C} - ${_}))`):(J=q((k(_)-k(C))/2),X=q(Math.max(k(_),k(C))),G=k(_)>k(C)?U:q(k(U)+k(C)-k(_))),{"--n-bezier":Ce,"--n-button-border-radius":xe,"--n-button-box-shadow":I,"--n-button-color":H,"--n-button-width":we,"--n-button-width-pressed":ye,"--n-button-height":C,"--n-height":X,"--n-offset":J,"--n-opacity-disabled":A,"--n-rail-border-radius":ke,"--n-rail-color":D,"--n-rail-color-active":K,"--n-rail-height":_,"--n-rail-width":U,"--n-width":G,"--n-box-shadow-focus":ge,"--n-loading-color":fe,"--n-text-color":pe,"--n-icon-color":me}}),N=v?Ne("switch",M(()=>f.value[0]),se,s):void 0;return{handleClick:l,handleBlur:ve,handleFocus:ce,handleKeyup:he,handleKeydown:be,mergedRailStyle:p,pressed:x,mergedClsPrefix:c,mergedValue:w,checked:R,mergedDisabled:h,cssVars:v?void 0:se,themeClass:N?.themeClass,onRender:N?.onRender}},render(){const{mergedClsPrefix:s,mergedDisabled:c,checked:v,mergedRailStyle:g,onRender:d,$slots:f}=this;d?.();const{checked:h,unchecked:r,icon:z,"checked-icon":w,"unchecked-icon":R}=f,x=!(Y(z)&&Y(w)&&Y(R));return b("div",{role:"switch","aria-checked":v,class:[`${s}-switch`,this.themeClass,x&&`${s}-switch--icon`,v&&`${s}-switch--active`,c&&`${s}-switch--disabled`,this.round&&`${s}-switch--round`,this.loading&&`${s}-switch--loading`,this.pressed&&`${s}-switch--pressed`,this.rubberBand&&`${s}-switch--rubber-band`],tabindex:this.mergedDisabled?void 0:0,style:this.cssVars,onClick:this.handleClick,onFocus:this.handleFocus,onBlur:this.handleBlur,onKeyup:this.handleKeyup,onKeydown:this.handleKeydown},b("div",{class:`${s}-switch__rail`,"aria-hidden":"true",style:g},B(h,u=>B(r,p=>u||p?b("div",{"aria-hidden":!0,class:`${s}-switch__children-placeholder`},b("div",{class:`${s}-switch__rail-placeholder`},b("div",{class:`${s}-switch__button-placeholder`}),u),b("div",{class:`${s}-switch__rail-placeholder`},b("div",{class:`${s}-switch__button-placeholder`}),p)):null)),b("div",{class:`${s}-switch__button`},B(z,u=>B(w,p=>B(R,m=>b(Ue,null,{default:()=>this.loading?b(Fe,{key:"loading",clsPrefix:s,strokeWidth:20}):this.checked&&(p||u)?b("div",{class:`${s}-switch__button-icon`,key:p?"checked-icon":"icon"},p||u):!this.checked&&(m||u)?b("div",{class:`${s}-switch__button-icon`,key:m?"unchecked-icon":"icon"},m||u):null})))),B(h,u=>u&&b("div",{key:"checked",class:`${s}-switch__checked`},u)),B(r,u=>u&&b("div",{key:"unchecked",class:`${s}-switch__unchecked`},u)))))}}),Ge={class:"page-container"},Qe={class:"settings-layout"},Ye={class:"icon-box"},qe={class:"icon-box"},Ze={class:"icon-box"},et={class:"icon-box"},tt={key:0,class:"settings-panel"},st={class:"setting-group"},at={class:"setting-item"},lt={class:"control"},ot={class:"setting-item"},it={class:"control"},nt={class:"setting-group"},rt={class:"setting-item"},dt={class:"control"},ut={class:"setting-group no-border"},ct={class:"setting-item"},vt={class:"control"},ht={class:"panel-footer"},bt={key:1,class:"settings-panel"},gt={class:"setting-group"},ft={class:"profile-preview"},pt={class:"profile-info"},mt={class:"username"},wt={class:"email"},yt={class:"setting-group"},kt={class:"form-item"},xt={class:"form-item"},Ct={class:"setting-group"},_t={class:"form-item"},St={class:"form-item"},Rt={class:"panel-footer"},Bt={key:2,class:"settings-panel"},$t={class:"setting-group"},Vt={class:"setting-item"},zt={class:"control"},Pt={class:"setting-item"},Nt={class:"control"},Ut={class:"setting-item"},Ft={class:"control"},Tt={class:"panel-footer"},Ot={__name:"SettingsView",setup(s){const c=Oe(),v=Ae(),g=De(),d=V("general"),f=V({theme:"dark",language:"zh-CN",autoPlayAudio:!0,soundEffects:!0}),h=V({emailAlerts:!0,studyReminders:!0,weeklyReport:!0}),r=V({username:v.username,email:v.email,currentPassword:"",newPassword:""});ie(()=>v.username,P=>{r.value.username=P}),ie(()=>v.email,P=>{r.value.email=P});const z=[{label:"深色模式 (Dark)",value:"dark"},{label:"浅色模式 (Light)",value:"light"},{label:"跟随系统",value:"system"}],w=[{label:"简体中文",value:"zh-CN"},{label:"English",value:"en-US"}],R=()=>{c.success("通用设置已保存")},x=()=>{c.success("通知设置已更新")},u=()=>{if(!r.value.currentPassword||!r.value.newPassword){c.warning("请填写完整密码信息");return}c.success("密码修改成功"),r.value.currentPassword="",r.value.newPassword=""},p=()=>{localStorage.removeItem("learnsphere-cache"),c.success("本地缓存已清理")},m=async()=>{await v.logout(),g.push("/")};return(P,t)=>(j(),W("div",Ge,[t[38]||(t[38]=e("div",{class:"page-header"},[e("h1",null,"系统设置"),e("p",null,"管理您的偏好设置与账户信息")],-1)),e("div",Qe,[n(i(ne),{class:"settings-nav-card",bordered:!1},{default:S(()=>[e("div",{class:ee(["nav-item",{active:d.value==="general"}]),onClick:t[0]||(t[0]=l=>d.value="general")},[e("div",Ye,[n(i(Ke))]),t[13]||(t[13]=e("span",null,"通用设置",-1))],2),e("div",{class:ee(["nav-item",{active:d.value==="account"}]),onClick:t[1]||(t[1]=l=>d.value="account")},[e("div",qe,[n(i(Me))]),t[14]||(t[14]=e("span",null,"账户安全",-1))],2),e("div",{class:ee(["nav-item",{active:d.value==="notifications"}]),onClick:t[2]||(t[2]=l=>d.value="notifications")},[e("div",Ze,[n(i(We))]),t[15]||(t[15]=e("span",null,"通知提醒",-1))],2),t[17]||(t[17]=e("div",{class:"divider"},null,-1)),e("div",{class:"nav-item danger",onClick:m},[e("div",et,[n(i(je))]),t[16]||(t[16]=e("span",null,"退出登录",-1))])]),_:1}),n(i(ne),{class:"settings-content-card",bordered:!1},{default:S(()=>[d.value==="general"?(j(),W("div",tt,[t[24]||(t[24]=e("div",{class:"panel-header"},[e("h2",null,"通用设置"),e("p",null,"自定义界面外观与交互体验")],-1)),e("div",st,[e("div",at,[t[18]||(t[18]=e("div",{class:"label"},[e("div",{class:"title"},"界面主题"),e("div",{class:"desc"},"选择您喜欢的界面风格")],-1)),e("div",lt,[n(i(re),{value:f.value.theme,"onUpdate:value":t[3]||(t[3]=l=>f.value.theme=l),options:z,class:"w-40"},null,8,["value"])])]),e("div",ot,[t[19]||(t[19]=e("div",{class:"label"},[e("div",{class:"title"},"系统语言"),e("div",{class:"desc"},"切换系统显示语言")],-1)),e("div",it,[n(i(re),{value:f.value.language,"onUpdate:value":t[4]||(t[4]=l=>f.value.language=l),options:w,class:"w-40"},null,8,["value"])])])]),e("div",nt,[e("div",rt,[t[20]||(t[20]=e("div",{class:"label"},[e("div",{class:"title"},"自动播放音频"),e("div",{class:"desc"},"在查看单词或例句时自动朗读")],-1)),e("div",dt,[n(i(E),{value:f.value.autoPlayAudio,"onUpdate:value":t[5]||(t[5]=l=>f.value.autoPlayAudio=l)},null,8,["value"])])])]),e("div",ut,[e("div",ct,[t[22]||(t[22]=e("div",{class:"label"},[e("div",{class:"title"},"清除缓存"),e("div",{class:"desc"},"释放本地存储空间，不影响账号数据")],-1)),e("div",vt,[n(i(F),{secondary:"",type:"warning",onClick:p},{icon:S(()=>[n(i(Ee),{class:"w-4 h-4"})]),default:S(()=>[t[21]||(t[21]=T(" 立即清除 ",-1))]),_:1})])])]),e("div",ht,[n(i(F),{type:"primary",size:"large",onClick:R},{default:S(()=>[...t[23]||(t[23]=[T("保存更改",-1)])]),_:1})])])):te("",!0),d.value==="account"?(j(),W("div",bt,[t[32]||(t[32]=e("div",{class:"panel-header"},[e("h2",null,"账户安全"),e("p",null,"更新您的个人信息与密码")],-1)),e("div",gt,[e("div",ft,[n(i(Le),{size:80,src:i(v).avatar},null,8,["src"]),e("div",pt,[e("div",mt,de(r.value.username),1),e("div",wt,de(r.value.email),1),n(i(F),{text:"",type:"primary"},{default:S(()=>[...t[25]||(t[25]=[T("更换头像",-1)])]),_:1})])])]),e("div",yt,[e("div",kt,[t[26]||(t[26]=e("label",null,"用户名",-1)),n(i(L),{value:r.value.username,"onUpdate:value":t[6]||(t[6]=l=>r.value.username=l),placeholder:"Username"},null,8,["value"])]),e("div",xt,[t[27]||(t[27]=e("label",null,"邮箱地址",-1)),n(i(L),{value:r.value.email,"onUpdate:value":t[7]||(t[7]=l=>r.value.email=l),placeholder:"Email",disabled:""},null,8,["value"])])]),e("div",Ct,[t[30]||(t[30]=e("h3",null,"修改密码",-1)),e("div",_t,[t[28]||(t[28]=e("label",null,"当前密码",-1)),n(i(L),{type:"password","show-password-on":"click",value:r.value.currentPassword,"onUpdate:value":t[8]||(t[8]=l=>r.value.currentPassword=l),placeholder:"Current Password"},null,8,["value"])]),e("div",St,[t[29]||(t[29]=e("label",null,"新密码",-1)),n(i(L),{type:"password","show-password-on":"click",value:r.value.newPassword,"onUpdate:value":t[9]||(t[9]=l=>r.value.newPassword=l),placeholder:"New Password"},null,8,["value"])])]),e("div",Rt,[n(i(F),{type:"primary",size:"large",onClick:u},{default:S(()=>[...t[31]||(t[31]=[T("更新信息",-1)])]),_:1})])])):te("",!0),d.value==="notifications"?(j(),W("div",Bt,[t[37]||(t[37]=e("div",{class:"panel-header"},[e("h2",null,"通知提醒"),e("p",null,"管理您的消息推送偏好")],-1)),e("div",$t,[e("div",Vt,[t[33]||(t[33]=e("div",{class:"label"},[e("div",{class:"title"},"邮件通知"),e("div",{class:"desc"},"接收账号安全与重要更新邮件")],-1)),e("div",zt,[n(i(E),{value:h.value.emailAlerts,"onUpdate:value":t[10]||(t[10]=l=>h.value.emailAlerts=l)},null,8,["value"])])]),e("div",Pt,[t[34]||(t[34]=e("div",{class:"label"},[e("div",{class:"title"},"学习提醒"),e("div",{class:"desc"},"每日定时提醒背单词")],-1)),e("div",Nt,[n(i(E),{value:h.value.studyReminders,"onUpdate:value":t[11]||(t[11]=l=>h.value.studyReminders=l)},null,8,["value"])])]),e("div",Ut,[t[35]||(t[35]=e("div",{class:"label"},[e("div",{class:"title"},"周报推送"),e("div",{class:"desc"},"每周一发送上周学习总结")],-1)),e("div",Ft,[n(i(E),{value:h.value.weeklyReport,"onUpdate:value":t[12]||(t[12]=l=>h.value.weeklyReport=l)},null,8,["value"])])])]),e("div",Tt,[n(i(F),{type:"primary",size:"large",onClick:x},{default:S(()=>[...t[36]||(t[36]=[T("保存设置",-1)])]),_:1})])])):te("",!0)]),_:1})])]))}},Kt=Te(Ot,[["__scopeId","data-v-00286fb3"]]);export{Kt as default};
