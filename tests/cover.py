from shot import run,W
run(W+'/Poly-Tourismo.html',[('js','''(()=>{PT8.launch({mode:'ta',track:8,laps:1,humans:[{id:'merc',alt:0}],ai:[]});const T=RACE.T,U=RACE.scene.userData.span.occ;const {occ,GW,GH,CS,x0,z0}=U;
 const at=(x,z)=>{const i=Math.floor((x-x0)/CS),j=Math.floor((z-z0)/CS);return i<0||j<0||i>=GW||j>=GH?1:occ[j*GW+i]};
 const X0=-50,X1=310,Z0=-150,Z1=170;let free={n:0,w:0,e:0,s:0},tot=0,gapsAt=[];
 for(let x=X0+1;x<X1;x+=1){tot++;if(!at(x,Z0+3)){free.n++;gapsAt.push(['n',x])}if(!at(x,Z1-3)){free.s++;gapsAt.push(['s',x])}}
 for(let z=Z0+1;z<Z1;z+=1){if(!at(X1-3,z)){free.e++;gapsAt.push(['e',z])}if(!at(X0+3,z)){free.w++;gapsAt.push(['w',z])}}
 /* street frontage: just behind the pavement on both sides of island roads */
 let fr=0,frt=0,frg=[];for(let i=0;i<T.N;i+=1){if(T.sg[i]!==2)continue;for(const sd of[-1,1]){const l=sd*(T.hw[i]+3.4+1.2),x=T.x[i]+Math.cos(T.psi[i])*l,z=T.z[i]-Math.sin(T.psi[i])*l;frt++;if(!at(x,z)){fr++;frg.push([Math.round(x),Math.round(z)])}}}
 return JSON.stringify({ring:free,ringLen:tot*4,gaps:gapsAt.slice(0,40),frontFree:fr,frontTotal:frt,frontGaps:frg.slice(0,60)})})()''')],'cv')
