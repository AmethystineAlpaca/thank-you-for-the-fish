const {app,BrowserWindow}=require('electron');const fs=require('fs'),path=require('path'),os=require('os');app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'tide-motion-')));require('../src/main');const sleep=n=>new Promise(r=>setTimeout(r,n));
app.whenReady().then(async()=>{try{await sleep(1000);const win=BrowserWindow.getAllWindows()[0];await win.webContents.executeJavaScript('Art.ready');const result=await win.webContents.executeJavaScript(`(async()=>{
 const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
 const pixels=c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data;
 const diff=(a,b)=>a.reduce((s,v,i)=>s+Math.abs(v-b[i]),0)/a.length;
 const checks=[];for(const id of [1,18,40,42,62,75]){const c=canvas(384,240);Art.fish(c,Sea.fish[id],'normal',0);const a=pixels(c);Art.fish(c,Sea.fish[id],'normal',.36);const change=diff(a,pixels(c));if(change<.3)throw Error('Fish does not deform '+id);checks.push({id,change:change.toFixed(2)})}
 const c=canvas(640,372);Art.scene(c,0,false);const a=pixels(c);Art.scene(c,.6,false);const water=diff(a,pixels(c));if(water<.3)throw Error('Scene static');
 const board=canvas(1100,680),ctx=board.getContext('2d');ctx.fillStyle='#ecf6ef';ctx.fillRect(0,0,1100,680);ctx.fillStyle='#386c64';ctx.font='22px sans-serif';ctx.fillText('局部变形动画 · 同一张素材的两个时刻',30,35);
 for(let frame=0;frame<2;frame++){const t=frame*.36;Art.scene(c,t,false);ctx.drawImage(c,frame*550,40,550,320);for(const [j,id]of [1,18,62].entries()){const f=canvas(320,200);Art.fish(f,Sea.fish[id],'normal',t);ctx.drawImage(f,frame*550+j*180,380,180,125);ctx.font='15px sans-serif';ctx.fillText(Sea.fish[id].name,frame*550+j*180+15,530)}}
 const movie=canvas(800,560),m=movie.getContext('2d'),small=canvas(360,220);const chunks=[];const recorder=new MediaRecorder(movie.captureStream(30),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:2200000});recorder.ondataavailable=e=>chunks.push(e.data);const done=new Promise(r=>recorder.onstop=r);recorder.start();const start=performance.now();await new Promise(resolve=>{function draw(now){const t=(now-start)/1000;m.fillStyle='#e9f5ef';m.fillRect(0,0,800,560);Art.scene(c,t,t>2.1&&t<4,{id:'preview',species:1,trait:'normal',weight:180},t-2.1);m.drawImage(c,110,0,580,337);for(const [j,id]of [1,18,62].entries()){Art.fish(small,Sea.fish[id],'normal',t);m.drawImage(small,j*266,335,266,165);m.fillStyle='#456e63';m.font='16px sans-serif';m.fillText(Sea.fish[id].name,j*266+65,530)}if(t<4.5)requestAnimationFrame(draw);else resolve()}requestAnimationFrame(draw)});recorder.stop();await done;
 const bytes=new Uint8Array(await new Blob(chunks,{type:'video/webm'}).arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const before=await desktop.state();await desktop.settings({...before.settings,paused:true});
 const trial=await desktop.demo();await wait(200);
 if(!document.querySelector('#toast').hidden)throw Error('Catch revealed before the jump');
 await wait(1100);
 if(document.querySelector('#toast').hidden||!document.querySelector('#toast span').textContent.includes(Sea.fish[trial.species].name))throw Error('Missing catch reveal');
 const after=await desktop.state();if(after.catches.length!==before.catches.length||after.unread!==before.unread)throw Error('Trial changed collection');
 return {backend:Motion.backend,checks,sceneChange:water,pausedCatchReveal:true,trialPreservesCollection:true,still:board.toDataURL(),video:btoa(binary)};
})()`);
 await win.webContents.executeJavaScript('desktop.collection()');await sleep(800);
 const basket=BrowserWindow.getAllWindows().find(w=>w!==win);await basket.webContents.executeJavaScript('Art.ready');
 const synced=await win.webContents.executeJavaScript('desktop.demo()');await sleep(150);
 if(await basket.webContents.executeJavaScript('sceneCatch?.id')!==synced.id)throw Error('Basket catch animation not synchronized');
 result.basketSynchronized=true;
 fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/motion-preview.png',Buffer.from(result.still.split(',')[1],'base64'));fs.writeFileSync('artifacts/motion-preview.webm',Buffer.from(result.video,'base64'));delete result.still;delete result.video;console.log(result);app.exit(0)}catch(e){console.error(e);app.exit(1)}});
