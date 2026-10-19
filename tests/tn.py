from shot import run,W
js="""(()=>{PT8.launch({mode:'mp',track:2,laps:3,humans:[{id:'merc',alt:0},{id:'ferr',alt:0}],ai:[]});scr='game';
 const T=RACE.T;let a=-1;for(let i=0;i<T.N;i++)if(T.tn&&T.tn[i]){a=i;break}
 const [c1,c2]=RACE.cars.filter(c=>c.human);const place=(c,i,off)=>{c.idx=i;c.x=T.x[i]+off;c.z=T.z[i];c.y=T.y[i]+.5;c.vx=c.vz=0};
 for(let k=0;k<30;k++){RACE.state='race';place(c1,a+2,0);place(c2,a+5,3);step(1/60)}
 const inT=clusters(RACE).length;
 for(let k=0;k<30;k++){place(c1,(a+T.N-120)%T.N,0);place(c2,(a+T.N-118)%T.N,3);step(1/60)}
 const outT=clusters(RACE).length;return {tunnelIdx:a,groupsInTunnel:inT,groupsOutside:outT}})()"""
run(W+'/Poly-Tourismo.html',[('wait',1200),('js',js)],'tn')
