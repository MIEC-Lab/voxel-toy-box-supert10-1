# 模板升格与可视化算法设计

## 目标
本设计用于把模板库扩仓从“人工新增模板”升级为“可评分、可审计、可回放、可展示”的模板生命周期系统。

优化前模板管理方式：

```text
手写 preset -> 直接进入项目 -> 无准入评分 -> 无升格记录
```

优化后模板管理方式：

```text
candidate
-> metadata audit
-> source and geometry validation
-> retrieval validation
-> route validation
-> promotion score
-> active
-> promotion event log
-> visualization report
```

## 算法一：Template Promotion Scoring
### 功能目标
- 判断一个候选模板是否具备升格为 `active` 的工程条件。
- 给出机器可读的评分拆解，便于 review 和汇报展示。
- 阻止 metadata-only 或来源不明的模板直接进入正式模板库。

### 非功能约束
- 评分必须确定性，同一输入得到同一结果。
- 评分必须可解释，每一项分数都要能追溯到具体检查。
- 不依赖外部网络，不调用远程模型。
- 评分只提供决策证据，不自动修改模板状态。

### 评分公式
总分为 100 分：

```text
promotionScore =
  metadataScore
+ geometryScore
+ retrievalScore
+ routeScore
+ complianceScore
```

### 评分维度
| 维度 | 分数 | 检查内容 |
|---|---:|---|
| Metadata Completeness | 20 | tags、styleTags、shapeTags、colorTags、editableParts、promptAliases、negativeKeywords 是否完整 |
| Geometry Readiness | 25 | 是否有真实 generator/static_voxel，是否有预算范围，是否有可选 voxelCount 证据 |
| Retrieval Fitness | 20 | 正向 prompt 是否命中目标模板，负向 prompt 是否不误命中 |
| Route Stability | 20 | 正向 prompt 是否稳定走 `reuse` 或 `adapt` |
| Compliance and Documentation | 15 | 来源是否合规，是否有 description，是否没有 blocked/noai 标记 |

### 升格判定
```text
score >= 85 -> active_ready
70 <= score < 85 -> needs_review
score < 70 -> blocked
```

注意：`active_ready` 仍然需要人工 review 后才能改 `status`。

## 算法二：Promotion Log Visualization
### 功能目标
- 将每次升格评估沉淀为日志事件。
- 从日志事件生成可视化数据，用于汇报中的图表。
- 展示模板库从优化前到优化后的覆盖增长和质量提升。

### 非功能约束
- 日志不能存储密钥、token、cookie 或环境变量。
- 日志不能直接驱动线上路由规则变化。
- 日志必须可以离线分析。
- 可视化数据必须来自结构化事件，不依赖人工口述。

### 事件结构
每次升格评估生成 `template_promotion` 事件：

```ts
{
  eventType: "template_promotion",
  templateId: "exp-turtle-low",
  fromStatus: "candidate",
  toStatus: "active",
  decision: "active_ready",
  promotionScore: 91,
  scoreBreakdown: {
    metadata: 20,
    geometry: 23,
    retrieval: 18,
    route: 18,
    compliance: 12
  },
  positivePrompts: ["turtle", "cute turtle"],
  negativePrompts: ["car", "house"],
  geometrySource: "src/templates/generators/turtleLowGenerator.ts#generateLowTurtle",
  createdAt: "..."
}
```

### 可视化指标
| 指标 | 用途 |
|---|---|
| Active Template Count | 展示模板库覆盖增长 |
| Candidate Count | 展示剩余待升格资产 |
| Promotion Score Distribution | 展示升格质量 |
| Category Coverage | 展示 animal / vehicle / building 覆盖 |
| Failure Reason Counts | 展示未升格原因 |
| Route Hit Rate After Promotion | 展示升格后是否真的可用 |

## 与优化前版本的差异
| 维度 | 优化前 | 优化后 |
|---|---|---|
| 模板来源 | 手写 preset | candidate -> active 生命周期 |
| 准入规则 | 无统一标准 | 100 分制升格评分 |
| 几何要求 | 只要存在即可 | 必须有 generator/static_voxel 证据 |
| 路由验证 | 无 | positive/negative prompt route check |
| 日志 | 无 | template_promotion 事件 |
| 可视化 | 靠人工描述 | 可从日志生成图表 |

## 部分实现范围
本轮只实现轻量、可审查版本：

- `PromotionEvaluation` 类型
- `evaluateTemplatePromotion()` 评分函数
- `createTemplatePromotionLogEvent()` 日志构造函数
- `buildPromotionVisualizationReport()` 汇报数据生成函数
- `harness/` 下设计文档和任务书

本轮不实现：

- 自动修改模板状态
- 在线学习
- 后台 dashboard
- 自动写入远程数据库
