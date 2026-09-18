# Release guide / 发布指南

The downloadable build targets **macOS on Apple Silicon**. It is not Developer ID signed or notarized. Release archives contain the app bundle; Node.js is not required to play.

## Build locally

On macOS with Node.js 22.12.0 or newer:

```sh
npm ci
npm run release
(cd dist && shasum -a 256 -c SHA256SUMS.txt)
```

The release command runs the unit tests, packages the app, checks the bundled version, and creates:

- `dist/thank-you-for-the-fish-macos-arm64.zip`
- `dist/SHA256SUMS.txt`

The archive is built with `ditto` to retain app bundle symlinks and executable permissions. Builds are not byte-for-byte reproducible: always use the checksum shipped alongside that specific ZIP.

Before publishing a gameplay or artwork change, run the relevant Electron checks in [DEVELOPMENT.md](DEVELOPMENT.md), then open the packaged app. Keep checks on isolated test saves; quit other app instances before manually opening a build that uses your real collection.

## Publish on GitHub

The **Release macOS** workflow builds the exact existing tag, never an untagged working tree. It supports:

1. Pushing a new stable `vX.Y.Z` tag containing the workflow.
2. **Actions → Release macOS → Run workflow**, entering an existing tag.
3. Updating `.github/release-request.json` on `main` to request publication of an existing tag. This is useful when SSH push is available; the request is reviewed and recorded like any other change.

For a new version, update `package.json` and `package-lock.json`, add `docs/releases/vX.Y.Z.md`, update the changelog and both READMEs, run verification, commit, and tag that commit. Push the commit before its tag. Never move an already published tag.

The workflow checks that the tag matches the package version, installs locked dependencies, tests, packages, and generates SHA-256 checksums. It creates a **draft**, uploads both assets, then publishes it as the latest release. A failed upload leaves the draft unpublished; rerun to resume. An already public release is left unchanged, including its assets.

Afterward, confirm the workflow succeeds and the release has both downloads. Download both into the same directory and run:

```sh
shasum -a 256 -c SHA256SUMS.txt
```

## 本次 v0.5.1 收尾

v0.5.1 的源码和 tag 已存在，发布请求指向该 tag。构建保留版本对应的源码；本次新增的文档、展示图和发布工具留在 main，不改写既有 tag。

后续发布可以推送新 tag、手动运行 Actions，或修改发布请求文件。流程先测试，再生成安装包和校验文件，两项上传完整后才公开。已公开版本不会被覆盖。

## Refresh repository visuals

```sh
node_modules/.bin/electron scripts/collection-showcase.js
node_modules/.bin/electron scripts/social-preview.js
node_modules/.bin/electron scripts/social-preview.js --zh-CN
```

The collection showcase uses the real in-game renderer. Social covers use the editable HTML in `docs/`. The PNG covers may be uploaded in **repository Settings → Social preview**; committing a cover alone does not change GitHub's social preview setting.
