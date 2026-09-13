#!/bin/bash
# 从任何位置双击，都以本文件所在的项目目录定位应用。
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)" || exit 1
APP_PATH="$PROJECT_DIR/dist/Thank You for the Fish-darwin-arm64/Thank You for the Fish.app"

if [[ ! -d "$APP_PATH" ]]; then
  echo "没有找到小憩海湾应用。请保留项目中的 dist 文件夹。"
  echo "应用应位于：$APP_PATH"
  read -r -p "按回车键关闭……"
  exit 1
fi

if /usr/bin/open "$APP_PATH"; then
  echo "小憩海湾已打开。可以关闭这个终端窗口。"
  echo "如果没看到小船，请点击屏幕顶部菜单栏的「Thank You for the Fish」→「显示小船」。"
else
  echo "启动失败。请查看同一文件夹中的《启动说明.txt》。"
  read -r -p "按回车键关闭……"
  exit 1
fi
