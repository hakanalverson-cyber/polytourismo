/* ===== Poly GT layer: live race prep (Nov 9, Hakan: "make the preparation stages for all modes more immersive, not just some boxes you click on").
   The setup screen used to be a still picture in a box with option cards under it. Now the whole screen behind the options is the real
   track, rendered live with its own renderer:
   - part 1 (the race): a slow aerial orbit that shows the whole layout, then drone shots that cut between corners (flying along the road,
     a trackside pan, a low run down the road, a high drone), with the sky, clouds and time of day you have picked (switch Time of day and
     the view changes with it)
   - part 2 (the car): your car (every player's car, side by side) parked on the grid of that track, the camera circling it slowly; drag on
     the picture to turn it yourself
   The option cards turn to frosted glass over it. The old still picture is kept underneath as the fallback (PTO.prepLive=false turns
   the live view off), and the world is freed the moment a race starts or the setup is left. ===== */
(function prep(){
'use strict';
const P=window.PT8;if(!P||typeof THREE==='undefined'||typeof R==='undefined'||typeof buildWorld==='undefined')return;
const on=()=>!window.PTO||window.PTO.prepLive!==false;
const FAST=()=>!window.PTO||window.PTO.prepFast!==false;
let lastDraw=0,fcount=0,ema=16.7,qual=1,qn=0;
const $=id=>document.getElementById(id);
const GBf=(T,x,z)=>{try{return window.GB?window.GB(T,x,z):(T.terr?T.terr(x,z):0)}catch(e){return 0}};
const st=document.createElement('style');st.textContent=`
#s8setup.prepLive #gxSu.g2 .gxCard.empty .gxr.gxAddT{display:none!important}
#suSteps .stAdd{cursor:pointer;margin-left:6px;padding:4px 11px;font-style:normal;font-size:15px;line-height:1;color:#dff0ff;background:#0a0e1480;box-shadow:inset 0 1px 0 #ffffff26,0 0 0 1px #ffffff2e;transition:background .15s}
#suSteps .stAdd:hover{background:#8fb4d8cc;color:#0a0e14}
.gxP.solo .gxPSet{display:none!important}
.gxSB{display:flex;justify-content:center;gap:clamp(10px,2.2vw,34px);pointer-events:auto}
.gxSB button{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:104px;padding:10px 12px 9px;border-radius:14px;color:#dbe6f1;background:#0a0e1466;box-shadow:inset 0 1px 0 #ffffff1c,0 0 0 1px #ffffff14;transition:background .15s,transform .15s}
.gxSB button:hover{background:#3a5f86cc;color:#fff;transform:translateY(-2px)}
.gxSB svg{width:38px;height:38px}
.gxSB span{font:500 13px var(--gt);letter-spacing:.04em;margin-top:3px}
.gxSB small{font:600 10px var(--gt);letter-spacing:.12em;text-transform:uppercase;color:#8fb4d8;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gxPK{margin-top:14px;padding-top:12px;border-top:1px solid #ffffff2a;display:grid;gap:7px}
.gxKV{display:grid;grid-template-columns:104px 1fr;align-items:baseline;font:400 13px var(--gt);color:#9fb0c0}
.gxKV b{font:500 17px var(--gt);color:#f2f6fa}
.gxPTag{margin-top:16px;font:400 13px var(--gt);color:#9fb0c0}.gxPTag b{font-weight:600;color:#dff0ff}
.gxP.solo .gxPH{display:none!important}
.gxSoloI{width:min(30vw,340px)!important;margin-top:14px!important;gap:0!important}
.gxGar{margin:0 0 14px;font:300 clamp(26px,4.4vh,38px) var(--gt);color:#f2f6fa;letter-spacing:.01em}
.gxMk{display:flex;align-items:center;gap:9px;font:500 clamp(14px,2vh,18px) var(--gt);letter-spacing:.04em;text-transform:uppercase;color:#e8eef4}
.gxMk svg{height:auto;width:36px;border-radius:2px;box-shadow:0 0 0 1px #ffffff40}
.gxSoloI h3{margin:12px 0 2px!important;font:500 clamp(18px,2.8vh,26px) var(--gt)!important;color:#fff}
.gxSub{font:500 12px var(--gt);color:#cfd8e1;text-transform:capitalize}
.gxPill{align-self:flex-start;margin-top:14px;padding:7px 15px;border-radius:20px;box-shadow:inset 0 0 0 1.5px #e8eef4aa;background:#0006;font:500 clamp(13px,1.9vh,17px) var(--gt);color:#fff}
.gxSoloI .gxPK{margin-top:14px;padding-top:12px;gap:7px}
.gxSoloI .gxKV{grid-template-columns:86px 1fr;gap:0 16px;font-size:12px}.gxSoloI .gxKV span{text-align:right}
.gxSoloI .gxKV b{font:600 clamp(14px,2.1vh,19px) var(--gt)}
.gxSoloI .gxPD{margin-top:12px;padding-top:10px;border-top:1px solid #ffffff2a}
.gxSoloI .gxPTag{margin-top:12px}
.gxDots{display:flex;justify-content:center;align-items:center;gap:13px;margin-top:auto;font:500 13px var(--gt);color:#cfd8e1;pointer-events:auto}
.gxDots u{text-decoration:none;cursor:pointer;padding:3px 7px}.gxDots u:hover{color:#fff}
.gxDots i{width:6px;height:6px;border-radius:50%;background:#ffffff55}.gxDots i.on{background:#fff}
.gxP.solo .gxPS{margin-top:auto}
.gxSB{gap:clamp(24px,5vw,86px)!important}
.gxSB button{background:none!important;box-shadow:none!important;min-width:96px;padding:6px 8px!important;gap:6px!important}
.gxSB button:hover{background:none!important;transform:none;color:#fff}.gxSB button:hover svg{transform:translateY(-3px)}
.gxSB svg{width:44px!important;height:44px!important;transition:transform .15s}
.gxSB span{font:500 clamp(14px,2vh,18px) var(--gt)!important}
.noTrk .gxCards .gxr[data-i="0"]{display:none!important}
.gxAddTf{all:unset;cursor:pointer;margin-top:10px;padding:6px 14px;border-radius:16px;font:500 12px var(--gt);letter-spacing:.06em;color:#cfe1f3;background:#0a0e1466;box-shadow:inset 0 0 0 1px #ffffff2a;pointer-events:auto}.gxAddTf:hover{background:#3a5f86cc;color:#fff}
.gxTnA{all:unset;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;width:34px;height:42px;font:300 34px/1 var(--gt);color:#cfe1f3;border-radius:10px;pointer-events:auto;vertical-align:middle;transition:background .15s,color .15s}
.gxTnA:hover{background:#ffffff22;color:#fff}.noTrk .gxTn>b{display:inline-block!important;vertical-align:middle}.noTrk .gxTn>small{display:block}
#bkPick{position:absolute;left:0;right:0;top:66px;bottom:66px;z-index:6;padding:22px 3.4vw 30px;overflow:auto;background:linear-gradient(180deg,#0b0e13f4,#07090cf8)}
#bkPick .bkPh{display:flex;align-items:baseline;gap:14px;margin-bottom:16px}#bkPick .bkPh b{font:300 26px var(--gt);color:#f2f6fa}#bkPick .bkPh i{font:600 11px var(--gt);letter-spacing:.14em;text-transform:uppercase;color:#8fb4d8;font-style:normal}
#bkPick .bkPg{display:grid;grid-template-columns:repeat(auto-fill,minmax(clamp(160px,15.5vw,230px),1fr));gap:12px}
#bkPick .bkC{cursor:pointer;padding:8px 8px 10px;border-radius:14px;background:#ffffff0e;border:1px solid #ffffff1a;transition:transform .15s,background .15s}
#bkPick .bkC:hover{transform:translateY(-2px);background:#ffffff1c}#bkPick .bkC.on{background:#f1f3f524;border-color:#f1f3f5}
#bkPick .bkC canvas{width:100%;height:auto;aspect-ratio:168/100;display:block;border-radius:9px;background:radial-gradient(ellipse at 50% 85%,#566271,#1a2027)}
#bkPick .bkC b{display:block;margin-top:7px;font:600 11px var(--gt);letter-spacing:.06em;text-transform:uppercase;color:#e8eef4}#bkPick .bkC small{font:500 10px var(--gt);letter-spacing:.1em;text-transform:uppercase;color:#8fb4d8}
.gxP:not(.solo) .gxSB{gap:6px!important}.gxP:not(.solo) .gxSB button{min-width:0!important;flex:1;padding:6px 4px!important}.gxP:not(.solo) .gxSB svg{width:30px!important;height:30px!important}.gxP:not(.solo) .gxSB span{font-size:11px!important}.gxP:not(.solo) .gxSB small{font-size:8px!important}
#s8setup[data-still] #prepCv,#s8setup[data-still] #prepVig{display:none}
#s8setup[data-still] #gxSu.g2 #gxShot{visibility:visible!important;position:fixed;left:0;right:0;top:66px;bottom:66px;width:100%;height:calc(100% - 132px);object-fit:cover;z-index:0;filter:brightness(.82)}
#s8setup[data-still] #gxSu.g2 .gxHero,#s8setup[data-still] #gxSu.g2 .gxCards{position:relative;z-index:1}
#s8setup[data-still] #gxSu.g2 .gxHero{background:transparent!important}
.gxP:not(.solo) .gxPS.bkS{margin-top:auto}
#s8setup.gxWait>*:not(.hdr):not(.foot8):not(#prepCv):not(#prepVig):not(#prepWait){visibility:hidden!important}
#suSteps .stAdd:hover{background:#fff!important;color:#0a0e14!important}
#prepFade{position:absolute;inset:0;z-index:7;background:#000;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .35s ease}
#s8setup.prepBuild #prepFade{opacity:1;transition:opacity .12s ease}
#prepFade b{display:block;font:italic 800 28px var(--gt);letter-spacing:.04em;color:#f1f3f5;text-align:center}#prepFade b i{font-style:italic;color:#8fb4d8}
#prepFade u{display:block;width:190px;height:2px;margin:16px auto 0;background:#ffffff22;overflow:hidden;text-decoration:none}#prepFade s{display:block;height:100%;width:40%;background:#f1f3f5;animation:pfBar 1s ease-in-out infinite}@keyframes pfBar{from{transform:translateX(-100%)}to{transform:translateX(260%)}}
#s8setup.carN3 #prepVig{background:radial-gradient(ellipse 90% 80% at 60% 35%,#0000 40%,#0006 100%),linear-gradient(0deg,#000c 0%,#0007 30%,#0000 55%)}
#gxSu .gxPC canvas{transition:none!important}
#gxSu:not(.fxOn) .gxP *:not(.nope),#gxSu:not(.fxOn) .gxCard,#gxSu:not(.fxOn) .gxCards *{animation:none!important}
#prepCv{position:absolute;inset:0;width:100%;height:100%;z-index:0;opacity:0;transition:none;pointer-events:none;display:block}
#s8setup.prepLive #prepCv{opacity:1;transition:opacity .5s ease}
#s8setup.prepLive #prepCv.cut{opacity:0;transition:opacity .22s ease}
#prepVig{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:0;transition:none;background:radial-gradient(ellipse 90% 80% at 60% 35%,#0000 40%,#0006 100%),linear-gradient(90deg,#0008 0%,#0003 30%,#0000 50%),linear-gradient(0deg,#000c 0%,#0007 30%,#0000 55%)}
#s8setup.prepLive #prepVig{opacity:1;transition:opacity .5s}
#s8setup.prepLive::before{opacity:0!important}
/* Nov 10 (Hakan: "the race preparation phase is the same terrible text boxes"): over the live track the three boxed cards become a row of glass pills
   (small label over a big value) along the bottom edge, with no card frames and no list rows (PTO.prepPills===false: the old cards) */
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards{display:flex!important;flex-wrap:wrap;align-items:flex-end;gap:8px 10px;max-height:none!important;padding:0 clamp(22px,3vw,48px) clamp(10px,1.6vh,22px)}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards .gxCard{display:contents!important}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards:not(.g4) .gxCard h5{display:none}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards.g4 .gxCard h5{display:inline-flex;align-items:center;gap:7px;margin:0 2px 0 0!important;padding:6px 4px;font:600 10px var(--gt);letter-spacing:.22em;text-transform:uppercase;color:#8fb4d8}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards.g4 .gxCard.empty .gxr.gxAddT{flex-direction:row;gap:10px;min-height:0;padding:9px 18px;border-radius:14px!important;background:#0a0e1466;box-shadow:inset 0 1px 0 #ffffff26,0 0 0 1px #ffffff1c;font:500 12px var(--gt);letter-spacing:.14em;text-transform:uppercase}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards.g4 .gxCard.empty .gxr.gxAddT small{display:none}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards.g4 .gxCard.empty .gxr.gxAddT{flex:0 0 auto!important;width:auto!important;height:auto!important;min-height:0!important;max-height:none!important;border:0!important;margin:0!important;align-self:flex-end}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards.g4 .gxr{padding:6px 14px 7px!important}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards.g4 .gxr input{width:104px!important;padding:3px 8px!important;min-height:0!important;height:24px!important}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards.g4{overflow:visible!important;gap:6px 8px!important;align-items:center!important}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards.g4 .gxCard.empty{border:0!important;background:none!important;min-height:0!important}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards .gxOpts{display:contents!important}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards .gxr{flex-direction:column;align-items:flex-start;justify-content:center;gap:1px;min-height:0!important;padding:8px 18px 9px!important;margin:0!important;border-radius:14px!important;background:#0a0e1480;backdrop-filter:blur(10px);box-shadow:inset 0 1px 0 #ffffff26,0 0 0 1px #ffffff1c,0 8px 20px #0006}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards .gxr .l{font:600 10px var(--gt)!important;letter-spacing:.2em;text-transform:uppercase;color:#8fb4d8}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards .gxr .v{margin:0!important;font:400 clamp(15px,2.1vh,22px) var(--gt);gap:8px}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards .gxr.on{background:linear-gradient(180deg,#8fb4d8e0 0%,#4f7eabe8 48%,#33608ce8 52%,#4a77a3e8 100%)}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards .gxr.on .l{color:#e6f0fa}
/* car step, idle: only the cars, centred, with a hint; zoomed: the frame on the left (name, stats, change car, name, gearbox) */
#prepHint,#prepZoomX{display:none}
#prepHint{display:none!important}
#s8setup.carIdle #prepHint{display:block;position:absolute;left:0;right:0;bottom:clamp(16px,4vh,44px);text-align:center;font:600 11px var(--gt);letter-spacing:.3em;text-transform:uppercase;color:#aebfd0;text-shadow:0 1px 8px #000;pointer-events:none;z-index:3}

.gxPanels{position:absolute;inset:0;pointer-events:none;display:none;z-index:3}
#s8setup.carIdle .gxPanels{display:block}
.gxP{position:absolute;top:clamp(8px,2vh,22px);bottom:clamp(58px,9vh,92px);width:min(400px,calc((100vw - 60px)/var(--n,1) - 18px));display:flex;flex-direction:column;gap:5px;left:20px;color:#eef3f8}
.gxPH{display:flex;align-items:center;justify-content:space-between;min-height:46px}
.gxPH b{display:grid;place-items:center;width:38px;height:38px;border-radius:10px;background:#0a0e1499;box-shadow:inset 0 1px 0 #ffffff2a,0 0 0 1px #ffffff26;font:600 18px var(--gt)}
.gxPH{gap:10px}.gxPH .gxPL{margin-left:auto}
.gxPL{display:grid;place-items:center;filter:drop-shadow(0 2px 8px #000a)}.gxPL svg,.gxPL img{max-height:44px;max-width:120px}
.gxPm{font:600 11px var(--gt);letter-spacing:.2em;text-transform:uppercase;color:#9fb6cc;margin-top:2px}
.gxP h3{margin:0;font:300 clamp(20px,3.2vh,32px)/1.1 var(--gt);letter-spacing:.02em;text-shadow:0 2px 14px #000}
.gxPT{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.gxPT i,.gxPT em{font:600 10.5px var(--gt);font-style:normal;letter-spacing:.12em;text-transform:uppercase;padding:5px 11px;border-radius:999px;background:#0a0e1488;box-shadow:inset 0 1px 0 #ffffff22,0 0 0 1px #ffffff1a;color:#d6e3f0}
.gxPT em{background:#e9eef3;color:#10151a;font-weight:700}
.gxPS{margin-top:auto;display:flex;gap:8px;justify-content:center;pointer-events:auto}
.gxPC{flex:0 1 124px;min-width:0;padding:5px 5px 6px;border-radius:12px;background:#0a0e1480;box-shadow:inset 0 1px 0 #ffffff1c,0 0 0 1px #ffffff18;cursor:pointer;opacity:.78;transition:opacity .15s,transform .15s}
.gxPC:hover{opacity:1;transform:translateY(-2px)}
.gxPC.on{opacity:1;cursor:default;background:#1a2733c0;box-shadow:inset 0 1px 0 #ffffff33,0 0 0 1.5px #8fb4d8}
.gxPC canvas{width:100%;height:auto;aspect-ratio:168/100;display:block;border-radius:8px;opacity:0;transition:opacity .25s;background:radial-gradient(ellipse at 50% 85%,#566271,#1a2027)}.gxPC canvas.rdy{opacity:1}
.gxPC span{display:block;margin-top:4px;font:600 9.5px var(--gt);letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center;color:#cfdbe8}
#s8setup.carIdle #prepHint{bottom:clamp(6px,1.6vh,16px)}

/* one player: the Gran Turismo 7 layout */
.gxPC.gar{display:grid;place-items:center;align-content:center;gap:6px;color:#cfdbe8;min-height:84px}.gxPC.gar span{margin:0}
.gxP.solo{left:0!important;width:auto!important;right:0;padding:0 clamp(24px,4.5vw,76px);box-sizing:border-box}
.gxP.solo .gxPH{position:absolute;left:clamp(24px,4.5vw,76px);right:clamp(24px,4.5vw,76px);top:0;pointer-events:none}
.gxP.solo .gxPH b{width:auto;min-width:38px;padding:0 12px;height:38px;order:2;margin-left:0}
.gxP.solo .gxPI{width:min(36vw,390px);margin-top:44px;display:flex;flex-direction:column;gap:7px}
.gxP.solo .gxPH{justify-content:flex-end}
.gxP.solo h3{font-size:clamp(26px,4.6vh,42px);font-weight:400}
.gxP.solo hr{display:none}
.gxPD{display:flex;flex-direction:column;gap:5px;margin-top:6px;width:min(100%,210px)}
.gxPR{display:grid;grid-template-columns:44px 1fr auto;align-items:center;gap:8px;font:500 11px var(--gt);color:#e6eef6}
.gxPR span{font:600 8.5px var(--gt);letter-spacing:.14em;text-transform:uppercase;color:#8fa3b6}
.gxPR b{font-weight:500;text-align:right;font-size:11px}
.gxPR u{height:3px;border-radius:2px;background:#ffffff22;overflow:hidden;display:block}.gxPR u i{display:block;height:100%;background:linear-gradient(90deg,#8fb4d8,#e9f1f8)}
.gxPSet{pointer-events:auto;margin-top:auto;display:flex;gap:6px;align-items:stretch}
.gxPSet label,.gxPB{flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 12px;border:0;border-radius:12px;background:#0a0e1499;box-shadow:inset 0 1px 0 #ffffff26,0 0 0 1px #ffffff1c;color:#eef3f8;font:500 13px var(--gt);cursor:pointer;box-sizing:border-box}
.gxPSet span{font:600 9.5px var(--gt);letter-spacing:.16em;text-transform:uppercase;color:#8fb4d8}
.gxPSet input{min-width:0;width:100%;flex:1;background:transparent;border:0;outline:0;color:#fff;font:500 13px var(--gt);text-align:right}
.gxPSet input::placeholder{color:#ffffff55}.gxPSet label:focus-within,.gxPB:hover{background:#3a5f86cc}
.gxP:not(.solo) .gxPS{margin-top:8px}
.gxP:not(.solo) .gxPSet{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.gxPB b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500}
.gxPanels.n3 .gxPSet{grid-template-columns:1fr!important;gap:4px}.gxPanels.n3 .gxPSet label,.gxPanels.n3 .gxPB{padding:4px 10px;border-radius:10px}
.gxPanels.n3 .gxPC{flex:1 1 0;max-width:none;padding:3px 3px 4px}.gxPanels.n3 .gxPC span{font-size:8px;margin-top:2px}.gxPanels.n3 .gxPC.gar{min-height:54px}.gxPanels.n3 .gxPC.gar svg{width:26px;height:26px}
.gxPanels.n3 .gxPS{margin-top:6px}
.gxP.solo .gxPSet{position:absolute;right:clamp(24px,4.5vw,76px);top:clamp(112px,17vh,150px);width:min(26vw,320px);flex-direction:column;margin:0;padding:12px;border-radius:16px;background:#0a0e1499;box-shadow:inset 0 1px 0 #ffffff26,0 0 0 1px #ffffff1c,0 12px 30px #0008;box-sizing:border-box}
.gxP.solo .gxPSet label,.gxP.solo .gxPB{background:#ffffff0d;box-shadow:none;padding:9px 14px}
.gxP.solo .gxPS{margin-top:auto}

/* two to four players: the split screen of Gran Turismo 7, one column each with a divider */
.gxP:not(.solo){padding:0 clamp(10px,1.6vw,26px);box-sizing:border-box}
.gxP:not(.solo)+.gxP:not(.solo){border-left:1px solid #ffffff1f}
.gxP:not(.solo) .gxPH b{width:42px;height:42px}
.gxP:not(.solo) .gxPI{display:flex;flex-direction:column;gap:7px}
.gxP:not(.solo) h3{font-size:clamp(20px,3.6vh,32px);font-weight:400}
.gxPanels:not(.n3) .gxPC{flex:1 1 0;max-width:190px}
.gxPC.lk canvas{filter:brightness(.35) saturate(.4)}.gxPC.lk{opacity:.6;cursor:not-allowed}.gxPC.nope{animation:gxNope .3s}@keyframes gxNope{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.gxP:not(.solo) .gxPH{margin-right:-17px}.gxP.solo .gxPH{right:clamp(14px,3vw,56px)}
#s8setup.carIdle #gxSu.g2 .gxTn{display:none!important}
#s8setup.carIdle #gxSu.g2 .gxCards .gxr:not(.gxAddT),#s8setup.carIdle #gxSu.g2 .gxCards h5{display:none!important}
#s8setup.carIdle #gxSu.g2 .gxCards{position:absolute;right:clamp(16px,2vw,34px);bottom:clamp(14px,3vh,34px);padding:0!important;z-index:3}
#s8setup.carZoom #prepZoomX{display:block;position:absolute;left:clamp(20px,3vw,44px);top:clamp(10px,2vh,24px);z-index:4;padding:6px 14px;border:0;border-radius:999px!important;background:#0a0e1488;box-shadow:inset 0 1px 0 #ffffff26,0 0 0 1px #ffffff22;color:#cfe0f0;font:600 11px var(--gt);letter-spacing:.16em;text-transform:uppercase;cursor:pointer}
#s8setup.carZoom #gxSu.g2 .gxTn{left:clamp(20px,3vw,44px)!important;top:clamp(44px,8vh,84px)!important;bottom:auto!important;width:min(34vw,400px);max-width:none!important;padding:14px 18px 16px;border-radius:16px!important;background:#0a0e1499;box-shadow:inset 0 1px 0 #ffffff26,0 0 0 1px #ffffff1c,0 12px 30px #0008}
#s8setup.carZoom #gxSu.g2 .gxTn b{font-size:clamp(22px,3.6vh,40px)!important;margin:2px 0 8px}
#s8setup.carZoom #gxSu.g2 .gxCards{position:absolute;left:clamp(20px,3vw,44px);bottom:clamp(72px,11vh,110px);width:min(34vw,400px);flex-direction:column!important;flex-wrap:nowrap!important;align-items:stretch!important;gap:6px!important;padding:12px!important;border-radius:16px!important;background:#0a0e1499;box-shadow:inset 0 1px 0 #ffffff26,0 0 0 1px #ffffff1c,0 12px 30px #0008;z-index:3}
#s8setup.carZoom #gxSu.g2 .gxCards .gxr{flex-direction:row!important;justify-content:space-between;align-items:center!important;background:#ffffff0d!important;box-shadow:none!important;backdrop-filter:none!important;padding:7px 14px!important}
#s8setup.carZoom #gxSu.g2 .gxCards .gxr.on{background:linear-gradient(180deg,#8fb4d8e0 0%,#4f7eabe8 48%,#33608ce8 52%,#4a77a3e8 100%)!important}
#s8setup.carZoom #gxSu.g2 .gxTn,#s8setup.carZoom #gxSu.g2 .gxCards{box-sizing:border-box!important;left:clamp(20px,3vw,44px)!important;right:auto!important;margin:0!important;width:min(34vw,400px)!important;transform:none!important}
#s8setup.carZoom #gxSu.g2 .gxCards .gxr{box-sizing:border-box!important;width:100%!important;margin:0!important;min-width:0!important}
#s8setup.carZoom #gxSu.g2,#s8setup.carZoom #gxSu.g2 .gxHero,#s8setup.carZoom #gxSu.g2 .gxHero *{overflow:visible!important;clip-path:none!important}
#s8setup.carZoom #gxSu .gxCard.pf.zOff,#s8setup.carZoom #gxSu .gxr.zOff{display:none!important}
#s8setup.carZoom #gxSu.g2 .gxCards h5,#s8setup.carZoom #gxSu.g2 .gxCards .gxCard.empty{display:none!important}
#s8setup.prepLive.pillOn #gxSu.g2 .gxst{display:grid;grid-template-columns:auto minmax(110px,190px) auto;gap:7px 12px;align-items:center;margin-top:12px;font:500 clamp(10px,1.3vh,13px) var(--gt);letter-spacing:.14em;text-transform:uppercase;color:#aebfd0;text-shadow:0 1px 6px #000}
#s8setup.prepLive.pillOn #gxSu.g2 .gxst u{display:block;height:4px;border-radius:2px!important;background:#ffffff26;overflow:hidden}
#s8setup.prepLive.pillOn #gxSu.g2 .gxst u i{display:block;height:100%;background:linear-gradient(90deg,#8fb4d8,#dff0ff);box-shadow:0 0 8px #8fb4d8}
#s8setup.prepLive.pillOn #gxSu.g2 .gxst em{font-style:normal;color:#fff;letter-spacing:.04em;text-transform:none;font-variant-numeric:tabular-nums}
#s8setup.prepLive.pillOn #gxSu.g2 .gxTn b{font-size:clamp(30px,4.8vh,58px)}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards:not(.g4) .gxr.more{border-top:0;margin-top:0!important}

#s8setup.prepLive #gxSu.g2 .gxHero{background:transparent!important;box-shadow:none!important;cursor:grab}
#s8setup.prepLive #gxSu.g2 .gxHero:active{cursor:grabbing}
#s8setup.prepLive #gxSu.g2 #gxShot,#s8setup.prepLive #gxHi{visibility:hidden}
#s8setup.prepLive #gxSu.g2 .gxHero:after{display:none}
#s8setup.prepLive #gxSu.g2 .gxTn b{text-shadow:0 2px 24px #000a}
#s8setup.prepLive #gxSu.g2 .gxCard{background:linear-gradient(180deg,#1d2228a6,#0d1014bf)!important;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:inset 0 1px 0 #ffffff2e,0 0 0 1px #0008,0 18px 40px #0008!important}
#s8setup.prepLive #gxSu.g2 .gxCard.pf.empty,#s8setup.prepLive #gxSu.g2 .gxCard.pf.idle{background:#0a0d1066!important;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
#s8setup.prepLive #gxSu.g2 .gxMapBox,#s8setup.prepLive #gxSu.g2 .gxSide{background:linear-gradient(180deg,#1d2228b3,#0d1014c8)!important;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
#prepTag{position:absolute;right:clamp(16px,2vw,32px);bottom:calc(100% - 64px);z-index:3;display:none}
#prepWait{position:absolute;left:50%;top:38%;z-index:1;transform:translate(-50%,-50%);font:600 10px var(--gt);letter-spacing:.3em;color:#8fb4d8;opacity:0;transition:opacity .3s;pointer-events:none}
#s8setup.prepBuild #prepWait{opacity:.8}
@media (prefers-reduced-motion:reduce){#prepCv{transition:none}}`;document.head.appendChild(st);
let R2=null,cv=null,vig=null,wait=null,S=null,gone=0,raf=0,lastT=0,pend=null;
const cam=new THREE.PerspectiveCamera(46,16/9,.3,6000),key=new THREE.DirectionalLight(0xffffff,.35);
const U=()=>window.TODU;
/* ---- the world ---- */
function free(){if(!S)return;const s=S;S=null;try{for(const c of s.cars)s.sc.remove(c);s.sc.remove(key);s.sc.remove(key.target);disposeWorld(s.sc);if(R2)R2.renderLists.dispose()}catch(e){console.warn('prep free',e)}const sec=$('s8setup');if(sec&&!sec.dataset.still)sec.classList.remove('prepLive')}
P.prepFree=free;let lastErr='';P.prepDbg=()=>({S:!!S,track:S&&S.track,cars:S&&S.cars.length,cv:!!cv,cvOn:!!(cv&&cv.isConnected),cls:($('s8setup')||{}).className,w:JSON.stringify(want()&&{t:want().track,s:want().step}),err:lastErr,building,cam:cam.position.toArray().map(Math.round),kind:S&&S.shot&&S.shot.kind,open:S&&S.open,look:S&&S.look&&S.look.toArray().map(Math.round),gnd:S&&Math.round(GBf(S.T,cam.position.x,cam.position.z)),roadY:S&&S.shot&&Math.round(at(S.T,S.shot.k0,S.open).y),Tn:S&&S.T.N,sp:S&&S.T.sp});
function build(track,tod){free();const d=D[track];if(!d)return null;
 const T=sampleTrack(Object.assign({},d)),sc=buildWorld(T);
 /* time of day: P.applyTod writes the shared grade uniforms and the main exposure; take what it wants for this view and put the game's back */
 const u=U(),sv=u?{mul:u.mul.value.clone(),add:u.add.value.clone(),sat:u.sat.value}:null,ct=P.curTod,ex=R.toneMappingExposure,be=P.baseExpo;let look=null;
 try{if(P.applyTod)P.applyTod(sc,T,tod);look=u?{mul:u.mul.value.clone(),add:u.add.value.clone(),sat:u.sat.value}:null}catch(e){console.warn('prep tod',e)}
 const expo=R.toneMappingExposure;if(u&&sv){u.mul.value.copy(sv.mul);u.add.value.copy(sv.add);u.sat.value=sv.sat}P.curTod=ct;R.toneMappingExposure=ex;P.baseExpo=be;
 try{if(P.skyxUpgrade)P.skyxUpgrade(sc,d)}catch(e){}
 let dome=null,sun=null;sc.traverse(o=>{if(!dome&&o.isMesh&&o.geometry&&o.geometry.type==='SphereGeometry'&&o.geometry.parameters&&o.geometry.parameters.radius===1500)dome=o;if(!sun&&o.isDirectionalLight)sun=o});
 const sd=new THREE.Vector3(.4,.6,-.7);if(sun){sd.copy(sun.position);if(sun.target)sd.sub(sun.target.position);if(sd.lengthSq()<1e-6)sd.set(.4,.6,-.7);sd.normalize();if(sd.y<.12)sd.y=.12;sd.normalize();
  sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0004;sun.shadow.normalBias=.02;if(!sun.target.parent)sc.add(sun.target)}
 sc.add(key);sc.add(key.target);
 /* the layout's box (for the aerial) */
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,y1=-1e9;for(let i=0;i<T.N;i++){x0=Math.min(x0,T.x[i]);x1=Math.max(x1,T.x[i]);z0=Math.min(z0,T.z[i]);z1=Math.max(z1,T.z[i]);y1=Math.max(y1,T.y[i])}
 const open=!!(d.rally||(d.cartoon&&d.cartoon.stage)||T.open||T.stage);
 const fog=sc.fog?{near:sc.fog.near,far:sc.fog.far}:null;
 return{track,tod,T,sc,sun,sd,dome,grade:look,expo,look:null,cars:[],carKey:'',open,zoom:-1,fog,box:{cx:(x0+x1)/2,cz:(z0+z1)/2,e:Math.max(x1-x0,z1-z0),y:y1},t0:performance.now(),shot:null,sh:0,ang:0}}
/* a point on the road at a fractional sample (wraps on a loop, clamps on a stage) */
function at(T,f,open){const N=T.N;if(open)f=Math.max(0,Math.min(N-1.001,f));const i=Math.floor(f),u=f-i,a=((i%N)+N)%N,b=(((i+1)%N)+N)%N;
 return{x:T.x[a]+(T.x[b]-T.x[a])*u,y:T.y[a]+(T.y[b]-T.y[a])*u,z:T.z[a]+(T.z[b]-T.z[a])*u,psi:T.psi[a],hw:T.hw[a]}}
/* ---- the cars on the grid ---- */
function carsFor(s,list){const k=list.map(c=>c.id+'.'+c.alt).join('|');if(s.carKey===k)return;for(const c of s.cars){s.sc.remove(c);if(c.userData&&c.userData.dispose)c.userData.dispose()}s.cars=[];s.carKey=k;
 const T=s.T,N=T.N;list.forEach((c,p)=>{let m;if(c.bike){m=P.bikeModel&&P.bikeModel(c);if(!m)return}else{const car=P.BYID[c.id],src=car&&P.C10&&P.C10.model(car.k10,c.alt);if(!src)return;m=src.clone(true)}
  const i=s.open?Math.min(N-1,6):((N-5)%N+N)%N,lat=-(p-(list.length-1)/2)*(list.length>3?7.8:list.length>2?8.6:9.2),ps=T.psi[i],cs=Math.cos(ps),sn=Math.sin(ps);
  m.rotation.set(0,ps,0);m.position.set(0,0,0);m.updateMatrixWorld(true);const bx=new THREE.Box3().setFromObject(m);
  m.position.set(T.x[i]+sn*lat,T.y[i]-bx.min.y+.01,T.z[i]+cs*lat);m.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});s.sc.add(m);s.cars.push(m)})}
/* ---- the camera ---- */
const SHOTS=['dolly','orbit','pan','crane','fly','low','orbit','high','dolly','pan','crane'];
P._prepDbg=()=>S?{st:(window.__ctSteal||'').split('\n').slice(2,9).map(l=>l.trim().slice(0,60)),sh:S.shot&&{k:S.shot.kind,lift:S.shot.lift,k0:+S.shot.k0.toFixed(1),side:S.shot.side,ap:S.shot.apex},tr:S._vTry,cam:cam.position.toArray().map(v=>+v.toFixed(1)),look:S.look&&S.look.toArray().map(v=>+v.toFixed(1)),N:S.T.N,track:S.track,vis:(()=>{let n=0,v=0;S.sc.traverse(o=>{if(o.name&&o.name.indexOf('ct_')===0){n++;if(o.visible)v++}});return v+'/'+n})(),fog:S.sc.fog&&[S.sc.fog.near|0,S.sc.fog.far|0]}:null;
function nextShot(s){const sh=pickShot(s);sh.t0=performance.now();s.shot=sh}
function mkShot(s,force,flip){const T=s.T,N=T.N,sp=T.sp||2;if(flip)return Object.assign({},flip,{side:-flip.side});s.sh++;if(s.sh===0&&s.open)s.sh=1;const SL=s.open?['dolly','crane','rev','dolly','crane','rev']:SHOTS,kind=force||SL[(s.sh-2+SL.length)%SL.length];
 /* Nov 12: every shot is built around a corner. The apexes are the sharpest local peaks of curvature; each shot is timed so the
    moving part of it passes through the bend, and the camera stands on the outside of the turn. */
 if(!s.cr){const K=P.kappa?P.kappa(T):null,L=[];if(K){const lo=s.open?Math.round(40/sp):0,hi=s.open?Math.round(N*.9):N;for(let i=lo;i<hi;i++){const R_=1/Math.max(K[i],1e-4);if(R_>110)continue;let mx=true;for(let d=-9;d<=9;d++){const j=((i+d)%N+N)%N;if(K[j]>K[i]){mx=false;break}}if(mx)L.push({i,k:K[i]})}}
  if(L.length<2){for(let i=0;i<N;i+=Math.round(N/8))L.push({i,k:0})}L.sort((a,b)=>b.k-a.k);s.cr=L.slice(0,Math.max(4,Math.min(L.length,14)));s.crN=0;s.crBag=[]}
 if(!s.crBag.length)s.crBag=s.cr.map((c,i)=>i).sort(()=>Math.random()-.5);
 const cn=s.cr[s.crBag.pop()],ap=cn.i,dur=kind==='aerial'?9:kind==='pan'?6.5:kind==='crane'?8.5:kind==='orbit'?9:7.5,v=kind==='dolly'||kind==='rev'?(s.open?15:14):kind==='fly'?13:kind==='low'?16:kind==='high'?10:20;
 const q1=at(T,ap-9,s.open),q2=at(T,ap+9,s.open);let dp=q2.psi-q1.psi;dp=Math.atan2(Math.sin(dp),Math.cos(dp));const out=dp>=0?-1:1;
 let k0=ap;if(kind==='dolly'||kind==='fly'||kind==='low'||kind==='high'||kind==='rev')k0=ap-(v*dur/2)/sp;else if(kind==='crane')k0=ap-(46+35+5*dur/2)/sp+ (5*dur/2)/sp-(5*dur/2)/sp;else if(kind==='orbit')k0=ap-3.5*dur/2/sp;
 if(s.open)k0=Math.max(2,Math.min(N-60,k0));
 return{kind,k0,side:out,t0:performance.now(),dur,sp,apex:ap}}
/* ---- clear-view drone (Nov 13, Hakan: the view must NEVER be blocked) ----
   Every shot is flown in advance against the circuit model before it is shown: at nine moments along it, a ray from the lens to the piece of road it
   looks at must reach the road, and a fan of short rays around the lens must find nothing within 10 m (no trunk, canopy, fence or wall near the lens).
   A shot that fails is thrown away and another corner / side / kind is tried. The checking is spread over the frames of the shot now playing. */
const _vp=new THREE.Vector3(),_vl=new THREE.Vector3();
/* the model as a height map of its tallest point per cell (trees, stands, fences, walls, bridges and the ground itself), built once per circuit */
function vGrid(s){if(s._vg!==undefined)return s._vg;let g=null;s.sc.traverse(o=>{if(o.name==='cartoonTrack')g=o});if(!g)return s._vg=null;
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;const ms=g.children.filter(m=>m.geometry&&m.geometry.attributes.position);
 for(const m of ms){m.updateMatrixWorld();const gm=m.geometry;if(!gm.boundingBox)gm.computeBoundingBox();const b=gm.boundingBox.clone().applyMatrix4(m.matrixWorld);x0=Math.min(x0,b.min.x);x1=Math.max(x1,b.max.x);z0=Math.min(z0,b.min.z);z1=Math.max(z1,b.max.z)}
 const cs=Math.max(2,Math.max(x1-x0,z1-z0)/1500),W=Math.ceil((x1-x0)/cs)+2,H=Math.ceil((z1-z0)/cs)+2,top=new Float32Array(W*H).fill(-1e9);
 const put=(x,y,z)=>{const k=((z-z0)/cs|0)*W+((x-x0)/cs|0);if(y>top[k])top[k]=y},A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3();
 for(const m of ms){const pa=m.geometry.attributes.position,ix=m.geometry.index,n=ix?ix.count:pa.count,M=m.matrixWorld;
  for(let t=0;t<n;t+=3){const a=ix?ix.getX(t):t,b=ix?ix.getX(t+1):t+1,c=ix?ix.getX(t+2):t+2;A.fromBufferAttribute(pa,a).applyMatrix4(M);B.fromBufferAttribute(pa,b).applyMatrix4(M);C.fromBufferAttribute(pa,c).applyMatrix4(M);
   const e=Math.max(Math.abs(A.x-B.x),Math.abs(A.z-B.z),Math.abs(B.x-C.x),Math.abs(B.z-C.z),Math.abs(A.x-C.x),Math.abs(A.z-C.z)),q=Math.min(48,Math.max(1,Math.ceil(e/cs*1.3)));
   for(let u=0;u<=q;u++)for(let w=0;w<=q-u;w++){const fa=u/q,fb=w/q,fc=1-fa-fb;put(A.x*fa+B.x*fb+C.x*fc,A.y*fa+B.y*fb+C.y*fc,A.z*fa+B.z*fb+C.z*fc)}}}
 return s._vg={x0,z0,cs,W,H,top,at(x,z){const i=(x-x0)/cs|0,j=(z-z0)/cs|0;return i<0||j<0||i>=W||j>=H?-1e9:top[j*W+i]}}}
/* how many of the checks fail for this moment of the shot (0 = a clean view) */
function clearAt(s,sh,t){const G=vGrid(s);if(!G)return 0;poseAt(s,sh,t,_vp,_vl);const dx=_vl.x-_vp.x,dy=_vl.y-_vp.y,dz=_vl.z-_vp.z,D=Math.hypot(dx,dy,dz);if(D<1)return 0;let bad=0;
 /* the line of sight: clear of everything for the first 82% of the way to the road it looks at */
 const n=Math.ceil(D/(G.cs*.7));for(let k=1;k<n;k++){const u=k/n;if(u>.82)break;if(G.at(_vp.x+dx*u,_vp.z+dz*u)>_vp.y+dy*u-.2){bad|=1;break}}
 /* the lens: nothing as tall as the camera within 4 m, and nothing rising to within a few degrees of the centre of the frame for 16 m ahead */
 const hx=dx/Math.hypot(dx,dz||1e-6),hz=dz/Math.hypot(dx,dz||1e-6);
 cone:for(let r=G.cs;r<=16;r+=G.cs)for(let a=-3;a<=3;a++){const an=a*.2,c=Math.cos(an),sn=Math.sin(an),x=_vp.x+(hx*c-hz*sn)*r,z=_vp.z+(hz*c+hx*sn)*r;const tp=G.at(x,z);if(tp<-1e8)continue;const gd=GBf(s.T,x,z),ob=!isFinite(gd)||tp-gd>.6;if(ob&&(tp>_vp.y+dy/D*r-r*.1||Math.hypot(r,_vp.y-tp)<8)){bad|=2;break cone}}
 ring:for(let a=0;a<8;a++){const an=a*.785;for(const r of[G.cs,4])if(G.at(_vp.x+Math.sin(an)*r,_vp.z+Math.cos(an)*r)>_vp.y-.3){bad|=4;break ring}}
 return bad}
function vet(s,sh){let b=0;for(let k=0;k<=10;k++){const m=clearAt(s,sh,sh.dur*k/10);b+=(m&1)+(m>>1&1)+(m>>2&1)}return b}
P.prepBusy=i=>!!(building||S&&S.track===i);
P._vetDbg=()=>{const s=S;if(!s||!vGrid(s))return null;const out={};const sh0=s.sh,bag=s.crBag;for(const kind of['dolly','crane','orbit','pan','fly','low','high']){const o=out[kind]={ok:0,n:0,los:0,cone:0,ring:0};for(let c=0;c<s.cr.length;c++)for(const side of[0,1]){s.crBag=[c];let sh=mkShot(s,kind);if(side)sh=mkShot(s,null,sh);let L=0,C=0,Rg=0;for(let k=0;k<=10;k++){const m=clearAt(s,sh,sh.dur*k/10);L+=m&1;C+=m>>1&1;Rg+=m>>2&1}o.n++;if(!(L+C+Rg))o.ok++;o.los+=L?1:0;o.cone+=C?1:0;o.ring+=Rg?1:0}}s.sh=sh0;s.crBag=bag;return out};
/* choose the next shot: the first candidate with a completely clean view; failing that (never seen on the eight circuits), the cleanest one tried */
function pickShot(s){if(window.__noVet||!vGrid(s))return mkShot(s);let best=null,bb=1e9;const last=s.shot?s.shot.apex:-1;
 for(let i=0;i<40;i++){const sh0=mkShot(s);if(sh0.apex===last&&s.cr.length>2)continue;
  /* the same move from the other side of the road, and from 3, 6 and 10 m higher, before giving up on this corner */
  for(const lift of sh0.kind==='high'?[0]:[0,3,6,10])for(const fl of[0,1]){const sh=Object.assign({},sh0,{side:fl?-sh0.side:sh0.side,lift}),b=vet(s,sh);if(!b){s._vTry=i;return sh}if(b<bb){bb=b;best=sh}}}
 s._vTry=-bb;return best||mkShot(s,'high')}
function camRace(s,now){const T=s.T;if(!s.shot)nextShot(s);let sh=s.shot,t=(now-sh.t0)/1000;
 if(t>sh.dur&&!pend){pend=1;cv.classList.add('cut');setTimeout(()=>{if(S===s){nextShot(s)}pend=null;setTimeout(()=>cv&&cv.classList.remove('cut'),40)},230)}
 const P_=new THREE.Vector3(),L=new THREE.Vector3();poseAt(s,sh,t,P_,L);
 {const dtc=Math.min(.1,Math.max(.001,(now-(s._pn||now))/1000));s._pn=now;if(s._psh!==sh){s._psh=sh;s._cp=P_.clone();s._cl=L.clone()}const k=1-Math.exp(-dtc*6),k2=1-Math.exp(-dtc*3);s._cp.lerp(P_,k);s._cl.lerp(L,k2);P_.copy(s._cp);L.copy(s._cl);const g2=GBf(T,P_.x,P_.z);if(isFinite(g2)&&P_.y<g2+2.8)P_.y=g2+2.8}
 cam.position.copy(P_);cam.lookAt(L);s.look=L;return sh.kind==='aerial'?b2(s):null}
function poseAt(s,sh,t,P_,L){const T=s.T,sp=sh.sp;
 if(sh.kind==='aerial'){const b=s.box,a=t*.05+sh.side,r=b.e*.62+120,h=b.e*.42+90;P_.set(b.cx+Math.sin(a)*r,b.y+h,b.cz+Math.cos(a)*r);L.set(b.cx,b.y-b.e*.04,b.cz)}
 else{const v=sh.kind==='dolly'||sh.kind==='rev'?(s.open?15:14):sh.kind==='fly'?13:sh.kind==='low'?16:sh.kind==='high'?10:20,f=sh.k0+v*t/sp,q=at(T,f,s.open),c=Math.cos(q.psi),sn=Math.sin(q.psi),side=sh.side;
  if(sh.kind==='fly'){const a=at(T,f+55/sp,s.open);P_.set(q.x+c*side*(q.hw+6),q.y+5.5,q.z-sn*side*(q.hw+6));L.set(a.x,a.y+1,a.z)}
  else if(sh.kind==='low'){const b=at(T,f-10/sp,s.open),a=at(T,f+34/sp,s.open),cb=Math.cos(b.psi),sb=Math.sin(b.psi);P_.set(b.x+cb*side*b.hw*.45,b.y+1.9,b.z-sb*side*b.hw*.45);L.set(a.x,a.y+1.2,a.z)}
  else if(sh.kind==='dolly'){/* tracking shot: runs level with the road at a constant offset, looking diagonally ahead */const o=at(T,f,s.open),a=at(T,f+26/sp,s.open),co=Math.cos(o.psi),so=Math.sin(o.psi);const lo=s.open?0:o.hw+5.5,bk=s.open?at(T,f-16/sp,s.open):o;P_.set((s.open?bk.x:o.x)+co*side*lo,(s.open?bk.y+7:o.y+2.6),(s.open?bk.z:o.z)-so*side*lo);L.set(a.x,a.y+1.1,a.z)}
  else if(sh.kind==='crane'){/* starts by the verge and rises while pulling away, so the land opens up behind the road */const e=Math.min(1,t/sh.dur),ez=e*e*(3-2*e),o=at(T,sh.k0+5*t/sp,s.open),a=at(T,sh.k0+(46+ez*70+5*t)/sp,s.open),co=Math.cos(o.psi),so=Math.sin(o.psi),off=s.open?ez*10:o.hw+7+ez*30;P_.set(o.x+co*side*off,o.y+(s.open?6:1.7)+ez*(s.open?30:21),o.z-so*side*off);L.set(a.x,a.y+1,a.z)}
  else if(sh.kind==='rev'){/* stages: a drone ahead of a point on the road, looking back down the corridor */const o=at(T,f+34/sp,s.open),a=at(T,f-8/sp,s.open);P_.set(o.x,o.y+8,o.z);L.set(a.x,a.y+1.2,a.z)}
  else if(sh.kind==='orbit'){/* slow circle around a spot on the road while it creeps along */const o=at(T,sh.k0+3.5*t/sp,s.open),ang=side*t*.15+1.1,R=(s.open?32:25)+t*.9;P_.set(o.x+Math.cos(ang)*R,o.y+(s.open?9:3.6)+t*.45,o.z+Math.sin(ang)*R);L.set(o.x,o.y+1.3,o.z)}
  else if(sh.kind==='high'){const a=at(T,f+18/sp,s.open);P_.set(q.x+c*side*42,q.y+48,q.z-sn*side*42);L.set(a.x,a.y,a.z)}
  else{/* pan: a fixed camera by the road that follows a point running past it */const o=at(T,sh.k0,s.open),co=Math.cos(o.psi),so=Math.sin(o.psi),a=at(T,sh.k0+(-60+v*t)/sp,s.open);P_.set(o.x+co*side*(o.hw+13),o.y+2.2,o.z-so*side*(o.hw+11));L.set(a.x,a.y+1,a.z)}}
 if(sh.lift)P_.y+=sh.lift;const g=GBf(T,P_.x,P_.z);if(isFinite(g)&&P_.y<g+3.2)P_.y=g+3.2}
const b2=s=>s.box.e*2.4+700;
P.prepZoomed=()=>!!(S&&S.zoom>=0&&document.getElementById('s8setup').classList.contains('carZoom'));P.prepUnzoom=()=>{if(S)S.zoom=-1;const w=document.getElementById('s8setup');if(w){w.classList.remove('carZoom');w.querySelectorAll('#gxSu .zOff').forEach(c=>c.classList.remove('zOff'));const tn=w.querySelector('#gxSu .gxTn');if(tn)tn.style.removeProperty('margin-left')}};
let drag=0,dragX=null;
/* the hint, the close button and the label of the car button, kept in the setup box */
function carChrome(sec,s){const box=document.getElementById('gxSu');if(!box)return;let h=document.getElementById('prepHint');if(!h){h=document.createElement('div');h.id='prepHint';h.textContent='Click a car to customise it';box.appendChild(h)}
 {const x=document.getElementById('prepZoomX');if(x)x.remove()}/* Nov 12: the Back button un-zooms now */
 box.querySelectorAll('.gxr .l').forEach(l=>{if(l.textContent==='Car')l.textContent='Change car'})}
document.addEventListener('click',e=>{const s=S;if(!s||!s.cars||!s.cars.length||!document.getElementById('s8setup').classList.contains('prepLive'))return;if(!e.target.closest||e.target.closest('button,input,.gxr,.gxCard,.gxTn,.gxMapBox,.foot8,#suSteps'))return;if(!e.target.closest('#gxSu'))return;
 const rc=cv.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(((e.clientX-rc.left)/rc.width)*2-1,-(((e.clientY-rc.top)/rc.height)*2-1)),cam);
 let hit=-1,best=1e9;s.cars.forEach((c,i)=>{const h=ray.intersectObject(c,true)[0];if(h&&h.distance<best){best=h.distance;hit=i}});
 if(hit>=0){if(s.zoom!==hit){s.zoom=hit;const card=document.querySelectorAll('#gxSu .gxCard.pf')[hit],row=card&&card.querySelector('.gxr');if(row)row.dispatchEvent(new MouseEvent('mouseenter'))}}else if(s.zoom>=0)s.zoom=-1},true);
function camCar(s,dt){const n=s.cars.length;if(!n)return;const C=new THREE.Vector3();for(const c of s.cars)C.add(c.position);C.divideScalar(n);
 /* Nov 10 (Hakan: the cars playing, centred; click one and the camera zooms to it, the frame on the left): zk eases 0 to 1 while a car is picked */
 const zi=Math.min(n-1,Math.max(0,s.zoom|0)),zt=FAST()&&s.zoom>=0?1:0;s.zk=(s.zk||0)+(zt-(s.zk||0))*Math.min(1,dt*5);const zk=s.zk;
 if(dragX==null)s.ang+=dt*(zk>.5?.07:.13);s.ang+=drag;drag=0;const ps=s.cars[0].rotation.y,r0=(FAST()?(n===1?4.7:(n===2?17.2:n===3?19.5:22.5)/(2*Math.tan(cam.fov*Math.PI/360)*cam.aspect)):7.4+2.6*(n-1)+(n>2?1.6:0)),r=r0+(5.4-r0)*zk,h=(1.35+.45*(n-1))*(1-.3*zk),a=ps+.95+s.ang;
 /* Nov 10 (Hakan: the split screen of Gran Turismo 7): the cars stand on a line across the view, one column each, wherever the camera turns */
 if(FAST()&&n>1){if(s._ck!==s.carKey){s._ck=s.carKey;s.cc=C.clone();s.cy=s.cars.map(c=>c.position.y)}const dist=Math.hypot(r0,h),sp=2*Math.tan(cam.fov*Math.PI/360)*cam.aspect*dist/n,ca=Math.cos(a),sa=Math.sin(a);s.cars.forEach((c,i)=>{const o=(i-(n-1)/2)*sp;c.position.set(s.cc.x+ca*o,s.cy[i],s.cc.z-sa*o)});C.copy(s.cc)}
 if(zk>.001)C.lerp(s.cars[zi].position,zk);
 cam.position.set(C.x+Math.sin(a)*r,C.y+h,C.z+Math.cos(a)*r);const g=GBf(s.T,cam.position.x,cam.position.z);if(isFinite(g)&&cam.position.y<g+.7)cam.position.y=g+.7;
 const L=C.clone();L.y+=.45;cam.lookAt(L);s.look=L}
/* Nov 10 (Hakan: "there should be no track as a background"): on the car step the track is hidden and the cars stand in a dark studio: a soft round
   floor that fades out, a deep gradient backdrop, the sun kept as the key light (PTO.prepStudio===false: the cars on the track as before) */
let BGTEX=null,FLTEX=null;
function studioTex(){if(BGTEX)return;const c=document.createElement('canvas');c.width=256;c.height=256;const g=c.getContext('2d'),gr=g.createRadialGradient(150,120,10,128,140,200);gr.addColorStop(0,'#3a4656');gr.addColorStop(.5,'#161c25');gr.addColorStop(1,'#05070a');g.fillStyle=gr;g.fillRect(0,0,256,256);BGTEX=new THREE.CanvasTexture(c);BGTEX.encoding=THREE.sRGBEncoding;
 const f=document.createElement('canvas');f.width=f.height=256;const h=f.getContext('2d'),fg=h.createRadialGradient(128,128,0,128,128,128);fg.addColorStop(0,'#fff');fg.addColorStop(.55,'#9a9a9a');fg.addColorStop(1,'#000');h.fillStyle=fg;h.fillRect(0,0,256,256);FLTEX=new THREE.CanvasTexture(f)}
const STD=new THREE.Vector3(.28,1,.34).normalize();
function studio(s,on){if(!!s.stOn===on)return;s.stOn=on;s.shadowed=0;
 if(on){studioTex();if(!s.stGrp){const m=new THREE.MeshStandardMaterial({color:0x2a313b,roughness:.42,metalness:.15,alphaMap:FLTEX,transparent:true});const fl=new THREE.Mesh(new THREE.CircleGeometry(34,48),m);fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;s.stGrp=fl;s.sc.add(fl)}
  s.stGrp.visible=true;s.stHide=[];for(const o of s.sc.children){if(o===s.stGrp||o.isLight||o===key||o===key.target||(s.sun&&o===s.sun.target)||s.cars.includes(o))continue;if(o.visible){o.visible=false;s.stHide.push(o)}}
  s.stBg=s.sc.background;s.stFog=s.sc.fog;s.sc.background=BGTEX;s.sc.fog=null}
 else{if(s.stGrp)s.stGrp.visible=false;for(const o of s.stHide||[])o.visible=true;s.stHide=null;s.sc.background=s.stBg||null;s.sc.fog=s.stFog||null}}
/* ---- what the setup screen shows right now ---- */
function want(){const sec=$('s8setup');if(!on()||!sec||!sec.classList.contains('on')||!sec.classList.contains('gxOn'))return null;const u=P.ui,bw=u&&u.ST&&u.ST.custom&&P.bikePrepWant?P.bikePrepWant():null;if(!u||!u.ST||(u.ST.custom&&!bw))return null;const ST=u.ST;
 if(!$('gxSu')||$('gxSu').style.display==='none')return null;const chips=document.querySelectorAll('#suSteps i'),step=chips.length>1&&((chips[0].parentNode.dataset.nf==='1')?chips[0].classList.contains('on'):chips[1].classList.contains('on'))?2:1;
 const tod=ST.todUser||(D[ST.track]&&D[ST.track].tod0)||'day',np=ST.mode==='ta'?1:Math.max(1,Math.min(4,ST.players||1)),cars=[];
 if(step===2&&u.selCar)for(let p=0;p<np;p++){try{const c=u.selCar(p);if(c)cars.push({id:c.id,alt:c.alt|0})}catch(e){}}
 return bw?{sec,track:bw.track,tod:'day',step:2,cars:bw.list,bike:1}:{sec,track:ST.track,tod,step,cars}}
function size(sec){/* Nov 10 (Hakan: "2 fps on the track previews"): drawn at about 0.7 of the screen's pixels (it sits behind frosted glass and a vignette) instead of 1.25x (PTO.prepFast===false: as before) */
 const dpr=FAST()?(S&&S.stOn?Math.min(1.25,devicePixelRatio||1)*qual:Math.min(.7,devicePixelRatio||1)*qual):Math.min(1.25,devicePixelRatio||1),w=sec.clientWidth|0,h=sec.clientHeight|0;if(!w||!h)return false;
 if(R2.getPixelRatio()!==dpr)R2.setPixelRatio(dpr);const v=R2.getSize(new THREE.Vector2());if(v.x!==w||v.y!==h)R2.setSize(w,h,false);cam.aspect=w/h;return true}
const PW={};/* Nov 12: the canvas and the renderer are made once (at loading, see P.prepWarm) and kept, so opening the setup screen never builds a context or compiles shaders */
function mkR2(){if(PW.R2)return;PW.cv=PW.cv||document.createElement('canvas');PW.R2=new THREE.WebGLRenderer({canvas:PW.cv,antialias:true,powerPreference:'high-performance'});const r=PW.R2;r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.ACESFilmicToneMapping;r.physicallyCorrectLights=R.physicallyCorrectLights;r.shadowMap.enabled=true;r.shadowMap.type=FAST()?THREE.PCFShadowMap:THREE.PCFSoftShadowMap;if(FAST())r.shadowMap.autoUpdate=false}
P.prepWarm=()=>new Promise(res=>{try{if(!on()){res(true);return}mkR2();const r=PW.R2,sc=new THREE.Scene(),ca=new THREE.PerspectiveCamera(50,16/9,.5,400);r.setSize(256,144,false);
 sc.add(new THREE.HemisphereLight(0xdde8ff,0x556644,.8));const dl=new THREE.DirectionalLight(0xfff0dd,1.4);dl.position.set(20,40,10);dl.castShadow=true;dl.shadow.mapSize.set(512,512);sc.add(dl);sc.add(dl.target);
 const g=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshStandardMaterial({color:0x667766,roughness:1}));g.rotation.x=-Math.PI/2;g.receiveShadow=true;sc.add(g);
 let car=null;try{const ids=Object.keys(P.BYID||{}),c=P.BYID[ids[0]];if(c&&P.C10&&P.C10.model)car=P.C10.model(c.k10,0)}catch(e){}
 if(car){car=car.clone(true);car.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});sc.add(car)}
 const sk=new THREE.Mesh(new THREE.SphereGeometry(300,16,8),new THREE.MeshBasicMaterial({color:0x88aadd,side:THREE.BackSide,fog:false}));sc.add(sk);
 ca.position.set(8,4,8);ca.lookAt(0,1,0);r.shadowMap.needsUpdate=true;r.render(sc,ca);setTimeout(()=>{try{r.render(sc,ca)}catch(e){}sc.traverse(o=>{if(o.geometry&&o!==car)o.geometry.dispose()});
  /* then one real layout, drawn once, so the track materials' programs are already built when the setup screen opens */
  setTimeout(()=>{try{const k=D.findIndex(d=>d&&d.cartoon&&!d.rally&&!(d.cartoon.stage));if(k>=0){const s0=build(k,'day');if(s0){cam.aspect=16/9;cam.position.set(s0.box.cx+60,s0.box.y+40,s0.box.cz+60);cam.lookAt(s0.box.cx,s0.box.y,s0.box.cz);cam.updateProjectionMatrix();r.render(s0.sc,cam);r.render(s0.sc,cam);S=s0;free();S=null}}}catch(e){console.warn('prep warm',e)}res(true)},80)},60)}catch(e){res(true)}});
function ensure(sec){if(!sec.querySelector('#prepFade')){const f=document.createElement('div');f.id='prepFade';f.innerHTML='<div><b>POLY <i>GT</i></b><u><s></s></u></div>';sec.appendChild(f)}if(!cv||!cv.isConnected){mkR2();cv=PW.cv;cv.id='prepCv';vig=document.createElement('div');vig.id='prepVig';wait=document.createElement('div');wait.id='prepWait';wait.textContent='LOADING TRACK';sec.insertBefore(wait,sec.firstChild);sec.insertBefore(vig,sec.firstChild);sec.insertBefore(cv,sec.firstChild);R2=PW.R2}}
let building=0;
function frame(now){raf=requestAnimationFrame(frame);const w=want();
 if(!w){if(S&&!gone)gone=now;if(S&&now-gone>1500)free();const sec=$('s8setup');if(sec&&!sec.dataset.still)sec.classList.remove('prepLive','prepBuild');return}gone=0;
 if(document.hidden)return;ensure(w.sec);
 if(!S||S.track!==w.track||S.tod!==w.tod){if(building)return;building=1;w.sec._bt=performance.now();w.sec.classList.add('prepBuild');w.sec.classList.remove('prepLive');
  /* let the fade show, then build (a second or so on the big maps) */
  setTimeout(()=>{try{const s=build(w.track,w.tod);S=s}catch(e){console.warn('prep build',e);lastErr=String(e&&e.stack||e).slice(0,300);S=null;if(window.PTO)window.PTO.prepLive=false}building=0;setTimeout(()=>w.sec.classList.remove('prepBuild'),450)},60);return}
 if(!building&&w.sec.classList.contains('prepBuild')&&performance.now()-(w.sec._bt||0)>1600)w.sec.classList.remove('prepBuild');
 if(FAST()&&now-lastDraw<13)return;/* Nov 10 (Hakan: really choppy): the old 22 ms gate locked 60 Hz screens to 30 fps; now it aims for 60 and lowers the resolution if the GPU can't keep up */
 {const iv=Math.min(100,now-lastDraw);ema+=(iv-ema)*.08;if(++qn%24===0){if(ema>22&&qual>.5)qual=Math.max(.5,qual-.08);else if(ema<17.8&&qual<1)qual=Math.min(1,qual+.04)}}
 lastDraw=now;fcount++;
 const s=S,dt=Math.min(.05,(now-(lastT||now))/1000);lastT=now;if(!size(w.sec))return;
 if(w.step===2){carsFor(s,w.cars);for(const c of s.cars)c.visible=true}else for(const c of s.cars)c.visible=false;
 if(w.step!==2||!s.cars.length)s.zoom=-1;w.sec.classList.toggle('carIdle',w.step===2&&FAST()&&s.zoom<0);w.sec.classList.toggle('carSolo',w.step===2&&s.cars.length===1);w.sec.classList.toggle('carZoom',w.step===2&&FAST()&&s.zoom>=0);{const cs=w.sec.querySelectorAll('#gxSu .gxCard.pf');cs.forEach((c,i)=>c.classList.toggle('zOff',s.zoom>=0&&i!==s.zoom));w.sec.querySelectorAll('#gxSu .gxr[data-pl]').forEach(r=>r.classList.toggle('zOff',s.zoom>=0&&+r.dataset.pl!==s.zoom))}if(s.zoom>=0){const tn=w.sec.querySelector('#gxSu .gxTn'),cd=w.sec.querySelector('#gxSu .gxCards');if(tn&&cd){tn.style.setProperty('margin-left','0px','important');const d=cd.getBoundingClientRect().left-tn.getBoundingClientRect().left;if(Math.abs(d)>1)tn.style.setProperty('margin-left',d+'px','important')}}
 carChrome(w.sec,s);
 if(FAST()&&!(window.PTO&&window.PTO.prepStudio===false)){studio(s,w.step===2&&s.cars.length>0);if(s.stOn&&s.stGrp&&s.cars.length){const c0=s.cars[0];s.stGrp.position.set(c0.position.x,c0.position.y-.02,c0.position.z)}}
 if(s.step!==w.step){s.step=w.step;s.shot=null;s.sh=0;s.ang=0;cv.classList.remove('cut');pend=null}
 {const nf=(w.step===2&&s.cars.length>2)?26:(w.step===2&&s.cars.length===2)?36:46;if(cam.fov!==nf){cam.fov=nf;cam.updateProjectionMatrix()}w.sec.classList.toggle('carN3',w.step===2&&s.cars.length>2)}
 let far=null;if(w.step===2&&s.cars.length)camCar(s,dt);else far=camRace(s,now);
 /* the subject sits in the open part of the picture (above the cards, right of the name) */
 const W=1000,H=Math.round(1000/cam.aspect),cars=w.step===2;cam.setViewOffset(W,H,cars?(FAST()?(-W*.2*(s.zk||0)-(s.cars.length===1?W*.09:0)*(1-(s.zk||0))):-W*.12):-W*.04,H*(cars?(FAST()?((s.cars.length>1?.03:.045)*(1-(s.zk||0))+.03*(s.zk||0)):.13):.1),W,H);cam.updateProjectionMatrix();
 if(s.fog&&s.sc.fog){const f=far||s.fog.far;s.sc.fog.far=f;s.sc.fog.near=far?Math.min(far*.4,s.fog.near+far*.2):s.fog.near}
 if(s.dome)s.dome.position.copy(cam.position);const m=s.sc.userData.skyx;if(m&&m.uniforms)m.uniforms.t.value=(now-s.t0)/1000+40;
 if(s.sun&&s.look){const stu=!!(s.stOn&&s.stGrp&&cars),L=stu?s.stGrp.position:s.look,ext=stu?26:cars?16:far?Math.min(600,s.box.e*.7):90;/* Nov 12 (Hakan: the shadows make no sense): in the studio the light is fixed above and a little to the side of the cars, so each shadow sits under its own car (it used the track's low sun and followed the camera) */s.sun.target.position.copy(L);s.sun.position.copy(L).addScaledVector(stu?STD:s.sd,Math.max(stu?80:200,ext*1.5));s.sun.target.updateMatrixWorld();const sc_=s.sun.shadow.camera;
  if(sc_.right!==ext){sc_.left=-ext;sc_.right=ext;sc_.top=ext;sc_.bottom=-ext;sc_.near=1;sc_.far=ext*4+400;sc_.updateProjectionMatrix()}}
 /* a soft key light from the camera side so the car always reads, whatever the time of day */
 key.intensity=cars?(s.tod==='night'?.55:.3):0;key.position.copy(cam.position).add(new THREE.Vector3(0,3,0));if(s.look)key.target.position.copy(s.look);key.target.updateMatrixWorld();
 const u=U(),sv=u&&s.grade?{mul:u.mul.value.clone(),add:u.add.value.clone(),sat:u.sat.value}:null;
 if(sv){u.mul.value.copy(s.grade.mul);u.add.value.copy(s.grade.add);u.sat.value=s.grade.sat}
 R2.toneMappingExposure=s.expo||1.05;{const f=s.stOn?'':'saturate(1.1) contrast(1.1) brightness(.97)';/* Nov 13: was saturate(sat*1.4) contrast(1.26): blown-out colours */if(cv._f!==f){cv._f=f;cv.style.filter=f}}if(FAST()){R2.shadowMap.needsUpdate=s.stOn?(!s.shadowed||s._sk!==s.carKey):((fcount%9===0)||!s.shadowed);s._sk=s.carKey;s.shadowed=1;if(s.sun&&s.sun.shadow&&s.sun.shadow.mapSize.x!==1024){s.sun.shadow.mapSize.set(1024,1024);if(s.sun.shadow.map){s.sun.shadow.map.dispose();s.sun.shadow.map=null}}}
 if(w.step===2&&FAST()&&s.cars.length&&!(s.zk>.02)){try{const W2=R2.domElement.clientWidth||innerWidth,ps=[...w.sec.querySelectorAll('#gxSu .gxP:not(.solo)')];cam.updateMatrixWorld();const xs=ps.map(el=>{const c=s.cars[+el.dataset.p];if(!c)return null;const v=c.position.clone();v.y+=1;v.project(cam);return (v.x*.5+.5)*W2});let gap=1e9;const xv=xs.filter(x=>x!=null).sort((a,b)=>a-b);for(let i=1;i<xv.length;i++)gap=Math.min(gap,xv[i]-xv[i-1]);const nn=ps.length,cw=W2/nn;ps.forEach((el,i)=>{el.style.width=(cw-20)+'px';el.style.left=(i*cw+10)+'px'})}catch(e){}}
 try{R2.render(s.sc,cam)}catch(e){console.warn('prep render',e);lastErr='R '+String(e&&e.stack||e).slice(0,300);if(window.PTO)window.PTO.prepLive=false;free()}
 if(sv){u.mul.value.copy(sv.mul);u.add.value.copy(sv.add);u.sat.value=sv.sat}
 w.sec.classList.add('prepLive');w.sec.classList.toggle('pillOn',!(window.PTO&&window.PTO.prepPills===false))}
raf=requestAnimationFrame(frame);
/* drag on the picture turns the car */
document.addEventListener('pointerdown',e=>{if(!S||!e.target.closest||!e.target.closest('#s8setup.prepLive .gxHero')||e.target.closest('.gxMapBox,.gxSide,button,input'))return;dragX=e.clientX;
 const mv=ev=>{if(dragX==null)return;drag+=(ev.clientX-dragX)*-.006;dragX=ev.clientX},up=()=>{dragX=null;removeEventListener('pointermove',mv);removeEventListener('pointerup',up)};addEventListener('pointermove',mv);addEventListener('pointerup',up)});
/* a race frees the preview world before it builds its own */
{const l0=P.launch;if(l0)P.launch=function(){try{free()}catch(e){}return l0.apply(this,arguments)}}
})();
