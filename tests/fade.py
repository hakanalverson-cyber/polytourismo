from shot import run,W
js="""(async()=>{const o=[];let opened=0;PT8.rallyIntro(()=>{opened++},null,{noStage:1});const e=document.getElementById('rlFade');
 await new Promise(r=>setTimeout(r,600));o.push(['mid',e.style.opacity,opened,!!document.getElementById('rlLoad')&&getComputedStyle(document.getElementById('rlLoad')).display]);
 await new Promise(r=>setTimeout(r,2500));o.push(['end',e.style.opacity,e.style.pointerEvents,opened]);return o})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'fade')
