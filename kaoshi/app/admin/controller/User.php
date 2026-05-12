<?php
namespace app\admin\controller;

use app\BaseController;
use app\common\model\Admin;
use app\common\model\Student;
use app\common\model\Teacher;
use think\facade\Db;
use think\facade\Session;

class User extends BaseController
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
        $type = $this->request->param('type', 'student');
        $keyword = $this->request->param('keyword', '');
        $page = $this->request->param('page', 1);
        $limit = 15;

        if ($type == 'student') {
            $model = Student::class;
        } elseif ($type == 'teacher') {
            $model = Teacher::class;
        } else {
            $model = Admin::class;
        }

        $query = $model::where('id', '>', 0);
        if ($keyword) {
            $query->whereLike('name|username', "%{$keyword}%");
        }

        $list = $query->order('id desc')->paginate([
            'list_rows' => $limit,
            'page' => $page
        ]);

        return view('', [
            'list' => $list,
            'type' => $type,
            'keyword' => $keyword
        ]);
    }

    public function add()
    {
        if ($this->request->isPost()) {
            $data = $this->request->post();
            $type = $data['type'] ?? 'student';

            if (empty($data['username']) || empty($data['name'])) {
                return $this->error('用户名和姓名不能为空');
            }

            $data['password'] = md5($data['password'] ?? '123456');
            $data['create_time'] = time();
            $data['update_time'] = time();

            if ($type == 'student') {
                $model = Student::class;
            } elseif ($type == 'teacher') {
                $model = Teacher::class;
            } else {
                $model = Admin::class;
            }

            if ($model::where('username', $data['username'])->find()) {
                return $this->error('用户名已存在');
            }

            if ($model::create($data)) {
                return $this->success('添加成功');
            }
            return $this->error('添加失败');
        }
        return view();
    }

    public function edit()
    {
        $id = $this->request->param('id');
        $type = $this->request->param('type', 'student');

        if ($type == 'student') {
            $model = Student::class;
        } elseif ($type == 'teacher') {
            $model = Teacher::class;
        } else {
            $model = Admin::class;
        }

        $info = $model::find($id);
        if (!$info) {
            return $this->error('用户不存在');
        }

        if ($this->request->isPost()) {
            $data = $this->request->post();
            if (empty($data['username']) || empty($data['name'])) {
                return $this->error('用户名和姓名不能为空');
            }
            if (!empty($data['password'])) {
                $data['password'] = md5($data['password']);
            } else {
                unset($data['password']);
            }
            $data['update_time'] = time();
            if ($info->save($data)) {
                return $this->success('修改成功');
            }
            return $this->error('修改失败');
        }

        return view('', [
            'info' => $info,
            'type' => $type
        ]);
    }

    public function delete()
    {
        $id = $this->request->param('id');
        $type = $this->request->param('type', 'student');

        if ($type == 'student') {
            $model = Student::class;
        } elseif ($type == 'teacher') {
            $model = Teacher::class;
        } else {
            $model = Admin::class;
        }

        $info = $model::find($id);
        if (!$info) {
            return $this->error('用户不存在');
        }

        if ($info->delete()) {
            return $this->success('删除成功');
        }
        return $this->error('删除失败');
    }

    public function batchGenerate()
    {
        if ($this->request->isPost()) {
            $type = $this->request->param('type', 'student');
            $prefix = $this->request->param('prefix', 'user');
            $count = $this->request->param('count', 10);
            $startNo = $this->request->param('start_no', 1);

            if ($type == 'student') {
                $model = Student::class;
            } else {
                $model = Teacher::class;
            }

            $successCount = 0;
            $users = [];

            for ($i = 0; $i < $count; $i++) {
                $username = $prefix . ($startNo + $i);
                $name = '用户' . ($startNo + $i);

                if (!$model::where('username', $username)->find()) {
                    $users[] = [
                        'username' => $username,
                        'password' => md5('123456'),
                        'name' => $name,
                        'status' => 1,
                        'create_time' => time(),
                        'update_time' => time()
                    ];
                    $successCount++;
                }
            }

            if (!empty($users)) {
                Db::name($type == 'student' ? 'student' : 'teacher')->insertAll($users);
            }

            return $this->success("成功生成{$successCount}个账号");
        }
        return view();
    }
}
