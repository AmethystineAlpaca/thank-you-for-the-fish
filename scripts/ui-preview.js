// Exercise the real UI against a temporary collection; never touches the user's save.
const {app,BrowserWindow}=require('electron');
const fs=require('fs'),path=require('path'),os=require('os');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tide-gallery-ui-'));
app.setPath('userData',dir);
const Sea=require('../src/catalog');
const samples=[[1,'normal'],[1,'glow'],[93,'glow'],[93,'prism'],[0,'normal'],[10,'alternate'],[98,'prism'],[49,'glow'],[35,'normal'],[75,'normal'],[20,'alternate'],[52,'glow']];
const catches=samples.map(([species,trait],i)=>({...Sea.catchFish(),id:'ui-'+i,species,trait,weight:100,time:Date.now()-i*60000}));
fs.writeFileSync(path.join(dir,'collection.json'),JSON.stringify({catches,unread:0,settings:{min:5,max:20,top:false,paused:true}}));
require('../src/main');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
app.whenReady().then(async()=>{
 try{
  await wait(900);
  const widget=BrowserWindow.getAllWindows()[0];
  await widget.webContents.executeJavaScript('Art.ready');
  await widget.webContents.executeJavaScript('desktop.collection()');await wait(500);
  const win=BrowserWindow.getAllWindows().find(w=>w!==widget);
  await win.webContents.executeJavaScript('Art.ready');
  const out=path.join(__dirname,'../artifacts');fs.mkdirSync(out,{recursive:true});
  const capture=async name=>{await wait(250);fs.writeFileSync(path.join(out,name+'.png'),(await win.webContents.capturePage()).toPNG())};
  win.setSize(1180,900);await capture('gallery-collection');
  const checks=await win.webContents.executeJavaScript(`(()=>{
   const cards=[...document.querySelectorAll('.fish-card')];
   if(cards.length!==12||cards.some(c=>!c.querySelector('.fish-stage canvas')))throw Error('Missing gallery stage');
   const style=getComputedStyle(cards[0].querySelector('.fish-stage'));
   if(!style.backgroundImage.includes('gradient'))throw Error('Missing stage lighting');
   const overflow=document.documentElement.scrollWidth>innerWidth;
   if(overflow)throw Error('Horizontal overflow');
   return {cards:cards.length,stageLighting:true,noHorizontalOverflow:true};
  })()`);
  await win.webContents.executeJavaScript("document.querySelectorAll('.fish-card')[1].click()");await capture('gallery-detail');
  await win.webContents.executeJavaScript("document.querySelector('.close').click();document.querySelector('[data-page=settings]').click()");await capture('gallery-settings');
  await win.webContents.executeJavaScript("document.querySelector('[data-page=atlas]').click()");await capture('gallery-atlas');
  await win.webContents.executeJavaScript("document.querySelector('[data-page=basket]').click()");
  win.setSize(1080,760);await capture('gallery-default');
  win.setSize(850,640);await capture('gallery-compact');
  if(await win.webContents.executeJavaScript('document.documentElement.scrollWidth>innerWidth'))throw Error('Compact layout overflows');
  await win.webContents.executeJavaScript("document.querySelector('[data-filter=glow]').click()");
  if(await win.webContents.executeJavaScript("document.querySelectorAll('.fish-card').length")!==4)throw Error('Trait filter broken');
  await win.webContents.executeJavaScript("document.querySelector('[data-filter=all]').click();document.querySelector('#search').value='不存在的鱼';document.querySelector('#search').dispatchEvent(new Event('input'))");
  if(!await win.webContents.executeJavaScript("!!document.querySelector('.empty')"))throw Error('Empty state missing');
  await capture('gallery-empty');
  await win.webContents.executeJavaScript("document.querySelector('[data-page=settings]').click()");await capture('gallery-settings-compact');
  await widget.webContents.executeJavaScript('desktop.demo()');await wait(1500);
  fs.writeFileSync(path.join(out,'gallery-widget.png'),(await widget.webContents.capturePage()).toPNG());
  console.log('PASS', {...checks,compactLayout:true,filter:true,emptyState:true,temporaryCollection:dir});app.exit(0);
 }catch(error){console.error(error);app.exit(1)}
});
