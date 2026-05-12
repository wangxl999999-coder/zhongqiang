<?php
namespace app\controller;

use app\BaseController;

class Index extends BaseController
{
    public function index()
    {
        return '在线考试系统 - 系统运行正常！<br><a href="/login">点击登录</a>';
    }
}
