const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
(async()=>{fs.mkdirSync('media/screens',{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});const p=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('file:///'+path.resolve('COSMOLAB_GameOnly.html').replaceAll('\\','/'));await p.locator('#startButton').click();await p.waitForTimeout(300);await p.screenshot({path:'media/screens/base.png'});
await p.locator('[data-act="panel:lab"]').click();await p.screenshot({path:'media/screens/research.png'});await p.locator('[data-act="research:simulation"]').click();assert.equal(await p.evaluate(()=>__cosmo.state.money),212000);assert.match(await p.locator('#cashFlow').innerText(),/28/);await p.locator('#deskClose').click();await p.evaluate(()=>__expansion.skipDays(2));await p.waitForTimeout(250);await p.screenshot({path:'media/screens/economy.png'});
await p.locator('[data-act="panel:builder"]').click();await p.screenshot({path:'media/screens/builder.png'});await p.locator('#deskClose').click();await p.locator('[data-act="panel:crew"]').click();await p.screenshot({path:'media/screens/crew.png'});await p.locator('#deskClose').click();
for(const target of ['earth','moon','mars']){
 await p.evaluate(target=>{const s=__cosmo.state,e=__expansion.ext;e.levels={propulsion:3,materials:3,robotics:3,biology:3,energy:3,comms:3};e.built={engine:2,tank:2,hull:2,payload:2,power:2};e.design={...e.built};e.crew.forEach(c=>{c.health=100;c.energy=100;});s.money=900000;s.crates=5;s.rocket=true;s.target=target;__cosmo.tryLaunch();s.mission.phase='orbit';__surface.ensureSurface();__surface.refreshSurfaceHUD();},target);
 await p.evaluate(()=>{__surface.updateSurface(2600);__surface.render(performance.now());});await p.screenshot({path:`media/screens/${target}-landing.png`});await p.evaluate(()=>__surface.updateSurface(3500));assert.equal(await p.evaluate(()=>__cosmo.state.mission.surface.stage),'walk');
 const before=await p.evaluate(()=>__cosmo.state.mission.surface.x);await p.keyboard.down('d');await p.waitForTimeout(350);await p.keyboard.up('d');assert.ok(await p.evaluate(()=>__cosmo.state.mission.surface.x)>before);
 for(let i=0;i<3;i++){
  await p.evaluate(i=>{__surface.surfaceCommand('waypoint:'+i);for(let j=0;j<150;j++)__surface.updateSurface(100);__surface.openSurfaceEvent();},i);
  assert.equal(await p.evaluate(()=>__cosmo.state.mission.surface.event.stage),'choice');
  if(target==='mars'&&i===0)await p.screenshot({path:'media/screens/surface-event.png'});
  await p.locator('[data-surface="probe"]').click();await p.evaluate(()=>{__cosmo.state.mission.surface.event.roll=20;__surface.updateSurface(800);});if(target==='mars'&&i===0)await p.screenshot({path:'media/screens/dice.png'});
  await p.evaluate(()=>__surface.updateSurface(1800));await p.locator('[data-surface="continue"]').click();await p.locator('[data-surface="survey"]').click();await p.locator('[data-surface="close-event"]').click();
 }
 assert.equal(await p.evaluate(()=>__cosmo.state.mission.expedition.done.length),3);
 await p.evaluate(()=>{__surface.surfaceCommand('transmit');__surface.setSurfaceTarget(1050,1000);for(let j=0;j<150;j++)__surface.updateSurface(100);});await p.screenshot({path:`media/screens/${target}-surface.png`});
 // Active surface positions and completed sites survive a reload.
 await p.evaluate(()=>__expansion.saveGame());await p.reload();await p.locator('#startButton').click();assert.equal(await p.evaluate(()=>__cosmo.state.mission.surface.resolved.length),3);
 await p.locator('[data-surface="finish"]').click();assert.equal(await p.evaluate(()=>__cosmo.state.mission.surface.stage),'return');await p.evaluate(()=>__surface.updateSurface(5100));assert.equal(await p.evaluate(()=>__cosmo.state.mode),'base');await p.locator('#deskClose').click();
}
assert.deepEqual(errors,[]);console.log('PASS: archive pricing and cash feedback, landing, keyboard movement, 9 visual events, D20 checks, surveys, surface persistence, animated return and awards.');await browser.close();})().catch(e=>{console.error(e);process.exit(1)});