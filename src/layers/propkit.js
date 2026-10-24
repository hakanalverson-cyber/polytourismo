/* ===== Poly GT layer: propkit (trackside props that look like what they are: grandstands, gazebos, camper vans, paddock cabins, race control) =====
   Low-poly and plain on purpose: a few shaped parts each, flat colours, nothing flashy. Every builder returns a Group standing on y=0,
   facing +z (the track side), so the circuits only have to position and turn it. */
(function(){const P=window.PT8;if(!P)return;
const MC={},mat=(c,o)=>{const k=c+(o?JSON.stringify(o):'');return MC[k]||(MC[k]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:0,flatShading:true},o||{})))};
const add=(g,geo,m,x,y,z,ry)=>{const o=new THREE.Mesh(geo,m);o.position.set(x||0,y||0,z||0);if(ry)o.rotation.y=ry;g.add(o);return o};
const box=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
/* extrude a side profile (x across, y up) along z */
const prism=(pts,len)=>{const s=new THREE.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));const g=new THREE.ExtrudeGeometry(s,{depth:len,bevelEnabled:false});g.translate(0,0,-len/2);return g};

/* grandstand: stepped concrete terrace with a coloured seat strip on every step, back wall, slim columns and a roof sloping to the back.
   len along the track, rows deep; the front edge is at z=0 and it rises away from the track (toward -z) */
P.kitStand=(len,rows,seatCols)=>{const g=new THREE.Group(),D=.9,H=.55,cols=seatCols||[0x2c6cd0,0xd8392f,0xf1f1f1];
 const pr=[[0,0]];for(let r=0;r<rows;r++){pr.push([r*D,(r+1)*H],[(r+1)*D,(r+1)*H])}pr.push([rows*D,0]);
 const terr=add(g,prism(pr.map(p=>[p[0],p[1]]),len),mat(0xb9bcbc));terr.rotation.y=Math.PI/2;/* profile x -> -z */
 for(let r=0;r<rows;r++){const s=add(g,box(len-.6,.32,.42),mat(cols[r%cols.length]),0,(r+1)*H+.16,-(r*D+.55))}
 const top=rows*H,back=-rows*D;
 add(g,box(len,top+3.4,.25),mat(0xd9dcdc),0,(top+3.4)/2,back-.15);
 const nC=Math.max(2,Math.round(len/12));for(let q=0;q<=nC;q++){const x=-len/2+q*len/nC;add(g,box(.22,top+3.6,.22),mat(0x8d949c),x,(top+3.6)/2,back+.2)}
 const roof=add(g,box(len+1.2,.18,rows*D+2.4),mat(0xeef0f0),0,top+3.9,back+rows*D/2-.2);roof.rotation.x=-.08;
 for(const sx of[-1,1])add(g,box(.12,top+3.4,rows*D+.2),mat(0xd9dcdc),sx*len/2,(top+3.4)/2,back/2);/* end walls */
 add(g,box(len,.9,.06),mat(0x6d747a,{metalness:.3}),0,.45+.05,.25);/* front rail */
 return g};

/* gazebo: four poles, a pyramid roof with a short valance; one colour */
P.kitTent=(col,w)=>{const g=new THREE.Group();w=w||3.2;const m=mat(col),pole=mat(0xb8bcc0);
 for(const[x,z]of[[-1,-1],[1,-1],[-1,1],[1,1]])add(g,new THREE.CylinderGeometry(.04,.04,2.2,4),pole,x*w/2*.96,1.1,z*w/2*.96);
 const r=add(g,new THREE.ConeGeometry(w*.72,1.1,4,1,false,Math.PI/4),m,0,2.75);r.scale.set(1,1,1);
 add(g,box(w,.3,w),m,0,2.1);
 return g};

/* camper van: one extruded side profile (sloped bonnet and windscreen, rounded rear), window band, wheels in arches */
P.kitVan=(col)=>{const g=new THREE.Group(),W=2.15,L=5.6;
 const pr=[[-L/2,.45],[L/2-.1,.45],[L/2,.9],[L/2-.25,1.35],[L/2-1.1,2.05],[L/2-1.3,2.75],[-L/2+.25,2.75],[-L/2,2.5]];
 const body=new THREE.Mesh(prism(pr,W),mat(col||0xf1f1f1));body.rotation.y=-Math.PI/2;g.add(body);/* profile x -> z (front at +z) */
 add(g,box(W+.02,.55,L-2.3),mat(0x2a3036),0,2.05,-.55);
 const ws=add(g,box(W-.1,.7,.06),mat(0x2a3036),0,1.75,L/2-1.12);ws.rotation.x=-.55;
 add(g,box(W+.02,.12,L-.2),mat(0x8d949c),0,.95,0);/* trim line */
 const wg=new THREE.CylinderGeometry(.37,.37,.26,10);wg.rotateZ(Math.PI/2);for(const[x,z]of[[-1,1.75],[1,1.75],[-1,-1.6],[1,-1.6]])add(g,wg,mat(0x16181b),x*(W/2-.08),.37,z);
 return g};

/* paddock cabin / hospitality unit: walls with a window band and door, roof with an overhang, a striped awning on the track side */
P.kitCabin=(w,d,col,awn)=>{const g=new THREE.Group(),h=3.1;
 add(g,box(w,h,d),mat(col||0xe3e5e2),0,h/2,0);
 add(g,box(w-.6,.9,.05),mat(0x2a3542,{roughness:.3,metalness:.2}),0,h*.62,d/2+.03);
 add(g,box(1,2.1,.05),mat(0x58606a),w*.32,1.05,d/2+.03);
 add(g,box(w+.6,.25,d+.6),mat(0x4a5058),0,h+.12,0);
 if(awn){const a=add(g,box(w-.4,.08,1.6),mat(awn),0,h-.35,d/2+.8);a.rotation.x=.18}
 return g};

/* pit garages: a long low block, one dark roller door per bay facing the track (+z), roof slab with an overhang */
P.kitGarage=(len,d,col)=>{const g=new THREE.Group(),h=4.2;
 add(g,box(len,h,d),mat(col||0xd7d9d4),0,h/2,0);
 const n=Math.max(1,Math.round(len/6));for(let q=0;q<n;q++)add(g,box(len/n-1.4,3,.06),mat(0x3a4048),-len/2+(q+.5)*len/n,1.5,d/2+.03);
 add(g,box(len+.8,.3,d+1.6),mat(0x2c3238),0,h+.15,.4);
 add(g,box(len,.5,.05),mat(0x2c6cd0),0,h-.45,d/2+.03);
 return g};

/* marshal post: small hut with a window and a pitched roof */
P.kitHut=(col)=>{const g=new THREE.Group();
 add(g,box(2,2.2,2),mat(col||0xf2c76b),0,1.1,0);
 add(g,box(1.4,.7,.05),mat(0x2a3542,{roughness:.3}),0,1.45,1.03);
 const r=add(g,prism([[-1.25,0],[1.25,0],[0,.8]],2.5),mat(0xd8392f),0,2.2,0);
 return g};

/* race control tower: concrete shaft, a glass cab wider than the shaft with leaning windows, flat roof */
P.kitTower=(h)=>{const g=new THREE.Group();h=h||18;
 add(g,new THREE.CylinderGeometry(2.2,2.6,h,8),mat(0xd9dcdc),0,h/2);
 add(g,new THREE.CylinderGeometry(4.6,3.6,3.2,8),mat(0x2c3a4a,{roughness:.3,metalness:.25}),0,h+1.6);
 add(g,new THREE.CylinderGeometry(5,5,.5,8),mat(0xf1f1f1),0,h+3.45);
 add(g,new THREE.CylinderGeometry(4.0,4.0,.4,8),mat(0xd8392f),0,h-.1);
 return g};

/* many copies of one kit piece as instanced meshes (one per part): list of [x,y,z,rotY] */
P.kitInstances=(par,tpl,list)=>{if(!list.length)return;tpl.updateMatrixWorld(true);const M=new THREE.Matrix4(),o=new THREE.Object3D();
 tpl.traverse(m=>{if(!m.isMesh)return;const geo=m.geometry.clone().applyMatrix4(m.matrixWorld),im=new THREE.InstancedMesh(geo,m.material,list.length);
  list.forEach((p,i)=>{o.position.set(p[0],p[1],p[2]);o.rotation.set(0,p[3]||0,0);o.scale.setScalar(1);o.updateMatrix();im.setMatrixAt(i,o.matrix)});im.instanceMatrix.needsUpdate=true;par.add(im)})};
P.kitMat=mat;
})();
