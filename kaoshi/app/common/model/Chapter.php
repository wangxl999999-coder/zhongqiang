<?php
namespace app\common\model;

use think\Model;

class Chapter extends Model
{
    protected $name = 'chapter';
    protected $autoWriteTimestamp = true;

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id', 'id');
    }
}
