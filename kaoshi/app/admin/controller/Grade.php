<?php
namespace app\admin\controller;

use app\BaseController;
use app\common\model\Grade as GradeModel;
use app\common\model\Classes;
use think\facade\Session;

class Grade extends BaseController
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
        $list = GradeModel::order('sort asc, id desc')->select();
        return view('', ['list' => $list]);
    }

    public function addGrade()
    {
        if ($this->request->isPost()) {
            $data = $this->request->post();
            if (empty($data['name'])) {
                return $this->error('年级名称不能为空');
            }
            $data['create_time'] = time();
            $data['update_time'] = time();
            if (GradeModel::create($data)) {
                return $this->success('添加成功');
            }
            return $this->error('添加失败');
        }
        return view();
    }

    public function editGrade()
    {
        $id = $this->request->param('id');
        $grade = GradeModel::find($id);
        if (!$grade) {
            return $this->error('年级不存在');
        }
        if ($this->request->isPost()) {
            $data = $this->request->post();
            if (empty($data['name'])) {
                return $this->error('年级名称不能为空');
            }
            $data['update_time'] = time();
            if ($grade->save($data)) {
                return $this->success('修改成功');
            }
            return $this->error('修改失败');
        }
        return view('', ['info' => $grade]);
    }

    public function deleteGrade()
    {
        $id = $this->request->param('id');
        $grade = GradeModel::find($id);
        if (!$grade) {
            return $this->error('年级不存在');
        }
        if ($grade->delete()) {
            return $this->success('删除成功');
        }
        return $this->error('删除失败');
    }

    public function classList()
    {
        $gradeId = $this->request->param('grade_id', 0);
        $list = Classes::with('grade')->order('id desc')->select();
        $grades = GradeModel::where('status', 1)->select();
        return view('', ['list' => $list, 'grades' => $grades, 'grade_id' => $gradeId]);
    }

    public function addClass()
    {
        if ($this->request->isPost()) {
            $data = $this->request->post();
            if (empty($data['name']) || empty($data['grade_id'])) {
                return $this->error('班级名称和年级不能为空');
            }
            $data['create_time'] = time();
            $data['update_time'] = time();
            if (Classes::create($data)) {
                return $this->success('添加成功');
            }
            return $this->error('添加失败');
        }
        $grades = GradeModel::where('status', 1)->select();
        return view('', ['grades' => $grades]);
    }

    public function editClass()
    {
        $id = $this->request->param('id');
        $class = Classes::find($id);
        if (!$class) {
            return $this->error('班级不存在');
        }
        if ($this->request->isPost()) {
            $data = $this->request->post();
            if (empty($data['name']) || empty($data['grade_id'])) {
                return $this->error('班级名称和年级不能为空');
            }
            $data['update_time'] = time();
            if ($class->save($data)) {
                return $this->success('修改成功');
            }
            return $this->error('修改失败');
        }
        $grades = GradeModel::where('status', 1)->select();
        return view('', ['info' => $class, 'grades' => $grades]);
    }

    public function deleteClass()
    {
        $id = $this->request->param('id');
        $class = Classes::find($id);
        if (!$class) {
            return $this->error('班级不存在');
        }
        if ($class->delete()) {
            return $this->success('删除成功');
        }
        return $this->error('删除失败');
    }
}
