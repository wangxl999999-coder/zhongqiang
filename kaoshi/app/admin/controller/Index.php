<?php
namespace app\admin\controller;

use app\BaseController;
use think\facade\Session;
use think\facade\View;

class Index extends BaseController
{
    public function initialize()
    {
        parent::initialize();
        if (!Session::has('admin_id')) {
            return redirect((string) url('login/index'))->send();
        }
    }

    public function index()
    {
        View::assign('admin_username', Session::get('admin_username'));
        View::assign('admin_nickname', Session::get('admin_nickname'));
        return view();
    }

    public function welcome()
    {
        return view();
    }
}
