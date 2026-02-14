# AI智能职位推荐 - 快速实施指南

## 📋 实施概览

本指南将帮助你在2-3天内完成AI智能职位推荐功能的实施。

**核心功能**: 基于向量相似度的智能职位推荐  
**技术栈**: Spring AI + PostgreSQL + pgvector  
**实施时间**: 2-3天  
**难度**: 中等

---

## ✅ 前置条件检查

- [x] Spring AI 已配置
- [x] PostgreSQL 数据库已安装
- [x] pgvector 扩展已安装
- [ ] 数据库迁移脚本已准备
- [ ] 后端服务待实现
- [ ] 前端页面待实现

---

## 🚀 实施步骤

### 第一步: 执行数据库迁移 (30分钟)

#### 1.1 连接数据库

```bash
# Windows CMD
psql -U postgres -d your_database_name

# 或使用数据库管理工具 (推荐)
# - DBeaver
# - pgAdmin
# - DataGrip
```

#### 1.2 执行迁移脚本

**方式一: 命令行执行**
```bash
psql -U postgres -d your_database_name -f docs/db/ai_vector_migration.sql
```

**方式二: 复制粘贴执行**
1. 打开 `docs/db/ai_vector_migration.sql`
2. 复制全部内容
3. 在数据库客户端中执行

#### 1.3 验证迁移结果

执行以下SQL验证:

```sql
-- 1. 确认pgvector扩展已启用
SELECT * FROM pg_extension WHERE extname = 'vector';

-- 2. 确认向量字段已添加
\d biz_job
\d biz_student_resume

-- 3. 确认索引已创建
SELECT indexname FROM pg_indexes 
WHERE indexname IN ('idx_biz_job_embedding', 'idx_biz_student_resume_embedding');

-- 4. 查看数据统计
SELECT 
    '职位' as 类型,
    COUNT(*) as 总数,
    COUNT(embedding) as 已生成向量数
FROM biz_job
WHERE status = 1 AND audit = 1;
```

**预期结果**:
- pgvector扩展存在
- biz_job 表有 embedding 字段 (vector(1536))
- biz_student_resume 表有 embedding 字段 (vector(1536))
- 两个向量索引已创建
- 已生成向量数为 0 (正常,还未生成)

---

### 第二步: 实现后端服务 (1天)

#### 2.1 创建实体类映射

**文件**: `Job.java` (修改现有实体)

```java
@Entity
@Table(name = "biz_job")
public class Job {
    
    // ... 现有字段
    
    /**
     * AI生成的职位描述向量
     */
    @Column(name = "embedding", columnDefinition = "vector(1536)")
    private float[] embedding;
    
    // getter/setter
    public float[] getEmbedding() {
        return embedding;
    }
    
    public void setEmbedding(float[] embedding) {
        this.embedding = embedding;
    }
}
```

**文件**: `StudentResume.java` (修改现有实体)

```java
@Entity
@Table(name = "biz_student_resume")
public class StudentResume {
    
    // ... 现有字段
    
    /**
     * AI生成的简历向量
     */
    @Column(name = "embedding", columnDefinition = "vector(1536)")
    private float[] embedding;
    
    // getter/setter
    public float[] getEmbedding() {
        return embedding;
    }
    
    public void setEmbedding(float[] embedding) {
        this.embedding = embedding;
    }
}
```

#### 2.2 扩展Repository

**文件**: `JobRepository.java` (添加方法)

```java
@Repository
public interface JobRepository extends JpaRepository<Job, String> {
    
    // ... 现有方法
    
    /**
     * 向量相似度搜索 - 推荐职位
     */
    @Query(value = """
        SELECT 
            j.*,
            1 - (j.embedding <=> CAST(:resumeVector AS vector)) as similarity
        FROM biz_job j
        WHERE j.status = 1 
          AND j.audit = 1
          AND j.embedding IS NOT NULL
        ORDER BY j.embedding <=> CAST(:resumeVector AS vector)
        LIMIT :limit
        """, nativeQuery = true)
    List<Job> findSimilarJobs(
        @Param("resumeVector") float[] resumeVector,
        @Param("limit") int limit
    );
    
    /**
     * 查找没有向量的职位
     */
    @Query("SELECT j FROM Job j WHERE j.embedding IS NULL AND j.status = 1 AND j.audit = 1")
    List<Job> findJobsWithoutEmbedding();
}
```

**文件**: `StudentResumeRepository.java` (添加方法)

```java
@Repository
public interface StudentResumeRepository extends JpaRepository<StudentResume, String> {
    
    // ... 现有方法
    
    /**
     * 根据学生ID查找简历
     */
    StudentResume findByStudentId(String studentId);
    
    /**
     * 查找没有向量的简历
     */
    @Query("SELECT r FROM StudentResume r WHERE r.embedding IS NULL AND r.isPublic = 1")
    List<StudentResume> findResumesWithoutEmbedding();
}
```

#### 2.3 创建VO类

**文件**: `com.example.vo.JobRecommendationVO.java` (新建)

```java
package com.example.vo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JobRecommendationVO {
    private String jobId;
    private String title;
    private String companyName;
    private String salaryRange;
    private String location;
    private Integer matchScore;  // 匹配度（0-100）
    private String recommendReason;  // 推荐理由
}
```

#### 2.4 创建AI推荐服务

**文件**: `com.example.service.AIRecommendationService.java` (新建)

详细代码请参考 `docs/AI功能-下一步实施步骤.md` 第2.3节

核心方法:
- `recommendJobs(String studentId, int limit)` - 推荐职位
- `generateResumeEmbedding(String studentId)` - 生成简历向量
- `generateJobEmbedding(String jobId)` - 生成职位向量
- `buildResumeText(StudentResume resume)` - 构建简历文本
- `buildJobText(Job job)` - 构建职位文本

#### 2.5 创建Controller

**文件**: `com.example.controller.mobile.AIRecommendationController.java` (新建)

```java
package com.example.controller.mobile;

import com.example.service.AIRecommendationService;
import com.example.vo.JobRecommendationVO;
import com.example.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mobile/ai")
public class AIRecommendationController {
    
    @Autowired
    private AIRecommendationService recommendationService;
    
    /**
     * 获取AI推荐职位
     */
    @GetMapping("/recommend/jobs")
    public Result<List<JobRecommendationVO>> recommendJobs(
        @RequestParam(defaultValue = "10") int limit
    ) {
        String studentId = SecurityUtils.getStudentId();
        List<JobRecommendationVO> recommendations = 
            recommendationService.recommendJobs(studentId, limit);
        return Result.success(recommendations);
    }
    
    /**
     * 刷新简历向量（简历更新后调用）
     */
    @PostMapping("/refresh/resume")
    public Result<Void> refreshResumeEmbedding() {
        String studentId = SecurityUtils.getStudentId();
        recommendationService.generateResumeEmbedding(studentId);
        return Result.success();
    }
}
```

#### 2.6 创建管理员Controller (用于测试)

**文件**: `com.example.controller.admin.AIAdminController.java` (新建)

```java
package com.example.controller.admin;

import com.example.task.EmbeddingGenerationTask;
import com.example.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/ai")
public class AIAdminController {
    
    @Autowired
    private EmbeddingGenerationTask embeddingTask;
    
    /**
     * 手动触发生成所有职位向量
     */
    @PostMapping("/generate/jobs")
    public Result<Void> generateJobEmbeddings() {
        embeddingTask.generateJobEmbeddings();
        return Result.success("职位向量生成任务已启动");
    }
    
    /**
     * 手动触发生成所有简历向量
     */
    @PostMapping("/generate/resumes")
    public Result<Void> generateResumeEmbeddings() {
        embeddingTask.generateResumeEmbeddings();
        return Result.success("简历向量生成任务已启动");
    }
}
```

#### 2.7 创建定时任务

**文件**: `com.example.task.EmbeddingGenerationTask.java` (新建)

详细代码请参考 `docs/AI功能-下一步实施步骤.md` 第3.1节

---

### 第三步: 生成测试数据向量 (30分钟)

#### 3.1 启动后端服务

```bash
# 确保Spring Boot应用已启动
mvn spring-boot:run
```

#### 3.2 手动触发向量生成

使用Postman或curl调用管理员接口:

```bash
# 生成所有职位向量
curl -X POST http://localhost:8080/api/admin/ai/generate/jobs

# 生成所有简历向量
curl -X POST http://localhost:8080/api/admin/ai/generate/resumes
```

#### 3.3 验证向量生成结果

```sql
-- 查看向量生成进度
SELECT 
    '职位' as 类型,
    COUNT(*) as 总数,
    COUNT(embedding) as 已生成向量数,
    ROUND(COUNT(embedding)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as 完成率
FROM biz_job
WHERE status = 1 AND audit = 1

UNION ALL

SELECT 
    '简历' as 类型,
    COUNT(*) as 总数,
    COUNT(embedding) as 已生成向量数,
    ROUND(COUNT(embedding)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as 完成率
FROM biz_student_resume
WHERE is_public = 1;
```

#### 3.4 测试推荐接口

```bash
# 测试推荐接口 (需要登录token)
curl -X GET "http://localhost:8080/api/mobile/ai/recommend/jobs?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 第四步: 实现前端页面 (半天)

#### 4.1 创建API接口文件

**文件**: `src/api/mobile/ai.ts` (新建)

```typescript
import request from '@/utils/request'

export interface JobRecommendationVO {
  jobId: string
  title: string
  companyName: string
  salaryRange: string
  location: string
  matchScore: number
  recommendReason: string
}

/**
 * 获取AI推荐职位
 */
export function getAIRecommendJobs(limit: number = 10) {
  return request.get<any, { data: JobRecommendationVO[] }>(
    '/mobile/ai/recommend/jobs',
    { params: { limit } }
  )
}

/**
 * 刷新简历向量
 */
export function refreshResumeEmbedding() {
  return request.post('/mobile/ai/refresh/resume')
}
```

#### 4.2 修改学生端首页

**文件**: `src/views/mobile/home/index.vue` (修改)

在首页添加AI推荐模块,插入到现有内容之前:

```vue
<!-- AI推荐模块 -->
<div class="ai-recommendation-section mt-3 px-3">
  <div class="flex justify-between items-center mb-3">
    <h3 class="text-base font-bold text-gray-800 flex items-center">
      <van-icon name="fire" color="#ee0a24" class="mr-1" />
      AI为你推荐
    </h3>
    <span class="text-xs text-gray-400" @click="toRecommendList">
      更多 <van-icon name="arrow" />
    </span>
  </div>

  <van-loading v-if="aiLoading" class="text-center py-4" />

  <div v-else-if="recommendedJobs.length > 0" class="space-y-2">
    <div
      v-for="job in recommendedJobs"
      :key="job.jobId"
      class="bg-white p-4 rounded-lg shadow-sm active:bg-gray-50"
      @click="toJobDetail(job.jobId)"
    >
      <!-- 匹配度标签 -->
      <div class="flex items-center justify-between mb-2">
        <van-tag 
          :type="getMatchType(job.matchScore)" 
          size="medium"
        >
          🎯 匹配度 {{ job.matchScore }}%
        </van-tag>
        <van-tag plain type="primary" size="small">AI推荐</van-tag>
      </div>

      <!-- 职位信息 -->
      <div class="font-bold text-base text-gray-800 mb-2">
        {{ job.title }}
      </div>

      <div class="flex items-center text-sm text-gray-600 mb-2">
        <span class="text-blue-600 font-medium mr-3">{{ job.salaryRange }}</span>
        <span class="mr-3">{{ job.location }}</span>
        <span>{{ job.companyName }}</span>
      </div>

      <!-- 推荐理由 -->
      <div class="flex items-start gap-1 text-xs text-gray-500 bg-blue-50 p-2 rounded">
        <van-icon name="info-o" size="14" color="#3b82f6" class="mt-0.5" />
        <span>{{ job.recommendReason }}</span>
      </div>
    </div>
  </div>

  <van-empty 
    v-else
    description="暂无推荐职位，完善简历后获得更多推荐"
    image-size="80"
  >
    <van-button type="primary" size="small" @click="toResume">
      完善简历
    </van-button>
  </van-empty>
</div>
```

在script部分添加:

```typescript
import { getAIRecommendJobs } from '@/api/mobile/ai'

const aiLoading = ref(true)
const recommendedJobs = ref<any[]>([])

// 加载AI推荐
const loadRecommendations = async () => {
  try {
    const res = await getAIRecommendJobs(5)
    recommendedJobs.value = res.data || []
  } catch (error) {
    console.error('加载AI推荐失败', error)
  } finally {
    aiLoading.value = false
  }
}

// 获取匹配度标签类型
const getMatchType = (score: number) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 70) return 'warning'
  return 'default'
}

// 跳转职位详情
const toJobDetail = (jobId: string) => {
  router.push(`/student/job/${jobId}`)
}

// 跳转推荐列表
const toRecommendList = () => {
  router.push('/student/ai/recommend')
}

// 跳转简历
const toResume = () => {
  router.push('/student/resume')
}

onMounted(() => {
  loadRecommendations()
})
```

---

### 第五步: 测试验证 (半天)

#### 5.1 功能测试清单

- [ ] 数据库向量字段已添加
- [ ] 向量索引已创建
- [ ] 职位向量生成成功
- [ ] 简历向量生成成功
- [ ] 推荐接口返回正确数据
- [ ] 匹配度计算合理
- [ ] 前端页面显示正常
- [ ] 点击跳转正常

#### 5.2 性能测试

```sql
-- 测试向量相似度查询性能
EXPLAIN ANALYZE
SELECT 
    j.job_id,
    j.job_name,
    1 - (j.embedding <=> (SELECT embedding FROM biz_student_resume WHERE student_id = 'test-student-id')) as similarity
FROM biz_job j
WHERE j.status = 1 
  AND j.audit = 1
  AND j.embedding IS NOT NULL
ORDER BY j.embedding <=> (SELECT embedding FROM biz_student_resume WHERE student_id = 'test-student-id')
LIMIT 10;
```

**预期**: 查询时间 < 100ms

#### 5.3 推荐质量测试

1. 创建测试学生简历 (Java后端开发方向)
2. 查看推荐的职位是否匹配
3. 检查匹配度分数是否合理
4. 验证推荐理由是否准确

---

## 📊 实施进度跟踪

| 步骤 | 任务 | 预计时间 | 状态 |
|------|------|----------|------|
| 1 | 执行数据库迁移 | 0.5小时 | ⏳ 待开始 |
| 2 | 实现后端服务 | 1天 | ⏳ 待开始 |
| 3 | 生成测试数据向量 | 0.5小时 | ⏳ 待开始 |
| 4 | 实现前端页面 | 0.5天 | ⏳ 待开始 |
| 5 | 测试验证 | 0.5天 | ⏳ 待开始 |

---

## 🎯 成功标准

- ✅ 学生登录后首页显示AI推荐职位
- ✅ 推荐职位与学生简历高度相关
- ✅ 匹配度分数合理 (70-100分)
- ✅ 推荐理由清晰易懂
- ✅ 页面响应速度快 (<1秒)
- ✅ 简历更新后推荐结果更新

---

## 🐛 常见问题

### Q1: pgvector扩展安装失败?
**A**: 确保PostgreSQL版本 >= 11,使用管理员权限执行 `CREATE EXTENSION vector;`

### Q2: 向量生成失败?
**A**: 检查Spring AI配置,确认API Key正确,网络连接正常

### Q3: 推荐结果为空?
**A**: 确认职位和简历都已生成向量,检查数据库中embedding字段不为NULL

### Q4: 匹配度都很低?
**A**: 检查简历文本构建逻辑,确保包含关键信息(技能、经验、意向)

### Q5: 查询速度慢?
**A**: 确认向量索引已创建,考虑调整ivfflat的lists参数

---

## 📚 相关文档

- [AI功能设计方案-总体架构](./AI功能设计方案-总体架构.md)
- [AI功能设计方案-智能推荐](./AI功能设计方案-智能推荐.md)
- [AI功能-下一步实施步骤](./AI功能-下一步实施步骤.md)
- [数据库迁移脚本](./db/ai_vector_migration.sql)

---

## 🎉 下一步

完成智能职位推荐后,可以考虑实现:

1. **AI简历筛选** (企业端) - 帮助企业快速找到匹配的候选人
2. **简历优化建议** (学生端) - AI分析简历并给出改进建议
3. **项目描述生成** (学生端) - 帮助学生生成创业项目描述

---

**祝你实施顺利! 🚀**
