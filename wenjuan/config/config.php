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
        'url' => 'http://biaozhu.com',
        'upload_dir' => __DIR__ . '/../uploads/',
        'upload_url' => '/wenjuan/uploads/',
        'max_file_size' => 10 * 1024 * 1024,
        'allowed_file_types' => ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
    ],
];
