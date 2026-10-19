from shot import run,W
js="""(()=>{const KK=(t,c)=>window.dispatchEvent(new KeyboardEvent(t,{code:c,bubbles:true}));const FF=n=>{for(let i=0;i<n;i++){step(1/60);hudUpdate()}};
 PT8.startTutorial();FF(60*5);KK('keydown','KeyW');FF(120);const c=RACE.cars[0];return [c.sp,c.gear,c.in&&c.in.th,RACE.state,[...down],document.getElementById('tutT').textContent,RACE.tut]})()"""
run(W+'/Poly-Tourismo.html',[('wait',1500),('js',js)],'tut2')
