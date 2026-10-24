from shot import run,W
import sys
# place car at several spots, hide title, take shots
js_setup=r"""(()=>{PT8.dmgOn=()=>false;PT8.launch({mode:'ta',track:15,laps:1,humans:[{id:'merc',alt:0}],ai:[]});scr='game';paused=false;RACE.state='race';
 for(let i=0;i<120;i++)step(1/60);const t=document.getElementById('title');document.querySelectorAll('.title,#title,.ttl').forEach(e=>e.style.display='none');return 1})()"""
def put(k,l,back):
    return r"""(()=>{const T=RACE.T,c=RACE.cars[0],k=(%d+T.N)%%T.N,l=%f,ps=T.psi[k];c.x=T.x[k]+Math.cos(ps)*l;c.z=T.z[k]-Math.sin(ps)*l;c.y=T.y[k]+.6;c.yaw=ps;c.vx=Math.sin(ps)*30;c.vz=Math.cos(ps)*30;c.vy=0;c.idx=k;c.unw=k;for(let i=0;i<60;i++){c.vx=Math.sin(ps)*30;c.vz=Math.cos(ps)*30;step(1/60)}const s=T.surf(c.x,c.z,c.y);return [k,s.road?1:0,!!s.trap,c.mt===MATS.sandtrap,c.sp|0]})()"""%(k,l,)
steps=[('js',"(()=>{dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}));return 1})()"),('wait',2500),('js',js_setup),('wait',2500)]
for k in (150,200,240,300):
    steps+=[('js',put(k-6,0,0)),('wait',1200),('shot','c%d'%k)]
run(W+'/Poly-Tourismo.html',steps,'imolaB')
