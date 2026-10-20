from shot import run,W
st=[('wait',2500),('js',"(()=>{[...document.querySelectorAll('.menuActions button')].find(b=>/Settings/i.test(b.textContent)).click();return 1})()"),('wait',400),
('js',"(()=>{[...document.querySelectorAll('#ptOptions nav button')].find(b=>/DRIVING/i.test(b.textContent)).click();[...document.querySelectorAll('#ptOptions main button')].find(b=>b.textContent==='PLAY').click();return 1})()"),('wait',3000),('js',"'tut '+(RACE&&RACE.tut)+' scr '+scr")]
run(W+'/Poly-Tourismo.html',st,'ul2')
