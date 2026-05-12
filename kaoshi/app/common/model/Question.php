<?php
namespace app\common\model;

use think\Model;

class Question extends Model
{
    protected $name = 'question';
    protected $autoWriteTimestamp = true;

    protected $typeList = [
        1 => '单选题',
        2 => '多选题',
        3 => '判断题',
        4 => '填空题',
        5 => '简答题',
        6 => '主观题',
        7 => '图文题'
    ];

    protected $difficultyList = [
        1 => '简单',
        2 => '中等',
        3 => '困难'
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id', 'id');
    }

    public function chapter()
    {
        return $this->belongsTo(Chapter::class, 'chapter_id', 'id');
    }

    public function getTypeTextAttr($value, $data)
    {
        return $this->typeList[$data['type']] ?? '';
    }

    public function getDifficultyTextAttr($value, $data)
    {
        return $this->difficultyList[$data['difficulty']] ?? '';
    }
}
