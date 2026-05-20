# 进度日志：Dify 本地部署与初始 Knowledge 测试

日期：2026-05-13  
分支：`devel`  
仓库：`Lecheng_ai_policy_agent`  
状态：部分完成 / 当前卡在中文检索测试  
作者：Xinyue Jia

---

## 1. 本阶段目标

本阶段目标是在本地成功启动 Dify，并创建一个最小测试 Knowledge，用于验证 Lecheng AI Policy Agent 项目的基础 RAG 流程。

第一阶段 POC 需要确认：

1. Dify 可以通过 Docker Compose 在本地运行；
2. 可以创建本地 Dify 管理员账户；
3. 可以通过 Dify GUI 创建测试 Knowledge；
4. 可以上传并处理 `.docx` 文档；
5. 可以进行 Retrieval Testing；
6. 在创建 Chatbot App 或 Workflow 之前，先识别中文文档检索中的潜在问题。

---

## 2. 环境信息

```text
操作系统：macOS
设备：Xinyue's MacBook Air
仓库：https://github.com/nangongzhe142-source/Lecheng_ai_policy_agent
分支：devel
本地路径：/Users/xinyuejia/Projects/lecheng_agents/Lecheng_ai_policy_agent
Dify 部署方式：Docker Compose
Dify 访问地址：http://localhost
Dify 初始化地址：http://localhost/install
```

---

## 3. 仓库与目录结构确认

最初误以为 Dify 位于：

```bash
dify/docker
```

但检查本地目录结构后确认，当前仓库根目录本身就是 Dify 项目根目录。

正确的 Docker 目录是：

```bash
/Users/xinyuejia/Projects/lecheng_agents/Lecheng_ai_policy_agent/docker
```

根目录中已确认存在以下文件和目录：

```text
AGENTS.md
CLAUDE.md
README.md
api
dev
docker
docs
packages
scripts
sdks
web
```

---

## 4. 已完成操作

### 4.1 切换到开发分支

```bash
git checkout devel
```

输出：

```text
Already on 'devel'
Your branch is up to date with 'origin/devel'.
```

---

### 4.2 确认正确的 Docker 目录

最初执行以下命令失败：

```bash
cd dify/docker
```

错误信息：

```text
cd: no such file or directory: dify/docker
```

正确路径为：

```bash
cd docker
```

---

### 4.3 创建 `.env` 文件

在 `docker/` 目录中执行：

```bash
cp .env.example .env
```

随后执行：

```bash
ls -a
```

确认存在以下文件：

```text
.env
.env.example
docker-compose.yaml
docker-compose-template.yaml
docker-compose.middleware.yaml
```

---

### 4.4 安装并启动 Docker Desktop

初次检查 Docker 时失败：

```bash
docker --version
docker compose version
```

错误信息：

```text
zsh: command not found: docker
```

原因判断：

```text
本机尚未安装 Docker Desktop，或 terminal 尚未识别 docker 命令。
```

解决方式：

```text
安装并启动 Docker Desktop for Mac。
```

---

### 4.5 本地启动 Dify

在 Docker 目录中执行：

```bash
cd /Users/xinyuejia/Projects/lecheng_agents/Lecheng_ai_policy_agent/docker
docker compose up -d
```

检查容器状态：

```bash
docker compose ps
```

观察到以下服务已启动：

```text
docker-api-1             healthy
docker-api_websocket-1   up
docker-db_postgres-1     healthy
docker-nginx-1           up，80/443 端口已映射
docker-plugin_daemon-1   up
docker-redis-1           health: starting
docker-sandbox-1         health: starting
docker-ssrf_proxy-1      up
docker-weaviate-1        up
docker-web-1             up
docker-worker-1          up
docker-worker_beat-1     up
```

结论：

```text
Dify 本地部署已成功启动。
```

---

### 4.6 创建本地 Dify 管理员账户

访问：

```text
http://localhost/install
```

创建本地 Dify 管理员账户。

说明：

```text
Docker 账户 ≠ Dify 管理员账户
```

- Docker 账户：用于 Docker Desktop / Docker Hub / 镜像管理；
- Dify 管理员账户：用于管理本地 Dify 实例，包括 Apps、Knowledge、Workflows、模型供应商、API keys 等。

---

### 4.7 创建第一个测试 Knowledge

在 Dify GUI 中操作：

```text
Knowledge
→ Create Knowledge
→ Import from file
```

上传测试文档：

```text
260316_海南乐城真实世界研究院工作指标与人员分工v1.0.docx
```

---

### 4.8 配置 Document Processing

在 `Document Processing` 页面使用了以下配置。

#### Chunk Settings

```text
Chunk mode: General
Delimiter: 


Maximum chunk length: 1024 characters
Chunk overlap: 50 characters
```

#### Text Pre-processing

已启用：

```text
Replace consecutive spaces, newlines and tabs
```

未启用：

```text
Delete all URLs and email addresses
Summary Auto-Gen
Chunk using Q&A format
```

#### Index Method

```text
Economical
```

选择原因：

```text
该模式不需要 embedding model，适合第一次低成本测试。
```

#### Retrieval Setting

```text
Inverted Index
Top K: 3
```

---

### 4.9 处理上传文档

点击：

```text
Save & Process
```

文档处理成功完成。

文档状态变为：

```text
Available
```

观察到的文档信息：

```text
Chunking mode: General
Words: approximately 2.8k
Retrieval count: 0
Status: Available
```

结论：

```text
测试 Knowledge 已创建成功，文档也已成功处理。
```

---

## 5. 当前问题 / 阻塞点

### 5.1 问题描述

当前配置下中文 Retrieval Testing 不稳定：

```text
Index Method: Economical
Retrieval Method: Inverted Index
```

以下查询未能稳定返回相关 chunks：

```text
向数图强
RWD 质量评价
可信数据空间
向数图强包括哪些工作？
```

### 5.2 初步原因判断

问题并不是 Dify Knowledge 只能支持英文。更可能的原因是：

```text
Economical + Inverted Index 不适合中文语义检索。
```

可能原因：

1. Inverted Index 主要是基于关键词的检索；
2. 英文文本有天然词间空格，而中文没有；
3. 当前倒排索引设置下，中文分词可能不稳定；
4. 没有 embedding 时，语义匹配能力有限；
5. 中文自然语言问题不一定能匹配被索引的精确关键词。

---

## 6. 当前状态

```text
已完成：
✅ 已确认仓库和分支
✅ 已确认正确 Docker 目录
✅ 已创建 .env
✅ 已安装并启动 Docker Desktop
✅ 已成功启动本地 Dify
✅ 已创建本地 Dify 管理员账户
✅ 已创建第一个测试 Knowledge
✅ 已上传 .docx 测试文档
✅ 文档处理完成
✅ 文档状态为 Available

当前阻塞：
⚠️ Economical + Inverted Index 下中文检索不稳定

尚未开始：
⏳ 模型供应商配置
⏳ Embedding model 配置
⏳ High Quality Knowledge 创建
⏳ Chatbot App 创建
⏳ 法规对比 Workflow
⏳ Catcher / Error handling 模块
```

---

## 7. 当前工作假设 / 初步决策

对于中文 RWD/RWE 与监管政策文档，当前工作假设是：

```text
Economical + Inverted Index 可用于低成本初始测试，
但实际中文 RAG POC 应使用 High Quality + embedding-based retrieval。
```

推荐的下一步检索配置：

```text
Index Method: High Quality
Retrieval Method: Vector Search 或 Hybrid Search
```

---

## 8. 下一步计划

### Step 1：配置模型供应商

在 Dify GUI 中进入：

```text
Settings
→ Model Provider
```

需要配置：

```text
Chat model
Embedding model
```

优先选择对中文文档支持较好的模型供应商。

---

### Step 2：使用 High Quality indexing 重新创建 Knowledge

创建新的测试 Knowledge：

```text
Knowledge
→ Create Knowledge
→ Import from file
→ 上传同一个测试 .docx
```

使用配置：

```text
Chunk mode: General
Index Method: High Quality
Retrieval Method: Vector Search
```

可选第二轮测试：

```text
Retrieval Method: Hybrid Search
```

---

### Step 3：重复 Retrieval Testing

测试问题：

```text
向数图强包括哪些工作？
RWD质量评价与适用性评价的产出形式是什么？
可信数据空间平台建设包括哪些内容？
海南乐城真实世界研究院的核心定位是什么？
```

验收标准：

```text
能够从上传文档中召回相关中文 chunks。
```

---

### Step 4：创建 Chatbot App

仅在 Retrieval Testing 成功后再进行：

```text
Studio
→ Create App
→ Chatbot
```

建议 app 名称：

```text
Lecheng Policy QA - POC
```

并连接 High Quality Knowledge。

---

### Step 5：在 GitHub 中记录当前问题

建议创建 GitHub Issue：

```text
Chinese retrieval testing unstable under Economical/Inverted Index
```

同时将本进度日志保存到：

```text
docs/progress_logs/2026-05-13-dify-local-setup.md
```

---

## 9. 注意事项

当前建议：

```text
本阶段不要修改 Dify 核心源码。
```

建议将 Lecheng 业务相关模块放在项目外层：

```text
Lecheng_ai_policy_agent/
├── docs/
│   ├── progress_logs/
│   ├── decisions/
│   ├── setup/
│   ├── troubleshooting/
│   ├── knowledge_base/
│   └── workflows/
├── deployment/
│   └── local/
└── lecheng_modules/
    ├── prompts/
    ├── workflows/
    ├── catcher/
    ├── knowledge_base_specs/
    └── evaluation/
```

当前优先任务是在构建复杂 workflow 或前端之前，先验证中文 RAG 检索是否可行。
