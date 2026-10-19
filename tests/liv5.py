from shot import run,W
steps=[('wait',1500),('js',"(()=>{const sv=PT8.SV();for(const c of Object.keys(PT8.BYID))sv.owned[c]=1;PT8.ui.openShow('garage',{player:0,cap:null,ret:'menu'});return 1})()"),('wait',1000),('click','#shLv'),('wait',400),
('click','.lvpre [data-i="0"]'),('js',"(()=>{PT8.ui.SR.ang=1.45;PT8.ui.SR.vel=0;PT8.ui.SR.drag=true;document.querySelector('.hdr').style.display='none';return 1})()")]
for i in range(16):
    steps+=[('click','.lvpg [data-i="%d"]'%i),('js',"(()=>{PT8.ui.SR.ang=1.1;PT8.ui.SR.vel=0;PT8.ui.SR.drag=true;return 1})()"),('wait',350),('shot','pat%02d'%i)]
run(W+'/Poly-Tourismo.html',steps,'liv5')
from PIL import Image
ims=[Image.open('out/liv5_pat%02d.png'%i).crop((330,230,960,520)).resize((420,193)) for i in range(16)]
sheet=Image.new('RGB',(420*4,193*4))
for i,im in enumerate(ims): sheet.paste(im,((i%4)*420,(i//4)*193))
sheet.save('out/liv5_sheet.png')
