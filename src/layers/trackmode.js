/* ===== Poly Tourismo v9 layer: trackmode (circuit cars, real gearboxes and top speeds; Track runs on the rally pipeline) ===== */
(function v9trackmode(){
'use strict';
const P=window.PT8;
/* the Track fleet: every circuit-category car, free to use inside the Track garage */
P.TRACK_CARS=P.CARS.filter(c=>c.cat==='TRACK'&&!c.rallyOnly).map(c=>c.id);
/* real-world numbers: [top speed mph, accel, grip, brake, forward gears, track-only]
   Track-only "monsters" (race prototypes and GT3 cars) never appear in any other mode. */
const TK={
 p1:[270,44,1.16,1.22,7,1],   /* Bugatti Bolide, 7-speed sequential */
 c35:[240,36,1.15,1.2,6,1],   /* McLaren F1 GTR, 6-speed */
 c63:[220,34,1.13,1.18,5,1],  /* Mazda 787B, 5-speed */
 c24:[203,32,1.1,1.1,6,0],    /* Ferrari 575M, 6-speed */
 c92:[190,33,1.13,1.16,6,1],  /* Audi R8 LMS, 6-speed sequential */
 c45:[186,32,1.12,1.15,6,1],  /* BMW M4 GT3, 6-speed */
 c9:[178,31,1.11,1.14,6,1],   /* BMW M3 GT3, 6-speed */
 c84:[172,30,1.1,1.1,6,0],    /* Toyota Supra JTCC, 6-speed */
 c68:[168,28,1.08,1.08,5,1],  /* BMW M1 Procar, 5-speed */
 c109:[168,30,1.09,1.1,5,0],  /* Acura NSX NA1, 5-speed */
 c102:[165,29,1.09,1.1,5,0],  /* Nissan Skyline GT-R R33, 5-speed */
 c23:[158,27,1.08,1.08,6,0],  /* Mazda RX-8 track spec, 6-speed */
 c107:[145,25,1.06,1.05,6,0]  /* Toyota GT86, 6-speed */
};
const MPS=2.23694;
/* true flat-out speed of a car in a gear: engine pull (with its power band) against drag */
P.effTop=(car,gi)=>{const G=P.GT(car),g=G[Math.max(0,Math.min(gi,G.length-1))],TOP=car.top*g.top,A=car.acc*g.acc;let lo=0,hi=TOP;for(let i=0;i<40;i++){const v=(lo+hi)/2,r=v/TOP;if(A*P.band(r)*(1-r)>.0007*v*v)lo=v;else hi=v}return lo};
/* pick the nominal top that makes the top gear really reach the real-world speed */
const eq=(mph,acc)=>{const v=mph/MPS;let lo=v,hi=v*4;for(let i=0;i<50;i++){const t=(lo+hi)/2,a=.66*acc;let l2=0,h2=t;for(let k=0;k<40;k++){const w=(l2+h2)/2,r=w/t;if(a*P.band(r)*(1-r)>.0007*w*w)l2=w;else h2=w}if(l2>=v)hi=t;else lo=t}return (lo+hi)/2};
P.TRACK_ONLY=[];
P.TRACK_CARS.forEach(id=>{const c=P.BYID[id],t=TK[id];if(!t)return;c._std={top:c.top,acc:c.acc,grip:c.grip,brk:c.brk};c._tk={top:+eq(t[0],t[1]).toFixed(1),acc:t[1],grip:t[2],brk:t[3],mph:t[0]};c.real=t[4];if(P.REALGEARS)P.REALGEARS[id]=t[4];if(t[5]){c.trackOnly=true;P.TRACK_ONLY.push(id)}});
P.CARS.forEach(c=>{c.tdiv=P.TRACK_CARS.includes(c.id)?(c.trackOnly||c.cls==='S'?'PRO':'CLUB'):null});
/* real numbers are permanent now: every car runs at its real-world speed in every mode */
P.TRACK_CARS.forEach(id=>{const c=P.BYID[id];if(c&&c._tk)Object.assign(c,c._tk)});
P._to=false;
const ow1=P.owns;P.owns=(id,alt)=>P._to&&P.TRACK_CARS.includes(id)?true:ow1(id,alt);
P.trackSel=p=>{const sv=P.SV();sv.tsel=sv.tsel||[];let s=sv.tsel[p];if(!s||!(P.TRACK_CARS.includes(s.id)||(sv.owned[s.id]||0)>0))s=sv.tsel[p]={id:P.TRACK_CARS[p%P.TRACK_CARS.length],alt:0};return s};
/* medals follow the car: platinum is the clean-lap pace of a 165 mph car (R33), scaled by real top speed, so every car gets a fair target */
P.MEDAL_REF[14]=91.8;
const mf=P.medalFor,mtm=P.medalTime,MD=P.MEDALS;
const trRef=(track,car)=>{const k=+String(track).replace('r','');if(!(P.TRK_TRACKS||[]).includes(k)||!car||!car._tk)return null;return P.MEDAL_REF[k]*Math.pow(165/car._tk.mph,.35)};
P.medalFor=(track,car,lap)=>{const r=trRef(track,car);if(r==null)return mf(track,car,lap);if(lap==null)return -1;for(let i=0;i<MD.length;i++)if(lap<=r*MD[i].f)return i;return MD.length};
P.medalTime=(track,car,i)=>{const r=trRef(track,car);return r==null?mtm(track,car,i):r*MD[i].f};
/* track-only cars are hidden from every regular fleet */
const mk=P.makeAI;P.makeAI=function(o){const r=mk.apply(this,arguments);return r.map(a=>P.TRACK_ONLY.includes(a.id)?Object.assign(a,{id:'merc'}):a)};
const ll=P.loanerFor;P.loanerFor=function(cap,rally){const c=ll.apply(this,arguments);return c&&c.trackOnly?(P.BYID.merc):c};
})();
