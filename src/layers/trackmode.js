/* ===== Poly Tourismo v9 layer: trackmode (circuit cars + free garage for the Track mode, mirrors rally's fleet) ===== */
(function v9trackmode(){
'use strict';
const P=window.PT8;
/* the Track fleet: every circuit-category car, free to use inside the Track garage */
P.TRACK_CARS=P.CARS.filter(c=>c.cat==='TRACK'&&!c.rallyOnly).map(c=>c.id);
P.CARS.forEach(c=>{c.tdiv=P.TRACK_CARS.includes(c.id)?(c.cls==='S'?'PRO':'CLUB'):null});
const ow1=P.owns;P.owns=(id,alt)=>P._to&&P.TRACK_CARS.includes(id)&&!alt?true:ow1(id,alt);
P.trackSel=p=>{const sv=P.SV();sv.tsel=sv.tsel||[];let s=sv.tsel[p];if(!s||!P.TRACK_CARS.includes(s.id))s=sv.tsel[p]={id:P.TRACK_CARS[p%P.TRACK_CARS.length],alt:0};return s};
})();
