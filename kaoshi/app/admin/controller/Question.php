<?php
namespace app\admin\controller;

use app\BaseController;
use app\common\model\Question;
use app\common\model\Subject;
use app\common\model\Chapter;
use app\common\model\Knowledge;
use think\facade\Session;

class Question extends BaseController
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
        $type = $this->request->param('type', 0);
        $subjectId = $this->request->param('subject_id', 0);
        $difficulty = $this->request->param('difficulty', 0);
        $status = $this->request->param('status', -1);
        $keyword = $this->request->param('keyword', '');
        $page = $this->request->param('page', 1);
        $limit = 15;

        $query = Question::where('id', '>', 0);

        if ($type > 0) {
            $query->where('type', $type);
        }
        if ($subjectId > 0) {
            $query->where('subject_id', $subjectId);
        }
        if ($difficulty > 0) {
            $query->where('difficulty', $difficulty);
        }
        if ($status >= 0) {
            $query->where('status', $status);
        }
        if ($keyword) {
            $query->whereLike('title', "%{$keyword}%");
        }

        $list = $query->order('id desc')->paginate([
            'list_rows' => $limit,
            'page' => $page
        ]);

        $subjects = Subject::where('status', 1)->select();

        return view('', [
            'list' => $list,
            'subjects' => $subjects,
            'type' => $type,
            'subject_id' => $subjectId,
            'difficulty' => $difficulty,
            'status' => $status,
            'keyword' => $keyword,
            'typeList' => (new Question())->typeList,
            'difficultyList' => (new Question())->difficultyList
        ]);
    }

    public function add()
    {
        if ($this->request->isPost()) {
            $data = $this->request->post();

            if (empty($data['title'])) {
                return $this->error('题目标题不能为空');
            }

            $data['options'] = isset($data['options']) ? json_encode($data['options']) : '';
            $data['create_admin_id'] = Session::get('admin_id');
            $data['create_time'] = time();
            $data['update_time'] = time();

            if (Question::create($data)) {
                return $this->success('添加成功');
            }
            return $this->error('添加失败');
        }

        $subjects = Subject::where('status', 1)->select();
        return view('', [
            'subjects' => $subjects,
            'typeList' => (new Question())->typeList,
            'difficultyList' => (new Question())->difficultyList
        ]);
    }

    public function edit()
    {
        $id = $this->request->param('id');
        $question = Question::find($id);

        if (!$question) {
            return $this->error('试题不存在');
        }

        if ($this->request->isPost()) {
            $data = $this->request->post();

            if (empty($data['title'])) {
                return $this->error('题目标题不能为空');
            }

            $data['options'] = isset($data['options']) ? json_encode($data['options']) : '';
            $data['update_time'] = time();

            if ($question->save($data)) {
                return $this->success('修改成功');
            }
            return $this->error('修改失败');
        }

        $subjects = Subject::where('status', 1)->select();
        $question['options'] = json_decode($question['options'], true) ?: [];

        return view('', [
            'info' => $question,
            'subjects' => $subjects,
            'typeList' => (new Question())->typeList,
            'difficultyList' => (new Question())->difficultyList
        ]);
    }

    public function delete()
    {
        $id = $this->request->param('id');
        $question = Question::find($id);

        if (!$question) {
            return $this->error('试题不存在');
        }

        if ($question->delete()) {
            return $this->success('删除成功');
        }
        return $this->error('删除失败');
    }

    public function checkDuplicate()
    {
        $id = $this->request->param('id', 0);
        $title = $this->request->param('title', '');

        $query = Question::where('title', $title);
        if ($id > 0) {
            $query->where('id', '<>', $id);
        }

        $count = $query->count();

        if ($count > 0) {
            return $this->success('发现重复试题', ['has_duplicate' => true, 'count' => $count]);
        }
        return $this->success('未发现重复试题', ['has_duplicate' => false, 'count' => 0]);
    }

    public function audit()
    {
        $id = $this->request->param('id');
        $status = $this->request->param('status', 1);
        $question = Question::find($id);

        if (!$question) {
            return $this->error('试题不存在');
        }

        $question->status = $status;
        $question->update_time = time();

        if ($question->save()) {
            return $this->success('审核成功');
        }
        return $this->error('审核失败');
    }
}
