<?php

return [
    'default' => 'file',
    'stores' => [
        'file' => [
            'type' => 'file',
            'path' => '',
            'prefix' => '',
            'auto_start' => true,
            'httponly' => true,
            'secure' => false,
        ],
        'redis' => [
            'type' => 'redis',
            'host' => '127.0.0.1',
            'port' => 6379,
            'password' => '',
            'select' => 0,
            'timeout' => 0,
            'expire' => null,
            'persistent' => false,
            'prefix' => '',
            'auto_start' => true,
            'httponly' => true,
            'secure' => false,
        ],
    ],
];
