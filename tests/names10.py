from shot import run,W
js="""(()=>{const bad=[];for(const c of PT8.SORTED){const k=c.k10;if(k==null){bad.push('nok:'+c.id);continue}if(c.body!==k*2||c.alt!==k*2+1)bad.push(c.id+' body '+c.body+' k'+k);if(PT8.modelOf(c.id,0)!==c.body)bad.push('model '+c.id)}
return [PT8.SORTED.length,bad.join(' ; '),PT8.SORTED.slice(0,20).map(c=>c.id+'='+c.name+'#'+c.k10).join(' | ')]})()"""
run(W+'/Poly-Tourismo.html',[('wait',2500),('js',js)],'nm10')
