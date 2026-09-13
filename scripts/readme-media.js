// Record the real Electron UI with disposable sample catches for the README.
// Run: node_modules/.bin/electron scripts/readme-media.js (requires ffmpeg).
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const Sea = require('../src/catalog');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'little-tide-readme-'));
const output = path.join(__dirname, '../docs/images');
const fps = 12;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const species = [0, 1, 10, 12, 34, 35, 42, 49, 52, 66, 71, 73, 75, 90, 93, 98];
const catches = species.map((id, i) => sample(id, Sea.traits[i % 4].id, i));
for (const [i, trait] of Sea.traits.entries()) catches.push(sample(0, trait.id, 16 + i));
function sample(id, trait, i) {
  const scale = 1.25;
  return {
    id: `readme-${i}`, species: id, trait, weight: Math.round(50 * scale ** 3),
    length: Math.round(Sea.fish[id].length * scale * 10) / 10,
    value: Math.round(Sea.fish[id].base * Sea.traits.find(t => t.id === trait).mult * scale ** 2),
    time: Date.now() - i * 600000,
  };
}
app.setPath('userData', temp);
fs.writeFileSync(path.join(temp, 'collection.json'), JSON.stringify({
  catches, unread: 0, settings: { min: 5, max: 20, top: false, paused: false },
}));
require('../src/main');

async function record(name, win, seconds, width, action, rect) {
  const frames = path.join(temp, name);
  fs.mkdirSync(frames);
  for (let i = 0; i < seconds * fps; i++) {
    const start = Date.now();
    if (action) await action(i);
    const frame = await win.webContents.capturePage(rect);
    fs.writeFileSync(path.join(frames, `${String(i).padStart(4, '0')}.png`), frame.resize({ width }).toPNG());
    await sleep(Math.max(0, 1000 / fps - (Date.now() - start)));
  }
  console.log(`Captured ${name}`);
}

app.whenReady().then(async () => {
  try {
    fs.mkdirSync(output, { recursive: true });
    await sleep(1000);
    const widget = BrowserWindow.getAllWindows()[0];
    await widget.webContents.executeJavaScript('Art.ready');
    await widget.webContents.executeJavaScript('desktop.scale(1.5)');
    // A neutral matte makes the otherwise transparent desktop window GIF-friendly.
    widget.setBackgroundColor('#f7f4ee');
    await sleep(250);
    await record('desktop-fishing', widget, 5, 540, async i => {
      if (i === 12) widget.webContents.send('caught', catches[1]);
    });
    await widget.webContents.executeJavaScript('desktop.collection()');
    await sleep(900);
    const basket = BrowserWindow.getAllWindows().find(win => win !== widget);
    await basket.webContents.executeJavaScript('Art.ready');
    basket.setSize(1080, 850);
    basket.webContents.setZoomFactor(0.9);
    await sleep(400);
    await basket.webContents.executeJavaScript('document.activeElement.blur(); window.scrollTo(0, 0)');
    await sleep(150);
    fs.writeFileSync(path.join(output, 'collection.png'), (await basket.webContents.capturePage()).resize({ width: 1080 }).toPNG());
    await record('collection-tour', basket, 6, 960, async i => {
      if (i === 24) await basket.webContents.executeJavaScript('window.scrollTo(0, 300)');
      if (i === 48) await basket.webContents.executeJavaScript("document.querySelector('[data-page=atlas]').click(); document.activeElement.blur(); window.scrollTo(0, 0)");
    });
    await basket.webContents.executeJavaScript("document.querySelector('[data-page=basket]').click(); detail(state.catches[16])");
    await sleep(250);
    const rect = await basket.webContents.executeJavaScript(`(() => {
      const r = document.querySelector('#detail').getBoundingClientRect();
      return { x: Math.floor((r.x - 25) * .9), y: Math.floor((r.y - 25) * .9),
        width: Math.ceil((r.width + 50) * .9), height: Math.ceil((r.height + 50) * .9) };
    })()`);
    await record('fish-variants', basket, 8, 500, async i => {
      if (i % 24 === 0) await basket.webContents.executeJavaScript(`detail(state.catches[${16 + i / 24}]); document.activeElement.blur()`);
    }, rect);
    for (const name of ['desktop-fishing', 'collection-tour', 'fish-variants']) {
      const result = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps),
        '-i', path.join(temp, name, '%04d.png'), '-filter_complex',
        '[0:v]split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a',
        '-loop', '0', path.join(output, `${name}.gif`)], { encoding: 'utf8' });
      if (result.error || result.status !== 0) throw result.error || Error(result.stderr);
      console.log(`Saved docs/images/${name}.gif`);
    }
    finish(0);
  } catch (error) {
    console.error(error);
    finish(1);
  }
});
function finish(code) {
  fs.rmSync(temp, { recursive: true, force: true });
  app.exit(code);
}
app.on('will-quit', () => fs.rmSync(temp, { recursive: true, force: true }));
