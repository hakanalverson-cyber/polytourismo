from shot import run,W
setup="""(()=>{window.KK=(t,c)=>window.dispatchEvent(new KeyboardEvent(t,{code:c,bubbles:true}));window.FF=n=>{for(let i=0;i<n;i++){step(1/60);hudUpdate()}};
 PT8.startTutorial();FF(60*5);return [RACE.state,document.getElementById('tutT').textContent]})()"""
drive="""(()=>{const KK=window.KK,FF=window.FF,out=[];const T=()=>document.getElementById('tutT').textContent.replace('✓ ','');
 const until=(name,act,max)=>{for(let k=0;k<(max||40);k++){if(T()!==name)return true;act();}return false};
 const seq=[];
 /* Welcome -> Throttle */ FF(90);seq.push(T());
 KK('keydown','KeyW');until('Throttle',()=>FF(30));seq.push(T());
 until('Steering',()=>{KK('keydown','KeyA');FF(15);KK('keyup','KeyA');KK('keydown','KeyD');FF(15);KK('keyup','KeyD');FF(30)});seq.push(T());
 until('Gears',()=>{KK('keyup','KeyW');KK('keydown','KeyW');FF(3);KK('keyup','KeyW');KK('keydown','KeyW');FF(50)});seq.push(T()+' g'+RACE.cars[0].gear);
 until('Braking',()=>{KK('keydown','KeyW');FF(60);KK('keyup','KeyW');KK('keydown','KeyS');FF(120);KK('keyup','KeyS')});seq.push(T());
 until('Sliding',()=>{KK('keydown','KeyW');FF(100);KK('keydown','Space');FF(10);KK('keyup','Space')},20);seq.push(T());
 return seq})()"""
run(W+'/Poly-Tourismo.html',[('wait',1500),('js',setup),('wait',400),('shot','t0'),('js',drive),('wait',300),('shot','t1')],'tut')
