import{E as a,G as V,H as le,I as de,J as R,K as ne,L as ie,M as ce,O as ue,Q as Y,R as ve,U as be,V as I,W as F,X as me,Y as J,_ as ge,$ as he,a0 as pe,r as f,o as fe,a as _e,c as B,b,w as n,d as s,S as xe,u as o,N as ye,e,t as c,a1 as O,j as M,g,k as P,a2 as ke,F as D,x as G,a3 as we,a4 as ze,a5 as q,p as K,a6 as E,a7 as S,a8 as Ce,y as Q,i as W,h as Se,a9 as Ne,aa as H,ab as Te,l as Le,ac as Re,ad as Be,q as Me,s as Pe,ae as j}from"./index-DxUHCA-q.js";import{C as De}from"./clock-BMOIfxbi.js";import{N as Ie}from"./Statistic-t8PWF_Fh.js";import{U as Ue}from"./users-52l--UN_.js";const $e=a([V("table",`
 font-size: var(--n-font-size);
 font-variant-numeric: tabular-nums;
 line-height: var(--n-line-height);
 width: 100%;
 border-radius: var(--n-border-radius) var(--n-border-radius) 0 0;
 text-align: left;
 border-collapse: separate;
 border-spacing: 0;
 overflow: hidden;
 background-color: var(--n-td-color);
 border-color: var(--n-merged-border-color);
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 --n-merged-border-color: var(--n-border-color);
 `,[a("th",`
 white-space: nowrap;
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 text-align: inherit;
 padding: var(--n-th-padding);
 vertical-align: inherit;
 text-transform: none;
 border: 0px solid var(--n-merged-border-color);
 font-weight: var(--n-th-font-weight);
 color: var(--n-th-text-color);
 background-color: var(--n-th-color);
 border-bottom: 1px solid var(--n-merged-border-color);
 border-right: 1px solid var(--n-merged-border-color);
 `,[a("&:last-child",`
 border-right: 0px solid var(--n-merged-border-color);
 `)]),a("td",`
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 padding: var(--n-td-padding);
 color: var(--n-td-text-color);
 background-color: var(--n-td-color);
 border: 0px solid var(--n-merged-border-color);
 border-right: 1px solid var(--n-merged-border-color);
 border-bottom: 1px solid var(--n-merged-border-color);
 `,[a("&:last-child",`
 border-right: 0px solid var(--n-merged-border-color);
 `)]),R("bordered",`
 border: 1px solid var(--n-merged-border-color);
 border-radius: var(--n-border-radius);
 `,[a("tr",[a("&:last-child",[a("td",`
 border-bottom: 0 solid var(--n-merged-border-color);
 `)])])]),R("single-line",[a("th",`
 border-right: 0px solid var(--n-merged-border-color);
 `),a("td",`
 border-right: 0px solid var(--n-merged-border-color);
 `)]),R("single-column",[a("tr",[a("&:not(:last-child)",[a("td",`
 border-bottom: 0px solid var(--n-merged-border-color);
 `)])])]),R("striped",[a("tr:nth-of-type(even)",[a("td","background-color: var(--n-td-color-striped)")])]),ne("bottom-bordered",[a("tr",[a("&:last-child",[a("td",`
 border-bottom: 0px solid var(--n-merged-border-color);
 `)])])])]),le(V("table",`
 background-color: var(--n-td-color-modal);
 --n-merged-border-color: var(--n-border-color-modal);
 `,[a("th",`
 background-color: var(--n-th-color-modal);
 `),a("td",`
 background-color: var(--n-td-color-modal);
 `)])),de(V("table",`
 background-color: var(--n-td-color-popover);
 --n-merged-border-color: var(--n-border-color-popover);
 `,[a("th",`
 background-color: var(--n-th-color-popover);
 `),a("td",`
 background-color: var(--n-td-color-popover);
 `)]))]),Ve=Object.assign(Object.assign({},Y.props),{bordered:{type:Boolean,default:!0},bottomBordered:{type:Boolean,default:!0},singleLine:{type:Boolean,default:!0},striped:Boolean,singleColumn:Boolean,size:{type:String,default:"medium"}}),Fe=ie({name:"Table",props:Ve,setup(m){const{mergedClsPrefixRef:u,inlineThemeDisabled:y,mergedRtlRef:_}=ue(m),d=Y("Table","-table",$e,ve,m,u),x=be("Table",_,u),k=I(()=>{const{size:h}=m,{self:{borderColor:p,tdColor:N,tdColorModal:T,tdColorPopover:L,thColor:w,thColorModal:z,thColorPopover:U,thTextColor:C,tdTextColor:$,borderRadius:r,thFontWeight:t,lineHeight:l,borderColorModal:i,borderColorPopover:X,tdColorStriped:Z,tdColorStripedModal:ee,tdColorStripedPopover:te,[F("fontSize",h)]:oe,[F("tdPadding",h)]:se,[F("thPadding",h)]:ae},common:{cubicBezierEaseInOut:re}}=d.value;return{"--n-bezier":re,"--n-td-color":N,"--n-td-color-modal":T,"--n-td-color-popover":L,"--n-td-text-color":$,"--n-border-color":p,"--n-border-color-modal":i,"--n-border-color-popover":X,"--n-border-radius":r,"--n-font-size":oe,"--n-th-color":w,"--n-th-color-modal":z,"--n-th-color-popover":U,"--n-th-font-weight":t,"--n-th-text-color":C,"--n-line-height":l,"--n-td-padding":se,"--n-th-padding":ae,"--n-td-color-striped":Z,"--n-td-color-striped-modal":ee,"--n-td-color-striped-popover":te}}),v=y?me("table",I(()=>m.size[0]),k,m):void 0;return{rtlEnabled:x,mergedClsPrefix:u,cssVars:y?void 0:k,themeClass:v?.themeClass,onRender:v?.onRender}},render(){var m;const{mergedClsPrefix:u}=this;return(m=this.onRender)===null||m===void 0||m.call(this),ce("table",{class:[`${u}-table`,this.themeClass,{[`${u}-table--rtl`]:this.rtlEnabled,[`${u}-table--bottom-bordered`]:this.bottomBordered,[`${u}-table--bordered`]:this.bordered,[`${u}-table--single-line`]:this.singleLine,[`${u}-table--single-column`]:this.singleColumn,[`${u}-table--striped`]:this.striped}],style:this.cssVars},this.$slots)}});const Ee=J("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);const He=J("crown",[["path",{d:"M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",key:"1vdc57"}],["path",{d:"M5 21h14",key:"11awu3"}]]),je={class:"leaderboard-hero relative overflow-hidden"},Ae={class:"container relative py-20 text-center"},Oe={class:"hero-badge mb-6 mx-auto flex items-center gap-3"},Ge={class:"flex items-center gap-1.5"},qe={class:"flex items-center gap-1.5 opacity-80"},Ke={class:"container pb-40"},Qe={class:"stat-glass-card"},We={key:0,class:"podium-section mb-20 animate-fade-in"},Ye={class:"podium-grid"},Je={key:0,class:"podium-spot rank-2-spot"},Xe={class:"podium-user"},Ze={class:"podium-info text-center mt-4"},et={class:"font-bold text-white text-lg"},tt={class:"text-slate-400 text-sm"},ot={class:"podium-spot rank-1-spot"},st={class:"podium-user"},at={class:"crown-svg mb-2"},rt={class:"podium-info text-center mt-4"},lt={class:"font-black text-white text-xl"},dt={class:"text-yellow-500 font-bold"},nt={key:1,class:"podium-spot rank-3-spot"},it={class:"podium-user"},ct={class:"podium-info text-center mt-4"},ut={class:"font-bold text-white text-base"},vt={class:"text-amber-700 text-sm"},bt={class:"personal-status-header mb-8"},mt={class:"info-layout"},gt={class:"user-main"},ht={class:"rank-indicator"},pt={class:"value"},ft={class:"user-detail"},_t={class:"name-box"},xt={class:"nickname"},yt={class:"user-actions"},kt={class:"streak-badge"},wt={class:"value"},zt={class:"guest-msg"},Ct={class:"flex items-center gap-4"},St={class:"msg-icon"},Nt={class:"ranking-content-container"},Tt={class:"flex flex-col md:flex-row justify-between items-center mb-8 gap-6"},Lt={class:"search-box w-full md:w-64"},Rt={key:0},Bt={class:"rank-index"},Mt={class:"flex items-center gap-4"},Pt={class:"font-bold text-gray-100"},Dt={class:"text-xs text-gray-500"},It={class:"flex items-center gap-2"},Ut={class:"text-white font-black text-lg"},$t={class:"text-indigo-400 font-bold"},Vt={class:"hidden md:table-cell"},A=300,Ft={__name:"LeaderboardView",setup(m){const u=he(),y=pe(),_=f(!0),d=f([]),x=f(""),k=f({totalUsers:0,activeToday:0,avgStreak:0}),v=f(null),h=f(null),p=f(0),N=async()=>{try{const{code:r,data:t}=await j.getPublicStats();r===200&&(k.value=t)}catch(r){console.error("Failed to fetch statistics",r)}},T=async()=>{if(y.token)try{const{code:r,data:t}=await j.getMyRank();r===200&&(v.value=t)}catch(r){console.error("Failed to fetch my rank",r)}},L=async(r=!0)=>{d.value.length===0&&(_.value=!0);try{const{code:t,data:l}=await j.getLeaderboard();if(t===200&&(d.value=l,r)){const i=new Date;h.value=i,p.value=A,localStorage.setItem("leaderboard_last_sync",i.getTime().toString())}}catch(t){console.error("Failed to fetch leaderboard",t)}finally{_.value=!1}},w=()=>{L(!0),N(),T()},z=I(()=>{const r=d.value||[];return x.value?r.filter(t=>t.nickname.toLowerCase().includes(x.value.toLowerCase())):r}),U=I(()=>{const r=Math.floor(p.value/60),t=p.value%60;return`${r}:${t.toString().padStart(2,"0")}`});let C=null;const $=()=>{const r=localStorage.getItem("leaderboard_last_sync"),t=new Date().getTime();if(r){const l=parseInt(r),i=Math.floor((t-l)/1e3);i<A?(p.value=A-i,h.value=new Date(l),L(!1),N(),T()):w()}else w()};return fe(()=>{$(),C=setInterval(()=>{p.value>0?p.value--:w()},1e3)}),_e(()=>{C&&clearInterval(C)}),(r,t)=>(b(),B(o(Pe),{class:"min-h-screen bg-dark"},{default:n(()=>[s(xe),s(o(ye),null,{default:n(()=>[e("div",je,[t[5]||(t[5]=e("div",{class:"absolute inset-0 bg-gradient-to-b from-indigo-600/10 to-transparent"},null,-1)),e("div",Ae,[e("div",Oe,[e("div",Ge,[s(o(He),{size:16,class:"text-yellow-400"}),e("span",null,"下次同步: "+c(U.value),1)]),s(o(O),{vertical:"",style:{"background-color":"rgba(255,255,255,0.1)"}}),e("div",qe,[s(o(De),{size:14}),e("span",null,"更新于 "+c(h.value?h.value.toLocaleTimeString():"---"),1)])]),t[3]||(t[3]=e("h1",{class:"text-6xl font-black mb-6 tracking-tight text-white glow-text"},[M(" 巅峰"),e("span",{class:"text-indigo-500"},"学习榜")],-1)),t[4]||(t[4]=e("p",{class:"text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"}," 自律是通往卓越的必经之路。记录每一位语海征途中的先行者，见证知识改变命运的力量。 ",-1))])]),e("div",Ke,[s(o(ke),{"x-gap":"24","y-gap":"24",cols:"1 768:3",class:"mb-20 -mt-10 relative z-20"},{default:n(()=>[(b(),g(D,null,G({totalUsers:"累计学员",activeToday:"今日活跃",avgStreak:"平均打卡"},(l,i)=>s(o(we),{key:i},{default:n(()=>[e("div",Qe,[s(o(Ie),{label:l,value:k.value[i],class:"white-stats text-center"},ze({prefix:n(()=>[i==="totalUsers"?(b(),B(o(Ue),{key:0,size:24,class:"text-indigo-400 mr-2"})):i==="activeToday"?(b(),B(o(q),{key:1,size:24,class:"text-orange-400 mr-2"})):(b(),B(o(K),{key:2,size:24,class:"text-emerald-400 mr-2"}))]),_:2},[i==="avgStreak"?{name:"suffix",fn:n(()=>[t[6]||(t[6]=e("span",{class:"text-base ml-1"},"天",-1))]),key:"0"}:void 0]),1032,["label","value"])])]),_:2},1024)),64))]),_:1}),!_.value&&d.value.length>=3?(b(),g("div",We,[e("div",Ye,[d.value[1]?(b(),g("div",Je,[e("div",Xe,[s(o(E),{value:2,color:"#94a3b8",class:"rank-badge-top"},{default:n(()=>[s(o(S),{round:"",size:80,src:d.value[1].avatar,class:"border-4 border-slate-400 shadow-2xl"},null,8,["src"])]),_:1}),e("div",Ze,[e("div",et,c(d.value[1].nickname),1),e("div",tt,"连胜 "+c(d.value[1].consecutiveDays)+" 天",1)])]),t[7]||(t[7]=e("div",{class:"podium-base base-2"},[e("div",{class:"base-number"},"2")],-1))])):P("",!0),e("div",ot,[e("div",st,[e("div",at,[s(o(Ce),{size:32,class:"text-yellow-500"})]),s(o(E),{value:1,color:"#f59e0b",class:"rank-badge-top"},{default:n(()=>[s(o(S),{round:"",size:110,src:d.value[0].avatar,class:"border-4 border-yellow-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]"},null,8,["src"])]),_:1}),e("div",rt,[e("div",lt,c(d.value[0].nickname),1),e("div",dt,"领跑 "+c(d.value[0].consecutiveDays)+" 天",1)])]),t[8]||(t[8]=e("div",{class:"podium-base base-1"},[e("div",{class:"base-number"},"1")],-1))]),d.value[2]?(b(),g("div",nt,[e("div",it,[s(o(E),{value:3,color:"#b45309",class:"rank-badge-top"},{default:n(()=>[s(o(S),{round:"",size:70,src:d.value[2].avatar,class:"border-4 border-amber-700 shadow-2xl"},null,8,["src"])]),_:1}),e("div",ct,[e("div",ut,c(d.value[2].nickname),1),e("div",vt,"连胜 "+c(d.value[2].consecutiveDays)+" 天",1)])]),t[9]||(t[9]=e("div",{class:"podium-base base-3"},[e("div",{class:"base-number"},"3")],-1))])):P("",!0)])])):P("",!0),e("div",bt,[s(o(Q),{class:"personal-info-card",bordered:!1},{default:n(()=>[e("div",mt,[o(y).token&&v.value?(b(),g(D,{key:0},[e("div",gt,[e("div",ht,[t[10]||(t[10]=e("span",{class:"label"},"我的排名",-1)),e("span",pt,"#"+c(v.value.rank),1)]),s(o(O),{vertical:""}),e("div",ft,[s(o(S),{round:"",size:44,src:v.value.avatar,class:"border-2 border-indigo-500"},null,8,["src"]),e("div",_t,[e("div",xt,c(v.value.nickname),1),t[11]||(t[11]=e("div",{class:"motto text-xs text-gray-400"},"持续进步，正在全力冲刺巅峰",-1))])])]),e("div",yt,[e("div",kt,[t[12]||(t[12]=e("span",{class:"label"},"连续打卡",-1)),e("span",wt,c(v.value.consecutiveDays)+" 天",1)]),s(o(W),{type:"primary",size:"large",round:"",class:"action-btn",onClick:t[0]||(t[0]=l=>o(u).push("/dashboard"))},{default:n(()=>[...t[13]||(t[13]=[M(" 进入学习 ",-1)])]),_:1})])],64)):(b(),g(D,{key:1},[e("div",zt,[e("div",Ct,[e("div",St,[s(o(Se),{size:20,class:"text-indigo-400"})]),t[14]||(t[14]=e("div",null,[e("div",{class:"msg-title"},"开启你的巅峰学习之旅"),e("div",{class:"msg-desc"},"登录后即可在此查看你的实时排名与打卡成就")],-1))])]),s(o(W),{type:"primary",size:"large",round:"",class:"action-btn px-8",onClick:t[1]||(t[1]=l=>o(u).push("/login"))},{default:n(()=>[...t[15]||(t[15]=[M(" 立即加入 ",-1)])]),_:1})],64))])]),_:1})]),e("div",Nt,[e("div",Tt,[s(o(Ne),{type:"segment",class:"rank-filter-tabs w-full md:w-auto"},{default:n(()=>[s(o(H),{name:"overall",tab:"全站功勋榜"}),s(o(H),{name:"weekly",tab:"本周之星"}),s(o(H),{name:"monthly",tab:"月度黑马"})]),_:1}),e("div",Lt,[s(o(Te),{value:x.value,"onUpdate:value":t[2]||(t[2]=l=>x.value=l),placeholder:"搜索学员...",round:"",size:"large",class:"glass-input"},{prefix:n(()=>[s(o(Le),{size:18,class:"text-gray-500"})]),_:1},8,["value"])])]),s(o(Q),{class:"rank-card glass-card"},{default:n(()=>[s(o(Re),{show:_.value},{default:n(()=>[s(o(Fe),{bordered:!1,"single-line":!1,class:"main-rank-table"},{default:n(()=>[t[17]||(t[17]=e("thead",null,[e("tr",null,[e("th",{width:"100"},"排名"),e("th",null,"学员详情"),e("th",null,"连续打卡"),e("th",{width:"140"},"累计学习"),e("th",{width:"180",class:"hidden md:table-cell"},"学术勋章"),e("th",{width:"80"})])],-1)),z.value.length>0?(b(),g("tbody",Rt,[(b(!0),g(D,null,G(d.value.length>=3?z.value.slice(3):z.value,(l,i)=>(b(),g("tr",{key:l.id,class:"rank-row"},[e("td",null,[e("div",Bt,"#"+c(d.value.length>=3?i+4:i+1),1)]),e("td",null,[e("div",Mt,[s(o(S),{round:"",size:48,src:l.avatar||"https://ui-avatars.com/api/?name="+l.nickname},null,8,["src"]),e("div",null,[e("div",Pt,c(l.nickname),1),e("div",Dt,c(l.bio||"持之以恒，金石为开"),1)])])]),e("td",null,[e("div",It,[s(o(q),{size:16,class:"text-orange-500"}),e("span",Ut,c(l.consecutiveDays),1)])]),e("td",null,[e("div",$t,c(l.totalDays)+" 天",1)]),e("td",Vt,[s(o(Be),{size:"small",type:"success",ghost:"",round:""},{icon:n(()=>[s(o(K),{size:12})]),default:n(()=>[t[16]||(t[16]=M("稳步上升 ",-1))]),_:1})]),e("td",null,[s(o(Ee),{size:18,class:"text-gray-700"})])]))),128))])):P("",!0)]),_:1})]),_:1},8,["show"])]),_:1})])]),s(Me)]),_:1})]),_:1}))}},Ot=ge(Ft,[["__scopeId","data-v-2837fe33"]]);export{Ot as default};
