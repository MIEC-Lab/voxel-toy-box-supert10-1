# Vercel 部署检查清单 - Kimi API 集成

**状态**: 代码已推送，部署正在进行中 (commit: 534300b)

## 1. 必需的环境变量配置

在 Vercel 项目设置中配置以下环境变量：

### 核心配置 (必需)
```
KIMI_API_KEY=sk-xxxxxxx  # 或 MOONSHOT_API_KEY
```

### 数据库配置 (可选)
```
DATABASE_URL=postgresql://user:pass@host/db     # 或 POSTGRES_URL, POSTGRES_PRISMA_URL
LOCAL_DB_MODE=memory                            # 用于测试，使用嵌入式内存数据库
```

### 可选代理配置
```
LOCAL_PROXY_URL=http://proxy:port  # 仅当需要通过代理访问 Kimi API 时
```

## 2. API 端点验证步骤

部署完成后（约 1-3 分钟），按以下顺序验证：

### 步骤 1: 验证数据库连接
```bash
curl https://voxel-toy-box-supert10-1.vercel.app/api/debug/db-health
```
**预期结果** (200):
```json
{
  "ok": true,
  "mode": "embedded",  # 或 "postgres" 或 "noop"
  "message": "..."
}
```

### 步骤 2: 验证数据库反馈端点
```bash
curl https://voxel-toy-box-supert10-1.vercel.app/api/debug/db-feedback
```
**预期结果** (200 或 503):
```json
{
  "success": true,
  "purpose": "db-feedback-without-kimi",
  "databaseReport": { ... }
}
```

### 步骤 3: 验证 Kimi API 连接
```bash
curl -X POST https://voxel-toy-box-supert10-1.vercel.app/api/lego-kimi \
  -H "Content-Type: application/json" \
  -d '{"prompt":"cute rabbit","mode":"fast"}'
```
**预期结果** (200 成功 或 500 但包含 databaseReport):
```json
{
  "success": true,
  "voxels": [...],
  "databaseReport": { ... }
}
```
或
```json
{
  "success": false,
  "error": "...",
  "databaseReport": { ... }
}
```

## 3. 部署后端代码修复清单

✓ **Backend Database Reporting**
- [x] lego-kimi.ts: 返回 databaseReport
- [x] saveGenerationRecord(): 返回 DatabaseReport
- [x] types.ts: DatabaseReport 类型定义

✓ **Debug Endpoints**
- [x] /api/debug/db-health: 数据库健康检查
- [x] /api/debug/db-feedback: DB-only 反馈（无模型依赖）
- [x] /api/debug/generation-logs: 生成日志查询

✓ **Network & Compatibility**
- [x] networkProxy.ts: Linux 安全处理 (process.platform !== 'win32')
- [x] db.ts: Lazy loading 避免 serverless 启动崩溃
- [x] Package.json 依赖项: pg, undici, openai

## 4. 可能的故障排除

### 如果仍然收到 500 错误

1. **检查 Kimi API 密钥**
   - Vercel 项目设置 → Environment Variables
   - 确保 KIMI_API_KEY 或 MOONSHOT_API_KEY 已设置
   - 验证密钥格式正确

2. **检查 Vercel 构建日志**
   - Vercel 仪表板 → Deployments → 最新部署
   - 查看 "Build Logs" 中是否有错误

3. **检查 Vercel 函数日志**
   - Vercel 仪表板 → Functions → 选择函数
   - 查看实时日志了解具体错误

4. **网络/代理问题**
   - 确保 Vercel 函数可以访问 api.moonshot.cn
   - 如需代理，设置 LOCAL_PROXY_URL 环境变量

## 5. 本地测试验证（已完成）

✓ npm run typecheck: PASS
✓ npm run build: PASS (built in 4.60s)
✓ Local db-feedback: Returns databaseReport
✓ Local lego-kimi: Error handling returns databaseReport
✓ Git push to origin/main: SUCCESS (commit 534300b)

## 6. 下一步

1. 等待 Vercel 部署完成（通常 2-5 分钟）
2. 按步骤 1-3 验证端点
3. 在前端测试完整的生成流程
4. 检查 Vercel 函数日志了解 Kimi API 连接详情

**部署开始时间**: 2026-04-27 03:30:00 UTC
**预计完成时间**: 2026-04-27 03:35:00 UTC
