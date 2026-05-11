USE wenjuan;

ALTER TABLE surveys ADD COLUMN time_limit INT DEFAULT NULL COMMENT '答题时长限制（分钟）';
ALTER TABLE surveys ADD COLUMN ip_limit_type TINYINT DEFAULT 0 COMMENT 'IP限制类型：0:无限制 1:白名单 2:黑名单';
ALTER TABLE surveys ADD COLUMN ip_whitelist TEXT COMMENT 'IP白名单，多个用逗号分隔';
ALTER TABLE surveys ADD COLUMN ip_blacklist TEXT COMMENT 'IP黑名单，多个用逗号分隔';
ALTER TABLE surveys ADD COLUMN created_by VARCHAR(64) DEFAULT NULL COMMENT '创建者标识';

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(64),
    avatar VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS survey_collaborators (
    id INT AUTO_INCREMENT PRIMARY KEY,
    survey_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(20) DEFAULT 'editor' COMMENT 'owner:拥有者 editor:编辑者 viewer:查看者',
    permission_level TINYINT DEFAULT 2 COMMENT '1:查看 2:编辑 3:管理',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_survey_id (survey_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail VARCHAR(255),
    category VARCHAR(50) NOT NULL COMMENT 'satisfaction:满意度 survey:报名表 quiz:测验 other:其他',
    template_data TEXT NOT NULL COMMENT '模板数据JSON',
    is_public TINYINT DEFAULT 1 COMMENT '是否公开',
    usage_count INT DEFAULT 0 COMMENT '使用次数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_is_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO templates (title, description, thumbnail, category, template_data, is_public) VALUES
('服务满意度调查问卷', '用于收集客户对产品或服务的满意度反馈，帮助企业改进服务质量', '', 'satisfaction', 
'{\"survey\":{\"title\":\"服务满意度调查问卷\",\"description\":\"感谢您抽出宝贵时间填写此问卷，您的反馈对我们非常重要。\"},\"questions\":[{\"type\":\"rating\",\"title\":\"您对我们的整体服务满意度如何？\",\"description\":\"请为我们的服务打分\",\"required\":true,\"config\":{\"min\":1,\"max\":5}},{\"type\":\"radio\",\"title\":\"您是通过什么渠道了解我们的？\",\"required\":true,\"options\":[{\"label\":\"朋友推荐\",\"value\":\"friend\"},{\"label\":\"网络搜索\",\"value\":\"search\"},{\"label\":\"社交媒体\",\"value\":\"social\"},{\"label\":\"其他\",\"value\":\"other\"}]},{\"type\":\"radio\",\"title\":\"您最满意我们的哪些方面？\",\"required\":true,\"options\":[{\"label\":\"服务态度\",\"value\":\"attitude\"},{\"label\":\"响应速度\",\"value\":\"speed\"},{\"label\":\"专业能力\",\"value\":\"professional\"},{\"label\":\"价格合理\",\"value\":\"price\"}]},{\"type\":\"textarea\",\"title\":\"您有什么建议或意见想告诉我们？\",\"description\":\"请详细描述您的建议\",\"required\":false}]}', 1),
('产品满意度调查', '用于收集用户对产品功能、易用性等方面的评价', '', 'satisfaction', 
'{\"survey\":{\"title\":\"产品满意度调查\",\"description\":\"请帮助我们更好地了解您对产品的看法。\"},\"questions\":[{\"type\":\"rating\",\"title\":\"您对产品整体满意度如何？\",\"required\":true,\"config\":{\"min\":1,\"max\":5}},{\"type\":\"checkbox\",\"title\":\"您最喜欢产品的哪些功能？\",\"required\":true,\"options\":[{\"label\":\"界面设计\",\"value\":\"ui\"},{\"label\":\"功能丰富\",\"value\":\"features\"},{\"label\":\"操作简单\",\"value\":\"easy\"},{\"label\":\"性能稳定\",\"value\":\"performance\"},{\"label\":\"价格优惠\",\"value\":\"price\"}]},{\"type\":\"radio\",\"title\":\"您是否愿意向朋友推荐此产品？\",\"required\":true,\"options\":[{\"label\":\"非常愿意\",\"value\":\"very\"},{\"label\":\"愿意\",\"value\":\"yes\"},{\"label\":\"不太愿意\",\"value\":\"maybe\"},{\"label\":\"不愿意\",\"value\":\"no\"}]},{\"type\":\"text\",\"title\":\"您希望我们增加哪些新功能？\",\"required\":false}]}', 1),
('员工满意度调查', '用于企业内部了解员工的工作满意度和需求', '', 'satisfaction', 
'{\"survey\":{\"title\":\"员工满意度调查\",\"description\":\"此问卷为匿名调查，请您如实填写，帮助我们改进工作环境。\"},\"questions\":[{\"type\":\"rating\",\"title\":\"您对当前工作的整体满意度如何？\",\"required\":true,\"config\":{\"min\":1,\"max\":5}},{\"type\":\"checkbox\",\"title\":\"您对以下哪些方面比较满意？\",\"required\":true,\"options\":[{\"label\":\"薪资福利\",\"value\":\"salary\"},{\"label\":\"工作氛围\",\"value\":\"atmosphere\"},{\"label\":\"团队协作\",\"value\":\"teamwork\"},{\"label\":\"职业发展\",\"value\":\"career\"},{\"label\":\"工作环境\",\"value\":\"environment\"}]},{\"type\":\"radio\",\"title\":\"您认为当前的工作压力如何？\",\"required\":true,\"options\":[{\"label\":\"非常轻松\",\"value\":\"very_low\"},{\"label\":\"适中\",\"value\":\"normal\"},{\"label\":\"有点压力\",\"value\":\"a_bit\"},{\"label\":\"压力很大\",\"value\":\"high\"}]},{\"type\":\"textarea\",\"title\":\"您对公司有什么建议？\",\"required\":false}]}', 1),
('活动报名表', '通用活动报名收集表，包含姓名、联系方式等基本信息', '', 'survey', 
'{\"survey\":{\"title\":\"活动报名表\",\"description\":\"请填写以下信息完成报名，我们期待您的参与！\"},\"questions\":[{\"type\":\"text\",\"title\":\"姓名\",\"required\":true},{\"type\":\"text\",\"title\":\"手机号码\",\"required\":true},{\"type\":\"radio\",\"title\":\"性别\",\"required\":true,\"options\":[{\"label\":\"男\",\"value\":\"male\"},{\"label\":\"女\",\"value\":\"female\"}]},{\"type\":\"date\",\"title\":\"出生年月日\",\"required\":false},{\"type\":\"text\",\"title\":\"所在单位/学校\",\"required\":false},{\"type\":\"text\",\"title\":\"电子邮箱\",\"required\":false},{\"type\":\"textarea\",\"title\":\"备注信息\",\"required\":false}]}', 1),
('招聘会报名表', '用于招聘会或招聘活动的报名登记', '', 'survey', 
'{\"survey\":{\"title\":\"招聘会报名表\",\"description\":\"请填写您的基本信息，我们将与您联系。\"},\"questions\":[{\"type\":\"text\",\"title\":\"姓名\",\"required\":true},{\"type\":\"text\",\"title\":\"联系电话\",\"required\":true},{\"type\":\"text\",\"title\":\"电子邮箱\",\"required\":true},{\"type\":\"select\",\"title\":\"意向岗位\",\"required\":true,\"options\":[{\"label\":\"请选择岗位\",\"value\":\"\"},{\"label\":\"前端开发工程师\",\"value\":\"frontend\"},{\"label\":\"后端开发工程师\",\"value\":\"backend\"},{\"label\":\"产品经理\",\"value\":\"pm\"},{\"label\":\"UI设计师\",\"value\":\"ui\"},{\"label\":\"运营专员\",\"value\":\"operation\"}]},{\"type\":\"text\",\"title\":\"毕业院校\",\"required\":true},{\"type\":\"text\",\"title\":\"专业\",\"required\":true},{\"type\":\"select\",\"title\":\"学历\",\"required\":true,\"options\":[{\"label\":\"请选择\",\"value\":\"\"},{\"label\":\"大专\",\"value\":\"college\"},{\"label\":\"本科\",\"value\":\"bachelor\"},{\"label\":\"硕士\",\"value\":\"master\"},{\"label\":\"博士\",\"value\":\"phd\"}]}]}', 1),
('培训课程报名表', '用于各类培训课程的报名收集', '', 'survey', 
'{\"survey\":{\"title\":\"培训课程报名表\",\"description\":\"请填写报名信息，名额有限，先到先得！\"},\"questions\":[{\"type\":\"text\",\"title\":\"姓名\",\"required\":true},{\"type\":\"text\",\"title\":\"手机号码\",\"required\":true},{\"type\":\"select\",\"title\":\"报名课程\",\"required\":true,\"options\":[{\"label\":\"请选择课程\",\"value\":\"\"},{\"label\":\"Python编程入门\",\"value\":\"python\"},{\"label\":\"数据分析实战\",\"value\":\"data\"},{\"label\":\"UI/UX设计基础\",\"value\":\"ui\"},{\"label\":\"项目管理精讲\",\"value\":\"pm\"},{\"label\":\"英语商务写作\",\"value\":\"english\"}]},{\"type\":\"text\",\"title\":\"公司/组织名称\",\"required\":false},{\"type\":\"text\",\"title\":\"职位\",\"required\":false},{\"type\":\"textarea\",\"title\":\"学习目标/期望\",\"required\":false}]}', 1),
('知识测验（选择题）', '通用知识测验模板，可用于考试、测评等场景', '', 'quiz', 
'{\"survey\":{\"title\":\"知识测验\",\"description\":\"请在规定时间内完成以下题目，每题只有一个正确答案。\"},\"questions\":[{\"type\":\"radio\",\"title\":\"以下哪个不是编程语言？\",\"required\":true,\"options\":[{\"label\":\"Python\",\"value\":\"a\"},{\"label\":\"JavaScript\",\"value\":\"b\"},{\"label\":\"HTML\",\"value\":\"c\"},{\"label\":\"Java\",\"value\":\"d\"}]},{\"type\":\"radio\",\"title\":\"HTTP协议中，哪个状态码表示\"未找到\"？\",\"required\":true,\"options\":[{\"label\":\"200\",\"value\":\"a\"},{\"label\":\"301\",\"value\":\"b\"},{\"label\":\"404\",\"value\":\"c\"},{\"label\":\"500\",\"value\":\"d\"}]},{\"type\":\"radio\",\"title\":\"以下哪种数据结构是\"先进后出\"？\",\"required\":true,\"options\":[{\"label\":\"队列\",\"value\":\"a\"},{\"label\":\"栈\",\"value\":\"b\"},{\"label\":\"链表\",\"value\":\"c\"},{\"label\":\"树\",\"value\":\"d\"}]},{\"type\":\"radio\",\"title\":\"TCP三次握手的目的是什么？\",\"required\":true,\"options\":[{\"label\":\"建立可靠连接\",\"value\":\"a\"},{\"label\":\"数据加密\",\"value\":\"b\"},{\"label\":\"压缩数据\",\"value\":\"c\"},{\"label\":\"验证身份\",\"value\":\"d\"}]},{\"type\":\"textarea\",\"title\":\"您对本次测验的反馈\",\"required\":false}]}', 1),
('员工入职测评', '用于新员工入职时的技能评估', '', 'quiz', 
'{\"survey\":{\"title\":\"员工入职测评\",\"description\":\"请根据实际情况回答以下问题，这将帮助我们更好地了解您。\"},\"questions\":[{\"type\":\"radio\",\"title\":\"您的工作经验年限？\",\"required\":true,\"options\":[{\"label\":\"1年以下\",\"value\":\"0-1\"},{\"label\":\"1-3年\",\"value\":\"1-3\"},{\"label\":\"3-5年\",\"value\":\"3-5\"},{\"label\":\"5年以上\",\"value\":\"5+\"}]},{\"type\":\"checkbox\",\"title\":\"您精通以下哪些技能？\",\"required\":true,\"options\":[{\"label\":\"前端开发\",\"value\":\"frontend\"},{\"label\":\"后端开发\",\"value\":\"backend\"},{\"label\":\"数据库设计\",\"value\":\"database\"},{\"label\":\"UI设计\",\"value\":\"ui\"},{\"label\":\"项目管理\",\"value\":\"pm\"}]},{\"type\":\"rating\",\"title\":\"您对团队协作的重视程度？\",\"required\":true,\"config\":{\"min\":1,\"max\":5}},{\"type\":\"textarea\",\"title\":\"请简述您过往最成功的一个项目经验\",\"required\":true}]}', 1),
('心理健康自评问卷', '简单的心理健康自测问卷', '', 'quiz', 
'{\"survey\":{\"title\":\"心理健康自评问卷\",\"description\":\"请根据最近两周的实际情况，选择最符合您的选项。\"},\"questions\":[{\"type\":\"radio\",\"title\":\"您是否感到情绪低落、沮丧？\",\"required\":true,\"options\":[{\"label\":\"没有\",\"value\":\"0\"},{\"label\":\"偶尔\",\"value\":\"1\"},{\"label\":\"经常\",\"value\":\"2\"},{\"label\":\"总是\",\"value\":\"3\"}]},{\"type\":\"radio\",\"title\":\"您对以前感兴趣的事情是否还有兴趣？\",\"required\":true,\"options\":[{\"label\":\"和以前一样\",\"value\":\"0\"},{\"label\":\"比以前少了\",\"value\":\"1\"},{\"label\":\"很少有兴趣了\",\"value\":\"2\"},{\"label\":\"完全没有兴趣\",\"value\":\"3\"}]},{\"type\":\"radio\",\"title\":\"您的睡眠质量如何？\",\"required\":true,\"options\":[{\"label\":\"很好\",\"value\":\"0\"},{\"label\":\"有时不好\",\"value\":\"1\"},{\"label\":\"经常不好\",\"value\":\"2\"},{\"label\":\"严重失眠\",\"value\":\"3\"}]},{\"type\":\"radio\",\"title\":\"您是否感到疲劳或精力不足？\",\"required\":true,\"options\":[{\"label\":\"没有\",\"value\":\"0\"},{\"label\":\"偶尔\",\"value\":\"1\"},{\"label\":\"经常\",\"value\":\"2\"},{\"label\":\"总是\",\"value\":\"3\"}]}]}', 1),
('联系方式收集', '简单的联系方式收集表', '', 'other', 
'{\"survey\":{\"title\":\"联系方式收集\",\"description\":\"请留下您的联系方式，我们将尽快与您联系。\"},\"questions\":[{\"type\":\"text\",\"title\":\"姓名\",\"required\":true},{\"type\":\"text\",\"title\":\"手机号码\",\"required\":true},{\"type\":\"text\",\"title\":\"电子邮箱\",\"required\":false},{\"type\":\"text\",\"title\":\"公司名称\",\"required\":false},{\"type\":\"select\",\"title\":\"咨询类型\",\"required\":true,\"options\":[{\"label\":\"请选择\",\"value\":\"\"},{\"label\":\"产品咨询\",\"value\":\"product\"},{\"label\":\"技术支持\",\"value\":\"support\"},{\"label\":\"商务合作\",\"value\":\"business\"},{\"label\":\"其他\",\"value\":\"other\"}]},{\"type\":\"textarea\",\"title\":\"留言内容\",\"required\":false}]}', 1),
('投票问卷', '用于收集投票意见', '', 'other', 
'{\"survey\":{\"title\":\"意见投票\",\"description\":\"请投出您宝贵的一票！\"},\"questions\":[{\"type\":\"radio\",\"title\":\"您更倾向于哪个方案？\",\"required\":true,\"options\":[{\"label\":\"方案A - 精简版\",\"value\":\"a\"},{\"label\":\"方案B - 标准版\",\"value\":\"b\"},{\"label\":\"方案C - 完整版\",\"value\":\"c\"},{\"label\":\"方案D - 定制版\",\"value\":\"d\"}]},{\"type\":\"rating\",\"title\":\"您对当前系统的整体评价？\",\"required\":true,\"config\":{\"min\":1,\"max\":5}},{\"type\":\"textarea\",\"title\":\"您还有其他建议吗？\",\"required\":false}]}', 1),
('用户反馈收集', '通用的用户反馈收集表', '', 'other', 
'{\"survey\":{\"title\":\"用户反馈收集\",\"description\":\"感谢您使用我们的服务！您的反馈对我们非常重要。\"},\"questions\":[{\"type\":\"rating\",\"title\":\"总体评分\",\"required\":true,\"config\":{\"min\":1,\"max\":5}},{\"type\":\"select\",\"title\":\"反馈类型\",\"required\":true,\"options\":[{\"label\":\"请选择\",\"value\":\"\"},{\"label\":\"功能建议\",\"value\":\"feature\"},{\"label\":\"Bug反馈\",\"value\":\"bug\"},{\"label\":\"使用咨询\",\"value\":\"question\"},{\"label\":\"其他\",\"value\":\"other\"}]},{\"type\":\"textarea\",\"title\":\"请详细描述您的反馈\",\"required\":true},{\"type\":\"text\",\"title\":\"您的联系方式（选填）\",\"description\":\"方便我们联系您解决问题\",\"required\":false}]}', 1);
