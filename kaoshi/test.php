<?php

echo "PHP环境检查...\n";
echo "PHP版本: " . PHP_VERSION . "\n";
echo "PHP版本要求: >= 7.1.0\n";
echo "检查结果: " . (version_compare(PHP_VERSION, '7.1.0', '>=') ? '通过' : '不通过') . "\n\n";

echo "扩展检查...\n";
$extensions = ['pdo', 'mbstring', 'json', 'curl'];
foreach ($extensions as $ext) {
    echo "$ext: " . (extension_loaded($ext) ? '已安装' : '未安装') . "\n";
}

echo "\nPDO MySQL: " . (extension_loaded('pdo_mysql') ? '已安装' : '未安装') . "\n";

echo "\n目录权限检查...\n";
$dirs = ['runtime', 'public/uploads'];
foreach ($dirs as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    echo "$dir: " . (is_writable($dir) ? '可写' : '不可写') . "\n";
}

echo "\n配置文件检查...\n";
$configs = ['app.php', 'database.php', 'cache.php', 'session.php'];
foreach ($configs as $config) {
    $path = __DIR__ . '/config/' . $config;
    echo "config/$config: " . (file_exists($path) ? '存在' : '不存在') . "\n";
}

echo "\n检查完成！\n";
