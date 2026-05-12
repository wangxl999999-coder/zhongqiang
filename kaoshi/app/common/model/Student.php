<?php
namespace app\common\model;

use think\Model;

class Student extends Model
{
    protected $name = 'student';
    protected $autoWriteTimestamp = true;

    public function grade()
    {
        return $this->belongsTo(Grade::class, 'grade_id', 'id');
    }

    public function classes()
    {
        return $this->belongsTo(Classes::class, 'class_id', 'id');
    }
}
