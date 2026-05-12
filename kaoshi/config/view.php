<?php

return [
    'type' => 'Think',
    'view_path' => '',
    'view_suffix' => 'html',
    'view_depr' => DIRECTORY_SEPARATOR,
    'tpl_begin' => '{',
    'tpl_end' => '}',
    'taglib_begin' => '{',
    'taglib_end' => '}',
    'taglib_load' => true,
    'taglib_pre_load' => '',
    'default_filter' => '',
    'tpl_replace_string' => [
        '__STATIC__' => '/static',
        '__JS__' => '/static/js',
        '__CSS__' => '/static/css',
        '__IMG__' => '/static/images',
    ],
];
