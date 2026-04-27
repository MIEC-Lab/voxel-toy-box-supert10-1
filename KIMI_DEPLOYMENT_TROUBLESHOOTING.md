# Kimi API 连接问题 - 诊断与解决方案

## 问题诊断结果

**根本原因**: Vercel 上运行的是旧版本代码
- ✗ `/api/debug/db-feedback` 返回 404 → 新端点未部署
- ✗ `/api/debug/db-health` 返回 500 → 旧代码仍在运行

**已推送的修复** (commit: 534300b):
1. lego-kimi.ts: 现在返回 databaseReport
2. db-feedback.ts: 新的纯数据库端点
3. db.ts: 修复 Vercel 启动问题
4. types.ts: 添加 DatabaseReport 类型

## 解决步骤

### 方案 A: 等待自动部署（推荐，通常 2-5 分钟）

如果已在 GitHub 连接 Vercel，部署应自动进行。
**验证方式**:
1. 访问 Vercel 仪表板
2. 点击项目 `voxel-toy-box-supert10-1`
3. 查看 "Deployments" 标签
4. 寻找新的部署（大约在 2026-04-27 03:30 UTC 之后）
5. 等待状态变为 ✓ Ready

### 方案 B: 手动触发重新部署

**使用 Vercel CLI**:
```powershell
# 安装 Vercel CLI（如未安装）
npm.cmd install -g vercel

# 登录 Vercel
vercel login

# 在项目目录中重新部署
cd "c:\Users\lyouy\Desktop\project\cs183\miec-lab-classroom-cs183-2026-voxel-toy-box-voxel_toy_box\voxel-toy-box-supert10-1"
vercel --prod
```

**使用 Vercel 网页界面**:
1. 访问 https://vercel.com/dashboard
2. 选择项目 `voxel-toy-box-supert10-1`
3. 在 Deployments 标签中找到最新的
4. 点击 "..." 菜单
5. 选择 "Redeploy"

### 方案 C: 验证 Vercel 项目配置

**检查项目是否连接了 GitHub**:
1. Vercel 仪表板 → 项目设置
2. 查看 "Connected Git Repository"
3. 确认指向 `ALC888/voxel-toy-box-supert10-1` (fork)
4. 确认 Production branch = `main`

**检查部署设置**:
1. Settings → Git → Automatic Deployments
2. 确认已启用
3. Branch 设置为 `main`

## 部署后验证

部署完成后，按以下顺序测试：

### 1️⃣ 数据库端点 (无模型依赖)
```powershell
Invoke-RestMethod -Method Get -Uri 'https://voxel-toy-box-supert10-1.vercel.app/api/debug/db-health'
```
预期: `{ "ok": true/false, "mode": "embedded"/"noop"/"postgres", ... }`

### 2️⃣ 数据库反馈端点 (新端点)
```powershell
Invoke-RestMethod -Method Get -Uri 'https://voxel-toy-box-supert10-1.vercel.app/api/debug/db-feedback'
```
预期: `{ "success": true, "databaseReport": { ... } }`

### 3️⃣ Kimi 生成端点 (需要 KIMI_API_KEY)
```powershell
$body = @{
    prompt = "cute small red bird"
    mode = "fast"
    options = @{
        style = "cartoon"
        size = "small"
    }
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri 'https://voxel-toy-box-supert10-1.vercel.app/api/lego-kimi' `
    -ContentType 'application/json' `
    -Body $body
```
预期:
- 成功: `{ "success": true, "voxels": [...], "databaseReport": {...} }`
- 需要密钥: `{ "success": false, "error": "Missing KIMI_API_KEY...", "databaseReport": {...} }`

## 如果仍然失败

### 检查 Vercel 构建日志
1. Vercel 仪表板 → Deployments
2. 点击最新的 Failed 部署
3. 查看 "Build Logs" 输出

### 常见错误及解决

**错误**: `Missing KIMI_API_KEY`
→ Vercel 项目设置 → Environment Variables → 添加 `KIMI_API_KEY`

**错误**: `Module not found: 'pg'` 或 `Cannot find module 'undici'`
→ 推送新 commit 或重新部署，npm install 应该会重新运行

**错误**: `FUNCTION_INVOCATION_FAILED` (仍然)
→ 检查 Vercel 函数日志:
  1. 项目 Settings → Functions
  2. 选择 `/api/lego-kimi` 函数
  3. 查看实时日志（Logs 标签）

### 查看 Vercel 实时函数日志
```powershell
# 使用 Vercel CLI
vercel logs api/lego-kimi --prod
```

## 后续步骤

部署验证成功后：

1. ✓ 数据库健康检查通过
2. ✓ db-feedback 端点返回 databaseReport
3. ✓ lego-kimi 返回 databaseReport（成功或带错误）
4. → 前端测试完整生成流程
5. → 验证 UI 正确显示生成结果和错误信息

## 技术细节

**为什么新代码需要重新部署？**
- Vercel serverless 函数在部署后被冻结
- 需要新的部署来执行新代码
- Git push 触发 webhook，但处理可能有 1-5 分钟延迟

**为什么 db-feedback 返回 404？**
- 该端点是新创建的 (`api/debug/db-feedback.ts`)
- 旧部署中不存在该文件
- 只有部署新代码后才会可用

**Kimi 连接失败的可能原因**:
1. KIMI_API_KEY 未设置或错误
2. Kimi API 服务故障
3. 网络/防火墙限制
4. 代码 bug（已在新版本中修复）
