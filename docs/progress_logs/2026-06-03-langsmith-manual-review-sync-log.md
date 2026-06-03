# 进度日志：LangSmith 人工复核同步脚本与每日计划任务

日期：2026-06-03  
仓库：`Lecheng_ai_policy_agent`（工作区路径 `<REPO_ROOT>`）  
主题：「2+1」人工复核闭环 — LangSmith Annotation Queue 自动入队 + Windows 每日调度  
状态：脚本与文档已就绪，待 `git push`；本机密钥与日志不进库  

> **脱敏说明**：本文档用于提交 GitHub。`LANGSMITH_API_KEY`、本机计划任务注册状态等见可选的 **`*.local.md`**（仅本地）。

---

## 1. 本日工作摘要

| 序号 | 事项 | 结果 |
|------|------|------|
| 1 | 从 Dify / LangSmith 导出中识别「是否需要人工复核：是」 | 已确认 Dify 输出在 `run.outputs["choices"]["content"]`，非 `text`/`answer` |
| 2 | 修复解析规则（界面显示全是「需复核=是」但脚本 matched=0） | 支持 Markdown：`- **是否需要人工复核**：是` |
| 3 | LangSmith Annotation Queue 自动入队 | `sync_langsmith_annotation_queue.py`，队列名 `Dialogue_requiring_manual_review` |
| 4 | 首次实跑入队 | 扫描 4 条 `llm` run，匹配 3 条并成功入队（1 条回答无结构化评估块，脚本按设计跳过） |
| 5 | Windows 每日自动同步 | `run_annotation_sync_daily.ps1` + `register_daily_annotation_sync_task.ps1`，默认每天 08:00 |
| 6 | 密钥与日志隔离 | `.gitignore` 增加 `langsmith.env.local`、`scripts/manual-review/logs/` |
| 7 | 列出本次 GitHub 应提交文件清单 | 见第 4 节 |

---

## 2. 背景与目标

运营要求对智能体回答做 **「2+1」人工复核**：

- **2（实时）**：对话产生「需人工复核」时尽快进入复核待办（目标：Webhook / 队列 API，脚本层已预留 Dify 导出筛选与对账）。
- **1（批量）**：每日/每周用导出做对账，补漏。

LangSmith 侧采用 **Annotation Queue** 作为复核待办列表（与 LangSmith 标注 UI 一致），由定时脚本把过去 30 小时内、且回答正文标明需复核的 `llm` run 推入队列；已在队列中的 run **幂等跳过**。

---

## 3. 技术要点（已验证）

### 3.1 LangSmith / Dify 字段

| 用途 | 路径 |
|------|------|
| 助手完整回答 | `run.outputs["choices"]["content"]` |
| 用户问题 | `inputs["messages"]` 中最后一条 `role=user` 的 `content` |
| 建议扫描 run | `run_name=llm`（避免 `message`+`llm` 重复） |

### 3.2 需复核判定（`review_common.py`）

1. 优先：`REVIEW_JSON={"need_manual_review":true,...}` 单行  
2. 回退：正则匹配 `是否需要人工复核` + `是` / `yes` / `true`（支持 `**` 加粗包裹标签）  
3. 若存在明确的 `否`，则不标为需复核  

### 3.3 已知边界

- 部分追问回答（如解释「为何无链接」）**未在正文末尾输出**评估块（无 `是否需要人工复核` 行），Dify 界面仍可能显示需复核时，脚本**不会**入队；需后续对接 Dify 侧独立标记字段时再扩展。
- LangSmith `list_runs` 单次 `--limit` 上限为 **100**。

---

## 4. 本次 GitHub 更新范围

### 4.1 应提交

| 路径 | 说明 |
|------|------|
| `.gitignore` | 忽略 `scripts/manual-review/langsmith.env.local`、`logs/` |
| `scripts/manual-review/README.md` | 全流程说明（导出筛选、对账、LangSmith、每日任务） |
| `scripts/manual-review/review_common.py` | 共用解析 |
| `scripts/manual-review/sync_langsmith_annotation_queue.py` | Annotation Queue 入队 |
| `scripts/manual-review/sync_langsmith_manual_review.py` | 导出 CSV |
| `scripts/manual-review/filter_manual_review.py` | Dify `export-app-messages` 筛选 |
| `scripts/manual-review/reconcile_manual_review.py` | 实时 vs 批量对账 |
| `scripts/manual-review/inspect_langsmith_structure.py` | 结构探测 |
| `scripts/manual-review/langsmith.env.example` | 环境变量模板（仅占位符 API Key） |
| `scripts/manual-review/run_annotation_sync_daily.ps1` | 每日同步入口（写日志） |
| `scripts/manual-review/register_daily_annotation_sync_task.ps1` | 注册 Windows 计划任务 |
| `docs/progress_logs/2026-06-03-langsmith-manual-review-sync-log.md` | 本日志 |

### 4.2 勿提交

| 路径 | 原因 |
|------|------|
| `scripts/manual-review/langsmith.env.local` | 含 `LANGSMITH_API_KEY` |
| `scripts/manual-review/logs/` | 本地运行日志 |
| `outputs/langsmith_manual_review.csv` 等 | 运行产物（若存在） |

### 4.3 建议提交命令

```powershell
cd "<REPO_ROOT>"
git add .gitignore `
  scripts/manual-review/ `
  docs/progress_logs/2026-06-03-langsmith-manual-review-sync-log.md `
  docs/progress_logs/README.md
git status
git check-ignore -v scripts/manual-review/langsmith.env.local
```

确认 `langsmith.env.local` **不在** staged 列表后再 commit / push。

### 4.4 建议 commit message

```text
feat(ops): LangSmith manual-review sync and daily Windows task

Add scripts to parse Dify review flags from LangSmith runs, push matches
to an Annotation Queue, and run daily via scheduled PowerShell. Exclude
local API keys and sync logs from git.
```

---

## 5. 目录与配置索引（脱敏）

| 说明 | 路径 |
|------|------|
| 脚本根目录 | `<REPO_ROOT>\scripts\manual-review\` |
| 环境模板（可提交） | `scripts\manual-review\langsmith.env.example` |
| 本机密钥（勿提交） | `scripts\manual-review\langsmith.env.local` |
| 同步日志（勿提交） | `scripts\manual-review\logs\` |
| 脱敏与提交规范 | `docs\setup\github-secrets-redaction.md` |
| 进度日志索引 | `docs\progress_logs\README.md` |

### 5.1 LangSmith（占位）

| 项 | 值 |
|----|-----|
| Project | `Lecheng_policy_ai_agent` |
| Annotation Queue | `Dialogue_requiring_manual_review` |
| Queue ID | 见 `langsmith.env.example` 中 `LANGSMITH_QUEUE_ID` |
| API Key | 仅 `langsmith.env.local` 或本机用户环境变量 |

### 5.2 Windows 计划任务（仅本机，不进 Git）

| 项 | 默认 |
|----|------|
| 任务名 | `Lecheng-LangSmith-ManualReview-Sync` |
| 触发 | 每天 08:00（本地时间） |
| 扫描窗口 | 最近 30 小时（`SYNC_HOURS`，可改 env） |
| 注册 | `.\register_daily_annotation_sync_task.ps1` |
| 手动试跑 | `.\run_annotation_sync_daily.ps1` |

---

## 6. 运维 chronicle（摘要）

1. 发现 Dify 回答使用 `- **是否需要人工复核**：是`，旧正则不匹配 → 更新 `review_common.py`。  
2. 手动执行 `sync_langsmith_annotation_queue.py`：3 条入队成功。  
3. 新增每日 PowerShell 包装与计划任务；本机已生成 `langsmith.env.local`（从会话环境注入，**勿 push**）。  
4. 提醒：若 API Key 曾在聊天或日志中暴露，应在 LangSmith 控制台**轮换**并更新 `langsmith.env.local`。

---

## 7. 待办 / 后续

- [ ] 执行 `git push` 将第 4.1 节文件同步至 GitHub  
- [ ] 其他 Windows 主机：复制 `langsmith.env.example` → `langsmith.env.local` 并注册计划任务  
- [ ] （可选）Dify Chatflow Webhook 实时入队，与 `filter_manual_review` / 对账脚本打通  
- [ ] （可选）对「界面标需复核但正文无评估块」的消息，确认 Dify 元数据字段后扩展解析  
- [ ] LangSmith API Key 定期轮换  

---

## 8. 常用命令

```powershell
cd "<REPO_ROOT>\scripts\manual-review"

# 一次性入队（最近 24 小时）
$env:LANGSMITH_API_KEY = "<从 langsmith.env.local 读取，勿写入日志>"
python sync_langsmith_annotation_queue.py `
  --queue-id "<LANGSMITH_QUEUE_ID>" `
  --project Lecheng_policy_ai_agent `
  --run-name llm `
  --hours 24 `
  --limit 100

# 每日包装（读 langsmith.env.local）
.\run_annotation_sync_daily.ps1

# 注册 / 改时间
.\register_daily_annotation_sync_task.ps1 -Time "08:00"
```

---

*日志结束（脱敏版）*
