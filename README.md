# three.js

#### 介绍

react + three.js

#### 软件架构

软件架构说明

#### 安装教程

1.  yarn 安装依赖
2.  yarn dev 启动项目
3.  yarn build 构建项目
4.  cd dist 之后 serve 打包后本地预览（前提是安装了 yarn global add serve 依赖）

#### 使用说明

本项目可作为静态网站部署到 github pages 上  
github 代码仓库地址：https://github.com/cz-liang/three.git  
访问地址：https://cz-liang.github.io/three/#/  
具体步骤如下：

1.  在 github 上创建一个新的仓库，仓库名称为：three，创建分支 gh-pages
2.  直接把打包后的 dist 内所有文件夹复制提交到 gh-pages 分支
3.  github pages 开启 Pages 配置：GitHub Pages：设置 → Pages → Branch 选择 gh-pages → / (root) → 保存。

注意：打包发布到 gh-pages 前需要改 vite.config.js 文件的 base 为"/three/"
