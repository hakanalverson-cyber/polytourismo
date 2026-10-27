/* ===== Poly GT layer: tracks6 (circuit slots for Laguna Seca, Suzuka, the Hungaroring, Bathurst and Spa. They exist only as bought cartoon models, so each slot shows
   up once its track file is loaded: built into the full download, or added with "Add track file") ===== */
(function v9tracks6(){
'use strict';
const P=window.PT8;if(!P.TRK_TRACKS)return;
/* a placeholder loop so the slot is a valid track before its file arrives (it is never shown) */
const ring=r=>{const o=[];for(let i=0;i<64;i++){const a=i/64*Math.PI*2;o.push([Math.cos(a)*r,Math.sin(a)*r,0,7])}return o};
const mk=(key,name,desc,tags)=>{const d={id:D.length,look:0,name,desc,hw:7,bank:0,off:'grass',idw:.85,offs:0,amp:0,up:0,shoulder:14,
  sky:[0x4f8fd0,0xd2e4f2],fog:0xcfe0ea,sun:0xfff0d0,hemi:[0xd4e8f8,0x4f7a3c],road:'#3b3d43',tod0:'day',packOnly:1,pts:ring(300),walls:[],ice:[],boost:[],jumps:[]};
 d[key]=1;D.push(d);P.TRACK_INFO.push({s:'TARMAC',tags});P.TRK_TRACKS.push(D.length-1);P.MEDAL_REF[D.length-1]=100};
mk('laguna','Laguna Seca','californian circuit / the corkscrew / big elevation changes',['CORKSCREW','ELEVATION','3.6 KM']);
mk('suzuka','Suzuka','japanese grand prix circuit / figure of eight / s curves / 130r',['FIGURE EIGHT','S CURVES','130R']);
mk('hungaroring','Hungaroring','hungarian grand prix circuit / tight and twisty / budapest',['TWISTY','BUDAPEST','4.4 KM']);
mk('bathurst','Bathurst','mount panorama / the mountain climb and the dipper / australia',['MOUNTAIN','THE DIPPER','6.2 KM']);
mk('spa','Spa-Francorchamps','belgian grand prix circuit / eau rouge and raidillon / the ardennes',['EAU ROUGE','ARDENNES','7.0 KM']);
})();
