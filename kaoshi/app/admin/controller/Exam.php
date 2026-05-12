<?php
namespace app\admin\controller;

use app\BaseController;
use app\common\model\Exam as ExamModel;
use app\common\model\ExamUser;
use app\common\model\Paper;
use app\common\model\Grade;
use app\common\model\Classes;
use app\common\model\Student;
use think\facade\Db;
use think\facade\Session;

class Exam extends BaseController
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
        $status = $this->request->param('status', -1);
        $keyword = $this->request->param('keyword', '');
        $page = $this->request->param('page', 1);
        $limit = 15;

        $query = ExamModel::where('id', '>', 0);

        if ($status >= 0) {
            $query->where('status', $status);
        }
        if ($keyword) {
            $query->whereLike('name', "%{$keyword}%");
        }

        $list = $query->order('id desc')->paginate([
            'list_rows' => $limit,
            'page' => $page
        ]);

        return view('', [
            'list' => $list,
            'status' => $status,
            'keyword' => $keyword
        ]);
    }

    public function add()
    {
        if ($this->request->isPost()) {
            $data = $this->request->post();

            if (empty($data['name'])) {
                return $this->error('考试名称不能为空');
            }
            if (empty($data['paper_id'])) {
                return $this->error('请选择试卷');
            }

            Db::startTrans();
            try {
                $data['start_time'] = !empty($data['start_time']) ? strtotime($data['start_time']) : 0;
                $data['end_time'] = !empty($data['end_time']) ? strtotime($data['end_time']) : 0;
                $data['create_admin_id'] = Session::get('admin_id');
                $data['create_time'] = time();
                $data['update_time'] = time();

                $exam = ExamModel::create($data);

                if (!empty($data['user_type'])) {
                    foreach ($data['user_type'] as $type) {
                        if ($type == 1 && !empty($data['class_ids'])) {
                            foreach ($data['class_ids'] as $classId) {
                                ExamUser::create([
                                    'exam_id' => $exam->id,
                                    'user_type' => 1,
                                    'target_id' => $classId,
                                    'create_time' => time()
                                ]);
                            }
                        } elseif ($type == 2 && !empty($data['grade_ids'])) {
                            foreach ($data['grade_ids'] as $gradeId) {
                                ExamUser::create([
                                    'exam_id' => $exam->id,
                                    'user_type' => 2,
                                    'target_id' => $gradeId,
                                    'create_time' => time()
                                ]);
                            }
                        } elseif ($type == 3 && !empty($data['student_ids'])) {
                            foreach ($data['student_ids'] as $studentId) {
                                ExamUser::create([
                                    'exam_id' => $exam->id,
                                    'user_type' => 3,
                                    'target_id' => $studentId,
                                    'create_time' => time()
                                ]);
                            }
                        }
                    }
                }

                Db::commit();
                return $this->success('添加成功');
            } catch (\Exception $e) {
                Db::rollback();
                return $this->error('添加失败：' . $e->getMessage());
            }
        }

        $papers = Paper::where('status', 1)->select();
        $grades = Grade::where('status', 1)->select();
        $classes = Classes::where('status', 1)->select();
        $students = Student::where('status', 1)->select();

        return view('', [
            'papers' => $papers,
            'grades' => $grades,
            'classes' => $classes,
            'students' => $students
        ]);
    }

    public function edit()
    {
        $id = $this->request->param('id');
        $exam = ExamModel::with(['users'])->find($id);

        if (!$exam) {
            return $this->error('考试不存在');
        }

        if ($this->request->isPost()) {
            $data = $this->request->post();

            if (empty($data['name'])) {
                return $this->error('考试名称不能为空');
            }
            if (empty($data['paper_id'])) {
                return $this->error('请选择试卷');
            }

            Db::startTrans();
            try {
                $data['start_time'] = !empty($data['start_time']) ? strtotime($data['start_time']) : 0;
                $data['end_time'] = !empty($data['end_time']) ? strtotime($data['end_time']) : 0;
                $data['update_time'] = time();

                $exam->save($data);

                ExamUser::where('exam_id', $id)->delete();

                if (!empty($data['user_type'])) {
                    foreach ($data['user_type'] as $type) {
                        if ($type == 1 && !empty($data['class_ids'])) {
                            foreach ($data['class_ids'] as $classId) {
                                ExamUser::create([
                                    'exam_id' => $id,
                                    'user_type' => 1,
                                    'target_id' => $classId,
                                    'create_time' => time()
                                ]);
                            }
                        } elseif ($type == 2 && !empty($data['grade_ids'])) {
                            foreach ($data['grade_ids'] as $gradeId) {
                                ExamUser::create([
                                    'exam_id' => $id,
                                    'user_type' => 2,
                                    'target_id' => $gradeId,
                                    'create_time' => time()
                                ]);
                            }
                        } elseif ($type == 3 && !empty($data['student_ids'])) {
                            foreach ($data['student_ids'] as $studentId) {
                                ExamUser::create([
                                    'exam_id' => $id,
                                    'user_type' => 3,
                                    'target_id' => $studentId,
                                    'create_time' => time()
                                ]);
                            }
                        }
                    }
                }

                Db::commit();
                return $this->success('修改成功');
            } catch (\Exception $e) {
                Db::rollback();
                return $this->error('修改失败：' . $e->getMessage());
            }
        }

        $papers = Paper::where('status', 1)->select();
        $grades = Grade::where('status', 1)->select();
        $classes = Classes::where('status', 1)->select();
        $students = Student::where('status', 1)->select();

        $selectedUserTypes = [];
        $selectedClassIds = [];
        $selectedGradeIds = [];
        $selectedStudentIds = [];

        foreach ($exam['users'] as $user) {
            if (!in_array($user['user_type'], $selectedUserTypes)) {
                $selectedUserTypes[] = $user['user_type'];
            }
            if ($user['user_type'] == 1) {
                $selectedClassIds[] = $user['target_id'];
            } elseif ($user['user_type'] == 2) {
                $selectedGradeIds[] = $user['target_id'];
            } elseif ($user['user_type'] == 3) {
                $selectedStudentIds[] = $user['target_id'];
            }
        }

        return view('', [
            'info' => $exam,
            'papers' => $papers,
            'grades' => $grades,
            'classes' => $classes,
            'students' => $students,
            'selectedUserTypes' => $selectedUserTypes,
            'selectedClassIds' => $selectedClassIds,
            'selectedGradeIds' => $selectedGradeIds,
            'selectedStudentIds' => $selectedStudentIds
        ]);
    }

    public function delete()
    {
        $id = $this->request->param('id');
        $exam = ExamModel::find($id);

        if (!$exam) {
            return $this->error('考试不存在');
        }

        Db::startTrans();
        try {
            ExamUser::where('exam_id', $id)->delete();
            $exam->delete();

            Db::commit();
            return $this->success('删除成功');
        } catch (\Exception $e) {
            Db::rollback();
            return $this->error('删除失败');
        }
    }

    public function publish()
    {
        $id = $this->request->param('id');
        $exam = ExamModel::find($id);

        if (!$exam) {
            return $this->error('考试不存在');
        }

        $exam->is_publish = 1;
        $exam->update_time = time();

        if ($exam->save()) {
            return $this->success('发布成功');
        }
        return $this->error('发布失败');
    }

    public function start()
    {
        $id = $this->request->param('id');
        $exam = ExamModel::find($id);

        if (!$exam) {
            return $this->error('考试不存在');
        }

        $exam->status = 1;
        $exam->is_publish = 1;
        $exam->update_time = time();

        if ($exam->save()) {
            return $this->success('考试已开始');
        }
        return $this->error('操作失败');
    }

    public function delay()
    {
        $id = $this->request->param('id');
        $exam = ExamModel::find($id);

        if (!$exam) {
            return $this->error('考试不存在');
        }

        $exam->status = 3;
        $exam->update_time = time();

        if ($exam->save()) {
            return $this->success('考试已延期');
        }
        return $this->error('操作失败');
    }
}
