<?php
namespace app\common\model;

use think\Model;

class Exam extends Model
{
    protected $name = 'exam';
    protected $autoWriteTimestamp = true;

    public function paper()
    {
        return $this->belongsTo(Paper::class, 'paper_id', 'id');
    }

    public function users()
    {
        return $this->hasMany(ExamUser::class, 'exam_id', 'id');
    }
}
