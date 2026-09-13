# 小憩海湾首轮 campaign

核查日期：2026-09-13。目标：让第一批合适的 Mac 用户下载、成功打开、愿意晒出第一条鱼。以下是发布计划，论坛帖子与第三方目录申请尚未提交。

## 主张与素材

**中文：把工位钓成水族馆。你忙你的，它钓它的。**

**English: A tiny fishing boat for the quiet corners of your Mac.**

核心受众先选使用 M 系列 Mac、喜欢桌面小摆件和轻度收集的中文用户。英文渠道作为第二轮；当前中文界面和未签名安装包会影响尝试意愿，这是基于产品现状的判断。

直接复用[分享素材包](../SHARE.md)：中文封面负责吸引停留，桌面钓鱼 GIF 解释玩法，鱼篓和四性状 GIF 解释收藏。单帖主推一个动作：下载试试。Star 放在仓库自然承接。

## 渠道顺序

| 顺序 | 渠道 | 具体入口与内容 | 已核查条件 / 当前状态 |
| --- | --- | --- | --- |
| 1 | V2EX 分享创造 | [节点](https://www.v2ex.com/go/create) · [完整帖子](v2ex.md) | 官方欢迎独立开发者新作；公司营销应去推广节点。账号发帖资格仍需登录确认。[官方说明](https://www.v2ex.com/help/node) |
| 2 | awesome-mac | [目录](https://github.com/jaywcjlove/awesome-mac) · [四语补丁与申请说明](awesome-mac.md) | Gaming Software 下已有独立游戏；遵守字母排序、简洁描述、四语言同步。核查时未发现现有条目或同名 issue/PR。[贡献规则](https://github.com/jaywcjlove/awesome-mac/blob/master/docs/CONTRIBUTING.md) |
| 3 | r/SideProject | [社区](https://www.reddit.com/r/SideProject/) · [英文帖](reddit-sideproject.md) | 主题定位适合；公开页面未返回完整本地规则，登录后确认规则及账号资格再发 |
| 4 | r/macapps | [社区](https://www.reddit.com/r/macapps/) · [候选短介绍](reddit-macapps.md) | 要求 10 点本社区 karma；主信息流有资格和 PCP 模板要求；未达资格者限当月集中帖；需披露作者关系，通常每开发者 30 天一次。资格尚未核实。[社区规则](https://www.reddit.com/r/macapps/) |
| 暂缓 | Hacker News | [Show HN](https://news.ycombinator.com/showhn.html) | 当前[总规则](https://news.ycombinator.com/newsguidelines.html)禁止生成或 AI 润色文本，且有[临时提交限制](https://news.ycombinator.com/showlim)。不提供代发稿；作者如选此渠道，应亲自撰写、参与讨论并先确认资格 |

没有选择 bobeff/open-source-games：其现有分类对桌面放置钓鱼不够贴切，且为[个人收藏](https://github.com/bobeff/open-source-games/blob/main/CONTRIBUTING.md)，本轮优先更贴切的 Mac 目录。也不优先 icodeonsunday/awesome-mac-games：维护者[只列自己测试过的游戏](https://github.com/icodeonsunday/awesome-mac-games)，需要额外试用流程。

## 首轮执行节奏

以实际首帖日为 D0；不是已经安排的定时任务。

| 时间 | 工作 | 观察什么 |
| --- | --- | --- |
| D0 | 上线仓库引导、分享素材；用已确认账号发布 V2EX 首帖 | 下载入口是否清楚，有没有打不开的反馈 |
| D1 | 人工回答实际问题，整理首次安装障碍 | 成功开钓的真实回复；不编造玩家反馈 |
| D2 | 提交已审阅的 awesome-mac 收录申请 | 申请链接、维护者要求；提交不等于收录 |
| D3–4 | 根据中文反馈修正文案，再发 SideProject | 英文用户是否被界面语言或安装流程卡住 |
| D7 | 对比基线与真实反馈，选择下一轮改进 | 下载变化、实际试玩反馈、用户主动晒鱼 |

若首帖用户集中反馈打不开，先解决安装路径再扩大曝光。若英文界面成为重复诉求，再把本地化提升为下一轮重点。签名、公证与英文 UI 均不是本轮已交付功能。

## 度量

[baseline.json](baseline.json)来自公开 GitHub API，保留精确采样时间。首次采样时仓库为 **0 stars、0 forks，v0.4.3 安装包 0 次下载**。这些值会变化；不能把本次文档准备算成新增曝光。

人工在发布后 24 小时与第 7 天读取相同指标，并填入[发布记录](tracking.csv)。按「发现 → 下载 → 成功打开 → 晒鱼」看实际反馈。下载计数可能包含重复下载，**不代表独立用户或安装成功**。没有应用使用埋点，留存和真实安装量未知。

有管理员权限时，可以在 [GitHub Traffic](https://github.com/AmethystineAlpaca/thank-you-for-the-fish/graphs/traffic) 查看可用的访客、来源数据；未取得的数据留空。GitHub 不能凭 URL 中添加 UTM 参数就提供每个渠道的安装归因，第一轮使用帖子链接和时间记录对照，不虚构转化率。

## 发布状态

- 仓库改进：双语 README 首屏适用条件、晒鱼入口、分享素材包、中文分享图、Issue 选择页入口。
- V2EX、Reddit：文案已准备，尚未用账号发布。
- awesome-mac：四语言候选补丁已准备，尚未向维护者提交。
- 下一步审核对象：[V2EX 完整帖](v2ex.md)与[awesome-mac 申请及补丁](awesome-mac.md)。对外发布前确认使用的账号和具体稿件。
