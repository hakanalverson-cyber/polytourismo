/* ===== Poly GT layer: race post-processing. Nov 8, Hakan: "add atmosphere, like fog and depth of view" (after the garage-style lighting).
   The single-player race view is drawn into an off-screen picture with its depth, then put on screen through one pass that adds:
   - ambient occlusion: creases and contact points (tyres on the road, a fence on the grass, the base of a building) darken a little. Made from
     depth alone, plane-safe: for pairs of points around each pixel it compares the pixel's 1/depth with the pair's average (a flat surface is
     linear in 1/depth on screen, so it never darkens itself); pairs across a silhouette are skipped
   - depth of field: the car and the road near it stay sharp; past about forty metres the picture eases into a soft blur, full by the horizon
   - atmosphere: a light haze in the fog colour that thickens with distance, warmer toward the sun
   The main renderer has no antialiasing, so drawing off-screen loses nothing. Split screen, menus, the garage and the showroom are untouched.
   Options > Performance: DEPTH OF FIELD and AMBIENT OCCLUSION. ===== */
(function post(){
'use strict';
const P=window.PT8;if(!P||typeof THREE==='undefined'||typeof R==='undefined')return;
const O=()=>window.PTO||{};
const dofOn=()=>O().dof!==false,aoOn=()=>O().ao!==false;
let rt=null,qa=null,qb=null,Q=null;const V4=new THREE.Vector4(),V2=new THREE.Vector2(),CW=new THREE.Vector3();
const VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
const LZ='float lz(vec2 uv){float d=texture2D(tD,uv).x;return cn*cf/(cf-d*(cf-cn));}';
function init(){const sc=new THREE.Scene(),cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1),q=new THREE.Mesh(new THREE.PlaneGeometry(2,2));q.frustumCulled=false;sc.add(q);
 /* far-weighted blur: near (sharp) pixels barely feed the blur, so the car doesn't smear a halo into the background around it */
 const blur=new THREE.ShaderMaterial({uniforms:{tC:{value:null},tD:{value:null},dir:{value:new THREE.Vector2()},cn:{value:.1},cf:{value:1000},f0:{value:40},f1:{value:250},w:{value:0}},vertexShader:VS,
  fragmentShader:`uniform sampler2D tC,tD;uniform vec2 dir;uniform float cn,cf,f0,f1,w;varying vec2 vUv;${LZ}
  void main(){vec3 s=vec3(0.);float t=0.;for(int i=-4;i<=4;i++){float fi=float(i);vec2 u=vUv+dir*fi;float k=exp(-fi*fi/8.);if(w>.5)k*=.03+smoothstep(f0,f1,lz(u));s+=texture2D(tC,u).rgb*k;t+=k;}gl_FragColor=vec4(s/t,1.);}`,depthTest:false,depthWrite:false,toneMapped:false});
 const comp=new THREE.ShaderMaterial({uniforms:{tC:{value:null},tD:{value:null},tB:{value:null},px:{value:new THREE.Vector2()},cn:{value:.1},cf:{value:1000},f0:{value:40},f1:{value:250},dofK:{value:.7},aoK:{value:.5},
  hz:{value:.0035},hzK:{value:.3},hzC:{value:new THREE.Color()},sunC:{value:new THREE.Color()},sunD:{value:new THREE.Vector3(0,1,0)},pInv:{value:new THREE.Matrix4()},cW:{value:new THREE.Matrix4()}},vertexShader:VS,
  fragmentShader:`uniform sampler2D tC,tD,tB;uniform vec2 px;uniform float cn,cf,f0,f1,dofK,aoK,hz,hzK;uniform vec3 hzC,sunC,sunD;uniform mat4 pInv,cW;varying vec2 vUv;${LZ}
  void main(){vec2 uv=vUv;vec3 c=texture2D(tC,uv).rgb;float d=texture2D(tD,uv).x;float z=lz(uv);bool sky=d>.99999;
   if(aoK>0.&&!sky){float ic=1./z,occ=0.,r=clamp(90./z,2.,22.),rng=.6+z*.12;
    for(int i=0;i<8;i++){float fi=float(i),a=fi*.3927+.17;vec2 o=vec2(cos(a),sin(a))*px*r*(.45+.55*fract(fi*.618+.3));
     float za=lz(uv+o),zb=lz(uv-o);if(abs(za-z)>rng||abs(zb-z)>rng)continue;float m=(1./za+1./zb)*.5;occ+=clamp((m-ic)/ic*20.,0.,1.);}
    c*=1.-aoK*min(1.,occ/8.*1.6)*(1.-smoothstep(70.,160.,z));}
   if(dofK>0.){float k=smoothstep(f0,f1,z)*dofK;c=mix(c,texture2D(tB,uv).rgb,k);}
   if(hzK>0.){vec4 vp=pInv*vec4(uv*2.-1.,1.,1.);vec3 vd=normalize((cW*vec4(normalize(vp.xyz/vp.w),0.)).xyz);float s=max(0.,dot(vd,sunD));
    vec3 h=hzC+sunC*(pow(s,6.)*.45+pow(s,40.)*.4);float f=sky?pow(s,6.)*.25:(1.-exp(-z*hz))*hzK;c=mix(c,h,clamp(f,0.,1.));}
   gl_FragColor=vec4(c,1.);}`,depthTest:false,depthWrite:false,toneMapped:false});
 Q={sc,cam,q,blur,comp}}
function size(W,H){if(rt&&rt.width===W&&rt.height===H)return;for(const r of[rt,qa,qb])if(r){if(r.depthTexture)r.depthTexture.dispose();r.dispose()}
 rt=new THREE.WebGLRenderTarget(W,H,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,generateMipmaps:false,stencilBuffer:false});rt.texture.encoding=R.outputEncoding;
 rt.depthTexture=new THREE.DepthTexture(W,H);rt.depthTexture.type=THREE.UnsignedIntType;
 const w=Math.max(32,W>>2),h=Math.max(18,H>>2),o={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,generateMipmaps:false,depthBuffer:false};qa=new THREE.WebGLRenderTarget(w,h,o);qb=new THREE.WebGLRenderTarget(w,h,o)}
const lin2srgb=c=>c.clone().convertLinearToSRGB();
const prev=R.render.bind(R);
function want(scene,cam){if(!(dofOn()||aoOn()))return false;if(typeof scr==='undefined'||scr!=='game'||typeof RACE==='undefined'||!RACE||scene!==RACE.scene||!cam||!cam.isPerspectiveCamera)return false;
 if(R.getRenderTarget()!==null||document.body.classList.contains('studio'))return false;
 if(RACE.cars.filter(c=>c.human).length!==1)return false;
 R.getViewport(V4);R.getDrawingBufferSize(V2);const pr=R.getPixelRatio()||1;return Math.abs(V4.z*pr-V2.x)<2&&Math.abs(V4.w*pr-V2.y)<2&&V4.x<1&&V4.y<1}
let bad=0;
R.render=function(scene,cam){if(bad>3||!want(scene,cam))return prev(scene,cam);
 try{if(!Q)init();R.getDrawingBufferSize(V2);const W=V2.x|0,H=V2.y|0;size(W,H);
  R.setRenderTarget(rt);R.clear();prev(scene,cam);
  /* focus: the distance to the player's car */
  const me=RACE.cars.find(c=>c.human),fd=me&&me.m&&me.m.g?cam.position.distanceTo(me.m.g.position):10,f0=Math.max(28,fd*3.6),f1=Math.max(130,fd*14),cn=cam.near,cf=cam.far;
  const D=dofOn();
  if(D){const b=Q.blur,u=b.uniforms;u.tD.value=rt.depthTexture;u.cn.value=cn;u.cf.value=cf;u.f0.value=f0;u.f1.value=f1;Q.q.material=b;
   u.tC.value=rt.texture;u.w.value=1;u.dir.value.set(1.5/W*4,0);R.setRenderTarget(qa);prev(Q.sc,Q.cam);
   u.tC.value=qa.texture;u.w.value=0;u.dir.value.set(0,1.5/H*4);R.setRenderTarget(qb);prev(Q.sc,Q.cam);
   u.tC.value=qb.texture;u.dir.value.set(2.5/W*4,0);R.setRenderTarget(qa);prev(Q.sc,Q.cam);
   u.tC.value=qa.texture;u.dir.value.set(0,2.5/H*4);R.setRenderTarget(qb);prev(Q.sc,Q.cam)}
  const c=Q.comp,u=c.uniforms;u.tC.value=rt.texture;u.tD.value=rt.depthTexture;u.tB.value=qb?qb.texture:rt.texture;u.px.value.set(1/W,1/H);u.cn.value=cn;u.cf.value=cf;u.f0.value=f0;u.f1.value=f1;
  u.dofK.value=D?.72:0;u.aoK.value=aoOn()?.75:0;
  /* the haze: the fog colour, warmed toward the sun */
  const sun=scene.userData.sun,fog=scene.fog,night=scene.userData.tod==='night';
  if(fog&&fog.color){u.hzC.value.copy(lin2srgb(fog.color));u.hzK.value=night?.1:.16;u.hz.value=fog.isFog?Math.min(.01,2.2/Math.max(200,fog.far)):.004}else u.hzK.value=0;
  if(sun){u.sunC.value.copy(lin2srgb(sun.color)).multiplyScalar(night?.15:Math.min(1,.45*sun.intensity));CW.copy(sun.position).sub(sun.target.position).normalize();u.sunD.value.copy(CW)}else u.sunC.value.setRGB(0,0,0);
  cam.updateMatrixWorld();u.pInv.value.copy(cam.projectionMatrixInverse);u.cW.value.copy(cam.matrixWorld);
  Q.q.material=c;R.setRenderTarget(null);prev(Q.sc,Q.cam);bad=0}
 catch(e){bad++;console.warn('post',e);R.setRenderTarget(null);return prev(scene,cam)}};
})();
