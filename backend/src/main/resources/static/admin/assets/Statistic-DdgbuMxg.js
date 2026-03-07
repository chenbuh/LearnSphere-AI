import{K as n,Q as o,R as S,V as a,W as r,Y as R,$ as v,bo as _,a8 as $,s as T,a2 as w}from"./index-Dy9YIUY0.js";const N=n("statistic",[o("label",`
 font-weight: var(--n-label-font-weight);
 transition: .3s color var(--n-bezier);
 font-size: var(--n-label-font-size);
 color: var(--n-label-text-color);
 `),n("statistic-value",`
 margin-top: 4px;
 font-weight: var(--n-value-font-weight);
 `,[o("prefix",`
 margin: 0 4px 0 0;
 font-size: var(--n-value-font-size);
 transition: .3s color var(--n-bezier);
 color: var(--n-value-prefix-text-color);
 `,[n("icon",{verticalAlign:"-0.125em"})]),o("content",`
 font-size: var(--n-value-font-size);
 transition: .3s color var(--n-bezier);
 color: var(--n-value-text-color);
 `),o("suffix",`
 margin: 0 0 0 4px;
 font-size: var(--n-value-font-size);
 transition: .3s color var(--n-bezier);
 color: var(--n-value-suffix-text-color);
 `,[n("icon",{verticalAlign:"-0.125em"})])])]),E=Object.assign(Object.assign({},v.props),{tabularNums:Boolean,label:String,value:[String,Number]}),V=S({name:"Statistic",props:E,slots:Object,setup(s){const{mergedClsPrefixRef:e,inlineThemeDisabled:i,mergedRtlRef:c}=R(s),u=v("Statistic","-statistic",N,_,s,e),f=$("Statistic",c,e),t=T(()=>{const{self:{labelFontWeight:b,valueFontSize:x,valueFontWeight:d,valuePrefixTextColor:m,labelTextColor:h,valueSuffixTextColor:g,valueTextColor:p,labelFontSize:z},common:{cubicBezierEaseInOut:C}}=u.value;return{"--n-bezier":C,"--n-label-font-size":z,"--n-label-font-weight":b,"--n-label-text-color":h,"--n-value-font-weight":d,"--n-value-font-size":x,"--n-value-prefix-text-color":m,"--n-value-suffix-text-color":g,"--n-value-text-color":p}}),l=i?w("statistic",void 0,t,s):void 0;return{rtlEnabled:f,mergedClsPrefix:e,cssVars:i?void 0:t,themeClass:l?.themeClass,onRender:l?.onRender}},render(){var s;const{mergedClsPrefix:e,$slots:{default:i,label:c,prefix:u,suffix:f}}=this;return(s=this.onRender)===null||s===void 0||s.call(this),a("div",{class:[`${e}-statistic`,this.themeClass,this.rtlEnabled&&`${e}-statistic--rtl`],style:this.cssVars},r(c,t=>a("div",{class:`${e}-statistic__label`},this.label||t)),a("div",{class:`${e}-statistic-value`,style:{fontVariantNumeric:this.tabularNums?"tabular-nums":""}},r(u,t=>t&&a("span",{class:`${e}-statistic-value__prefix`},t)),this.value!==void 0?a("span",{class:`${e}-statistic-value__content`},this.value):r(i,t=>t&&a("span",{class:`${e}-statistic-value__content`},t)),r(f,t=>t&&a("span",{class:`${e}-statistic-value__suffix`},t))))}});export{V as N};
