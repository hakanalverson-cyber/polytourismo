from shot import run,W
js="""(()=>{PT8.launch({mode:'mp',track:14,laps:1,humans:[{id:'c24',alt:0}],ai:[],tod:'day',circuit:1});const T=RACE.T;
let best=0,bi=300;for(let k=0;k<T.N;k++){const a=Math.abs(Math.atan2(Math.sin(T.psi[(k+10)%T.N]-T.psi[k]),Math.cos(T.psi[(k+10)%T.N]-T.psi[k])));if(a>best){best=a;bi=k}}
const cam=new THREE.PerspectiveCamera(60,16/9,.3,2000);const k=bi,l=-(T.hw[k]+9),x=T.x[k]+Math.cos(T.psi[k])*l,z=T.z[k]-Math.sin(T.psi[k])*l;
cam.position.set(x-8*Math.sin(T.psi[k]),T.y[k]+3.5,z-8*Math.cos(T.psi[k]));cam.lookAt(T.x[k]+Math.sin(T.psi[k])*10,T.y[k],T.z[k]+Math.cos(T.psi[k])*10);
const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(1100,620);r.render(RACE.scene,cam);return r.domElement.toDataURL()})()"""
run(W+'/Poly-Tourismo.html',[('wait',800),('img','kerb',js)],'ra9')
