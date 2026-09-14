const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const Sea=require('../src/catalog');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fish-expansion-'));
app.setPath('userData',dir);
const catches=[0,100,120,140,...Array.from({length:10},(_,i)=>150+i)].map((species,i)=>({id:'expansion-'+i,species,trait:['normal','alternate','glow','prism'][i%4],length:Sea.fish[species].length,weight:100,value:Sea.fish[species].base,time:i}));
fs.writeFileSync(path.join(dir,'collection.json'),JSON.stringify({catches,unread:0,settings:{min:5,max:20,top:false,paused:true}}));
require('../src/main');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
app.whenReady().then(async()=>{
 try{
  const widget=BrowserWindow.getAllWindows()[0];
  if(widget.webContents.isLoading())await new Promise(r=>widget.webContents.once('did-finish-load',r));
  await widget.webContents.executeJavaScript('Art.ready');
  await widget.webContents.executeJavaScript('desktop.collection()');
  const win=BrowserWindow.getAllWindows().find(w=>w!==widget);
  if(win.webContents.isLoading())await new Promise(r=>win.webContents.once('did-finish-load',r));
  await win.webContents.executeJavaScript('Art.ready');await sleep(200);
  console.log(await win.webContents.executeJavaScript(`(()=>{
   const check=(ok,message)=>{if(!ok)throw Error(message)};
   check(document.querySelectorAll('.fish-card').length===14,'mixed legacy and expansion catches');
   check(document.querySelector('#species').textContent.includes('/ 160'),'species denominator');
   document.querySelector('[data-filter="legendary"]').click();
   check(document.querySelectorAll('.fish-card').length===10,'legend basket');
   check(document.querySelectorAll('[data-rarity="legendary"]').length===10,'gold legend badges');
   document.querySelector('[data-page="atlas"]').click();
   check(document.querySelectorAll('.fish-card').length===10,'legend atlas');
   document.querySelector('.fish-card').click();
   check(document.querySelector('#detail-tag').textContent.includes('传说级'),'legend detail label');
   check(document.querySelector('#description').textContent.includes('虚构'),'fictional lore');
   document.querySelector('.close').click();
   document.querySelector('[data-filter="glow"]').click();
   check([...document.querySelectorAll('.fish-card')].every(c=>c.dataset.trait==='glow'),'appearance filter');
   document.querySelector('[data-filter="all"]').click();
   check(document.querySelectorAll('.fish-card').length===160,'full atlas');
   check(document.querySelectorAll('.undiscovered').length===146,'unseen expansion stays locked');
   document.querySelector('[data-filter="legendary"]').click();
   document.querySelector('#inventory').scrollIntoView();
   return 'PASS: legacy/new save records, 160-slot atlas, legend filter/badges/lore, traits and locked discoveries.';
  })()`));
  win.setSize(1080,950);await sleep(250);
  fs.writeFileSync('artifacts/legendary-collection.png',(await win.webContents.capturePage()).toPNG());
  app.exit(0);
 }catch(error){console.error(error);app.exit(1)}
});
