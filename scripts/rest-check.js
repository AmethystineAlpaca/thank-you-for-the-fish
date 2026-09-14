// Exercise real main-process timers, IPC, renderers and disk writes in a temporary save.
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), assert = require('node:assert/strict');
const restore = process.argv.includes('--restore');
const marker = path.join(__dirname, '../artifacts/rest-test-path.txt');
fs.mkdirSync(path.dirname(marker), { recursive: true });
const dir = restore ? fs.readFileSync(marker, 'utf8') : fs.mkdtempSync(path.join(os.tmpdir(), 'fish-rest-'));
if (!restore) {
  fs.writeFileSync(marker, dir);
  fs.writeFileSync(path.join(dir, 'collection.json'), JSON.stringify({ catches: [], unread: 0, language: 'zh-CN', settings: { min: 5, max: 20, paused: false, top: false } }));
}
app.setPath('userData', dir);
require('../src/catalog').delay = () => 50;
require('../src/main');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
app.whenReady().then(async () => {
  try {
    const widget = BrowserWindow.getAllWindows()[0];
    const errors = [];
    widget.webContents.on('console-message', (_, info) => { if (info.level === 'error') errors.push(info.message) });
    await sleep(700);
    await widget.webContents.executeJavaScript('Art.ready');
    const state = () => widget.webContents.executeJavaScript('desktop.state()');
    if (restore) {
      assert.equal((await state()).settings.paused, true);
      assert.equal((await state()).sessionCatches, 2);
      assert.equal((await state()).restReason, 'limit');
      const count = (await state()).catches.length;
      await sleep(2200);
      assert.equal((await state()).catches.length, count);
      console.log('PASS: restart preserves automatic rest, limit, count, and stops catches');
      app.exit(0); return;
    }
    assert.equal((await state()).settings.restAfter, 10);
    for (let i = 0; i < 120 && !(await state()).settings.paused; i++) await sleep(100);
    let current = await state();
    assert.equal(current.catches.length, 10);
    assert.equal(current.sessionCatches, 10);
    assert.equal(current.unread, 10);
    assert.equal(current.restReason, 'limit');
    await sleep(6700);
    assert.equal((await state()).catches.length, 10);
    assert.equal(await widget.webContents.executeJavaScript("document.querySelector('#rest-message').textContent"), '现在钓得够多啦，休息一下吧');
    assert.equal(await widget.webContents.executeJavaScript("document.querySelector('#rest-message').hidden"), false);
    fs.writeFileSync(path.join(__dirname, '../artifacts/rest-widget.png'), (await widget.webContents.capturePage()).toPNG());
    await widget.webContents.executeJavaScript("desktop.collection('settings')");
    await sleep(700);
    const collection = BrowserWindow.getAllWindows().find(w => w !== widget);
    await collection.webContents.executeJavaScript('Art.ready');
    assert.equal(await collection.webContents.executeJavaScript("document.querySelector('#restAfter').value"), '10');
    await collection.webContents.executeJavaScript("document.querySelector('#restAfter').value='2'; document.querySelector('#settings-form').requestSubmit()");
    await sleep(200);
    assert.equal((await state()).settings.restAfter, 2);
    assert.equal((await state()).settings.paused, true);
    fs.writeFileSync(path.join(__dirname, '../artifacts/rest-settings.png'), (await collection.webContents.capturePage()).toPNG());
    await widget.webContents.executeJavaScript('desktop.demo()');
    assert.equal((await state()).sessionCatches, 10);
    assert.equal((await state()).catches.length, 10);
    await widget.webContents.executeJavaScript("document.querySelector('#pause').click()");
    await sleep(100);
    assert.equal((await state()).sessionCatches, 0);
    assert.equal((await state()).settings.paused, false);
    for (let i = 0; i < 40 && !(await state()).settings.paused; i++) await sleep(100);
    current = await state();
    assert.equal(current.catches.length, 12);
    assert.equal(current.sessionCatches, 2);
    assert.equal(current.settings.paused, true);
    assert.equal(await collection.webContents.executeJavaScript("document.querySelector('#paused').checked"), true);
    const disk = JSON.parse(fs.readFileSync(path.join(dir, 'collection.json')));
    assert.equal(disk.settings.restAfter, 2);
    assert.equal(disk.restReason, 'limit');
    assert.equal(disk.catches.length, 12);
    assert.deepEqual(errors, []);
    console.log('PASS: ten real catches stop, no extra catches, rest artwork and message, settings form, demo excluded, resume and custom limit, UI sync, persistence');
    app.exit(0);
  } catch (error) { console.error(error); app.exit(1) }
});
