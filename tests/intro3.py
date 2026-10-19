from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1500),('js',"(()=>{document.querySelector('.card[data-m=rally]').click();return 1})()"),('wait',250),('shot','i1'),('wait',1500),('shot','i2'),('wait',9000),('js',"(()=>[document.getElementById('rlLoad').className,document.getElementById('s8setup').className])()")]
run(W+'/Poly-Tourismo.html',st,'intro3')
