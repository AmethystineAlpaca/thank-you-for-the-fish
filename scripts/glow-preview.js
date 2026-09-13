// Inspect fluorescence on contrasting backgrounds without touching saved catches.
const {app,BrowserWindow}=require('electron');
const fs=require('fs'),path=require('path'),os=require('os');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'little-tide-glow-')));
app.whenReady().then(async()=>{
 const win=new BrowserWindow({show:false,webPreferences:{contextIsolation:true}});
 try{
  await win.loadFile(path.join(__dirname,'../src/index.html'));
  const result=await win.webContents.executeJavaScript(`(async()=>{
   await Art.ready;
   const canvas=(width=384,height=240)=>Object.assign(document.createElement('canvas'),{width,height});
   const pixels=c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data;
   const samples=[],signatures=new Set();
   // Discover the five assigned colors through the public renderer.
   for(let i=0;i<100&&samples.length<5;i++){
    const record={id:'glow-preview-'+i,species:93,trait:'glow',weight:130};
    const c=canvas();Art.fish(c,Sea.fish[93],'glow',0,record);
    const data=pixels(c),totals=[0,0,0];
    for(let j=0;j<data.length;j+=4)for(let k=0;k<3;k++)totals[k]+=data[j+k]*data[j+3];
    const key=totals.map(v=>Math.round(v/Math.max(...totals)*100)).join(',');
    if(signatures.has(key))continue;
    signatures.add(key);samples.push({record,totals});
   }
   if(samples.length!==5)throw Error('Missing fluorescent colors');
   samples.sort((a,b)=>{
    const hue=({totals:[r,g,b]})=>{const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;return ((max===r?(g-b)/d:max===g?(b-r)/d+2:(r-g)/d+4)*60+360)%360};
    return hue(a)-hue(b);
   });
   let checked=0;
   for(const id of [0,1,20,49,75,93,94,98]){
    const c=canvas(),record={...samples[0].record,species:id};
    Art.fish(c,Sea.fish[id],'normal',0,record);const normal=pixels(c),before=c.toDataURL();
    Art.fish(c,Sea.fish[id],'glow',0,record);const glow=pixels(c);
    let alpha=0,count=0;
    for(let i=3;i<normal.length;i+=4)if(normal[i]>240){alpha+=glow[i];count++}
    if(!count||alpha/count>180||alpha/count<20)throw Error('Invalid translucency '+id+' '+alpha/count);
    const first=new Uint8ClampedArray(glow);
    Art.fish(c,Sea.fish[id],'glow',2,record);
    Art.fish(c,Sea.fish[id],'glow',0,JSON.parse(JSON.stringify(record)));
    const again=pixels(c);
    const delta=first.reduce((sum,v,i)=>sum+Math.abs(v-again[i]),0)/first.length;
    if(delta>.1)throw Error('Unstable catch color '+id);
    Art.fish(c,Sea.fish[id],'normal',0,record);
    if(c.toDataURL()!==before)throw Error('Modified source art '+id);
    checked++;
   }
   const board=canvas(1500,930),b=board.getContext('2d');
   b.fillStyle='#0a141b';b.fillRect(0,0,1500,930);
   b.fillStyle='#e0f1ef';b.font='26px sans-serif';b.fillText('半透明荧光 · 五种固定随机配色',28,44);
   b.font='16px sans-serif';b.fillStyle='#a9c4c3';b.fillText('鱼身透光，轮廓与纹理发亮 · 同一条鱼的颜色保持不变',28,76);
   const names=['黄','绿','蓝','紫','红'];
   samples.forEach(({record},col)=>{
    const x=col*300;
    b.fillStyle='#cde0df';b.font='18px sans-serif';b.fillText(names[col],x+24,115);
    [93,1,94].forEach((id,row)=>{
     const y=135+row*255;
     b.fillStyle=row===2?'#e5efeb':'#10232b';b.fillRect(x+10,y,280,238);
     // A quiet grid behind the animal makes genuine alpha transparency visible.
     b.strokeStyle=row===2?'#bfd1cb':'#26434b';b.lineWidth=1;
     for(let k=0;k<8;k++){b.beginPath();b.moveTo(x+10+k*40,y);b.lineTo(x+10+k*40,y+238);b.stroke()}
     for(let k=0;k<6;k++){b.beginPath();b.moveTo(x+10,y+k*40);b.lineTo(x+290,y+k*40);b.stroke()}
     const c=canvas();Art.fish(c,Sea.fish[id],'glow',.6,{...record,species:id});
     b.drawImage(c,x-14,y+5,328,205);
     b.fillStyle=row===2?'#41635e':'#a9c4c3';b.font='15px sans-serif';b.fillText(Sea.fish[id].name,x+24,y+222);
    });
   });
   return {image:board.toDataURL(),checked,colors:samples.length};
  })()`);
  const file=path.join(__dirname,'../artifacts/glow-translucent.png');
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,Buffer.from(result.image.split(',')[1],'base64'));
  console.log('PASS: '+result.colors+' colors; '+result.checked+' species checked for translucency, stable catch colors and unchanged original art.');
  app.exit(0);
 }catch(error){console.error(error);app.exit(1)}
});
