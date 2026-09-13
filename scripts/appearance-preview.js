// Render representative palettes without opening or changing a real collection.
const {app,BrowserWindow}=require('electron');
const fs=require('fs'),path=require('path'),os=require('os');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'little-tide-appearances-')));
app.whenReady().then(async()=>{
 const win=new BrowserWindow({show:false,webPreferences:{contextIsolation:true}});
 try{
  await win.loadFile(path.join(__dirname,'../src/index.html'));
  const sheets=await win.webContents.executeJavaScript(`(async()=>{
   await Art.ready;
   const sheets=[];
   for(const dark of [false,true]){
    const board=Object.assign(document.createElement('canvas'),{width:1280,height:1460}),b=board.getContext('2d');
    b.fillStyle=dark?'#172b33':'#eff6f3';b.fillRect(0,0,board.width,board.height);
    b.fillStyle=dark?'#e6e9e2':'#416d66';b.font='24px sans-serif';
    b.fillText('小憩海湾 · 鱼的特别配色',28,42);
    Sea.traits.forEach((trait,col)=>b.fillText(trait.name,30+col*320,88));
    [0,1,10,20,49,93,98].forEach((id,row)=>{
     Sea.traits.forEach((trait,col)=>{
      const x=col*320+14,y=108+row*190;
      b.fillStyle=dark?'#1e3540':'#ffffff';b.beginPath();b.roundRect(x,y,292,180,12);b.fill();
      const sample=Object.assign(document.createElement('canvas'),{width:384,height:240});
      Art.fish(sample,Sea.fish[id],trait.id,2.8);
      b.drawImage(sample,x,y-4,292,182.5);
      b.fillStyle=dark?'#b5c7c8':'#718f85';b.font='15px sans-serif';b.fillText(Sea.fish[id].name,x+14,y+163);
     });
    });
    sheets.push(board.toDataURL());
   }
   return sheets;
  })()`);
  fs.mkdirSync(path.join(__dirname,'../artifacts'),{recursive:true});
  sheets.forEach((data,i)=>fs.writeFileSync(path.join(__dirname,'../artifacts/appearance-'+(i?'dark':'light')+'.png'),Buffer.from(data.split(',')[1],'base64')));
  console.log('Rendered 7 species × 4 appearances on light and dark backgrounds.');app.exit(0);
 }catch(error){console.error(error);app.exit(1)}
});
