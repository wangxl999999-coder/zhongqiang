<?php

return [
    'default' => 'file',
    'stores' => [
        'file' => [
            'type' => 'File',
            'path' => '',
            'prefix' => '',
            'serialize' => [],
        ],
        'redis' => [
            'type' => 'Redis',
            'host' => '127.0.0.1',
            'port' => 6379,
            'password' => '',
            'select' => 0,
            'timeout' => 0,
            'expire' => null,
            'persistent' => false,
            'prefix' => '',
            'serialize' => [],
        ],
    ],
];
