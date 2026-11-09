/* ===== Poly GT layer: race post-processing. Nov 8, Hakan: "add atmosphere, like fog and depth of view" (after the garage-style lighting).
   The single-player race view is drawn into an off-screen picture with its depth, then put on screen through one pass that adds:
   - ambient occlusion: creases and contact points (tyres on the road, a fence on the grass, the base of a building) darken a little. Made from
     depth alone, plane-safe: for pairs of points around each pixel it compares the pixel's 1/depth with the pair's average (a flat surface is
     linear in 1/depth on screen, so it never darkens itself); pairs across a silhouette are skipped
   - depth of field: the car and the road near it stay sharp; past about forty metres the picture eases into a soft blur, full by the horizon
   - atmosphere: a light haze in the fog colour that thickens with distance, warmer toward the sun
   The main renderer has no antialiasing, so drawing off-screen loses nothing. Split screen, menus, the garage and the showroom are untouched.
   Options > Performance: DEPTH OF FIELD and AMBIENT OCCLUSION.
   Nov 8, round 2 (Hakan: "it looks weird"): AO was drawing dark bands beside walls and lines along every terrain facet, and the blur reached the fence
   a few car lengths away. AO now only marks real creases close to the car, with a small radius; the blur starts at 70 m and stays light. ===== */
(function post(){
'use strict';
const P=window.PT8;if(!P||typeof THREE==='undefined'||typeof R==='undefined')return;
const O=()=>window.PTO||{};
const dofOn=()=>O().dof!==false&&!(P.fxShed>=2),aoOn=()=>O().ao!==false&&!(P.fxShed>=1);
/* Nov 9: sun glare (lens flare when you face the sun) and a soft bloom on the brightest parts; PTO.glare===false turns both off */
const glOn=()=>O().glare!==false&&!(P.fxShed>=3);
let rt=null,qa=null,qb=null,qc=null,qd=null,Q=null;const SP=new THREE.Vector3();const V4=new THREE.Vector4(),V2=new THREE.Vector2(),CW=new THREE.Vector3();
const VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
const LZ='float lz(vec2 uv){float d=texture2D(tD,uv).x;return cn*cf/(cf-d*(cf-cn));}';
function init(){const sc=new THREE.Scene(),cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1),q=new THREE.Mesh(new THREE.PlaneGeometry(2,2));q.frustumCulled=false;sc.add(q);
 /* far-weighted blur: near (sharp) pixels barely feed the blur, so the car doesn't smear a halo into the background around it */
 const blur=new THREE.ShaderMaterial({uniforms:{tC:{value:null},tD:{value:null},dir:{value:new THREE.Vector2()},cn:{value:.1},cf:{value:1000},f0:{value:40},f1:{value:250},w:{value:0}},vertexShader:VS,
  fragmentShader:`uniform sampler2D tC,tD;uniform vec2 dir;uniform float cn,cf,f0,f1,w;varying vec2 vUv;${LZ}
  void main(){vec3 s=vec3(0.);float t=0.;for(int i=-4;i<=4;i++){float fi=float(i);vec2 u=vUv+dir*fi;float k=exp(-fi*fi/8.);if(w>.5)k*=.03+smoothstep(f0,f1,lz(u));s+=texture2D(tC,u).rgb*k;t+=k;}gl_FragColor=vec4(s/t,1.);}`,depthTest:false,depthWrite:false,toneMapped:false});
 const bright=new THREE.ShaderMaterial({uniforms:{tC:{value:null},thr:{value:.9}},vertexShader:VS,fragmentShader:`uniform sampler2D tC;uniform float thr;varying vec2 vUv;void main(){vec3 c=texture2D(tC,vUv).rgb;float l=max(c.r,max(c.g,c.b));float k=clamp((l-thr)/(1.-thr+.0001),0.,1.);gl_FragColor=vec4(c*k*k,1.);}`,depthTest:false,depthWrite:false,toneMapped:false});
 const comp=new THREE.ShaderMaterial({uniforms:{tC:{value:null},tD:{value:null},tB:{value:null},tBl:{value:null},blK:{value:0},sunP:{value:new THREE.Vector2()},sunV:{value:0},sunCol:{value:new THREE.Color()},asp:{value:1.7},px:{value:new THREE.Vector2()},cn:{value:.1},cf:{value:1000},f0:{value:40},f1:{value:250},dofK:{value:.7},aoK:{value:.5},ray:{value:0},ocK:{value:0},sunR:{value:new THREE.Vector2()},
  hz:{value:.0035},hzK:{value:.3},hzC:{value:new THREE.Color()},sunC:{value:new THREE.Color()},sunD:{value:new THREE.Vector3(0,1,0)},pInv:{value:new THREE.Matrix4()},cW:{value:new THREE.Matrix4()}},vertexShader:VS,
  fragmentShader:`uniform sampler2D tC,tD,tB,tBl;uniform vec2 px,sunP;uniform float cn,cf,f0,f1,dofK,aoK,hz,hzK,blK,sunV,asp,ray,ocK;uniform vec2 sunR;uniform vec3 hzC,sunC,sunD,sunCol;uniform mat4 pInv,cW;varying vec2 vUv;${LZ}
  float sunVis(){float v=0.;for(int i=0;i<9;i++){float a=float(i)*2.39996;vec2 o=vec2(cos(a),sin(a))*px*(2.+float(i)*2.2);v+=step(.99999,texture2D(tD,sunP+o).x);}return v/9.;}
  vec3 ghost(vec2 uv,float k,float rad,vec3 col){vec2 g=sunP+(vec2(.5)-sunP)*k;float d=length((uv-g)*vec2(asp,1.));return col*smoothstep(rad,rad*.55,d)+col*.6*exp(-pow((d-rad)*90.,2.));}
  void main(){vec2 uv=vUv;vec3 c=texture2D(tC,uv).rgb;float d=texture2D(tD,uv).x;float z=lz(uv);bool sky=d>.99999;
   if(aoK>0.&&!sky){float ic=1./z,occ=0.,r=clamp(40./z,1.5,8.),rng=.35+z*.06;
    for(int i=0;i<6;i++){float fi=float(i),a=fi*.5236+.17;vec2 o=vec2(cos(a),sin(a))*px*r*(.45+.55*fract(fi*.618+.3));
     float za=lz(uv+o),zb=lz(uv-o);if(abs(za-z)>rng||abs(zb-z)>rng)continue;float m=(1./za+1./zb)*.5;occ+=clamp(((m-ic)/ic-.02)*9.,0.,1.);}
    c*=1.-aoK*min(1.,occ/6.*1.3)*(1.-smoothstep(25.,60.,z));}
   if(dofK>0.){float k=smoothstep(f0,f1,z)*dofK;c=mix(c,texture2D(tB,uv).rgb,k);}
   if(hzK>0.){vec4 vp=pInv*vec4(uv*2.-1.,1.,1.);vec3 vd=normalize((cW*vec4(normalize(vp.xyz/vp.w),0.)).xyz);float s=max(0.,dot(vd,sunD));
    vec3 h=hzC+sunC*(pow(s,6.)*.45+pow(s,40.)*.4);float f=sky?pow(s,6.)*.25:(1.-exp(-z*hz))*hzK;c=mix(c,h,clamp(f,0.,1.));}
   if(blK>0.)c+=texture2D(tBl,uv).rgb*blK;
   /* Nov 9 (Hakan: "if it is sunny, there should be sun rays"): light shafts. March from the pixel toward the sun on screen and count the
      open sky on the way (depth = far plane), weighted toward the sun, so trees, hills and buildings cut dark shafts through the glow */
   if(ray>0.){vec2 dl=(sunR-uv);float n=0.,w=1.,tw=0.;float jit=fract(sin(dot(uv,vec2(12.9898,78.233)))*43758.5453);vec2 st=dl/24.;vec2 p=uv+st*jit;
    for(int i=0;i<24;i++){n+=step(.99999,texture2D(tD,clamp(p,0.,1.)).x)*w;tw+=w;w*=.94;p+=st;}
    float fall=exp(-length(dl*vec2(asp,1.))*2.2);c+=sunCol*(n/tw)*fall*ray;}
   /* overcast: a darker, flatter, cooler day */
   if(ocK>0.){float l=dot(c,vec3(.2126,.7152,.0722));c=mix(c,vec3(l)*vec3(.94,.98,1.04),.22*ocK);c*=1.-.2*ocK;c=mix(c,c*c*1.35,.18*ocK);}
   /* sun glare: a soft halo and a thin horizontal streak around the sun, a ring, ghosts mirrored through the middle of the frame (the
      reflections between lens elements), and a veil of light over the whole picture when you look into it. All of it scaled by how much of
      the sun is actually visible (the depth around it reads as open sky) */
   if(sunV>0.){float vis=sunVis()*sunV;if(vis>0.){vec2 dv=(uv-sunP)*vec2(asp,1.);float r=length(dv);
    vec3 g=sunCol*(exp(-r*9.)*.2+exp(-r*r*1400.)*.7+exp(-abs(dv.y)*260.)*exp(-abs(dv.x)*3.2)*.26);
    g+=vec3(.9,.55,.35)*exp(-pow((r-.21)*55.,2.))*.05+vec3(.35,.6,1.)*exp(-pow((r-.225)*55.,2.))*.05;
    g+=ghost(uv,.55,.035,vec3(.20,.32,.24)*.35)+ghost(uv,.9,.018,vec3(.40,.30,.18)*.4)+ghost(uv,1.25,.07,vec3(.12,.18,.34)*.28)+ghost(uv,1.6,.028,vec3(.36,.22,.40)*.32)+ghost(uv,2.05,.1,vec3(.20,.26,.30)*.18);
    float face=1.-smoothstep(0.,.75,length((sunP-.5)*vec2(asp,1.)));
    c=c+g*vis+sunCol*vis*face*.04;c=mix(c,c*.92+sunCol*.08,vis*face*.15);}}
   gl_FragColor=vec4(c,1.);}`,depthTest:false,depthWrite:false,toneMapped:false});
 Q={sc,cam,q,blur,comp,bright}}
function size(W,H){if(rt&&rt.width===W&&rt.height===H)return;for(const r of[rt,qa,qb,qc,qd])if(r){if(r.depthTexture)r.depthTexture.dispose();r.dispose()}
 rt=new THREE.WebGLRenderTarget(W,H,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,generateMipmaps:false,stencilBuffer:false});rt.texture.encoding=R.outputEncoding;
 rt.depthTexture=new THREE.DepthTexture(W,H);rt.depthTexture.type=THREE.UnsignedIntType;
 const w=Math.max(32,W>>2),h=Math.max(18,H>>2),o={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,generateMipmaps:false,depthBuffer:false};qa=new THREE.WebGLRenderTarget(w,h,o);qb=new THREE.WebGLRenderTarget(w,h,o);qc=new THREE.WebGLRenderTarget(w,h,o);qd=new THREE.WebGLRenderTarget(w,h,o)}
const lin2srgb=c=>c.clone().convertLinearToSRGB();
const prev=R.render.bind(R);
function want(scene,cam){if(!(dofOn()||aoOn()||glOn()))return false;if(typeof scr==='undefined'||scr!=='game'||typeof RACE==='undefined'||!RACE||scene!==RACE.scene||!cam||!cam.isPerspectiveCamera)return false;
 if(R.getRenderTarget()!==null||document.body.classList.contains('studio'))return false;
 if(RACE.cars.filter(c=>c.human).length!==1)return false;
 R.getViewport(V4);R.getDrawingBufferSize(V2);const pr=R.getPixelRatio()||1;return Math.abs(V4.z*pr-V2.x)<2&&Math.abs(V4.w*pr-V2.y)<2&&V4.x<1&&V4.y<1}
let bad=0;
R.render=function(scene,cam){if(bad>3||!want(scene,cam))return prev(scene,cam);
 try{if(!Q)init();R.getDrawingBufferSize(V2);const W=V2.x|0,H=V2.y|0;size(W,H);
  R.setRenderTarget(rt);R.clear();prev(scene,cam);
  /* focus: the distance to the player's car */
  const me=RACE.cars.find(c=>c.human),fd=me&&me.m&&me.m.g?cam.position.distanceTo(me.m.g.position):10,f0=Math.max(70,fd*7),f1=Math.max(320,fd*30),cn=cam.near,cf=cam.far;
  const D=dofOn();
  if(D){const b=Q.blur,u=b.uniforms;u.tD.value=rt.depthTexture;u.cn.value=cn;u.cf.value=cf;u.f0.value=f0;u.f1.value=f1;Q.q.material=b;
   u.tC.value=rt.texture;u.w.value=1;u.dir.value.set(1.5/W*4,0);R.setRenderTarget(qa);prev(Q.sc,Q.cam);
   u.tC.value=qa.texture;u.w.value=0;u.dir.value.set(0,1.5/H*4);R.setRenderTarget(qb);prev(Q.sc,Q.cam);
   u.tC.value=qb.texture;u.dir.value.set(2.5/W*4,0);R.setRenderTarget(qa);prev(Q.sc,Q.cam);
   u.tC.value=qa.texture;u.dir.value.set(0,2.5/H*4);R.setRenderTarget(qb);prev(Q.sc,Q.cam)}
  /* bloom: the brightest parts, quarter size, blurred twice */
  const G=glOn();if(G){const b=Q.bright;b.uniforms.tC.value=rt.texture;Q.q.material=b;R.setRenderTarget(qc);prev(Q.sc,Q.cam);
   const bl=Q.blur,bu=bl.uniforms;bu.w.value=0;Q.q.material=bl;for(const k of[1.5,3]){bu.tC.value=qc.texture;bu.dir.value.set(k/W*4,0);R.setRenderTarget(qd);prev(Q.sc,Q.cam);bu.tC.value=qd.texture;bu.dir.value.set(0,k/H*4);R.setRenderTarget(qc);prev(Q.sc,Q.cam)}}
  const c=Q.comp,u=c.uniforms;u.tC.value=rt.texture;u.tD.value=rt.depthTexture;u.tB.value=qb?qb.texture:rt.texture;u.px.value.set(1/W,1/H);u.cn.value=cn;u.cf.value=cf;u.f0.value=f0;u.f1.value=f1;
  u.dofK.value=D?.5:0;u.aoK.value=aoOn()?.4:0;
  /* the haze: the fog colour, warmed toward the sun */
  const sun=scene.userData.sun,fog=scene.fog,night=scene.userData.tod==='night';
  if(fog&&fog.color){u.hzC.value.copy(lin2srgb(fog.color));u.hzK.value=night?.08:.12;u.hz.value=fog.isFog?Math.min(.01,2.2/Math.max(200,fog.far)):.004}else u.hzK.value=0;
  if(sun){u.sunC.value.copy(lin2srgb(sun.color)).multiplyScalar(night?.15:Math.min(1,.45*sun.intensity));CW.copy(sun.position).sub(sun.target.position).normalize();u.sunD.value.copy(CW)}else u.sunC.value.setRGB(0,0,0);
  cam.updateMatrixWorld();u.pInv.value.copy(cam.projectionMatrixInverse);u.cW.value.copy(cam.matrixWorld);
  /* the day's mood: overcast (heavy cloud on the map, or rain, storm, fog) or sunny (clear sky, sun up) */
  const sx=scene.userData.skyx,cov=sx&&sx.uniforms?sx.uniforms.cov.value:.35,wx=P.wxOf?P.wxOf(RACE):null,oc=night?0:Math.max(wx?1:0,Math.min(1,Math.max(0,(cov-.45)/.2))),sunny=night||!sun?0:(1-oc)*Math.min(1,Math.max(0,(sun.position.y-sun.target.position.y)/Math.max(1,sun.position.distanceTo(sun.target.position))*4));
  u.ocK.value=O().mood===false?0:oc;Q.bright.uniforms.thr.value=.9-.08*sunny;
  u.tBl.value=qc.texture;u.blK.value=G?(night?.35:.16+.1*sunny-.08*oc):0;u.asp.value=W/H;u.sunV.value=0;u.ray.value=0;u.aoK.value=aoOn()?.4+.25*oc:0;
  if(G&&sun&&!night&&sunny>0){const sp=CW.clone().multiplyScalar(1000).add(cam.position).project(cam),fw=CW.dot(new THREE.Vector3(0,0,-1).applyQuaternion(cam.quaternion));
   if(fw>.05&&Math.abs(sp.x)<2.2&&Math.abs(sp.y)<2.2){u.sunR.value.set(sp.x*.5+.5,sp.y*.5+.5);u.ray.value=.26*sunny*Math.min(1,fw*3)*(1-Math.max(0,Math.max(Math.abs(sp.x),Math.abs(sp.y))-1)/1.2);if(!u.sunV.value)u.sunCol.value.copy(lin2srgb(sun.color)).lerp(new THREE.Color(1,1,1),.35)}}
  if(G&&sun&&!night){SP.copy(CW);const el=SP.y;SP.multiplyScalar(1000).add(cam.position);SP.project(cam);const fwd=CW.dot(new THREE.Vector3(0,0,-1).applyQuaternion(cam.quaternion));
   if(fwd>0&&el>-.03&&Math.abs(SP.x)<1.25&&Math.abs(SP.y)<1.25){u.sunP.value.set(SP.x*.5+.5,SP.y*.5+.5);const edge=1-Math.max(0,Math.max(Math.abs(SP.x),Math.abs(SP.y))-.9)/.35;
    u.sunV.value=Math.max(0,edge)*Math.min(1,(el+.03)/.08)*(scene.fog&&scene.fog.far<500?.6:1);u.sunCol.value.copy(lin2srgb(sun.color)).lerp(new THREE.Color(1,1,1),.35)}}
  Q.q.material=c;R.setRenderTarget(null);prev(Q.sc,Q.cam);bad=0}
 catch(e){bad++;console.warn('post',e);R.setRenderTarget(null);return prev(scene,cam)}};
})();
