# Docsets2Html

### Usage
#### 使用说明

1. 复制 `*.docset` 文件夹到该目录下 (**注意备份原文件夹**)
2. `npm install`
3. `node index.js`
4. 打开 `index.html`


### How to Download .docset
#### 如何下载 .docset 文件夹

##### Windows
* 通过 [zeal](https://zealdocs.org/download.html)，生成的 `.docset` 文件夹在 应用目录下的 `docsets` 文件夹里
* 通过 [Velocity](https://velocity.silverlakesoftware.com/)，生成的 `.docset` 文件夹在 `%LOCALAPPDATA%\Silverlake Software LLC\Velocity\Docsets`下的 `Dash`/`DashUserContrib` 文件夹里


### Help Wanted
#### 寻求帮助
一些文档的 `docSet.dsidx` 内不存在 表`searchIndex` ，反而是许多 `Z` 开头的表，导致无法解析

### Addition Usage
#### 另类的使用方法
1. 使用`Velocity`下载文档
2. 通过该脚本转换
3. 复制到`zeal`下
* 因为`Velocity`常弹窗，且启动缓慢，但下载快，支持`Dash-User-Contributions`
* 而`zeal`下载慢，不支持`Dash-User-Contributions`，但反应迅速
