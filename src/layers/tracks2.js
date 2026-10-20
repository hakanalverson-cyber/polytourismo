/* ===== Poly Tourismo v9 layer: tracks2 (Coastal Run, Grand Valley, Frostline Stage) ===== */
(function v9tracks2(){
'use strict';
const P=window.PT8;
/* new tracks borrow an existing world "look" (terrain palette, scenery, panorama) through d.look */
const coast={id:7,look:0,name:'Coastal Run',desc:'sea cliffs / sweepers / sunset',hw:8,bank:10,off:'grass',idw:.95,offs:0,amp:2.5,up:-46,shoulder:8,
 sky:[0x4f86c8,0xf2c9a0],fog:0xe8c7a8,sun:0xffd9a8,hemi:[0xd8e4f0,0x5e6a5a],road:'#34363b',sea:1,tod0:'sunset',
 pts:[[-300,-120,18],[-230,-190,22],[-120,-215,26],[-10,-185,30],[80,-210,34],[185,-240,30],[290,-200,22],[345,-110,14],[310,-20,10],[220,30,12],[130,10,16],[60,60,20],[90,140,16],[190,185,10],[260,250,8],[180,300,8],[60,285,12],[-60,240,18],[-150,170,22],[-170,80,24],[-250,60,22],[-320,0,20]]};
/* Grand Valley: control points [x,z,y,halfwidth]. Mainland start, short low suspension bridge, island city streets, then a winding forest valley road home */
const sp=[[-470,30,2],[-420,30,3.2],[-375,30,5],[-330,30,6.4],[-300,30,7.1],[-262,30,7.6],[-200,30,7.7],[-122,30,7.3],[-90,30,5.6],[-70,30,2.8,7.5],
 [-35,30,.8,6.5],[20,30,.8,6.5],[75,30,.8,6.5],[130,42,.8,6.5],[185,80,.8,6.5],[235,100,.8,6.5],[265,60,.8,6.5],[265,5,.8,6.5],[240,-35,.8,6.5],[195,-52,.8,6.5],[150,-28,.8,6.5],[105,-55,.8,6.5],[60,-92,.8,6.5],[10,-100,.8,6.5],[-35,-92,.8,6.5],
 [-75,-92,1.1,6],[-125,-100,1.9,6],[-170,-128,3.2,6],[-195,-175,4.8,6],[-175,-225,6.5,6],[-215,-270,8,6],[-285,-285,8.8,6],[-345,-262,8,6],[-365,-215,6.4,6],[-335,-170,5,6],[-370,-128,4,6],
 [-430,-130,3.4,6],[-490,-165,4.4,6],[-550,-200,6,6],[-615,-190,7,6],[-660,-145,6.2,6],[-665,-90,4.8,6],[-640,-55,3.8,6],[-615,0,3,6],[-570,40,2.4,6],[-520,45,2.1,7.5]];
const span={id:8,name:'Grand Valley',desc:'suspension bridge / island city / forest valley',hw:8,bank:0,off:'city',idw:0,offs:0,amp:0,up:0,shoulder:8,flat:1,allWalls:1,span:1,biome:'harbor',tod0:'day',
 sky:[0x3a82d6,0xb6dcf4],fog:0xbcd6e8,sun:0xfff4de,hemi:[0xdcecff,0x6a6a60],road:'#3b3e44',walls:[],ice:[],boost:[],jumps:[],pts:sp};
const frost={id:9,look:4,name:'Frostline Stage',desc:'frozen forest / ice ruts / hairpins',hw:5.5,bank:8,shoulder:6,gravel:1,ice:[],walls:[],boost:[],off:'snow',idw:.86,offs:0,amp:6.5,up:36,biome:'forest',frost:1,tod0:'dawn',
 sky:[0x8fb0d0,0xe9f1f8],fog:0xd6e3ee,sun:0xfff4e0,hemi:[0xe6f0fa,0x7a8a9a],road:'#a3a9b0',dust:0xf2f6fa,dirt:0xdfe6ee,
 pts:[[-120,-240,10],[0,-255,14],[110,-225,22],[200,-250,30],[290,-190,36],[310,-100,30],[250,-40,24],[160,-70,28],[100,-10,34],[150,60,40],[250,90,36],[300,160,28],[250,230,20],[150,250,14],[60,200,10],[-30,240,6],[-120,215,8],[-190,150,14],[-140,80,20],[-210,20,26],[-290,-30,22],[-290,-120,16],[-220,-190,12]],tunnels:0};
D.push(coast,span,frost);
[7,9].forEach(i=>{const j=P.pickJumps(D[i],1,i===9?{l:50,a:.75,t:1.6,r:100,f:.12}:undefined);D[i].jumps=j.length?j:[]});
/* snowier gravel stage: bigger hills like the other rally stages */
{const p=D[9].pts,mean=p.reduce((a,q)=>a+q[2],0)/p.length;p.forEach(q=>{q[2]=+(mean+(q[2]-mean)*1.25).toFixed(1)});D[9].up=Math.round(D[9].up*1.15)}
P.TRACK_INFO.push({s:'TARMAC',tags:['SEA CLIFFS','SWEEPERS','SUNSET']},{s:'TARMAC',tags:['SUSPENSION BRIDGE','ISLAND CITY','FOREST VALLEY']},{s:'GRAVEL',tags:['SNOW','HAIRPINS','CRESTS']});

/* world decoration: sea for the coast, frost for the stage */
const bw0=buildWorld;
buildWorld=T=>{const sc=bw0(T),d=T.d;
 if(d.sea){const b=T.bounds||[-500,500,-500,500];let lo=1e9;for(let i=0;i<T.N;i+=4)lo=Math.min(lo,T.y[i]);
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(4000,4000),new THREE.MeshStandardMaterial({color:0x2c7fa6,roughness:.35,metalness:.1,flatShading:true}));
  sea.rotation.x=-Math.PI/2;sea.position.set((b[0]+b[1])/2,lo-4,(b[2]+b[3])/2);sc.add(sea);
  /* open horizon: drop the backdrop mountains and the distant cone ring */
  sc.traverse(o=>{const g=o.geometry&&o.geometry.parameters;if(!g)return;if(o.geometry.type==='CylinderGeometry'&&g.radiusTop===1300)o.visible=false;if(o.geometry.type==='ConeGeometry'&&g.radius>=80&&g.height>=60)o.visible=false})}
 if(d.frost){const W=new THREE.Color(.9,.94,.99);
  sc.traverse(o=>{
   if(o.isInstancedMesh&&o.instanceColor){const a=o.instanceColor.array,c=new THREE.Color();for(let i=0;i<a.length;i+=3){c.setRGB(a[i],a[i+1],a[i+2]).lerp(W,.62);a[i]=c.r;a[i+1]=c.g;a[i+2]=c.b}o.instanceColor.needsUpdate=true}
   else if(o.isMesh&&o.geometry&&o.geometry.attributes&&o.geometry.attributes.color&&o.geometry.attributes.position.count>2000){const a=o.geometry.attributes.color.array,c=new THREE.Color();for(let i=0;i<a.length;i+=3){c.setRGB(a[i],a[i+1],a[i+2]).lerp(W,.82);a[i]=c.r;a[i+1]=c.g;a[i+2]=c.b}o.geometry.attributes.color.needsUpdate=true}})}
 return sc};
/* medal references: Mercedes AI first lap (tests/newtracks_laps.py) */
Object.assign(P.MEDAL_REF,{7:67.3,8:74.2,9:81.1,r7:66.6,r8:73.9,r9:78.8});
})();
