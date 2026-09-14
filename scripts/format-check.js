const {app,BrowserWindow,dialog}=require('electron');
const fs=require('fs'),path=require('path'),os=require('os'),assert=require('node:assert/strict');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'little-tide-format-'));
app.setPath('userData',dir);
const file=path.join(dir,'collection.json');
const settings={min:7,max:12,top:false,paused:true};
fs.writeFileSync(file,JSON.stringify({catches:[require('../src/catalog').catchFish()],unread:1,settings,widgetScale:.8}));
require('../src/main');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 try{
  await sleep(1800);
  const widget=BrowserWindow.getAllWindows()[0];
  await widget.webContents.executeJavaScript("desktop.collection('settings')");
  await sleep(1800);
  const win=BrowserWindow.getAllWindows().find(w=>w!==widget);
  const initial=JSON.parse(fs.readFileSync(file));
  for(let cancelAt=0;cancelAt<3;cancelAt++){
   let calls=0;
   dialog.showMessageBox=async(owner,options)=>{
    assert.equal(owner,win);assert.equal(options.defaultId,0);assert.equal(options.cancelId,0);
    return {response:calls++===cancelAt?0:1};
   };
   assert.equal((await win.webContents.executeJavaScript('desktop.format()')).cancelled,true);
   assert.equal(calls,cancelAt+1);
   assert.deepEqual(JSON.parse(fs.readFileSync(file)),initial);
  }
  let finishFirst,calls=0;
  dialog.showMessageBox=async()=>{calls++;if(calls===1)return new Promise(resolve=>finishFirst=resolve);return {response:1}};
  const formatting=win.webContents.executeJavaScript('desktop.format()');
  while(!finishFirst)await sleep(10);
  assert.equal((await win.webContents.executeJavaScript('desktop.format()')).cancelled,true);
  finishFirst({response:1});
  assert.equal((await formatting).cancelled,false);assert.equal(calls,3);
  const disk=JSON.parse(fs.readFileSync(file));
  assert.deepEqual(disk.catches,[]);assert.equal(disk.unread,0);assert.deepEqual(disk.settings,initial.settings);
  assert.equal(disk.sessionCatches,0);assert.equal(disk.restReason,null);
  assert.equal(disk.widgetScale,initial.widgetScale);assert.deepEqual(disk.position,initial.position);
  assert.ok(disk.started>=initial.started);assert.ok(disk.next>disk.started);
  await sleep(100);
  assert.equal((await widget.webContents.executeJavaScript('desktop.state()')).catches.length,0);
  assert.equal(await win.webContents.executeJavaScript("document.querySelector('#total-nav').textContent"),'0');
  await win.webContents.executeJavaScript("document.querySelector('[data-page=atlas]').click()");
  assert.equal(await win.webContents.executeJavaScript("document.querySelectorAll('.undiscovered').length"),160);
  console.log('PASS: cancellation at all 3 steps, safe defaults, duplicate guard, reset persistence, preserved settings/layout, synchronized UI and atlas.');
  app.exit(0);
 }catch(error){console.error(error);app.exit(1)}
});
