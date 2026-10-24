from shot import run,W
js0=r"""(()=>{PT8.dmgOn=()=>false;PT8.launch({mode:'ta',track:15,laps:1,humans:[{id:'merc',alt:0}],ai:[]});scr='game';paused=false;
 for(let i=0;i<200;i++)step(1/60);RACE.state='race';const T=RACE.T,c=RACE.cars[0];const C=T._im;
 return [T.N,Math.round(T.L),C.corners.length,C.left,JSON.stringify(C.corners.map(q=>[q.a,q.b,q.dir,+q.pk.toFixed(3)])),PT8.TRK_TRACKS.join()]})()"""
def place(k,l):
    return r"""(()=>{const T=RACE.T,c=RACE.cars[0],k=%d,l=%f,ps=T.psi[k];c.x=T.x[k]+Math.cos(ps)*l;c.z=T.z[k]-Math.sin(ps)*l;c.y=T.terr(c.x,c.z)+1;c.yaw=ps;c.vx=Math.sin(ps)*20;c.vz=Math.cos(ps)*20;c.idx=k;step(1/60);const s=T.surf(c.x,c.z,c.y);return [k,l,s.road?1:0,!!s.trap,c.mt===MATS.sandtrap]})()"""%(k,l)
import sys
steps=[('js',js0),('wait',3000),('shot','start')]
run(W+'/Poly-Tourismo.html',steps,'imola')
