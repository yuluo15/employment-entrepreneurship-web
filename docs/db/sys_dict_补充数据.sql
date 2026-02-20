-- ============================================
-- 系统字典补充数据SQL
-- 创建日期: 2026-02-14
-- 说明: 补充项目中使用但字典表中缺失的数据
-- ============================================

-- ============================================
-- 1. 投递状态字典 (sys_delivery_status)
-- 用于: 企业端简历管理、人才库管理
-- ============================================
INSERT INTO public.sys_dict_type (id, dict_name, dict_type, status, remark, create_time, is_deleted) VALUES
('a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', '投递状态', 'sys_delivery_status', 1, '简历投递状态', CURRENT_TIMESTAMP, 0);

INSERT INTO public.sys_dict_data (id, dict_sort, dict_label, dict_value, dict_type, status, remark, create_time, is_deleted) VALUES
('delivery_status_001', 1, '待处理', 'DELIVERED', 'sys_delivery_status', 1, '简历已投递，待HR处理', CURRENT_TIMESTAMP, 0),
('delivery_status_002', 2, '面试中', 'INTERVIEW', 'sys_delivery_status', 1, '已安排面试', CURRENT_TIMESTAMP, 0),
('delivery_status_003', 3, '已录用', 'OFFER', 'sys_delivery_status', 1, '已发放Offer', CURRENT_TIMESTAMP, 0),
('delivery_status_004', 4, '已拒绝', 'REJECTED', 'sys_delivery_status', 1, '简历不合适', CURRENT_TIMESTAMP, 0);

-- ============================================
-- 2. 面试状态字典 (sys_interview_status)
-- 用于: 企业端面试管理
-- ============================================
INSERT INTO public.sys_dict_type (id, dict_name, dict_type, status, remark, create_time, is_deleted) VALUES
('b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7', '面试状态', 'sys_interview_status', 1, '面试安排状态', CURRENT_TIMESTAMP, 0);

INSERT INTO public.sys_dict_data (id, dict_sort, dict_label, dict_value, dict_type, status, remark, create_time, is_deleted) VALUES
('interview_status_001', 1, '已安排', 'SCHEDULED', 'sys_interview_status', 1, '面试已安排，待进行', CURRENT_TIMESTAMP, 0),
('interview_status_002', 2, '已完成', 'COMPLETED', 'sys_interview_status', 1, '面试已完成', CURRENT_TIMESTAMP, 0),
('interview_status_003', 3, '已取消', 'CANCELLED', 'sys_interview_status', 1, '面试已取消', CURRENT_TIMESTAMP, 0);

-- ============================================
-- 3. 面试方式字典 (sys_interview_type)
-- 用于: 企业端面试管理
-- ============================================
INSERT INTO public.sys_dict_type (id, dict_name, dict_type, status, remark, create_time, is_deleted) VALUES
('c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8', '面试方式', 'sys_interview_type', 1, '面试进行方式', CURRENT_TIMESTAMP, 0);

INSERT INTO public.sys_dict_data (id, dict_sort, dict_label, dict_value, dict_type, status, remark, create_time, is_deleted) VALUES
('interview_type_001', 1, '现场面试', 'ONSITE', 'sys_interview_type', 1, '到公司现场面试', CURRENT_TIMESTAMP, 0),
('interview_type_002', 2, '视频面试', 'VIDEO', 'sys_interview_type', 1, '线上视频面试', CURRENT_TIMESTAMP, 0),
('interview_type_003', 3, '电话面试', 'PHONE', 'sys_interview_type', 1, '电话沟通面试', CURRENT_TIMESTAMP, 0);

-- ============================================
-- 4. Offer状态字典 (sys_offer_status)
-- 用于: 企业端人才库管理
-- ============================================
INSERT INTO public.sys_dict_type (id, dict_name, dict_type, status, remark, create_time, is_deleted) VALUES
('d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9', 'Offer状态', 'sys_offer_status', 1, 'Offer确认状态', CURRENT_TIMESTAMP, 0);

INSERT INTO public.sys_dict_data (id, dict_sort, dict_label, dict_value, dict_type, status, remark, create_time, is_deleted) VALUES
('offer_status_001', 1, '待确认', 'PENDING', 'sys_offer_status', 1, '已发放，待学生确认', CURRENT_TIMESTAMP, 0),
('offer_status_002', 2, '已接受', 'ACCEPTED', 'sys_offer_status', 1, '学生已接受Offer', CURRENT_TIMESTAMP, 0),
('offer_status_003', 3, '已拒绝', 'REJECTED', 'sys_offer_status', 1, '学生拒绝Offer', CURRENT_TIMESTAMP, 0);

-- ============================================
-- 5. 项目申请状态字典 (sys_application_status)
-- 用于: 学生端项目申请、教师端项目管理
-- ============================================
INSERT INTO public.sys_dict_type (id, dict_name, dict_type, status, remark, create_time, is_deleted) VALUES
('e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0', '申请状态', 'sys_application_status', 1, '项目加入申请状态', CURRENT_TIMESTAMP, 0);

INSERT INTO public.sys_dict_data (id, dict_sort, dict_label, dict_value, dict_type, status, remark, create_time, is_deleted) VALUES
('application_status_001', 1, '待审核', 'PENDING', 'sys_application_status', 1, '申请已提交，待审核', CURRENT_TIMESTAMP, 0),
('application_status_002', 2, '已通过', 'APPROVED', 'sys_application_status', 1, '申请已通过', CURRENT_TIMESTAMP, 0),
('application_status_003', 3, '已拒绝', 'REJECTED', 'sys_application_status', 1, '申请被拒绝', CURRENT_TIMESTAMP, 0),
('application_status_004', 4, '已取消', 'CANCELLED', 'sys_application_status', 1, '申请人主动取消', CURRENT_TIMESTAMP, 0);

-- ============================================
-- 6. 通知公告类型字典 (sys_notice_type)
-- 用于: 通知公告管理
-- ============================================
INSERT INTO public.sys_dict_type (id, dict_name, dict_type, status, remark, create_time, is_deleted) VALUES
('f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1', '通知类型', 'sys_notice_type', 1, '通知公告类型', CURRENT_TIMESTAMP, 0);

INSERT INTO public.sys_dict_data (id, dict_sort, dict_label, dict_value, dict_type, status, remark, create_time, is_deleted) VALUES
('notice_type_001', 1, '系统通知', 'SYSTEM', 'sys_notice_type', 1, '系统级通知', CURRENT_TIMESTAMP, 0),
('notice_type_002', 2, '政策通知', 'POLICY', 'sys_notice_type', 1, '政策相关通知', CURRENT_TIMESTAMP, 0),
('notice_type_003', 3, '活动通知', 'ACTIVITY', 'sys_notice_type', 1, '活动相关通知', CURRENT_TIMESTAMP, 0),
('notice_type_004', 4, '招聘通知', 'RECRUITMENT', 'sys_notice_type', 1, '招聘相关通知', CURRENT_TIMESTAMP, 0),
('notice_type_005', 5, '其他通知', 'OTHER', 'sys_notice_type', 1, '其他类型通知', CURRENT_TIMESTAMP, 0);

-- ============================================
-- 7. 发布者类型字典 (sys_publisher_type)
-- 用于: 通知公告管理
-- ============================================
INSERT INTO public.sys_dict_type (id, dict_name, dict_type, status, remark, create_time, is_deleted) VALUES
('g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2', '发布者类型', 'sys_publisher_type', 1, '通知发布者类型', CURRENT_TIMESTAMP, 0);

INSERT INTO public.sys_dict_data (id, dict_sort, dict_label, dict_value, dict_type, status, remark, create_time, is_deleted) VALUES
('publisher_type_001', 1, '管理员', 'ADMIN', 'sys_publisher_type', 1, '省教育厅管理员', CURRENT_TIMESTAMP, 0),
('publisher_type_002', 2, '学校', 'SCHOOL', 'sys_publisher_type', 1, '学校发布', CURRENT_TIMESTAMP, 0);

-- ============================================
-- 8. 目标受众字典 (sys_target_audience)
-- 用于: 通知公告管理
-- ============================================
INSERT INTO public.sys_dict_type (id, dict_name, dict_type, status, remark, create_time, is_deleted) VALUES
('h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3', '目标受众', 'sys_target_audience', 1, '通知目标受众', CURRENT_TIMESTAMP, 0);

INSERT INTO public.sys_dict_data (id, dict_sort, dict_label, dict_value, dict_type, status, remark, create_time, is_deleted) VALUES
('target_audience_001', 1, '全部', 'ALL', 'sys_target_audience', 1, '所有用户可见', CURRENT_TIMESTAMP, 0),
('target_audience_002', 2, '学校', 'SCHOOL', 'sys_target_audience', 1, '仅学校教职工可见', CURRENT_TIMESTAMP, 0),
('target_audience_003', 3, '学生', 'STUDENT', 'sys_target_audience', 1, '学生可见', CURRENT_TIMESTAMP, 0);

-- ============================================
-- 9. 薪资范围字典 (sys_salary_range)
-- 用于: 职位管理、岗位审核
-- ============================================
INSERT INTO public.sys_dict_type (id, dict_name, dict_type, status, remark, create_time, is_deleted) VALUES
('i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4', '薪资范围', 'sys_salary_range', 1, '职位薪资范围', CURRENT_TIMESTAMP, 0);

INSERT INTO public.sys_dict_data (id, dict_sort, dict_label, dict_value, dict_type, status, remark, create_time, is_deleted) VALUES
('salary_range_001', 1, '3K以下', 'BELOW_3K', 'sys_salary_range', 1, NULL, CURRENT_TIMESTAMP, 0),
('salary_range_002', 2, '3-5K', '3K_5K', 'sys_salary_range', 1, NULL, CURRENT_TIMESTAMP, 0),
('salary_range_003', 3, '5-8K', '5K_8K', 'sys_salary_range', 1, NULL, CURRENT_TIMESTAMP, 0),
('salary_range_004', 4, '8-12K', '8K_12K', 'sys_salary_range', 1, NULL, CURRENT_TIMESTAMP, 0),
('salary_range_005', 5, '12-15K', '12K_15K', 'sys_salary_range', 1, NULL, CURRENT_TIMESTAMP, 0),
('salary_range_006', 6, '15-20K', '15K_20K', 'sys_salary_range', 1, NULL, CURRENT_TIMESTAMP, 0),
('salary_range_007', 7, '20-30K', '20K_30K', 'sys_salary_range', 1, NULL, CURRENT_TIMESTAMP, 0),
('salary_range_008', 8, '30K以上', 'ABOVE_30K', 'sys_salary_range', 1, NULL, CURRENT_TIMESTAMP, 0);

-- ============================================
-- 10. 工作经验字典 (sys_work_experience)
-- 用于: 职位管理
-- ============================================
INSERT INTO public.sys_dict_type (id, dict_name, dict_type, status, remark, create_time, is_deleted) VALUES
('j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5', '工作经验', 'sys_work_experience', 1, '职位要求工作经验', CURRENT_TIMESTAMP, 0);

INSERT INTO public.sys_dict_data (id, dict_sort, dict_label, dict_value, dict_type, status, remark, create_time, is_deleted) VALUES
('work_exp_001', 1, '应届生', 'FRESH', 'sys_work_experience', 1, '应届毕业生', CURRENT_TIMESTAMP, 0),
('work_exp_002', 2, '1年以下', 'BELOW_1Y', 'sys_work_experience', 1, NULL, CURRENT_TIMESTAMP, 0),
('work_exp_003', 3, '1-3年', '1Y_3Y', 'sys_work_experience', 1, NULL, CURRENT_TIMESTAMP, 0),
('work_exp_004', 4, '3-5年', '3Y_5Y', 'sys_work_experience', 1, NULL, CURRENT_TIMESTAMP, 0),
('work_exp_005', 5, '5-10年', '5Y_10Y', 'sys_work_experience', 1, NULL, CURRENT_TIMESTAMP, 0),
('work_exp_006', 6, '10年以上', 'ABOVE_10Y', 'sys_work_experience', 1, NULL, CURRENT_TIMESTAMP, 0);

-- ============================================
-- 11. 职位类型字典 (sys_job_type)
-- 用于: 职位管理
-- ============================================
INSERT INTO public.sys_dict_type (id, dict_name, dict_type, status, remark, create_time, is_deleted) VALUES
('k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6', '职位类型', 'sys_job_type', 1, '职位工作类型', CURRENT_TIMESTAMP, 0);

INSERT INTO public.sys_dict_data (id, dict_sort, dict_label, dict_value, dict_type, status, remark, create_time, is_deleted) VALUES
('job_type_001', 1, '全职', 'FULL_TIME', 'sys_job_type', 1, '全职工作', CURRENT_TIMESTAMP, 0),
('job_type_002', 2, '兼职', 'PART_TIME', 'sys_job_type', 1, '兼职工作', CURRENT_TIMESTAMP, 0),
('job_type_003', 3, '实习', 'INTERN', 'sys_job_type', 1, '实习岗位', CURRENT_TIMESTAMP, 0);

-- ============================================
-- 12. 补充学历字典 (sys_education) - 补充缺失项
-- 用于: 简历管理、职位管理
-- ============================================
INSERT INTO public.sys_dict_data (id, dict_sort, dict_label, dict_value, dict_type, status, remark, create_time, is_deleted) VALUES
('education_004', 4, '博士', 'DOCTOR', 'sys_education', 1, NULL, CURRENT_TIMESTAMP, 0)
ON CONFLICT (id) DO NOTHING;

-- 修正现有学历字典的值（如果需要）
UPDATE public.sys_dict_data SET dict_value = 'COLLEGE', dict_label = '大专' WHERE dict_type = 'sys_education' AND dict_value = 'JUNIOR';

-- ============================================
-- 13. 消息类型字典 (sys_message_type)
-- 用于: 系统消息通知
-- ============================================
INSERT INTO public.sys_dict_type (id, dict_name, dict_type, status, remark, create_time, is_deleted) VALUES
('l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7', '消息类型', 'sys_message_type', 1, '系统消息类型', CURRENT_TIMESTAMP, 0);

INSERT INTO public.sys_dict_data (id, dict_sort, dict_label, dict_value, dict_type, status, remark, create_time, is_deleted) VALUES
('message_type_001', 1, '面试通知', 'INTERVIEW', 'sys_message_type', 1, '面试相关消息', CURRENT_TIMESTAMP, 0),
('message_type_002', 2, 'Offer通知', 'OFFER', 'sys_message_type', 1, 'Offer相关消息', CURRENT_TIMESTAMP, 0),
('message_type_003', 3, '投递通知', 'DELIVERY', 'sys_message_type', 1, '简历投递相关消息', CURRENT_TIMESTAMP, 0),
('message_type_004', 4, '申请通知', 'APPLICATION', 'sys_message_type', 1, '项目申请相关消息', CURRENT_TIMESTAMP, 0),
('message_type_005', 5, '系统通知', 'SYSTEM', 'sys_message_type', 1, '系统通知消息', CURRENT_TIMESTAMP, 0);

-- ============================================
-- 14. 企业规模字典 (sys_company_size)
-- 用于: 企业信息管理
-- ============================================
INSERT INTO public.sys_dict_type (id, dict_name, dict_type, status, remark, create_time, is_deleted) VALUES
('m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8', '企业规模', 'sys_company_size', 1, '企业人员规模', CURRENT_TIMESTAMP, 0);

INSERT INTO public.sys_dict_data (id, dict_sort, dict_label, dict_value, dict_type, status, remark, create_time, is_deleted) VALUES
('company_size_001', 1, '0-20人', 'SIZE_0_20', 'sys_company_size', 1, '初创企业', CURRENT_TIMESTAMP, 0),
('company_size_002', 2, '20-99人', 'SIZE_20_99', 'sys_company_size', 1, '小型企业', CURRENT_TIMESTAMP, 0),
('company_size_003', 3, '100-499人', 'SIZE_100_499', 'sys_company_size', 1, '中型企业', CURRENT_TIMESTAMP, 0),
('company_size_004', 4, '500-999人', 'SIZE_500_999', 'sys_company_size', 1, '大型企业', CURRENT_TIMESTAMP, 0),
('company_size_005', 5, '1000-9999人', 'SIZE_1000_9999', 'sys_company_size', 1, '超大型企业', CURRENT_TIMESTAMP, 0),
('company_size_006', 6, '10000人以上', 'SIZE_ABOVE_10000', 'sys_company_size', 1, '集团企业', CURRENT_TIMESTAMP, 0);

-- ============================================
-- 15. 审核状态字典 (sys_audit_status)
-- 用于: 岗位审核、企业审核
-- ============================================
INSERT INTO public.sys_dict_type (id, dict_name, dict_type, status, remark, create_time, is_deleted) VALUES
('n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9', '审核状态', 'sys_audit_status', 1, '审核状态', CURRENT_TIMESTAMP, 0);

INSERT INTO public.sys_dict_data (id, dict_sort, dict_label, dict_value, dict_type, status, remark, create_time, is_deleted) VALUES
('audit_status_001', 1, '待审核', 'PENDING', 'sys_audit_status', 1, '待审核', CURRENT_TIMESTAMP, 0),
('audit_status_002', 2, '审核通过', 'APPROVED', 'sys_audit_status', 1, '审核通过', CURRENT_TIMESTAMP, 0),
('audit_status_003', 3, '审核拒绝', 'REJECTED', 'sys_audit_status', 1, '审核拒绝', CURRENT_TIMESTAMP, 0);

-- ============================================
-- 验证插入结果
-- ============================================
-- 查看新增的字典类型
SELECT dict_type, dict_name, remark FROM sys_dict_type 
WHERE create_time >= CURRENT_DATE 
ORDER BY create_time DESC;

-- 查看新增的字典数据
SELECT dict_type, dict_label, dict_value FROM sys_dict_data 
WHERE create_time >= CURRENT_DATE 
ORDER BY dict_type, dict_sort;

-- ============================================
-- 使用说明
-- ============================================
-- 1. 执行前请备份数据库
-- 2. 如果ID冲突，请修改UUID
-- 3. 根据实际需求调整字典项
-- 4. 执行后验证数据是否正确插入
-- ============================================
