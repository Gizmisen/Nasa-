window.requestAnimationFrame=()=>0;
window.filmScene=-1;window.filmClock=10000;
window.resetShot=function(){document.getElementById('deskClose').click();const st=__cosmo.state;st.mode='base';st.mission=null;st.money=240000;st.shownMoney=240000;__surface.clearFX();document.getElementById('notice').classList.remove('on');document.getElementById('surfaceUI').hidden=true;document.body.classList.remove('on-surface');__expansion.ext.lang='en';};
window.setupField=function(target,stage='walk'){resetShot();const st=__cosmo.state,ex=__expansion.ext;Object.keys(ex.levels).forEach(k=>ex.levels[k]=2);ex.design={engine:2,tank:2,hull:2,payload:2,power:2};ex.built={...ex.design};ex.integrity=100;ex.crew.forEach(c=>{c.energy=100;c.health=100;});st.rocket=true;st.target=target;st.crates=5;__cosmo.tryLaunch();st.mission.phase='orbit';const s=__surface.ensureSurface();s.stage=stage;s.t=0;st.mode='flight';document.getElementById('cashFlow').replaceChildren();__surface.refreshSurfaceHUD();};
window.showShot=function(n){resetShot();const st=__cosmo.state,ex=__expansion.ext;filmScene=n;
 if(n===0){setupField('mars','landing');st.mission.surface.t=3;}
 if(n===1){ex.crew[1].task='lab';ex.crew[2].task='engineering';}
 if(n===2){__expansion.openPanel('lab');}
 if(n===3){Object.keys(ex.levels).forEach(k=>ex.levels[k]=2);ex.design={engine:1,tank:1,hull:1,payload:1,power:1};st.rocket=false;__expansion.openPanel('builder');}
 if(n===4){ex.crew[0].energy=75;ex.crew[1].energy=62;ex.crew[2].health=88;__expansion.openPanel('crew');}
 if(n===5){setupField('moon');st.mission.phase='event';st.mission.eventType='meteor';st.mission.eventT=1;document.getElementById('surfaceUI').hidden=true;document.body.classList.remove('on-surface');__cosmo.chooseEvent('shield');st.mission.d20=16;st.mission.rollT=0;}
 if(n===6){setupField('moon','landing');st.mission.surface.t=3.5;}
 if(n===7){setupField('mars');const s=st.mission.surface;s.x=1000;s.y=560;s.tx=1430;s.ty=540;s.crew.forEach((c,i)=>{c.x=s.x+(i%2)*48-24;c.y=s.y+Math.floor(i/2)*48;});}
 if(n===8){setupField('mars');const s=st.mission.surface;s.x=1440;s.y=545;s.tx=s.x;s.ty=s.y;s.crew.forEach((c,i)=>{c.x=s.x+(i%2)*48-24;c.y=s.y+Math.floor(i/2)*48;});__surface.openSurfaceEvent();}
 if(n===9){setupField('earth','return');st.mission.expedition.sent=24;st.mission.expedition.done=[0,1,2];st.mission.surface.returnSuccess=true;}
 if(n===10){setupField('moon');const s=st.mission.surface;s.x=1220;s.y=550;s.tx=1510;s.ty=540;s.crew.forEach((c,i)=>{c.x=s.x+(i%2)*48-24;c.y=s.y+Math.floor(i/2)*48;});}
 __surface.refreshSurfaceHUD();if(n===5)document.getElementById('surfaceUI').hidden=true;__surface.clearFX();__surface.step(1,filmClock);
};
window.filmFrame=function(t){const n=t<3?0:t<6.8?1:t<10.15?2:t<12.55?3:t<14.4?4:t<17.6?5:t<19.3?6:t<21.5?7:t<22.7?8:t<25.8?9:10;if(n!==filmScene)showShot(n);filmClock+=1000/24;__surface.step(1000/24,filmClock);if(n===5&&__cosmo.state.mission?.phase==='flight'){__cosmo.state.mission.phase='roll';__cosmo.state.mission.rollT=2;}if(n===10){document.getElementById('surfaceUI').hidden=true;document.getElementById('controlDock').style.opacity='.15';}else document.getElementById('controlDock').style.opacity='1';};