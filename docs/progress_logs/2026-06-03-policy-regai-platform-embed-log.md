# 进度日志：仿 RegAI 乐城政策智能平台（policy-regai）与智能体嵌入

日期：2026-06-03  
仓库：`Lecheng_ai_policy_agent`（工作区 `<REPO_ROOT>`）  
主题：在 Dify  monorepo `web/` 内实现多页面宿主平台，嵌入「乐城政策智能助手」  
状态：第一版页面与嵌入链路已实现；本地 `pnpm dev` 可验收；Docker 官方 `dify-web` 镜像尚未包含本功能  

> **脱敏说明**：本文档用于提交 GitHub。Web App slug / token 使用 `<WEB_APP_SLUG>` 占位；真实值写入 `web/.env.local` 或 `*.local.md`（不进库）。

---

## 1. 本日工作摘要

| 序号 | 事项 | 结果 |
|------|------|------|
| 1 | 仿 [RegAI Compare](https://regai.world/compare) 多页面法规智能平台（乐城政策域） | 已实现 6 个功能页 + 公共导航/页脚 |
| 2 | 嵌入现有 Dify 智能体（iframe + 全站悬浮气泡） | 复用 `/chatbot/{token}`、`embed.min.js`，未改 embed 源码 |
| 3 | i18n 命名空间 `policyRegai` | `en-US`、`zh-Hans` 已添加并注册 |
| 4 | 环境变量 `NEXT_PUBLIC_POLICY_AGENT_*` | 已写入 `web/env.ts`、`web/.env.example` |
| 5 | 本机 Node 22 + pnpm 11 工具链 | 便携 Node 22.22.3 + 用户 PATH；见第 6 节 |
| 6 | Cursor 终端 Node 版本冲突 | Cursor 自带 `v22.22.0` 不满足 `^22.22.1`；已加 `.vscode/settings.json` 与 `scripts/use-node22.ps1` |
| 7 | 质量检查 | `pnpm --filter dify-web type-check` 通过；policy-regai 相关 eslint 0 error |
| 8 | 本地开发模板 | 新增 `web/.env.local.example` |

---

## 2. 产品范围（第一版）

| 页面 | 路由 | 能力 |
|------|------|------|
| 首页 | `/policy-regai` | 重定向至 `/policy-regai/compare` |
| 地区比较 | `/policy-regai/compare` | 地区卡片多选，≥2 个显示对比表（mock 数据） |
| 政策法规库 | `/policy-regai/regulations` | 搜索、筛选、详情 Dialog |
| AI 分析 | `/policy-regai/analysis` | 选政策 → 预置分析演示 |
| 知识图谱 | `/policy-regai/knowledge-graph` | React Flow 交互图谱（专题/机构/材料/风险/文件） |
| 智能助手 | `/policy-regai/assistant` | iframe 嵌入 chatbot |
| 更新动态 | `/policy-regai/updates` | 列表 + 筛选（mock） |

品牌：**乐城政策智能服务平台**（未使用 RegAI 商标/真实 ICP/对方数据）。

---

## 3. 技术实现要点

### 3.1 路由组

使用 `(policyRegaiLayout)` 而非 `(shareLayout)`，避免 `Splash` / `web-app-context` 将路径末段误判为 chatbot `shareCode`。

```
web/app/(policyRegaiLayout)/policy-regai/
  layout.tsx, page.tsx
  compare/, regulations/, analysis/, knowledge-graph/, assistant/, updates/
```

### 3.2 组件与配置

| 路径 | 说明 |
|------|------|
| `web/app/components/policy-regai/` | 页面区块、mock 数据、i18n 辅助 `tp()` |
| `web/config/policy-agent.ts` | 读取 embed 相关 env |
| `web/i18n/en-US/policy-regai.json` | 英文文案 |
| `web/i18n/zh-Hans/policy-regai.json` | 简体中文文案 |
| `web/i18n-config/resources.ts` | 注册 `policyRegai` namespace |

### 3.3 嵌入方式

- **助手页 iframe**：`{NEXT_PUBLIC_POLICY_AGENT_BASE_URL}{BASE_PATH}/chatbot/{token}`
- **全站气泡**：`embed.min.js` + `window.difyChatbotConfig`（`NEXT_PUBLIC_POLICY_AGENT_ENABLE_BUBBLE=true`）
- token / baseUrl **不得**硬编码在源码；仅 env 注入

### 3.4 与 Docker 的关系

当前 `docker-compose` 使用 **`langgenius/dify-web:1.14.1` 官方镜像**，**不包含** 本次新增的 `policy-regai` 路由。

| 验收方式 | 说明 |
|----------|------|
| **推荐（开发）** | 本机 `pnpm dev`，访问 `http://localhost:3000/policy-regai/compare` |
| **生产（待做）** | 自构建 `dify-web` 镜像并替换 compose 中 `web` 服务，或在 `web.env` 中配置 embed 变量 |

智能体 chatbot 仍可由 Docker 在 `http://localhost/chat/<WEB_APP_SLUG>` 提供；宿主站 iframe 的 `NEXT_PUBLIC_POLICY_AGENT_BASE_URL` 指向 `http://localhost` 即可。

---

## 4. 本地开发与验收

### 4.1 环境准备（一次性）

```powershell
# 若 node -v 不是 v22.22.3，在项目终端执行：
. "<REPO_ROOT>\scripts\use-node22.ps1"

node -v   # v22.22.3
pnpm -v   # 11.1.1
```

便携 Node 路径：`%LOCALAPPDATA%\nodejs22\`  
pnpm 全局：`%APPDATA%\npm\`

### 4.2 配置

```powershell
cd "<REPO_ROOT>\web"
copy .env.local.example .env.local
# 编辑 .env.local：NEXT_PUBLIC_POLICY_AGENT_TOKEN=<WEB_APP_SLUG>
```

### 4.3 启动与访问

```powershell
cd "<REPO_ROOT>"
pnpm install          # 首次
pnpm dev              # 或按仓库既有流程
```

| URL |
|-----|
| `http://localhost:3000/policy-regai/compare` |
| `http://localhost:3000/policy-regai/assistant` |
| `http://localhost:3000/policy-regai/regulations` |

### 4.4 检查命令

```powershell
pnpm --filter dify-web type-check
pnpm --filter dify-web exec eslint -- "app/components/policy-regai" "app/(policyRegaiLayout)" "config/policy-agent.ts"
```

---

## 5. 本机工具链记录（2026-06-03）

| 组件 | 版本 | 路径/说明 |
|------|------|-----------|
| Node.js | 22.22.3 | `%LOCALAPPDATA%\nodejs22\`（便携版，满足 engines） |
| pnpm | 11.1.1 | `npm install -g pnpm@11.1.1` |
| 用户 PATH | 已去重 | `nodejs22` 与 `Roaming\npm` 置前 |
| Cursor 终端 | 注意 | 内置 Node v22.22.0 可能优先；复制 `.vscode/settings.example.json` → `settings.json`，或运行 `scripts/use-node22.ps1` |
| 应急脚本 | `scripts/use-node22.ps1` | 当前会话 prepend PATH |

---

## 6. 新增/修改文件清单（GitHub 可提交部分）

### 6.1 应用代码

- `web/app/(policyRegaiLayout)/policy-regai/**`
- `web/app/components/policy-regai/**`
- `web/config/policy-agent.ts`
- `web/env.ts`（`NEXT_PUBLIC_POLICY_AGENT_*`）
- `web/i18n/en-US/policy-regai.json`
- `web/i18n/zh-Hans/policy-regai.json`
- `web/i18n-config/resources.ts`

### 6.2 配置与工具

- `web/.env.example`（policy agent 段）
- `web/.env.local.example`（本地 dev 模板，**不含真实 token**）
- `docker/envs/core-services/web.env.example`（注释说明，供自构建镜像）
- `.vscode/settings.example.json`（含 Node 22 终端 profile；复制为本地 `settings.json`）
- `scripts/use-node22.ps1`

### 6.3 不应提交

- `web/.env.local`（含 `<WEB_APP_SLUG>`）
- `node_modules/`、`pnpm-lock` 若仅本地变更需按常规 review

---

## 7. 待办 / 后续

> **2026-06-04 更新**：政策导入、知识图谱、局域网、`LocaleMenu`、权威机构链接等见 `2026-06-04-policy-regai-enhancements-lan-log.md`。

- [x] 将 `web/.env.local.example` 复制为 `.env.local` 并填入真实 `<WEB_APP_SLUG>`（本机已完成，见 `.local.md`）
- [x] 浏览器验收 policy-regai 导航页 + 助手 iframe（局域网 172.16.101.52 已测）
- [ ] Docker 生产：自构建含 `policy-regai` 的 `dify-web` 镜像并更新 compose
- [ ] 其他 locale 的 `policy-regai.json`（当前非 en/zh 回退 en-US）
- [ ] AI Analysis v2：对接 Dify 工作流实时分析
- [ ] Compare 第二版：真实地图 / 后端 API 替换 mock

---

## 8. 常用命令速查

```powershell
cd "<REPO_ROOT>"
. .\scripts\use-node22.ps1
pnpm --filter dify-web type-check
pnpm dev

cd "<REPO_ROOT>\docker"
docker compose ps
```

---

*日志结束（脱敏版）*
