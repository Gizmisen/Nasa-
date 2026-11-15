const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('assert/strict'),path=require('path');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});const p=await browser.newPage({viewport:{width:1280,height:800}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('file:///'+path.resolve('COSMOLAB_GameOnly.html').replaceAll('\\','/'));await p.locator('#startButton').click();
assert.equal(await p.evaluate(()=>{const {ext,researchStart}=__expansion;researchStart('robotics','simulation');return ext.research;}),null);
await p.evaluate(()=>{__expansion.researchStart('materials','simulation');__expansion.researchStart('energy','simulation');});
assert.equal(await p.evaluate(()=>__expansion.ext.research.key),'materials');
await p.reload();await p.locator('#startButton').click();assert.equal(await p.evaluate(()=>__expansion.ext.research.key),'materials');
await p.evaluate(()=>__expansion.skipDays(2));assert.equal(await p.evaluate(()=>__expansion.ext.levels.materials),1);
// All selected part properties must be validated, including power and locked modules.
assert.ok(await p.evaluate(()=>__expansion.designErrors({...__expansion.ext.design,payload:2}).length)>=2);
for(const target of ['earth','moon','mars']){
 await p.evaluate(target=>{const {ext}=__expansion,s=__cosmo.state;ext.levels={propulsion:3,materials:3,robotics:3,biology:3,energy:3,comms:3};ext.design={engine:2,tank:2,hull:2,payload:2,power:2};ext.built={...ext.design};ext.integrity=100;ext.crew.forEach(c=>{c.health=100;c.energy=100;c.morale=90;});s.target=target;s.rocket=true;s.crates=5;s.money=900000;__cosmo.tryLaunch();},target);
 await p.reload();await p.locator('#startButton').click();
 assert.equal(await p.evaluate(()=>__cosmo.state.mission.target),target);
 const hazards=await p.evaluate(()=>{const events=[];for(let i=0;i<400&&__cosmo.state.mission?.phase!=='orbit';i++){const m=__cosmo.state.mission;if(m.phase==='event'){events.push(m.eventType);__cosmo.chooseEvent(['malfunction','fuelLeak','thermal'].includes(m.eventType)?'repair':m.eventType==='signal'?'maneuver':'shield');m.d20=20;}__expansion.updateMission(100);}return events;});
 assert.equal(hazards.length,{earth:2,moon:3,mars:4}[target]);
 await p.evaluate(()=>{const x=__cosmo.state.mission.expedition;x.oxygen=0;__expansion.surfaceAction('survey');});
 assert.equal(await p.evaluate(()=>__cosmo.state.mission.expedition.done.length),0);
 await p.evaluate(()=>{__expansion.saveGame();});await p.reload();await p.locator('#startButton').click();
 assert.equal(await p.evaluate(()=>__cosmo.state.mission.phase),'orbit');
 await p.evaluate(()=>{__surface.updateSurface(6100);__expansion.surfaceAction('abort');__surface.updateSurface(5100);});const balance=await p.evaluate(()=>__cosmo.state.money);
 await p.evaluate(()=>__expansion.action('abort'));assert.equal(await p.evaluate(()=>__cosmo.state.money),balance);
 if(await p.locator('#desk').isVisible())await p.locator('#deskClose').click();
}
// No Cyrillic left in the English interface, including live legacy controls.
for(const panel of ['lab','builder','crew','launch','journal','settings']){await p.evaluate(panel=>__expansion.openPanel(panel),panel);assert.equal(/[А-Яа-яЁё]/.test((await p.locator('#deskBody').innerText()).replace('English / Русский','')),false,panel);await p.locator('#deskClose').click();}
await p.setViewportSize({width:390,height:844});await p.evaluate(()=>__expansion.openPanel('builder'));const close=await p.locator('#deskClose').boundingBox();assert.equal(await p.evaluate(({x,y,width,height})=>document.elementFromPoint(x+width/2,y+height/2)?.id,close),'deskClose');
await p.locator('#deskClose').click();
assert.deepEqual(errors,[]);console.log('PASS: research dependencies/concurrency, invalid designs, all 3 routes and 9 hazards, save during research/flight/expedition, oxygen exhaustion, abort reward idempotency, English panels, mobile close button.');await browser.close();})().catch(e=>{console.error(e);process.exit(1)});