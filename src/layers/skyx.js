/* ===== Poly GT layer: shader sky (Nov 9, Hakan: "make the skyboxes cleaner and better").
   The race maps had a two-colour gradient texture on a sphere, a flat sun ball that did not sit where the light came from, and a dozen blob
   sprites for clouds. Every race scene's sky dome now gets one shader instead:
   - three-band gradient (zenith, mid sky, horizon) from the map's own sky colours, a bright haze band at the horizon and a ground fade below it
     into the fog colour, so the far land melts into the air instead of meeting a hard line
   - the sun where the light really comes from: a crisp disc, a tight corona and a wide warm glow (forward scattering, stronger low in the sky)
   - procedural clouds on a high flat layer (two octaves of drifting value noise, domain-warped): lit tops, cooler undersides, a silver edge
     toward the sun, thinning out to the horizon. Coverage and tint per map
   - stars on the night map, a faint band of warm light along the horizon at dawn and sunset
   - dithered, so the gradient never bands
   The flat sun ball and the sprite clouds are hidden when this sky is on. PTO.skyx===false keeps the old sky. ===== */
(function skyx(){
'use strict';
const P=window.PT8;if(!P||typeof THREE==='undefined'||typeof R==='undefined')return;
const on=()=>!window.PTO||window.PTO.skyx!==false;
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
/* per map: cloud cover (0..1), cloud tint, cloud scale, wind */
const CL={'Quarry Circuit':[.42,0xffffff,1],'Canyon Viaduct':[.22,0xfff0dc,1.3],'Alpine Pass':[.5,0xffffff,.9],'Afterhours Loop':[.18,0x8a94b8,1.2],'Pinewood Stage':[.46,0xf4f8f4,1],
 'Redrock Stage':[.2,0xffe2c4,1.4],'Highmoor Stage':[.58,0xe4e8ea,.8],'Coastal Run':[.34,0xffd8b0,1.2],'Grand Valley':[.4,0xffffff,1],'Frostline Stage':[.55,0xf4f8ff,.9],
 'Finland':[.4,0xffffff,1],'France':[.3,0xffffff,1.1],'Portugal':[.24,0xffe8cc,1.3],'Sweden':[.16,0xffffff,1.2]};
const VS=`varying vec3 vD;void main(){vD=position;vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}`;
const FS=`varying vec3 vD;uniform vec3 zen,mid,hor,gnd,sunC,sunD,clC;uniform float t,cov,csc,night,warm,sunK;
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*vn(p);p=p*2.03+vec2(17.1,9.2);a*=.5;}return s;}
void main(){vec3 d=normalize(vD);float y=d.y;
 /* gradient */
 float hy=max(y,0.);vec3 c=mix(hor,mid,smoothstep(0.,.22,hy));c=mix(c,zen,smoothstep(.18,.85,hy));
 float hb=exp(-abs(y)*14.);c=mix(c,hor*1.08+vec3(.02),hb*.55);
 float s=max(dot(d,sunD),0.);
 /* warm horizon on a low sun, toward the sun's side */
 c+=sunC*warm*exp(-abs(y)*6.)*(.25+.75*pow(s,3.))*.35;
 /* clouds on a flat layer high up */
 float cl=0.;vec3 ccol=vec3(0.);
 if(y>.01&&cov>0.){vec2 uv=d.xz/(y+.06)*.9*csc;vec2 w=vec2(t*.006,t*.0025);
  vec2 q=vec2(fbm(uv*1.1+w),fbm(uv*1.1+w+vec2(5.2,1.3)));float n=fbm(uv*1.6+q*1.4+w*1.6);
  float th=1.-cov;cl=smoothstep(th,th+.28,n)*smoothstep(.01,.2,y);
  float dens=smoothstep(th,th+.5,n);float lit=.55+.45*(1.-dens)+.35*pow(s,4.);
  vec3 under=mix(clC*.62,hor*.8,.35);ccol=mix(under,clC*1.04,lit);ccol+=sunC*pow(s,10.)*(1.-dens)*.9;
  ccol=mix(ccol,hor,smoothstep(.25,0.,y)*.6);cl*=mix(.92,1.,night)*(1.-night*.55);}
 c=mix(c,ccol,cl);
 /* sun: disc, corona, glow (dimmed where cloud covers it) */
 float vis=1.-cl*.85;
 c+=sunC*sunK*(pow(s,6.)*.18+pow(s,60.)*.45*(1.+(1.-smoothstep(0.,.3,y))))*vis;
 c+=sunC*sunK*smoothstep(.99935,.99965,s)*6.*vis;
 /* stars */
 if(night>.5&&y>0.){vec2 sp=d.xz/(y+.35)*90.;vec2 id=floor(sp);float r=h2(id);if(r>.985){vec2 f=fract(sp)-.5;float st=smoothstep(.12,0.,length(f))*(r-.985)*60.;c+=vec3(st)*smoothstep(0.,.25,y)*(.7+.3*sin(t*2.+r*40.));}}
 /* below the horizon: into the ground haze */
 c=mix(c,gnd,smoothstep(0.,.12,-y));
 /* dither */
 c+=(h2(gl_FragCoord.xy+fract(t))-.5)/255.;
 gl_FragColor=vec4(c,1.);
 #include <tonemapping_fragment>
 #include <encodings_fragment>
}`;
const T0=performance.now();
function texCols(m){/* the old gradient texture: top colour and the horizon colour (sRGB pixels) */const im=m&&m.map&&m.map.image;if(!im||!im.getContext)return null;try{const g=im.getContext('2d'),h=im.height,a=g.getImageData(0,0,1,1).data,b=g.getImageData(0,Math.floor(h*.62),1,1).data;
 const f=x=>new THREE.Color(x[0]/255,x[1]/255,x[2]/255).convertSRGBToLinear();return[f(a),f(b)]}catch(e){return null}}
function sunOf(sc){let s=sc.userData.sun;if(!s)sc.traverse(o=>{if(!s&&o.isDirectionalLight)s=o});return s}
function upgrade(sc,dd){if(sc.userData.skyx!==undefined)return;sc.userData.skyx=0;let dome=null;const discs=[];
 for(const o of sc.children){const g=o.geometry;if(!g||!o.isMesh)continue;const pr=g.parameters||{};if(g.type==='SphereGeometry'&&pr.radius===1500&&!dome&&o.material&&!o.material.isShaderMaterial)dome=o;else if(g.type==='SphereGeometry'&&pr.radius===40&&o.material&&o.material.fog===false)discs.push(o)}
 if(!dome)return;const cols=texCols(dome.material);if(!cols)return;
 const tint=dome.material.color?dome.material.color.clone():new THREE.Color(1,1,1),zen=cols[0].clone().multiply(tint),hor=cols[1].clone().multiply(tint);
 const Rc=typeof RACE!=='undefined'?RACE:null,d=dd||Rc&&Rc.T&&Rc.T.d||{},tod=sc.userData.tod||P.curTod||'day',night=tod==='night'||d.id===3?1:0,low=tod==='dawn'||tod==='sunset';
 const fog=sc.fog&&sc.fog.color?sc.fog.color.clone():hor.clone();
 const sun=sunOf(sc),sd=new THREE.Vector3(.4,.5,-.7);if(sun){sd.copy(sun.position).sub(sun.target?sun.target.position:new THREE.Vector3());if(sd.lengthSq()<1e-6)sd.set(.4,.5,-.7)}sd.normalize();
 const sc0=sun?sun.color.clone():new THREE.Color(1,.95,.85),cl=CL[d.name]||[.35,0xffffff,1];
 /* round 2 (Hakan: an overcast map should be darker): heavy cloud greys and dims the sky, and the clouds get heavier undersides */
 const oc=Math.max(0,Math.min(1,(cl[0]-.45)/.2));if(oc>0&&!night){const g=c=>{const l=(c.r+c.g+c.b)/3;c.lerp(new THREE.Color(l,l,l*1.04),.55*oc).multiplyScalar(1-.28*oc)};g(zen);g(hor);g(fog);if(sc.fog&&sc.fog.color)g(sc.fog.color);sc.traverse(o=>{if(o.isHemisphereLight)o.intensity*=1-.3*oc;else if(o.isDirectionalLight)o.intensity*=1-.3*oc})}
 /* round 4 (Nov 10): a clear day reads as a clear day. The day domes were a pale grey-blue, and after the tone curve and the darker
    exposure on the bright maps they looked overcast; the zenith now gets a deeper, cleaner blue that fades to the old pale horizon */
 if(!night&&!low&&oc<.5&&!(window.PTO&&window.PTO.skyBlue===false)&&((d.id!=null&&d.id<14)||(d.cartoon&&d.cartoon.stage))){const k=1-oc*2;
  zen.lerp(lin(0x3f86d8),.7*k);hor.lerp(lin(0xb4d0ea),.45*k)}
 /* Nov 10 (Hakan: "the rally tracks are WAYY too dark"): the stage models sit under trees and banks, and with the dimmed sky fill their
    shadow sides went near black. The sky fill on a stage is raised a lot and the sun a little (PTO.stageBright===false: as before) */
 if(d.cartoon&&d.cartoon.stage&&!night&&!(window.PTO&&window.PTO.stageBright===false))sc.traverse(o=>{if(o.isHemisphereLight){o.intensity*=1.7;o.groundColor.lerp(o.color,.25)}else if(o.isDirectionalLight)o.intensity*=1.15});
 const midC=zen.clone().lerp(hor,.45),gndC=fog.clone().lerp(hor,.3);
 const m=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,depthTest:true,fog:false,uniforms:{zen:{value:zen},mid:{value:midC},hor:{value:hor.clone().lerp(fog,.35)},gnd:{value:gndC},sunC:{value:sc0.clone().multiplyScalar(night?.25:1)},sunD:{value:sd},
  clC:{value:lin(cl[1]).multiply(night?new THREE.Color(.35,.38,.5):new THREE.Color(1,1,1)).multiplyScalar(1-.3*oc)},t:{value:0},cov:{value:cl[0]},csc:{value:cl[2]},night:{value:night},warm:{value:low?1:sd.y<.3?.4:.1},sunK:{value:night?0:1-.75*oc}},
  vertexShader:VS,fragmentShader:FS});
 dome.material=m;dome.renderOrder=-20;dome.frustumCulled=false;dome.userData.skyx=1;
 for(const o of discs)o.visible=false;
 /* the sprite clouds from sky.js: the shader draws the clouds now */
 const f=sc.userData.skyFx;if(f&&f.clouds)for(const s of f.clouds)s.visible=false;
 sc.userData.skyx=m}
const r0=R.render.bind(R);
R.render=function(scene,cam){if(scene&&scene.isScene&&on()&&typeof RACE!=='undefined'&&RACE&&RACE.scene===scene){try{upgrade(scene);const m=scene.userData.skyx;if(m&&m.uniforms)m.uniforms.t.value=(performance.now()-T0)/1000}catch(e){scene.userData.skyx=0;console.warn('skyx',e)}}return r0.apply(this,arguments)};
P.skyxUpgrade=upgrade;
})();
