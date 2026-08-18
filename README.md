# Industry Atlas · 产业研究工作台

Industry Atlas 是一个以产业链为核心的本地研究工作台。它帮助研究者逐层拆解产业结构、维护节点研究卡片、整理公司映射，并利用 DeepSeek 辅助分析年报和生成可审核的产业图谱修改建议。

> 普通用户可以从 [GitHub Releases](https://github.com/gan-ziyi/industry-atlas/releases) 下载 Windows 安装包，无需安装 Python 或 Node.js。

## 普通用户安装

1. 打开 [Releases 下载页](https://github.com/gan-ziyi/industry-atlas/releases)；
2. 下载最新的 `IndustryAtlas-Setup-版本号-x64.exe`；
3. 双击安装并保留“创建桌面快捷方式”；
4. 启动后点击左下角“系统设置”，填写自己的 DeepSeek API Key；
5. 使用“本机使用”进入个人研究空间。

每位用户的数据保存在自己的 `%LOCALAPPDATA%\IndustryAtlas` 目录，彼此不会互通。卸载应用不会主动删除研究数据。

## 核心能力

- 可缩放、拖拽和逐层展开的产业图谱；
- 浏览模式与编辑模式，节点内容和位置自动保存；
- AI 新建行业、继续拆解节点和完善研究内容；
- AI 修改前后差异审查，可逐项接受或拒绝；
- PDF 年报解析、本地 OCR、表格提取和页码级证据；
- 公司档案、产业位置映射和多期经营数据；
- 研究任务、完整度看板、快照和历史恢复；
- Word、Excel、PDF 研究报告导出；
- 本地数据库和专用浏览器数据，不依赖公共服务器。

## 产品形态

目前推荐以 Windows 本地版使用：每位用户在自己的电脑运行同一套工作台，研究数据和 API Key 相互独立，不会自动与其他用户互通。

未来如需团队协作、跨电脑同步和统一账号，可以在现有 FastAPI 后端基础上部署云端服务。

## 项目结构

```text
backend/       FastAPI、SQLite、PDF/OCR、DeepSeek 和报告导出
web/           React + TypeScript 正式工作台
miniprogram/   微信小程序适配版
deploy/        服务端部署示例
scripts/       本地启动、检查和打包脚本
```

项目根目录中的原生 HTML/CSS/JavaScript 版本是早期交互原型，正式电脑版使用 `web/` 前端。

## Windows 源码运行

### 1. 准备后端

```powershell
cd backend
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

编辑 `backend/.env`，按需填写自己的 `DEEPSEEK_API_KEY`。密钥只应留在本机，绝不能提交到 GitHub。

### 2. 构建前端

```powershell
cd ..\web
npm install
npm run build
```

### 3. 启动工作台

回到项目根目录，双击 `启动电脑版.cmd`，或运行：

```powershell
.\scripts\start-desktop.ps1
```

工作台默认在 `http://127.0.0.1:4173` 打开，后端服务地址为 `http://127.0.0.1:8000`。

## 本地数据

- 产业地图草稿会自动保存；
- 项目、年报和分析记录保存在 `backend/data/`；
- 双击 `备份电脑版数据.cmd` 可以创建本机数据备份；
- `.env`、数据库、上传文件、备份包和浏览器资料均被 Git 忽略。

## 安全说明

不要在 Issue、提交记录、截图或示例文件中发布 DeepSeek Key、微信 AppSecret、生产环境密码或真实用户数据。发现泄漏后应立即在对应平台撤销并重新生成密钥。

更多说明：

- [正式 Web 前端](./web/README.md)
- [后端与接口](./backend/README.md)
- [产品路线图](./PRODUCT_ROADMAP.md)
- [部署说明](./DEPLOYMENT.md)

## 当前状态

项目处于可运行的本地产品原型阶段，已经提供 Windows 安装程序和用户自行配置 DeepSeek Key 的界面。后续仍计划补充更完整的首次启动引导、自动更新和数据恢复流程。
