# Industry Atlas 部署说明

## 当前部署包

`deploy/docker-compose.yml` 同时启动：

- `api`：FastAPI、PDF/OCR、DeepSeek 代理、导出服务；
- `caddy`：自动申请和续期 HTTPS 证书，并反向代理 API；
- `industry_data`：保存 SQLite 数据库和上传文件的持久卷。

当前容器方案使用单实例 SQLite，适合个人或小团队首发。需要多实例、高并发或高可用时，再迁移 PostgreSQL 与对象存储。

## 部署步骤

1. 准备一台具有公网 IP 的 Linux 服务器，并把 API 域名解析到服务器；
2. 将 `deploy/.env.production.example` 复制为 `deploy/.env`；
3. 填写正式域名、随机 `APP_SECRET`、DeepSeek Key、微信 AppID/AppSecret 和允许访问的 Web 域名；
4. 在项目根目录运行 `powershell -ExecutionPolicy Bypass -File scripts/release-check.ps1 -Production`；
5. 进入 `deploy` 目录运行 `docker compose up -d --build`；
6. 确认 `https://你的域名/api/health` 和 `/api/ready` 返回正常；
7. 在微信公众平台把该 HTTPS 域名加入 request、uploadFile、downloadFile 合法域名；
8. 将小程序设置页的后端地址改为该 HTTPS 域名，完成真机预览后上传审核。

## 生产检查

生产模式的 `/api/ready` 会检查：开发登录已经关闭、签名密钥足够长、DeepSeek 与微信凭证已经配置、允许的主机名没有使用通配符。任一项不合格会返回 503，容器不会被标记为健康。

密钥只放在服务器的 `deploy/.env` 或云平台密钥服务中；该文件已被忽略，不进入发布压缩包和版本库。
