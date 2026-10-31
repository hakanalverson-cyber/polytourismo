/* ===== Poly GT layer: Free Roam sea (shader water: depth-tinted shallows, shore foam, sun glitter, fog) ===== */
(function frwater(){
'use strict';
const P=window.PT8;
const VS=`varying vec3 vW;
#include <fog_pars_vertex>
void main(){vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`;
const FS=`uniform float uTime,uDepthMax;uniform vec3 uSun,uSky,uZenith,uShallow,uMid,uDeep,uGrid;uniform sampler2D uDepth;
varying vec3 vW;
#include <common>
#include <fog_pars_fragment>
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x),f.y);}
void main(){
 vec2 uv=(vW.xz/uGrid.x+.5)/uGrid.yz;
 float dep=texture2D(uDepth,uv).r*uDepthMax;
 vec3 V=normalize(cameraPosition-vW);float dist=length(cameraPosition-vW);
 vec2 p=vW.xz;float t=uTime;
 /* slope field of a few travelling swells and a drifting chop */
 vec2 g=vec2(.55,.25)*cos(dot(p,vec2(.55,.25))*1.1+t*1.1)*.11+vec2(-.3,.6)*cos(dot(p,vec2(-.3,.6))*1.7+t*1.4)*.08+vec2(.8,-.5)*cos(dot(p,vec2(.8,-.5))*2.6-t*1.9)*.055;
 float n1=vn(p*.9+vec2(t*.4,-t*.3)),n2=vn(p*2.1-vec2(t*.5,t*.2));
 g+=vec2(n1-.5,n2-.5)*.2;g*=1./(1.+dist*.0014);
 vec3 N=normalize(vec3(-g.x,1.,-g.y));
 float d1=smoothstep(0.,5.,dep),d2=smoothstep(4.,30.,dep);
 vec3 base=mix(mix(uShallow,uMid,d1),uDeep,d2);
 float fr=.03+.6*pow(1.-max(dot(N,V),0.),4.);
 vec3 refl=mix(uSky,uZenith,clamp(V.y*2.6+.15,0.,1.));
 vec3 col=mix(base,refl,clamp(fr,0.,.62));
 /* sun glitter on the crests */
 vec3 L=normalize(uSun);vec3 R=reflect(-L,N);float sp=pow(max(dot(R,V),0.),140.);
 float sparkle=step(.58,vn(p*4.+vec2(t*.8,t*.5)));
 col+=vec3(1.,.93,.75)*sp*(.5+1.6*sparkle)*(1.-d2*.4);
 /* foam: thick on the sand, loose bands drifting in over the shallows */
 float shore=1.-smoothstep(0.,1.5,dep);
 float bands=smoothstep(.55,.95,sin(dep*1.7-t*.8+n1*4.))*(1.-smoothstep(1.,8.,dep));
 float foam=clamp(shore*.95+bands*.5,0.,1.)*(.5+.5*vn(p*2.6+t*.15))*(1.-smoothstep(260.,900.,dist));
 col=mix(col,vec3(.96,.97,.94),foam);
 float a=clamp(mix(.42,.96,d1)+foam*.4,0.,1.);
 gl_FragColor=vec4(col,a);
 #include <tonemapping_fragment>
 #include <encodings_fragment>
 #include <fog_fragment>
}`;
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
function make(F){
 const W=F.W,GX=F.WX/F.CELL+1,GZ=F.WZ/F.CELL+1,DM=40,data=new Uint8Array(GX*GZ);
 for(let k=0;k<GX*GZ;k++){const h=W.HR[k];data[k]=h>=0?0:Math.min(255,Math.round(-h/DM*255))}
 const tex=new THREE.DataTexture(data,GX,GZ,THREE.LuminanceFormat,THREE.UnsignedByteType);tex.minFilter=tex.magFilter=THREE.LinearFilter;tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping;tex.generateMipmaps=false;tex.needsUpdate=true;
 const u=Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uTime:{value:0},uDepthMax:{value:DM},uSun:{value:new THREE.Vector3(-.45,.78,.42).normalize()},uSky:{value:lin(0xcfe3f2)},uZenith:{value:lin(0x5f95d8)},
  uShallow:{value:lin(0x6fe3d2)},uMid:{value:lin(0x1fa3c4)},uDeep:{value:lin(0x0e4c85)},uGrid:{value:new THREE.Vector3(F.CELL,GX,GZ)},uDepth:{value:tex}});
 const m=new THREE.ShaderMaterial({uniforms:u,vertexShader:VS,fragmentShader:FS,transparent:true,depthWrite:false,fog:true});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(40000,40000),m);mesh.rotation.x=-Math.PI/2;mesh.position.y=-.05;mesh.frustumCulled=false;mesh.renderOrder=2;mesh.userData.tex=tex;return mesh}
P.FRWater={make};
})();
