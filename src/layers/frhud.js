/* ===== Poly GT layer: Free Roam HUD hook (wraps the final hudUpdate) ===== */
(function frhudhook(){'use strict';const h0=hudUpdate;hudUpdate=()=>{if(RACE&&RACE.mode==='free'){try{h0()}catch(e){if(!window.__frHudErr){window.__frHudErr=1;console.warn('free roam hud',e)}}if(window.PT8&&PT8.frHud)PT8.frHud();return}h0()}})();
