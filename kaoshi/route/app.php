<?php

use think\facade\Route;

Route::rule('/', 'admin/login/index');
Route::rule('admin', 'admin/login/index');
Route::rule('admin/:controller/:action', 'admin/:controller/:action');
