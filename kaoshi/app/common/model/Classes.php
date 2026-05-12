<?php
namespace app\common\model;

use think\Model;

class Classes extends Model
{
    protected $name = 'classes';
    protected $autoWriteTimestamp = true;

    public function grade()
    {
        return $this->belongsTo(Grade::class, 'grade_id', 'id');
    }
}
