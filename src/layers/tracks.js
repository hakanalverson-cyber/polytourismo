/* ===== Poly Tourismo v8 layer: tracks (new layouts, rally stages, rally world) ===== */
(function v8tracks(){
'use strict';
const P=window.PT8;
/* ---------------- redesigned tarmac layouts ---------------- */
D[0].pts=[[-200,-260,14],[-40,-264,12],[120,-250,9],[240,-218,5],[322,-155,-1],[348,-70,-9],[322,22,-15],[255,78,-19],[170,80,-20],[108,28,-18],[100,-48,-16],[62,-105,-13],[0,-82,-10],[-55,-125,-6],[-125,-85,-1],[-165,-20,4],[-245,18,9],[-325,-15,13],[-355,-100,17],[-322,-190,19],[-262,-243,17]];
D[0].hw=8;D[0].up=26;D[0].amp=3.4;D[0].idw=.9;D[0].jumps=[[1,.5]];D[0].walls=[[9,11,1.4],[13,15,1.4]];D[0].ice=[];
D[0].name='Quarry Circuit';D[0].desc='quarry pit / hairpins / long climb';
const ys2=[64,64,61,56,50,46,43,39,34,30,26,21,17,12,6,2,0,0,2,6,12,20,27,34,41,50,57];
const xz2=[[225,-185],[130,-208],[40,-192],[-35,-152],[-50,-70],[-80,-10],[-128,-40],[-138,-112],[-158,-188],[-208,-208],[-252,-150],[-254,-70],[-266,-5],[-306,48],[-292,115],[-222,155],[-120,163],[-20,150],[70,118],[150,85],[215,100],[268,62],[262,-8],[212,-38],[200,-92],[262,-112],[300,-170]];
D[2].pts=xz2.map((p,i)=>[p[0],p[1],+(ys2[i]*.72).toFixed(1)]);
D[2].hw=6.5;D[2].jumps=[[16,.5]];D[2].walls=[[3,14,1.5]];D[2].ice=[[4,6],[11,13],[21,22]];D[2].desc='alpine descent / switchbacks / ice';D[2].offs=-4;
D[1].pts=[[-270,-250,2],[-120,-268,0],[40,-255,0],[170,-215,3],[270,-150,12],[330,-70,22],[335,20,30],[290,95,34],[215,140,33],[140,115,29],[95,50,24],[20,30,18],[-50,75,12],[-100,150,7],[-175,205,3],[-265,190,1],[-325,115,0,6],[-340,20,0,6],[-310,-70,0,6],[-330,-170,2,6]];
D[1].hw=7;D[1].up=52;D[1].amp=6;D[1].jumps=[[1,.5]];D[1].walls=[[16,19,5]];D[1].ice=[];D[1].desc='canyon rim climb / wash / jump';
/* ---------------- rally stages ---------------- */
const gravelBase={bank:8,shoulder:6,gravel:1,ice:[],walls:[],boost:[]};
D.push(Object.assign({},gravelBase,{id:4,name:'Pinewood Stage',desc:'forest gravel / hairpins / crest jump',hw:5.5,off:'dirt',idw:.86,offs:0,amp:6.5,up:36,biome:'forest',sky:[0x7f9db0,0xe6ebe2],fog:0xc3d0c7,sun:0xfff0cf,hemi:[0xe2ecea,0x4a5a3a],road:'#86755f',dust:0xb39a74,dirt:0x45352a,
 pts:[[-150,-232,6],[-30,-247,4],[75,-220,9],[165,-250,15],[262,-205,13],[305,-120,8],[250,-62,5],[288,8,10],[345,68,17],[305,140,21],[225,172,19],[165,125,14],[102,168,10],[30,212,6],[-58,172,8],[-112,100,12],[-62,40,17],[-132,-12,21],[-218,28,17],[-292,-30,11],[-302,-112,8],[-242,-172,7]],jumps:[[3,.55]]}));
D.push(Object.assign({},gravelBase,{id:5,name:'Redrock Stage',desc:'red mesa desert / washes / big jump',hw:6,off:'sand',idw:.82,offs:0,amp:9,up:40,biome:'desert',sky:[0x7aa0c4,0xf3dcb8],fog:0xe3c3a0,sun:0xffe2b0,hemi:[0xfbe6c8,0xa8643a],road:'#a8805a',dust:0xd2a470,dirt:0x7a4a2a,
 pts:[[0,-250,4],[110,-262,6],[215,-225,12],[290,-150,20],[285,-60,27],[215,-10,31],[270,50,26],[320,125,18],[270,195,10],[170,215,5],[85,170,3],[10,200,0],[-80,235,2],[-170,195,8],[-190,115,15],[-120,60,21],[-175,-10,26],[-260,-30,22],[-320,-95,15],[-290,-180,9],[-190,-225,5]],jumps:[[0,.5]]}));
D.push(Object.assign({},gravelBase,{id:6,name:'Highmoor Stage',desc:'misty moorland / stone walls / climbs',hw:5.8,off:'grass',idw:.84,offs:0,amp:8,up:42,biome:'moor',sky:[0x7f8fa2,0xd9dde0],fog:0xbfc8cc,sun:0xf2eadb,hemi:[0xdce4e8,0x59603f],road:'#7d7566',dust:0xa89f8c,dirt:0x4c4636,
 pts:[[-200,-200,30],[-90,-230,34],[30,-200,28],[120,-240,20],[225,-190,14],[270,-95,18],[215,-30,24],[120,-45,33],[60,10,39],[130,70,43],[215,110,38],[235,190,30],[150,235,20],[40,200,14],[-60,235,8],[-170,200,6],[-250,130,12],[-210,60,22],[-280,0,30],[-300,-100,36]],jumps:[[0,.6]]}));
/* jumps only on long straights, far from the start line and with a long run-up, so cars always arrive fast */
function pickJumps(d,want,rx){rx=rx||{l:70,a:.6,t:1.3,r:150,f:.15};const p=d.pts,n=p.length,seg=[],len=[],ang=[];
 for(let i=0;i<n;i++){const a=p[i],b=p[(i+1)%n];seg.push(Math.atan2(b[0]-a[0],b[1]-a[1]));len.push(Math.hypot(b[0]-a[0],b[1]-a[1]))}
 for(let i=0;i<n;i++){let da=seg[i]-seg[(i-1+n)%n];while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;ang.push(Math.abs(da))}
 const cum=[0];for(let i=0;i<n;i++)cum.push(cum[i]+len[i]);const L=cum[n];
 const cand=[];
 for(let i=0;i<n;i++){const nx=(i+1)%n;if(len[i]<rx.l)continue;if(ang[i]>rx.a||ang[nx]>rx.a)continue;
  /* run-up: keep walking back while the road stays straight */
  let run=len[i]*.5,k=(i-1+n)%n,turn=ang[i];for(let g=0;g<n&&turn<rx.t;g++){run+=len[k];turn+=ang[k];if(len[k]<20)break;k=(k-1+n)%n;if(run>420)break}
  const dist=cum[i]+len[i]*.5,fromStart=Math.min(dist,L-dist);
  if(run<rx.r||fromStart<L*.12)continue;
  cand.push({i,score:run+len[i]*1.4+fromStart*.4-(ang[i]+ang[nx])*200,dist})}
 cand.sort((a,b)=>b.score-a.score);const out=[];
 for(const c of cand){if(out.length>=want)break;if(out.every(o=>Math.abs(o.dist-c.dist)>L*.28&&Math.abs(Math.abs(o.dist-c.dist)-L)>L*.28))out.push(c)}
 return out.map(c=>[c.i,.5])}
[0,1,2,4,5,6].forEach(i=>{const j=pickJumps(D[i],i===1?2:1,i>=4?{l:50,a:.75,t:1.6,r:100,f:.12}:undefined);if(j.length)D[i].jumps=j;else D[i].jumps=[]});
P.pickJumps=pickJumps;
/* rally stages: bigger hills */
[4,5,6].forEach(i=>{const p=D[i].pts,mean=p.reduce((a,q)=>a+q[2],0)/p.length,f=[0,0,0,0,1.85,1.7,1.65][i];p.forEach(q=>{q[2]=+(mean+(q[2]-mean)*f).toFixed(1)});D[i].up=Math.round(D[i].up*1.35)});
D[4].tunnels=0;
P.TRACK_INFO=[
 {s:'TARMAC',tags:['PIT HAIRPINS','CLIMB','JUMP']},{s:'TARMAC',tags:['CANYON RIM','WASH','JUMP']},{s:'TARMAC + ICE',tags:['SWITCHBACKS','TUNNEL','ICE']},{s:'TARMAC',tags:['OVERPASS','TUNNELS','NIGHT']},
 {s:'GRAVEL',tags:['FOREST','HAIRPINS','CRESTS']},{s:'GRAVEL',tags:['MESAS','WASHES','BIG JUMP']},{s:'GRAVEL',tags:['MOORLAND','STONE WALLS','CLIMBS']}];

/* ---------------- helpers ---------------- */
function roadDist(T,x,z,lim){const CS=16,reach=Math.ceil(lim/CS),cx=Math.floor(x/CS),cz=Math.floor(z/CS);let bd=lim*lim;
 for(let a=-reach;a<=reach;a++)for(let b=-reach;b<=reach;b++){const l=T.grid.get((cx+a)*8192+cz+b);if(!l)continue;for(const i of l){const dx=x-T.x[i],dz=z-T.z[i],d2=dx*dx+dz*dz;if(d2<bd)bd=d2}}return Math.sqrt(bd)}
function roadDistFar(T,x,z){let bd=1e12;for(let i=0;i<T.N;i+=2){const dx=x-T.x[i],dz=z-T.z[i],d2=dx*dx+dz*dz;if(d2<bd)bd=d2}return Math.sqrt(bd)}
function instC(sc,geo,m,list,tint){const im=new THREE.InstancedMesh(geo,m,list.length),o=new THREE.Object3D(),col=new THREE.Color();
 list.forEach((p,i)=>{o.position.set(p[0],p[1],p[2]);o.scale.set(p[3],p[4]||p[3],p[5]||p[3]);o.rotation.set(0,p[6]||0,p[7]||0);o.updateMatrix();im.setMatrixAt(i,o.matrix);if(tint){col.setHex(tint[(Math.floor(Math.abs(p[0]*7+p[2]*13))%tint.length)]);col.offsetHSL((Math.sin(p[0]*.31+p[2]*.17))*.015,0,(Math.sin(p[0]*.13-p[2]*.23))*.035);im.setColorAt(i,col)}});
 im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.frustumCulled=false;sc.add(im);return im}
const flat=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.95,metalness:0,flatShading:true},o));
function chevronTex(){return ctex(64,32,(x,w,h)=>{x.fillStyle='#f2c230';x.fillRect(0,0,w,h);x.fillStyle='#16130c';x.lineWidth=7;x.lineJoin='miter';x.beginPath();x.moveTo(20,4);x.lineTo(44,16);x.lineTo(20,28);x.stroke();x.fillStyle='#16130c';x.fillRect(0,0,w,2);x.fillRect(0,h-2,w,2)})}
function gravelTex(d){const base=new THREE.Color(d.road),r=rngf(d.id*5+1);return ctex(64,64,(x,w,h)=>{x.fillStyle=d.road;x.fillRect(0,0,w,h);
 for(let i=0;i<260;i++){const l=r();x.fillStyle=l<.5?'rgba(0,0,0,.11)':'rgba(255,255,255,.12)';x.fillRect(r()*w|0,r()*h|0,1+(r()*2|0),1)}
 x.fillStyle='rgba(30,22,14,.20)';x.fillRect(17,0,7,h);x.fillRect(40,0,7,h);x.fillStyle='rgba(30,22,14,.1)';x.fillRect(16,0,1,h);x.fillRect(24,0,1,h);x.fillRect(39,0,1,h);x.fillRect(47,0,1,h);
 x.fillStyle='rgba(235,225,200,.10)';x.fillRect(0,0,5,h);x.fillRect(w-5,0,5,h);x.fillStyle='rgba(60,70,40,.14)';x.fillRect(29,0,6,h)})}
function tarmacPanoSkip(){return true}

/* ---------------- backdrop panorama for rally biomes ---------------- */
function panoRally(T){const d=T.d,W=4096,H=512,hz=352,fog=new THREE.Color(d.fog),cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d'),r=rngf(d.id*31+9);
 const mix=(hex,t)=>'#'+new THREE.Color(hex).lerp(fog,t).getHexString(),sn=(x,seed,terms)=>{let s=0;for(const[k,a,p]of terms)s+=a*Math.sin(2*PI*k*x/W+p+seed);return s};
 const ridge=(base,amp,terms,seed,fill)=>{g.beginPath();g.moveTo(0,H);for(let x=0;x<=W;x+=8)g.lineTo(x,base-amp*sn(x,seed,terms));g.lineTo(W,H);g.closePath();g.fillStyle=fill;g.fill()};
 const gr=(y0,y1,a,b)=>{const q=g.createLinearGradient(0,y0,0,y1);q.addColorStop(0,a);q.addColorStop(1,b);return q};
 const T3=[[2,.5,0],[5,.3,1],[11,.18,2],[23,.1,3]],T4=[[3,.4,1],[8,.25,0],[17,.12,2],[37,.06,1]];
 if(d.biome==='forest'){ridge(290,80,T3,0,mix(0x7388a0,.6));ridge(315,52,T4,2,mix(0x5d7288,.5));ridge(334,34,T3,4,mix(0x425a52,.4));
  for(let layer=0;layer<3;layer++){g.fillStyle=mix([0x2c4a3a,0x23402f,0x1a3326][layer],[.5,.35,.2][layer]);const base=hz-4+layer*6;for(let x=-10;x<W+10;x+=7+layer*2){const h=26+layer*10+r()*(34+layer*14);g.beginPath();g.moveTo(x,base+4);g.lineTo(x+4.5,base-h);g.lineTo(x+9,base+4);g.fill()}}
  g.fillStyle=gr(hz-70,hz+40,'#ffffff00','#ffffff40');g.fillRect(0,hz-70,W,110);g.fillStyle=gr(hz,H,mix(0x24402c,.15),mix(0x30502f,.1));g.fillRect(0,hz+4,W,H-hz)}
 else if(d.biome==='desert'){ridge(300,48,T3,1,mix(0xc88a62,.62));
  const mesa=(x,w,h,c,arch)=>{g.beginPath();g.moveTo(x,hz);g.lineTo(x+w*.07,hz-h);g.lineTo(x+w*.93,hz-h);g.lineTo(x+w,hz);g.closePath();g.fillStyle=mix(c,.36);g.fill();for(let y=hz-h+10;y<hz;y+=9){g.fillStyle=y%18<9?'#8a3a1a14':'#ffd6a014';g.fillRect(x+(hz-y)*.07,y,w-(hz-y)*.14,5)}if(arch){g.globalCompositeOperation='destination-out';g.beginPath();g.ellipse(x+w/2,hz,w*.16,h*.5,0,PI,0);g.fill();g.globalCompositeOperation='source-over'}};
  for(let i=0;i<10;i++)mesa(i*W/10+r()*140,240+r()*220,70+r()*120,[0xb4552f,0xc46a3e,0xa8482a][i%3],i%4===2);
  for(let i=0;i<8;i++)mesa(i*W/8+r()*260,130+r()*120,36+r()*60,0x9a4326,false);
  for(let i=0;i<14;i++){const x=r()*W,h=40+r()*70;g.fillStyle=mix(0x8a3d22,.3);g.fillRect(x,hz-h,10+r()*8,h);g.fillRect(x-3,hz-h-8,16+r()*8,10)}
  g.fillStyle=gr(hz-30,hz,'#ffd7a000','#f0c08a80');g.fillRect(0,hz-30,W,30);g.fillStyle=gr(hz,H,mix(0xd3a171,.35),mix(0xc99865,.2));g.fillRect(0,hz,W,H-hz)}
 else{ridge(300,70,T3,5,mix(0x7a8aa0,.6));ridge(322,50,T4,1,mix(0x68786f,.5));ridge(338,34,T3,7,mix(0x53644a,.4));
  for(let i=0;i<9;i++){const x=i*W/9+r()*240,hh=110+r()*40;g.fillStyle=mix(0xe8eef2,.25);g.fillRect(x-1.5,hz-hh,3,hh);g.save();g.translate(x,hz-hh);for(let b=0;b<3;b++){g.rotate(2.094);g.fillRect(-1,0,2,-46)}g.restore()}
  for(let i=0;i<7;i++){const x=r()*W,w=60+r()*80;g.fillStyle=mix(0x6a6c62,.35);g.beginPath();g.moveTo(x,hz);g.lineTo(x+w*.2,hz-26-r()*20);g.lineTo(x+w*.5,hz-14);g.lineTo(x+w*.8,hz-32-r()*16);g.lineTo(x+w,hz);g.fill()}
  g.fillStyle=gr(hz-80,hz+30,'#ffffff00','#ffffff55');g.fillRect(0,hz-80,W,110);g.fillStyle=gr(hz,H,mix(0x4d6240,.25),mix(0x55683f,.15));g.fillRect(0,hz,W,H-hz)}
 const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.wrapS=THREE.RepeatWrapping;t.magFilter=t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;
 const b=T.bounds,m=new THREE.Mesh(new THREE.CylinderGeometry(1300,1300,480,72,1,true),new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.BackSide,fog:false,depthWrite:false}));m.position.set((b[0]+b[1])/2,90,(b[2]+b[3])/2);m.renderOrder=-2;m.frustumCulled=false;m.userData.skyAt=[0,90,0];return m}

/* ---------------- rally world ---------------- */
function buildRally(T){const d=T.d,sc=new THREE.Scene(),r=rngf(d.id*91+13),N=T.N,K=P.kappa(T);
 sc.fog=new THREE.Fog(d.fog,120,520);sc.add(new THREE.HemisphereLight(d.hemi[0],d.hemi[1],1.1));const sun=new THREE.DirectionalLight(d.sun,1.0);sun.position.set(-150,250,100);sc.add(sun);
 const sk=ctex(2,64,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#'+d.sky[0].toString(16).padStart(6,'0'));g.addColorStop(.5,'#'+d.sky[1].toString(16).padStart(6,'0'));g.addColorStop(1,'#'+d.sky[1].toString(16).padStart(6,'0'));x.fillStyle=g;x.fillRect(0,0,w,h)});
 {const dm=new THREE.Mesh(new THREE.SphereGeometry(1500,16,12),new THREE.MeshBasicMaterial({map:sk,side:THREE.BackSide,fog:false}));dm.frustumCulled=false;dm.userData.skyAt=[0,null,0];sc.userData.skyRide=1;sc.add(dm);
 const sd=mesh(new THREE.SphereGeometry(40,12,8),new THREE.MeshBasicMaterial({color:d.sun,fog:false}),-500,420,-1000,sc);sd.frustumCulled=false;sd.userData.skyAt='rel'}
 /* terrain */
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<N;i++){x0=Math.min(x0,T.x[i]);x1=Math.max(x1,T.x[i]);z0=Math.min(z0,T.z[i]);z1=Math.max(z1,T.z[i])}x0-=190;x1+=190;z0-=190;z1+=190;T.bounds=[x0,x1,z0,z1];
 const cs=4,sx=Math.ceil((x1-x0)/cs),sz=Math.ceil((z1-z0)/cs),W1=sx+1,hts=new Float32Array(W1*(sz+1)),pos=new Float32Array(hts.length*3),col=new Float32Array(hts.length*3),idx=[];
 for(let j=0;j<=sz;j++)for(let i=0;i<=sx;i++){const x=x0+i*cs,z=z0+j*cs;hts[j*W1+i]=terrainBed(T,x,z)}
 for(let j=0;j<=sz;j++)for(let i=0;i<=sx;i++){const k=j*W1+i,x=x0+i*cs,z=z0+j*cs,h=hts[k],hx=hts[j*W1+Math.min(sx,i+1)]-hts[j*W1+Math.max(0,i-1)],hz2=hts[Math.min(sz,j+1)*W1+i]-hts[Math.max(0,j-1)*W1+i],slope=Math.min(1,Math.hypot(hx,hz2)/(2*cs)*1.2);
  const n=T.nz(x*2.1,z*2.1)*.5+.5,n2=T.nz(x*.7+40,z*.7-17)*.5+.5,n3=T.nz(x*5.3,z*5.3)*.5+.5,rd=roadDist(T,x,z,26),near=1-clamp(rd/26,0,1),hn=clamp(h/60,0,1);let c;
  if(d.biome==='forest'){c=[.2+.08*n,.33+.1*n-.05*hn,.15+.04*n];if(n2>.62){c=[.27+.05*n3,.2+.04*n3,.12]}const rk=sm(.55,.95,slope);c=c.map((v,q)=>lerp(v,[.46,.46,.45][q]*(.8+.3*n3),rk));c=c.map((v,q)=>lerp(v,[.36,.28,.18][q],near*.65*(.7+.3*n3)))}
  else if(d.biome==='desert'){const band=.5+.5*Math.sin(h*.55+n*2);c=[.78-.12*band+.06*n,.5-.08*band+.04*n,.3-.05*band];if(n2>.66)c=[.88,.8,.68];const rk=sm(.45,.9,slope);c=c.map((v,q)=>lerp(v,[.55,.27,.17][q]*(.85+.3*n3),rk));c=c.map((v,q)=>lerp(v,[.66,.5,.34][q],near*.5))}
  else{c=[.34+.06*n,.4+.06*n,.2+.03*n];if(n2>.55)c=[.37+.05*n3,.28+.04*n3,.38+.05*n3];if(n2<.25)c=[.3,.24,.16];const rk=sm(.5,.9,slope);c=c.map((v,q)=>lerp(v,[.5,.5,.48][q]*(.8+.3*n3),rk));c=c.map((v,q)=>lerp(v,[.42,.36,.26][q],near*.5))}
  pos[k*3]=x;pos[k*3+1]=h;pos[k*3+2]=z;col[k*3]=c[0];col[k*3+1]=c[1];col[k*3+2]=c[2]}
 for(let j=0;j<sz;j++)for(let i=0;i<sx;i++){const a=j*W1+i,b=a+W1;idx.push(a,b,a+1,a+1,b,b+1)}
 const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.BufferAttribute(pos,3));tg.setAttribute('color',new THREE.BufferAttribute(col,3));tg.setIndex(idx);tg.computeVertexNormals();
 sc.add(new THREE.Mesh(tg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:d.biome!=='moor'})));
 /* road: gravel with ruts, earth verges, recessed bed */
 const rt=gravelTex(d),rm=new THREE.MeshStandardMaterial({map:rt,roughness:1,side:THREE.DoubleSide});
 sc.add(ribbon(T,k=>-T.hw[k],k=>T.hw[k],10,.05,rm,6));
 const vt=ctex(8,8,(x,w,h)=>{x.fillStyle='#'+new THREE.Color(d.dirt).lerp(new THREE.Color(d.road),.5).getHexString();x.fillRect(0,0,w,h);x.fillStyle='rgba(0,0,0,.12)';x.fillRect(1,2,2,1);x.fillRect(5,6,2,1)}),vm=new THREE.MeshStandardMaterial({map:vt,roughness:1,side:THREE.DoubleSide});
 sc.add(ribbon(T,k=>T.hw[k],k=>T.hw[k]+1.7,1,.06,vm,3));sc.add(ribbon(T,k=>-T.hw[k]-1.7,k=>-T.hw[k],1,.06,vm,3));
 sc.add(ribbon(T,k=>-T.hw[k]-.3,k=>T.hw[k]+.3,4,-.65,mat(d.dirt,{side:THREE.DoubleSide}),8));
 for(const side of [-1,1]){const pp=[],ind=[];for(let i=0;i<=N;i++){const k=i%N,l=side*(T.hw[k]+.25),x=T.x[k]+Math.cos(T.psi[k])*l,z=T.z[k]-Math.sin(T.psi[k])*l,y=T.y[k]-l*T.bank[k];pp.push(x,y-.68,z,x,y+.04,z)}for(let i=0;i<N;i++){if(T.gap[i]||T.gap[(i+1)%N])continue;const a=i*2;ind.push(a,a+2,a+1,a+1,a+2,a+3)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pp,3));g.setIndex(ind);g.computeVertexNormals();sc.add(new THREE.Mesh(g,mat(d.dirt,{side:THREE.DoubleSide})))}
 /* jump caps */
 for(const k of T.jumpCaps||[]){const p=[];for(const l of [-T.hw[k]-.25,T.hw[k]+.25]){const x=T.x[k]+Math.cos(T.psi[k])*l,z=T.z[k]-Math.sin(T.psi[k])*l,y=T.y[k]-l*T.bank[k];p.push(x,y-.68,z,x,y+.04,z)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex([0,2,1,1,2,3]);g.computeVertexNormals();sc.add(new THREE.Mesh(g,mat(0x6a5a46,{side:THREE.DoubleSide})))}
 /* start arch */
 const sn0=Math.sin(T.psi[0]),cs0=Math.cos(T.psi[0]);const ar=new THREE.Group();ar.position.set(T.x[0],T.y[0],T.z[0]);ar.rotation.y=T.psi[0];sc.add(ar);
 for(const sd of[-1,1])mesh(new THREE.BoxGeometry(.7,7,.7),mat(0xe8e3d4),sd*(T.hw[0]+1.1),3.5,0,ar);
 mesh(new THREE.BoxGeometry(T.hw[0]*2+3.4,2,.5),new THREE.MeshBasicMaterial({map:ctex(64,8,(x,w,h)=>{x.fillStyle='#d9382a';x.fillRect(0,0,w,h);x.fillStyle='#fff';for(let i=0;i<w;i+=8)x.fillRect(i,0,4,h);x.fillStyle='#111';x.fillRect(0,3,w,2)})}),0,7.2,0,ar);
 const sl=mesh(new THREE.PlaneGeometry(T.hw[0]*2,1.6),new THREE.MeshBasicMaterial({map:ctex(16,2,(x,w,h)=>{for(let i=0;i<16;i++){x.fillStyle=i&1?'#fff':'#111';x.fillRect(i,0,1,1);x.fillStyle=i&1?'#111':'#fff';x.fillRect(i,1,1,1)}})}),T.x[0],T.y[0]+.09,T.z[0],sc);sl.rotation.set(-PI/2,0,0);sl.rotation.order='YXZ';sl.rotation.y=T.psi[0];
 /* scatter helper */
 const scatter=(cnt,minR,maxR,fn)=>{const out=[];for(let t=0;t<cnt*14&&out.length<cnt;t++){const x=lerp(x0+12,x1-12,r()),z=lerp(z0+12,z1-12,r()),rd=roadDistFar(T,x,z);if(rd<minR||rd>=maxR)continue;const h=T.terr(x,z);if(fn(x,h,z,out,rd))continue}return out};
 const side=(i,l)=>{i=((i%N)+N)%N;const s=Math.sin(T.psi[i]),c=Math.cos(T.psi[i]);{const x=T.x[i]+c*l,z=T.z[i]-s*l;return[x,Math.abs(l)>T.hw[i]+.8?T.terr(x,z):T.y[i]-l*T.bank[i],z,T.psi[i]]}};
 if(d.biome==='forest'){
  const tl=scatter(900,T.hw[0]+3.5,150,(x,h,z,o,rd)=>{if(h>95)return 1;if(rd>45&&r()<.25)return 1;o.push([x,h,z,.8+r()*1.3,0,0,r()*6]);return 0});
  instC(sc,new THREE.CylinderGeometry(.25,.4,2.8,5),flat(0x4d3523),tl.map(p=>[p[0],p[1]+1.4*p[3],p[2],p[3],p[4]]),[0x4d3523,0x5a4029]);
  const tint=[0x2a6a3e,0x23583a,0x30743f,0x1f4f36];
  instC(sc,new THREE.ConeGeometry(2.6,4.4,7),flat(0xffffff),tl.map(p=>[p[0],p[1]+3.6*p[3],p[2],p[3],p[3]*1.0,p[3],p[6]]),tint);
  instC(sc,new THREE.ConeGeometry(2.0,3.8,7),flat(0xffffff),tl.map(p=>[p[0],p[1]+6.1*p[3],p[2],p[3],p[3],p[3],p[6]]),tint);
  instC(sc,new THREE.ConeGeometry(1.4,3.4,7),flat(0xffffff),tl.map(p=>[p[0],p[1]+8.3*p[3],p[2],p[3],p[3],p[3],p[6]]),tint);
  const bl=scatter(120,T.hw[0]+5,110,(x,h,z,o)=>{o.push([x,h,z,.9+r()*.6,0,0,r()*6]);return 0});
  instC(sc,new THREE.CylinderGeometry(.14,.2,3.4,5),flat(0xe8e6de),bl.map(p=>[p[0],p[1]+1.7*p[3],p[2],p[3]]));
  instC(sc,new THREE.IcosahedronGeometry(1.9,0),flat(0xffffff),bl.map(p=>[p[0],p[1]+4*p[3],p[2],p[3],p[3]*1.2,p[3],p[6]]),[0x79a845,0x8bb44f,0xa3b94a]);
  const bs=scatter(420,T.hw[0]+2.5,60,(x,h,z,o)=>{o.push([x,h+.3,z,.5+r()*.9,.5+r()*.5,0,r()*6]);return 0});
  instC(sc,new THREE.IcosahedronGeometry(1,0),flat(0xffffff),bs,[0x335a2c,0x3f6a30,0x4a5f2a,0x5a4a2a]);
  const rk=scatter(220,T.hw[0]+2.5,140,(x,h,z,o)=>{o.push([x,h+.4,z,.5+r()*1.7,.4+r()*1.0,.5+r()*1.7,r()*6]);return 0});
  instC(sc,new THREE.DodecahedronGeometry(1.2,0),flat(0xffffff),rk,[0x77797a,0x6c6e70,0x85857f]);
  /* log piles and stumps */
  const lg=scatter(30,T.hw[0]+3,40,(x,h,z,o)=>{o.push([x,h+.5,z,1,1,1,r()*3,0]);return 0});
  instC(sc,new THREE.CylinderGeometry(.34,.34,4.2,6),flat(0x7a5a38),lg.map(p=>[p[0],p[1],p[2],1,1,1,p[6],PI/2]));
  instC(sc,new THREE.CylinderGeometry(.34,.34,4.2,6),flat(0x6a4c30),lg.map(p=>[p[0]+.2,p[1]+.72,p[2]+.4,1,1,1,p[6]+.1,PI/2]));
 }else if(d.biome==='desert'){
  const ms=scatter(34,60,300,(x,h,z,o)=>{const H=22+r()*60,rot=r()*6,rx=14+r()*46,rz=10+r()*34,R_=Math.max(rx,rz)*.98;let mn=h;for(let a=0;a<16;a++){const an=a/16*6.2832;mn=Math.min(mn,T.terr(x+Math.cos(an)*R_,z+Math.sin(an)*R_))}const base=Math.min(h-4,mn-3),top=h-4+H;o.push([x,base,z,1,top-base,1,rot,0,rx,rz]);return 0});
  const mc=[0xb4552f,0xc46a3e,0xa8482a,0xbf7a4a];
  const mg=new THREE.CylinderGeometry(.8,1,1,8,1),mm=flat(0xffffff);
  const im=new THREE.InstancedMesh(mg,mm,ms.length),oo=new THREE.Object3D(),cc=new THREE.Color();ms.forEach((p,i)=>{oo.position.set(p[0],p[1]+p[4]/2,p[2]);oo.scale.set(p[8],p[4],p[9]);oo.rotation.set(0,p[6],0);oo.updateMatrix();im.setMatrixAt(i,oo.matrix);cc.setHex(mc[i%4]);cc.offsetHSL(0,0,(r()-.5)*.06);im.setColorAt(i,cc)});im.frustumCulled=false;sc.add(im);
  /* caps */
  const cp=new THREE.InstancedMesh(new THREE.CylinderGeometry(.82,.8,.05,8),flat(0xd8956a),ms.length);ms.forEach((p,i)=>{oo.position.set(p[0],p[1]+p[4]+.1,p[2]);oo.scale.set(p[8]*1.02,3,p[9]*1.02);oo.rotation.set(0,p[6],0);oo.updateMatrix();cp.setMatrixAt(i,oo.matrix)});cp.frustumCulled=false;sc.add(cp);
  const hd=scatter(70,T.hw[0]+6,160,(x,h,z,o)=>{o.push([x,h,z,.7+r()*1.4,0,0,r()*6]);return 0});
  {const hb=hd.map(p=>{const s=p[3];let mn=p[1];for(let a=0;a<10;a++){const an=a/10*6.2832;mn=Math.min(mn,T.terr(p[0]+Math.cos(an)*2.1*s,p[2]+Math.sin(an)*2.1*s))}const base=mn-1.2,top=p[1]+6.45*s;return[p[0],(base+top)/2,p[2],s,(top-base)/6.5,s,p[6]]});
  instC(sc,new THREE.CylinderGeometry(.9,2.0,6.5,6),flat(0xffffff),hb,[0xa8482a,0xb4552f,0x9a4326])}
  instC(sc,new THREE.SphereGeometry(1.7,6,4),flat(0xffffff),hd.map(p=>[p[0],p[1]+7*p[3],p[2],p[3],p[3]*.8,p[3],p[6]]),[0xb4552f,0xc46a3e]);
  const cx=scatter(110,T.hw[0]+4,120,(x,h,z,o)=>{o.push([x,h,z,.8+r()*.7,0,0,r()*6]);return 0});
  instC(sc,new THREE.CylinderGeometry(.35,.4,4,6),flat(0x4f7a3a),cx.map(p=>[p[0],p[1]+2*p[3],p[2],p[3]]));
  instC(sc,new THREE.CylinderGeometry(.2,.22,1.8,5),flat(0x4f7a3a),cx.map(p=>[p[0]+Math.cos(p[6])*.9*p[3],p[1]+2.3*p[3],p[2]+Math.sin(p[6])*.9*p[3],p[3]]));
  instC(sc,new THREE.CylinderGeometry(.2,.22,1.6,5),flat(0x4f7a3a),cx.map(p=>[p[0]-Math.cos(p[6])*.9*p[3],p[1]+2.9*p[3],p[2]-Math.sin(p[6])*.9*p[3],p[3]]));
  const sb=scatter(520,T.hw[0]+2.5,90,(x,h,z,o)=>{o.push([x,h+.25,z,.5+r()*.8,.4+r()*.4,0,r()*6]);return 0});
  instC(sc,new THREE.IcosahedronGeometry(1,0),flat(0xffffff),sb,[0x6a6a3a,0x7a6a3a,0x5a5a34,0x8a7040]);
  const rk=scatter(240,T.hw[0]+2.5,150,(x,h,z,o)=>{o.push([x,h+.3,z,.5+r()*1.6,.4+r()*1.0,.5+r()*1.6,r()*6]);return 0});
  instC(sc,new THREE.DodecahedronGeometry(1.2,0),flat(0xffffff),rk,[0x9a4d2e,0x8a4226,0xa85a38]);
  /* telegraph poles along a stretch */
  const poles=[];for(let i=0;i<N;i+=11){const p=side(i,T.hw[i]+7);poles.push([p[0],p[1]+4,p[2],1])}
  instC(sc,new THREE.CylinderGeometry(.14,.17,8,5),flat(0x5a4330),poles);instC(sc,new THREE.BoxGeometry(2.4,.14,.14),flat(0x4a3626),poles.map(p=>[p[0],p[1]+3.6,p[2],1]));
 }else if(d.biome!=='none'){
  const hb=scatter(560,T.hw[0]+2.5,120,(x,h,z,o)=>{o.push([x,h+.2,z,.6+r()*1.0,.4+r()*.4,0,r()*6]);return 0});
  instC(sc,new THREE.IcosahedronGeometry(1,0),flat(0xffffff),hb,[0x6a4a7a,0x7a5a88,0x5a3f6a,0x6f8a3a,0x59753a]);
  const rk=scatter(260,T.hw[0]+2.5,160,(x,h,z,o)=>{o.push([x,h+.35,z,.5+r()*1.8,.4+r()*1.2,.5+r()*1.8,r()*6]);return 0});
  instC(sc,new THREE.DodecahedronGeometry(1.2,0),flat(0xffffff),rk,[0x808080,0x6f726f,0x8b8a82]);
  const br=scatter(260,T.hw[0]+3,70,(x,h,z,o)=>{o.push([x,h+.9,z,.7+r()*.5,0,0,r()*6]);return 0});
  instC(sc,new THREE.ConeGeometry(.9,1.8,5),flat(0xffffff),br,[0x7b8a3a,0x6a7a30]);
  /* bent thorn trees */
  const tr=scatter(60,T.hw[0]+6,120,(x,h,z,o)=>{o.push([x,h,z,.9+r()*.6,0,0,r()*6]);return 0});
  instC(sc,new THREE.CylinderGeometry(.14,.28,3,5),flat(0x4a3a2c),tr.map(p=>[p[0],p[1]+1.5*p[3],p[2],p[3]]));
  instC(sc,new THREE.IcosahedronGeometry(1.9,0),flat(0xffffff),tr.map(p=>[p[0]+.6,p[1]+3.4*p[3],p[2],p[3],p[3]*.8,p[3]*1.1,p[6]]),[0x4c6a34,0x587a38,0x40602e]);
  /* sheep */
  const sh=scatter(70,T.hw[0]+5,100,(x,h,z,o)=>{if(r()<.4)return 1;o.push([x,h,z,.9+r()*.3,0,0,r()*6]);return 0});
  instC(sc,new THREE.BoxGeometry(1.2,.8,.8),flat(0xeeeee6),sh.map(p=>[p[0],p[1]+.7*p[3],p[2],p[3],p[3],p[3],p[6]]));
  instC(sc,new THREE.BoxGeometry(.4,.45,.4),flat(0x2c2c2c),sh.map(p=>[p[0]+Math.sin(p[6])*.75*p[3],p[1]+.85*p[3],p[2]+Math.cos(p[6])*.75*p[3],p[3],p[3],p[3],p[6]]));
  /* dry-stone walls along both sides, in runs */
  const wl=[];for(let i=0;i<N;i+=2){if(T.gap[i])continue;if(Math.sin(i*.043+d.id)<.1)continue;for(const sd of [-1,1]){if(Math.sin(i*.07+sd*2)<-.3)continue;const p=side(i,sd*(T.hw[i]+3.2));wl.push([p[0],p[1]+.55,p[2],1,1,1,p[3]])}}
  instC(sc,new THREE.BoxGeometry(.9,1.1,6.4),flat(0xffffff),wl.map(p=>[p[0],p[1],p[2],1,1,1,p[6]]),[0x8a8a82,0x7a7a74,0x908f86,0x6f6f6a]);
  instC(sc,new THREE.BoxGeometry(1.0,.25,6.4),flat(0x6a6a64),wl.map(p=>[p[0],p[1]+.65,p[2],1,1,1,p[6]]));
  /* cottages */
  for(let q=0;q<4;q++){let x,z;for(let t=0;t<200;t++){x=lerp(x0+40,x1-40,r());z=lerp(z0+40,z1-40,r());const rd=roadDistFar(T,x,z);if(rd>22&&rd<70)break}
   const y=T.terr(x,z),g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=r()*6;sc.add(g);mesh(new THREE.BoxGeometry(9,4,5.5),flat(0xd5cfc0),0,2,0,g);const rf=mesh(new THREE.CylinderGeometry(0.01,3.7,3,4,1),flat(0x5a5048),0,5.4,0,g);rf.rotation.y=PI/4;rf.scale.set(1.45,1,.95);mesh(new THREE.BoxGeometry(.8,2.4,.8),flat(0x6a6058),2.6,5.6,0,g);mesh(new THREE.BoxGeometry(1.2,2,.1),flat(0x3a2a1c),-1.5,1,2.78,g)}
 }
 /* rally furniture common to all stages: tape, chevrons, spectators, hay, flags */
 const chev=[],tape=[],hay=[],peeps=[],flags=[];
 for(let i=0;i<N;i+=3){if(T.gap[i])continue;const k=K[i];if(k>.0105){const sgn=Math.sign(wr(T.psi[(i+3)%N]-T.psi[(i-3+N)%N]));const outer=sgn>0?-1:1; /* outside of the bend */
   /* a left turn (psi increasing) has its outside on the right: psi sign convention checked by test */
   const p=side(i,-sgn*(T.hw[i]+2.6));if(i%9===0)chev.push([p[0],p[1]+1.5,p[2],p[3]+PI,sgn]);if(i%6===0){tape.push([p[0],p[1]+.55,p[2]])}
   if(k>.016&&i%12===0){const hp=side(i,-sgn*(T.hw[i]+4.4));hay.push([hp[0],hp[1]+.55,hp[2],hp[3]])}
   if(k>.012&&i%15===0&&r()<.8){const pp=side(i,-sgn*(T.hw[i]+7+r()*3));for(let q=0;q<4+(r()*5|0);q++)peeps.push([pp[0]+(r()-.5)*5,T.terr(pp[0],pp[2])+.9,pp[2]+(r()-.5)*5,r()*6])}}}
 for(let i=20;i<N;i+=40){const p=side(i,(i%80?1:-1)*(T.hw[i]+2));flags.push([p[0],p[1]+2,p[2],i%80?0:1])}
 if(chev.length){const ct=chevronTex(),cm=new THREE.MeshBasicMaterial({map:ct,side:THREE.DoubleSide});const im=new THREE.InstancedMesh(new THREE.PlaneGeometry(2.6,1.3),cm,chev.length),oo=new THREE.Object3D();chev.forEach((p,i)=>{oo.position.set(p[0],p[1],p[2]);oo.rotation.set(0,p[3],0);oo.scale.set(p[4]>0?-1:1,1,1);oo.updateMatrix();im.setMatrixAt(i,oo.matrix)});im.frustumCulled=false;sc.add(im);instC(sc,new THREE.CylinderGeometry(.06,.06,2.4,4),flat(0x555555),chev.map(p=>[p[0],p[1]-.4,p[2],1]))}
 if(tape.length)instC(sc,new THREE.CylinderGeometry(.05,.05,1.1,4),flat(0xffffff),tape,[0xd9382a,0xf2f2f2]);
 if(hay.length)instC(sc,new THREE.CylinderGeometry(.62,.62,1.2,8),flat(0xd6b85a),hay.map(p=>[p[0],p[1],p[2],1,1,1,p[3],PI/2]));
 if(peeps.length){instC(sc,new THREE.CylinderGeometry(.22,.26,1.0,5),flat(0xffffff),peeps.map(p=>[p[0],p[1]-.3,p[2],1]),[0xd9382a,0x2f6fd0,0xf2c230,0x2fa05a,0x111111,0xe8e8e8,0xff7a2a]);instC(sc,new THREE.SphereGeometry(.2,5,4),flat(0xe3b58d),peeps.map(p=>[p[0],p[1]+.4,p[2],1]))}
 if(flags.length){instC(sc,new THREE.CylinderGeometry(.04,.05,4,4),flat(0x444444),flags.map(p=>[p[0],p[1],p[2],1]));instC(sc,new THREE.BoxGeometry(.9,.55,.04),flat(0xffffff),flags.map(p=>[p[0]+.45,p[1]+1.6,p[2],1]),[0xd9382a,0xf2c230,0x2f6fd0])}
 /* distant ring of hills */
 {const big=Math.hypot(x1-x0,z1-z0)>1500,hx=big?(x0+x1)/2:0,hz=big?(z0+z1)/2:0,hr=big?Math.hypot(x1-x0,z1-z0)/2+300:640;
 for(let j=0;j<(big?44:30);j++){const a=j/(big?44:30)*PI*2,h=60+r()*110,dist=hr+r()*110,col=d.biome==='forest'?0x3b5a48:d.biome==='desert'?0xa8603a:0x66705a;mesh(new THREE.ConeGeometry(90+r()*70,h,6),flat(col),hx+Math.sin(a)*dist,h*.32,hz+Math.cos(a)*dist,sc)}}
 sc.add(panoRally(T));
 styleScene(sc);
 return sc}
const prevBuild=buildWorld;
buildWorld=T=>{const sc=T.d.id>=4?buildRally(T):prevBuild(T);return sc};
P.buildRally=buildRally;
})();
