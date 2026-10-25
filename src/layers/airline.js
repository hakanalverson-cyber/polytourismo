/* ===== Poly GT layer: airline (CPU racing line) =====
   The CPU used to aim at the centre line plus a fixed lane offset, and planned its speed from the centre line's curvature. Now every track
   gets a proper racing line: an elastic band pulled tight between the road edges (outside, apex, outside), kept clear of the walls by the
   car's half-width plus a margin. The CPU steers along that line and plans its corner speeds from the line's own, wider radius. */
(function(){
'use strict';
const P=window.PT8;
function line(T){if(T.rl)return T.rl;const N=T.N,o=new Float32Array(N),lo=new Float32Array(N),hi=new Float32Array(N),cx=new Float32Array(N),cz=new Float32Array(N),nx=new Float32Array(N),nz=new Float32Array(N);
 for(let i=0;i<N;i++){const m=T.wall&&T.wall[i]?1.9:1.45,w=Math.max(0,T.hw[i]-m);lo[i]=-w;hi[i]=w;nx[i]=Math.cos(T.psi[i]);nz[i]=-Math.sin(T.psi[i])}
 /* jumps, gaps and tunnels: stay near the middle */
 for(let i=0;i<N;i++)if((T.gap&&T.gap[i])||(T.tn&&T.tn[i])){const w=Math.min(hi[i],T.hw[i]*.25);lo[i]=-w;hi[i]=w}
 /* the band: each point moves toward the middle of its neighbours (coarse to fine), then is clamped back inside the road */
 for(const[k,it]of[[14,160],[7,160],[3,200]])for(let r=0;r<it;r++){
  for(let i=0;i<N;i++){cx[i]=T.x[i]+nx[i]*o[i];cz[i]=T.z[i]+nz[i]*o[i]}
  for(let i=0;i<N;i++){const a=(i-k+N)%N,b=(i+k)%N,mx=(cx[a]+cx[b])/2-cx[i],mz=(cz[a]+cz[b])/2-cz[i];let v=o[i]+(mx*nx[i]+mz*nz[i])*.6;o[i]=v<lo[i]?lo[i]:v>hi[i]?hi[i]:v}}
 /* light smoothing so the steering never twitches */
 for(let p=0;p<3;p++){const t=o.slice();for(let i=0;i<N;i++){let s=0;for(let q=-2;q<=2;q++)s+=t[(i+q+N)%N];const v=s/5;o[i]=v<lo[i]?lo[i]:v>hi[i]?hi[i]:v}}
 /* curvature of the line itself (max over a short window, like the base kappa) */
 const px=new Float32Array(N),pz=new Float32Array(N);for(let i=0;i<N;i++){px[i]=T.x[i]+nx[i]*o[i];pz[i]=T.z[i]+nz[i]*o[i]}
 const k=new Float32Array(N);for(let i=0;i<N;i++){const a=(i-3+N)%N,b=(i+3)%N,c=i,h1=Math.atan2(px[c]-px[a],pz[c]-pz[a]),h2=Math.atan2(px[b]-px[c],pz[b]-pz[c]),d=Math.hypot(px[b]-px[a],pz[b]-pz[a])||1;k[i]=Math.abs(wr(h2-h1))/(d/2)}
 const kap=new Float32Array(N);for(let i=0;i<N;i++){let m=0;for(let j=-2;j<=2;j++)m=Math.max(m,k[(i+j+N)%N]);/* never trust the line to be more than 2.2x wider than the centre line */kap[i]=Math.max(m,(T.kap?T.kap[i]:0)/2.2)}
 T.rlo=lo;T.rhi=hi;T.rlk=kap;return T.rl=o}
P.racingLine=line;

P.aiInput=function(c,dt){const Rc=RACE,T=Rc.T,N=T.N,a=c.ai||(c.ai={skill:.9,lat:0,mist:0,name:'CPU'}),K0=P.kappa(T),RL=line(T),K=T.rlk;
 const live=Rc.state==='race'&&c.respT<=0&&!(c.exp>0);
 const cs=c.cs,mt=c.mt||MATS.road;
 let skill=a.skill;
 if(c.cool&&!c.forceAI)skill=.55;
 else if(Rc.rubber){const ref=Rc.rubber();skill+=clamp((ref-c.unw)/N*.12,-.05,.04)}
 /* target point on the racing line; each car keeps a small personal offset so the field does not run nose to tail on one thread */
 let kn=0;for(let j=1;j<=7;j++)kn=Math.max(kn,K[(c.idx+j)%N]);
 const ld=Math.min(6+c.sp*.5,Math.max(8,1.15/Math.max(kn,1e-3))),la=Math.max(3,Math.round(ld/T.sp)),ti=(c.idx+la)%N;
 let off=RL[ti]+(a.lat||0)*T.hw[ti]*.18;off=clamp(off,T.rlo[ti],T.rhi[ti]);
 /* side by side: if another car is alongside ahead, move over within the road instead of driving into it */
 for(const o of Rc.cars){if(o===c||o.respT>0||o.fin&&o!==c)continue;const dx=o.x-c.x,dz=o.z-c.z,fw=dx*Math.sin(c.yaw)+dz*Math.cos(c.yaw);if(fw<-2||fw>14)continue;
  const lt=dx*Math.cos(c.yaw)-dz*Math.sin(c.yaw);if(Math.abs(lt)>2.6||o.sp>c.sp+1)continue;const side=lt>0?-1:1;off=clamp(off+side*(2.6-Math.abs(lt))*.9,T.rlo[ti],T.rhi[ti])}
 const s=Math.sin(T.psi[ti]),co=Math.cos(T.psi[ti]),tx=T.x[ti]+co*off,tz=T.z[ti]-s*off,des=Math.atan2(tx-c.x,tz-c.z);
 let st=clamp(wr(des-c.yaw)*2.2,-1,1);
 /* speed plan from the line's radius */
 const gfac=(mt.grip||1)*cs.grip;let tgt=1e9;
 const jm=Math.max(44,Math.min(160,Math.ceil(c.sp*c.sp/(25*cs.brk)/T.sp)+8));for(let j=2;j<=jm;j+=2){const i=(c.idx+j)%N;if(T.gap[i])continue;const k=Math.max(K[i],8e-4),R_=1/k,vz=Math.sqrt(6.5/Math.max(T.kz[i],1e-4)),ice=T.ice[i]?.3:1,vlim=Math.min(vz,P.steerLimit(R_)*.9*Math.min(1,.6+gfac*.4)*ice,Math.sqrt(26*gfac*ice*R_));
  tgt=Math.min(tgt,Math.sqrt(vlim*vlim+2*(12.5*cs.brk)*j*T.sp))}
 const topNow=P.topSpeed(cs,P.GT(cs).length-1)*(mt.top||1);
 tgt=Math.min(tgt,topNow*(.9+.1*skill))*Math.min(1,.55+skill*.5);c._tg=tgt;c._tn=topNow;
 let th=0,br=0;if(!live){th=0}else{if(c.sp<tgt-.8)th=1;else if(c.sp>tgt+1.8)br=1}
 if(live)P.autoGear(c,dt,mt,.86,false);
 if(c.stuck>1.5){th=0;br=1;st=-st}
 if(live&&c.m.wheels.every(w=>!w.g)){st*=.15;th=0;br=0}
 return{th,br,st,hb:0}};
/* medal times: the downhill grip fix and the new CPU line made every lap quicker, so each track's reference (a CPU lap) moves by the
   measured ratio of CPU lap times after/before (Mercedes, one lap). Runs once, after every layer has set its reference. */
const MR={0: 0.926, 1: 0.932, 2: 0.991, 3: 1.016, 4: 0.916, 5: 0.774, 6: 0.895, 7: 0.967, 8: 0.997, 9: 0.901, 10: 0.956, 11: 0.778, 12: 0.999, 13: 1.029, 14: 0.925, 15: 0.954, 16: 0.884};
setTimeout(()=>{if(P._mrScaled||!P.MEDAL_REF)return;P._mrScaled=1;const F=P.MEDAL_REF;for(const k in MR){if(F[k]!=null)F[k]*=MR[k];if(F['r'+k]!=null)F['r'+k]*=MR[k]}},0);
})();