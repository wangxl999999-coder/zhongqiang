<?php
namespace app\admin\controller;

use app\BaseController;
use app\common\model\Paper as PaperModel;
use app\common\model\PaperQuestion;
use app\common\model\PaperRule;
use app\common\model\Question;
use app\common\model\Subject;
use think\facade\Db;
use think\facade\Session;

class Paper extends BaseController
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
        $subjectId = $this->request->param('subject_id', 0);
        $keyword = $this->request->param('keyword', '');
        $page = $this->request->param('page', 1);
        $limit = 15;

        $query = PaperModel::where('id', '>', 0);

        if ($subjectId > 0) {
            $query->where('subject_id', $subjectId);
        }
        if ($keyword) {
            $query->whereLike('name', "%{$keyword}%");
        }

        $list = $query->order('id desc')->paginate([
            'list_rows' => $limit,
            'page' => $page
        ]);

        $subjects = Subject::where('status', 1)->select();

        return view('', [
            'list' => $list,
            'subjects' => $subjects,
            'subject_id' => $subjectId,
            'keyword' => $keyword
        ]);
    }

    public function add()
    {
        if ($this->request->isPost()) {
            $data = $this->request->post();

            if (empty($data['name'])) {
                return $this->error('试卷名称不能为空');
            }

            Db::startTrans();
            try {
                $data['create_admin_id'] = Session::get('admin_id');
                $data['create_time'] = time();
                $data['update_time'] = time();

                $paper = PaperModel::create($data);

                if ($data['type'] == 1 && !empty($data['question_ids'])) {
                    foreach ($data['question_ids'] as $index => $questionId) {
                        $question = Question::find($questionId);
                        PaperQuestion::create([
                            'paper_id' => $paper->id,
                            'question_id' => $questionId,
                            'type' => $question['type'],
                            'score' => $data['scores'][$index] ?? $question['score'],
                            'sort' => $index + 1
                        ]);
                    }
                } elseif ($data['type'] == 2 && !empty($data['rules'])) {
                    foreach ($data['rules'] as $rule) {
                        PaperRule::create([
                            'paper_id' => $paper->id,
                            'type' => $rule['type'],
                            'knowledge_id' => $rule['knowledge_id'] ?? 0,
                            'difficulty' => $rule['difficulty'] ?? 0,
                            'question_count' => $rule['question_count'],
                            'score_per_question' => $rule['score_per_question']
                        ]);
                    }
                }

                Db::commit();
                return $this->success('添加成功');
            } catch (\Exception $e) {
                Db::rollback();
                return $this->error('添加失败：' . $e->getMessage());
            }
        }

        $subjects = Subject::where('status', 1)->select();
        $questions = Question::where('status', 1)->select();
        $knowledges = \app\common\model\Knowledge::where('status', 1)->select();

        return view('', [
            'subjects' => $subjects,
            'questions' => $questions,
            'knowledges' => $knowledges,
            'typeList' => (new Question())->typeList,
            'difficultyList' => (new Question())->difficultyList
        ]);
    }

    public function edit()
    {
        $id = $this->request->param('id');
        $paper = PaperModel::with(['questions', 'rules'])->find($id);

        if (!$paper) {
            return $this->error('试卷不存在');
        }

        if ($this->request->isPost()) {
            $data = $this->request->post();

            if (empty($data['name'])) {
                return $this->error('试卷名称不能为空');
            }

            Db::startTrans();
            try {
                $data['update_time'] = time();
                $paper->save($data);

                PaperQuestion::where('paper_id', $id)->delete();
                PaperRule::where('paper_id', $id)->delete();

                if ($data['type'] == 1 && !empty($data['question_ids'])) {
                    foreach ($data['question_ids'] as $index => $questionId) {
                        $question = Question::find($questionId);
                        PaperQuestion::create([
                            'paper_id' => $id,
                            'question_id' => $questionId,
                            'type' => $question['type'],
                            'score' => $data['scores'][$index] ?? $question['score'],
                            'sort' => $index + 1
                        ]);
                    }
                } elseif ($data['type'] == 2 && !empty($data['rules'])) {
                    foreach ($data['rules'] as $rule) {
                        PaperRule::create([
                            'paper_id' => $id,
                            'type' => $rule['type'],
                            'knowledge_id' => $rule['knowledge_id'] ?? 0,
                            'difficulty' => $rule['difficulty'] ?? 0,
                            'question_count' => $rule['question_count'],
                            'score_per_question' => $rule['score_per_question']
                        ]);
                    }
                }

                Db::commit();
                return $this->success('修改成功');
            } catch (\Exception $e) {
                Db::rollback();
                return $this->error('修改失败：' . $e->getMessage());
            }
        }

        $subjects = Subject::where('status', 1)->select();
        $questions = Question::where('status', 1)->select();
        $knowledges = \app\common\model\Knowledge::where('status', 1)->select();

        return view('', [
            'info' => $paper,
            'subjects' => $subjects,
            'questions' => $questions,
            'knowledges' => $knowledges,
            'typeList' => (new Question())->typeList,
            'difficultyList' => (new Question())->difficultyList
        ]);
    }

    public function delete()
    {
        $id = $this->request->param('id');
        $paper = PaperModel::find($id);

        if (!$paper) {
            return $this->error('试卷不存在');
        }

        Db::startTrans();
        try {
            PaperQuestion::where('paper_id', $id)->delete();
            PaperRule::where('paper_id', $id)->delete();
            $paper->delete();

            Db::commit();
            return $this->success('删除成功');
        } catch (\Exception $e) {
            Db::rollback();
            return $this->error('删除失败');
        }
    }

    public function copy()
    {
        $id = $this->request->param('id');
        $paper = PaperModel::with(['questions', 'rules'])->find($id);

        if (!$paper) {
            return $this->error('试卷不存在');
        }

        Db::startTrans();
        try {
            $newPaper = PaperModel::create([
                'name' => $paper['name'] . '_副本',
                'subject_id' => $paper['subject_id'],
                'type' => $paper['type'],
                'total_score' => $paper['total_score'],
                'pass_score' => $paper['pass_score'],
                'question_count' => $paper['question_count'],
                'duration' => $paper['duration'],
                'description' => $paper['description'],
                'status' => 1,
                'create_admin_id' => Session::get('admin_id'),
                'create_time' => time(),
                'update_time' => time()
            ]);

            foreach ($paper['questions'] as $q) {
                PaperQuestion::create([
                    'paper_id' => $newPaper->id,
                    'question_id' => $q['question_id'],
                    'type' => $q['type'],
                    'score' => $q['score'],
                    'sort' => $q['sort']
                ]);
            }

            foreach ($paper['rules'] as $r) {
                PaperRule::create([
                    'paper_id' => $newPaper->id,
                    'type' => $r['type'],
                    'knowledge_id' => $r['knowledge_id'],
                    'difficulty' => $r['difficulty'],
                    'question_count' => $r['question_count'],
                    'score_per_question' => $r['score_per_question']
                ]);
            }

            Db::commit();
            return $this->success('复制成功');
        } catch (\Exception $e) {
            Db::rollback();
            return $this->error('复制失败');
        }
    }

    public function preview()
    {
        $id = $this->request->param('id');
        $paper = PaperModel::with(['questions.question'])->find($id);

        if (!$paper) {
            return $this->error('试卷不存在');
        }

        return view('', [
            'paper' => $paper,
            'typeList' => (new Question())->typeList
        ]);
    }
}
