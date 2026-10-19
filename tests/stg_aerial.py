from shot import run,W
def aer(tr,pos,look,tag,fov=60):
    return [('js',"""(()=>{PT8.launch({mode:'mp',track:%d,laps:2,humans:[{id:'merc',alt:0}],ai:[]});for(let i=0;i<60*4;i++)step(1/60);
 window.__ac=new THREE.PerspectiveCamera(%d,innerWidth/innerHeight,.5,3000);__ac.position.set(%s);__ac.lookAt(%s);window.__go=1;
 const r2=new THREE.WebGLRenderer({antialias:false,preserveDrawingBuffer:true});r2.outputEncoding=THREE.sRGBEncoding;r2.toneMapping=THREE.ACESFilmicToneMapping;r2.toneMappingExposure=1.08;r2.setSize(innerWidth,innerHeight);r2.domElement.style.cssText='position:fixed;left:0;top:0;z-index:99999';document.body.appendChild(r2.domElement);r2.render(FS,__ac);return 1})()"""%(tr,fov,pos,look)),('shot',tag)]
steps=[('wait',800)]
steps+=aer(12,'0,170,330','0,0,0','ash_air')
steps+=aer(10,'-60,60,-120','50,0,-225','man_air')
steps+=aer(11,'-420,120,-330','0,30,0','ter_air',55)
steps+=aer(13,'400,90,60','200,25,60','aut_air')
run(W+'/Poly-Tourismo.html',steps,'air')
