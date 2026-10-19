from shot import run,W
steps=[('wait',1500),('js',"(()=>{const sv=PT8.SV();for(const c of Object.keys(PT8.BYID))sv.owned[c]=1;PT8.ui.openShow('garage',{player:0,cap:null,ret:'menu'});return 1})()"),('wait',1000),('click','#shLv'),('wait',400),
('click','.lvpre [data-i="10"]')]
for ang,nm in [(1.57,'right'),(-1.57,'left'),(3.14,'rear'),(0,'front')]:
    steps+=[('js',"(()=>{PT8.ui.SR.ang=%s;PT8.ui.SR.vel=0;PT8.ui.SR.drag=true;return 1})()"%ang),('wait',400),('shot',nm)]
steps+=[('click','.lvpg [data-i="9"]'),('js',"(()=>{PT8.ui.SR.ang=1.57;PT8.ui.SR.drag=true;return 1})()"),('wait',400),('shot','flameR'),('js',"(()=>{PT8.ui.SR.ang=-1.57;return 1})()"),('wait',300),('shot','flameL')]
run(W+'/Poly-Tourismo.html',steps,'liv6')
from PIL import Image
n=['right','left','rear','front','flameR','flameL']
ims=[Image.open('out/liv6_%s.png'%i).crop((300,220,960,540)).resize((560,271)) for i in n]
sh=Image.new('RGB',(1120,271*3))
for i,im in enumerate(ims): sh.paste(im,((i%2)*560,(i//2)*271))
sh.save('out/liv6_sheet.png')
