from shot import run,W
js="""(()=>{PT8.launch({mode:'ta',track:7,laps:3,humans:[{id:'merc',alt:0}],ai:[]});const sc=RACE.scene,T=RACE.T;
let sea=null;sc.traverse(o=>{if(o.geometry&&o.geometry.type==='PlaneGeometry'&&o.geometry.parameters.width===4000)sea=o});
const L=(sc.userData.props||[]).filter(p=>p.water).slice(0,6).map(p=>[p.n,p.x|0,p.z|0,+p.y.toFixed(1),+T.terr(p.x,p.z).toFixed(1)]);
let lo=1e9;for(let i=0;i<T.N;i+=4)lo=Math.min(lo,T.y[i]);return {lo,sea:sea&&sea.position.y,L,vis:sea&&sea.visible}})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'dbg')
