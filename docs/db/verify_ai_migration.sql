-- ============================================
-- AI向量功能迁移验证脚本
-- ============================================
-- 用途：验证数据库迁移是否成功执行
-- 使用：在数据库客户端中执行此脚本
-- ============================================

-- 1. 检查pgvector扩展是否已启用
SELECT 
    '1. pgvector扩展检查' as 检查项,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ 已安装'
        ELSE '❌ 未安装'
    END as 状态
FROM pg_extension 
WHERE extname = 'vector';

-- 2. 检查biz_job表是否有embedding字段
SELECT 
    '2. biz_job表embedding字段' as 检查项,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ 已添加'
        ELSE '❌ 未添加'
    END as 状态
FROM information_schema.columns 
WHERE table_name = 'biz_job' 
  AND column_name = 'embedding';

-- 3. 检查biz_student_resume表是否有embedding字段
SELECT 
    '3. biz_student_resume表embedding字段' as 检查项,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ 已添加'
        ELSE '❌ 未添加'
    END as 状态
FROM information_schema.columns 
WHERE table_name = 'biz_student_resume' 
  AND column_name = 'embedding';

-- 4. 检查biz_project表是否有embedding字段
SELECT 
    '4. biz_project表embedding字段' as 检查项,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ 已添加'
        ELSE '❌ 未添加'
    END as 状态
FROM information_schema.columns 
WHERE table_name = 'biz_project' 
  AND column_name = 'embedding';

-- 5. 检查biz_job表的向量索引
SELECT 
    '5. biz_job向量索引' as 检查项,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ 已创建'
        ELSE '❌ 未创建'
    END as 状态
FROM pg_indexes 
WHERE tablename = 'biz_job' 
  AND indexname = 'idx_biz_job_embedding';

-- 6. 检查biz_student_resume表的向量索引
SELECT 
    '6. biz_student_resume向量索引' as 检查项,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ 已创建'
        ELSE '❌ 未创建'
    END as 状态
FROM pg_indexes 
WHERE tablename = 'biz_student_resume' 
  AND indexname = 'idx_biz_student_resume_embedding';

-- 7. 检查biz_project表的向量索引
SELECT 
    '7. biz_project向量索引' as 检查项,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ 已创建'
        ELSE '❌ 未创建'
    END as 状态
FROM pg_indexes 
WHERE tablename = 'biz_project' 
  AND indexname = 'idx_biz_project_embedding';

-- 8. 检查AI推荐记录表是否创建
SELECT 
    '8. biz_ai_recommendation表' as 检查项,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ 已创建'
        ELSE '❌ 未创建'
    END as 状态
FROM information_schema.tables 
WHERE table_name = 'biz_ai_recommendation';

-- 9. 检查向量生成任务表是否创建
SELECT 
    '9. biz_embedding_task表' as 检查项,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ 已创建'
        ELSE '❌ 未创建'
    END as 状态
FROM information_schema.tables 
WHERE table_name = 'biz_embedding_task';

-- ============================================
-- 详细信息查询
-- ============================================

-- 10. 查看biz_job表结构（包含embedding字段）
SELECT 
    column_name as 字段名,
    data_type as 数据类型,
    udt_name as UDT类型,
    is_nullable as 可为空
FROM information_schema.columns 
WHERE table_name = 'biz_job' 
  AND column_name IN ('job_id', 'job_name', 'embedding')
ORDER BY ordinal_position;

-- 11. 查看biz_student_resume表结构（包含embedding字段）
SELECT 
    column_name as 字段名,
    data_type as 数据类型,
    udt_name as UDT类型,
    is_nullable as 可为空
FROM information_schema.columns 
WHERE table_name = 'biz_student_resume' 
  AND column_name IN ('resume_id', 'student_id', 'embedding')
ORDER BY ordinal_position;

-- 12. 查看所有向量索引
SELECT 
    schemaname as 模式,
    tablename as 表名,
    indexname as 索引名,
    indexdef as 索引定义
FROM pg_indexes 
WHERE indexname LIKE '%embedding%'
ORDER BY tablename;

-- ============================================
-- 数据统计
-- ============================================

-- 13. 查看各表的数据量和向量生成情况
SELECT 
    '职位(biz_job)' as 表名,
    COUNT(*) as 总记录数,
    COUNT(embedding) as 已生成向量数,
    COUNT(*) - COUNT(embedding) as 未生成向量数,
    CASE 
        WHEN COUNT(*) > 0 THEN ROUND(COUNT(embedding)::numeric / COUNT(*) * 100, 2)
        ELSE 0
    END as 完成率
FROM biz_job
WHERE status = 1 AND audit = 1

UNION ALL

SELECT 
    '简历(biz_student_resume)' as 表名,
    COUNT(*) as 总记录数,
    COUNT(embedding) as 已生成向量数,
    COUNT(*) - COUNT(embedding) as 未生成向量数,
    CASE 
        WHEN COUNT(*) > 0 THEN ROUND(COUNT(embedding)::numeric / COUNT(*) * 100, 2)
        ELSE 0
    END as 完成率
FROM biz_student_resume
WHERE is_public = 1

UNION ALL

SELECT 
    '项目(biz_project)' as 表名,
    COUNT(*) as 总记录数,
    COUNT(embedding) as 已生成向量数,
    COUNT(*) - COUNT(embedding) as 未生成向量数,
    CASE 
        WHEN COUNT(*) > 0 THEN ROUND(COUNT(embedding)::numeric / COUNT(*) * 100, 2)
        ELSE 0
    END as 完成率
FROM biz_project
WHERE status = '1';

-- ============================================
-- 执行结果说明
-- ============================================

-- 如果所有检查项都显示 ✅，说明迁移成功！
-- 如果有 ❌，说明对应的项目没有创建成功，需要重新执行迁移脚本

-- 预期结果：
-- 1-9: 所有检查项都应该是 ✅
-- 10-12: 应该能看到embedding字段和索引的详细信息
-- 13: 已生成向量数应该是0（因为还没有生成向量）

SELECT '✅ 验证脚本执行完成！请查看上面的结果。' as 提示;
