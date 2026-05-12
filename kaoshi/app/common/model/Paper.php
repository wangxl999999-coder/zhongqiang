<?php
namespace app\common\model;

use think\Model;

class Paper extends Model
{
    protected $name = 'paper';
    protected $autoWriteTimestamp = true;

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id', 'id');
    }

    public function questions()
    {
        return $this->hasMany(PaperQuestion::class, 'paper_id', 'id');
    }

    public function rules()
    {
        return $this->hasMany(PaperRule::class, 'paper_id', 'id');
    }
}
