<?php
namespace app\common\model;

use think\Model;

class Grade extends Model
{
    protected $name = 'grade';
    protected $autoWriteTimestamp = true;

    public function classes()
    {
        return $this->hasMany(Classes::class, 'grade_id', 'id');
    }
}
