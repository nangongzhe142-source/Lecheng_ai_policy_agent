# 进度日志（progress_logs）

## 双文件约定

| 后缀 | 是否提交 GitHub | 内容 |
|------|-----------------|------|
| `*.md` | **是**（脱敏） | 占位符：`<REPO_ROOT>`、`<YOUR_LAN_IP>`、`<WEB_APP_SLUG>` 等 |
| `*.local.md` | **否**（仅本机） | 真实 IP、路径、slug、UUID；已被根目录 `.gitignore` 忽略 |

## 文件列表

| 日期 | 脱敏版（可 push） | 本地完整版 |
|------|-------------------|------------|
| 2026-05-13 | `2026-05-13-dify-local-setup-progress-log.md` | （可选自行补 `.local.md`） |
| 2026-05-20 | `2026-05-20-windows-docker-migration-and-ops-log.md` | `2026-05-20-windows-docker-migration-and-ops-log.local.md` |

## 提交前

参阅 `docs/setup/github-secrets-redaction.md`。
