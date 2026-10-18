from shot import run,W
a="""(()=>{PT8.launch({mode:'mp',track:0,laps:10,humans:[{id:'merc',alt:0}],ai:PT8.makeAI({n:3,classes:['B','A'],skill:.9,rally:false})});
 const out={};const h=RACE.cars[0];h.forceAI=1;h.ai={skill:1,lat:0,name:'T'};
 for(let i=0;i<60*12;i++)step(1/60);
 let log=[];for(let i=0;i<60*20;i++){step(1/60);if(i%60==0){log.push(RACE.cars.map(c=>{const o=RACE.cars[1];return [+c.sp.toFixed(0),+c.draft.toFixed(2)]}).slice(0,3))}}
 out.log=log;
 /* force: put AI#1 directly in front of car0 */
 const A=RACE.cars[0],B=RACE.cars[1];B.x=A.x+Math.sin(A.yaw)*14;B.z=A.z+Math.cos(A.yaw)*14;B.yaw=A.yaw;B.vx=A.vx;B.vz=A.vz;B.sp=A.sp;step(1/60);
 out.forced={sp:A.sp,draft:A.draft,state:RACE.state};
 /* AI low fuel pit */
 RACE.cars[2].fuel=.1;RACE.cars[2].tyre=.3;const u0=RACE.cars[2].unw;let pits=0;for(let i=0;i<60*140;i++){step(1/60)}
 out.pit=RACE.cars.map(c=>[c.pitCount||0,+c.fuel.toFixed(2),+c.tyre.toFixed(2)]);
 return out})()"""
run(W+'/Poly-Tourismo.html',[('js',a)],'r3')
