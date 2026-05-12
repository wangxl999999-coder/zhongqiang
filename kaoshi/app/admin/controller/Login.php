<?php
namespace app\admin\controller;

use app\BaseController;
use app\common\model\Admin;
use think\facade\Session;

class Login extends BaseController
{
    public function index()
    {
        if (Session::has('admin_id')) {
            return redirect((string) url('index/index'));
        }
        return view();
    }

    public function login()
    {
        $username = $this->request->param('username');
        $password = $this->request->param('password');

        if (empty($username) || empty($password)) {
            return $this->error('用户名和密码不能为空');
        }

        $admin = Admin::where('username', $username)->find();
        if (!$admin) {
            return $this->error('用户名或密码错误');
        }

        if ($admin['status'] != 1) {
            return $this->error('账号已被禁用');
        }

        if (md5($password) != $admin['password']) {
            return $this->error('用户名或密码错误');
        }

        Session::set('admin_id', $admin['id']);
        Session::set('admin_username', $admin['username']);
        Session::set('admin_nickname', $admin['nickname']);

        $admin->last_login_time = time();
        $admin->last_login_ip = $this->request->ip();
        $admin->save();

        return $this->success('登录成功', ['url' => (string) url('index/index')]);
    }

    public function logout()
    {
        Session::clear();
        return redirect((string) url('login/index'));
    }
}
