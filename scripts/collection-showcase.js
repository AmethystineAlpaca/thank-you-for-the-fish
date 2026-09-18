// README artwork composed from the same sprites and renderer as the game.
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'fish-showcase-')));
app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false });
  try {
    await win.loadFile(path.join(__dirname, '../src/index.html'));
    const data = await win.webContents.executeJavaScript(`(async () => {
      await Art.ready;
      const c = Object.assign(document.createElement('canvas'), {width:1440,height:920});
      const ctx = c.getContext('2d');
      const gradient = ctx.createLinearGradient(0,0,1440,920);
      gradient.addColorStop(0,'#102f39'); gradient.addColorStop(1,'#071c29');
      ctx.fillStyle=gradient; ctx.fillRect(0,0,c.width,c.height);
      ctx.fillStyle='#93cbb9'; ctx.font='600 18px sans-serif';
      ctx.fillText('THANK YOU FOR THE FISH  /  THE LIVING COLLECTION',64,66);
      ctx.fillStyle='#f1f6e9'; ctx.font='bold 56px sans-serif';
      ctx.fillText('A small boat. A whole sea to discover.',64,143);
      ctx.fillStyle='#afd0c7'; ctx.font='24px sans-serif';
      ctx.fillText('160 creatures   ·   10 legends   ·   640 collectible appearances',64,192);
      const ids=[0,103,110,124,134,146,150,153,157,159];
      for(let i=0;i<ids.length;i++) {
        const f=Sea.fish[ids[i]], x=54+(i%5)*268, y=238+Math.floor(i/5)*282;
        ctx.fillStyle=i>=6?'#19383e':'#163840';
        ctx.beginPath();ctx.roundRect(x,y,252,260,22);ctx.fill();
        const sprite=Object.assign(document.createElement('canvas'),{width:600,height:400});
        Art.fish(sprite,f,'normal',0);ctx.drawImage(sprite,x-10,y-5,272,200);
        ctx.fillStyle=i>=6?'#e8cc88':'#e1efe4';ctx.font='600 22px sans-serif';
        ctx.fillText(f.name,x+22,y+216);
        ctx.fillStyle='#8aafa9';ctx.font='14px sans-serif';ctx.fillText(f.legendary?'LEGENDARY / 幻海传说':f.habitat,x+22,y+242);
      }
      ctx.fillStyle='#8bb3ab';ctx.font='18px sans-serif';
      ctx.fillText('Real in-game artwork · 游戏实机素材',64,862);
      ctx.textAlign='right';ctx.fillStyle='#d6e9dc';ctx.fillText('Free & open source. Made for quiet afternoons.',1376,862);
      return c.toDataURL('image/png');
    })()`);
    fs.writeFileSync(path.join(__dirname,'../docs/images/collection-showcase.png'),Buffer.from(data.split(',')[1],'base64'));
    app.exit(0);
  } catch(error) { console.error(error); app.exit(1); }
});
