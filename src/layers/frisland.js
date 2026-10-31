/* ===== Poly GT layer: Free Roam island generator (Riviera: coast, height field, sites, road network, all from a seed) ===== */
(function frisland(){
'use strict';
const P=window.PT8,PI=Math.PI,TAU=PI*2;
const lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>v<a?a:v>b?b:v,sm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const smin=(a,b,k)=>{const h=clamp(.5+.5*(b-a)/k,0,1);return lerp(b,a,h)-k*h*(1-h)},smax=(a,b,k)=>-smin(-a,-b,k);
const WX=6720,WZ=4720,CELL=8,GX=WX/CELL+1,GZ=WZ/CELL+1;
/* ---------- seeded noise ---------- */
const hs=(i,j,s)=>{let h=Math.imul(i,374761393)^Math.imul(j,668265263)^Math.imul(s,2246822519);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295};
const vn=(x,z,s)=>{const i=Math.floor(x),j=Math.floor(z),fx=x-i,fz=z-j,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz),a=hs(i,j,s),b=hs(i+1,j,s),c=hs(i,j+1,s),d=hs(i+1,j+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v};
const fbm=(x,z,o,s)=>{let t=0,a=.5,f=1,n=0;for(let k=0;k<o;k++){t+=a*vn(x*f+k*17.3,z*f-k*9.1,s+k);n+=a;a*=.5;f*=2.03}return t/n};
/* ridged noise: sharp crests, 0..1 */
const rdg=(x,z,o,s)=>{let t=0,a=.5,f=1,n=0;for(let k=0;k<o;k++){const v=1-Math.abs(2*vn(x*f+k*31.7,z*f-k*13.3,s+k)-1);t+=a*v*v;n+=a;a*=.5;f*=2.07}return t/n};
const rngOf=seed=>{let s=seed>>>0||1;return()=>{s=Math.imul(s^(s>>>15),2246822507);s=Math.imul(s^(s>>>13),3266489909);s^=s>>>16;return(s>>>0)/4294967296}};
/* exact squared distance transform (Felzenszwalb): f = 0 at features, 1e12 elsewhere, in place along one line */
function edt1(f,n,d,v,z){let k=0;v[0]=0;z[0]=-1e20;z[1]=1e20;
 for(let q=1;q<n;q++){let s;for(;;){const p=v[k];s=((f[q]+q*q)-(f[p]+p*p))/(2*q-2*p);if(s<=z[k])k--;else break}k++;v[k]=q;z[k]=s;z[k+1]=1e20}
 k=0;for(let q=0;q<n;q++){while(z[k+1]<q)k++;const p=v[k];d[q]=(q-p)*(q-p)+f[p]}}
function edt2(feat,gx,gz){/* distance in cells to the nearest feature cell (feat[k]=1) */
 const g=new Float32Array(gx*gz),n=Math.max(gx,gz),f=new Float32Array(n),d=new Float32Array(n),v=new Int32Array(n),z=new Float32Array(n+1);
 for(let k=0;k<gx*gz;k++)g[k]=feat[k]?0:1e12;
 for(let i=0;i<gx;i++){for(let j=0;j<gz;j++)f[j]=g[j*gx+i];edt1(f,gz,d,v,z);for(let j=0;j<gz;j++)g[j*gx+i]=d[j]}
 for(let j=0;j<gz;j++){for(let i=0;i<gx;i++)f[i]=g[j*gx+i];edt1(f,gx,d,v,z);for(let i=0;i<gx;i++)g[j*gx+i]=d[i]}
 for(let k=0;k<gx*gz;k++)g[k]=Math.sqrt(g[k]);return g}
/* separable box blur, radius r cells, n passes */
function blur(a,gx,gz,r,n){const t=new Float32Array(a.length),w=2*r+1;
 for(let p=0;p<n;p++){for(let j=0;j<gz;j++){let s=0;const o=j*gx;for(let i=-r;i<=r;i++)s+=a[o+clamp(i,0,gx-1)];for(let i=0;i<gx;i++){t[o+i]=s/w;s+=a[o+clamp(i+r+1,0,gx-1)]-a[o+clamp(i-r,0,gx-1)]}}
  for(let i=0;i<gx;i++){let s=0;for(let j=-r;j<=r;j++)s+=t[clamp(j,0,gz-1)*gx+i];for(let j=0;j<gz;j++){a[j*gx+i]=s/w;s+=t[clamp(j+r+1,0,gz-1)*gx+i]-t[clamp(j-r,0,gz-1)*gx+i]}}}
 return a}
/* closed Catmull-Rom through control points, `per` samples per span */
function crClosed(p,per){const n=p.length,o=[];for(let i=0;i<n;i++){const a=p[(i-1+n)%n],b=p[i],c=p[(i+1)%n],d=p[(i+2)%n];for(let k=0;k<per;k++){const t=k/per,t2=t*t,t3=t2*t;o.push([0,1].map(j=>.5*((2*b[j])+(-a[j]+c[j])*t+(2*a[j]-5*b[j]+4*c[j]-d[j])*t2+(-a[j]+3*b[j]-3*c[j]+d[j])*t3)))}}return o}
/* ---------- the island: a drawn outline (km) that the seed bends and roughens ---------- */
const OUT=[[1.55,1.35],[1.85,.95],[2.45,.68],[3.15,.58],[3.85,.6],[4.5,.78],[5.05,1],[5.3,1.38],[5.35,1.75],[5.18,2.05],[5.02,2.28],[5.12,2.58],[5.5,2.82],[5.85,3.15],[5.7,3.6],[5.2,3.95],[4.6,4.15],[4.0,4.2],[3.5,4.12],[3.52,3.86],[3.9,3.62],[3.7,3.36],[3.3,3.2],[2.85,3.15],[2.5,3.28],[2.3,3.5],[2.18,3.86],[1.85,3.95],[1.5,3.72],[1.12,3.3],[.9,2.75],[.88,2.15],[1.12,1.7]];
function make(opt){opt=opt||{};const seed=(opt.seed==null?7:opt.seed)|0,R=rngOf(seed*2654435761+1),S=[1,2,3,4,5,6,7,8].map(i=>seed*13+i*101);
 const M={WX,WZ,CELL,GX,GZ,seed};
 /* outline: seeded wobble of the control points, smooth curve, rocky detail along the normal */
 const ctl=OUT.map(p=>[p[0]*1000+(R()-.5)*110,p[1]*1000+(R()-.5)*110]);
 let poly=crClosed(ctl,14);
 poly=poly.map((p,i,a)=>{const q=a[(i+1)%a.length],o=a[(i+a.length-1)%a.length];let tx=q[0]-o[0],tz=q[1]-o[1];const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;
  const n=(fbm(p[0]/420,p[1]/420,3,S[0])-.5)*2*120+(fbm(p[0]/130,p[1]/130,2,S[1])-.5)*2*26;return[p[0]+tz*n,p[1]-tx*n]});
 M.poly=poly;
 /* scanline fill of the outline */
 const ins=new Uint8Array(GX*GZ),np=poly.length;
 for(let j=0;j<GZ;j++){const z=j*CELL,xs=[];for(let a=0,b=np-1;a<np;b=a++){const pa=poly[a],pb=poly[b];if((pa[1]>z)!==(pb[1]>z))xs.push((pb[0]-pa[0])*(z-pa[1])/(pb[1]-pa[1])+pa[0])}
  xs.sort((a,b)=>a-b);for(let q=0;q+1<xs.length;q+=2){const i0=Math.max(0,Math.ceil(xs[q]/CELL)),i1=Math.min(GX-1,Math.floor(xs[q+1]/CELL));for(let i=i0;i<=i1;i++)ins[j*GX+i]=1}}
 /* signed distance to the coast: exact EDT, then exact segment distance in the last 14 m */
 const wat=new Uint8Array(GX*GZ);for(let k=0;k<GX*GZ;k++)wat[k]=ins[k]?0:1;
 const dW=edt2(wat,GX,GZ),dL=edt2(ins,GX,GZ),SD=new Float32Array(GX*GZ);
 for(let k=0;k<GX*GZ;k++)SD[k]=ins[k]?(dW[k]-.5)*CELL:-(dL[k]-.5)*CELL;
 for(let k=0;k<GX*GZ;k++){if(Math.abs(SD[k])>15)continue;const x=(k%GX)*CELL,z=((k/GX)|0)*CELL;let best=1e12;
  for(let a=0,b=np-1;a<np;b=a++){const pa=poly[a],pb=poly[b],ex=pb[0]-pa[0],ez=pb[1]-pa[1],t=clamp(((x-pa[0])*ex+(z-pa[1])*ez)/(ex*ex+ez*ez||1),0,1),dx=x-pa[0]-ex*t,dz=z-pa[1]-ez*t,d2=dx*dx+dz*dz;if(d2<best)best=d2}
  SD[k]=ins[k]?Math.sqrt(best):-Math.sqrt(best)}
 M.SD=SD;M.ins=ins;
 const sdAt=(x,z)=>{const u=clamp(x/CELL,0,GX-1.001),v=clamp(z/CELL,0,GZ-1.001),i=u|0,j=v|0,fx=u-i,fz=v-j,k=j*GX+i;return SD[k]*(1-fx)*(1-fz)+SD[k+1]*fx*(1-fz)+SD[k+GX]*(1-fx)*fz+SD[k+GX+1]*fx*fz};
 M.sd=sdAt;
 /* smoothed inland distance, so height does not crease along the medial axis */
 const DS=new Float32Array(GX*GZ);for(let k=0;k<GX*GZ;k++)DS[k]=Math.max(SD[k],-40);blur(DS,GX,GZ,18,3);
 const dsAt=(x,z)=>{const u=clamp(x/CELL,0,GX-1.001),v=clamp(z/CELL,0,GZ-1.001),i=u|0,j=v|0,fx=u-i,fz=v-j,k=j*GX+i;return DS[k]*(1-fx)*(1-fz)+DS[k+1]*fx*(1-fz)+DS[k+GX]*(1-fx)*fz+DS[k+GX+1]*fx*fz};
 /* named places in the drawn outline: the bay head, the mountain spine */
 const bay=[2900,3050],bayR=900;M.bay=bay;
 const spine=[[1900,1650],[2500,1500],[3000,1480],[3600,1700],[4150,1950],[4650,2500],[4650,3300]],peaks=[[2950,1500,235,540],[3900,1850,200,520],[2200,1700,120,430],[4700,3000,100,380],[4650,2450,120,380]];M.spine=spine;M.peaks=peaks;
 const spd=(x,z)=>{let best=1e12;for(let i=0;i<spine.length-1;i++){const a=spine[i],b=spine[i+1],ex=b[0]-a[0],ez=b[1]-a[1],t=clamp(((x-a[0])*ex+(z-a[1])*ez)/(ex*ex+ez*ez),0,1),dx=x-a[0]-ex*t,dz=z-a[1]-ez*t;best=Math.min(best,dx*dx+dz*dz)}return Math.sqrt(best)};
 /* coast character: 0 = beach and low shore, 1 = sea cliff (cliffs face north and east, the bay stays soft) */
 const cliffAt=(x,z)=>{const nf=fbm(x/1000+S[3],z/1000,3,S[3]),bx=x-bay[0],bz=z-bay[1],bayF=Math.exp(-(bx*bx+bz*bz)/(2*1150*1150));
  const ex=clamp(((x-WX*.5)*.6-(z-WZ*.5)*.75)/2400,-.4,1),cf=sm(.34,.58,nf)*.85+.35*ex;return clamp(cf-1.1*bayF,0,1)};
 M.cliff=cliffAt;
 function hAt(x,z,d,dsm){const c=cliffAt(x,z);
  if(d<=0){const s=-d,shelf=Math.min(46,1+.05*s+.00018*s*s),drop=Math.min(70,1.4+.24*s);return-lerp(shelf,drop,c)}
  const bw=x-bay[0],bz=z-bay[1],hb=Math.exp(-(bw*bw+bz*bz)/(2*bayR*bayR)),bowl=1-Math.exp(-Math.max(dsm,0)/430);
  const wx=x+90*(fbm(x/900+5,z/900,2,S[4])-.5),wz=z+90*(fbm(x/900,z/900+9,2,S[5])-.5);
  const wB=sm(2000,2900,z)*sm(3500,4300,x),rg=.6*lerp(rdg(x/520,z/1700,3,S[4]),rdg(x/1700,z/520,3,S[4]),wB)+.4*rdg(wx/760,wz/760,3,S[5]),mass=Math.exp(-Math.pow(spd(x,z)/820,2));
  let e=bowl*(20+78*mass*(.3+.9*rg)+26*rg)*(1-.82*hb);
  for(const p of peaks){const dx=x-p[0],dz=z-p[1];e+=p[2]*Math.exp(-(dx*dx+dz*dz)/(2*p[3]*p[3]))*bowl}
  e+=(11*(fbm(x/260,z/260,3,S[6])-.5)+3.2*(fbm(x/80,z/80,2,S[7])-.5)+44*(fbm(x/720+3,z/720,3,S[5])-.5))*sm(30,220,d)*(1-.7*hb);
  const beach=smin(e+1.1,1.2+.05*d+700*sm(130,430,d),12),cl=70*sm(.4,.72,fbm(x/520+S[7],z/520,3,S[7])),cliff=e+cl*sm(0,26,d)*(1-sm(30,330,d));
  return Math.max(lerp(beach,cliff,c),.2)}
 const BH=new Float32Array(GX*GZ);
 for(let j=0;j<GZ;j++)for(let i=0;i<GX;i++){const k=j*GX+i;BH[k]=hAt(i*CELL,j*CELL,SD[k],dsAt(i*CELL,j*CELL))}
 M.BH=BH;
 M.baseH=(x,z)=>{const u=clamp(x/CELL,0,GX-1.001),v=clamp(z/CELL,0,GZ-1.001),i=u|0,j=v|0,fx=u-i,fz=v-j,k=j*GX+i;return BH[k]*(1-fx)*(1-fz)+BH[k+1]*fx*(1-fz)+BH[k+GX]*(1-fx)*fz+BH[k+GX+1]*fx*fz};
 M.sites=pickSites(M);M.roads=routeRoads(M,M.sites);M.stops=layoutStops(M);
 return M}
/* ---------- sites: towns and stops, found on the terrain near their drawn positions ---------- */
const slopeAt=(M,x,z)=>{const e=14;return Math.hypot(M.baseH(x+e,z)-M.baseH(x-e,z),M.baseH(x,z+e)-M.baseH(x,z-e))/(2*e)};
const flatAt=(M,x,z,r)=>{let lo=1e9,hi=-1e9;for(const[a,b]of[[0,0],[1,0],[-1,0],[0,1],[0,-1],[.7,.7],[-.7,.7],[.7,-.7],[-.7,-.7]]){const h=M.baseH(x+a*r,z+b*r);lo=Math.min(lo,h);hi=Math.max(hi,h)}return hi-lo};
const seaView=(M,x,z)=>{const eye=M.baseH(x,z)+14;let n=0;for(let a=0;a<12;a++){const dx=Math.cos(a*TAU/12),dz=Math.sin(a*TAU/12);let seen=false;for(let t=60;t<1800;t+=45){const px=x+dx*t,pz=z+dz*t;if(px<0||pz<0||px>WX||pz>WZ)break;if(M.baseH(px,pz)>eye-t*.012)break;if(M.sd(px,pz)<-30){seen=true;break}}if(seen)n++}return n/12};
function findSite(M,tx,tz,rad,ok,score){let best=null,bs=-1e9;for(let z=tz-rad;z<=tz+rad;z+=20)for(let x=tx-rad;x<=tx+rad;x+=20){if(x<150||z<150||x>WX-150||z>WZ-150)continue;const d=M.sd(x,z);if(d<=0)continue;const h=M.baseH(x,z);if(!ok(x,z,d,h))continue;const sc=score(x,z,d,h)-Math.hypot(x-tx,z-tz)*.012;if(sc>bs){bs=sc;best={x,z,h,d}}}return best}
function pickSites(M){const S={},add=(id,name,r,o)=>{if(r){r.id=id;r.name=name;Object.assign(r,o||{});S[id]=r}};
 /* the harbour town: the shore at the bay head, town just behind it, facing the sea */
 {const b=M.bay;let sz=null;for(let z=b[1]+420;z>b[1]-520;z-=8)if(M.sd(b[0],z)>0){sz=z;break}
  if(sz!=null){const e=30,gx=(M.sd(b[0]+e,sz)-M.sd(b[0]-e,sz)),gz=(M.sd(b[0],sz+e)-M.sd(b[0],sz-e)),gl=Math.hypot(gx,gz)||1,nx=gx/gl,nz=gz/gl;
   add('porto','PORTO',{x:b[0]+nx*190,z:sz+nz*190,h:M.baseH(b[0]+nx*190,sz+nz*190),nx,nz,shore:[b[0],sz]},{town:1,rad:250})}}
 add('borgo','BORGO ALTO',findSite(M,1500,2300,520,(x,z,d,h)=>d>150&&d<900&&h>45&&h<140&&slopeAt(M,x,z)<.3,(x,z,d,h)=>-flatAt(M,x,z,45)*1.6+seaView(M,x,z)*14+h*.05),{town:1,rad:175});
 add('rocco','SAN ROCCO',findSite(M,4650,3300,500,(x,z,d,h)=>d>110&&d<700&&h>25&&h<130&&slopeAt(M,x,z)<.28,(x,z,d,h)=>-flatAt(M,x,z,45)*1.6+seaView(M,x,z)*14+h*.04),{town:1,rad:150});
 add('cala','CALA',findSite(M,5050,2300,380,(x,z,d,h)=>d>22&&d<110&&h<16&&slopeAt(M,x,z)<.18,(x,z,d,h)=>-flatAt(M,x,z,40)*2-h*.4),{town:1,rad:105});
 add('faro','FARO',findSite(M,3650,4020,330,(x,z,d,h)=>d>20&&d<90&&slopeAt(M,x,z)<.3,(x,z,d,h)=>h*.5-flatAt(M,x,z,20)));
 {let best=null;const pk=M.peaks[0];for(let z=pk[1]-260;z<=pk[1]+260;z+=16)for(let x=pk[0]-260;x<=pk[0]+260;x+=16){const h=M.baseH(x,z);if(!best||h>best.h)best={x,z,h,d:M.sd(x,z)}}add('monte','MONTE GRANDE',best)}
 add('nord','NORD',findSite(M,3450,1020,380,(x,z,d,h)=>d>60&&d<150&&h>20&&h<90&&slopeAt(M,x,z)<.3,(x,z,d,h)=>-slopeAt(M,x,z)*30));
 add('nordest','NORDEST',findSite(M,4850,1200,380,(x,z,d,h)=>d>60&&d<150&&h>14&&h<90&&slopeAt(M,x,z)<.3,(x,z,d,h)=>-slopeAt(M,x,z)*30));
 add('ovest','OVEST',findSite(M,1130,2450,380,(x,z,d,h)=>d>60&&d<150&&h>10&&h<90&&slopeAt(M,x,z)<.3,(x,z,d,h)=>-slopeAt(M,x,z)*30));
 return Object.values(S)}
/* ---------- roads: least-cost routes with a grade limit, so climbs wind into hairpins ---------- */
function routeRoads(M,sites){const CS=32,gx=Math.ceil(WX/CS)+1,gz=Math.ceil(WZ/CS)+1,N=gx*gz,by={};sites.forEach(s=>by[s.id]=s);
 const okc=new Uint8Array(N),hc=new Float32Array(N),slc=new Float32Array(N),sdc=new Float32Array(N),roadc=new Uint8Array(N);
 for(let j=0;j<gz;j++)for(let i=0;i<gx;i++){const k=j*gx+i,x=i*CS,z=j*CS,d=M.sd(x,z);sdc[k]=d;let h=0;for(const[a,b]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])h+=M.baseH(x+a*12,z+b*12);hc[k]=h/5;slc[k]=slopeAt(M,x,z);okc[k]=d>=28&&x>80&&z>80&&x<WX-80&&z<WZ-80?1:0}
 const mz=new Float32Array(N);for(let j=0;j<gz;j++)for(let i=0;i<gx;i++)mz[j*gx+i]=fbm(i*CS/380+3.1,j*CS/380,2,M.seed*7+3);
 const DX=[1,2,1,1,0,-1,-1,-2,-1,-2,-1,-1,0,1,1,2],DZ=[0,1,1,2,1,2,1,1,0,-1,-1,-2,-1,-2,-1,-1],TURN=[0,5,20];
 const roads=[];
 function astar(a,b,o){const si=Math.round(a.x/CS),sj=Math.round(a.z/CS),ei=Math.round(b.x/CS),ej=Math.round(b.z/CS),G=new Float32Array(N*16).fill(1e30),Pn=new Int32Array(N*16).fill(-1),gmax=o.gmax||.12;
  let hf=[],hi=[];const push=(f,s)=>{let i=hf.length;hf.push(f);hi.push(s);while(i>0){const p=(i-1)>>1;if(hf[p]<=hf[i])break;[hf[p],hf[i]]=[hf[i],hf[p]];[hi[p],hi[i]]=[hi[i],hi[p]];i=p}};
  const pop=()=>{const f=hf[0],s=hi[0],lf=hf.pop(),ls=hi.pop();if(hf.length){hf[0]=lf;hi[0]=ls;let i=0;for(;;){let l=2*i+1,r=l+1,m=i;if(l<hf.length&&hf[l]<hf[m])m=l;if(r<hf.length&&hf[r]<hf[m])m=r;if(m===i)break;[hf[m],hf[i]]=[hf[i],hf[m]];[hi[m],hi[i]]=[hi[i],hi[m]];i=m}}return[f,s]};
  const hh=(i,j)=>Math.hypot((i-ei)*CS,(j-ej)*CS)*.5;
  for(let q=0;q<16;q++){const st=(sj*gx+si)*16+q;G[st]=0;push(hh(si,sj),st)}
  let goal=-1;
  while(hf.length){const[f,st]=pop(),k=st>>4,hd=st&15,i=k%gx,j=(k/gx)|0,g=G[st];if(f-hh(i,j)>g+1e-3)continue;if(i===ei&&j===ej){goal=st;break}
   for(let m=0;m<16;m++){const df=(m-hd+16)&15;if(df>2&&df<14)continue;const ni=i+DX[m],nj=j+DZ[m];if(ni<0||nj<0||ni>=gx||nj>=gz)continue;const nk=nj*gx+ni;if(!okc[nk]&&!(ni===ei&&nj===ej))continue;
    const len=Math.hypot(DX[m],DZ[m])*CS,dh=hc[nk]-hc[k],gr=Math.abs(dh)/len;if(gr>gmax)continue;
    if((DX[m]*DX[m]>1||DZ[m]*DZ[m]>1)&&M.sd((i+DX[m]/2)*CS,(j+DZ[m]/2)*CS)<24)continue;
    let c=len*(1+3*(gr/.08)*(gr/.08))*(.88+.34*mz[nk])+.8*Math.abs(dh);const sl=slc[nk];if(sl>.35)c*=1+5*(sl-.35)*(sl-.35)*4;
    if(o.coast&&sdc[nk]>45&&sdc[nk]<230)c*=.8;if(roadc[nk])c*=o.reuse||.4;c+=TURN[df>2?16-df:df];
    const ns=nk*16+m,ng=g+c;if(ng<G[ns]){G[ns]=ng;Pn[ns]=st;push(ng+hh(ni,nj),ns)}}}
  if(goal<0)return null;const cells=[];for(let s=goal;s>=0;s=Pn[s]){const k=s>>4;cells.push([k%gx,(k/gx)|0])}cells.reverse();return cells}
 const nearRoad=(x,z,rad)=>{let bd=rad*rad,bp=null;for(const r of roads)for(let i=0;i<r.x.length;i+=2){const dx=r.x[i]-x,dz=r.z[i]-z,d2=dx*dx+dz*dz;if(d2<bd){bd=d2;bp=[r.x[i],r.z[i],r,i]}}return bp};
 function smooth(pts){let q=pts;for(let it=0;it<3;it++){const o=[q[0]];for(let i=0;i<q.length-1;i++){const a=q[i],b=q[i+1];o.push([a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25],[a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75])}o.push(q[q.length-1]);q=o}
  for(let it=0;it<8;it++){const o=q.map(p=>p.slice());for(let i=1;i<q.length-1;i++){o[i][0]=q[i][0]+.3*((q[i-1][0]+q[i+1][0])/2-q[i][0]);o[i][1]=q[i][1]+.3*((q[i-1][1]+q[i+1][1])/2-q[i][1])}q=o}
  const cum=[0];for(let i=1;i<q.length;i++)cum.push(cum[i-1]+Math.hypot(q[i][0]-q[i-1][0],q[i][1]-q[i-1][1]));const L=cum[cum.length-1],n=Math.max(2,Math.round(L/6)),out=[];let j=0;
  for(let k=0;k<=n;k++){const t=k/n*L;while(j<q.length-2&&cum[j+1]<t)j++;const f=(t-cum[j])/((cum[j+1]-cum[j])||1);out.push([lerp(q[j][0],q[j+1][0],f),lerp(q[j][1],q[j+1][1],f)])}
  for(const p of out){for(let it=0;it<6;it++){const d=M.sd(p[0],p[1]);if(d>=16)break;const e=12,gxx=M.sd(p[0]+e,p[1])-M.sd(p[0]-e,p[1]),gzz=M.sd(p[0],p[1]+e)-M.sd(p[0],p[1]-e),gl=Math.hypot(gxx,gzz)||1;p[0]+=gxx/gl*(18-d);p[1]+=gzz/gl*(18-d)}}
  return out}
 function finish(id,pts,o,from,to){const n=pts.length,x=new Float32Array(n),z=new Float32Array(n),y=new Float32Array(n),cum=new Float32Array(n);
  for(let i=0;i<n;i++){x[i]=pts[i][0];z[i]=pts[i][1];y[i]=M.baseH(x[i],z[i]);if(i)cum[i]=cum[i-1]+Math.hypot(x[i]-x[i-1],z[i]-z[i-1])}
  const sm3=()=>{const t=y.slice();for(let i=0;i<n;i++){let s=0,c=0;for(let k=-6;k<=6;k++){const q=i+k;if(q<0||q>=n)continue;s+=t[q];c++}y[i]=s/c}};sm3();sm3();sm3();
  const g=(o.gmax||.12)*.92,ds=6;for(let p=0;p<2;p++){for(let i=1;i<n;i++)y[i]=clamp(y[i],y[i-1]-g*ds,y[i-1]+g*ds);for(let i=n-2;i>=0;i--)y[i]=clamp(y[i],y[i+1]-g*ds,y[i+1]+g*ds)}sm3();
  /* ends that meet another road take its height */
  for(const[e,ref]of[[0,from],[n-1,to]]){if(!ref)continue;const r=ref[2],yy=r.y[ref[3]];for(let k=0;k<26;k++){const q=e===0?k:n-1-k;if(q<0||q>=n)break;const w=1-sm(0,26,k);y[q]=lerp(y[q],yy,w)}}
  /* the three mountain roads run flat into the summit square */
  {const mo=by.monte;if(mo){const yy=M.baseH(mo.x,mo.z);for(const[e,sg]of[[0,1],[n-1,-1]]){if(Math.hypot(x[e]-mo.x,z[e]-mo.z)>30)continue;for(let k=0;k<11;k++){const q=e+sg*k;if(q<0||q>=n)break;y[q]=lerp(y[q],yy,1-sm(0,60,k*6))}}}}
  const r={id,x,z,y,cum,n,len:cum[n-1],hw:o.hw||6,dy:o.dy||.08,dense:true,col:o.col||[255,238,120],type:o.type||'road',gr:o.gr};roads.push(r);
  for(const rr of[r])for(let i=0;i<rr.n;i++){const ci=Math.round(rr.x[i]/CS),cj=Math.round(rr.z[i]/CS);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const ni=ci+a,nj=cj+b;if(ni>=0&&nj>=0&&ni<gx&&nj<gz)roadc[nj*gx+ni]=1}}return r}
 function route(id,ids,o){const list=ids.map(i=>by[i]).filter(Boolean);let c=0;for(let q=0;q<list.length-1;q++){const a=list[q],b=list[q+1];if(a===b)continue;let cells=astar(a,b,o);for(let f=1.35;!cells&&f<2.7;f*=1.35)cells=astar(a,b,Object.assign({},o,{gmax:(o.gmax||.12)*f}));if(!cells){M.fail=(M.fail||[]).concat([a.id+'>'+b.id]);continue}
   /* free runs only: where the path rides an existing road, the road is already there */
   const free=cells.map(c0=>!roadc[c0[1]*gx+c0[0]]||Math.hypot(c0[0]*CS-a.x,c0[1]*CS-a.z)<70||Math.hypot(c0[0]*CS-b.x,c0[1]*CS-b.z)<70);let i=0;
   while(i<cells.length){if(!free[i]){i++;continue}let e=i;while(e+1<cells.length&&free[e+1])e++;
    if(e-i>=2||(i===0||e===cells.length-1)){const pts=cells.slice(i,e+1).map(c0=>[c0[0]*CS,c0[1]*CS]);let from=null,to=null;
     if(i>0){const sn=nearRoad(pts[0][0],pts[0][1],CS*2.2);if(sn){from=sn;pts.unshift([sn[0],sn[1]])}}else if(roadc[cells[0][1]*gx+cells[0][0]]===0&&q===0&&false){}
     if(e<cells.length-1){const sn=nearRoad(pts[pts.length-1][0],pts[pts.length-1][1],CS*2.2);if(sn){to=sn;pts.push([sn[0],sn[1]])}}
     if(pts.length>=3)finish(id+(c++?'_'+c:''),smooth(pts),o,from,to)}
    i=e+1}}}
 route('costiera',['porto','ovest','borgo','nord','nordest','cala','rocco','faro','porto'],{coast:1,hw:4.1,dy:.07,type:'main',col:[255,240,130]});
 route('passo',['porto','monte'],{reuse:.95,gmax:.13,hw:3.6,dy:.09,type:'pass',col:[255,150,80]});
 route('crinale',['monte','cala'],{reuse:.9,gmax:.13,hw:3.6,dy:.1,type:'pass',col:[255,150,80]});
 route('borgo_s',['borgo','monte'],{reuse:.9,gmax:.13,hw:3.5,dy:.11,type:'pass',col:[255,150,80]});
 /* ...and stop at the rim of the summit square instead of piling up on one point */
 {const m=by.monte;if(m)for(const r of roads){for(const e of[0,r.n-1]){if(Math.hypot(r.x[e]-m.x,r.z[e]-m.z)>40)continue;
   const R=18,dir=e===0?1:-1;let k=e;while(k>=0&&k<r.n&&Math.hypot(r.x[k]-m.x,r.z[k]-m.z)<R)k+=dir;if(k<0||k>=r.n)continue;
   const kp=k-dir,da=Math.hypot(r.x[kp]-m.x,r.z[kp]-m.z),db=Math.hypot(r.x[k]-m.x,r.z[k]-m.z),f=(R-da)/((db-da)||1),
    nx=lerp(r.x[kp],r.x[k],f),nz=lerp(r.z[kp],r.z[k],f),ny=lerp(r.y[kp],r.y[k],f);
   const px=Array.from(r.x),pz=Array.from(r.z),py=Array.from(r.y);
   if(e===0){px.splice(0,k,nx);pz.splice(0,k,nz);py.splice(0,k,ny)}else{px.splice(k+1,r.n-k-1,nx);pz.splice(k+1,r.n-k-1,nz);py.splice(k+1,r.n-k-1,ny)}
   const n=px.length,cum=new Float32Array(n);for(let i=1;i<n;i++)cum[i]=cum[i-1]+Math.hypot(px[i]-px[i-1],pz[i]-pz[i-1]);
   r.x=Float32Array.from(px);r.z=Float32Array.from(pz);r.y=Float32Array.from(py);r.cum=cum;r.n=n;r.len=cum[n-1]}}}
 /* clean-up: a road lying on another one adds nothing, tight kinks get rounded, and roads that meet at a point share its
    height (they were each graded on their own, so the ground between them tore into 3 m steps) */
 {const rebuild=(r,px,pz,py)=>{const n=px.length,cum=new Float32Array(n);for(let i=1;i<n;i++)cum[i]=cum[i-1]+Math.hypot(px[i]-px[i-1],pz[i]-pz[i-1]);r.x=Float32Array.from(px);r.z=Float32Array.from(pz);r.y=Float32Array.from(py);r.cum=cum;r.n=n;r.len=cum[n-1]};
  const polyY=(b,x,z)=>{let bd=1e9,yy=0;for(let j=0;j<b.n-1;j++){const ex=b.x[j+1]-b.x[j],ez=b.z[j+1]-b.z[j],t=clamp(((x-b.x[j])*ex+(z-b.z[j])*ez)/(ex*ex+ez*ez||1),0,1),d=Math.hypot(x-b.x[j]-ex*t,z-b.z[j]-ez*t);if(d<bd){bd=d;yy=lerp(b.y[j],b.y[j+1],t)}}return[bd,yy]};
  for(let k=roads.length-1;k>=0;k--){const a=roads[k];if(a.len>300)continue;let c=0,m=0;for(let i=0;i<a.n;i+=2){m++;if(roads.some((b,q)=>q!==k&&polyY(b,a.x[i],a.z[i])[0]<7))c++}if(c/m>.9)roads.splice(k,1)}
  for(const r of roads){const px=Array.from(r.x),pz=Array.from(r.z);let ch=false;
   for(let it=0;it<16;it++){let any=false;for(let i=1;i<r.n-1;i++){const ax=px[i]-px[i-1],az=pz[i]-pz[i-1],bx=px[i+1]-px[i],bz=pz[i+1]-pz[i],la=Math.hypot(ax,az),lb=Math.hypot(bx,bz);if(la<.01||lb<.01)continue;
     if((ax*bx+az*bz)/(la*lb)<.95){px[i]=(px[i-1]+2*px[i]+px[i+1])/4;pz[i]=(pz[i-1]+2*pz[i]+pz[i+1])/4;any=true;ch=true}}if(!any)break}
   if(ch)rebuild(r,px,pz,Array.from(r.y))}
  const J=[];for(const r of roads)for(const e of[0,r.n-1]){let c=null;for(const j of J)if(Math.hypot(j.x-r.x[e],j.z-r.z[e])<14){c=j;break}if(!c)J.push(c={x:r.x[e],z:r.z[e],m:[]});c.m.push([r,e])}
  for(const j of J){const anc=[];for(const b of roads){if(j.m.some(q=>q[0]===b))continue;const[d,yy]=polyY(b,j.x,j.z);if(d<10)anc.push(yy)}
   if(j.m.length<2&&!anc.length)continue;const tgt=anc.length?anc.reduce((a,b)=>a+b,0)/anc.length:j.m.reduce((a,q)=>a+q[0].y[q[1]],0)/j.m.length;
   for(const[r,e]of j.m){const d=tgt-r.y[e],sg=e===0?1:-1;if(Math.abs(d)<.02)continue;for(let k=0;k<r.n;k++){const q=e+sg*k;if(q<0||q>=r.n)break;const s=Math.abs(r.cum[q]-r.cum[e]);if(s>160)break;r.y[q]+=d*(1-sm(0,160,s))}}}}
 return roads}
/* ---------- stops: where the shops, lots and landmarks go, found from the roads and sites ---------- */
function layoutStops(M){const S={};M.sites.forEach(x=>S[x.id]=x);const pois=[],plat=[],zones=[],out={pois,plat,zones};
 const roadFrame=(r,i)=>{const a=Math.max(0,i-3),b=Math.min(r.n-1,i+3);let tx=r.x[b]-r.x[a],tz=r.z[b]-r.z[a];const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;let nx=tz,nz=-tx;const e=40;if(M.sd(r.x[i]+nx*e,r.z[i]+nz*e)<M.sd(r.x[i]-nx*e,r.z[i]-nz*e)){nx=-nx;nz=-nz}return{x:r.x[i],z:r.z[i],y:r.y[i],tx,tz,nx,nz,hw:r.hw}};
 const atS=(r,s)=>{let i=0;while(i<r.n-1&&r.cum[i]<s)i++;return roadFrame(r,i)};
 const nearestRoad=(x,z,pred)=>{let bd=1e12,b=null;for(const r of M.roads){if(pred&&!pred(r))continue;for(let i=0;i<r.n;i++){const d=(r.x[i]-x)*(r.x[i]-x)+(r.z[i]-z)*(r.z[i]-z);if(d<bd){bd=d;b=[r,i]}}}return b};
 const poi=(id,n,col,ic,key,x,z,ry,r,o)=>{const q=Object.assign({id,n,col,ic,key,x,z,ry,r},o||{});pois.push(q);return q};
 const lot=(x,z,w,d,ry,type,h)=>{plat.push({x,z,w,d,ry,m:60,h:h==null?M.baseH(x,z):h});zones.push([x,z,w,d,type,ry])};
 const face=(f,side)=>Math.atan2(-f.nx*(side||1),-f.nz*(side||1)); /* a building front looks along -inland: at the road */
 const po=S.porto;
 /* the coast ring as one polyline that starts and ends at the harbour, so stops can be laid out either way from it */
 const rings=M.roads.filter(r=>/^costiera/.test(r.id));let ring=null;
 if(rings.length){let n=0;for(const r of rings)n+=r.n;const x=new Float32Array(n),z=new Float32Array(n),y=new Float32Array(n),cum=new Float32Array(n);let k=0,acc=0;
  for(const r of rings)for(let i=0;i<r.n;i++){x[k]=r.x[i];z[k]=r.z[i];y[k]=r.y[i];if(k)acc+=Math.hypot(x[k]-x[k-1],z[k]-z[k-1]);cum[k]=acc;k++}
  ring={id:'ring',x,z,y,cum,n,hw:rings[0].hw,len:acc}}
 if(po&&ring){const r=ring;{const s0=0,dir=1;
   const spots=[['garage','YOUR GARAGE','#ffd34d','H',40],['tune','TUNE SHOP','#4d7dff','T',150],['job','JOB BOARD','#4dffb0','J',255],['office','RACE OFFICE','#ff4dd2','R',360],['brand','BRAND CENTRAL','#4dd2ff','B',470]];
   for(const[k,n,c,ic,off]of spots){const f=atS(r,s0+dir*off),lat=f.hw+17;poi(k,n,c,ic,k,f.x+f.nx*lat,f.z+f.nz*lat,face(f),15,{road:r.id,fx:f.tx,fz:f.tz})}
   const f0=atS(r,s0+dir*40);out.spawn={x:f0.x,z:f0.z,yaw:Math.atan2(f0.tx*dir,f0.tz*dir)}}}
 /* the filling station on the coast road west of the harbour */
 if(ring){const r=ring,f=atS(r,820),lat=f.hw+22;poi('gas','GAS STATION','#ff6a4d','G','gas',f.x+f.nx*lat,f.z+f.nz*lat,face(f),17,{road:r.id,fx:f.tx,fz:f.tz});lot(f.x+f.nx*(lat-2),f.z+f.nz*(lat-2),60,40,Math.atan2(f.tx,f.tz),2)}
 /* town stops that only serve as destinations */
 for(const[id,col,ic,nm]of[['borgo','#ffa24d','B','BORGO ALTO'],['rocco','#ffa24d','S','SAN ROCCO'],['cala','#ffa24d','C','CALA'],['faro','#ffffff','F','FARO LIGHTHOUSE']])if(S[id])poi(id,nm,col,ic,'town',S[id].x,S[id].z,0,26,{});
 /* summit overlook at the end of the pass */
 if(S.monte){const m=S.monte;let hs=0,hn=0;for(const r of M.roads)for(const e of[0,r.n-1])if(Math.hypot(r.x[e]-m.x,r.z[e]-m.z)<30){hs+=r.y[e];hn++}
  lot(m.x,m.z,40,40,0,4,hn?hs/hn:undefined);poi('view','MONTE GRANDE OVERLOOK','#ffffff','V','view',m.x,m.z,0,22,{})}
 /* the car meet and the drift lot sit beside the harbour road */
 if(po&&ring){const r=ring;{
   const fm=atS(r,r.len-430),lm=fm.hw+86;let mx=fm.x+fm.nx*lm,mz=fm.z+fm.nz*lm;
   if(M.sd(mx,mz)>20){lot(mx,mz,150,104,Math.atan2(fm.tx,fm.tz),2);poi('meet','CAR MEET','#ffa24d','M','meet',mx,mz,0,64,{zone:1})}
   const fd=atS(r,1250),ld=fd.hw+130;const dx=fd.x+fd.nx*ld,dz=fd.z+fd.nz*ld;
   if(M.sd(dx,dz)>20){lot(dx,dz,300,200,Math.atan2(fd.tx,fd.tz),2);poi('drift','DRIFT YARD','#b04dff','D','drift',dx,dz,0,125,{zone:1})}}}
 /* the longest straight on any road: top-speed run, and speed traps on other straights */
 {const cands=[];for(const r of M.roads){if(r.type==='pass')continue;const W=100;for(let i=0;i+W<r.n;i+=6){let mx=0;for(let k=i;k<i+W;k+=5){const a=Math.atan2(r.x[k+5>=r.n?r.n-1:k+5]-r.x[k],r.z[k+5>=r.n?r.n-1:k+5]-r.z[k]),b=Math.atan2(r.x[i+W]-r.x[i],r.z[i+W]-r.z[i]);let d=Math.abs(a-b);if(d>PI)d=TAU-d;mx=Math.max(mx,d)}
     const dy=Math.abs(r.y[i+W]-r.y[i])/(W*6);if(mx<.24&&dy<.05)cands.push({r,i,W,sc:-mx*100-dy*100})}}
   cands.sort((a,b)=>b.sc-a.sc);const used=[];const far=(x,z,d)=>used.every(u=>Math.hypot(u[0]-x,u[1]-z)>d);
   for(const c of cands){if(out.run&&pois.filter(p=>p.key==='trap').length>=3)break;const mx=(c.r.x[c.i]+c.r.x[c.i+c.W])/2,mz=(c.r.z[c.i]+c.r.z[c.i+c.W])/2;if(!far(mx,mz,900))continue;
    if(!out.run){out.run={x0:c.r.x[c.i],z0:c.r.z[c.i],x1:c.r.x[c.i+c.W],z1:c.r.z[c.i+c.W],hw:c.r.hw};poi('run','LUNGOMARE RUN','#ff9a3c','L','run',mx,mz,0,60,{zone:1})}
    else{const k=pois.filter(p=>p.key==='trap').length+1;poi('trap'+k,'SPEED TRAP','#7dff4d','S','trap',mx,mz,Math.atan2(c.r.x[c.i+c.W]-c.r.x[c.i],c.r.z[c.i+c.W]-c.r.z[c.i]),10,{zone:1,road:c.r.id})}
    used.push([mx,mz])}}
 const garage=pois.find(p=>p.key==='garage');if(!out.spawn&&garage)out.spawn={x:garage.x,z:garage.z,yaw:0};
 return out}
P.FRI={make,layoutStops,edt2,fbm,rngOf,smin,smax,WX,WZ,CELL,GX,GZ};
if(typeof module!=='undefined')module.exports=P.FRI;
})();
