USE wenjuan;

ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL COMMENT '手机号' AFTER username;
ALTER TABLE users ADD COLUMN email VARCHAR(100) DEFAULT NULL COMMENT '邮箱' AFTER phone;
ALTER TABLE users ADD COLUMN wechat_openid VARCHAR(64) DEFAULT NULL COMMENT '微信OpenID' AFTER email;
ALTER TABLE users ADD COLUMN wechat_unionid VARCHAR(64) DEFAULT NULL COMMENT '微信UnionID' AFTER wechat_openid;
ALTER TABLE users ADD COLUMN reset_token VARCHAR(64) DEFAULT NULL COMMENT '重置密码Token' AFTER avatar;
ALTER TABLE users ADD COLUMN reset_token_expire DATETIME DEFAULT NULL COMMENT '重置Token过期时间' AFTER reset_token;
ALTER TABLE users ADD COLUMN last_login_at DATETIME DEFAULT NULL COMMENT '最后登录时间' AFTER reset_token_expire;
ALTER TABLE users ADD COLUMN last_login_ip VARCHAR(45) DEFAULT NULL COMMENT '最后登录IP' AFTER last_login_at;

ALTER TABLE users ADD UNIQUE INDEX idx_phone (phone);
ALTER TABLE users ADD UNIQUE INDEX idx_email (email);
ALTER TABLE users ADD UNIQUE INDEX idx_wechat_openid (wechat_openid);
ALTER TABLE users ADD INDEX idx_reset_token (reset_token);

ALTER TABLE surveys ADD COLUMN user_id INT DEFAULT NULL COMMENT '创建用户ID' AFTER id;
ALTER TABLE surveys ADD INDEX idx_user_id (user_id);
ALTER TABLE surveys ADD CONSTRAINT fk_surveys_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE templates ADD COLUMN user_id INT DEFAULT NULL COMMENT '创建用户ID' AFTER id;
ALTER TABLE templates ADD INDEX idx_templates_user_id (user_id);
ALTER TABLE templates ADD CONSTRAINT fk_templates_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(64) NOT NULL UNIQUE,
    device_info TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_session_token (session_token),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
