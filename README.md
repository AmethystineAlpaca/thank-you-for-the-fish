<div align="center">

# Thank You for the Fish 🐟

**Your work is done. Your shift isn't. Go fishing.**

**上班没啥事儿，又不能立马走，怎么办？就摸鱼！**

A tiny boat, a hundred sea creatures, and a little joy between tasks.<br>

A cozy idle fishing companion for your Mac desktop. 小憩海湾 · Thank You for the Fish

**English** · [简体中文](README.zh-CN.md)

[![Download for Mac](https://img.shields.io/badge/Download-Mac_Apple_Silicon-477f72?style=for-the-badge\&logo=apple\&logoColor=white)](https://github.com/AmethystineAlpaca/thank-you-for-the-fish/releases/latest)

[![Tests](https://github.com/AmethystineAlpaca/thank-you-for-the-fish/actions/workflows/test.yml/badge.svg)](https://github.com/AmethystineAlpaca/thank-you-for-the-fish/actions/workflows/test.yml)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

**Free & open source · Apple Silicon Mac · No account · Offline after setup**

Current interface: **简体中文** ([English button guide](#download--play)). The download is unsigned; first-launch instructions are below.

![Thank You for the Fish desktop demo](docs/images/demo.gif)

*This is what it looks like on your desktop: a little boat in the corner, keeping you company while the next fish finds its way to the hook.*

You've answered the messages. Finished the task. Checked the clock. Somehow, only three minutes have passed.

Then, in the corner of your screen, a float dips. A rod bends. A little fish leaps out of the water.

**Today's accomplishments: one finished task, one suspiciously colorful fish.**

Thank You for the Fish puts a miniature fishing boat on your desktop. It quietly waits for bites while you do your thing, then adds each catch to your collection. No frantic clicking. No daily chores. Just a small, surprisingly delightful reason to glance away from your spreadsheet.

![Animated fish trait showcase](docs/images/appearance-motion.gif)

[Download & play](#download--play) · [Meet your next catch](#100-sea-creatures-400-ways-to-get-distracted) · [Run from source](#run-from-source) · [Contribute](CONTRIBUTING.md)

## A little sea beside your spreadsheets

A wooden boat bobs on turquoise water. Reflections ripple, the fishing line sways, and your tiny angler takes their time.

Drag the boat wherever it feels at home. Resize it from **60% to 150%**. Keep it above your other windows or turn that off in settings. It remembers its size and position, and follows you across desktops.

The fish activity indicator wanders from warm red toward soft green. It hints at a bite without turning your break into another countdown.

And when something finally tugs? The float dips, the rod lifts, and your catch jumps out with a splash. Its name and weight appear, and it goes straight into your basket—even if you weren't watching.

![Desktop boat with gentle water motion, a swaying bite indicator, and a fish jumping out of the sea](docs/images/desktop-fishing.gif)

**You're waiting for five o'clock. They're waiting for a bite.**

## 100 sea creatures. 400 ways to get distracted.

Collect **100 fish and other marine creatures across five field-guide groups**, from cheerful reef neighbors to curious deep-sea visitors. All have a soft, sculpted, toy-like look that makes your basket feel like a cabinet of tiny treasures.

Undiscovered creatures stay hidden behind silhouettes and question marks. Catch one to reveal its name, appearance, and description. Every new discovery lights up another little square.

And then there's the fish that makes you say, **“Okay. Just one more.”**

Each species can appear in **four traits: 400 species-and-trait combinations**, with varying lengths, weights, and collection values.

| Trait         | The reason you opened the basket again                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Normal**    | Natural colors. Quietly charming. You were attached from the first catch.                                               |
| **Alternate** | A familiar fish in an unexpected palette. Hang on—this one's different.                                                 |
| **Glow**      | A bright neon outline follows the fins and tail, breathing gently with the luminous body. Eyes and markings stay clear. |
| **Prismatic** | Flowing bands of color, a sweeping pearly sheen, and colorful sparkles. This one gets the big preview.                  |

Special palettes follow each creature's natural body colors: icy blue, lilac, and rose for cool tones; apricot gold, coral pink, and lavender for warm tones.

Open a catch's detail view to watch tails wag, tentacles sway, and fins gently ripple. You may forget you only came here to check its shell value.

## Keep the fish. Collect the little wins.

Your basket keeps track of every catch, discovered species, special trait, and shell value. Search by name, filter by trait, or sort by newest catch, value, or weight.

* **Make it your pace:** choose a random bite interval anywhere within 1–120 minutes, or pause fishing.

* **Try before you wait:** “试钓一下” previews a catch without changing your real collection or timer.

* **Offline after setup:** fishing, artwork, and saves work locally. No account required.

* **Shells are just collection value:** there is no shop, selling, or trading.

Collections save automatically on your Mac. Quitting keeps your fish, but doesn't accumulate offline catches. Relaunching starts a fresh wait; waking from sleep can yield at most one catch. Avoid running the development and packaged apps together.

*The current app interface is in Simplified Chinese. These English docs include a quick button guide below. Creature designs, rarity, sizes, and values are stylized game representations.*

## Download & play

**For Apple Silicon Macs (M-series chips):**

1. Open the [latest release](https://github.com/AmethystineAlpaca/thank-you-for-the-fish/releases/latest) and download `thank-you-for-the-fish-macos-arm64.zip`.

2. Unzip it, then drag **Thank You for the Fish.app** into **Applications**.

3. Open the app. A little boat appears on your desktop, and **Thank You for the Fish** appears in the menu bar. You're fishing.

The current build is **not Developer ID signed or notarized**. If macOS blocks opening it, follow Apple's [instructions for opening an app from an unidentified developer](https://support.apple.com/guide/mac-help/open-a-mac-app-from-an-unknown-developer-mh40616/mac), after checking that you downloaded it from this repository's release page.

| What you want to do     | Where to click                                                                  |
| ----------------------- | ------------------------------------------------------------------------------- |
| Open your basket        | **鱼篓** below the boat, or **Thank You for the Fish → 打开鱼篓** in the menu bar     |
| Browse the field guide  | **海洋图鉴** in the basket sidebar                                                  |
| Change fishing settings | **垂钓设置**, or **Thank You for the Fish → 打开设置…**                                 |
| Pause / resume          | The **Ⅱ / ▶** button below the boat                                             |
| Resize the boat         | Drag **◢** in its lower-right corner; double-click to reset                     |
| Find a hidden boat      | **Thank You for the Fish → 显示小船**                                               |
| Quit                    | **退出 Thank You for the Fish** in the menu bar or the basket's lower-left corner |

## Run from source

Requires **macOS, Node.js 22.12.0 or newer, and npm**.

```sh
git clone https://github.com/AmethystineAlpaca/thank-you-for-the-fish.git
cd thank-you-for-the-fish
npm ci
npm start
```

The first install downloads dependencies and Electron. Later launches only need `npm start`. If Electron reports an incomplete installation:

```sh
node node_modules/electron/install.js
npm start
```

Build the Apple Silicon app:

```sh
npm run package
```

Output: `dist/Thank You for the Fish-darwin-arm64/Thank You for the Fish.app`. The root-level `双击启动小憩海湾.command` launcher opens this local build. Rebuild after source changes to update it. Intel Mac build instructions and verification commands are in the [development guide](docs/DEVELOPMENT.md).

## Help this little boat find more desks

**What was your first catch?** Open its detail view, take a screenshot, and [share it in Discussions](https://github.com/AmethystineAlpaca/thank-you-for-the-fish/discussions). A normal little fish counts, too. Tell us its name, trait, and the corner of your desktop it calls home.

Want to introduce the app to a friend or community? The [sharing kit](docs/SHARE.md) has ready-to-use images, GIFs, and short descriptions in English and Chinese.

If it made a quiet afternoon a little better, **give the repo a star or share it with someone who could use a tiny ocean**.

Found a bug, have a fish idea, or want to help translate the interface? [Open an issue](https://github.com/AmethystineAlpaca/thank-you-for-the-fish/issues) or see the [contributing guide](CONTRIBUTING.md). Screenshots of your favorite catches are welcome, too.

Built with Electron, Canvas, and WebGL. Artwork was created with AI image generation and adapted into local sprite atlases; motion and trait effects are rendered in code. The app makes no image-generation calls at runtime. [Artwork notes](docs/DEVELOPMENT.md#美术与动画) · [MIT license](LICENSE).

---

**Take a breath. Leave a little room for the sea.**
