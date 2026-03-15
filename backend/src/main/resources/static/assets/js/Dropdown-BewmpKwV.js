import{B as Pe,V as Re,a as Ke,r as Ie,N as Ce,p as ce}from"./Popover-DMUJDzmp.js";import{aX as Oe,ae as q,F as G,K as ie,aE as X,N as _e,aP as pe,D as V,V as ze,aY as De,aQ as $e,aO as Fe,e as k,aa as Ae,h as E,t as le,f as K,g as _,$ as Te,l as Be,m as fe,aZ as je,n as Me,o as te,w as F}from"./index-kvCe5h5c.js";import{l as Ee,m as Le,k as He,K as Ue,w as de,r as A,d as B,h as s,a as T,B as ve,z as We,c as b,y as L,F as qe,u as I}from"./vue-core-Qok9l9dg.js";import{C as Ge}from"./ChevronRight-DlUkawXd.js";import{h as se,c as Ve}from"./create-D3Vn69pI.js";import{u as Xe}from"./use-merged-state-3vwOMuut.js";import{c as Qe}from"./create-ref-setter-C4J8sofl.js";function Ye(e={},t){const d=Ue({ctrl:!1,command:!1,win:!1,shift:!1,tab:!1}),{keydown:i,keyup:r}=e,o=a=>{switch(a.key){case"Control":d.ctrl=!0;break;case"Meta":d.command=!0,d.win=!0;break;case"Shift":d.shift=!0;break;case"Tab":d.tab=!0;break}i!==void 0&&Object.keys(i).forEach(m=>{if(m!==a.key)return;const w=i[m];if(typeof w=="function")w(a);else{const{stop:g=!1,prevent:x=!1}=w;g&&a.stopPropagation(),x&&a.preventDefault(),w.handler(a)}})},p=a=>{switch(a.key){case"Control":d.ctrl=!1;break;case"Meta":d.command=!1,d.win=!1;break;case"Shift":d.shift=!1;break;case"Tab":d.tab=!1;break}r!==void 0&&Object.keys(r).forEach(m=>{if(m!==a.key)return;const w=r[m];if(typeof w=="function")w(a);else{const{stop:g=!1,prevent:x=!1}=w;g&&a.stopPropagation(),x&&a.preventDefault(),w.handler(a)}})},v=()=>{(t===void 0||t.value)&&(G("keydown",document,o),G("keyup",document,p)),t!==void 0&&de(t,a=>{a?(G("keydown",document,o),G("keyup",document,p)):(q("keydown",document,o),q("keyup",document,p))})};return Oe()?(Ee(v),Le(()=>{(t===void 0||t.value)&&(q("keydown",document,o),q("keyup",document,p))})):v(),He(d)}function Ze(e,t,d){const i=A(e.value);let r=null;return de(e,o=>{r!==null&&window.clearTimeout(r),o===!0?d&&!d.value?i.value=!0:r=window.setTimeout(()=>{i.value=!0},t):i.value=!1}),i}const ae=ie("n-dropdown-menu"),Q=ie("n-dropdown"),ue=ie("n-dropdown-option"),he=B({name:"DropdownDivider",props:{clsPrefix:{type:String,required:!0}},render(){return s("div",{class:`${this.clsPrefix}-dropdown-divider`})}}),Je=B({name:"DropdownGroupHeader",props:{clsPrefix:{type:String,required:!0},tmNode:{type:Object,required:!0}},setup(){const{showIconRef:e,hasSubmenuRef:t}=T(ae),{renderLabelRef:d,labelFieldRef:i,nodePropsRef:r,renderOptionRef:o}=T(Q);return{labelField:i,showIcon:e,hasSubmenu:t,renderLabel:d,nodeProps:r,renderOption:o}},render(){var e;const{clsPrefix:t,hasSubmenu:d,showIcon:i,nodeProps:r,renderLabel:o,renderOption:p}=this,{rawNode:v}=this.tmNode,a=s("div",Object.assign({class:`${t}-dropdown-option`},r==null?void 0:r(v)),s("div",{class:`${t}-dropdown-option-body ${t}-dropdown-option-body--group`},s("div",{"data-dropdown-option":!0,class:[`${t}-dropdown-option-body__prefix`,i&&`${t}-dropdown-option-body__prefix--show-icon`]},X(v.icon)),s("div",{class:`${t}-dropdown-option-body__label`,"data-dropdown-option":!0},o?o(v):X((e=v.title)!==null&&e!==void 0?e:v[this.labelField])),s("div",{class:[`${t}-dropdown-option-body__suffix`,d&&`${t}-dropdown-option-body__suffix--has-submenu`],"data-dropdown-option":!0})));return p?p({node:a,option:v}):a}});function re(e,t){return e.type==="submenu"||e.type===void 0&&e[t]!==void 0}function eo(e){return e.type==="group"}function we(e){return e.type==="divider"}function oo(e){return e.type==="render"}const be=B({name:"DropdownOption",props:{clsPrefix:{type:String,required:!0},tmNode:{type:Object,required:!0},parentKey:{type:[String,Number],default:null},placement:{type:String,default:"right-start"},props:Object,scrollable:Boolean},setup(e){const t=T(Q),{hoverKeyRef:d,keyboardKeyRef:i,lastToggledSubmenuKeyRef:r,pendingKeyPathRef:o,activeKeyPathRef:p,animatedRef:v,mergedShowRef:a,renderLabelRef:m,renderIconRef:w,labelFieldRef:g,childrenFieldRef:x,renderOptionRef:N,nodePropsRef:P,menuPropsRef:z}=t,S=T(ue,null),C=T(ae),O=T(pe),U=b(()=>e.tmNode.rawNode),H=b(()=>{const{value:n}=x;return re(e.tmNode.rawNode,n)}),Y=b(()=>{const{disabled:n}=e.tmNode;return n}),Z=b(()=>{if(!H.value)return!1;const{key:n,disabled:c}=e.tmNode;if(c)return!1;const{value:y}=d,{value:D}=i,{value:ne}=r,{value:$}=o;return y!==null?$.includes(n):D!==null?$.includes(n)&&$[$.length-1]!==n:ne!==null?$.includes(n):!1}),J=b(()=>i.value===null&&!v.value),ee=Ze(Z,300,J),oe=b(()=>!!(S!=null&&S.enteringSubmenuRef.value)),j=A(!1);L(ue,{enteringSubmenuRef:j});function M(){j.value=!0}function W(){j.value=!1}function R(){const{parentKey:n,tmNode:c}=e;c.disabled||a.value&&(r.value=n,i.value=null,d.value=c.key)}function l(){const{tmNode:n}=e;n.disabled||a.value&&d.value!==n.key&&R()}function u(n){if(e.tmNode.disabled||!a.value)return;const{relatedTarget:c}=n;c&&!se({target:c},"dropdownOption")&&!se({target:c},"scrollbarRail")&&(d.value=null)}function f(){const{value:n}=H,{tmNode:c}=e;a.value&&!n&&!c.disabled&&(t.doSelect(c.key,c.rawNode),t.doUpdateShow(!1))}return{labelField:g,renderLabel:m,renderIcon:w,siblingHasIcon:C.showIconRef,siblingHasSubmenu:C.hasSubmenuRef,menuProps:z,popoverBody:O,animated:v,mergedShowSubmenu:b(()=>ee.value&&!oe.value),rawNode:U,hasSubmenu:H,pending:V(()=>{const{value:n}=o,{key:c}=e.tmNode;return n.includes(c)}),childActive:V(()=>{const{value:n}=p,{key:c}=e.tmNode,y=n.findIndex(D=>c===D);return y===-1?!1:y<n.length-1}),active:V(()=>{const{value:n}=p,{key:c}=e.tmNode,y=n.findIndex(D=>c===D);return y===-1?!1:y===n.length-1}),mergedDisabled:Y,renderOption:N,nodeProps:P,handleClick:f,handleMouseMove:l,handleMouseEnter:R,handleMouseLeave:u,handleSubmenuBeforeEnter:M,handleSubmenuAfterEnter:W}},render(){var e,t;const{animated:d,rawNode:i,mergedShowSubmenu:r,clsPrefix:o,siblingHasIcon:p,siblingHasSubmenu:v,renderLabel:a,renderIcon:m,renderOption:w,nodeProps:g,props:x,scrollable:N}=this;let P=null;if(r){const O=(e=this.menuProps)===null||e===void 0?void 0:e.call(this,i,i.children);P=s(me,Object.assign({},O,{clsPrefix:o,scrollable:this.scrollable,tmNodes:this.tmNode.children,parentKey:this.tmNode.key}))}const z={class:[`${o}-dropdown-option-body`,this.pending&&`${o}-dropdown-option-body--pending`,this.active&&`${o}-dropdown-option-body--active`,this.childActive&&`${o}-dropdown-option-body--child-active`,this.mergedDisabled&&`${o}-dropdown-option-body--disabled`],onMousemove:this.handleMouseMove,onMouseenter:this.handleMouseEnter,onMouseleave:this.handleMouseLeave,onClick:this.handleClick},S=g==null?void 0:g(i),C=s("div",Object.assign({class:[`${o}-dropdown-option`,S==null?void 0:S.class],"data-dropdown-option":!0},S),s("div",ve(z,x),[s("div",{class:[`${o}-dropdown-option-body__prefix`,p&&`${o}-dropdown-option-body__prefix--show-icon`]},[m?m(i):X(i.icon)]),s("div",{"data-dropdown-option":!0,class:`${o}-dropdown-option-body__label`},a?a(i):X((t=i[this.labelField])!==null&&t!==void 0?t:i.title)),s("div",{"data-dropdown-option":!0,class:[`${o}-dropdown-option-body__suffix`,v&&`${o}-dropdown-option-body__suffix--has-submenu`]},this.hasSubmenu?s(_e,null,{default:()=>s(Ge,null)}):null)]),this.hasSubmenu?s(Pe,null,{default:()=>[s(Re,null,{default:()=>s("div",{class:`${o}-dropdown-offset-container`},s(Ke,{show:this.mergedShowSubmenu,placement:this.placement,to:N&&this.popoverBody||void 0,teleportDisabled:!N},{default:()=>s("div",{class:`${o}-dropdown-menu-wrapper`},d?s(We,{onBeforeEnter:this.handleSubmenuBeforeEnter,onAfterEnter:this.handleSubmenuAfterEnter,name:"fade-in-scale-up-transition",appear:!0},{default:()=>P}):P)}))})]}):null);return w?w({node:C,option:i}):C}}),no=B({name:"NDropdownGroup",props:{clsPrefix:{type:String,required:!0},tmNode:{type:Object,required:!0},parentKey:{type:[String,Number],default:null}},render(){const{tmNode:e,parentKey:t,clsPrefix:d}=this,{children:i}=e;return s(qe,null,s(Je,{clsPrefix:d,tmNode:e,key:e.key}),i==null?void 0:i.map(r=>{const{rawNode:o}=r;return o.show===!1?null:we(o)?s(he,{clsPrefix:d,key:r.key}):r.isGroup?(ze("dropdown","`group` node is not allowed to be put in `group` node."),null):s(be,{clsPrefix:d,tmNode:r,parentKey:t,key:r.key})}))}}),to=B({name:"DropdownRenderOption",props:{tmNode:{type:Object,required:!0}},render(){const{rawNode:{render:e,props:t}}=this.tmNode;return s("div",t,[e==null?void 0:e()])}}),me=B({name:"DropdownMenu",props:{scrollable:Boolean,showArrow:Boolean,arrowStyle:[String,Object],clsPrefix:{type:String,required:!0},tmNodes:{type:Array,default:()=>[]},parentKey:{type:[String,Number],default:null}},setup(e){const{renderIconRef:t,childrenFieldRef:d}=T(Q);L(ae,{showIconRef:b(()=>{const r=t.value;return e.tmNodes.some(o=>{var p;if(o.isGroup)return(p=o.children)===null||p===void 0?void 0:p.some(({rawNode:a})=>r?r(a):a.icon);const{rawNode:v}=o;return r?r(v):v.icon})}),hasSubmenuRef:b(()=>{const{value:r}=d;return e.tmNodes.some(o=>{var p;if(o.isGroup)return(p=o.children)===null||p===void 0?void 0:p.some(({rawNode:a})=>re(a,r));const{rawNode:v}=o;return re(v,r)})})});const i=A(null);return L($e,null),L(Fe,null),L(pe,i),{bodyRef:i}},render(){const{parentKey:e,clsPrefix:t,scrollable:d}=this,i=this.tmNodes.map(r=>{const{rawNode:o}=r;return o.show===!1?null:oo(o)?s(to,{tmNode:r,key:r.key}):we(o)?s(he,{clsPrefix:t,key:r.key}):eo(o)?s(no,{clsPrefix:t,tmNode:r,parentKey:e,key:r.key}):s(be,{clsPrefix:t,tmNode:r,parentKey:e,key:r.key,props:o.props,scrollable:d})});return s("div",{class:[`${t}-dropdown-menu`,d&&`${t}-dropdown-menu--scrollable`],ref:"bodyRef"},d?s(De,{contentClass:`${t}-dropdown-menu__content`},{default:()=>i}):i,this.showArrow?Ie({clsPrefix:t,arrowStyle:this.arrowStyle,arrowClass:void 0,arrowWrapperClass:void 0,arrowWrapperStyle:void 0}):null)}}),ro=k("dropdown-menu",`
 transform-origin: var(--v-transform-origin);
 background-color: var(--n-color);
 border-radius: var(--n-border-radius);
 box-shadow: var(--n-box-shadow);
 position: relative;
 transition:
 background-color .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier);
`,[Ae(),k("dropdown-option",`
 position: relative;
 `,[E("a",`
 text-decoration: none;
 color: inherit;
 outline: none;
 `,[E("&::before",`
 content: "";
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 `)]),k("dropdown-option-body",`
 display: flex;
 cursor: pointer;
 position: relative;
 height: var(--n-option-height);
 line-height: var(--n-option-height);
 font-size: var(--n-font-size);
 color: var(--n-option-text-color);
 transition: color .3s var(--n-bezier);
 `,[E("&::before",`
 content: "";
 position: absolute;
 top: 0;
 bottom: 0;
 left: 4px;
 right: 4px;
 transition: background-color .3s var(--n-bezier);
 border-radius: var(--n-border-radius);
 `),le("disabled",[K("pending",`
 color: var(--n-option-text-color-hover);
 `,[_("prefix, suffix",`
 color: var(--n-option-text-color-hover);
 `),E("&::before","background-color: var(--n-option-color-hover);")]),K("active",`
 color: var(--n-option-text-color-active);
 `,[_("prefix, suffix",`
 color: var(--n-option-text-color-active);
 `),E("&::before","background-color: var(--n-option-color-active);")]),K("child-active",`
 color: var(--n-option-text-color-child-active);
 `,[_("prefix, suffix",`
 color: var(--n-option-text-color-child-active);
 `)])]),K("disabled",`
 cursor: not-allowed;
 opacity: var(--n-option-opacity-disabled);
 `),K("group",`
 font-size: calc(var(--n-font-size) - 1px);
 color: var(--n-group-header-text-color);
 `,[_("prefix",`
 width: calc(var(--n-option-prefix-width) / 2);
 `,[K("show-icon",`
 width: calc(var(--n-option-icon-prefix-width) / 2);
 `)])]),_("prefix",`
 width: var(--n-option-prefix-width);
 display: flex;
 justify-content: center;
 align-items: center;
 color: var(--n-prefix-color);
 transition: color .3s var(--n-bezier);
 z-index: 1;
 `,[K("show-icon",`
 width: var(--n-option-icon-prefix-width);
 `),k("icon",`
 font-size: var(--n-option-icon-size);
 `)]),_("label",`
 white-space: nowrap;
 flex: 1;
 z-index: 1;
 `),_("suffix",`
 box-sizing: border-box;
 flex-grow: 0;
 flex-shrink: 0;
 display: flex;
 justify-content: flex-end;
 align-items: center;
 min-width: var(--n-option-suffix-width);
 padding: 0 8px;
 transition: color .3s var(--n-bezier);
 color: var(--n-suffix-color);
 z-index: 1;
 `,[K("has-submenu",`
 width: var(--n-option-icon-suffix-width);
 `),k("icon",`
 font-size: var(--n-option-icon-size);
 `)]),k("dropdown-menu","pointer-events: all;")]),k("dropdown-offset-container",`
 pointer-events: none;
 position: absolute;
 left: 0;
 right: 0;
 top: -4px;
 bottom: -4px;
 `)]),k("dropdown-divider",`
 transition: background-color .3s var(--n-bezier);
 background-color: var(--n-divider-color);
 height: 1px;
 margin: 4px 0;
 `),k("dropdown-menu-wrapper",`
 transform-origin: var(--v-transform-origin);
 width: fit-content;
 `),E(">",[k("scrollbar",`
 height: inherit;
 max-height: inherit;
 `)]),le("scrollable",`
 padding: var(--n-padding);
 `),K("scrollable",[_("content",`
 padding: var(--n-padding);
 `)])]),io={animated:{type:Boolean,default:!0},keyboard:{type:Boolean,default:!0},size:String,inverted:Boolean,placement:{type:String,default:"bottom"},onSelect:[Function,Array],options:{type:Array,default:()=>[]},menuProps:Function,showArrow:Boolean,renderLabel:Function,renderIcon:Function,renderOption:Function,nodeProps:Function,labelField:{type:String,default:"label"},keyField:{type:String,default:"key"},childrenField:{type:String,default:"children"},value:[String,Number]},ao=Object.keys(ce),lo=Object.assign(Object.assign(Object.assign({},ce),io),fe.props),wo=B({name:"Dropdown",inheritAttrs:!1,props:lo,setup(e){const t=A(!1),d=Xe(I(e,"show"),t),i=b(()=>{const{keyField:l,childrenField:u}=e;return Ve(e.options,{getKey(f){return f[l]},getDisabled(f){return f.disabled===!0},getIgnored(f){return f.type==="divider"||f.type==="render"},getChildren(f){return f[u]}})}),r=b(()=>i.value.treeNodes),o=A(null),p=A(null),v=A(null),a=b(()=>{var l,u,f;return(f=(u=(l=o.value)!==null&&l!==void 0?l:p.value)!==null&&u!==void 0?u:v.value)!==null&&f!==void 0?f:null}),m=b(()=>i.value.getPath(a.value).keyPath),w=b(()=>i.value.getPath(e.value).keyPath),g=V(()=>e.keyboard&&d.value);Ye({keydown:{ArrowUp:{prevent:!0,handler:J},ArrowRight:{prevent:!0,handler:Z},ArrowDown:{prevent:!0,handler:ee},ArrowLeft:{prevent:!0,handler:Y},Enter:{prevent:!0,handler:oe},Escape:H}},g);const{mergedClsPrefixRef:x,inlineThemeDisabled:N,mergedComponentPropsRef:P}=Be(e),z=b(()=>{var l,u;return e.size||((u=(l=P==null?void 0:P.value)===null||l===void 0?void 0:l.Dropdown)===null||u===void 0?void 0:u.size)||"medium"}),S=fe("Dropdown","-dropdown",ro,je,e,x);L(Q,{labelFieldRef:I(e,"labelField"),childrenFieldRef:I(e,"childrenField"),renderLabelRef:I(e,"renderLabel"),renderIconRef:I(e,"renderIcon"),hoverKeyRef:o,keyboardKeyRef:p,lastToggledSubmenuKeyRef:v,pendingKeyPathRef:m,activeKeyPathRef:w,animatedRef:I(e,"animated"),mergedShowRef:d,nodePropsRef:I(e,"nodeProps"),renderOptionRef:I(e,"renderOption"),menuPropsRef:I(e,"menuProps"),doSelect:C,doUpdateShow:O}),de(d,l=>{!e.animated&&!l&&U()});function C(l,u){const{onSelect:f}=e;f&&te(f,l,u)}function O(l){const{"onUpdate:show":u,onUpdateShow:f}=e;u&&te(u,l),f&&te(f,l),t.value=l}function U(){o.value=null,p.value=null,v.value=null}function H(){O(!1)}function Y(){M("left")}function Z(){M("right")}function J(){M("up")}function ee(){M("down")}function oe(){const l=j();l!=null&&l.isLeaf&&d.value&&(C(l.key,l.rawNode),O(!1))}function j(){var l;const{value:u}=i,{value:f}=a;return!u||f===null?null:(l=u.getNode(f))!==null&&l!==void 0?l:null}function M(l){const{value:u}=a,{value:{getFirstAvailableNode:f}}=i;let n=null;if(u===null){const c=f();c!==null&&(n=c.key)}else{const c=j();if(c){let y;switch(l){case"down":y=c.getNext();break;case"up":y=c.getPrev();break;case"right":y=c.getChild();break;case"left":y=c.getParent();break}y&&(n=y.key)}}n!==null&&(o.value=null,p.value=n)}const W=b(()=>{const{inverted:l}=e,u=z.value,{common:{cubicBezierEaseInOut:f},self:n}=S.value,{padding:c,dividerColor:y,borderRadius:D,optionOpacityDisabled:ne,[F("optionIconSuffixWidth",u)]:$,[F("optionSuffixWidth",u)]:ye,[F("optionIconPrefixWidth",u)]:ge,[F("optionPrefixWidth",u)]:xe,[F("fontSize",u)]:Se,[F("optionHeight",u)]:ke,[F("optionIconSize",u)]:Ne}=n,h={"--n-bezier":f,"--n-font-size":Se,"--n-padding":c,"--n-border-radius":D,"--n-option-height":ke,"--n-option-prefix-width":xe,"--n-option-icon-prefix-width":ge,"--n-option-suffix-width":ye,"--n-option-icon-suffix-width":$,"--n-option-icon-size":Ne,"--n-divider-color":y,"--n-option-opacity-disabled":ne};return l?(h["--n-color"]=n.colorInverted,h["--n-option-color-hover"]=n.optionColorHoverInverted,h["--n-option-color-active"]=n.optionColorActiveInverted,h["--n-option-text-color"]=n.optionTextColorInverted,h["--n-option-text-color-hover"]=n.optionTextColorHoverInverted,h["--n-option-text-color-active"]=n.optionTextColorActiveInverted,h["--n-option-text-color-child-active"]=n.optionTextColorChildActiveInverted,h["--n-prefix-color"]=n.prefixColorInverted,h["--n-suffix-color"]=n.suffixColorInverted,h["--n-group-header-text-color"]=n.groupHeaderTextColorInverted):(h["--n-color"]=n.color,h["--n-option-color-hover"]=n.optionColorHover,h["--n-option-color-active"]=n.optionColorActive,h["--n-option-text-color"]=n.optionTextColor,h["--n-option-text-color-hover"]=n.optionTextColorHover,h["--n-option-text-color-active"]=n.optionTextColorActive,h["--n-option-text-color-child-active"]=n.optionTextColorChildActive,h["--n-prefix-color"]=n.prefixColor,h["--n-suffix-color"]=n.suffixColor,h["--n-group-header-text-color"]=n.groupHeaderTextColor),h}),R=N?Me("dropdown",b(()=>`${z.value[0]}${e.inverted?"i":""}`),W,e):void 0;return{mergedClsPrefix:x,mergedTheme:S,mergedSize:z,tmNodes:r,mergedShow:d,handleAfterLeave:()=>{e.animated&&U()},doUpdateShow:O,cssVars:N?void 0:W,themeClass:R==null?void 0:R.themeClass,onRender:R==null?void 0:R.onRender}},render(){const e=(i,r,o,p,v)=>{var a;const{mergedClsPrefix:m,menuProps:w}=this;(a=this.onRender)===null||a===void 0||a.call(this);const g=(w==null?void 0:w(void 0,this.tmNodes.map(N=>N.rawNode)))||{},x={ref:Qe(r),class:[i,`${m}-dropdown`,`${m}-dropdown--${this.mergedSize}-size`,this.themeClass],clsPrefix:m,tmNodes:this.tmNodes,style:[...o,this.cssVars],showArrow:this.showArrow,arrowStyle:this.arrowStyle,scrollable:this.scrollable,onMouseenter:p,onMouseleave:v};return s(me,ve(this.$attrs,x,g))},{mergedTheme:t}=this,d={show:this.mergedShow,theme:t.peers.Popover,themeOverrides:t.peerOverrides.Popover,internalOnAfterLeave:this.handleAfterLeave,internalRenderBody:e,onUpdateShow:this.doUpdateShow,"onUpdate:show":void 0};return s(Ce,Object.assign({},Te(this.$props,ao),d),{trigger:()=>{var i,r;return(r=(i=this.$slots).default)===null||r===void 0?void 0:r.call(i)}})}});export{wo as N};
