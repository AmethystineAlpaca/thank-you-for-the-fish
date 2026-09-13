(function(){
const sprites=new Map();
function sprite(f,trait,frame=0){
const key=`${f.id}:${trait}:${frame}`;if(sprites.has(key))return sprites.get(key);
const a=document.createElement('canvas');a.width=128;a.height=80;const c=a.getContext('2d',{willReadFrequently:true});c.translate(64,40);
const d=FishDesigns[f.id], [back,side,belly,fin]=d.colors, ink='#182c39';const {w,h,form,mark}=d;
const wave=Math.sin(frame*Math.PI/2);const grad=(top,bottom,y=-h,z=h)=>{const g=c.createLinearGradient(0,y,0,z);g.addColorStop(0,top);g.addColorStop(.45,side);g.addColorStop(1,bottom);return g};
const bodyFill=grad(back,belly);
function path(points){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath()}
function poly(points,color,outline=true){path(points);c.fillStyle=color;c.fill();if(outline){c.strokeStyle=ink;c.lineWidth=1.2;c.stroke()}}
function ellipse(x,y,rx,ry,color,outline=false){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();if(outline){c.strokeStyle=ink;c.lineWidth=1.1;c.stroke()}}
function line(points,color,width=1){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke()}
function curve(points,color,width=1){c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length;i+=3)c.bezierCurveTo(...points[i],...points[i+1],...points[i+2]);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke()}
function eye(x,y,r=2.5){ellipse(x,y,r+1,r+1,'#d8cfaa');ellipse(x+.5,y,r,r,ink);c.fillStyle='#f6f8e3';c.fillRect(Math.round(x),Math.round(y-r+1),1,1)}
function finShape(points,color=fin){poly(points,color);const origin=points[0];for(let i=1;i<points.length-1;i++){line([origin,points[i]],'#e6e3bc55',.7)}}
function spots(color,count=30,rx=w,ry=h){for(let i=0;i<count;i++){const x=((i*37+f.id*13)%101)/101*rx*2-rx,y=((i*23+f.id*7)%79)/79*ry*2-ry;ellipse(x,y,mark==='whale'?1:1.3,mark==='whale'?.8:1,color)}}
function markings(){
if(['clown','ocellaris'].includes(mark)){for(const [x,width] of (mark==='clown'?[[w*.52,5],[-w*.22,6],[-w*.89,3]]:[[w*.55,5],[-w*.15,7],[-w*.83,4]])){poly([[x-2,-h-2],[x+width,-h-2],[x+width+1,h+2],[x-1,h+2],[x+1,2]],'#faf2d9');}}
if(mark==='palette'){poly([[-w,-4],[-w*.7,-h*.7],[0,-h*.83],[w*.6,-h*.5],[w*.73,-2],[w*.35,1],[-w*.15,-2],[-w*.65,h*.45],[-w*.9,h*.2],[-w*.46,-2]],'#152647',false);ellipse(-4,-7,9,3,'#397deb');}
if(['three','five','six','bars','flame','bat','banner'].includes(mark)){const n={three:3,five:5,six:6,flame:5,bat:2,banner:2,bars:6}[mark];for(let i=0;i<n;i++){const x=-w+i*w*2/n+4;poly([[x,-h-4],[x+4,-h-4],[x+1,h+4],[x-3,h+4]],mark==='flame'?'#4a302e':'#333f44',false)}}
if(['stripe','cleaner','lines','bellylines','emperor'].includes(mark)){let count=mark==='emperor'?8:mark==='lines'||mark==='bellylines'?4:1;for(let i=0;i<count;i++){const y=count===1?0:-h*.6+i*h*1.5/count;curve([[-w-2,y],[-10,y+1],[15,y-2],[w+3,y]],mark==='emperor'?'#eddb76':mark==='cleaner'?'#1b2c38':'#496d7888',mark==='cleaner'?5:1.3)}}
if(['mackerel','waves','maze','mandarin','chevron','beauty'].includes(mark)){for(let i=0;i<9;i++){let x=-w+i*7;curve([[x,-h],[x-6,-h/3],[x+7,0],[x-2,h]],mark==='mandarin'?'#efa356':mark==='beauty'?'#e3a365':mark==='maze'?'#407779':'#37535b',mark==='mandarin'?2.5:1.2);if(mark==='mandarin')curve([[x+2,-h],[x-4,-h/3],[x+9,0],[x,h]],'#1765a2',1)}}
if(['dots','spots','speckles','mottled','leopard','bluedots','whale','coconut'].includes(mark)){spots(mark==='whale'||mark==='bluedots'?'#c5e8d8':mark==='speckles'?'#e5d6ab99':'#4e594c',mark==='whale'?55:32);if(mark==='mottled')spots('#695f4166',17)}
if(mark==='eyespot'){ellipse(-w*.55,0,7,7,'#f5ecd2');ellipse(-w*.55,0,5,5,'#303e42');line([[w*.65,-h],[w*.5,h]],'#3e4540',4)}
if(mark==='mask'||mark==='emperor'){poly([[w*.55,-h],[w+1,-h],[w+1,-1],[w*.48,0]],'#2a353d',false)}
if(mark==='scutes'){for(let i=0;i<9;i++){let x=-w+3+i*6;poly([[x,1],[x+3,-1],[x+5,1],[x+2,3]],'#e0dfbb',false)}}
if(mark==='gold'){line([[-w,5],[w*.7,4]],'#f3cd62',2)}
if(mark==='lights'){for(let i=0;i<10;i++)ellipse(-w+4+i*w*.17,h*.7,1,1,'#bbecdd')}
if(mark==='flamboyant'){for(let i=0;i<5;i++){const x=-w+i*10;poly([[x,-h],[x+6,-h],[x+2,h],[x-4,h]],i%2?'#eadfae':'#a64272',false)}}
}
function standard(){
// Different species have different back curves, jaws, tail shapes and fin placement.
let dorsal=['angel','batfish','banner'].includes(form)?18:['tuna','bill'].includes(form)?14:form==='sail'?25:form==='butterfly'||form==='tang'?8:6;
if(form==='mahi')dorsal=8;
const tailX=-w-15+wave*2;
if(d.tail==='round'){ellipse(-w-7+wave,0,9,8,fin,true);poly([[-w+3,-3],[-w-8,-5],[-w-8,5],[-w+3,3]],fin,false);for(let j=-1;j<=1;j++)line([[-w+2,0],[-w-13,j*5]],'#f4e5b344',.7)}else if(d.tail==='fan'){finShape([[-w+3,-3],[tailX+4,-10],[tailX,-7],[tailX,7],[tailX+4,10],[-w+3,3]])}
else if(d.tail==='crescent'){finShape([[-w+2,-2],[tailX-2,-19],[tailX+4,-7],[-w-4,0],[tailX+4,7],[tailX-2,19],[-w+2,2]])}
else if(d.tail==='shark'){finShape([[-w+3,-2],[tailX-4,-20],[tailX+1,-5],[-w-5,1],[tailX,12],[-w+3,4]])}
else if(d.tail==='trilobe'){finShape([[-w+4,-3],[tailX,-13],[tailX-2,-5],[tailX-9,0],[tailX-2,5],[tailX,13],[-w+4,3]])}
else{finShape([[-w+4,-3],[tailX,-13+wave],[tailX+4,0],[tailX,13+wave],[-w+4,3]])}
if(form==='mahi'||form==='wrasse'){finShape([[-w+3,-h*.55],[-w,-h-4],[w*.6,-h-dorsal],[w*.7,-h*.45]])}
else if(form==='sail'){finShape([[-w+2,-h*.6],[-w,-h-18],[-w*.4,-h-22],[w*.3,-h-20],[w*.6,-h*.5]],'#385e86');for(let i=0;i<8;i++)line([[-w+i*6,-h*.7],[-w+i*6,-h-17]],'#89b7cf',.8)}
else if(form==='clown'){finShape([[-w*.8,-h*.5],[-w*.65,-h-2],[-w*.3,-h-5],[w*.15,-h-4],[w*.45,-h*.7]])}else{finShape([[-w*.8,-h*.5],[-w*.6,-h-dorsal*.7],[0,-h-dorsal],[w*.4,-h*.8]],mark==='palette'?'#3579d5':fin)}
finShape([[-w*.65,h*.5],[-w*.5,h+(form==='batfish'?16:7)],[w*.35,h*.65]],mark==='palette'?'#387bd8':fin);
if(['bass','bream','grouper','goby'].includes(form))for(let i=0;i<8;i++)finShape([[-w*.65+i*5,-h*.75],[-w*.7+i*5,-h-5-(i%2)*3],[-w*.4+i*5,-h*.75]]);
if(form==='banner')curve([[0,-h],[0,-h-9],[-12,-h-16],[-23,-h-15]],'#f5eccb',2);
if(['flying','gurnard'].includes(form)){finShape([[w*.35,-2],[-12,-30],[-40,-19],[-18,4]],'#63999e');finShape([[w*.35,4],[-12,29],[-40,19],[-16,3]],form==='gurnard'?'#599d9d':'#8eb7b8')}
const high=['butterfly','angel','tang','batfish','banner','pomfret','opah'].includes(form);
let pts=high?[[-w,0],[-w*.6,-h*.8],[-w*.1,-h],[w*.45,-h*.78],[w*.72,-h*.4],[w,0],[w*.73,h*.45],[w*.15,h],[-w*.5,h*.8]]:[[-w,0],[-w*.62,-h*.65],[-w*.1,-h],[w*.5,-h*.7],[w*.82,-h*.35],[w,0],[w*.87,h*.35],[w*.35,h*.8],[-w*.25,h*.85],[-w*.7,h*.4]];
if(form==='clown')pts=[[-w,0],[-w*.85,-h*.45],[-w*.5,-h*.85],[0,-h],[w*.45,-h*.8],[w*.78,-h*.4],[w,0],[w*.94,h*.2],[w*.6,h*.65],[w*.1,h*.9],[-w*.45,h*.75],[-w*.85,h*.3]];
if(form==='mahi')pts=[[-w,0],[-w*.7,-h*.6],[w*.4,-h],[w*.75,-h],[w*.93,-h*.5],[w,2],[w*.7,h*.5],[-w*.2,h*.5]];
if(form==='napoleon')pts=[[-w,0],[-w*.5,-h*.7],[0,-h],[w*.55,-h-4],[w*.8,-h*.7],[w*.7,-h*.15],[w+2,1],[w+1,5],[w*.7,6],[w*.25,h],[-w*.55,h*.65]];
poly(pts,bodyFill);c.save();path(pts);c.clip();markings();line([[-w*.5,-h*.4],[0,-h*.65],[w*.3,-h*.4]],'#f5efce44');c.restore();
if(['bill','sail','needle','paddle','barracuda'].includes(form)){const len=form==='barracuda'?5:form==='needle'?18:23;poly([[w*.78,-3],[w+len,-4],[w+len,form==='needle'?-1:-3],[w*.84,2]],side)}
if(['butterfly','banner'].includes(form)){poly([[w*.72,-4],[w+(f.id===4?12:5),0],[w+(f.id===4?12:5),2],[w*.7,5]],side)}
const ex=w*.66,ey=-h*.24;eye(ex,ey,form==='silver'?2:2.5);curve([[w*.42,-h*.42],[w*.3,-1],[w*.35,h*.35],[w*.5,h*.5]],back,1);line([[w-4,3],[w,2]],ink);
finShape([[w*.3,2],[w*.04+wave*2,h*.7],[-w*.2,6],[w*.23,0]],fin);
if(['tuna','bill','sail'].includes(form))for(let i=0;i<5;i++){const x=-w+3+i*4;poly([[x,-3-i],[x+2,-7-i],[x+4,-4-i]],fin,false);poly([[x,3+i],[x+2,7+i],[x+4,4+i]],fin,false)}
if(mark==='yellowfin'){finShape([[1,-h],[-7,-h-15],[-8,-h*.5]]);finShape([[0,h],[-8,h+12],[-7,h*.5]])}
if(mark==='longfin')finShape([[w*.3,1],[-w*.85,h+7],[-w*.2,3]],'#8cabb8');
if(form==='mandarin')finShape([[w*.2,3],[-10,h+9],[-18,h],[0,4]],'#e8a35a');
}
if(['cuttle','squid'].includes(form)){
const squid=form==='squid';c.translate(squid?0:-4,squid?-4:0);
if(squid){finShape([[0,-28],[-20,-7],[-8,1],[8,1],[20,-7]],fin);poly([[0,-30],[-9,-18],[-10,5],[-5,12],[5,12],[10,5],[9,-18]],bodyFill)}else{for(let i=0;i<12;i++){ellipse(-24+i*4,-9-Math.sin(i+frame)*2,4,4,fin);ellipse(-24+i*4,9+Math.sin(i+frame)*2,4,4,fin)}ellipse(-3,0,25,13,bodyFill,true)}
c.save();if(squid){path([[0,-30],[-9,-18],[-10,5],[10,5],[9,-18]])}else{c.beginPath();c.ellipse(-3,0,24,12,0,0,7)}c.clip();markings();c.restore();
for(let i=0;i<8;i++){const x=squid?-8+i*2:17;const y=squid?9:-9+i*2.5;curve(squid?[[x,y],[x+wave*2,y+7],[x-5+i,y+14],[x-7+i*2,y+18+i%2*3]]:[[x,y],[x+9,y-2],[x+15,y+wave*2],[x+19-i%3*3,y+4]],side,2)}if(squid){eye(-6,8,2.5);eye(6,8,2.5)}else{eye(17,-4,3.3);line([[15,-4],[19,-4]],ink,1.5)}
}else if(['octopus','dumbo','vampire','blanket'].includes(form)){
const web=form==='vampire'||form==='blanket';if(form==='dumbo'){ellipse(-18,-13,9,6,fin,true);ellipse(18,-13,9,6,fin,true)}
if(web)poly([[-13,-3],[-32,20],[-20,14],[-12,29],[0,21],[13,30],[22,15],[32,21],[13,-3]],grad(back,belly),true);
for(let i=0;i<8;i++){const x=-14+i*4,y=4;const end=-32+i*9;curve([[x,y],[x*1.4,18],[end+wave*3,30],[end+Math.sin(i)*6,20]],ink,4);curve([[x,y],[x*1.4,18],[end+wave*3,30],[end+Math.sin(i)*6,20]],side,2.5);for(let j=0;j<3;j++)ellipse(x+(end-x)*j/4,12+j*3,1,1,belly)}
ellipse(0,-8,form==='dumbo'?17:15,18,bodyFill,true);if(mark==='coconut')for(let i=0;i<10;i++)ellipse(-9+(i*7)%19,-19+(i*9)%23,1,1,back);eye(-8,-1,3);eye(8,-1,3);
}else if(['manta','ray','electric'].includes(form)){
curve([[0,10],[3,18],[-4,27],[wave*3,34]],side,form==='electric'?5:2);
const wing=form==='electric'?27:form==='manta'?43:36;
poly([[0,-19],[-9,-12],[-wing,-3-wave*2],[-wing*.75,6],[-12,14],[0,23],[12,14],[wing*.75,6],[wing,-3-wave*2],[9,-12]],bodyFill);
if(form==='manta'){curve([[-7,-14],[-12,-25],[-2,-28],[-4,-20]],side,4);curve([[7,-14],[12,-25],[2,-28],[4,-20]],side,4)}
if(mark==='spots')for(let i=0;i<24;i++){let x=-24+i*2,y=Math.sin(i*5)*6;ellipse(x,y,1,1,'#d7e1cc')}
line([[0,-12],[0,16]],'#d0d9c144');eye(-6,-10,1.6);eye(6,-10,1.6);
}else if(['horse','leafy','dragon','garden'].includes(form)){
if(form==='garden'){curve([[-10,29],[-11,11],[13,5],[8,-20]],ink,10);curve([[-10,29],[-11,11],[13,5],[8,-20]],side,8);for(let i=0;i<10;i++)ellipse(-7+Math.sin(i*.5)*14,25-i*4,1,1,back);eye(10,-21,1.5)}
else {curve([[-7,-4],[-27,20],[15,32],[14,18]],ink,9);curve([[-7,-4],[-27,20],[15,32],[14,18]],side,7);curve([[-7,-4],[6,-14],[-9,-16],[-2,-24]],ink,12);curve([[-7,-4],[6,-14],[-9,-16],[-2,-24]],side,10);poly([[-5,-24],[3,-27],[12,-22],[23,-19],[22,-15],[8,-17],[1,-11],[-7,-14]],bodyFill);eye(7,-22,2);finShape([[-13,0],[-24,-6],[-22,9],[-13,8]],fin);for(let i=0;i<8;i++)line([[-13,1+i*2],[-5,2+i*2]],back);for(let i=0;i<3;i++)poly([[-3+i*4,-23],[-5+i*4,-30],[-1+i*4,-24]],fin);
if(form==='leafy'||form==='dragon'){for(let i=0;i<10;i++){let x=-19+i*4,y=8+Math.sin(i)*10;line([[x,y],[x-8,y-12]],fin,1);poly([[x-7,y-7],[x-17,y-12],[x-11,y-19],[x-4,y-15]],i%2?side:fin)}}}
}else if(['eel','catfish','ribbon','gulper'].includes(form)){
const points=[[-49,11],[-22,23],[-19,-7],[13,-3],[25,0],[30,4],[39,0]];
curve(points,ink,form==='gulper'?10:12);curve(points,side,form==='ribbon'?7:9);curve([[-49,8],[-22,17],[-19,-10],[14,-7]],fin,3);
ellipse(29,-2,12,7,bodyFill,true);if(form==='gulper')poly([[16,-6],[37,-4],[42,10],[23,18],[11,0]],bodyFill);eye(33,-4,2);line([[32,3],[41,1]],ink);
if(form==='catfish'){for(let i=0;i<3;i++)curve([[38,2],[44,6],[40,12],[48,10+i*3]],belly,1)}
if(form==='ribbon'){for(let i=0;i<4;i++)curve([[25-i*3,-7],[23-i*4,-20],[31-i*2,-24],[26-i*4,-28]],fin,1.5)}
}else if(['shark','whaleshark','hammer','saw'].includes(form)){
finShape([[-w+4,1],[-w-13,-21],[-w-10,-4],[-w-17,12],[-w+4,5]]);const dx=mark==='sixgill'?-12:1;finShape([[dx-15,-7],[dx,-27],[dx+8,-8]]);finShape([[5,5],[-10,23],[20,9]]);finShape([[-19,4],[-26,12],[-10,7]]);
poly([[-w,2],[-w*.6,-6],[4,-12],[w*.75,-9],[w,-3],[w+1,2],[w*.75,8],[0,10],[-w*.6,5]],bodyFill);
c.save();path([[-w,2],[-w*.6,-6],[4,-12],[w*.75,-9],[w,-3],[w+1,2],[w*.75,8],[0,10],[-w*.6,5]]);c.clip();markings();c.restore();
if(form==='hammer'){poly([[w-9,-3],[w-9,-16],[w,-18],[w+3,-13],[w-1,-6],[w+2,9],[w-3,14],[w-10,10]],bodyFill);eye(w-2,-14,1.5);eye(w-3,10,1.5)}else{eye(w-7,-3,2)}
if(form==='saw'){poly([[w-3,-4],[w+23,-4],[w+23,-1],[w-3,2]],side);for(let i=0;i<7;i++){poly([[w+i*3,-3],[w+i*3-1,-7],[w+i*3+2,-3]],belly,false);poly([[w+i*3,0],[w+i*3-1,4],[w+i*3+2,0]],belly,false)}}
for(let i=0;i<(mark==='sixgill'?6:5);i++)line([[w*.4-i*3,-3],[w*.4-i*3-1,5]],back,1);line([[w-9,5],[w,3]],ink);
}else if(['sunfish','puffer','box','frog','angler','blob','barreleye','fang','viper','hatchet','flat','sole','nautilus','isopod','lion','sturgeon'].includes(form)){
if(form==='nautilus'){ellipse(-5,0,24,24,bodyFill,true);for(let i=0;i<10;i++){let angle=i*.59;line([[-5+Math.cos(angle)*14,Math.sin(angle)*14],[-5+Math.cos(angle)*23,Math.sin(angle)*23]],back,3)}const spiral=[];for(let i=0;i<60;i++){let r=i*.21;spiral.push([-5+Math.cos(i*.22)*r,Math.sin(i*.22)*r])}line(spiral,back,1.5);for(let i=0;i<10;i++)curve([[15,9],[28,2+i],[34,4+i*2],[40+wave*2,1+i*2]],belly,1.5);eye(20,7,2)}
else if(form==='isopod'){ellipse(0,0,32,17,bodyFill,true);for(let i=0;i<8;i++){let x=-26+i*7;curve([[x,-13],[x+4,-5],[x+4,5],[x,14]],back,1.4);line([[x,12],[x-5,20],[x-9,18]],fin,2);line([[x,-12],[x-5,-20],[x-9,-18]],fin,2)}curve([[27,-4],[36,-16],[42,-11],[49,-17]],side,1);curve([[27,4],[38,10],[42,6],[49,12]],side,1);eye(26,-7,1.8);eye(26,7,1.8)}
else if(form==='flat'||form==='sole'){finShape([[-w,0],[-w-12,-8],[-w-12,8]]);poly([[-w,0],[-w*.5,-h-4],[w*.4,-h-3],[w+4,0],[w*.4,h+3],[-w*.5,h+4]],fin);ellipse(0,0,w,h,bodyFill,true);c.save();c.beginPath();c.ellipse(0,0,w,h,0,0,7);c.clip();markings();c.restore();eye(w*.65,-5,2);eye(w*.7,1,2);curve([[-w*.7,1],[0,3],[w*.3,0],[w*.8,3]],back)}
else if(form==='sturgeon'){standard();for(let i=0;i<7;i++)poly([[-23+i*7,-8],[-21+i*7,-12],[-18+i*7,-8]],belly);for(let i=0;i<3;i++)line([[w-2-i*3,4],[w-4-i*3,12]],belly);}
else if(form==='lion'){for(let i=0;i<10;i++){let x=-22+i*5;finShape([[x,-7],[x-13,-30+(i%3)*4],[x+4,-8]],i%2?side:belly)}for(let i=0;i<8;i++){let x=-28+i*7;finShape([[10,4],[x,27-Math.abs(i-4)*2],[x+5,22]],i%2?side:belly)}ellipse(0,0,26,13,bodyFill,true);c.save();c.beginPath();c.ellipse(0,0,26,13,0,0,7);c.clip();for(let i=0;i<6;i++)line([[-23+i*9,-15],[-28+i*9,16]],belly,3);c.restore();eye(18,-3,3);finShape([[-24,0],[-40,-10],[-40,11]],fin)}
else {
if(form==='sunfish'){finShape([[-6,-14],[-3,-35],[9,-32],[12,-15]],fin);finShape([[-5,14],[-2,34],[8,30],[12,14]],fin);poly([[-22,-16],[-29,-12],[-27,-6],[-30,0],[-27,6],[-29,12],[-22,17]],fin)}else{finShape([[-w+5,-2],[-w-13,-10],[-w-12,10],[-w+5,3]],fin)}
let pts=form==='box'?[[-25,-11],[-15,-18],[17,-17],[27,-6],[26,13],[-18,17],[-26,8]]:form==='hatchet'?[[-24,-5],[4,-16],[22,-6],[17,18],[3,24],[-11,9]]:[[-w,0],[-w*.6,-h*.8],[w*.25,-h],[w*.8,-h*.6],[w,0],[w*.85,h*.6],[0,h],[-w*.7,h*.5]];
poly(pts,bodyFill);c.save();path(pts);c.clip();markings();c.restore();
if(form==='puffer')for(let i=0;i<15;i++){const theta=i/15*Math.PI*2;line([[Math.cos(theta)*w*.9,Math.sin(theta)*h*.9],[Math.cos(theta)*(w+4),Math.sin(theta)*(h+4)]],belly,1)}
if(['angler','frog'].includes(form)){curve([[4,-h],[1,-34],[32,-34],[29,-20]],side,1.5);ellipse(29,-19,3,3,form==='angler'?'#b9eed3':belly);finShape([[7,9],[-1,22],[13,16]],fin)}
if(['angler','fang','viper'].includes(form)){poly([[w*.2,1],[w+2,-2],[w-4,h*.7],[w*.15,h*.4]],'#24313b');for(let i=0;i<6;i++){poly([[w*.3+i*3,0],[w*.35+i*3,5+i%2*3],[w*.4+i*3,0]],belly,false);}}
if(form==='barreleye'){ellipse(15,-7,14,12,'#9dd5c67a',true);ellipse(12,-10,3,6,'#88be81');ellipse(22,-10,3,6,'#91ce8a')}else{eye(w*.63,-h*.25,form==='puffer'?3.7:2.7)}
if(form==='blob'){ellipse(w*.75,2,4,4,side);curve([[w*.2,8],[w*.5,10],[w*.7,7],[w*.85,8]],back)}
finShape([[w*.3,3],[w*.05,h*.8],[-5,4]],fin);
}
}else{standard()}
// Pixel palette quantization gives deliberate pixel edges without a smooth vector outline.
c.setTransform(1,0,0,1,0,0);const pixels=c.getImageData(0,0,128,80);for(let i=0;i<pixels.data.length;i+=4){let data=pixels.data;if(data[i+3]<125){data[i+3]=0;continue}data[i+3]=255;if(trait==='silhouette'){data[i]=7;data[i+1]=16;data[i+2]=22;continue}if(trait==='alternate'){const r=data[i],g=data[i+1],b=data[i+2];data[i]=g*.45+b*.55;data[i+1]=b*.35+r*.65;data[i+2]=r*.55+g*.45}if(trait==='glow'){data[i]=data[i]*.7;data[i+1]=Math.min(255,data[i+1]*1.12+20);data[i+2]=Math.min(255,data[i+2]*1.1+15)}for(let j=0;j<3;j++)data[i+j]=Math.round(data[i+j]/12)*12;}c.putImageData(pixels,0,0);
if(trait==='prism'){c.globalCompositeOperation='source-atop';const g=c.createLinearGradient(10,10,118,70);['#ee8bb5','#f7d797','#8ae3c1','#83b8ef'].forEach((col,i)=>g.addColorStop(i/3,col));c.globalAlpha=.32;c.fillStyle=g;c.fillRect(0,0,128,80);c.globalAlpha=1;c.globalCompositeOperation='source-over'}
sprites.set(key,a);return a;
}
function fish(canvas,f,trait='normal',time=0){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.imageSmoothingEnabled=false;const frame=Math.floor(time*2)%4;const img=sprite(f,trait,frame);const scale=Math.min(canvas.width/128,canvas.height/80)*.95;const x=(canvas.width-128*scale)/2,y=(canvas.height-80*scale)/2+Math.round(Math.sin(time*1.8)*scale);if(trait==='glow'){c.shadowColor='#8eecc5';c.shadowBlur=10}c.drawImage(img,x,y,128*scale,80*scale);c.shadowBlur=0;if(trait==='prism'||trait==='glow'){for(let i=0;i<3;i++){const xx=canvas.width*(.18+i*.31),yy=canvas.height*(.24+.08*Math.sin(time+i*2));c.fillStyle='#e8ebc2';c.fillRect(xx,yy,3,1);c.fillRect(xx+1,yy-1,1,3)}}}
function scene(canvas,t,catching=false){const c=canvas.getContext('2d');const w=320,h=186;canvas.width=w;canvas.height=h;const r=(x,y,a,b,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),a,b)};
c.clearRect(0,0,w,h);let water=c.createLinearGradient(0,110,0,186);water.addColorStop(0,'#3caca9');water.addColorStop(.5,'#246b78');water.addColorStop(1,'#143b52');c.fillStyle=water;const widths=[160,230,270,290,280,248,196];widths.forEach((a,i)=>c.fillRect((320-a)/2,119+i*9,a,10));for(let i=0;i<42;i++){const x=35+(i*43)%250,y=128+(i*17)%48;r(x+Math.sin(t+i)*5,y,4+i%14,2,i%3?'#4ca6a5':'#8ad4bd')}
c.save();c.translate(0,Math.round(Math.sin(t*1.4)*2));
// wooden hull and its individual planks
r(79,123,150,9,'#422f31');r(89,132,130,8,'#422f31');r(101,140,107,5,'#422f31');r(80,119,148,7,'#d0a273');r(89,127,130,7,'#a76d4c');r(100,135,108,5,'#845139');for(let i=0;i<7;i++){r(91+i*19,119,2,15,'#694936');r(95+i*19,120,12,2,'#ebbc80')}r(69,114,22,6,'#e7bf87');r(222,114,18,6,'#e7bf87');
// cabin boxes, lantern, reeds
r(105,104,22,15,'#735546');r(108,106,16,3,'#b98a62');r(112,110,2,6,'#c9a477');r(94,76,3,42,'#4f4b49');r(91,78,18,3,'#4f4b49');r(102,83,9,16,'#413c40');r(104,86,5,9,'#ffe3a0');c.fillStyle='rgba(255,218,141,.07)';c.fillRect(91,78,32,28);
// seated angler
r(154,104,6,15,'#283e4c');r(172,103,6,17,'#283e4c');r(153,117,11,4,'#1a303e');r(171,117,11,4,'#1a303e');r(151,83,26,22,'#dcaa6b');r(150,86,7,17,'#b97450');r(166,88,19,7,'#edbb86');r(181,87,8,5,'#f4d0a2');r(157,65,17,18,'#edbb86');r(154,65,8,14,'#564238');r(170,70,3,3,'#263c47');r(149,61,33,6,'#805d43');r(155,52,21,10,'#d6ad73');r(158,52,16,3,'#f1cb8d');r(155,59,21,3,'#705a45');r(150,102,30,5,'#826048');
// rod and line
c.strokeStyle='#e1bb88';c.lineWidth=2;c.beginPath();c.moveTo(184,90);c.lineTo(211,catching?40:60);c.lineTo(232,catching?43:65);c.stroke();c.strokeStyle='#c8e5d2';c.lineWidth=1;c.beginPath();c.moveTo(232,catching?43:65);c.lineTo(247,catching?80:143);c.stroke();r(244,catching?78:140,5,4,'#eb846c');r(244,catching?82:144,5,3,'#f4e4b7');c.restore();
for(let i=0;i<5;i++){r(75+i*42+Math.sin(t*.6+i)*7,65+(i*19)%39,2,2,'#e0d5a1')}
}
window.Art={fish,scene};})();
