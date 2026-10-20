from shot import run,W
js="""(()=>{const row={};for(const kmh of [80,90,100,110,120,130]){PT8.launch({mode:'ta',track:8,laps:1,humans:[{id:'merc',alt:0}],ai:[]});const Rc=RACE,T=Rc.T,c=Rc.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};
  const J=T.jumps[0],gl=T.jgl,rl=Math.round(60/T.sp);let did=false,res_='?',atGap=0;
  for(let i=0;i<60*70&&Rc.state!=='done';i++){step(1/60);const d=(c.idx-J+T.N)%T.N;
   if(!did&&d>=T.N-rl-4&&d<T.N-rl+2&&c.unw>5){const v=kmh/3.6,sp=Math.hypot(c.vx,c.vz);c.vx*=v/sp;c.vz*=v/sp;did=true}
   if(did&&d<4)atGap=Math.round(c.sp*3.6);
   if(did&&(c.respT>.5||c.exp>0)){res_='FALL';break}if(did&&d>gl+30&&d<80){res_='ok';break}}
  row[kmh]=res_+'@'+atGap}return JSON.stringify(row)})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'j8f')
