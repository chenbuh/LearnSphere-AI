import{I as me,e as $,f as S,h as N,l as ge,m as te,P as he,Q as le,R as _e,g as Z,j as ne,r as Pe,T as oe,U as Ie,v as j,n as Ce,V as se}from"./index-DahIAh76.js";import{a as Y,g as ze,w as be,m as Me,d as ve,h as k,r as V,z as ae,c as b,A as Ae,u as ee,o as Le}from"./vue-core-k66yWm0l.js";import{$ as de}from"./vendor-Ctmwp_ns.js";import{g as pe}from"./utils-D4YdDhUH.js";function je(t,e,l){var n;const c=Y(t,null);if(c===null)return;const o=(n=ze())===null||n===void 0?void 0:n.proxy;be(l,s),s(l.value),Me(()=>{s(void 0,l.value)});function s(r,a){if(!c)return;const d=c[e];a!==void 0&&h(d,a),r!==void 0&&u(d,r)}function h(r,a){r[a]||(r[a]=[]),r[a].splice(r[a].findIndex(d=>d===o),1)}function u(r,a){r[a]||(r[a]=[]),~r[a].findIndex(d=>d===o)||r[a].push(o)}}const K=me("n-form"),ke=me("n-form-item-insts"),We=$("form",[S("inline",`
 width: 100%;
 display: inline-flex;
 align-items: flex-start;
 align-content: space-around;
 `,[$("form-item",{width:"auto",marginRight:"18px"},[N("&:last-child",{marginRight:0})])])]);var qe=function(t,e,l,n){function c(o){return o instanceof l?o:new l(function(s){s(o)})}return new(l||(l=Promise))(function(o,s){function h(a){try{r(n.next(a))}catch(d){s(d)}}function u(a){try{r(n.throw(a))}catch(d){s(d)}}function r(a){a.done?o(a.value):c(a.value).then(h,u)}r((n=n.apply(t,e||[])).next())})};const Ve=Object.assign(Object.assign({},te.props),{inline:Boolean,labelWidth:[Number,String],labelAlign:String,labelPlacement:{type:String,default:"top"},model:{type:Object,default:()=>{}},rules:Object,disabled:Boolean,size:String,showRequireMark:{type:Boolean,default:void 0},requireMarkPlacement:String,showFeedback:{type:Boolean,default:!0},onSubmit:{type:Function,default:t=>{t.preventDefault()}},showLabel:{type:Boolean,default:void 0},validateMessages:Object}),Ue=ve({name:"Form",props:Ve,setup(t){const{mergedClsPrefixRef:e}=ge(t);te("Form","-form",We,he,t,e);const l={},n=V(void 0),c=u=>{const r=n.value;(r===void 0||u>=r)&&(n.value=u)};function o(u){return qe(this,arguments,void 0,function*(r,a=()=>!0){return yield new Promise((d,w)=>{const M=[];for(const i of le(l)){const I=l[i];for(const _ of I)_.path&&M.push(_.internalValidate(null,a))}Promise.all(M).then(i=>{const I=i.some(y=>!y.valid),_=[],W=[];i.forEach(y=>{var P,H;!((P=y.errors)===null||P===void 0)&&P.length&&_.push(y.errors),!((H=y.warnings)===null||H===void 0)&&H.length&&W.push(y.warnings)}),r&&r(_.length?_:void 0,{warnings:W.length?W:void 0}),I?w(_.length?_:void 0):d({warnings:W.length?W:void 0})})})})}function s(){for(const u of le(l)){const r=l[u];for(const a of r)a.restoreValidation()}}return ae(K,{props:t,maxChildLabelWidthRef:n,deriveMaxChildLabelWidth:c}),ae(ke,{formItems:l}),Object.assign({validate:o,restoreValidation:s},{mergedClsPrefix:e})},render(){const{mergedClsPrefix:t}=this;return k("form",{class:[`${t}-form`,this.inline&&`${t}-form--inline`],onSubmit:this.onSubmit},this.$slots)}}),{cubicBezierEaseInOut:fe}=_e;function Fe({name:t="fade-down",fromOffset:e="-4px",enterDuration:l=".3s",leaveDuration:n=".3s",enterCubicBezier:c=fe,leaveCubicBezier:o=fe}={}){return[N(`&.${t}-transition-enter-from, &.${t}-transition-leave-to`,{opacity:0,transform:`translateY(${e})`}),N(`&.${t}-transition-enter-to, &.${t}-transition-leave-from`,{opacity:1,transform:"translateY(0)"}),N(`&.${t}-transition-leave-active`,{transition:`opacity ${n} ${o}, transform ${n} ${o}`}),N(`&.${t}-transition-enter-active`,{transition:`opacity ${l} ${c}, transform ${l} ${c}`})]}const Oe=$("form-item",`
 display: grid;
 line-height: var(--n-line-height);
`,[$("form-item-label",`
 grid-area: label;
 align-items: center;
 line-height: 1.25;
 text-align: var(--n-label-text-align);
 font-size: var(--n-label-font-size);
 min-height: var(--n-label-height);
 padding: var(--n-label-padding);
 color: var(--n-label-text-color);
 transition: color .3s var(--n-bezier);
 box-sizing: border-box;
 font-weight: var(--n-label-font-weight);
 `,[Z("asterisk",`
 white-space: nowrap;
 user-select: none;
 -webkit-user-select: none;
 color: var(--n-asterisk-color);
 transition: color .3s var(--n-bezier);
 `),Z("asterisk-placeholder",`
 grid-area: mark;
 user-select: none;
 -webkit-user-select: none;
 visibility: hidden; 
 `)]),$("form-item-blank",`
 grid-area: blank;
 min-height: var(--n-blank-height);
 `),S("auto-label-width",[$("form-item-label","white-space: nowrap;")]),S("left-labelled",`
 grid-template-areas:
 "label blank"
 "label feedback";
 grid-template-columns: auto minmax(0, 1fr);
 grid-template-rows: auto 1fr;
 align-items: flex-start;
 `,[$("form-item-label",`
 display: grid;
 grid-template-columns: 1fr auto;
 min-height: var(--n-blank-height);
 height: auto;
 box-sizing: border-box;
 flex-shrink: 0;
 flex-grow: 0;
 `,[S("reverse-columns-space",`
 grid-template-columns: auto 1fr;
 `),S("left-mark",`
 grid-template-areas:
 "mark text"
 ". text";
 `),S("right-mark",`
 grid-template-areas: 
 "text mark"
 "text .";
 `),S("right-hanging-mark",`
 grid-template-areas: 
 "text mark"
 "text .";
 `),Z("text",`
 grid-area: text; 
 `),Z("asterisk",`
 grid-area: mark; 
 align-self: end;
 `)])]),S("top-labelled",`
 grid-template-areas:
 "label"
 "blank"
 "feedback";
 grid-template-rows: minmax(var(--n-label-height), auto) 1fr;
 grid-template-columns: minmax(0, 100%);
 `,[S("no-label",`
 grid-template-areas:
 "blank"
 "feedback";
 grid-template-rows: 1fr;
 `),$("form-item-label",`
 display: flex;
 align-items: flex-start;
 justify-content: var(--n-label-text-align);
 `)]),$("form-item-blank",`
 box-sizing: border-box;
 display: flex;
 align-items: center;
 position: relative;
 `),$("form-item-feedback-wrapper",`
 grid-area: feedback;
 box-sizing: border-box;
 min-height: var(--n-feedback-height);
 font-size: var(--n-feedback-font-size);
 line-height: 1.25;
 transform-origin: top left;
 `,[N("&:not(:empty)",`
 padding: var(--n-feedback-padding);
 `),$("form-item-feedback",{transition:"color .3s var(--n-bezier)",color:"var(--n-feedback-text-color)"},[S("warning",{color:"var(--n-feedback-text-color-warning)"}),S("error",{color:"var(--n-feedback-text-color-error)"}),Fe({fromOffset:"-3px",enterDuration:".3s",leaveDuration:".2s"})])])]);function Ee(t){const e=Y(K,null);return{mergedSize:b(()=>t.size!==void 0?t.size:(e==null?void 0:e.props.size)!==void 0?e.props.size:"medium")}}function Be(t){const e=Y(K,null),l=b(()=>{const{labelPlacement:i}=t;return i!==void 0?i:e!=null&&e.props.labelPlacement?e.props.labelPlacement:"top"}),n=b(()=>l.value==="left"&&(t.labelWidth==="auto"||(e==null?void 0:e.props.labelWidth)==="auto")),c=b(()=>{if(l.value==="top")return;const{labelWidth:i}=t;if(i!==void 0&&i!=="auto")return ne(i);if(n.value){const I=e==null?void 0:e.maxChildLabelWidthRef.value;return I!==void 0?ne(I):void 0}if((e==null?void 0:e.props.labelWidth)!==void 0)return ne(e.props.labelWidth)}),o=b(()=>{const{labelAlign:i}=t;if(i)return i;if(e!=null&&e.props.labelAlign)return e.props.labelAlign}),s=b(()=>{var i;return[(i=t.labelProps)===null||i===void 0?void 0:i.style,t.labelStyle,{width:c.value}]}),h=b(()=>{const{showRequireMark:i}=t;return i!==void 0?i:e==null?void 0:e.props.showRequireMark}),u=b(()=>{const{requireMarkPlacement:i}=t;return i!==void 0?i:(e==null?void 0:e.props.requireMarkPlacement)||"right"}),r=V(!1),a=V(!1),d=b(()=>{const{validationStatus:i}=t;if(i!==void 0)return i;if(r.value)return"error";if(a.value)return"warning"}),w=b(()=>{const{showFeedback:i}=t;return i!==void 0?i:(e==null?void 0:e.props.showFeedback)!==void 0?e.props.showFeedback:!0}),M=b(()=>{const{showLabel:i}=t;return i!==void 0?i:(e==null?void 0:e.props.showLabel)!==void 0?e.props.showLabel:!0});return{validationErrored:r,validationWarned:a,mergedLabelStyle:s,mergedLabelPlacement:l,mergedLabelAlign:o,mergedShowRequireMark:h,mergedRequireMarkPlacement:u,mergedValidationStatus:d,mergedShowFeedback:w,mergedShowLabel:M,isAutoLabelWidth:n}}function Te(t){const e=Y(K,null),l=b(()=>{const{rulePath:s}=t;if(s!==void 0)return s;const{path:h}=t;if(h!==void 0)return h}),n=b(()=>{const s=[],{rule:h}=t;if(h!==void 0&&(Array.isArray(h)?s.push(...h):s.push(h)),e){const{rules:u}=e.props,{value:r}=l;if(u!==void 0&&r!==void 0){const a=pe(u,r);a!==void 0&&(Array.isArray(a)?s.push(...a):s.push(a))}}return s}),c=b(()=>n.value.some(s=>s.required)),o=b(()=>c.value||t.required);return{mergedRules:n,mergedRequired:o}}var ce=function(t,e,l,n){function c(o){return o instanceof l?o:new l(function(s){s(o)})}return new(l||(l=Promise))(function(o,s){function h(a){try{r(n.next(a))}catch(d){s(d)}}function u(a){try{r(n.throw(a))}catch(d){s(d)}}function r(a){a.done?o(a.value):c(a.value).then(h,u)}r((n=n.apply(t,e||[])).next())})};const Ne=Object.assign(Object.assign({},te.props),{label:String,labelWidth:[Number,String],labelStyle:[String,Object],labelAlign:String,labelPlacement:String,path:String,first:Boolean,rulePath:String,required:Boolean,showRequireMark:{type:Boolean,default:void 0},requireMarkPlacement:String,showFeedback:{type:Boolean,default:void 0},rule:[Object,Array],size:String,ignorePathChange:Boolean,validationStatus:String,feedback:String,feedbackClass:String,feedbackStyle:[String,Object],showLabel:{type:Boolean,default:void 0},labelProps:Object,contentClass:String,contentStyle:[String,Object]});function ue(t,e){return(...l)=>{try{const n=t(...l);return!e&&(typeof n=="boolean"||n instanceof Error||Array.isArray(n))||n!=null&&n.then?n:(n===void 0||se("form-item/validate",`You return a ${typeof n} typed value in the validator method, which is not recommended. Please use ${e?"`Promise`":"`boolean`, `Error` or `Promise`"} typed value instead.`),!0)}catch(n){se("form-item/validate","An error is catched in the validation, so the validation won't be done. Your callback in `validate` method of `n-form` or `n-form-item` won't be called in this validation."),console.error(n);return}}}const Qe=ve({name:"FormItem",props:Ne,setup(t){je(ke,"formItems",ee(t,"path"));const{mergedClsPrefixRef:e,inlineThemeDisabled:l}=ge(t),n=Y(K,null),c=Ee(t),o=Be(t),{validationErrored:s,validationWarned:h}=o,{mergedRequired:u,mergedRules:r}=Te(t),{mergedSize:a}=c,{mergedLabelPlacement:d,mergedLabelAlign:w,mergedRequireMarkPlacement:M}=o,i=V([]),I=V(oe()),_=n?ee(n.props,"disabled"):V(!1),W=te("Form","-form-item",Oe,he,t,e);be(ee(t,"path"),()=>{t.ignorePathChange||y()});function y(){i.value=[],s.value=!1,h.value=!1,t.feedback&&(I.value=oe())}const P=(...m)=>ce(this,[...m],void 0,function*(R=null,C=()=>!0,v={suppressWarning:!0}){const{path:z}=t;v?v.first||(v.first=t.first):v={};const{value:q}=r,O=n?pe(n.props.model,z||""):void 0,E={},B={},A=(R?q.filter(f=>Array.isArray(f.trigger)?f.trigger.includes(R):f.trigger===R):q).filter(C).map((f,p)=>{const g=Object.assign({},f);if(g.validator&&(g.validator=ue(g.validator,!1)),g.asyncValidator&&(g.asyncValidator=ue(g.asyncValidator,!0)),g.renderMessage){const X=`__renderMessage__${p}`;B[X]=g.message,g.message=X,E[X]=g.renderMessage}return g}),L=A.filter(f=>f.level!=="warning"),U=A.filter(f=>f.level==="warning"),x={valid:!0,errors:void 0,warnings:void 0};if(!A.length)return x;const T=z!=null?z:"__n_no_path__",Q=new de({[T]:L}),G=new de({[T]:U}),{validateMessages:D}=(n==null?void 0:n.props)||{};D&&(Q.messages(D),G.messages(D));const J=f=>{i.value=f.map(p=>{const g=(p==null?void 0:p.message)||"";return{key:g,render:()=>g.startsWith("__renderMessage__")?E[g]():g}}),f.forEach(p=>{var g;!((g=p.message)===null||g===void 0)&&g.startsWith("__renderMessage__")&&(p.message=B[p.message])})};if(L.length){const f=yield new Promise(p=>{Q.validate({[T]:O},v,p)});f!=null&&f.length&&(x.valid=!1,x.errors=f,J(f))}if(U.length&&!x.errors){const f=yield new Promise(p=>{G.validate({[T]:O},v,p)});f!=null&&f.length&&(J(f),x.warnings=f)}return!x.errors&&!x.warnings?y():(s.value=!!x.errors,h.value=!!x.warnings),x});function H(){P("blur")}function we(){P("change")}function Re(){P("focus")}function xe(){P("input")}function ye(m,R){return ce(this,void 0,void 0,function*(){let C,v,z,q;return typeof m=="string"?(C=m,v=R):m!==null&&typeof m=="object"&&(C=m.trigger,v=m.callback,z=m.shouldRuleBeApplied,q=m.options),yield new Promise((O,E)=>{P(C,z,q).then(({valid:B,errors:A,warnings:L})=>{B?(v&&v(void 0,{warnings:L}),O({warnings:L})):(v&&v(A,{warnings:L}),E(A))})})})}ae(Ie,{path:ee(t,"path"),disabled:_,mergedSize:c.mergedSize,mergedValidationStatus:o.mergedValidationStatus,restoreValidation:y,handleContentBlur:H,handleContentChange:we,handleContentFocus:Re,handleContentInput:xe});const Se={validate:ye,restoreValidation:y,internalValidate:P},re=V(null);Le(()=>{if(!o.isAutoLabelWidth.value)return;const m=re.value;if(m!==null){const R=m.style.whiteSpace;m.style.whiteSpace="nowrap",m.style.width="",n==null||n.deriveMaxChildLabelWidth(Number(getComputedStyle(m).width.slice(0,-2))),m.style.whiteSpace=R}});const ie=b(()=>{var m;const{value:R}=a,{value:C}=d,v=C==="top"?"vertical":"horizontal",{common:{cubicBezierEaseInOut:z},self:{labelTextColor:q,asteriskColor:O,lineHeight:E,feedbackTextColor:B,feedbackTextColorWarning:A,feedbackTextColorError:L,feedbackPadding:U,labelFontWeight:x,[j("labelHeight",R)]:T,[j("blankHeight",R)]:Q,[j("feedbackFontSize",R)]:G,[j("feedbackHeight",R)]:D,[j("labelPadding",v)]:J,[j("labelTextAlign",v)]:f,[j(j("labelFontSize",C),R)]:p}}=W.value;let g=(m=w.value)!==null&&m!==void 0?m:f;return C==="top"&&(g=g==="right"?"flex-end":"flex-start"),{"--n-bezier":z,"--n-line-height":E,"--n-blank-height":Q,"--n-label-font-size":p,"--n-label-text-align":g,"--n-label-height":T,"--n-label-padding":J,"--n-label-font-weight":x,"--n-asterisk-color":O,"--n-label-text-color":q,"--n-feedback-padding":U,"--n-feedback-font-size":G,"--n-feedback-height":D,"--n-feedback-text-color":B,"--n-feedback-text-color-warning":A,"--n-feedback-text-color-error":L}}),F=l?Ce("form-item",b(()=>{var m;return`${a.value[0]}${d.value[0]}${((m=w.value)===null||m===void 0?void 0:m[0])||""}`}),ie,t):void 0,$e=b(()=>d.value==="left"&&M.value==="left"&&w.value==="left");return Object.assign(Object.assign(Object.assign(Object.assign({labelElementRef:re,mergedClsPrefix:e,mergedRequired:u,feedbackId:I,renderExplains:i,reverseColSpace:$e},o),c),Se),{cssVars:l?void 0:ie,themeClass:F==null?void 0:F.themeClass,onRender:F==null?void 0:F.onRender})},render(){const{$slots:t,mergedClsPrefix:e,mergedShowLabel:l,mergedShowRequireMark:n,mergedRequireMarkPlacement:c,onRender:o}=this,s=n!==void 0?n:this.mergedRequired;o==null||o();const h=()=>{const u=this.$slots.label?this.$slots.label():this.label;if(!u)return null;const r=k("span",{class:`${e}-form-item-label__text`},u),a=s?k("span",{class:`${e}-form-item-label__asterisk`},c!=="left"?" *":"* "):c==="right-hanging"&&k("span",{class:`${e}-form-item-label__asterisk-placeholder`}," *"),{labelProps:d}=this;return k("label",Object.assign({},d,{class:[d==null?void 0:d.class,`${e}-form-item-label`,`${e}-form-item-label--${c}-mark`,this.reverseColSpace&&`${e}-form-item-label--reverse-columns-space`],style:this.mergedLabelStyle,ref:"labelElementRef"}),c==="left"?[a,r]:[r,a])};return k("div",{class:[`${e}-form-item`,this.themeClass,`${e}-form-item--${this.mergedSize}-size`,`${e}-form-item--${this.mergedLabelPlacement}-labelled`,this.isAutoLabelWidth&&`${e}-form-item--auto-label-width`,!l&&`${e}-form-item--no-label`],style:this.cssVars},l&&h(),k("div",{class:[`${e}-form-item-blank`,this.contentClass,this.mergedValidationStatus&&`${e}-form-item-blank--${this.mergedValidationStatus}`],style:this.contentStyle},t),this.mergedShowFeedback?k("div",{key:this.feedbackId,style:this.feedbackStyle,class:[`${e}-form-item-feedback-wrapper`,this.feedbackClass]},k(Ae,{name:"fade-down-transition",mode:"out-in"},{default:()=>{const{mergedValidationStatus:u}=this;return Pe(t.feedback,r=>{var a;const{feedback:d}=this,w=r||d?k("div",{key:"__feedback__",class:`${e}-form-item-feedback__line`},r||d):this.renderExplains.length?(a=this.renderExplains)===null||a===void 0?void 0:a.map(({key:M,render:i})=>k("div",{key:M,class:`${e}-form-item-feedback__line`},i())):null;return w?u==="warning"?k("div",{key:"controlled-warning",class:`${e}-form-item-feedback ${e}-form-item-feedback--warning`},w):u==="error"?k("div",{key:"controlled-error",class:`${e}-form-item-feedback ${e}-form-item-feedback--error`},w):u==="success"?k("div",{key:"controlled-success",class:`${e}-form-item-feedback ${e}-form-item-feedback--success`},w):k("div",{key:"controlled-default",class:`${e}-form-item-feedback`},w):null})}})):null)}});export{Ue as N,Qe as a};
