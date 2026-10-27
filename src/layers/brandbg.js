/* ===== Poly GT layer: Brand Central backdrop, GT5-style slow slideshow of in-game action stills behind the maker list ===== */
(function brandbg(){
'use strict';
const sh=document.getElementById('s8show');if(!sh||typeof BBG_B64==='undefined'||document.getElementById('ptBrandBg'))return;
const st=document.createElement('style');st.textContent=`
#s8show>#ptBrandBg{position:absolute;inset:0;display:none;pointer-events:none;overflow:hidden;background:#07090c}
#s8show.gtb.mkl>#ptBrandBg{display:block}
#ptBrandBg i{position:absolute;inset:-4%;background-size:cover;background-position:center;opacity:0;transition:opacity 2.2s ease;will-change:transform,opacity;filter:saturate(.85) contrast(1.05)}
#ptBrandBg i.on{opacity:1}
/* the slow pan stays on the picture while it fades out (it used to stop and jump back to the start as the next one faded in) */
#ptBrandBg i.kb{animation:ptBbKb 12s linear forwards}
#ptBrandBg i.kb.b{animation-name:ptBbKb2}
@keyframes ptBbKb{from{transform:scale(1.02) translate(-1.5%,0)}to{transform:scale(1.12) translate(1.5%,-1%)}}
@keyframes ptBbKb2{from{transform:scale(1.12) translate(1.5%,1%)}to{transform:scale(1.02) translate(-1%,0)}}
#ptBrandBg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,#05070ae0 0%,#05070a66 18%,#05070a40 55%,#05070acc 100%),radial-gradient(ellipse at 50% 45%,transparent 35%,#000000b0 100%),repeating-linear-gradient(0deg,#ffffff06 0 1px,transparent 1px 3px)}
#s8show.gtb.mkl::before{display:none}
#s8show.gtb.mkl .mk{background:#0b1015a6;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
#s8show.gtb.mkl .mk:hover{background:#1a232cd9}
`;document.head.appendChild(st);
const bg=document.createElement('div');bg.id='ptBrandBg';
const L=[document.createElement('i'),document.createElement('i')];L.forEach(e=>bg.appendChild(e));sh.insertBefore(bg,sh.firstChild);
const url=BBG_B64.map(b=>'url(data:image/jpeg;base64,'+b+')');
let k=Math.floor(Math.random()*url.length),f=0,vis=false,t=0;
const next=()=>{const a=L[f],b=L[f^1];k=(k+1+Math.floor(Math.random()*Math.max(1,url.length-1)))%url.length;/* any other picture, so the old and new sets mix */b.style.backgroundImage=url[k];b.classList.toggle('b',k%2===1);b.classList.remove('on','kb');void b.offsetWidth;b.classList.add('on','kb');a.classList.remove('on');f^=1};
/* only animate while the maker list is on screen */
setInterval(()=>{const v=sh.classList.contains('on')&&sh.classList.contains('gtb')&&sh.classList.contains('mkl');if(v&&!vis){t=0;next()}else if(v&&++t>=7){t=0;next()}vis=v},1000);
})();
