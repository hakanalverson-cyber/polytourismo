from shot import run,W
js="""(()=>{const out={};for(const id of ['merc','lr']){PT8.launch({mode:'ta',track:8,laps:1,humans:[{id:id,alt:0}],ai:[]});const Rc=RACE,T=Rc.T,c=Rc.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};const J=T.jumps[0],gl=T.jgl;let sp=null,land=null,minClear=1e9,log=[];
 for(let i=0;i<60*120&&Rc.state!=='done';i++){step(1/60);const d=(c.idx-J+T.N)%T.N;if(sp===null&&d<3&&c.unw>5)sp=Math.round(c.sp*3.6);
  if(d>=0&&d<gl+25&&c.unw<T.N){const gy=T.y[c.idx];if(i%6===0)log.push([d,+(c.y-gy).toFixed(1),Math.round(c.sp*3.6)]);if(d>=gl)minClear=Math.min(minClear,c.y-T.y[c.idx])}}
 out[id]={kmh:sp,gl,sp:T.sp,minAfter:+minClear.toFixed(2),log:log.slice(0,30)}}return JSON.stringify(out)})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'j8')
