from shot import run,W
st=[('wait',900),('js',"(()=>{PT8.ui.openCards();document.querySelector('[data-m=mp]').click();return 1})()"),('wait',3000),
('js',"(()=>{const b=[...document.querySelectorAll('#s8setup button')].filter(x=>x.textContent.trim()==='2')[1];if(b)b.click();return !!b})()"),('wait',1500),('js',"(()=>{const e=document.querySelector('.drv');e.scrollIntoView();return 1})()"),('wait',500),('shot','mp2'),('js',"document.querySelectorAll('.drv').length")]
run(W+'/Poly-Tourismo.html',st,'mp')
