# 通知公告功能重新设计 - 设计文档

## 1. 系统架构

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                     前端层 (Frontend)                    │
├──────────────┬──────────────┬──────────────┬────────────┤
│  管理员端     │   学校端      │   学生端      │  教师端    │
│ (Element+)   │ (Element+)   │  (Vant)      │ (暂不开发) │
└──────────────┴──────────────┴──────────────┴────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────┐
│                   后端层 (Backend)                       │
├──────────────┬──────────────┬──────────────────────────┤
│ 管理员接口    │  学校接口     │     学生接口              │
│ /api/notice  │/api/school   │  /api/mobile             │
└──────────────┴──────────────┴──────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────┐
│                 数据层 (Database)                        │
│              PostgreSQL - sys_notice                    │
└─────────────────────────────────────────────────────────┘
```

### 1.2 技术栈

- **前端**: Vue 3 + TypeScript + Vite
  - PC端: Element Plus
  - 移动端: Vant
  - 状态管理: Pinia
- **后端**: Spring Boot + MyBatis
- **数据库**: PostgreSQL

## 2. 数据模型设计

### 2.1 核心实体

#### sys_notice (通知公告表)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| notice_id | varchar(64) | 公告ID | PK |
| notice_title | varchar(200) | 公告标题 | NOT NULL |
| notice_type | varchar(10) | 公告类型 | NOT NULL, 1=通知/2=公告/3=政策/4=新闻 |
| notice_content | text | 公告内容 | |
| status | int2 | 状态 | 0=草稿/1=已发布 |
| is_top | int2 | 是否置顶 | 0=否/1=是 |
| view_count | int4 | 浏览次数 | DEFAULT 0 |
| create_by | varchar(64) | 创建人ID | |
| create_time | timestamp | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| update_time | timestamp | 更新时间 | DEFAULT CURRENT_TIMESTAMP |
| publish_time | timestamp | 发布时间 | |
| publisher_type | varchar(255) | 发布者类型 | 'admin'/'school' |
| publisher_id | varchar(255) | 发布者ID | 学校ID或NULL |
| target_audience | varchar(255) | 目标受众 | 'all'/'student' |

### 2.2 索引设计

```sql
CREATE INDEX idx_notice_status ON sys_notice(status);
CREATE INDEX idx_notice_type ON sys_notice(notice_type);
CREATE INDEX idx_notice_publisher ON sys_notice(publisher_type, publisher_id);
CREATE INDEX idx_notice_audience ON sys_notice(target_audience);
CREATE INDEX idx_notice_publish_time ON sys_notice(publish_time);
```

### 2.3 字段使用规则

#### 管理员发布公告

```json
{
  "publisher_type": "admin",
  "publisher_id": null,
  "target_audience": "all" | "student",
  "is_top": 0 | 1,
  "create_by": "管理员用户ID"
}
```

#### 学校发布公告

```json
{
  "publisher_type": "school",
  "publisher_id": "学校ID",
  "target_audience": "student",
  "is_top": 0,
  "create_by": "学校用户ID"
}
```

## 3. 接口设计

### 3.1 管理员端接口

#### 3.1.1 获取公告列表

**接口**: `GET /api/notice/list`

**请求参数**:
```typescript
interface NoticeQuery {
  pageNum: number
  pageSize: number
  noticeTitle?: string
  noticeType?: string
  status?: number
}
```

**响应数据**:
```typescript
interface NoticeItem {
  noticeId: string
  noticeTitle: string
  noticeType: string
  noticeContent: string
  status: number
  isTop: number
  viewCount: number
  createBy: string
  createTime: string
  updateTime: string
  publishTime: string
  publisherType: string
  publisherId: string | null
  targetAudience: string
}
```

**SQL实现**:
```sql
SELECT 
  notice_id AS "noticeId",
  notice_title AS "noticeTitle",
  notice_type AS "noticeType",
  notice_content AS "noticeContent",
  status,
  is_top AS "isTop",
  view_count AS "viewCount",
  create_by AS "createBy",
  create_time AS "createTime",
  update_time AS "updateTime",
  publish_time AS "publishTime",
  publisher_type AS "publisherType",
  publisher_id AS "publisherId",
  target_audience AS "targetAudience"
FROM sys_notice
WHERE 1=1
  AND (#{noticeTitle} IS NULL OR notice_title LIKE CONCAT('%', #{noticeTitle}, '%'))
  AND (#{noticeType} IS NULL OR notice_type = #{noticeType})
  AND (#{status} IS NULL OR status = #{status})
ORDER BY is_top DESC, publish_time DESC, create_time DESC
LIMIT #{pageSize} OFFSET (#{pageNum} - 1) * #{pageSize}
```

#### 3.1.2 新增公告

**接口**: `POST /api/notice/add`

**请求体**:
```typescript
interface NoticeForm {
  noticeTitle: string
  noticeType: string
  noticeContent: string
  targetAudience: string  // 'all' 或 'student'
  isTop: number
  status: number
}
```

**SQL实现**:
```sql
INSERT INTO sys_notice (
  notice_id, notice_title, notice_type, notice_content,
  status, is_top, view_count, create_by, create_time, update_time,
  publish_time, publisher_type, publisher_id, target_audience
) VALUES (
  #{noticeId}, #{noticeTitle}, #{noticeType}, #{noticeContent},
  #{status}, #{isTop}, 0, #{createBy}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
  CASE WHEN #{status} = 1 THEN CURRENT_TIMESTAMP ELSE NULL END,
  'admin', NULL, #{targetAudience}
)
```

#### 3.1.3 更新公告

**接口**: `PUT /api/notice/update`

**SQL实现**:
```sql
UPDATE sys_notice
SET 
  notice_title = #{noticeTitle},
  notice_type = #{noticeType},
  notice_content = #{noticeContent},
  target_audience = #{targetAudience},
  is_top = #{isTop},
  status = #{status},
  update_time = CURRENT_TIMESTAMP,
  publish_time = CASE 
    WHEN #{status} = 1 AND publish_time IS NULL 
    THEN CURRENT_TIMESTAMP 
    ELSE publish_time 
  END
WHERE notice_id = #{noticeId}
```

### 3.2 学校端接口

#### 3.2.1 获取公告列表

**接口**: `GET /api/school/notice/list`

**请求参数**:
```typescript
interface SchoolNoticeQuery {
  pageNum: number
  pageSize: number
  noticeTitle?: string
  noticeType?: string
  source?: string  // 'admin' 或 'school'
}
```

**SQL实现**:
```sql
SELECT 
  n.notice_id AS "noticeId",
  n.notice_title AS "noticeTitle",
  n.notice_type AS "noticeType",
  n.notice_content AS "noticeContent",
  n.status,
  n.is_top AS "isTop",
  n.view_count AS "viewCount",
  n.create_by AS "createBy",
  n.create_time AS "createTime",
  n.update_time AS "updateTime",
  n.publish_time AS "publishTime",
  n.publisher_type AS "publisherType",
  n.publisher_id AS "publisherId",
  n.target_audience AS "targetAudience"
FROM sys_notice n
WHERE 1=1
  -- 只显示已发布的管理员公告，或本校的所有公告（包括草稿）
  AND (
    (n.publisher_type = 'admin' AND n.status = 1)
    OR (n.publisher_type = 'school' AND n.publisher_id = #{schoolId})
  )
  AND (#{noticeTitle} IS NULL OR n.notice_title LIKE CONCAT('%', #{noticeTitle}, '%'))
  AND (#{noticeType} IS NULL OR n.notice_type = #{noticeType})
  AND (
    #{source} IS NULL 
    OR (#{source} = 'admin' AND n.publisher_type = 'admin')
    OR (#{source} = 'school' AND n.publisher_type = 'school' AND n.publisher_id = #{schoolId})
  )
ORDER BY n.is_top DESC, n.publish_time DESC, n.create_time DESC
LIMIT #{pageSize} OFFSET (#{pageNum} - 1) * #{pageSize}
```

**业务逻辑**:
```java
// 获取学校ID
String schoolId = SecurityUtils.getCurrentUser().getOwnerId();
```

#### 3.2.2 新增公告

**接口**: `POST /api/school/notice/add`

**SQL实现**:
```sql
INSERT INTO sys_notice (
  notice_id, notice_title, notice_type, notice_content,
  status, is_top, view_count, create_by, create_time, update_time,
  publish_time, publisher_type, publisher_id, target_audience
) VALUES (
  #{noticeId}, #{noticeTitle}, #{noticeType}, #{noticeContent},
  #{status}, 0, 0, #{createBy}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
  CASE WHEN #{status} = 1 THEN CURRENT_TIMESTAMP ELSE NULL END,
  'school', #{schoolId}, 'student'
)
```

#### 3.2.3 更新公告（带权限校验）

**接口**: `PUT /api/school/notice/update`

**SQL实现**:
```sql
UPDATE sys_notice
SET 
  notice_title = #{noticeTitle},
  notice_type = #{noticeType},
  notice_content = #{noticeContent},
  status = #{status},
  update_time = CURRENT_TIMESTAMP,
  publish_time = CASE 
    WHEN #{status} = 1 AND publish_time IS NULL 
    THEN CURRENT_TIMESTAMP 
    ELSE publish_time 
  END
WHERE notice_id = #{noticeId}
  AND publisher_type = 'school'
  AND publisher_id = #{schoolId}
```

**业务逻辑**:
```java
int rows = noticeMapper.updateByIdAndSchool(noticeId, schoolId, dto);
if (rows == 0) {
    throw new BusinessException("无权限操作");
}
```

#### 3.2.4 删除公告（带权限校验）

**接口**: `DELETE /api/school/notice/delete/{noticeId}`

**SQL实现**:
```sql
DELETE FROM sys_notice 
WHERE notice_id = #{noticeId}
  AND publisher_type = 'school'
  AND publisher_id = #{schoolId}
```

### 3.3 学生端接口

#### 3.3.1 获取首页公告列表

**接口**: `GET /api/mobile/home/notices`

**响应数据**:
```typescript
interface MobileNoticeItem {
  noticeId: string
  noticeTitle: string
  noticeType: string
  publishTime: string
  publisherType: string
  publisherName: string
  isTop: number
  viewCount: number
}
```

**SQL实现**:
```sql
SELECT 
  n.notice_id AS "noticeId",
  n.notice_title AS "noticeTitle",
  n.notice_type AS "noticeType",
  n.publish_time AS "publishTime",
  n.publisher_type AS "publisherType",
  CASE 
    WHEN n.publisher_type = 'admin' THEN '省教育厅'
    WHEN n.publisher_type = 'school' THEN s.name
    ELSE '未知'
  END AS "publisherName",
  n.is_top AS "isTop",
  n.view_count AS "viewCount"
FROM sys_notice n
LEFT JOIN sys_school s ON n.publisher_id = s.id AND n.publisher_type = 'school'
WHERE n.status = 1
  AND (
    (n.publisher_type = 'admin' AND n.target_audience IN ('all', 'student'))
    OR (n.publisher_type = 'school' AND n.publisher_id = #{studentSchoolId})
  )
ORDER BY n.is_top DESC, n.publish_time DESC
LIMIT 5
```

**业务逻辑**:
```java
// 获取学生学校ID
String studentSchoolId = studentMapper.getSchoolIdByUserId(userId);
```

#### 3.3.2 获取公告详情

**接口**: `GET /api/mobile/notice/{noticeId}`

**SQL实现**:
```sql
-- 查询详情
SELECT 
  n.notice_id AS "noticeId",
  n.notice_title AS "noticeTitle",
  n.notice_type AS "noticeType",
  n.notice_content AS "noticeContent",
  n.publish_time AS "publishTime",
  n.publisher_type AS "publisherType",
  CASE 
    WHEN n.publisher_type = 'admin' THEN '省教育厅'
    WHEN n.publisher_type = 'school' THEN s.name
    ELSE '未知'
  END AS "publisherName",
  n.is_top AS "isTop",
  n.view_count AS "viewCount"
FROM sys_notice n
LEFT JOIN sys_school s ON n.publisher_id = s.id AND n.publisher_type = 'school'
WHERE n.notice_id = #{noticeId}
  AND n.status = 1
  AND (
    (n.publisher_type = 'admin' AND n.target_audience IN ('all', 'student'))
    OR (n.publisher_type = 'school' AND n.publisher_id = #{studentSchoolId})
  );

-- 更新浏览次数
UPDATE sys_notice
SET view_count = view_count + 1
WHERE notice_id = #{noticeId}
```

## 4. 权限控制设计

### 4.1 权限矩阵

| 操作 | 管理员 | 学校 | 学生 | 实现方式 |
|------|--------|------|------|---------|
| 查看全部公告 | ✅ | ❌ | ❌ | SQL WHERE条件 |
| 查看管理员公告 | ✅ | ✅ (已发布) | ✅ (已发布) | SQL WHERE条件 |
| 查看本校公告 | ✅ | ✅ (全部) | ✅ (已发布) | SQL WHERE条件 |
| 新增公告 | ✅ | ✅ | ❌ | 接口权限 |
| 编辑管理员公告 | ✅ | ❌ | ❌ | SQL WHERE条件 |
| 编辑本校公告 | ✅ | ✅ | ❌ | SQL WHERE条件 |
| 删除管理员公告 | ✅ | ❌ | ❌ | SQL WHERE条件 |
| 删除本校公告 | ✅ | ✅ | ❌ | SQL WHERE条件 |
| 置顶公告 | ✅ | ❌ | ❌ | 业务逻辑 |

### 4.2 权限校验实现

#### 学校端权限校验

所有学校端的更新/删除操作必须在SQL中加入权限校验：

```sql
WHERE notice_id = #{noticeId}
  AND publisher_type = 'school'
  AND publisher_id = #{schoolId}
```

如果影响行数为0，返回错误"无权限操作"。

#### 前端权限控制

```typescript
// 学校端判断是否为管理员公告
const isAdminNotice = (row: SchoolNoticeItem) => {
  return row.publisherType === 'admin'
}

// 如果是管理员公告，不显示编辑/删除按钮
```

## 5. 业务流程设计

### 5.1 管理员发布公告流程

```
1. 管理员填写公告信息
   ├─ 标题、类型、内容
   ├─ 选择目标受众（全部用户/学生）
   └─ 选择是否置顶

2. 选择保存方式
   ├─ 保存草稿 (status=0)
   └─ 直接发布 (status=1, publish_time=当前时间)

3. 后端处理
   ├─ 设置 publisher_type='admin'
   ├─ 设置 publisher_id=NULL
   ├─ 设置 target_audience=用户选择
   └─ 保存到数据库

4. 公告可见范围
   ├─ target_audience='all': 所有用户可见
   └─ target_audience='student': 仅学生可见
```

### 5.2 学校发布公告流程

```
1. 学校填写公告信息
   ├─ 标题、类型、内容
   └─ 不需要选择目标受众（自动为student）

2. 选择保存方式
   ├─ 保存草稿 (status=0)
   └─ 直接发布 (status=1, publish_time=当前时间)

3. 后端处理
   ├─ 获取学校ID (从登录用户的owner_id)
   ├─ 设置 publisher_type='school'
   ├─ 设置 publisher_id=学校ID
   ├─ 设置 target_audience='student'
   ├─ 设置 is_top=0 (学校不能置顶)
   └─ 保存到数据库

4. 公告可见范围
   └─ 仅本校学生可见
```

### 5.3 学生查看公告流程

```
1. 学生访问首页
   └─ 显示最新5条公告（置顶优先）

2. 后端查询逻辑
   ├─ 获取学生学校ID
   ├─ 查询管理员面向学生的公告
   │   └─ publisher_type='admin' AND target_audience IN ('all', 'student')
   ├─ 查询本校发布的公告
   │   └─ publisher_type='school' AND publisher_id=学生学校ID
   └─ 按置顶、发布时间排序

3. 学生点击查看详情
   ├─ 显示完整内容
   └─ 浏览次数 +1
```

## 6. 数据流转图

```
┌─────────────────────────────────────────────────────────┐
│                    管理员发布公告                         │
├─────────────────────────────────────────────────────────┤
│ publisher_type = 'admin'                                │
│ publisher_id = NULL                                     │
│ target_audience = 'all' 或 'student'                    │
│                                                         │
│ 可见范围：                                               │
│   ├─ all: 所有学校、所有学生                             │
│   └─ student: 所有学生                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    学校发布公告                           │
├─────────────────────────────────────────────────────────┤
│ publisher_type = 'school'                               │
│ publisher_id = 学校ID                                    │
│ target_audience = 'student' (固定)                      │
│                                                         │
│ 可见范围：                                               │
│   ├─ 本校学生                                            │
│   └─ 本校教师（暂不开发）                                 │
└─────────────────────────────────────────────────────────┘
```

## 7. 前端实现

### 7.1 管理员端修改

**文件**: `src/views/admin/notice/index.vue`

**修改内容**:
1. 添加目标受众选择字段
2. 更新表单数据结构
3. 更新表单验证规则
4. 列表显示目标受众

**状态**: ✅ 已完成

### 7.2 学校端修改

**文件**: `src/views/school/notice/index.vue`

**修改内容**:
1. 移除目标受众选择
2. 修改权限判断逻辑（使用publisherType）
3. 修改操作按钮显示逻辑

**状态**: ✅ 已完成

### 7.3 学生端修改

**文件**: `src/views/mobile/home/index.vue`

**修改内容**:
1. 修正通知类型映射（使用数字1,2,3,4）

**状态**: ✅ 已完成

### 7.4 API类型定义

**文件**: 
- `src/api/notice.ts` - 管理员端API
- `src/api/school.ts` - 学校端API（新建）

**状态**: ✅ 已完成

## 8. 测试策略

### 8.1 单元测试

- 权限校验逻辑测试
- SQL查询条件测试
- 字段设置逻辑测试

### 8.2 集成测试

- 管理员端完整流程测试
- 学校端完整流程测试
- 学生端完整流程测试

### 8.3 端到端测试

- 管理员发布 → 学生查看
- 学校发布 → 本校学生查看
- 权限控制验证

## 9. 性能优化

### 9.1 数据库优化

- 使用索引加速查询
- 分页查询避免全表扫描
- 使用LEFT JOIN优化关联查询

### 9.2 缓存策略

- 首页公告列表缓存（5分钟）
- 公告详情缓存（10分钟）
- 发布/更新时清除缓存

## 10. 安全考虑

### 10.1 SQL注入防护

- 使用参数化查询
- 避免字符串拼接SQL

### 10.2 XSS防护

- 前端显示时转义HTML
- 后端存储时不转义（保留原始内容）

### 10.3 权限校验

- 所有接口需要登录认证
- 学校端操作需要权限校验
- 前后端双重验证

## 11. 部署说明

### 11.1 数据库准备

- 确认表结构正确
- 确认索引已创建
- 清理测试数据

### 11.2 后端部署

- 实现所有接口
- 配置权限拦截器
- 配置日志记录

### 11.3 前端部署

- 前端代码已完成
- 确认API路径正确
- 测试所有功能

## 12. 参考文档

- `docs/通知公告功能-重新设计.md` - 完整设计方案
- `docs/通知公告功能-后端实现指南.md` - 核心SQL语句
- `docs/通知公告功能-修改检查清单.md` - 详细检查清单
- `docs/通知公告功能-最终检查报告.md` - 最终检查报告

---

**文档版本**: v1.0  
**创建日期**: 2026年2月21日  
**状态**: 设计完成，前端已实现，等待后端实现
