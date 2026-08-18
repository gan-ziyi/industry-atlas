# Industry Atlas 小程序发布清单

## 一键启动本地开发版

双击项目根目录的 `启动小程序开发版.cmd`，脚本会检查并启动本地后端，然后使用正式 AppID 打开微信开发者工具中的 `miniprogram` 项目。真实密钥仅保存在后端 `.env`，不会进入小程序发布包。

## 已完成

- 11 个原生小程序页面与 5 个主导航入口；
- 本地体验、邮箱注册/登录、微信登录和微信账号绑定；
- 多研究空间、成员邀请和 owner/editor/viewer 权限；
- 产业项目新建、AI 新建、改名、删除、版本同步和冲突提示；
- 产业节点浏览、搜索、拆解、编辑、删除、指标、瓶颈、证据和人工核验；
- DeepSeek 图谱补丁审核，逐项展示修改前、修改后和理由；
- PDF 上传、页码文本、表格、OCR、年报提取和人工接纳；
- 公司档案、公司—产业节点映射确认/排除；
- 研究任务创建、关联、优先级和状态推进；
- Word、Excel、PDF 精准导出；
- 后端自动化测试（含生产就绪安全门槛）、前端语法/事件/密钥检查和微信模拟器运行日志检查。

## 微信平台侧必需项

这些内容不能由代码代替，正式发布前需要在对应账号下提供：

1. 在微信公众平台注册小程序，取得正式 AppID；
2. 将 `miniprogram/project.config.json` 的 `appid` 替换为正式 AppID；
3. 在后端部署环境配置同一小程序的 `WECHAT_APP_ID` 与 `WECHAT_APP_SECRET`；
4. 将 FastAPI 后端部署到已备案的 HTTPS 域名；
5. 在微信公众平台配置 request、uploadFile、downloadFile 合法域名；
6. 在后端密钥服务或环境变量中配置新的 `DEEPSEEK_API_KEY`；
7. 生产环境关闭 `ALLOW_DEV_LOGIN`，修改 `APP_SECRET`，数据库迁移至 PostgreSQL，PDF 文件迁移到对象存储；
8. 开发者工具使用正式 AppID 完成真机预览，再上传体验版并提交微信审核。

项目已经提供 `deploy/docker-compose.yml`、Caddy HTTPS 配置、生产环境模板和自动发布检查。完整部署步骤见 `DEPLOYMENT.md`。

## 安全要求

- DeepSeek Key、微信 AppSecret 和后端签名密钥不得进入小程序源码；
- 聊天、截图或公开仓库中出现过的密钥应当作废并重新生成；
- 正式环境必须使用 HTTPS，关闭开发登录和“不校验合法域名”；
- 发布前重新运行 `node miniprogram/check.mjs` 与后端测试。
