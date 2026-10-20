from shot import run,W
js="""(()=>{const o={};const ids=PT8.CARS.filter(c=>!c.barn).map(c=>c.id);
const reg=ids.map(i=>PT8.GT(PT8.BYID[i]).length);o.regSet=[...new Set(reg)].join(',');
PT8.launch({mode:'rally',track:10,laps:1,humans:[{id:'ford',alt:0,name:'T'}],ai:[],tod:'day',weather:'clear'});
const ral=PT8.CARS.filter(c=>PT8.RALLY_CARS.includes(c.id)).map(c=>c.id+':'+PT8.GT(c).length+'/'+c.real);o.rally=ral.join(' ');
const miss=PT8.CARS.filter(c=>!c.barn&&PT8.GT(c).length!==(c.real||6)&&(PT8.RALLY_CARS.includes(c.id))).map(c=>c.id);o.rallyMismatch=miss.join(',');
return JSON.stringify(o)})()"""
js2="""(()=>{PT8.launch({mode:'ta',track:0,laps:1,humans:[{id:'c9',alt:0,name:'T'}],ai:[],tod:'day'});const o={};o.regAfter=[...new Set(PT8.CARS.filter(c=>!c.barn).map(c=>PT8.GT(c).length))].join(',');
PT8._to=true;PT8.launch({mode:'rally',circuit:true,track:14,laps:1,humans:[{id:'c9',alt:0,name:'T'}],ai:[],tod:'day'});
o.trk=PT8.TRACK_CARS.map(i=>i+':'+PT8.GT(PT8.BYID[i]).length+'/'+PT8.BYID[i].real).join(' ');return JSON.stringify(o)})()"""
run(W+'/Poly-Tourismo.html',[('wait',2500),('js',js),('wait',1500),('js',js2)],'gr1')
