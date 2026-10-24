from shot import run,W
import sys
# place car at several spots, hide title, take shots
js_setup=r"""(()=>{PT8.dmgOn=()=>false;PT8.launch({mode:'ta',track:15,laps:1,humans:[{id:'merc',alt:0}],ai:[]});scr='game';paused=false;RACE.state='race';
 for(let i=0;i<120;i++)step(1/60);const t=document.getElementById('title');document.querySelectorAll('.title,#title,.ttl').forEach(e=>e.style.display='none');return 1})()"""
def put(k,l,back):
    return r"""(()=>{const T=RACE.T,c=RACE.cars[0],k=(%d+T.N)%%T.N,l=%f,ps=T.psi[k];c.x=T.x[k]+Math.cos(ps)*l;c.z=T.z[k]-Math.sin(ps)*l;c.y=T.y[k]+.6;c.yaw=ps;c.vx=Math.sin(ps)*30;c.vz=Math.cos(ps)*30;c.vy=0;c.idx=k;c.unw=k;for(let i=0;i<60;i++){c.vx=Math.sin(ps)*30;c.vz=Math.cos(ps)*30;step(1/60)}const s=T.surf(c.x,c.z,c.y);return [k,s.road?1:0,!!s.trap,c.mt===MATS.sandtrap,c.sp|0]})()"""%(k,l,)

def trap(ci):
    return r"""(()=>{const T=RACE.T,c=RACE.cars[0],C=T._im.corners[CI],k=Math.round((C.a+C.b)/2),side=C.dir>0?-1:1,l=side*(T.hw[k]+7),ps=T.psi[k];c.x=T.x[k]+Math.cos(ps)*l;c.z=T.z[k]-Math.sin(ps)*l;c.y=T.terr(c.x,c.z)+.7;c.yaw=ps;c.vy=0;c.idx=k;c.unw=k;const sp=[];for(let i=0;i<150;i++){if(i<2){c.vx=Math.sin(ps)*40;c.vz=Math.cos(ps)*40}c.in={th:1,br:0,st:0,hb:0};step(1/60);if(i%30==29)sp.push(c.sp|0)}const s=T.surf(c.x,c.z,c.y);return [k,side,s.road?1:0,!!s.trap,c.mt===MATS.sandtrap,sp.join('>')]})()""".replace("CI",str(ci))
steps=[('js',"(()=>{dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}));return 1})()"),('wait',2500),('js',js_setup),('wait',2500)]
for ci in (2,3,4):
    steps+=[('js',trap(ci)),('wait',300),('shot','t%d'%ci)]
run(W+'/Poly-Tourismo.html',steps,'imolaC')
