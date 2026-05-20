# GitHub 提交与本地敏感信息分离

目标：**推送到 GitHub 的内容经过脱敏或占位**；**真实 API Key、IP、路径、政策 PDF 仅保留在本机**，由 `.gitignore` 保证不会被 `git add` 跟踪。

---

## 1. 三层防护

| 层级 | 机制 | 本地明文位置 | GitHub 上 |
|------|------|--------------|-----------|
| **A. 永不进库** | `.gitignore` | `docker/.env`、`docker/volumes/**`、`*.pdf`、`policy-docs/` | 不存在 |
| **B. 仅提交模板** | `*.env.example` | 你复制为 `docker/.env` 后填入真 Key | 只有占位符 |
| **C. 双份文档** | `*.md` vs `*.local.md` | `docs/**/*.local.md` 写真实 IP/slug | 同名 `.md` 用 `<占位符>` |

---

## 2. 文件对照表

| 用途 | 本地（明文） | 提交 GitHub（脱敏） |
|------|--------------|---------------------|
| Docker 环境变量 | `docker/.env` | `docker/.env.example`、`docker/lecheng.env.example` |
| 进度日志 | `docs/progress_logs/YYYY-MM-DD-*.local.md` | `docs/progress_logs/YYYY-MM-DD-*.md` |
| 政策原文 PDF | `policy-docs/` 或 `docs/knowledge_base/files/` | 不提交（已 ignore） |
| Dify 已入库文件 | `docker/volumes/app/storage/upload_files/` | 不提交 |
| 知识库索引 | `docker/volumes/db/`、`docker/volumes/weaviate/` | 不提交 |
| 应用 DSL 备份 | 可选 `docs/apps/*.yaml`（导出前检查无 Key） | 可提交 |

---

## 3. 占位符约定（写入可提交的文档）

在 Markdown 或 example 文件中使用：

| 占位符 | 含义 |
|--------|------|
| `<REPO_ROOT>` | 仓库根目录，如 `d:\LECHENG POLICY AI AGENT` |
| `<OLD_DOCKER_ROOT>` | 迁移前 Docker 父目录 |
| `<YOUR_LAN_IP>` | 局域网 IP |
| `<WLAN_IP>` / `<VPN_IP>` | 各网卡 IP |
| `<WEB_APP_SLUG>` | `/chat/` 后的应用 ID |
| `<WORKSPACE_UUID>` | `upload_files` 下目录名 |
| `sk-********` | API Key 示意 |

**不要**在可提交文件里写：`sk-` 开头完整 Key、真实 SMTP 密码、完整内网 IP（若介意暴露拓扑可用 `<YOUR_LAN_IP>`）。

---

## 4. 日常流程

### 4.1 首次在本机配置

```powershell
cd <REPO_ROOT>\docker
copy .env.example .env
# 编辑 .env 填入真实 Key（此文件永不 commit）
```

参考 `docker/lecheng.env.example` 了解乐城项目常改项（均为占位符）。

### 4.2 写进度日志

1. 在 `docs/progress_logs/` 新建 `YYYY-MM-DD-主题.local.md`，写**真实路径、IP、slug**。
2. 维护或生成同名的 `YYYY-MM-DD-主题.md`，全部改用占位符。
3. 只 `git add` 不带 `.local` 后缀的文件。

### 4.3 推送前检查（必做）

```powershell
cd <REPO_ROOT>
git status
git check-ignore -v docker\.env
git diff --cached --name-only
```

确认列表中**没有**：

- `docker/.env`
- `docker/volumes/...`
- `*.pdf` / `*.local.md`
- 任何含 `sk-` 真实密钥的文件

### 4.4 若误提交密钥

1. 立即在供应商控制台**轮换 API Key**。
2. 使用 `git rm --cached <file>` 从索引移除，勿只删工作区。
3. 若已 push，需清理 Git 历史（`git filter-repo` 等）并强制推送前与团队沟通。

---

## 5. `docker/.env` 与 `lecheng.env.example`

- **`docker/.env`**：Dify 实际读取，**仅本地**，已在 `.gitignore`。
- **`docker/.env.example`**：上游 Dify 默认模板，可提交。
- **`docker/lecheng.env.example`**：乐城项目补充说明（DeepSeek、百炼、局域网 URL、SMTP 等），**仅含占位符**，可安全提交。

本地操作：将 `lecheng.env.example` 中的变量名合并进你的 `.env`，把占位符换成真实值。

---

## 6. 私人 GitHub 仓库

私人仓可降低公网泄露概率，但**不能替代**上述规则：协作者、历史 commit、误操作公开仍有风险。`volumes` 与完整 `.env` 仍不建议入库。

---

## 7. 相关路径

| 文件 | 路径 |
|------|------|
| 根 `.gitignore` | `<REPO_ROOT>/.gitignore` |
| 进度日志目录说明 | `<REPO_ROOT>/docs/progress_logs/README.md` |
| 2026-05-20 脱敏日志 | `docs/progress_logs/2026-05-20-windows-docker-migration-and-ops-log.md` |
| 2026-05-20 本地完整日志 | `docs/progress_logs/2026-05-20-windows-docker-migration-and-ops-log.local.md` |
