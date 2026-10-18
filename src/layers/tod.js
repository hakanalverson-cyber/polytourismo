/* ===== Poly Tourismo v9 layer: time of day ===== */
(function v9tod(){
'use strict';
const P=window.PT8;
const TOD={
 dawn:{n:'DAWN',sky:[0x3f5596,0xffb08a],fog:0xe9bfa6,hemi:[0xc2c4ff,0x5b4b59,.92],sun:[0xffb272,.9,[220,60,-140]],mul:[1.04,.99,.97],add:[.012,.004,0],sat:.95,exp:1,stars:0},
 day:{n:'DAY',sky:null,fog:null,hemi:null,sun:null,mul:[1,1,1],add:[0,0,0],sat:1,exp:1,stars:0},
 sunset:{n:'SUNSET',sky:[0x2a2e6c,0xff7a3c],fog:0xe58f66,hemi:[0xffc090,0x4a3448,.88],sun:[0xff7428,1.05,[-240,42,120]],mul:[1.08,.95,.9],add:[.02,0,0],sat:1.08,exp:1.02,stars:0},
 night:{n:'NIGHT',sky:[0x03060f,0x1a2452],fog:0x0a1030,hemi:[0x5c72c4,0x0b0e1c,.62],sun:[0x93abff,.5,[120,200,-90]],mul:[.92,.97,1.1],add:[0,.003,.018],sat:.78,exp:1.12,stars:1}};
P.TOD=TOD;D[3].tod0='night';if(D[5])D[5].tod0='sunset';if(D[6])D[6].tod0='dawn';P.TOD_ORDER=['dawn','day','sunset','night'];
const U=window.TODU;
const setU=(m,a,s)=>{U.mul.value.set(m[0],m[1],m[2]);U.add.value.set(a[0],a[1],a[2]);U.sat.value=s};
P.resetTod=()=>{if(U)setU([1,1,1],[0,0,0],1);R.toneMappingExposure=P.baseExpo||R.toneMappingExposure};
const hex=h=>'#'+h.toString(16).padStart(6,'0');
function skyTex(t){return ctex(2,64,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,hex(t.sky[0]));g.addColorStop(.5,hex(t.sky[1]));g.addColorStop(1,hex(t.sky[1]));x.fillStyle=g;x.fillRect(0,0,w,h)})}
P.applyTod=(sc,T,key)=>{const t=key==='day'&&T.d.id===3?{sky:[0x6aa4e8,0xcfe6ff],fog:0xbcd2e6,hemi:[0xdfeaff,0x5a5a78,1.05],sun:[0xfff2d6,.95,[-150,250,100]],mul:[1,1,1],add:[0,0,0],sat:.95,exp:1,stars:0}:TOD[key];P.curTod=key;const d=T.d;
 if(!t||(key==='day'&&d.id!==3)||(key==='night'&&d.id===3)){P.resetTod();return}
 for(const o of sc.children){
  if(o.isHemisphereLight){o.color.setHex(t.hemi[0]);o.groundColor.setHex(t.hemi[1]);o.intensity=t.hemi[2]*(d.id==3?.78:1)}
  else if(o.isDirectionalLight){o.color.setHex(t.sun[0]);o.intensity=t.sun[1]*(d.id==3?.7:1);o.position.set(t.sun[2][0],t.sun[2][1],t.sun[2][2])}
  else if(o.geometry&&o.geometry.type==='SphereGeometry'){const r=o.geometry.parameters.radius;
   if(r===1500){o.material.map=skyTex(t);o.material.needsUpdate=true}
   else if(r===40){const v=new THREE.Vector3(...t.sun[2]).normalize().multiplyScalar(1350);o.position.copy(v);o.material.color.setHex(key==='night'?0xdfe8ff:t.sun[0]);o.scale.setScalar(key==='night'?.7:(key==='dawn'||key==='sunset'?1.5:1))}
   }
  else if(o.isPoints&&d.id==3)o.visible=key==='night';
 }
 if(sc.fog){sc.fog.color.setHex(t.fog);if(sc.userData.ptFog)sc.userData.ptFog.color.setHex(t.fog);if(key==='night'){sc.fog.near*=.5;sc.fog.far*=.75;if(sc.userData.ptFog){sc.userData.ptFog.near=sc.fog.near;sc.userData.ptFog.far=sc.fog.far}}}
 if(key==='night'&&d.id!==3){const st=[],r=Math.random;for(let i=0;i<420;i++){const a=r()*6.28,b=r()*1.25+.08;st.push(Math.cos(a)*Math.cos(b)*1400,Math.sin(b)*1400,Math.sin(a)*Math.cos(b)*1400)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(st,3));sc.add(new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:2,sizeAttenuation:false,fog:false})))}
 /* city: windows glow harder at night, fade by day */
 if(d.id==3)sc.traverse(o=>{if(o.material&&o.material.emissiveMap)o.material.emissiveIntensity=key==='night'?1.0:key==='day'?.1:.35});
 setU(t.mul,t.add,t.sat);P.baseExpo=P.baseExpo||R.toneMappingExposure;R.toneMappingExposure=P.baseExpo*t.exp;
 sc.userData.tod=key};
/* headlights for human cars at night/dawn/sunset-dim */
P.todPost=Rc=>{const key=P.curTod;if(key!=='night')return;
 for(const c of Rc.cars){if(!c.human)continue;const sp=new THREE.SpotLight(0xfff0cf,2.4,130,.5,.55,1.2);sp.position.set(0,.55,1.9);const tg=new THREE.Object3D();tg.position.set(0,-.2,34);c.m.g.add(sp);c.m.g.add(tg);sp.target=tg}}
})();
