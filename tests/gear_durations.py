import sys,json
from shot import run,W
js="""
(()=>{const out={};for(const id of ['merc','ford','lr','p1','por','gtr']){PT8.launch({mode:'ta',track:0,laps:1,humans:[{id:id,alt:0}],ai:[]});const c=RACE.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};
 for(let i=0;i<60*4;i++)step(1/60);let t0=0,t=0,pg=0,d=[],v100=null,v60=null;c.sp=0;
 for(let i=0;i<60*40;i++){step(1/60);t+=1/60;if((c.gear|0)!==pg){d.push(+(t-t0).toFixed(1));t0=t;pg=c.gear|0}if(!v60&&c.sp*3.6>=60)v60=+t.toFixed(1);if(!v100&&c.sp*3.6>=100)v100=+t.toFixed(1)}
 out[id]={n:PT8.GT(c.cs).length,gearDur:d,t60:v60,t100:v100}}return out})()
"""
run(W+'/Poly-Tourismo.html',[('js',js)],'gd')
