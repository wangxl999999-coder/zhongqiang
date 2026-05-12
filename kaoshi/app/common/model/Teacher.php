<?php
namespace app\common\model;

use think\Model;

class Teacher extends Model
{
    protected $name = 'teacher';
    protected $autoWriteTimestamp = true;

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id', 'id');
    }
}
