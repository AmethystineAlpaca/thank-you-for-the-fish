# 小憩海湾 · 开发与验证

当前版本：0.4.3。产品介绍、界面动图和日常启动方法见 [中文介绍](../README.zh-CN.md) · [English](../README.md)。

## 本地运行

macOS，Node.js 22.12.0 或以上版本，npm。在项目根目录执行：

```sh
npm install
npm start
```

若 Electron 二进制未正确下载，执行 `node node_modules/electron/install.js` 后重试。运行时使用本地素材，不调用图片生成服务，不需要联网。

## 打包

Apple Silicon（M 系列）Mac：

```sh
npm run package
```

产物：`dist/Thank You for the Fish-darwin-arm64/Thank You for the Fish.app`。根目录的 `双击启动小憩海湾.command` 打开此产物，修改源码后须重新打包。

Intel Mac：

```sh
npx electron-packager . 'Thank You for the Fish' --platform=darwin --arch=x64 --out=dist --overwrite --ignore='^/(dist|tests|scripts|artifacts|docs|\.git|\.github)' --ignore='^/src/assets/soft-sea/fish-[0-4]\.png$'
```

产物：`dist/Thank You for the Fish-darwin-x64/Thank You for the Fish.app`，直接双击打开；根目录启动脚本固定指向 arm64 版本。

## 收藏与抽取规则

- 数据保存在 Electron `userData` 目录的 `collection.json`，开发环境通常为 `~/Library/Application Support/Thank You for the Fish/`，采用临时文件加替换写入。首次启动会自动导入旧版 `little-tide` 目录中的存档。
- 100 个真实物种及海洋生物条目，5 个图鉴分组，每组 20 种。各稀有度中，单个物种的抽取权重依次为 50 / 28 / 14 / 6 / 2。
- 性状抽取权重：普通 72、异色 16、荧光 8、炫彩 4；估值倍率依次为 1 / 2.5 / 4 / 8。以 `src/catalog.js` 为准。
- 体型倍率在 0.55–1.8 之间，体长为基准体长乘以倍率，保留一位小数；克重为 `round(50 × 体型倍率³)`。
- 收藏价值为 `round(基础价值 × 性状倍率 × 体型倍率²)`。长度、重量与价值均为游戏数值。
- 设置底部提供「一键格式化」：主进程依次显示三次原生确认框，默认选择取消；全部确认后清空鱼获、未读和图鉴进度，重新计时，保留设置与窗口布局。
- 打开鱼篓清零未读，不删除收藏。试钓不改变收藏、未读和正常垂钓计时。
- 未发现图鉴仅显示静止剪影与问号；搜索不泄露未发现物种的名字。
- 退出不累计离线鱼获，重新启动重新计时；休眠恢复最多补收一条。请勿同时运行开发版和打包版。
- 旧幻想物种槽位已改为麒麟鱼和苏眉鱼，旧收藏的 ID、数量和估值保留。旧存档缺少克重时，根据体长推算。

## 美术与动画

全部 100 种生物使用统一的 3D 玩具风素材。鱼篓、详情和钓获动画共用素材；特殊性状通过滤镜及合成实现。未发现图鉴使用同一素材生成单色静止剪影。

实际使用的素材在 `src/assets/soft-sea/`：`boat.png`、`fish-0-alpha.png`、`fish-1-white.png` 至 `fish-4-white.png`。白底处理仅移除与边缘相连的白色，保留鱼身白色花纹。生成与清理记录保存在同目录的 `prompts.json` 和 `cleanup-prompts.json`。原始生成稿不打包进应用。

共享 WebGL 渲染器对现有素材做局部变形，以 30 fps 绘制水面、倒影、人物呼吸、鱼竿、鱼线和浮标；详情中展示鱼尾摆动、触手摇摆、鳐鱼双翼起伏。咬钩时先下压浮标、拉动鱼竿，再让鱼带水花沿弧线跃出，随后显示名字与克重。桌面与已打开的鱼篓同步播放，暂停时试钓也能完整播放。

## 验证

以下命令均在项目根目录执行。界面检查脚本使用隔离临时存档，不改动玩家收藏。

| 命令 | 检查内容 |
| --- | --- |
| `node_modules/.bin/electron scripts/format-check.js` | 三次确认逐步取消、默认取消、重复请求拦截、清空存盘、设置与布局保留及双窗口同步 |
| `npm test` | 物种完整性、抽取边界、性状估值、计时及窗口缩放规则 |
| `node_modules/.bin/electron scripts/smoke.js` | 真实窗口、100 种图鉴、试钓、设置校验、未读清零，并等待一次真实的一分钟鱼获验证存盘 |
| `node_modules/.bin/electron scripts/visual-check.js` | 不同物种与性状渲染，以及未发现图鉴的保密行为 |
| `node_modules/.bin/electron scripts/window-check.js` | 鼠标拖拽缩放、菜单导航、未读、最小尺寸、恢复默认、存盘和退出按钮 |
| `node_modules/.bin/electron scripts/window-check.js --restore` | 上一项退出后的窗口大小恢复 |
| `node_modules/.bin/electron scripts/soft-preview.js` | 新素材加载与实际界面截图 |
| `node_modules/.bin/electron scripts/motion-check.js` | 跨帧局部变化、暂停状态试钓和鱼篓同步，生成动画预览 |
| `node_modules/.bin/electron scripts/soft-art-check.js` | 100 种不同鱼图、500 种渲染（含剪影）、100 个静止单色剪影 |

检查产物位于 `artifacts/`。500 种渲染包括 100 个剪影，玩家可收藏的是 100 个物种 × 4 种性状。

## 重新录制 README 动图

需要本机已有 `ffmpeg`，然后执行：

```sh
node_modules/.bin/electron scripts/readme-media.js
```

脚本使用独立临时存档中的演示鱼获，录制真实 Electron 窗口，输出到 `docs/images/`：

- `collection-tour.gif`：鱼篓浏览与图鉴。
- `desktop-fishing.gif`：小船待机与演示收竿；透明窗口加浅色背景，方便 GIF 显示。
- `fish-variants.gif`：相同体型小丑鱼的四种性状详情。
- `collection.png`：鱼篓静态截图。

动图为 12 fps 循环播放。演示录制中的收竿由脚本触发，不代表正常咬钩间隔；正式应用默认每 5–20 分钟随机咬钩。
