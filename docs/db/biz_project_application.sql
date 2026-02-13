-- 项目加入申请表
CREATE TABLE public.biz_project_application (
    id varchar(255) NOT NULL,
    project_id varchar(255) NOT NULL,
    applicant_id varchar(255) NOT NULL,
    applicant_name varchar(255) NOT NULL,
    applicant_avatar varchar(500) NULL,
    applicant_school varchar(255) NULL,
    applicant_major varchar(255) NULL,
    application_reason text NULL,
    skills text NULL,
    status varchar(20) NOT NULL DEFAULT 'PENDING',
    reply_message varchar(500) NULL,
    reply_time timestamp NULL,
    create_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    update_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT biz_project_application_pkey PRIMARY KEY (id),
    CONSTRAINT uk_project_applicant UNIQUE (project_id, applicant_id)
);

-- 创建索引
CREATE INDEX idx_application_project ON public.biz_project_application USING btree (project_id);
CREATE INDEX idx_application_applicant ON public.biz_project_application USING btree (applicant_id);
CREATE INDEX idx_application_status ON public.biz_project_application USING btree (status);

-- 添加注释
COMMENT ON TABLE public.biz_project_application IS '项目加入申请表';
COMMENT ON COLUMN public.biz_project_application.id IS '申请ID（主键）';
COMMENT ON COLUMN public.biz_project_application.project_id IS '项目ID';
COMMENT ON COLUMN public.biz_project_application.applicant_id IS '申请人ID（学生ID）';
COMMENT ON COLUMN public.biz_project_application.applicant_name IS '申请人姓名';
COMMENT ON COLUMN public.biz_project_application.applicant_avatar IS '申请人头像';
COMMENT ON COLUMN public.biz_project_application.applicant_school IS '申请人学校';
COMMENT ON COLUMN public.biz_project_application.applicant_major IS '申请人专业';
COMMENT ON COLUMN public.biz_project_application.application_reason IS '申请理由';
COMMENT ON COLUMN public.biz_project_application.skills IS '个人技能';
COMMENT ON COLUMN public.biz_project_application.status IS '申请状态：PENDING=待审核，APPROVED=已通过，REJECTED=已拒绝，CANCELLED=已取消';
COMMENT ON COLUMN public.biz_project_application.reply_message IS '回复消息';
COMMENT ON COLUMN public.biz_project_application.reply_time IS '回复时间';
COMMENT ON COLUMN public.biz_project_application.create_time IS '创建时间';
COMMENT ON COLUMN public.biz_project_application.update_time IS '更新时间';
