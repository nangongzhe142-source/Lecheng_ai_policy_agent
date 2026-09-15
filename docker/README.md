# Docker 部署指南

本目录用于在本仓库中通过 Docker Compose 运行 **Dify 后端与控制台**（API、Worker、PostgreSQL、Redis、Weaviate、Nginx 等）。

> **说明**：本仓库在 Dify 基础上扩展了 **policy-regai** 自定义页面。Docker 官方镜像只包含标准 Dify 控制台；policy-regai 页面需在 `web/` 目录单独启动开发服务（见下文「与 policy-regai 前端配合」）。

---

## 架构概览

| 访问方式 | 端口 | 内容 |
|----------|------|------|
| `http://localhost` | **80** | Dify 控制台、登录、工作流、RAG、Chatbot API |
| `http://localhost:3000` | **3000** | policy-regai 自定义页面（需 `pnpm dev`） |

```
浏览器
  ├─ :80  → nginx → web（Dify 前端）+ api（Flask API）
  └─ :3000 → Next.js 开发服务（policy-regai/compare 等）
```

数据持久化在 `docker/volumes/`（bind mount），重装 Docker Desktop **不会**自动删除这些目录。

---

## 环境要求

- [Docker Desktop](https://docs.docker.com/get-docker/)（Windows / macOS）或 Docker Engine + Compose（Linux）
- 建议：CPU ≥ 2 核，内存 ≥ 8 GB（首次拉镜像较慢）
- 磁盘：预留约 10 GB 以上（镜像 + 数据库 + 向量库）

---

## 快速启动

```powershell
cd docker

# 首次部署：从模板复制环境文件
copy .env.example .env

# 启动全部服务（后台运行）
docker compose up -d

# 查看容器状态
docker compose ps

# 查看日志
docker compose logs -f api nginx
```

启动成功后：

| 地址 | 用途 |
|------|------|
| http://localhost/install | 首次安装（创建管理员） |
| http://localhost/signin | 登录 |
| http://localhost/apps | 应用列表 |

若系统已初始化（`setup` 完成），直接访问 `/signin` 登录即可。

---

## 访问地址配置（重要）

`.env` 中的 URL 必须与**浏览器地址栏**一致，否则会出现「登录成功但立刻跳回登录页」的问题。

### 本机开发（推荐）

浏览器使用 `http://localhost` 时，`.env` 应配置为：

```env
CONSOLE_API_URL=http://localhost
CONSOLE_WEB_URL=http://localhost
APP_API_URL=http://localhost
APP_WEB_URL=http://localhost
SERVICE_API_URL=http://localhost/v1
NEXT_PUBLIC_SOCKET_URL=ws://localhost
```

修改后需重建相关容器：

```powershell
docker compose up -d --force-recreate web api nginx
```

### 局域网访问（同事演示）

1. 查本机 IP（如 `172.16.x.x`）
2. 将 `.env` 中上述 URL **全部**改为该 IP
3. 浏览器也必须用 `http://<IP>/signin` 打开，**不要**混用 `localhost` 页面 + IP 的 API

> 混用会导致 Cookie 跨域无法保存：登录 API 返回 200，但 `/account/profile` 仍为 401，页面卡在登录界面。

---

## 登录问题排查

| 现象 | 可能原因 | 处理 |
|------|----------|------|
| 登录按钮灰色 | 浏览器自动填充未触发 React 状态 | 手动重新输入密码 |
| 点击登录后仍停在登录页 | URL 不一致（见上一节） | 统一 `.env` 与浏览器地址，清除 Cookie 后重试 |
| 提示账号或密码错误 | 密码不正确 | 见下方重置密码 |
| 需重新初始化 | 数据库被清空 | 访问 `/install` 创建新管理员 |

### 重置密码

未配置邮件服务时，可在容器内重置：

```powershell
docker compose exec api flask reset-password `
  --email "your@email.com" `
  --new-password "YourPass123" `
  --password-confirm "YourPass123"
```

密码规则：至少 8 位，且同时包含字母和数字。

---

## 与 policy-regai 前端配合

policy-regai 页面（法规库、知识图谱、地区比较等）不在 Docker 官方 `web` 镜像内，需本地启动 Next.js：

```powershell
# 在仓库根目录
pnpm install
pnpm --filter dify-web dev
# 或绑定局域网：
pnpm --filter dify-web dev -- --hostname 0.0.0.0
```

| 页面 | 地址 |
|------|------|
| 地区比较 | http://localhost:3000/policy-regai/compare |
| 法规库 | http://localhost:3000/policy-regai/regulations |
| 知识图谱 | http://localhost:3000/policy-regai/knowledge-graph |

局域网演示时，同步修改 `web/.env.local` 中的 API 地址（该文件不进 Git）。

---

## 常用命令

```powershell
# 停止
docker compose down

# 停止并删除容器（不删 volumes/ 数据）
docker compose down

# 重启单个服务
docker compose restart api

# 进入 PostgreSQL
docker compose exec db_postgres psql -U postgres -d dify

# 查看 setup 状态
curl http://localhost/console/api/setup
```

---

## 仅启动中间件（本地开发 API/Web 源码时）

若要在宿主机直接跑 `api/`、`web/` 源码，可只启动数据库等中间件：

```powershell
copy envs\middleware.env.example middleware.env
docker compose --env-file middleware.env -f docker-compose.middleware.yaml -p dify up -d
```

默认启动 PostgreSQL + Weaviate。详见 `envs/middleware.env.example`。

---

## 目录与配置文件

```
docker/
├── docker-compose.yaml      # 主 Compose 文件
├── docker-compose.middleware.yaml
├── .env                     # 本地运行配置（不进 Git，从 .env.example 复制）
├── .env.example             # 默认模板
├── envs/                    # 可选高级配置（*.env.example → 去掉 .example 后生效）
├── volumes/                 # 持久化数据（数据库、上传文件、Weaviate 等）
├── nginx/                   # 反向代理模板
└── certbot/                 # HTTPS 证书（可选）
```

**加载顺序**：`envs/*.env` → `.env`（后者优先）。

### 关键变量

| 变量 | 说明 |
|------|------|
| `CONSOLE_API_URL` / `CONSOLE_WEB_URL` | 控制台 API 与前端 URL，须与浏览器一致 |
| `VECTOR_STORE` | 向量库类型（默认 `weaviate`） |
| `SECRET_KEY` | 会话签名密钥；留空则自动生成并持久化 |
| `COOKIE_DOMAIN` | 跨子域部署时设置；本机 localhost 通常留空 |
| `ENABLE_OTEL` | 是否启用 OpenTelemetry |

完整变量说明见 `.env.example` 与 `envs/` 下各示例文件。

---

## 数据备份

重要数据位于 `docker/volumes/`：

| 目录 | 内容 |
|------|------|
| `volumes/db/data` | PostgreSQL 数据库 |
| `volumes/app/storage` | 上传文件与本地存储 |
| `volumes/weaviate` | 向量索引 |

升级或重装 Docker 前，建议备份整个 `volumes/` 目录。

---

## HTTPS 与高级部署

- **SSL 证书**：见 [certbot/README.md](./certbot/README.md)
- **环境变量同步**（升级 Dify 后合并新变量）：`./dify-env-sync.sh`（Linux/macOS；Windows 可手动对比 `.env.example`）
- **向量库切换**：在 `.env` 中修改 `VECTOR_STORE` 及对应连接参数

---

## 相关文档

- 仓库根目录 [README.md](../README.md) — 项目总览
- [web/README.md](../web/README.md) — 前端开发
- [docs/progress_logs/](../docs/progress_logs/) — policy-regai 部署与局域网记录
- [Dify 官方自托管文档](https://docs.dify.ai/getting-started/install-self-hosted)
