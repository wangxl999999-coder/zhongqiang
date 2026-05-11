<?php
return [
    'db' => [
        'host' => '127.0.0.1',
        'port' => 3306,
        'database' => 'wenjuan',
        'username' => 'root',
        'password' => '123123',
        'charset' => 'utf8mb4',
    ],
    'app' => [
        'name' => '问卷系统',
        'url' => 'http://biaozhu.com/wenjuan',
        'upload_dir' => __DIR__ . '/../uploads/',
        'upload_url' => '/uploads/',
        'max_file_size' => 10 * 1024 * 1024,
        'allowed_file_types' => ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
        'avatar_dir' => __DIR__ . '/../uploads/avatars/',
        'avatar_url' => '/uploads/avatars/',
        'allowed_avatar_types' => ['jpg', 'jpeg', 'png', 'gif'],
        'max_avatar_size' => 2 * 1024 * 1024,
    ],
    'session' => [
        'expire_days' => 30,
    ],
    'wechat' => [
        'app_id' => '',
        'app_secret' => '',
    ],
];
