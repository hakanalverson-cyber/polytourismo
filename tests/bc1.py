from shot import run,W
js="""(()=>{const out={};for(const n of ['CompanyBuilding_01','CompanyBuilding_04','ResidentBuilding_04','CommercialBuilding_01','StoreBuilding_01']){const g=PT8.BLD[n].g,c=g.attributes.color,h={};for(let i=0;i<c.count;i++){const k=[c.getX(i),c.getY(i),c.getZ(i)].map(v=>Math.round(v*255/16)*16).join(',');h[k]=(h[k]||0)+1}out[n]=Object.entries(h).sort((a,b)=>b[1]-a[1]).slice(0,7).map(e=>e.join(':')).join(' ')}return JSON.stringify(out,null,1)})()"""
run(W+'/Poly-Tourismo.html',[('wait',2500),('js',js)],'bc')
