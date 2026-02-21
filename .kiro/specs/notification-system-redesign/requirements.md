# 通知公告功能重新设计 - 需求文档

## 1. 功能概述

重新设计通知公告功能，解决当前存在的权限、可见性和用户体验问题。

## 2. 问题背景

### 2.1 当前存在的问题

1. **学生端看不到公告**: 学生端首页无法看到管理员和学校发布的公告
2. **学校端无法编辑删除**: 学校端发布公告后不能编辑和删除自己的公告
3. **目标受众过于复杂**: 学校发布公告还要区分教师和学生，太麻烦
4. **教师端缺失**: 教师端没有公告功能，暂时不需要开发
5. **附件功能**: 不需要附件功能

## 3. 用户故事

### 3.1 管理员端

**作为** 系统管理员  
**我想要** 发布全局公告并选择目标受众  
**以便** 向所有用户或仅学生发布通知

**验收标准**:
- 可以新增公告并选择目标受众（全部用户/学生）
- 可以编辑和删除任意公告
- 可以置顶公告
- 列表显示发布者类型、目标受众等信息

### 3.2 学校端

**作为** 学校管理员  
**我想要** 发布本校公告并管理自己发布的公告  
**以便** 向本校学生和教师传达信息

**验收标准**:
- 可以查看管理员已发布的公告和本校所有公告
- 可以新增本校公告（自动面向本校学生）
- 可以编辑和删除本校发布的公告
- 不能编辑和删除管理员发布的公告
- 不能置顶公告

### 3.3 学生端

**作为** 学生  
**我想要** 在首页和列表页查看相关公告  
**以便** 及时了解重要通知和信息

**验收标准**:
- 首页显示最新5条公告（管理员面向学生的+本校的）
- 可以查看公告详情
- 浏览公告时增加浏览次数
- 可以按类型和发布者筛选公告
- 看不到其他学校的公告

## 4. 功能需求

### 4.1 核心原则

1. **简化权限**: 管理员发布全局可见，学校发布本校可见
2. **简化受众**: 学校发布的公告本校学生和教师都能看（不区分）
3. **明确权限**: 学校只能编辑删除自己发布的公告
4. **移除附件**: 不再支持附件功能

### 4.2 权限矩阵

| 角色 | 可查看 | 可新增 | 可编辑 | 可删除 | 可置顶 |
|------|--------|--------|--------|--------|--------|
| 管理员 | 全部 | ✅ | 全部 | 全部 | ✅ |
| 学校 | 管理员+本校 | ✅ | 本校 | 本校 | ❌ |
| 学生 | 管理员+本校 | ❌ | ❌ | ❌ | ❌ |
| 教师 | 暂不开发 | ❌ | ❌ | ❌ | ❌ |

### 4.3 数据模型

#### 数据库表结构

```sql
CREATE TABLE public.sys_notice (
  notice_id varchar(64) NOT NULL,
  notice_title varchar(200) NOT NULL,
  notice_type varchar(10) NOT NULL,  -- 1=通知, 2=公告, 3=政策, 4=新闻
  notice_content text NULL,
  status int2 NULL DEFAULT 0,  -- 0=草稿, 1=已发布
  is_top int2 NULL DEFAULT 0,
  view_count int4 NULL DEFAULT 0,
  attachments text NULL,  -- 不再使用
  create_by varchar(64) NULL,
  create_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  update_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  publish_time timestamp NULL,
  publisher_type varchar(255) NULL,  -- 'admin' 或 'school'
  publisher_id varchar(255) NULL,    -- 学校ID（学校发布时）
  target_audience varchar(255) NULL, -- 'all' 或 'student'
  CONSTRAINT sys_notice_pkey PRIMARY KEY (notice_id)
);
```

#### 字段使用规则

| 字段 | 管理员发布 | 学校发布 | 说明 |
|------|-----------|----------|------|
| publisher_type | 'admin' | 'school' | 发布者类型 |
| publisher_id | NULL | 学校ID | 学校发布时存储学校ID |
| target_audience | 'all' 或 'student' | 'student' | 管理员可选，学校固定为student |
| create_by | 管理员用户ID | 学校用户ID | 创建人ID |
| is_top | 0 或 1 | 0 | 学校不能置顶 |

### 4.4 可见性规则

| 公告类型 | 学生可见条件 | 学校可见条件 |
|---------|-------------|-------------|
| 管理员发布 | target_audience='all' 或 'student' | status=1（已发布） |
| 本校发布 | publisher_id=学生学校ID | publisher_id=学校ID（包括草稿） |
| 其他学校发布 | ❌ 不可见 | ❌ 不可见 |

## 5. 接口需求

### 5.1 管理员端接口

1. **GET /api/notice/list** - 获取公告列表
   - 返回所有公告
   - 支持标题、类型、状态筛选
   - 返回 publisherType, publisherId, targetAudience 字段

2. **POST /api/notice/add** - 新增公告
   - 添加 targetAudience 参数
   - 设置 publisher_type='admin', publisher_id=NULL

3. **PUT /api/notice/update** - 更新公告
   - 添加 targetAudience 参数
   - 可以更新任意公告

4. **DELETE /api/notice/delete/{noticeId}** - 删除公告
   - 可以删除任意公告

5. **PUT /api/notice/publish/{noticeId}** - 发布公告
6. **PUT /api/notice/unpublish/{noticeId}** - 停用公告
7. **PUT /api/notice/top/{noticeId}** - 置顶公告

### 5.2 学校端接口

1. **GET /api/school/notice/list** - 获取公告列表
   - 返回管理员已发布的+本校所有的
   - 支持标题、类型、来源筛选

2. **POST /api/school/notice/add** - 新增公告
   - 设置 publisher_type='school', publisher_id=学校ID
   - 固定 target_audience='student', is_top=0

3. **PUT /api/school/notice/update** - 更新公告
   - 只能更新本校发布的（权限校验）

4. **DELETE /api/school/notice/delete/{noticeId}** - 删除公告
   - 只能删除本校发布的（权限校验）

5. **PUT /api/school/notice/publish/{noticeId}** - 发布公告
   - 只能发布本校的草稿（权限校验）

6. **PUT /api/school/notice/unpublish/{noticeId}** - 停用公告
   - 只能停用本校的已发布公告（权限校验）

### 5.3 学生端接口

1. **GET /api/mobile/home/notices** - 获取首页公告列表
   - 返回最新5条
   - 管理员面向学生的+本校的
   - 按置顶、发布时间排序

2. **GET /api/mobile/notice/{noticeId}** - 获取公告详情
   - 返回详细内容
   - 增加浏览次数

3. **GET /api/mobile/notices** - 获取公告列表
   - 分页查询
   - 支持类型、发布者筛选

## 6. 非功能需求

### 6.1 性能需求

- 公告列表查询响应时间 < 500ms
- 公告详情查询响应时间 < 200ms
- 支持分页加载，每页10-20条

### 6.2 安全需求

- 所有接口需要登录认证
- 学校端操作需要权限校验（publisher_id）
- 防止SQL注入和XSS攻击

### 6.3 兼容性需求

- PC端支持主流浏览器（Chrome, Firefox, Edge）
- 移动端支持iOS和Android

## 7. 约束条件

1. 这是毕业设计项目，保持简单实用
2. 前端已完成修改，后端需要按照设计实现
3. 数据库表结构已存在，不需要修改
4. 教师端暂不开发公告功能

## 8. 验收标准

### 8.1 管理员端

- ✅ 可以新增公告并选择目标受众
- ✅ 目标受众正确保存到数据库
- ✅ 可以编辑和删除任意公告
- ✅ 可以置顶公告
- ✅ 列表正确显示所有字段

### 8.2 学校端

- ✅ 能看到管理员已发布的公告
- ✅ 能看到本校所有公告（包括草稿）
- ✅ 看不到其他学校的公告
- ✅ 新增公告自动设置正确的字段
- ✅ 可以编辑本校公告
- ✅ 不能编辑管理员公告
- ✅ 可以删除本校公告
- ✅ 不能删除管理员公告

### 8.3 学生端

- ✅ 首页显示正确的公告（最多5条）
- ✅ 能看到管理员面向学生的公告
- ✅ 能看到本校发布的公告
- ✅ 看不到其他学校的公告
- ✅ 通知类型显示正确
- ✅ 发布者显示正确
- ✅ 浏览次数正常增加

## 9. 参考文档

- `docs/通知公告功能-重新设计.md` - 完整设计方案
- `docs/通知公告功能-后端实现指南.md` - 核心SQL语句
- `docs/通知公告功能-修改检查清单.md` - 详细检查清单
- `docs/通知公告功能-最终检查报告.md` - 最终检查报告
- `docs/学生端首页通知公告接口文档.md` - 学生端接口文档

---

**文档版本**: v1.0  
**创建日期**: 2026年2月21日  
**状态**: 前端已完成，等待后端实现
