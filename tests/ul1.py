from shot import run,W
st=[('wait',2500),('js',"(()=>{[...document.querySelectorAll('.menuActions button')].find(b=>/Settings/i.test(b.textContent)).click();return 1})()"),('wait',500),
('js',"(()=>{[...document.querySelectorAll('#ptOptions nav button')].find(b=>/DRIVING/i.test(b.textContent)).click();return [...document.querySelectorAll('#ptOptions main label')].map(l=>l.textContent).join('|')})()"),('shot','set'),
('js',"(()=>{document.getElementById('ptBack').click();return 1})()"),('wait',600),
('js',"(()=>{[...document.querySelectorAll('.menuActions button')].find(b=>/Update/i.test(b.textContent)).click();return 1})()"),('wait',600),('shot','log')]
run(W+'/Poly-Tourismo.html',st,'ul1')
