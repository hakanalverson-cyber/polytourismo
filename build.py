#!/usr/bin/env python3
"""Builds dist/Poly-Tourismo.html: base/Poly-Tourismo-v7.html + source patches + src/layers/*.js + src/style.css + assets/car_pack_2.glb.
Usage: python3 build.py [output.html]"""
import re,sys,os
W=os.path.dirname(os.path.abspath(__file__))
SRC=W+'/src'
src=open(W+'/base/Poly-Tourismo-v7.html').read()
def rep(s,a,b,cnt=1):
    assert s.count(a)>=1,('missing',a[:60])
    return s.replace(a,b,cnt)

# Afterhours: warm-white window palette in the backdrop / slab textures (no neon)
src=src.replace("['#ffd77a','#7af0ff','#ff7ad0','#fff6c0'][(r()*4)|0]","['#ffe2a8','#fff0c8','#ffd98a','#fff6dc'][(r()*4)|0]")
src=src.replace("['#ffd77a','#7af0ff','#ff7ad0'][(i+j)%3]","['#ffe2a8','#fff0c8','#ffd98a'][(i+j)%3]")
src=src.replace("['#ff5a7a66','#7af0ff55','#ffd77a55'][i%3]","['#ffd98a55','#fff0c844','#ffe2a844'][i%3]")
src=src.replace("color:d.id==3?0x7af0ff:0xfff0c8","color:d.id==3?0xffe2a8:0xfff0c8")

# shortcut penalty: optional, and only a 10 m set-back
src=rep(src,"c.exTarget=c.safeUnw-(kind==='cut'?CUT_BACK:FALL_BACK);","c.exTarget=c.safeUnw-(kind==='cut'?Math.max(2,Math.round(10/(RACE.T.sp||3))):FALL_BACK);")
src=rep(src,"c.exp=1.7;c.vx=c.vy=c.vz=0;c.sp=0;","c.expMax=kind==='dmg'?3:1.7;c.exp=c.expMax;c.vx=c.vy=c.vz=0;c.sp=0;c.dmg=0;")
src=rep(src,"c.exTarget=c.safeUnw-(kind==='cut'?Math.max","c.exTarget=kind==='dmg'?c.unw:c.safeUnw-(kind==='cut'?Math.max")
src=rep(src,"c.warn=kind==='cut'?'CAR DESTROYED / SHORTCUT / SET BACK 450 M':'CAR DESTROYED / OFF TRACK / SET BACK 180 M';c.warnT=3.4;","c.warn='';c.warnT=0;")
src=rep(src,"if(rv<-3){fx((a.x+b.x)/2,a.y+.5,(a.z+b.z)/2,0xffe080,6,5,.3,.15,8);","if(rv<-3){fx((a.x+b.x)/2,a.y+.5,(a.z+b.z)/2,0xffe080,6,5,.3,.15,8);if(window.__hitFx)window.__hitFx((a.x+b.x)/2,a.y+.5,(a.z+b.z)/2,-rv,a,b);")
src=rep(src,"const wx=c.x-fx_*1.3,wz=c.z-fz_*1.3;fx(wx,c.y-.4,wz,","const _w=WL[2+(Math.random()<.5?0:1)],wx=c.x+fz_*_w[0]+fx_*_w[1],wz=c.z-fx_*_w[0]+fz_*_w[1];fx(wx,c.y-.55,wz,")
src=rep(src,"for(const side of [-1,1])fx(c.x-Math.sin(c.yaw)*1.6+Math.cos(c.yaw)*side*.8,c.y-.4,c.z-Math.cos(c.yaw)*1.6-Math.sin(c.yaw)*side*.8,","for(const side of [-1,1])fx(c.x+Math.cos(c.yaw)*WL[side<0?2:3][0]+Math.sin(c.yaw)*WL[2][1],c.y-.55,c.z-Math.sin(c.yaw)*WL[side<0?2:3][0]+Math.cos(c.yaw)*WL[2][1],")
src=rep(src,"function wheels(car,speed,steer,dt){","window.__wheels=(a,b,c,d)=>wheels(a,b,c,d);function wheels(car,speed,steer,dt){")
src=rep(src,"const prevStepFn=step;","window.__explode=explode;const prevStepFn=step;")
src=rep(src,"const hide=c.exp>0&&c.exp<1.66;","const hide=c.exp>0&&c.exp<(c.expMax||1.7)-.04;")
src=rep(src,"if(d>50){explode(c,'cut');return}if(Math.abs(d)<=50){c.safeIdx=sf.i;c.safeUnw+=d}","if(d>50){if(window.PTO&&PTO.shortcutPenalty===false){c.safeIdx=sf.i;c.safeUnw+=d}else{explode(c,'cut');return}}else if(Math.abs(d)<=50){c.safeIdx=sf.i;c.safeUnw+=d}")
src=rep(src,"explode(c,landsOnFarRoad(c)?'cut':'fall')","explode(c,landsOnFarRoad(c)&&!(window.PTO&&PTO.shortcutPenalty===false)?'cut':'fall')")

# render-time ground contact: smooth the road-grade tilt and the body lift so slope changes never jitter
src=rep(src,"const i=close.i,j=(i+2)%T.N,k=(i-2+T.N)%T.N,grade=(T.y[j]-T.y[k])/(4*T.sp),delta=wr(c.yaw-T.psi[i]);c.vTp=-Math.atan(grade*Math.cos(delta)-T.bank[i]*Math.sin(delta));c.vTr=-Math.atan(T.bank[i]*Math.cos(delta)+grade*Math.sin(delta));}","const i=close.i,j=(i+5)%T.N,k=(i-5+T.N)%T.N,grade=(T.y[j]-T.y[k])/(10*T.sp),delta=wr(c.yaw-T.psi[i]),tp_=-Math.atan(grade*Math.cos(delta)-T.bank[i]*Math.sin(delta)),tr_=-Math.atan(T.bank[i]*Math.cos(delta)+grade*Math.sin(delta)),kf_=1-Math.exp(-dtf*9);c.vTp=c.vTp===undefined?tp_:c.vTp+(tp_-c.vTp)*kf_;c.vTr=c.vTr===undefined?tr_:c.vTr+(tr_-c.vTr)*kf_;}")
src=rep(src,"v.position.y+=lift;m.exhaustRig.position.y=v.position.y;}","c._lf=(c._lf===undefined||c.respT>.3)?lift:c._lf+(lift-c._lf)*(1-Math.exp(-dtf*12));v.position.y+=c._lf;m.exhaustRig.position.y=v.position.y;}")
src=rep(src,"const G0=26,K=46,DM=3.6,L0=.62,RW=.38,WX=.98,WZ=1.65,IP=1.5,IR=.8,TOP=38,TOPB=52,ACC=24,BRK=40,REV=16,ROLL=3.5,DRAG=.0007,GRIP=9;","let G0=26,K=80,DM=7,L0=.62,RW=.38,WX=.98,WZ=1.65,IP=1.5,IR=.8,TOP=38,TOPB=52,ACC=24,BRK=40,REV=16,ROLL=3.5,DRAG=.0007,GRIP=9;")
src=rep(src,"FX.length>=260","FX.length>=420")
src=rep(src,"MS.tick(T0);R.setScissorTest","MS.tick(Math.max(0,T0));R.setScissorTest")
src=rep(src,"document.title='Poly Tourismo v7';rs();\n})();","document.title='Poly Tourismo v9';rs();window.PT7={makePhotos,photos};\n})();")
src=rep(src,"['boostFov','BOOST FOV'],","")
src=rep(src,"['units','SPEED UNITS',['kmh','mph']],","")
src=rep(src,"units:'kmh',showroom","units:'mph',showroom")
src=rep(src,"driftSpeed:76,","driftMph:47,")
src=rep(src,"fw>o.driftSpeed/3.6&&","fw>o.driftMph/2.23694&&")
src=rep(src,"['driftSpeed','DRIFT SPEED KMH',60,100,2],","['driftMph','DRIFT SPEED MPH',37,62,1],")
src=rep(src,"} catch(e) {}\n\nconst compile","} catch(e) {}\no.units='mph';\n\nconst compile")
src=rep(src,"ABOVE 76 KM/H","ABOVE 47 MPH")

# ---------- v9 world patches ----------
src=rep(src,"function styleMaterial(m){","const TODU={mul:{value:new THREE.Vector3(1,1,1)},add:{value:new THREE.Vector3(0,0,0)},sat:{value:1}};window.TODU=TODU;\nfunction styleMaterial(m){")
src=rep(src,"m.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',`#include <dithering_fragment>","m.onBeforeCompile=shader=>{shader.uniforms.uTodMul=TODU.mul;shader.uniforms.uTodAdd=TODU.add;shader.uniforms.uTodSat=TODU.sat;shader.fragmentShader='uniform vec3 uTodMul;uniform vec3 uTodAdd;uniform float uTodSat;\\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',`#include <dithering_fragment>")
src=rep(src," gl_FragColor.rgb=clamp((gl_FragColor.rgb-0.5)*1.045+0.5,0.0,1.0);\n `)};m.customProgramCacheKey=()=> 'street-matte-v3'"," gl_FragColor.rgb=clamp((gl_FragColor.rgb-0.5)*1.045+0.5,0.0,1.0);\n float tl=dot(gl_FragColor.rgb,vec3(0.2126,0.7152,0.0722));gl_FragColor.rgb=mix(vec3(tl),gl_FragColor.rgb,uTodSat)*uTodMul+uTodAdd;\n `)};m.customProgramCacheKey=()=> 'street-matte-v4'")

# car sits ON the road: physics rest height is road+1.02 but the model bottom was drawn at -0.72 (0.3 m of float)
src=rep(src,"v.position.y=-.72+m.visualHeight/2;const close","v.position.y=-.95+m.visualHeight/2;const close")
src=rep(src,"m.g.localToWorld(new V(x,-.72,z))","m.g.localToWorld(new V(x,-.95,z))")
# road height: in tight / climbing corners neighbouring segments overlap on the inside; picking the highest one made the car pop upward. Take the segment you are actually over (smallest lateral offset) within the same road level.
src=rep(src,"if(h<=y+1.2&&h>best){best=h;bi=i;bl=lat;}\n }}\n return bi>=0?{h:best,road:1,i:bi,lat:bl}",
 "if(h<=y+1.2){if(h>best)best=h;if(cn<64){cH[cn]=h;cI[cn]=i;cL[cn]=lat;cn++}}\n }}\n if(cn){let ba=1e9;for(let q=0;q<cn;q++)if(cH[q]>best-1.5&&Math.abs(cL[q])<ba){ba=Math.abs(cL[q]);bi=cI[q];bl=cL[q];h2=cH[q]}best=h2}\n return bi>=0?{h:best,road:1,i:bi,lat:bl}")
src=rep(src,"T.surf=(x,z,y)=>{\n const cx=Math.floor(x/CS),cz=Math.floor(z/CS);let best=-1e9,bi=-1,bl=0;","T.surf=(x,z,y)=>{\n const cx=Math.floor(x/CS),cz=Math.floor(z/CS);let best=-1e9,bi=-1,bl=0,cn=0,h2=0;const cH=SF_H,cI=SF_I,cL=SF_L;")
src=rep(src,"function buildWorld(T){","const SF_H=new Float64Array(64),SF_I=new Int32Array(64),SF_L=new Float64Array(64);\nfunction buildWorld(T){")
# terrain: wider adaptive shoulder, search radius +-2 cells, physics+visual share one clamped height function
src=rep(src,"for(let a=-1;a<=1;a++)for(let c=-1;c<=1;c++){const l=T.grid.get(gk(cx+a,cz+c));if(!l)continue;for(const i of l){const dx=x-T.x[i],dz=z-T.z[i],d2=dx*dx+dz*dz;if(T.gap[i]){if(d2<dg)dg=d2}",
 "for(let a=-2;a<=2;a++)for(let c=-2;c<=2;c++){const l=T.grid.get(gk(cx+a,cz+c));if(!l)continue;for(const i of l){const dx=x-T.x[i],dz=z-T.z[i],d2=dx*dx+dz*dz;if(T.gap[i]){if(d2<dg)dg=d2}")
src=rep(src,"b=lerp(yr,b,sm(hw,hw+d.shoulder,dd))}","b=lerp(yr,b,sm(hw+1.1,hw+1.1+d.shoulder+clamp(Math.abs(yr-b)*1.6,0,30),dd))}")
src=rep(src,"if(dg<1e9)b-=30*(1-sm(5,12,Math.sqrt(dg)));return b};\nT.surf=",
 "if(dg<1e9)b-=30*(1-sm(5,12,Math.sqrt(dg)));return b};\n{const t0=T.terr;T.terr=(x,z)=>{let h=t0(x,z);const cx=Math.floor(x/16),cz=Math.floor(z/16);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const ids=T.grid.get((cx+a)*8192+cz+b);if(!ids)continue;for(const i of ids){const j=(i+1)%T.N,dx=T.x[j]-T.x[i],dz=T.z[j]-T.z[i],fr=((x-T.x[i])*dx+(z-T.z[i])*dz)/(dx*dx+dz*dz),f=clamp(fr,0,1),px=lerp(T.x[i],T.x[j],f),pz=lerp(T.z[i],T.z[j],f),dist=Math.hypot(x-px,z-pz);if((fr<0||fr>1)&&dist<T.hw[i]+2.5)continue;if(dist<T.hw[i]+8){const psi=T.psi[i]+wr(T.psi[j]-T.psi[i])*f,lat=(x-px)*Math.cos(psi)-(z-pz)*Math.sin(psi),y=lerp(T.y[i],T.y[j],f)-lat*lerp(T.bank[i],T.bank[j],f);h=Math.min(h,y-(T.d.gravel?.04:.14)+Math.max(0,dist-T.hw[i]-1.25)*.85)}}}return h}}\nT.surf=")
a=src.index("function terrainBed(T,x,z){");b=src.index("\n",src.index("return h;}",a))
src=src[:a]+"function terrainBed(T,x,z){return T.terr(x,z)}"+src[b:]
# start line: strip that hugs the road surface
a=src.index("const s0=0,sn=Math.sin(T.psi[s0])");b=src.index("\n",a)
newsl="""const s0=0,sn=Math.sin(T.psi[s0]),sc0=Math.cos(T.psi[s0]);{const pos=[],uv=[],ind=[],Nn=T.N,i0=0,i1=1,ft=[0,.4,.8];for(const f of ft)for(let j=0;j<=16;j++){const l=lerp(-T.hw[0],T.hw[0],j/16),x=lerp(T.x[i0]+Math.cos(T.psi[i0])*l,T.x[i1]+Math.cos(T.psi[i1])*l,f),z=lerp(T.z[i0]-Math.sin(T.psi[i0])*l,T.z[i1]-Math.sin(T.psi[i1])*l,f),y=lerp(T.y[i0]-l*T.bank[i0],T.y[i1]-l*T.bank[i1],f)+.07;pos.push(x,y,z);uv.push(j/16,ft.indexOf(f)/2)}
for(let r=0;r<2;r++)for(let j=0;j<16;j++){const a=r*17+j;ind.push(a,a+17,a+1,a+1,a+17,a+18)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ind);
const sm_=new THREE.MeshBasicMaterial({map:ctex(16,2,(x,w,h)=>{for(let i=0;i<16;i++){x.fillStyle=i&1?'#fff':'#111';x.fillRect(i,0,1,1);x.fillStyle=i&1?'#111':'#fff';x.fillRect(i,1,1,1)}}),side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});sc.add(new THREE.Mesh(g,sm_))}"""
src=src[:a]+newsl+src[b:]
# start arch: ground-aware pillars
src=rep(src,"for(const sd of[-1,1])mesh(new THREE.BoxGeometry(.8,8,.8),mat(0xdddddd),sd*(T.hw[0]+1.2),4,0,ar);",
 "for(const sd of[-1,1]){const l=sd*(T.hw[0]+1.2),wx=T.x[0]+Math.cos(T.psi[0])*l,wz=T.z[0]-Math.sin(T.psi[0])*l,gy=Math.min(T.terr(wx,wz),T.y[0]-l*T.bank[0])-T.y[0]-.6,hh=8.4-gy;mesh(new THREE.BoxGeometry(.8,hh,.8),mat(0xdddddd),l,gy+hh/2,0,ar)}")
# gantries
src=rep(src,"for(const sd of [-1,1]){mesh(new THREE.BoxGeometry(.5,8,.6),mat(0x646c6e),sd*(T.hw[k]+2),4,0,g);mesh(new THREE.BoxGeometry(1.6,.35,1.6),mat(0x444a4b),sd*(T.hw[k]+2),.17,0,g)}",
 "for(const sd of [-1,1]){const l=sd*(T.hw[k]+2),wx=T.x[k]+Math.cos(T.psi[k])*l,wz=T.z[k]-Math.sin(T.psi[k])*l,gy=Math.min(T.terr(wx,wz),T.y[k]-l*T.bank[k])-T.y[k]-.5,hh=8.4-gy;mesh(new THREE.BoxGeometry(.5,hh,.6),mat(0x646c6e),l,gy+hh/2,0,g);mesh(new THREE.BoxGeometry(1.6,.7,1.6),mat(0x444a4b),l,gy+.3,0,g)}")
# grandstands: sit on the lowest corner, buried foundation
src=rep(src,"const y=T.terr(x,z),g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=T.psi[k];sc.add(g);mesh(new THREE.BoxGeometry(14,7,20),mat(0x6b7271),0,3.5,0,g);",
 "const cp=Math.cos(T.psi[k]),sp_=Math.sin(T.psi[k]),y=Math.min(...[[-7,-10],[7,-10],[-7,10],[7,10],[0,0]].map(o=>T.terr(x+cp*o[0]+sp_*o[1],z-sp_*o[0]+cp*o[1])))-.2,g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=T.psi[k];sc.add(g);mesh(new THREE.BoxGeometry(14,11,20),mat(0x6b7271),0,1.5,0,g);")


# ---- v9c patches: thick barriers, wall extents, OBB car collisions ----
i0=src.index("function wallMesh(T,side,mt){");i1=src.index("function inst(sc,geo,m,list)")
newwall="""function wallMesh(T,side,mt){const N=T.N,pos=[],idx=[],uv=[],TH=.85;mt.side=THREE.DoubleSide;
 for(let i=0;i<=N;i++){const k=i%N,s=Math.sin(T.psi[k]),c=Math.cos(T.psi[k]),l=side*(T.hw[k]+.3),l2=side*(T.hw[k]+.3+TH),y=T.y[k]-l*T.bank[k],y2=T.y[k]-l2*T.bank[k],bot=T.br[k]?1.6:.3,h=T.wh[k],X1=T.x[k]+c*l,Z1=T.z[k]-s*l,X2=T.x[k]+c*l2,Z2=T.z[k]-s*l2,u=i*T.sp/4;
  pos.push(X1,y-bot,Z1,X1,y+h,Z1, X1,y+h,Z1,X2,y2+h,Z2, X2,y2+h,Z2,X2,y2-bot,Z2);uv.push(u,0,u,1, u,.96,u,1, u,1,u,0)}
 for(let i=0;i<N;i++){if(!T.wall[i]||!T.wall[(i+1)%N]||T.gap[i]||T.gap[(i+1)%N])continue;const a=i*6,b=a+6;for(let f=0;f<3;f++){const p=a+f*2,q=b+f*2;idx.push(p,q,p+1,p+1,q,q+1)}}
 /* end caps: close the open cross-section at the start and end of every wall run */
 const capAt=i=>{const a=i*6,b=pos.length/3;for(const o of [0,1,3,5])pos.push(pos[(a+o)*3],pos[(a+o)*3+1],pos[(a+o)*3+2]);uv.push(0,0,0,1,.2,1,.2,0);idx.push(b,b+1,b+2,b,b+2,b+3)};
 for(let i=0;i<N;i++){if(!T.wall[i]||T.gap[i])continue;const pv=(i-1+N)%N,nx=(i+1)%N;if(!T.wall[pv]||T.gap[pv])capAt(i);if(!T.wall[nx]||T.gap[nx])capAt(i)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,mt);m.castShadow=true;m.receiveShadow=true;return m}
"""
src=src[:i0]+newwall+src[i1:]
EXT="(1.0*Math.abs(Math.cos(wr(c.yaw-T.psi[sc.i])))+2.0*Math.abs(Math.sin(wr(c.yaw-T.psi[sc.i])))*.62)"
assert src.count("T.hw[sc.i]-.9")==2
src=src.replace("T.hw[sc.i]-.9","(T.hw[sc.i]+.3-"+EXT+")")
j0=src.index("function carCollide(a,b){");j1=src.index("/* ---------------- cameras / layout")
newcc="""function carCollide(a,b){const dx=b.x-a.x,dz=b.z-a.z;if(dx*dx+dz*dz>25||Math.abs(a.y-b.y)>1.6)return;const sa=Math.sin(a.yaw),ca=Math.cos(a.yaw),sb=Math.sin(b.yaw),cb=Math.cos(b.yaw),HX=.95,HZ=2.1;let best=1e9,bx=0,bz=0;
 for(const [nx,nz] of [[ca,-sa],[sa,ca],[cb,-sb],[sb,cb]]){const ra=HX*Math.abs(nx*ca-nz*sa)+HZ*Math.abs(nx*sa+nz*ca),rb=HX*Math.abs(nx*cb-nz*sb)+HZ*Math.abs(nx*sb+nz*cb),pr=dx*nx+dz*nz,ov=ra+rb-Math.abs(pr);if(ov<=0)return;if(ov<best){best=ov;const sg=pr<0?-1:1;bx=nx*sg;bz=nz*sg}}
 const ov=best/2+.01;a.x-=bx*ov;a.z-=bz*ov;b.x+=bx*ov;b.z+=bz*ov;const rv=(b.vx-a.vx)*bx+(b.vz-a.vz)*bz;
 if(rv<0){const j=-rv*.75;a.vx-=bx*j;a.vz-=bz*j;b.vx+=bx*j;b.vz+=bz*j;if(rv<-3){fx((a.x+b.x)/2,a.y+.5,(a.z+b.z)/2,0xffe080,6,5,.3,.15,8);noise(.12,.2,1200);RACE.shake=Math.max(RACE.shake,Math.min(1,-rv/15))}}}
"""
src=src[:j0]+newcc+src[j1:]


# ---- v9e: auto-shift option, reverse tracks ----
src=rep(src,"hillHold:true,cameraDistance:1,","hillHold:true,autoShift:false,perfPreset:'HIGH',maxDensity:1.5,shadowRate:2,shadowRes:1536,showFps:false,cameraDistance:1,")
src=rep(src,"['hillHold','HILL HOLD']","['hillHold','HILL HOLD'],\n  ['autoShift','AUTO SHIFT'],\n  ['shortcutPenalty','SHORTCUT PENALTY']")
src=rep(src,"\n AUDIO:[","\n PERFORMANCE:[\n  ['perfPreset','PRESET',['MINIMUM','LOW','MEDIUM','HIGH','ULTRA','CUSTOM']],\n  ['maxDensity','MAX PIXEL DENSITY',1,2,.25],\n  ['resolution','RENDER SCALE',.5,1,.05],\n  ['shadows','SHADOWS'],\n  ['shadowRate','SHADOW UPDATE EVERY N FRAMES',1,4,1],\n  ['shadowRes','SHADOW QUALITY',[512,1024,1536,2048]],\n  ['effects','PARTICLES',[0,1,2]],\n  ['fogReach','FOG DISTANCE',350,1100,50],\n  ['showFps','SHOW FPS']\n ],\n AUDIO:[")
src=rep(src,"function apply(){\n  rs();","function apply(){\n  if(window.PT8&&PT8.perfPre)PT8.perfPre();\n  rs();")
src=rep(src,"          apply();\n        };\n      }else{","          apply();if(tab==='PERFORMANCE')render();\n        };\n      }else{")
src=rep(src,"          out.textContent=o[key];\n          apply();\n        };","          out.textContent=o[key];\n          apply();\n        };input.onchange=()=>{if(tab==='PERFORMANCE')render()};")
src=rep(src,"if(d.city)for(let i=0;i<N;i++)if(T.y[i]>2.5){T.br[i]=1;T.wall[i]=1}","if(d.city)for(let i=0;i<N;i++)if(T.y[i]>2.5){T.br[i]=1;T.wall[i]=1}\nif(d.rev){const rv=a=>{const b=a.slice();for(let i=0;i<N;i++)a[i]=b[(N-i)%N]};['x','z','y','hw','bank','gap','wall','ice','br','wh'].forEach(k=>rv(T[k]));for(let i=0;i<N;i++){const a=(i+1)%N,b=(i-1+N)%N;T.psi[i]=Math.atan2(T.x[a]-T.x[b],T.z[a]-T.z[b]);T.bank[i]=-T.bank[i]}}")
# ---- v9d: ground-aware barriers/posts/lamps, no gravel attitude snap, P4 keys ----
src=rep(src,"const k=i%N,s=Math.sin(T.psi[k]),c=Math.cos(T.psi[k]),l=side*(T.hw[k]+.3),l2=side*(T.hw[k]+.3+TH),y=T.y[k]-l*T.bank[k],y2=T.y[k]-l2*T.bank[k],bot=T.br[k]?1.6:.3,h=T.wh[k],X1=T.x[k]+c*l,Z1=T.z[k]-s*l,X2=T.x[k]+c*l2,Z2=T.z[k]-s*l2,u=i*T.sp/4;\n  pos.push(X1,y-bot,Z1,X1,y+h,Z1, X1,y+h,Z1,X2,y2+h,Z2, X2,y2+h,Z2,X2,y2-bot,Z2);",
 "const k=i%N,s=Math.sin(T.psi[k]),c=Math.cos(T.psi[k]),l=side*(T.hw[k]+.3),l2=side*(T.hw[k]+.3+TH),y=T.y[k]-l*T.bank[k],y2=T.y[k]-l2*T.bank[k],bot=T.br[k]?1.6:.3,h=T.wh[k],X1=T.x[k]+c*l,Z1=T.z[k]-s*l,X2=T.x[k]+c*l2,Z2=T.z[k]-s*l2,u=i*T.sp/4,g1=T.br[k]?y-bot:Math.min(y-bot,T.terr(X1,Z1)-.45),g2=T.br[k]?y2-bot:Math.min(y2-bot,T.terr(X2,Z2)-.45);\n  pos.push(X1,g1,Z1,X1,y+h,Z1, X1,y+h,Z1,X2,y2+h,Z2, X2,y2+h,Z2,X2,g2,Z2);")
src=rep(src,"z=T.z[i]-Math.sin(T.psi[i])*l,y=T.y[i]-l*T.bank[i];posts.push(","z=T.z[i]-Math.sin(T.psi[i])*l,y=T.br[i]?T.y[i]-l*T.bank[i]:Math.min(T.y[i]-l*T.bank[i],T.terr(x,z)+.05);posts.push(")
src=rep(src,"const over=close.road&&c.y-close.h<1.65;","const over=!T.d.gravel&&close.road&&c.y-close.h<1.65;")
src=rep(src,"br=down.has(k.d)?1:0,st=(down.has(k.l)?1:0)-(down.has(k.r)?1:0),hb=down.has(k.h)?1:0;","br=down.has(k.d)?1:0,st=(down.has(k.l)?1:0)-(down.has(k.r)?1:0),hb=(!(window.PT8&&PT8.noHb&&PT8.noHb())&&down.has(k.h))?1:0;")
src=rep(src,"if(g.buttons[2]&&g.buttons[2].pressed)hb=1}}catch(e){}","if(g.buttons[2]&&g.buttons[2].pressed&&!(window.PT8&&PT8.noHb&&PT8.noHb()))hb=1}}catch(e){}")
src=rep(src,"const dmp=Math.exp(-1.3*dt);","const dmp=Math.exp(-3.4*dt);")
src=rep(src,"hillHold:true,autoShift:false,","hillHold:true,autoShift:false,shortcutPenalty:true,p2numpad:false,")
src=rep(src,"['autoShift','AUTO SHIFT']","['autoShift','AUTO SHIFT'],\n  ['p2numpad','PLAYER 2 NUMPAD KEYS']")
src=rep(src,"  if(window.PT8&&PT8.perfPre)PT8.perfPre();\n","  if(window.PT8&&PT8.perfPre)PT8.perfPre();\n  if(window.PT8&&PT8.syncP2)PT8.syncP2();\n")
src=rep(src,"c.farT=near?0:c.farT+dt;","c.farT=(near||(window.PT8&&PT8.nearBarn&&PT8.nearBarn(c)))?0:c.farT+dt;")
src=rep(src,"{u:'KeyI',d:'KeyK',l:'KeyJ',r:'KeyL',h:'KeyU'}","{u:'KeyI',d:'KeyK',l:'KeyJ',r:'KeyL',h:'KeyM'}")
src=rep(src,"{u:'Numpad8',d:'Numpad5',l:'Numpad4',r:'Numpad6',h:'Numpad0'}","{u:'KeyT',d:'KeyG',l:'KeyF',r:'KeyH',h:'KeyB'}")

# cleanup: the grey grandstand blocks go; the box skyscrapers on Midnight Overpass are replaced by pack buildings (city.js)
src=rep(src,"if(d.id===0||d.id===3){for(let k=90;k<T.N;k+=180){","if(false){for(let k=90;k<T.N;k+=180){")
src=rep(src,"for(let j=0;j<32;j++){const a=j/32*PI*2,h=70+r()*140","for(let j=0;j<(d.id===3?0:32);j++){const a=j/32*PI*2,h=70+r()*140")
src=rep(src,"for(let g=0;g<3;g++){const bl=place(70,24,","for(let g=0;g<0;g++){const bl=place(70,24,")

# a few models ship one malformed wheel (scrambled/stretched); when an axle's two wheels disagree in width after squaring up, the odd one becomes a mirror of its partner
src=rep(src,"      front:k<2,angle:0\n    };\n  });","""      front:k<2,angle:0
    };
  });
  {const wid=w=>{let a=1e9,b=-1e9;w.spin.children.forEach(m=>{const p=m.geometry.attributes.position;for(let n=0;n<p.count;n++){a=Math.min(a,p.getX(n));b=Math.max(b,p.getX(n))}});return b-a};
   const mir=g=>{const o=new THREE.BufferGeometry();for(const nm in g.attributes){const a=g.attributes[nm],v=Float32Array.from(a.array),is=a.itemSize;for(let n=0;n+2<a.count;n+=3)for(let j=0;j<is;j++){const t=v[(n+1)*is+j];v[(n+1)*is+j]=v[(n+2)*is+j];v[(n+2)*is+j]=t}if(nm==='position'||nm==='normal')for(let n=0;n<a.count;n++)v[n*is]*=-1;o.setAttribute(nm,new THREE.BufferAttribute(v,is))}return o};
   for(const[a,b2]of[[0,1],[2,3]]){const A=car.ptWheels[a],B=car.ptWheels[b2],wa=wid(A),wb=wid(B),bad=wa>wb*1.25?A:wb>wa*1.25?B:null;if(!bad)continue;const good=bad===A?B:A;
     bad.spin.children.slice().forEach(m=>{bad.spin.remove(m)});good.spin.children.forEach(m=>{bad.spin.add(new THREE.Mesh(mir(m.geometry),m.material))});bad.pivot.position.set(-good.pivot.position.x,good.pivot.position.y,good.pivot.position.z);bad.radius=good.radius}}""")

# squaring up wheels: models that bake toe/camber into the wheel meshes get their ring plane re-aligned to the axle; a scrambled wheel becomes a mirror of its partner
src=rep(src,"      front:k<2,angle:0\n    };\n  });","""      front:k<2,angle:0
    };
  });
  {const gs=w=>w.spin.children.map(m=>m.geometry),
   pts=w=>{const o=[];for(const g of gs(w)){const p=g.attributes.position;for(let n=0;n<p.count;n++)o.push([p.getX(n),p.getY(n),p.getZ(n)])}return o},
   wid=w=>{let a=1e9,b=-1e9;for(const q of pts(w)){a=Math.min(a,q[0]);b=Math.max(b,q[0])}return b-a},
   ringN=w=>{const P=pts(w),bn=new Array(36).fill(0);for(const q of P){const k=Math.min(35,Math.floor((Math.atan2(q[2],q[1])+Math.PI)/(Math.PI*2)*36));bn[k]=Math.max(bn[k],Math.hypot(q[1],q[2]))}
     const sb=bn.filter(v=>v>.05).sort((u,v)=>u-v),rm=sb.length?sb[sb.length>>1]:0,ring=P.filter(q=>{const r=Math.hypot(q[1],q[2]);return r>rm*.88&&r<rm*1.15});if(ring.length<12)return null;
     const c=[0,0,0];ring.forEach(q=>{c[0]+=q[0];c[1]+=q[1];c[2]+=q[2]});for(let i=0;i<3;i++)c[i]/=ring.length;const C=[[0,0,0],[0,0,0],[0,0,0]];ring.forEach(q=>{const d=[q[0]-c[0],q[1]-c[1],q[2]-c[2]];for(let i=0;i<3;i++)for(let j=0;j<3;j++)C[i][j]+=d[i]*d[j]});
     const tr=C[0][0]+C[1][1]+C[2][2];let n=[1,.01,.01];for(let k=0;k<60;k++){const m=[0,0,0];for(let i=0;i<3;i++)for(let j=0;j<3;j++)m[i]+=((i===j?tr:0)-C[i][j])*n[j];const l=Math.hypot(m[0],m[1],m[2])||1;n=[m[0]/l,m[1]/l,m[2]/l]}
     if(n[0]<0)n=[-n[0],-n[1],-n[2]];return{n,c}},
   mir=g=>{const o=new THREE.BufferGeometry();for(const nm in g.attributes){const a=g.attributes[nm],v=Float32Array.from(a.array),is=a.itemSize;for(let n=0;n+2<a.count;n+=3)for(let j=0;j<is;j++){const t=v[(n+1)*is+j];v[(n+1)*is+j]=v[(n+2)*is+j];v[(n+2)*is+j]=t}if(nm==='position'||nm==='normal')for(let n=0;n<a.count;n++)v[n*is]*=-1;o.setAttribute(nm,new THREE.BufferAttribute(v,is))}return o};
   const tilt=w=>{const P=pts(w);let rm=0;P.forEach(q=>rm=Math.max(rm,Math.hypot(q[1],q[2])));const ring=P.filter(q=>Math.hypot(q[1],q[2])>rm*.9);if(ring.length<8)return 99;
     const c=[0,0,0];ring.forEach(q=>{c[0]+=q[0];c[1]+=q[1];c[2]+=q[2]});for(let i=0;i<3;i++)c[i]/=ring.length;const C=[[0,0,0],[0,0,0],[0,0,0]];ring.forEach(q=>{const d=[q[0]-c[0],q[1]-c[1],q[2]-c[2]];for(let i=0;i<3;i++)for(let j=0;j<3;j++)C[i][j]+=d[i]*d[j]});
     const tr=C[0][0]+C[1][1]+C[2][2];let n=[1,.01,.01];for(let k=0;k<60;k++){const m=[0,0,0];for(let i=0;i<3;i++)for(let j=0;j<3;j++)m[i]+=((i===j?tr:0)-C[i][j])*n[j];const l=Math.hypot(m[0],m[1],m[2])||1;n=[m[0]/l,m[1]/l,m[2]/l]}
     const wv=(()=>{let a=1e9,b=-1e9;P.forEach(q=>{a=Math.min(a,q[0]);b=Math.max(b,q[0])});return b-a})();return Math.max(Math.acos(Math.min(1,Math.abs(n[0])))*57.3,wv>.36?30:0)};
   const T_=car.ptWheels.map(tilt);
   car.ptWheels.forEach((w,k)=>{if(T_[k]<6)return;let best=-1;car.ptWheels.forEach((o,j)=>{if(j!==k&&T_[j]<3&&(best<0||((j&1)===(k&1)&&(best&1)!==(k&1))))best=j});if(best<0)return;
     const g=car.ptWheels[best],same=(best&1)===(k&1),sc=w.radius/g.radius;w.spin.children.slice().forEach(m=>w.spin.remove(m));
     g.spin.children.forEach(m=>{let ng=same?m.geometry.clone():mir(m.geometry);ng.scale(1,sc,sc);w.spin.add(new THREE.Mesh(ng,m.material))});w.pivot.position.x=(same?1:-1)*0+w.pivot.position.x})}""")

# squaring up wheels: models that bake toe/camber into the wheel meshes get their ring plane re-aligned to the axle; a scrambled wheel becomes a mirror of its partner
src=rep(src,"      front:k<2,angle:0\n    };\n  });","""      front:k<2,angle:0
    };
  });
  {const gs=w=>w.spin.children.map(m=>m.geometry),
   pts=w=>{const o=[];for(const g of gs(w)){const p=g.attributes.position;for(let n=0;n<p.count;n++)o.push([p.getX(n),p.getY(n),p.getZ(n)])}return o},
   wid=w=>{let a=1e9,b=-1e9;for(const q of pts(w)){a=Math.min(a,q[0]);b=Math.max(b,q[0])}return b-a},
   ringN=w=>{const P=pts(w),bn=new Array(36).fill(0);for(const q of P){const k=Math.min(35,Math.floor((Math.atan2(q[2],q[1])+Math.PI)/(Math.PI*2)*36));bn[k]=Math.max(bn[k],Math.hypot(q[1],q[2]))}
     const sb=bn.filter(v=>v>.05).sort((u,v)=>u-v),rm=sb.length?sb[sb.length>>1]:0,ring=P.filter(q=>{const r=Math.hypot(q[1],q[2]);return r>rm*.88&&r<rm*1.15});if(ring.length<12)return null;
     const c=[0,0,0];ring.forEach(q=>{c[0]+=q[0];c[1]+=q[1];c[2]+=q[2]});for(let i=0;i<3;i++)c[i]/=ring.length;const C=[[0,0,0],[0,0,0],[0,0,0]];ring.forEach(q=>{const d=[q[0]-c[0],q[1]-c[1],q[2]-c[2]];for(let i=0;i<3;i++)for(let j=0;j<3;j++)C[i][j]+=d[i]*d[j]});
     const tr=C[0][0]+C[1][1]+C[2][2];let n=[1,.01,.01];for(let k=0;k<60;k++){const m=[0,0,0];for(let i=0;i<3;i++)for(let j=0;j<3;j++)m[i]+=((i===j?tr:0)-C[i][j])*n[j];const l=Math.hypot(m[0],m[1],m[2])||1;n=[m[0]/l,m[1]/l,m[2]/l]}
     if(n[0]<0)n=[-n[0],-n[1],-n[2]];return{n,c}},
   mir=g=>{const o=new THREE.BufferGeometry();for(const nm in g.attributes){const a=g.attributes[nm],v=Float32Array.from(a.array),is=a.itemSize;for(let n=0;n+2<a.count;n+=3)for(let j=0;j<is;j++){const t=v[(n+1)*is+j];v[(n+1)*is+j]=v[(n+2)*is+j];v[(n+2)*is+j]=t}if(nm==='position'||nm==='normal')for(let n=0;n<a.count;n++)v[n*is]*=-1;o.setAttribute(nm,new THREE.BufferAttribute(v,is))}return o};
   for(const w of car.ptWheels)for(let it=0;it<5;it++){const r=ringN(w);if(!r)break;const ang=Math.acos(Math.min(1,r.n[0]));if(ang<(it?.02:.14)||ang>.75)break;
     const M=new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(r.n[0],r.n[1],r.n[2]),new THREE.Vector3(1,0,0)));
     for(const g of gs(w)){g.translate(-r.c[0],-r.c[1],-r.c[2]);g.applyMatrix4(M);g.translate(r.c[0],r.c[1],r.c[2])}}
   for(const[a,b2]of[[0,1],[2,3]]){const A=car.ptWheels[a],B=car.ptWheels[b2],wa=wid(A),wb=wid(B),bad=wa>wb*1.25?A:wb>wa*1.25?B:null;if(!bad)continue;const good=bad===A?B:A;
     bad.spin.children.slice().forEach(m=>bad.spin.remove(m));good.spin.children.forEach(m=>bad.spin.add(new THREE.Mesh(mir(m.geometry),m.material)));bad.pivot.position.set(-good.pivot.position.x,good.pivot.position.y,good.pivot.position.z);bad.radius=good.radius}}""")
parts=[open(f'{SRC}/layers/{n}.js').read() for n in ['core','cars10','audio','modes','tracks','tracks2','extra','race2','elim','tod','harbor','props','bld','stages','ra_data','tracks3','weather','ambience','tutorial','hud2','shade','ui','rally','trackmode','realspeed','barn','animals','clean','solid','damage','perf']  if os.path.exists(f'{SRC}/layers/{n}.js')]
css=open(f'{SRC}/style.css').read()
import base64
b64=lambda f:base64.b64encode(open(W+'/assets/'+f,'rb').read()).decode()
ANIM='<script>const ANIM_B64="'+b64('animals.bin')+'",ANIM_META='+open(W+'/assets/animals.json').read()+';</script>'
BLD='<script>const BLD_B64="'+b64('bld.bin')+'",BLD_META='+open(W+'/assets/bld.json').read()+';</script>'
CARS10='<script>const CAR10_BIN_B64="'+b64('cars_v10.bin.gz')+'",CAR10_TEX_B64="'+b64('cars_v10_tex.png')+'",CAR10_META='+open(W+'/assets/cars_v10.json').read()+';</script>'
src=rep(src,"bins[k].tire=true;","bins[k].tire=true;(bins[k].tp||(bins[k].tp=[])).push(part);")
src=rep(src,"    for(const [g,m] of b.parts){\n      g.translate(-center.x,-center.y,-center.z);\n      spin.add(new THREE.Mesh(g,m));\n    }","""    for(const [g] of b.parts)g.translate(-center.x,-center.y,-center.z);
    if(b.tp)for(let it=0;it<4;it++){
      const minor=(ia,ib)=>{let sa=0,sb=0,sc=0,mx=0,mu=0,N=0;for(const [t] of b.parts){const p=t.attributes.position;for(let n=0;n<p.count;n++){const u=ia?p.getZ(n):p.getY(n),x=p.getX(n);sa+=x*x;sb+=u*u;sc+=x*u;mx+=x;mu+=u;N++}}mx/=N;mu/=N;sa-=N*mx*mx;sb-=N*mu*mu;sc-=N*mx*mu;
        const ay=.5*Math.atan2(2*sc,sa-sb)+Math.PI/2;return ((ay+Math.PI/2)%Math.PI+Math.PI)%Math.PI-Math.PI/2};
      const yw=minor(1),tl=minor(0);
      if(Math.abs(yw)<.7)for(const [g] of b.parts){g.rotateY(yw)}
      if(Math.abs(tl)<.7)for(const [g] of b.parts){g.rotateZ(-tl)}}
    let fx=0,fy=0,fz=0;
    if(b.tp){let a=0,bb=0,c=0,d=0,e=0,g1=0,h=0,sz=0,N=0,x0=1e9,x1=-1e9;for(const t of b.tp){const p=t.attributes.position;for(let n=0;n<p.count;n++){const y=p.getY(n),z=p.getZ(n),r=y*y+z*z;a+=y*y;bb+=y*z;c+=y;d+=z*z;e+=z;g1+=y*r;h+=z*r;sz+=r;N++;x0=Math.min(x0,p.getX(n));x1=Math.max(x1,p.getX(n))}}
      const M=[[2*a,2*bb,c],[2*bb,2*d,e],[2*c,2*e,N]],R=[g1,h,sz],det=m=>m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]),D=det(M);
      if(N>12&&Math.abs(D)>1e-12){const col=j=>M.map((r,i)=>r.map((v,k)=>k===j?R[i]:v));const ty=det(col(0))/D,tz=det(col(1))/D;if(Math.abs(ty)<size.y*.3&&Math.abs(tz)<size.y*.3){fy=ty;fz=tz}}
      fx=(x0+x1)/2}
    pivot.position.x+=fx;pivot.position.y+=fy;pivot.position.z+=fz;
    for(const [g,m] of b.parts){g.translate(-fx,-fy,-fz);spin.add(new THREE.Mesh(g,m))}""")
src=rep(src,"w.angle=(w.angle+speed/w.radius*dt)%(PI*2);\n    w.spin.rotation.x=w.angle;\n    w.pivot.rotation.y=w.front?steer*.35:0;","{const stp=speed/w.radius*dt;w.angle=(w.angle+Math.max(-.5,Math.min(.5,stp)))%(PI*2)}\n    w.spin.rotation.x=w.angle;\n    {const tg=w.front?steer*.35:0;w.sa=Math.abs(tg-(w.sa||0))<.012?tg:(w.sa||0)+(tg-(w.sa||0))*.7;w.pivot.rotation.y=w.sa}")
src=rep(src,"function loadEmbeddedCarPack(){\n try{","function loadEmbeddedCarPack(){return;\n try{")
src=rep(src,"scale=4.5/Math.max(size.x,size.z,.001)","scale=(source.userData.gl||4.5)/Math.max(size.x,size.z,.001)")
src=re.sub(r'<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"[^>]*></script>','',src)
src=src.replace("const compile = s => eval('('+s+')');","const compile = s => eval('('+s+')');window.PTO=o;",1)
BOOT_CSS='<style id="ptBootCss">html,body{background:#0b0e12!important}body>*:not(#ptBoot){visibility:hidden!important}#ptBoot{position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#0b0e12;color:#e8eef2;font:italic 800 34px/1 Arial Black,Impact,sans-serif;letter-spacing:.06em;visibility:visible!important;transition:opacity .25s}#ptBoot small{font:700 10px/1 monospace;letter-spacing:.4em;color:#f1f3f5;font-style:normal}#ptBoot i{display:block;width:140px;height:3px;background:#1d252d;position:relative;overflow:hidden}#ptBoot i:after{content:"";position:absolute;inset:0;width:40%;background:#f1f3f5;animation:ptb 1s linear infinite}@keyframes ptb{from{left:-40%}to{left:100%}}</style>'
src=src.replace('<title>Poly Tourismo v7</title>','<title>Poly Tourismo</title>'+BOOT_CSS)
src=src.replace('<body>','<body><div id="ptBoot">POLY TOURISMO<i></i><small>LOADING</small></div>',1)
BOOT_JS='<script>(function(){function done(){var b=document.getElementById("ptBoot"),c=document.getElementById("ptBootCss");if(!b)return;b.style.opacity=0;setTimeout(function(){if(c)c.remove();b.remove()},260)}function go(){requestAnimationFrame(function(){requestAnimationFrame(function(){setTimeout(done,350)})})}if(document.readyState==="complete")go();else addEventListener("load",go);setTimeout(done,8000)})();</script>'
GLTF='<script>'+open(W+'/assets/GLTFLoader.r128.js').read()+'</script>'
add=GLTF+ANIM+BLD+CARS10+'<style id="v8css">'+css+'</style><script>\n'+'\n'.join(parts)+'\n</script>'
i=src.rindex('</body>') if '</body>' in src else len(src)
src=src[:i]+add+BOOT_JS+src[i:]

src=src.replace("'Poly Tourismo v7'","'Poly Tourismo'").replace("'Poly Tourismo v9'","'Poly Tourismo'")
out=sys.argv[1] if len(sys.argv)>1 else W+'/dist/Poly-Tourismo.html'
open(out,'w').write(src);print('wrote',out,len(src))
if not len(sys.argv)>1:
    open(W+'/dist/index.html','w').write(src)  # so static hosts (Vercel, GitHub Pages) serve the game at /
