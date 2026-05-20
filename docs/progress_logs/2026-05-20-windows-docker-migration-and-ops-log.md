# 进度日志：Windows 环境仓库同步、Docker 迁移与运维梳理

日期：2026-05-20  
仓库：`Lecheng_ai_policy_agent`  
远程：`https://github.com/nangongzhe142-source/Lecheng_ai_policy_agent.git`  
分支：`main`（克隆时最新提交 `292a108`）  
状态：Docker 已切换至新路径运行；知识库数据已定位；`.gitignore` 已加固  

> **脱敏说明**：本文档用于提交 GitHub。真实 IP、Web App slug、工作空间 UUID、本机用户名路径等见同目录下的 **`*.local.md`**（仅本地，已被 `.gitignore` 忽略）。

---

## 1. 本日工作摘要

| 序号 | 事项 | 结果 |
|------|------|------|
| 1 | 依据实施计划撰写 Dify「乐城政策智能助手」系统提示词、变量表、开场白、自检清单 | 已在会话中产出可复制文稿（待全部粘贴至 Dify 控制台） |
| 2 | 局域网发布说明（`localhost` → 局域网 IP、防火墙、`.env` 对外 URL） | 已梳理；Web App slug 曾变更（见本地日志） |
| 3 | Dify 多人协作（工作空间成员、SMTP、实时协作 WebSocket） | 已文档化要点 |
| 4 | 「数据来源」插件与知识库入库关系 | 已说明 |
| 5 | 从 GitHub 克隆仓库覆盖本地工作区 | 完成 |
| 6 | 将旧 Docker 目录内容复制到新仓库 `docker/` | 完成 |
| 7 | 厘清 Cursor 工作区 / Git 根 / Docker 运行根 | 已对齐至同一项目路径 |
| 8 | 确认当前运行中的 Compose 项目路径 | `<REPO_ROOT>\docker` |
| 9 | 定位知识库在 `volumes` 中的物理路径 | 已找到 `upload_files` 下约 42 个 PDF/docx 等 |
| 10 | GitHub 同步策略（`.env`、`volumes`、PDF 不进库） | 已讨论；更新根目录 `.gitignore` |
| 11 | 私人仓库是否可提交 `.env` / `volumes` | 结论：仍不推荐；应用 DSL + 备份更合适 |

---

## 2. 环境信息（Windows · 脱敏）

```text
操作系统：Windows
Cursor / 工作区：<REPO_ROOT>
Git 仓库根：<REPO_ROOT>
Docker 运行根：<REPO_ROOT>\docker
Docker Compose 项目名：docker
运行状态：running(12)
配置文件：<REPO_ROOT>\docker\docker-compose.yaml

Dify 本机访问：http://localhost
Dify 局域网访问：http://<YOUR_LAN_IP>
Web App（本地）：http://localhost/chat/<WEB_APP_SLUG>

旧 Docker 路径（迁移前）：<OLD_DOCKER_ROOT>\docker
向量库类型：weaviate（见 docker\.env.example）
```

### 2.1 网卡 IP（占位）

| 适配器 | 占位 | 适用场景 |
|--------|------|----------|
| WLAN | `<WLAN_IP>` | 同一 Wi-Fi 同事访问 |
| VPN 网卡 | `<VPN_IP>` | 同 VPN 网段 |
| 虚拟网卡 | 勿用 | WSL / Hyper-V 交换机 |

---

## 3. 关键路径索引（脱敏）

### 3.1 项目与 Git

| 说明 | 路径 |
|------|------|
| 工作区 / Git 根 | `<REPO_ROOT>\` |
| Git 远程 | `https://github.com/nangongzhe142-source/Lecheng_ai_policy_agent.git` |
| 本日志（GitHub） | `docs\progress_logs\2026-05-20-windows-docker-migration-and-ops-log.md` |
| 本日志（本地明文） | `docs\progress_logs\2026-05-20-windows-docker-migration-and-ops-log.local.md` |
| 脱敏与提交规范 | `docs\setup\github-secrets-redaction.md` |

### 3.2 Docker 部署（当前生效）

| 说明 | 路径 |
|------|------|
| Compose 与启动目录 | `<REPO_ROOT>\docker\` |
| 编排文件 | `<REPO_ROOT>\docker\docker-compose.yaml` |
| 环境变量（含 API Key，仅本地） | `<REPO_ROOT>\docker\.env` |
| 环境模板（可提交） | `<REPO_ROOT>\docker\.env.example` |
| 乐城变量说明（占位符，可提交） | `<REPO_ROOT>\docker\lecheng.env.example` |

### 3.3 知识库与持久化数据

| 组成部分 | 路径 | 约略大小 |
|----------|------|----------|
| 上传原文件 | `<REPO_ROOT>\docker\volumes\app\storage\` | ~26 MB |
| 上传明细 | `...\upload_files\<WORKSPACE_UUID>\` | ~42 文件 |
| PostgreSQL | `...\volumes\db\data\` | ~90 MB |
| Weaviate | `...\volumes\weaviate\` | ~15 MB |

### 3.4 版本控制

| 说明 | 路径 |
|------|------|
| 根 `.gitignore` | `<REPO_ROOT>\.gitignore` |
| 政策 PDF 源码（本地） | `<REPO_ROOT>\policy-docs\` |

---

## 4. 本日操作 chronicle（摘要）

- 智能体：**乐城政策智能助手**；知识库：**乐城政策数据库**
- 克隆仓库至 `<REPO_ROOT>`；自 `<OLD_DOCKER_ROOT>\docker` 复制 `.env` 与 `volumes\` 至新 `docker\`
- nginx 绑定 `0.0.0.0:80`；局域网需改 `docker\.env` 中 `CONSOLE_WEB_URL` 等
- `.gitignore` 增加 API、PDF、`.local.md` 本地-only 规则

---

## 5. 三个「目录」对齐状态

```text
Cursor 工作区  =  <REPO_ROOT>
Git 仓库根     =  <REPO_ROOT>
Docker 运行根  =  <REPO_ROOT>\docker
```

---

## 6. GitHub 同步原则

| 应提交 | 不应提交 |
|--------|----------|
| 代码、`*.env.example`、`lecheng.env.example`、脱敏 `docs/` | `docker/.env`、`docker/volumes/**`、PDF、`**/*.local.md` |

详见：`docs/setup/github-secrets-redaction.md`

---

## 7. 待办 / 后续

- [ ] 提示词/变量/开场白粘贴至 Dify 并测试
- [ ] 局域网 URL 与 `NEXT_PUBLIC_SOCKET_URL` 配置
- [ ] SMTP 与成员邀请
- [ ] `git push` 前执行 `git status` 与 `git check-ignore -v docker/.env`

---

## 8. 常用命令

```powershell
cd "<REPO_ROOT>\docker"
docker compose ps
docker compose up -d
docker compose ls
```

---

*日志结束（脱敏版）*
