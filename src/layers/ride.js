/* ===== Poly GT layer: ride (the visible tyres sit on the road; no hover gap) ===== */
(function(){
/* the body is placed from the model's bounding box, which leaves the split wheels 5-10 cm above the surface. That gap belongs to the model,
   not to the road, so it is measured once per car (standing still on the road, all four wheels down) and then applied as a fixed drop of the
   body, wheels and exhaust. A fixed offset cannot react to slopes or bumps, so the car never bobs. */
const uv=updateVisual,wp=new THREE.Vector3();
updateVisual=(c,T,t)=>{uv(c,T,t);try{const m=c.m,W=m.ptWheels;if(!W||!m.visualModel||!T||!T.surf)return;
 if(m._ride==null){let nG=0;for(const w of m.wheels)if(w.g)nG++;
  if(nG===4&&(c.sp||0)<1){let mn=1e9,mx=-1e9,sum=0,road=true;
   for(const w of W){w.pivot.getWorldPosition(wp);const s=T.surf(wp.x,wp.z,c.y);if(!s.road)road=false;const gap=wp.y-w.radius-s.h;mn=Math.min(mn,gap);mx=Math.max(mx,gap);sum+=gap}
   if(road&&mx-mn<.06)m._ride=Math.max(-.2,Math.min(.05,-sum/4+.005))}}
 /* the base lifts the body whenever a body corner would dip under the surface; that lift jumped from frame to frame on the real hills
    (and by up to a metre when a corner sampled the bank beside the road). Keep it, but capped and eased, so the body glides instead of bobbing */
 {const base=-.72+m.visualHeight/2,lift=Math.min(.3,Math.max(0,m.visualModel.position.y-base));c._lift=c._lift==null?lift:c._lift+(lift-c._lift)*(lift>c._lift?.25:.1);m.visualModel.position.y=base+c._lift;if(m.ptRig&&m.ptBase!=null)m.ptRig.position.y=m.visualModel.position.y-m.ptBase;if(m.exhaustRig)m.exhaustRig.position.y=m.visualModel.position.y}
 const d=m._ride||0;if(d){m.visualModel.position.y+=d;if(m.ptRig)m.ptRig.position.y+=d;if(m.exhaustRig)m.exhaustRig.position.y+=d}
 /* (removed: a per-frame low-pass clamped to 7 cm here saturated on every climb and dip at speed and snapped back, which was the hill
    jitter; the body attitude is already smoothed in clean.js and extra.js, and the physics height is smooth) */
}catch(e){}};
})();
