const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
app.whenReady().then(async () => {
  const suffix = process.argv.includes('--zh-CN') ? '-zh-CN' : '';
  const win = new BrowserWindow({ show: false, width: 1280, height: 640, useContentSize: true, webPreferences: { contextIsolation: true } });
  try {
    await win.loadFile(path.join(__dirname, `../docs/social-preview${suffix}.html`));
    await win.webContents.executeJavaScript('Promise.all(Array.from(document.images, image => image.decode()))');
    await win.webContents.executeJavaScript('document.fonts.ready');
    fs.writeFileSync(path.join(__dirname, `../docs/images/social-preview${suffix}.png`), (await win.webContents.capturePage()).resize({ width: 1280 }).toPNG());
    app.exit(0);
  } catch (error) { console.error(error); app.exit(1); }
});
