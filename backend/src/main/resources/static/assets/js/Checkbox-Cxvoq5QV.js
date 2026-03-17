import{K as ae,h as d,e as r,f as v,g as h,H as le,ab as ie,ac as de,r as te,L as se,F as be,l as he,D as ue,C as ke,m as _,av as ve,v as fe,n as xe,T as me,o as T,w as B}from"./index-DWq0_FoP.js";import{h as a,d as ge,a as pe,r as I,c as K,u as Ce}from"./vue-core-Qok9l9dg.js";import{u as we}from"./use-merged-state-3vwOMuut.js";const ye=ae("n-checkbox-group"),ze=()=>a("svg",{viewBox:"0 0 64 64",class:"check-icon"},a("path",{d:"M50.42,16.76L22.34,39.45l-8.1-11.46c-1.12-1.58-3.3-1.96-4.88-0.84c-1.58,1.12-1.95,3.3-0.84,4.88l10.26,14.51  c0.56,0.79,1.42,1.31,2.38,1.45c0.16,0.02,0.32,0.03,0.48,0.03c0.8,0,1.57-0.27,2.2-0.78l30.99-25.03c1.5-1.21,1.74-3.42,0.52-4.92  C54.13,15.78,51.93,15.55,50.42,16.76z"})),Re=()=>a("svg",{viewBox:"0 0 100 100",class:"line-icon"},a("path",{d:"M80.2,55.5H21.4c-2.8,0-5.1-2.5-5.1-5.5l0,0c0-3,2.3-5.5,5.1-5.5h58.7c2.8,0,5.1,2.5,5.1,5.5l0,0C85.2,53.1,82.9,55.5,80.2,55.5z"})),Se=d([r("checkbox",`
 font-size: var(--n-font-size);
 outline: none;
 cursor: pointer;
 display: inline-flex;
 flex-wrap: nowrap;
 align-items: flex-start;
 word-break: break-word;
 line-height: var(--n-size);
 --n-merged-color-table: var(--n-color-table);
 `,[v("show-label","line-height: var(--n-label-line-height);"),d("&:hover",[r("checkbox-box",[h("border","border: var(--n-border-checked);")])]),d("&:focus:not(:active)",[r("checkbox-box",[h("border",`
 border: var(--n-border-focus);
 box-shadow: var(--n-box-shadow-focus);
 `)])]),v("inside-table",[r("checkbox-box",`
 background-color: var(--n-merged-color-table);
 `)]),v("checked",[r("checkbox-box",`
 background-color: var(--n-color-checked);
 `,[r("checkbox-icon",[d(".check-icon",`
 opacity: 1;
 transform: scale(1);
 `)])])]),v("indeterminate",[r("checkbox-box",[r("checkbox-icon",[d(".check-icon",`
 opacity: 0;
 transform: scale(.5);
 `),d(".line-icon",`
 opacity: 1;
 transform: scale(1);
 `)])])]),v("checked, indeterminate",[d("&:focus:not(:active)",[r("checkbox-box",[h("border",`
 border: var(--n-border-checked);
 box-shadow: var(--n-box-shadow-focus);
 `)])]),r("checkbox-box",`
 background-color: var(--n-color-checked);
 border-left: 0;
 border-top: 0;
 `,[h("border",{border:"var(--n-border-checked)"})])]),v("disabled",{cursor:"not-allowed"},[v("checked",[r("checkbox-box",`
 background-color: var(--n-color-disabled-checked);
 `,[h("border",{border:"var(--n-border-disabled-checked)"}),r("checkbox-icon",[d(".check-icon, .line-icon",{fill:"var(--n-check-mark-color-disabled-checked)"})])])]),r("checkbox-box",`
 background-color: var(--n-color-disabled);
 `,[h("border",`
 border: var(--n-border-disabled);
 `),r("checkbox-icon",[d(".check-icon, .line-icon",`
 fill: var(--n-check-mark-color-disabled);
 `)])]),h("label",`
 color: var(--n-text-color-disabled);
 `)]),r("checkbox-box-wrapper",`
 position: relative;
 width: var(--n-size);
 flex-shrink: 0;
 flex-grow: 0;
 user-select: none;
 -webkit-user-select: none;
 `),r("checkbox-box",`
 position: absolute;
 left: 0;
 top: 50%;
 transform: translateY(-50%);
 height: var(--n-size);
 width: var(--n-size);
 display: inline-block;
 box-sizing: border-box;
 border-radius: var(--n-border-radius);
 background-color: var(--n-color);
 transition: background-color 0.3s var(--n-bezier);
 `,[h("border",`
 transition:
 border-color .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier);
 border-radius: inherit;
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 border: var(--n-border);
 `),r("checkbox-icon",`
 display: flex;
 align-items: center;
 justify-content: center;
 position: absolute;
 left: 1px;
 right: 1px;
 top: 1px;
 bottom: 1px;
 `,[d(".check-icon, .line-icon",`
 width: 100%;
 fill: var(--n-check-mark-color);
 opacity: 0;
 transform: scale(0.5);
 transform-origin: center;
 transition:
 fill 0.3s var(--n-bezier),
 transform 0.3s var(--n-bezier),
 opacity 0.3s var(--n-bezier),
 border-color 0.3s var(--n-bezier);
 `),le({left:"1px",top:"1px"})])]),h("label",`
 color: var(--n-text-color);
 transition: color .3s var(--n-bezier);
 user-select: none;
 -webkit-user-select: none;
 padding: var(--n-label-padding);
 font-weight: var(--n-label-font-weight);
 `,[d("&:empty",{display:"none"})])]),ie(r("checkbox",`
 --n-merged-color-table: var(--n-color-table-modal);
 `)),de(r("checkbox",`
 --n-merged-color-table: var(--n-color-table-popover);
 `))]),De=Object.assign(Object.assign({},_.props),{size:String,checked:{type:[Boolean,String,Number],default:void 0},defaultChecked:{type:[Boolean,String,Number],default:!1},value:[String,Number],disabled:{type:Boolean,default:void 0},indeterminate:Boolean,label:String,focusable:{type:Boolean,default:!0},checkedValue:{type:[Boolean,String,Number],default:!0},uncheckedValue:{type:[Boolean,String,Number],default:!1},"onUpdate:checked":[Function,Array],onUpdateChecked:[Function,Array],privateInsideTable:Boolean,onChange:[Function,Array]}),Be=ge({name:"Checkbox",props:De,setup(o){const n=pe(ye,null),f=I(null),{mergedClsPrefixRef:x,inlineThemeDisabled:p,mergedRtlRef:M,mergedComponentPropsRef:C}=he(o),w=I(o.defaultChecked),S=Ce(o,"checked"),c=we(S,w),u=ue(()=>{if(n){const e=n.valueSetRef.value;return e&&o.value!==void 0?e.has(o.value):!1}else return c.value===o.checkedValue}),y=ke(o,{mergedSize(e){var l,i;const{size:t}=o;if(t!==void 0)return t;if(n){const{value:b}=n.mergedSizeRef;if(b!==void 0)return b}if(e){const{mergedSize:b}=e;if(b!==void 0)return b.value}const s=(i=(l=C==null?void 0:C.value)===null||l===void 0?void 0:l.Checkbox)===null||i===void 0?void 0:i.size;return s||"medium"},mergedDisabled(e){const{disabled:l}=o;if(l!==void 0)return l;if(n){if(n.disabledRef.value)return!0;const{maxRef:{value:i},checkedCountRef:t}=n;if(i!==void 0&&t.value>=i&&!u.value)return!0;const{minRef:{value:s}}=n;if(s!==void 0&&t.value<=s&&u.value)return!0}return e?e.disabled.value:!1}}),{mergedDisabledRef:z,mergedSizeRef:D}=y,R=_("Checkbox","-checkbox",Se,ve,o,x);function k(e){if(n&&o.value!==void 0)n.toggleCheckbox(!u.value,o.value);else{const{onChange:l,"onUpdate:checked":i,onUpdateChecked:t}=o,{nTriggerFormInput:s,nTriggerFormChange:b}=y,g=u.value?o.uncheckedValue:o.checkedValue;i&&T(i,g,e),t&&T(t,g,e),l&&T(l,g,e),s(),b(),w.value=g}}function V(e){z.value||k(e)}function F(e){if(!z.value)switch(e.key){case" ":case"Enter":k(e)}}function N(e){e.key===" "&&e.preventDefault()}const P={focus:()=>{var e;(e=f.value)===null||e===void 0||e.focus()},blur:()=>{var e;(e=f.value)===null||e===void 0||e.blur()}},j=fe("Checkbox",M,x),$=K(()=>{const{value:e}=D,{common:{cubicBezierEaseInOut:l},self:{borderRadius:i,color:t,colorChecked:s,colorDisabled:b,colorTableHeader:g,colorTableHeaderModal:H,colorTableHeaderPopover:U,checkMarkColor:E,checkMarkColorDisabled:L,border:O,borderFocus:A,borderDisabled:G,borderChecked:W,boxShadowFocus:Y,textColor:q,textColorDisabled:J,checkMarkColorDisabledChecked:Q,colorDisabledChecked:X,borderDisabledChecked:Z,labelPadding:ee,labelLineHeight:oe,labelFontWeight:re,[B("fontSize",e)]:ce,[B("size",e)]:ne}}=R.value;return{"--n-label-line-height":oe,"--n-label-font-weight":re,"--n-size":ne,"--n-bezier":l,"--n-border-radius":i,"--n-border":O,"--n-border-checked":W,"--n-border-focus":A,"--n-border-disabled":G,"--n-border-disabled-checked":Z,"--n-box-shadow-focus":Y,"--n-color":t,"--n-color-checked":s,"--n-color-table":g,"--n-color-table-modal":H,"--n-color-table-popover":U,"--n-color-disabled":b,"--n-color-disabled-checked":X,"--n-text-color":q,"--n-text-color-disabled":J,"--n-check-mark-color":E,"--n-check-mark-color-disabled":L,"--n-check-mark-color-disabled-checked":Q,"--n-font-size":ce,"--n-label-padding":ee}}),m=p?xe("checkbox",K(()=>D.value[0]),$,o):void 0;return Object.assign(y,P,{rtlEnabled:j,selfRef:f,mergedClsPrefix:x,mergedDisabled:z,renderedChecked:u,mergedTheme:R,labelId:me(),handleClick:V,handleKeyUp:F,handleKeyDown:N,cssVars:p?void 0:$,themeClass:m==null?void 0:m.themeClass,onRender:m==null?void 0:m.onRender})},render(){var o;const{$slots:n,renderedChecked:f,mergedDisabled:x,indeterminate:p,privateInsideTable:M,cssVars:C,labelId:w,label:S,mergedClsPrefix:c,focusable:u,handleKeyUp:y,handleKeyDown:z,handleClick:D}=this;(o=this.onRender)===null||o===void 0||o.call(this);const R=te(n.default,k=>S||k?a("span",{class:`${c}-checkbox__label`,id:w},S||k):null);return a("div",{ref:"selfRef",class:[`${c}-checkbox`,this.themeClass,this.rtlEnabled&&`${c}-checkbox--rtl`,f&&`${c}-checkbox--checked`,x&&`${c}-checkbox--disabled`,p&&`${c}-checkbox--indeterminate`,M&&`${c}-checkbox--inside-table`,R&&`${c}-checkbox--show-label`],tabindex:x||!u?void 0:0,role:"checkbox","aria-checked":p?"mixed":f,"aria-labelledby":w,style:C,onKeyup:y,onKeydown:z,onClick:D,onMousedown:()=>{be("selectstart",window,k=>{k.preventDefault()},{once:!0})}},a("div",{class:`${c}-checkbox-box-wrapper`}," ",a("div",{class:`${c}-checkbox-box`},a(se,null,{default:()=>this.indeterminate?a("div",{key:"indeterminate",class:`${c}-checkbox-icon`},Re()):a("div",{key:"check",class:`${c}-checkbox-icon`},ze())}),a("div",{class:`${c}-checkbox-box__border`}))),R)}});export{Be as N};
