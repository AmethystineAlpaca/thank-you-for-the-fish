# Help this little boat find its next fish

Thanks for taking an interest in Thank You for the Fish! Bug reports, thoughtful suggestions, documentation improvements, and code contributions are welcome. English and Chinese are both fine.

## A few useful places to start

- Improve the English and Chinese docs, especially first-run instructions.
- Help design an English-language interface. The app currently uses Simplified Chinese.
- Report a creature whose sprite, silhouette, or animation needs attention.
- Suggest small improvements that keep the app calm and easy to leave running.

For a large feature or a change to save data, open an issue first so we can discuss the approach. Please do not include personal collection files or private information in reports.

## Run and check your change

Use macOS and Node.js 22.12.0 or newer:

```sh
npm ci
npm start
npm test
```

For visual changes, check the desktop boat, collection, detail view, and undiscovered silhouettes. For collection or timer changes, run the isolated smoke check:

```sh
node_modules/.bin/electron scripts/smoke.js
```

It waits for a real one-minute catch and verifies persistence. More checks and artwork notes are in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

Please keep pull requests focused, explain the visible behavior that changes, and include the relevant checks or screenshots. Preserve existing saves and avoid adding network access for core fishing or collection features.

## 中文

欢迎提交问题、建议、文档改进和代码，也欢迎帮忙做英文界面。大功能或存档结构调整，请先开 Issue 讨论；修复问题时附上复现步骤、系统版本和必要截图即可，不要上传个人存档或隐私信息。

提交 PR 时说明改动后的表现与验证结果。让小船保持轻松、安静、可以离线使用，是这个项目的出发点。
