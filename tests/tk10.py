from shot import run,W
js="""(()=>{PT8.ui.openShow('brand',{player:0,cap:null,ret:'menu'});const t=document.getElementById('shList').textContent;
const ai=PT8.makeAI({n:60,classes:['S','A','B','C'],skill:.9}).map(a=>a.id);
return JSON.stringify({brandHasBolide:/BOLIDE/.test(t),brandHasF1:/F1 GTR/.test(t),brandHasR33:/R33/.test(t),aiMonsters:ai.filter(i=>PT8.TRACK_ONLY.includes(i)).length,only:PT8.TRACK_ONLY,loaner:PT8.loanerFor('S',false).id,topBolideNormal:PT8.BYID.p1.top})})()"""
run(W+'/Poly-Tourismo.html',[('wait',800),('js',js)],'tk10')
