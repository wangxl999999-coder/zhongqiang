<?php
namespace app\common\model;

use think\Model;

class PaperQuestion extends Model
{
    protected $name = 'paper_question';

    public function question()
    {
        return $this->belongsTo(Question::class, 'question_id', 'id');
    }
}
