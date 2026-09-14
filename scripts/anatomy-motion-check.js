const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'fish-anatomy-')));
app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false });
  try {
    await win.loadFile(path.join(__dirname, '../src/index.html'));
    if (process.argv.includes('--canvas-fallback')) {
      const motion = fs.readFileSync(path.join(__dirname, '../src/motion.js'), 'utf8');
      await win.webContents.executeJavaScript(`(() => {
        const original=HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext=function(type,...args){
          return type==='webgl'?null:original.call(this,type,...args);
        };
        try { ${motion} } finally { HTMLCanvasElement.prototype.getContext=original; }
      })()`);
    }
    const result = await win.webContents.executeJavaScript(`(async () => {
      await Art.ready;
      const canvas = (w, h) => Object.assign(document.createElement('canvas'), {width:w, height:h});
      const source = canvas(640,400), s = source.getContext('2d');
      for(let y=0;y<400;y+=8)for(let x=0;x<640;x+=8){
        s.fillStyle=(x+y)%16?'#e1bc74':'#285962';s.fillRect(x,y,8,8);
      }
      const sample = canvas(640,400), c = sample.getContext('2d');
      const pixels = () => c.getImageData(0,0,640,400).data;
      function change(a,b,roi){
        let sum=0,count=0;
        for(let y=roi[1];y<roi[3];y++)for(let x=roi[0];x<roi[2];x++){
          const i=(y*640+x)*4;
          for(let k=0;k<4;k++){sum+=Math.abs(a[i+k]-b[i+k]);count++;}
        }
        return sum/count;
      }
      const checks=[];
      for(const [shape,rigid,moving] of [
        ['nautilus',[30,30,390,370],[540,280,600,370]],
        ['isopod',[30,30,600,170],[100,330,550,380]],
        ['garden',[30,350,600,380],[100,40,550,120]],
        ['octopus',[30,30,600,130],[100,300,550,370]],
      ]){
        Motion.draw(c,source,0,0,640,400,0,Motion.kindFor(shape));const a=pixels();
        c.clearRect(0,0,640,400);
        Motion.draw(c,source,0,0,640,400,.57,Motion.kindFor(shape));const b=pixels();
        const still=change(a,b,rigid),active=change(a,b,moving);
        if(still>.05||active<.3)throw Error(shape+' anatomy violated: '+JSON.stringify({still,active}));
        checks.push({shape,rigidChange:still,movingChange:active});
        c.clearRect(0,0,640,400);
      }
      if(Motion.backend!=='webgl')return {backend:Motion.backend,checks};
      const ids=[90,42,41,40,91,52,47,48,75];
      const board=canvas(960,690),b=board.getContext('2d'),tile=canvas(320,190);
      function draw(t){
        b.fillStyle='#edf5ef';b.fillRect(0,0,960,690);
        ids.forEach((id,i)=>{
          const x=i%3*320,y=Math.floor(i/3)*230;
          Art.fish(tile,Sea.fish[id],'normal',t);b.drawImage(tile,x,y);
          b.fillStyle='#315d55';b.font='17px sans-serif';b.textAlign='center';
          b.fillText(Sea.fish[id].name,x+160,y+210);
        });
      }
      draw(0);const still=board.toDataURL();
      const chunks=[],recorder=new MediaRecorder(board.captureStream(30),{mimeType:'video/webm;codecs=vp9'});
      recorder.ondataavailable=e=>chunks.push(e.data);
      const done=new Promise(resolve=>recorder.onstop=resolve);
      recorder.start();const start=performance.now();
      await new Promise(resolve=>{
        function frame(now){const t=(now-start)/1000;draw(t);if(t<6)requestAnimationFrame(frame);else resolve();}
        requestAnimationFrame(frame);
      });
      recorder.stop();await done;
      const bytes=new Uint8Array(await new Blob(chunks).arrayBuffer());let binary='';
      for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
      return {backend:Motion.backend,checks,still,video:btoa(binary)};
    })()`);
    if (result.still) {
      fs.mkdirSync('artifacts', { recursive: true });
      fs.writeFileSync('artifacts/anatomy-motion.png', Buffer.from(result.still.split(',')[1], 'base64'));
      fs.writeFileSync('artifacts/anatomy-motion.webm', Buffer.from(result.video, 'base64'));
    }
    delete result.still; delete result.video;
    console.log('PASS', result); app.exit(0);
  } catch (error) { console.error(error); app.exit(1); }
});
