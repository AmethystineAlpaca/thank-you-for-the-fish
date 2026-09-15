/* Remove neighboring atlas fragments without keying pale animals by color. */
(function(root){
function clean(data,width,height,gap=6){
 const count=width*height,labels=new Int32Array(count),queue=new Int32Array(count);
 let label=0,main=0,mass=0;const border=[];
 const neighbors=(i,visit)=>{
  const x=i%width,y=Math.floor(i/width);
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
   const xx=x+dx,yy=y+dy;
   if((dx||dy)&&xx>=0&&xx<width&&yy>=0&&yy<height)visit(yy*width+xx);
  }
 };
 for(let start=0;start<count;start++){
  if(labels[start]||data[start*4+3]<8)continue;
  label++;let head=0,tail=1,weight=0;queue[0]=start;labels[start]=label;
  while(head<tail){
   const i=queue[head++];weight+=data[i*4+3];
   if(i<width||i>=count-width||i%width===0||i%width===width-1)border[label]=true;
   neighbors(i,n=>{if(!labels[n]&&data[n*4+3]>=8){labels[n]=label;queue[tail++]=n}});
  }
  if(weight>mass){mass=weight;main=label}
 }
 if(!main){for(let i=0;i<count;i++)data[i*4+3]=0;return}
 // Keep nearby antialiased feeler tips. Never erode the silhouette or key
 // white markings and translucent membranes out of the animal itself.
 const distance=new Int16Array(count);distance.fill(-1);
 const keep=new Uint8Array(label+1);keep[main]=1;
 let head=0,tail=0;
 for(let i=0;i<count;i++)if(labels[i]===main){distance[i]=0;queue[tail++]=i}
 while(head<tail){
  const i=queue[head++];if(distance[i]>=gap)continue;
  neighbors(i,n=>{
   if(distance[n]>=0)return;
   distance[n]=distance[i]+1;queue[tail++]=n;
   if(labels[n]&&!border[labels[n]])keep[labels[n]]=1;
  });
 }
 for(let i=0;i<count;i++){
  if(labels[i]){if(!keep[labels[i]])data[i*4+3]=0;continue}
  // Retain faint antialiasing next to kept tissue, but not invisible bridges
  // or isolated low-alpha dust that can connect neighboring atlas subjects.
  let edge=false;neighbors(i,n=>{if(keep[labels[n]])edge=true});
  if(!edge)data[i*4+3]=0;
 }
}
if(typeof module!=='undefined')module.exports={clean};else root.SpriteAlpha={clean};
})(typeof window==='undefined'?globalThis:window);
