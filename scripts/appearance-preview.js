// Render representative palettes without opening or changing a real collection.
const {app,BrowserWindow}=require('electron');
const fs=require('fs'),path=require('path'),os=require('os');
function stagePanel(b,x,y,w,h){
 b.save();b.beginPath();b.roundRect(x,y,w,h,12);b.clip();
 b.fillStyle='#fffcf7';b.fillRect(x,y,w,h);
 const light=b.createRadialGradient(x+w*.46,y+h*.18,0,x+w*.46,y+h*.18,w*.8);
 light.addColorStop(0,'#53667b');light.addColorStop(.48,'#394b60');light.addColorStop(1,'#29384b');
 b.fillStyle=light;b.fillRect(x,y,w,h-34);b.restore();
}
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'little-tide-appearances-')));
app.whenReady().then(async()=>{
 const win=new BrowserWindow({show:false,webPreferences:{contextIsolation:true}});
 try{
  await win.loadFile(path.join(__dirname,'../src/index.html'));
  const sheets=await win.webContents.executeJavaScript(`(async()=>{
   await Art.ready;
   ${stagePanel.toString()}
   const sheets=[];
   for(const dark of [false,true]){
    const board=Object.assign(document.createElement('canvas'),{width:1280,height:1460}),b=board.getContext('2d');
    b.fillStyle=dark?'#29384b':'#f7f4ee';b.fillRect(0,0,board.width,board.height);
    b.fillStyle=dark?'#f3eadd':'#455262';b.font='24px sans-serif';
    b.fillText('小憩海湾 · 鱼的特别配色',28,42);
    Sea.traits.forEach((trait,col)=>b.fillText(trait.name,30+col*320,88));
    [0,1,10,20,49,93,98].forEach((id,row)=>{
     Sea.traits.forEach((trait,col)=>{
      const x=col*320+14,y=108+row*190;
      stagePanel(b,x,y,292,180);
      const sample=Object.assign(document.createElement('canvas'),{width:384,height:240});
      Art.fish(sample,Sea.fish[id],trait.id,2.8);
      b.save();b.beginPath();b.rect(x,y,292,146);b.clip();b.drawImage(sample,x,y-12,292,182.5);b.restore();
      b.fillStyle='#697582';b.font='15px sans-serif';b.fillText(Sea.fish[id].name,x+14,y+167);
     });
    });
    sheets.push(board.toDataURL());
   }
   return sheets;
  })()`);
  fs.mkdirSync(path.join(__dirname,'../artifacts'),{recursive:true});
  sheets.forEach((data,i)=>fs.writeFileSync(path.join(__dirname,'../artifacts/appearance-'+(i?'dark':'light')+'.png'),Buffer.from(data.split(',')[1],'base64')));
  if(process.argv.includes('--motion')){
   const frames=await win.webContents.executeJavaScript(`(async()=>{
    ${stagePanel.toString()}
    const board=Object.assign(document.createElement('canvas'),{width:900,height:570}),b=board.getContext('2d');
    const samples=Array.from({length:6},()=>Object.assign(document.createElement('canvas'),{width:384,height:240}));
    const frames=[];
    for(let frame=0;frame<72;frame++){
     b.fillStyle='#f7f4ee';b.fillRect(0,0,900,570);
     b.fillStyle='#455262';b.font='22px sans-serif';b.fillText('小憩海湾 · 特殊鱼的光彩',22,36);
     ['普通','荧光 · 呼吸霓虹','炫彩 · 镭射银箔'].forEach((label,col)=>{b.font='17px sans-serif';b.fillText(label,col*300+22,78)});
     [1,93].forEach((id,row)=>['normal','glow','prism'].forEach((trait,col)=>{
      const x=col*300+12,y=98+row*230,c=samples[row*3+col];
      stagePanel(b,x,y,276,216);
      Art.fish(c,Sea.fish[id],trait,frame/15);
      b.drawImage(c,x-10,y+4,296,185);
      b.fillStyle='#697582';b.font='15px sans-serif';b.fillText(Sea.fish[id].name,x+14,y+204);
     }));
     frames.push(board.toDataURL());
    }
    return frames;
   })()`);
   const dir=path.join(__dirname,'../artifacts/appearance-frames');fs.mkdirSync(dir,{recursive:true});
   frames.forEach((data,i)=>fs.writeFileSync(path.join(dir,String(i).padStart(3,'0')+'.png'),Buffer.from(data.split(',')[1],'base64')));
   console.log('Rendered 72 animation frames at 15 fps.');
  }
  console.log('Rendered 7 species × 4 appearances on light and dark backgrounds.');app.exit(0);
 }catch(error){console.error(error);app.exit(1)}
});
