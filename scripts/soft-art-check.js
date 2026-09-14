const {app,BrowserWindow}=require('electron');
const fs=require('fs'),path=require('path'),os=require('os');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'little-tide-art-')));
app.whenReady().then(async()=>{
 const win=new BrowserWindow({show:false,webPreferences:{contextIsolation:true}});
 try{
  await win.loadFile(path.join(__dirname,'../src/index.html'));
  const result=await win.webContents.executeJavaScript(`(async()=>{
   await Art.ready;
   if(Art.upgradedSpecies!==Sea.fish.length)throw Error('Incomplete art migration');
   const canvas=(w=384,h=240)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
   const signatures=new Set(),sheets=[];
   for(let group=0;group<Math.ceil(Sea.fish.length/20);group++){
    const board=canvas(1200,1100),b=board.getContext('2d');
    b.fillStyle='#eaf5f0';b.fillRect(0,0,1200,1100);
    b.fillStyle='#275950';b.font='bold 25px sans-serif';
    b.fillText('小憩海湾 · '+Sea.fish[group*20].habitat+' · 新版美术',30,40);
    for(let slot=0;slot<20;slot++){
     const f=Sea.fish[group*20+slot],c=canvas();
     for(const trait of ['normal','alternate','glow','prism','silhouette']){
      Art.fish(c,f,trait,0);
      const pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
      const opaque=pixels.filter((v,i)=>i%4===3&&v>100).length;
      if(opaque<250||opaque>c.width*c.height*.65)throw Error('Empty or opaque tile '+f.id+' '+trait);
      if(trait==='normal')signatures.add(c.toDataURL());
      if(trait==='silhouette'){
       Art.fish(c,f,trait,3);
       const later=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
       // GPU/CPU canvas readback can round antialiased edge values differently.
       const changedAlpha=pixels.reduce((sum,v,i)=>sum+(i%4===3?Math.abs(v-later[i]):0),0);
       if(changedAlpha>pixels.length*.001)throw Error('Animated locked fish '+f.id+' '+changedAlpha);
       for(let i=0;i<pixels.length;i+=4)if(pixels[i+3]===255&&(pixels[i]!==38||pixels[i+1]!==63||pixels[i+2]!==67))throw Error('Silhouette leaks color '+f.id);
      }
     }
     const x=slot%4*300,y=65+Math.floor(slot/4)*205;
     b.fillStyle=slot%2?'#fffdf6':'#cce6df';b.fillRect(x+10,y,280,190);
     Art.fish(c,f,'normal',0);b.drawImage(c,x,y-4,300,187.5);
     b.font='16px sans-serif';b.fillStyle='#275950';b.fillText(String(f.id+1).padStart(3,'0')+'  '+f.name,x+22,y+174);
    }
    sheets.push(board.toDataURL());
   }
   if(signatures.size!==Sea.fish.length)throw Error('Duplicate sprites: '+signatures.size);
   return {species:signatures.size,renders:Sea.fish.length*5,staticSilhouettes:Sea.fish.length,sheets};
  })()`);
  fs.mkdirSync('artifacts',{recursive:true});
  result.sheets.forEach((data,i)=>fs.writeFileSync('artifacts/soft-fish-'+i+'.png',Buffer.from(data.split(',')[1],'base64')));
  delete result.sheets;console.log('PASS',result);app.exit(0);
 }catch(error){console.error(error);app.exit(1)}
});
