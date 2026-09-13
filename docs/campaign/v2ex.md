# V2EX 首帖 · 待发布

目标：[分享创造](https://www.v2ex.com/go/create)。登录后确认发帖资格。以下标题与正文供项目作者审阅后发布；素材使用公开仓库地址。

## 标题

做了个 Mac 桌面钓鱼小软件：你忙你的，它钓它的（免费开源）

## 正文

分享一个自己的小项目：**小憩海湾 / Thank You for the Fish**。

它会在 Mac 桌面角落放上一艘小船。你处理自己的事，它安静等鱼；过一会儿浮标动了，小鱼跳出来，自动收进鱼篓。

![小船在桌面钓鱼的实际演示](https://raw.githubusercontent.com/AmethystineAlpaca/thank-you-for-the-fish/main/docs/images/desktop-fishing.gif)

想做的是一个不用一直盯着、偶尔看一眼会有点开心的桌面小摆件。

- 100 种海洋生物，可以慢慢点亮图鉴。
- 普通、异色、荧光、炫彩四种性状，同一种鱼也有不同惊喜。
- 小船能拖动、缩放、暂停，也能关闭置顶。
- 无需注册，安装后可离线使用，收藏保存在本机。
- 免费、MIT 开源。

现在提供 **M 系列 Mac** 的下载包，界面是中文。下载解压后，把 `.app` 拖进应用程序即可；不用装 Node.js。

先说明一个安装上的限制：目前还没做 Developer ID 签名与公证，第一次打开可能被 macOS 拦下。[README](https://github.com/AmethystineAlpaca/thank-you-for-the-fish/blob/main/README.zh-CN.md)里放了 Apple 官方打开说明。

[下载 v0.4.3](https://github.com/AmethystineAlpaca/thank-you-for-the-fish/releases/tag/v0.4.3) · [源码与更多演示](https://github.com/AmethystineAlpaca/thank-you-for-the-fish)

动图来自实际应用的独立演示收藏，收竿为演示触发；正常默认每 5–20 分钟随机咬钩。退出后保存鱼获，但不会继续钓鱼。美术由 AI 生成并整理为本地素材，动画由代码实现，运行时不调用图片生成服务。

想听听大家：这种放在桌角的小船，你会更喜欢它安静等鱼，还是希望上钩时有更明显的提醒？如果试了，也欢迎晒晒第一条鱼。
