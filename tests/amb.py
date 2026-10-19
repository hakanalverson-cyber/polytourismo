from shot import run,W
js="""(()=>{const res={};for(const tr of [0,3,7,8,9]){PT8.launch({mode:'ta',track:tr,laps:3,humans:[{id:'merc',alt:0}],ai:[]});scr='game';paused=false;
 for(let i=0;i<60*8;i++)step(1/60);const c=RACE.cars[0];const D_=PT8.ambDbg,A=D_.A();let evs=0;
 const kinds=D_.prof().ev;try{for(const k of kinds){D_.EV[k](A.ac.currentTime+.01,.2);evs++}}catch(e){return 'EV ERR '+e}
 res[tr]={state:RACE.state,sp:+(c.sp||0).toFixed(1),bus:+A.bus.gain.value.toFixed(3),wind:+A.g.wind.g.gain.value.toFixed(3),roll:+A.g.roll.g.gain.value.toFixed(3),crowd:+A.g.crowd.g.gain.value.toFixed(3),bed:+A.g.bed.g.gain.value.toFixed(3),evs,ctx:A.ac.state}}
 return res})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'amb')
