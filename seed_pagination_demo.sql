SET NAMES utf8mb4;

SET @user_id := (SELECT id FROM users WHERE email = 'test@graduate.local' LIMIT 1);

INSERT INTO civil_service_posts (
  exam_type, year, region, job_name, recruiting_unit, unit_type, job_category, recruit_count,
  education_requirement, degree_requirement, major_requirement, household_requirement,
  political_status_requirement, exam_subjects, registration_start, registration_end,
  source_url, remark, active, created_at, updated_at
)
SELECT '国家公务员考试', 2027, '北京', '分页演示综合管理岗01', '国家税务总局北京市海淀区税务局', '中央机关直属机构', '综合管理', 2,
  '本科及以上', '学士及以上', '计算机科学, 软件工程, 信息管理', '不限', '不限', '行测, 申论',
  '2026-10-15', '2026-10-24', 'https://example.edu/kaogong/pagination/jobs/01', '分页演示数据', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM civil_service_posts WHERE source_url = 'https://example.edu/kaogong/pagination/jobs/01');

INSERT INTO civil_service_posts (exam_type, year, region, job_name, recruiting_unit, unit_type, job_category, recruit_count, education_requirement, degree_requirement, major_requirement, household_requirement, political_status_requirement, exam_subjects, registration_start, registration_end, source_url, remark, active, created_at, updated_at)
SELECT '国家公务员考试', 2027, '北京', '分页演示信息化岗02', '国家发展改革委机关服务中心', '中央机关直属机构', '综合管理', 1, '本科及以上', '学士及以上', '计算机, 数据科学, 电子信息', '不限', '不限', '行测, 申论', '2026-10-15', '2026-10-24', 'https://example.edu/kaogong/pagination/jobs/02', '分页演示数据', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM civil_service_posts WHERE source_url = 'https://example.edu/kaogong/pagination/jobs/02');

INSERT INTO civil_service_posts (exam_type, year, region, job_name, recruiting_unit, unit_type, job_category, recruit_count, education_requirement, degree_requirement, major_requirement, household_requirement, political_status_requirement, exam_subjects, registration_start, registration_end, source_url, remark, active, created_at, updated_at)
SELECT '国家公务员考试', 2027, '北京', '分页演示数据分析岗03', '国家统计局北京调查总队', '中央机关直属机构', '综合管理', 3, '本科及以上', '学士及以上', '计算机科学, 统计学, 数据科学', '不限', '不限', '行测, 申论', '2026-10-15', '2026-10-24', 'https://example.edu/kaogong/pagination/jobs/03', '分页演示数据', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM civil_service_posts WHERE source_url = 'https://example.edu/kaogong/pagination/jobs/03');

INSERT INTO civil_service_posts (exam_type, year, region, job_name, recruiting_unit, unit_type, job_category, recruit_count, education_requirement, degree_requirement, major_requirement, household_requirement, political_status_requirement, exam_subjects, registration_start, registration_end, source_url, remark, active, created_at, updated_at)
SELECT '国家公务员考试', 2027, '北京', '分页演示网络安全岗04', '公安部直属单位', '中央机关直属机构', '专业技术', 2, '本科及以上', '学士及以上', '网络空间安全, 计算机科学', '不限', '不限', '行测, 申论, 专业科目', '2026-10-15', '2026-10-24', 'https://example.edu/kaogong/pagination/jobs/04', '分页演示数据', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM civil_service_posts WHERE source_url = 'https://example.edu/kaogong/pagination/jobs/04');

INSERT INTO civil_service_posts (exam_type, year, region, job_name, recruiting_unit, unit_type, job_category, recruit_count, education_requirement, degree_requirement, major_requirement, household_requirement, political_status_requirement, exam_subjects, registration_start, registration_end, source_url, remark, active, created_at, updated_at)
SELECT '国家公务员考试', 2027, '北京', '分页演示政务系统岗05', '国家市场监督管理总局信息中心', '中央机关直属机构', '综合管理', 1, '本科及以上', '学士及以上', '软件工程, 计算机科学', '不限', '不限', '行测, 申论', '2026-10-15', '2026-10-24', 'https://example.edu/kaogong/pagination/jobs/05', '分页演示数据', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM civil_service_posts WHERE source_url = 'https://example.edu/kaogong/pagination/jobs/05');

INSERT INTO civil_service_posts (exam_type, year, region, job_name, recruiting_unit, unit_type, job_category, recruit_count, education_requirement, degree_requirement, major_requirement, household_requirement, political_status_requirement, exam_subjects, registration_start, registration_end, source_url, remark, active, created_at, updated_at)
SELECT '国家公务员考试', 2027, '北京', '分页演示平台运维岗06', '应急管理部信息研究院', '事业单位', '专业技术', 2, '本科及以上', '学士及以上', '计算机, 信息安全, 软件工程', '不限', '不限', '职业能力倾向测验, 综合应用能力', '2026-10-15', '2026-10-24', 'https://example.edu/kaogong/pagination/jobs/06', '分页演示数据', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM civil_service_posts WHERE source_url = 'https://example.edu/kaogong/pagination/jobs/06');

INSERT INTO civil_service_posts (exam_type, year, region, job_name, recruiting_unit, unit_type, job_category, recruit_count, education_requirement, degree_requirement, major_requirement, household_requirement, political_status_requirement, exam_subjects, registration_start, registration_end, source_url, remark, active, created_at, updated_at)
SELECT '国家公务员考试', 2027, '北京', '分页演示算法治理岗07', '中央网信办直属单位', '中央机关直属机构', '综合管理', 1, '本科及以上', '学士及以上', '计算机科学, 人工智能, 数据科学', '不限', '不限', '行测, 申论', '2026-10-15', '2026-10-24', 'https://example.edu/kaogong/pagination/jobs/07', '分页演示数据', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM civil_service_posts WHERE source_url = 'https://example.edu/kaogong/pagination/jobs/07');

INSERT INTO civil_service_posts (exam_type, year, region, job_name, recruiting_unit, unit_type, job_category, recruit_count, education_requirement, degree_requirement, major_requirement, household_requirement, political_status_requirement, exam_subjects, registration_start, registration_end, source_url, remark, active, created_at, updated_at)
SELECT '国家公务员考试', 2027, '北京', '分页演示信息管理岗08', '财政部北京监管局', '中央机关直属机构', '综合管理', 2, '本科及以上', '学士及以上', '信息管理, 计算机科学, 软件工程', '不限', '不限', '行测, 申论', '2026-10-15', '2026-10-24', 'https://example.edu/kaogong/pagination/jobs/08', '分页演示数据', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM civil_service_posts WHERE source_url = 'https://example.edu/kaogong/pagination/jobs/08');

INSERT INTO civil_service_posts (exam_type, year, region, job_name, recruiting_unit, unit_type, job_category, recruit_count, education_requirement, degree_requirement, major_requirement, household_requirement, political_status_requirement, exam_subjects, registration_start, registration_end, source_url, remark, active, created_at, updated_at)
SELECT '国家公务员考试', 2027, '北京', '分页演示行政执法岗09', '北京市海关', '中央机关直属机构', '行政执法', 3, '本科及以上', '学士及以上', '计算机, 法学, 信息安全', '不限', '不限', '行测, 申论', '2026-10-15', '2026-10-24', 'https://example.edu/kaogong/pagination/jobs/09', '分页演示数据', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM civil_service_posts WHERE source_url = 'https://example.edu/kaogong/pagination/jobs/09');

INSERT INTO civil_service_posts (exam_type, year, region, job_name, recruiting_unit, unit_type, job_category, recruit_count, education_requirement, degree_requirement, major_requirement, household_requirement, political_status_requirement, exam_subjects, registration_start, registration_end, source_url, remark, active, created_at, updated_at)
SELECT '国家公务员考试', 2027, '北京', '分页演示综合文字岗10', '自然资源部直属机关', '中央机关直属机构', '综合管理', 1, '本科及以上', '学士及以上', '计算机科学, 中文, 公共管理', '不限', '不限', '行测, 申论', '2026-10-15', '2026-10-24', 'https://example.edu/kaogong/pagination/jobs/10', '分页演示数据', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM civil_service_posts WHERE source_url = 'https://example.edu/kaogong/pagination/jobs/10');

INSERT INTO interview_score_lines (
  region, year, exam_type, unit_type, job_category, job_name, recruiting_unit, score_line,
  interview_ratio, recruit_count, interview_count, data_note, source, active, created_at, updated_at
)
SELECT region, year, exam_type, unit_type, job_category, job_name, recruiting_unit, score_line,
  interview_ratio, recruit_count, interview_count, data_note, source, 1, NOW(), NOW()
FROM (
  SELECT '北京' region, 2026 year, '国家公务员考试' exam_type, '中央机关直属机构' unit_type, '综合管理' job_category, '分页演示综合管理岗01' job_name, '国家税务总局北京市海淀区税务局' recruiting_unit, 129.50 score_line, '3:1' interview_ratio, 2 recruit_count, 6 interview_count, '分页演示分数线，仅用于查看分页效果。' data_note, '分页演示数据-01' source
  UNION ALL SELECT '北京', 2026, '国家公务员考试', '中央机关直属机构', '综合管理', '分页演示信息化岗02', '国家发展改革委机关服务中心', 133.20, '3:1', 1, 3, '分页演示分数线，仅用于查看分页效果。', '分页演示数据-02'
  UNION ALL SELECT '北京', 2026, '国家公务员考试', '中央机关直属机构', '综合管理', '分页演示数据分析岗03', '国家统计局北京调查总队', 127.80, '3:1', 3, 9, '分页演示分数线，仅用于查看分页效果。', '分页演示数据-03'
  UNION ALL SELECT '北京', 2025, '国家公务员考试', '中央机关直属机构', '专业技术', '分页演示网络安全岗04', '公安部直属单位', 136.40, '3:1', 2, 6, '分页演示分数线，仅用于查看分页效果。', '分页演示数据-04'
  UNION ALL SELECT '北京', 2025, '国家公务员考试', '中央机关直属机构', '综合管理', '分页演示政务系统岗05', '国家市场监督管理总局信息中心', 131.10, '3:1', 1, 3, '分页演示分数线，仅用于查看分页效果。', '分页演示数据-05'
  UNION ALL SELECT '北京', 2025, '事业单位考试', '事业单位', '专业技术', '分页演示平台运维岗06', '应急管理部信息研究院', 75.20, '5:1', 2, 10, '分页演示分数线，仅用于查看分页效果。', '分页演示数据-06'
  UNION ALL SELECT '北京', 2024, '国家公务员考试', '中央机关直属机构', '综合管理', '分页演示算法治理岗07', '中央网信办直属单位', 138.60, '3:1', 1, 3, '分页演示分数线，仅用于查看分页效果。', '分页演示数据-07'
  UNION ALL SELECT '北京', 2024, '国家公务员考试', '中央机关直属机构', '综合管理', '分页演示信息管理岗08', '财政部北京监管局', 126.90, '3:1', 2, 6, '分页演示分数线，仅用于查看分页效果。', '分页演示数据-08'
  UNION ALL SELECT '北京', 2024, '国家公务员考试', '中央机关直属机构', '行政执法', '分页演示行政执法岗09', '北京市海关', 124.30, '3:1', 3, 9, '分页演示分数线，仅用于查看分页效果。', '分页演示数据-09'
  UNION ALL SELECT '北京', 2023, '国家公务员考试', '中央机关直属机构', '综合管理', '分页演示综合文字岗10', '自然资源部直属机关', 122.70, '3:1', 1, 3, '分页演示分数线，仅用于查看分页效果。', '分页演示数据-10'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM interview_score_lines x WHERE x.source = seed.source);

INSERT INTO exam_calendar_events (
  region, exam_type, year, node_type, title, event_date, description, source_url, active, created_at, updated_at
)
SELECT region, exam_type, year, node_type, title, event_date, description, source_url, 1, NOW(), NOW()
FROM (
  SELECT '北京' region, '国家公务员考试' exam_type, 2028 year, '公告发布' node_type, '2028 国家公务员考试北京考区：公告发布' title, '2026-06-05' event_date, '分页演示考试事项。' description, 'https://example.edu/kaogong/pagination/calendar/2028/notice' source_url
  UNION ALL SELECT '北京', '国家公务员考试', 2028, '报名开始', '2028 国家公务员考试北京考区：报名开始', '2026-06-10', '分页演示考试事项。', 'https://example.edu/kaogong/pagination/calendar/2028/register'
  UNION ALL SELECT '北京', '国家公务员考试', 2028, '笔试', '2028 国家公务员考试北京考区：笔试', '2026-07-02', '分页演示考试事项。', 'https://example.edu/kaogong/pagination/calendar/2028/written'
  UNION ALL SELECT '北京', '国家公务员考试', 2029, '公告发布', '2029 国家公务员考试北京考区：公告发布', '2026-07-05', '分页演示考试事项。', 'https://example.edu/kaogong/pagination/calendar/2029/notice'
  UNION ALL SELECT '北京', '国家公务员考试', 2029, '报名开始', '2029 国家公务员考试北京考区：报名开始', '2026-07-10', '分页演示考试事项。', 'https://example.edu/kaogong/pagination/calendar/2029/register'
  UNION ALL SELECT '北京', '国家公务员考试', 2029, '笔试', '2029 国家公务员考试北京考区：笔试', '2026-08-02', '分页演示考试事项。', 'https://example.edu/kaogong/pagination/calendar/2029/written'
  UNION ALL SELECT '北京', '国家公务员考试', 2030, '公告发布', '2030 国家公务员考试北京考区：公告发布', '2026-08-05', '分页演示考试事项。', 'https://example.edu/kaogong/pagination/calendar/2030/notice'
  UNION ALL SELECT '北京', '国家公务员考试', 2030, '报名开始', '2030 国家公务员考试北京考区：报名开始', '2026-08-10', '分页演示考试事项。', 'https://example.edu/kaogong/pagination/calendar/2030/register'
  UNION ALL SELECT '北京', '国家公务员考试', 2030, '笔试', '2030 国家公务员考试北京考区：笔试', '2026-09-02', '分页演示考试事项。', 'https://example.edu/kaogong/pagination/calendar/2030/written'
  UNION ALL SELECT '北京', '国家公务员考试', 2031, '公告发布', '2031 国家公务员考试北京考区：公告发布', '2026-09-05', '分页演示考试事项。', 'https://example.edu/kaogong/pagination/calendar/2031/notice'
  UNION ALL SELECT '北京', '国家公务员考试', 2031, '报名开始', '2031 国家公务员考试北京考区：报名开始', '2026-09-10', '分页演示考试事项。', 'https://example.edu/kaogong/pagination/calendar/2031/register'
  UNION ALL SELECT '北京', '国家公务员考试', 2031, '笔试', '2031 国家公务员考试北京考区：笔试', '2026-10-02', '分页演示考试事项。', 'https://example.edu/kaogong/pagination/calendar/2031/written'
  UNION ALL SELECT '北京', '国家公务员考试', 2032, '公告发布', '2032 国家公务员考试北京考区：公告发布', '2026-10-05', '分页演示考试事项。', 'https://example.edu/kaogong/pagination/calendar/2032/notice'
  UNION ALL SELECT '北京', '国家公务员考试', 2032, '报名开始', '2032 国家公务员考试北京考区：报名开始', '2026-10-10', '分页演示考试事项。', 'https://example.edu/kaogong/pagination/calendar/2032/register'
  UNION ALL SELECT '北京', '国家公务员考试', 2032, '笔试', '2032 国家公务员考试北京考区：笔试', '2026-11-02', '分页演示考试事项。', 'https://example.edu/kaogong/pagination/calendar/2032/written'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM exam_calendar_events x WHERE x.source_url = seed.source_url);

INSERT INTO reminder_subscriptions (
  user_id, region, exam_type, exam_year, event_id, remind_before_days, site_message, email, sms, status, created_at, updated_at
)
SELECT @user_id, region, '国家公务员考试', exam_year, NULL, 3, 1, 0, 0, 'ACTIVE', NOW(), NOW()
FROM (
  SELECT '北京' region, 2028 exam_year
  UNION ALL SELECT '北京', 2029
  UNION ALL SELECT '北京', 2030
  UNION ALL SELECT '北京', 2031
  UNION ALL SELECT '北京', 2032
  UNION ALL SELECT '北京', 2033
) AS seed
WHERE @user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM reminder_subscriptions x
    WHERE x.user_id = @user_id
      AND x.region = seed.region
      AND x.exam_type = '国家公务员考试'
      AND x.exam_year = seed.exam_year
      AND x.event_id IS NULL
  );

INSERT INTO notification_messages (
  user_id, title, content, source_type, source_id, read_flag, created_at
)
SELECT @user_id, title, content, 'pagination_demo', source_id, 0, created_at
FROM (
  SELECT '分页演示提醒 01' title, '2028 国家公务员考试公告发布即将开始，请及时关注。' content, 900001 source_id, NOW() - INTERVAL 1 DAY created_at
  UNION ALL SELECT '分页演示提醒 02', '2028 国家公务员考试报名开始即将到来。', 900002, NOW() - INTERVAL 2 DAY
  UNION ALL SELECT '分页演示提醒 03', '2029 国家公务员考试公告发布即将开始。', 900003, NOW() - INTERVAL 3 DAY
  UNION ALL SELECT '分页演示提醒 04', '2029 国家公务员考试报名节点已进入准备期。', 900004, NOW() - INTERVAL 4 DAY
  UNION ALL SELECT '分页演示提醒 05', '2030 国家公务员考试笔试节点请提前安排复习。', 900005, NOW() - INTERVAL 5 DAY
  UNION ALL SELECT '分页演示提醒 06', '2030 国家公务员考试资格审查材料请准备。', 900006, NOW() - INTERVAL 6 DAY
  UNION ALL SELECT '分页演示提醒 07', '2031 国家公务员考试缴费节点请留意。', 900007, NOW() - INTERVAL 7 DAY
  UNION ALL SELECT '分页演示提醒 08', '2031 国家公务员考试准考证打印即将开放。', 900008, NOW() - INTERVAL 8 DAY
  UNION ALL SELECT '分页演示提醒 09', '2032 国家公务员考试成绩公布节点请关注。', 900009, NOW() - INTERVAL 9 DAY
  UNION ALL SELECT '分页演示提醒 10', '2032 国家公务员考试面试安排请提前准备。', 900010, NOW() - INTERVAL 10 DAY
) AS seed
WHERE @user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM notification_messages x
    WHERE x.user_id = @user_id
      AND x.source_type = 'pagination_demo'
      AND x.source_id = seed.source_id
  );

SELECT
  (SELECT COUNT(*) FROM civil_service_posts WHERE remark = '分页演示数据') AS demo_jobs,
  (SELECT COUNT(*) FROM interview_score_lines WHERE source LIKE '分页演示数据-%') AS demo_score_lines,
  (SELECT COUNT(*) FROM exam_calendar_events WHERE source_url LIKE 'https://example.edu/kaogong/pagination/calendar/%') AS demo_calendar_events,
  (SELECT COUNT(*) FROM reminder_subscriptions WHERE user_id = @user_id AND exam_type = '国家公务员考试' AND event_id IS NULL) AS user_exam_subscriptions,
  (SELECT COUNT(*) FROM notification_messages WHERE user_id = @user_id AND source_type = 'pagination_demo') AS user_demo_notifications;
