# 模板升格算法任务书

## 范围
本任务书覆盖两个算法：

- Template Promotion Scoring：模板升格评分算法
- Promotion Log Visualization：升格日志可视化算法

## 硬约束
- 不允许自动把 `candidate` 改成 `active`。
- 不允许通过日志反向修改线上路由。
- 不允许引入网络依赖。
- 不允许把生成式候选直接入库。
- 新增日志字段不得包含密钥、token、cookie、环境变量或完整请求体。

## 交付物
- 设计文档：`harness/TEMPLATE_PROMOTION_ALGORITHMS_DESIGN.md`
- 任务书：`harness/TEMPLATE_PROMOTION_ALGORITHMS_TASKBOOK.md`
- 类型合同：`src/contracts/promotion.ts`
- 算法模块：`src/promotion/`
- 日志事件扩展：`template_promotion`
- 可视化报告数据结构

## Task 1：定义升格合同层
### 目标
固定升格评分、评分拆解、升格决策、可视化报告的数据结构。

### 交付物
- `PromotionScoreBreakdown`
- `PromotionDecision`
- `PromotionEvaluation`
- `PromotionVisualizationReport`

### 验证
- `npm.cmd run check`

## Task 2：实现升格评分算法
### 目标
基于模板 metadata、几何来源、正负 prompt 和路由结果计算 100 分制评分。

### 评分项
- metadata：20
- geometry：25
- retrieval：20
- route：20
- compliance：15

### 验证
- `exp-turtle-low` 和 `exp-boat-small` 应达到 `active_ready`
- 缺少 generator 的模板应低于 active_ready

## Task 3：扩展日志事件
### 目标
新增 `template_promotion` 事件，并让现有 logger 可以记录升格评估结果。

### 交付物
- `TemplatePromotionLogEvent`
- `createTemplatePromotionLogEvent()`
- `TemplateRoutingLogger.logTemplatePromotion()`

### 验证
- 日志 union 类型通过编译
- 事件 payload 不包含敏感字段

## Task 4：实现可视化报告数据生成
### 目标
把多个升格评估结果转成汇报图表可用的数据。

### 输出
- active template count
- candidate template count
- category coverage
- score distribution
- decision counts
- blocked reason counts

### 验证
- 输入固定 evaluation 列表，输出确定性 report

## Task 5：补汇报证据样例
### 目标
提供 `turtle`、`boat` 的端到端 decision trace。

### 验证样例
- `cute turtle` -> `exp-turtle-low` -> `reuse`
- `small boat` -> `exp-boat-small` -> `reuse`
- `car` 不应命中 turtle
- `animal` 不应命中 boat

## 当前推进状态
- Task 1：已完成，见 `src/contracts/promotion.ts`
- Task 2：已完成，见 `src/promotion/evaluateTemplatePromotion.ts`
- Task 3：已完成，见 `src/contracts/logging.ts` 与 `src/logging/events.ts`
- Task 4：已完成，见 `src/promotion/promotionVisualization.ts`
- Task 5：已完成第一版，见 `src/experiments/promotionAlgorithmExperiment.ts`

## 当前可运行证据
```powershell
npm.cmd run check
npm.cmd run experiment:promotion
```

当前固定样例：
- `turtle` / `cute turtle` / `sea turtle` / `pond turtle`
- `boat` / `small boat` / `fishing boat` / `rescue boat`
- `car` / `bus` / `house` / `penguin` / `animal`

当前实验输出可直接生成：
- promotion score breakdown
- positive/negative prompt check
- active_ready / needs_review / blocked 统计
- category coverage
- template_promotion log events
