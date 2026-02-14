# AI简历筛选功能 - 后端实现指南

## 📋 功能概述

帮助企业HR快速筛选匹配的简历,基于职位向量和简历向量的相似度,自动推荐最匹配的候选人。

---

## 🎯 核心功能

### 1. 为职位筛选匹配简历
- 输入: 职位ID
- 输出: 匹配度排序的简历列表
- 算法: 向量相似度搜索

### 2. 批量筛选
- 支持一次性为多个职位筛选简历
- 提高HR工作效率

---

## 📊 数据库准备

数据库向量字段已经在之前的迁移中添加完成:
- ✅ `biz_job.embedding` - 职位向量
- ✅ `biz_student_resume.embedding` - 简历向量

---

## 🔧 后端实现

### 1. VO类

**文件**: `com.example.vo.ResumeMatchVO.java`

```java
package com.example.vo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResumeMatchVO {
    /**
     * 简历ID
     */
    private String resumeId;
    
    /**
     * 学生ID
     */
    private String studentId;
    
    /**
     * 学生姓名
     */
    private String studentName;
    
    /**
     * 学校
     */
    private String school;
    
    /**
     * 专业
     */
    private String major;
    
    /**
     * 学历
     */
    private String education;
    
    /**
     * 毕业年份
     */
    private Integer graduationYear;
    
    /**
     * 期望职位
     */
    private String expectedPosition;
    
    /**
     * 期望薪资
     */
    private String expectedSalary;
    
    /**
     * 期望城市
     */
    private String targetCity;
    
    /**
     * 技能
     */
    private String skills;
    
    /**
     * 匹配度分数 (0-100)
     */
    private Integer matchScore;
    
    /**
     * 匹配理由
     */
    private String matchReason;
    
    /**
     * 联系电话
     */
    private String phone;
    
    /**
     * 邮箱
     */
    private String email;
}
```

---

### 2. Repository层

**文件**: `StudentResumeRepository.java` (扩展现有Repository)

```java
@Repository
public interface StudentResumeRepository extends JpaRepository<StudentResume, String> {
    
    // ... 现有方法
    
    /**
     * 向量相似度搜索 - 为职位筛选简历
     * 
     * @param jobVector 职位向量
     * @param limit 返回数量
     * @return 匹配的简历列表
     */
    @Query(value = """
        SELECT 
            r.*,
            1 - (r.embedding <=> CAST(:jobVector AS vector)) as similarity
        FROM biz_student_resume r
        WHERE r.is_public = 1
          AND r.embedding IS NOT NULL
        ORDER BY r.embedding <=> CAST(:jobVector AS vector)
        LIMIT :limit
        """, nativeQuery = true)
    List<StudentResume> findSimilarResumes(
        @Param("jobVector") float[] jobVector,
        @Param("limit") int limit
    );
}
```

---

### 3. Service层

**文件**: `AIRecommendationService.java` (扩展现有Service)

在现有的 `AIRecommendationService` 中添加以下方法:

```java
@Service
@Slf4j
public class AIRecommendationService {
    
    @Autowired
    private EmbeddingClient embeddingClient;
    
    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private StudentResumeRepository resumeRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    // ... 现有方法 (recommendJobs, generateResumeEmbedding等)
    
    /**
     * 为职位筛选匹配的简历
     * 
     * @param jobId 职位ID
     * @param limit 返回数量,默认20
     * @return 匹配的简历列表
     */
    public List<ResumeMatchVO> screenResumes(String jobId, int limit) {
        // 1. 获取职位信息
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new BusinessException("职位不存在"));
        
        // 2. 如果职位没有向量,先生成
        if (job.getEmbedding() == null) {
            generateJobEmbedding(jobId);
            job = jobRepository.findById(jobId).orElseThrow();
        }
        
        // 3. 向量相似度搜索
        List<StudentResume> similarResumes = resumeRepository.findSimilarResumes(
            job.getEmbedding(), 
            limit
        );
        
        // 4. 构建匹配结果
        return similarResumes.stream()
            .map(resume -> buildResumeMatch(resume, job))
            .collect(Collectors.toList());
    }
    
    /**
     * 构建简历匹配结果
     */
    private ResumeMatchVO buildResumeMatch(StudentResume resume, Job job) {
        // 计算匹配度
        float similarity = calculateSimilarity(resume.getEmbedding(), job.getEmbedding());
        int matchScore = (int) (similarity * 100);
        
        // 生成匹配理由
        String matchReason = generateMatchReason(matchScore, resume, job);
        
        // 获取学生基本信息
        Student student = studentRepository.findById(resume.getStudentId())
            .orElse(null);
        
        return ResumeMatchVO.builder()
            .resumeId(resume.getResumeId())
            .studentId(resume.getStudentId())
            .studentName(student != null ? student.getStudentName() : "")
            .school(student != null ? student.getSchoolName() : "")
            .major(student != null ? student.getMajorName() : "")
            .education(student != null ? student.getEducation() : "")
            .graduationYear(student != null ? student.getGraduationYear() : null)
            .expectedPosition(resume.getExpectedPosition())
            .expectedSalary(resume.getExpectedSalary())
            .targetCity(resume.getTargetCity())
            .skills(resume.getSkills())
            .matchScore(matchScore)
            .matchReason(matchReason)
            .phone(student != null ? student.getPhone() : "")
            .email(student != null ? student.getEmail() : "")
            .build();
    }
    
    /**
     * 生成匹配理由
     */
    private String generateMatchReason(int matchScore, StudentResume resume, Job job) {
        if (matchScore >= 90) {
            return "候选人的技能和经验与职位要求高度匹配";
        } else if (matchScore >= 80) {
            return "候选人的专业背景与职位要求相符";
        } else if (matchScore >= 70) {
            return "候选人具备职位所需的基本能力";
        } else {
            return "候选人可能适合该职位";
        }
    }
    
    /**
     * 计算余弦相似度 (已有方法,确保存在)
     */
    private float calculateSimilarity(float[] vec1, float[] vec2) {
        float dotProduct = 0.0f;
        float norm1 = 0.0f;
        float norm2 = 0.0f;
        
        for (int i = 0; i < vec1.length; i++) {
            dotProduct += vec1[i] * vec2[i];
            norm1 += vec1[i] * vec1[i];
            norm2 += vec2[i] * vec2[i];
        }
        
        return dotProduct / (float) (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
}
```

---

### 4. Controller层

**文件**: `com.example.controller.company.AIRecruitmentController.java` (新建)

```java
package com.example.controller.company;

import com.example.service.AIRecommendationService;
import com.example.vo.ResumeMatchVO;
import com.example.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AI招聘辅助 - 企业端
 */
@RestController
@RequestMapping("/api/company/ai")
public class AIRecruitmentController {
    
    @Autowired
    private AIRecommendationService recommendationService;
    
    /**
     * AI筛选简历
     * 
     * @param jobId 职位ID
     * @param limit 返回数量,默认20
     * @return 匹配的简历列表
     */
    @GetMapping("/screen/resumes")
    public Result<List<ResumeMatchVO>> screenResumes(
        @RequestParam String jobId,
        @RequestParam(defaultValue = "20") int limit
    ) {
        List<ResumeMatchVO> matches = recommendationService.screenResumes(jobId, limit);
        return Result.success(matches);
    }
}
```

---

## 📝 接口文档

### AI筛选简历接口

**接口地址**: `GET /api/company/ai/screen/resumes`

**权限**: `ROLE_COMPANY` (企业端)

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| jobId | String | 是 | 职位ID |
| limit | Integer | 否 | 返回数量,默认20 |

**请求示例**:
```
GET /api/company/ai/screen/resumes?jobId=job123&limit=20
```

**返回示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "resumeId": "resume123",
      "studentId": "student123",
      "studentName": "张三",
      "school": "成都大学",
      "major": "计算机科学与技术",
      "education": "本科",
      "graduationYear": 2024,
      "expectedPosition": "Java后端开发",
      "expectedSalary": "10-15K",
      "targetCity": "成都",
      "skills": "Java, Spring Boot, MySQL, Redis",
      "matchScore": 92,
      "matchReason": "候选人的技能和经验与职位要求高度匹配",
      "phone": "138****1234",
      "email": "zhangsan@example.com"
    }
  ]
}
```

---

## 🧪 测试步骤

### 1. 确保数据准备
```sql
-- 检查职位是否有向量
SELECT job_id, job_name, embedding IS NOT NULL as has_embedding
FROM biz_job
WHERE status = 1 AND audit = 1
LIMIT 10;

-- 检查简历是否有向量
SELECT resume_id, student_id, embedding IS NOT NULL as has_embedding
FROM biz_student_resume
WHERE is_public = 1
LIMIT 10;
```

### 2. 测试接口
使用Postman或其他工具:
```bash
GET http://localhost:8080/api/company/ai/screen/resumes?jobId=xxx&limit=20
Headers: Authorization: Bearer {company_token}
```

### 3. 验证结果
- 返回的简历是否按匹配度排序
- 匹配度分数是否合理(70-100)
- 匹配理由是否准确
- 简历信息是否完整

---

## ⚠️ 注意事项

### 1. 权限控制
确保只有企业端可以访问此接口:
```java
@PreAuthorize("hasRole('COMPANY')")
```

### 2. 数据脱敏
返回给前端的手机号和邮箱需要脱敏:
```java
// 手机号脱敏: 138****1234
private String maskPhone(String phone) {
    if (phone == null || phone.length() < 11) return phone;
    return phone.substring(0, 3) + "****" + phone.substring(7);
}

// 邮箱脱敏: zha***@example.com
private String maskEmail(String email) {
    if (email == null || !email.contains("@")) return email;
    String[] parts = email.split("@");
    String name = parts[0];
    if (name.length() <= 3) return email;
    return name.substring(0, 3) + "***@" + parts[1];
}
```

### 3. 性能优化
如果简历数量很大,考虑:
- 添加缓存
- 异步处理
- 分页加载

---

## 📊 SQL查询示例

### 测试向量相似度查询
```sql
-- 为指定职位查找匹配的简历
SELECT 
    r.resume_id,
    r.student_id,
    s.student_name,
    s.major_name,
    r.expected_position,
    r.skills,
    1 - (r.embedding <=> (SELECT embedding FROM biz_job WHERE job_id = 'xxx')) as similarity,
    ROUND((1 - (r.embedding <=> (SELECT embedding FROM biz_job WHERE job_id = 'xxx'))) * 100) as match_score
FROM biz_student_resume r
JOIN biz_student s ON r.student_id = s.student_id
WHERE r.is_public = 1
  AND r.embedding IS NOT NULL
ORDER BY r.embedding <=> (SELECT embedding FROM biz_job WHERE job_id = 'xxx')
LIMIT 20;
```

---

## ✅ 实施检查清单

- [ ] 创建 `ResumeMatchVO` 类
- [ ] 扩展 `StudentResumeRepository` 添加 `findSimilarResumes` 方法
- [ ] 扩展 `AIRecommendationService` 添加 `screenResumes` 方法
- [ ] 创建 `AIRecruitmentController` 控制器
- [ ] 添加权限控制注解
- [ ] 实现数据脱敏
- [ ] 测试接口返回正常
- [ ] 验证匹配度计算准确

---

## 🎯 预期效果

实现后,企业HR可以:
1. 选择一个职位
2. 点击"AI筛选"按钮
3. 系统自动返回匹配度最高的20份简历
4. 显示匹配度分数和匹配理由
5. HR可以快速查看和联系候选人

---

## 📞 需要帮助?

如果遇到问题:
1. 检查职位和简历是否都有向量
2. 查看后端日志
3. 使用SQL直接测试向量查询
4. 参考学生端推荐功能的实现

---

**实施时间**: 预计1-2小时  
**难度**: 中等  
**优先级**: 高
