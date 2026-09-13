const {app,BrowserWindow,Menu,nativeImage}=require('electron');const fs=require('fs'),path=require('path'),os=require('os'),assert=require('node:assert/strict');
const restoring=process.argv.includes('--restore');
fs.mkdirSync('artifacts',{recursive:true});
const dir=restoring?fs.readFileSync('artifacts/window-test-path.txt','utf8'):fs.mkdtempSync(path.join(os.tmpdir(),'little-tide-window-'));
if(!restoring){fs.writeFileSync('artifacts/window-test-path.txt',dir);fs.writeFileSync(path.join(dir,'collection.json'),JSON.stringify({catches:[{id:'test',species:1,trait:'normal',length:12,value:40,time:1}],unread:1,settings:{min:5,max:20,top:true,paused:false}}))}
app.setPath('userData',dir);require('../src/main');const sleep=n=>new Promise(r=>setTimeout(r,n));
app.whenReady().then(async()=>{try{
 await sleep(1300);const widget=BrowserWindow.getAllWindows()[0];
 if(restoring){assert.equal(widget.getBounds().width,252);assert.equal(widget.getBounds().height,189);const s=await widget.webContents.executeJavaScript('desktop.state()');assert.equal(s.catches.length,1);console.log('PASS: size and collection restored after quit/relaunch');app.exit(0);return}
 const icon=nativeImage.createFromPath(path.join(__dirname,'../src/assets/boatTemplate.png'));assert.equal(icon.isEmpty(),false);assert.equal(icon.getSize().width,22);
 const menu=Menu.getApplicationMenu().items[0].submenu;const settings=menu.items.find(i=>i.label==='打开设置…');assert.ok(settings);settings.click();await sleep(700);
 const win=BrowserWindow.getAllWindows().find(w=>w!==widget);
 assert.equal(await win.webContents.executeJavaScript("document.querySelector('#settings-panel').hidden"),false);
 assert.equal((await win.webContents.executeJavaScript('desktop.state()')).unread,1);
 menu.items.find(i=>i.label==='打开鱼篓').click();await sleep(100);
 assert.equal(await win.webContents.executeJavaScript("document.querySelector('#inventory').hidden"),false);
 assert.equal((await win.webContents.executeJavaScript('desktop.state()')).unread,0);
 widget.show();widget.focus();await sleep(200);
 const rect=await widget.webContents.executeJavaScript("(()=>{const r=document.querySelector('#resize-handle').getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}})()");
 widget.webContents.sendInputEvent({type:'mouseMove',x:rect.x,y:rect.y});widget.webContents.sendInputEvent({type:'mouseDown',button:'left',clickCount:1,x:rect.x,y:rect.y});await sleep(100);
 widget.webContents.sendInputEvent({type:'mouseMove',x:rect.x-90,y:rect.y-75,modifiers:['leftButtonDown']});await sleep(150);
 widget.webContents.sendInputEvent({type:'mouseUp',button:'left',clickCount:1,x:rect.x-90,y:rect.y-75});await sleep(150);
 const bounds=widget.getBounds();assert.ok(bounds.width<350,JSON.stringify(bounds));assert.ok(Math.abs(bounds.width/bounds.height-4/3)<.01);console.log('PASS: actual pointer drag resized native window to',bounds.width,bounds.height);
 await widget.webContents.executeJavaScript('desktop.scale(.6)');await sleep(100);assert.equal(widget.getBounds().width,216);
 assert.equal(await widget.webContents.executeJavaScript("Math.round(document.querySelector('#widget-root').getBoundingClientRect().width)"),216);
 fs.writeFileSync('artifacts/widget-small.png',(await widget.webContents.capturePage()).toPNG());
 menu.items.find(i=>i.label==='恢复小船默认大小').click();assert.equal(widget.getBounds().width,360);
 await widget.webContents.executeJavaScript('desktop.scale(.7)');await sleep(100);
 assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'collection.json'))).widgetScale,.7);
 assert.equal(await win.webContents.executeJavaScript("document.querySelector('#quit-app').textContent.includes('退出')"),true);
 console.log('PASS: menu routes, settings preserves unread, 60% scale, reset, persistence and quit button');
 // The real renderer quit button must end this test process successfully.
 win.webContents.executeJavaScript("document.querySelector('#quit-app').click()").catch(()=>{});
 setTimeout(()=>{console.error('Quit button did not exit');app.exit(1)},2000);
 }catch(e){console.error(e);app.exit(1)}});
