var se=(t,f,g)=>new Promise((m,o)=>{var y=d=>{try{n(g.next(d))}catch(p){o(p)}},S=d=>{try{n(g.throw(d))}catch(p){o(p)}},n=d=>d.done?m(d.value):Promise.resolve(d.value).then(y,S);n((g=g.apply(t,f)).next())});import{A as Re,ap as Be,Y as Pe,e as ue,g as r,H as he,h as ae,f as C,t as ve,aq as oe,r as F,l as ze,m as pe,C as $e,n as Ve,L as Ne,ar as Ue,o as ie,w as A,as as ne,at as R,d as Fe,u as Ae,a as ge,B as H,N as Ie,au as Te}from"./index-DWq0_FoP.js";import{d as Oe,h as w,r as I,c as j,u as je,W as De,w as le,Q as K,X as L,Y as e,Z as a,M as s,f as u,P as B,J as re,q as M,a1 as ce}from"./vue-core-Qok9l9dg.js";import{d as Ee}from"./utils-xYuYZ4Xr.js";import{_ as He}from"./_plugin-vue_export-helper-DlAUqK2U.js";import{i as Me,U as fe,b as We,j as Ke,af as Le}from"./icons-FSQdP13O.js";import{N as Ye}from"./Select-DqNsRXvC.js";import{u as Xe}from"./use-merged-state-3vwOMuut.js";import{N as qe}from"./Avatar-B6D6ke41.js";import{N as Y}from"./Input-Do-5bQCM.js";import"./vendor-CcVv25CF.js";import"./Popover-BBNE_ZHP.js";import"./cssr-CRQrCRnn.js";import"./next-frame-once-C5Ksf8W7.js";import"./use-compitable-CoNRZgmE.js";import"./Suffix-wo5bWPcj.js";import"./Tag-Bz8Q9YAP.js";import"./index-BWJJgTLr.js";import"./attribute-Cz32yFEB.js";import"./Checkmark-BYmAJhYq.js";import"./Empty-DrmdyfSY.js";import"./use-locale-DXGQ8vop.js";import"./create-D3Vn69pI.js";function Ge(t){const{primaryColor:f,opacityDisabled:g,borderRadius:m,textColor3:o}=t;return Object.assign(Object.assign({},Be),{iconColor:o,textColor:"white",loadingColor:f,opacityDisabled:g,railColor:"rgba(0, 0, 0, .14)",railColorActive:f,buttonBoxShadow:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",buttonColor:"#FFF",railBorderRadiusSmall:m,railBorderRadiusMedium:m,railBorderRadiusLarge:m,buttonBorderRadiusSmall:m,buttonBorderRadiusMedium:m,buttonBorderRadiusLarge:m,boxShadowFocus:`0 0 0 2px ${Pe(f,{alpha:.2})}`})}const Je={common:Re,self:Ge},Qe=ue("switch",`
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
 `),ue("base-loading",`
 position: absolute;
 top: 50%;
 left: 50%;
 transform: translateX(-50%) translateY(-50%);
 font-size: calc(var(--n-button-width) - 4px);
 color: var(--n-loading-color);
 transition: color .3s var(--n-bezier);
 `,[he({left:"50%",top:"50%",originalTransform:"translateX(-50%) translateY(-50%)"})]),r("checked, unchecked",`
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
 `),ae("&:focus",[r("rail",`
 box-shadow: var(--n-box-shadow-focus);
 `)]),C("round",[r("rail","border-radius: calc(var(--n-rail-height) / 2);",[r("button","border-radius: calc(var(--n-button-height) / 2);")])]),ve("disabled",[ve("icon",[C("rubber-band",[C("pressed",[r("rail",[r("button","max-width: var(--n-button-width-pressed);")])]),r("rail",[ae("&:active",[r("button","max-width: var(--n-button-width-pressed);")])]),C("active",[C("pressed",[r("rail",[r("button","left: calc(100% - var(--n-offset) - var(--n-button-width-pressed));")])]),r("rail",[ae("&:active",[r("button","left: calc(100% - var(--n-offset) - var(--n-button-width-pressed));")])])])])])]),C("active",[r("rail",[r("button","left: calc(100% - var(--n-button-width) - var(--n-offset))")])]),r("rail",`
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
 `,[he()]),r("button",`
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
 `)]),C("active",[r("rail","background-color: var(--n-rail-color-active);")]),C("loading",[r("rail",`
 cursor: wait;
 `)]),C("disabled",[r("rail",`
 cursor: not-allowed;
 opacity: .5;
 `)])]),Ze=Object.assign(Object.assign({},pe.props),{size:String,value:{type:[String,Number,Boolean],default:void 0},loading:Boolean,defaultValue:{type:[String,Number,Boolean],default:!1},disabled:{type:Boolean,default:void 0},round:{type:Boolean,default:!0},"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array],checkedValue:{type:[String,Number,Boolean],default:!0},uncheckedValue:{type:[String,Number,Boolean],default:!1},railStyle:Function,rubberBand:{type:Boolean,default:!0},spinProps:Object,onChange:[Function,Array]});let W;const X=Oe({name:"Switch",props:Ze,slots:Object,setup(t){W===void 0&&(typeof CSS!="undefined"?typeof CSS.supports!="undefined"?W=CSS.supports("width","max(1px)"):W=!1:W=!0);const{mergedClsPrefixRef:f,inlineThemeDisabled:g,mergedComponentPropsRef:m}=ze(t),o=pe("Switch","-switch",Qe,Je,t,f),y=$e(t,{mergedSize(l){var P,z;if(t.size!==void 0)return t.size;if(l)return l.mergedSize.value;const U=(z=(P=m==null?void 0:m.value)===null||P===void 0?void 0:P.Switch)===null||z===void 0?void 0:z.size;return U||"medium"}}),{mergedSizeRef:S,mergedDisabledRef:n}=y,d=I(t.defaultValue),p=je(t,"value"),b=Xe(p,d),h=j(()=>b.value===t.checkedValue),v=I(!1),k=I(!1),N=j(()=>{const{railStyle:l}=t;if(l)return l({focused:k.value,checked:h.value})});function T(l){const{"onUpdate:value":P,onChange:z,onUpdateValue:U}=t,{nTriggerFormInput:J,nTriggerFormChange:Q}=y;P&&ie(P,l),U&&ie(U,l),z&&ie(z,l),d.value=l,J(),Q()}function q(){const{nTriggerFormFocus:l}=y;l()}function G(){const{nTriggerFormBlur:l}=y;l()}function _(){t.loading||n.value||(b.value!==t.checkedValue?T(t.checkedValue):T(t.uncheckedValue))}function i(){k.value=!0,q()}function c(){k.value=!1,G(),v.value=!1}function x(l){t.loading||n.value||l.key===" "&&(b.value!==t.checkedValue?T(t.checkedValue):T(t.uncheckedValue),v.value=!1)}function D(l){t.loading||n.value||l.key===" "&&(l.preventDefault(),v.value=!0)}const de=j(()=>{const{value:l}=S,{self:{opacityDisabled:P,railColor:z,railColorActive:U,buttonBoxShadow:J,buttonColor:Q,boxShadowFocus:me,loadingColor:be,textColor:_e,iconColor:we,[A("buttonHeight",l)]:$,[A("buttonWidth",l)]:ye,[A("buttonWidthPressed",l)]:ke,[A("railHeight",l)]:V,[A("railWidth",l)]:E,[A("railBorderRadius",l)]:Se,[A("buttonBorderRadius",l)]:xe},common:{cubicBezierEaseInOut:Ce}}=o.value;let Z,ee,te;return W?(Z=`calc((${V} - ${$}) / 2)`,ee=`max(${V}, ${$})`,te=`max(${E}, calc(${E} + ${$} - ${V}))`):(Z=ne((R(V)-R($))/2),ee=ne(Math.max(R(V),R($))),te=R(V)>R($)?E:ne(R(E)+R($)-R(V))),{"--n-bezier":Ce,"--n-button-border-radius":xe,"--n-button-box-shadow":J,"--n-button-color":Q,"--n-button-width":ye,"--n-button-width-pressed":ke,"--n-button-height":$,"--n-height":ee,"--n-offset":Z,"--n-opacity-disabled":P,"--n-rail-border-radius":Se,"--n-rail-color":z,"--n-rail-color-active":U,"--n-rail-height":V,"--n-rail-width":E,"--n-width":te,"--n-box-shadow-focus":me,"--n-loading-color":be,"--n-text-color":_e,"--n-icon-color":we}}),O=g?Ve("switch",j(()=>S.value[0]),de,t):void 0;return{handleClick:_,handleBlur:c,handleFocus:i,handleKeyup:x,handleKeydown:D,mergedRailStyle:N,pressed:v,mergedClsPrefix:f,mergedValue:b,checked:h,mergedDisabled:n,cssVars:g?void 0:de,themeClass:O==null?void 0:O.themeClass,onRender:O==null?void 0:O.onRender}},render(){const{mergedClsPrefix:t,mergedDisabled:f,checked:g,mergedRailStyle:m,onRender:o,$slots:y}=this;o==null||o();const{checked:S,unchecked:n,icon:d,"checked-icon":p,"unchecked-icon":b}=y,h=!(oe(d)&&oe(p)&&oe(b));return w("div",{role:"switch","aria-checked":g,class:[`${t}-switch`,this.themeClass,h&&`${t}-switch--icon`,g&&`${t}-switch--active`,f&&`${t}-switch--disabled`,this.round&&`${t}-switch--round`,this.loading&&`${t}-switch--loading`,this.pressed&&`${t}-switch--pressed`,this.rubberBand&&`${t}-switch--rubber-band`],tabindex:this.mergedDisabled?void 0:0,style:this.cssVars,onClick:this.handleClick,onFocus:this.handleFocus,onBlur:this.handleBlur,onKeyup:this.handleKeyup,onKeydown:this.handleKeydown},w("div",{class:`${t}-switch__rail`,"aria-hidden":"true",style:m},F(S,v=>F(n,k=>v||k?w("div",{"aria-hidden":!0,class:`${t}-switch__children-placeholder`},w("div",{class:`${t}-switch__rail-placeholder`},w("div",{class:`${t}-switch__button-placeholder`}),v),w("div",{class:`${t}-switch__rail-placeholder`},w("div",{class:`${t}-switch__button-placeholder`}),k)):null)),w("div",{class:`${t}-switch__button`},F(d,v=>F(p,k=>F(b,N=>w(Ne,null,{default:()=>this.loading?w(Ue,Object.assign({key:"loading",clsPrefix:t,strokeWidth:20},this.spinProps)):this.checked&&(k||v)?w("div",{class:`${t}-switch__button-icon`,key:k?"checked-icon":"icon"},k||v):!this.checked&&(N||v)?w("div",{class:`${t}-switch__button-icon`,key:N?"unchecked-icon":"icon"},N||v):null})))),F(S,v=>v&&w("div",{key:"checked",class:`${t}-switch__checked`},v)),F(n,v=>v&&w("div",{key:"unchecked",class:`${t}-switch__unchecked`},v)))))}}),et={class:"page-container"},tt={class:"page-header"},st={class:"settings-layout"},at={class:"icon-box"},ot={class:"icon-box"},it={class:"icon-box"},nt={class:"icon-box"},lt={key:0,class:"settings-panel"},rt={class:"panel-header"},ct={class:"setting-group"},dt={class:"setting-item"},ut={class:"label"},ht={class:"title"},vt={class:"desc"},gt={class:"control"},ft={class:"setting-group"},pt={class:"setting-item"},mt={class:"label"},bt={class:"title"},_t={class:"desc"},wt={class:"control"},yt={class:"setting-group no-border"},kt={class:"setting-item"},St={class:"label"},xt={class:"title"},Ct={class:"desc"},Rt={class:"control"},Bt={class:"panel-footer"},Pt={key:1,class:"settings-panel"},zt={class:"panel-header"},$t={class:"setting-group"},Vt={class:"profile-preview"},Nt={class:"profile-info"},Ut={class:"username"},Ft={class:"email"},At={class:"setting-group"},It={class:"form-item"},Tt={class:"form-item"},Ot={class:"setting-group"},jt={class:"form-item"},Dt={class:"form-item"},Et={class:"panel-footer"},Ht={key:2,class:"settings-panel"},Mt={class:"panel-header"},Wt={class:"setting-group"},Kt={class:"setting-item"},Lt={class:"label"},Yt={class:"title"},Xt={class:"desc"},qt={class:"control"},Gt={class:"setting-item"},Jt={class:"label"},Qt={class:"title"},Zt={class:"desc"},es={class:"control"},ts={class:"setting-item"},ss={class:"label"},as={class:"title"},os={class:"desc"},is={class:"control"},ns={class:"panel-footer"},ls={__name:"SettingsView",setup(t){const f=Fe(),g=Ae(),m=De(),{t:o,locale:y}=Ee(),S=j(()=>y.value==="en-US"),n=(_,i)=>S.value?i:_,d=I("general"),p=I({language:localStorage.getItem("user_language_preference")||"zh-CN",autoPlayAudio:localStorage.getItem("user_autoplay_preference")!=="false",soundEffects:!0});le(()=>p.value.language,_=>{y.value=_});const b=I({emailAlerts:!0,studyReminders:!0,weeklyReport:!0}),h=I({username:g.username,email:g.email,currentPassword:"",newPassword:""});le(()=>g.username,_=>{h.value.username=_}),le(()=>g.email,_=>{h.value.email=_});const v=j(()=>[{label:S.value?"Chinese (Simplified)":"简体中文",value:"zh-CN"},{label:"English",value:"en-US"}]),k=()=>{localStorage.setItem("user_language_preference",p.value.language),localStorage.setItem("user_autoplay_preference",p.value.autoPlayAudio),y.value=p.value.language,f.success(o("settings.general.save"))},N=()=>{f.success(o("settings.general.save"))},T=()=>{if(!h.value.currentPassword||!h.value.newPassword){f.warning(n("请填写完整密码信息","Please complete both password fields."));return}f.success(n("密码修改成功","Password updated successfully.")),h.value.currentPassword="",h.value.newPassword=""},q=()=>se(null,null,function*(){try{typeof window!="undefined"&&window.speechSynthesis&&window.speechSynthesis.cancel();const _=["learnsphere-token","userInfo","user_language_preference","user_autoplay_preference","loglevel"],i=[];for(let x=0;x<localStorage.length;x++){const D=localStorage.key(x);D&&!_.includes(D)&&i.push(D)}i.forEach(x=>localStorage.removeItem(x));const c=["grammarHistory","readingHistory","writingHistory","listeningHistory"];yield Promise.all(c.map(x=>Te(x))),localStorage.removeItem("learnsphere-cache"),console.log("[Settings] Cache cleared. Removed keys:",i,"and IndexedDB stores"),f.success(n("系统缓存已清理","System cache has been cleared."))}catch(_){console.error("[Settings] Failed to clear cache:",_),f.error(n("缓存清理过程中出现错误","An error occurred while clearing cache."))}}),G=()=>se(null,null,function*(){yield g.logout(),m.push("/")});return(_,i)=>(K(),L("div",et,[e("div",tt,[e("h1",null,a(s(o)("settings.title")),1),e("p",null,a(s(o)("settings.subtitle")),1)]),e("div",st,[u(s(ge),{class:"settings-nav-card",bordered:!1},{default:B(()=>[e("div",{class:re(["nav-item",{active:d.value==="general"}]),onClick:i[0]||(i[0]=c=>d.value="general")},[e("div",at,[u(s(Me))]),e("span",null,a(s(o)("settings.general.tab")),1)],2),e("div",{class:re(["nav-item",{active:d.value==="account"}]),onClick:i[1]||(i[1]=c=>d.value="account")},[e("div",ot,[u(s(fe))]),e("span",null,a(s(o)("settings.account.tab")),1)],2),e("div",{class:re(["nav-item",{active:d.value==="notifications"}]),onClick:i[2]||(i[2]=c=>d.value="notifications")},[e("div",it,[u(s(We))]),e("span",null,a(s(o)("settings.notifications.tab")),1)],2),i[12]||(i[12]=e("div",{class:"divider"},null,-1)),e("div",{class:"nav-item danger",onClick:G},[e("div",nt,[u(s(Ke))]),e("span",null,a(s(o)("menu.logout")),1)])]),_:1}),u(s(ge),{class:"settings-content-card",bordered:!1},{default:B(()=>[d.value==="general"?(K(),L("div",lt,[e("div",rt,[e("h2",null,a(s(o)("settings.general.title")),1),e("p",null,a(s(o)("settings.general.subtitle")),1)]),e("div",ct,[e("div",dt,[e("div",ut,[e("div",ht,a(s(o)("settings.general.language.title")),1),e("div",vt,a(s(o)("settings.general.language.desc")),1)]),e("div",gt,[u(s(Ye),{value:p.value.language,"onUpdate:value":i[3]||(i[3]=c=>p.value.language=c),options:v.value,class:"language-select"},null,8,["value","options"])])])]),e("div",ft,[e("div",pt,[e("div",mt,[e("div",bt,a(s(o)("settings.general.autoPlay.title")),1),e("div",_t,a(s(o)("settings.general.autoPlay.desc")),1)]),e("div",wt,[u(s(X),{value:p.value.autoPlayAudio,"onUpdate:value":i[4]||(i[4]=c=>p.value.autoPlayAudio=c)},null,8,["value"])])])]),e("div",yt,[e("div",kt,[e("div",St,[e("div",xt,a(s(o)("settings.general.clearCache.title")),1),e("div",Ct,a(s(o)("settings.general.clearCache.desc")),1)]),e("div",Rt,[u(s(H),{secondary:"",type:"warning",onClick:q},{icon:B(()=>[u(s(Le),{class:"w-4 h-4"})]),default:B(()=>[M(" "+a(s(o)("settings.general.clearCache.button")),1)]),_:1})])])]),e("div",Bt,[u(s(H),{type:"primary",size:"large",onClick:k},{default:B(()=>[M(a(s(o)("settings.general.save")),1)]),_:1})])])):ce("",!0),d.value==="account"?(K(),L("div",Pt,[e("div",zt,[e("h2",null,a(s(o)("settings.account.title")),1),e("p",null,a(s(o)("settings.account.subtitle")),1)]),e("div",$t,[e("div",Vt,[u(s(qe),{size:80,src:s(g).avatar},{default:B(()=>[u(s(Ie),{component:s(fe)},null,8,["component"])]),_:1},8,["src"]),e("div",Nt,[e("div",Ut,a(h.value.username),1),e("div",Ft,a(h.value.email),1),u(s(H),{text:"",type:"primary"},{default:B(()=>[M(a(n("更换头像","Change Avatar")),1)]),_:1})])])]),e("div",At,[e("div",It,[e("label",null,a(n("用户名","Username")),1),u(s(Y),{value:h.value.username,"onUpdate:value":i[5]||(i[5]=c=>h.value.username=c),placeholder:"Username"},null,8,["value"])]),e("div",Tt,[e("label",null,a(n("邮箱地址","Email Address")),1),u(s(Y),{value:h.value.email,"onUpdate:value":i[6]||(i[6]=c=>h.value.email=c),placeholder:"Email",disabled:""},null,8,["value"])])]),e("div",Ot,[e("h3",null,a(n("修改密码","Change Password")),1),e("div",jt,[e("label",null,a(n("当前密码","Current Password")),1),u(s(Y),{type:"password","show-password-on":"click",value:h.value.currentPassword,"onUpdate:value":i[7]||(i[7]=c=>h.value.currentPassword=c),placeholder:"Current Password"},null,8,["value"])]),e("div",Dt,[e("label",null,a(n("新密码","New Password")),1),u(s(Y),{type:"password","show-password-on":"click",value:h.value.newPassword,"onUpdate:value":i[8]||(i[8]=c=>h.value.newPassword=c),placeholder:"New Password"},null,8,["value"])])]),e("div",Et,[u(s(H),{type:"primary",size:"large",onClick:T},{default:B(()=>[M(a(n("更新信息","Update")),1)]),_:1})])])):ce("",!0),d.value==="notifications"?(K(),L("div",Ht,[e("div",Mt,[e("h2",null,a(s(o)("settings.notifications.title")),1),e("p",null,a(s(o)("settings.notifications.subtitle")),1)]),e("div",Wt,[e("div",Kt,[e("div",Lt,[e("div",Yt,a(n("邮件通知","Email Alerts")),1),e("div",Xt,a(n("接收账号安全与重要更新邮件","Receive security and important account update emails")),1)]),e("div",qt,[u(s(X),{value:b.value.emailAlerts,"onUpdate:value":i[9]||(i[9]=c=>b.value.emailAlerts=c)},null,8,["value"])])]),e("div",Gt,[e("div",Jt,[e("div",Qt,a(n("学习提醒","Study Reminders")),1),e("div",Zt,a(n("每日定时提醒背单词","Daily reminders for study tasks")),1)]),e("div",es,[u(s(X),{value:b.value.studyReminders,"onUpdate:value":i[10]||(i[10]=c=>b.value.studyReminders=c)},null,8,["value"])])]),e("div",ts,[e("div",ss,[e("div",as,a(n("周报推送","Weekly Report")),1),e("div",os,a(n("每周一发送上周学习总结","Send last week learning summary every Monday")),1)]),e("div",is,[u(s(X),{value:b.value.weeklyReport,"onUpdate:value":i[11]||(i[11]=c=>b.value.weeklyReport=c)},null,8,["value"])])])]),e("div",ns,[u(s(H),{type:"primary",size:"large",onClick:N},{default:B(()=>[M(a(s(o)("settings.general.save")),1)]),_:1})])])):ce("",!0)]),_:1})])]))}},Vs=He(ls,[["__scopeId","data-v-c64a8c14"]]);export{Vs as default};
