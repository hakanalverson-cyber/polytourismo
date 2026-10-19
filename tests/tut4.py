from shot import run,W
js="""(()=>{window.KK=(t,c)=>window.dispatchEvent(new KeyboardEvent(t,{code:c,bubbles:true}));window.FF=n=>{for(let i=0;i<n;i++){step(1/60);hudUpdate()}};PT8.startTutorial();FF(300);return 1})()"""
d2="""(()=>{const KK=window.KK,FF=window.FF;KK('keydown','KeyW');for(let k=0;k<30;k++)FF(30);return document.getElementById('tutT').textContent})()"""
nx="""(()=>{document.getElementById('tutSkip').click();document.getElementById('tutSkip').click();return document.getElementById('tutBody').style.opacity})()"""
rd="""(()=>[document.getElementById('tutT').textContent,document.getElementById('tutN').textContent,document.getElementById('tutBody').style.opacity])()"""
run(W+'/Poly-Tourismo.html',[('wait',1500),('js',js),('js',d2),('wait',100),('js',nx),('wait',1500),('js',rd),('shot','x')],'tut4')
