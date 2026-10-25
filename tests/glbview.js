const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const pg=await b.newPage({viewport:{width:900,height:500}});
 const three=fs.readFileSync('/home/claude/polytourismo/node_modules/three/build/three.min.js','utf8'),gl=fs.readFileSync('/home/claude/polytourismo/node_modules/three/examples/js/loaders/GLTFLoader.js','utf8');
 pg.on('console',m=>console.log(m.text()));
 await pg.setContent('<body style="margin:0"><script>'+three+'</script><script>'+gl+'</script></body>');
 for(const f of process.argv.slice(2)){const b64=fs.readFileSync(f).toString('base64'),tx=fs.readFileSync(require('path').dirname(f)+'/Textures/colormap.png').toString('base64');
  const r=await pg.evaluate(async([b64,tx])=>{const mg=new THREE.LoadingManager();mg.setURLModifier(u=>u.includes('colormap')?'data:image/png;base64,'+tx:u);const R=new THREE.WebGLRenderer();R.setSize(900,500);document.body.innerHTML='';document.body.appendChild(R.domElement);R.outputEncoding=THREE.sRGBEncoding;
   const buf=Uint8Array.from(atob(b64),c=>c.charCodeAt(0)).buffer;const g=await new Promise((res,rej)=>new THREE.GLTFLoader(mg).parse(buf,'',res,rej));const sc=new THREE.Scene();sc.background=new THREE.Color(0xbfd4e6);sc.add(new THREE.HemisphereLight(0xffffff,0x667766,1));const d=new THREE.DirectionalLight(0xffffff,1);d.position.set(3,5,2);sc.add(d);sc.add(g.scene);
   const bb=new THREE.Box3().setFromObject(g.scene),c=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3());const cam=new THREE.PerspectiveCamera(40,1.8,.01,100);const m=Math.max(sz.x,sz.y,sz.z);cam.position.set(c.x+m*.9,c.y+m*.7,c.z+m*1.2);cam.lookAt(c);await new Promise(r=>setTimeout(r,800));R.render(sc,cam);
   const names=[];g.scene.traverse(o=>{if(o.isMesh)names.push(o.name)});return JSON.stringify({sz,names:names.slice(0,20)})},[b64,tx]);console.log(f,r);
  await pg.screenshot({path:f.replace(/.*\//,process.env.OUT+'/')+'.png'})}
 await b.close()})();
