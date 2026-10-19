from shot import run,W
steps=[('wait',1500),('js',"(()=>{const sv=PT8.SV();for(const c of Object.keys(PT8.BYID))sv.owned[c]=1;PT8.ui.openShow('garage',{player:0,cap:null,ret:'menu'});return 1})()"),('wait',1000),('click','#shLv'),('wait',500),
('js',"(()=>{PT8.ui.SR.ang=1.57;PT8.ui.SR.vel=0;PT8.ui.SR.drag=true;return 1})()")]
for i in [1,5,9,12]:
    steps+=[('click','.lvpre [data-i="%d"]'%i),('wait',700),('shot','pre%d'%i)]
run(W+'/Poly-Tourismo.html',steps,'liv')
