/* ===== Poly GT layer: ride (the visible tyres sit on the road; no hover gap) ===== */
(function(){
/* the body is placed from the model's bounding box, which leaves the split wheels 5-10 cm above the surface. Every frame, measure the
   lowest tyre against the ground under it and drop (or raise) the body, wheels and exhaust together by that gap. Airborne cars are left alone. */
const uv=updateVisual,wp=new THREE.Vector3();
updateVisual=(c,T,t)=>{uv(c,T,t);try{const m=c.m,W=m.ptWheels;if(!W||!m.visualModel||!T||!T.surf)return;
 let nG=0;for(const w of m.wheels)if(w.g)nG++;
 if(nG>=2){let mn=1e9;for(const w of W){w.pivot.getWorldPosition(wp);const s=T.surf(wp.x,wp.z,c.y);mn=Math.min(mn,wp.y-w.radius-s.h)}
  if(mn<1e8){const tgt=Math.max(-.25,Math.min(.15,-mn+.005));c._ride=(c._ride||0)+(tgt-(c._ride||0))*.5}}
 else c._ride=(c._ride||0)*.9;
 const d=c._ride||0;m.visualModel.position.y+=d;if(m.ptRig)m.ptRig.position.y+=d;if(m.exhaustRig)m.exhaustRig.position.y+=d}catch(e){}};
})();
