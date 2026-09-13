let state,until=0,strikeAt=0,last,shown=false,seconds=0,previous=performance.now(),pointer=.48;
const $=s=>document.querySelector(s);
desktop.state().then(s=>state=s);desktop.onState(s=>state=s);
desktop.onCatch(c=>{last=c;strikeAt=performance.now();until=strikeAt+6500;shown=false;$('#toast').hidden=true;$('#bite').classList.add('struck')});
$('#basket').onclick=()=>desktop.collection();
$('#pause').onclick=()=>state&&desktop.settings({...state.settings,paused:!state.settings.paused});
let lastPaint=0;
function frame(now){
 if(now-lastPaint<1000/30){requestAnimationFrame(frame);return}lastPaint=now;
 const dt=Math.min(.1,(now-previous)/1000);previous=now;
 if(state&&!state.settings.paused)seconds+=dt;
 const caught=now<until;
 Art.scene($('#scene'),seconds,caught,last,(now-strikeAt)/1000);
 if(caught&&now-strikeAt>Art.catchRevealDelay&&!shown){shown=true;$('#toast').hidden=false;$('#toast span').textContent=`${Sea.traits.find(t=>t.id===last.trait).name} · ${Sea.fish[last.species].name}  ${Sea.catchWeight(last)} g`;}
 if(caught&&shown)Art.fish($('#toast canvas'),Sea.fish[last.species],last.trait,seconds,last);
 if(!caught){$('#toast').hidden=true;$('#bite').classList.remove('struck')}
 if(state){
  const paused=state.settings.paused;
  $('#unread').textContent=state.unread;$('#pause').textContent=paused?'▶':'Ⅱ';
  $('#bite').classList.toggle('paused',paused);$('#bite-label').textContent=paused?'休息中':'咬钩！';$('#bite').setAttribute('aria-label',paused?'垂钓已暂停':caught?'咬钩了！':'鱼讯摇摆中，等待咬钩');
  const start=state.started||state.next-state.settings.max*60000;
  const progress=(Date.now()-start)/Math.max(1,state.next-start);
  const target=caught?1:Bite.position(progress,seconds,(start/1000)%6.28);
  if(!paused||caught)pointer+=(target-pointer)*(1-Math.exp(-dt*(caught?14:4)));
  $('#bite-pointer').style.left=`${pointer*100}%`;
 }
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
// Keep the pixel composition intact while the native transparent window changes size.
function fitWidget(){const scale=window.innerWidth/360;$('#widget-root').style.transform=`scale(${scale})`}
window.addEventListener('resize',fitWidget);fitWidget();
const handle=$('#resize-handle');let dragging=false,ready=false,pendingPoint=null;
const pointerPosition=event=>({x:window.screenX+event.clientX,y:window.screenY+event.clientY});
handle.addEventListener('pointerdown',async event=>{
 if(event.button!==0)return;
 event.preventDefault();dragging=true;ready=false;pendingPoint=null;
 handle.setPointerCapture(event.pointerId);handle.classList.add('resizing');
 await desktop.resizeStart(pointerPosition(event));
 ready=true;
 if(!dragging){desktop.resizeEnd();return}
 if(pendingPoint)desktop.resizeMove(pendingPoint);
});
handle.addEventListener('pointermove',event=>{
 if(!dragging)return;
 pendingPoint=pointerPosition(event);
 if(ready)desktop.resizeMove(pendingPoint);
});
function endResize(){dragging=false;handle.classList.remove('resizing');if(ready)desktop.resizeEnd()}
handle.addEventListener('pointerup',endResize);handle.addEventListener('pointercancel',endResize);
handle.addEventListener('lostpointercapture',endResize);window.addEventListener('blur',endResize);
handle.addEventListener('dblclick',()=>desktop.scale(1));
handle.addEventListener('keydown',event=>{
 if(!['ArrowLeft','ArrowDown','ArrowRight','ArrowUp','Home'].includes(event.key))return;
 event.preventDefault();desktop.scale(event.key==='Home'?1:window.innerWidth/360+(['ArrowLeft','ArrowDown'].includes(event.key)?-.05:.05));
});

desktop.onFormatted(()=>{last=null;until=0;strikeAt=0;shown=false;pointer=.48;$('#toast').hidden=true;$('#bite').classList.remove('struck')});
