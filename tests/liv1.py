from shot import run,W
steps=[('wait',1500),('js',"(()=>{const sv=PT8.SV();for(const c of Object.keys(PT8.BYID))sv.owned[c]=1;PT8.ui.openShow('garage',{player:0,cap:null,ret:'menu'});return 1})()"),('wait',1200),
('click','#shLv'),('wait',800),('shot','a_panel')]
for i in [1,9,12,13]:
    steps+=[('click','.lvpg [data-i="%d"]'%i),('wait',900),('shot','p%d'%i)]
run(W+'/Poly-Tourismo.html',steps,'liv')
