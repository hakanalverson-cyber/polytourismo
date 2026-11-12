/* ===== Poly GT layer: arcade handling (every car mode since Nov 9; was Quickplay only) ===== For the player in these modes:
   - grippier (sideways slip dies out 1.3x faster) and brakes twice as strong
   - the steering reaches the wheel quicker (patched in build.py through PT8.arcSnap)
   - walls take only the speed going into them and turn the car back along the road (patched in build.py through PT8.arcWall) */
(function ptArcade(){
'use strict';
const P=window.PT8;
/* Nov 9 (Hakan: "make every gamemode have the same handling style as the quick play options like elimination and versus, but rally should
   be able to drift some"): this handling is now the player's in every car mode, Track Mode, the model circuits, Rally and Career included.
   The Track Mode grip cap and steering curve (cartoon.js) and the rally tyre model (rally.js) step aside for the player (P.arcHum).
   The SIM option in Options still swaps in sim.js on the circuits for players who pick it. */
P.arcade=()=>{const R=typeof RACE!=='undefined'?RACE:null,f=R&&R.cfg;return !!(f&&!f.free)};
const hu=c=>c&&c.human&&!c.forceAI;
P.arcHum=c=>hu(c)&&P.arcade()&&!(P.simOn&&P.simOn(c));
/* the model tracks are built about 2.4x real size, their dial reads dialK of the physics speed and the cars are drawn VK times bigger.
   The steering here is scaled so that at the same speed on the dial the car turns the same circle, measured in car lengths, as in
   Quick Play: k = sr(u)g(u) / (dialK * VK * sr(v)g(v)), v = physics speed, u = v*dialK (the Quick Play speed with the same dial reading),
   sr = the core's speed-sensitive steering, g = the high-speed calming in rally.js */
const SR=v=>2.25-.033*Math.min(Math.abs(v),42),GS=v=>v>40?Math.pow(40/v,.85):1;
/* Nov 10 (Hakan: "the steering is WAY too sensitive", measured on a straight at 10/18/28/40 m/s with a full-lock tap: 110/95/76/54 deg/s of yaw, 2 to 3.8 g sideways, about 3x what a road car manages): the wheel is scaled by SK(v), a flat 0.4 from 8 m/s up (a full-lock tap now gives about 1.2 to 1.5 g), fading to 0.6 at a crawl so parking turns stay tight. PTO.calmSteer===false puts it back. */
const SK=v=>window.PTO&&window.PTO.calmSteer===false?1:(v<=10?1:.4+.6*Math.exp(-(v-10)/20));/* Nov 11 (Hakan: too little steering at low speed, too much at high): full wheel up to 10 m/s, then a smooth fall to about a third by 55 m/s */
P.loose=c=>{const d=(RACE.T&&RACE.T.d)||{};return d.gravel!==0||c.onRoad===false};/* Nov 11: gravel felt like turning a ship, so loose surfaces get 1.35x the wheel and a higher sideways cap */
/* Nov 11 (Hakan: Quick Play has bad understeer, cut it by 45%): on the road tracks of Quick Play the wheel loss from the speed curve is 55% of what it was and the sideways limit is 45% higher */
const QP0=c=>{const R=typeof RACE!=='undefined'?RACE:null,f=R&&R.cfg;return !!(f&&!f.rally&&!f.circuit&&!f.trackRace&&!(P.trkPhys&&P.trkPhys()))};
const QP=c=>true;/* Nov 11 (Hakan: same handling in every mode, less understeer): applies to Rally and Track as well */
P.arcSteerK=c=>{const dk=P.dialK?P.dialK():1,vk=P.VK?P.VK():1;let k=SK(Math.abs(c.sp||0));if(QP(c))k=1-.55*(1-k);if(dk===1&&vk===1)return k;const v=Math.max(2,c.sp||0),u=v*dk;return k*SR(u)*GS(u)/(dk*vk*SR(v)*GS(v))};
/* rally: some drift. The core's drift mode (grip eased toward 24% of normal at the rear, an assist that holds the slide angle) is started on
   a stage by lifting off or braking into a corner at speed, or by full lock on the power on a loose surface, and lasts while the wheel is
   turned (counter-steer included). Its grip loss is capped at 75% of the full drift and it never pays the drift boost here */
const rallyOn=c=>{const R=typeof RACE!=='undefined'?RACE:null;return !!(R&&R.cfg&&R.cfg.rally&&!R.cfg.circuit&&R.T&&P.arcHum(c))};
const rallyHB=c=>{const i=c.in||{},st=Math.abs(i.st||0),v=c.sp||0;if(v<11)return false;
 if(c.ptDrift)return st>.15||(c.ptNeutral||0)<.25;
 if(v<15||st<.62)return false;const d=RACE.T.d||{},loose=d.gravel!==0||c.onRoad===false;
 return (i.br>0&&v>15)||(!(i.th>0)&&v>17)||(loose&&i.th>0&&st>.9&&v>22)};
setTimeout(()=>{const hb0=window.PT8_HB;window.PT8_HB=c=>rallyOn(c)?rallyHB(c):hb0?hb0(c):false},0);
/* sideways pull is capped for the player (Nov 10, steering far too sharp on every mode): yaw rate x speed may not pass 1.5 g, the yaw that was turned beyond it is taken back. */
{const sc0=stepCar;stepCar=function(c,dt){const r=sc0.apply(this,arguments);if(rallyOn(c)){if(c.ptBlend>.75)c.ptBlend=.75;c.dts=0}
 if(dt>0&&hu(c)&&P.arcade()&&!(window.PTO&&window.PTO.calmSteer===false)){const sp=Math.abs(c.sp||0),yr=c.yr||0;if(sp>4){const rl=rallyOn(c),lo=rl&&P.loose(c),lim=((lo?16:rl?13:16)+6*Math.exp(-(Math.max(sp,10)-10)/30))/sp*(P.VK?1/Math.max(1,P.VK()):1)*(P.dialK?Math.max(1,P.dialK()):1);if(Math.abs(yr)>lim){const ny=Math.sign(yr)*lim;c.yaw-=(yr-ny)*dt;c.yr=ny}}}
 return r}}
{const m0=P.mul;P.mul=c=>{const m=m0?m0(c):{acc:1,top:1,grip:1,brk:1};if(hu(c)&&P.arcade()){m.grip*=1.3;m.brk*=1.35;if(RACE&&RACE.cfg&&RACE.cfg.rally&&!RACE.cfg.circuit)m.acc*=.6}return m}}
/* steering ramp rate: 7 per second in the base game, 12 here */
P.arcSnap=c=>hu(c)&&P.arcade()?(window.PTO&&window.PTO.calmSteer===false?12:13):7;
/* wall contact: the base pushes back 1.3x the speed into the wall (a bounce off it); here 1.05x, and the nose is eased toward the
   road direction so the car slides along the wall and carries on */
P.arcWall=(c,psi,dt)=>{if(!(hu(c)&&P.arcade()))return 1.3;if(psi!=null){const f=Math.cos(c.yaw-psi)>=0?psi:psi+Math.PI;let d=f-c.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));c.yaw+=d*Math.min(1,(dt||.016)*10);c.yr*=.5}return 1.05};
/* Nov 11 (Hakan: dial read 150 where it felt like 95): rally dial scaled .65 */
P.dialS=()=>{const R=typeof RACE!=='undefined'?RACE:null;return R&&R.cfg&&R.cfg.rally&&!R.cfg.circuit&&R.T?0.65:1};
/* Nov 12 (Hakan: the camera closer to the car by default): the chase view sits 18% nearer to the car, in every mode (not the hood view) */
setTimeout(()=>{try{const s0=soloCam;soloCam=function(c,dt,out){s0.apply(this,arguments);if(c&&c.human&&!c.fin&&!c.camMode&&!(c.tnB>.4)&&!(window.PTO&&window.PTO.camNear===false)){const k=.82,y=c.camY==null?c.y:c.camY;out.p.set(c.x+(out.p.x-c.x)*k,y+(out.p.y-y)*k,c.z+(out.p.z-c.z)*k)}}}catch(e){}},30);
})();
