from shot import run,W
js="""(()=>{const res={};for(const [gapm,H] of [[22,5.6],[18,5.6],[18,6.5],[16,6.0]]){D[8].jumps=[[7,0,gapm,H]];const row={};
 for(const sk of [.6,.7,.8,.9,1]){PT8.launch({mode:'ta',track:8,laps:1,humans:[{id:'merc',alt:0}],ai:[]});const Rc=RACE,T=Rc.T,c=Rc.cars[0];c.forceAI=1;c.ai={skill:sk,lat:0,name:'T'};
  const J=T.jumps[0],gl=T.jgl;let kmh=null,res_='?';
  for(let i=0;i<60*70&&Rc.state!=='done';i++){step(1/60);const d=(c.idx-J+T.N)%T.N;if(kmh===null&&d<3&&c.unw>5&&c.unw<T.N)kmh=Math.round(c.sp*3.6);
   if(c.respT>.5||c.exp>0){res_='FALL';break}if(d>gl+30&&d<80&&c.unw<T.N){res_='ok';break}}
  row[sk]=kmh+'/'+res_}
 res[gapm+'m/'+H]=row}return JSON.stringify(res)})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'j8d')
