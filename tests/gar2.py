from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1200),
('js',"(()=>{const i=PT8.modelOf('ford',0);const ph=PT7.makePhotos(i);const c=ph[0];const g=document.createElement('canvas');g.width=c.width;g.height=c.height;const x=g.getContext('2d');x.drawImage(c,0,0);const d=x.getImageData(0,0,c.width,c.height).data;const px=n=>[d[n*4],d[n*4+1],d[n*4+2],d[n*4+3]];return JSON.stringify({w:c.width,h:c.height,tl:px(0),mid:px((c.height>>1)*c.width+(c.width>>1)),n:ph.length})})()")]
run(W+'/Poly-Tourismo.html',st,'gar2')
