/* Reuse the finished image assets. No online generation or network calls at runtime. */
(function(){
const boat=new Image();
const atlases=[
 {file:'fish-0-alpha.png',cuts:[0,.20,.40,.575,.74,1]},
 {file:'fish-1-white.png',cuts:[0,.2,.4,.575,.78,1],whiteBackground:true},
 {file:'fish-2-white.png',cuts:[0,257,479,724,970,1254].map(y=>y/1254),whiteBackground:true,
  regions:{6:[630,257,982,479],7:[982,257,1254,479],8:[0,479,313,710],12:[0,710,313,970]}},
 {file:'fish-3-white.png',cuts:[0,244,510,740,973,1254].map(y=>y/1254),whiteBackground:true,
  regions:{4:[0,244,330,510],5:[330,244,660,510],6:[660,244,940,550],10:[627,550,940,740]}},
 {file:'fish-4-white.png',cuts:[0,255,493,725,977,1254].map(y=>y/1254),whiteBackground:true,
  regions:{13:[313.5,725,627,961],14:[627,725,940,990],17:[313.5,961,627,1254],18:[627,990,940,1254]}}
].map(atlas=>({...atlas,image:new Image()}));
function load(img,file){return new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('Could not load '+file));img.src='assets/soft-sea/'+file})}
const ready=Promise.all([load(boat,'boat.png'),...atlases.map(atlas=>load(atlas.image,atlas.file))]);
const reefSlots=[0,2,3,4,5,6,7,8,9,10,1,11,12,13,14,15,16,17,18,19];
const fishFrames=new Map(),sceneStates=new WeakMap();
function fish(canvas,f,trait='normal',t=0,catchRecord=null){
 const c=canvas.getContext('2d'),atlas=atlases[Math.floor(f.id/20)],img=atlas?.image;
 c.clearRect(0,0,canvas.width,canvas.height);
 if(!img?.complete||!img.naturalWidth)return;
 // One neutral source per species. Every special appearance is a composited filter.
 let source=fishFrames.get(f.id);
 if(!source){
  source=document.createElement('canvas');source.width=384;source.height=240;
  const sc=source.getContext('2d');
  {
   const slot=f.id<20?reefSlots[f.id]:f.id%20,col=slot%4,row=Math.floor(slot/4);
   const cuts=atlas.cuts;
   // A few long bills and tall fins extend beyond the nominal atlas grid.
   const region=atlas.regions?.[slot];
   const sx=region?region[0]/1254*img.width:col*img.width/4;
   const sy=region?region[1]/1254*img.height:cuts[row]*img.height;
   const sw=region?(region[2]-region[0])/1254*img.width:img.width/4;
   const sh=region?(region[3]-region[1])/1254*img.height:(cuts[row+1]-cuts[row])*img.height;
   const fit=Math.min(source.width/sw,source.height/sh)*.92;
   sc.imageSmoothingEnabled=true;sc.imageSmoothingQuality='high';
   sc.drawImage(img,sx,sy,sw,sh,(source.width-sw*fit)/2,(source.height-sh*fit)/2,sw*fit,sh*fit);
   // White-matte sheets need edge cleanup; transparent sheets retain native alpha.
   if(atlas.whiteBackground){
   // Remove only white background connected to the tile edge, preserving white markings.
   const pixels=sc.getImageData(0,0,384,240),a=pixels.data,seen=new Uint8Array(384*240),queue=[];
   function visit(i){if(i<0||i>=seen.length||seen[i])return;seen[i]=1;const j=i*4;if(a[j+3]===0||(a[j]>238&&a[j+1]>238&&a[j+2]>238)){queue.push(i);a[j+3]=0}}
   for(let x=0;x<384;x++){visit(x);visit(239*384+x)}for(let y=0;y<240;y++){visit(y*384);visit(y*384+383)}
   for(let k=0;k<queue.length;k++){const i=queue[k];if(i%384)visit(i-1);if(i%384<383)visit(i+1);visit(i-384);visit(i+384)}
   sc.putImageData(pixels,0,0);
   }
  }
  fishFrames.set(f.id,source);
 }
 const w=canvas.width,h=canvas.height,scale=catchRecord?Sea.displayScale(catchRecord):.72;
 const dw=w*scale,dh=h*scale,x=(w-dw)/2,y=(h-dh)/2+Math.sin(t*1.7)*h*.008;
 if(trait==='silhouette'){
  // Use the same modern outline, with no color, texture, or animation before discovery.
  c.save();c.drawImage(source,x,(h-dh)/2,dw,dh);
  c.globalCompositeOperation='source-in';c.fillStyle='#263f43';c.fillRect(0,0,w,h);c.restore();return;
 }
 const kind=['octopus','squid','horse','leafy','dumbo','vampire','blanket','garden'].includes(f.shape)?2:['manta','ray','electric'].includes(f.shape)?3:1;
 c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
 if(trait==='alternate')c.filter=`hue-rotate(${[115,200,285][f.id%3]}deg) saturate(1.7)`;
 if(trait==='glow')c.filter='saturate(1.4) brightness(1.18) drop-shadow(0px 0px 5px #47ffad) drop-shadow(0px 0px 12px #61f9d5)';
 Motion.draw(c,source,x,y,dw,dh,t,kind);c.restore();
 if(trait==='prism'){
  // Clip the holographic rainbow and moving foil reflection to the fish alpha.
  let foil=canvas._fishFoil;
  if(!foil){foil=document.createElement('canvas');canvas._fishFoil=foil}
  if(foil.width!==w||foil.height!==h){foil.width=w;foil.height=h}
  const fc=foil.getContext('2d');fc.clearRect(0,0,w,h);
  Motion.draw(fc,source,x,y,dw,dh,t,kind);
  fc.globalCompositeOperation='source-in';
  const shift=Math.sin(t*.7)*dw*.25;
  const rainbow=fc.createLinearGradient(x+dw*.25+shift,y,x+dw*.75+shift,y+dh);
  ['#ff28b5','#ffcf18','#28f790','#16cfff','#7840ff','#ff36c4'].forEach((color,i)=>rainbow.addColorStop(i/5,color));
  fc.fillStyle=rainbow;fc.fillRect(0,0,w,h);
  fc.globalCompositeOperation='source-atop';
  const shine=fc.createLinearGradient(x-dw+t%4/4*dw*3,0,x-dw+t%4/4*dw*3+dw*.35,h);
  shine.addColorStop(0,'#ffffff00');shine.addColorStop(.5,'#ffffffcc');shine.addColorStop(1,'#ffffff00');
  fc.fillStyle=shine;fc.fillRect(0,0,w,h);fc.globalCompositeOperation='source-over';
  c.save();c.globalCompositeOperation='color';c.globalAlpha=.85;c.drawImage(foil,0,0);c.restore();
 }
}
function scene(canvas,t,catching=false,record=null,elapsed=null){
 const w=640,h=372;if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
 const c=canvas.getContext('2d');c.clearRect(0,0,w,h);if(!boat.complete||!boat.naturalWidth)return;
 c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
 let state=sceneStates.get(canvas);if(!state){state={caught:false,start:t};sceneStates.set(canvas,state)}
 if(catching&&(!state.caught||state.catchId!==record?.id))state.start=t;
 state.caught=catching;state.catchId=record?.id;
 // Catch time remains independent of the idle clock, including a paused trial catch.
 const age=Math.max(0,elapsed??t-state.start);
 const tug=catching?(age<.2?-Math.sin(age/.2*Math.PI)*.55:Math.exp(-(age-.2)*3)*Math.sin(Math.min(1,(age-.2)/.16)*Math.PI/2)):0;
 c.save();c.translate(w/2,h/2+Math.sin(t*1.2)*2-tug*2);c.rotate(Math.sin(t*.7)*.006);
 const scale=Math.min(w/boat.width,h/boat.height);Motion.draw(c,boat,-boat.width*scale/2,-boat.height*scale/2,boat.width*scale,boat.height*scale,t,0,tug);c.restore();
 const bw=boat.width*scale,bh=boat.height*scale;
 const bobX=(w-bw)/2+bw*.885,bobY=(h-bh)/2+bh*.665;
 // Additional expanding ripples respond to the deformed line and water.
 c.strokeStyle=catching?'#fff5beaa':'#e5ffff66';c.lineWidth=1.3;
 for(let i=0;i<3;i++){const phase=(t*.35+i/3)%1;c.globalAlpha=(1-phase)*.55;c.beginPath();c.ellipse(bobX,bobY,8+phase*(catching?42:22),2+phase*6,0,0,Math.PI*2);c.stroke()}
 c.globalAlpha=1;
 if(catching&&age>=.24&&age<1.1){
  const p=(age-.24)/.86;
  c.save();c.fillStyle='#edffff';c.globalAlpha=1-p;
  for(let i=0;i<7;i++){
   const angle=Math.PI*(1.12+i*.125),radius=12+p*52;
   c.beginPath();c.ellipse(bobX+Math.cos(angle)*radius,bobY+Math.sin(angle)*radius+p*p*30,1.5,2.5,angle,0,Math.PI*2);c.fill();
  }
  c.restore();
  if(record&&Sea.fish[record.species]){
   if(!state.fish){state.fish=document.createElement('canvas');state.fish.width=240;state.fish.height=150}
   fish(state.fish,Sea.fish[record.species],record.trait,t+age*2,record);
   const x=bobX+(w*.53-bobX)*p,y=bobY+(h*.48-bobY)*p-Math.sin(p*Math.PI)*120;
   c.save();c.translate(x,y);c.rotate(-.5+Math.sin(p*Math.PI*3)*.3+p*.8);
   c.globalAlpha=Math.min(1,p*10,(1-p)*8);c.drawImage(state.fish,-100,-62.5,200,125);c.restore();
  }
 }
}
window.Art={fish,scene,ready,catchRevealDelay:1100,style:'soft-sea',upgradedSpecies:Sea.fish.length};
})();
