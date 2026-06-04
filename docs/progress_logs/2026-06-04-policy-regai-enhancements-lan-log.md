# 进度日志：policy-regai 内容完善、知识图谱、局域网访问与权威机构链接

日期：2026-06-04  
仓库：`<REPO_ROOT>`（Lecheng Policy AI Agent / Dify monorepo）  
主题：在 2026-06-03 首版平台基础上，导入真实政策文件、完善交互、支持同事局域网访问  
前置日志：`2026-06-03-policy-regai-platform-embed-log.md`  
状态：**局域网演示可用**（Docker 80 + `pnpm dev:lan` 3000）；生产镜像待自构建  

> **脱敏说明**：Git 可提交本文。真实 IPv4、Web App token 写入 `*.local.md` 或 `web/.env.local`（不进库）。

---

## 1. 本日工作摘要

| 序号 | 事项 | 结果 |
|------|------|------|
| 1 | 移除 policy-regai 页 Dify 品牌痕迹 | 专属 favicon/标题；移除全站悬浮气泡；助手 iframe 品牌需在 Dify 后台关闭 |
| 2 | 全站语言切换（无需进登录页） | 导航栏接入 `LocaleMenu` + `setLocaleOnClient` |
| 3 | 导入 `C:\乐城政策数据库` 六个文件夹政策文件 | **41 份** PDF/Word → `web/public/policy-regai/documents/` + 法规库 UI |
| 4 | 知识图谱实质性完善 | React Flow 可交互图谱（筛选、搜索、高亮、详情面板、小地图） |
| 5 | 同事局域网访问全部功能 | `docker/.env` + `web/.env.local` 指向 `<YOUR_LAN_IP>`；`pnpm dev:lan` 绑定 `0.0.0.0:3000` |
| 6 | 权威机构官网外链 | 海南乐城真实世界研究院、CDE 药品审评中心 |
| 7 | 质量检查 | 各阶段 `pnpm --filter dify-web type-check` 通过 |

---

## 2. 政策文件导入

### 2.1 数据源

本地目录（不进 Git）：`C:\乐城政策数据库`，六个专题文件夹：

| 文件夹 | 导入文档数（约） |
|--------|------------------|
| 1-博鳌乐城药械零关税 | 2 |
| 2-博鳌乐城特许药械 | 5 |
| 3-博鳌乐城生物医学新技术 | 6 |
| 4-建立海南电子处方中心 | 3 |
| 5-博鳌乐城临时进口保健食品和特医食品 | 3 |
| 汇编-生物医学新技术印发文件汇编 | 22 |
| **合计** | **41** |

（xlsx/jpg/png 等缩略图未作为法规条目导入。）

### 2.2 同步脚本

```powershell
pnpm --filter dify-web sync-policy-documents
# 或指定源目录：
node web/scripts/sync-policy-documents.mjs "C:\乐城政策数据库"
```

产出：

| 产出 | 路径 |
|------|------|
| 静态文件 | `web/public/policy-regai/documents/{categoryId}/` |
| 法规数据 | `web/app/components/policy-regai/policy-documents.generated.ts` |
| 标题 i18n | `web/i18n/zh-Hans/policy-regai.json`、`en-US/...` 中 `doc.*.title` |

### 2.3 法规库 UI

- 按 **政策专题 / 地区 / 类型** 筛选
- **打开原文** 链至 `public` 下 PDF/Word
- 地区比较页政策计数随真实文档数更新

---

## 3. 知识图谱（React Flow）

### 3.1 能力

- **节点类型**：覆盖地区、政策专题、政策文件、主管机构、申报主体、关键材料、合规风险
- **交互**：拖拽平移、滚轮缩放、点击高亮关联边、右侧详情面板、专题筛选、名称搜索、图例显示/隐藏节点类型、可选展示政策文件节点、MiniMap + Controls
- **数据**：由 `knowledge-graph-data.ts` 从 `REGULATIONS` / 专题元数据构建

### 3.2 主要文件

| 文件 | 说明 |
|------|------|
| `knowledge-graph-data.ts` | 构图与布局 |
| `knowledge-graph-node.tsx` | 自定义节点 |
| `knowledge-graph-view.tsx` | 主视图与交互 |
| `knowledge-graph` i18n | `knowledgeGraph.*`、`knowledgeGraph.material.*`、`knowledgeGraph.risk.*` |

---

## 4. 品牌、语言与 Dify 嵌入

### 4.1 去 Dify 化（policy-regai 壳层）

| 项 | 实现 |
|----|------|
| 浏览器标题 / favicon | `(policyRegaiLayout)/layout.tsx` + `use-policy-regai-document-title.ts` |
| 悬浮 chatbot 气泡 | 已从 `layout-shell.tsx` 移除 |
| 助手 iframe 内 “Powered by Dify” | 需在 Dify Studio → 发布 → 自定义 → **移除 Powered by Dify**；`docker/.env` 已设 `ALLOW_EMBED=true` |

### 4.2 语言切换

- `nav.tsx` 引入 `LocaleMenu`（与登录页相同机制）
- `onChange` → `setLocaleOnClient` + `router.refresh()`

---

## 5. 局域网访问（同事同 Wi-Fi）

### 5.1 架构说明（两套进程）

| 组件 | 运行方式 | 端口 | 提供能力 |
|------|----------|------|----------|
| Docker Compose | 多容器（nginx/web/api/…） | **80** | Dify API、chatbot、后台 `/signin` |
| `pnpm dev:lan` | 本机 Node（vinext） | **3000** | **policy-regai 全部自定义页面** |

**不是**一个 Docker 容器同时提供两者；演示时 **Docker + dev:lan 必须同时运行**。

### 5.2 配置要点（脱敏）

**`docker/.env`**（示例）：

```env
CONSOLE_WEB_URL=http://<YOUR_LAN_IP>
CONSOLE_API_URL=http://<YOUR_LAN_IP>
APP_WEB_URL=http://<YOUR_LAN_IP>
APP_API_URL=http://<YOUR_LAN_IP>
SERVICE_API_URL=http://<YOUR_LAN_IP>/v1
NEXT_PUBLIC_SOCKET_URL=ws://<YOUR_LAN_IP>
ALLOW_EMBED=true
```

**`web/.env.local`**（示例）：

```env
NEXT_PUBLIC_API_PREFIX=http://<YOUR_LAN_IP>/console/api
NEXT_PUBLIC_PUBLIC_API_PREFIX=http://<YOUR_LAN_IP>/api
NEXT_PUBLIC_SOCKET_URL=ws://<YOUR_LAN_IP>
NEXT_PUBLIC_POLICY_AGENT_BASE_URL=http://<YOUR_LAN_IP>
NEXT_PUBLIC_POLICY_AGENT_TOKEN=<WEB_APP_SLUG>
```

**关键**：`NEXT_PUBLIC_POLICY_AGENT_BASE_URL` 不得写 `localhost`，否则同事浏览器 iframe 会连到自己的本机。

### 5.3 启动脚本与 npm 命令

| 命令 / 脚本 | 说明 |
|-------------|------|
| `pnpm dev:lan` | vinext `--hostname 0.0.0.0` + dev-proxy |
| `pnpm dev` | 仅本机 `127.0.0.1:3000`（Cursor 浏览器友好） |
| `scripts/start-lan-dev.ps1` | 防火墙规则（需管理员）、重启 Docker nginx/web/api、启动 `dev:lan` |

模板：`web/.env.local.lan.example`

### 5.4 发给同事的 URL（占位）

```
http://<YOUR_LAN_IP>:3000/policy-regai/compare
http://<YOUR_LAN_IP>:3000/policy-regai/regulations
http://<YOUR_LAN_IP>:3000/policy-regai/knowledge-graph
http://<YOUR_LAN_IP>:3000/policy-regai/assistant
http://<YOUR_LAN_IP>/signin          # Dify 后台（需账号）
```

浏览政策页 **无需登录**；助手依赖 Docker 80 端口 chatbot。

### 5.5 防火墙

Windows 需放行入站 **TCP 80、3000**（脚本 `New-NetFirewallRule` 需**管理员 PowerShell**）。

### 5.6 验收记录（本机）

- `http://<YOUR_LAN_IP>:3000/policy-regai/*` → HTTP 200
- `http://<YOUR_LAN_IP>/` → HTTP 307（Dify 正常）
- `http://<YOUR_LAN_IP>/chatbot/<WEB_APP_SLUG>` → HTTP 200

---

## 6. 权威机构官网链接

| 机构 | 官方 URL | 展示位置 |
|------|----------|----------|
| 海南乐城真实世界研究院 | https://www.hnrws.cn/ | 页脚「权威机构」、地区比较页、政策法规库页 |
| 国家药监局药品审评中心（CDE） | https://www.cde.org.cn/ | 同上 |

配置集中：`web/app/components/policy-regai/external-links.ts`  
组件：`authority-links.tsx`  
i18n：`links.*`、`footer.authorityLinks`

---

## 7. 新增 / 修改文件清单（可提交部分）

### 7.1 政策与图谱

- `web/scripts/sync-policy-documents.mjs`
- `web/app/components/policy-regai/policy-documents.generated.ts`
- `web/public/policy-regai/documents/**`
- `web/app/components/policy-regai/knowledge-graph-*.tsx`、`knowledge-graph-data.ts`
- `web/app/components/policy-regai/regulation-list.tsx`（真实文档 + 外链）
- `web/app/components/policy-regai/data.ts`

### 7.2 品牌、语言、布局

- `web/app/(policyRegaiLayout)/layout.tsx`
- `web/public/policy-regai/favicon.svg`
- `web/app/components/policy-regai/use-policy-regai-document-title.ts`
- `web/app/components/policy-regai/layout-shell.tsx`（去气泡）
- `web/app/components/policy-regai/nav.tsx`（LocaleMenu）

### 7.3 局域网

- `web/package.json`（`dev:vinext:lan`、`sync-policy-documents`）
- `package.json`（`dev:lan`）
- `web/.env.local.lan.example`
- `scripts/start-lan-dev.ps1`
- `docker/lecheng.env.example`（LAN URL 示例）

### 7.4 权威机构

- `web/app/components/policy-regai/external-links.ts`
- `web/app/components/policy-regai/authority-links.tsx`
- `web/app/components/policy-regai/footer.tsx`、`compare-panel.tsx`

### 7.5 不应提交

- `web/.env.local`
- `docker/.env`（若含固定 LAN IP，可按团队规范决定是否进库；当前含 `<YOUR_LAN_IP>` 占位更安全）
- `web/public/policy-regai/documents/**` 体积大时考虑 Git LFS 或部署时同步脚本

---

## 8. 待办 / 后续

- [ ] DHCP 变更后更新 `<YOUR_LAN_IP>` 并重启 Docker + dev:lan
- [ ] 防火墙规则以管理员身份执行一次
- [ ] Dify 后台关闭助手 iframe「Powered by Dify」
- [ ] 生产：自构建含 `policy-regai` 的 `dify-web` 镜像，合并 3000/80 为单一域名
- [ ] 知识图谱：与真实 RAG/实体抽取 API 对接（当前为规则构图）
- [ ] Compare / Analysis / Updates 仍部分 mock，待接后端或工作流

---

## 9. 常用命令速查

```powershell
cd "<REPO_ROOT>"
. .\scripts\use-node22.ps1

# 局域网演示（同事访问）
.\scripts\start-lan-dev.ps1
# 或手动：
cd docker; docker compose up -d
cd ..; pnpm dev:lan

# 仅本机开发
pnpm dev

# 重新同步政策文件
pnpm --filter dify-web sync-policy-documents

pnpm --filter dify-web type-check
```

---

*日志结束（脱敏版）*
