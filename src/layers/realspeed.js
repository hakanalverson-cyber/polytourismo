/* ===== Poly Tourismo v9 layer: realspeed (every car runs at its real-world top speed; steering, AI and medals follow) ===== */
(function v9realspeed(){
'use strict';
const P=window.PT8,MPS=2.23694;
/* real top speeds, mph */
const R={ford:158,merc:155,ster:165,art:155,ferr:201,zen:217,must:155,urus:140,m8:201,amg:196,gtr:196,por:175,
c26:155,c50:130,c67:140,c91:112,c93:118,c5:140,c28:120,c32:155,c39:167,c57:155,
c12:155,c18:140,c22:110,c25:130,c40:140,c41:120,c48:156,c55:155,c58:100,c62:115,c83:155,c96:120,c101:146,c111:146,c114:155,c117:125,c121:138,c122:155,
c4:140,c10:140,c14:130,c19:125,c29:130,c31:135,c54:130,c60:140,c64:130,c70:150,c82:165,c87:175,c90:125,c97:165,c110:185,c134:155,
c2:191,c3:155,c6:177,c7:194,c8:165,c11:155,c13:183,c16:160,c20:189,c21:155,c46:198,c47:190,c53:155,c56:155,c59:160,c61:157,c71:155,c79:155,c95:159,c126:155,c128:186,c129:170,c132:155,
c17:177,c27:168,c30:205,c33:202,c34:211,c43:217,c44:183,c66:213,c78:202,c80:181,c85:190,c86:205,c88:205,c94:205,c116:236,c124:248,c125:191,c130:189,c131:125,c135:196,
c1:224,c15:214,c36:245,c37:253,c42:218,c51:137,c52:140,c65:125,c73:236,c75:250,c77:265,c98:280,c104:190,c106:217,c108:125,c120:140,c123:216,c127:221};
const eq=(mph,acc)=>{const v=mph/MPS;let lo=v,hi=v*5;for(let i=0;i<50;i++){const t=(lo+hi)/2,a=.66*acc;let l2=0,h2=t;for(let k=0;k<40;k++){const w=(l2+h2)/2,r=w/t;if(a*P.band(r)*(1-r)>.0007*w*w)l2=w;else h2=w}if(l2>=v)hi=t;else lo=t}return(lo+hi)/2};
P.REALMPH=R;P.topFor=eq;
const ACC={c77:40,c98:46};
P.CARS.forEach(c=>{if(c.mph)return;if(ACC[c.id])c.acc=ACC[c.id];const m=R[c.id];if(!m)return;c.top0=c.top;c.mph=m;c.top=+eq(m,c.acc).toFixed(1)});
P.CARS.forEach(c=>{if(!c.top0)c.top0=c.top});
/* garage and HUD read true per-gear flat-out speeds */
P.gearTops=car=>P.GT(car).map((_,i)=>P.effTop(car,i));
/* gravel stages: cap at 120 mph so a 200 mph car can still read a narrow stage */
const mul0=P.mul;
P.mul=c=>{const m=mul0(c);const Rc=RACE;if(c.human&&Rc&&Rc.cfg&&Rc.cfg.rally&&!Rc.cfg.circuit&&c.cs&&c.cs.mph>120){if(!c.cs._cf)c.cs._cf=eq(120,c.cs.acc)/c.cs.top;m.top*=c.cs._cf}return m};
/* medals: scale by real speed (square root) against a 155 mph reference, gravel capped at 120 */
const mf=P.medalFor,mtm=P.medalTime,MD=P.MEDALS;
const spd=(track,car)=>{const g=P.STAGES&&P.STAGES.indexOf(+String(track).replace('r',''))>=0,cap=g?120:1e9;return[Math.min(P.BYID.merc.mph,cap),Math.min(car.mph||P.BYID.merc.mph,cap)]};
const ref=(track,car)=>{const k=String(track),b=P.MEDAL_REF[k];if(!b)return null;const[a,c]=spd(track,car);return b*Math.pow(a/c,.5)};
const isTrk=track=>(P.TRK_TRACKS||[]).includes(+String(track).replace('r',''));
P.medalFor=(track,car,lap)=>{if(isTrk(track))return mf(track,car,lap);const r=ref(track,car);if(r==null||lap==null)return -1;for(let i=0;i<MD.length;i++)if(lap<=r*MD[i].f)return i;return MD.length};
P.medalTime=(track,car,i)=>{if(isTrk(track))return mtm(track,car,i);const r=ref(track,car);return r==null?null:r*MD[i].f};
/* reference laps were set at the old speeds; these factors (new bot lap / old bot lap) bring them in line */
const CAL={0:.846,1:.844,2:.883,3:.812,4:.917,5:.869,6:.919,7:.853,8:.86,9:.899,10:.919,11:.937,12:.929,13:.875};for(const k in CAL){if(P.MEDAL_REF[k]!=null)P.MEDAL_REF[k]*=CAL[k];if(P.MEDAL_REF['r'+k]!=null)P.MEDAL_REF['r'+k]*=CAL[k]}
})();
