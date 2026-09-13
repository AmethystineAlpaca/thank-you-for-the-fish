const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('desktop',{
 state:()=>ipcRenderer.invoke('state'),collection:page=>ipcRenderer.invoke('collection',page),
 read:()=>ipcRenderer.invoke('read'),settings:s=>ipcRenderer.invoke('settings',s),
 format:()=>ipcRenderer.invoke('format'),onFormatted:fn=>ipcRenderer.on('formatted',()=>fn()),
 demo:()=>ipcRenderer.invoke('demo'),hide:()=>ipcRenderer.invoke('hide'),quit:()=>ipcRenderer.invoke('quit'),
 scale:value=>ipcRenderer.invoke('scale',value),
 resizeStart:point=>ipcRenderer.invoke('resize-start',point),resizeMove:point=>ipcRenderer.send('resize-move',point),resizeEnd:()=>ipcRenderer.send('resize-end'),
 onNavigate:fn=>ipcRenderer.on('navigate',(_,page)=>fn(page)),
 onState:fn=>ipcRenderer.on('state',(_,s)=>fn(s)),onCatch:fn=>ipcRenderer.on('caught',(_,c)=>fn(c))
});
