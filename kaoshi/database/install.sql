CREATE DATABASE IF NOT EXISTS `kaoshi` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `kaoshi`;

DROP TABLE IF EXISTS `ks_admin`;
CREATE TABLE `ks_admin` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL DEFAULT '',
  `password` varchar(255) NOT NULL DEFAULT '',
  `nickname` varchar(50) NOT NULL DEFAULT '',
  `avatar` varchar(255) NOT NULL DEFAULT '',
  `email` varchar(100) NOT NULL DEFAULT '',
  `mobile` varchar(20) NOT NULL DEFAULT '',
  `role_id` int(11) NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `last_login_time` int(11) NOT NULL DEFAULT '0',
  `last_login_ip` varchar(50) NOT NULL DEFAULT '',
  `create_time` int(11) NOT NULL DEFAULT '0',
  `update_time` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

INSERT INTO `ks_admin` (`id`, `username`, `password`, `nickname`, `role_id`, `status`, `create_time`) VALUES
(1, 'admin', '21232f297a57a5a743894a0e4a801fc3', '超级管理员', 1, 1, UNIX_TIMESTAMP());

DROP TABLE IF EXISTS `ks_role`;
CREATE TABLE `ks_role` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '',
  `description` varchar(255) NOT NULL DEFAULT '',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `create_time` int(11) NOT NULL DEFAULT '0',
  `update_time` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

INSERT INTO `ks_role` (`id`, `name`, `description`, `status`, `create_time`) VALUES
(1, '超级管理员', '拥有所有权限', 1, UNIX_TIMESTAMP()),
(2, '教师', '教师角色', 1, UNIX_TIMESTAMP()),
(3, '学生', '学生角色', 1, UNIX_TIMESTAMP());

DROP TABLE IF EXISTS `ks_auth_rule`;
CREATE TABLE `ks_auth_rule` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `pid` int(11) NOT NULL DEFAULT '0',
  `name` varchar(100) NOT NULL DEFAULT '',
  `title` varchar(50) NOT NULL DEFAULT '',
  `icon` varchar(50) NOT NULL DEFAULT '',
  `condition` varchar(255) NOT NULL DEFAULT '',
  `remark` varchar(255) NOT NULL DEFAULT '',
  `is_menu` tinyint(1) NOT NULL DEFAULT '1',
  `type` tinyint(1) NOT NULL DEFAULT '1',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `sort` int(11) NOT NULL DEFAULT '0',
  `create_time` int(11) NOT NULL DEFAULT '0',
  `update_time` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `pid` (`pid`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限规则表';

DROP TABLE IF EXISTS `ks_auth_role`;
CREATE TABLE `ks_auth_role` (
  `role_id` int(11) unsigned NOT NULL DEFAULT '0',
  `rule_ids` text NOT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限表';

DROP TABLE IF EXISTS `ks_grade`;
CREATE TABLE `ks_grade` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '',
  `sort` int(11) NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `create_time` int(11) NOT NULL DEFAULT '0',
  `update_time` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='年级表';

DROP TABLE IF EXISTS `ks_classes`;
CREATE TABLE `ks_classes` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `grade_id` int(11) NOT NULL DEFAULT '0',
  `name` varchar(50) NOT NULL DEFAULT '',
  `teacher_id` int(11) NOT NULL DEFAULT '0',
  `student_count` int(11) NOT NULL DEFAULT '0',
  `sort` int(11) NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `create_time` int(11) NOT NULL DEFAULT '0',
  `update_time` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `grade_id` (`grade_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='班级表';

DROP TABLE IF EXISTS `ks_student`;
CREATE TABLE `ks_student` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL DEFAULT '',
  `password` varchar(255) NOT NULL DEFAULT '',
  `name` varchar(50) NOT NULL DEFAULT '',
  `avatar` varchar(255) NOT NULL DEFAULT '',
  `gender` tinyint(1) NOT NULL DEFAULT '0',
  `grade_id` int(11) NOT NULL DEFAULT '0',
  `class_id` int(11) NOT NULL DEFAULT '0',
  `student_no` varchar(50) NOT NULL DEFAULT '',
  `mobile` varchar(20) NOT NULL DEFAULT '',
  `email` varchar(100) NOT NULL DEFAULT '',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `create_time` int(11) NOT NULL DEFAULT '0',
  `update_time` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `grade_id` (`grade_id`),
  KEY `class_id` (`class_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学生表';

DROP TABLE IF EXISTS `ks_teacher`;
CREATE TABLE `ks_teacher` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL DEFAULT '',
  `password` varchar(255) NOT NULL DEFAULT '',
  `name` varchar(50) NOT NULL DEFAULT '',
  `avatar` varchar(255) NOT NULL DEFAULT '',
  `gender` tinyint(1) NOT NULL DEFAULT '0',
  `mobile` varchar(20) NOT NULL DEFAULT '',
  `email` varchar(100) NOT NULL DEFAULT '',
  `subject_id` int(11) NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `create_time` int(11) NOT NULL DEFAULT '0',
  `update_time` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教师表';

DROP TABLE IF EXISTS `ks_subject`;
CREATE TABLE `ks_subject` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '',
  `sort` int(11) NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `create_time` int(11) NOT NULL DEFAULT '0',
  `update_time` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学科表';

DROP TABLE IF EXISTS `ks_chapter`;
CREATE TABLE `ks_chapter` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `subject_id` int(11) NOT NULL DEFAULT '0',
  `pid` int(11) NOT NULL DEFAULT '0',
  `name` varchar(100) NOT NULL DEFAULT '',
  `sort` int(11) NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `create_time` int(11) NOT NULL DEFAULT '0',
  `update_time` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `subject_id` (`subject_id`),
  KEY `pid` (`pid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='章节表';

DROP TABLE IF EXISTS `ks_knowledge`;
CREATE TABLE `ks_knowledge` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `subject_id` int(11) NOT NULL DEFAULT '0',
  `chapter_id` int(11) NOT NULL DEFAULT '0',
  `name` varchar(100) NOT NULL DEFAULT '',
  `sort` int(11) NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `create_time` int(11) NOT NULL DEFAULT '0',
  `update_time` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `subject_id` (`subject_id`),
  KEY `chapter_id` (`chapter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识点表';

DROP TABLE IF EXISTS `ks_question`;
CREATE TABLE `ks_question` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `subject_id` int(11) NOT NULL DEFAULT '0',
  `chapter_id` int(11) NOT NULL DEFAULT '0',
  `knowledge_ids` varchar(255) NOT NULL DEFAULT '',
  `type` tinyint(2) NOT NULL DEFAULT '1' COMMENT '1单选2多选3判断4填空5简答6主观题7图文题',
  `difficulty` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1简单2中等3困难',
  `title` text NOT NULL,
  `content` text NOT NULL,
  `options` text NOT NULL,
  `answer` text NOT NULL,
  `analysis` text NOT NULL,
  `score` decimal(10,2) NOT NULL DEFAULT '0.00',
  `images` text NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0待审核1已通过2已拒绝',
  `is_duplicate` tinyint(1) NOT NULL DEFAULT '0',
  `create_admin_id` int(11) NOT NULL DEFAULT '0',
  `create_time` int(11) NOT NULL DEFAULT '0',
  `update_time` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `subject_id` (`subject_id`),
  KEY `type` (`type`),
  KEY `difficulty` (`difficulty`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='试题表';

DROP TABLE IF EXISTS `ks_question_tag`;
CREATE TABLE `ks_question_tag` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `question_id` int(11) NOT NULL DEFAULT '0',
  `tag_name` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `question_id` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='试题标签表';

DROP TABLE IF EXISTS `ks_paper`;
CREATE TABLE `ks_paper` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL DEFAULT '',
  `subject_id` int(11) NOT NULL DEFAULT '0',
  `type` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1固定试卷2随机试卷',
  `total_score` decimal(10,2) NOT NULL DEFAULT '100.00',
  `pass_score` decimal(10,2) NOT NULL DEFAULT '60.00',
  `question_count` int(11) NOT NULL DEFAULT '0',
  `duration` int(11) NOT NULL DEFAULT '60',
  `description` text NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `create_admin_id` int(11) NOT NULL DEFAULT '0',
  `create_time` int(11) NOT NULL DEFAULT '0',
  `update_time` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `subject_id` (`subject_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='试卷表';

DROP TABLE IF EXISTS `ks_paper_question`;
CREATE TABLE `ks_paper_question` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `paper_id` int(11) NOT NULL DEFAULT '0',
  `question_id` int(11) NOT NULL DEFAULT '0',
  `type` tinyint(2) NOT NULL DEFAULT '1',
  `score` decimal(10,2) NOT NULL DEFAULT '0.00',
  `sort` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `paper_id` (`paper_id`),
  KEY `question_id` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='试卷试题表';

DROP TABLE IF EXISTS `ks_paper_rule`;
CREATE TABLE `ks_paper_rule` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `paper_id` int(11) NOT NULL DEFAULT '0',
  `type` tinyint(2) NOT NULL DEFAULT '1',
  `knowledge_id` int(11) NOT NULL DEFAULT '0',
  `difficulty` tinyint(1) NOT NULL DEFAULT '0',
  `question_count` int(11) NOT NULL DEFAULT '0',
  `score_per_question` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `paper_id` (`paper_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='随机试卷抽题规则表';

DROP TABLE IF EXISTS `ks_exam`;
CREATE TABLE `ks_exam` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL DEFAULT '',
  `paper_id` int(11) NOT NULL DEFAULT '0',
  `start_time` int(11) NOT NULL DEFAULT '0',
  `end_time` int(11) NOT NULL DEFAULT '0',
  `duration` int(11) NOT NULL DEFAULT '60',
  `total_score` decimal(10,2) NOT NULL DEFAULT '100.00',
  `pass_score` decimal(10,2) NOT NULL DEFAULT '60.00',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0未开始1进行中2已结束3已延期',
  `is_publish` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0未发布1已发布',
  `allow_retake` tinyint(1) NOT NULL DEFAULT '0',
  `max_retake_count` int(11) NOT NULL DEFAULT '0',
  `submit_limit` tinyint(1) NOT NULL DEFAULT '0' COMMENT '交卷限制0无1只能交卷一次',
  `anti_cheat` tinyint(1) NOT NULL DEFAULT '0',
  `description` text NOT NULL,
  `create_admin_id` int(11) NOT NULL DEFAULT '0',
  `create_time` int(11) NOT NULL DEFAULT '0',
  `update_time` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `paper_id` (`paper_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='考试表';

DROP TABLE IF EXISTS `ks_exam_user`;
CREATE TABLE `ks_exam_user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `exam_id` int(11) NOT NULL DEFAULT '0',
  `user_type` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1班级2年级3指定学生',
  `target_id` int(11) NOT NULL DEFAULT '0',
  `create_time` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `exam_id` (`exam_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='考试参考人员表';

DROP TABLE IF EXISTS `ks_exam_record`;
CREATE TABLE `ks_exam_record` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `exam_id` int(11) NOT NULL DEFAULT '0',
  `paper_id` int(11) NOT NULL DEFAULT '0',
  `student_id` int(11) NOT NULL DEFAULT '0',
  `start_time` int(11) NOT NULL DEFAULT '0',
  `end_time` int(11) NOT NULL DEFAULT '0',
  `duration` int(11) NOT NULL DEFAULT '0',
  `total_score` decimal(10,2) NOT NULL DEFAULT '0.00',
  `score` decimal(10,2) NOT NULL DEFAULT '0.00',
  `is_pass` tinyint(1) NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0进行中1已交卷2已批改',
  `retake_count` int(11) NOT NULL DEFAULT '0',
  `answers` text NOT NULL,
  `create_time` int(11) NOT NULL DEFAULT '0',
  `update_time` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `exam_id` (`exam_id`),
  KEY `student_id` (`student_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='考试记录表';
