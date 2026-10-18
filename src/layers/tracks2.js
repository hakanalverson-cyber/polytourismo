/* ===== Poly Tourismo v9 layer: tracks2 (Coastal Run, Harbor Lights, Frostline Stage) ===== */
(function v9tracks2(){
'use strict';
const P=window.PT8;
/* new tracks borrow an existing world "look" (terrain palette, scenery, panorama) through d.look */
const coast={id:7,look:0,name:'Coastal Run',desc:'sea cliffs / sweepers / sunset',hw:8,bank:10,off:'grass',idw:.95,offs:0,amp:2.5,up:-46,shoulder:8,
 sky:[0x4f86c8,0xf2c9a0],fog:0xe8c7a8,sun:0xffd9a8,hemi:[0xd8e4f0,0x5e6a5a],road:'#34363b',sea:1,tod0:'sunset',
 pts:[[-300,-120,18],[-230,-190,22],[-120,-215,26],[-10,-185,30],[80,-210,34],[185,-240,30],[290,-200,22],[345,-110,14],[310,-20,10],[220,30,12],[130,10,16],[60,60,20],[90,140,16],[190,185,10],[260,250,8],[180,300,8],[60,285,12],[-60,240,18],[-150,170,22],[-170,80,24],[-250,60,22],[-320,0,20]]};
const docks=Object.assign({},D[3],{id:8,look:3,name:'Harbor Lights',desc:'dockside blocks / hairpin / chicane',tod0:'night',boost:[],jumps:[],
 pts:[[-250,-180,0],[-100,-200,0],[60,-190,0],[200,-210,0],[290,-150,0],[300,-40,0],[230,10,0],[130,-20,0],[60,40,0],[110,120,0],[230,150,0],[290,220,0],[210,285,0],[60,270,0],[-70,230,0],[-100,150,0],[-200,130,0],[-290,70,0],[-300,-50,0]]});
const frost={id:9,look:4,name:'Frostline Stage',desc:'frozen forest / ice ruts / hairpins',hw:5.5,bank:8,shoulder:6,gravel:1,ice:[],walls:[],boost:[],off:'snow',idw:.86,offs:0,amp:6.5,up:36,biome:'forest',frost:1,tod0:'dawn',
 sky:[0x8fb0d0,0xe9f1f8],fog:0xd6e3ee,sun:0xfff4e0,hemi:[0xe6f0fa,0x7a8a9a],road:'#a3a9b0',dust:0xf2f6fa,dirt:0xdfe6ee,
 pts:[[-120,-240,10],[0,-255,14],[110,-225,22],[200,-250,30],[290,-190,36],[310,-100,30],[250,-40,24],[160,-70,28],[100,-10,34],[150,60,40],[250,90,36],[300,160,28],[250,230,20],[150,250,14],[60,200,10],[-30,240,6],[-120,215,8],[-190,150,14],[-140,80,20],[-210,20,26],[-290,-30,22],[-290,-120,16],[-220,-190,12]],tunnels:0};
D.push(coast,docks,frost);
[7,9].forEach(i=>{const j=P.pickJumps(D[i],1,i===9?{l:50,a:.75,t:1.6,r:100,f:.12}:undefined);D[i].jumps=j.length?j:[]});
D[8].jumps=[];
/* snowier gravel stage: bigger hills like the other rally stages */
{const p=D[9].pts,mean=p.reduce((a,q)=>a+q[2],0)/p.length;p.forEach(q=>{q[2]=+(mean+(q[2]-mean)*1.25).toFixed(1)});D[9].up=Math.round(D[9].up*1.15)}
P.TRACK_INFO.push({s:'TARMAC',tags:['SEA CLIFFS','SWEEPERS','SUNSET']},{s:'TARMAC',tags:['DOCKSIDE','HAIRPIN','NIGHT']},{s:'GRAVEL',tags:['SNOW','HAIRPINS','CRESTS']});

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
Object.assign(P.MEDAL_REF,{7:67.3,8:64.6,9:81.1,r7:66.6,r8:64.5,r9:78.8});
})();
