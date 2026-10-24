from shot import run,W
steps=[('js',"(()=>{dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}));return 1})()"),('wait',3000),
('js',"(()=>{PT8.SV().cr=999999;PT8.SV().credits=999999;PT8.SV().money=999999;const b=[...document.querySelectorAll('button')].find(x=>/Brand Central/.test(x.textContent));b.click();return 'clicked'})()"),
('wait',1500),
('js',"(()=>{const s=[...document.querySelectorAll('#s8show .secs > *, #s8show [data-sec]')];const el=[...document.querySelectorAll('#s8show div,#s8show button')].find(x=>/^COUPE/i.test(x.textContent.trim())&&x.offsetParent);if(el)el.click();return !!el})()"),
('wait',1200),
('js',"(()=>{const c=(a=>a.filter(x=>!/Owned/.test(x.textContent))[2])([...document.querySelectorAll('#s8show .ci')]);if(c)c.click();return !!c})()"),
('wait',300),('shot','r1'),('wait',700),('shot','r2'),('wait',800),('shot','r3'),('wait',2500),('shot','r4'),
('js',"(()=>{const b=document.getElementById('shAct');b.click();return b.textContent})()"),
('wait',700),('shot','p1'),('wait',2600),('shot','p2'),('js',"(()=>{const b=document.getElementById('shBuyGo');if(b)b.click();return !!b})()"),('wait',700),('shot','p3'),('wait',700),('shot','p4'),('wait',900),('shot','p5')]
run(W+'/Poly-Tourismo.html',steps,'brand')
