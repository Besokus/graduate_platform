# 就业方向模块开发工作说明

> 适用场景：提交到团队写作 Git 仓库，用于说明本次“就业方向”模块从需求、设计、实现到验证的完整工作内容。  
> 项目位置：`graduate_platform`  
> 工作来源：`.omx/plans/prd-employment-direction.md`  
> 完成状态：已实现、已回归验证、已通过 Ralph 架构审查。

## 1. 工作目标

本次工作围绕平台中的“就业方向”展开，目标是把原有静态/占位的就业方向页面升级为可实际使用的全栈功能模块。核心目标包括：

1. 提供招聘会、宣讲会与网申链接浏览能力。
2. 支持用户维护一份在线简历信息。
3. 基于用户偏好、专业、简历技能等信息提供确定性的岗位推荐。
4. 支持用户记录并维护求职投递进度。
5. 支持站内就业通知的生成、查看和已读状态维护。
6. 提供管理员端的招聘会与岗位信息维护入口。
7. 修复管理员接口安全匹配顺序，避免管理员 GET 接口被广泛公开。

本版本定位为就业方向模块的 v1 实现，强调“可持久化、可验证、边界清晰”。本次不引入外部招聘平台、邮件/短信/微信推送、AI 推荐模型或 Word/PDF 简历导出。

## 2. 需求范围与非目标

### 2.1 本次纳入范围

- 就业方向用户端：招聘会、在线简历、岗位推荐、投递跟踪、站内通知。
- 就业方向管理员端：招聘会管理、岗位管理、手动触发匹配通知。
- 后端持久化：新增就业方向相关 JPA 实体、仓库、服务与控制器。
- 前端 API：新增就业模块 API 封装。
- 安全控制：管理员接口必须需要管理员权限，用户私有就业接口必须登录。
- 测试验证：新增集成测试覆盖安全、简历、投递、推荐、管理员与通知链路。
- 文档更新：README 补充就业模块 API、模块说明与 v1 非目标。

### 2.2 明确不做的内容

- 不做 Word/PDF 简历导出。
- 不对接外部招聘平台 API。
- 不做邮件、短信、微信等外部推送。
- 不引入 AI/大模型推荐逻辑。
- 不提供管理员任意广播通知、通知编辑/删除或全量通知管理。
- 不重构社区、题库、认证等非就业模块。

## 3. 后端实现内容

### 3.1 新增就业方向领域包

新增后端包：

```text
backend/src/main/java/com/graduateplatform/job/
```

该包包含实体、仓库、DTO、服务与控制器，形成相对独立的就业方向领域模块。

### 3.2 新增实体

新增实体覆盖就业方向的核心数据：

| 实体 | 作用 |
|---|---|
| `CareerFair` | 招聘会/宣讲会记录，包含标题、公司、城市、行业、地点、时间、网申链接等。 |
| `JobPosting` | 岗位信息，包含岗位名称、公司、城市、行业、岗位类型、薪资、学历要求、专业关键词、技能标签等。 |
| `ResumeProfile` | 用户在线简历，一名用户维护一份结构化简历。 |
| `ApplicationRecord` | 用户投递记录，维护公司、岗位、状态、投递时间、下一步时间、备注等。 |
| `JobSubscriptionPreference` | 用户就业订阅偏好，支持城市、行业、岗位类型、薪资、公司类型等匹配字段。 |
| `EmploymentNotification` | 就业方向站内通知，支持用户查看与标记已读。 |

### 3.3 新增仓库

为上述实体分别新增 Spring Data JPA Repository，支持基础 CRUD、用户维度查询、活跃招聘会/岗位查询、通知查询等。

### 3.4 新增请求 DTO

新增请求 DTO，避免控制器直接暴露或接收 JPA 实体：

- `CareerFairRequest`
- `JobPostingRequest`
- `ResumeProfileRequest`
- `ApplicationRecordRequest`
- `JobSubscriptionPreferenceRequest`
- `NotificationTriggerRequest`

### 3.5 核心服务能力

核心业务逻辑集中在：

```text
backend/src/main/java/com/graduateplatform/job/service/EmploymentService.java
```

主要能力包括：

1. 招聘会公开浏览、详情查看、管理员增删改。
2. 岗位公开浏览、详情查看、管理员增删改。
3. 用户就业偏好读取与保存。
4. 用户在线简历读取与保存。
5. 岗位推荐：根据城市、行业、岗位类型、用户专业、简历技能/项目进行确定性打分。
6. 投递记录 CRUD：按当前登录用户做所有权隔离。
7. 就业通知列表、标记已读。
8. 管理员基于招聘会或岗位手动触发匹配站内通知。

推荐逻辑采用确定性规则，不调用外部服务。匹配理由统一输出为：`city match`、`industry match`、`role match`、`major match`、`skill match` 等，前端直接展示这些理由。

### 3.6 新增控制器

#### 用户/公开就业接口

```text
backend/src/main/java/com/graduateplatform/job/controller/EmploymentController.java
```

接口前缀：

```text
/api/job/**
```

其中：

- `GET /api/job/fairs/**` 与 `GET /api/job/postings/**` 允许公开浏览。
- `/api/job/resume/**`、`/api/job/applications/**`、`/api/job/notifications/**`、`/api/job/preferences/**`、`/api/job/recommendations/**` 需要登录。

#### 管理员就业接口

```text
backend/src/main/java/com/graduateplatform/job/controller/AdminEmploymentController.java
```

接口前缀：

```text
/api/admin/employment/**
```

提供管理员招聘会、岗位维护和匹配通知触发能力。

### 3.7 安全配置调整

修改文件：

```text
backend/src/main/java/com/graduateplatform/common/config/SecurityConfig.java
```

关键调整：将 `/api/admin/**` 的管理员权限匹配放在 broad `GET /api/**` 公开规则之前，防止管理员 GET 接口被公开访问。

本次还明确配置就业方向接口权限：

- `/api/admin/**`：管理员权限。
- `GET /api/job/fairs/**`、`GET /api/job/postings/**`：公开。
- 其他用户私有就业接口：登录用户。

### 3.8 数据初始化

修改文件：

```text
backend/src/main/java/com/graduateplatform/init/DataInitializer.java
```

主要调整：

- 增加示例招聘会与岗位数据，方便本地演示。
- 优化用户初始化逻辑，避免原有“只要存在任意用户就跳过全部用户初始化”的问题。
- 增加就业方向测试用户数据。

### 3.9 编译修复

在本次后端测试过程中发现既有实体缺少 `User` 导入导致编译失败，因此补充了缺失 import：

- `backend/src/main/java/com/graduateplatform/questionbank/entity/Attempt.java`
- `backend/src/main/java/com/graduateplatform/community/entity/Comment.java`
- `backend/src/main/java/com/graduateplatform/community/entity/Post.java`
- `backend/src/main/java/com/graduateplatform/community/entity/PostInteraction.java`
- `backend/src/main/java/com/graduateplatform/community/entity/PostReport.java`

该修复不是就业业务逻辑的一部分，但属于保证项目整体可编译和测试通过的必要修复。

## 4. 前端实现内容

### 4.1 API 封装

修改文件：

```text
frontend/src/lib/api.js
```

新增：

- `appendParams`：统一处理查询参数。
- `employmentApi`：用户端就业 API。
- `adminEmploymentApi`：管理员端就业 API。

### 4.2 用户端就业页面

更新以下页面，替换原静态/占位内容：

| 页面 | 路由 | 主要能力 |
|---|---|---|
| `JobPage.jsx` | `/job` | 就业方向入口面板，说明 v1 能力边界。 |
| `CareerFairPage.jsx` | `/job/fairs` | 招聘会浏览、筛选、偏好保存。 |
| `ResumePage.jsx` | `/job/resume` | 在线简历读取、编辑、保存。 |
| `JobRecommendPage.jsx` | `/job/recommend` | 岗位推荐、筛选、匹配理由展示、站内通知查看/已读。 |
| `ApplicationTrackingPage.jsx` | `/job/applications` | 投递记录新增、编辑、删除、状态维护。 |

特别修复：`JobRecommendPage.jsx` 的刷新按钮已传入当前筛选条件 `refresh(filters)`，保证城市、行业、岗位类型筛选真正参与推荐请求。

### 4.3 管理员端就业页面

新增文件：

```text
frontend/src/pages/admin/EmploymentManagementPage.jsx
```

主要能力：

- 管理员查看招聘会与岗位列表。
- 新建、编辑、删除招聘会。
- 新建、编辑、删除岗位。
- 针对招聘会或岗位触发匹配站内通知。

同时修改：

- `frontend/src/App.jsx`：新增 `/admin/employment` 路由。
- `frontend/src/pages/admin/AdminPage.jsx`：新增就业管理入口。

### 4.4 用户管理页小修复

修改文件：

```text
frontend/src/pages/admin/UserManagementPage.jsx
```

原因：前端 lint 发现 `setFilterStatus` 已声明但未使用。本次补充状态筛选 UI，使用户管理页现有逻辑完整，同时消除该 lint 问题。

## 5. 测试与验证

### 5.1 新增后端测试

新增测试文件：

```text
backend/src/test/java/com/graduateplatform/job/EmploymentModuleIntegrationTest.java
```

新增测试配置：

```text
backend/src/test/resources/application-test.yml
```

测试覆盖：

1. 管理员就业接口未登录不可访问，普通用户不可访问。
2. 公开招聘会/岗位浏览可访问，用户私有就业 GET 接口未登录不可访问。
3. 用户在线简历保存与读取。
4. 用户投递记录所有权隔离。
5. 岗位推荐规则匹配。
6. 管理员创建岗位与触发匹配站内通知，用户可查看并标记已读。

### 5.2 最终验证结果

最终验证命令与结果：

```text
cd backend
mvn test
```

结果：

```text
Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

```text
cd frontend
npm run lint
```

结果：退出码 0。仅剩一个既有的非本次就业模块警告：

```text
frontend/src/pages/admin/ReportPage.jsx
React Hook useEffect has a missing dependency: 'load'
```

```text
cd frontend
npm run build
```

结果：

```text
vite build success
62 modules transformed
```

## 6. 质量清理与审查

本次执行了 Ralph 工作流要求的 deslop/清理步骤，范围限定在本次变更文件内。

清理内容包括：

- 修复 PowerShell/编码导致的异常问号文本与错误提示。
- 将新增业务提示统一为英文，避免编码损坏影响运行和测试。
- 修复前端 JSX 中被误写成减号的三元表达式。
- 修复 Ralph-owned 前端文件中的 Hook dependency warning。
- 将通知加载失败从静默吞错改为显式错误提示。
- 校正岗位推荐匹配理由文案。
- 清理就业入口页面中的超出 v1 范围表述。

架构审查过程：

1. 第一次审查发现：就业入口页面仍有导出/智能推荐等非目标表述、README 未完整补充就业 API、推荐理由文案错误。
2. 修复后第二次审查发现：推荐页筛选按钮没有传递当前筛选条件。
3. 修复后最终审查结果：`APPROVED`。

## 7. 文档更新

修改 `README.md`，补充：

- 就业模块新增说明。
- `/api/job/**` 用户/公开就业接口。
- `/api/admin/employment/**` 管理员就业接口。
- 就业 v1 非目标说明。

## 8. 主要变更文件清单

### 后端

- `backend/pom.xml`
- `backend/src/main/java/com/graduateplatform/common/config/SecurityConfig.java`
- `backend/src/main/java/com/graduateplatform/init/DataInitializer.java`
- `backend/src/main/java/com/graduateplatform/job/**`
- `backend/src/test/java/com/graduateplatform/job/EmploymentModuleIntegrationTest.java`
- `backend/src/test/resources/application-test.yml`
- `backend/src/main/java/com/graduateplatform/questionbank/entity/Attempt.java`
- `backend/src/main/java/com/graduateplatform/community/entity/Comment.java`
- `backend/src/main/java/com/graduateplatform/community/entity/Post.java`
- `backend/src/main/java/com/graduateplatform/community/entity/PostInteraction.java`
- `backend/src/main/java/com/graduateplatform/community/entity/PostReport.java`

### 前端

- `frontend/src/lib/api.js`
- `frontend/src/App.jsx`
- `frontend/src/pages/job/JobPage.jsx`
- `frontend/src/pages/job/CareerFairPage.jsx`
- `frontend/src/pages/job/ResumePage.jsx`
- `frontend/src/pages/job/JobRecommendPage.jsx`
- `frontend/src/pages/job/ApplicationTrackingPage.jsx`
- `frontend/src/pages/admin/EmploymentManagementPage.jsx`
- `frontend/src/pages/admin/AdminPage.jsx`
- `frontend/src/pages/admin/UserManagementPage.jsx`

### 文档/工作流

- `README.md`
- `.omx/context/employment-direction-20260509T021648Z.md`
- `.omx/plans/prd-employment-direction.md`（需求来源）

## 9. 团队写作建议

如果将本说明整理进团队文档，可拆分为以下章节：

1. “就业方向模块需求背景”
2. “系统设计与模块划分”
3. “后端数据模型与接口设计”
4. “前端页面与交互实现”
5. “安全控制与权限设计”
6. “测试验证与质量保障”
7. “当前版本边界与后续扩展方向”

后续可扩展方向包括：

- 简历导出。
- 外部招聘平台同步。
- 更复杂的推荐算法。
- 管理员通知管理后台。
- 更细粒度的招聘会场次模型。

以上扩展均未纳入本次 v1 工作范围。

## 10. 当前遗留风险

- `frontend/src/pages/admin/ReportPage.jsx` 仍有一个既有 Hook dependency lint warning，和本次就业模块无直接关系。
- 后端仍有既有 Lombok `@Builder` 默认值 warning，和本次就业模块无直接关系。
- 当前就业推荐是规则匹配，不是智能推荐或机器学习推荐；这符合 v1 需求边界。
- 当前站内通知只覆盖就业模块匹配通知，不提供外部推送。
