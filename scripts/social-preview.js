const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1280, height: 640, useContentSize: true, webPreferences: { contextIsolation: true } });
  try {
    await win.loadFile(path.join(__dirname, '../docs/social-preview.html'));
    await win.webContents.executeJavaScript('Promise.all(Array.from(document.images, image => image.decode()))');
    fs.writeFileSync(path.join(__dirname, '../docs/images/social-preview.png'), (await win.webContents.capturePage()).resize({ width: 1280 }).toPNG());
    app.exit(0);
  } catch (error) { console.error(error); app.exit(1); }
});
