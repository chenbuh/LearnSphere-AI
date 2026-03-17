var g=(s,t,o)=>new Promise((c,r)=>{var l=a=>{try{n(o.next(a))}catch(i){r(i)}},d=a=>{try{n(o.throw(a))}catch(i){r(i)}},n=a=>a.done?c(a.value):Promise.resolve(a.value).then(l,d);n((o=o.apply(s,t)).next())});import{u as y,p as w,an as P,ao as Q}from"./index-DWq0_FoP.js";import{c as u,r as T}from"./vue-core-Qok9l9dg.js";const{message:p,dialog:f}=P(["message","dialog"],{configProviderProps:{theme:Q}});function A(){const s=y(),t=T({dailyQuota:5,usedToday:0,remainingToday:5,usagePercent:0,dailyTutorQuota:200,tutorUsedToday:0,tutorRemainingToday:200,tutorUsagePercent:0,isVip:!1,vipLevel:0}),o=u(()=>s.isVip()),c=u(()=>({0:"普通用户",1:"月度会员",2:"季度会员",3:"年度会员"})[s.vipLevel]||"普通用户"),r=()=>g(null,null,function*(){try{const e=yield w.get("/user/quota");if(e.code===200)return t.value=e.data,e.data}catch(e){console.error("获取配额信息失败:",e)}}),l=(e,v=1)=>o.value?!0:(n(e),!1),d=(e=1)=>g(null,null,function*(){return yield r(),t.value.remainingToday<e?(t.value.isVip?p.warning(`今日AI调用次数已用完 (${t.value.usedToday}/${t.value.dailyQuota})，请明天再试`):f.warning({title:"免费额度已用完",content:`您今日的免费额度已用完 (${t.value.usedToday}/${t.value.dailyQuota})。升级 VIP 可获得每日 50-200 次额度！`,positiveText:"立即升级",negativeText:"取消",onPositiveClick:()=>{window.location.href="/pricing"}}),!1):!0}),n=(e="AI 生成")=>{f.warning({title:"VIP 专属功能",content:`【${e}】是 VIP 专属功能。升级 VIP 即可解锁所有 AI 增强功能，享受智能学习体验！
      
✨ VIP 会员特权：
• 每日 50-200 次 AI 调用额度
• 所有 AI 生成功能无限制访问
• 智能批改和评测
• 个性化学习计划
• 无广告纯净体验
• 专属客服支持


💎 会员价格：
• 月度会员：¥10/月 (50次/天)
• 季度会员：¥25/季 (100次/天)
• 年度会员：¥88/年 (200次/天)`,positiveText:"立即升级",negativeText:"暂不升级",onPositiveClick:()=>{window.location.href="/pricing"}})},a=()=>{const e=t.value.remainingToday,v=t.value.dailyQuota;e<=2&&e>0&&p.warning(`今日剩余额度不足：${e}/${v}`)},i=u(()=>{const e=t.value.usagePercent;return e>=90?"error":e>=70?"warning":"success"}),m=u(()=>{const e=t.value.usagePercent;return e>=90?"#f56c6c":e>=70?"#e6a23c":"#67c23a"});return{isVip:o,vipLevelLabel:c,quotaInfo:t,fetchQuotaInfo:r,refreshQuota:()=>r(),setupQuotaListener:()=>{window.addEventListener("quota-updated",()=>{r()})},checkPermission:l,checkQuota:d,showUpgradeDialog:n,showQuotaWarning:a,getQuotaStatus:i,getQuotaColor:m}}export{A as u};
