import{K as u,P as m,Q as V,R as ie,V as N,Y as ne,al as se,_ as ue,g as de,r as s,q as pe,d as x,o as c,b as w,a,w as o,u as t,B as d,i as p,au as me,F,y as R,h as ce,ae as ve,k as G,c as q,e as K,z as fe,v as Q,N as ye,l as v}from"./index-Dy9YIUY0.js";import{S as O}from"./sparkles-BTw7rQQa.js";import{P as be}from"./plus-DXfaGsVi.js";import{N as ge}from"./Popconfirm-DauIl7HR.js";import{N as C}from"./Space-kLet4wNH.js";import{N as he,a as xe}from"./Tabs-BUKiDAl5.js";import{N as g}from"./Input-CwQxmPcH.js";import{N as we,a as ke,b as Te}from"./DataTable-B7X6k7M7.js";import{N as Ce,a as f}from"./FormItem-yf4VEjCC.js";import{N as Ne}from"./Alert-D8Ouedfu.js";import"./Tooltip-CFuMbi_-.js";import"./get-CZgJeNp6.js";import"./use-locale-C9scqsBf.js";import"./next-frame-once-C5Ksf8W7.js";import"./get-slot-Bk_rJcZu.js";import"./Add-CMA6rX6o.js";import"./toNumber-d5vNgmia.js";import"./Checkbox-4p1lkcR6.js";const Ie=u("input-group",`
 display: inline-flex;
 width: 100%;
 flex-wrap: nowrap;
 vertical-align: bottom;
`,[m(">",[u("input",[m("&:not(:last-child)",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `),m("&:not(:first-child)",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 margin-left: -1px!important;
 `)]),u("button",[m("&:not(:last-child)",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `,[V("state-border, border",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `)]),m("&:not(:first-child)",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `,[V("state-border, border",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `)])]),m("*",[m("&:not(:last-child)",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `,[m(">",[u("input",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `),u("base-selection",[u("base-selection-label",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `),u("base-selection-tags",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `),V("box-shadow, border, state-border",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `)])])]),m("&:not(:first-child)",`
 margin-left: -1px!important;
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `,[m(">",[u("input",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `),u("base-selection",[u("base-selection-label",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `),u("base-selection-tags",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `),V("box-shadow, border, state-border",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `)])])])])])]),Ve={},Ae=ie({name:"InputGroup",props:Ve,setup(I){const{mergedClsPrefixRef:n}=ne(I);return se("-input-group",Ie,n),{mergedClsPrefix:n}},render(){const{mergedClsPrefix:I}=this;return N("div",{class:`${I}-input-group`},this.$slots)}}),$e={class:"vocabulary-page"},Se={class:"page-header"},ze={style:{"margin-top":"16px"}},Pe={class:"pagination"},_e={key:0},Ue={key:1},Me={__name:"Vocabulary",setup(I){const n=de(),A=s(!1),M=s([]),B=s(0),k=s(1),E=s(10),$=s(""),S=s(""),z=s(!1),h=s(!1),T=s(!1),j=s(null),P=s(!1),y=s(null),r=s({word:"",phonetic:"",definition:"",translation:"",example:"",exampleTranslation:"",examType:"cet4",difficulty:3,frequency:50}),L=[{label:"全部",value:""},{label:"CET-4",value:"cet4"},{label:"CET-6",value:"cet6"},{label:"IELTS",value:"ielts"},{label:"TOEFL",value:"toefl"},{label:"GRE",value:"gre"}],Y=[{title:"ID",key:"id",width:60},{title:"单词",key:"word",width:150},{title:"音标",key:"phonetic",width:120},{title:"翻译",key:"translation",width:200},{title:"考试类型",key:"examType",width:100},{title:"难度",key:"difficulty",width:80},{title:"操作",key:"actions",width:150,render:i=>N(C,null,{default:()=>[N(d,{size:"small",onClick:()=>W(i)},{default:()=>"编辑"}),N(ge,{onPositiveClick:()=>Z(i.id)},{trigger:()=>N(d,{size:"small",type:"error"},{default:()=>"删除"}),default:()=>"确定要删除吗？"})]})}],b=async()=>{A.value=!0;try{const i=await v.getVocabularyList({page:k.value,size:E.value,keyword:$.value,examType:S.value});M.value=i.data.records,B.value=i.data.total}catch{n.error("获取词汇列表失败")}finally{A.value=!1}},_=()=>{k.value=1,b()},H=i=>{k.value=i,b()},J=()=>{T.value=!1,h.value=!0,r.value={word:"",phonetic:"",definition:"",translation:"",example:"",exampleTranslation:"",examType:"cet4",difficulty:3,frequency:50}},W=i=>{T.value=!0,h.value=!0,r.value={...i}},X=async()=>{try{T.value?(await v.updateVocabulary(r.value.id,r.value),n.success("更新成功")):(await v.addVocabulary(r.value),n.success("添加成功")),h.value=!1,b()}catch{n.error(T.value?"更新失败":"添加失败")}},Z=async i=>{try{await v.deleteVocabulary(i),n.success("删除成功"),b()}catch{n.error("删除失败")}},ee=async()=>{if(!r.value.word){n.warning("请先输入单词");return}const i=n.loading("AI 正在思考中...",{duration:0});try{const e=await v.generateVocabularyDetails(r.value.word);if(e.code===200){const{id:l,examType:U}=r.value;r.value={...e.data,id:l,examType:U||e.data.examType},n.success("AI 补全成功")}}catch(e){console.error("AI 补全失败:",e),n.error("AI 补全失败: "+(e.response?.data?.msg||e.message))}finally{i.destroy()}},te=async()=>{z.value=!0;const i=n.loading("正在批量补全数据，请稍候...",{duration:0});try{const e=await v.batchGenerateVocabularyDetails(20);n.success(e.data),b()}catch{n.error("批量补全失败")}finally{i.destroy(),z.value=!1}},ae=async()=>{const i=n.loading("正在全库排查重复词汇并清理中...",{duration:0});try{const e=await v.deduplicateVocabulary();n.success(e.data),b()}catch{n.error("去重失败")}finally{i.destroy()}},D=async()=>{const i=`
单词: ${r.value.word||""}
音标: ${r.value.phonetic||""}
翻译: ${r.value.translation||""}
释义: ${r.value.definition||""}
例句: ${r.value.example||""}
例句翻译: ${r.value.exampleTranslation||""}
  `.trim();if(!i||i.length<10){n.warning("请至少填写一些内容后再进行质检");return}P.value=!0;try{const e=await v.checkContentQuality({content:i,contentType:"vocabulary"});y.value=e.data,e.data.passed?n.success(`质检通过！评分: ${e.data.score}/100`):n.warning(`发现 ${e.data.issues.length} 个问题，评分: ${e.data.score}/100`)}catch(e){n.error("AI 质检失败: "+(e.response?.data?.msg||e.message))}finally{P.value=!1}},le=i=>({high:"error",medium:"warning",low:"info"})[i]||"default",re=i=>({spelling:"拼写",sensitive:"敏感词",format:"格式",grammar:"语法"})[i]||i,oe=i=>{for(const e in r.value)if(typeof r.value[e]=="string"&&r.value[e].includes(i.originalText)){r.value[e]=r.value[e].replace(i.originalText,i.suggestion),n.success("已应用修复建议"),D();return}n.warning("未找到需要修复的内容")};return pe(()=>{b()}),(i,e)=>(c(),x("div",$e,[w("header",Se,[e[15]||(e[15]=w("div",null,[w("h1",null,"词汇库管理"),w("p",null,"管理平台词汇资源")],-1)),a(t(C),null,{default:o(()=>[a(t(d),{loading:z.value,secondary:"",type:"primary",onClick:te},{icon:o(()=>[a(t(O),{size:16})]),default:o(()=>[e[12]||(e[12]=p(" 批量 AI 补全 (20条) ",-1))]),_:1},8,["loading"]),a(t(d),{secondary:"",type:"warning",onClick:ae},{icon:o(()=>[a(t(me),{size:16})]),default:o(()=>[e[13]||(e[13]=p(" 全库去重 ",-1))]),_:1}),a(t(d),{type:"primary",onClick:J},{icon:o(()=>[a(t(be),{size:16})]),default:o(()=>[e[14]||(e[14]=p(" 添加词汇 ",-1))]),_:1})]),_:1})]),a(t(G),{class:"search-card"},{default:o(()=>[a(t(he),{value:S.value,"onUpdate:value":[e[0]||(e[0]=l=>S.value=l),_],type:"line",animated:""},{default:o(()=>[(c(),x(F,null,R(L,l=>a(t(xe),{key:l.value,name:l.value,tab:l.label},null,8,["name","tab"])),64))]),_:1},8,["value"]),w("div",ze,[a(t(C),{align:"center"},{default:o(()=>[a(t(g),{value:$.value,"onUpdate:value":e[1]||(e[1]=l=>$.value=l),placeholder:"搜索单词或翻译",style:{width:"300px"},onKeyup:ce(_,["enter"])},{prefix:o(()=>[a(t(ve),{size:16})]),_:1},8,["value"]),a(t(d),{type:"primary",onClick:_},{default:o(()=>[...e[16]||(e[16]=[p(" 搜索 ",-1)])]),_:1})]),_:1})])]),_:1}),a(t(G),{class:"table-card"},{default:o(()=>[a(t(we),{columns:Y,data:M.value,loading:A.value,bordered:!1},null,8,["data","loading"]),w("div",Pe,[a(t(ke),{page:k.value,"onUpdate:page":[e[2]||(e[2]=l=>k.value=l),H],"page-count":Math.ceil(B.value/E.value)},null,8,["page","page-count"])])]),_:1}),a(t(ye),{show:h.value,"onUpdate:show":e[11]||(e[11]=l=>h.value=l),preset:"card",title:T.value?"编辑词汇":"添加词汇",style:{width:"600px"}},{footer:o(()=>[a(t(C),{justify:"end"},{default:o(()=>[a(t(d),{onClick:e[10]||(e[10]=l=>h.value=!1)},{default:o(()=>[...e[20]||(e[20]=[p("取消",-1)])]),_:1}),a(t(d),{type:"primary",onClick:X},{default:o(()=>[...e[21]||(e[21]=[p("确定",-1)])]),_:1})]),_:1})]),default:o(()=>[a(t(Ce),{ref_key:"formRef",ref:j,model:r.value,"label-placement":"top"},{default:o(()=>[a(t(f),{label:"单词",path:"word"},{default:o(()=>[a(t(Ae),null,{default:o(()=>[a(t(g),{value:r.value.word,"onUpdate:value":e[3]||(e[3]=l=>r.value.word=l),placeholder:"输入单词"},null,8,["value"]),a(t(d),{type:"primary",ghost:"",onClick:ee},{default:o(()=>[...e[17]||(e[17]=[p(" AI 补全 ",-1)])]),_:1})]),_:1})]),_:1}),a(t(f),{label:"音标",path:"phonetic"},{default:o(()=>[a(t(g),{value:r.value.phonetic,"onUpdate:value":e[4]||(e[4]=l=>r.value.phonetic=l),placeholder:"输入音标"},null,8,["value"])]),_:1}),a(t(f),{label:"中文翻译",path:"translation"},{default:o(()=>[a(t(g),{value:r.value.translation,"onUpdate:value":e[5]||(e[5]=l=>r.value.translation=l),placeholder:"输入中文翻译",type:"textarea"},null,8,["value"])]),_:1}),a(t(f),{label:"英文释义",path:"definition"},{default:o(()=>[a(t(g),{value:r.value.definition,"onUpdate:value":e[6]||(e[6]=l=>r.value.definition=l),placeholder:"输入英文释义",type:"textarea"},null,8,["value"])]),_:1}),a(t(f),{label:"例句",path:"example"},{default:o(()=>[a(t(g),{value:r.value.example,"onUpdate:value":e[7]||(e[7]=l=>r.value.example=l),placeholder:"输入例句",type:"textarea"},null,8,["value"])]),_:1}),a(t(f),{label:"例句翻译",path:"exampleTranslation"},{default:o(()=>[a(t(g),{value:r.value.exampleTranslation,"onUpdate:value":e[8]||(e[8]=l=>r.value.exampleTranslation=l),placeholder:"输入例句翻译",type:"textarea"},null,8,["value"])]),_:1}),a(t(f),null,{default:o(()=>[a(t(C),{vertical:"",style:{width:"100%"}},{default:o(()=>[a(t(d),{secondary:"",type:"info",onClick:D,loading:P.value},{icon:o(()=>[a(t(O),{size:16})]),default:o(()=>[e[18]||(e[18]=p(" AI 质检 ",-1))]),_:1},8,["loading"]),y.value?(c(),q(t(Ne),{key:0,type:y.value.passed?"success":"warning",title:`质量评分: ${y.value.score}/100`},{default:o(()=>[y.value.issues&&y.value.issues.length>0?(c(),x("div",_e,[(c(!0),x(F,null,R(y.value.issues,(l,U)=>(c(),x("div",{key:U,style:{"margin-bottom":"8px"}},[a(t(fe),{type:le(l.severity),size:"small"},{default:o(()=>[p(Q(re(l.type)),1)]),_:2},1032,["type"]),p(" "+Q(l.message)+" ",1),l.suggestion&&l.originalText?(c(),q(t(d),{key:0,text:"",type:"primary",size:"tiny",onClick:Be=>oe(l)},{default:o(()=>[...e[19]||(e[19]=[p(" 应用建议 ",-1)])]),_:1},8,["onClick"])):K("",!0)]))),128))])):(c(),x("div",Ue," ✅ 内容质量良好，未发现问题！ "))]),_:1},8,["type","title"])):K("",!0)]),_:1})]),_:1}),a(t(f),{label:"考试类型",path:"examType"},{default:o(()=>[a(t(Te),{value:r.value.examType,"onUpdate:value":e[9]||(e[9]=l=>r.value.examType=l),options:L.filter(l=>l.value!==null)},null,8,["value","options"])]),_:1})]),_:1},8,["model"])]),_:1},8,["show","title"])]))}},tt=ue(Me,[["__scopeId","data-v-2c51c425"]]);export{tt as default};
