const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:2048,height:2048}});
p.on('console',m=>console.log(m.text()));
await p.goto('http://localhost:8765/r/poly3.html');await p.waitForFunction('window.ready',null,{timeout:600000});
const d=await p.evaluate('window.ortho()');fs.writeFileSync(process.argv[2],Buffer.from(d.split(',')[1],'base64'));await b.close();})();
