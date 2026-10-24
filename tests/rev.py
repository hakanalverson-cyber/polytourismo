from shot import run,W
def at(t): return "(()=>{PT8.revFix=1;PT8.revSet(%s);return 1})()"%t
steps=[('wait',9000),('js',"(()=>{document.getElementById('ptTitle').click();return 1})()"),('wait',3000),
('js',"(()=>{PT8.SV().cr=999999;[...document.querySelectorAll('button')].find(x=>/Brand Central/.test(x.textContent)).click();return 1})()"),('wait',2500),
('js',"(()=>{PT8.revStart();PT8.revFix=1;return 1})()"),
('js',at(1.2)),('wait',1500),('shot','v1'),('js',at(2.4)),('wait',1500),('shot','v2'),('js',at(3.1)),('wait',1500),('shot','v3'),('js',at(3.55)),('wait',1500),('shot','v4')]
run(W+'/Poly-Tourismo.html',steps,'rev')
