const {app,BrowserWindow,ipcMain,Menu,Tray,nativeImage,screen,dialog}=require('electron');
const fs=require('fs');
const path=require('path');
const Sea=require('./catalog');
const FishingSession=require('./fishing-session');
const {sizeForScale,scaleForDrag}=require('./window-size');
app.setName('Thank You for the Fish');
let widget,collection,tray,state,file,resizeSession=null,formatting=false;
function save(){const tmp=file+'.tmp';fs.writeFileSync(tmp,JSON.stringify(state));fs.renameSync(tmp,file)}
function broadcast(){for(const w of [widget,collection])if(w&&!w.isDestroyed())w.webContents.send('state',state)}
function announceCatch(c){for(const w of [widget,collection])if(w&&!w.isDestroyed())w.webContents.send('caught',c)}
function schedule(){state.started=Date.now();state.next=state.started+Sea.delay(state.settings.min,state.settings.max)}
function catchOne(){const c=Sea.catchFish();state.catches.push(c);state.unread++;FishingSession.recordCatch(state);schedule();save();broadcast();announceCatch(c);return c}
function showCollection(page='basket'){
  if(page==='basket'){state.unread=0;save();broadcast()}
  if(collection&&!collection.isDestroyed()){
    collection.show();collection.focus();
    if(collection.webContents.isLoading())collection.webContents.once('did-finish-load',()=>collection?.webContents.send('navigate',page));
    else collection.webContents.send('navigate',page);
    return;
  }
  collection=new BrowserWindow({width:1080,height:760,minWidth:850,minHeight:640,title:'Thank You for the Fish · 鱼篓',backgroundColor:'#f7f4ee',titleBarStyle:'hiddenInset',webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false}});
  collection.loadFile(path.join(__dirname,'index.html'),{query:{page}});
  collection.on('closed',()=>collection=null);
}
function setWidgetScale(scale,persist=true){
  const bounds=widget.getBounds();const area=screen.getDisplayMatching(bounds).workArea;
  const size=sizeForScale(scale);
  const x=Math.max(area.x,Math.min(bounds.x,area.x+area.width-size.width));
  const y=Math.max(area.y,Math.min(bounds.y,area.y+area.height-size.height));
  widget.setBounds({x,y,width:size.width,height:size.height},false);
  state.widgetScale=size.scale;state.position={x,y};
  if(persist){save();broadcast()}
  return size;
}
function finishResize(){if(!resizeSession)return;resizeSession=null;save();broadcast()}
function quit(){finishResize();save();app.quit()}
function menuItems(){return [
  {label:'打开鱼篓',click:()=>showCollection('basket')},
  {label:'打开设置…',click:()=>showCollection('settings')},
  {label:'显示小船',click:()=>{widget.show();widget.focus()}},
  {label:'恢复小船默认大小',click:()=>setWidgetScale(1)},
  {type:'separator'},
  {label:'退出 Thank You for the Fish',accelerator:'CommandOrControl+Q',click:quit}
]}
if(!app.requestSingleInstanceLock())app.quit();else{
  app.on('second-instance',()=>widget?.show());
  app.on('activate',()=>widget?.show());
  app.whenReady().then(()=>{
    file=path.join(app.getPath('userData'),'collection.json');
    const legacyFile=path.join(path.dirname(app.getPath('userData')),'little-tide','collection.json');
    if(!fs.existsSync(file)&&fs.existsSync(legacyFile)){fs.mkdirSync(path.dirname(file),{recursive:true});fs.copyFileSync(legacyFile,file)}
    try{state=JSON.parse(fs.readFileSync(file,'utf8'));if(!Array.isArray(state.catches)||!state.settings)throw Error('Invalid save')}
    catch(e){if(fs.existsSync(file))fs.copyFileSync(file,file+'.backup-'+Date.now());state={catches:[],unread:0,language:'zh-CN',settings:{min:5,max:20,top:true,paused:false},next:0}}
    if(!state.language)state.language='zh-CN';
    FishingSession.restoreSession(state);
    schedule();
    const size=sizeForScale(state.widgetScale||1);state.widgetScale=size.scale;save();
    const area=screen.getPrimaryDisplay().workArea;const pos=state.position;
    const valid=pos&&screen.getAllDisplays().some(d=>pos.x>=d.workArea.x&&pos.y>=d.workArea.y&&pos.x+size.width<=d.workArea.x+d.workArea.width&&pos.y+size.height<=d.workArea.y+d.workArea.height);
    widget=new BrowserWindow({width:size.width,height:size.height,x:valid?pos.x:area.x+area.width-size.width-24,y:valid?pos.y:area.y+area.height-size.height-24,transparent:true,frame:false,resizable:false,hasShadow:false,alwaysOnTop:state.settings.top,webPreferences:{preload:path.join(__dirname,'preload.js'),backgroundThrottling:false,contextIsolation:true,nodeIntegration:false}});
    widget.setVisibleOnAllWorkspaces(true,{visibleOnFullScreen:true});widget.loadFile(path.join(__dirname,'widget.html'));
    widget.on('moved',()=>{const [x,y]=widget.getPosition();state.position={x,y};if(!resizeSession)save()});
    widget.on('blur',finishResize);
    const icon=nativeImage.createFromPath(path.join(__dirname,'assets/boatTemplate.png'));
    if(icon.isEmpty())throw Error('Menu bar icon failed to load');
    icon.setTemplateImage(true);tray=new Tray(icon);tray.setTitle('Thank You for the Fish');tray.setToolTip('Thank You for the Fish · 鱼篓 / 设置 / 退出');tray.setContextMenu(Menu.buildFromTemplate(menuItems()));
    Menu.setApplicationMenu(Menu.buildFromTemplate([{label:'Thank You for the Fish',submenu:menuItems()},{role:'editMenu'}]));
    setInterval(()=>{if(!state.settings.paused&&Date.now()>=state.next)catchOne()},1000);
  });
}
ipcMain.handle('state',()=>state);
ipcMain.handle('collection',(_,page)=>showCollection(page==='settings'?'settings':'basket'));
ipcMain.handle('read',()=>{state.unread=0;save();broadcast()});
ipcMain.handle('settings',(_,s)=>{
  if(!s||!Number.isFinite(s.min)||!Number.isFinite(s.max)||s.min<1||s.max>120||s.max<s.min)throw Error('时间范围须为 1–120 分钟，最大值不能小于最小值');
  const changed=s.min!==state.settings.min||s.max!==state.settings.max||state.settings.paused&&!s.paused;
  FishingSession.updateSettings(state,s);if(s.language==='en'||s.language==='zh-CN')state.language=s.language;
  if(changed)schedule();widget.setAlwaysOnTop(state.settings.top);save();broadcast();return state;
});
ipcMain.handle('format',async(event)=>{
  if(!collection||collection.isDestroyed()||event.sender!==collection.webContents||formatting)return {cancelled:true};
  formatting=true;
  const owner=collection;
  try{
    const messages=[
      ['格式化存档 · 第 1 / 3 次确认','确定要清空这片海湾的收藏吗？','将删除全部鱼获、图鉴发现进度和收藏统计。垂钓设置、小船位置与大小会保留。'],
      ['格式化存档 · 第 2 / 3 次确认','这些鱼获将永久删除','所有普通、异色、荧光和炫彩鱼获都会清空，无法在应用内撤销。'],
      ['格式化存档 · 第 3 / 3 次确认','最后确认：立即清空存档？','点击「确认格式化」后立即删除全部收藏，并重新开始垂钓计时。']
    ];
    for(let i=0;i<messages.length;i++){
      if(owner.isDestroyed())return {cancelled:true};
      const [title,message,detail]=messages[i];
      const {response}=await dialog.showMessageBox(owner,{type:'warning',title,message,detail,buttons:['取消',i===2?'确认格式化':'继续确认'],defaultId:0,cancelId:0,noLink:true});
      if(response!==1||owner.isDestroyed())return {cancelled:true};
    }
    const previous=state;
    state={...state,catches:[],unread:0,sessionCatches:0,restReason:null};schedule();
    try{save()}catch(error){state=previous;throw error}
    broadcast();
    for(const w of [widget,collection])if(w&&!w.isDestroyed())w.webContents.send('formatted');
    return {cancelled:false,state};
  }finally{formatting=false}
});
ipcMain.handle('demo',()=>{const c=Sea.catchFish();announceCatch(c);return c});
ipcMain.handle('hide',()=>widget.hide());
ipcMain.handle('quit',quit);
ipcMain.handle('scale',(_,scale)=>{if(!Number.isFinite(scale))throw Error('Invalid scale');return setWidgetScale(scale)});
ipcMain.handle('resize-start',(event,point)=>{
  if(event.sender!==widget.webContents||!point||!Number.isFinite(point.x)||!Number.isFinite(point.y))return;
  resizeSession={x:point.x,y:point.y,scale:state.widgetScale};
});
ipcMain.on('resize-move',(event,point)=>{
  if(event.sender!==widget.webContents||!resizeSession||!point||!Number.isFinite(point.x)||!Number.isFinite(point.y))return;
  setWidgetScale(scaleForDrag(resizeSession.scale,point.x-resizeSession.x,point.y-resizeSession.y),false);
});
ipcMain.on('resize-end',(event)=>{if(event.sender===widget.webContents)finishResize()});
app.on('before-quit',()=>{if(state&&file){finishResize();save()}});
app.on('window-all-closed',()=>{});
